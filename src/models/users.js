import crypto from 'crypto';
import prisma from '../modules/prisma';

export const checkPassword = async (email, password) => {
  try {
    const user = await prisma.users.findUnique({ where: { email } });

    return crypto.createHmac('sha1', user.salt).update(password).digest('hex') === user.hashed_password;
  } catch (err) {
    return false;
  }
};

export const update = async (uuid, data) => {
  await prisma.users.update({
    where: { uuid },
    data,
  });
};

export const updatePassword = async (uuid, password) => {
  const salt = `${Math.random()}`;
  const hashed_password = crypto.createHmac('sha1', salt)
    .update(password)
    .digest('hex');

  const data = { hashed_password, salt };

  await update(uuid, data);
};

export const create = async ({ password, email, ...rest }) => {
  const user = await prisma.users.findUnique({ where: { email } });

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

  await prisma.users.create({ data });
};
