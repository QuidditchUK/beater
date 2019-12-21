import { Router } from 'express';
import jwt from 'jsonwebtoken';
import settings from '../config';
import getLogger from '../modules/logger';
import passport from '../modules/passport';
import { parse } from '../modules/utils';
import { update } from '../models/users';

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

  passport.authenticate('local', { session: false }, (err, user) => {
    if (err) {
      log.error('error in passport.authenticate: %s', err.stack);
      return next(err);
    }

    if (!user) {
      log.verbose('user authentication failed, no such user');
      return next({ message: 'User not found' });
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

  router.post('/login/', loginMiddleware, (req, res) => {
    res.json({
      uuid: req.user.uuid,
      access_token: req.access_token,
      token_type: 'Bearer',
    });
  });

  return router;
}
