#!/usr/bin/env node

// ================================================================
// STUDENT PROFILES MIGRATION RUNNER
// Execute the student profiles database migration
// ================================================================

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Load environment variables
config({ path: join(PROJECT_ROOT, '.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(chalk.red('❌ Missing Supabase environment variables'));
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ================================================================
// MIGRATION RUNNER
// ================================================================

async function runMigration() {
  try {
    console.log(chalk.blue('🚀 Running Student Profiles Migration...'));
    
    // Read the migration file
    const migrationPath = join(PROJECT_ROOT, 'supabase', 'migrations', '20250707213000_student_profiles_schema.sql');
    console.log(chalk.yellow('📄 Reading migration file...'));
    
    const migrationSQL = await readFile(migrationPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(chalk.yellow(`📊 Found ${statements.length} SQL statements to execute`));

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length === 0) continue;
      
      try {
        console.log(chalk.gray(`Executing statement ${i + 1}/${statements.length}...`));
        
        // Try different RPC methods for SQL execution
        let result = await supabase.rpc('exec', { query: statement });
        
        if (result.error && result.error.message.includes('does not exist')) {
          result = await supabase.rpc('exec_sql', { sql: statement });
        }
        
        if (result.error && result.error.message.includes('does not exist')) {
          result = await supabase.rpc('execute_sql', { sql: statement });
        }
        
        if (result.error) {
          console.log(chalk.yellow(`⚠️ Statement ${i + 1} warning: ${result.error.message}`));
          errorCount++;
        } else {
          successCount++;
        }
        
      } catch (error) {
        console.log(chalk.yellow(`⚠️ Statement ${i + 1} failed: ${error.message}`));
        errorCount++;
      }
    }

    console.log(chalk.green(`✅ Migration completed: ${successCount} successful, ${errorCount} with warnings`));

    // Verify the table was created
    console.log(chalk.yellow('🔍 Verifying table creation...'));
    
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(chalk.red(`❌ Table verification failed: ${error.message}`));
      } else {
        console.log(chalk.green('✅ student_profiles table is accessible'));
        console.log(chalk.blue(`📊 Current record count: ${data.length}`));
      }
    } catch (verifyError) {
      console.log(chalk.red(`❌ Table verification error: ${verifyError.message}`));
    }

    // Check if test profiles were inserted
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('student_profiles')
        .select('display_name, grade_level')
        .order('created_at', { ascending: true });
        
      if (!profilesError && profiles.length > 0) {
        console.log(chalk.green(`✅ Found ${profiles.length} test profiles:`));
        profiles.forEach(profile => {
          console.log(chalk.cyan(`  - ${profile.display_name} (${profile.grade_level})`));
        });
      } else {
        console.log(chalk.yellow('⚠️ No test profiles found - may need manual insertion'));
      }
    } catch (profileError) {
      console.log(chalk.yellow(`⚠️ Could not check test profiles: ${profileError.message}`));
    }

  } catch (error) {
    console.error(chalk.red(`💥 Migration failed: ${error.message}`));
    process.exit(1);
  }
}

// ================================================================
// MANUAL PROFILE INSERTION (if needed)
// ================================================================

async function insertTestProfiles() {
  console.log(chalk.blue('👥 Inserting test profiles...'));

  const testProfiles = [
    {
      user_id: 'test_user_emma_prek',
      first_name: 'Emma',
      last_name: 'Student',
      display_name: 'Emma',
      grade_level: 'Pre-K',
      date_of_birth: '2020-03-15',
      learning_preferences: {
        learning_style: 'visual',
        favorite_subjects: ['Math', 'Art'],
        attention_span: 'short',
        prefers_hands_on: true
      },
      parent_email: 'parent.emma@pathfinity.test',
      school_id: 'test_school_001'
    },
    {
      user_id: 'test_user_alex_sandview',
      first_name: 'Alex',
      last_name: 'Davis',
      display_name: 'Alex Davis',
      grade_level: '1',
      date_of_birth: '2019-07-22',
      learning_preferences: {
        learning_style: 'kinesthetic',
        favorite_subjects: ['Math', 'Science'],
        attention_span: 'medium',
        prefers_hands_on: true
      },
      parent_email: 'alex.davis@sandview.plainviewisd.edu',
      school_id: 'sand-view-elementary-school-001'
    },
    {
      user_id: 'test_user_maya_prek',
      first_name: 'Maya',
      last_name: 'Student',
      display_name: 'Maya',
      grade_level: 'Pre-K',
      date_of_birth: '2020-01-30',
      learning_preferences: {
        learning_style: 'mixed',
        favorite_subjects: ['Art', 'Music'],
        attention_span: 'short',
        needs_encouragement: true
      },
      parent_email: 'parent.maya@pathfinity.test',
      school_id: 'test_school_001'
    }
  ];

  let insertedCount = 0;

  for (const profile of testProfiles) {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .upsert(profile, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.log(chalk.yellow(`⚠️ Failed to insert ${profile.display_name}: ${error.message}`));
      } else {
        console.log(chalk.green(`✅ Inserted/Updated profile: ${profile.display_name} (${profile.grade_level})`));
        insertedCount++;
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error inserting ${profile.display_name}: ${error.message}`));
    }
  }

  console.log(chalk.blue(`📊 Successfully processed ${insertedCount}/${testProfiles.length} test profiles`));
}

// ================================================================
// MAIN EXECUTION
// ================================================================

async function main() {
  const command = process.argv[2] || 'migrate';

  switch (command) {
    case 'migrate':
      await runMigration();
      break;
      
    case 'profiles':
      await insertTestProfiles();
      break;
      
    case 'full':
      await runMigration();
      await insertTestProfiles();
      break;
      
    default:
      console.log(chalk.blue('Student Profiles Migration Runner'));
      console.log('');
      console.log(chalk.yellow('Commands:'));
      console.log('  migrate  - Run the database migration');
      console.log('  profiles - Insert test profiles');
      console.log('  full     - Run migration and insert profiles');
      console.log('');
      console.log(chalk.yellow('Usage:'));
      console.log('  node scripts/run-profile-migration.mjs migrate');
      console.log('  node scripts/run-profile-migration.mjs profiles');
      console.log('  node scripts/run-profile-migration.mjs full');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('💥 Fatal error:'), error);
    process.exit(1);
  });
}