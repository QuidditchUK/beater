import crypto from 'crypto';
import { uuid } from 'uuidv4';

export const up = (queryInterface) => {
  const salt = `${Math.random()}`;
  const password = 'password';

  const hashed_password = crypto
    .createHmac('sha1', salt)
    .update(password)
    .digest('hex');


  return queryInterface.bulkInsert('users', [
    {
      uuid: uuid(),
      email: 'admin@quidditchuk.org',
      type: 'admin',
      first_name: 'Quidditch',
      last_name: 'UK',
      hashed_password,
      salt,
    },
  ]);
};

export const down = (queryInterface) => queryInterface.bulkDelete('users', null, { email: 'admin@quidditchuk.org' });
