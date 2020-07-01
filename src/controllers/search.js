import { searchClubs } from '../models/clubs';
import { searchEvents } from '../models/events';

export const search = async (location, radius, showTypes, leagues) => {
  let events = [];
  let clubs = [];

  if (!showTypes || showTypes.includes('events')) {
    clubs = await searchClubs(location, radius, leagues);
  }
  if (!showTypes || showTypes.includes('clubs')) {
    events = await searchEvents(location, radius, leagues);
  }

  return { events, clubs };
};
