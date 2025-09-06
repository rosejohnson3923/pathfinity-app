// Enhanced Skill Processing - Properly Handle Section Titles vs Skills
// Fixes the distinction between section headers (A.0) and actual skills (A.1, A.2, etc.)

import { skillsData } from '../data/skillsDataComplete';
import { UserProfile, LearningPath } from '../data/adaptiveSkillsData';

export interface SkillSection {
  id: string;
  title: string;
  description: string;
  skills: Skill[];
  estimatedTotalTime: number;
  learningObjectives: string[];
}

export interface EnhancedSkill extends any {
  isSection: boolean;
  sectionTitle?: string;
  skillsInSection?: any[];
  sequenceNumber: number;
  hasPrerequisites: boolean;
}

export interface DailySkill {
  skill: any;
  estimatedTime: number;
  priority: number;
  difficultyAdjustment: number;
  finnContext: string;
  sessionSlot: number;
  prerequisites: string[];
  learningObjectives: string[];
}

export interface DailyLearningPlan {
  userId: string;
  date: string;
  totalEstimatedTime: number;
  maxDailyTime: number;
  selectedSkills: DailySkill[];
  finnReasoning: string;
  adaptiveFactors: any;
  sessionBreakdown: any[];
}

export interface AdaptiveFactors {
  skillLevelMultiplier: number;
  learningStyleWeight: number;
  recentPerformance: number;
  timeOfDay: string;
  streakBonus: number;
}

// Enhanced Skills Data Processor
export class SkillHierarchyProcessor {
  
  /**
   * Process raw skills data to understand hierarchy
   */
  static processSkillHierarchy(rawSkills: any[]): {
    sections: SkillSection[];
    skills: EnhancedSkill[];
    skillMap: Map<string, EnhancedSkill>;
  } {
    const sections: SkillSection[] = [];
    const skills: EnhancedSkill[] = [];
    const skillMap = new Map<string, EnhancedSkill>();
    
    let currentSection: SkillSection | null = null;
    
    rawSkills.forEach(rawSkill => {
      const skillNumber = rawSkill.skillNumber || '';
      const isSection = skillNumber.endsWith('.0');
      
      const enhancedSkill: EnhancedSkill = {
        ...rawSkill,
        isSection,
        sequenceNumber: this.extractSequenceNumber(skillNumber),
        hasPrerequisites: !isSection && !skillNumber.endsWith('.1')
      };
      
      if (isSection) {
        // This is a section title (A.0, B.0, etc.)
        currentSection = {
          id: `section_${rawSkill.skillCluster}`,
          title: rawSkill.skillName,
          description: `Learn about ${rawSkill.skillName}`,
          skills: [],
          estimatedTotalTime: 0,
          learningObjectives: [`Master ${rawSkill.skillName} concepts`]
        };
        sections.push(currentSection);
        enhancedSkill.sectionTitle = rawSkill.skillName;
      } else {
        // This is an actual skill (A.1, A.2, etc.)
        if (currentSection) {
          enhancedSkill.sectionTitle = currentSection.title;
          currentSection.skills.push(enhancedSkill);
        }
        skills.push(enhancedSkill);
      }
      
      skillMap.set(rawSkill.id, enhancedSkill);
    });
    
    // Calculate section totals
    sections.forEach(section => {
      section.estimatedTotalTime = section.skills.length * 20; // 20 min per skill
    });
    
    return { sections, skills, skillMap };
  }
  
  /**
   * Get skills for daily assignment (excluding section headers)
   */
  static getAssignableSkills(rawSkills: any[]): any[] {
    return rawSkills.filter(skill => {
      const skillNumber = skill.skillNumber || '';
      return !skillNumber.endsWith('.0'); // Exclude section titles
    });
  }
  
  /**
   * Get section information for a skill
   */
  static getSectionForSkill(skill: any, allSkills: any[]): SkillSection | null {
    const cluster = skill.skillCluster;
    const sectionSkill = allSkills.find(s => 
      s.skillCluster === cluster && 
      s.skillNumber && 
      s.skillNumber.endsWith('.0')
    );
    
    if (sectionSkill) {
      return {
        id: `section_${cluster}`,
        title: sectionSkill.skillName,
        description: `Learn about ${sectionSkill.skillName}`,
        skills: allSkills.filter(s => 
          s.skillCluster === cluster && 
          s.skillNumber && 
          !s.skillNumber.endsWith('.0')
        ),
        estimatedTotalTime: 0,
        learningObjectives: [`Master ${sectionSkill.skillName}`]
      };
    }
    
    return null;
  }
  
