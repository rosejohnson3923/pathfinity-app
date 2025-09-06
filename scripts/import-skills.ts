#!/usr/bin/env node

// ================================================================
// PATHFINITY SKILLS IMPORT SCRIPT
// Import skills data from Excel file into Supabase database
// ================================================================

import * as XLSX from 'xlsx';
import { Command } from 'commander';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Import types
import type {
  ExcelImportConfig,
  ExcelSkillRow,
  ProcessedSkillData,
  TabInfo,
  ImportStats,
  TabImportResult,
  ImportError,
  ImportOptions,
  ColumnMapping,
  ImportReport,
  ImportLogger,
  ProgressCallback,
  ValidationRule
} from '../src/types/excel-import';

import {
  DEFAULT_COLUMN_MAPPINGS,
  TAB_CONFIGURATIONS,
  DIFFICULTY_RULES,
  TIME_ESTIMATION_RULES,
  VALIDATION_RULES
} from '../src/types/excel-import';

// Load environment variables
config();

// ================================================================
// CONFIGURATION
// ================================================================

const DEFAULT_CONFIG: ExcelImportConfig = {
  filePath: './Skill Area By Grade_Categorized_MVP.xlsx',
  fallbackPaths: [
    './data/Skill Area By Grade_Categorized_MVP.xlsx',
    './Skill Area By Grade.xlsx',
    './data/Skill Area By Grade.xlsx'
  ],
  targetTabs: ['Math_PreK', 'ELA_PreK', 'Math_K', 'ELA_K', 'Science_K', 'SocialStudies_K'],
  batchSize: 50,
  dryRun: false,
  verbose: false
};

// ================================================================
// LOGGER IMPLEMENTATION
// ================================================================

class ConsoleLogger implements ImportLogger {
  private logLevel: string;
  private verbose: boolean;

  constructor(logLevel: string = 'info', verbose: boolean = false) {
    this.logLevel = logLevel;
    this.verbose = verbose;
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex <= currentIndex;
  }

  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(`❌ ERROR: ${message}`);
      if (data && this.verbose) {
        console.error(JSON.stringify(data, null, 2));
      }
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️  WARN: ${message}`);
      if (data && this.verbose) {
        console.warn(JSON.stringify(data, null, 2));
      }
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(`ℹ️  INFO: ${message}`);
      if (data && this.verbose) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(`🔍 DEBUG: ${message}`);
      if (data && this.verbose) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  progress(message: string): void {
    console.log(`🔄 ${message}`);
  }
}

// ================================================================
// EXCEL FILE HANDLER
// ================================================================

class ExcelFileHandler {
  private logger: ImportLogger;
  private config: ExcelImportConfig;

  constructor(config: ExcelImportConfig, logger: ImportLogger) {
    this.config = config;
    this.logger = logger;
  }

  // Find Excel file at configured paths
  findExcelFile(): string {
    const possiblePaths = [this.config.filePath, ...this.config.fallbackPaths];
    
    for (const filePath of possiblePaths) {
      const fullPath = path.resolve(filePath);
      this.logger.debug(`Checking for Excel file at: ${fullPath}`);
      
      if (fs.existsSync(fullPath)) {
        this.logger.info(`Excel file found: ${fullPath}`);
        return fullPath;
      }
    }

    throw new Error(`Excel file not found at any of these locations:\n${possiblePaths.join('\n')}`);
  }

  // Read Excel file and return workbook
  readExcelFile(filePath: string): XLSX.WorkBook {
    try {
      this.logger.progress(`Reading Excel file: ${path.basename(filePath)}`);
      const workbook = XLSX.readFile(filePath);
      this.logger.info(`Excel file loaded successfully. Found ${workbook.SheetNames.length} sheets`);
      this.logger.debug('Available sheets:', workbook.SheetNames);
      return workbook;
    } catch (error) {
      throw new Error(`Failed to read Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get tab information
  getTabInfo(workbook: XLSX.WorkBook, tabName: string): TabInfo {
    const worksheet = workbook.Sheets[tabName];
    if (!worksheet) {
      throw new Error(`Tab '${tabName}' not found in Excel file`);
    }

    // Parse tab name to extract subject and grade
    const { subject, grade } = this.parseTabName(tabName);

    // Get row count
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const rowCount = range.e.r + 1; // +1 because range is 0-indexed

    return {
      name: tabName,
      subject,
      grade,
      rowCount,
      validRows: 0, // Will be calculated during processing
      errors: []
    };
  }

