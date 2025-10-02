/**
 * Demonstrative Master Narrative Generator
 *
 * ⚠️ IMPORTANT: FOR PARENT/TEACHER/ADMIN DASHBOARDS ONLY
 *
 * This generator is used for:
 * ✅ Parent Dashboard - Preview tomorrow's lessons
 * ✅ Teacher Dashboard - Review and approve curriculum
 * ✅ Admin Dashboard - Content approval workflows
 * ✅ Marketing/Sales - Demonstrate product capabilities
 * ✅ Onboarding - Show value before purchase
 *
 * DO NOT USE FOR:
 * ❌ Student Dashboard
 * ❌ Learn/Experience/Discover Containers
 * ❌ Actual lesson delivery
 *
 * For student learning, use: MasterNarrativeGenerator
 *
 * KEY DIFFERENCE:
 * - This uses SAMPLE careers (pre-selected for demonstration)
 * - Real generator uses STUDENT'S CHOSEN career (after Screen 4)
 *
 * Creates showcase lesson plans for parent approval that highlight Pathfinity's full potential
 * These enhancements will be retrofitted back into the main MasterNarrativeGenerator
 */

import {
  MasterNarrativeGenerator,
  MasterNarrative,
  MasterNarrativeParams
} from './MasterNarrativeGenerator';

/**
 * Enhanced Master Narrative with sales-focused showcase elements
 */
export interface EnhancedMasterNarrative extends MasterNarrative {
  // Parent-facing value propositions
  parentValue?: {
    realWorldConnection: string;
    futureReadiness: string;
    engagementPromise: string;
    differentiator: string;  // What makes Pathfinity special
  };

  // Progress-based achievement milestones
  milestones?: {
    firstAchievement: string;    // Early progress milestone (5-10 min)
    midwayMastery: string;        // Halfway point achievement
    finalVictory: string;         // Completion celebration
    bonusChallenge?: string;      // Optional extra achievement
  };

  // Immersive elements that bring the story to life
  immersiveElements?: {
    soundscape: string;
    interactiveTools: string[];
    rewardVisuals: string[];
    celebrationMoments: string[];
  };

  // Quality indicators for parent confidence
  qualityMarkers?: {
    commonCoreAligned: boolean;
    stateStandardsMet: boolean;
    stemIntegrated: boolean;
    socialEmotionalLearning: boolean;
    assessmentRigor: string;
    progressTracking: string;
  };

  // Real-world applications for each skill
  realWorldApplications?: {
    [subject: string]: {
      immediate: string;
      nearFuture: string;
      longTerm: string;
      careerConnection: string;
    };
  };

  // Personalization examples to show adaptability
  personalizationExamples?: {
    withStudentName: string[];
    withInterests: string[];
    withProgress: string[];
    withLearningStyle: string[];
  };

  // Companion interaction samples
  companionInteractions?: {
    greetings: string[];
    encouragement: string[];
    hints: string[];
    celebrations: string[];
    transitions: string[];
  };

  // Parent insights and guarantees
  parentInsights?: {
    adaptiveNature: string;
    noFailureMode: string;
    masteryTracking: string;
    dailyReports: string;
    weeklyProgress: string;
  };

  // Value guarantee messaging
  guarantees?: {
    engagement: string;
    learning: string;
    satisfaction: string;
    support: string;
  };
}

/**
 * Parameters for demonstrative narrative generation
 */
export interface DemonstrativeNarrativeParams extends MasterNarrativeParams {
  showcaseMode: boolean;  // Enable all enhancements
  sampleCareer?: string;   // Pre-selected career for demo
  sampleCompanion?: string; // Pre-selected companion for demo
  targetParentConcerns?: string[]; // Specific concerns to address
}

/**
 * Demonstrative Master Narrative Generator
 * Extends base generator with showcase enhancements
 */
export class DemonstrativeMasterNarrativeGenerator extends MasterNarrativeGenerator {

  /**
   * Generate an enhanced demonstrative narrative
   */
  async generateDemonstrativeNarrative(
    params: DemonstrativeNarrativeParams
  ): Promise<EnhancedMasterNarrative> {
    console.log('🌟 Generating Enhanced Demonstrative Narrative');

    // Generate base narrative using parent class
    const baseNarrative = await super.generateMasterNarrative({
      ...params,
      career: params.sampleCareer || this.selectShowcaseCareer(params.gradeLevel),
      companion: params.companion || { name: params.sampleCompanion || 'Spark', personality: 'Energetic and enthusiastic' }
    });

    // Enhance with showcase elements
    const enhanced = this.enhanceForShowcase(baseNarrative, params);

    // Add parent-facing value propositions
    const withValue = this.addParentValue(enhanced, params);

    // Add quality guarantees and trust builders
    const withGuarantees = this.addQualityGuarantees(withValue);

    // Add personalization examples
    const withPersonalization = this.addPersonalizationExamples(withGuarantees, params);

    // Add companion interactions
    const final = this.addCompanionInteractions(withPersonalization, params);

    console.log('✨ Demonstrative Narrative Enhanced with Showcase Elements');
    return final;
  }

