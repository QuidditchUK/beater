import { Router } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import pushNotification from '../modules/push';
import settings from '../config';
import getLogger from '../modules/logger';
import passport, { checkAuthenticated, checkScopeAuthorized } from '../modules/passport';
import prisma from '../modules/prisma';
import { parse } from '../modules/utils';
import {
  update,
  create,
  updatePassword,
  checkPassword,
} from '../models/users';
import { authenticateJWT } from '../modules/jwt';
import { validate } from '../modules/validate';
import { schema, resetSchema, updateSchema } from '../modules/validation_schemas/users';
import { email as sendEmail } from '../modules/email';
import { sanitiseEmailMiddleware } from '../modules/sanitise';
import { PUSH_PAYLOADS } from '../constants/notifications';
import { EMT, USERS_READ } from '../constants/scopes';

const log = getLogger('router/auth');

function loginMiddleware(req, res, next) {
  if (!(req.body && req.body.email && req.body.password)
    && (req.headers.Authorization || req.headers.authorization)) {
    const credentials = parse(req.headers.Authorization || req.headers.authorization);

    req.body = {
      email: credentials.email,
      password: credentials.password,
    };
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      log.error('error in passport.authenticate: %s', err.stack);
      return next(err);
    }

    if (!user) {
      log.verbose('user authentication failed, no such user');
      res.status(403).json({ error: info }).end();
      return null;
    }

    const loginUser = {
      uuid: user.uuid,
      email: user.email,
      role: user.type,
      scopes: user.scopes,
    };

    try {
      req.access_token = jwt.sign(loginUser, settings.app.jwt.secret, settings.app.jwt.options);

      return req.logIn(user, (loginError) => {
        if (loginError) {
          log.error('user login failed: %s', loginError.stack);
          return next({ message: 'Login failed' });
        }

        update(user.uuid, {
          last_login: new Date(),
        });

        return next();
      });
    } catch (signError) {
      log.error('error in jwt.sign: %s', signError.stack);
      return next(signError);
    }
  })(req, res, next);
}

