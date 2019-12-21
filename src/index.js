import express from 'express';
import http from 'http';
import session from 'express-session';
import RedisStore from 'connect-redis';
import getRedisClient from './modules/redis';
import settings from './config';
import getLogger from './modules/logger';

const Redis = RedisStore(session);
const log = getLogger('app');

const app = express();

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

server.listen(settings.app.port);
log.info('Env is: %s', app.get('env'));
log.info('listen on %s:%s', settings.app.host, settings.app.port);

export default app;
