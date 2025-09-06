/**
 * Setup Testing Tracker Database
 * ===============================
 * Creates the testing tracker tables and views in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                          process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found');
  console.log('Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTestingTracker() {
  console.log('🚀 Setting up Testing Tracker System');
  console.log('=' + '='.repeat(50));

  try {
    // Step 1: Check if table exists
    console.log('\n📋 Checking question_type_testing table...');
    
    // Try to query the table to see if it exists
    const { error: checkError } = await supabase
      .from('question_type_testing')
      .select('test_id')
      .limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Table does not exist. Please run database/create-testing-tracker.sql in Supabase dashboard.');
      console.log('\nAlternatively, creating table directly...');
      
      // Since we can't run DDL through the client library directly,
      // we'll need to inform the user to run the SQL
      console.log('\n⚠️  The testing tracker table needs to be created.');
      console.log('Please run the following SQL file in your Supabase SQL editor:');
      console.log('  database/create-testing-tracker.sql');
      console.log('\nThen run this script again.');
      return;
    }

    // Step 2: Populate from generation_queue
    console.log('📥 Populating testing records from queue...');
    
    // Get queue items
    const { data: queueItems, error: queueError } = await supabase
      .from('generation_queue')
      .select('queue_id, subject, skill_id, container_type, question_type')
      .eq('student_id', 'Taylor')
      .eq('grade_level', '10')
      .eq('status', 'pending');

    if (queueError) {
      console.error('Error fetching queue items:', queueError);
      return;
    }

    console.log(`Found ${queueItems?.length || 0} items in queue`);

    // Insert into testing table
    if (queueItems && queueItems.length > 0) {
      const testingRecords = queueItems.map(item => ({
        queue_id: item.queue_id,
        subject: item.subject,
        skill_id: item.skill_id,
        container_type: item.container_type,
        question_type: item.question_type,
        student_id: 'Taylor',
        grade_level: '10',
        test_status: 'not_started'
      }));

      const { error: insertError, count } = await supabase
        .from('question_type_testing')
        .upsert(testingRecords, {
          onConflict: 'subject,skill_id,container_type,question_type',
          ignoreDuplicates: false
        });

      if (insertError) {
        console.error('Error inserting testing records:', insertError);
      } else {
        console.log(`✅ Created ${testingRecords.length} testing records`);
      }
    }

    // Step 3: Verify what we created
    const { count: totalCount } = await supabase
      .from('question_type_testing')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Total testing records: ${totalCount}`);

    // Step 4: Create summary statistics
    const { data: stats } = await supabase
      .from('question_type_testing')
      .select('test_status')
      .eq('student_id', 'Taylor');

    if (stats) {
      const statusCounts = stats.reduce((acc, item) => {
        acc[item.test_status] = (acc[item.test_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('\n📈 Testing Status Breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    }

    // Step 5: Show sample records
    const { data: samples } = await supabase
      .from('question_type_testing')
      .select('subject, container_type, question_type, test_status')
      .limit(5);

    if (samples && samples.length > 0) {
      console.log('\n📝 Sample Testing Records:');
      samples.forEach(s => {
        console.log(`   ${s.subject} | ${s.container_type} | ${s.question_type} | ${s.test_status}`);
      });
    }

    console.log('\n✅ Testing tracker setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run automated tests: npm run test:question-types:auto');
    console.log('2. Run manual tests: npm run test:question-types:manual');
    console.log('3. View dashboard: npm run test:dashboard');

  } catch (error) {
    console.error('❌ Error setting up testing tracker:', error);
  }
}

setupTestingTracker().catch(console.error);