export default function authRoute() {
  const router = new Router();

  router.post('/login', sanitiseEmailMiddleware, validate(schema), loginMiddleware, (req, res) => {
    res.json({
      uuid: req.user.uuid,
      access_token: req.access_token,
      token_type: 'Bearer',
    });
  });

  router.get('/me', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    const { hashed_password, salt, ...user } = await prisma.users.findUnique({
      where: { email: req.user.email },
      include: {
        scopes: true,
        transfers: {
          select: {
            prevClub: true,
            newClub: true,
            status: true,
            updated: true,
            uuid: true,
          },
        },
      },
    });

    res.json(user);
  }));

  router.post('/forgot', sanitiseEmailMiddleware, asyncHandler(async (req, res) => {
    try {
      const { hashed_password, uuid, created } = await prisma.users.findUnique({ where: { email: req.body.email } });
      const token = jwt.sign({ uuid, email: req.body.email }, `${hashed_password}-${created.toISOString()}`, { expiresIn: '1d' });

      sendEmail(req.body.email, 'forgotPassword', { reset_url: `${settings.app.baseUrl}/reset?token=${token}&uuid=${uuid}` });

      res.status(200).end();
    } catch (error) {
      // "fail" silently, regardless of if there is a user with that email or not
      // so an attacker can't use this functionality to sniff for user emails
      res.status(200).end();
    }
  }));

  router.post('/reset', validate(resetSchema), asyncHandler(async (req, res, next) => {
    try {
      const { hashed_password, created, email } = await prisma.users.findUnique({ where: { uuid: req.body.uuid } });
      jwt.verify(req.body.token, `${hashed_password}-${created.toISOString()}`);

      await updatePassword(req.body.uuid, req.body.password);

      req.body = {
        email,
        password: req.body.password,
      };

      next();
    } catch (error) {
      res.status(400).json({ error: { message: 'Invalid token' } });
    }
  }), loginMiddleware, (req, res) => {
    res.json({
      uuid: req.user.uuid,
      access_token: req.access_token,
      token_type: 'Bearer',
    });
  });

  router.put('/me', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    const { club_uuid, first_name, last_name } = await prisma.users.findUnique({ where: { uuid: req.user.uuid } });
    await update(req.user.uuid, req.body);

    if (req.body.club_uuid && req.body.club_uuid !== club_uuid) {
      const { email, name } = await prisma.clubs.findUnique({ where: { uuid: req.body.club_uuid } });
      sendEmail(email, 'newMember', {
        email: req.user.email,
        name,
        first_name,
        last_name,
      });
    }

    const { hashed_password, salt, ...user } = await prisma.users.findUnique({ where: { uuid: req.user.uuid } });
    res.json(user);
  }));

  router.put('/national', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    const { first_name, last_name, club_uuid } = await prisma.users.findUnique({ where: { uuid: req.user.uuid } });
    await update(req.user.uuid, req.body);

    let club_name = null;
    if (club_uuid) {
      const club = await prisma.clubs.findUnique({ where: { uuid: club_uuid } });
      club_name = club.name;
    }

    sendEmail(settings.postmark.scoutingEmail, 'nationalTeamInterest', {
      first_name,
      last_name,
      email: req.user.email,
      national_team_interest: req.body.national_team_interest,
      first_team: req.body.first_team,
      second_team: req.body.second_team,
      third_team: req.body.third_team,
      position: req.body.position,
      playstyle: req.body.playstyle,
      years: req.body.years,
      experience: req.body.experience,
      club_name,
    });

    res.status(200).end();
  }));

  router.put('/scouting', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    try {
      const {
        first_name, last_name, first_team, second_team, third_team, position, playstyle, years, experience, club_uuid,
      } = await prisma.users.findUnique({ where: { uuid: req.user.uuid } });

      let club_name = null;
      if (club_uuid) {
        const club = await prisma.clubs.findUnique({ where: { uuid: club_uuid } });
        club_name = club.name;
      }

      // Create scouting request
      // TODO: Once new flow finished enable here

      // const scoutingRequest = await prisma.scouting_requests.create({
      //   data: {
      //     user_uuid: req.user.uuid,
      //     number: req.body.number,
      //     team: req.body.team,
      //     pronouns: req.body.pronouns,
      //     event: req.body.event,
      //   },
      // });

      // Email to head scout, with application and national team profile information.
      sendEmail(settings.postmark.scoutingEmail, 'scoutingApplication', {
        first_name,
        last_name,
        email: req.user.email,
        event: req.body.event,
        number: req.body.number,
        team: req.body.team,
        first_team,
        second_team,
        third_team,
        position,
        playstyle,
        years,
        experience,
        club_name,
        pronouns: req.body.pronouns,
      });

      // Email to user, to confirm application has been received.
      sendEmail(req.user.email, 'scoutingResponse', {
        first_name,
        event: req.body.event,
      });

      // res.json(scoutingRequest);
      res.status(200).end();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.put('/password', authenticateJWT, checkAuthenticated, validate(updateSchema), asyncHandler(async (req, res) => {
    try {
      const check = await checkPassword(req.user.email, req.body.old_password);
      if (check) {
        await updatePassword(req.user.uuid, req.body.password);
        res.status(200).end();
      }

      res.status(400).json({ error: { message: 'Current password is incorrect' } });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.post('/', sanitiseEmailMiddleware, validate(schema), asyncHandler(async (req, res, next) => {
    try {
      await create(req.body);

      sendEmail(req.body.email, 'welcome', { first_name: req.body.first_name });
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }), loginMiddleware, (req, res) => {
    res.json({
      uuid: req.user.uuid,
      access_token: req.access_token,
      token_type: 'Bearer',
    });
  });

  router.get('/notifications', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    try {
      const notifications = await prisma?.notifications?.findMany({
        where: {
          user_uuid: req.user?.uuid,
        },
        include: {
          type: true,
        },
        orderBy: {
          created: 'desc',
        },
      });

      res.json(notifications);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.get('/notifications/unread', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    try {
      const count = await prisma?.notifications?.count({
        where: {
          AND: [
            { user_uuid: req.user?.uuid },
            { read: false },
          ],
        },
      });

      res.json(count);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.put('/notifications/:notification_uuid', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    const { notification_uuid } = req.params;
    try {
      const notification = await prisma?.notifications?.update({
        where: { uuid: notification_uuid },
        data: { ...req.body, read_date: new Date() },
      });

      res.json(notification);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.delete('/notifications/:notification_uuid', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    const { notification_uuid } = req.params;

    await prisma.notifications.delete({ where: { uuid: notification_uuid } });

    res.sendStatus(204);
  }));

  router.get('/push-notifications', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    try {
      const pushNotifications = await prisma?.push_notifications?.findMany({
        where: {
          user_uuid: req.user?.uuid,
        },
      });
      res.json(pushNotifications);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.post('/push-notifications', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    try {
      const pn = await prisma?.push_notifications?.create({
        data: req.body,
      });

      pushNotification({
        endpoint: pn.endpoint,
        keys: { p256dh: pn.p256dh, auth: pn.auth },
      }, PUSH_PAYLOADS.PUSH_NOTIFICATION_ENABLED);

      res.json(pn);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.delete('/push-notifications/:push_uuid', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    const { push_uuid } = req.params;
    await prisma?.push_notifications?.delete({ where: { uuid: push_uuid } });

    res.sendStatus(204);
  }));

  router.get('/search/:term/page/:page', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, USERS_READ]), asyncHandler(async (req, res) => {
    try {
      const { term, page } = req.params ?? { page: 0 };
      const limit = 10;

      // convert any spaces to an OR operator
      const searchTerm = term.trim().split(' ').join(' | ');

      const users = await prisma.users.findMany({
        skip: page * limit,
        take: limit,
        where: {
          OR: [
            {
              email: {
                search: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              first_name: {
                search: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              last_name: {
                search: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          first_name: true,
          last_name: true,
          uuid: true,
          email: true,
          stripe_products: {
            select: {
              products: {
                select: {
                  description: true,
                  expires: true,
                },
              },
            },
          },
          clubs: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          last_name: 'asc',
        },
      });

      const count = await prisma.users.count({
        where: {
          OR: [
            {
              email: {
                search: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              first_name: {
                search: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              last_name: {
                search: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      res.json({ users, pages: Math.ceil(count / limit) });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.get('/all/:page', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, USERS_READ]), asyncHandler(async (req, res) => {
    const { page } = req.params ?? { page: 0 };
    const limit = 10;

    const users = await prisma.users.findMany({
      skip: page * limit,
      take: limit,
      select: {
        first_name: true,
        last_name: true,
        uuid: true,
        email: true,
        stripe_products: {
          select: {
            products: {
              select: {
                description: true,
                expires: true,
              },
            },
          },
        },
        clubs: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        last_name: 'asc',
      },
    });
    const count = await prisma.users.count();

    res.json({ users, pages: Math.ceil(count / limit) });
  }));

  router.get('/:uuid', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, USERS_READ]), asyncHandler(async (req, res) => {
    try {
      const { uuid } = req.params;

      const { hashed_password, salt, ...user } = await prisma.users.findUnique({
        where: { uuid },
      });

      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  return router;
}
