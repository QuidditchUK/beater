const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`CREATE TABLE IF NOT EXISTS events_teams_users (
    uuid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created timestamptz,
    updated timestamptz,
    event_team_uuid uuid REFERENCES events_teams(uuid) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    user_uuid uuid REFERENCES users(uuid) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    paid_fee boolean DEFAULT false NOT NULL
  )
  `);
  next();
};

exports.down = async (next) => {
  await db.query('DROP TABLE IF EXISTS events_teams_users');
  next();
};
