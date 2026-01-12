import dotenv from 'dotenv';
import { logger } from '@project-scope-analyzer/shared';

dotenv.config();

export const config = {
  service: {
    name: process.env.SERVICE_NAME || 'service-template',
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  eventBus: {
    type: (process.env.EVENT_BUS_TYPE || 'redis') as 'redis' | 'rabbitmq',
    rabbitmq: {
      url: process.env.RABBITMQ_URL || 'amqp://admin:admin_password@localhost:5672',
      exchange: process.env.RABBITMQ_EXCHANGE || 'events',
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    issuer: process.env.JWT_ISSUER || 'project-scope-analyzer',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: (process.env.LOG_FORMAT || 'json') as 'json' | 'simple',
  },
  metrics: {
    port: parseInt(process.env.METRICS_PORT || '9091', 10),
  },
};

// Validate required configuration
if (!config.database.name || !config.database.user || !config.database.password) {
  throw new Error('Database configuration is incomplete');
}

if (!config.jwt.secret) {
  logger.warn('JWT_SECRET is not set. Authentication middleware will not work properly.');
}

