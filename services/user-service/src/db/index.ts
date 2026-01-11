import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { config } from '../config';
import { logger } from '@project-scope-analyzer/shared';

// Lazy initialization for serverless environments
let poolInstance: Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

function getPool(): Pool {
  if (!poolInstance) {
    // Optimize for serverless: smaller pool, connection timeouts
    const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    const poolConfig = {
      max: isServerless ? 2 : config.database.maxConnections, // Smaller pool for serverless
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 10000, // Timeout after 10s if can't connect
      statement_timeout: 30000, // Query timeout 30s
    };

    if (process.env.DATABASE_URL) {
      // Use connection string (Neon, etc.)
      poolInstance = new Pool({
        connectionString: process.env.DATABASE_URL,
        ...poolConfig,
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
        ...poolConfig,
      });
    }

    // Handle pool errors gracefully
    poolInstance.on('error', (err) => {
      logger.error('Unexpected database pool error', { error: err });
    });
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

