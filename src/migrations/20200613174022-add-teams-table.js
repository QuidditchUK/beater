const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`CREATE TABLE IF NOT EXISTS teams (
    uuid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created timestamptz,
    updated timestamptz,
    name varchar(255) NOT NULL,
    short_name varchar(255),
    current_division integer,
    current_position integer,
    image text,
    club_uuid uuid REFERENCES clubs(uuid) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL
  )
  `);
  next();
};

exports.down = async (next) => {
  await db.query('DROP TABLE IF EXISTS teams');
  next();
};
