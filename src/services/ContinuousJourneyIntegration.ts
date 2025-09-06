/**
 * ContinuousJourneyIntegration - Bridge between adaptive journey and existing systems
 * 
 * This service integrates the new continuous learning journey with:
 * - Existing container components (Learn, Experience, Discover)
 * - Career progression system
 * - Content generation services
 * - Student dashboard
 */

import { adaptiveJourneyOrchestrator, LearningJourney, JourneyUpdate } from './AdaptiveJourneyOrchestrator';
import { skillClusterService, Skill } from './SkillClusterService';
import { CareerProgressionSystem } from '../rules-engine/career/CareerProgressionSystem';
import { aiLearningJourneyService, AILearningJourneyService } from './AILearningJourneyService';
import { MultiSubjectAssignment } from '../types/LearningTypes';

export interface ContinuousAssignment {
  id: string;
  type: 'continuous';
  title: string;
  description: string;
  gradeLevel: string;
  careerContext: string;
  careerLevel: string;          // Explorer, Apprentice, etc.
  skills: Skill[];
  journeyPhase: 'diagnostic' | 'learning' | 'mastery' | 'project';
  adaptiveScore: number;
  estimatedDuration: string;
  narrativeContext: string;
}

export interface ContainerContent {
  containerId: string;
  containerType: 'learn' | 'experience' | 'discover';
  assignment: ContinuousAssignment;
  skill: Skill;
  careerNarrative: string;
  difficultyLevel: number;
  supportLevel: 'high' | 'medium' | 'low';
}

export class ContinuousJourneyIntegration {
  private static instance: ContinuousJourneyIntegration;
  private careerSystem: CareerProgressionSystem;
  private aiJourneyService: AILearningJourneyService;
  
  private constructor() {
    this.careerSystem = new CareerProgressionSystem();
    this.aiJourneyService = aiLearningJourneyService;
  }
  
  public static getInstance(): ContinuousJourneyIntegration {
    if (!ContinuousJourneyIntegration.instance) {
      ContinuousJourneyIntegration.instance = new ContinuousJourneyIntegration();
    }
    return ContinuousJourneyIntegration.instance;
  }
  
  /**
   * Initialize or resume a student's continuous journey
   */
  public async initializeStudentJourney(
    studentId: string,
    studentName: string,
    gradeLevel: string,
    careerPreference?: string
  ): Promise<LearningJourney> {
    // Check if journey exists
    let journey = adaptiveJourneyOrchestrator.getJourney(studentId);
    
    if (!journey) {
      // Initialize new journey
      journey = await adaptiveJourneyOrchestrator.initializeJourney(
        studentId,
        gradeLevel,
        careerPreference
      );
      
      console.log(`🚀 Initialized continuous journey for ${studentName}`);
      console.log(`   Career: ${journey.careerContext.currentCareer}`);
      console.log(`   Level: ${journey.careerContext.currentLevel}`);
    } else {
      console.log(`📚 Resuming journey for ${studentName}`);
      console.log(`   Progress: ${journey.continuousProgress.totalSkillsMastered} skills mastered`);
      console.log(`   Current streak: ${journey.continuousProgress.currentStreak}`);
    }
    
    return journey;
  }
  
