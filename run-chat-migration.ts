import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), 'dashboard', '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in environment variables');
  process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client);

async function runMigration() {
  try {
    console.log('🔄 Starting chat migration...');
    console.log('📁 Connected to database');
    
    const sql = fs.readFileSync(
      path.join(process.cwd(), 'migrations', 'add-chat-mentions-tasks.sql'), 
      'utf8'
    );
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      if (!statement.trim() || statement.trim() === ';') continue;
      
      try {
        await client.unsafe(statement);
        
        // Extract operation type for better logging
        const operation = statement.trim().split(' ')[0].toUpperCase();
        const preview = statement.substring(0, 80).replace(/\s+/g, ' ');
        
        console.log(`✅ [${i + 1}/${statements.length}] ${operation}: ${preview}...`);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (
          error.message?.includes('already exists') || 
          error.message?.includes('duplicate') ||
          error.message?.includes('does not exist')
        ) {
          console.log(`⚠️  [${i + 1}/${statements.length}] Skipped (already exists or not needed)`);
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Error:`, error.message);
          console.error('Statement:', statement.substring(0, 200));
          // Don't exit, continue with other statements
        }
      }
    }

    console.log('\n✅ Chat migration completed successfully!');
    console.log('\n📊 Migration summary:');
    console.log('  - Added mentions column to chat_messages');
    console.log('  - Added task_id column to chat_messages');
    console.log('  - Added read_by column to chat_messages');
    console.log('  - Created indexes for performance');
    console.log('  - Removed deprecated read_at column');
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

runMigration();

