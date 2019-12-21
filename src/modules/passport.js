import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import getLogger from './logger';
import { getOneEmail, checkPassword } from '../models/users';

const log = getLogger('modules/passport');

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false,
  },
  async (email, password, done) => {
    try {
      const user = await getOneEmail(email);

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
  };

  log.debug('passport serializeUser %s', loginUser);
  return done(null, loginUser);
});

passport.deserializeUser((user, done) => {
  log.debug('passport deserializeUser %s', user);
  return done(null, user);
});

export default passport;
