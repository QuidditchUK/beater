const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`
    ALTER TABLE clubs
    ADD email varchar(255);
  `);

  next();
};

exports.down = async (next) => {
  await db.query(`
    ALTER TABLE clubs
    DROP column email;
  `);
  next();
};
