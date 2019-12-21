if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  require('dotenv').config();
}

export default {
  app: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
  },
  logLevel: process.env.LOG_LEVEL || 'debug',
};
