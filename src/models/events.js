import { db } from '../modules/pg';
import { sqlSearchEvents } from '../sql';

export const searchEvents = ({ longitude, latitude }, radius, leagues = ['Community', 'University']) => db.any(sqlSearchEvents, {
  point: `'POINT(${longitude} ${latitude})'`,
  radius,
  leagues,
});

export const getEventBySlug = async (slug) => {
  const event = await db.oneOrNone('SELECT *, ST_AsGeoJSON(location) AS coordinates FROM events WHERE slug = $1;', slug);
  if (!event) {
    return null;
  }

  const teams_uuids = await db.any('SELECT teams_uuid FROM events_teams WHERE event_uuid = $1 AND status = \'confirmed\' OR status = \'interested\';', event.uuid);
  const teams = await db.any('SELECT * FROM teams WHERE uuid LIKE ANY($1);', teams_uuids);

  return { ...event, teams };
};

export const allEvents = (leagues = []) => db.any('SELECT * FROM events WHERE league IN ($1:list) ORDER BY name ASC;', [leagues]);
