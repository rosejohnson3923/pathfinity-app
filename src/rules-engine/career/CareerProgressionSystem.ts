/**
 * Career Progression System
 * Manages age-appropriate career exposure levels and scalable career additions
 * This ensures careers are introduced gradually and appropriately by grade/age
 */

import { CareerType } from './CareerAIRulesEngine';

// ============================================================================
// CAREER PROGRESSION DEFINITIONS
// ============================================================================

/**
 * Career exposure levels that graduate with student age/grade
 * These provide age-appropriate depth of career exploration
 */
export enum CareerExposureLevel {
  EXPLORER = 'explorer',        // K-1: Basic introduction, "What does a X do?"
  APPRENTICE = 'apprentice',    // 2-3: Learn tools and basic activities
  PRACTITIONER = 'practitioner', // 4-5: Understand processes and skills
  SPECIALIST = 'specialist',     // 6-8: Deeper knowledge and specializations
  EXPERT = 'expert'             // 9-12: Career pathways and advanced concepts
}

/**
 * Age-appropriate career labels that evolve with student progress
 */
export interface CareerProgressionLabel {
  level: CareerExposureLevel;
  title: string;
  badge: string;
  description: string;
  ageRange: string;
  gradeRange: string[];
  unlockRequirements: string[];
}

/**
 * Career content complexity by exposure level
 */
export interface CareerContentComplexity {
  level: CareerExposureLevel;
  vocabularyComplexity: 'basic' | 'intermediate' | 'advanced' | 'technical' | 'professional';
  toolsExposure: 'observe' | 'identify' | 'basic_use' | 'proficient' | 'expert';
  conceptDepth: 'surface' | 'foundational' | 'comprehensive' | 'detailed' | 'mastery';
  realWorldConnection: 'simple' | 'relatable' | 'practical' | 'industry' | 'professional';
  problemComplexity: 'single_step' | 'multi_step' | 'analytical' | 'strategic' | 'innovative';
}

/**
 * Scalable career registration interface
 * Makes it easy to add new careers without modifying core engine
 */
export interface CareerRegistration {
  id: string;
  name: string;
  category: string;
  baseProfile: CareerBaseProfile;
  progressionLevels: Map<CareerExposureLevel, CareerLevelContent>;
  customRules?: CareerCustomRules;
  metadata?: CareerMetadata;
}

export interface CareerBaseProfile {
  description: string;
  coreSkills: string[];
  primaryTools: string[];
  workEnvironments: string[];
  iconEmoji: string;
  themeColor: string;
  introductionAge: string; // e.g., "5+" for kindergarten and up
}

export interface CareerLevelContent {
  level: CareerExposureLevel;
  label: string; // e.g., "Junior Doctor", "Doctor in Training", "Medical Student"
  vocabulary: string[];
  concepts: string[];
  activities: string[];
  tools: string[];
  scenarios: string[];
  roleModels: RoleModel[];
  dailyTasks: string[];
  challenges: string[];
  rewards: string[];
}

export interface RoleModel {
  name: string;
  achievement: string;
  quote: string;
  ageAppropriate: boolean;
  gradeLevel?: string[];
}

export interface CareerCustomRules {
  specialRequirements?: string[];
  prerequisites?: string[];
  restrictions?: CareerRestriction[];
  bonusFeatures?: string[];
}

export interface CareerRestriction {
  type: 'age' | 'grade' | 'skill' | 'time';
  condition: string;
  message: string;
}

export interface CareerMetadata {
  addedDate: Date;
  version: string;
  author: string;
  tags: string[];
  popularity?: number;
  educationalStandards?: string[];
}

// ============================================================================
// CAREER PROGRESSION SYSTEM CLASS
// ============================================================================

export class CareerProgressionSystem {
  private static instance: CareerProgressionSystem;
  private careerRegistry: Map<string, CareerRegistration> = new Map();
  private progressionLabels: Map<CareerExposureLevel, CareerProgressionLabel>;
  private contentComplexity: Map<CareerExposureLevel, CareerContentComplexity>;
  
  private constructor() {
    this.progressionLabels = this.initializeProgressionLabels();
    this.contentComplexity = this.initializeContentComplexity();
    this.registerDefaultCareers();
  }
  
