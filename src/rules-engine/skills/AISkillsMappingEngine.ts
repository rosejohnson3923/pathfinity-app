/**
 * AISkillsMappingEngine
 * 
 * High-performance engine for managing and mapping large skill datasets
 * Designed to handle 100,000+ skill entries across 12 grades
 * 
 * Features:
 * - Efficient skill lookup with O(1) access via multiple indexes
 * - Lazy loading of skill data to reduce memory footprint
 * - Intelligent caching with LRU eviction
 * - Grade progression and prerequisite mapping
 * - Skill recommendation based on student progress
 * - Search and filtering capabilities
 */

import { BaseRulesEngine } from '../core/BaseRulesEngine';
import { Rule, RuleContext, RuleResult, RuleExecutionOptions } from '../types';
import { Skill, GradeSkills, SubjectSkills } from '../../data/skillsDataComplete';

// Extended skill interfaces for mapping engine
export interface SkillMetadata extends Skill {
  prerequisites?: string[];
  nextSkills?: string[];
  difficulty?: number;
  estimatedTime?: number;
  visualAidsRequired?: boolean;
  careerConnections?: string[];
}

export interface SkillProgressionPath {
  currentSkill: string;
  nextSkills: string[];
  prerequisites: string[];
  alternativePaths?: string[][];
}

export interface SkillSearchCriteria {
  grade?: string;
  subject?: string;
  skillsArea?: string;
  skillCluster?: string;
  keyword?: string;
  difficulty?: { min: number; max: number };
  hasVisualAids?: boolean;
}

export interface SkillRecommendation {
  skillId: string;
  reason: string;
  confidence: number;
  estimatedSuccessRate: number;
}

// Context for skills mapping operations
export interface SkillsMappingContext extends RuleContext {
  operation: 'lookup' | 'search' | 'recommend' | 'validate' | 'progress';
  studentGrade?: string;
  studentSubject?: string;
  currentSkill?: string;
  targetSkill?: string;
  searchCriteria?: SkillSearchCriteria;
  studentHistory?: string[];
  masteredSkills?: string[];
}

// Result from skills mapping operations
export interface SkillsMappingResult extends RuleResult {
  skills?: SkillMetadata[];
  recommendations?: SkillRecommendation[];
  progressionPath?: SkillProgressionPath;
  validationErrors?: string[];
}

export class AISkillsMappingEngine extends BaseRulesEngine<SkillsMappingContext> {
  private static instance: AISkillsMappingEngine;
  
  // Multiple indexes for O(1) lookups
  private skillById: Map<string, SkillMetadata> = new Map();
  private skillsByGrade: Map<string, Map<string, SkillMetadata[]>> = new Map();
  private skillsBySubject: Map<string, SkillMetadata[]> = new Map();
  private skillsByCluster: Map<string, SkillMetadata[]> = new Map();
  private skillsByName: Map<string, SkillMetadata[]> = new Map();
  
  // Caching structures
  private searchCache: Map<string, SkillMetadata[]> = new Map();
  private recommendationCache: Map<string, SkillRecommendation[]> = new Map();
  private progressionCache: Map<string, SkillProgressionPath> = new Map();
  
  // Performance metrics
  private cacheHits = 0;
  private cacheMisses = 0;
  private totalLookups = 0;
  
  // Configuration
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly CACHE_TTL = 3600000; // 1 hour
  private cacheTimestamps: Map<string, number> = new Map();
  
  // Grade progression mapping
  private readonly GRADE_SEQUENCE = [
    'Kindergarten', 'K', 'Grade 1', '1', 'Grade 2', '2', 
    'Grade 3', '3', 'Grade 4', '4', 'Grade 5', '5',
    'Grade 6', '6', 'Grade 7', '7', 'Grade 8', '8',
    'Grade 9', '9', 'Grade 10', '10', 'Grade 11', '11', 'Grade 12', '12'
  ];
  
  private readonly GRADE_NORMALIZATION: Map<string, string> = new Map([
    ['K', 'Kindergarten'],
    ['1', 'Grade 1'],
    ['2', 'Grade 2'],
    ['3', 'Grade 3'],
    ['4', 'Grade 4'],
    ['5', 'Grade 5'],
    ['6', 'Grade 6'],
    ['7', 'Grade 7'],
    ['8', 'Grade 8'],
    ['9', 'Grade 9'],
    ['10', 'Grade 10'],
    ['11', 'Grade 11'],
    ['12', 'Grade 12']
  ]);