  // Parse tab name to extract subject and grade
  private parseTabName(tabName: string): { subject: string; grade: string } {
    const config = TAB_CONFIGURATIONS.standard;
    const match = tabName.match(config.pattern);

    if (!match) {
      throw new Error(`Tab name '${tabName}' does not match expected pattern`);
    }

    const [, subjectKey, gradeKey] = match;
    const subject = config.subjectMap[subjectKey];
    const grade = config.gradeMap[gradeKey];

    if (!subject || !grade) {
      throw new Error(`Unable to parse subject/grade from tab name '${tabName}'`);
    }

    return { subject, grade };
  }

  // Read data from a specific tab
  readTabData(workbook: XLSX.WorkBook, tabName: string): ExcelSkillRow[] {
    this.logger.progress(`Reading data from tab: ${tabName}`);
    
    const worksheet = workbook.Sheets[tabName];
    if (!worksheet) {
      throw new Error(`Tab '${tabName}' not found`);
    }

    // Convert worksheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false
    }) as any[][];

    if (jsonData.length === 0) {
      this.logger.warn(`Tab '${tabName}' contains no data`);
      return [];
    }

    // Get headers from first row
    const headers = jsonData[0] as string[];
    this.logger.debug(`Headers found in ${tabName}:`, headers);

    // Convert to objects using headers
    const data: ExcelSkillRow[] = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowData: ExcelSkillRow = {};

      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          rowData[header] = row[index];
        }
      });

      // Skip empty rows
      if (this.isRowEmpty(rowData)) {
        continue;
      }

      data.push(rowData);
    }

    this.logger.info(`Read ${data.length} data rows from tab '${tabName}'`);
    return data;
  }

  // Check if a row is empty
  private isRowEmpty(row: ExcelSkillRow): boolean {
    return Object.values(row).every(value => 
      value === undefined || value === null || value === ''
    );
  }
}

// ================================================================
// DATA PROCESSOR
// ================================================================

class SkillDataProcessor {
  private logger: ImportLogger;

  constructor(logger: ImportLogger) {
    this.logger = logger;
  }

  // Process Excel rows into validated skill data
  processTabData(
    tabInfo: TabInfo,
    excelRows: ExcelSkillRow[],
    columnMapping?: ColumnMapping
  ): { validSkills: ProcessedSkillData[]; errors: ImportError[] } {
    this.logger.progress(`Processing ${excelRows.length} rows from tab ${tabInfo.name}`);

    const validSkills: ProcessedSkillData[] = [];
    const errors: ImportError[] = [];
    const mapping = columnMapping || this.detectColumnMapping(excelRows);

    for (let i = 0; i < excelRows.length; i++) {
      const row = excelRows[i];
      
      try {
        const processedSkill = this.processRow(row, tabInfo, mapping, i + 2); // +2 for Excel row number (1-indexed + header)
        
        if (processedSkill) {
          // Validate the processed skill
          const validationErrors = this.validateSkill(processedSkill, i + 2);
          
          if (validationErrors.length === 0) {
            validSkills.push(processedSkill);
          } else {
            errors.push(...validationErrors);
          }
        }
      } catch (error) {
        errors.push({
          type: 'PARSE',
          message: `Failed to process row: ${error instanceof Error ? error.message : 'Unknown error'}`,
          row: i + 2,
          data: row
        });
      }
    }

    this.logger.info(`Processed ${validSkills.length} valid skills from ${tabInfo.name}`);
    if (errors.length > 0) {
      this.logger.warn(`Found ${errors.length} errors in ${tabInfo.name}`);
    }

    return { validSkills, errors };
  }

