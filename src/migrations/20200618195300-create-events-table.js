const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`CREATE TABLE IF NOT EXISTS events (
    uuid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created timestamptz,
    updated timestamptz,
    name varchar(255),
    slug varchar UNIQUE,
    league varchar(255),
    location geometry(POINT,4326),
    venue varchar NOT NULL,
    icon varchar(255) NOT NULL,
    images text[],
    description text,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    register_link varchar(255),
    register_time timestamptz,
    reimbursment_time timestamptz,

    membership_required boolean DEFAULT true,
    registration_required boolean DEFAULT true,
    volunteer_roles text[],
    team_fee integer NOT NULL,
    player_fee integer NOT NULL
  )
  `);
  next();
};

exports.down = async (next) => {
  await db.query('DROP TABLE IF EXISTS events');
  next();
};