  private constructor() {
    super('AISkillsMappingEngine', {
      name: 'AI Skills Mapping Engine',
      description: 'High-performance engine for managing 34,000+ educational skills'
    });
    this.initializeEngine();
  }

  public static getInstance(): AISkillsMappingEngine {
    if (!AISkillsMappingEngine.instance) {
      AISkillsMappingEngine.instance = new AISkillsMappingEngine();
    }
    return AISkillsMappingEngine.instance;
  }

  private async initializeEngine(): Promise<void> {
    this.registerRules();
    // Lazy load skills data when first accessed
    console.log('🗺️ AISkillsMappingEngine initialized - ready for lazy loading');
  }

  protected registerRules(): void {
    // Skill lookup rules
    this.addRuleInternal({
      id: 'skill-lookup-by-id',
      name: 'Lookup Skill by ID',
      condition: (ctx) => ctx.operation === 'lookup' && !!ctx.targetSkill,
      action: async (ctx) => this.lookupSkillById(ctx),
      priority: 1
    });

    this.addRuleInternal({
      id: 'skill-search',
      name: 'Search Skills',
      condition: (ctx) => ctx.operation === 'search' && !!ctx.searchCriteria,
      action: async (ctx) => this.searchSkills(ctx),
      priority: 2
    });

    this.addRuleInternal({
      id: 'skill-recommend',
      name: 'Recommend Next Skills',
      condition: (ctx) => ctx.operation === 'recommend',
      action: async (ctx) => this.recommendSkills(ctx),
      priority: 3
    });

    this.addRuleInternal({
      id: 'skill-validate',
      name: 'Validate Skill Progression',
      condition: (ctx) => ctx.operation === 'validate',
      action: async (ctx) => this.validateProgression(ctx),
      priority: 4
    });

    this.addRuleInternal({
      id: 'skill-progress-path',
      name: 'Generate Progression Path',
      condition: (ctx) => ctx.operation === 'progress',
      action: async (ctx) => this.generateProgressionPath(ctx),
      priority: 5
    });

    // Performance monitoring rule
    this.addRuleInternal({
      id: 'performance-monitor',
      name: 'Monitor Performance',
      condition: () => true,
      action: async () => this.monitorPerformance(),
      priority: 100
    });
  }

  /**
   * Lazy load skills data from file
   * Only loads data when first accessed to reduce startup time
   */
  private async loadSkillsData(): Promise<void> {
    if (this.skillById.size > 0) {
      return; // Already loaded
    }

    try {
      // Dynamic import to avoid loading at startup
      const { skillsData } = await import('../../data/skillsDataComplete');
      
      let loadedCount = 0;
      const startTime = Date.now();

      // Process all grades
      for (const [grade, subjects] of Object.entries(skillsData)) {
        const normalizedGrade = this.normalizeGrade(grade);
        
        if (!this.skillsByGrade.has(normalizedGrade)) {
          this.skillsByGrade.set(normalizedGrade, new Map());
        }

        // Process all subjects
        for (const [subject, skills] of Object.entries(subjects)) {
          // Process all skills
          for (const skill of skills) {
            const metadata = this.enrichSkillMetadata(skill);
            
            // Index by ID
            this.skillById.set(metadata.id, metadata);
            
            // Index by grade-subject
            const gradeMap = this.skillsByGrade.get(normalizedGrade)!;
            if (!gradeMap.has(subject)) {
              gradeMap.set(subject, []);
            }
            gradeMap.get(subject)!.push(metadata);
            
            // Index by subject
            if (!this.skillsBySubject.has(subject)) {
              this.skillsBySubject.set(subject, []);
            }
            this.skillsBySubject.get(subject)!.push(metadata);
            
            // Index by cluster
            if (metadata.skillCluster) {
              const clusterKey = `${normalizedGrade}-${subject}-${metadata.skillCluster}`;
              if (!this.skillsByCluster.has(clusterKey)) {
                this.skillsByCluster.set(clusterKey, []);
              }
              this.skillsByCluster.get(clusterKey)!.push(metadata);
            }
            
            // Index by name (for search)
            const nameKey = metadata.skillName.toLowerCase();
            if (!this.skillsByName.has(nameKey)) {
              this.skillsByName.set(nameKey, []);
            }
            this.skillsByName.get(nameKey)!.push(metadata);
            
            loadedCount++;
          }
        }
      }

      const loadTime = Date.now() - startTime;
      console.log(`📚 Loaded ${loadedCount} skills in ${loadTime}ms`);
      console.log(`   Grades: ${this.skillsByGrade.size}`);
      console.log(`   Subjects: ${this.skillsBySubject.size}`);
      console.log(`   Cache ready for ${this.GRADE_SEQUENCE.length} grade levels`);
      
    } catch (error) {
      console.error('Failed to load skills data:', error);
      throw new Error('Skills data loading failed');
    }
  }

