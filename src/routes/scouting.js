import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { authenticateJWT } from '../modules/jwt';
import { checkAuthenticated, checkScopeAuthorized } from '../modules/passport';
import { EMT, HEAD_SCOUT } from '../constants/scopes';
import prisma from '../modules/prisma';

export default function scoutingRoute() {
  const router = new Router();

  router.get('/pending', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, HEAD_SCOUT]), asyncHandler(async (req, res) => {
    const scoutingRequests = await prisma.scouting_requests.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            first_team: true,
            second_team: true,
            third_team: true,
            position: true,
            playstyle: true,
            experience: true,
            years: true,
            clubs: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where: {
        status: 'PENDING',
      },
      orderBy: {
        created: 'desc',
      },
    });

    res.json(scoutingRequests);
  }));

  router.get('/open', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, HEAD_SCOUT]), asyncHandler(async (req, res) => {
    const scoutingRequests = await prisma.scouting_requests.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            first_team: true,
            second_team: true,
            third_team: true,
            position: true,
            playstyle: true,
            experience: true,
            years: true,
            clubs: {
              select: {
                name: true,
              },
            },
          },
        },
        scoutedBy: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      where: {
        NOT: { status: 'PENDING' },
        AND: { outcome: 'PENDING' },
      },
      orderBy: {
        created: 'desc',
      },
    });

    res.json(scoutingRequests);
  }));

  router.put('/:uuid/accept', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, HEAD_SCOUT]), asyncHandler(async (req, res) => {
    const { uuid } = req.params;

    try {
      const scoutingRequest = await prisma?.scouting_requests?.update({
        where: { uuid },
        data: { status: 'ACCEPTED', updated: new Date() },
      });

      // Notifications

      res.json(scoutingRequest);
    } catch (error) {
      res.status(400).json({ error: error?.message });
    }
  }));

  router.put('/:uuid/decline', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, HEAD_SCOUT]), asyncHandler(async (req, res) => {
    const { uuid } = req.params;

    try {
      const scoutingRequest = await prisma?.scouting_requests?.update({
        where: { uuid },
        data: { status: 'DECLINED', updated: new Date() },
      });

      // Notifications

      res.json(scoutingRequest);
    } catch (error) {
      res.status(400).json({ error: error?.message });
    }
  }));

  return router;
}
