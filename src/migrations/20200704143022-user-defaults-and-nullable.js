const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`ALTER TABLE users 
    ALTER COLUMN first_name drop NOT NULL,
    ALTER COLUMN last_name drop NOT NULL,
    ALTER COLUMN created SET DEFAULT now(),
    ALTER COLUMN updated SET DEFAULT now(),
    ALTER COLUMN uuid SET DEFAULT uuid_generate_v4();
  `);
  next();
};

exports.down = async (next) => {
  await db.query(`ALTER TABLE users
    ALTER COLUMN first_name set NOT NULL,
    ALTER COLUMN last_name set NOT NULL,
    ALTER COLUMN created drop DEFAULT,
    ALTER COLUMN updated drop DEFAULT,
    ALTER COLUMN uuid drop DEFAULT;
  `);
  next();
};
