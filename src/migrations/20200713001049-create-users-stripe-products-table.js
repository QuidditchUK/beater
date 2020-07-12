const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`CREATE TABLE IF NOT EXISTS users_stripe_products (
    uuid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created timestamptz DEFAULT NOW(),
    updated timestamptz DEFAULT NOW(),
    user_uuid uuid NOT NULL,
    stripe_product_id varchar(255) NOT NULL
    );
  `);

  next();
};

exports.down = async (next) => {
  await db.query('DROP TABLE IF EXISTS users_stripe_products');
  next();
};
