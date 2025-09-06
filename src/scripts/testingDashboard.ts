/**
 * Testing Dashboard Script
 * ========================
 * Quick view of testing progress with visual indicators
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
                          process.env.SUPABASE_SERVICE_KEY || 
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                          process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Visual progress bar
function progressBar(current: number, total: number, width: number = 30): string {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${percentage}%`;
}

// Get status emoji
function getStatusEmoji(status: string): string {
  switch(status) {
    case 'passed': return '✅';
    case 'failed': return '❌';
    case 'blocked': return '🚫';
    case 'in_progress': return '⏳';
    case 'not_started': return '⭕';
    default: return '❓';
  }
}

/**
 * Display comprehensive dashboard
 */
async function displayDashboard() {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║           QUESTION TYPE TESTING DASHBOARD                  ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  
  // Get summary
  const { data: summary } = await supabase
    .from('testing_summary')
    .select('*')
    .single();
  
  if (summary) {
    console.log('║                    OVERALL PROGRESS                        ║');
    console.log('╟─────────────────────────────────────────────────────────────╢');
    
    const passedBar = progressBar(summary.passed, summary.total_tests);
    console.log(`║ Passed:      ${passedBar} ${summary.passed}/${summary.total_tests} ║`);
    
    console.log(`║ ✅ Passed:     ${String(summary.passed).padEnd(5)} ❌ Failed:      ${String(summary.failed).padEnd(5)} ║`);
    console.log(`║ 🚫 Blocked:    ${String(summary.blocked).padEnd(5)} ⏳ In Progress:  ${String(summary.in_progress || 0).padEnd(5)} ║`);
    console.log(`║ ⭕ Not Started: ${String(summary.not_started).padEnd(5)} 📊 Pass Rate:    ${summary.overall_pass_rate}%   ║`);
  }
  
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║                 QUESTION TYPE BREAKDOWN                    ║');
  console.log('╟─────────────────────────────────────────────────────────────╢');
  
  // Get question type progress
  const { data: dashboard } = await supabase
    .from('testing_dashboard')
    .select('*')
    .order('sort_order');
  
  if (dashboard && dashboard.length > 0) {
    dashboard.forEach((qt: any) => {
      const name = qt.question_type.padEnd(15);
      const progress = progressBar(qt.passed, qt.total, 20);
      const stats = `${qt.passed}/${qt.total}`.padEnd(7);
      console.log(`║ ${name} ${progress} ${stats}║`);
    });
  }
  
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║                   SUBJECT BREAKDOWN                        ║');
  console.log('╟─────────────────────────────────────────────────────────────╢');
  
  // Get subject progress
  const { data: subjects } = await supabase
    .from('subject_testing_progress')
    .select('*')
    .order('subject');
  
  if (subjects && subjects.length > 0) {
    // Group by subject
    const subjectMap = new Map();
    subjects.forEach((s: any) => {
      if (!subjectMap.has(s.subject)) {
        subjectMap.set(s.subject, { passed: 0, total: 0 });
      }
      const current = subjectMap.get(s.subject);
      current.passed += s.passed;
      current.total += s.total;
    });
    
    subjectMap.forEach((value, key) => {
      const name = key.padEnd(15);
      const progress = progressBar(value.passed, value.total, 20);
      const stats = `${value.passed}/${value.total}`.padEnd(7);
      console.log(`║ ${name} ${progress} ${stats}║`);
    });
  }
  
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║                    RECENT ACTIVITY                         ║');
  console.log('╟─────────────────────────────────────────────────────────────╢');
  
  // Get recent tests
  const { data: recent } = await supabase
    .from('question_type_testing')
    .select('subject, container_type, question_type, test_status, test_date')
    .not('test_date', 'is', null)
    .order('test_date', { ascending: false })
    .limit(5);
  
  if (recent && recent.length > 0) {
    recent.forEach((test: any) => {
      const emoji = getStatusEmoji(test.test_status);
      const desc = `${test.subject}/${test.container_type}/${test.question_type}`.padEnd(45);
      console.log(`║ ${emoji} ${desc} ║`);
    });
  } else {
    console.log('║ No recent activity                                         ║');
  }
  
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║                     NEXT TESTS                             ║');
  console.log('╟─────────────────────────────────────────────────────────────╢');
  
  // Get next tests to run
  const { data: nextTests } = await supabase
    .from('question_type_testing')
    .select('subject, container_type, question_type')
    .eq('test_status', 'not_started')
    .order('question_type')
    .limit(3);
  
  if (nextTests && nextTests.length > 0) {
    nextTests.forEach((test: any) => {
      const desc = `${test.subject}/${test.container_type}/${test.question_type}`.padEnd(50);
      console.log(`║ → ${desc} ║`);
    });
  } else {
    console.log('║ 🎉 All tests completed!                                    ║');
  }
  
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  // Show timestamp
  console.log(`\nLast updated: ${new Date().toLocaleString()}`);
}

/**
 * Auto-refresh mode
 */
async function autoRefresh(intervalSeconds: number = 5) {
  await displayDashboard();
  console.log(`\nAuto-refreshing every ${intervalSeconds} seconds... (Press Ctrl+C to exit)`);
  
  setInterval(async () => {
    await displayDashboard();
  }, intervalSeconds * 1000);
}

/**
 * Main function
 */
async function main() {
  const mode = process.argv[2];
  
  if (mode === 'auto' || mode === 'watch') {
    const interval = parseInt(process.argv[3]) || 5;
    await autoRefresh(interval);
  } else {
    await displayDashboard();
    
    // Show command options
    console.log('\n📊 Dashboard Commands:');
    console.log('  npm run test:dashboard          - Show current status');
    console.log('  npm run test:dashboard auto     - Auto-refresh every 5 seconds');
    console.log('  npm run test:dashboard auto 10  - Auto-refresh every 10 seconds');
  }
}

main().catch(console.error);