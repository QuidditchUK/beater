import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { lookup, postcodeRegex } from '../modules/postcode';
import {
  searchClubs,
  getClubBySlug,
  allClubs,
  create,
  getClub,
} from '../models/clubs';
import { authenticateJWT } from '../modules/jwt';
import { checkAuthenticated, checkAdmin } from '../modules/passport';

export default function clubsRoute() {
  const router = new Router();

  router.get('/search', asyncHandler(async (req, res) => {
    if (!req.query.postcode || !req.query.postcode.match(postcodeRegex)) {
      const clubs = await allClubs();
      res.json(clubs);

      return;
    }

    const { data } = await lookup(req.query.postcode);

    const radius = req.query.distance || 100000;
    const clubs = await searchClubs(data.result, radius);

    res.json(clubs);
  }));

  router.get('/slug/:slug', asyncHandler(async (req, res) => {
    const club = await getClubBySlug(req.params.slug);
    if (!club) {
      res.sendStatus(404);
      return;
    }

    res.json(club);
  }));

  router.get('/:uuid', asyncHandler(async (req, res) => {
    const club = await getClub(req.params.uuid);
    if (!club) {
      res.sendStatus(404);
      return;
    }

    res.json(club);
  }));

  router.post('/', authenticateJWT, checkAuthenticated, checkAdmin, asyncHandler(async (req, res) => {
    try {
      await create(req.body);
      res.status(201).end();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  return router;
}
