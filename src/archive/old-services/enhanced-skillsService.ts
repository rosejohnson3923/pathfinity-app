/**
 * Enhanced Skills Service
 * Provides advanced skill management and mapping capabilities
 */

import { AISkillsMappingEngine } from '../rules-engine/skills/AISkillsMappingEngine';

export interface Skill {
  id: string;
  name: string;
  grade: string;
  subject: string;
  cluster?: string;
  difficulty?: number;
  prerequisites?: string[];
  description?: string;
  mastery?: number;
  lastPracticed?: Date;
}

export interface SkillProgress {
  skillId: string;
  studentId: string;
  mastery: number;
  attempts: number;
  correctAnswers: number;
  lastPracticed: Date;
  timeSpent: number;
}

export interface SkillRecommendation {
  skillId: string;
  reason: string;
  priority: number;
  estimatedTime: number;
}

class EnhancedSkillsService {
  private skillsMappingEngine: AISkillsMappingEngine;
  private studentProgress: Map<string, Map<string, SkillProgress>> = new Map();

  constructor() {
    this.skillsMappingEngine = new AISkillsMappingEngine();
    this.initializeSampleData();
  }

  /**
   * Initialize with sample data
   */
  private initializeSampleData() {
    // Sample progress for Sam (Kindergarten)
    const samProgress = new Map<string, SkillProgress>();
    samProgress.set('Math_K_4', {
      skillId: 'Math_K_4',
      studentId: 'sam-k',
      mastery: 0.75,
      attempts: 12,
      correctAnswers: 9,
      lastPracticed: new Date(),
      timeSpent: 300
    });
    samProgress.set('Math_K_14', {
      skillId: 'Math_K_14',
      studentId: 'sam-k',
      mastery: 0.60,
      attempts: 8,
      correctAnswers: 5,
      lastPracticed: new Date(Date.now() - 86400000),
      timeSpent: 240
    });
    this.studentProgress.set('sam-k', samProgress);
  }

  /**
   * Get skill by ID
   */
  async getSkill(skillId: string): Promise<Skill | null> {
    const metadata = this.skillsMappingEngine.getSkillById(skillId);
    if (!metadata) return null;

    return {
      id: metadata.id,
      name: metadata.name,
      grade: metadata.grade,
      subject: metadata.subject,
      cluster: metadata.cluster,
      difficulty: metadata.difficulty,
      prerequisites: metadata.prerequisites,
      description: metadata.description
    };
  }

  /**
   * Get skills by grade
   */
  async getSkillsByGrade(grade: string): Promise<Skill[]> {
    const skills = this.skillsMappingEngine.getSkillsByGrade(grade);
    return skills.map(metadata => ({
      id: metadata.id,
      name: metadata.name,
      grade: metadata.grade,
      subject: metadata.subject,
      cluster: metadata.cluster,
      difficulty: metadata.difficulty,
      prerequisites: metadata.prerequisites,
      description: metadata.description
    }));
  }

  /**
   * Get skills by subject
   */
  async getSkillsBySubject(subject: string): Promise<Skill[]> {
    const skills = this.skillsMappingEngine.getSkillsBySubject(subject);
    return skills.map(metadata => ({
      id: metadata.id,
      name: metadata.name,
      grade: metadata.grade,
      subject: metadata.subject,
      cluster: metadata.cluster,
      difficulty: metadata.difficulty,
      prerequisites: metadata.prerequisites,
      description: metadata.description
    }));
  }

  /**
   * Get skill recommendations for a student
   */
  async getRecommendations(studentId: string, count: number = 5): Promise<SkillRecommendation[]> {
    const recommendations: SkillRecommendation[] = [];
    const progress = this.studentProgress.get(studentId);
    
    // Get student's grade (simplified - in real app would fetch from student service)
    const grade = studentId === 'sam-k' ? 'K' : '3';
    
    // Get grade-appropriate skills
    const gradeSkills = this.skillsMappingEngine.getSkillsByGrade(grade);
    
    // Recommend skills based on prerequisites and mastery
    for (const skill of gradeSkills) {
      let priority = 5;
      let reason = 'Grade-appropriate skill';
      
      // Check if prerequisites are met
      if (skill.prerequisites && skill.prerequisites.length > 0) {
        const prereqsMet = skill.prerequisites.every(prereqId => {
          const prereqProgress = progress?.get(prereqId);
          return prereqProgress && prereqProgress.mastery >= 0.7;
        });
        
        if (!prereqsMet) {
          continue; // Skip skills with unmet prerequisites
        }
        priority = 8;
        reason = 'Prerequisites mastered';
      }
      
      // Check if skill needs practice
      const skillProgress = progress?.get(skill.id);
      if (!skillProgress) {
        priority = 10;
        reason = 'New skill to learn';
      } else if (skillProgress.mastery < 0.7) {
        priority = 9;
        reason = 'Needs more practice';
      } else if (Date.now() - skillProgress.lastPracticed.getTime() > 7 * 24 * 60 * 60 * 1000) {
        priority = 7;
        reason = 'Review needed';
      }
      
      recommendations.push({
        skillId: skill.id,
        reason,
        priority,
        estimatedTime: 10
      });
    }
    
    // Sort by priority and return top N
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, count);
  }

  /**
   * Update skill progress
   */
  async updateProgress(
    studentId: string,
    skillId: string,
    correct: boolean,
    timeSpent: number
  ): Promise<void> {
    let studentMap = this.studentProgress.get(studentId);
    if (!studentMap) {
      studentMap = new Map();
      this.studentProgress.set(studentId, studentMap);
    }
    
    let progress = studentMap.get(skillId);
    if (!progress) {
      progress = {
        skillId,
        studentId,
        mastery: 0,
        attempts: 0,
        correctAnswers: 0,
        lastPracticed: new Date(),
        timeSpent: 0
      };
      studentMap.set(skillId, progress);
    }
    
    // Update progress
    progress.attempts++;
    if (correct) {
      progress.correctAnswers++;
    }
    progress.timeSpent += timeSpent;
    progress.lastPracticed = new Date();
    
    // Calculate new mastery (simple average for now)
    progress.mastery = progress.correctAnswers / progress.attempts;
  }

  /**
   * Get student progress
   */
  async getStudentProgress(studentId: string): Promise<SkillProgress[]> {
    const studentMap = this.studentProgress.get(studentId);
    if (!studentMap) return [];
    return Array.from(studentMap.values());
  }

  /**
   * Get next skill for student
   */
  async getNextSkill(studentId: string): Promise<Skill | null> {
    const recommendations = await this.getRecommendations(studentId, 1);
    if (recommendations.length === 0) return null;
    
    return this.getSkill(recommendations[0].skillId);
  }

  /**
   * Search skills
   */
  async searchSkills(query: string): Promise<Skill[]> {
    const results = this.skillsMappingEngine.searchSkills(query);
    return results.map(metadata => ({
      id: metadata.id,
      name: metadata.name,
      grade: metadata.grade,
      subject: metadata.subject,
      cluster: metadata.cluster,
      difficulty: metadata.difficulty,
      prerequisites: metadata.prerequisites,
      description: metadata.description
    }));
  }
}

// Export singleton instance
export const skillsService = new EnhancedSkillsService();

// Also export the class for testing
export { EnhancedSkillsService };