import { URL } from 'url';
import Redis from 'ioredis';

import getLogger from './logger';
import config from '../config';

const settings = new URL(config.redis.url);

const port = settings.port || 6379;
const host = settings.hostname || '127.0.0.1';

export default (key = '') => {
  const logger = getLogger(`redis-${key}`);

  const client = new Redis(port, host, { no_ready_check: true, auth_pass: 'foobar' });

  if (settings.username && settings.password) {
    client.auth(settings.username, settings.password);
  }

  client.on('error', (err) => {
    logger.error(err.stack);
  });

  return client;
};
