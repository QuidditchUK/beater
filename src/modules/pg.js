import pgPromise from 'pg-promise';
import settings from '../config';
import getLogger from './logger';

const logger = getLogger('modules/pg');

export const pgp = pgPromise({
  query(e) {
    logger.debug('QUERY: %s', e.query);
  },
});
export const db = pgp(settings.postgres.url);
