/**
 * Age-Appropriate Provisioning Service
 * Controls feature visibility and complexity based on student grade level
 * Ensures age-appropriate content and interactions
 */

export interface ProvisioningConfig {
  // Display Settings
  showXP: boolean;
  showLeaderboard: boolean;
  showHintCosts: boolean;
  showStreaks: boolean;
  showAchievements: boolean;
  showCareerExploration: boolean;
  showAdvancedMetrics: boolean;
  showSocialFeatures: boolean;
  showCompetitiveElements: boolean;
  
  // Gamification Settings
  useSimpleLanguage: boolean;
  useVisualRewards: boolean;
  useAnimations: boolean;
  useSoundEffects: boolean;
  
  // Content Settings
  maxCareersToShow: number;
  maxSkillsPerLesson: number;
  sessionDurationMinutes: number;
  breakReminderMinutes: number;
  
  // Difficulty Settings
  hintAvailability: 'unlimited' | 'limited' | 'earned';
  freeHintsPerDay: number;
  xpMultiplier: number;
  difficultyAdjustment: number;
  
  // Social Settings
  allowPeerComparison: boolean;
  allowGlobalLeaderboard: boolean;
  allowSchoolLeaderboard: boolean;
  allowClassLeaderboard: boolean;
  allowDirectMessaging: boolean;
  allowTeamFormation: boolean;
  
  // PathIQ Features
  showPathIQInsights: boolean;
  showPathIQPredictions: boolean;
  showPathIQRecommendations: boolean;
  pathIQComplexity: 'simple' | 'moderate' | 'advanced';
  
  // UI/UX Settings
  interfaceComplexity: 'simple' | 'standard' | 'advanced';
  colorScheme: 'bright' | 'standard' | 'professional';
  fontSize: 'large' | 'medium' | 'small';
  buttonSize: 'large' | 'medium' | 'small';
  
  // Parent/Teacher Controls
  requireParentApproval: boolean;
  sendProgressReports: boolean;
  allowDataSharing: boolean;
  
  // Feature Names (age-appropriate terminology)
  terminology: {
    xp: string;
    level: string;
    achievement: string;
    leaderboard: string;
    streak: string;
    hint: string;
    career: string;
    skill: string;
  };
}

export type SchoolType = 'family' | 'microschool' | 'private' | 'district';
export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
export type GradeGroup = 'K-2' | '3-5' | '6-8' | '9-12';

class AgeProvisioningService {
  private static instance: AgeProvisioningService;
  
