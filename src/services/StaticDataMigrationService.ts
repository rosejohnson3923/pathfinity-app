/**
 * Static Data Migration Service
 * 
 * Migrates all static configuration data from source code to database:
 * - Question type definitions
 * - Grade configurations
 * - Subject configurations
 * - Skills data from text files
 * - Detection rules
 * 
 * This eliminates hardcoded data and provides a single source of truth
 */

import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

interface MigrationStats {
  questionTypes: number;
  grades: number;
  subjects: number;
  skills: number;
  detectionRules: number;
  errors: string[];
}

export class StaticDataMigrationService {
  private stats: MigrationStats = {
    questionTypes: 0,
    grades: 0,
    subjects: 0,
    skills: 0,
    detectionRules: 0,
    errors: []
  };

  /**
   * Run complete migration
   */
  async runMigration(): Promise<MigrationStats> {
    console.log('Starting Static Data Migration to Database...');
    console.log('=' .repeat(60));

    try {
      // 1. Migrate question type definitions
      await this.migrateQuestionTypes();
      
      // 2. Migrate grade configurations
      await this.migrateGradeConfigurations();
      
      // 3. Migrate subject configurations
      await this.migrateSubjectConfigurations();
      
      // 4. Migrate detection rules
      await this.migrateDetectionRules();
      
      // 5. Migrate skills data
      await this.migrateSkillsData();
      
      console.log('\n' + '=' .repeat(60));
      console.log('Migration Complete!');
      console.log(this.generateSummary());
      
    } catch (error) {
      console.error('Migration failed:', error);
      this.stats.errors.push(`Fatal error: ${error}`);
    }

    return this.stats;
  }

