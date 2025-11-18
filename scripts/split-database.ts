#!/usr/bin/env tsx

/**
 * Script to split monolithic database into separate databases for microservices
 * 
 * Usage:
 *   tsx scripts/split-database.ts
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

// Source database (monolithic)
const sourceDb: DatabaseConfig = {
  host: process.env.SOURCE_DB_HOST || 'localhost',
  port: parseInt(process.env.SOURCE_DB_PORT || '5432', 10),
  database: process.env.SOURCE_DB_NAME || 'neondb',
  user: process.env.SOURCE_DB_USER || 'postgres',
  password: process.env.SOURCE_DB_PASSWORD || '',
};

// Target databases for each service
const targetDbs: Record<string, DatabaseConfig> = {
  auth: {
    host: process.env.AUTH_DB_HOST || 'localhost',
    port: parseInt(process.env.AUTH_DB_PORT || '5432', 10),
    database: process.env.AUTH_DB_NAME || 'auth_db',
    user: process.env.AUTH_DB_USER || 'auth_user',
    password: process.env.AUTH_DB_PASSWORD || 'auth_password',
  },
  user: {
    host: process.env.USER_DB_HOST || 'localhost',
    port: parseInt(process.env.USER_DB_PORT || '5433', 10),
    database: process.env.USER_DB_NAME || 'user_db',
    user: process.env.USER_DB_USER || 'user_user',
    password: process.env.USER_DB_PASSWORD || 'user_password',
  },
  // Add more services as needed
};

// Table mappings: which tables belong to which service
const tableMappings: Record<string, string[]> = {
  auth: [
    'users',
    'email_verifications',
  ],
  user: [
    'users',
    'friendships',
  ],
  // Add more mappings as services are created
};

async function createConnection(config: DatabaseConfig): Promise<Pool> {
  return new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
  });
}

async function exportTable(
  sourcePool: Pool,
  tableName: string
): Promise<any[]> {
  console.log(`Exporting table: ${tableName}`);
  const result = await sourcePool.query(`SELECT * FROM ${tableName}`);
  return result.rows;
}

async function importTable(
  targetPool: Pool,
  tableName: string,
  data: any[]
): Promise<void> {
  if (data.length === 0) {
    console.log(`  No data to import for ${tableName}`);
    return;
  }

  console.log(`  Importing ${data.length} rows into ${tableName}`);

  // Get column names from first row
  const columns = Object.keys(data[0]);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const columnNames = columns.join(', ');

  // Clear existing data (optional - comment out if you want to append)
  await targetPool.query(`TRUNCATE TABLE ${tableName} CASCADE`);

  // Insert data in batches
  const batchSize = 1000;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    for (const row of batch) {
      const values = columns.map(col => row[col]);
      await targetPool.query(
        `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
        values
      );
    }
  }

  console.log(`  ✓ Imported ${data.length} rows`);
}

async function splitDatabase(): Promise<void> {
  console.log('Starting database split...\n');

  // Connect to source database
  const sourcePool = await createConnection(sourceDb);
  console.log(`Connected to source database: ${sourceDb.database}\n`);

  try {
    // Process each service
    for (const [serviceName, tables] of Object.entries(tableMappings)) {
      console.log(`\n=== Processing ${serviceName} service ===`);

      const targetConfig = targetDbs[serviceName];
      if (!targetConfig) {
        console.log(`  ⚠ No target database config for ${serviceName}, skipping`);
        continue;
      }

      const targetPool = await createConnection(targetConfig);
      console.log(`Connected to target database: ${targetConfig.database}`);

      try {
        // Export and import each table
        for (const tableName of tables) {
          try {
            const data = await exportTable(sourcePool, tableName);
            await importTable(targetPool, tableName, data);
          } catch (error) {
            console.error(`  ✗ Error processing table ${tableName}:`, error);
          }
        }
      } finally {
        await targetPool.end();
      }
    }

    console.log('\n✓ Database split completed!');
  } finally {
    await sourcePool.end();
  }
}

// Run the script
if (require.main === module) {
  splitDatabase().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { splitDatabase };

