#!/usr/bin/env node

// ================================================================
// DETAILED GRADE VERIFICATION SCRIPT
// Enhanced verification to check actual grade values and formatting
// ================================================================

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

// ================================================================
// CONFIGURATION
// ================================================================

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Supabase configuration missing.');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ================================================================
// DETAILED VERIFICATION FUNCTIONS
// ================================================================

class DetailedGradeVerifier {
  constructor() {
    this.results = {};
  }

  // 1. Get ALL unique grade values in the database
  async getAllUniqueGrades() {
    console.log('🔍 1. Finding ALL unique grade values in the database...');
    
    try {
      // First get total count to verify we're getting all data
      const { count: totalCount } = await supabase
        .from('skills_master')
        .select('*', { count: 'exact', head: true });
      
      console.log(`   📊 Total records in database: ${totalCount}`);
      
      // Get all grade data without limit to ensure we get everything
      const { data, error } = await supabase
        .from('skills_master')
        .select('grade');

      if (error) {
        throw new Error(`Failed to fetch grades: ${error.message}`);
      }

      console.log(`   📊 Grade records retrieved: ${data?.length || 0}`);

      // Count occurrences of each unique grade value
      const gradeCounts = {};
      if (data) {
        for (const record of data) {
          const grade = record.grade;
          gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
        }
      }

      console.log('\n   📊 ALL UNIQUE GRADE VALUES FOUND:');
      console.log('   =====================================');
      
      const sortedGrades = Object.entries(gradeCounts).sort((a, b) => {
        // Custom sort to put grades in logical order
        const gradeOrder = ['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Algebra1', 'Precalculus'];
        const aIndex = gradeOrder.indexOf(a[0]);
        const bIndex = gradeOrder.indexOf(b[0]);
        if (aIndex === -1 && bIndex === -1) return a[0].localeCompare(b[0]);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });

      for (const [grade, count] of sortedGrades) {
        console.log(`   📚 Grade "${grade}": ${count} skills`);
      }

      // Also try a different approach to double-check
      console.log('\n   🔄 Double-checking with direct grade count queries...');
      const knownGrades = ['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Algebra1', 'Precalculus'];
      const directCounts = {};
      
      for (const grade of knownGrades) {
        try {
          const { count } = await supabase
            .from('skills_master')
            .select('*', { count: 'exact', head: true })
            .eq('grade', grade);
          
          if (count && count > 0) {
            directCounts[grade] = count;
            console.log(`      📚 Grade "${grade}": ${count} skills (direct query)`);
          }
        } catch (error) {
          // Skip grades that cause errors
        }
      }

      this.results.allGrades = gradeCounts;
      this.results.directGradeCounts = directCounts;
      return gradeCounts;
    } catch (error) {
      console.error(`❌ Failed to get unique grades: ${error.message}`);
      return {};
    }
  }

  // 2. Count by subject within each grade
  async getSubjectCountsByGrade() {
    console.log('\n🔍 2. Counting subjects within each grade level...');
    
    try {
      const { data, error } = await supabase
        .from('skills_master')
        .select('grade, subject')
        .order('grade')
        .order('subject');

      if (error) {
        throw new Error(`Failed to fetch grade-subject data: ${error.message}`);
      }

      // Group by grade, then by subject
      const gradeSubjectCounts = {};
      if (data) {
        for (const record of data) {
          const grade = record.grade;
          const subject = record.subject;
          
          if (!gradeSubjectCounts[grade]) {
            gradeSubjectCounts[grade] = {};
          }
          
          gradeSubjectCounts[grade][subject] = (gradeSubjectCounts[grade][subject] || 0) + 1;
        }
      }

      console.log('\n   📊 SUBJECT COUNTS BY GRADE:');
      console.log('   ============================');
      
      for (const [grade, subjects] of Object.entries(gradeSubjectCounts)) {
        console.log(`\n   📚 Grade "${grade}":`);
        for (const [subject, count] of Object.entries(subjects)) {
          console.log(`      📖 ${subject}: ${count} skills`);
        }
      }

      this.results.gradeSubjectCounts = gradeSubjectCounts;
      return gradeSubjectCounts;
    } catch (error) {
      console.error(`❌ Failed to get grade-subject counts: ${error.message}`);
      return {};
    }
  }