  // Grade group configurations
  private readonly GRADE_CONFIGS: Record<GradeGroup, ProvisioningConfig> = {
    'K-2': {
      // Display Settings - Very simple for young learners
      showXP: false,
      showLeaderboard: false,
      showHintCosts: false,
      showStreaks: true, // But call them "Learning Days"
      showAchievements: true, // But call them "Stickers"
      showCareerExploration: true, // Community Helpers only
      showAdvancedMetrics: false,
      showSocialFeatures: false,
      showCompetitiveElements: false,
      
      // Gamification Settings
      useSimpleLanguage: true,
      useVisualRewards: true,
      useAnimations: true,
      useSoundEffects: true,
      
      // Content Settings
      maxCareersToShow: 3,
      maxSkillsPerLesson: 1,
      sessionDurationMinutes: 15,
      breakReminderMinutes: 10,
      
      // Difficulty Settings
      hintAvailability: 'unlimited',
      freeHintsPerDay: 999,
      xpMultiplier: 2,
      difficultyAdjustment: -2,
      
      // Social Settings
      allowPeerComparison: false,
      allowGlobalLeaderboard: false,
      allowSchoolLeaderboard: false,
      allowClassLeaderboard: false,
      allowDirectMessaging: false,
      allowTeamFormation: false,
      
      // PathIQ Features
      showPathIQInsights: false,
      showPathIQPredictions: false,
      showPathIQRecommendations: true, // But simplified
      pathIQComplexity: 'simple',
      
      // UI/UX Settings
      interfaceComplexity: 'simple',
      colorScheme: 'bright',
      fontSize: 'large',
      buttonSize: 'large',
      
      // Parent/Teacher Controls
      requireParentApproval: true,
      sendProgressReports: true,
      allowDataSharing: false,
      
      // Age-appropriate terminology
      terminology: {
        xp: 'Stars',
        level: 'Grade',
        achievement: 'Sticker',
        leaderboard: 'Class Stars',
        streak: 'Learning Days',
        hint: 'Help',
        career: 'Community Helper',
        skill: 'Lesson'
      }
    },
    
    '3-5': {
      // Display Settings - Introduction to gamification
      showXP: true,
      showLeaderboard: true,
      showHintCosts: true,
      showStreaks: true,
      showAchievements: true,
      showCareerExploration: true,
      showAdvancedMetrics: false,
      showSocialFeatures: true,
      showCompetitiveElements: true, // But friendly competition
      
      // Gamification Settings
      useSimpleLanguage: true,
      useVisualRewards: true,
      useAnimations: true,
      useSoundEffects: true,
      
      // Content Settings
      maxCareersToShow: 5,
      maxSkillsPerLesson: 3,
      sessionDurationMinutes: 25,
      breakReminderMinutes: 20,
      
      // Difficulty Settings
      hintAvailability: 'limited',
      freeHintsPerDay: 10,
      xpMultiplier: 1.5,
      difficultyAdjustment: 0,
      
      // Social Settings
      allowPeerComparison: true,
      allowGlobalLeaderboard: false,
      allowSchoolLeaderboard: true,
      allowClassLeaderboard: true,
      allowDirectMessaging: false,
      allowTeamFormation: true,
      
      // PathIQ Features
      showPathIQInsights: true,
      showPathIQPredictions: false,
      showPathIQRecommendations: true,
      pathIQComplexity: 'moderate',
      
      // UI/UX Settings
      interfaceComplexity: 'standard',
      colorScheme: 'bright',
      fontSize: 'medium',
      buttonSize: 'medium',
      
      // Parent/Teacher Controls
      requireParentApproval: true,
      sendProgressReports: true,
      allowDataSharing: false,
      
      // Age-appropriate terminology
      terminology: {
        xp: 'XP Points',
        level: 'Level',
        achievement: 'Badge',
        leaderboard: 'Leaderboard',
        streak: 'Streak',
        hint: 'Hint',
        career: 'Career',
        skill: 'Skill'
      }
    },
    
    '6-8': {
      // Display Settings - Full gamification
      showXP: true,
      showLeaderboard: true,
      showHintCosts: true,
      showStreaks: true,
      showAchievements: true,
      showCareerExploration: true,
      showAdvancedMetrics: true,
      showSocialFeatures: true,
      showCompetitiveElements: true,
      
      // Gamification Settings
      useSimpleLanguage: false,
      useVisualRewards: true,
      useAnimations: true,
      useSoundEffects: false, // Optional
      
      // Content Settings
      maxCareersToShow: 8,
      maxSkillsPerLesson: 5,
      sessionDurationMinutes: 35,
      breakReminderMinutes: 30,
      
      // Difficulty Settings
      hintAvailability: 'earned',
      freeHintsPerDay: 5,
      xpMultiplier: 1,
      difficultyAdjustment: 1,
      
      // Social Settings
      allowPeerComparison: true,
      allowGlobalLeaderboard: true,
      allowSchoolLeaderboard: true,
      allowClassLeaderboard: true,
      allowDirectMessaging: false,
      allowTeamFormation: true,
      
      // PathIQ Features
      showPathIQInsights: true,
      showPathIQPredictions: true,
      showPathIQRecommendations: true,
      pathIQComplexity: 'moderate',
      
      // UI/UX Settings
      interfaceComplexity: 'standard',
      colorScheme: 'standard',
      fontSize: 'medium',
      buttonSize: 'medium',
      
      // Parent/Teacher Controls
      requireParentApproval: false,
      sendProgressReports: true,
      allowDataSharing: true,
      
      // Standard terminology
      terminology: {
        xp: 'Experience',
        level: 'Level',
        achievement: 'Achievement',
        leaderboard: 'Rankings',
        streak: 'Streak',
        hint: 'Hint',
        career: 'Career Path',
        skill: 'Competency'
      }
    },
    
    '9-12': {
      // Display Settings - Advanced features
      showXP: true,
      showLeaderboard: true,
      showHintCosts: true,
      showStreaks: true,
      showAchievements: true,
      showCareerExploration: true,
      showAdvancedMetrics: true,
      showSocialFeatures: true,
      showCompetitiveElements: true,
      
      // Gamification Settings
      useSimpleLanguage: false,
      useVisualRewards: false, // More subtle
      useAnimations: false, // Minimal
      useSoundEffects: false,
      
      // Content Settings
      maxCareersToShow: 12,
      maxSkillsPerLesson: 8,
      sessionDurationMinutes: 45,
      breakReminderMinutes: 45,
      
      // Difficulty Settings
      hintAvailability: 'earned',
      freeHintsPerDay: 3,
      xpMultiplier: 1,
      difficultyAdjustment: 2,
      
      // Social Settings
      allowPeerComparison: true,
      allowGlobalLeaderboard: true,
      allowSchoolLeaderboard: true,
      allowClassLeaderboard: true,
      allowDirectMessaging: true, // With moderation
      allowTeamFormation: true,
      
      // PathIQ Features
      showPathIQInsights: true,
      showPathIQPredictions: true,
      showPathIQRecommendations: true,
      pathIQComplexity: 'advanced',
      
      // UI/UX Settings
      interfaceComplexity: 'advanced',
      colorScheme: 'professional',
      fontSize: 'small',
      buttonSize: 'small',
      
      // Parent/Teacher Controls
      requireParentApproval: false,
      sendProgressReports: false, // Optional
      allowDataSharing: true,
      
      // Professional terminology
      terminology: {
        xp: 'Experience',
        level: 'Proficiency',
        achievement: 'Certification',
        leaderboard: 'Global Rankings',
        streak: 'Consistency',
        hint: 'Guidance',
        career: 'Career Pathway',
        skill: 'Core Competency'
      }
    }
  };
  
