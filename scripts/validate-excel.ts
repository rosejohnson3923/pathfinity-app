#!/usr/bin/env node

// ================================================================
// EXCEL FILE VALIDATION SCRIPT
// Quick validation of Excel file structure before import
// ================================================================

const XLSX = require('xlsx');
import * as path from 'path';
import * as fs from 'fs';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    path: string;
    size: number;
    sheets: string[];
  };
  tabAnalysis: TabAnalysis[];
}

interface TabAnalysis {
  name: string;
  exists: boolean;
  rowCount: number;
  columnCount: number;
  hasHeaders: boolean;
  sampleData: any[];
  issues: string[];
}

const EXPECTED_TABS = ['Math_PreK', 'ELA_PreK', 'Math_K', 'ELA_K', 'Science_K', 'SocialStudies_K'];
const EXPECTED_COLUMNS = ['Subject', 'Grade', 'SkillsArea', 'SkillsCluster', 'SkillNumber', 'SkillName'];
const ALTERNATIVE_COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F'];

function findExcelFile(): string {
  const possiblePaths = [
    './Skill Area By Grade_Categorized_MVP.xlsx',
    './data/Skill Area By Grade_Categorized_MVP.xlsx',
    './Skill Area By Grade.xlsx',
    './data/Skill Area By Grade.xlsx'
  ];

  for (const filePath of possiblePaths) {
    const fullPath = path.resolve(filePath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  throw new Error(`Excel file not found at any of these locations:\n${possiblePaths.join('\n')}`);
}

function analyzeTab(workbook: XLSX.WorkBook, tabName: string): TabAnalysis {
  const analysis: TabAnalysis = {
    name: tabName,
    exists: false,
    rowCount: 0,
    columnCount: 0,
    hasHeaders: false,
    sampleData: [],
    issues: []
  };

  if (!workbook.Sheets[tabName]) {
    analysis.issues.push('Tab does not exist in Excel file');
    return analysis;
  }

  analysis.exists = true;
  const worksheet = workbook.Sheets[tabName];

  // Get range and dimensions
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  analysis.rowCount = range.e.r + 1;
  analysis.columnCount = range.e.c + 1;

  // Convert to JSON to analyze structure
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false
  }) as any[][];

  if (jsonData.length === 0) {
    analysis.issues.push('Tab contains no data');
    return analysis;
  }

  // Check headers
  const headers = jsonData[0] as string[];
  analysis.hasHeaders = headers.length > 0;

  // Check for expected column structure
  const hasStandardColumns = EXPECTED_COLUMNS.every(col => headers.includes(col));
  const hasAlternativeColumns = ALTERNATIVE_COLUMNS.every(col => headers.includes(col));

  if (!hasStandardColumns && !hasAlternativeColumns) {
    analysis.issues.push('Missing expected columns. Expected either standard headers (Subject, Grade, etc.) or column letters (A, B, C, etc.)');
    analysis.issues.push(`Found headers: ${headers.join(', ')}`);
  }

  // Get sample data (first 3 rows after headers)
  const dataRows = jsonData.slice(1, 4);
  analysis.sampleData = dataRows.map((row, index) => {
    const rowData: any = {};
    headers.forEach((header, colIndex) => {
      if (header && row[colIndex] !== undefined) {
        rowData[header] = row[colIndex];
      }
    });
    return { row: index + 2, data: rowData }; // +2 for 1-indexed Excel rows + header
  });

  // Validate sample data
  for (const sample of analysis.sampleData) {
    const skillName = sample.data.SkillName || sample.data.F;
    if (!skillName || skillName.toString().trim() === '') {
      analysis.issues.push(`Row ${sample.row}: Missing skill name`);
    }

    const subject = sample.data.Subject || sample.data.A;
    if (subject && !['Math', 'ELA', 'Science', 'SocialStudies'].includes(subject)) {
      analysis.issues.push(`Row ${sample.row}: Invalid subject '${subject}'`);
    }

    const grade = sample.data.Grade || sample.data.B;
    if (grade && !['Pre-K', 'K', 'PreK'].includes(grade)) {
      analysis.issues.push(`Row ${sample.row}: Invalid grade '${grade}'`);
    }
  }

  return analysis;
}

