import crypto from 'crypto';
import { db, pgp } from '../modules/pg';
import { sqlReadOne, sqlUpdateOne } from '../sql';

export const readOne = (key, value) => db.one(sqlReadOne, {
  table: 'users',
  columns: '*',
  key,
  value,
});

export const checkPassword = async (email, password) => {
  try {
    const user = await readOne('email', email);

    return crypto.createHmac('sha1', user.salt).update(password).digest('hex') === user.hashed_password;
  } catch (err) {
    return false;
  }
};

export const update = (uuid, data) => db.none(sqlUpdateOne, {
  table: 'users',
  sets: pgp.helpers.sets(data),
  uuid,
});
