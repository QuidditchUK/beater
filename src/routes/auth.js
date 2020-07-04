import { Router } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import settings from '../config';
import getLogger from '../modules/logger';
import passport, { checkAuthenticated } from '../modules/passport';
import { parse } from '../modules/utils';
import { update, readOne, create } from '../models/users';
import { authenticateJWT } from '../modules/jwt';
import { validate } from '../modules/validate';
import { schema } from '../modules/validation_schemas/users';

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

  router.post('/login', validate(schema), loginMiddleware, (req, res) => {
    res.json({
      uuid: req.user.uuid,
      access_token: req.access_token,
      token_type: 'Bearer',
    });
  });

  router.get('/me', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    const user = await readOne('email', req.user.email);

    res.json(user);
  }));

  router.post('/', validate(schema), asyncHandler(async (req, res, next) => {
    try {
      await create(req.body);
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
