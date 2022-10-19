// import { URL } from 'url';
import Redis from 'ioredis';

import getLogger from './logger';

export default (key = '') => {
  const logger = getLogger(`redis-${key}`);

  const client = new Redis(process.env.REDIS_URL, {
    no_ready_check: true,
    tls: {
      rejectUnauthorized: false,
    },
  });

  client.on('error', (err) => {
    logger.error(err.stack);
  });

  return client;
};