  /**
   * Migrate question type definitions
   */
  private async migrateQuestionTypes(): Promise<void> {
    console.log('\n📝 Migrating Question Type Definitions...');

    const questionTypes = [
      {
        id: 'true_false',
        display_name: 'True/False',
        category: 'binary',
        min_grade: 1,
        max_grade: 12,
        detection_priority: 10, // HIGHEST PRIORITY
        detection_patterns: ['^true or false:', '^true/false:', '^t/f:', '^is (this|it) true'],
        suitable_subjects: ['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
        required_fields: ['question', 'correctAnswer'],
        ui_component: 'TrueFalseRenderer'
      },
      {
        id: 'counting',
        display_name: 'Counting',
        category: 'visual',
        min_grade: 1,
        max_grade: 5, // Elementary only
        detection_priority: 100, // LOWEST PRIORITY for Grade 10
        detection_patterns: ['count the', 'how many', 'total number of'],
        suitable_subjects: ['Math'],
        required_fields: ['question', 'visual', 'correctAnswer'],
        ui_component: 'CountingRenderer',
        supports_visual: true
      },
      // Add all other question types...
    ];

    for (const qt of questionTypes) {
      const { error } = await supabase
        .from('question_type_definitions')
        .upsert(qt, { onConflict: 'id' });
      
      if (error) {
        this.stats.errors.push(`Question type ${qt.id}: ${error.message}`);
      } else {
        this.stats.questionTypes++;
      }
    }

    console.log(`  ✓ Migrated ${this.stats.questionTypes} question types`);
  }

  /**
   * Migrate grade configurations
   */
  private async migrateGradeConfigurations(): Promise<void> {
    console.log('\n🎓 Migrating Grade Configurations...');

    const grades = [
      {
        grade: '10',
        grade_numeric: 10,
        grade_level: 'High',
        preferred_question_types: ['multiple_choice', 'short_answer', 'word_problem', 'coding', 'creative_writing'],
        excluded_question_types: ['counting'], // Counting not for Grade 10
        available_subjects: ['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
        default_time_per_question: 120
      },
      // Add other grades...
    ];

    for (const grade of grades) {
      const { error } = await supabase
        .from('grade_configurations')
        .upsert(grade, { onConflict: 'grade' });
      
      if (error) {
        this.stats.errors.push(`Grade ${grade.grade}: ${error.message}`);
      } else {
        this.stats.grades++;
      }
    }

    console.log(`  ✓ Migrated ${this.stats.grades} grade configurations`);
  }

  /**
   * Migrate subject configurations
   */
  private async migrateSubjectConfigurations(): Promise<void> {
    console.log('\n📚 Migrating Subject Configurations...');

    const subjects = [
      {
        subject_code: 'MATH',
        subject_name: 'Math',
        subject_category: 'Core',
        min_grade: 'Pre-K',
        max_grade: '12',
        preferred_question_types: ['multiple_choice', 'numeric', 'word_problem'],
        uses_skill_clusters: true,
        cluster_naming_pattern: 'A.',
        requires_calculator: true
      },
      {
        subject_code: 'ELA',
        subject_name: 'English Language Arts',
        subject_category: 'Core',
        min_grade: 'Pre-K',
        max_grade: '12',
        preferred_question_types: ['multiple_choice', 'short_answer', 'creative_writing'],
        uses_skill_clusters: true,
        cluster_naming_pattern: 'A.'
      },
      // Add other subjects...
    ];

    for (const subject of subjects) {
      const { error } = await supabase
        .from('subject_configurations')
        .upsert(subject, { onConflict: 'subject_code' });
      
      if (error) {
        this.stats.errors.push(`Subject ${subject.subject_code}: ${error.message}`);
      } else {
        this.stats.subjects++;
      }
    }

    console.log(`  ✓ Migrated ${this.stats.subjects} subject configurations`);
  }

  /**
   * Migrate detection rules
   */
  private async migrateDetectionRules(): Promise<void> {
    console.log('\n🔍 Migrating Detection Rules...');

    const rules = [
      {
        rule_name: 'True/False Pattern First',
        question_type: 'true_false',
        priority: 1, // MUST BE FIRST
        detection_type: 'pattern',
        pattern_regex: '(?i)^(true\\s+or\\s+false|true/false|t/f):',
        confidence_score: 1.0
      },
      {
        rule_name: 'Counting Last for High School',
        question_type: 'counting',
        priority: 90, // LAST for Grade 10
        detection_type: 'pattern',
        pattern_regex: '(?i)^count\\s+the',
        grade_condition: { min: 1, max: 5 },
        confidence_score: 0.8
      },
      // Add other rules...
    ];

    for (const rule of rules) {
      const { error } = await supabase
        .from('detection_rules')
        .upsert(rule, { onConflict: 'rule_name' });
      
      if (error) {
        this.stats.errors.push(`Rule ${rule.rule_name}: ${error.message}`);
      } else {
        this.stats.detectionRules++;
      }
    }

    console.log(`  ✓ Migrated ${this.stats.detectionRules} detection rules`);
  }

  /**
   * Migrate skills data from text files
   */
  private async migrateSkillsData(): Promise<void> {
    console.log('\n📖 Migrating Skills Data...');

    // Read all grade skill files
    const dataDir = path.join(process.cwd(), 'src/data');
    const skillFiles = fs.readdirSync(dataDir)
      .filter(file => file.startsWith('skillsDataComplete_') && file.endsWith('.txt'));

    for (const file of skillFiles) {
      const filePath = path.join(dataDir, file);
      await this.importSkillFile(filePath, file);
    }

    console.log(`  ✓ Migrated ${this.stats.skills} skills from ${skillFiles.length} files`);
  }

  /**
   * Import a single skill file
   */
  private async importSkillFile(filePath: string, fileName: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split('\t');
      if (parts.length >= 6) {
        const skill = {
          subject: parts[0],
          grade: parts[1],
          skills_area: parts[2],
          skills_cluster: parts[3],
          skill_number: parts[4],
          skill_name: parts[5],
          source_file: fileName,
          
          // Derive additional metadata
          difficulty_level: this.calculateDifficulty(parts[3]),
          estimated_time_minutes: this.estimateTime(parts[0]),
          recommended_question_types: this.getRecommendedTypes(parts[0], parts[1])
        };

        const { error } = await supabase
          .from('skills_master')
          .upsert(skill, { 
            onConflict: 'subject,grade,skill_number',
            ignoreDuplicates: false 
          });

        if (error) {
          this.stats.errors.push(`Skill ${skill.skill_number}: ${error.message}`);
        } else {
          this.stats.skills++;
        }
      }
    }
  }

  /**
   * Calculate difficulty based on cluster position
   */
  private calculateDifficulty(cluster: string): number {
    const letter = cluster.replace('.', '').charCodeAt(0);
    const position = letter - 'A'.charCodeAt(0);
    return Math.min(5, Math.floor(position / 5) + 1);
  }

  /**
   * Estimate time based on subject
   */
  private estimateTime(subject: string): number {
    const times: Record<string, number> = {
      'Math': 15,
      'ELA': 20,
      'Science': 25,
      'Social Studies': 20
    };
    return times[subject] || 20;
  }

  /**
   * Get recommended question types
   */
  private getRecommendedTypes(subject: string, grade: string): string[] {
    const gradeNum = parseInt(grade) || 0;
    
    if (gradeNum >= 10) {
      // High school
      return ['multiple_choice', 'short_answer', 'word_problem', 'coding'];
    } else if (gradeNum >= 6) {
      // Middle school
      return ['multiple_choice', 'short_answer', 'matching'];
    } else {
      // Elementary
      return ['multiple_choice', 'true_false', 'counting'];
    }
  }

  /**
   * Generate migration summary
   */
  private generateSummary(): string {
    return `
Migration Summary:
  Question Types: ${this.stats.questionTypes}
  Grades: ${this.stats.grades}
  Subjects: ${this.stats.subjects}
  Detection Rules: ${this.stats.detectionRules}
  Skills: ${this.stats.skills}
  Errors: ${this.stats.errors.length}
  
${this.stats.errors.length > 0 ? 'Errors:\n' + this.stats.errors.join('\n') : '✅ No errors!'}
    `;
  }
}

/**
 * Service to query static data from database instead of hardcoded values
 */
export class StaticDataService {
  /**
   * Get question type by ID
   */
  static async getQuestionType(id: string) {
    const { data, error } = await supabase
      .from('question_type_definitions')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  }

