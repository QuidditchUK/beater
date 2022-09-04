import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { authenticateJWT } from '../modules/jwt';
import { checkAuthenticated, checkScopeAuthorized } from '../modules/passport';
import {
  ADMIN, EMT, TRANSFER_WRITE, TRANSFER_READ,
} from '../constants/scopes';
import prisma from '../modules/prisma';
import { email } from '../modules/email';
import settings from '../config';
import { TRANSFER_APPROVED, TRANSFER_DECLINED, CLUB_MEMBER_ADDED } from '../constants/notifications';
import sendNotifications from '../modules/notifications';

export default function transfersRoute() {
  const router = new Router();

  router.post('/', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    try {
      const [{ transfer_window }] = await prisma.system_settings.findMany({
        select: {
          transfer_window: true,
        },
        orderBy: {
          created: 'desc',
        },
        take: 1,
      });

      if (!transfer_window) {
        res.status(403).json({ error: 'Transfer window is not open' }).end();
        return;
      }

      const { club_uuid: prev_club_uuid, first_name, last_name } = await prisma.users.findUnique({ where: { uuid: req.user.uuid } });
      const { club_uuid: new_club_uuid } = req.body;

      const transfer = await prisma.transfers.create({
        data: {
          prev_club_uuid, new_club_uuid, user_uuid: req.user.uuid,
        },
        include: {
          newClub: true,
          prevClub: true,
        },
      });

      // Notifications
      email(
        settings.postmark.clubsEmail,
        'transferRequestForm',
        {
          first_name,
          last_name,
          prev_club_name: transfer?.prevClub.name,
          new_club_name: transfer?.newClub?.name,
        },
        settings.postmark.clubsEmail,
      );

      res.json(transfer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.put('/:transfer_uuid/approve', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, TRANSFER_WRITE]), asyncHandler(async (req, res) => {
    const { transfer_uuid } = req.params;
    const { reason } = req.body;

    try {
      const { uuid: actioned_by } = req.user;
      const transfer = await prisma.transfers.update({
        where: { uuid: transfer_uuid },
        data: {
          status: 'APPROVED', actioned_by, updated: new Date(), reason,
        },
        include: {
          newClub: true,
        },
      });

      const user = await prisma.users.update({
        where: { uuid: transfer?.user_uuid },
        data: {
          club_uuid: transfer.new_club_uuid,
          updated: new Date(),
        },
        include: {
          teams: {
            select: {
              teams: {
                select: {
                  uuid: true,
                  type: true,
                },
              },
            },
          },
        },
      });

      // Remove user CLUB team if they have one
      const team = user?.teams?.find(({ teams }) => teams?.type === 'CLUB');

      if (team) {
        const teamUsers = await prisma?.teams_users?.findMany({
          where: { team_uuid: team?.uuid },
        });

        // find the relevant teams_users entry
        const teamUser = teamUsers?.find(({ user_uuid }) => user_uuid === user?.uuid);

        // Remove the teams_users row
        if (teamUser) {
          await prisma.teams_users?.delete({
            where: {
              uuid: teamUser?.uuid,
            },
          });
        }
      }

      // Notifications
      email(transfer?.newClub?.email, 'transferClubNewMember', { first_name: user?.first_name, last_name: user?.last_name, email: user?.email }, settings.postmark.clubsEmail);
      email(user?.email, 'transferApproved', { first_name: user?.first_name, new_club_name: transfer?.newClub?.name }, settings.postmark.clubsEmail);
      await sendNotifications({ user_uuid: transfer?.user_uuid, type_id: TRANSFER_APPROVED }, { club_name: transfer?.newClub?.name });
      await sendNotifications({ user_uuid: transfer?.newClub?.managed_by, type_id: CLUB_MEMBER_ADDED }, { club_name: transfer?.newClub?.name, user_name: `${user?.first_name} ${user?.last_name}` });

      res.json(transfer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.put('/:transfer_uuid/decline', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, TRANSFER_WRITE]), asyncHandler(async (req, res) => {
    const { transfer_uuid } = req.params;
    const { reason } = req.body;

    try {
      const { uuid: actioned_by } = req.user;
      const transfer = await prisma.transfers.update({
        where: { uuid: transfer_uuid },
        data: {
          status: 'DECLINED', actioned_by, updated: new Date(), reason,
        },
        include: {
          newClub: true,
        },
      });

      const user = await prisma.users.findUnique({ where: { uuid: req.user.uuid } });

      // Notifications
      email(user?.email, 'transferDeclined', { first_name: user?.first_name, new_club_name: transfer?.newClub?.name }, settings.postmark.clubsEmail);
      await sendNotifications({ user_uuid: transfer?.user_uuid, type_id: TRANSFER_DECLINED }, { club_name: transfer?.newClub?.name });

      res.json(transfer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  router.get('/', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, TRANSFER_READ]), asyncHandler(async (req, res) => {
    const transfers = await prisma.transfers.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        prevClub: {
          select: {
            name: true,
          },
        },
        newClub: {
          select: {
            name: true,
          },
        },
        actionedBy: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        created: 'asc',
      },
    });

    res.json(transfers);
  }));

  router.get('/pending', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, TRANSFER_READ]), asyncHandler(async (req, res) => {
    const transfers = await prisma.transfers.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        prevClub: {
          select: {
            name: true,
          },
        },
        newClub: {
          select: {
            name: true,
          },
        },
      },
      where: {
        status: 'PENDING',
      },
    });

    res.json(transfers);
  }));

  router.get('/actioned/:page', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, TRANSFER_READ]), asyncHandler(async (req, res) => {
    const { page } = req.params ?? { page: 0 };
    const limit = 10;

    const transfers = await prisma.transfers.findMany({
      skip: page * limit,
      take: limit,
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        prevClub: {
          select: {
            name: true,
          },
        },
        newClub: {
          select: {
            name: true,
          },
        },
        actionedBy: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      where: {
        NOT: { status: 'PENDING' },
      },
      orderBy: {
        created: 'desc',
      },
    });
    const count = await prisma.transfers.count({
      where: {
        NOT: { status: 'PENDING' },
      },
    });

    res.json({ transfers, pages: Math.ceil(count / limit) });
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

  router.post('/manual', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT, TRANSFER_WRITE]), asyncHandler(async (req, res) => {
    try {
      const { club_uuid: new_club_uuid, user_uuid } = req.body;

      const { club_uuid: prev_club_uuid } = await prisma.users.findUnique({
        where: { uuid: user_uuid },
      });

      const { uuid: actioned_by } = req.user;

      const transfer = await prisma.transfers.create({
        data: {
          prev_club_uuid,
          new_club_uuid,
          user_uuid,
          actioned_by,
          status: 'APPROVED',
        },
        include: {
          newClub: true,
        },
      });

      // TODO DRY all this up from approve
      const user = await prisma.users.update({
        where: { uuid: transfer?.user_uuid },
        data: {
          club_uuid: transfer.new_club_uuid,
          updated: new Date(),
        },
        include: {
          teams: {
            select: {
              teams: {
                select: {
                  uuid: true,
                  type: true,
                },
              },
            },
          },
        },
      });

      // Remove user CLUB team if they have one
      const team = user?.teams?.find(({ teams }) => teams?.type === 'CLUB');

      if (team) {
        const teamUsers = await prisma?.teams_users?.findMany({
          where: { team_uuid: team?.uuid },
        });

        // find the relevant teams_users entry
        const teamUser = teamUsers?.find(({ user_uuid: team_user_uuid }) => team_user_uuid === user?.uuid);

        // Remove the teams_users row
        if (teamUser) {
          await prisma.teams_users?.delete({
            where: {
              uuid: teamUser?.uuid,
            },
          });
        }
      }

      email(transfer?.newClub?.email, 'transferClubNewMember', { first_name: user?.first_name, last_name: user?.last_name, email: user?.email }, settings.postmark.clubsEmail);
      email(user?.email, 'transferApproved', { first_name: user?.first_name, new_club_name: transfer?.newClub?.name }, settings.postmark.clubsEmail);
      await sendNotifications({ user_uuid: transfer?.user_uuid, type_id: TRANSFER_APPROVED }, { club_name: transfer?.newClub?.name });
      await sendNotifications({ user_uuid: transfer?.newClub?.managed_by, type_id: CLUB_MEMBER_ADDED }, { club_name: transfer?.newClub?.name, user_name: `${user?.first_name} ${user?.last_name}` });

      res.json(transfer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }));

  return router;
}
