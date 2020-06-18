const pgp = require('pg-promise')();

const db = pgp({
  connectionString: process.env.POSTGRES_URL,
  max: 10,
});

module.exports = db;
