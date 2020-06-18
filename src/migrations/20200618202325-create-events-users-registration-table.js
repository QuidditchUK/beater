const pgp = require('pg-promise')();

const db = pgp({
  connectionString: process.env.POSTGRES_URL,
  max: 10,
});

exports.up = async (next) => {
  await db.query(`CREATE TABLE IF NOT EXISTS events_users (
    uuid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created timestamptz,
    updated timestamptz,
    event_uuid uuid REFERENCES events(uuid) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    user_uuid uuid REFERENCES users(uuid) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    type varchar(255) DEFAULT 'player' NOT NULL
  )
  `);
  next();
};

exports.down = async (next) => {
  await db.query('DROP TABLE IF EXISTS events_users');
  next();
};
