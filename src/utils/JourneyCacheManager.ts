// ================================================================
// JOURNEY CACHE MANAGER
// Comprehensive upfront caching for all Master Containers
// ================================================================

import { ContainerContentGenerator, LearnContent, ExperienceContent, DiscoverContent } from './ContainerContentGenerators';
import { MultiSubjectAssignment, Skill } from '../types/LearningTypes';
import { DEMO_USER_CACHE } from '../data/demoCache/demoUserCache';

interface SubjectCard {
  subject: string;
  assignments: AssignmentCard[];
}

interface AssignmentCard {
  id: string;
  title: string;
  skill: Skill;
  steps: {
    instruction: any;
    practice: any;
    assessment: any;
  };
}

interface MasterContainerData {
  containerType: 'learn' | 'experience' | 'discover';
  subjectCards: SubjectCard[];
  skillGroups?: { [subject: string]: { skill_number: string; skill_name: string } }; // A.0 skill group data
  metadata: {
    studentName: string;
    gradeLevel: string;
    totalAssignments: number;
    estimatedDuration: string;
  };
}

interface ComprehensiveJourneyCache {
  studentName: string;
  gradeLevel: string;
  assignment: MultiSubjectAssignment;
  learnMasterContainer: MasterContainerData;
  experienceMasterContainer: MasterContainerData;
  discoverMasterContainer: MasterContainerData;
  cacheTimestamp: Date;
  isFullyCached: boolean;
}

export class JourneyCacheManager {
  private contentGenerator: ContainerContentGenerator;
  private journeyCache: Map<string, ComprehensiveJourneyCache> = new Map();
  
  constructor(contentGenerator: ContainerContentGenerator) {
    this.contentGenerator = contentGenerator;
  }

  // ================================================================
  // TWO-PHASE CACHING SYSTEM
  // ================================================================

  async cacheLearnPhase(
    assignment: MultiSubjectAssignment,
    studentName: string,
    gradeLevel: string,
    onProgress?: (step: string, progress: number) => void,
    forceProductionServices: boolean = false
  ): Promise<MasterContainerData> {
    console.log(`📚 Starting Learn phase cache for ${studentName}...`);
    const startTime = Date.now();

    try {
      // Check if this is a demo user AND not forcing production services
      const useProductionServices = forceProductionServices || 
        import.meta.env.VITE_USE_PRODUCTION_SERVICES === 'true';
      
      if (this.isDemoUser(studentName) && !useProductionServices) {
        console.log(`🎯 Demo user detected: ${studentName}, using pre-generated cache`);
        onProgress?.('Loading demo content...', 50);
        
        const learnMasterContainer = this.transformDemoLearnCache(studentName);
        
        onProgress?.('Demo content ready!', 100);
        const duration = Date.now() - startTime;
        console.log(`✅ Demo Learn cache loaded in ${duration}ms for ${studentName}`);
        
        return learnMasterContainer;
      }

      // Regular user - generate content dynamically
      onProgress?.('Caching Learn content...', 50);
      const learnMasterContainer = await this.cacheLearnMasterContainer(
        assignment, studentName, gradeLevel
      );

      onProgress?.('Learn content ready!', 100);
      const duration = Date.now() - startTime;
      console.log(`✅ Learn phase cached in ${duration}ms for ${studentName}`);
      
      return learnMasterContainer;

    } catch (error) {
      console.error('❌ Failed to cache Learn phase:', error);
      throw new Error(`Learn phase caching failed: ${error}`);
    }
  }

