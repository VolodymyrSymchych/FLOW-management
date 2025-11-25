const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add_preferred_locale.sql'),
      'utf-8'
    );

    console.log('Running migration: add_preferred_locale.sql');
    await client.query(migrationSQL);
    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
