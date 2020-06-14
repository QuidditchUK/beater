import { db } from '../modules/pg';
import { sqlSearchClubs, sqlReadOne, sqlReadMany } from '../sql';

export const searchClubs = ({ longitude, latitude }, radius) => db.any(sqlSearchClubs, {
  point: `'POINT(${longitude} ${latitude})'`,
  radius,
});

export const getClubBySlug = async (slug) => {
  const club = await db.oneOrNone(sqlReadOne, {
    columns: '*, ST_AsGeoJSON(location) AS coordinates',
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

export const allClubs = () => db.any('SELECT * FROM CLUBS ORDER BY name ASC;');
