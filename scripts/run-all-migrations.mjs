#!/usr/bin/env node

/**
 * Complete Database Migration Runner for Question Type System
 * Runs all three migrations in sequence
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Load environment variables
config({ path: join(PROJECT_ROOT, '.env.local') });
config({ path: join(PROJECT_ROOT, '.env.development') });

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL; // Direct PostgreSQL connection if available

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(chalk.red('❌ Missing Supabase credentials'));
  console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Migration files
const migrations = [
  {
    name: '002_ai_content_storage',
    file: 'database/migrations/002_ai_content_storage.sql',
    description: 'AI content storage and caching tables',
    tables: ['ai_generated_content', 'content_cache', 'question_types', 'question_validation_log', 'test_scenarios']
  },
  {
    name: '003_static_reference_data', 
    file: 'database/migrations/003_static_reference_data.sql',
    description: 'Question types and static configuration',
    tables: ['question_type_definitions', 'grade_configurations', 'subject_configurations', 'skills_master_v2', 'detection_rules']
  },
  {
    name: '004_common_core_career_skills',
    file: 'database/migrations/004_common_core_career_skills.sql',
    description: 'Common Core standards and career mappings',
    tables: ['common_core_standards', 'career_paths', 'career_standard_mapping', 'student_career_interests', 'student_common_core_progress']
  }
];

/**
 * Execute SQL using psql if DATABASE_URL is available
 */
async function executeSQLWithPsql(sqlFile) {
  if (!DATABASE_URL) {
    return null;
  }
  
  try {
    const { stdout, stderr } = await execAsync(`psql "${DATABASE_URL}" -f "${sqlFile}" -v ON_ERROR_STOP=1`);
    if (stderr && !stderr.includes('NOTICE')) {
      console.warn(chalk.yellow(`Warnings: ${stderr}`));
    }
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Execute SQL using Supabase CLI
 */
async function executeSQLWithSupabaseCLI(sqlFile) {
  try {
    // Check if Supabase CLI is installed
    await execAsync('supabase --version');
    
    const { stdout, stderr } = await execAsync(`supabase db push "${sqlFile}"`);
    if (stderr && !stderr.includes('NOTICE')) {
      console.warn(chalk.yellow(`Warnings: ${stderr}`));
    }
    return { success: true, output: stdout };
  } catch (error) {
    if (error.message.includes('command not found')) {
      return null; // CLI not installed
    }
    return { success: false, error: error.message };
  }
}

/**
 * Parse SQL file and execute statements via Supabase client
 */
async function executeSQLViaClient(sqlContent) {
  // This is a fallback method - less reliable but works with just the JS client
  const statements = sqlContent
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  const results = [];
  for (const statement of statements) {
    // Skip certain statements that can't be run via client
    if (statement.toUpperCase().startsWith('CREATE TABLE') ||
        statement.toUpperCase().startsWith('CREATE INDEX') ||
        statement.toUpperCase().startsWith('CREATE FUNCTION') ||
        statement.toUpperCase().startsWith('CREATE VIEW') ||
        statement.toUpperCase().startsWith('DROP')) {
      results.push({ statement: statement.substring(0, 50), status: 'skipped', reason: 'DDL statement' });
      continue;
    }
    
    // Try to execute INSERT/UPDATE/DELETE statements
    if (statement.toUpperCase().startsWith('INSERT') ||
        statement.toUpperCase().startsWith('UPDATE') ||
        statement.toUpperCase().startsWith('DELETE')) {
      try {
        // This is limited - Supabase JS client doesn't support raw SQL
        results.push({ statement: statement.substring(0, 50), status: 'skipped', reason: 'Requires direct SQL' });
      } catch (error) {
        results.push({ statement: statement.substring(0, 50), status: 'error', error: error.message });
      }
    }
  }
  
  return results;
}

/**
 * Check if tables exist
 */
async function checkTablesExist(tableNames) {
  const results = {};
  for (const tableName of tableNames) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      results[tableName] = !error || error.code !== '42P01'; // 42P01 = table does not exist
    } catch (error) {
      results[tableName] = false;
    }
  }
  return results;
}

/**
 * Run a single migration
 */
