import { format, addHours, subHours } from 'date-fns';
import fetch from 'node-fetch';
import prisma from './prisma';
import pushNotification from './push';

// EXPERIMENTAL, HARDCODED AND FRAGILE

// get user schedule
// tag it
// push notification
// profit

const VOLUNTEERING_URL = ({ tournamentId, playerId }) => `https://api.quidditchscheduler.com/game/tournament/${tournamentId}/person/${playerId}/volunteering`;
const PLAYING_URL = ({ tournamentId, playerId }) => `https://api.quidditchscheduler.com/game/tournament/${tournamentId}/person/${playerId}/playing`;

const roles = {
  HEAD_REFEREE: 'HR',
  SNITCH_REFEREE: 'SR',
  SNITCH_RUNNER: 'Snitch',
  ASSISTANT_REFEREE: 'AR',
  FIRST_AIDER: 'First Aid',
  PITCH_MANAGER: 'Pitch',
  TIMEKEEPER: 'Time',
  SCOREKEEPER: 'Score',
  GOAL_REFEREE: 'Goal',
};

const teams = {
  'East Midlands Vipers': 'Vipers',
  'LQC A': 'LQC A',
  'LQC B': 'LQC B',
  'West Country Rebels': 'Rebels',
  'Southsea Quidditch': 'Southsea',
  'Oxford Mammoths': 'Mammoths',
  'Phoenix Quidditch': 'Phoenix',
  Velociraptors: 'Raptors',
  'Werewolves of London Seconds': 'WOL2',
  'Werewolves of London Firsts': 'WOL1',
  Kelpies: 'Kelpies',
  'Olympians QC': 'Olympians',

};

const schedulePush = async () => {
  try {
    const volunteeringRes = await fetch(VOLUNTEERING_URL({ tournamentId: 15, playerId: 119 })) || [];
    const playingRes = await fetch(PLAYING_URL({ tournamentId: 15, playerId: 119 })) || [];

    const volunteering = await volunteeringRes.json();
    const playing = await playingRes.json();

    const volunteeringData = volunteering?.map((slot) => {
      const time = new Date(slot?.timeslot?.time);
      const { role } = slot.officials.find((official) => official?.volunteer?.person?.id === 119);

      const teamA = teams[slot.teamA.name] || 'Team A';
      const teamB = teams[slot.teamB.name] || 'Team B';

      return {
        time,
        formatted: `${format(addHours(time, 1), 'haa')} Pitch ${slot?.pitch}, ${roles[role] ? roles[role] : 'Volunteer'} ${teamA} vs ${teamB}`,
      };
    });

    const playingData = playing?.map((slot) => {
      const time = new Date(slot?.timeslot?.time);

      // if teamA is Olympians seconds, get the other teams name
      const team = slot?.teamA?.id === 79 ? slot?.teamB?.name : slot?.teamA?.name;

      return {
        time,
        formatted: `${format(addHours(time, 1), 'haa')} Pitch ${slot?.pitch}, Prometheans vs ${teams[team] ?? 'Team'}`,
      };
    });

    const body = []
      .concat(volunteeringData, playingData) // put the data together in 1 array
      .sort((a, b) => a.time - b.time) // order by time
      .filter((slot) => subHours(new Date(), 1) < slot?.time) // only show slots in the future, but give an hour leeway
      .slice(0, 3) //
      .map((slot) => slot?.formatted)
      .join(' \n');

    // Hardcoded to find Dec Ramsay pushes so no one else gets my schedule
    const pushes = await prisma?.push_notifications?.findMany({
      where: {
        user_uuid: '78414EC1-524C-48C4-B614-9BE6D11B0EEE',
      },
    });

    pushes?.forEach(({ endpoint, auth, p256dh }) => {
      pushNotification({ endpoint, keys: { auth, p256dh } }, {
        title: 'Tournament Schedule',
        tag: 'experiment-schedule-update',
        requireInteraction: true,
        actions: [{ action: 'dismiss', title: 'Dismiss' }, { action: 'full_schedule', title: 'Full Schedule' }],
        data: { url: '/events/community-league-2-2223' },
        body,
      });
    });
  } catch (error) {
    console.log('ERROR IN SCHEDULE PUSH');
    console.log(error);
  }
};

export default schedulePush;
