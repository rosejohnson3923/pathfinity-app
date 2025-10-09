/**
 * SkillClusterService - Dynamic skill cluster loading for adaptive learning
 * 
 * This service manages the loading and organization of skill clusters (A.0-A.n)
 * from the database (skills_master) for real-time progression based on diagnostic results.
 * 
 * Key Features:
 * - Loads skill categories (A.0, B.0, etc.) with their associated skills from database
 * - Enables dynamic progression within clusters
 * - Maintains career-agnostic skill structure
 * - Supports continuous learning journeys
 */

import { staticDataService } from './StaticDataService';

export interface SkillCluster {
  categoryId: string;           // e.g., "A.0", "B.0"
  categoryName: string;         // e.g., "Counting and Cardinality"
  gradeLevel: string;
  subject: string;
  skills: Skill[];              // A.1, A.2, A.3, etc.
  totalSkills: number;
  masteryThreshold: number;     // Number of skills to master before moving to next cluster
}

export interface Skill {
  id: string;
  subject: string;
  grade: number | string;
  skillsArea: string;
  skillCluster: string;
  skillNumber: string;
  skillName: string;
  description?: string;
  difficulty?: number;
  prerequisites?: string[];
  nextSkills?: string[];
}

export interface ClusterProgress {
  clusterId: string;
  skillsAttempted: string[];
  skillsMastered: string[];
  currentSkillIndex: number;
  diagnosticScore?: number;
  recommendedPath: string[];
}

export class SkillClusterService {
  private static instance: SkillClusterService;
  private skillCache: Map<string, SkillCluster> = new Map();
  private skillsByIdCache: Map<string, Skill> = new Map();
  private databaseSkillsCache: Map<string, any[]> = new Map();
  
  private constructor() {}
  
  public static getInstance(): SkillClusterService {
    if (!SkillClusterService.instance) {
      SkillClusterService.instance = new SkillClusterService();
    }
    return SkillClusterService.instance;
  }
  
  /**
   * Map subject names for specific grade levels
   * Grade 10 has "Algebra I" and "Pre-Calculus" instead of "Math"
   */
  private mapSubjectForGrade(subject: string, gradeLevel: string): string {
    const normalizedGrade = this.normalizeGradeLevel(gradeLevel);
    
    // Grade 10 special mappings
    if (normalizedGrade === 'Grade 10' || gradeLevel === '10') {
      const subjectMap: { [key: string]: string } = {
        'Math': 'Math',                    // Keep Math as Math - it exists in DB
        'Mathematics': 'Math',     
        'Advanced Math': 'Precalculus',    // Match database name
        'Algebra': 'Algebra 1',            // Map to correct DB name
        'ELA': 'ELA',                      // ELA exists in Grade 10
        'English': 'ELA',
        'Science': 'Science',              // Check if Science exists in DB
        'Social Studies': 'Social Studies', // Check if Social Studies exists in DB
        'History': 'Social Studies'
      };
      
      // Return mapped subject or original if not in map
      const mapped = subjectMap[subject];
      if (mapped !== undefined) {
        return mapped;
      }
    }
    
    return subject;
  }
  