async function runMigration(migration) {
  console.log(chalk.blue(`\n📋 Running migration: ${migration.name}`));
  console.log(chalk.gray(`   ${migration.description}`));
  
  // Check if tables already exist
  const tableStatus = await checkTablesExist(migration.tables);
  const existingTables = Object.entries(tableStatus).filter(([_, exists]) => exists);
  
  if (existingTables.length === migration.tables.length) {
    console.log(chalk.yellow(`   ⏭️ All tables already exist, skipping migration`));
    return { success: true, skipped: true };
  } else if (existingTables.length > 0) {
    console.log(chalk.yellow(`   ⚠️ Some tables already exist: ${existingTables.map(([t]) => t).join(', ')}`));
  }
  
  const sqlPath = join(PROJECT_ROOT, migration.file);
  const sqlContent = await readFile(sqlPath, 'utf-8');
  
  // Try different execution methods
  console.log(chalk.gray('   Attempting to execute SQL...'));
  
  // Method 1: Try psql if DATABASE_URL is available
  if (DATABASE_URL) {
    console.log(chalk.gray('   Using psql...'));
    const result = await executeSQLWithPsql(sqlPath);
    if (result) {
      if (result.success) {
        console.log(chalk.green('   ✅ Migration executed successfully via psql'));
        return { success: true, method: 'psql' };
      } else {
        console.error(chalk.red(`   ❌ psql error: ${result.error}`));
      }
    }
  }
  
  // Method 2: Try Supabase CLI
  console.log(chalk.gray('   Checking for Supabase CLI...'));
  const cliResult = await executeSQLWithSupabaseCLI(sqlPath);
  if (cliResult !== null) {
    if (cliResult.success) {
      console.log(chalk.green('   ✅ Migration executed successfully via Supabase CLI'));
      return { success: true, method: 'supabase-cli' };
    } else {
      console.error(chalk.red(`   ❌ Supabase CLI error: ${cliResult.error}`));
    }
  }
  
  // Method 3: Manual instructions
  console.log(chalk.yellow('\n   ⚠️ Automated execution not available'));
  console.log(chalk.cyan('   Please run this migration manually:'));
  console.log(chalk.gray('   1. Go to your Supabase dashboard'));
  console.log(chalk.gray('   2. Navigate to SQL Editor'));
  console.log(chalk.gray(`   3. Copy contents from: ${migration.file}`));
  console.log(chalk.gray('   4. Paste and run in SQL Editor'));
  
  return { success: false, manual: true };
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.bold.blue('\n🚀 Pathfinity Database Migration Runner'));
  console.log(chalk.gray(`   Supabase URL: ${SUPABASE_URL}`));
  console.log(chalk.gray(`   Migrations to run: ${migrations.length}`));
  
  // Test database connection
  console.log('\n' + chalk.blue('Testing database connection...'));
  try {
    // Try to query a system table
    const { error } = await supabase.from('users').select('*').limit(1);
    if (!error || error.code === '42P01') { // Table doesn't exist is OK
      console.log(chalk.green('✅ Database connection successful'));
    }
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
  const manual = results.filter(r => r.manual).length;
  const failed = results.filter(r => !r.success && !r.skipped && !r.manual).length;
  
  console.log(chalk.green(`   ✅ Successful: ${successful}`));
  console.log(chalk.yellow(`   ⏭️ Skipped: ${skipped}`));
  console.log(chalk.cyan(`   📝 Manual required: ${manual}`));
  if (failed > 0) {
    console.log(chalk.red(`   ❌ Failed: ${failed}`));
  }
  
  // Verification
  console.log(chalk.bold.blue('\n🔍 Verifying migrations...'));
  
  const allTables = migrations.flatMap(m => m.tables);
  const tableStatus = await checkTablesExist(allTables);
  
  const created = Object.entries(tableStatus).filter(([_, exists]) => exists);
  const missing = Object.entries(tableStatus).filter(([_, exists]) => !exists);
  
  console.log(chalk.green(`   ✅ Tables created: ${created.length}/${allTables.length}`));
  
  if (missing.length > 0) {
    console.log(chalk.yellow(`   ⚠️ Missing tables: ${missing.map(([t]) => t).join(', ')}`));
    
    if (manual > 0) {
      console.log(chalk.bold.cyan('\n📋 Manual Action Required:'));
      console.log(chalk.cyan('Please run the migrations manually in your Supabase dashboard'));
      console.log(chalk.cyan('Instructions are in: database/RUN_MIGRATIONS_INSTRUCTIONS.md'));
    }
  } else {
    console.log(chalk.bold.green('\n✨ All migrations completed successfully!'));
    console.log(chalk.green('All required tables have been created.'));
    
    // Next steps
    console.log(chalk.bold.blue('\n📝 Next Steps:'));
    console.log(chalk.gray('1. Import Common Core standards: npm run import:common-core'));
    console.log(chalk.gray('2. Import Grade 10 skills (when available)'));
    console.log(chalk.gray('3. Continue with Phase 3 of the implementation plan'));
  }
}

// Run migrations
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});