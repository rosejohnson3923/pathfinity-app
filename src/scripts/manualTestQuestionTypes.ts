/**
 * Manual Question Type Testing Script
 * ====================================
 * Provides detailed testing interface for manually verifying each question type
 * Records detailed test results including specific failure points
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                          process.env.SUPABASE_SERVICE_KEY || 
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                          process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to get user input
function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Question type descriptions for guidance
const questionTypeDescriptions: Record<string, string> = {
  'multiple_choice': 'Single selection from 4 options',
  'true_false': 'Binary true/false selection',
  'fill_blank': 'Text input to complete sentence',
  'numeric': 'Numeric input with validation',
  'matching': 'Match items from two columns',
  'ordering': 'Arrange items in correct sequence',
  'short_answer': 'Brief text response (1-2 sentences)',
  'essay': 'Extended text response',
  'drag_drop': 'Drag elements to correct positions',
  'multi_select': 'Multiple selections from options',
  'slider': 'Adjust value using slider control',
  'hotspot': 'Click on specific areas of image',
  'diagram_label': 'Label parts of a diagram',
  'graph_plot': 'Plot points or draw on graph',
  'table_complete': 'Fill in table cells'
};

/**
 * Display test case details
 */
async function displayTestCase(testCase: any) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST CASE DETAILS');
  console.log('='.repeat(60));
  console.log(`Subject:        ${testCase.subject}`);
  console.log(`Container:      ${testCase.container_type}`);
  console.log(`Question Type:  ${testCase.question_type}`);
  console.log(`Description:    ${questionTypeDescriptions[testCase.question_type]}`);
  console.log(`Skill ID:       ${testCase.skill_id}`);
  console.log(`Queue ID:       ${testCase.queue_id}`);
  
  // Get skill details
  const { data: skill } = await supabase
    .from('skills_master')
    .select('skill_number, skill_name, skill_description')
    .eq('id', testCase.skill_id)
    .single();
  
  if (skill) {
    console.log(`\n📚 SKILL DETAILS:`);
    console.log(`Number:         ${skill.skill_number}`);
    console.log(`Name:           ${skill.skill_name}`);
    console.log(`Description:    ${skill.skill_description || 'N/A'}`);
  }
}

/**
 * Collect detailed test results from user
 */
async function collectTestResults(): Promise<any> {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST VERIFICATION');
  console.log('='.repeat(60));
  
  console.log('\nPlease test the question type in the application and answer:');
  
  const renders = await question('\n1. Does the question render correctly? (y/n): ');
  const accepts = await question('2. Does it accept user input properly? (y/n): ');
  const validates = await question('3. Does answer validation work? (y/n): ');
  const saves = await question('4. Does it save progress correctly? (y/n): ');
  
  const allPassed = 
    renders.toLowerCase() === 'y' &&
    accepts.toLowerCase() === 'y' &&
    validates.toLowerCase() === 'y' &&
    saves.toLowerCase() === 'y';
  
  let notes = '';
  let error = '';
  
  if (!allPassed) {
    error = await question('\nDescribe the issue (or press Enter to skip): ');
  }
  
  notes = await question('\nAdditional notes (or press Enter to skip): ');
  
  return {
    passed: allPassed,
    renders_correctly: renders.toLowerCase() === 'y',
    accepts_input: accepts.toLowerCase() === 'y',
    validates_answer: validates.toLowerCase() === 'y',
    saves_progress: saves.toLowerCase() === 'y',
    error_message: error || null,
    test_notes: notes || null
  };
}

/**
 * Get specific test by criteria
 */
async function getSpecificTest(
  subject?: string,
  container?: string,
  questionType?: string
): Promise<any> {
  let query = supabase
    .from('question_type_testing')
    .select('*')
    .eq('test_status', 'not_started');
  
  if (subject) query = query.eq('subject', subject);
  if (container) query = query.eq('container_type', container);
  if (questionType) query = query.eq('question_type', questionType);
  
  const { data, error } = await query.limit(1).single();
  
  return error ? null : data;
}

/**
 * Main manual testing flow
 */
