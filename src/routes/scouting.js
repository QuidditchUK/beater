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

  return router;
}