  /**
   * Enrich basic skill data with metadata
   */
  private enrichSkillMetadata(skill: Skill): SkillMetadata {
    const metadata: SkillMetadata = {
      ...skill,
      prerequisites: this.inferPrerequisites(skill),
      nextSkills: this.inferNextSkills(skill),
      difficulty: this.calculateDifficulty(skill),
      estimatedTime: this.estimateTime(skill),
      visualAidsRequired: this.requiresVisualAids(skill),
      careerConnections: this.getCareerConnections(skill)
    };
    
    return metadata;
  }

  /**
   * Infer prerequisites based on skill cluster and number
   */
  private inferPrerequisites(skill: Skill): string[] {
    const prerequisites: string[] = [];
    
    // Parse skill number (e.g., "B.3" -> cluster B, number 3)
    const match = skill.skillNumber?.match(/([A-Z]+)\.(\d+)/);
    if (match) {
      const [, cluster, number] = match;
      const num = parseInt(number);
      
      // Previous skill in same cluster
      if (num > 0) {
        prerequisites.push(`${skill.subject}_${skill.grade}_${cluster}.${num - 1}`);
      }
      
      // Previous cluster if at start of new cluster
      if (num === 0 && cluster > 'A') {
        const prevCluster = String.fromCharCode(cluster.charCodeAt(0) - 1);
        prerequisites.push(`${skill.subject}_${skill.grade}_${prevCluster}.*`);
      }
    }
    
    return prerequisites;
  }

  /**
   * Infer next skills based on progression
   */
  private inferNextSkills(skill: Skill): string[] {
    const nextSkills: string[] = [];
    
    const match = skill.skillNumber?.match(/([A-Z]+)\.(\d+)/);
    if (match) {
      const [, cluster, number] = match;
      const num = parseInt(number);
      
      // Next skill in same cluster
      nextSkills.push(`${skill.subject}_${skill.grade}_${cluster}.${num + 1}`);
      
      // Next cluster if high number
      if (num >= 9) {
        const nextCluster = String.fromCharCode(cluster.charCodeAt(0) + 1);
        nextSkills.push(`${skill.subject}_${skill.grade}_${nextCluster}.0`);
      }
    }
    
    return nextSkills;
  }

  /**
   * Calculate skill difficulty based on grade and progression
   */
  private calculateDifficulty(skill: Skill): number {
    let difficulty = 1;
    
    // Grade-based difficulty
    const gradeIndex = this.GRADE_SEQUENCE.indexOf(this.normalizeGrade(skill.grade.toString()));
    difficulty += gradeIndex * 0.5;
    
    // Cluster-based difficulty (A=easy, Z=hard)
    const clusterMatch = skill.skillNumber?.match(/([A-Z]+)/);
    if (clusterMatch) {
      const cluster = clusterMatch[1];
      difficulty += (cluster.charCodeAt(0) - 65) * 0.1;
    }
    
    // Skill complexity based on name keywords
    const complexKeywords = ['advanced', 'complex', 'multi', 'word problems', 'analyze'];
    const simpleKeywords = ['basic', 'simple', 'identify', 'count', 'recognize'];
    
    const skillNameLower = skill.skillName.toLowerCase();
    if (complexKeywords.some(k => skillNameLower.includes(k))) {
      difficulty += 1;
    }
    if (simpleKeywords.some(k => skillNameLower.includes(k))) {
      difficulty -= 0.5;
    }
    
    return Math.max(1, Math.min(10, difficulty));
  }

