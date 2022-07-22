const { PrismaClient } = require('@prisma/client');
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

  await prisma.notification_types.createMany({
    data: [
      { type: 'TRANSFERS_OPEN', description: 'The transfer window has opened' },
      { type: 'TRANSFERS_CLOSED', description: 'The transfer window has closed' },
      { type: 'TRANSFER_APPROVED', description: 'Your transfer has been approved' },
      { type: 'TRANSFER_DECLINED', description: 'Your transfer has been declined' },
      { type: 'SCOUTING_WINDOW_OPEN', description: 'Scouting requests are now open' },
      { type: 'SCOUTING_WINDOW_CLOSING_24', description: 'Scouting requests are closing in 24 hours' },
      { type: 'SCOUTING_WINDOW_CLOSED', description: 'Scouting requests are now closed' },
      { type: 'EVENT_REGISTRATION_OPEN', description: 'Event registration is now open' },
      { type: 'EVENT_REGISTRATION_CLOSING_24', description: 'Event registration is closing in 24 hours' },
      { type: 'EVENT_REGISTRATION_CLOSED', description: 'Event registration is now closed' },
    ],
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

  const user = await prisma.users.create({
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

  await prisma.teams_users.createMany({
    data: [
      {
        team_uuid: clubTeam?.uuid,
        user_uuid: user?.uuid,
      },
      {
        team_uuid: nationalTeam?.uuid,
        user_uuid: user?.uuid,
      },
    ],
  });

  await prisma.scouting_requests.create({
    data: {
      user_uuid: user?.uuid,
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
