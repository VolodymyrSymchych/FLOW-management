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
      console.log('Initializing new database pool...');
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1, // Only 1 connection for serverless
        min: 0, // Don't maintain idle connections
        connectionTimeoutMillis: 10000, // Increased to 10 seconds
        idleTimeoutMillis: 10000, // Close idle connections after 10s
        allowExitOnIdle: true, // Allow process to exit
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
        min: 0,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 10000,
        allowExitOnIdle: true,
      });
    }

    // Handle connection errors gracefully
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
      // Reset pool on error to allow retry
      pool = null;
      db = null;
    });

    // Log successful connection
    pool.on('connect', () => {
      console.log('Database connection established');
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

