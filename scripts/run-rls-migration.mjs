#!/usr/bin/env node

/**
 * Run Career Bingo RLS Policies Migration (047)
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
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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

async function main() {
  console.log(chalk.bold.blue('\n🚀 Running Career Bingo RLS Policies Migration'));
  console.log(chalk.gray(`   Supabase URL: ${SUPABASE_URL}`));

  // Read migration file
  const sqlPath = join(PROJECT_ROOT, 'database/migrations/047_add_career_bingo_rls_policies.sql');
  console.log(chalk.blue('\n📋 Reading migration file...'));
  const sqlContent = await readFile(sqlPath, 'utf-8');

  // Split into individual statements
  const statements = sqlContent
    .split('-- ================================================================')
    .filter(section => {
      const trimmed = section.trim();
      return trimmed && !trimmed.startsWith('VERIFICATION') && !trimmed.startsWith('MIGRATION COMPLETE');
    });

  // Extract policy creation statements
  const policyStatements = [];
  for (const section of statements) {
    const lines = section.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('--');
    });

    const statement = lines.join(' ').trim();
    if (statement && statement.toUpperCase().includes('CREATE POLICY')) {
      policyStatements.push(statement);
    }
  }

  console.log(chalk.gray(`   Found ${policyStatements.length} policy statements`));

  // Execute each policy
  let successCount = 0;
  let errorCount = 0;

  for (const statement of policyStatements) {
    // Extract policy name for display
    const match = statement.match(/CREATE POLICY "([^"]+)"/);
    const policyName = match ? match[1] : 'unknown';

    console.log(chalk.blue(`\n   Creating policy: ${policyName}`));

    try {
      // Use rpc to execute raw SQL
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // If exec_sql doesn't exist, show manual instructions
        if (error.message.includes('function') || error.message.includes('not found')) {
          console.log(chalk.yellow('   ⚠️ Cannot execute directly via Supabase client'));
          console.log(chalk.cyan('   Please run this migration manually in Supabase SQL Editor:'));
          console.log(chalk.gray(`   ${sqlPath}`));
          process.exit(1);
        } else {
          console.error(chalk.red(`   ❌ Error: ${error.message}`));
          errorCount++;
        }
      } else {
        console.log(chalk.green(`   ✅ Created policy: ${policyName}`));
        successCount++;
      }
    } catch (err) {
      console.error(chalk.red(`   ❌ Exception: ${err.message}`));
      errorCount++;
    }
  }

  // Summary
  console.log(chalk.bold.blue('\n📊 Migration Summary'));
  console.log(chalk.green(`   ✅ Successful: ${successCount}`));
  if (errorCount > 0) {
    console.log(chalk.red(`   ❌ Failed: ${errorCount}`));
    console.log(chalk.yellow('\n   Please run the migration manually in Supabase SQL Editor'));
    console.log(chalk.gray(`   File: ${sqlPath}`));
  } else {
    console.log(chalk.bold.green('\n✨ Migration completed successfully!'));
    console.log(chalk.green('RLS policies have been added to Career Bingo tables.'));
    console.log(chalk.green('UPDATE operations should now persist to the database!'));
  }
}

main().catch(error => {
  console.error(chalk.red('\n❌ Fatal error:'), error);
  console.log(chalk.yellow('\nPlease run the migration manually in Supabase SQL Editor:'));
  console.log(chalk.gray('   database/migrations/047_add_career_bingo_rls_policies.sql'));
  process.exit(1);
});
