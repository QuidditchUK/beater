import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { authenticateJWT } from '../modules/jwt';
import { checkAuthenticated, checkScopeAuthorized } from '../modules/passport';
import { CLUBS_WRITE, CLUBS_READ, EMT } from '../constants/scopes';
import prisma from '../modules/prisma';

export default function clubsRoute() {
  const router = new Router();

  router.get('/search', asyncHandler(async (req, res) => {
    const clubs = await prisma.clubs.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
    res.json(clubs);
  }));

  router.get('/all', authenticateJWT, checkAuthenticated, checkScopeAuthorized([CLUBS_READ, EMT]), asyncHandler(async (req, res) => {
    const clubs = await prisma.clubs.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
    res.json(clubs);
  }));

  router.get('/:uuid', asyncHandler(async (req, res) => {
    const club = await prisma.clubs.findUnique({ where: { uuid: req.params.uuid } });
    if (!club) {
      res.sendStatus(404);
      return;
    }

    res.json(club);
  }));

  router.put('/:uuid', authenticateJWT, checkAuthenticated, checkScopeAuthorized([CLUBS_WRITE, EMT]), asyncHandler(async (req, res) => {
    const club = await prisma.clubs.update({ where: { uuid: req.params.uuid }, data: req.body });

    if (!club) {
      res.sendStatus(404);
      return;
    }

    res.json(club);
  }));

  router.post('/', authenticateJWT, checkAuthenticated, checkScopeAuthorized([CLUBS_WRITE, EMT]), asyncHandler(async (req, res) => {
    try {
      await prisma.clubs.create({ data: req.body });
      res.status(201).end();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  return router;
}
