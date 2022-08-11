import { format } from 'date-fns';
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

const schedulePush = async () => {
  try {
    const volunteering = await fetch(VOLUNTEERING_URL({ tournamentId: 15, playerId: 119 })) || [];
    const playing = await fetch(PLAYING_URL({ tournamentId: 15, playerId: 119 })) || [];

    console.log('VOLUNTEERING');
    console.log(volunteering);
    console.log('PLAYING');
    console.log(playing);

    const volunteeringData = volunteering?.map((slot) => {
      const time = new Date(slot?.timeslot?.time);
      const { role } = slot.officials.find((official) => official?.volunteer?.person.id === '119');

      return {
        time,
        pitch: slot?.pitch,
        role,
        formatted: `${format(time, 'haa')} Pitch ${slot?.pitch} ${role}`,
      };
    });

    const playingData = playing?.map((slot) => {
      const time = new Date(slot?.timeslot?.time);

      // if teamA is Olympians seconds, get the other teams name
      const team = slot?.teamA?.id === 79 ? slot?.teamB?.name : slot?.teamA?.name;

      return {
        time,
        pitch: slot.pitch,
        team,
        formatted: `${format(time, 'haa')} Pitch ${slot?.pitch} vs ${team}`,
      };
    });

    const body = []
      .concat(volunteeringData, playingData) // put the data together in 1 array
      .sort((a, b) => a.time - b.time) // order by time
      .filter((slot) => new Date() < slot?.time) // only show slots in the future
      .slice(0, 2) //
      .map((slot) => slot?.formatted)
      .join(' \n ');

    // Hardcoded to find Dec Ramsay pushes so no one else gets my schedule
    const pushes = await prisma?.push_notifications?.findMany({
      where: {
        user_uuid: '78414EC1-524C-48C4-B614-9BE6D11B0EEE',
      },
    });

    pushes?.forEach(({ endpoint, auth, p256dh }) => {
      pushNotification({ endpoint, keys: { auth, p256dh } }, {
        title: 'Tournament Schedule',
        tag: 'experiement-schedule-update',
        body,
      });
    });
  } catch (error) {
    console.log('ERROR IN SCHEDULE PUSH');
    console.log(error);
  }
};

export default schedulePush;
