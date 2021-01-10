import crypto from 'crypto';
import { db, pgp } from '../modules/pg';
import { sqlReadOne, sqlUpdateOne } from '../sql';

export const readOne = (key, value) => db.oneOrNone(sqlReadOne, {
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

export const updatePassword = (uuid, password) => {
  const salt = `${Math.random()}`;
  const hashed_password = crypto.createHmac('sha1', salt)
    .update(password)
    .digest('hex');

  const data = { hashed_password, salt };

  return db.none(sqlUpdateOne, {
    table: 'users',
    sets: pgp.helpers.sets(data),
    uuid,
  });
};

export const create = async ({ password, email, ...rest }) => {
  const user = await readOne('email', email);

  if (user) {
    throw new Error('User with email address already exists');
  }

  const salt = `${Math.random()}`;
  const hashed_password = crypto.createHmac('sha1', salt)
    .update(password)
    .digest('hex');

  const data = {
    salt,
    hashed_password,
    type: 'user',
    email,
    ...rest,
  };

  return db.none(pgp.helpers.insert(data, null, 'users'));
};
