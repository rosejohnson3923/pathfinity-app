#!/usr/bin/env node

// ================================================================
// PATHFINITY SKILLS IMPORT VERIFICATION SCRIPT
// Verify successful import and provide detailed verification report
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
// VERIFICATION FUNCTIONS
// ================================================================

class SkillsImportVerifier {
  constructor() {
    this.verificationReport = {
      totalCount: 0,
      gradeDistribution: {},
      subjectDistribution: {},
      gradeSubjectBreakdown: {},
      sampleRecords: {},
      verificationStatus: 'UNKNOWN'
    };
  }

  // Connect to database and verify connection
  async verifyConnection() {
    console.log('🔌 Connecting to Supabase database...');
    
    try {
      const { data, error } = await supabase
        .from('skills_master')
        .select('id')
        .limit(1);

      if (error) {
        throw new Error(`Connection failed: ${error.message}`);
      }

      console.log('✅ Database connection successful\n');
      return true;
    } catch (error) {
      console.error(`❌ Database connection failed: ${error.message}`);
      return false;
    }
  }

  // Count total records in skills_master table
  async getTotalRecordsCount() {
    console.log('📊 Counting total records in skills_master table...');
    
    try {
      const { count, error } = await supabase
        .from('skills_master')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(`Failed to count records: ${error.message}`);
      }

      this.verificationReport.totalCount = count || 0;
      console.log(`   Total records: ${this.verificationReport.totalCount}`);
      return this.verificationReport.totalCount;
    } catch (error) {
      console.error(`❌ Failed to count records: ${error.message}`);
      return 0;
    }
  }

  // Count records by grade level
  async getRecordsByGrade() {
    console.log('\n📚 Counting records by grade level...');
    
    try {
      const { data, error } = await supabase
        .from('skills_master')
        .select('grade')
        .order('grade');

      if (error) {
        throw new Error(`Failed to fetch grade data: ${error.message}`);
      }

      // Count by grade
      const gradeDistribution = {};
      if (data) {
        for (const record of data) {
          const grade = record.grade || 'Unknown';
          gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        }
      }

      this.verificationReport.gradeDistribution = gradeDistribution;

      console.log('   Grade distribution:');
      for (const [grade, count] of Object.entries(gradeDistribution)) {
        console.log(`     Grade ${grade}: ${count} skills`);
      }

      return gradeDistribution;
    } catch (error) {
      console.error(`❌ Failed to get grade distribution: ${error.message}`);
      return {};
    }
  }

  // Count records by subject
  async getRecordsBySubject() {
    console.log('\n📖 Counting records by subject...');
    
    try {
      const { data, error } = await supabase
        .from('skills_master')
        .select('subject, grade')
        .order('subject')
        .order('grade');

      if (error) {
        throw new Error(`Failed to fetch subject data: ${error.message}`);
      }

      // Count by subject and grade-subject combination
      const subjectDistribution = {};
      const gradeSubjectBreakdown = {};

      if (data) {
        for (const record of data) {
          const subject = record.subject || 'Unknown';
          const grade = record.grade || 'Unknown';
          const gradeSubjectKey = `Grade ${grade} ${subject}`;

          subjectDistribution[subject] = (subjectDistribution[subject] || 0) + 1;
          gradeSubjectBreakdown[gradeSubjectKey] = (gradeSubjectBreakdown[gradeSubjectKey] || 0) + 1;
        }
      }

      this.verificationReport.subjectDistribution = subjectDistribution;
      this.verificationReport.gradeSubjectBreakdown = gradeSubjectBreakdown;

      console.log('   Subject distribution:');
      for (const [subject, count] of Object.entries(subjectDistribution)) {
        console.log(`     ${subject}: ${count} skills`);
      }

      console.log('\n   Grade-Subject breakdown:');
      for (const [gradeSubject, count] of Object.entries(gradeSubjectBreakdown)) {
        console.log(`     ${gradeSubject}: ${count} skills`);
      }

      return { subjectDistribution, gradeSubjectBreakdown };
    } catch (error) {
      console.error(`❌ Failed to get subject distribution: ${error.message}`);
      return { subjectDistribution: {}, gradeSubjectBreakdown: {} };
    }
  }

  // Get sample records from each grade (1, 3, 7)
  async getSampleRecords() {
    console.log('\n🔍 Retrieving sample records from each new grade (1, 3, 7)...');
    
    const targetGrades = ['1', '3', '7'];
    const sampleRecords = {};

    for (const grade of targetGrades) {
      try {
        console.log(`\n   📋 Sample records from Grade ${grade}:`);
        
        const { data, error } = await supabase
          .from('skills_master')
          .select('*')
          .eq('grade', grade)
          .order('subject')
          .order('skill_number')
          .limit(3);

        if (error) {
          console.error(`     ❌ Failed to fetch Grade ${grade} samples: ${error.message}`);
          continue;
        }

        if (!data || data.length === 0) {
          console.log(`     ⚠️  No records found for Grade ${grade}`);
          sampleRecords[grade] = [];
          continue;
        }

        sampleRecords[grade] = data;

        for (let i = 0; i < data.length; i++) {
          const record = data[i];
          console.log(`     ${i + 1}. [${record.subject}] ${record.skill_name}`);
          console.log(`        Area: ${record.skills_area || 'N/A'}`);
          console.log(`        Cluster: ${record.skills_cluster || 'N/A'}`);
          console.log(`        Difficulty: ${record.difficulty_level || 'N/A'}, Time: ${record.estimated_time_minutes || 'N/A'}min`);
          console.log(`        Created: ${record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}`);
          if (i < data.length - 1) console.log('');
        }

      } catch (error) {
        console.error(`     ❌ Error fetching Grade ${grade} samples: ${error.message}`);
        sampleRecords[grade] = [];
      }
    }

    this.verificationReport.sampleRecords = sampleRecords;
    return sampleRecords;
  }

  // Verify expected curriculum completeness
  async verifyCurriculumCompleteness() {
    console.log('\n✅ Verifying curriculum completeness...');
    
    const importSummaryExpectations = {
      newSkillsInserted: 2302,
      existingSkillsSkipped: 1003,
      expectedTotal: 3304, // Approximately 3,304 skills
      expectedGrades: ['Pre-K', 'K', '1', '3', '7']
    };

    const currentTotal = this.verificationReport.totalCount;
    const currentGrades = Object.keys(this.verificationReport.gradeDistribution);

    console.log('   📊 Import Summary Verification:');
    console.log(`     Expected total: ~${importSummaryExpectations.expectedTotal} skills`);
    console.log(`     Actual total: ${currentTotal} skills`);
    
    const totalDifference = Math.abs(currentTotal - importSummaryExpectations.expectedTotal);
    if (totalDifference <= 10) {
      console.log(`     ✅ Total count matches expectation (within ±10)`);
    } else {
      console.log(`     ⚠️  Total count differs by ${totalDifference} skills`);
    }

    console.log('\n   📚 Grade Coverage Verification:');
    const expectedNewGrades = ['1', '3', '7'];
    const foundNewGrades = expectedNewGrades.filter(grade => currentGrades.includes(grade));
    
    console.log(`     Expected new grades: ${expectedNewGrades.join(', ')}`);
    console.log(`     Found new grades: ${foundNewGrades.join(', ')}`);
    
    if (foundNewGrades.length === expectedNewGrades.length) {
      console.log(`     ✅ All expected new grades are present`);
    } else {
      const missingGrades = expectedNewGrades.filter(grade => !foundNewGrades.includes(grade));
      console.log(`     ❌ Missing grades: ${missingGrades.join(', ')}`);
    }

    // Determine verification status
    if (currentTotal >= 3000 && foundNewGrades.length === 3) {
      this.verificationReport.verificationStatus = 'SUCCESS';
    } else if (currentTotal >= 2000 && foundNewGrades.length >= 2) {
      this.verificationReport.verificationStatus = 'PARTIAL_SUCCESS';
    } else {
      this.verificationReport.verificationStatus = 'FAILURE';
    }

    return this.verificationReport.verificationStatus;
  }

  // Generate final verification report
  generateVerificationReport() {
    console.log('\n\n' + '='.repeat(80));
    console.log('📋 PATHFINITY SKILLS IMPORT VERIFICATION REPORT');
    console.log('='.repeat(80));

    const report = this.verificationReport;
    const timestamp = new Date().toLocaleString();

    console.log(`🕐 Generated: ${timestamp}`);
    console.log(`📊 Database Status: ${report.verificationStatus}`);

    console.log('\n🔢 TOTAL RECORDS SUMMARY:');
    console.log(`   Total skills in database: ${report.totalCount}`);
    
    if (report.totalCount >= 3000) {
      console.log('   ✅ Total count indicates successful import');
    } else if (report.totalCount >= 1000) {
      console.log('   ⚠️  Partial import detected');
    } else {
      console.log('   ❌ Import appears incomplete');
    }

    console.log('\n📚 GRADE LEVEL DISTRIBUTION:');
    for (const [grade, count] of Object.entries(report.gradeDistribution)) {
      const status = count > 0 ? '✅' : '❌';
      console.log(`   ${status} Grade ${grade}: ${count} skills`);
    }

    console.log('\n📖 SUBJECT DISTRIBUTION:');
    for (const [subject, count] of Object.entries(report.subjectDistribution)) {
      const status = count > 0 ? '✅' : '❌';
      console.log(`   ${status} ${subject}: ${count} skills`);
    }

    console.log('\n📋 DETAILED GRADE-SUBJECT BREAKDOWN:');
    for (const [gradeSubject, count] of Object.entries(report.gradeSubjectBreakdown)) {
      console.log(`   📌 ${gradeSubject}: ${count} skills`);
    }

    console.log('\n🔍 SAMPLE RECORDS VERIFICATION:');
    const newGrades = ['1', '3', '7'];
    for (const grade of newGrades) {
      const samples = report.sampleRecords[grade] || [];
      if (samples.length > 0) {
        console.log(`   ✅ Grade ${grade}: ${samples.length} sample records retrieved`);
        console.log(`      First skill: "${samples[0].skill_name}" (${samples[0].subject})`);
      } else {
        console.log(`   ❌ Grade ${grade}: No sample records found`);
      }
    }

    console.log('\n🎯 CURRICULUM COMPLETENESS ASSESSMENT:');
    switch (report.verificationStatus) {
      case 'SUCCESS':
        console.log('   ✅ COMPLETE: All expected skills have been successfully imported');
        console.log('   📚 The database now contains the full curriculum as expected');
        console.log('   🚀 Platform is ready for production use with all grade levels');
        break;
      case 'PARTIAL_SUCCESS':
        console.log('   ⚠️  PARTIAL: Most skills imported, but some may be missing');
        console.log('   📚 Review specific grade-subject combinations for completeness');
        console.log('   🔧 Consider re-running import for missing sections');
        break;
      case 'FAILURE':
        console.log('   ❌ INCOMPLETE: Significant number of skills are missing');
        console.log('   📚 Database does not contain the expected full curriculum');
        console.log('   🚨 Import process needs to be re-executed');
        break;
      default:
        console.log('   ❓ UNKNOWN: Unable to determine import status');
    }

    console.log('\n💡 RECOMMENDATIONS:');
    if (report.verificationStatus === 'SUCCESS') {
      console.log('   1. ✅ Import verification successful - no action needed');
      console.log('   2. 🧪 Run application tests to verify functionality');
      console.log('   3. 🔍 Monitor student assignment generation');
      console.log('   4. 📊 Begin collecting performance analytics');
    } else {
      console.log('   1. 🔄 Review import logs for any errors or warnings');
      console.log('   2. 🧪 Run dry-run import to identify missing data');
      console.log('   3. 📂 Verify Excel source files are complete and accessible');
      console.log('   4. 🚀 Re-run import process for missing grade levels');
    }

    console.log('\n' + '='.repeat(80));
    console.log('📋 VERIFICATION COMPLETE');
    console.log('='.repeat(80));

    return report;
  }

  // Main verification process
  async runVerification() {
    console.log('🚀 STARTING PATHFINITY SKILLS IMPORT VERIFICATION');
    console.log('='.repeat(80));
    console.log('');

    // Step 1: Verify database connection
    const connected = await this.verifyConnection();
    if (!connected) {
      console.error('❌ Cannot proceed without database connection');
      return false;
    }

    // Step 2: Count total records
    await this.getTotalRecordsCount();

    // Step 3: Analyze by grade level
    await this.getRecordsByGrade();

    // Step 4: Analyze by subject
    await this.getRecordsBySubject();

    // Step 5: Get sample records
    await this.getSampleRecords();

    // Step 6: Verify completeness
    await this.verifyCurriculumCompleteness();

    // Step 7: Generate final report
    this.generateVerificationReport();

    return true;
  }
}

// ================================================================
// MAIN EXECUTION
// ================================================================

async function main() {
  try {
    const verifier = new SkillsImportVerifier();
    const success = await verifier.runVerification();
    
    if (success) {
      console.log('\n🎉 Verification completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Verification failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Verification process failed:', error.message);
    process.exit(1);
  }
}

// Run the verification
main().catch(console.error);