  /**
   * Get appropriate question types for grade and subject
   */
  static async getQuestionTypesForGrade(grade: string, subject: string) {
    const { data, error } = await supabase
      .from('grade_subject_question_types')
      .select('*')
      .eq('grade', grade)
      .eq('subject_code', subject)
      .order('detection_priority');
    
    return { data, error };
  }

  /**
   * Detect question type using database rules
   */
  static async detectQuestionType(
    questionText: string,
    grade: string,
    subject: string,
    hasVisual: boolean = false
  ) {
    // Call database function
    const { data, error } = await supabase
      .rpc('detect_question_type', {
        p_question_text: questionText,
        p_grade: grade,
        p_subject: subject,
        p_has_visual: hasVisual
      });
    
    return { detectedType: data, error };
  }

  /**
   * Get skills for grade and subject
   */
  static async getSkills(grade: string, subject: string, limit: number = 100) {
    const { data, error } = await supabase
      .from('skills_master')
      .select('*')
      .eq('grade', grade)
      .eq('subject', subject)
      .limit(limit);
    
    return { data, error };
  }

  /**
   * Get grade configuration
   */
  static async getGradeConfig(grade: string) {
    const { data, error } = await supabase
      .from('grade_configurations')
      .select('*')
      .eq('grade', grade)
      .single();
    
    return { data, error };
  }
}

export default StaticDataMigrationService;