  public static getInstance(): CareerProgressionSystem {
    if (!CareerProgressionSystem.instance) {
      CareerProgressionSystem.instance = new CareerProgressionSystem();
    }
    return CareerProgressionSystem.instance;
  }
  
  /**
   * Initialize progression labels for each exposure level
   */
  private initializeProgressionLabels(): Map<CareerExposureLevel, CareerProgressionLabel> {
    const labels = new Map<CareerExposureLevel, CareerProgressionLabel>();
    
    labels.set(CareerExposureLevel.EXPLORER, {
      level: CareerExposureLevel.EXPLORER,
      title: 'Career Explorer',
      badge: '🔍',
      description: 'Just starting to explore what different careers do',
      ageRange: '5-7 years',
      gradeRange: ['K', '1'],
      unlockRequirements: ['complete_introduction', 'watch_career_video']
    });
    
    labels.set(CareerExposureLevel.APPRENTICE, {
      level: CareerExposureLevel.APPRENTICE,
      title: 'Career Apprentice',
      badge: '📚',
      description: 'Learning about tools and basic activities of careers',
      ageRange: '7-9 years',
      gradeRange: ['2', '3'],
      unlockRequirements: ['complete_5_activities', 'use_career_tools', 'explorer_badge']
    });
    
    labels.set(CareerExposureLevel.PRACTITIONER, {
      level: CareerExposureLevel.PRACTITIONER,
      title: 'Career Practitioner',
      badge: '⚡',
      description: 'Understanding processes and developing career skills',
      ageRange: '9-11 years',
      gradeRange: ['4', '5'],
      unlockRequirements: ['complete_10_activities', 'solve_career_problems', 'apprentice_badge']
    });
    
    labels.set(CareerExposureLevel.SPECIALIST, {
      level: CareerExposureLevel.SPECIALIST,
      title: 'Career Specialist',
      badge: '🌟',
      description: 'Gaining deeper knowledge and exploring specializations',
      ageRange: '11-14 years',
      gradeRange: ['6', '7', '8'],
      unlockRequirements: ['complete_career_project', 'mentorship_sessions', 'practitioner_badge']
    });
    
    labels.set(CareerExposureLevel.EXPERT, {
      level: CareerExposureLevel.EXPERT,
      title: 'Career Expert',
      badge: '🏆',
      description: 'Understanding career pathways and advanced concepts',
      ageRange: '14+ years',
      gradeRange: ['9', '10', '11', '12'],
      unlockRequirements: ['career_research', 'internship_simulation', 'specialist_badge']
    });
    
    return labels;
  }
  
  /**
   * Initialize content complexity for each level
   */
  private initializeContentComplexity(): Map<CareerExposureLevel, CareerContentComplexity> {
    const complexity = new Map<CareerExposureLevel, CareerContentComplexity>();
    
    complexity.set(CareerExposureLevel.EXPLORER, {
      level: CareerExposureLevel.EXPLORER,
      vocabularyComplexity: 'basic',
      toolsExposure: 'observe',
      conceptDepth: 'surface',
      realWorldConnection: 'simple',
      problemComplexity: 'single_step'
    });
    
    complexity.set(CareerExposureLevel.APPRENTICE, {
      level: CareerExposureLevel.APPRENTICE,
      vocabularyComplexity: 'intermediate',
      toolsExposure: 'identify',
      conceptDepth: 'foundational',
      realWorldConnection: 'relatable',
      problemComplexity: 'multi_step'
    });
    
    complexity.set(CareerExposureLevel.PRACTITIONER, {
      level: CareerExposureLevel.PRACTITIONER,
      vocabularyComplexity: 'advanced',
      toolsExposure: 'basic_use',
      conceptDepth: 'comprehensive',
      realWorldConnection: 'practical',
      problemComplexity: 'analytical'
    });
    
    complexity.set(CareerExposureLevel.SPECIALIST, {
      level: CareerExposureLevel.SPECIALIST,
      vocabularyComplexity: 'technical',
      toolsExposure: 'proficient',
      conceptDepth: 'detailed',
      realWorldConnection: 'industry',
      problemComplexity: 'strategic'
    });
    
    complexity.set(CareerExposureLevel.EXPERT, {
      level: CareerExposureLevel.EXPERT,
      vocabularyComplexity: 'professional',
      toolsExposure: 'expert',
      conceptDepth: 'mastery',
      realWorldConnection: 'professional',
      problemComplexity: 'innovative'
    });
    
    return complexity;
  }
  
