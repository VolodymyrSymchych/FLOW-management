import winston from 'winston';

export interface LoggerConfig {
  level?: string;
  service?: string;
  format?: 'json' | 'simple';
}

const createLogger = (config: LoggerConfig = {}) => {
  const { level = 'info', service = 'unknown', format = 'json' } = config;

  const logFormat = format === 'json'
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    : winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
        })
      );

  return winston.createLogger({
    level,
    defaultMeta: { service },
    format: logFormat,
    transports: [
      new winston.transports.Console({
        stderrLevels: ['error'],
      }),
    ],
  });
};

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  service: process.env.SERVICE_NAME || 'microservice',
  format: (process.env.LOG_FORMAT as 'json' | 'simple') || 'json',
});

export { createLogger };

