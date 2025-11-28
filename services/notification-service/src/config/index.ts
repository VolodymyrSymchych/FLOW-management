import dotenv from 'dotenv';

dotenv.config();

export const config = {
  service: {
    name: process.env.SERVICE_NAME || 'notification-service',
    port: parseInt(process.env.PORT || '3005', 10),
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
  jwt: {
    secret: process.env.JWT_SECRET || '',
    issuer: process.env.JWT_ISSUER || 'project-scope-analyzer',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: (process.env.LOG_FORMAT || 'json') as 'json' | 'simple',
  },
  metrics: {
    port: parseInt(process.env.METRICS_PORT || '9095', 10),
  },
};

// Validate required configuration
// Allow either DATABASE_URL or individual DB config
if (!process.env.DATABASE_URL && (!config.database.name || !config.database.user || !config.database.password)) {
  throw new Error('Database configuration is incomplete. Either set DATABASE_URL or DB_NAME, DB_USER, and DB_PASSWORD.');
}

if (!config.jwt.secret) {
  console.warn('Warning: JWT_SECRET is not set. Authentication middleware will not work properly.');
}
