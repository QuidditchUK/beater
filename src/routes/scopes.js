import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { authenticateJWT } from '../modules/jwt';
import { checkAuthenticated, checkScopeAuthorized } from '../modules/passport';
import { ADMIN, EMT } from '../constants/scopes';
import prisma from '../modules/prisma';
import { sanitiseEmailMiddleware } from '../modules/sanitise';

export default function scopesRoute() {
  const router = new Router();

  router.get('/users/:scope', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT]), asyncHandler(async (req, res) => {
    const users = await prisma.users.findMany({
      where: {
        scopes: {
          some: {
            scope: req.params.scope,
          },
        },
      },
      include: {
        scopes: true,
      },
    });

    res.json(users);
  }));

  router.post('/', authenticateJWT, checkAuthenticated, sanitiseEmailMiddleware, checkScopeAuthorized([EMT]), asyncHandler(async (req, res) => {
    const { email, scope: newScope } = req.body;
    const userScopes = req.user.scopes.map(({ scope }) => scope);

    // Only admins can add EMT + Admins scopes
    if ([ADMIN, EMT].includes(newScope) && !userScopes.includes(ADMIN)) {
      res.status(403).json();
      return;
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      res.sendStatus(404);
    }

    await prisma.scopes.create({
      data: {
        user_uuid: user?.uuid,
        scope: newScope,
      },
    });

    const updatedUser = await prisma.users.findUnique({ where: { email }, include: { scopes: true } });

    res.json(updatedUser);
  }));

  router.delete('/:scope/user/:user_uuid', authenticateJWT, checkAuthenticated, checkScopeAuthorized([EMT]), asyncHandler(async (req, res) => {
    const { user_uuid, scope: deleteScope } = req.params;

    const userScopes = req.user.scopes.map(({ scope }) => scope);

    // Only admins can remove EMT + Admin scopes
    if ([ADMIN, EMT].includes(deleteScope) && !userScopes.includes(ADMIN)) {
      res.status(403).json();
      return;
    }

    try {
      await prisma.scopes.deleteMany({
        where: { user_uuid, scope: deleteScope },
      });
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }));

  return router;
}