  /**
   * Select a high-impact career for demonstration
   */
  private selectShowcaseCareer(gradeLevel: string): string {
    // Choose careers that resonate with parents and show clear skill application
    const showcaseCareers: Record<string, string[]> = {
      'K': ['Doctor', 'Teacher', 'Scientist', 'Artist', 'Chef'],
      '1': ['Veterinarian', 'Engineer', 'Police Officer', 'Author', 'Astronaut'],
      '2': ['Marine Biologist', 'Game Designer', 'Architect', 'Musician', 'Park Ranger'],
      '3': ['Environmental Scientist', 'App Developer', 'News Reporter', 'Chef', 'Pilot'],
      '4': ['Robotics Engineer', 'Wildlife Photographer', 'Data Scientist', 'Fashion Designer', 'Archaeologist'],
      '5': ['Biomedical Engineer', 'Climate Scientist', 'Film Director', 'Entrepreneur', 'Space Engineer'],
      '6': ['AI Researcher', 'Sustainable Energy Engineer', 'Medical Researcher', 'Game Developer', 'Urban Planner'],
      '7': ['Cybersecurity Expert', 'Genetic Engineer', 'Virtual Reality Designer', 'Social Entrepreneur', 'Aerospace Engineer'],
      '8': ['Quantum Computing Scientist', 'Neuroscientist', 'Blockchain Developer', 'Environmental Lawyer', 'Sports Analytics Expert']
    };

    const careers = showcaseCareers[gradeLevel] || showcaseCareers['3'];
    return careers[Math.floor(Math.random() * careers.length)];
  }

  /**
   * Enhance narrative with showcase elements
   */
  private enhanceForShowcase(
    narrative: MasterNarrative,
    params: DemonstrativeNarrativeParams
  ): EnhancedMasterNarrative {
    const enhanced: EnhancedMasterNarrative = {
      ...narrative,

      // Add progress-based achievement milestones
      milestones: {
        firstAchievement: `Earn your Junior ${narrative.character.role} Badge`,
        midwayMastery: `Complete your first real ${narrative.character.role.split(' ')[1]} task`,
        finalVictory: `Receive the ${narrative.character.role} Excellence Certificate`,
        bonusChallenge: `Become a Certified ${narrative.character.role} Expert`
      },

      // Add immersive elements
      immersiveElements: {
        soundscape: this.getSoundscape(narrative.character.workplace),
        interactiveTools: this.getInteractiveTools(narrative.character.equipment),
        rewardVisuals: [
          'Animated badge ceremony',
          'Virtual trophy collection',
          'Progress constellation map',
          'Achievement gallery'
        ],
        celebrationMoments: [
          'Confetti burst on correct answers',
          'Companion dance celebration',
          'Unlock new career tools',
          'Parent notification of achievement'
        ]
      },

      // Add real-world applications for each subject
      realWorldApplications: this.generateRealWorldApplications(narrative, params)
    };

    return enhanced;
  }

  /**
   * Add parent-facing value propositions
   */
  private addParentValue(
    narrative: EnhancedMasterNarrative,
    params: DemonstrativeNarrativeParams
  ): EnhancedMasterNarrative {
    const career = narrative.character.role.replace('Junior ', '').replace(' Helper', '');

    return {
      ...narrative,
      parentValue: {
        realWorldConnection: `Your child learns ${params.gradeLevel} skills exactly how real ${career}s use them every day`,
        futureReadiness: `Building tomorrow's innovators through engaging lessons`,
        engagementPromise: `Learning disguised as adventure - they won't want to stop!`,
        differentiator: `Unlike traditional education, every minute connects to a real career, making learning meaningful and memorable`
      }
    };
  }

