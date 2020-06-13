import { db } from '../modules/pg';
import { sqlSearchClubs, sqlReadOne, sqlReadMany } from '../sql';

export const searchClubs = ({ longitude, latitude }, radius) => db.any(sqlSearchClubs, {
  point: `'POINT(${longitude} ${latitude})'`,
  radius,
});

export const getClubBySlug = async (slug) => {
  const club = await db.oneOrNone(sqlReadOne, {
    columns: '*',
    table: 'clubs',
    key: 'slug',
    value: slug,
  });
  const teams = await db.any(sqlReadMany, {
    columns: '*',
    table: 'teams',
    key: 'club_uuid',
    value: club.uuid,
  });

  return { ...club, teams };
};
