/**
 * Script to verify all existing users in the database
 * Sets emailVerified to true for all users
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { config } from 'dotenv';

// Try multiple env file locations
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
dotenv.config({ path: 'dashboard/.env.local' });
dotenv.config({ path: 'services/auth-service/.env' });

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

async function verifyAllUsers() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    console.log('Connecting to database...');
    
    // Check current state
    const checkResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE email_verified = true) as verified,
        COUNT(*) FILTER (WHERE email_verified = false) as unverified
      FROM users
    `);
    
    console.log('Current state:');
    console.log(`  Total users: ${checkResult.rows[0].total}`);
    console.log(`  Verified: ${checkResult.rows[0].verified}`);
    console.log(`  Unverified: ${checkResult.rows[0].unverified}`);
    
    // Update all users to verified
    const updateResult = await pool.query(`
      UPDATE users 
      SET email_verified = true, updated_at = NOW()
      WHERE email_verified = false
      RETURNING id, email, username, email_verified
    `);
    
    console.log(`\n✅ Updated ${updateResult.rows.length} users to verified`);
    
    if (updateResult.rows.length > 0) {
      console.log('\nUpdated users:');
      updateResult.rows.forEach((user) => {
        console.log(`  - ${user.email} (${user.username})`);
      });
    }
    
    // Verify final state
    const finalResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE email_verified = true) as verified,
        COUNT(*) FILTER (WHERE email_verified = false) as unverified
      FROM users
    `);
    
    console.log('\nFinal state:');
    console.log(`  Total users: ${finalResult.rows[0].total}`);
    console.log(`  Verified: ${finalResult.rows[0].verified}`);
    console.log(`  Unverified: ${finalResult.rows[0].unverified}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyAllUsers();