  /**
   * Get next continuous assignment for student
   */
  public async getNextContinuousAssignment(
    studentId: string,
    preferredSubject?: string
  ): Promise<ContinuousAssignment | null> {
    const journey = adaptiveJourneyOrchestrator.getJourney(studentId);
    if (!journey) return null;
    
    // Determine journey phase
    let journeyPhase: ContinuousAssignment['journeyPhase'] = 'learning';
    
    // Check if diagnostic needed
    const needsDiagnostic = journey.diagnosticHistory.length === 0 || 
      journey.diagnosticHistory.every(d => 
        new Date().getTime() - new Date(d.timestamp).getTime() > 7 * 24 * 60 * 60 * 1000
      );
    
    if (needsDiagnostic) {
      journeyPhase = 'diagnostic';
    } else if (journey.continuousProgress.currentStreak >= 10) {
      journeyPhase = 'mastery';
    } else if (journey.continuousProgress.totalSkillsMastered % 15 === 14) {
      journeyPhase = 'project';
    }
    
    // Get appropriate skills based on phase
    let skills: Skill[] = [];
    let title = '';
    let description = '';
    
    switch (journeyPhase) {
      case 'diagnostic':
        // Get diagnostic skills from multiple subjects
        skills = this.getDiagnosticSkills(journey);
        title = 'Skills Check-In';
        description = `Let's see how much you've learned as a ${journey.careerContext.currentCareer}!`;
        break;
        
      case 'learning':
        // Get next skills in progression
        skills = adaptiveJourneyOrchestrator.getIntegratedSkillSet(studentId, 3);
        title = 'Continue Your Journey';
        description = `Keep building your skills as a ${journey.careerContext.currentLevel} ${journey.careerContext.currentCareer}`;
        break;
        
      case 'mastery':
        // Get challenge skills
        skills = this.getChallengeSkills(journey);
        title = 'Mastery Challenge';
        description = `Show your expertise as a ${journey.careerContext.currentCareer}!`;
        break;
        
      case 'project':
        // Get project-based skills
        skills = this.getProjectSkills(journey);
        title = `${journey.careerContext.currentCareer} Project`;
        description = 'Apply everything you\'ve learned in a real-world scenario!';
        break;
    }
    
    if (skills.length === 0) {
      // Fallback to any available skill
      const nextSkill = adaptiveJourneyOrchestrator.getNextSkill(studentId, preferredSubject);
      if (nextSkill) {
        skills = [nextSkill];
      } else {
        return null;
      }
    }
    
    // Build continuous assignment
    const assignment: ContinuousAssignment = {
      id: `continuous-${studentId}-${Date.now()}`,
      type: 'continuous',
      title,
      description,
      gradeLevel: journey.gradeLevel,
      careerContext: journey.careerContext.currentCareer,
      careerLevel: journey.careerContext.currentLevel,
      skills,
      journeyPhase,
      adaptiveScore: journey.continuousProgress.adaptiveScore,
      estimatedDuration: `${skills.length * 10} min`,
      narrativeContext: journey.careerContext.narrativeTheme
    };
    
    return assignment;
  }
  
  /**
   * Prepare content for a specific container
   */
  public async prepareContainerContent(
    assignment: ContinuousAssignment,
    containerType: 'learn' | 'experience' | 'discover',
    skillIndex: number = 0
  ): Promise<ContainerContent> {
    const skill = assignment.skills[skillIndex] || assignment.skills[0];
    
    // Determine support level based on container type and adaptive score
    let supportLevel: ContainerContent['supportLevel'] = 'medium';
    let difficultyLevel = 2; // Default medium
    
    switch (containerType) {
      case 'learn':
        // High support for learning
        supportLevel = 'high';
        difficultyLevel = Math.max(1, Math.floor(assignment.adaptiveScore / 40));
        break;
        
      case 'experience':
        // Medium support for practice
        supportLevel = 'medium';
        difficultyLevel = Math.max(1, Math.floor(assignment.adaptiveScore / 30));
        break;
        
      case 'discover':
        // Low support for exploration
        supportLevel = 'low';
        difficultyLevel = Math.min(3, Math.floor(assignment.adaptiveScore / 25) + 1);
        break;
    }
    
    // Generate career-specific narrative
    const careerNarrative = this.generateCareerNarrative(
      assignment.careerContext,
      assignment.careerLevel,
      skill,
      containerType
    );
    
    const content: ContainerContent = {
      containerId: `${containerType}-${skill.id}-${Date.now()}`,
      containerType,
      assignment,
      skill,
      careerNarrative,
      difficultyLevel,
      supportLevel
    };
    
    return content;
  }
  