function validateExcelFile(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    fileInfo: {
      path: '',
      size: 0,
      sheets: []
    },
    tabAnalysis: []
  };

  try {
    // Find and read Excel file
    const filePath = findExcelFile();
    result.fileInfo.path = filePath;
    
    // Get file size
    const stats = fs.statSync(filePath);
    result.fileInfo.size = stats.size;

    // Read workbook
    const workbook = XLSX.readFile(filePath);
    result.fileInfo.sheets = workbook.SheetNames;

    console.log(`📄 Excel File Analysis`);
    console.log(`File: ${path.basename(filePath)}`);
    console.log(`Size: ${(result.fileInfo.size / 1024).toFixed(2)} KB`);
    console.log(`Sheets: ${result.fileInfo.sheets.length}`);
    console.log(`Available sheets: ${result.fileInfo.sheets.join(', ')}`);
    console.log('');

    // Check for expected tabs
    const missingTabs = EXPECTED_TABS.filter(tab => !result.fileInfo.sheets.includes(tab));
    if (missingTabs.length > 0) {
      result.warnings.push(`Missing expected tabs: ${missingTabs.join(', ')}`);
    }

    const extraTabs = result.fileInfo.sheets.filter(tab => !EXPECTED_TABS.includes(tab));
    if (extraTabs.length > 0) {
      result.warnings.push(`Found additional tabs: ${extraTabs.join(', ')}`);
    }

    // Analyze each expected tab
    for (const tabName of EXPECTED_TABS) {
      const analysis = analyzeTab(workbook, tabName);
      result.tabAnalysis.push(analysis);

      if (analysis.issues.length > 0) {
        result.errors.push(...analysis.issues.map(issue => `${tabName}: ${issue}`));
      }
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  // Determine overall validity
  result.isValid = result.errors.length === 0;

  return result;
}

function printValidationReport(result: ValidationResult): void {
  console.log('='.repeat(60));
  console.log('📊 EXCEL FILE VALIDATION REPORT');
  console.log('='.repeat(60));
  
  // Overall status
  const status = result.isValid ? '✅ VALID' : '❌ INVALID';
  console.log(`Status: ${status}`);
  console.log('');

  // File info
  if (result.fileInfo.path) {
    console.log('📁 File Information:');
    console.log(`  Path: ${result.fileInfo.path}`);
    console.log(`  Size: ${(result.fileInfo.size / 1024).toFixed(2)} KB`);
    console.log(`  Sheets: ${result.fileInfo.sheets.length}`);
    console.log('');
  }

  // Tab analysis
  if (result.tabAnalysis.length > 0) {
    console.log('📋 Tab Analysis:');
    for (const tab of result.tabAnalysis) {
      const tabStatus = tab.exists ? (tab.issues.length === 0 ? '✅' : '⚠️') : '❌';
      console.log(`  ${tabStatus} ${tab.name}`);
      
      if (tab.exists) {
        console.log(`    Rows: ${tab.rowCount}, Columns: ${tab.columnCount}`);
        console.log(`    Headers: ${tab.hasHeaders ? 'Yes' : 'No'}`);
        
        if (tab.sampleData.length > 0) {
          console.log(`    Sample data:`);
          for (const sample of tab.sampleData) {
            const skillName = sample.data.SkillName || sample.data.F || 'N/A';
            const subject = sample.data.Subject || sample.data.A || 'N/A';
            console.log(`      Row ${sample.row}: ${subject} - ${skillName}`);
          }
        }
        
        if (tab.issues.length > 0) {
          console.log(`    Issues:`);
          for (const issue of tab.issues) {
            console.log(`      • ${issue}`);
          }
        }
      } else {
        console.log(`    Tab missing from Excel file`);
      }
      console.log('');
    }
  }

  // Errors
  if (result.errors.length > 0) {
    console.log('❌ Errors:');
    for (const error of result.errors) {
      console.log(`  • ${error}`);
    }
    console.log('');
  }

  // Warnings
  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    for (const warning of result.warnings) {
      console.log(`  • ${warning}`);
    }
    console.log('');
  }

  // Recommendations
  console.log('💡 Recommendations:');
  if (result.isValid) {
    console.log('  • File is ready for import!');
    console.log('  • Run: npm run import-skills:dry-run to test import process');
    console.log('  • Run: npm run import-skills:all to perform actual import');
  } else {
    console.log('  • Fix the errors listed above before attempting import');
    console.log('  • Ensure all expected tabs exist with correct column structure');
    console.log('  • Validate data format matches expected structure');
  }

  console.log('='.repeat(60));
}

// Main execution
async function main() {
  console.log('🔍 Validating Excel file structure...\n');
  
  try {
    const result = validateExcelFile();
    printValidationReport(result);
    
    process.exit(result.isValid ? 0 : 1);
  } catch (error) {
    console.error('❌ Validation failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);