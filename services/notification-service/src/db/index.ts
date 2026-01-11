import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { config } from '../config';
import { logger } from '@project-scope-analyzer/shared';


// Support both DATABASE_URL (for Neon/serverless) and individual DB config
let pool: Pool;

if (process.env.DATABASE_URL) {
  // Use connection string (Neon, etc.)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: config.database.maxConnections,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  });
} else {
  // Use individual config
  pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    max: config.database.maxConnections,
  });
}

export { pool };

export const db = drizzle(pool, { schema });

export * from './schema';
