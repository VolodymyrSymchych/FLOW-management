import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@/shared/schema';
import type { NeonDatabase } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

let _db: NeonDatabase<typeof schema> | null = null;
let _pool: Pool | null = null;

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL must be set. Did you forget to provision a database?'
    );
  }

  if (!_db) {
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _db = drizzle(_pool, { schema });
  }

  return _db;
}

// Export a getter function that initializes on first use
export const db = new Proxy({} as NeonDatabase<typeof schema>, {
  get(_target, prop) {
    return getDb()[prop as keyof typeof _db];
  },
});
