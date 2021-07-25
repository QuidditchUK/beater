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
      type: 'admin',
      first_name: 'Quidditch',
      last_name: 'UK',
      hashed_password,
      salt,
    },
  });

  await prisma.clubs.createMany({
    data: [
      {
        name: 'London Quidditch Club',
        slug: 'london-quidditch-club',
        league: 'Community',
        venue: 'Clapham Common',
        images: ['https://images.prismic.io/chaser/eeb709e4-2aa6-4008-990d-d3d1b386cbfb_QD_FN-208.jpg?auto=compress,format'],
        icon: "''",
      },
      {
        name: 'London Unspeakables Quidditch',
        slug: 'london-unspeakables-quidditch',
        league: 'Community',
        venue: 'Clapham Common',
        images: ['https://images.prismic.io/chaser/eeb709e4-2aa6-4008-990d-d3d1b386cbfb_QD_FN-208.jpg?auto=compress,format'],
        icon: "''",
      },
      {
        name: 'Werewolves of London Quidditch Club',
        slug: 'werewolves-of-london',
        league: 'Community',
        venue: 'Hampstead Heath',
        images: ['https://images.prismic.io/chaser/eeb709e4-2aa6-4008-990d-d3d1b386cbfb_QD_FN-208.jpg?auto=compress,format'],
        icon: "''",
      },
      {
        name: 'St Andrews Snidgets Quidditch Club',
        slug: 'st-andrews-snidgets',
        league: 'University',
        venue: 'St Andrews',
        images: ['https://images.prismic.io/chaser/eeb709e4-2aa6-4008-990d-d3d1b386cbfb_QD_FN-208.jpg?auto=compress,format'],
        icon: "''",
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