  /**
   * Load a skill cluster for a specific grade and subject
   * Example: loadCluster('Kindergarten', 'Math', 'A')
   * NOW USES DATABASE (skills_master) instead of hardcoded data
   */
  public async loadClusterAsync(
    gradeLevel: string, 
    subject: string, 
    categoryPrefix: string
  ): Promise<SkillCluster | null> {
    // Map subject for special grade levels
    const mappedSubject = this.mapSubjectForGrade(subject, gradeLevel);
    
    if (!mappedSubject) {
      console.warn(`No ${subject} curriculum available for ${gradeLevel}`);
      return null;
    }
    
    const cacheKey = `${gradeLevel}-${mappedSubject}-${categoryPrefix}`;
    
    // Check cache first
    if (this.skillCache.has(cacheKey)) {
      return this.skillCache.get(cacheKey)!;
    }

    // FETCH FROM DATABASE instead of hardcoded data
    const dbSkills = await staticDataService.getSkills(gradeLevel, mappedSubject);
    
    if (!dbSkills || dbSkills.length === 0) {
      console.warn(`[DB] No skills found in database for ${gradeLevel} ${mappedSubject}`);
      return null;
    }
    
    // Convert database skills to Skill interface
    const subjectSkills: Skill[] = dbSkills.map(dbSkill => ({
      id: dbSkill.skill_id,
      subject: dbSkill.subject,
      grade: dbSkill.grade_level,
      skillsArea: dbSkill.topic || mappedSubject,
      skillCluster: categoryPrefix,
      skillNumber: dbSkill.skill_number,
      skillName: dbSkill.skill_name || dbSkill.skill_description, // Use skill_name if available
      description: dbSkill.skill_description,
      difficulty: parseInt(dbSkill.difficulty_level) || 1,
      prerequisites: dbSkill.prerequisites || [],
      nextSkills: []
    }));
    
    // Filter skills by category prefix (A, B, C, etc.)
    const clusterSkills = subjectSkills.filter(skill => 
      skill.skillNumber && skill.skillNumber.startsWith(`${categoryPrefix}.`)
    );
    
    if (clusterSkills.length === 0) {
      console.warn(`[DB] No skills found for cluster ${categoryPrefix} in ${subject} ${gradeLevel}`);
      return null;
    }
    
    // Find the category (X.0) skill
    const categorySkill = clusterSkills.find(s => s.skillNumber === `${categoryPrefix}.0`);
    const categoryName = categorySkill?.skillName || `${subject} Skills - ${categoryPrefix}`;
    
    // Filter out the category header (X.0) from learnable skills
    const learnableSkills = clusterSkills.filter(s => s.skillNumber !== `${categoryPrefix}.0`);
    
    // Sort skills by skill number (A.1, A.2, A.3, etc.)
    learnableSkills.sort((a, b) => {
      const aNum = parseFloat(a.skillNumber.split('.')[1] || '0');
      const bNum = parseFloat(b.skillNumber.split('.')[1] || '0');
      return aNum - bNum;
    });
    
    // Cache skills by ID for quick lookup
    learnableSkills.forEach(skill => {
      this.skillsByIdCache.set(skill.id, skill);
    });
    
    const cluster: SkillCluster = {
      categoryId: `${categoryPrefix}.0`,
      categoryName,
      gradeLevel,
      subject,
      skills: learnableSkills,
      totalSkills: learnableSkills.length,
      masteryThreshold: Math.ceil(learnableSkills.length * 0.8) // 80% mastery to progress
    };

    // Cache the cluster
    this.skillCache.set(cacheKey, cluster);

    return cluster;
  }
  
  /**
   * Load a skill cluster synchronously (for backward compatibility)
   * This is a wrapper that checks cache first
   */
  public loadCluster(
    gradeLevel: string, 
    subject: string, 
    categoryPrefix: string
  ): SkillCluster | null {
    const mappedSubject = this.mapSubjectForGrade(subject, gradeLevel);
    const cacheKey = `${gradeLevel}-${mappedSubject}-${categoryPrefix}`;

    // Check cache first - if skills were preloaded, they'll be here
    if (this.skillCache.has(cacheKey)) {
      const cluster = this.skillCache.get(cacheKey)!;
      return cluster;
    }

    // Trigger async load for future use
    this.loadClusterAsync(gradeLevel, subject, categoryPrefix);

    // Return a minimal cluster for immediate use
    // This will be replaced by the database version once loaded
    return {
      categoryId: `${categoryPrefix}.0`,
      categoryName: `${subject} Skills - ${categoryPrefix}`,
      gradeLevel,
      subject,
      skills: [],
      totalSkills: 0,
      masteryThreshold: 1
    };
  }
  
  /**
   * Load multiple clusters for cross-subject learning
   */
  public loadMultipleClasters(
    gradeLevel: string,
    clusterMap: { [subject: string]: string }
  ): SkillCluster[] {
    const clusters: SkillCluster[] = [];
    
    for (const [subject, categoryPrefix] of Object.entries(clusterMap)) {
      const cluster = this.loadCluster(gradeLevel, subject, categoryPrefix);
      if (cluster) {
        clusters.push(cluster);
      }
    }
    
    return clusters;
  }
  
  /**
   * Get all available clusters for a grade and subject
   * NOW USES DATABASE instead of hardcoded data
   */
  public async getAvailableClustersAsync(gradeLevel: string, subject: string): Promise<string[]> {
    const mappedSubject = this.mapSubjectForGrade(subject, gradeLevel);
    
    if (!mappedSubject) {
      return [];
    }
    
    // FETCH FROM DATABASE
    const dbSkills = await staticDataService.getSkills(gradeLevel, mappedSubject);
    
    if (!dbSkills || dbSkills.length === 0) {
      console.warn(`[DB] No skills found in database for ${gradeLevel} ${mappedSubject}`);
      return [];
    }
    
    const categories = new Set<string>();
    
    dbSkills.forEach(skill => {
      if (skill.skill_number) {
        const category = skill.skill_number.split('.')[0];
        categories.add(category);
      }
    });
    
    return Array.from(categories).sort();
  }
  
