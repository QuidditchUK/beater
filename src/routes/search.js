import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { lookup, postcodeRegex } from '../modules/postcode';
import { allEvents } from '../models/events';
import { allClubs } from '../models/clubs';
import { search } from '../controllers/search';

export default function searchRoute() {
  const router = new Router();

  router.get('/', asyncHandler(async (req, res) => {
    const {
      postcode,
      showTypes,
      distance,
    } = req.query;

    const leagues = Array.isArray(req.query.leagues) ? req.query.leagues : (req.query.leagues?.split(',') || ['Community', 'University']);

    if (!postcode || !postcode.match(postcodeRegex)) {
      const events = await allEvents(leagues);
      const clubs = await allClubs(leagues);
      res.json({ events, clubs });

      return;
    }

    const { data } = await lookup(postcode);
    const radius = distance || 100000;

    const results = await search(data.result, radius, showTypes, leagues);

    res.json(results);
  }));

  return router;
}
