import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { config } from '../config';

function makePool(connectionString: string | undefined, fallback: typeof config.database, max = 5): Pool {
  if (connectionString) {
    return new Pool({
      connectionString,
      max,
      ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    });
  }
  return new Pool({
    host: fallback.host,
    port: fallback.port,
    database: fallback.name,
    user: fallback.user,
    password: fallback.password,
    max,
  });
}

// Primary pool for writes (max 5 to stay within Neon connection limits)
const pool = makePool(process.env.DATABASE_URL, config.database, 5);

// Read replica pool — falls back to primary if not configured
const readPool = makePool(
  process.env.DATABASE_READONLY_URL || process.env.DATABASE_URL,
  config.database,
  5,
);

export { pool };

export const db = drizzle(pool, { schema });

// Use readDb for SELECT-only queries to spread load to the replica
export const readDb = drizzle(readPool, { schema });

export * from './schema';

