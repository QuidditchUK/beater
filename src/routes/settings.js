import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { authenticateJWT } from '../modules/jwt';
import { checkAuthenticated, checkScopeAuthorized } from '../modules/passport';
import { EMT } from '../constants/scopes';
import { PUSH_PAYLOADS, TRANSFERS_CLOSED, TRANSFERS_OPEN } from '../constants/notifications';
import prisma from '../modules/prisma';
import pushNotification from '../modules/push';

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

      // notifications
      const transferChanged = oldSettings?.transfer_window !== settings?.transfer_window;

      if (!transferChanged) {
        res.json(settings);
        return;
      }

      const whereUsers = transferChanged ? { transfer_window_notifications: true } : {};

      const users = await prisma?.users?.findMany({
        where: whereUsers,
        select: {
          uuid: true,
          push_notifications: true,
        },
      });

      const type_id = settings?.transfer_window ? TRANSFERS_OPEN : TRANSFERS_CLOSED;

      await prisma?.notifications?.createMany({
        data: users.map(({ uuid: user_uuid }) => ({
          user_uuid,
          type_id,
        })),
      });

      // push notifications
      // only users that have push notifications
      const pushUsers = users.filter(({ push_notifications }) => push_notifications?.length !== 0);

      // for Each of the users, loop over their push notifications and send a notification
      pushUsers.forEach((pushUser) => {
        pushUser.push_notifications.forEach(({ endpoint, auth, p256dh }) => {
          pushNotification({ endpoint, keys: { auth, p256dh } }, PUSH_PAYLOADS[type_id]);
        });
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
