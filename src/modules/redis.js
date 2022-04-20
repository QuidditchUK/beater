import { URL } from 'url';
import Redis from 'ioredis';

import getLogger from './logger';

const settings = new URL(process.env.REDIS_URL);

const port = settings.port || 6379;
const host = settings.hostname || '127.0.0.1';

export default (key = '') => {
  console.log(settings);
  const logger = getLogger(`redis-${key}`);

  const client = new Redis(port, host, { no_ready_check: true });

  if (settings.username && settings.password) {
    client.auth(settings.username, settings.password);
  }

  client.on('error', (err) => {
    logger.error(err.stack);
  });

  return client;
};
