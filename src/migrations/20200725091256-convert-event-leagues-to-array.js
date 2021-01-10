const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`
    ALTER TABLE events
    ALTER league type text[] USING array[league];

    UPDATE events
    SET league = '{University,Community}'
    WHERE league = NULL;
  `);

  next();
};

exports.down = async (next) => {
  await db.query(`
    ALTER TABLE events
    ALTER league type varchar(255) using coalesce(league[1], '');
  `);
  next();
};
