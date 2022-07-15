import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { authenticateJWT } from '../modules/jwt';
import settings from '../config';
import { checkAuthenticated, checkScopeAuthorized } from '../modules/passport';
import { CLUBS_WRITE, CLUBS_READ, EMT } from '../constants/scopes';
import prisma from '../modules/prisma';
import { email } from '../modules/email';

export default function clubsRoute() {
  const router = new Router();

  router.post('/register', asyncHandler(async (req, res) => {
    const { clubName, email: clubEmail, league } = req.body;
    await prisma.clubs.create({
      data: {
        name: clubName, email: clubEmail, league, active: false,
      },
    });

    email(settings.postmark.clubsEmail, 'registerClubForm', req.body, settings.postmark.adminEmail, settings.postmark.adminEmail);
    res.status(200).end();
  }));

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
    const club = await prisma.clubs.findUnique({
      where: { uuid: req.params.uuid },
      include: { teams: true },
    });
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

  router.get('/:uuid/members', authenticateJWT, checkAuthenticated, checkScopeAuthorized([CLUBS_READ, EMT]), asyncHandler(async (req, res) => {
    const club = await prisma.clubs.findUnique({
      where: { uuid: req.params.uuid },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            stripe_products: {
              select: {
                products: {
                  select: {
                    description: true,
                    expires: true,
                  },
                },
              },
            },
            teams: {
              select: {
                teams: {
                  select: {
                    name: true,
                    club_uuid: true,
                  },
                },
              },
            },
          },
          orderBy: {
            last_name: 'asc',
          },
        },
      },
    });

    if (!club) {
      res.sendStatus(404);
      return;
    }

    res.json(club.users);
  }));

  router.post('/', authenticateJWT, checkAuthenticated, checkScopeAuthorized([CLUBS_WRITE, EMT]), asyncHandler(async (req, res) => {
    try {
      const club = await prisma.clubs.create({ data: req.body });
      res.status(201).json(club);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.get('/:uuid/teams', authenticateJWT, checkAuthenticated, checkScopeAuthorized([CLUBS_READ, EMT]), asyncHandler(async (req, res) => {
    try {
      const teams = await prisma.teams.findMany({
        where: { club_uuid: req.params.uuid },
      });

      res.json(teams);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  // TODO adjust middleware to allow club leadership to CRUD club teams
  router.post('/:uuid/teams', authenticateJWT, checkAuthenticated, checkScopeAuthorized([CLUBS_WRITE, EMT]), asyncHandler(async (req, res) => {
    try {
      const team = await prisma.teams.create({
        data: {
          ...req.body,
          club_uuid: req.params.uuid,
          type: 'CLUB',
        },
      });
      res.status(201).json(team);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.delete('/:uuid/teams/:team_uuid', authenticateJWT, checkAuthenticated, checkScopeAuthorized([CLUBS_WRITE, EMT]), asyncHandler(async (req, res) => {
    try {
      const { uuid: club_uuid, team_uuid } = req.params;

      if (!club_uuid) {
        res.status(404).json({ error: `No club found with uuid ${club_uuid}` });
        return;
      }

      const clubTeams = await prisma.teams.findMany({
        where: {
          club_uuid,
        },
      });

      const team = clubTeams.find(({ uuid }) => uuid === team_uuid);

      if (!team) {
        res.status(404).json({ error: `No team with uuid ${club_uuid} found in club ${club_uuid}` });
      }

      await prisma.teams.delete({ where: { uuid: team?.uuid } });
      res.status(204);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  router.delete('/:uuid', authenticateJWT, checkAuthenticated, checkScopeAuthorized([CLUBS_WRITE, EMT]), asyncHandler(async (req, res) => {
    try {
      await prisma.clubs.delete({ where: { uuid: req.params.uuid } });
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  return router;
}
