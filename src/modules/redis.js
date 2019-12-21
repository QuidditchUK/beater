import redis from 'redis';
import url from 'url';

import getLogger from './logger';
import config from '../config';

const settings = url.parse(config.redis.url);

const port = settings.port || 6379;
const host = settings.hostname || '127.0.0.1';

export default (key = '') => {
  const logger = getLogger(`redis-${key}`);

  const client = redis.createClient(port, host, { no_ready_check: true });

  if (settings.auth) {
    client.auth(settings.auth);
  }

  client.on('error', (err) => {
    logger.error(err.stack);
  });

  return client;
};