  // School type adjustments
  private readonly SCHOOL_ADJUSTMENTS: Record<SchoolType, Partial<ProvisioningConfig>> = {
    'family': {
      // Family schools: More parent control, less competition
      showGlobalLeaderboard: false,
      allowPeerComparison: false,
      requireParentApproval: true,
      sendProgressReports: true,
      maxCareersToShow: 5
    },
    'microschool': {
      // Microschools: Small group dynamics
      showGlobalLeaderboard: false,
      allowClassLeaderboard: true,
      allowTeamFormation: true,
      sessionDurationMinutes: 30
    },
    'private': {
      // Private schools: Full features
      showGlobalLeaderboard: true,
      showAdvancedMetrics: true,
      showPathIQPredictions: true
    },
    'district': {
      // District schools: Standardized settings
      showGlobalLeaderboard: false,
      allowDirectMessaging: false,
      requireParentApproval: true,
      allowDataSharing: false
    }
  };

  private constructor() {
    console.log('🎓 Age Provisioning Service initialized');
  }

  static getInstance(): AgeProvisioningService {
    if (!AgeProvisioningService.instance) {
      AgeProvisioningService.instance = new AgeProvisioningService();
    }
    return AgeProvisioningService.instance;
  }

  /**
   * Get provisioning config for a specific grade and school type
   */
  getProvisioningConfig(grade: GradeLevel, schoolType: SchoolType = 'private'): ProvisioningConfig {
    const gradeGroup = this.getGradeGroup(grade);
    const baseConfig = { ...this.GRADE_CONFIGS[gradeGroup] };
    const schoolAdjustments = this.SCHOOL_ADJUSTMENTS[schoolType];
    
    // Apply school-specific adjustments
    return { ...baseConfig, ...schoolAdjustments };
  }

