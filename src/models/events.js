import { db } from '../modules/pg';
import { sqlSearchEvents } from '../sql';

export const searchEvents = ({ longitude, latitude }, radius) => db.any(sqlSearchEvents, {
  point: `'POINT(${longitude} ${latitude})'`,
  radius,
});

export const getEventBySlug = async (slug) => {
  const event = await db.oneOrNone('SELECT *, ST_AsGeoJSON(location) AS coordinates FROM events WHERE slug = $1;', slug);
  if (!event) {
    return {};
  }

  const teams_uuids = await db.any('SELECT teams_uuid FROM events_teams WHERE event_uuid = $1 AND status = \'confirmed\' OR status = \'interested\'', event.uuid);
  const teams = await db.any('SELECT * FROM teams WHERE uuid LIKE ANY($1)', teams_uuids);

  return { ...event, teams };
};

export const allEvents = () => db.any('SELECT * FROM EVENTS ORDER BY name ASC;');
