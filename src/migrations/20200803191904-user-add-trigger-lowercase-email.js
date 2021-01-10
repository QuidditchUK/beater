const db = require('../../bin/db');

exports.up = async (next) => {
  await db.query(`
    CREATE OR REPLACE FUNCTION lowercase_email_on_insert() RETURNS TRIGGER AS $lowercase_email_on_insert$
    BEGIN        
        NEW.email = LOWER(NEW.email);
        RETURN NEW;
    END;
    $lowercase_email_on_insert$ LANGUAGE plpgsql;

    CREATE TRIGGER lowercase_email_on_insert_trigger BEFORE INSERT OR UPDATE ON users
        FOR EACH ROW EXECUTE PROCEDURE lowercase_email_on_insert();
  `);

  next();
};

exports.down = async (next) => {
  await db.query(`
    DROP TRIGGER lowercase_email_on_insert_trigger ON users;
    DROP FUNCTION lowercase_email_on_insert();
  `);
  next();
};
