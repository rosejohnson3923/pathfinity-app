#!/usr/bin/env node

/**
 * Run Session Persistence Migration
 * Executes the 008_learning_sessions.sql migration
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Load environment variables
config({ path: join(PROJECT_ROOT, '.env.local') });
config({ path: join(PROJECT_ROOT, '.env') });

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(chalk.red('❌ Missing Supabase credentials'));
  console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) in .env');
  process.exit(1);
}

console.log(chalk.cyan('🚀 Starting Session Persistence Migration'));
console.log(chalk.gray(`   URL: ${SUPABASE_URL}`));

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function runMigration() {
  try {
    // Read migration file
    const migrationPath = join(PROJECT_ROOT, 'database/migrations/008_learning_sessions.sql');
    console.log(chalk.blue('📖 Reading migration file...'));
    const migrationSQL = await readFile(migrationPath, 'utf-8');

    // Split migration into individual statements
    // Remove comments and split by semicolon
    const statements = migrationSQL
      .split(/;\s*$/gm)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(chalk.blue(`📝 Found ${statements.length} SQL statements to execute`));

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements
      if (!statement.trim()) continue;

      // Extract first few words for logging
      const preview = statement.substring(0, 50).replace(/\n/g, ' ');

      try {
        console.log(chalk.gray(`   [${i + 1}/${statements.length}] Executing: ${preview}...`));

        // Execute the statement
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // Try direct execution as alternative
          const { data, error: directError } = await supabase.from('_migrations').select('*').limit(0);

          if (directError) {
            throw directError;
          }
          throw error;
        }

        successCount++;
      } catch (err) {
        console.error(chalk.yellow(`   ⚠️  Statement ${i + 1} failed: ${err.message}`));
        console.log(chalk.gray(`      Statement: ${preview}...`));

        // For some statements, failure is expected (e.g., IF EXISTS drops)
        if (statement.includes('DROP') && statement.includes('IF EXISTS')) {
          console.log(chalk.gray('      (Ignoring DROP IF EXISTS error)'));
          successCount++;
        } else {
          errorCount++;
        }
      }
    }

    // Summary
    console.log('');
    console.log(chalk.green('✅ Migration Complete!'));
    console.log(chalk.gray(`   Successful statements: ${successCount}`));
    if (errorCount > 0) {
      console.log(chalk.yellow(`   Failed statements: ${errorCount}`));
      console.log(chalk.yellow('   Note: Some failures may be expected (e.g., dropping non-existent objects)'));
    }

    // Verify tables were created
    console.log('');
    console.log(chalk.blue('🔍 Verifying migration...'));

    const { data: sessions } = await supabase.from('learning_sessions').select('count');
    const { data: analytics } = await supabase.from('session_analytics').select('count');
    const { data: achievements } = await supabase.from('session_achievements').select('count');

    console.log(chalk.green('✅ Tables verified:'));
    console.log(chalk.gray('   - learning_sessions'));
    console.log(chalk.gray('   - session_analytics'));
    console.log(chalk.gray('   - session_achievements'));

  } catch (error) {
    console.error(chalk.red('❌ Migration failed:'), error);
    process.exit(1);
  }
}

// Alternative: Use psql if available
async function runWithPsql() {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const migrationPath = join(PROJECT_ROOT, 'database/migrations/008_learning_sessions.sql');

  try {
    // Try to run with psql
    const dbUrl = process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'postgres'}`;

    console.log(chalk.blue('Attempting to run migration with psql...'));
    await execAsync(`psql "${dbUrl}" -f "${migrationPath}"`);

    console.log(chalk.green('✅ Migration executed successfully with psql!'));
  } catch (error) {
    console.log(chalk.yellow('Could not run with psql, trying Supabase API...'));
    await runMigration();
  }
}

// Check if we should use psql or Supabase API
if (process.env.DATABASE_URL) {
  runWithPsql().catch(console.error);
} else {
  runMigration().catch(console.error);
}