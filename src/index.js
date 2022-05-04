import express from 'express';
import http from 'http';
import session from 'express-session';
import RedisStore from 'connect-redis';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import register from '@react-ssr/express/register';
import passport from './modules/passport';
import getRedisClient from './modules/redis';
import settings from './config';
import getLogger from './modules/logger';
import routes from './routes';

const unless = (middleware, ...paths) => (req, res, next) => {
  const pathCheck = paths.some((p) => {
    const regexAs = new RegExp(p.replace(/\//g, '\\/'), 'g');
    const foundPath = paths?.find((item) => item === req.path);

    return regexAs.test(req.path) || foundPath;
  });

  return pathCheck ? next() : middleware(req, res, next);
};

const Redis = RedisStore(session);
const log = getLogger('app');

const app = express();

const allowList = process.env.NODE_ENV === 'production'
  ? ['https://quidditchuk.org', 'https://www.quidditchuk.org', 'https://chaser.quidditchuk.org', 'https://quidditchscheduler-staging.eu.auth0.com']
  : ['http://localhost:3000'];

app.use(unless(cors({
  origin(origin, callback) {
    if (allowList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: 'GET,PUT,POST,PATCH,DELETE',
  credentials: true,
}), '/oidc', '/interaction'));

app.use(unless(bodyParser.json(), '/oidc'));
app.use(unless(bodyParser.urlencoded({ extended: false }), '/oidc'));

app.use(cookieParser(settings.app.jwt.secret));
app.use(passport.initialize());
app.use(passport.session());

app.set('trust proxy', true);
register(app);

const server = http.createServer(app);

app.use(
  session({
    secret: settings.session.secretKey,
    store: new Redis({
      client: getRedisClient('session'),
    }),
    cookie: {
      maxAge: settings.session.session_max_age * 1000 * 60 * 60 * 24,
    },
    resave: false,
    saveUninitialized: false,
  }),
);

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    sessionID: req.sessionID,
    env: process.env.NODE_ENV,
  });
});

app.use(express.static('public'));
app.use('/', routes);

server.listen(settings.app.port);
log.info('Env is: %s', app.get('env'));
log.info('listen on %s:%s', settings.app.host, settings.app.port);

export default app;
