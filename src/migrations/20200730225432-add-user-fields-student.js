const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`
    ALTER TABLE users
    ADD is_student boolean NULL,
    ADD university text NULL;
  `);

  next();
};

exports.down = async (next) => {
  await db.query(`
    ALTER TABLE users
    DROP COLUMN is_student,
    DROP COLUMN university;
  `);
  next();
};
