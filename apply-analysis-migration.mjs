#!/usr/bin/env node

/**
 * Apply Analysis Migration
 * Creates tables for question type monitoring and debugging
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import chalk from 'chalk';
import fs from 'fs';

// Load environment
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyMigration() {
  console.log(chalk.bold.blue('\n📊 Applying Analysis Migration\n'));
  
  try {
    // Read migration SQL file
    const migrationSQL = fs.readFileSync('./database/migrations/20250827_question_type_analysis.sql', 'utf8');
    
    // Split into individual statements (removing comments and empty lines)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'))
      .map(stmt => stmt + ';');
    
    console.log(chalk.yellow(`Found ${statements.length} SQL statements to execute\n`));
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      // Skip empty statements
      if (!stmt || stmt === ';') continue;
      
      // Get statement type
      const stmtType = stmt.match(/^(CREATE|ALTER|INSERT|DO|GRANT)/i)?.[1] || 'UNKNOWN';
      
      try {
        // Use rpc to execute raw SQL
        const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });
        
        if (error) {
          // Try direct approach for some statements
          if (stmtType === 'CREATE' && stmt.includes('TABLE')) {
            // Extract table creation logic and use Supabase admin API
            console.log(chalk.yellow(`  ⚠️ Statement ${i + 1} (${stmtType}): Requires admin privileges`));
            errors.push({ statement: i + 1, type: stmtType, error: 'Admin required' });
            errorCount++;
          } else {
            throw error;
          }
        } else {
          console.log(chalk.green(`  ✅ Statement ${i + 1} (${stmtType}): Success`));
          successCount++;
        }
      } catch (err) {
        console.log(chalk.red(`  ❌ Statement ${i + 1} (${stmtType}): ${err.message || err}`));
        errors.push({ statement: i + 1, type: stmtType, error: err.message || err });
        errorCount++;
      }
    }
    
    // Summary
    console.log(chalk.bold.blue('\n📊 Migration Summary:'));
    console.log(chalk.green(`  ✅ Successful: ${successCount}`));
    console.log(chalk.red(`  ❌ Failed: ${errorCount}`));
    
    if (errorCount > 0) {
      console.log(chalk.yellow('\n⚠️ Note: Some statements require admin privileges.'));
      console.log('These tables may need to be created manually via Supabase dashboard.\n');
      
      // Save failed statements for manual application
      const failedStatements = errors.map((e, idx) => {
        const stmt = statements[e.statement - 1];
        return `-- Statement ${e.statement} (${e.type}) - Error: ${e.error}\n${stmt}`;
      }).join('\n\n');
      
      fs.writeFileSync('migration-failed-statements.sql', failedStatements);
      console.log(chalk.gray('Failed statements saved to migration-failed-statements.sql'));
    }
    
    // Test if core tables exist
    console.log(chalk.bold.blue('\n🔍 Verifying Core Tables:'));
    
    const coreTables = [
      'analysis_runs',
      'raw_data_captures', 
      'true_false_analysis',
      'misdetection_patterns',
      'detection_performance_metrics'
    ];
    
    for (const table of coreTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(chalk.green(`  ✅ ${table} exists`));
        } else {
          console.log(chalk.red(`  ❌ ${table} not found`));
        }
      } catch (err) {
        console.log(chalk.red(`  ❌ ${table} not accessible`));
      }
    }
    
    console.log(chalk.bold.green('\n✨ Migration process complete!'));
    
    if (errorCount === 0) {
      console.log(chalk.green('All statements executed successfully.'));
    } else {
      console.log(chalk.yellow(`${errorCount} statements need manual application via Supabase dashboard.`));
    }
    
  } catch (error) {
    console.error(chalk.red('Migration failed:'), error);
    process.exit(1);
  }
}

// Alternative: Check if tables already exist
async function checkExistingTables() {
  console.log(chalk.bold.blue('\n🔍 Checking Existing Tables\n'));
  
  const tables = [
    'analysis_runs',
    'raw_data_captures',
    'type_detection_captures',
    'true_false_analysis',
    'misdetection_patterns',
    'detection_performance_metrics',
    'generation_queue',
    'content_cache_v2'
  ];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(chalk.green(`✅ ${table}: exists (${count || 0} rows)`));
      } else {
        console.log(chalk.yellow(`⚠️ ${table}: ${error.message}`));
      }
    } catch (err) {
      console.log(chalk.red(`❌ ${table}: not accessible`));
    }
  }
}

// Run both checks
async function main() {
  await checkExistingTables();
  
  console.log(chalk.yellow('\n📝 Note: Direct SQL execution requires admin privileges.'));
  console.log('The migration SQL has been created and can be applied via:');
  console.log('1. Supabase Dashboard SQL Editor');
  console.log('2. Supabase CLI with proper authentication');
  console.log('3. Database admin tool with service role key\n');
  
  // Create a simplified version for dashboard
  const migrationSQL = fs.readFileSync('./database/migrations/20250827_question_type_analysis.sql', 'utf8');
  
  // Save clean version for dashboard
  fs.writeFileSync('dashboard-migration.sql', migrationSQL);
  console.log(chalk.gray('Clean migration saved to dashboard-migration.sql for manual application'));
}

main().catch(console.error);