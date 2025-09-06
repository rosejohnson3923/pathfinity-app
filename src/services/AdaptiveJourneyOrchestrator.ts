/**
 * AdaptiveJourneyOrchestrator - Real-time learning journey management
 * 
 * This orchestrator manages continuous learning journeys by:
 * - Coordinating skill progression across subjects
 * - Managing career narrative consistency
 * - Handling real-time adaptation based on performance
 * - Eliminating daily assignment boundaries
 */

import { skillClusterService, SkillCluster, Skill, ClusterProgress } from './SkillClusterService';
import { careerProgressionSystem } from '../rules-engine/career/CareerProgressionSystem';

export interface LearningJourney {
  journeyId: string;
  studentId: string;
  gradeLevel: string;
  startDate: string;
  currentDate: string;
  careerContext: {
    currentCareer: string;
    currentLevel: string;        // Explorer, Apprentice, Practitioner
    narrativeTheme: string;      // Current story context
    recentAchievements: string[];
  };
  activeSkillClusters: {
    [subject: string]: {
      clusterId: string;
      cluster: SkillCluster;
      progress: ClusterProgress;
      nextClusterReady: boolean;
    };
  };
  continuousProgress: {
    totalSkillsAttempted: number;
    totalSkillsMastered: number;
    currentStreak: number;
    longestStreak: number;
    adaptiveScore: number;       // 0-100, determines difficulty adjustment
  };
  diagnosticHistory: DiagnosticResult[];
  recommendedNextSteps: NextStep[];
}

export interface DiagnosticResult {
  timestamp: string;
  subject: string;
  clusterId: string;
  skills: { skillId: string; correct: boolean; timeSpent: number }[];
  overallScore: number;
  recommendedAction: 'advance' | 'practice' | 'review';
}

export interface NextStep {
  type: 'skill' | 'cluster' | 'assessment' | 'project';
  subject: string;
  targetId: string;
  priority: 'immediate' | 'recommended' | 'optional';
  estimatedTime: number;
  careerConnection: string;
}

export interface JourneyUpdate {
  skillId: string;
  subject: string;
  result: 'mastered' | 'practiced' | 'struggled';
  timeSpent: number;
  hintsUsed: number;
}

export class AdaptiveJourneyOrchestrator {
  private static instance: AdaptiveJourneyOrchestrator;
  private activeJourneys: Map<string, LearningJourney> = new Map();
  
  private constructor() {
  }
  
  public static getInstance(): AdaptiveJourneyOrchestrator {
    if (!AdaptiveJourneyOrchestrator.instance) {
      AdaptiveJourneyOrchestrator.instance = new AdaptiveJourneyOrchestrator();
    }
    return AdaptiveJourneyOrchestrator.instance;
  }
  
  /**
   * Initialize a new continuous learning journey
   */
  public async initializeJourney(
    studentId: string,
    gradeLevel: string,
    careerPreference?: string
  ): Promise<LearningJourney> {
    const journeyId = `journey-${studentId}-${Date.now()}`;
    
    // Get career context from CareerProgressionSystem
    const careerContext = await this.initializeCareerContext(gradeLevel, careerPreference);
    
    // Initialize with diagnostic clusters for core subjects
    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
    const activeSkillClusters: LearningJourney['activeSkillClusters'] = {};
    
    for (const subject of subjects) {
      const diagnosticCluster = skillClusterService.getDiagnosticCluster(gradeLevel, subject);
      if (diagnosticCluster) {
        activeSkillClusters[subject] = {
          clusterId: diagnosticCluster.categoryId,
          cluster: diagnosticCluster,
          progress: {
            clusterId: diagnosticCluster.categoryId,
            skillsAttempted: [],
            skillsMastered: [],
            currentSkillIndex: 0,
            recommendedPath: diagnosticCluster.skills.map(s => s.id)
          },
          nextClusterReady: false
        };
      }
    }
    
    const journey: LearningJourney = {
      journeyId,
      studentId,
      gradeLevel,
      startDate: new Date().toISOString(),
      currentDate: new Date().toISOString(),
      careerContext,
      activeSkillClusters,
      continuousProgress: {
        totalSkillsAttempted: 0,
        totalSkillsMastered: 0,
        currentStreak: 0,
        longestStreak: 0,
        adaptiveScore: 50 // Start at medium difficulty
      },
      diagnosticHistory: [],
      recommendedNextSteps: this.generateInitialSteps(activeSkillClusters, careerContext)
    };
    
    this.activeJourneys.set(studentId, journey);
    return journey;
  }
  
