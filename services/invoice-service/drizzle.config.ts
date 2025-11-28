import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

// Support both DATABASE_URL (for Neon/serverless) and individual DB config
let dbCredentials: any;

if (process.env.DATABASE_URL) {
  // Parse connection string
  const url = new URL(process.env.DATABASE_URL);
  dbCredentials = {
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading '/'
    ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  };
} else {
  dbCredentials = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'invoice_user',
    password: process.env.DB_PASSWORD || 'invoice_password',
    database: process.env.DB_NAME || 'invoice_db',
  };
}

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials,
} satisfies Config;
