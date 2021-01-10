const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`ALTER TABLE users 
    ADD stripe_customer_id varchar(255);
  `);
  next();
};

exports.down = async (next) => {
  await db.query(`ALTER TABLE users
    DROP COLUMN stripe_customer_id;
  `);
  next();
};