  /**
   * Estimate time to complete skill
   */
  private estimateTime(skill: Skill): number {
    const baseTimes: Record<string, number> = {
      'Math': 15,
      'ELA': 20,
      'Science': 25,
      'Social Studies': 20
    };
    
    let time = baseTimes[skill.subject] || 20;
    
    // Adjust by difficulty
    time += this.calculateDifficulty(skill) * 2;
    
    // Kindergarten skills are shorter
    if (this.normalizeGrade(skill.grade.toString()) === 'Kindergarten') {
      time *= 0.7;
    }
    
    return Math.round(time);
  }

  /**
   * Determine if visual aids are required
   */
  private requiresVisualAids(skill: Skill): boolean {
    const grade = this.normalizeGrade(skill.grade.toString());
    
    // All K-2 math requires visuals
    if (skill.subject === 'Math' && ['Kindergarten', 'Grade 1', 'Grade 2'].includes(grade)) {
      return true;
    }
    
    // Counting and shapes always need visuals
    const visualKeywords = ['count', 'shape', 'picture', 'visual', 'identify', 'pattern'];
    return visualKeywords.some(k => skill.skillName.toLowerCase().includes(k));
  }

  /**
   * Get career connections for skill
   */
  private getCareerConnections(skill: Skill): string[] {
    const connections: Record<string, string[]> = {
      'Math': ['Engineer', 'Scientist', 'Teacher', 'Astronaut', 'Pilot'],
      'ELA': ['Writer', 'Teacher', 'Journalist', 'Lawyer', 'Editor'],
      'Science': ['Scientist', 'Doctor', 'Veterinarian', 'Engineer', 'Astronaut'],
      'Social Studies': ['Teacher', 'Historian', 'Police Officer', 'Politician', 'Archaeologist']
    };
    
    return connections[skill.subject] || ['Teacher'];
  }

  /**
   * Normalize grade strings
   */
  private normalizeGrade(grade: string): string {
    return this.GRADE_NORMALIZATION.get(grade) || grade;
  }

  /**
   * Lookup skill by ID
   */
  private async lookupSkillById(context: SkillsMappingContext): Promise<SkillsMappingResult> {
    await this.loadSkillsData();
    
    this.totalLookups++;
    
    const skill = this.skillById.get(context.targetSkill!);
    
    if (skill) {
      this.cacheHits++;
      return {
        success: true,
        message: `Found skill: ${skill.skillName}`,
        data: { skills: [skill] }
      };
    }
    
    this.cacheMisses++;
    return {
      success: false,
      message: `Skill not found: ${context.targetSkill}`,
      data: { validationErrors: [`Skill ID '${context.targetSkill}' does not exist`] }
    };
  }

  /**
   * Search skills based on criteria
   */
  private async searchSkills(context: SkillsMappingContext): Promise<SkillsMappingResult> {
    await this.loadSkillsData();
    
    const cacheKey = JSON.stringify(context.searchCriteria);
    
    // Check cache
    if (this.searchCache.has(cacheKey)) {
      const cached = this.searchCache.get(cacheKey)!;
      const timestamp = this.cacheTimestamps.get(cacheKey) || 0;
      
      if (Date.now() - timestamp < this.CACHE_TTL) {
        this.cacheHits++;
        return {
          success: true,
          message: `Found ${cached.length} skills (cached)`,
          data: { skills: cached }
        };
      }
    }
    
    this.cacheMisses++;
    
    let results: SkillMetadata[] = [];
    const criteria = context.searchCriteria!;
    
    // Start with grade/subject filtering
    if (criteria.grade && criteria.subject) {
      const gradeMap = this.skillsByGrade.get(this.normalizeGrade(criteria.grade));
      if (gradeMap) {
        results = gradeMap.get(criteria.subject) || [];
      }
    } else if (criteria.grade) {
      const gradeMap = this.skillsByGrade.get(this.normalizeGrade(criteria.grade));
      if (gradeMap) {
        for (const skills of gradeMap.values()) {
          results.push(...skills);
        }
      }
    } else if (criteria.subject) {
      results = this.skillsBySubject.get(criteria.subject) || [];
    } else {
      // All skills
      results = Array.from(this.skillById.values());
    }
    
    // Apply additional filters
    if (criteria.skillsArea) {
      results = results.filter(s => s.skillsArea === criteria.skillsArea);
    }
    
    if (criteria.skillCluster) {
      results = results.filter(s => s.skillCluster === criteria.skillCluster);
    }
    
    if (criteria.keyword) {
      const keyword = criteria.keyword.toLowerCase();
      results = results.filter(s => 
        s.skillName.toLowerCase().includes(keyword) ||
        s.description?.toLowerCase().includes(keyword)
      );
    }
    
    if (criteria.difficulty) {
      results = results.filter(s => 
        s.difficulty! >= criteria.difficulty!.min &&
        s.difficulty! <= criteria.difficulty!.max
      );
    }
    
    if (criteria.hasVisualAids !== undefined) {
      results = results.filter(s => s.visualAidsRequired === criteria.hasVisualAids);
    }
    
    // Cache results
    this.updateCache(cacheKey, results);
    
    return {
      success: true,
      message: `Found ${results.length} skills`,
      data: { skills: results }
    };
  }

