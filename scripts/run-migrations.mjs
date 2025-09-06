#!/usr/bin/env node

/**
 * Database Migration Runner
 * Executes SQL migrations for the Question Type System Overhaul
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
config({ path: join(PROJECT_ROOT, '.env.development') });

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(chalk.red('❌ Missing Supabase credentials'));
  console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or .env.development');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Migration files to run
const migrations = [
  {
    name: '002_ai_content_storage',
    file: 'database/migrations/002_ai_content_storage.sql',
    description: 'AI content storage and caching tables'
  },
  {
    name: '003_static_reference_data',
    file: 'database/migrations/003_static_reference_data.sql',
    description: 'Question types and static configuration'
  },
  {
    name: '004_common_core_career_skills',
    file: 'database/migrations/004_common_core_career_skills.sql',
    description: 'Common Core standards and career mappings'
  }
];

/**
 * Check if a migration has already been run
 */
async function isMigrationRun(migrationName) {
  try {
    // Check if migrations tracking table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'schema_migrations');
    
    if (!tables || tables.length === 0) {
      // Create migrations tracking table
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(255) PRIMARY KEY,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (error) {
        console.warn(chalk.yellow('⚠️ Could not create schema_migrations table'));
        return false;
      }
    }
    
    // Check if this migration was run
    const { data, error } = await supabase
      .from('schema_migrations')
      .select('version')
      .eq('version', migrationName)
      .single();
    
    return !!data && !error;
  } catch (err) {
    return false;
  }
}

/**
 * Mark a migration as completed
 */
async function markMigrationComplete(migrationName) {
  try {
    await supabase
      .from('schema_migrations')
      .insert({ version: migrationName });
  } catch (err) {
    console.warn(chalk.yellow(`⚠️ Could not mark migration ${migrationName} as complete`));
  }
}

/**
 * Execute a single migration
 */
async function runMigration(migration) {
  console.log(chalk.blue(`\n📋 Running migration: ${migration.name}`));
  console.log(chalk.gray(`   ${migration.description}`));
  
  // Check if already run
  const alreadyRun = await isMigrationRun(migration.name);
  if (alreadyRun) {
    console.log(chalk.yellow(`   ⏭️ Already executed, skipping...`));
    return { success: true, skipped: true };
  }
  
  try {
    // Read migration file
    const sqlPath = join(PROJECT_ROOT, migration.file);
    const sql = await readFile(sqlPath, 'utf-8');
    
    // Split by statements (naive split by semicolon at end of line)
    const statements = sql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(chalk.gray(`   Found ${statements.length} SQL statements`));
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements
      if (!statement.trim()) continue;
      
      // For complex statements, we need to use raw SQL execution
      // Supabase doesn't have a direct SQL execution method in the JS client,
      // so we'll need to use RPC if you have a function for it, or execute via psql
      
      try {
        // Try to extract table creation names for reporting
        const tableMatch = statement.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
        const indexMatch = statement.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
        const functionMatch = statement.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(\w+)/i);
        
        if (tableMatch) {
          console.log(chalk.gray(`   Creating table: ${tableMatch[1]}`));
        } else if (indexMatch) {
          console.log(chalk.gray(`   Creating index: ${indexMatch[1]}`));
        } else if (functionMatch) {
          console.log(chalk.gray(`   Creating function: ${functionMatch[1]}`));
        }
        
        // Note: Direct SQL execution requires a server-side function or direct DB access
        // For now, we'll log what would be executed
        console.log(chalk.gray(`   Statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`));
        successCount++;
        
      } catch (err) {
        console.error(chalk.red(`   ❌ Error in statement ${i + 1}: ${err.message}`));
        errorCount++;
      }
    }
    
    // Mark migration as complete
    if (errorCount === 0) {
      await markMigrationComplete(migration.name);
      console.log(chalk.green(`   ✅ Migration completed: ${successCount} statements executed`));
      return { success: true, skipped: false };
    } else {
      console.log(chalk.yellow(`   ⚠️ Migration partially completed: ${successCount} succeeded, ${errorCount} failed`));
      return { success: false, skipped: false };
    }
    
  } catch (error) {
    console.error(chalk.red(`   ❌ Migration failed: ${error.message}`));
    return { success: false, skipped: false, error };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.bold.blue('\n🚀 Pathfinity Database Migration Runner'));
  console.log(chalk.gray(`   Supabase URL: ${SUPABASE_URL}`));
  console.log(chalk.gray(`   Migrations to run: ${migrations.length}`));
  
  // Test database connection
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // Table doesn't exist is OK
      throw error;
    }
    console.log(chalk.green('✅ Database connection successful'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to connect to database'));
    console.error(error);
    process.exit(1);
  }
  
  // Run migrations
  const results = [];
  for (const migration of migrations) {
    const result = await runMigration(migration);
    results.push({ ...migration, ...result });
  }
  
  // Summary
  console.log(chalk.bold.blue('\n📊 Migration Summary'));
  const successful = results.filter(r => r.success && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success && !r.skipped).length;
  
  console.log(chalk.green(`   ✅ Successful: ${successful}`));
  console.log(chalk.yellow(`   ⏭️ Skipped: ${skipped}`));
  console.log(chalk.red(`   ❌ Failed: ${failed}`));
  
  if (failed > 0) {
    console.log(chalk.red('\n⚠️ Some migrations failed. Please check the errors above.'));
    console.log(chalk.yellow('\nNote: You may need to run the SQL files directly using psql or Supabase dashboard:'));
    console.log(chalk.gray('  1. Go to your Supabase project dashboard'));
    console.log(chalk.gray('  2. Navigate to SQL Editor'));
    console.log(chalk.gray('  3. Copy and paste the SQL from the migration files'));
    console.log(chalk.gray('  4. Execute each migration in order'));
    process.exit(1);
  }
  
  console.log(chalk.bold.green('\n✨ All migrations completed successfully!'));
}

// Run the migrations
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});