import express from 'express';
import http from 'http';
import settings from './config';
import getLogger from './modules/logger';

const log = getLogger('app');

const app = express();

const server = http.createServer(app);

app.get('/check', (req, res) => {
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