  /**
   * Get all available clusters synchronously (for backward compatibility)
   */
  public getAvailableClusters(gradeLevel: string, subject: string): string[] {
    // For now, return a default set of clusters
    // The async version will provide the real data
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  }
  
  /**
   * Determine next cluster based on mastery progress
   */
  public getNextCluster(
    gradeLevel: string,
    subject: string,
    currentClusterPrefix: string,
    progress: ClusterProgress
  ): string | null {
    const availableClusters = this.getAvailableClusters(gradeLevel, subject);
    const currentIndex = availableClusters.indexOf(currentClusterPrefix);
    
    if (currentIndex === -1 || currentIndex === availableClusters.length - 1) {
      return null; // No next cluster available
    }
    
    // Check if mastery threshold is met
    const currentCluster = this.loadCluster(gradeLevel, subject, currentClusterPrefix);
    if (!currentCluster) return null;
    
    if (progress.skillsMastered.length >= currentCluster.masteryThreshold) {
      return availableClusters[currentIndex + 1];
    }
    
    return null; // Stay in current cluster
  }
  
  /**
   * Get diagnostic cluster for initial assessment
   */
  public getDiagnosticCluster(gradeLevel: string, subject: string): SkillCluster | null {
    // Start with 'A' cluster for diagnostic
    return this.loadCluster(gradeLevel, subject, 'A');
  }
  
  /**
   * Preload skills for a grade and subject
   * This ensures skills are available before components render
   */
  public async preloadSkills(gradeLevel: string, subject: string): Promise<void> {
    // Load the first cluster (A) which will cache skills
    const cluster = await this.loadClusterAsync(gradeLevel, subject, 'A');

    if (!cluster) {
      console.warn(`[DB] No skills to preload for ${subject} Grade ${gradeLevel}`);
    }
  }
  
  /**
   * Build adaptive path based on diagnostic results
   */
  public buildAdaptivePath(
    gradeLevel: string,
    subject: string,
    diagnosticResults: { skillId: string; correct: boolean }[]
  ): string[] {
    const path: string[] = [];
    const mastered = new Set<string>();
    const needsWork = new Set<string>();
    
    diagnosticResults.forEach(result => {
      if (result.correct) {
        mastered.add(result.skillId);
      } else {
        needsWork.add(result.skillId);
      }
    });
    
    // Build path prioritizing skills that need work
    const clusters = this.getAvailableClusters(gradeLevel, subject);
    
    for (const clusterPrefix of clusters) {
      const cluster = this.loadCluster(gradeLevel, subject, clusterPrefix);
      if (!cluster) continue;
      
      const clusterNeedsWork = cluster.skills.some(skill => 
        needsWork.has(skill.id) || !mastered.has(skill.id)
      );
      
      if (clusterNeedsWork) {
        // Add skills from this cluster that need work
        cluster.skills.forEach(skill => {
          if (!mastered.has(skill.id)) {
            path.push(skill.id);
          }
        });
      }
    }
    
    return path;
  }
  
  /**
   * Normalize grade level for consistent lookup
   */
  private normalizeGradeLevel(grade: string): string {
    const gradeMap: { [key: string]: string } = {
      'K': 'Kindergarten',
      'Kindergarten': 'Kindergarten',
      '1': 'Grade 1',
      '1st': 'Grade 1',
      'Grade 1': 'Grade 1',
      '3': 'Grade 3',
      '3rd': 'Grade 3',
      'Grade 3': 'Grade 3',
      '7': 'Grade 7',
      '7th': 'Grade 7',
      'Grade 7': 'Grade 7',
      '10': 'Grade 10',
      '10th': 'Grade 10',
      'Grade 10': 'Grade 10'
    };
    
    return gradeMap[grade] || grade;
  }
  
