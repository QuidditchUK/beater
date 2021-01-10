import jwt from 'express-jwt';

import settings from '../config';

export const authenticateJWT = jwt({ secret: settings.app.jwt.secret, algorithms: ['HS256'] });
