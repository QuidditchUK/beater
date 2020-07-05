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
    baseUrl: process.env.BASE_URL || 'localhost',
  },

  logLevel: process.env.LOG_LEVEL || 'debug',

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DATABASE || 'quk',
    user: process.env.POSTGRES_USER || 'docker',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: process.env.POSTGRES_PORT || 5432,
  },

  session: {
    secretKey: process.env.SESSION_SECRET,
    session_max_age: Number(process.env.SESSION_EXPIRY_DAYS) || 21,
  },

  postmark: {
    token: process.env.POSTMARK_TOKEN,
    from: 'admin@quidditchuk.org',
    templates: {
      forgotPassword: 19133707,
    },
  },
};
