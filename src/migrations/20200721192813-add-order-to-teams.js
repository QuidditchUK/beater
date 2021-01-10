const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`
    ALTER TABLE teams
    ADD "order" integer;
  `);

  next();
};

exports.down = async (next) => {
  await db.query(`
    ALTER TABLE teams
    DROP column "order";
  `);
  next();
};