  /**
   * Process skill completion and update journey
   */
  public async processSkillCompletion(
    studentId: string,
    skillId: string,
    subject: string,
    performance: {
      correct: boolean;
      timeSpent: number;
      hintsUsed: number;
      attempts: number;
    }
  ): Promise<void> {
    // Determine result based on performance
    let result: JourneyUpdate['result'];
    
    if (performance.correct && performance.attempts === 1 && performance.hintsUsed === 0) {
      result = 'mastered';
    } else if (performance.correct) {
      result = 'practiced';
    } else {
      result = 'struggled';
    }
    
    // Update journey
    const update: JourneyUpdate = {
      skillId,
      subject,
      result,
      timeSpent: performance.timeSpent,
      hintsUsed: performance.hintsUsed
    };
    
    const updatedJourney = await adaptiveJourneyOrchestrator.updateJourney(studentId, update);
    
    if (updatedJourney) {
      console.log(`📊 Journey updated for student ${studentId}`);
      console.log(`   Skill: ${skillId} - ${result}`);
      console.log(`   Total mastered: ${updatedJourney.continuousProgress.totalSkillsMastered}`);
      console.log(`   Current streak: ${updatedJourney.continuousProgress.currentStreak}`);
      
      // Check for career progression
      if (this.shouldProgressCareer(updatedJourney)) {
        await this.handleCareerProgression(updatedJourney);
      }
    }
  }
  
  /**
   * Convert legacy MultiSubjectAssignment to ContinuousAssignment
   */
  public convertToContinuousAssignment(
    legacy: MultiSubjectAssignment,
    journey: LearningJourney
  ): ContinuousAssignment {
    // Map legacy skills to actual skills from skillsDataComplete
    const actualSkills: Skill[] = [];
    
    for (const legacySkill of legacy.skills) {
      const skill = skillClusterService.getSkillById(
        `${legacySkill.subject}_${journey.gradeLevel}_${legacySkill.skill_number}`
      );
      
      if (skill) {
        actualSkills.push(skill);
      }
    }
    
    return {
      id: `continuous-${legacy.id}-${Date.now()}`,
      type: 'continuous',
      title: legacy.title,
      description: legacy.description,
      gradeLevel: journey.gradeLevel,
      careerContext: legacy.careerContext || journey.careerContext.currentCareer,
      careerLevel: journey.careerContext.currentLevel,
      skills: actualSkills,
      journeyPhase: 'learning',
      adaptiveScore: journey.continuousProgress.adaptiveScore,
      estimatedDuration: legacy.duration,
      narrativeContext: journey.careerContext.narrativeTheme
    };
  }
  
  /**
   * Private helper methods
   */
  
  private getDiagnosticSkills(journey: LearningJourney): Skill[] {
    const skills: Skill[] = [];
    const subjects = ['Math', 'ELA', 'Science'];
    
    for (const subject of subjects) {
      const cluster = journey.activeSkillClusters[subject];
      if (cluster) {
        // Get 2-3 skills from current cluster for diagnostic
        const diagnosticSkills = cluster.cluster.skills.slice(0, 2);
        skills.push(...diagnosticSkills);
      }
    }
    
    return skills;
  }
  
  private getChallengeSkills(journey: LearningJourney): Skill[] {
    const skills: Skill[] = [];
    
    // Get harder skills from current clusters
    for (const [subject, cluster] of Object.entries(journey.activeSkillClusters)) {
      const hardSkills = cluster.cluster.skills.filter(
        s => !cluster.progress.skillsMastered.includes(s.id)
      ).slice(-2); // Get last 2 (typically harder)
      
      skills.push(...hardSkills);
    }
    
    return skills.slice(0, 4); // Limit to 4 skills
  }
  
  private getProjectSkills(journey: LearningJourney): Skill[] {
    // Get a mix of mastered and new skills for project work
    const skills: Skill[] = [];
    
    for (const [subject, cluster] of Object.entries(journey.activeSkillClusters)) {
      // One mastered skill for confidence
      const masteredSkill = cluster.progress.skillsMastered.length > 0 ?
        skillClusterService.getSkillById(cluster.progress.skillsMastered[0]) : null;
      
      // One new skill for growth
      const newSkillId = cluster.progress.recommendedPath.find(
        id => !cluster.progress.skillsAttempted.includes(id)
      );
      const newSkill = newSkillId ? skillClusterService.getSkillById(newSkillId) : null;
      
      if (masteredSkill) skills.push(masteredSkill);
      if (newSkill) skills.push(newSkill);
    }
    
    return skills.slice(0, 5);
  }
  
