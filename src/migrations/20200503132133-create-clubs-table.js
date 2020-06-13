const pgp = require('pg-promise')();

const db = pgp({
  connectionString: process.env.POSTGRES_URL,
  max: 10,
});

exports.up = async (next) => {
  await db.query(`CREATE TABLE IF NOT EXISTS clubs (
    uuid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created timestamptz,
    updated timestamptz,
    name varchar(255),
    slug varchar UNIQUE,
    league varchar(255),
    location geometry(POINT,4326),
    venue varchar NOT NULL,
    featured_color varchar(30),
    text_color varchar(30),
    icon varchar(255) NOT NULL,
    trainings varchar(255),
    leader varchar(255),
    leader_position varchar(255),
    official_website varchar(255),
    status varchar NOT NULL DEFAULT 'active',
    social_facebook varchar(255),
    social_twitter varchar(255),
    social_youtube varchar(255),
    social_instagram varchar(255),
    tags text[],
    images text[],
    description text
  )
  `);
  next();
};

exports.down = async (next) => {
  await db.query('DROP TABLE IF EXISTS clubs');
  next();
};