  /**
   * Add quality guarantees and trust builders
   */
  private addQualityGuarantees(narrative: EnhancedMasterNarrative): EnhancedMasterNarrative {
    return {
      ...narrative,

      qualityMarkers: {
        commonCoreAligned: true,
        stateStandardsMet: true,
        stemIntegrated: true,
        socialEmotionalLearning: true,
        assessmentRigor: 'Adaptive assessments that grow with your child',
        progressTracking: 'Real-time dashboard shows exactly what your child is learning'
      },

      parentInsights: {
        adaptiveNature: 'AI adjusts difficulty in real-time based on your child\'s responses',
        noFailureMode: 'Every wrong answer becomes a learning opportunity with gentle guidance',
        masteryTracking: 'Clear visualization of skill progression from novice to expert',
        dailyReports: 'Daily summary of achievements and areas of growth',
        weeklyProgress: 'Comprehensive report showing improvement trends and celebrations'
      },

      guarantees: {
        engagement: 'If your child isn\'t engaged within 5 minutes, we\'ll adapt the content',
        learning: 'Measurable skill improvement or your money back',
        satisfaction: '30-day full refund if you\'re not completely satisfied',
        support: '24/7 parent support and weekly check-ins with education specialists'
      }
    };
  }

  /**
   * Add personalization examples
   */
  private addPersonalizationExamples(
    narrative: EnhancedMasterNarrative,
    params: DemonstrativeNarrativeParams
  ): EnhancedMasterNarrative {
    const studentName = params.studentName;

    return {
      ...narrative,

      personalizationExamples: {
        withStudentName: [
          `"Great job, ${studentName}! You counted all 3 patients perfectly!"`,
          `"${studentName}, your ${narrative.character.role} skills are growing stronger!"`,
          `"The ${narrative.character.workplace} team is lucky to have ${studentName}!"`
        ],
        withInterests: [
          `"Since you love animals, let's count the therapy dogs in the hospital!"`,
          `"Your favorite color blue matches the ${narrative.character.role} uniform!"`,
          `"Just like in your favorite book, we're going on an adventure!"`
        ],
        withProgress: [
          `"Remember yesterday when you learned about shapes? Today we'll use them as a ${narrative.character.role}!"`,
          `"You've mastered counting to 3, now let's try counting to 5!"`,
          `"Your reading skills from earlier will help solve this puzzle!"`
        ],
        withLearningStyle: [
          `"Let's use visual cards since you learn best by seeing!"`,
          `"Time for hands-on practice - your favorite way to learn!"`,
          `"Let's sing the counting song you love!"`
        ]
      }
    };
  }

  /**
   * Add companion interaction examples
   */
  private addCompanionInteractions(
    narrative: EnhancedMasterNarrative,
    params: DemonstrativeNarrativeParams
  ): EnhancedMasterNarrative {
    const companion = params.sampleCompanion || 'Spark';

    return {
      ...narrative,

      companionInteractions: {
        greetings: [
          `"Hi ${params.studentName}! ${companion} here, ready for your ${narrative.character.role} adventure!"`,
          `"Welcome back, Junior ${narrative.character.role.split(' ')[1]}! Let's learn something amazing!"`,
          `"${companion} is so excited to explore with you!"`
        ],
        encouragement: [
          `"You're doing great! Real ${narrative.character.role}s started just like you!"`,
          `"That was close! Let's try again together!"`,
          `"I believe in you! You've got this!"`,
          `"Wow, you're thinking like a real ${narrative.character.role}!"`
        ],
        hints: [
          `"Hmm, let's count together: 1... 2... what comes next?"`,
          `"Look at the first letter - what sound does it make?"`,
          `"Remember what we learned about shapes earlier?"`,
          `"Think about how a ${narrative.character.role} would solve this!"`
        ],
        celebrations: [
          `"🎉 AMAZING! You did it! Dance party time!"`,
          `"WOW! You're becoming a real ${narrative.character.role}!"`,
          `"Incredible work! Your badge collection is growing!"`,
          `"You're a superstar! Let's tell your parents about this achievement!"`
        ],
        transitions: [
          `"Great work on Math! Now let's see how ${narrative.character.role}s use reading!"`,
          `"You've mastered the first mission! Ready for the next adventure?"`,
          `"One more subject and you'll complete this adventure!"`
        ]
      }
    };
  }

  /**
   * Generate real-world applications for each subject
   */
  private generateRealWorldApplications(
    narrative: MasterNarrative,
    params: DemonstrativeNarrativeParams
  ): Record<string, any> {
    const career = narrative.character.role.replace('Junior ', '').replace(' Helper', '');

    return {
      math: {
        immediate: `Count toys and snacks at home just like a ${career} counts supplies`,
        nearFuture: `Help with shopping by counting items and understanding prices`,
        longTerm: `Foundation for algebra, statistics, and data analysis`,
        careerConnection: `${career}s use math for ${this.getCareerMathUse(career)}`
      },
      ela: {
        immediate: `Read signs and labels just like a ${career} reads important information`,
        nearFuture: `Write notes and stories about your day`,
        longTerm: `Strong communication skills for any career`,
        careerConnection: `${career}s read and write ${this.getCareerELAUse(career)}`
      },
      science: {
        immediate: `Observe and sort objects by shape and size`,
        nearFuture: `Conduct simple experiments at home`,
        longTerm: `Scientific thinking for problem-solving`,
        careerConnection: `${career}s use science to ${this.getCareerScienceUse(career)}`
      },
      socialStudies: {
        immediate: `Understand family and classroom communities`,
        nearFuture: `Navigate neighborhood and understand community helpers`,
        longTerm: `Global awareness and cultural understanding`,
        careerConnection: `${career}s help build stronger communities by ${this.getCareerSocialUse(career)}`
      }
    };
  }

