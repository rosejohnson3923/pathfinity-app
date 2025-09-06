/**
 * Debug script to understand skills_master_v2 connection issues
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Debug Information:');
console.log('Supabase URL:', supabaseUrl);
console.log('Using Service Key:', supabaseServiceKey ? 'Yes' : 'No');
console.log('Key type:', supabaseServiceKey?.startsWith('eyJ') ? 'JWT Token' : 'Unknown');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugConnection() {
  console.log('\n📊 Testing skills_master_v2 connection...\n');
  
  try {
    // Test 1: Simple count query
    console.log('Test 1: Count query');
    const { count, error: countError } = await supabase
      .from('skills_master_v2')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('  ❌ Count error:', countError.message);
      console.log('  Error details:', countError);
    } else {
      console.log(`  ✅ Count successful: ${count} records`);
    }
    
    // Test 2: Select first record
    console.log('\nTest 2: Select first record');
    const { data: firstRecord, error: firstError } = await supabase
      .from('skills_master_v2')
      .select('*')
      .limit(1)
      .single();
    
    if (firstError) {
      console.log('  ❌ Select error:', firstError.message);
      console.log('  Error code:', firstError.code);
      console.log('  Error hint:', firstError.hint);
    } else if (firstRecord) {
      console.log('  ✅ Found record with columns:', Object.keys(firstRecord));
      console.log('  Sample data:');
      console.log('    grade_level:', firstRecord.grade_level);
      console.log('    subject:', firstRecord.subject);
      console.log('    skill_name:', firstRecord.skill_name);
    }
    
    // Test 3: Check for Grade 10 specifically
    console.log('\nTest 3: Query for grade_level = "10"');
    const { data: grade10, error: grade10Error } = await supabase
      .from('skills_master_v2')
      .select('grade_level, subject')
      .eq('grade_level', '10')
      .limit(5);
    
    if (grade10Error) {
      console.log('  ❌ Grade 10 query error:', grade10Error.message);
    } else if (grade10 && grade10.length > 0) {
      console.log(`  ✅ Found ${grade10.length} Grade 10 records`);
      grade10.forEach(record => {
        console.log(`    - ${record.subject} (grade_level: "${record.grade_level}")`);
      });
    } else {
      console.log('  ⚠️ No Grade 10 records found');
    }
    
    // Test 4: Get all unique grade_level values
    console.log('\nTest 4: Get unique grade_level values');
    const { data: allGrades, error: gradesError } = await supabase
      .from('skills_master_v2')
      .select('grade_level');
    
    if (gradesError) {
      console.log('  ❌ Grades query error:', gradesError.message);
    } else if (allGrades) {
      const uniqueGrades = [...new Set(allGrades.map(r => r.grade_level))].filter(Boolean).sort();
      console.log('  ✅ Unique grade_level values found:', uniqueGrades.length);
      console.log('    Values:', uniqueGrades.join(', '));
      
      // Check what the actual values look like
      if (uniqueGrades.length > 0) {
        console.log('\n  Analyzing grade_level format:');
        uniqueGrades.slice(0, 3).forEach(grade => {
          console.log(`    - "${grade}" (length: ${grade.length}, type: ${typeof grade})`);
        });
      }
    }
    
    // Test 5: Try different grade_level formats
    console.log('\nTest 5: Testing different grade_level query formats');
    const testQueries = ['10', '10 ', ' 10', '10.0', 10];
    
    for (const testValue of testQueries) {
      const { count: testCount } = await supabase
        .from('skills_master_v2')
        .select('*', { count: 'exact', head: true })
        .eq('grade_level', testValue);
      
      console.log(`  grade_level = ${typeof testValue === 'string' ? `"${testValue}"` : testValue} (${typeof testValue}): ${testCount || 0} records`);
    }
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

debugConnection().catch(console.error);