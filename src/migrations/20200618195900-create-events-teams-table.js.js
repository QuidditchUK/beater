const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`CREATE TABLE IF NOT EXISTS events_teams (
    uuid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created timestamptz,
    updated timestamptz,
    event_uuid uuid REFERENCES events(uuid) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    team_uuid uuid REFERENCES teams(uuid) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    status varchar(255) NOT NULL DEFAULT 'pending',
    paid_fee boolean NOT NULL DEFAULT false
  )
  `);
  next();
};

exports.down = async (next) => {
  await db.query('DROP TABLE IF EXISTS events_teams');
  next();
};