  /**
   * Recommend next skills for student
   */
  private async recommendSkills(context: SkillsMappingContext): Promise<SkillsMappingResult> {
    await this.loadSkillsData();
    
    const recommendations: SkillRecommendation[] = [];
    
    // Get student's current skill
    if (context.currentSkill) {
      const currentSkill = this.skillById.get(context.currentSkill);
      
      if (currentSkill) {
        // Recommend next skills in progression
        for (const nextSkillId of currentSkill.nextSkills || []) {
          const nextSkill = this.skillById.get(nextSkillId);
          if (nextSkill) {
            recommendations.push({
              skillId: nextSkillId,
              reason: 'Natural progression from current skill',
              confidence: 0.9,
              estimatedSuccessRate: 0.8
            });
          }
        }
        
        // Recommend similar difficulty skills in other areas
        const similarSkills = await this.findSimilarSkills(currentSkill, context);
        for (const skill of similarSkills) {
          recommendations.push({
            skillId: skill.id,
            reason: 'Similar difficulty level',
            confidence: 0.7,
            estimatedSuccessRate: 0.75
          });
        }
      }
    }
    
    // Consider mastered skills
    if (context.masteredSkills && context.masteredSkills.length > 0) {
      const readySkills = await this.findReadySkills(context.masteredSkills);
      for (const skill of readySkills) {
        if (!recommendations.find(r => r.skillId === skill.id)) {
          recommendations.push({
            skillId: skill.id,
            reason: 'Prerequisites mastered',
            confidence: 0.85,
            estimatedSuccessRate: 0.7
          });
        }
      }
    }
    
    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);
    
    // Limit to top 10
    const topRecommendations = recommendations.slice(0, 10);
    
