import { Router } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import settings from '../config';
import getLogger from '../modules/logger';
import passport, { checkAuthenticated } from '../modules/passport';
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
      include: { scopes: true, transfers: true },
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
    const {
      first_name, last_name, first_team, second_team, third_team, position, playstyle, years, experience, club_uuid,
    } = await prisma.users.findUnique({ where: { uuid: req.user.uuid } });

    let club_name = null;
    if (club_uuid) {
      const club = await prisma.clubs.findUnique({ where: { uuid: club_uuid } });
      club_name = club.name;
    }

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

    res.status(200).end();
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

  return router;
}
