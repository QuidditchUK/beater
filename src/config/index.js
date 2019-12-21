if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  require('dotenv').config();
}

export default {
  app: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
    jwt: {
      secret: process.env.JWT_SECRET,

      options: {
        expiresIn: `${Number(process.env.JWT_EXPIRY_DAYS) || 21}d`,
      },

      cookie: {
        sameSite: true,
        signed: true,
        secure: true,
      },
    },
  },

  logLevel: process.env.LOG_LEVEL || 'debug',

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  postgres: {
    url: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5432/quk',
  },

  session: {
    secretKey: process.env.SESSION_SECRET,
    session_max_age: Number(process.env.SESSION_EXPIRY_DAYS) || 21,
  },
};