    return {
      success: true,
      message: `Generated ${topRecommendations.length} recommendations`,
      data: { recommendations: topRecommendations }
    };
  }

  /**
   * Find similar skills based on difficulty and subject
   */
  private async findSimilarSkills(
    baseSkill: SkillMetadata, 
    context: SkillsMappingContext
  ): Promise<SkillMetadata[]> {
    const similar: SkillMetadata[] = [];
    const targetDifficulty = baseSkill.difficulty || 1;
    
    // Search in same grade, different subjects
    const gradeMap = this.skillsByGrade.get(this.normalizeGrade(baseSkill.grade.toString()));
    if (gradeMap) {
      for (const [subject, skills] of gradeMap.entries()) {
        if (subject !== baseSkill.subject) {
          const filtered = skills.filter(s => 
            Math.abs((s.difficulty || 1) - targetDifficulty) <= 0.5 &&
            !context.masteredSkills?.includes(s.id)
          );
          similar.push(...filtered.slice(0, 2));
        }
      }
    }
    
    return similar.slice(0, 5);
  }

  /**
   * Find skills ready to learn based on mastered prerequisites
   */
  private async findReadySkills(masteredSkills: string[]): Promise<SkillMetadata[]> {
    const ready: SkillMetadata[] = [];
    const masteredSet = new Set(masteredSkills);
    
    // Check each mastered skill's next skills
    for (const skillId of masteredSkills) {
      const skill = this.skillById.get(skillId);
      if (skill && skill.nextSkills) {
        for (const nextId of skill.nextSkills) {
          const nextSkill = this.skillById.get(nextId);
          if (nextSkill && !masteredSet.has(nextId)) {
            // Check if all prerequisites are met
            const prereqsMet = !nextSkill.prerequisites || 
              nextSkill.prerequisites.every(p => masteredSet.has(p));
            
            if (prereqsMet) {
              ready.push(nextSkill);
            }
          }
        }
      }
    }
    
    return ready;
  }

  /**
   * Validate skill progression
   */
  private async validateProgression(context: SkillsMappingContext): Promise<SkillsMappingResult> {
    await this.loadSkillsData();
    
    const errors: string[] = [];
    
    if (!context.currentSkill || !context.targetSkill) {
      errors.push('Both current and target skills must be specified');
      return {
        success: false,
        message: 'Validation failed',
        data: { validationErrors: errors }
      };
    }
    
    const currentSkill = this.skillById.get(context.currentSkill);
    const targetSkill = this.skillById.get(context.targetSkill);
    
    if (!currentSkill) {
      errors.push(`Current skill '${context.currentSkill}' not found`);
    }
    
    if (!targetSkill) {
      errors.push(`Target skill '${context.targetSkill}' not found`);
    }
    
    if (currentSkill && targetSkill) {
      // Check grade progression
      const currentGradeIndex = this.GRADE_SEQUENCE.indexOf(
        this.normalizeGrade(currentSkill.grade.toString())
      );
      const targetGradeIndex = this.GRADE_SEQUENCE.indexOf(
        this.normalizeGrade(targetSkill.grade.toString())
      );
      
      if (targetGradeIndex - currentGradeIndex > 2) {
        errors.push('Target skill is more than 2 grades ahead');
      }
      
      // Check difficulty jump
      const difficultyJump = (targetSkill.difficulty || 1) - (currentSkill.difficulty || 1);
      if (difficultyJump > 3) {
        errors.push('Difficulty jump is too large');
      }
      
      // Check prerequisites
      if (targetSkill.prerequisites && targetSkill.prerequisites.length > 0) {
        if (!context.masteredSkills || !targetSkill.prerequisites.every(p => 
          context.masteredSkills!.includes(p)
        )) {
          errors.push('Not all prerequisites are mastered');
        }
      }
    }
    
    return {
      success: errors.length === 0,
      message: errors.length === 0 ? 'Progression is valid' : 'Validation failed',
      data: { validationErrors: errors }
    };
  }

  /**
   * Generate progression path between skills
   */
  private async generateProgressionPath(context: SkillsMappingContext): Promise<SkillsMappingResult> {
    await this.loadSkillsData();
    
    if (!context.currentSkill) {
      return {
        success: false,
        message: 'Current skill required',
        data: { validationErrors: ['No current skill specified'] }
      };
    }
    
    const currentSkill = this.skillById.get(context.currentSkill);
    if (!currentSkill) {
      return {
        success: false,
        message: 'Skill not found',
        data: { validationErrors: [`Skill '${context.currentSkill}' not found`] }
      };
    }
    
    const path: SkillProgressionPath = {
      currentSkill: context.currentSkill,
      nextSkills: currentSkill.nextSkills || [],
      prerequisites: currentSkill.prerequisites || [],
      alternativePaths: []
    };
    
    // Generate alternative paths
    if (context.targetSkill) {
      const targetSkill = this.skillById.get(context.targetSkill);
      if (targetSkill) {
        // Simple path finding (can be enhanced with graph algorithms)
        const paths = this.findPaths(currentSkill, targetSkill, [], 0);
        path.alternativePaths = paths.slice(0, 3); // Top 3 paths
      }
    }
    
    return {
      success: true,
      message: 'Generated progression path',
      data: { progressionPath: path }
    };
  }

  /**
   * Simple path finding between skills
   */
  private findPaths(
    current: SkillMetadata, 
    target: SkillMetadata, 
    visited: string[], 
    depth: number
  ): string[][] {
    if (depth > 5) return []; // Limit depth
    if (current.id === target.id) return [[current.id]];
    
    const paths: string[][] = [];
    const newVisited = [...visited, current.id];
    
    for (const nextId of current.nextSkills || []) {
      if (!newVisited.includes(nextId)) {
        const nextSkill = this.skillById.get(nextId);
        if (nextSkill) {
          const subPaths = this.findPaths(nextSkill, target, newVisited, depth + 1);
          for (const subPath of subPaths) {
            paths.push([current.id, ...subPath]);
          }
        }
      }
    }
    
    return paths;
  }

  /**
   * Update cache with LRU eviction
   */
  private updateCache(key: string, data: SkillMetadata[]): void {
    // Evict old entries if cache is full
    if (this.searchCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cacheTimestamps.entries())
        .sort((a, b) => a[1] - b[1])[0][0];
      
      this.searchCache.delete(oldestKey);
      this.cacheTimestamps.delete(oldestKey);
    }
    
    this.searchCache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  /**
   * Monitor and report performance metrics
   */
  private async monitorPerformance(): Promise<SkillsMappingResult> {
    const hitRate = this.totalLookups > 0 
      ? (this.cacheHits / this.totalLookups) * 100 
      : 0;
    
    const metrics = {
      totalLookups: this.totalLookups,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRate: `${hitRate.toFixed(2)}%`,
      cacheSize: this.searchCache.size,
      indexedSkills: this.skillById.size,
      grades: this.skillsByGrade.size,
      subjects: this.skillsBySubject.size
    };
    
    // Reset counters periodically
    if (this.totalLookups > 10000) {
      this.totalLookups = 0;
      this.cacheHits = 0;
      this.cacheMisses = 0;
    }
    
    return {
      success: true,
      message: 'Performance metrics',
      data: metrics
    };
  }

  /**
   * Public API methods
   */
  
  public async getSkill(skillId: string): Promise<SkillMetadata | null> {
    await this.loadSkillsData();
    return this.skillById.get(skillId) || null;
  }

  public async getSkillsByGradeAndSubject(
    grade: string, 
    subject: string
  ): Promise<SkillMetadata[]> {
    await this.loadSkillsData();
    const gradeMap = this.skillsByGrade.get(this.normalizeGrade(grade));
    return gradeMap?.get(subject) || [];
  }

  public async searchSkillsByKeyword(keyword: string): Promise<SkillMetadata[]> {
    const result = await this.execute({
      operation: 'search',
      searchCriteria: { keyword }
    });
    
    return (result[0]?.data as any)?.skills || [];
  }

  public async getRecommendations(
    currentSkill: string,
    masteredSkills: string[]
  ): Promise<SkillRecommendation[]> {
    const result = await this.execute({
      operation: 'recommend',
      currentSkill,
      masteredSkills
    });
    
    return (result[0]?.data as any)?.recommendations || [];
  }

  public async validateSkillProgression(
    from: string,
    to: string,
    masteredSkills: string[]
  ): Promise<boolean> {
    const result = await this.execute({
      operation: 'validate',
      currentSkill: from,
      targetSkill: to,
      masteredSkills
    });
    
    return result[0]?.success || false;
  }

  public getPerformanceMetrics(): any {
    return {
      totalSkills: this.skillById.size,
      cacheHitRate: this.totalLookups > 0 
        ? `${((this.cacheHits / this.totalLookups) * 100).toFixed(2)}%`
        : 'N/A',
      searchCacheSize: this.searchCache.size,
      recommendationCacheSize: this.recommendationCache.size
    };
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.searchCache.clear();
    this.recommendationCache.clear();
    this.progressionCache.clear();
    this.cacheTimestamps.clear();
    console.log('🧹 All caches cleared');
  }

  /**
   * Preload data for specific grades
   */
  public async preloadGrades(grades: string[]): Promise<void> {
    await this.loadSkillsData();
    
    let preloadedCount = 0;
    for (const grade of grades) {
      const normalizedGrade = this.normalizeGrade(grade);
      const gradeSkills = this.skillsByGrade.get(normalizedGrade);
      
      if (gradeSkills) {
        for (const skills of gradeSkills.values()) {
          preloadedCount += skills.length;
        }
      }
    }
    
    console.log(`📚 Preloaded ${preloadedCount} skills for grades: ${grades.join(', ')}`);
  }
}

// Export singleton instance
export const skillsMappingEngine = AISkillsMappingEngine.getInstance();