  /**
   * Process a diagnostic assessment and adapt the journey
   */
  public async processDiagnostic(
    studentId: string,
    subject: string,
    results: { skillId: string; correct: boolean; timeSpent: number }[]
  ): Promise<void> {
    const journey = this.activeJourneys.get(studentId);
    if (!journey) return;
    
    // Calculate overall score
    const correctCount = results.filter(r => r.correct).length;
    const overallScore = (correctCount / results.length) * 100;
    
    // Determine recommended action
    let recommendedAction: DiagnosticResult['recommendedAction'];
    if (overallScore >= 80) {
      recommendedAction = 'advance';
    } else if (overallScore >= 60) {
      recommendedAction = 'practice';
    } else {
      recommendedAction = 'review';
    }
    
    // Store diagnostic result
    const diagnosticResult: DiagnosticResult = {
      timestamp: new Date().toISOString(),
      subject,
      clusterId: journey.activeSkillClusters[subject]?.clusterId || 'unknown',
      skills: results,
      overallScore,
      recommendedAction
    };
    
    journey.diagnosticHistory.push(diagnosticResult);
    
    // Build adaptive path based on results
    const adaptivePath = skillClusterService.buildAdaptivePath(
      journey.gradeLevel,
      subject,
      results
    );
    
    // Update the cluster progress with new path
    if (journey.activeSkillClusters[subject]) {
      journey.activeSkillClusters[subject].progress.recommendedPath = adaptivePath;
      journey.activeSkillClusters[subject].progress.diagnosticScore = overallScore;
    }
    
    // Adjust adaptive score based on performance
    this.adjustAdaptiveScore(journey, overallScore);
    
    // Generate new recommendations
    journey.recommendedNextSteps = this.generateAdaptiveSteps(
      journey,
      diagnosticResult
    );
  }
  
  /**
   * Update journey based on skill completion
   */
  public async updateJourney(
    studentId: string,
    update: JourneyUpdate
  ): Promise<LearningJourney | null> {
    const journey = this.activeJourneys.get(studentId);
    if (!journey) return null;
    
    const subjectCluster = journey.activeSkillClusters[update.subject];
    if (!subjectCluster) return null;
    
    // Update progress tracking
    journey.continuousProgress.totalSkillsAttempted++;
    
    if (update.result === 'mastered') {
      journey.continuousProgress.totalSkillsMastered++;
      journey.continuousProgress.currentStreak++;
      
      if (journey.continuousProgress.currentStreak > journey.continuousProgress.longestStreak) {
        journey.continuousProgress.longestStreak = journey.continuousProgress.currentStreak;
      }
      
      // Add to mastered skills
      if (!subjectCluster.progress.skillsMastered.includes(update.skillId)) {
        subjectCluster.progress.skillsMastered.push(update.skillId);
      }
      
      // Check if ready for next cluster
      if (subjectCluster.progress.skillsMastered.length >= subjectCluster.cluster.masteryThreshold) {
        subjectCluster.nextClusterReady = true;
        
        // Attempt to advance to next cluster
        const nextClusterPrefix = skillClusterService.getNextCluster(
          journey.gradeLevel,
          update.subject,
          subjectCluster.clusterId.split('.')[0],
          subjectCluster.progress
        );
        
        if (nextClusterPrefix) {
          await this.advanceToNextCluster(journey, update.subject, nextClusterPrefix);
        }
      }
    } else if (update.result === 'struggled') {
      journey.continuousProgress.currentStreak = 0;
      
      // Adjust difficulty down
      journey.continuousProgress.adaptiveScore = Math.max(
        0,
        journey.continuousProgress.adaptiveScore - 5
      );
    }
    
    // Add to attempted skills
    if (!subjectCluster.progress.skillsAttempted.includes(update.skillId)) {
      subjectCluster.progress.skillsAttempted.push(update.skillId);
    }
    
    // Update current skill index
    const currentIndex = subjectCluster.progress.recommendedPath.indexOf(update.skillId);
    if (currentIndex !== -1 && currentIndex + 1 < subjectCluster.progress.recommendedPath.length) {
      subjectCluster.progress.currentSkillIndex = currentIndex + 1;
    }
    
    // Update career narrative if significant progress
    if (journey.continuousProgress.totalSkillsMastered % 5 === 0) {
      await this.updateCareerNarrative(journey);
    }
    
    // Generate new recommendations
    journey.recommendedNextSteps = this.generateContinuousSteps(journey);
    
    journey.currentDate = new Date().toISOString();
    
    return journey;
  }
  
