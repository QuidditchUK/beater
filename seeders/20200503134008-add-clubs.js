import { uuid } from 'uuidv4';

export const up = (queryInterface) => queryInterface.bulkInsert('clubs', [
  {
    uuid: uuid(),
    name: 'London Quidditch Club',
    slug: 'london-quidditch-club',
    type: 'Community',
    location: { type: 'POINT', coordinates: ['-0.150805', '51.460149'] },
  },
  {
    uuid: uuid(),
    name: 'London Unspeakables Quidditch',
    slug: 'london-unspeakables-quidditch',
    type: 'Community',
    location: { type: 'POINT', coordinates: ['-0.148176', '51.453825'] },
  },
  {
    uuid: uuid(),
    name: 'Werewolves of London Quidditch Club',
    slug: 'werewolves-of-london',
    type: 'Community',
    location: { type: 'POINT', coordinates: ['-0.157671', '51.558175'] },
  },
  {
    uuid: uuid(),
    name: 'St Andrews Snidgets Quidditch Club',
    slug: 'st-andrews-snidgets',
    type: 'University',
    location: { type: 'POINT', coordinates: ['-2.811808', '56.341305'] },
  },
]);

export const down = (queryInterface, { Op }) => queryInterface.bulkDelete('clubs', {
  [Op.or]: [
    { slug: 'london-quidditch-club' },
    { slug: 'london-unspeakables-quidditch' },
    { slug: 'werewolves-of-london' },
    { slug: 'st-andrews-snidgets' },
  ],
});
