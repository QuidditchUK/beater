import { Router } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import settings from '../config';
import getLogger from '../modules/logger';
import passport, { checkAuthenticated, checkAdmin } from '../modules/passport';
import { parse } from '../modules/utils';
import {
  update,
  readOne,
  create,
  updatePassword,
  checkPassword,
} from '../models/users';
import { getClub } from '../models/clubs';
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
    const { hashed_password, salt, ...user } = await readOne('email', req.user.email);

    res.json(user);
  }));

  router.post('/forgot', sanitiseEmailMiddleware, asyncHandler(async (req, res) => {
    try {
      const { hashed_password, uuid, created } = await readOne('email', req.body.email);
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
      const { hashed_password, created, email } = await readOne('uuid', req.body.uuid);
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
    const { club_uuid, first_name, last_name } = await readOne('uuid', req.user.uuid);
    await update(req.user.uuid, req.body);

    if (req.body.club_uuid && req.body.club_uuid !== club_uuid) {
      const { email, name } = await getClub(req.body.club_uuid);
      sendEmail(email, 'newMember', {
        email: req.user.email,
        name,
        first_name,
        last_name,
      });
    }

    const { hashed_password, salt, ...user } = await readOne('uuid', req.user.uuid);
    res.json(user);
  }));

  router.put('/password', sanitiseEmailMiddleware, authenticateJWT, checkAuthenticated, validate(updateSchema), asyncHandler(async (req, res) => {
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

  router.get('/admin', authenticateJWT, checkAdmin, (_, res) => {
    res.json({ isAdmin: true });
  });

  return router;
}