  async cacheExperienceDiscoverPhase(
    assignment: MultiSubjectAssignment,
    studentName: string,
    gradeLevel: string,
    selectedCareer: string,
    onProgress?: (step: string, progress: number) => void,
    forceProductionServices: boolean = false
  ): Promise<{ experienceMasterContainer: MasterContainerData; discoverMasterContainer: MasterContainerData }> {
    console.log(`🎭 Starting Experience/Discover phase cache for ${studentName} with career: ${selectedCareer}...`);
    const startTime = Date.now();

    try {
      // Check if this is a demo user AND not forcing production services
      const useProductionServices = forceProductionServices || 
        import.meta.env.VITE_USE_PRODUCTION_SERVICES === 'true';
      
      if (this.isDemoUser(studentName) && !useProductionServices) {
        console.log(`🎯 Demo user detected: ${studentName}, using pre-generated ${selectedCareer} cache`);
        console.log(`🔍 Available careers in cache:`, Object.keys(DEMO_USER_CACHE[studentName]?.careerContent || {}));
        onProgress?.('Loading demo career content...', 50);
        
        const experienceMasterContainer = this.transformDemoExperienceCache(studentName, selectedCareer);
        const discoverMasterContainer = this.transformDemoDiscoverCache(studentName, selectedCareer);
        
        onProgress?.('Demo career content ready!', 100);
        const duration = Date.now() - startTime;
        console.log(`✅ Demo Experience/Discover cache loaded in ${duration}ms for ${studentName}`);
        
        // Store in comprehensive cache
        const cacheKey = this.getCacheKey(studentName, gradeLevel, assignment.id);
        const learnContainer = this.getLearnMasterContainer(studentName, gradeLevel, assignment.id);
        
        if (learnContainer) {
          const journeyCache: ComprehensiveJourneyCache = {
            studentName,
            gradeLevel,
            assignment,
            learnMasterContainer: learnContainer,
            experienceMasterContainer,
            discoverMasterContainer,
            cacheTimestamp: new Date(),
            isFullyCached: true
          };
          this.journeyCache.set(cacheKey, journeyCache);
        }
        
        return { experienceMasterContainer, discoverMasterContainer };
      }

      // Regular user - generate content dynamically
      // Cache Experience Master Container with selected career
      onProgress?.('Caching Experience content...', 25);
      const experienceMasterContainer = await this.cacheExperienceMasterContainer(
        assignment, studentName, gradeLevel, selectedCareer
      );

      // Cache Discover Master Container with career theme
      onProgress?.('Caching Discover content...', 75);
      const discoverMasterContainer = await this.cacheDiscoverMasterContainer(
        assignment, studentName, gradeLevel, selectedCareer
      );

      onProgress?.('Experience & Discover ready!', 100);
      const duration = Date.now() - startTime;
      console.log(`✅ Experience/Discover phase cached in ${duration}ms for ${studentName}`);
      
      // Store in comprehensive cache
      const cacheKey = this.getCacheKey(studentName, gradeLevel, assignment.id);
      const learnContainer = this.getLearnMasterContainer(studentName, gradeLevel, assignment.id);
      
      if (learnContainer) {
        const journeyCache: ComprehensiveJourneyCache = {
          studentName,
          gradeLevel,
          assignment,
          learnMasterContainer: learnContainer,
          experienceMasterContainer,
          discoverMasterContainer,
          cacheTimestamp: new Date(),
          isFullyCached: true
        };
        this.journeyCache.set(cacheKey, journeyCache);
      }
      
      return { experienceMasterContainer, discoverMasterContainer };

    } catch (error) {
      console.error('❌ Failed to cache Experience/Discover phase:', error);
      throw new Error(`Experience/Discover phase caching failed: ${error}`);
    }
  }

  // Legacy method for backward compatibility
  async cacheCompleteJourney(
    assignment: MultiSubjectAssignment,
    studentName: string,
    gradeLevel: string,
    onProgress?: (step: string, progress: number) => void
  ): Promise<ComprehensiveJourneyCache> {
    // For now, just cache Learn phase - Experience/Discover will be cached after career selection
    const learnMasterContainer = await this.cacheLearnPhase(assignment, studentName, gradeLevel, onProgress);
    
    // Create partial cache (only Learn phase)
    const partialCache: ComprehensiveJourneyCache = {
      studentName,
      gradeLevel,
      assignment,
      learnMasterContainer,
      experienceMasterContainer: null as any, // Will be populated after career selection
      discoverMasterContainer: null as any,   // Will be populated after career selection
      cacheTimestamp: new Date(),
      isFullyCached: false // Not fully cached yet
    };

    const cacheKey = this.getCacheKey(studentName, gradeLevel, assignment.id);
    this.journeyCache.set(cacheKey, partialCache);
    
    return partialCache;
  }

  // ================================================================
  // MASTER CONTAINER CACHING
  // ================================================================