async function runManualTest() {
  console.log('\n🔍 Manual Question Type Testing');
  console.log('================================\n');
  
  // Choose test selection method
  console.log('How would you like to select a test?');
  console.log('1. Get next test automatically');
  console.log('2. Select by subject');
  console.log('3. Select by question type');
  console.log('4. Select by container');
  console.log('5. Enter specific combination');
  
  const choice = await question('\nChoice (1-5): ');
  
  let testCase = null;
  
  switch(choice) {
    case '1':
      const { data } = await supabase.rpc('get_next_test');
      testCase = data && data.length > 0 ? data[0] : null;
      break;
      
    case '2':
      const subject = await question('Enter subject (Math/Science/English/SocialStudies/Algebra1/WorldLanguages): ');
      testCase = await getSpecificTest(subject);
      break;
      
    case '3':
      console.log('\nAvailable question types:');
      Object.keys(questionTypeDescriptions).forEach((qt, i) => {
        console.log(`${i + 1}. ${qt}`);
      });
      const qtChoice = await question('\nEnter question type name: ');
      testCase = await getSpecificTest(undefined, undefined, qtChoice);
      break;
      
    case '4':
      const container = await question('Enter container (learn/experience/discover): ');
      testCase = await getSpecificTest(undefined, container);
      break;
      
    case '5':
      const subj = await question('Enter subject: ');
      const cont = await question('Enter container: ');
      const qt = await question('Enter question type: ');
      testCase = await getSpecificTest(subj, cont, qt);
      break;
  }
  
  if (!testCase) {
    console.log('\n❌ No matching test found or all tests completed!');
    return;
  }
  
  // Display test details
  await displayTestCase(testCase);
  
  // Mark as in progress
  await supabase
    .from('question_type_testing')
    .update({ 
      test_status: 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('test_id', testCase.test_id);
  
  console.log('\n⏳ Test marked as IN PROGRESS');
  console.log('\n📱 Please navigate to the application and test this combination now.');
  
  const proceed = await question('\nPress Enter when ready to record results...');
  
  // Collect results
  const results = await collectTestResults();
  
  // Update database
  const { error } = await supabase
    .from('question_type_testing')
    .update({
      test_status: results.passed ? 'passed' : 'failed',
      test_date: new Date().toISOString(),
      tested_by: 'Manual Testing',
      renders_correctly: results.renders_correctly,
      accepts_input: results.accepts_input,
      validates_answer: results.validates_answer,
      saves_progress: results.saves_progress,
      error_message: results.error_message,
      test_notes: results.test_notes,
      updated_at: new Date().toISOString()
    })
    .eq('test_id', testCase.test_id);
  
  if (!error) {
    if (results.passed) {
      console.log('\n✅ Test PASSED and recorded successfully!');
    } else {
      console.log('\n❌ Test FAILED and recorded successfully.');
    }
  } else {
    console.log('\n⚠️ Error recording test result:', error);
  }
  
  // Ask if user wants to continue
  const continueTest = await question('\nTest another? (y/n): ');
  if (continueTest.toLowerCase() === 'y') {
    await runManualTest();
  }
}

/**
 * Show detailed progress report
 */
async function showDetailedProgress() {
  // Get overall summary
  const { data: summary } = await supabase
    .from('testing_summary')
    .select('*')
    .single();
  
  // Get subject progress
  const { data: subjects } = await supabase
    .from('subject_testing_progress')
    .select('*')
    .order('subject');
  
  // Get failed tests
  const { data: failures } = await supabase
    .from('failed_tests')
    .select('*')
    .limit(10);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 DETAILED TESTING PROGRESS REPORT');
  console.log('='.repeat(60));
  
  if (summary) {
    console.log('\n📈 OVERALL SUMMARY:');
    console.log(`   Total Tests:        ${summary.total_tests}`);
    console.log(`   ✅ Passed:          ${summary.passed}`);
    console.log(`   ❌ Failed:          ${summary.failed}`);
    console.log(`   ⚠️  Blocked:         ${summary.blocked}`);
    console.log(`   ⏳ Not Started:     ${summary.not_started}`);
    console.log(`   📊 Pass Rate:       ${summary.overall_pass_rate}%`);
    console.log(`   🎯 Question Types:  ${summary.question_types_passed}/${summary.question_types_total}`);
  }
  
  if (subjects && subjects.length > 0) {
    console.log('\n📚 BY SUBJECT:');
    subjects.forEach((s: any) => {
      const emoji = s.completion_rate === 100 ? '✅' : 
                   s.completion_rate > 50 ? '🔶' : '🔴';
      console.log(`   ${emoji} ${s.subject} (${s.container_type}): ${s.passed}/${s.total} (${s.completion_rate}%)`);
    });
  }
  
  if (failures && failures.length > 0) {
    console.log('\n❌ RECENT FAILURES:');
    failures.forEach((f: any) => {
      console.log(`   - ${f.subject}/${f.container_type}/${f.question_type}`);
      if (f.error_message) {
        console.log(`     Error: ${f.error_message}`);
      }
    });
  }
}

/**
 * Main menu
 */
async function mainMenu() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 QUESTION TYPE TESTING SYSTEM');
  console.log('='.repeat(60));
  console.log('\n1. Start manual testing');
  console.log('2. View detailed progress');
  console.log('3. Export results to CSV');
  console.log('4. Reset specific test');
  console.log('5. Exit');
  
  const choice = await question('\nSelect option (1-5): ');
  
  switch(choice) {
    case '1':
      await runManualTest();
      break;
      
    case '2':
      await showDetailedProgress();
      break;
      
    case '3':
      console.log('\n📥 Exporting results...');
      const { data } = await supabase
        .from('testing_dashboard')
        .select('*')
        .order('sort_order');
      
      if (data) {
        const csv = [
          'Question Type,Passed,Failed,Blocked,In Progress,Not Started,Total,Pass Rate',
          ...data.map((row: any) => 
            `${row.question_type},${row.passed},${row.failed},${row.blocked},${row.in_progress},${row.not_started},${row.total},${row.pass_rate}%`
          )
        ].join('\n');
        
        console.log('\nCSV Output:\n');
        console.log(csv);
        console.log('\n✅ Results exported (copy from above)');
      }
      break;
      
    case '4':
      const subj = await question('Enter subject to reset: ');
      const cont = await question('Enter container to reset: ');
      const qt = await question('Enter question type to reset: ');
      
      const { error } = await supabase
        .from('question_type_testing')
        .update({
          test_status: 'not_started',
          test_date: null,
          error_message: null,
          test_notes: null,
          renders_correctly: null,
          accepts_input: null,
          validates_answer: null,
          saves_progress: null
        })
        .eq('subject', subj)
        .eq('container_type', cont)
        .eq('question_type', qt);
      
      if (!error) {
        console.log('\n♻️ Test reset successfully');
      }
      break;
      
    case '5':
      rl.close();
      return;
  }
  
  // Return to menu
  await mainMenu();
}

// Start the application
console.log('🚀 Starting Manual Testing System...');
mainMenu().catch(console.error).finally(() => rl.close());