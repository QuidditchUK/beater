import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import asyncHandler from 'express-async-handler';
import prisma from './prisma';
import { checkPassword } from '../models/users';
import { ADMIN } from '../constants/scopes';

export const isScopeAuthorized = (scopes = []) => (req) => {
  const userScopes = req.user.scopes.map(({ scope }) => scope);
  return Boolean(scopes.some((scope) => userScopes.includes(scope)) || userScopes.includes(ADMIN));
};

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

  return next({ message: 'USER NOT AUTH' });
};

export const checkScopeAuthorized = (scopes = []) => (req, res, next) => {
  const isAuthorized = isScopeAuthorized(scopes)(req);

  if (isAuthorized) {
    return next();
  }

  res.status(403).json();
  return next({ message: 'USER NOT AUTH' });
};

// Check if the person has the required scopes OR is the owner and has permissions
export const checkScopeAuthorizedOrOwner = (scopes = [], ownerFn = () => false) => asyncHandler(async (req, res, next) => {
  const isAuthorized = isScopeAuthorized(scopes)(req);

  if (isAuthorized) {
    return next();
  }

  const isOwner = await ownerFn(req);

  if (isOwner) {
    return next();
  }

  res.status(403).json();
  return next({ message: 'USER NOT AUTH' });
});
