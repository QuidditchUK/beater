const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`CREATE TABLE IF NOT EXISTS users (
    uuid uuid PRIMARY KEY,
    created timestamptz,
    updated timestamptz,
    email varchar(255) NOT NULL UNIQUE,
    hashed_password varchar,
    salt varchar,
    type varchar DEFAULT 'user' NOT NULL,
    first_name varchar(255) NOT NULL,
    last_name varchar(255) NOT NULL,
    phone varchar(30),
    last_login timestamptz
    ) 
  `);

  next();
};

exports.down = async (next) => {
  await db.query('DROP TABLE IF EXISTS users');
  next();
};