  /**
   * Register a new career (SCALABLE METHOD)
   * This is the primary method for adding new careers to the system
   */
  public registerCareer(registration: CareerRegistration): boolean {
    try {
      // Validate registration
      if (!this.validateCareerRegistration(registration)) {
        console.error(`Invalid career registration: ${registration.name}`);
        return false;
      }
      
      // Add to registry
      this.careerRegistry.set(registration.id, registration);
      
      // Log successful registration
      console.log(`✅ Career registered: ${registration.name} (${registration.id})`);
      
      // Emit event for other systems
      this.emitCareerRegistrationEvent(registration);
      
      return true;
    } catch (error) {
      console.error(`Failed to register career: ${error}`);
      return false;
    }
  }
  
  /**
   * Validate career registration
   */
  private validateCareerRegistration(registration: CareerRegistration): boolean {
    // Check required fields
    if (!registration.id || !registration.name || !registration.category) {
      return false;
    }
    
    // Check if all progression levels are defined
    const requiredLevels = [
      CareerExposureLevel.EXPLORER,
      CareerExposureLevel.APPRENTICE,
      CareerExposureLevel.PRACTITIONER
    ];
    
    for (const level of requiredLevels) {
      if (!registration.progressionLevels.has(level)) {
        console.warn(`Missing progression level ${level} for ${registration.name}`);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get age-appropriate career content
   */
  public getCareerContentForGrade(
    careerId: string,
    grade: string
  ): CareerLevelContent | undefined {
    const career = this.careerRegistry.get(careerId);
    if (!career) return undefined;
    
    const level = this.getExposureLevelForGrade(grade);
    return career.progressionLevels.get(level);
  }
  
  /**
   * Determine exposure level based on grade
   */
  public getExposureLevelForGrade(grade: string): CareerExposureLevel {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    
    if (gradeNum <= 1) return CareerExposureLevel.EXPLORER;
    if (gradeNum <= 3) return CareerExposureLevel.APPRENTICE;
    if (gradeNum <= 5) return CareerExposureLevel.PRACTITIONER;
    if (gradeNum <= 8) return CareerExposureLevel.SPECIALIST;
    return CareerExposureLevel.EXPERT;
  }
  
  /**
   * Get career label for student
   */
  public getCareerLabel(
    careerId: string,
    grade: string
  ): string {
    const career = this.careerRegistry.get(careerId);
    if (!career) return 'Career Explorer';
    
    const level = this.getExposureLevelForGrade(grade);
    const content = career.progressionLevels.get(level);
    
    return content?.label || `${career.name} Explorer`;
  }
  
  /**
   * Get all registered careers
   */
  public getAllCareers(): CareerRegistration[] {
    return Array.from(this.careerRegistry.values());
  }
  
  /**
   * Get careers by category
   */
  public getCareersByCategory(category: string): CareerRegistration[] {
    return this.getAllCareers().filter(c => c.category === category);
  }
  
  /**
   * Get progression label for level
   */
  public getProgressionLabel(level: CareerExposureLevel): CareerProgressionLabel | undefined {
    return this.progressionLabels.get(level);
  }
  
  /**
   * Get content complexity for level
   */
  public getContentComplexity(level: CareerExposureLevel): CareerContentComplexity | undefined {
    return this.contentComplexity.get(level);
  }
  
  /**
   * Register default careers (called on initialization)
   */
  private registerDefaultCareers(): void {
    // Doctor career with age-appropriate progression
    this.registerCareer({
      id: 'doctor',
      name: 'Doctor',
      category: 'Healthcare',
      baseProfile: {
        description: 'Doctors help people stay healthy and treat illnesses',
        coreSkills: ['caring', 'problem-solving', 'science', 'communication'],
        primaryTools: ['stethoscope', 'thermometer', 'medicine'],
        workEnvironments: ['hospital', 'clinic', 'office'],
        iconEmoji: '🏥',
        themeColor: '#10B981',
        introductionAge: '5+'
      },
      progressionLevels: new Map([
        [CareerExposureLevel.EXPLORER, {
          level: CareerExposureLevel.EXPLORER,
          label: 'Little Helper Doctor',
          vocabulary: ['sick', 'healthy', 'medicine', 'feel better', 'boo-boo'],
          concepts: ['helping people', 'being kind', 'washing hands'],
          activities: ['check teddy bear', 'put on bandaid', 'wash hands'],
          tools: ['bandaid', 'toy stethoscope', 'thermometer'],
          scenarios: ['Teddy bear has a tummy ache...', 'Your friend scraped their knee...'],
          roleModels: [{
            name: 'Doc McStuffins',
            achievement: 'Helps toys feel better',
            quote: 'Time for your checkup!',
            ageAppropriate: true,
            gradeLevel: ['K', '1']
          }],
          dailyTasks: ['check if someone feels ok', 'give medicine', 'help feel better'],
          challenges: ['people are scared', 'germs everywhere'],
          rewards: ['happy patients', 'helping friends']
        }],
        [CareerExposureLevel.APPRENTICE, {
          level: CareerExposureLevel.APPRENTICE,
          label: 'Doctor in Training',
          vocabulary: ['patient', 'symptom', 'diagnosis', 'treatment', 'healthy habits'],
          concepts: ['body systems', 'preventing illness', 'first aid'],
          activities: ['take temperature', 'check heartbeat', 'healthy habits chart'],
          tools: ['real stethoscope', 'blood pressure cuff', 'first aid kit'],
          scenarios: ['A patient has a fever...', 'Someone needs first aid...'],
          roleModels: [{
            name: 'Dr. Seuss (Theodor Geisel)',
            achievement: 'Made reading fun and healthy for minds',
            quote: 'You have brains in your head',
            ageAppropriate: true,
            gradeLevel: ['2', '3']
          }],
          dailyTasks: ['examine patients', 'write prescriptions', 'explain treatments'],
          challenges: ['difficult cases', 'worried families'],
          rewards: ['saving lives', 'grateful patients']
        }],
        [CareerExposureLevel.PRACTITIONER, {
          level: CareerExposureLevel.PRACTITIONER,
          label: 'Junior Doctor',
          vocabulary: ['diagnosis', 'prescription', 'immune system', 'specialist', 'medical history'],
          concepts: ['medical specialties', 'diagnostic tools', 'treatment plans'],
          activities: ['read x-rays', 'analyze symptoms', 'create treatment plans'],
          tools: ['x-ray viewer', 'microscope', 'medical charts'],
          scenarios: ['Diagnose mystery illness...', 'Plan surgery preparation...'],
          roleModels: [{
            name: 'Dr. Mae Jemison',
            achievement: 'First African American woman astronaut and physician',
            quote: 'Never limit yourself',
            ageAppropriate: true,
            gradeLevel: ['4', '5']
          }],
          dailyTasks: ['rounds', 'consultations', 'procedures', 'documentation'],
          challenges: ['complex diagnoses', 'emergency decisions'],
          rewards: ['medical breakthroughs', 'patient recovery']
        }]
      ])
    });
    
    // Add more default careers here...
    // This is where you'd add the other 14 careers with their progression levels
  }
  
  /**
   * Emit career registration event for other systems
   */
  private emitCareerRegistrationEvent(registration: CareerRegistration): void {
    // This would connect to an event system
    // For now, just log
    console.log(`[Event] Career registered: ${registration.name}`);
  }
  
  /**
   * Export career data for backup or sharing
   */
  public exportCareer(careerId: string): string | null {
    const career = this.careerRegistry.get(careerId);
    if (!career) return null;
    
    return JSON.stringify(career, null, 2);
  }
  
  /**
   * Import career from JSON
   */
  public importCareer(jsonData: string): boolean {
    try {
      const career = JSON.parse(jsonData) as CareerRegistration;
      
      // Convert Maps if needed
      if (!(career.progressionLevels instanceof Map)) {
        career.progressionLevels = new Map(Object.entries(career.progressionLevels));
      }
      
      return this.registerCareer(career);
    } catch (error) {
      console.error(`Failed to import career: ${error}`);
      return false;
    }
  }
}

// ============================================================================
// CAREER BUILDER HELPER
// ============================================================================

/**
 * Helper class to make it easy to build new careers
 */
export class CareerBuilder {
  private registration: Partial<CareerRegistration> = {};
  private progressionLevels = new Map<CareerExposureLevel, CareerLevelContent>();
  
  public setBasicInfo(id: string, name: string, category: string): CareerBuilder {
    this.registration.id = id;
    this.registration.name = name;
    this.registration.category = category;
    return this;
  }
  
  public setBaseProfile(profile: CareerBaseProfile): CareerBuilder {
    this.registration.baseProfile = profile;
    return this;
  }
  
  public addProgressionLevel(level: CareerExposureLevel, content: CareerLevelContent): CareerBuilder {
    this.progressionLevels.set(level, content);
    return this;
  }
  
  public setCustomRules(rules: CareerCustomRules): CareerBuilder {
    this.registration.customRules = rules;
    return this;
  }
  
  public setMetadata(metadata: CareerMetadata): CareerBuilder {
    this.registration.metadata = metadata;
    return this;
  }
  
  public build(): CareerRegistration {
    if (!this.registration.id || !this.registration.name || !this.registration.category) {
      throw new Error('Career must have id, name, and category');
    }
    
    if (!this.registration.baseProfile) {
      throw new Error('Career must have base profile');
    }
    
    if (this.progressionLevels.size === 0) {
      throw new Error('Career must have at least one progression level');
    }
    
    return {
      ...this.registration,
      progressionLevels: this.progressionLevels
    } as CareerRegistration;
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example of how to add a new career using the builder
 */
export function addNewCareerExample(): void {
  const system = CareerProgressionSystem.getInstance();
  
  const newCareer = new CareerBuilder()
    .setBasicInfo('game_developer', 'Game Developer', 'Technology')
    .setBaseProfile({
      description: 'Game developers create fun and engaging video games',
      coreSkills: ['programming', 'creativity', 'problem-solving', 'teamwork'],
      primaryTools: ['computer', 'game engine', 'graphics software'],
      workEnvironments: ['studio', 'home office', 'tech company'],
      iconEmoji: '🎮',
      themeColor: '#9333EA',
      introductionAge: '6+'
    })
    .addProgressionLevel(CareerExposureLevel.EXPLORER, {
      level: CareerExposureLevel.EXPLORER,
      label: 'Game Explorer',
      vocabulary: ['game', 'play', 'fun', 'character', 'level'],
      concepts: ['making games fun', 'creating characters', 'telling stories'],
      activities: ['design a character', 'draw a game level', 'make up game rules'],
      tools: ['paper', 'crayons', 'blocks'],
      scenarios: ['Design a fun game for friends...', 'Create a game character...'],
      roleModels: [{
        name: 'Shigeru Miyamoto',
        achievement: 'Created Mario and Zelda',
        quote: 'A delayed game is eventually good',
        ageAppropriate: true
      }],
      dailyTasks: ['play games', 'draw ideas', 'imagine stories'],
      challenges: ['making it fun', 'fixing bugs'],
      rewards: ['people love your game', 'creative expression']
    })
    .addProgressionLevel(CareerExposureLevel.APPRENTICE, {
      level: CareerExposureLevel.APPRENTICE,
      label: 'Junior Game Designer',
      vocabulary: ['code', 'graphics', 'gameplay', 'debug', 'level design'],
      concepts: ['game mechanics', 'player experience', 'basic coding'],
      activities: ['create simple game in Scratch', 'design game levels', 'test games'],
      tools: ['Scratch', 'pixel art tool', 'simple game maker'],
      scenarios: ['Fix a bug in the game...', 'Balance game difficulty...'],
      roleModels: [{
        name: 'Roberta Williams',
        achievement: 'Pioneer of adventure games',
        quote: 'Games should tell stories',
        ageAppropriate: true
      }],
      dailyTasks: ['write code', 'create art', 'test gameplay', 'fix problems'],
      challenges: ['complex bugs', 'player feedback'],
      rewards: ['published game', 'player enjoyment']
    })
    .setMetadata({
      addedDate: new Date(),
      version: '1.0.0',
      author: 'Pathfinity Team',
      tags: ['technology', 'creative', 'STEM', 'gaming'],
      educationalStandards: ['ISTE', 'NGSS']
    })
    .build();
  
  // Register the new career
  const success = system.registerCareer(newCareer);
  
  if (success) {
    console.log('✅ New career added successfully!');
  }
}

// Export singleton instance
export const careerProgressionSystem = CareerProgressionSystem.getInstance();