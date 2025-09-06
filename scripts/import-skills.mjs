#!/usr/bin/env node

// ================================================================
// PATHFINITY SKILLS IMPORT SCRIPT (ES MODULE VERSION)
// Import skills data from Excel file into Supabase database
// ================================================================

import XLSX from 'xlsx';
import { Command } from 'commander';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

// ================================================================
// CONFIGURATION AND MAPPINGS
// ================================================================

const DEFAULT_CONFIG = {
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

// Column mapping for the actual Excel file
const COLUMN_MAPPING = {
  subject: 'Subject',
  grade: 'Grade',
  skillsArea: 'SkillsArea',
  skillsCluster: 'SkillCluster', // Note: Excel uses SkillCluster not SkillsCluster
  skillNumber: 'SkillNumber',
  skillName: 'SkillName'
};

// Data normalization mappings
const SUBJECT_MAPPING = {
  'Math': 'Math',
  'ELA': 'ELA',
  'Science': 'Science',
  'Social Studies': 'SocialStudies', // Excel has space, DB expects no space
  'SocialStudies': 'SocialStudies'
};

const GRADE_MAPPING = {
  'Pre-K': 'Pre-K',
  'PreK': 'Pre-K',
  'K': 'K',
  'Kindergarten': 'K', // Excel uses Kindergarten, DB expects K
  '1': '1',
  'Grade1': '1',
  'First': '1',
  '3': '3',
  'Grade3': '3',
  'Third': '3',
  '7': '7',
  'Grade7': '7',
  'Seventh': '7',
  '10': '10',
  'Grade10': '10',
  'Tenth': '10',
  'Algebra1': 'Algebra1',
  'Algebra 1': 'Algebra1',
  'Precalculus': 'Precalculus',
  'Pre-calculus': 'Precalculus',
  'PreCalculus': 'Precalculus'
};

// Difficulty calculation rules
const DIFFICULTY_RULES = {
  'Pre-K': {
    baseLevel: 1,
    skillNumberMultiplier: 0.5,
    keywordAdjustments: {
      'identify': 1,
      'count': 2,
      'compare': 3,
      'solve': 4,
      'understand': 2,
      'recognize': 1,
      'demonstrate': 3
    }
  },
  'K': {
    baseLevel: 3,
    skillNumberMultiplier: 0.7,
    keywordAdjustments: {
      'identify': 1,
      'count': 2,
      'add': 3,
      'subtract': 4,
      'solve': 4,
      'understand': 3,
      'analyze': 5,
      'create': 4
    }
  },
  '1': {
    baseLevel: 4,
    skillNumberMultiplier: 0.8,
    keywordAdjustments: {
      'identify': 2,
      'count': 2,
      'add': 3,
      'subtract': 3,
      'solve': 5,
      'understand': 4,
      'analyze': 6,
      'create': 5
    }
  },
  '3': {
    baseLevel: 5,
    skillNumberMultiplier: 1.0,
    keywordAdjustments: {
      'identify': 2,
      'multiply': 4,
      'divide': 5,
      'solve': 6,
      'understand': 5,
      'analyze': 7,
      'create': 6,
      'explain': 5
    }
  },
  '7': {
    baseLevel: 7,
    skillNumberMultiplier: 1.2,
    keywordAdjustments: {
      'solve': 6,
      'analyze': 7,
      'evaluate': 8,
      'create': 7,
      'explain': 6,
      'justify': 8,
      'prove': 9
    }
  },
  'Algebra1': {
    baseLevel: 8,
    skillNumberMultiplier: 1.3,
    keywordAdjustments: {
      'solve': 7,
      'factor': 8,
      'graph': 7,
      'analyze': 8,
      'evaluate': 8,
      'simplify': 7,
      'prove': 9
    }
  },
  'Precalculus': {
    baseLevel: 9,
    skillNumberMultiplier: 1.5,
    keywordAdjustments: {
      'solve': 8,
      'factor': 8,
      'graph': 8,
      'analyze': 9,
      'evaluate': 9,
      'simplify': 8,
      'prove': 10,
      'derive': 10
    }
  }
};

// Time estimation rules
const TIME_ESTIMATION_RULES = {
  'Pre-K': {
    baseMinutes: 10,
    difficultyMultiplier: 3,
    subjectAdjustments: {
      'Math': 1.0,
      'ELA': 1.2,
      'Science': 1.1,
      'SocialStudies': 0.9
    }
  },
  'K': {
    baseMinutes: 15,
    difficultyMultiplier: 4,
    subjectAdjustments: {
      'Math': 1.0,
      'ELA': 1.3,
      'Science': 1.2,
      'SocialStudies': 1.0
    }
  },
  '1': {
    baseMinutes: 20,
    difficultyMultiplier: 5,
    subjectAdjustments: {
      'Math': 1.0,
      'ELA': 1.4,
      'Science': 1.2,
      'SocialStudies': 1.1
    }
  },
  '3': {
    baseMinutes: 25,
    difficultyMultiplier: 6,
    subjectAdjustments: {
      'Math': 1.0,
      'ELA': 1.3,
      'Science': 1.3,
      'SocialStudies': 1.2
    }
  },
  '7': {
    baseMinutes: 30,
    difficultyMultiplier: 7,
    subjectAdjustments: {
      'Math': 1.0,
      'ELA': 1.2,
      'Science': 1.4,
      'SocialStudies': 1.3
    }
  },
  'Algebra1': {
    baseMinutes: 35,
    difficultyMultiplier: 8,
    subjectAdjustments: {
      'Math': 1.0,
      'ELA': 1.1,
      'Science': 1.3,
      'SocialStudies': 1.2
    }
  },
  'Precalculus': {
    baseMinutes: 40,
    difficultyMultiplier: 10,
    subjectAdjustments: {
      'Math': 1.0,
      'ELA': 1.1,
      'Science': 1.4,
      'SocialStudies': 1.2
    }
  }
};

// ================================================================
// LOGGER CLASS
// ================================================================

class Logger {
  constructor(logLevel = 'info', verbose = false) {
    this.logLevel = logLevel;
    this.verbose = verbose;
    this.levels = ['error', 'warn', 'info', 'debug'];
  }

  shouldLog(level) {
    const currentIndex = this.levels.indexOf(this.logLevel);
    const messageIndex = this.levels.indexOf(level);
    return messageIndex <= currentIndex;
  }

  error(message, data) {
    if (this.shouldLog('error')) {
      console.error(`❌ ERROR: ${message}`);
      if (data && this.verbose) {
        console.error(JSON.stringify(data, null, 2));
      }
    }
  }

  warn(message, data) {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️  WARN: ${message}`);
      if (data && this.verbose) {
        console.warn(JSON.stringify(data, null, 2));
      }
    }
  }

  info(message, data) {
    if (this.shouldLog('info')) {
      console.log(`ℹ️  INFO: ${message}`);
      if (data && this.verbose) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  debug(message, data) {
    if (this.shouldLog('debug')) {
      console.log(`🔍 DEBUG: ${message}`);
      if (data && this.verbose) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  progress(message) {
    console.log(`🔄 ${message}`);
  }
}

// ================================================================
// EXCEL FILE HANDLER
// ================================================================

class ExcelFileHandler {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }

  findExcelFile() {
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

  readExcelFile(filePath) {
    try {
      this.logger.progress(`Reading Excel file: ${path.basename(filePath)}`);
      const workbook = XLSX.readFile(filePath);
      this.logger.info(`Excel file loaded successfully. Found ${workbook.SheetNames.length} sheets`);
      this.logger.debug('Available sheets:', workbook.SheetNames);
      return workbook;
    } catch (error) {
      throw new Error(`Failed to read Excel file: ${error.message}`);
    }
  }

  parseTabName(tabName) {
    // Handle consolidated sheet format (Sheet1)
    if (tabName === 'Sheet1') {
      return { subject: null, grade: null }; // Will be read from columns
    }
    
    // Handle high school subjects that don't follow Subject_Grade pattern
    if (tabName === 'Algebra1') {
      return { subject: 'Math', grade: 'Algebra1' };
    }
    if (tabName === 'Precalculus') {
      return { subject: 'Math', grade: 'Precalculus' };
    }
    
    // Extract subject and grade from tab name (e.g., Math_PreK -> Math, Pre-K)
    const match = tabName.match(/^([A-Za-z]+)_([A-Za-z0-9-]+)$/);
    if (!match) {
      throw new Error(`Tab name '${tabName}' does not match expected pattern`);
    }

    const [, subjectKey, gradeKey] = match;
    const subject = SUBJECT_MAPPING[subjectKey] || subjectKey;
    const grade = GRADE_MAPPING[gradeKey] || gradeKey;

    return { subject, grade };
  }

  readTabData(workbook, tabName) {
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
    });

    if (jsonData.length === 0) {
      this.logger.warn(`Tab '${tabName}' contains no data`);
      return [];
    }

    // Get headers from first row
    const headers = jsonData[0];
    this.logger.debug(`Headers found in ${tabName}:`, headers);

    // Convert to objects using headers
    const data = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowData = {};

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

  isRowEmpty(row) {
    return Object.values(row).every(value => 
      value === undefined || value === null || value === '' || value === 0
    );
  }
}

// ================================================================
// DATA PROCESSOR
// ================================================================

class SkillDataProcessor {
  constructor(logger) {
    this.logger = logger;
  }

  processTabData(tabName, excelRows) {
    this.logger.progress(`Processing ${excelRows.length} rows from tab ${tabName}`);

    const validSkills = [];
    const errors = [];
    const { subject, grade } = this.parseTabName(tabName);

    for (let i = 0; i < excelRows.length; i++) {
      const row = excelRows[i];
      
      try {
        // For consolidated format, subject and grade come from columns
        let rowSubject = subject;
        let rowGrade = grade;
        
        if (tabName === 'Sheet1') {
          // Read subject and grade from columns for consolidated format
          rowSubject = this.getColumnValue(row, 'Subject') || this.getColumnValue(row, 0);
          let gradeValue = this.getColumnValue(row, 'Grade') || this.getColumnValue(row, 1);
          // Convert numeric grades to strings (e.g., 10 becomes '10')
          rowGrade = gradeValue !== null && gradeValue !== undefined ? String(gradeValue) : gradeValue;
        }
        
        const processedSkill = this.processRow(row, rowSubject, rowGrade, i + 2);
        
        if (processedSkill) {
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
          message: `Failed to process row: ${error.message}`,
          row: i + 2,
          data: row
        });
      }
    }

    this.logger.info(`Processed ${validSkills.length} valid skills from ${tabName}`);
    if (errors.length > 0) {
      this.logger.warn(`Found ${errors.length} errors in ${tabName}`);
    }

    return { validSkills, errors };
  }

  parseTabName(tabName) {
    // Handle consolidated sheet format (Sheet1)
    if (tabName === 'Sheet1') {
      return { subject: null, grade: null }; // Will be read from columns
    }
    
    const match = tabName.match(/^([A-Za-z]+)_([A-Za-z0-9-]+)$/);
    if (!match) {
      throw new Error(`Tab name '${tabName}' does not match expected pattern`);
    }

    const [, subjectKey, gradeKey] = match;
    const subject = SUBJECT_MAPPING[subjectKey] || subjectKey;
    const grade = GRADE_MAPPING[gradeKey] || gradeKey;

    return { subject, grade };
  }

  processRow(row, subject, grade, rowNumber) {
    // Extract basic data using column mapping
    const skillName = this.getColumnValue(row, COLUMN_MAPPING.skillName);
    if (!skillName) {
      return null; // Skip rows without skill names
    }

    const skillsArea = this.getColumnValue(row, COLUMN_MAPPING.skillsArea) || 'General';
    const skillsCluster = this.getColumnValue(row, COLUMN_MAPPING.skillsCluster) || 'A';
    const skillNumber = this.getColumnValue(row, COLUMN_MAPPING.skillNumber) || `${skillsCluster}.${rowNumber}`;

    // Normalize the data
    const normalizedSubject = SUBJECT_MAPPING[subject] || subject;
    const normalizedGrade = GRADE_MAPPING[grade] || grade;

    // Calculate difficulty level
    const difficultyLevel = this.calculateDifficulty(skillName, normalizedGrade, skillNumber);
    
    // Calculate estimated time
    const estimatedTime = this.calculateEstimatedTime(difficultyLevel, normalizedGrade, normalizedSubject);

    return {
      subject: normalizedSubject,
      grade: normalizedGrade,
      skills_area: skillsArea,
      skills_cluster: skillsCluster,
      skill_number: skillNumber,
      skill_name: skillName,
      skill_description: null, // Not provided in Excel
      difficulty_level: difficultyLevel,
      estimated_time_minutes: estimatedTime,
      prerequisites: null
    };
  }

  getColumnValue(row, columnName) {
    if (!columnName || !row[columnName]) {
      return '';
    }
    return String(row[columnName]).trim();
  }

  calculateDifficulty(skillName, grade, skillNumber) {
    const rule = DIFFICULTY_RULES[grade];
    if (!rule) {
      return 3; // Default difficulty
    }

    let difficulty = rule.baseLevel;

    // Adjust based on skill number
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
        break;
      }
    }

    return Math.max(1, Math.min(10, difficulty));
  }

  calculateEstimatedTime(difficulty, grade, subject) {
    const rule = TIME_ESTIMATION_RULES[grade];
    if (!rule) {
      return 15;
    }

    let time = rule.baseMinutes + (difficulty * rule.difficultyMultiplier);
    
    const subjectAdjustment = rule.subjectAdjustments[subject] || 1.0;
    time *= subjectAdjustment;

    return Math.max(5, Math.round(time / 5) * 5);
  }

  validateSkill(skill, rowNumber) {
    const errors = [];

    // Required field validations
    if (!skill.skill_name || skill.skill_name.trim() === '') {
      errors.push({
        type: 'VALIDATION',
        message: 'Skill name is required',
        row: rowNumber,
        data: { field: 'skill_name', value: skill.skill_name }
      });
    }

    if (!['Math', 'ELA', 'Science', 'SocialStudies', 'Algebra1', 'Precalculus'].includes(skill.subject)) {
      errors.push({
        type: 'VALIDATION',
        message: `Invalid subject: ${skill.subject}`,
        row: rowNumber,
        data: { field: 'subject', value: skill.subject }
      });
    }

    const validGrades = ['Pre-K', 'K', '1', '3', '7', '10', 'Algebra1', 'Precalculus'];
    if (!validGrades.includes(skill.grade)) {
      errors.push({
        type: 'VALIDATION',
        message: `Invalid grade: ${skill.grade}`,
        row: rowNumber,
        data: { field: 'grade', value: skill.grade }
      });
    }

    if (skill.difficulty_level < 1 || skill.difficulty_level > 10) {
      errors.push({
        type: 'VALIDATION',
        message: `Invalid difficulty level: ${skill.difficulty_level}`,
        row: rowNumber,
        data: { field: 'difficulty_level', value: skill.difficulty_level }
      });
    }

    return errors;
  }
}

// ================================================================
// SUPABASE IMPORTER
// ================================================================

class SupabaseImporter {
  constructor(logger, dryRun = false) {
    this.logger = logger;
    this.dryRun = dryRun;

    if (!this.dryRun) {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.info('Supabase client initialized');
    }
  }

  async importSkills(skills, batchSize = 50) {
    const startTime = Date.now();
    let insertedCount = 0;
    let skippedCount = 0;
    const errors = [];

    this.logger.progress(`Starting import of ${skills.length} skills (batch size: ${batchSize})`);

    if (this.dryRun) {
      this.logger.info('DRY RUN MODE: No data will be inserted into database');
      
      // Show sample of what would be inserted
      if (skills.length > 0) {
        this.logger.info('Sample skills that would be inserted:');
        for (let i = 0; i < Math.min(3, skills.length); i++) {
          const skill = skills[i];
          this.logger.info(`  ${skill.subject} ${skill.grade}: ${skill.skill_name} (Level ${skill.difficulty_level}, ${skill.estimated_time_minutes}min)`);
        }
      }
      
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
        const errorMsg = error.message || 'Unknown database error';
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

  async insertIndividually(skills) {
    let inserted = 0;
    let skipped = 0;
    const errors = [];

    for (const skill of skills) {
      try {
        const { data, error } = await this.supabase
          .from('skills_master')
          .insert(skill)
          .select('id');

        if (error) {
          if (error.code === '23505') {
            skipped++;
            this.logger.debug(`Skipped duplicate skill: ${skill.skill_name}`);
          } else {
            throw error;
          }
        } else {
          inserted++;
        }
      } catch (error) {
        const errorMsg = error.message || 'Unknown error';
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

  async testConnection() {
    if (this.dryRun) {
      this.logger.info('Dry run mode: skipping database connection test');
      return true;
    }

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
      this.logger.error(`Database connection test failed: ${error.message}`);
      return false;
    }
  }
}

// ================================================================
// MAIN IMPORT ORCHESTRATOR
// ================================================================

class SkillsImporter {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.fileHandler = new ExcelFileHandler(config, logger);
    this.dataProcessor = new SkillDataProcessor(logger);
    this.supabaseImporter = new SupabaseImporter(logger, config.dryRun);
  }

  async import() {
    const startTime = Date.now();
    const stats = {
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
    const tabResults = [];
    const allErrors = [];

    try {
      // Step 1: Find and read Excel file
      const filePath = this.fileHandler.findExcelFile();
      const workbook = this.fileHandler.readExcelFile(filePath);

      // Step 2: Test database connection
      const connected = await this.supabaseImporter.testConnection();
      if (!connected && !this.config.dryRun) {
        throw new Error('Failed to connect to Supabase database');
      }

      // Step 3: Process each target tab
      const tabsToProcess = this.config.targetTabs || workbook.SheetNames.filter(name => {
        // Only process tabs that look like grade/subject combinations or high school subjects
        return /^(Math|ELA|Science|SocialStudies)_(PreK|Pre-K|K|1|3|7|Algebra1|Precalculus)$/.test(name) ||
               /^(Math|ELA|Science|SocialStudies)_(Grade1|Grade3|Grade7)$/.test(name) ||
               /^(Algebra1|Precalculus)$/.test(name);
      });
      
      stats.totalTabs = tabsToProcess.length;
      this.logger.info(`Processing ${tabsToProcess.length} tabs: ${tabsToProcess.join(', ')}`);

      for (const tabName of tabsToProcess) {
        try {
          this.logger.progress(`Processing tab: ${tabName}`);
          
          if (!workbook.SheetNames.includes(tabName)) {
            this.logger.warn(`Tab '${tabName}' not found in Excel file, skipping`);
            continue;
          }

          const excelRows = this.fileHandler.readTabData(workbook, tabName);
          stats.totalRows += excelRows.length;

          const { validSkills, errors } = this.dataProcessor.processTabData(tabName, excelRows);
          stats.validRows += validSkills.length;
          allErrors.push(...errors);

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
          this.logger.error(`Failed to process tab '${tabName}': ${tabError.message}`);
          
          allErrors.push({
            type: 'FILE',
            message: `Tab processing failed: ${tabError.message}`,
            data: { tabName }
          });
        }
      }

      stats.processingTime = Date.now() - startTime;

      const success = allErrors.length === 0 && stats.insertedRows > 0;
      
      this.logger.info(`Import completed in ${(stats.processingTime / 1000).toFixed(2)} seconds`);
      this.printSummary(success, stats, tabResults, allErrors);

      return { success, stats, tabResults, errors: allErrors };

    } catch (error) {
      const errorMsg = error.message || 'Unknown error';
      this.logger.error(`Import failed: ${errorMsg}`);
      
      stats.processingTime = Date.now() - startTime;
      
      return {
        success: false,
        stats,
        tabResults,
        errors: [{
          type: 'FILE',
          message: errorMsg
        }]
      };
    }
  }

  printSummary(success, stats, tabResults, errors) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Status: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log('');
    console.log('📈 Statistics:');
    console.log(`  Tabs processed: ${stats.processedTabs}/${stats.totalTabs}`);
    console.log(`  Total rows: ${stats.totalRows}`);
    console.log(`  Valid rows: ${stats.validRows}`);
    console.log(`  Inserted: ${stats.insertedRows}`);
    console.log(`  Skipped: ${stats.skippedRows}`);
    console.log(`  Errors: ${stats.errors}`);
    console.log(`  Processing time: ${(stats.processingTime / 1000).toFixed(2)}s`);
    
    if (tabResults.length > 0) {
      console.log('');
      console.log('📋 Tab Results:');
      for (const tab of tabResults) {
        const status = tab.success ? '✅' : '❌';
        console.log(`  ${status} ${tab.tabName}: ${tab.rowsInserted} inserted, ${tab.rowsSkipped} skipped`);
      }
    }

    if (errors.length > 0 && errors.length <= 10) {
      console.log('');
      console.log('❌ Errors:');
      for (const error of errors.slice(0, 10)) {
        console.log(`  • ${error.message}`);
      }
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
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
    .option('--all-grades', 'Import all grades (Pre-K through Precalculus)')
    .option('--dry-run', 'Run without actually inserting data')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-b, --batch-size <size>', 'Batch size for database inserts', '50')
    .option('--log-level <level>', 'Log level (error, warn, info, debug)', 'info');

  program.parse();
  
  const options = program.opts();
  
  // Create logger
  const logger = new Logger(options.logLevel || 'info', options.verbose || false);
  
  // Build configuration
  const config = {
    ...DEFAULT_CONFIG,
    filePath: options.file || DEFAULT_CONFIG.filePath,
    dryRun: options.dryRun || false,
    verbose: options.verbose || false,
    batchSize: parseInt(options.batchSize || '50')
  };

  // Determine target tabs
  if (options.allGrades) {
    // Import all grades - this will import from all available tabs in the Excel file
    config.targetTabs = null; // null means import all available tabs
  } else if (options.allPrekK) {
    config.targetTabs = ['Math_PreK', 'ELA_PreK', 'Math_K', 'ELA_K', 'Science_K', 'SocialStudies_K'];
  } else if (options.tabs) {
    config.targetTabs = options.tabs.split(',').map(t => t.trim());
  }

  logger.info('Starting Pathfinity Skills Import');
  if (config.dryRun) {
    logger.info('🔍 DRY RUN MODE - No data will be inserted');
  }
  logger.debug('Configuration:', config);

  try {
    const importer = new SkillsImporter(config, logger);
    const result = await importer.import();
    
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    logger.error(`Import failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);