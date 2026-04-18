/**
 * Script to clear account lockout for a specific email
 * Usage: npx tsx scripts/clear-account-lockout.ts vovaexim@gmail.com
 */

import { Redis as UpstashRedis } from '@upstash/redis';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const email = process.argv[2] || 'vovaexim@gmail.com';

async function clearLockout() {
  // Check for Upstash Redis (REST API)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!upstashUrl || !upstashToken) {
    console.error('❌ Upstash Redis credentials not found');
    console.error('Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local');
    process.exit(1);
  }

  try {
    // Connect to Upstash Redis via REST API
    const redis = new UpstashRedis({
      url: upstashUrl,
      token: upstashToken,
    });
    
    // The key format used by auth-service
    const key = `account-lockout:${email.toLowerCase()}`;
    
    console.log(`🔍 Checking lockout for: ${email}`);
    console.log(`🔑 Redis key: ${key}`);
    
    // Check if key exists
    const exists = await redis.exists(key);
    if (!exists) {
      console.log('✅ No lockout found - account is not locked');
      return;
    }
    
    // Get current value and TTL
    const attempts = await redis.get(key);
    const ttl = await redis.ttl(key);
    const minutes = Math.ceil(ttl / 60);
    
    console.log(`⚠️  Found lockout:`);
    console.log(`   Attempts: ${attempts}`);
    console.log(`   Time remaining: ${minutes} minutes (${ttl} seconds)`);
    
    // Delete the key to clear lockout
    await redis.del(key);
    
    console.log('✅ Lockout cleared successfully!');
  } catch (error: any) {
    console.error('❌ Error clearing lockout:', error.message);
    console.error(error);
    process.exit(1);
  }
}

clearLockout();
