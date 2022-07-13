const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const salt = `${Math.random()}`;
  const password = 'password';

  const hashed_password = crypto
    .createHmac('sha1', salt)
    .update(password)
    .digest('hex');

  await prisma.users.create({
    data: {
      email: 'admin@quidditchuk.org',
      first_name: 'Quidditch',
      last_name: 'UK',
      hashed_password,
      salt,
      scopes: {
        create: [{ scope: 'admin' }],
      },
    },
  });

  await prisma.clubs.createMany({
    data: [
      {
        name: 'London Quidditch Club',
        slug: 'london-quidditch-club',
        league: 'Community',
        active: true,
      },
      {
        name: 'London Unspeakables Quidditch',
        slug: 'london-unspeakables-quidditch',
        league: 'Community',
        active: true,
      },
      {
        name: 'St Andrews Snidgets Quidditch Club',
        slug: 'st-andrews-snidgets',
        league: 'University',
        active: false,
      },
    ],
  });

  const club = await prisma.clubs.create({
    data: {
      name: 'Werewolves of London Quidditch Club',
      slug: 'werewolves-of-london',
      league: 'Community',
      active: true,
    },
  });

  await prisma.system_settings.create({
    data: {
      transfer_window: false,
    },
  });

  await prisma.teams.createMany({
    data: [
      {
        club_uuid: club.uuid,
        name: 'Werewolves of London Firsts',
      },
      {
        club_uuid: club.uuid,
        name: 'Werewolves of London Seconds',
      },
      {
        name: 'Team England',
        type: 'NATIONAL',
      },
      {
        name: 'London Monarchs',
        type: 'MERC',
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