  /**
   * Get current skill for a subject without progressing
   * This is for containers that need to display current skill
   */
  public getCurrentSkillForSubject(
    studentId: string,
    subject: string,
    gradeLevel?: string
  ): Skill | null {
    let journey = this.activeJourneys.get(studentId);
    
    if (!journey && gradeLevel) {
      console.log(`Creating new journey for student ${studentId}, grade ${gradeLevel}`);
      // Create a minimal journey synchronously for immediate use
      journey = this.createMinimalJourney(studentId, gradeLevel);
      this.activeJourneys.set(studentId, journey);
    }
    
    if (!journey) {
      console.warn(`No journey found for student ${studentId}`);
      return null;
    }
    
    console.log(`Journey clusters available:`, Object.keys(journey.activeSkillClusters));
    
    // Check if we have active skill cluster for this subject
    let cluster = journey.activeSkillClusters[subject];
    
    console.log(`Cluster for ${subject}:`, {
      exists: !!cluster,
      hasCluster: !!cluster?.cluster,
      hasSkills: !!cluster?.cluster?.skills,
      skillCount: cluster?.cluster?.skills?.length
    });
    
    if (!cluster) {
      // Initialize subject with diagnostic cluster
      const diagnosticCluster = skillClusterService.getDiagnosticCluster(
        journey.gradeLevel,
        subject
      );
      
      if (!diagnosticCluster) {
        // Handle Grade 10 case where subject might not exist
        console.warn(`No ${subject} curriculum for ${journey.gradeLevel}`);
        return null;
      }
      
      // Create new cluster progress
      const clusterProgress: ClusterProgress = {
        clusterId: diagnosticCluster.categoryId,
        skillsAttempted: [],
        skillsMastered: [],
        currentSkillIndex: 0,
        recommendedPath: diagnosticCluster.skills.map(s => s.id)
      };
      
      journey.activeSkillClusters[subject] = {
        cluster: diagnosticCluster,
        progress: clusterProgress,
        lastAccessTime: Date.now()
      };
      
      cluster = journey.activeSkillClusters[subject];
    }
    
    // Return current skill directly from the cluster
    if (!cluster.cluster || !cluster.cluster.skills || cluster.cluster.skills.length === 0) {
      console.warn(`No skills in cluster for ${subject}`);
      return null;
    }
    
    const currentIndex = cluster.progress.currentSkillIndex || 0;
    const currentSkill = cluster.cluster.skills[currentIndex];
    
    if (!currentSkill) {
      console.warn(`No skill at index ${currentIndex} for ${subject}, cluster has ${cluster.cluster.skills.length} skills`);
      
      // Try to load next cluster if we're at the end
      const nextClusterPrefix = skillClusterService.getNextCluster(
        journey.gradeLevel,
        subject,
        cluster.cluster.categoryId.split('.')[0],
        cluster.progress
      );
      
      if (nextClusterPrefix) {
        const nextCluster = skillClusterService.loadCluster(
          journey.gradeLevel,
          subject,
          nextClusterPrefix
        );
        
        if (nextCluster && nextCluster.skills.length > 0) {
          // Update to next cluster
          cluster.cluster = nextCluster;
          cluster.progress = {
            clusterId: nextCluster.categoryId,
            skillsAttempted: [],
            skillsMastered: [],
            currentSkillIndex: 0,
            recommendedPath: nextCluster.skills.map(s => s.id)
          };
          
          return nextCluster.skills[0];
        }
      }
      
      return null;
    }
    
    console.log(`Returning skill for ${subject}:`, currentSkill.skillName);
    return currentSkill;
  }
  
