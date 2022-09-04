const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
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
        name: 'Team England',
        type: 'NATIONAL',
      },
      {
        name: 'London Monarchs',
        type: 'MERC',
      },
    ],
  });

  const clubTeam = await prisma.teams.create({
    data: {
      club_uuid: club.uuid,
      name: 'Werewolves of London Seconds',
    },
  });

  const nationalTeam = await prisma.teams.create({
    data: {
      name: 'Team Wales',
      type: 'NATIONAL',
    },
  });

  const salt = `${Math.random()}`;
  const password = 'password';

  const hashed_password = crypto
    .createHmac('sha1', salt)
    .update(password)
    .digest('hex');

  const admin = await prisma.users.create({
    data: {
      email: 'admin@quidditchuk.org',
      first_name: 'Quidditch',
      last_name: 'UK',
      hashed_password,
      salt,
      scopes: {
        create: [{ scope: 'admin' }],
      },
      club_uuid: club?.uuid,
      transfer_window_notifications: true,
    },
  });

  const fakeUsers = Array(50).fill(0).map(() => ({
    email: faker.internet.email(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    hashed_password,
    salt,
    club_uuid: club?.uuid,
  }));

  await prisma?.users?.createMany({ data: fakeUsers });

  const stripeProduct = await prisma.stripe_products.create({
    data: {
      stripe_product_id: 'prod_HdJXJonLozhCzh', // Full Membership, expires in 1000 years
      description: 'Individual Membership (2021/2022 Season)',
      expires: '31-05-3020',
    },
  });

  const allUsers = await prisma?.users?.findMany();

  await prisma.users_stripe_products.createMany({
    data: allUsers.map((user) => ({
      user_uuid: user?.uuid,
      stripe_product_id: stripeProduct?.stripe_product_id,
    })),
  });

  await prisma.teams_users.createMany({
    data: [
      {
        team_uuid: clubTeam?.uuid,
        user_uuid: admin?.uuid,
      },
      {
        team_uuid: nationalTeam?.uuid,
        user_uuid: admin?.uuid,
      },
    ],
  });

  await prisma.scouting_requests.create({
    data: {
      user_uuid: admin?.uuid,
      number: 69,
      team: 'Bangor Broken Broomsticks',
      pronouns: 'He/him',
      event: 'British Quidditch Cup 2022',
    },
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
