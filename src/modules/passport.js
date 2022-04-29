import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import getLogger from './logger';
import prisma from './prisma';
import { checkPassword } from '../models/users';
import { ADMIN } from '../constants/scopes';

const log = getLogger('modules/passport');

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false,
  },
  async (email, password, done) => {
    try {
      const user = await prisma.users.findUnique({ where: { email }, include: { scopes: true } });

      if (!user) {
        return done(null, false, { message: 'Not valid username or password' });
      }

      const check = await checkPassword(email, password);

      if (!check) {
        return done(null, false, { message: 'Not valid username or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  },
));

passport.serializeUser((user, done) => {
  const loginUser = {
    uuid: user.uuid,
    email: user.email,
    role: user.type,
    scopes: user.scopes,
  };

  return done(null, loginUser);
});

passport.deserializeUser((user, done) => done(null, user));

export default passport;

export const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  log.warn('user is not authenticated %s', JSON.stringify({ cookie: req.cookies['connect.sid'], session: req.sessionID }));
  return next({ message: 'USER NOT AUTH' });
};

export const checkScopeAuthorized = (scopes = []) => (req, res, next) => {
  const userScopes = req.user.scopes.map(({ scope }) => scope);
  const isAuthorized = scopes.some((scope) => userScopes.includes(scope)) || userScopes.includes(ADMIN);

  if (isAuthorized) {
    return next();
  }

  log.warn('user is not authorized %s', JSON.stringify({ cookie: req.cookies['connect.sid'], session: req.sessionID }));
  res.status(403).json();
  return next({ message: 'USER NOT AUTH' });
};
