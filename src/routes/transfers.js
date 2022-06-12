import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { authenticateJWT } from '../modules/jwt';
import { checkAuthenticated, checkScopeAuthorized } from '../modules/passport';
import {
  ADMIN, EMT, TRANSFER_WRITE, TRANSFER_READ,
} from '../constants/scopes';
import prisma from '../modules/prisma';

export default function scopesRoute() {
  const router = new Router();

  router.post('/', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    try {
      const { club_uuid: prev_club_uuid } = await prisma.users.findUnique({ where: { uuid: req.user.uuid } });
      const { club_uuid: new_club_uuid } = req.body;

      const transfer = await prisma.transfers.create({ prev_club_uuid, new_club_uuid, user_uuid: req.user.uuid });

      // TODO: Notifications

      res.json(transfer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.put('/:transfer_uuid/approve', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, TRANSFER_WRITE]), asyncHandler(async (req, res) => {
    const { transfer_uuid } = req.params;
    const { reason } = req.body;

    try {
      const { user_uuid: actioned_by } = req.user.uuid;
      const transfer = await prisma.transfers.update({
        where: { uuid: transfer_uuid },
        data: {
          status: 'APPROVED', actioned_by, updated: new Date(), reason,
        },
      });

      await prisma.users.update({
        where: { uuid: transfer?.user_uuid },
        data: {
          club_uuid: transfer.new_club_uuid,
          updated: new Date(),
        },
      });

      // TODO: Notifications
      res.json(transfer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.put('/:transfer_uuid/decline', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, TRANSFER_WRITE]), asyncHandler(async (req, res) => {
    const { transfer_uuid } = req.params;
    const { reason } = req.body;

    try {
      const { user_uuid: actioned_by } = req.user.uuid;
      const transfer = await prisma.transfers.update({
        where: { uuid: transfer_uuid },
        data: {
          status: 'DECLINED', actioned_by, updated: new Date(), reason,
        },
      });

      // TODO: Notifications
      res.json(transfer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.get('/', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, TRANSFER_READ]), asyncHandler(async (req, res) => {
    const transfers = await prisma.transfers.findMany({
      orderBy: {
        created: 'asc',
      },
    });

    res.json(transfers);
  }));

  router.delete('/:transfer_uuid', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    const { transfer_uuid } = req.params;

    try {
      const transfer = await prisma.transfers.findUnique({ where: { uuid: transfer_uuid } });
      const userScopes = req.user.scopes.map(({ scope }) => scope);

      const hasScopes = [ADMIN, EMT, TRANSFER_WRITE].some((scope) => userScopes.includes(scope));
      const canDeleteTransfer = hasScopes || transfer?.user_uuid === req.user?.uuid;

      // only those with scopes or the user themselves can delete transfers, and only if it is pending.
      if (canDeleteTransfer && transfer.status === 'PENDING') {
        await prisma.transfers.delete({ where: { uuid: transfer_uuid } });

        // TODO: Notification to user if deleted by someone other than user
        res.sendStatus(204);

        return;
      }

      res.status(403).json();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  return router;
}