  private async cacheLearnMasterContainer(
    assignment: MultiSubjectAssignment,
    studentName: string,
    gradeLevel: string
  ): Promise<MasterContainerData> {
    console.log(`📚 Caching Learn Master Container for ${studentName}...`);
    
    const subjectCards: SubjectCard[] = [];
    
    // Group skills by subject
    const skillsBySubject = this.groupSkillsBySubject(assignment.skills);
    
    for (const [subject, skills] of skillsBySubject.entries()) {
      const assignments: AssignmentCard[] = [];
      
      for (const skill of skills) {
        try {
          // Generate Learn content for this skill (instruction focused)
          console.log(`📚 Generating Learn content for ${skill.skill_number} (${studentName})`);
          const learnContent = await this.contentGenerator.generateLearnContent(
            skill, studentName, gradeLevel
          );
          
          console.log(`📝 Learn content generated:`, {
            hasInstruction: !!learnContent.instruction,
            hasPractice: !!learnContent.practice,
            hasAssessment: !!learnContent.assessment,
            contentSource: learnContent.instruction.content.includes('Hi ' + studentName) ? 'Generated/Demo' : 'Cached',
            examples: learnContent.instruction.examples?.length || 0,
            practiceExercises: learnContent.practice?.exercises?.length || 0,
            assessmentOptions: learnContent.assessment?.options?.length || 0,
            assessmentQuestion: learnContent.assessment?.question?.substring(0, 50) + '...' || 'No question'
          });
          
          const assignmentCard: AssignmentCard = {
            id: `learn-${skill.skill_number}`,
            title: `${skill.skill_name}`,
            skill,
            steps: {
              instruction: learnContent.instruction,
              practice: learnContent.practice,
              assessment: learnContent.assessment
            }
          };
          
          assignments.push(assignmentCard);
          
        } catch (error) {
          console.error(`❌ Failed to generate Learn content for ${skill.skill_number}:`, error);
          console.log(`🔄 Using fallback demo content for ${skill.skill_number}`);
          
          // Use demo content as fallback
          const fallbackContent = {
            instruction: {
              title: `Let's Learn ${skill.skill_name}!`,
              content: `Hi ${studentName}! Today we're going to learn about ${skill.skill_name}.`,
              concept: `${skill.skill_name} is an important skill.`,
              examples: [{ question: 'Example problem', answer: 'Example solution', explanation: 'This helps us learn.' }],
              keyPoints: ['Key point 1', 'Key point 2', 'Key point 3']
            },
            practice: {
              title: `Practice ${skill.skill_name}`,
              exercises: [{ question: 'Practice question', hint: 'Use what you learned', expectedAnswer: 'Correct approach', feedback: 'Great work!' }]
            },
            assessment: {
              question: `Which best describes ${skill.skill_name}?`,
              options: ['Correct approach', 'Incorrect approach A', 'Incorrect approach B', 'Incorrect approach C'],
              correctAnswer: 'Correct approach',
              explanation: 'That\'s the right way to apply this skill!',
              feedback: { correct: 'Excellent!', incorrect: 'Let\'s review and try again.' }
            }
          };
          
          const assignmentCard: AssignmentCard = {
            id: `learn-${skill.skill_number}`,
            title: `${skill.skill_name}`,
            skill,
            steps: fallbackContent
          };
          
          assignments.push(assignmentCard);
        }
      }
      
      subjectCards.push({
        subject,
        assignments
      });
    }

    return {
      containerType: 'learn',
      subjectCards,
      metadata: {
        studentName,
        gradeLevel,
        totalAssignments: assignment.skills.length,
        estimatedDuration: `${assignment.skills.length * 15} min`
      }
    };
  }

