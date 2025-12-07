#!/usr/bin/env node

/**
 * Migration script to add team_id column to projects table
 * Run: node services/project-service/migrations/run-migration.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error('❌ DATABASE_URL environment variable is not set');
        process.exit(1);
    }

    console.log('🔗 Connecting to database...');
    const client = new Client({
        connectionString: databaseUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Read migration SQL file
        const migrationPath = path.join(__dirname, 'add_team_id_to_projects.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📝 Running migration...');
        console.log('SQL:', migrationSQL);

        await client.query(migrationSQL);

        console.log('✅ Migration completed successfully!');
        console.log('');
        console.log('Verifying changes...');

        // Verify the column was added
        const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'projects' AND column_name = 'team_id'
    `);

        if (result.rows.length > 0) {
            console.log('✅ Column team_id added successfully:');
            console.log(result.rows[0]);
        } else {
            console.log('⚠️  Column team_id not found - migration may have failed');
        }

        // Check indexes
        const indexResult = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'projects' AND indexname LIKE '%team%'
    `);

        console.log('');
        console.log('Indexes created:');
        indexResult.rows.forEach(row => {
            console.log('  ✅', row.indexname);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Details:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('');
        console.log('🔌 Database connection closed');
    }
}

runMigration();
