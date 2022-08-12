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
};

const teams = {
  'East Midlands Vipers': 'Vipers',
  'LQC B': 'LQC B',
  'West Country Rebels': 'Rebels',
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

      return {
        time,
        formatted: `${format(addHours(time, 1), 'haa')} Pitch ${slot?.pitch}, ${roles[role] ? roles[role] : ''}`,
      };
    });

    const playingData = playing?.map((slot) => {
      const time = new Date(slot?.timeslot?.time);

      // if teamA is Olympians seconds, get the other teams name
      const team = slot?.teamA?.id === 79 ? slot?.teamB?.name : slot?.teamA?.name;

      return {
        time,
        formatted: `${format(addHours(time, 1), 'haa')} Pitch ${slot?.pitch} vs ${teams[team]}`,
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
        actions: [{ action: 'dismiss', title: 'Dismiss' }],
        body,
      });
    });
  } catch (error) {
    console.log('ERROR IN SCHEDULE PUSH');
    console.log(error);
  }
};

export default schedulePush;