  private async cacheExperienceMasterContainer(
    assignment: MultiSubjectAssignment,
    studentName: string,
    gradeLevel: string,
    selectedCareer: string = 'professional'
  ): Promise<MasterContainerData> {
    console.log(`💼 Caching Experience Master Container for ${studentName} with career: ${selectedCareer}...`);
    
    const subjectCards: SubjectCard[] = [];
    const skillsBySubject = this.groupSkillsBySubject(assignment.skills);
    
    for (const [subject, skills] of skillsBySubject.entries()) {
      const assignments: AssignmentCard[] = [];
      
      for (const skill of skills) {
        // Generate Experience content (career application focused)
        const experienceContent = await this.contentGenerator.generateExperienceContent(
          skill, studentName, gradeLevel, selectedCareer
        );
        
        const assignmentCard: AssignmentCard = {
          id: `experience-${skill.skill_number}`,
          title: `Career Application: ${skill.skill_name}`,
          skill,
          steps: {
            instruction: {
              title: experienceContent.instruction.title,
              content: experienceContent.instruction.roleDescription,
              roleDescription: experienceContent.instruction.roleDescription,
              challenge: experienceContent.instruction.challenge,
              context: experienceContent.instruction.context,
              steps: experienceContent.practice.scenarios.map(scenario => ({
                step: scenario.situation,
                action: scenario.task,
                result: scenario.expectedOutcome
              }))
            },
            practice: {
              title: experienceContent.practice.title,
              scenarios: experienceContent.practice.scenarios
            },
            assessment: experienceContent.assessment
          }
        };
        
        assignments.push(assignmentCard);
      }
      
      subjectCards.push({
        subject,
        assignments
      });
    }

    return {
      containerType: 'experience',
      subjectCards,
      metadata: {
        studentName,
        gradeLevel,
        totalAssignments: assignment.skills.length,
        estimatedDuration: `${assignment.skills.length * 20} min`
      }
    };
  }

  private async cacheDiscoverMasterContainer(
    assignment: MultiSubjectAssignment,
    studentName: string,
    gradeLevel: string,
    selectedCareer: string = 'adventure'
  ): Promise<MasterContainerData> {
    console.log(`📖 Caching Discover Master Container for ${studentName} with theme: ${selectedCareer}...`);
    
    const subjectCards: SubjectCard[] = [];
    const skillsBySubject = this.groupSkillsBySubject(assignment.skills);
    
    for (const [subject, skills] of skillsBySubject.entries()) {
      const assignments: AssignmentCard[] = [];
      
      for (const skill of skills) {
        // Generate Discover content (story-based focused)
        const discoverContent = await this.contentGenerator.generateDiscoverContent(
          skill, studentName, gradeLevel, selectedCareer
        );
        
        const assignmentCard: AssignmentCard = {
          id: `discover-${skill.skill_number}`,
          title: `Story Adventure: ${skill.skill_name}`,
          skill,
          steps: {
            instruction: {
              title: discoverContent.instruction.title,
              setting: discoverContent.instruction.setting,
              characters: discoverContent.instruction.characters,
              plot: discoverContent.instruction.plot,
              skillConnection: discoverContent.instruction.skillConnection
            },
            practice: {
              title: discoverContent.practice.title,
              storyEvents: discoverContent.practice.storyEvents || [
                {
                  event: `In the story, you encounter a situation requiring ${skill.skill_name}`,
                  choice: 'How would you help the characters solve this problem?',
                  outcome: 'Your knowledge saves the day!',
                  skillApplication: `You successfully used ${skill.skill_name} to help everyone!`
                }
              ]
            },
            assessment: discoverContent.assessment
          }
        };
        
        assignments.push(assignmentCard);
      }
      
      subjectCards.push({
        subject,
        assignments
      });
    }

    return {
      containerType: 'discover',
      subjectCards,
      metadata: {
        studentName,
        gradeLevel,
        totalAssignments: assignment.skills.length,
        estimatedDuration: `${assignment.skills.length * 25} min`
      }
    };
  }

  // ================================================================
  // CACHE RETRIEVAL
  // ================================================================

  getLearnMasterContainer(studentName: string, gradeLevel: string, assignmentId: string): MasterContainerData | null {
    const cacheKey = this.getCacheKey(studentName, gradeLevel, assignmentId);
    const journey = this.journeyCache.get(cacheKey);
    return journey?.learnMasterContainer || null;
  }

  getExperienceMasterContainer(studentName: string, gradeLevel: string, assignmentId: string): MasterContainerData | null {
    const cacheKey = this.getCacheKey(studentName, gradeLevel, assignmentId);
    const journey = this.journeyCache.get(cacheKey);
    return journey?.experienceMasterContainer || null;
  }

  getDiscoverMasterContainer(studentName: string, gradeLevel: string, assignmentId: string): MasterContainerData | null {
    const cacheKey = this.getCacheKey(studentName, gradeLevel, assignmentId);
    const journey = this.journeyCache.get(cacheKey);
    return journey?.discoverMasterContainer || null;
  }

