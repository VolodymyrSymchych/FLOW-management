import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { config } from '../config';

// Lazy initialization for serverless environments
let poolInstance: Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

function getPool(): Pool {
  if (!poolInstance) {
    if (process.env.DATABASE_URL) {
      // Use connection string (Neon, etc.)
      poolInstance = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: config.database.maxConnections,
        ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
      });
    } else {
      // Use individual config
      poolInstance = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.user,
        password: config.database.password,
        max: config.database.maxConnections,
      });
    }
  }
  return poolInstance;
}

// Export pool as lazy getter to avoid immediate connection
export { getPool as pool };

// Lazy db initialization
function getDbInstance(): NodePgDatabase<typeof schema> {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(target, prop) {
    return (getDbInstance() as unknown as Record<string, unknown>)[prop as string];
  },
});


export * from './schema';

