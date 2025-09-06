import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface QuestionType {
  id: string;
  name: string;
  display_name: string;
  category: string;
  detection_priority: number;
  detection_patterns: string[];
  grade_min: number;
  grade_max: number;
  preferred_subjects: string[];
  requires_visual: boolean;
  complexity_level: string;
  example_prompts: string[];
  validation_rules: any;
}

export interface GradeConfig {
  grade_level: string;
  grade_numeric: number;
  display_name: string;
  subjects: string[];
  preferred_question_types: string[];
  unsuitable_question_types: string[];
  learning_objectives: string[];
  skill_categories: string[];
}

export interface Skill {
  skill_id: string;
  subject: string;
  grade_level: string;
  skill_number: string;
  skill_name: string;
  skill_description: string;
  topic: string;
  subtopic: string;
  difficulty_level: string;
  prerequisites: string[];
  learning_objectives: string[];
  keywords: string[];
}

export class StaticDataService {
  private questionTypeCache: Map<string, QuestionType> = new Map();
  private gradeConfigCache: Map<string, GradeConfig> = new Map();
  private skillsCache: Map<string, Skill[]> = new Map();
  private detectionRulesCache: any[] = [];
  private lastCacheRefresh: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {}

  private shouldRefreshCache(): boolean {
    return Date.now() - this.lastCacheRefresh > this.CACHE_TTL;
  }

  async getQuestionType(id: string): Promise<QuestionType | null> {
    if (this.shouldRefreshCache() || !this.questionTypeCache.has(id)) {
      await this.refreshQuestionTypeCache();
    }
    return this.questionTypeCache.get(id) || null;
  }

  async getQuestionTypesForGrade(grade: string, subject?: string): Promise<QuestionType[]> {
    if (this.shouldRefreshCache()) {
      await this.refreshQuestionTypeCache();
    }

    const gradeConfig = await this.getGradeConfig(grade);
    if (!gradeConfig) return [];

    const gradeNumeric = parseInt(grade) || 0;
    const allTypes = Array.from(this.questionTypeCache.values());

    return allTypes.filter(type => {
      // Check grade range
      if (gradeNumeric < type.grade_min || gradeNumeric > type.grade_max) {
        return false;
      }

      // Check if type is unsuitable for this grade
      if (gradeConfig.unsuitable_question_types?.includes(type.id)) {
        // Still return it but it's marked as unsuitable
        // This allows testing of all question types as requested
        return true;
      }

      // Check subject preference if specified
      if (subject && type.preferred_subjects?.length > 0) {
        if (!type.preferred_subjects.includes(subject) && !type.preferred_subjects.includes('all')) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => a.detection_priority - b.detection_priority);
  }

  async detectQuestionType(text: string, grade: string, subject: string): Promise<string> {
    if (this.shouldRefreshCache() || this.detectionRulesCache.length === 0) {
      await this.refreshDetectionRulesCache();
    }

    const textLower = text.toLowerCase();
    const gradeNumeric = parseInt(grade) || 0;

    // Sort rules by priority
    const sortedRules = [...this.detectionRulesCache].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      // Check if rule applies to this grade and subject
      if (rule.grade_min !== null && gradeNumeric < rule.grade_min) continue;
      if (rule.grade_max !== null && gradeNumeric > rule.grade_max) continue;
      if (rule.subjects && rule.subjects.length > 0 && !rule.subjects.includes(subject)) continue;

      // Check pattern match
      const pattern = new RegExp(rule.pattern, rule.flags || 'i');
      if (pattern.test(textLower)) {
        return rule.question_type;
      }
    }

    // Default to multiple choice if no pattern matches
    return 'multiple_choice';
  }

  async getSkills(grade: string, subject?: string): Promise<Skill[]> {
    const cacheKey = `${grade}-${subject || 'all'}`;
    
    if (this.shouldRefreshCache() || !this.skillsCache.has(cacheKey)) {
      const query = supabase
        .from('skills_master')
        .select('*')
        .eq('grade_level', grade);

      if (subject) {
        query.eq('subject', subject);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching skills:', error);
        return [];
      }

      this.skillsCache.set(cacheKey, data || []);
    }

    return this.skillsCache.get(cacheKey) || [];
  }

  async getGradeConfig(grade: string): Promise<GradeConfig | null> {
    if (this.shouldRefreshCache() || !this.gradeConfigCache.has(grade)) {
      await this.refreshGradeConfigCache();
    }
    return this.gradeConfigCache.get(grade) || null;
  }

  private async refreshQuestionTypeCache(): Promise<void> {
    const { data, error } = await supabase
      .from('question_type_definitions')
      .select('*')
      .order('detection_priority', { ascending: true });

    if (error) {
      console.error('Error fetching question types:', error);
      return;
    }

    this.questionTypeCache.clear();
    for (const type of data || []) {
      this.questionTypeCache.set(type.id, type);
    }

    this.lastCacheRefresh = Date.now();
  }

  private async refreshGradeConfigCache(): Promise<void> {
    const { data, error } = await supabase
      .from('grade_configurations')
      .select('*')
      .order('grade_numeric', { ascending: true });

    if (error) {
      console.error('Error fetching grade configs:', error);
      return;
    }

    this.gradeConfigCache.clear();
    for (const config of data || []) {
      // Store by both numeric and string grade level
      this.gradeConfigCache.set(config.grade_level, config);
      if (config.grade_numeric) {
        this.gradeConfigCache.set(config.grade_numeric.toString(), config);
      }
    }

    this.lastCacheRefresh = Date.now();
  }

  private async refreshDetectionRulesCache(): Promise<void> {
    const { data, error } = await supabase
      .from('detection_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching detection rules:', error);
      return;
    }

    this.detectionRulesCache = data || [];
    this.lastCacheRefresh = Date.now();
  }

  // Utility method to get suitable question types for a grade
  async getSuitableQuestionTypes(grade: string, subject?: string): Promise<QuestionType[]> {
    const gradeConfig = await this.getGradeConfig(grade);
    const allTypes = await this.getQuestionTypesForGrade(grade, subject);

    if (!gradeConfig) return allTypes;

    return allTypes.filter(type => {
      // Filter out unsuitable types unless explicitly testing
      return !gradeConfig.unsuitable_question_types?.includes(type.id);
    });
  }

  // Method to check if a question type is suitable for a grade
  async isQuestionTypeSuitable(questionType: string, grade: string): Promise<boolean> {
    const gradeConfig = await this.getGradeConfig(grade);
    if (!gradeConfig) return true; // Default to suitable if no config

    return !gradeConfig.unsuitable_question_types?.includes(questionType);
  }

  // Get random skill for a grade and subject
  async getRandomSkill(grade: string, subject: string): Promise<Skill | null> {
    const skills = await this.getSkills(grade, subject);
    if (skills.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * skills.length);
    return skills[randomIndex];
  }

  // Clear all caches (useful for testing)
  clearCache(): void {
    this.questionTypeCache.clear();
    this.gradeConfigCache.clear();
    this.skillsCache.clear();
    this.detectionRulesCache = [];
    this.lastCacheRefresh = 0;
  }
}

// Export singleton instance
export const staticDataService = new StaticDataService();