const db = require('../../bin/db');

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