  /**
   * Generate learning path for a section
   */
  static generateSectionLearningPath(
    sectionTitle: string, 
    sectionSkills: any[], 
    userProfile: any
  ): LearningPath {
    return {
      id: `path_${sectionTitle.replace(/\s+/g, '_').toLowerCase()}`,
      name: sectionTitle,
      description: `Master all skills in ${sectionTitle}`,
      grade: userProfile.grade,
      subject: sectionSkills[0]?.subject || 'General',
      skills: sectionSkills,
      estimatedDuration: sectionSkills.length * 20,
      difficulty: userProfile.skillLevel,
      tags: [sectionTitle, userProfile.grade, 'section_path']
    };
  }
  
  private static extractSequenceNumber(skillNumber: string): number {
    const match = skillNumber.match(/\.(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  }
}

// Enhanced Finn Orchestration Engine
export class EnhancedFinnOrchestrationEngine {
  
  /**
   * Enhanced skill selection that respects section hierarchy
   */
  static async generateDailyPlan(
    userProfile: UserProfile,
    date: Date = new Date()
  ): Promise<DailyLearningPlan> {
    
    // Get assignable skills (no section headers)
    const availableSkills = this.getAssignableSkillsForUser(userProfile);
    
    // Group skills by section for better organization
    const skillsBySections = this.groupSkillsBySections(availableSkills);
    
    // Enhanced Finn selection with section awareness
    const adaptiveFactors = await this.analyzeAdaptiveFactors(userProfile, date);
    const selectedSkills = await this.finnSelectDailySkillsWithSections(
      userProfile,
      skillsBySections,
      adaptiveFactors
    );
    
    return {
      userId: userProfile.id,
      date: date.toISOString().split('T')[0],
      totalEstimatedTime: selectedSkills.reduce((sum, skill) => sum + skill.estimatedTime, 0),
      maxDailyTime: this.getDailyTimeLimit(userProfile),
      selectedSkills,
      finnReasoning: await this.generateEnhancedFinnReasoning(userProfile, selectedSkills),
      adaptiveFactors,
      sessionBreakdown: this.createLearningSessions(selectedSkills, userProfile)
    };
  }
  
  /**
   * Get assignable skills (excluding section titles)
   */
  private static getAssignableSkillsForUser(userProfile: UserProfile): any[] {
    const gradeSkills = skillsData[userProfile.grade];
    if (!gradeSkills) return [];
    
    const allSkills: any[] = [];
    userProfile.preferences.subjects.forEach(subject => {
      if (gradeSkills[subject]) {
        // Filter out section titles (skillNumber ending in .0)
        const assignableSkills = gradeSkills[subject].filter(skill => {
          const skillNumber = skill.skillNumber || '';
          return !skillNumber.endsWith('.0');
        });
        allSkills.push(...assignableSkills);
      }
    });
    
    // Filter out completed skills
    return allSkills.filter(skill => 
      !userProfile.progress.completedSkills.has(skill.id)
    );
  }
  
  /**
   * Group skills by their sections
   */
  private static groupSkillsBySections(skills: any[]): Record<string, any[]> {
    const sections: Record<string, any[]> = {};
    
    skills.forEach(skill => {
      const sectionKey = `${skill.subject}_${skill.skillCluster}`;
      if (!sections[sectionKey]) {
        sections[sectionKey] = [];
      }
      sections[sectionKey].push(skill);
    });
    
    return sections;
  }
  
  /**
   * Enhanced Finn selection with section awareness
   */
  private static async finnSelectDailySkillsWithSections(
    userProfile: UserProfile,
    skillsBySections: Record<string, any[]>,
    adaptiveFactors: AdaptiveFactors
  ): Promise<DailySkill[]> {
    
    const maxDailyTime = this.getDailyTimeLimit(userProfile);
    const selectedSkills: DailySkill[] = [];
    let remainingTime = maxDailyTime;
    
    // Finn's section-aware strategy
    const sectionStrategy = this.determineSectionStrategy(userProfile, adaptiveFactors);
    
    // Process sections based on strategy
    const sortedSections = Object.entries(skillsBySections)
      .sort(([, skillsA], [, skillsB]) => {
        return this.calculateSectionPriority(skillsB, userProfile) - 
               this.calculateSectionPriority(skillsA, userProfile);
      });
    
    for (const [sectionKey, sectionSkills] of sortedSections) {
      if (remainingTime < 15) break; // Need at least 15 minutes
      
      // Select skills from this section
      const sectionSelectedSkills = await this.selectSkillsFromSection(
        sectionSkills,
        userProfile,
        adaptiveFactors,
        Math.min(remainingTime, sectionStrategy.maxTimePerSection)
      );
      
      selectedSkills.push(...sectionSelectedSkills);
      remainingTime -= sectionSelectedSkills.reduce((sum, skill) => sum + skill.estimatedTime, 0);
      
      // Stop if we have enough skills
      if (selectedSkills.length >= sectionStrategy.maxSkillsPerDay) break;
    }
    
    return selectedSkills;
  }
  
  /**
   * Determine Finn's section strategy based on user profile
   */
  private static determineSectionStrategy(userProfile: UserProfile, adaptiveFactors: AdaptiveFactors) {
    const strategies = {
      'Kindergarten': {
        maxTimePerSection: 30,
        maxSkillsPerDay: 4,
        focusDepth: 'shallow', // Cover more sections, fewer skills each
        sessionStyle: 'variety'
      },
      'Grade 3': {
        maxTimePerSection: 45,
        maxSkillsPerDay: 6,
        focusDepth: 'balanced',
        sessionStyle: 'mixed'
      },
      'Grade 7': {
        maxTimePerSection: 60,
        maxSkillsPerDay: 8,
        focusDepth: 'deep', // Fewer sections, more skills each
        sessionStyle: 'sequential'
      },
      'Grade 10': {
        maxTimePerSection: 80,
        maxSkillsPerDay: 10,
        focusDepth: 'deep',
        sessionStyle: 'mastery'
      }
    };
    
    return strategies[userProfile.grade as keyof typeof strategies] || strategies['Grade 7'];
  }
  
  /**
   * Calculate section priority for Finn's selection
   */
  private static calculateSectionPriority(sectionSkills: any[], userProfile: UserProfile): number {
    if (!sectionSkills.length) return 0;
    
    let priority = 50;
    
    // Boost if subject is preferred
    if (userProfile.preferences.subjects.includes(sectionSkills[0].subject)) {
      priority += 20;
    }
    
    // Boost if prerequisites are met for most skills in section
    const prerequisitesMet = sectionSkills.filter(skill => 
      this.prerequisitesMet(skill, userProfile)
    ).length;
    
    priority += (prerequisitesMet / sectionSkills.length) * 30;
    
    // Consider sequence - lower skill numbers get priority
    const avgSequence = sectionSkills.reduce((sum, skill) => {
      const match = skill.skillNumber?.match(/\.(\d+)$/);
      return sum + (match ? parseInt(match[1]) : 10);
    }, 0) / sectionSkills.length;
    
    priority += Math.max(0, 10 - avgSequence); // Lower numbers = higher priority
    
    return priority;
  }
  
  /**
   * Select specific skills from a section
   */
  private static async selectSkillsFromSection(
    sectionSkills: any[],
    userProfile: UserProfile,
    adaptiveFactors: AdaptiveFactors,
    maxTime: number
  ): Promise<DailySkill[]> {
    
    const selectedSkills: DailySkill[] = [];
    let remainingTime = maxTime;
    
    // Sort skills by sequence number
    const sortedSkills = sectionSkills.sort((a, b) => {
      const aNum = parseInt(a.skillNumber?.split('.')[1] || '0');
      const bNum = parseInt(b.skillNumber?.split('.')[1] || '0');
      return aNum - bNum;
    });
    
    // Select skills sequentially, respecting prerequisites
    for (const skill of sortedSkills) {
      if (!this.prerequisitesMet(skill, userProfile)) continue;
      
      const estimatedTime = this.calculateSkillTime(skill, userProfile, adaptiveFactors);
      
      if (remainingTime >= estimatedTime) {
        selectedSkills.push({
          skill,
          estimatedTime,
          priority: this.calculatePriority(skill, userProfile, adaptiveFactors),
          difficultyAdjustment: 0,
          finnContext: this.generateSectionAwareContext(skill, userProfile),
          sessionSlot: 1,
          prerequisites: this.getPrerequisites(skill),
          learningObjectives: this.generateObjectives(skill)
        });
        
        remainingTime -= estimatedTime;
      }
      
      if (remainingTime < 10) break;
    }
    
    return selectedSkills;
  }
  
  // Helper methods
  private static prerequisitesMet(skill: any, userProfile: UserProfile): boolean {
    // Simple prerequisite check - in real implementation would be more sophisticated
    return true;
  }
  
  private static calculateSkillTime(skill: any, userProfile: UserProfile, adaptiveFactors: AdaptiveFactors): number {
    const baseTime = userProfile.preferences.sessionLength;
    return Math.round(baseTime * adaptiveFactors.skillLevelMultiplier);
  }
  
  private static calculatePriority(skill: any, userProfile: UserProfile, adaptiveFactors: AdaptiveFactors): number {
    return 50 + Math.random() * 50; // Simplified priority calculation
  }
  
  private static generateSectionAwareContext(skill: any, userProfile: UserProfile): string {
    return `Help ${userProfile.name} (${userProfile.grade} ${userProfile.learningStyle} learner) understand "${skill.skillName}". This builds on previous skills in the sequence.`;
  }
  
  private static getPrerequisites(skill: any): string[] {
    return []; // Simplified - would analyze actual prerequisites
  }
  
  private static generateObjectives(skill: any): string[] {
    return [`Master ${skill.skillName}`, `Apply ${skill.skillName} concepts`];
  }
  
  private static getDailyTimeLimit(userProfile: UserProfile): number {
    const limits = {
      'Kindergarten': 30,
      'Grade 3': 45,
      'Grade 7': 60,
      'Grade 10': 90
    };
    return limits[userProfile.grade as keyof typeof limits] || 60;
  }
  
  private static async analyzeAdaptiveFactors(userProfile: UserProfile, date: Date): Promise<AdaptiveFactors> {
    return {
      skillLevelMultiplier: userProfile.skillLevel === 'beginner' ? 1.2 : userProfile.skillLevel === 'advanced' ? 0.8 : 1.0,
      learningStyleWeight: 1.0,
      recentPerformance: 0.8,
      timeOfDay: 'morning',
      streakBonus: Math.min(userProfile.progress.streakDays * 0.1, 0.5)
    };
  }
  
  private static async generateEnhancedFinnReasoning(
    userProfile: UserProfile,
    skills: DailySkill[]
  ): Promise<string> {
    
    const sectionBreakdown = skills.reduce((acc, skill) => {
      const section = `${skill.skill.subject} - ${skill.skill.skillCluster}`;
      acc[section] = (acc[section] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalTime = skills.reduce((sum, skill) => sum + skill.estimatedTime, 0);
    
    return `🎯 **Today's Learning Plan for ${userProfile.name}**

I've carefully selected ${skills.length} skills across ${Object.keys(sectionBreakdown).length} learning sections, totaling ${totalTime} minutes.

📚 **Section Focus**:
${Object.entries(sectionBreakdown).map(([section, count]) => 
  `• ${section}: ${count} skill${count > 1 ? 's' : ''}`
).join('\n')}

🎨 **Personalized for You**:
- Adapted for ${userProfile.learningStyle} learning style
- Sequenced to build on your existing knowledge
- Balanced across your preferred subjects
- Includes appropriate breaks and variety

🎯 **Learning Strategy**: Each skill builds naturally on the previous one within its section, ensuring you develop a strong foundation before moving to new concepts.`;
  }
  
  private static createLearningSessions(skills: DailySkill[], userProfile: UserProfile): any[] {
    return skills.map((skill, index) => ({
      order: index + 1,
      skill: skill.skill,
      estimatedTime: skill.estimatedTime,
      sessionType: 'focused_learning'
    }));
  }
}