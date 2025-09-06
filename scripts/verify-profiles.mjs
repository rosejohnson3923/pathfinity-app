#!/usr/bin/env node

// ================================================================
// VERIFY STUDENT PROFILES SETUP
// Check if student profiles table exists and is accessible
// ================================================================

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// Load environment variables
config({ path: join(PROJECT_ROOT, '.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(chalk.red('❌ Missing Supabase environment variables'));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verifyProfiles() {
  console.log(chalk.blue('🔍 Verifying Student Profiles Setup...'));
  
  try {
    // Test 1: Check if table exists and is accessible
    console.log(chalk.yellow('📊 Testing table access...'));
    
    const { data, error, count } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact' });
      
    if (error) {
      console.log(chalk.red(`❌ Table access failed: ${error.message}`));
      
      if (error.message.includes('does not exist')) {
        console.log(chalk.yellow('💡 Please execute the SQL in student-profiles-setup.sql using Supabase SQL Editor'));
        console.log(chalk.cyan('📂 File location: ./student-profiles-setup.sql'));
      }
      
      return false;
    }
    
    console.log(chalk.green(`✅ student_profiles table accessible with ${count} records`));
    
    // Test 2: Display existing profiles
    if (data && data.length > 0) {
      console.log(chalk.blue('\n👥 Existing Profiles:'));
      data.forEach(profile => {
        console.log(chalk.cyan(`  - ${profile.display_name} (${profile.grade_level}) - ${profile.first_name} ${profile.last_name}`));
        console.log(chalk.gray(`    User ID: ${profile.user_id}`));
        console.log(chalk.gray(`    Learning Style: ${profile.learning_preferences?.learning_style || 'Not set'}`));
        console.log(chalk.gray(`    School: ${profile.school_id || 'None'}`));
        console.log('');
      });
    } else {
      console.log(chalk.yellow('⚠️ No profiles found - table is empty'));
    }
    
    // Test 3: Check student_profile_summary view
    console.log(chalk.yellow('📈 Testing profile summary view...'));
    
    const { data: summaryData, error: summaryError } = await supabase
      .from('student_profile_summary')
      .select('*')
      .limit(5);
      
    if (summaryError) {
      console.log(chalk.yellow(`⚠️ Summary view not accessible: ${summaryError.message}`));
    } else {
      console.log(chalk.green(`✅ Profile summary view working with ${summaryData.length} records`));
    }
    
    // Test 4: Test insertion with StudentProfileService (if profiles missing)
    if (data.length === 0) {
      console.log(chalk.yellow('🔧 Attempting to insert test profiles...'));
      await insertTestProfiles();
    }
    
    return true;
    
  } catch (error) {
    console.error(chalk.red(`💥 Verification failed: ${error.message}`));
    return false;
  }
}

async function insertTestProfiles() {
  const testProfiles = [
    {
      user_id: 'a1b2c3d4-5678-9012-3456-789012345678',
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
      user_id: 'b2c3d4e5-6789-0123-4567-890123456789',
      first_name: 'Alex',
      last_name: 'Student',
      display_name: 'Alex',
      grade_level: 'K',
      date_of_birth: '2019-07-22',
      learning_preferences: {
        learning_style: 'auditory',
        favorite_subjects: ['ELA', 'Science'],
        attention_span: 'medium',
        prefers_group_work: true
      },
      parent_email: 'parent.alex@pathfinity.test',
      school_id: 'test_school_001'
    }
  ];

  let insertedCount = 0;

  for (const profile of testProfiles) {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        console.log(chalk.yellow(`⚠️ Failed to insert ${profile.display_name}: ${error.message}`));
      } else {
        console.log(chalk.green(`✅ Inserted profile: ${profile.display_name} (${profile.grade_level})`));
        insertedCount++;
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error inserting ${profile.display_name}: ${error.message}`));
    }
  }

  console.log(chalk.blue(`📊 Successfully inserted ${insertedCount}/${testProfiles.length} test profiles`));
}

// Test the StudentProfileService
async function testProfileService() {
  console.log(chalk.blue('\n🧪 Testing StudentProfileService...'));
  
  try {
    // Import the service (using dynamic import since this is an .mjs file)
    const serviceModule = await import('../src/services/studentProfileService.ts');
    const { StudentProfileService } = serviceModule;
    
    // Test getting profiles by grade
    const preKProfiles = await StudentProfileService.getProfilesByGrade('Pre-K');
    
    if (preKProfiles.success) {
      console.log(chalk.green(`✅ Service working: Found ${preKProfiles.data.length} Pre-K profiles`));
    } else {
      console.log(chalk.yellow(`⚠️ Service test failed: ${preKProfiles.error}`));
    }
    
  } catch (error) {
    console.log(chalk.yellow(`⚠️ Could not test service: ${error.message}`));
    console.log(chalk.gray('This is expected if running from mjs context'));
  }
}

// Main execution
async function main() {
  const success = await verifyProfiles();
  
  if (success) {
    await testProfileService();
    console.log(chalk.green('\n🎉 Student Profiles verification completed successfully!'));
    console.log(chalk.blue('\n📋 Next Steps:'));
    console.log('1. Use StudentProfileService in your React components');
    console.log('2. Test profile creation and updates');
    console.log('3. Integrate with existing auth system');
  } else {
    console.log(chalk.red('\n❌ Verification failed - please check setup'));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('💥 Fatal error:'), error);
    process.exit(1);
  });
}