  /**
   * Get the next recommended skill for continuous learning
   */
  public getNextSkill(
    studentId: string,
    preferredSubject?: string
  ): Skill | null {
    const journey = this.activeJourneys.get(studentId);
    if (!journey) return null;
    
    // If preferred subject specified, try that first
    if (preferredSubject && journey.activeSkillClusters[preferredSubject]) {
      const cluster = journey.activeSkillClusters[preferredSubject];
      const nextSkillId = cluster.progress.recommendedPath[cluster.progress.currentSkillIndex];
      if (nextSkillId) {
        return skillClusterService.getSkillById(nextSkillId);
      }
    }
    
    // Otherwise, find the highest priority next step
    const immediateStep = journey.recommendedNextSteps.find(
      step => step.priority === 'immediate' && step.type === 'skill'
    );
    
    if (immediateStep) {
      return skillClusterService.getSkillById(immediateStep.targetId);
    }
    
    // Fallback to any available skill
    for (const subject of Object.keys(journey.activeSkillClusters)) {
      const cluster = journey.activeSkillClusters[subject];
      const nextSkillId = cluster.progress.recommendedPath[cluster.progress.currentSkillIndex];
      if (nextSkillId) {
        return skillClusterService.getSkillById(nextSkillId);
      }
    }
    
    return null;
  }
  
  /**
   * Get multi-subject skill set for integrated learning
   */
  public getIntegratedSkillSet(
    studentId: string,
    skillCount: number = 3
  ): Skill[] {
    const journey = this.activeJourneys.get(studentId);
    if (!journey) return [];
    
    const skills: Skill[] = [];
    const subjects = Object.keys(journey.activeSkillClusters);
    
    // Try to get one skill from each subject
    for (const subject of subjects) {
      if (skills.length >= skillCount) break;
      
      const cluster = journey.activeSkillClusters[subject];
      const nextSkillId = cluster.progress.recommendedPath[cluster.progress.currentSkillIndex];
      
      if (nextSkillId) {
        const skill = skillClusterService.getSkillById(nextSkillId);
        if (skill) {
          skills.push(skill);
        }
      }
    }
    
    return skills;
  }
  
  /**
   * Create a minimal journey synchronously (no async career context)
   */
  private createMinimalJourney(
    studentId: string,
    gradeLevel: string
  ): LearningJourney {
    const journeyId = `journey-${studentId}-${Date.now()}`;
    
    // Initialize with diagnostic clusters for core subjects
    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
    const activeSkillClusters: LearningJourney['activeSkillClusters'] = {};
    
    for (const subject of subjects) {
      const diagnosticCluster = skillClusterService.getDiagnosticCluster(gradeLevel, subject);
      if (diagnosticCluster) {
        console.log(`Grade ${gradeLevel} - Creating cluster for ${subject}:`, {
          categoryId: diagnosticCluster.categoryId,
          skillCount: diagnosticCluster.skills.length,
          firstSkill: diagnosticCluster.skills[0]?.skillName
        });
        activeSkillClusters[subject] = {
          clusterId: diagnosticCluster.categoryId,
          cluster: diagnosticCluster,
          progress: {
            clusterId: diagnosticCluster.categoryId,
            skillsAttempted: [],
            skillsMastered: [],
            currentSkillIndex: 0,
            recommendedPath: diagnosticCluster.skills.map(s => s.id)
          },
          nextClusterReady: false
        };
      }
    }
    
    const journey: LearningJourney = {
      journeyId,
      studentId,
      gradeLevel,
      startDate: new Date().toISOString(),
      currentDate: new Date().toISOString(),
      careerContext: {
        currentCareer: 'Explorer',
        currentLevel: 'Explorer',
        narrativeTheme: 'Beginning your learning journey',
        recentAchievements: []
      },
      activeSkillClusters,
      continuousProgress: {
        totalSkillsAttempted: 0,
        totalSkillsMastered: 0,
        currentStreak: 0,
        longestStreak: 0,
        adaptiveScore: 50
      },
      diagnosticHistory: [],
      recommendedNextSteps: []
    };
    
    return journey;
  }
  
  /**
   * Private helper methods
   */
  