  /**
   * Get skill by ID
   * NOW USES DATABASE CACHE instead of hardcoded data
   */
  public getSkillById(skillId: string): Skill | null {
    // First check the cache populated by loadClusterAsync
    if (this.skillsByIdCache.has(skillId)) {
      return this.skillsByIdCache.get(skillId)!;
    }
    
    // If not in cache, trigger an async load
    // Parse skill ID format: Math_K_1 or Math_1_15 or algebra-i_10_1
    const parts = skillId.split('_');
    if (parts.length < 3) {
      console.warn(`[DB] Invalid skill ID format: ${skillId}`);
      return null;
    }
    
    const subject = parts[0];
    const grade = parts[1];
    
    // Trigger async load to populate cache for next time
    const normalizedGrade = this.normalizeGradeLevel(grade);
    console.log(`[DB] Skill ${skillId} not in cache, triggering async load for ${subject} Grade ${grade}`);
    
    // Try to determine cluster prefix from the skill ID
    // This is a temporary measure while the async load happens
    staticDataService.getSkills(grade, subject).then(dbSkills => {
      if (dbSkills && dbSkills.length > 0) {
        // Cache all skills from this subject/grade
        dbSkills.forEach(dbSkill => {
          const skill: Skill = {
            id: dbSkill.skill_id,
            subject: dbSkill.subject,
            grade: dbSkill.grade_level,
            skillsArea: dbSkill.topic || subject,
            skillCluster: dbSkill.skill_number?.split('.')[0] || 'A',
            skillNumber: dbSkill.skill_number,
            skillName: dbSkill.skill_name || dbSkill.skill_description,
            description: dbSkill.skill_description,
            difficulty: parseInt(dbSkill.difficulty_level) || 1,
            prerequisites: dbSkill.prerequisites || [],
            nextSkills: []
          };
          this.skillsByIdCache.set(dbSkill.skill_id, skill);
        });
        console.log(`[DB] Cached ${dbSkills.length} skills from database for ${subject} Grade ${grade}`);
      }
    });
    
    // Return null for now - the skill will be available after async load
    return null;
  }
  
  /**
   * Group skills by cluster for a given grade and subject
   * NOW USES DATABASE instead of hardcoded data
   */
  public async getSkillsByClusterAsync(gradeLevel: string, subject: string): Promise<Map<string, Skill[]>> {
    const mappedSubject = this.mapSubjectForGrade(subject, gradeLevel);
    const clusterMap = new Map<string, Skill[]>();
    
    if (!mappedSubject) {
      return clusterMap;
    }
    
    // FETCH FROM DATABASE
    const dbSkills = await staticDataService.getSkills(gradeLevel, mappedSubject);
    
    if (!dbSkills || dbSkills.length === 0) {
      console.warn(`[DB] No skills found in database for ${gradeLevel} ${mappedSubject}`);
      return clusterMap;
    }
    
    // Convert and group database skills
    dbSkills.forEach(dbSkill => {
      if (dbSkill.skill_number) {
        const clusterPrefix = dbSkill.skill_number.split('.')[0];
        if (!clusterMap.has(clusterPrefix)) {
          clusterMap.set(clusterPrefix, []);
        }
        
        const skill: Skill = {
          id: dbSkill.skill_id,
          subject: dbSkill.subject,
          grade: dbSkill.grade_level,
          skillsArea: dbSkill.topic || mappedSubject,
          skillCluster: clusterPrefix,
          skillNumber: dbSkill.skill_number,
          skillName: dbSkill.skill_description,
          description: dbSkill.skill_description,
          difficulty: parseInt(dbSkill.difficulty_level) || 1,
          prerequisites: dbSkill.prerequisites || [],
          nextSkills: []
        };
        
        clusterMap.get(clusterPrefix)!.push(skill);
        // Also cache for getSkillById
        this.skillsByIdCache.set(dbSkill.skill_id, skill);
      }
    });
    
    // Sort skills within each cluster
    clusterMap.forEach((skills, key) => {
      skills.sort((a, b) => {
        const aNum = parseFloat(a.skillNumber.split('.')[1] || '0');
        const bNum = parseFloat(b.skillNumber.split('.')[1] || '0');
        return aNum - bNum;
      });
    });
    
    console.log(`[DB] Grouped ${dbSkills.length} skills into ${clusterMap.size} clusters from database`);
    return clusterMap;
  }
  
  /**
   * Group skills by cluster synchronously (for backward compatibility)
   */
  public getSkillsByCluster(gradeLevel: string, subject: string): Map<string, Skill[]> {
    // Return empty map for now, async version will provide real data
    return new Map<string, Skill[]>();
  }
}

// Export singleton instance
export const skillClusterService = SkillClusterService.getInstance();