  // Detect column mapping from data
  private detectColumnMapping(rows: ExcelSkillRow[]): ColumnMapping {
    if (rows.length === 0) {
      return DEFAULT_COLUMN_MAPPINGS.standard;
    }

    const firstRow = rows[0];
    const keys = Object.keys(firstRow);

    // Try to match with standard mapping
    const standardMapping = DEFAULT_COLUMN_MAPPINGS.standard;
    const hasStandardColumns = Object.values(standardMapping).every(col => 
      col ? keys.includes(col) : true
    );

    if (hasStandardColumns) {
      this.logger.debug('Using standard column mapping');
      return standardMapping;
    }

    // Try alternative mapping (A, B, C, etc.)
    const alternativeMapping = DEFAULT_COLUMN_MAPPINGS.alternative;
    const hasAlternativeColumns = Object.values(alternativeMapping).every(col => 
      col ? keys.includes(col) : true
    );

    if (hasAlternativeColumns) {
      this.logger.debug('Using alternative column mapping');
      return alternativeMapping;
    }

    this.logger.warn('No standard column mapping detected, using default');
    return standardMapping;
  }

  // Process a single row
  private processRow(
    row: ExcelSkillRow,
    tabInfo: TabInfo,
    mapping: ColumnMapping,
    rowNumber: number
  ): ProcessedSkillData | null {
    
    // Extract basic data
    const skillName = this.getColumnValue(row, mapping.skillName);
    if (!skillName) {
      return null; // Skip rows without skill names
    }

    const skillsArea = this.getColumnValue(row, mapping.skillsArea) || 'General';
    const skillsCluster = this.getColumnValue(row, mapping.skillsCluster) || 'A';
    const skillNumber = this.getColumnValue(row, mapping.skillNumber) || `${skillsCluster}.${rowNumber}`;
    const skillDescription = this.getColumnValue(row, mapping.skillDescription);

    // Calculate difficulty level
    const difficultyLevel = this.calculateDifficulty(skillName, tabInfo.grade, skillNumber);
    
    // Calculate estimated time
    const estimatedTime = this.calculateEstimatedTime(difficultyLevel, tabInfo.grade, tabInfo.subject);

    return {
      subject: tabInfo.subject as any,
      grade: tabInfo.grade as any,
      skills_area: skillsArea,
      skills_cluster: skillsCluster,
      skill_number: skillNumber,
      skill_name: skillName,
      skill_description: skillDescription || undefined,
      difficulty_level: difficultyLevel,
      estimated_time_minutes: estimatedTime,
      prerequisites: undefined // TODO: Implement prerequisite detection
    };
  }

  // Get column value with fallback
  private getColumnValue(row: ExcelSkillRow, columnName?: string): string {
    if (!columnName || !row[columnName]) {
      return '';
    }
    return String(row[columnName]).trim();
  }

  // Calculate difficulty level based on skill content and grade
  private calculateDifficulty(skillName: string, grade: string, skillNumber: string): number {
    const rule = DIFFICULTY_RULES[grade];
    if (!rule) {
      return 3; // Default difficulty
    }

    let difficulty = rule.baseLevel;

    // Adjust based on skill number (later skills are typically harder)
    const numberMatch = skillNumber.match(/(\d+)/);
    if (numberMatch) {
      const number = parseInt(numberMatch[1]);
      difficulty += Math.floor(number * rule.skillNumberMultiplier);
    }

    // Adjust based on keywords in skill name
    const lowerSkillName = skillName.toLowerCase();
    for (const [keyword, adjustment] of Object.entries(rule.keywordAdjustments)) {
      if (lowerSkillName.includes(keyword)) {
        difficulty += adjustment;
        break; // Only apply first matching keyword
      }
    }

    // Ensure difficulty is within valid range
    return Math.max(1, Math.min(10, difficulty));
  }

  // Calculate estimated time based on difficulty, grade, and subject
  private calculateEstimatedTime(difficulty: number, grade: string, subject: string): number {
    const rule = TIME_ESTIMATION_RULES[grade];
    if (!rule) {
      return 15; // Default time
    }

    let time = rule.baseMinutes + (difficulty * rule.difficultyMultiplier);
    
    // Adjust based on subject
    const subjectAdjustment = rule.subjectAdjustments[subject] || 1.0;
    time *= subjectAdjustment;

    // Round to nearest 5 minutes
    return Math.max(5, Math.round(time / 5) * 5);
  }