  // 3. Get sample records specifically from grade '7'
  async getGrade7Samples() {
    console.log('\n🔍 3. Getting sample records specifically from grade "7"...');
    
    try {
      const { data, error } = await supabase
        .from('skills_master')
        .select('*')
        .eq('grade', '7')
        .order('subject')
        .order('skill_number')
        .limit(10);

      if (error) {
        throw new Error(`Failed to fetch Grade 7 samples: ${error.message}`);
      }

      console.log('\n   📋 SAMPLE RECORDS FROM GRADE "7":');
      console.log('   ==================================');
      
      if (!data || data.length === 0) {
        console.log('   ❌ NO RECORDS FOUND FOR GRADE "7"');
        this.results.grade7Samples = [];
        return [];
      }

      for (let i = 0; i < data.length; i++) {
        const record = data[i];
        console.log(`\n   ${i + 1}. ID: ${record.id}`);
        console.log(`      Grade: "${record.grade}"`);
        console.log(`      Subject: ${record.subject}`);
        console.log(`      Skill: ${record.skill_name}`);
        console.log(`      Area: ${record.skills_area || 'N/A'}`);
        console.log(`      Created: ${record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}`);
      }

      this.results.grade7Samples = data;
      return data;
    } catch (error) {
      console.error(`❌ Failed to get Grade 7 samples: ${error.message}`);
      return [];
    }
  }

  // 4. Check for alternative grade formats
  async checkAlternativeGradeFormats() {
    console.log('\n🔍 4. Checking for alternative grade formats...');
    
    const alternativeFormats = [
      'Grade 7',
      '7th',
      'Seventh',
      'grade 7',
      'GRADE 7',
      'G7',
      'Gr7',
      'Level 7'
    ];

    console.log('\n   🔎 SEARCHING FOR ALTERNATIVE GRADE 7 FORMATS:');
    console.log('   ===============================================');
    
    const foundAlternatives = {};

    for (const format of alternativeFormats) {
      try {
        const { count, error } = await supabase
          .from('skills_master')
          .select('*', { count: 'exact', head: true })
          .eq('grade', format);

        if (error) {
          console.log(`      ❌ Error checking "${format}": ${error.message}`);
          continue;
        }

        const recordCount = count || 0;
        console.log(`      📊 "${format}": ${recordCount} records`);
        
        if (recordCount > 0) {
          foundAlternatives[format] = recordCount;
        }
      } catch (error) {
        console.log(`      ❌ Error checking "${format}": ${error.message}`);
      }
    }

    // Also check for any grade containing '7'
    try {
      const { data, error } = await supabase
        .from('skills_master')
        .select('grade')
        .textSearch('grade', '7');

      if (!error && data && data.length > 0) {
        console.log('\n   🔎 GRADES CONTAINING "7" (text search):');
        const gradesContaining7 = {};
        for (const record of data) {
          const grade = record.grade;
          gradesContaining7[grade] = (gradesContaining7[grade] || 0) + 1;
        }
        
        for (const [grade, count] of Object.entries(gradesContaining7)) {
          console.log(`      📊 "${grade}": ${count} records`);
        }
      }
    } catch (error) {
      console.log(`      ❌ Text search failed: ${error.message}`);
    }

    this.results.alternativeFormats = foundAlternatives;
    return foundAlternatives;
  }

  // 5. Cross-reference with import summary expectations
  async crossReferenceImportSummary() {
    console.log('\n🔍 5. Cross-referencing with import summary expectations...');
    
    const importSummaryExpected = {
      'Math_7': 383,
      'ELA_7': 219,
      'Science_7': 181,
      'SocialStudies_7': 255
    };

    console.log('\n   📊 EXPECTED vs ACTUAL GRADE 7 COUNTS:');
    console.log('   ======================================');
    
    const grade7Data = this.results.gradeSubjectCounts?.['7'] || {};
    
    console.log(`   Expected from import summary:`);
    for (const [subject, expectedCount] of Object.entries(importSummaryExpected)) {
      const subjectName = subject.replace('_7', '');
      console.log(`      📖 ${subjectName}: ${expectedCount} skills expected`);
    }

    console.log(`\n   Actual in database for grade "7":`);
    if (Object.keys(grade7Data).length === 0) {
      console.log(`      ❌ NO RECORDS FOUND FOR GRADE "7"`);
    } else {
      for (const [subject, actualCount] of Object.entries(grade7Data)) {
        console.log(`      📖 ${subject}: ${actualCount} skills found`);
      }
    }

    // Calculate total expected vs actual
    const totalExpected = Object.values(importSummaryExpected).reduce((sum, count) => sum + count, 0);
    const totalActual = Object.values(grade7Data).reduce((sum, count) => sum + count, 0);
    
    console.log(`\n   📊 TOTALS:`);
    console.log(`      Expected Grade 7 total: ${totalExpected} skills`);
    console.log(`      Actual Grade 7 total: ${totalActual} skills`);
    console.log(`      Difference: ${totalActual - totalExpected} skills`);

    if (totalActual === 0) {
      console.log(`      ❌ CRITICAL: No Grade 7 skills found in database!`);
    } else if (Math.abs(totalActual - totalExpected) <= 10) {
      console.log(`      ✅ Counts match within acceptable range`);
    } else {
      console.log(`      ⚠️  Significant difference detected`);
    }

    return { expected: totalExpected, actual: totalActual };
  }

