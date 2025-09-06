/**
 * Simple Testing Tracker
 * ======================
 * Tracks testing progress using the existing generation_queue table
 * Updates the status field as tests are completed
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Local tracking file
const TRACKING_FILE = path.join(process.cwd(), 'testing-progress.json');

interface TestProgress {
  queue_id: string;
  subject: string;
  container_type: string;
  question_type: string;
  skill_id: string;
  status: 'not_started' | 'in_progress' | 'passed' | 'failed' | 'blocked';
  test_date?: string;
  notes?: string;
  error?: string;
}

// Load or initialize tracking data
function loadTrackingData(): Record<string, TestProgress> {
  if (fs.existsSync(TRACKING_FILE)) {
    return JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
  }
  return {};
}

// Save tracking data
function saveTrackingData(data: Record<string, TestProgress>) {
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
}

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function initializeTracking() {
  console.log('🚀 Initializing Testing Tracker');
  console.log('=' + '='.repeat(50));

  // Get all queue items for Taylor
  const { data: queueItems, error } = await supabase
    .from('generation_queue')
    .select('*')
    .eq('student_id', 'Taylor')
    .eq('grade_level', '10')
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching queue items:', error);
    return;
  }

  console.log(`Found ${queueItems?.length || 0} items in queue`);

  // Initialize tracking data
  const trackingData = loadTrackingData();
  let newItems = 0;

  queueItems?.forEach(item => {
    const key = `${item.subject}_${item.container_type}_${item.question_type}`;
    if (!trackingData[key]) {
      trackingData[key] = {
        queue_id: item.queue_id,
        subject: item.subject,
        container_type: item.container_type,
        question_type: item.question_type,
        skill_id: item.skill_id,
        status: 'not_started'
      };
      newItems++;
    }
  });

  saveTrackingData(trackingData);
  console.log(`✅ Tracking initialized with ${Object.keys(trackingData).length} tests`);
  console.log(`   (${newItems} new items added)`);
}

async function showDashboard() {
  const trackingData = loadTrackingData();
  const tests = Object.values(trackingData);

  console.clear();
  console.log(`${colors.bright}${colors.cyan}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║           QUESTION TYPE TESTING DASHBOARD                  ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚═══════════════════════════════════════════════════════════╝${colors.reset}`);

  // Calculate statistics
  const stats = {
    total: tests.length,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    blocked: tests.filter(t => t.status === 'blocked').length,
    in_progress: tests.filter(t => t.status === 'in_progress').length,
    not_started: tests.filter(t => t.status === 'not_started').length
  };

  const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0';

  console.log('\n📊 Overall Progress:');
  console.log(`   Total Tests: ${stats.total}`);
  console.log(`   ${colors.green}✅ Passed: ${stats.passed}${colors.reset}`);
  console.log(`   ${colors.red}❌ Failed: ${stats.failed}${colors.reset}`);
  console.log(`   ${colors.yellow}🚫 Blocked: ${stats.blocked}${colors.reset}`);
  console.log(`   ⏳ In Progress: ${stats.in_progress}`);
  console.log(`   ⭕ Not Started: ${stats.not_started}`);
  console.log(`   📈 Pass Rate: ${passRate}%`);

  // Progress bar
  const barWidth = 40;
  const filledWidth = Math.round((stats.passed / stats.total) * barWidth);
  const progressBar = '█'.repeat(filledWidth) + '░'.repeat(barWidth - filledWidth);
  console.log(`\n   [${colors.green}${progressBar}${colors.reset}] ${passRate}%`);

  // Group by question type
  console.log('\n📝 By Question Type:');
  const questionTypes = [...new Set(tests.map(t => t.question_type))].sort();
  
  questionTypes.forEach(qt => {
    const qtTests = tests.filter(t => t.question_type === qt);
    const qtPassed = qtTests.filter(t => t.status === 'passed').length;
    const qtTotal = qtTests.length;
    const qtStatus = qtPassed === qtTotal ? colors.green : 
                    qtPassed > 0 ? colors.yellow : colors.red;
    console.log(`   ${qtStatus}${qt.padEnd(20)} ${qtPassed}/${qtTotal}${colors.reset}`);
  });

  // Group by subject
  console.log('\n📚 By Subject:');
  const subjects = [...new Set(tests.map(t => t.subject))].sort();
  
  subjects.forEach(subj => {
    const subjTests = tests.filter(t => t.subject === subj);
    const subjPassed = subjTests.filter(t => t.status === 'passed').length;
    const subjTotal = subjTests.length;
    const subjStatus = subjPassed === subjTotal ? colors.green : 
                       subjPassed > 0 ? colors.yellow : colors.red;
    console.log(`   ${subjStatus}${subj.padEnd(20)} ${subjPassed}/${subjTotal}${colors.reset}`);
  });

  // Show next tests to run
  const nextTests = tests.filter(t => t.status === 'not_started').slice(0, 5);
  if (nextTests.length > 0) {
    console.log('\n🎯 Next Tests to Run:');
    nextTests.forEach(test => {
      console.log(`   → ${test.subject} | ${test.container_type} | ${test.question_type}`);
    });
  } else {
    console.log('\n🎉 All tests completed!');
  }

  console.log(`\n${colors.cyan}Last updated: ${new Date().toLocaleString()}${colors.reset}`);
}

async function markTest(subject: string, container: string, questionType: string, 
                        status: 'passed' | 'failed' | 'blocked', notes?: string) {
  const trackingData = loadTrackingData();
  const key = `${subject}_${container}_${questionType}`;
  
  if (trackingData[key]) {
    trackingData[key].status = status;
    trackingData[key].test_date = new Date().toISOString();
    if (notes) trackingData[key].notes = notes;
    
    saveTrackingData(trackingData);
    
    // Also update in database
    await supabase
      .from('generation_queue')
      .update({ 
        status: status === 'passed' ? 'completed' : 
                status === 'failed' ? 'failed' : 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('queue_id', trackingData[key].queue_id);
    
    console.log(`✅ Test marked as ${status}: ${subject}/${container}/${questionType}`);
  } else {
    console.log(`❌ Test not found: ${subject}/${container}/${questionType}`);
  }
}

async function getNextTest() {
  const trackingData = loadTrackingData();
  const tests = Object.values(trackingData);
  const nextTest = tests.find(t => t.status === 'not_started');
  
  if (nextTest) {
    console.log('\n🎯 Next Test to Run:');
    console.log(`   Subject: ${nextTest.subject}`);
    console.log(`   Container: ${nextTest.container_type}`);
    console.log(`   Question Type: ${nextTest.question_type}`);
    console.log(`   Skill ID: ${nextTest.skill_id}`);
    
    // Mark as in progress
    const key = `${nextTest.subject}_${nextTest.container_type}_${nextTest.question_type}`;
    trackingData[key].status = 'in_progress';
    saveTrackingData(trackingData);
    
    return nextTest;
  } else {
    console.log('🎉 All tests completed!');
    return null;
  }
}

// Main menu
async function main() {
  const command = process.argv[2];
  
  switch(command) {
    case 'init':
      await initializeTracking();
      break;
      
    case 'dashboard':
    case 'status':
      await showDashboard();
      break;
      
    case 'next':
      await getNextTest();
      break;
      
    case 'pass':
      if (process.argv.length < 6) {
        console.log('Usage: npm run test:tracker pass <subject> <container> <question_type> [notes]');
        break;
      }
      await markTest(process.argv[3], process.argv[4], process.argv[5], 'passed', process.argv[6]);
      await showDashboard();
      break;
      
    case 'fail':
      if (process.argv.length < 6) {
        console.log('Usage: npm run test:tracker fail <subject> <container> <question_type> [error]');
        break;
      }
      await markTest(process.argv[3], process.argv[4], process.argv[5], 'failed', process.argv[6]);
      await showDashboard();
      break;
      
    case 'watch':
      await showDashboard();
      setInterval(async () => {
        await showDashboard();
      }, 5000);
      break;
      
    default:
      console.log('📊 Simple Testing Tracker');
      console.log('\nCommands:');
      console.log('  npm run test:tracker init      - Initialize tracking from queue');
      console.log('  npm run test:tracker dashboard - Show testing dashboard');
      console.log('  npm run test:tracker next      - Get next test to run');
      console.log('  npm run test:tracker pass <subject> <container> <type> - Mark test passed');
      console.log('  npm run test:tracker fail <subject> <container> <type> - Mark test failed');
      console.log('  npm run test:tracker watch     - Auto-refresh dashboard');
      
      // Show current status
      await showDashboard();
  }
}

main().catch(console.error);