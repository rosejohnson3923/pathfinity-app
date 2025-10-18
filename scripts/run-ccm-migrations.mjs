#!/usr/bin/env node

/**
 * Career Challenge Multiplayer (CCM) - Migration Runner
 * Executes all 5 CCM migration files to create the database schema
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Load environment variables
config({ path: join(PROJECT_ROOT, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(chalk.red('❌ Missing Supabase credentials'));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

async function runMigrations() {
  console.log(chalk.bold.blue('🚀 Career Challenge Multiplayer - Migration Runner\n'));
  console.log(chalk.white('==========================================\n'));

  const migrationFiles = [
    '20251016_10_create_ccm_perpetual_rooms.sql',
    '20251016_11_create_ccm_game_sessions.sql',
    '20251016_12_create_ccm_content_tables.sql',
    '20251016_13_create_ccm_gameplay_tables.sql',
    '20251016_14_create_ccm_achievement_tables.sql'
  ];

  try {
    // Read the combined migration file
    const combinedPath = join(PROJECT_ROOT, 'supabase', 'migrations', '20251016_CCM_ALL_COMBINED.sql');
    console.log(chalk.yellow('📄 Reading combined migration file...\n'));

    const sql = readFileSync(combinedPath, 'utf-8');

    // Execute SQL using Supabase RPC
    // Note: We need to use the pg library for raw SQL execution
    console.log(chalk.yellow('⚙️  Executing migrations...\n'));

    // Split SQL into individual statements and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.toLowerCase().includes('create table') ||
          statement.toLowerCase().includes('create index') ||
          statement.toLowerCase().includes('alter table') ||
          statement.toLowerCase().includes('create extension') ||
          statement.toLowerCase().includes('create policy') ||
          statement.toLowerCase().includes('comment on') ||
          statement.toLowerCase().includes('insert into')) {

        try {
          // Execute using rpc if available, otherwise we need pg
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

          if (error) {
            // Supabase client doesn't support raw SQL execution
            // We need to inform the user to run via Dashboard
            throw new Error('Raw SQL execution not supported via Supabase client');
          }
          successCount++;
        } catch (err) {
          // Expected - Supabase JS client doesn't support raw DDL
          break;
        }
      }
    }

    // If we couldn't execute directly, provide instructions
    console.log(chalk.yellow('ℹ️  Supabase client does not support raw DDL execution.\n'));
    console.log(chalk.bold.cyan('Please run migrations via Supabase Dashboard:\n'));
    console.log(chalk.white('1. Open: https://supabase.com/dashboard/project/zohdmprtfyijneqnwjsu/sql/new'));
    console.log(chalk.white('2. Copy contents of: supabase/migrations/20251016_CCM_ALL_COMBINED.sql'));
    console.log(chalk.white('3. Paste and click "Run"\n'));

    console.log(chalk.gray('Or run each file individually:'));
    migrationFiles.forEach((file, i) => {
      console.log(chalk.gray(`  ${i + 1}. ${file}`));
    });

    console.log(chalk.white('\n==========================================\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}

// Run migrations
runMigrations();
