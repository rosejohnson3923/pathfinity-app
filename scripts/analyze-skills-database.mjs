#!/usr/bin/env node

// ================================================================
// PATHFINITY SKILLS DATABASE ANALYSIS SCRIPT
// Analyze current skills_master table and compare with Excel files
// ================================================================

import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

// Load environment variables
config();

// ================================================================
// CONFIGURATION
// ================================================================

const EXCEL_FILES = [
  {
    name: 'MVP.xlsx', 
    path: './Skill Area By Grade_Categorized_MVP.xlsx',
    expectedSheets: ['Math_PreK', 'ELA_PreK', 'Math_K', 'ELA_K', 'Science_K', 'SocialStudies_K']
  },
  {
    name: 'MVP2.xlsx',
    path: './Skill Area By Grade_Categorized_MVP2.xlsx', 
    expectedSheets: [] // Will be determined dynamically
  }
];

// ================================================================
// SUPABASE CLIENT
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
// UTILITY FUNCTIONS
// ================================================================

class DatabaseAnalyzer {
  constructor() {
    this.databaseStats = null;
    this.excelStats = [];
  }

  // Analyze current database state
  async analyzeDatabaseState() {
    console.log('🔍 Analyzing current database state...\n');
    
    try {
      // Get total count
      const { count: totalCount, error: countError } = await supabase
        .from('skills_master')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Failed to get total count: ${countError.message}`);
      }

      console.log(`📊 Total records in skills_master: ${totalCount || 0}`);

      if (totalCount === 0) {
        console.log('⚠️  Database is empty - no skills have been imported yet.\n');
        this.databaseStats = {
          totalCount: 0,
          byGrade: {},
          bySubject: {},
          byGradeSubject: {},
          sampleRecords: []
        };
        return this.databaseStats;
      }

      // Get records grouped by grade and subject
      const { data: allRecords, error: dataError } = await supabase
        .from('skills_master')
        .select('*')
        .order('grade', { ascending: true })
        .order('subject', { ascending: true });

      if (dataError) {
        throw new Error(`Failed to fetch records: ${dataError.message}`);
      }

      // Analyze the data
      const stats = {
        totalCount: totalCount || 0,
        byGrade: {},
        bySubject: {},
        byGradeSubject: {},
        sampleRecords: allRecords?.slice(0, 5) || []
      };

      if (allRecords) {
        // Group by grade
        for (const record of allRecords) {
          const grade = record.grade || 'Unknown';
          const subject = record.subject || 'Unknown';
          const key = `${grade}_${subject}`;

          stats.byGrade[grade] = (stats.byGrade[grade] || 0) + 1;
          stats.bySubject[subject] = (stats.bySubject[subject] || 0) + 1;
          stats.byGradeSubject[key] = (stats.byGradeSubject[key] || 0) + 1;
        }
      }

      this.databaseStats = stats;
      this.printDatabaseStats();
      
      return stats;

    } catch (error) {
      console.error(`❌ Database analysis failed: ${error.message}`);
      return null;
    }
  }

  // Print database statistics
  printDatabaseStats() {
    const stats = this.databaseStats;
    
    console.log('\n📈 Database Statistics:');
    console.log('='.repeat(50));
    
    console.log('\n📚 By Grade:');
    for (const [grade, count] of Object.entries(stats.byGrade)) {
      console.log(`  ${grade}: ${count} skills`);
    }
    
    console.log('\n📖 By Subject:');
    for (const [subject, count] of Object.entries(stats.bySubject)) {
      console.log(`  ${subject}: ${count} skills`);
    }
    
    console.log('\n📋 By Grade-Subject Combination:');
    for (const [key, count] of Object.entries(stats.byGradeSubject)) {
      const [grade, subject] = key.split('_');
      console.log(`  ${grade} ${subject}: ${count} skills`);
    }

    if (stats.sampleRecords.length > 0) {
      console.log('\n🔍 Sample Records:');
      for (let i = 0; i < Math.min(3, stats.sampleRecords.length); i++) {
        const record = stats.sampleRecords[i];
        console.log(`  ${i + 1}. ${record.grade} ${record.subject}: ${record.skill_name}`);
        console.log(`     Area: ${record.skills_area}, Cluster: ${record.skills_cluster}`);
        console.log(`     Difficulty: ${record.difficulty_level}, Time: ${record.estimated_time_minutes}min`);
        console.log('');
      }
    }
  }

  // Analyze Excel files
  async analyzeExcelFiles() {
    console.log('\n📁 Analyzing Excel files...\n');

    for (const fileConfig of EXCEL_FILES) {
      if (!fs.existsSync(fileConfig.path)) {
        console.log(`⚠️  ${fileConfig.name} not found at ${fileConfig.path}`);
        continue;
      }

      console.log(`📖 Reading ${fileConfig.name}...`);
      
      try {
        const workbook = XLSX.readFile(fileConfig.path);
        const sheets = workbook.SheetNames;
        
        console.log(`  📄 Found ${sheets.length} sheets: ${sheets.join(', ')}`);

        const fileStats = {
          fileName: fileConfig.name,
          filePath: fileConfig.path,
          totalSheets: sheets.length,
          sheets: [],
          totalSkills: 0,
          byGrade: {},
          bySubject: {},
          byGradeSubject: {}
        };

        // Analyze each sheet
        for (const sheetName of sheets) {
          const sheetStats = this.analyzeSheet(workbook, sheetName);
          if (sheetStats) {
            fileStats.sheets.push(sheetStats);
            fileStats.totalSkills += sheetStats.rowCount;

            // Update aggregates
            const grade = sheetStats.grade || 'Unknown';
            const subject = sheetStats.subject || 'Unknown';
            const key = `${grade}_${subject}`;

            fileStats.byGrade[grade] = (fileStats.byGrade[grade] || 0) + sheetStats.rowCount;
            fileStats.bySubject[subject] = (fileStats.bySubject[subject] || 0) + sheetStats.rowCount;
            fileStats.byGradeSubject[key] = (fileStats.byGradeSubject[key] || 0) + sheetStats.rowCount;
          }
        }

        this.excelStats.push(fileStats);
        this.printExcelFileStats(fileStats);

      } catch (error) {
        console.error(`❌ Failed to read ${fileConfig.name}: ${error.message}`);
      }
    }
  }

  // Analyze individual sheet
  analyzeSheet(workbook, sheetName) {
    try {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        return null;
      }

      // Convert to JSON to count rows
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false
      });

      if (jsonData.length <= 1) {
        return {
          sheetName,
          rowCount: 0,
          hasData: false
        };
      }

      // Extract grade and subject from sheet name if possible
      const match = sheetName.match(/^([A-Za-z]+)_([A-Za-z-]+)$/);
      let subject = 'Unknown';
      let grade = 'Unknown';
      
      if (match) {
        subject = match[1];
        grade = match[2] === 'PreK' ? 'Pre-K' : match[2];
      }

      // Count non-empty data rows (excluding header)
      let dataRowCount = 0;
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        // Check if row has any non-empty cells
        if (row.some(cell => cell !== undefined && cell !== null && cell !== '')) {
          dataRowCount++;
        }
      }

      return {
        sheetName,
        rowCount: dataRowCount,
        hasData: dataRowCount > 0,
        subject,
        grade,
        headers: jsonData[0] || []
      };

    } catch (error) {
      console.error(`❌ Failed to analyze sheet ${sheetName}: ${error.message}`);
      return null;
    }
  }

  // Print Excel file statistics
  printExcelFileStats(fileStats) {
    console.log(`\n📊 ${fileStats.fileName} Statistics:`);
    console.log('-'.repeat(40));
    console.log(`  Total sheets: ${fileStats.totalSheets}`);
    console.log(`  Total skills: ${fileStats.totalSkills}`);
    
    console.log('\n  📋 Sheet Details:');
    for (const sheet of fileStats.sheets) {
      const status = sheet.hasData ? '✅' : '❌';
      console.log(`    ${status} ${sheet.sheetName}: ${sheet.rowCount} skills`);
      if (sheet.grade !== 'Unknown' && sheet.subject !== 'Unknown') {
        console.log(`        Grade: ${sheet.grade}, Subject: ${sheet.subject}`);
      }
    }

    console.log('\n  📚 By Grade:');
    for (const [grade, count] of Object.entries(fileStats.byGrade)) {
      console.log(`    ${grade}: ${count} skills`);
    }
    
    console.log('\n  📖 By Subject:');
    for (const [subject, count] of Object.entries(fileStats.bySubject)) {
      console.log(`    ${subject}: ${count} skills`);
    }
  }

  // Compare database with Excel files
  async compareWithExcel() {
    if (!this.databaseStats || this.excelStats.length === 0) {
      console.log('\n⚠️  Cannot compare - missing database or Excel data');
      return;
    }

    console.log('\n🔍 COMPARISON ANALYSIS');
    console.log('='.repeat(60));

    // Calculate total expected skills from Excel
    const totalExcelSkills = this.excelStats.reduce((sum, file) => sum + file.totalSkills, 0);
    const currentDbSkills = this.databaseStats.totalCount;

    console.log(`\n📊 Overall Summary:`);
    console.log(`  Expected from Excel: ${totalExcelSkills} skills`);
    console.log(`  Currently in database: ${currentDbSkills} skills`);
    console.log(`  Missing: ${Math.max(0, totalExcelSkills - currentDbSkills)} skills`);

    if (currentDbSkills === 0) {
      console.log('\n❌ CRITICAL: Database is completely empty!');
      console.log('   No skills have been imported yet.');
      console.log('   All Excel data is missing from the database.');
    } else if (currentDbSkills < totalExcelSkills) {
      console.log('\n⚠️  WARNING: Database is missing skills!');
      console.log(`   ${totalExcelSkills - currentDbSkills} skills are missing from the database.`);
    } else if (currentDbSkills > totalExcelSkills) {
      console.log('\n✅ Database has more skills than expected from Excel files.');
      console.log('   This may include skills from other sources or previous imports.');
    } else {
      console.log('\n✅ Database appears to have the expected number of skills.');
    }

    // Compare by file
    console.log('\n📁 By File Comparison:');
    for (const excelFile of this.excelStats) {
      console.log(`\n  ${excelFile.fileName}:`);
      console.log(`    Expected: ${excelFile.totalSkills} skills`);
      
      // Calculate how many skills from this file are in the database
      let foundInDb = 0;
      for (const [gradeSubject, count] of Object.entries(excelFile.byGradeSubject)) {
        const dbCount = this.databaseStats.byGradeSubject[gradeSubject] || 0;
        foundInDb += Math.min(count, dbCount);
      }
      
      console.log(`    Found in DB: ${foundInDb} skills`);
      console.log(`    Missing: ${excelFile.totalSkills - foundInDb} skills`);
      
      if (foundInDb === 0) {
        console.log('    ❌ NONE of this file\'s skills are in the database!');
      } else if (foundInDb < excelFile.totalSkills) {
        console.log('    ⚠️  This file is PARTIALLY missing from the database');
      } else {
        console.log('    ✅ This file appears to be fully imported');
      }
    }

    // Detailed grade-subject comparison
    console.log('\n📚 By Grade-Subject Comparison:');
    const allGradeSubjects = new Set([
      ...Object.keys(this.databaseStats.byGradeSubject),
      ...this.excelStats.flatMap(file => Object.keys(file.byGradeSubject))
    ]);

    for (const gradeSubject of Array.from(allGradeSubjects).sort()) {
      const [grade, subject] = gradeSubject.split('_');
      const dbCount = this.databaseStats.byGradeSubject[gradeSubject] || 0;
      
      let totalExpected = 0;
      let fileBreakdown = [];
      
      for (const excelFile of this.excelStats) {
        const fileCount = excelFile.byGradeSubject[gradeSubject] || 0;
        if (fileCount > 0) {
          totalExpected += fileCount;
          fileBreakdown.push(`${excelFile.fileName}: ${fileCount}`);
        }
      }

      if (totalExpected > 0 || dbCount > 0) {
        console.log(`\n  ${grade} ${subject}:`);
        console.log(`    In database: ${dbCount}`);
        console.log(`    Expected: ${totalExpected}`);
        if (fileBreakdown.length > 0) {
          console.log(`    Sources: ${fileBreakdown.join(', ')}`);
        }
        
        if (dbCount === 0 && totalExpected > 0) {
          console.log('    ❌ MISSING: Not found in database');
        } else if (dbCount < totalExpected) {
          console.log(`    ⚠️  PARTIAL: Missing ${totalExpected - dbCount} skills`);
        } else if (dbCount > totalExpected) {
          console.log(`    ℹ️  EXTRA: ${dbCount - totalExpected} additional skills in database`);
        } else {
          console.log('    ✅ COMPLETE: Fully imported');
        }
      }
    }
  }

  // Generate recommendations
  generateRecommendations() {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('='.repeat(60));

    if (!this.databaseStats) {
      console.log('❌ Cannot generate recommendations - database analysis failed');
      return;
    }

    if (this.databaseStats.totalCount === 0) {
      console.log('🚀 IMMEDIATE ACTION REQUIRED:');
      console.log('   1. Run the import script to import skills from Excel files');
      console.log('   2. Use: npm run import-skills:all');
      console.log('   3. Or run: node scripts/import-skills.mjs --all-prek-k');
      return;
    }

    const totalExcelSkills = this.excelStats.reduce((sum, file) => sum + file.totalSkills, 0);
    const currentDbSkills = this.databaseStats.totalCount;

    if (currentDbSkills < totalExcelSkills) {
      console.log('📋 ACTION ITEMS:');
      console.log('   1. Run import script to add missing skills');
      console.log('   2. Check which specific files are missing:');
      
      for (const excelFile of this.excelStats) {
        let foundInDb = 0;
        for (const [gradeSubject, count] of Object.entries(excelFile.byGradeSubject)) {
          const dbCount = this.databaseStats.byGradeSubject[gradeSubject] || 0;
          foundInDb += Math.min(count, dbCount);
        }
        
        if (foundInDb < excelFile.totalSkills) {
          console.log(`      - Import ${excelFile.fileName} (missing ${excelFile.totalSkills - foundInDb} skills)`);
        }
      }
      
      console.log('   3. Command: node scripts/import-skills.mjs --all-prek-k --file=<filename>');
    } else {
      console.log('✅ DATABASE STATUS: Good');
      console.log('   - All expected skills appear to be imported');
      console.log('   - No immediate action required');
    }

    console.log('\n🔧 MAINTENANCE SUGGESTIONS:');
    console.log('   1. Verify data quality with: npm run import-skills:dry-run');
    console.log('   2. Check for duplicates in skills_master table');
    console.log('   3. Validate skill difficulty levels and time estimates');
    console.log('   4. Test assignment generation with current skill set');
  }

  // Main analysis function
  async runAnalysis() {
    console.log('🎯 PATHFINITY SKILLS DATABASE ANALYSIS');
    console.log('='.repeat(60));
    console.log('');

    // Step 1: Analyze database
    await this.analyzeDatabaseState();

    // Step 2: Analyze Excel files
    await this.analyzeExcelFiles();

    // Step 3: Compare
    await this.compareWithExcel();

    // Step 4: Recommendations
    this.generateRecommendations();

    console.log('\n🎉 Analysis complete!');
    console.log('='.repeat(60));
  }
}

// ================================================================
// MAIN EXECUTION
// ================================================================

async function main() {
  try {
    const analyzer = new DatabaseAnalyzer();
    await analyzer.runAnalysis();
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Run the analysis
main().catch(console.error);