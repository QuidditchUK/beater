import { db } from '../modules/pg';
import { sqlSearchClubs, sqlReadMany } from '../sql';

export const searchClubs = ({ longitude, latitude }, radius) => db.any(sqlSearchClubs, {
  point: `'POINT(${longitude} ${latitude})'`,
  radius,
});

export const getClubBySlug = async (slug) => {
  const club = await db.oneOrNone(`SELECT *, SELECT *, ST_AsGeoJSON(location) AS coordinates FROM clubs WHERE slug = ${slug};`);

  const teams = await db.any(sqlReadMany, {
    columns: '*',
    table: 'teams',
    key: 'club_uuid',
    value: club.uuid,
  });

  return { ...club, teams };
};

export const allClubs = () => db.any('SELECT * FROM CLUBS ORDER BY name ASC;');