  private generateCareerNarrative(
    career: string,
    level: string,
    skill: Skill,
    containerType: string
  ): string {
    const narratives = {
      learn: {
        Explorer: `As a young ${career}, let's learn about ${skill.skillName}`,
        Apprentice: `${level} ${career}s need to understand ${skill.skillName}`,
        Practitioner: `Experienced ${career}s master ${skill.skillName}`,
        Specialist: `Expert ${career}s excel at ${skill.skillName}`
      },
      experience: {
        Explorer: `Practice ${skill.skillName} like a real ${career}!`,
        Apprentice: `Apply your ${skill.skillName} skills as a ${career}`,
        Practitioner: `Use ${skill.skillName} in your ${career} work`,
        Specialist: `Perfect your ${skill.skillName} expertise`
      },
      discover: {
        Explorer: `Explore how ${career}s use ${skill.skillName}`,
        Apprentice: `Discover advanced ${skill.skillName} techniques`,
        Practitioner: `Investigate ${skill.skillName} in ${career} scenarios`,
        Specialist: `Research cutting-edge ${skill.skillName} applications`
      }
    };
    
    return narratives[containerType]?.[level] || 
      `Continue your ${career} journey with ${skill.skillName}`;
  }
  
  private shouldProgressCareer(journey: LearningJourney): boolean {
    // Check if ready for career level progression
    const masteryMilestones = {
      'Explorer': 25,      // Explorer → Apprentice
      'Apprentice': 75,     // Apprentice → Practitioner  
      'Practitioner': 150,  // Practitioner → Specialist
      'Specialist': 300     // Specialist → Expert
    };
    
    const currentMilestone = masteryMilestones[journey.careerContext.currentLevel];
    return currentMilestone && 
      journey.continuousProgress.totalSkillsMastered >= currentMilestone;
  }
  
  private async handleCareerProgression(journey: LearningJourney): Promise<void> {
    const progressionMap = {
      'Explorer': 'Apprentice',
      'Apprentice': 'Practitioner',
      'Practitioner': 'Specialist',
      'Specialist': 'Expert'
    };
    
    const nextLevel = progressionMap[journey.careerContext.currentLevel];
    
    if (nextLevel) {
      journey.careerContext.currentLevel = nextLevel;
      journey.careerContext.narrativeTheme = 
        `Congratulations! You've advanced to ${nextLevel} ${journey.careerContext.currentCareer}!`;
      journey.careerContext.recentAchievements.push(
        `Promoted to ${nextLevel} level!`
      );
      
      console.log(`🎉 Career Progression!`);
      console.log(`   Student ${journey.studentId} is now a ${nextLevel} ${journey.careerContext.currentCareer}`);
    }
  }
  
  /**
   * Get journey statistics for dashboard
   */
  public getJourneyStats(studentId: string) {
    const journey = adaptiveJourneyOrchestrator.getJourney(studentId);
    if (!journey) return null;
    
    const subjectProgress: { [key: string]: number } = {};
    
    for (const [subject, cluster] of Object.entries(journey.activeSkillClusters)) {
      const mastered = cluster.progress.skillsMastered.length;
      const total = cluster.cluster.totalSkills;
      subjectProgress[subject] = (mastered / total) * 100;
    }
    
    return {
      totalSkillsMastered: journey.continuousProgress.totalSkillsMastered,
      totalSkillsAttempted: journey.continuousProgress.totalSkillsAttempted,
      currentStreak: journey.continuousProgress.currentStreak,
      longestStreak: journey.continuousProgress.longestStreak,
      adaptiveScore: journey.continuousProgress.adaptiveScore,
      careerLevel: journey.careerContext.currentLevel,
      currentCareer: journey.careerContext.currentCareer,
      subjectProgress,
      recentAchievements: journey.careerContext.recentAchievements.slice(-5),
      nextSteps: journey.recommendedNextSteps.slice(0, 3)
    };
  }
}

// Export singleton instance
export const continuousJourneyIntegration = ContinuousJourneyIntegration.getInstance();