  private async initializeCareerContext(
    gradeLevel: string,
    careerPreference?: string
  ): Promise<LearningJourney['careerContext']> {
    // Use CareerProgressionSystem to get appropriate career level
    const careers = careerProgressionSystem.getAllCareers();
    const selectedCareer = careerPreference || careers[0]?.name || 'Explorer';
    
    // Map grade to career level
    const levelMap: { [key: string]: string } = {
      'Kindergarten': 'Explorer',
      'Grade 1': 'Explorer',
      'Grade 3': 'Apprentice',
      'Grade 7': 'Practitioner',
      'Grade 10': 'Specialist'
    };
    
    return {
      currentCareer: selectedCareer,
      currentLevel: levelMap[gradeLevel] || 'Explorer',
      narrativeTheme: `Beginning your journey as a ${selectedCareer}`,
      recentAchievements: []
    };
  }
  
  private async advanceToNextCluster(
    journey: LearningJourney,
    subject: string,
    nextClusterPrefix: string
  ): Promise<void> {
    const nextCluster = skillClusterService.loadCluster(
      journey.gradeLevel,
      subject,
      nextClusterPrefix
    );
    
    if (nextCluster) {
      journey.activeSkillClusters[subject] = {
        clusterId: nextCluster.categoryId,
        cluster: nextCluster,
        progress: {
          clusterId: nextCluster.categoryId,
          skillsAttempted: [],
          skillsMastered: [],
          currentSkillIndex: 0,
          recommendedPath: nextCluster.skills.map(s => s.id)
        },
        nextClusterReady: false
      };
      
      // Add achievement
      journey.careerContext.recentAchievements.push(
        `Mastered ${subject} ${nextClusterPrefix} skills!`
      );
    }
  }
  
  private adjustAdaptiveScore(journey: LearningJourney, performanceScore: number): void {
    const currentScore = journey.continuousProgress.adaptiveScore;
    
    if (performanceScore >= 80) {
      journey.continuousProgress.adaptiveScore = Math.min(100, currentScore + 10);
    } else if (performanceScore >= 60) {
      journey.continuousProgress.adaptiveScore = Math.min(100, currentScore + 5);
    } else if (performanceScore >= 40) {
      journey.continuousProgress.adaptiveScore = Math.max(0, currentScore - 5);
    } else {
      journey.continuousProgress.adaptiveScore = Math.max(0, currentScore - 10);
    }
  }
  
  private async updateCareerNarrative(journey: LearningJourney): Promise<void> {
    const totalMastered = journey.continuousProgress.totalSkillsMastered;
    
    // Progress milestones
    if (totalMastered === 10) {
      journey.careerContext.narrativeTheme = `Growing stronger as a ${journey.careerContext.currentCareer}`;
    } else if (totalMastered === 25) {
      journey.careerContext.narrativeTheme = `Becoming skilled in your ${journey.careerContext.currentCareer} role`;
    } else if (totalMastered === 50) {
      journey.careerContext.narrativeTheme = `Mastering the fundamentals as a ${journey.careerContext.currentCareer}`;
    }
  }
  
  private generateInitialSteps(
    clusters: LearningJourney['activeSkillClusters'],
    careerContext: LearningJourney['careerContext']
  ): NextStep[] {
    const steps: NextStep[] = [];
    
    // Add diagnostic assessments first
    for (const subject of Object.keys(clusters)) {
      steps.push({
        type: 'assessment',
        subject,
        targetId: `diagnostic-${subject}`,
        priority: 'immediate',
        estimatedTime: 15,
        careerConnection: `Discover your ${subject} skills as a ${careerContext.currentCareer}`
      });
    }
    
    return steps;
  }
  
