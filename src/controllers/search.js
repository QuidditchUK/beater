import { searchClubs } from '../models/clubs';
import { searchEvents } from '../models/events';

export const search = async (location, radius, showTypes, leagues) => {
  let clubs = [];
  let events = [];

  if (!showTypes || (Array.isArray(showTypes) && showTypes.includes('clubs')) || showTypes === 'clubs') {
    clubs = await searchClubs(location, radius, leagues);
  }
  if (!showTypes || (Array.isArray(showTypes) && showTypes.includes('events')) || showTypes === 'events') {
    events = await searchEvents(location, radius, leagues);
  }

  return { events, clubs };
};
