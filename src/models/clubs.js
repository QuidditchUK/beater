import { db } from '../modules/pg';
import { sqlSearchClubs } from '../sql';

export const searchClubs = async ({ longitude, latitude }, radius) => {
  const point = `'POINT(${longitude} ${latitude})'`;

  const test = await db.any('SELECT * from clubs');
  console.log(test);

  const results = await db.any(sqlSearchClubs, {
    point,
    radius,
  });

  console.log(results);

  return results;
};