  private generateAdaptiveSteps(
    journey: LearningJourney,
    diagnosticResult: DiagnosticResult
  ): NextStep[] {
    const steps: NextStep[] = [];
    const subject = diagnosticResult.subject;
    const cluster = journey.activeSkillClusters[subject];
    
    if (!cluster) return steps;
    
    // Based on diagnostic results, prioritize skills
    if (diagnosticResult.recommendedAction === 'review') {
      // Focus on foundational skills
      const firstSkills = cluster.progress.recommendedPath.slice(0, 3);
      firstSkills.forEach((skillId, index) => {
        steps.push({
          type: 'skill',
          subject,
          targetId: skillId,
          priority: index === 0 ? 'immediate' : 'recommended',
          estimatedTime: 10,
          careerConnection: `Build foundation as a ${journey.careerContext.currentCareer}`
        });
      });
    } else if (diagnosticResult.recommendedAction === 'practice') {
      // Mix of review and new skills
      const skills = cluster.progress.recommendedPath.slice(0, 5);
      skills.forEach((skillId, index) => {
        steps.push({
          type: 'skill',
          subject,
          targetId: skillId,
          priority: index < 2 ? 'immediate' : 'recommended',
          estimatedTime: 10,
          careerConnection: `Practice ${subject} as a ${journey.careerContext.currentCareer}`
        });
      });
    } else {
      // Ready to advance quickly
      const skills = cluster.progress.recommendedPath.slice(0, 2);
      skills.forEach(skillId => {
        steps.push({
          type: 'skill',
          subject,
          targetId: skillId,
          priority: 'optional',
          estimatedTime: 8,
          careerConnection: `Excel in ${subject} as a ${journey.careerContext.currentCareer}`
        });
      });
      
      // Add challenge/project
      steps.push({
        type: 'project',
        subject,
        targetId: `project-${subject}-${cluster.clusterId}`,
        priority: 'recommended',
        estimatedTime: 20,
        careerConnection: `Apply your ${subject} skills in a real ${journey.careerContext.currentCareer} scenario`
      });
    }
    
    return steps;
  }
  
  private generateContinuousSteps(journey: LearningJourney): NextStep[] {
    const steps: NextStep[] = [];
    
    // Find subjects needing attention
    const subjectsNeedingWork: { subject: string; progress: number }[] = [];
    
    for (const [subject, cluster] of Object.entries(journey.activeSkillClusters)) {
      const masteryRate = cluster.progress.skillsMastered.length / 
        Math.max(1, cluster.progress.skillsAttempted.length);
      
      subjectsNeedingWork.push({ subject, progress: masteryRate });
    }
    
    // Sort by lowest progress first
    subjectsNeedingWork.sort((a, b) => a.progress - b.progress);
    
    // Add immediate steps for struggling subjects
    if (subjectsNeedingWork[0].progress < 0.6) {
      const subject = subjectsNeedingWork[0].subject;
      const cluster = journey.activeSkillClusters[subject];
      const nextSkillId = cluster.progress.recommendedPath[cluster.progress.currentSkillIndex];
      
      if (nextSkillId) {
        steps.push({
          type: 'skill',
          subject,
          targetId: nextSkillId,
          priority: 'immediate',
          estimatedTime: 12,
          careerConnection: `Strengthen your ${subject} skills as a ${journey.careerContext.currentCareer}`
        });
      }
    }
    
    // Add recommended steps for balanced learning
    for (let i = 0; i < Math.min(3, subjectsNeedingWork.length); i++) {
      const subject = subjectsNeedingWork[i].subject;
      const cluster = journey.activeSkillClusters[subject];
      const skillIndex = cluster.progress.currentSkillIndex + (i === 0 ? 0 : 1);
      const nextSkillId = cluster.progress.recommendedPath[skillIndex];
      
      if (nextSkillId && !steps.some(s => s.targetId === nextSkillId)) {
        steps.push({
          type: 'skill',
          subject,
          targetId: nextSkillId,
          priority: i === 0 ? 'immediate' : 'recommended',
          estimatedTime: 10,
          careerConnection: `Continue your ${subject} journey as a ${journey.careerContext.currentCareer}`
        });
      }
    }
    
    // Add project opportunity if doing well
    if (journey.continuousProgress.currentStreak >= 5) {
      steps.push({
        type: 'project',
        subject: 'Multi-Subject',
        targetId: `integrated-project-${Date.now()}`,
        priority: 'optional',
        estimatedTime: 30,
        careerConnection: `Complete a real-world ${journey.careerContext.currentCareer} challenge!`
      });
    }
    
    return steps;
  }
  
  /**
   * Get active journey for a student
   */
  public getJourney(studentId: string): LearningJourney | null {
    return this.activeJourneys.get(studentId) || null;
  }
  
  /**
   * Clear journey (for testing/reset)
   */
  public clearJourney(studentId: string): void {
    this.activeJourneys.delete(studentId);
  }
}

// Export singleton instance
export const adaptiveJourneyOrchestrator = AdaptiveJourneyOrchestrator.getInstance();