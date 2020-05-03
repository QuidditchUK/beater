import { db } from '../modules/pg';
import { sqlSearchClubs } from '../sql';

export const searchClubs = ({ longitude, latitude }, radius) => db.any(sqlSearchClubs, {
  point: `'POINT(${longitude} ${latitude})'`,
  radius,
});