  // Helper methods for career-specific content
  private getSoundscape(workplace: string): string {
    const soundscapes: Record<string, string> = {
      'Medical': 'Gentle hospital sounds, helpful beeps, caring voices',
      'School': 'Happy children learning, bells, playground joy',
      'Kitchen': 'Sizzling pans, chopping sounds, kitchen timer',
      'Laboratory': 'Bubbling experiments, discovery sounds, eureka moments',
      'Studio': 'Creative music, brushstrokes, artistic inspiration'
    };

    for (const [key, value] of Object.entries(soundscapes)) {
      if (workplace.includes(key)) return value;
    }
    return 'Engaging ambient sounds that bring the career to life';
  }

  private getInteractiveTools(equipment: string[]): string[] {
    return equipment.map(tool => `Interactive ${tool} with realistic actions`);
  }

  private getCareerMathUse(career: string): string {
    const uses: Record<string, string> = {
      'Doctor': 'measuring medicine doses and tracking patient vital signs',
      'Chef': 'measuring ingredients and calculating cooking times',
      'Teacher': 'organizing lessons and tracking student progress',
      'Scientist': 'recording data and measuring experiment results',
      'Engineer': 'calculating dimensions and solving problems',
      'Artist': 'mixing paint ratios and planning compositions'
    };
    return uses[career] || 'calculations and measurements in their daily work';
  }

  private getCareerELAUse(career: string): string {
    const uses: Record<string, string> = {
      'Doctor': 'medical charts and communicate with patients',
      'Chef': 'recipes and create new menu descriptions',
      'Teacher': 'lesson plans and student feedback',
      'Scientist': 'research papers and lab reports',
      'Engineer': 'blueprints and technical documentation',
      'Artist': 'artist statements and gallery descriptions'
    };
    return uses[career] || 'important documents and communications';
  }

  private getCareerScienceUse(career: string): string {
    const uses: Record<string, string> = {
      'Doctor': 'understand how bodies work and heal',
      'Chef': 'understand how ingredients change when cooked',
      'Teacher': 'demonstrate scientific concepts to students',
      'Scientist': 'make discoveries and test hypotheses',
      'Engineer': 'understand forces and materials',
      'Artist': 'understand colors, textures, and materials'
    };
    return uses[career] || 'understand and improve their work';
  }

  private getCareerSocialUse(career: string): string {
    const uses: Record<string, string> = {
      'Doctor': 'healing and caring for community members',
      'Chef': 'bringing people together through food',
      'Teacher': 'educating the next generation',
      'Scientist': 'making discoveries that help everyone',
      'Engineer': 'building things that improve lives',
      'Artist': 'creating beauty and inspiration for all'
    };
    return uses[career] || 'serving and improving their community';
  }

  /**
   * Generate a quick demonstrative preview
   * Used for immediate parent viewing without full AI generation
   */
  async generateQuickDemonstrative(
    studentName: string,
    grade: string,
    skills: any
  ): Promise<EnhancedMasterNarrative> {
    const career = this.selectShowcaseCareer(grade);

    // Use enhanced mock data for immediate display
    const mockParams: DemonstrativeNarrativeParams = {
      studentName,
      gradeLevel: grade,
      career,
      companion: { name: 'Spark', personality: 'Energetic and enthusiastic' },
      subjects: ['math', 'ela', 'science', 'socialStudies'],
      showcaseMode: true,
      sampleCareer: career,
      sampleCompanion: 'Spark'
    };

    // For quick demo, use mock data with all enhancements
    const mockNarrative = this.getMockNarrative(mockParams);

    // Apply all showcase enhancements
    const enhanced = this.enhanceForShowcase(mockNarrative, mockParams);
    const withValue = this.addParentValue(enhanced, mockParams);
    const withGuarantees = this.addQualityGuarantees(withValue);
    const withPersonalization = this.addPersonalizationExamples(withGuarantees, mockParams);
    const final = this.addCompanionInteractions(withPersonalization, mockParams);

    return final;
  }
}

// Export singleton instance
export const demonstrativeNarrativeGenerator = new DemonstrativeMasterNarrativeGenerator();