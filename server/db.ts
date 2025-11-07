import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

let _db: NeonHttpDatabase<typeof schema> | null = null;

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL must be set. Did you forget to provision a database?'
    );
  }

  if (!_db) {
    const sql = neon(process.env.DATABASE_URL);
    _db = drizzle({ client: sql, schema });
  }

  return _db;
}

// Export a getter function that initializes on first use
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    return getDb()[prop as keyof typeof _db];
  },
});
