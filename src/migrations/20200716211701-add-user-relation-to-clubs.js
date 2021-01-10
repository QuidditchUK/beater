const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`
    ALTER TABLE users
    ADD club_uuid uuid REFERENCES clubs(uuid) ON DELETE CASCADE ON UPDATE CASCADE;
  `);

  next();
};

exports.down = async (next) => {
  await db.query(`
    ALTER TABLE users
    DROP CONSTRAINT users_club_uuid_fkey,
    DROP column club_uuid;
  `);
  next();
};
