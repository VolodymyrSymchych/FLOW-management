import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { config } from '../config';

// Lazy initialization for serverless environments
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getPool(): Pool {
  if (!pool) {
    if (process.env.DATABASE_URL) {
      // Use connection string (Neon, etc.)
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1, // Reduced for serverless - Vercel creates many instances
        connectionTimeoutMillis: 10000, // 10 seconds timeout
        idleTimeoutMillis: 30000, // Close idle connections after 30s
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
        max: 1,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      });
    }

    // Handle connection errors gracefully
    pool.on('error', (err) => {
      console.error('Unexpected database error', err);
    });
  }
  return pool;
}

function getDb() {
  if (!db) {
    db = drizzle(getPool(), { schema });
  }
  return db;
}

// Export getters instead of direct instances
export { getPool as pool };
export { getDb as db };

export * from './schema';

