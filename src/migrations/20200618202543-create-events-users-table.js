const pgp = require('pg-promise')();

const db = pgp({
  connectionString: process.env.POSTGRES_URL,
  max: 10,
});

exports.up = async (next) => {
  await db.query(`CREATE TABLE IF NOT EXISTS events_users_registration (
    uuid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created timestamptz,
    updated timestamptz,
    event_user_uuid uuid REFERENCES events_users(uuid) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,

    gender text,
    public_name text,
    medical_conditions text,
    next_of_kin varchar(255),
    next_of_kin_contact_info varchar(255),
    misconduct_policy boolean DEFAULT false,
    data_processing_permissions boolean DEFAULT false,
    media_permissions boolean DEFAULT false,
    medical_waiver boolean DEFAULT false,
    reimbursment_claims boolean DEFAULT false,
    payment_details text,
    volunteer_availability varchar(255),
    daily_volunteer_hours integer,
    volunteering_roles varchar(255)[],
    first_aid_qualification varchar(255),
    conflicts_of_interest varchar(255)[],
    note_to_quk text
  )
  `);
  next();
};

exports.down = async (next) => {
  await db.query('DROP TABLE IF EXISTS events_users');
  next();
};
