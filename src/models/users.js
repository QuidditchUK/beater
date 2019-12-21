import crypto from 'crypto';
import { db, pgp } from '../modules/pg';
import { sqlReadOne, sqlUpdateOne } from '../sql';


export const getOneEmail = (email) => db.one(sqlReadOne, {
  table: 'users',
  columns: '*',
  key: 'email',
  value: email,
});

export const checkPassword = async (email, password) => {
  try {
    const user = await getOneEmail(email);

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
