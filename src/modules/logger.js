import winston from 'winston';
import settings from '../config';

export default (label = null) => {
  const labelFormatted = label
    ? ` [${label}]`
    : '';

  const logger = winston.createLogger({
    level: settings.logLevel,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.splat(),
          winston.format.printf(({
            timestamp,
            level,
            message,
          }) => `[${timestamp}] ${level}:${labelFormatted} ${message}`),
        ),
      }),
    ],
  });

  logger.stream = {
    write: (message) => logger.info(message.substring(0, message.length - 1)),
  };

  return logger;
};
