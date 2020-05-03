import pgPromise from 'pg-promise';
import settings from '../config';
import getLogger from './logger';

const logger = getLogger('modules/pg');

export const pgp = pgPromise({
  query(e) {
    logger.debug('QUERY: %s', e.query);
  },
});

const cn = {
  host: settings.postgres.host,
  port: settings.postgres.port,
  database: settings.postgres.database,
  user: settings.postgres.user,
  password: settings.postgres.password,
  max: 30,
};

export const db = pgp(cn);
