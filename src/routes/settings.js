import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { authenticateJWT } from '../modules/jwt';
import { checkAuthenticated, checkScopeAuthorized } from '../modules/passport';
import { EMT } from '../constants/scopes';
import prisma from '../modules/prisma';

export default function settingsRoute() {
  const router = new Router();

  router.post('/', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT]), asyncHandler(async (req, res) => {
    try {
      const [oldSettings] = await prisma.system_settings.findMany({
        orderBy: {
          created: 'desc',
        },
        take: 1,
      });

      const { uuid, created, ...rest } = oldSettings;
      const data = { ...rest, ...req.body };

      // new settings
      const settings = await prisma.system_settings.create({
        data,
      });

      // delete old settings
      await prisma.system_settings.delete({
        where: {
          uuid: oldSettings.uuid,
        },
      });

      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.get('/', asyncHandler(async (req, res) => {
    const [settings] = await prisma.system_settings.findMany({
      orderBy: {
        created: 'desc',
      },
      take: 1,
    });

    res.json(settings);
  }));

  return router;
}
