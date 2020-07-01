import { db } from '../modules/pg';
import { sqlSearchClubs, sqlReadMany } from '../sql';

export const searchClubs = ({ longitude, latitude }, radius, leagues = []) => db.any(sqlSearchClubs, {
  point: `'POINT(${longitude} ${latitude})'`,
  radius,
  leagues,
});

export const getClubBySlug = async (slug) => {
  const club = await db.oneOrNone(`SELECT *, ST_AsGeoJSON(location) AS coordinates FROM clubs WHERE slug = '${slug}';`);

  if (!club) {
    return null;
  }

  const teams = await db.any(sqlReadMany, {
    columns: '*',
    table: 'teams',
    key: 'club_uuid',
    value: club.uuid,
  });

  return { ...club, teams };
};

export const allClubs = (leagues = []) => db.any('SELECT * FROM clubs WHERE league IN ($1:list) ORDER BY name ASC;', [leagues]);
