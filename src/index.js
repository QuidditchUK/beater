import express from 'express';
import http from 'http';
import session from 'express-session';
import RedisStore from 'connect-redis';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from './modules/passport';
import getRedisClient from './modules/redis';
import settings from './config';
import getLogger from './modules/logger';
import routes from './routes/index';

const Redis = RedisStore(session);
const log = getLogger('app');

const app = express();

app.use(cors({
  origin: ['http://localhost', 'https://quidditchuk.org', /\.quidditchuk\.org$/],
  methods: 'GET,PUT,POST,PATCH',
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser(settings.app.jwt.secret));
app.use(passport.initialize());
app.use(passport.session());

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

app.use('/', routes);

server.listen(settings.app.port);
log.info('Env is: %s', app.get('env'));
log.info('listen on %s:%s', settings.app.host, settings.app.port);

export default app;