  /**
   * Get grade group from grade level
   */
  getGradeGroup(grade: GradeLevel): GradeGroup {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    
    if (gradeNum <= 2) return 'K-2';
    if (gradeNum <= 5) return '3-5';
    if (gradeNum <= 8) return '6-8';
    return '9-12';
  }

  /**
   * Check if a specific feature is available
   */
  isFeatureAvailable(feature: keyof ProvisioningConfig, grade: GradeLevel, schoolType: SchoolType = 'private'): boolean {
    const config = this.getProvisioningConfig(grade, schoolType);
    return !!config[feature];
  }

  /**
   * Get age-appropriate terminology
   */
  getTerminology(grade: GradeLevel): ProvisioningConfig['terminology'] {
    const gradeGroup = this.getGradeGroup(grade);
    return this.GRADE_CONFIGS[gradeGroup].terminology;
  }

  /**
   * Get recommended session duration
   */
  getSessionDuration(grade: GradeLevel): number {
    const gradeGroup = this.getGradeGroup(grade);
    return this.GRADE_CONFIGS[gradeGroup].sessionDurationMinutes;
  }

  /**
   * Check if content is appropriate
   */
  isContentAppropriate(contentType: string, grade: GradeLevel): boolean {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    
    const contentRestrictions: Record<string, number> = {
      'social_media': 6,
      'direct_messaging': 9,
      'global_competition': 3,
      'career_planning': 0,
      'advanced_analytics': 6,
      'peer_comparison': 3,
      'xp_economy': 3,
      'achievements': 0,
      'leaderboards': 3
    };
    
    const minGrade = contentRestrictions[contentType] || 0;
    return gradeNum >= minGrade;
  }

  /**
   * Get UI configuration for grade
   */
  getUIConfig(grade: GradeLevel): {
    complexity: string;
    colorScheme: string;
    fontSize: string;
    buttonSize: string;
    animations: boolean;
  } {
    const config = this.getProvisioningConfig(grade);
    
    return {
      complexity: config.interfaceComplexity,
      colorScheme: config.colorScheme,
      fontSize: config.fontSize,
      buttonSize: config.buttonSize,
      animations: config.useAnimations
    };
  }

  /**
   * Get PathIQ configuration for grade
   */
  getPathIQConfig(grade: GradeLevel): {
    enabled: boolean;
    complexity: string;
    features: string[];
  } {
    const config = this.getProvisioningConfig(grade);
    const features: string[] = [];
    
    if (config.showPathIQInsights) features.push('insights');
    if (config.showPathIQPredictions) features.push('predictions');
    if (config.showPathIQRecommendations) features.push('recommendations');
    
    return {
      enabled: features.length > 0,
      complexity: config.pathIQComplexity,
      features
    };
  }

  /**
   * Get social features configuration
   */
  getSocialConfig(grade: GradeLevel, schoolType: SchoolType = 'private'): {
    leaderboards: string[];
    messaging: boolean;
    teams: boolean;
    comparison: boolean;
  } {
    const config = this.getProvisioningConfig(grade, schoolType);
    const leaderboards: string[] = [];
    
    if (config.allowClassLeaderboard) leaderboards.push('class');
    if (config.allowSchoolLeaderboard) leaderboards.push('school');
    if (config.allowGlobalLeaderboard) leaderboards.push('global');
    
    return {
      leaderboards,
      messaging: config.allowDirectMessaging,
      teams: config.allowTeamFormation,
      comparison: config.allowPeerComparison
    };
  }
}

// Export singleton instance
export const ageProvisioning = AgeProvisioningService.getInstance();

// Export types
export type { AgeProvisioningService };

export default ageProvisioning;