import pgPromise from 'pg-promise';
import getLogger from './logger';

const logger = getLogger('modules/pg');

export const pgp = pgPromise({
  query(e) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('QUERY: %s', e.query);
    }
  },
});

const cn = {
  connectionString: process.env.POSTGRES_URL,
  max: 30,
};

export const db = pgp(cn);