  // Validate processed skill data
  private validateSkill(skill: ProcessedSkillData, rowNumber: number): ImportError[] {
    const errors: ImportError[] = [];

    for (const rule of VALIDATION_RULES) {
      const value = skill[rule.field];
      
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          type: 'VALIDATION',
          message: `Required field '${rule.field}' is missing: ${rule.errorMessage}`,
          row: rowNumber,
          data: { field: rule.field, value }
        });
        continue;
      }

      if (value !== undefined && value !== null && !rule.validator(value)) {
        errors.push({
          type: 'VALIDATION',
          message: `Invalid value for '${rule.field}': ${rule.errorMessage}`,
          row: rowNumber,
          data: { field: rule.field, value }
        });
      }
    }

    return errors;
  }
}

// ================================================================
// SUPABASE IMPORTER
// ================================================================

class SupabaseImporter {
  private supabase: any;
  private logger: ImportLogger;
  private dryRun: boolean;

  constructor(logger: ImportLogger, dryRun: boolean = false) {
    this.logger = logger;
    this.dryRun = dryRun;

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.logger.info('Supabase client initialized');
  }

  // Import skills in batches
  async importSkills(skills: ProcessedSkillData[], batchSize: number = 50): Promise<TabImportResult> {
    const startTime = Date.now();
    let insertedCount = 0;
    let skippedCount = 0;
    const errors: ImportError[] = [];

    this.logger.progress(`Starting import of ${skills.length} skills (batch size: ${batchSize})`);

    if (this.dryRun) {
      this.logger.info('DRY RUN MODE: No data will be inserted into database');
      return {
        tabName: 'dry-run',
        success: true,
        rowsProcessed: skills.length,
        rowsInserted: 0,
        rowsSkipped: 0,
        errors: [],
        processingTime: Date.now() - startTime
      };
    }

    // Process in batches
    for (let i = 0; i < skills.length; i += batchSize) {
      const batch = skills.slice(i, i + batchSize);
      
      try {
        this.logger.progress(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(skills.length / batchSize)} (${batch.length} skills)`);
        
        const { data, error } = await this.supabase
          .from('skills_master')
          .insert(batch)
          .select('id');

        if (error) {
          // Handle duplicate key errors gracefully
          if (error.code === '23505') { // Unique constraint violation
            this.logger.warn(`Batch contains duplicate skills, processing individually`);
            const individualResults = await this.insertIndividually(batch);
            insertedCount += individualResults.inserted;
            skippedCount += individualResults.skipped;
            errors.push(...individualResults.errors);
          } else {
            throw error;
          }
        } else {
          insertedCount += data?.length || batch.length;
          this.logger.debug(`Batch inserted successfully: ${data?.length || batch.length} skills`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown database error';
        this.logger.error(`Failed to insert batch: ${errorMsg}`);
        
        errors.push({
          type: 'DATABASE',
          message: `Batch insert failed: ${errorMsg}`,
          data: { batchSize: batch.length, startIndex: i }
        });
        
        skippedCount += batch.length;
      }
    }

    const processingTime = Date.now() - startTime;
    
    this.logger.info(`Import completed: ${insertedCount} inserted, ${skippedCount} skipped, ${errors.length} errors`);
    this.logger.info(`Processing time: ${(processingTime / 1000).toFixed(2)} seconds`);

    return {
      tabName: 'batch-import',
      success: errors.length === 0,
      rowsProcessed: skills.length,
      rowsInserted: insertedCount,
      rowsSkipped: skippedCount,
      errors,
      processingTime
    };
  }

  // Insert skills individually (for handling duplicates)
  private async insertIndividually(skills: ProcessedSkillData[]): Promise<{inserted: number; skipped: number; errors: ImportError[]}> {
    let inserted = 0;
    let skipped = 0;
    const errors: ImportError[] = [];

    for (const skill of skills) {
      try {
        const { data, error } = await this.supabase
          .from('skills_master')
          .insert(skill)
          .select('id');

        if (error) {
          if (error.code === '23505') {
            // Duplicate skill, skip silently
            skipped++;
            this.logger.debug(`Skipped duplicate skill: ${skill.skill_name}`);
          } else {
            throw error;
          }
        } else {
          inserted++;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          type: 'DATABASE',
          message: `Failed to insert skill: ${errorMsg}`,
          data: skill
        });
        skipped++;
      }
    }

    return { inserted, skipped, errors };
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('skills_master')
        .select('count')
        .limit(1);

      if (error) {
        this.logger.error(`Database connection test failed: ${error.message}`);
        return false;
      }

      this.logger.info('Database connection test successful');
      return true;
    } catch (error) {
      this.logger.error(`Database connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
}

// ================================================================
// MAIN IMPORT ORCHESTRATOR
// ================================================================

class SkillsImporter {
  private config: ExcelImportConfig;
  private logger: ImportLogger;
  private fileHandler: ExcelFileHandler;
  private dataProcessor: SkillDataProcessor;
  private supabaseImporter: SupabaseImporter;

  constructor(config: ExcelImportConfig, logger: ImportLogger) {
    this.config = config;
    this.logger = logger;
    this.fileHandler = new ExcelFileHandler(config, logger);
    this.dataProcessor = new SkillDataProcessor(logger);
    this.supabaseImporter = new SupabaseImporter(logger, config.dryRun);
  }

  // Main import method
  async import(): Promise<ImportReport> {
    const startTime = Date.now();
    const stats: ImportStats = {
      totalTabs: 0,
      processedTabs: 0,
      totalRows: 0,
      validRows: 0,
      insertedRows: 0,
      skippedRows: 0,
      errors: 0,
      duplicates: 0,
      processingTime: 0
    };
    const tabResults: TabImportResult[] = [];
    const allErrors: ImportError[] = [];

    try {
      // Step 1: Find and read Excel file
      const filePath = this.fileHandler.findExcelFile();
      const workbook = this.fileHandler.readExcelFile(filePath);

      // Step 2: Test database connection
      if (!this.config.dryRun) {
        const connected = await this.supabaseImporter.testConnection();
        if (!connected) {
          throw new Error('Failed to connect to Supabase database');
        }
      }

      // Step 3: Process each target tab
      stats.totalTabs = this.config.targetTabs.length;

      for (const tabName of this.config.targetTabs) {
        try {
          this.logger.progress(`Processing tab: ${tabName}`);
          
          // Check if tab exists
          if (!workbook.SheetNames.includes(tabName)) {
            this.logger.warn(`Tab '${tabName}' not found in Excel file, skipping`);
            continue;
          }

          // Get tab info and data
          const tabInfo = this.fileHandler.getTabInfo(workbook, tabName);
          const excelRows = this.fileHandler.readTabData(workbook, tabName);
          
          stats.totalRows += excelRows.length;

          // Process data
          const { validSkills, errors } = this.dataProcessor.processTabData(tabInfo, excelRows);
          stats.validRows += validSkills.length;
          allErrors.push(...errors);

          // Import to database
          const importResult = await this.supabaseImporter.importSkills(validSkills, this.config.batchSize);
          importResult.tabName = tabName;
          
          tabResults.push(importResult);
          stats.insertedRows += importResult.rowsInserted;
          stats.skippedRows += importResult.rowsSkipped;
          stats.errors += importResult.errors.length;
          allErrors.push(...importResult.errors);

          stats.processedTabs++;
          
          this.logger.info(`Completed tab '${tabName}': ${importResult.rowsInserted} inserted, ${importResult.rowsSkipped} skipped`);

        } catch (tabError) {
          this.logger.error(`Failed to process tab '${tabName}': ${tabError instanceof Error ? tabError.message : 'Unknown error'}`);
          
          allErrors.push({
            type: 'FILE',
            message: `Tab processing failed: ${tabError instanceof Error ? tabError.message : 'Unknown error'}`,
            data: { tabName }
          });
        }
      }

      stats.processingTime = Date.now() - startTime;

      // Generate report
      const report = this.generateReport(stats, tabResults, allErrors);
      
      this.logger.info(`Import completed in ${(stats.processingTime / 1000).toFixed(2)} seconds`);
      this.printSummary(report);

      return report;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Import failed: ${errorMsg}`);
      
      stats.processingTime = Date.now() - startTime;
      
      return {
        success: false,
        stats,
        tabResults,
        errors: [{
          type: 'FILE',
          message: errorMsg
        }],
        summary: {
          message: `Import failed: ${errorMsg}`,
          recommendations: ['Check file path and database connection', 'Review error logs for details']
        }
      };
    }
  }

  // Generate import report
  private generateReport(stats: ImportStats, tabResults: TabImportResult[], errors: ImportError[]): ImportReport {
    const success = errors.length === 0 && stats.insertedRows > 0;
    
    const recommendations: string[] = [];
    
    if (stats.errors > 0) {
      recommendations.push('Review validation errors and fix data issues');
    }
    
    if (stats.skippedRows > 0) {
      recommendations.push('Check for duplicate skills or database constraints');
    }
    
    if (stats.processedTabs < stats.totalTabs) {
      recommendations.push('Some tabs were not processed - check tab names and file structure');
    }

    const message = success 
      ? `Successfully imported ${stats.insertedRows} skills from ${stats.processedTabs} tabs`
      : `Import completed with issues: ${stats.errors} errors, ${stats.skippedRows} skipped`;

    return {
      success,
      stats,
      tabResults,
      errors,
      summary: {
        message,
        recommendations
      }
    };
  }

  // Print import summary
  private printSummary(report: ImportReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Status: ${report.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Message: ${report.summary.message}`);
    console.log('');
    console.log('📈 Statistics:');
    console.log(`  Tabs processed: ${report.stats.processedTabs}/${report.stats.totalTabs}`);
    console.log(`  Total rows: ${report.stats.totalRows}`);
    console.log(`  Valid rows: ${report.stats.validRows}`);
    console.log(`  Inserted: ${report.stats.insertedRows}`);
    console.log(`  Skipped: ${report.stats.skippedRows}`);
    console.log(`  Errors: ${report.stats.errors}`);
    console.log(`  Processing time: ${(report.stats.processingTime / 1000).toFixed(2)}s`);
    
    if (report.tabResults.length > 0) {
      console.log('');
      console.log('📋 Tab Results:');
      for (const tab of report.tabResults) {
        const status = tab.success ? '✅' : '❌';
        console.log(`  ${status} ${tab.tabName}: ${tab.rowsInserted} inserted, ${tab.rowsSkipped} skipped`);
      }
    }

    if (report.summary.recommendations.length > 0) {
      console.log('');
      console.log('💡 Recommendations:');
      for (const rec of report.summary.recommendations) {
        console.log(`  • ${rec}`);
      }
    }
    
    console.log('='.repeat(60));
  }
}

// ================================================================
// COMMAND LINE INTERFACE
// ================================================================

async function main() {
  const program = new Command();
  
  program
    .name('import-skills')
    .description('Import skills data from Excel file into Supabase database')
    .version('1.0.0')
    .option('-f, --file <path>', 'Excel file path', './Skill Area By Grade_Categorized_MVP.xlsx')
    .option('-t, --tabs <tabs>', 'Comma-separated list of tabs to import')
    .option('--all-prek-k', 'Import all Pre-K and K tabs')
    .option('--dry-run', 'Run without actually inserting data')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-b, --batch-size <size>', 'Batch size for database inserts', '50')
    .option('--log-level <level>', 'Log level (error, warn, info, debug)', 'info');

  program.parse();
  
  const options = program.opts() as ImportOptions;
  
  // Create logger
  const logger = new ConsoleLogger(options.logLevel || 'info', options.verbose || false);
  
  // Build configuration
  const config: ExcelImportConfig = {
    ...DEFAULT_CONFIG,
    filePath: options.file || DEFAULT_CONFIG.filePath,
    dryRun: options.dryRun || false,
    verbose: options.verbose || false,
    batchSize: parseInt(options.batchSize || '50')
  };

  // Determine target tabs
  if (options.allPrekK) {
    config.targetTabs = ['Math_PreK', 'ELA_PreK', 'Math_K', 'ELA_K', 'Science_K', 'SocialStudies_K'];
  } else if (options.tabs) {
    config.targetTabs = options.tabs.split(',').map(t => t.trim());
  }

  logger.info('Starting Pathfinity Skills Import');
  logger.info(`Configuration: ${JSON.stringify(config, null, 2)}`);

  try {
    const importer = new SkillsImporter(config, logger);
    const report = await importer.import();
    
    process.exit(report.success ? 0 : 1);
  } catch (error) {
    logger.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);

export { SkillsImporter, ExcelFileHandler, SkillDataProcessor, SupabaseImporter };