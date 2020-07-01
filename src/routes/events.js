import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { lookup, postcodeRegex } from '../modules/postcode';
import { searchEvents, getEventBySlug, allEvents } from '../models/events';

export default function eventsRoute() {
  const router = new Router();

  router.get('/search', asyncHandler(async (req, res) => {
    if (!req.query.postcode || !req.query.postcode.match(postcodeRegex)) {
      const events = await allEvents();
      res.json(events);

      return;
    }

    const { data } = await lookup(req.query.postcode);

    const radius = req.query.distance || 100000;
    const events = await searchEvents(data.result, radius);

    res.json(events);
  }));

  router.get('/:slug', asyncHandler(async (req, res) => {
    const event = await getEventBySlug(req.params.slug);
    if (!event) {
      res.sendStatus(404);
      return;
    }

    res.json(event);
  }));

  return router;
}