  isJourneyFullyCached(studentName: string, gradeLevel: string, assignmentId: string): boolean {
    const cacheKey = this.getCacheKey(studentName, gradeLevel, assignmentId);
    const journey = this.journeyCache.get(cacheKey);
    return journey?.isFullyCached || false;
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  private getCacheKey(studentName: string, gradeLevel: string, assignmentId: string): string {
    return `${studentName}-${gradeLevel}-${assignmentId}`;
  }

  private isDemoUser(studentName: string): boolean {
    const demoUserNames = ['Sam Brown', 'Alex Davis', 'Jordan Smith', 'Taylor Johnson'];
    return demoUserNames.includes(studentName);
  }

  private transformDemoLearnCache(studentName: string): MasterContainerData {
    const demoData = DEMO_USER_CACHE[studentName];
    if (!demoData) {
      throw new Error(`Demo user ${studentName} not found in cache`);
    }

    const subjectCards: SubjectCard[] = [];
    
    // Transform demo cache structure to MasterContainerData format
    for (const subject of demoData.subjects) {
      const assignments: AssignmentCard[] = [];
      
      // Use A.1 skill for lesson content (A.0 is just for dashboard cards)
      const skill = demoData.skills[subject]['A.1'];
      const learnContent = demoData.learnContent[subject];
      
      if (skill && learnContent) {
        // Create one assignment with 3 steps: Instruction (1 of 3), Practice (2 of 3), Assessment (3 of 3)
        const assignmentCard: AssignmentCard = {
          id: `learn-${skill.skill_number}`,
          title: `${skill.skill_name} - Lesson 1 of 3`,
          skill: skill,
          steps: {
            instruction: learnContent.instruction,
            practice: learnContent.practice,
            assessment: learnContent.assessment
          }
        };
        
        assignments.push(assignmentCard);
      }
      
      subjectCards.push({
        subject,
        assignments
      });
    }

    // Extract A.0 skill groups for each subject
    const skillGroups: { [subject: string]: { skill_number: string; skill_name: string } } = {};
    for (const subject of demoData.subjects) {
      const skillGroup = demoData.skills[subject]['A.0'];
      if (skillGroup) {
        skillGroups[subject] = {
          skill_number: skillGroup.skill_number,
          skill_name: skillGroup.skill_name
        };
      }
    }

    return {
      containerType: 'learn',
      subjectCards,
      skillGroups, // Include A.0 skill group data
      metadata: {
        studentName,
        gradeLevel: demoData.user.gradeLevel,
        totalAssignments: demoData.subjects.length, // 1 lesson per subject
        estimatedDuration: `${demoData.subjects.length * 15} min` // 15 min per lesson
      }
    };
  }

  private transformDemoExperienceCache(studentName: string, selectedCareer: string): MasterContainerData {
    const demoData = DEMO_USER_CACHE[studentName];
    if (!demoData) {
      throw new Error(`Demo user ${studentName} not found in cache`);
    }

    // Handle case-insensitive career matching with ID normalization
    const normalizeCareerName = (name: string) => {
      return name.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
    };
    
    console.log(`🔍 Looking for career: "${selectedCareer}" (normalized: "${normalizeCareerName(selectedCareer)}")`);
    console.log(`🔍 Available careers:`, Object.keys(demoData.careerContent).map(k => `"${k}" (normalized: "${normalizeCareerName(k)}")` ));
    
    const careerKey = Object.keys(demoData.careerContent).find(
      key => normalizeCareerName(key) === normalizeCareerName(selectedCareer)
    );
    const careerData = careerKey ? demoData.careerContent[careerKey] : null;
    if (!careerData) {
      throw new Error(`Career ${selectedCareer} not found for demo user ${studentName}. Available: ${Object.keys(demoData.careerContent).join(', ')}`);
    }
    
    console.log(`✅ Found career match: "${selectedCareer}" -> "${careerKey}"`);

    const subjectCards: SubjectCard[] = [];
    
    for (const subject of demoData.subjects) {
      const assignments: AssignmentCard[] = [];
      const skill = demoData.skills[subject]['A.1'];
      
      if (skill) {
        // Get subject-specific experience data
        const subjectExperience = careerData.experience[subject];
        
        if (subjectExperience) {
          const assignmentCard: AssignmentCard = {
            id: `experience-${skill.skill_number}`,
            title: `Career Application: ${skill.skill_name}`,
            skill: skill,
            steps: {
              instruction: {
                title: subjectExperience.roleSetup.title,
                content: subjectExperience.roleSetup.roleDescription,
                roleDescription: subjectExperience.roleSetup.roleDescription,
                challenge: subjectExperience.roleSetup.challenge,
                context: subjectExperience.roleSetup.context,
                steps: subjectExperience.applySkills.scenarios.map(scenario => ({
                  step: scenario.situation,
                  action: scenario.task,
                  result: scenario.expectedOutcome
                }))
              },
              practice: {
                title: subjectExperience.applySkills.title,
                scenarios: subjectExperience.applySkills.scenarios
              },
              assessment: subjectExperience.solveChallenge
            }
          };
          
          assignments.push(assignmentCard);
        } else {
          console.warn(`❌ No experience data found for ${subject} in ${careerKey} career`);
        }
      }
      
      subjectCards.push({
        subject,
        assignments
      });
    }

    return {
      containerType: 'experience',
      subjectCards,
      metadata: {
        studentName,
        gradeLevel: demoData.user.gradeLevel,
        totalAssignments: demoData.subjects.length,
        estimatedDuration: `${demoData.subjects.length * 20} min`
      }
    };
  }

  private transformDemoDiscoverCache(studentName: string, selectedCareer: string): MasterContainerData {
    const demoData = DEMO_USER_CACHE[studentName];
    if (!demoData) {
      throw new Error(`Demo user ${studentName} not found in cache`);
    }

    // Handle case-insensitive career matching with ID normalization
    const normalizeCareerName = (name: string) => {
      return name.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
    };
    
    const careerKey = Object.keys(demoData.careerContent).find(
      key => normalizeCareerName(key) === normalizeCareerName(selectedCareer)
    );
    const careerData = careerKey ? demoData.careerContent[careerKey] : null;
    if (!careerData) {
      throw new Error(`Career ${selectedCareer} not found for demo user ${studentName}. Available: ${Object.keys(demoData.careerContent).join(', ')}`);
    }

    const subjectCards: SubjectCard[] = [];
    
    for (const subject of demoData.subjects) {
      const assignments: AssignmentCard[] = [];
      const skill = demoData.skills[subject]['A.1'];
      
      if (skill) {
        const assignmentCard: AssignmentCard = {
          id: `discover-${skill.skill_number}`,
          title: `Story Adventure: ${skill.skill_name}`,
          skill: skill,
          steps: {
            instruction: careerData.discover.storySetup,
            practice: careerData.discover.adventure,
            assessment: {
              question: careerData.discover.herosChoice.question,
              options: careerData.discover.herosChoice.options,
              correctAnswer: careerData.discover.herosChoice.correctAnswer,
              explanation: careerData.discover.herosChoice.explanation,
              storyConclusion: careerData.discover.herosChoice.ending
            }
          }
        };
        
        assignments.push(assignmentCard);
      }
      
      subjectCards.push({
        subject,
        assignments
      });
    }

    return {
      containerType: 'discover',
      subjectCards,
      metadata: {
        studentName,
        gradeLevel: demoData.user.gradeLevel,
        totalAssignments: demoData.subjects.length,
        estimatedDuration: `${demoData.subjects.length * 25} min`
      }
    };
  }

  private groupSkillsBySubject(skills: Skill[]): Map<string, Skill[]> {
    const grouped = new Map<string, Skill[]>();
    
    for (const skill of skills) {
      if (!grouped.has(skill.subject)) {
        grouped.set(skill.subject, []);
      }
      grouped.get(skill.subject)!.push(skill);
    }
    
    return grouped;
  }


  // ================================================================
  // CACHE MANAGEMENT
  // ================================================================

  clearCache(studentName?: string): void {
    if (studentName) {
      // Clear specific student's cache
      const keysToRemove = Array.from(this.journeyCache.keys())
        .filter(key => key.startsWith(studentName));
      keysToRemove.forEach(key => this.journeyCache.delete(key));
      console.log(`🗑️ Cleared cache for ${studentName}`);
    } else {
      // Clear all cache
      this.journeyCache.clear();
      console.log('🗑️ Cleared all journey cache');
    }
  }

  getCacheStats(): { totalJourneys: number; totalSize: number } {
    return {
      totalJourneys: this.journeyCache.size,
      totalSize: JSON.stringify(Array.from(this.journeyCache.values())).length
    };
  }
}

// Export types for external use
export type { ComprehensiveJourneyCache, MasterContainerData, SubjectCard, AssignmentCard };