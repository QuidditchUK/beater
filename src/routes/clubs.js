import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { lookup } from '../modules/postcode';
import { searchClubs, getClubBySlug, allClubs } from '../models/clubs';

export default function authRoute() {
  const router = new Router();

  router.get('/search', asyncHandler(async (req, res) => {
    if (!req.query.postcode) {
      const clubs = await allClubs();
      res.json(clubs);

      return;
    }

    const { data } = await lookup(req.query.postcode);

    const radius = req.query.distance || 100000;
    const clubs = await searchClubs(data.result, radius);

    res.json(clubs);
  }));

  router.get('/:slug', asyncHandler(async (req, res) => {
    const club = await getClubBySlug(req.params.slug);

    res.json(club);
  }));

  return router;
}
