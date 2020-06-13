const pgp = require('pg-promise')();

const db = pgp({
  connectionString: process.env.POSTGRES_URL,
  max: 10,
});

exports.up = async (next) => {
  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `);

  next();
};
exports.down = async (next) => {
  await db.query('DROP EXTENSION IF EXISTS "uuid-ossp"');
  next();
};