  // Generate detailed report
  generateDetailedReport() {
    console.log('\n\n' + '='.repeat(80));
    console.log('📋 DETAILED GRADE VERIFICATION REPORT');
    console.log('='.repeat(80));

    const timestamp = new Date().toLocaleString();
    console.log(`🕐 Generated: ${timestamp}\n`);

    // Summary of findings
    console.log('🔍 KEY FINDINGS:');
    console.log('================');
    
    const allGrades = this.results.allGrades || {};
    const hasGrade7 = allGrades.hasOwnProperty('7');
    const grade7Count = allGrades['7'] || 0;
    
    console.log(`1. Grade "7" found: ${hasGrade7 ? '✅ YES' : '❌ NO'}`);
    console.log(`2. Grade "7" record count: ${grade7Count}`);
    
    if (grade7Count > 0) {
      console.log(`3. Status: ✅ Grade 7 data is present and accessible`);
    } else {
      console.log(`3. Status: ❌ Grade 7 data is missing or incorrectly formatted`);
    }

    // Alternative formats found
    const alternativeFormats = this.results.alternativeFormats || {};
    if (Object.keys(alternativeFormats).length > 0) {
      console.log(`4. Alternative formats found:`);
      for (const [format, count] of Object.entries(alternativeFormats)) {
        console.log(`   - "${format}": ${count} records`);
      }
    } else {
      console.log(`4. Alternative grade formats: None found`);
    }

    console.log('\n💡 DIAGNOSIS:');
    console.log('==============');
    
    if (hasGrade7 && grade7Count > 0) {
      console.log('✅ RESOLUTION: Grade 7 skills are present in the database');
      console.log('   - The grade field contains exactly "7" as expected');
      console.log('   - Previous verification may have had a query issue');
      console.log('   - Verify your application code is searching for grade "7" correctly');
    } else if (Object.keys(alternativeFormats).length > 0) {
      console.log('⚠️  RESOLUTION: Grade 7 skills exist but with different formatting');
      console.log('   - Skills were imported with alternative grade format');
      console.log('   - Application code may need to be updated to handle the actual format');
      console.log('   - Consider data migration to standardize grade format');
    } else {
      console.log('❌ PROBLEM CONFIRMED: Grade 7 skills are genuinely missing');
      console.log('   - Import process may have failed for Grade 7 specifically');
      console.log('   - Excel source data should be re-examined');
      console.log('   - Re-run import process with debugging enabled');
    }

    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('========================');
    
    if (hasGrade7) {
      console.log('1. ✅ No action needed - Grade 7 data is properly available');
      console.log('2. 🧪 Test application functionality with Grade 7 assignments');
      console.log('3. 🔍 Review any application code that queries for Grade 7 skills');
    } else {
      console.log('1. 🔄 Re-examine the Excel import source files');
      console.log('2. 🧪 Run the import script with debug logging enabled');
      console.log('3. 🔍 Verify the Grade 7 data exists in the Excel files');
      console.log('4. 🚀 Re-run the import process if data is missing');
    }

    console.log('\n' + '='.repeat(80));
    console.log('📋 DETAILED VERIFICATION COMPLETE');
    console.log('='.repeat(80));

    return this.results;
  }

  // Main verification process
  async runDetailedVerification() {
    console.log('🚀 STARTING DETAILED GRADE VERIFICATION');
    console.log('='.repeat(80));
    console.log('🎯 Focus: Investigating Grade 7 data availability and formatting\n');

    try {
      // Step 1: Get all unique grades
      await this.getAllUniqueGrades();

      // Step 2: Count subjects by grade
      await this.getSubjectCountsByGrade();

      // Step 3: Get Grade 7 samples
      await this.getGrade7Samples();

      // Step 4: Check alternative formats
      await this.checkAlternativeGradeFormats();

      // Step 5: Cross-reference with import summary
      await this.crossReferenceImportSummary();

      // Step 6: Generate final report
      this.generateDetailedReport();

      return true;
    } catch (error) {
      console.error('❌ Detailed verification failed:', error.message);
      return false;
    }
  }
}

// ================================================================
// MAIN EXECUTION
// ================================================================

async function main() {
  try {
    const verifier = new DetailedGradeVerifier();
    const success = await verifier.runDetailedVerification();
    
    if (success) {
      console.log('\n🎉 Detailed verification completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Detailed verification failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Detailed verification process failed:', error.message);
    process.exit(1);
  }
}

// Run the detailed verification
main().catch(console.error);