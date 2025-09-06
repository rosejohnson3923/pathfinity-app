/**
 * SkillAdaptationService
 * 
 * Adapts the daily primary skill to different subjects while maintaining
 * the career context and learning objectives.
 */

import { Skill, Career, Subject, Grade } from '../../types';

/**
 * Skill adaptation for a specific subject
 */
export interface SkillAdaptation {
  originalSkill: Skill;
  subject: Subject;
  adaptedDescription: string;
  learningObjectives: string[];
  careerConnection: string;
  practiceContext: string;
  assessmentFocus: string;
  examples: AdaptationExample[];
  keywords: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Concrete example of skill application
 */
export interface AdaptationExample {
  scenario: string;
  application: string;
  outcome: string;
}

/**
 * Practice scenario for skill application
 */
export interface PracticeScenario {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  skill: string;
  career: string;
  steps: string[];
  expectedOutcome: string;
  hints: string[];
}

/**
 * Service for adapting skills across subjects
 */
export class SkillAdaptationService {
  private static instance: SkillAdaptationService;
  private adaptationCache: Map<string, SkillAdaptation> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): SkillAdaptationService {
    if (!SkillAdaptationService.instance) {
      SkillAdaptationService.instance = new SkillAdaptationService();
    }
    return SkillAdaptationService.instance;
  }

  /**
   * Main adaptation method
   */
  public adaptSkill(
    skill: Skill,
    subject: Subject,
    career: Career,
    grade: Grade
  ): SkillAdaptation {
    const cacheKey = `${skill.id}-${subject}-${career.id}-${grade}`;
    
    // Check cache
    if (this.adaptationCache.has(cacheKey)) {
      return this.adaptationCache.get(cacheKey)!;
    }

    // Generate adaptation based on subject
    let adaptation: SkillAdaptation;
    
    switch (subject) {
      case 'Math':
        adaptation = this.adaptSkillToMath(skill, career, grade);
        break;
      case 'ELA':
        adaptation = this.adaptSkillToELA(skill, career, grade);
        break;
      case 'Science':
        adaptation = this.adaptSkillToScience(skill, career, grade);
        break;
      case 'Social Studies':
        adaptation = this.adaptSkillToSocialStudies(skill, career, grade);
        break;
      default:
        adaptation = this.createGenericAdaptation(skill, subject, career, grade);
    }

    // Cache the adaptation
    this.adaptationCache.set(cacheKey, adaptation);
    
    return adaptation;
  }

  /**
   * Adapt skill to Math subject
   */
  public adaptSkillToMath(skill: Skill, career: Career, grade: Grade): SkillAdaptation {
    const mathApplications = this.getMathApplicationsForCareer(career);
    const gradeLevel = this.getGradeLevelComplexity(grade);

    return {
      originalSkill: skill,
      subject: 'Math',
      adaptedDescription: `Apply ${skill.name} to solve mathematical problems that ${career.title}s face daily`,
      learningObjectives: [
        `Use ${skill.name} to break down complex math problems`,
        `Apply mathematical reasoning in ${career.title} contexts`,
        `Connect numbers and patterns to real ${career.title} work`,
        `Develop computational thinking for ${career.title} tasks`
      ],
      careerConnection: `${career.title}s use math for ${mathApplications.join(', ')}`,
      practiceContext: `Solve math problems that a ${career.title} would encounter`,
      assessmentFocus: `Demonstrate ${skill.name} through mathematical problem-solving relevant to ${career.title}`,
      examples: this.generateMathExamples(skill, career, gradeLevel),
      keywords: ['calculate', 'solve', 'measure', 'analyze', 'compute', ...mathApplications],
      difficulty: gradeLevel.difficulty
    };
  }

  /**
   * Adapt skill to ELA subject
   */
  public adaptSkillToELA(skill: Skill, career: Career, grade: Grade): SkillAdaptation {
    const communicationNeeds = this.getELAApplicationsForCareer(career);
    const gradeLevel = this.getGradeLevelComplexity(grade);

    return {
      originalSkill: skill,
      subject: 'ELA',
      adaptedDescription: `Use ${skill.name} to communicate effectively like a ${career.title}`,
      learningObjectives: [
        `Apply ${skill.name} in written communication`,
        `Use ${skill.name} to organize thoughts clearly`,
        `Create compelling narratives using ${skill.name}`,
        `Document processes like a ${career.title}`
      ],
      careerConnection: `${career.title}s need strong communication for ${communicationNeeds.join(', ')}`,
      practiceContext: `Write and communicate like a professional ${career.title}`,
      assessmentFocus: `Show ${skill.name} through clear written and verbal communication`,
      examples: this.generateELAExamples(skill, career, gradeLevel),
      keywords: ['write', 'explain', 'describe', 'document', 'communicate', ...communicationNeeds],
      difficulty: gradeLevel.difficulty
    };
  }

  /**
   * Adapt skill to Science subject
   */
  public adaptSkillToScience(skill: Skill, career: Career, grade: Grade): SkillAdaptation {
    const scienceApplications = this.getScienceApplicationsForCareer(career);
    const gradeLevel = this.getGradeLevelComplexity(grade);

    return {
      originalSkill: skill,
      subject: 'Science',
      adaptedDescription: `Apply ${skill.name} to scientific challenges in ${career.title} work`,
      learningObjectives: [
        `Use ${skill.name} in scientific investigation`,
        `Apply the scientific method with ${skill.name}`,
        `Solve technical problems like a ${career.title}`,
        `Understand natural phenomena through ${skill.name}`
      ],
      careerConnection: `${career.title}s apply science in ${scienceApplications.join(', ')}`,
      practiceContext: `Explore scientific concepts that ${career.title}s use`,
      assessmentFocus: `Demonstrate ${skill.name} in scientific problem-solving`,
      examples: this.generateScienceExamples(skill, career, gradeLevel),
      keywords: ['experiment', 'observe', 'hypothesize', 'test', 'analyze', ...scienceApplications],
      difficulty: gradeLevel.difficulty
    };
  }

  /**
   * Adapt skill to Social Studies subject
   */
  public adaptSkillToSocialStudies(skill: Skill, career: Career, grade: Grade): SkillAdaptation {
    const socialApplications = this.getSocialStudiesApplicationsForCareer(career);
    const gradeLevel = this.getGradeLevelComplexity(grade);

    return {
      originalSkill: skill,
      subject: 'Social Studies',
      adaptedDescription: `Use ${skill.name} to understand how ${career.title}s impact society`,
      learningObjectives: [
        `Apply ${skill.name} to social challenges`,
        `Understand cultural diversity in ${career.title} work`,
        `Analyze historical context using ${skill.name}`,
        `Create inclusive solutions like a ${career.title}`
      ],
      careerConnection: `${career.title}s shape society through ${socialApplications.join(', ')}`,
      practiceContext: `Explore how ${career.title}s contribute to communities`,
      assessmentFocus: `Show ${skill.name} in understanding social impact`,
      examples: this.generateSocialStudiesExamples(skill, career, gradeLevel),
      keywords: ['culture', 'community', 'history', 'society', 'impact', ...socialApplications],
      difficulty: gradeLevel.difficulty
    };
  }

  /**
   * Validate that adaptation maintains learning objectives
   */
  public validateAdaptation(adaptation: SkillAdaptation): boolean {
    const checks = {
      hasOriginalSkill: !!adaptation.originalSkill,
      hasObjectives: adaptation.learningObjectives.length >= 3,
      hasCareerConnection: !!adaptation.careerConnection,
      hasExamples: adaptation.examples.length >= 2,
      maintainsSkillFocus: this.maintainsLearningObjective(
        adaptation.originalSkill,
        adaptation
      )
    };

    return Object.values(checks).every(check => check);
  }

  /**
   * Check if adaptation maintains original learning objective
   */
  public maintainsLearningObjective(
    original: Skill,
    adapted: SkillAdaptation
  ): boolean {
    // Check that core skill concepts are preserved
    const skillCore = original.name.toLowerCase();
    const adaptedContent = JSON.stringify(adapted).toLowerCase();
    
    return adaptedContent.includes(skillCore) && 
           adapted.learningObjectives.some(obj => 
             obj.toLowerCase().includes(skillCore)
           );
  }

  /**
   * Generate subject-specific context
   */
  public generateSubjectContext(
    skill: Skill,
    subject: Subject,
    career: Career
  ): string {
    const contexts = {
      'Math': `In this math lesson, you'll use ${skill.name} just like a ${career.title} does when working with numbers, patterns, and calculations.`,
      'ELA': `In this language arts lesson, you'll apply ${skill.name} to communicate clearly, just as ${career.title}s do in their professional writing.`,
      'Science': `In this science lesson, you'll use ${skill.name} to investigate and solve problems, similar to how ${career.title}s approach technical challenges.`,
      'Social Studies': `In this social studies lesson, you'll apply ${skill.name} to understand how ${career.title}s contribute to and shape our communities.`
    };

    return contexts[subject] || `Apply ${skill.name} in ${subject} like a ${career.title}`;
  }

  /**
   * Generate practice scenarios
   */
  public generatePracticeScenarios(
    adaptation: SkillAdaptation,
    career: Career,
    count: number = 3
  ): PracticeScenario[] {
    const scenarios: PracticeScenario[] = [];
    
    for (let i = 0; i < count; i++) {
      scenarios.push(this.createPracticeScenario(
        adaptation,
        career,
        i
      ));
    }

    return scenarios;
  }

  /**
   * Create a single practice scenario
   */
  private createPracticeScenario(
    adaptation: SkillAdaptation,
    career: Career,
    index: number
  ): PracticeScenario {
    const scenarioTemplates = this.getScenarioTemplates(adaptation.subject);
    const template = scenarioTemplates[index % scenarioTemplates.length];

    return {
      id: `scenario-${adaptation.subject}-${index}`,
      title: template.title.replace('{skill}', adaptation.originalSkill.name)
                          .replace('{career}', career.title),
      description: template.description.replace('{skill}', adaptation.originalSkill.name)
                                      .replace('{career}', career.title),
      subject: adaptation.subject,
      skill: adaptation.originalSkill.name,
      career: career.title,
      steps: template.steps.map(step => 
        step.replace('{skill}', adaptation.originalSkill.name)
            .replace('{career}', career.title)
      ),
      expectedOutcome: template.outcome.replace('{skill}', adaptation.originalSkill.name)
                                       .replace('{career}', career.title),
      hints: template.hints
    };
  }

  /**
   * Get scenario templates for subject
   */
  private getScenarioTemplates(subject: Subject): any[] {
    const templates = {
      'Math': [
        {
          title: '{career} Budget Challenge',
          description: 'Use {skill} to manage a {career} project budget',
          steps: [
            'Identify all project costs',
            'Apply {skill} to prioritize expenses',
            'Calculate total budget needed',
            'Find ways to optimize costs'
          ],
          outcome: 'Successfully managed budget using {skill}',
          hints: ['Break down the problem', 'Consider all factors', 'Check your work']
        }
      ],
      'ELA': [
        {
          title: '{career} Documentation Task',
          description: 'Use {skill} to write clear documentation',
          steps: [
            'Understand the audience',
            'Apply {skill} to organize information',
            'Write clear instructions',
            'Review and refine'
          ],
          outcome: 'Created professional documentation using {skill}',
          hints: ['Think about structure', 'Use clear language', 'Include examples']
        }
      ],
      'Science': [
        {
          title: '{career} Technical Problem',
          description: 'Use {skill} to solve a technical challenge',
          steps: [
            'Identify the problem',
            'Apply {skill} to form hypothesis',
            'Test your solution',
            'Analyze results'
          ],
          outcome: 'Solved technical problem using {skill}',
          hints: ['Use scientific method', 'Test systematically', 'Document findings']
        }
      ],
      'Social Studies': [
        {
          title: '{career} Community Project',
          description: 'Use {skill} to design a community solution',
          steps: [
            'Identify community need',
            'Apply {skill} to design solution',
            'Consider cultural factors',
            'Plan implementation'
          ],
          outcome: 'Created inclusive solution using {skill}',
          hints: ['Consider all stakeholders', 'Think about impact', 'Be inclusive']
        }
      ]
    };

    return templates[subject] || [];
  }

  /**
   * Get math applications for career
   */
  private getMathApplicationsForCareer(career: Career): string[] {
    const careerMathMap: Record<string, string[]> = {
      'game-developer': ['calculating physics', 'scoring systems', 'algorithm optimization', 'geometry for graphics'],
      'chef': ['measuring ingredients', 'scaling recipes', 'calculating costs', 'timing coordination'],
      'architect': ['measuring spaces', 'calculating materials', 'geometric design', 'structural calculations'],
      'musician': ['rhythm patterns', 'time signatures', 'frequency calculations', 'audio engineering'],
      'athlete': ['statistics tracking', 'performance metrics', 'angle calculations', 'speed and distance'],
      'scientist': ['data analysis', 'measurements', 'statistical modeling', 'formula applications'],
      'artist': ['proportions', 'color mixing ratios', 'perspective geometry', 'pattern creation'],
      'veterinarian': ['dosage calculations', 'growth charts', 'statistical analysis', 'measurement conversions']
    };

    return careerMathMap[career.id] || ['calculations', 'measurements', 'problem-solving'];
  }

  /**
   * Get ELA applications for career
   */
  private getELAApplicationsForCareer(career: Career): string[] {
    const careerELAMap: Record<string, string[]> = {
      'game-developer': ['writing game stories', 'documentation', 'user guides', 'team communication'],
      'chef': ['writing recipes', 'menu descriptions', 'food blogs', 'customer communication'],
      'architect': ['project proposals', 'design documentation', 'client presentations', 'technical writing'],
      'musician': ['writing lyrics', 'artist statements', 'concert programs', 'fan communication'],
      'athlete': ['sports journalism', 'training logs', 'motivational speaking', 'team communication'],
      'scientist': ['research papers', 'lab reports', 'grant proposals', 'science communication'],
      'artist': ['artist statements', 'exhibition descriptions', 'creative writing', 'art criticism'],
      'veterinarian': ['medical records', 'client education', 'research reports', 'care instructions']
    };

    return careerELAMap[career.id] || ['writing', 'communication', 'documentation'];
  }

  /**
   * Get science applications for career
   */
  private getScienceApplicationsForCareer(career: Career): string[] {
    const careerScienceMap: Record<string, string[]> = {
      'game-developer': ['physics engines', 'graphics rendering', 'optimization', 'user research'],
      'chef': ['food chemistry', 'nutrition science', 'fermentation', 'temperature control'],
      'architect': ['materials science', 'environmental design', 'structural physics', 'sustainability'],
      'musician': ['sound physics', 'acoustics', 'audio engineering', 'hearing science'],
      'athlete': ['sports physiology', 'biomechanics', 'nutrition science', 'recovery science'],
      'scientist': ['research methods', 'experimentation', 'data analysis', 'hypothesis testing'],
      'artist': ['color theory', 'material properties', 'light physics', 'chemical reactions'],
      'veterinarian': ['animal biology', 'medical science', 'pharmacology', 'diagnostic methods']
    };

    return careerScienceMap[career.id] || ['investigation', 'experimentation', 'analysis'];
  }

  /**
   * Get social studies applications for career
   */
  private getSocialStudiesApplicationsForCareer(career: Career): string[] {
    const careerSocialMap: Record<string, string[]> = {
      'game-developer': ['cultural representation', 'social gaming', 'community building', 'global markets'],
      'chef': ['food culture', 'culinary history', 'global cuisines', 'community dining'],
      'architect': ['urban planning', 'cultural design', 'historical preservation', 'community spaces'],
      'musician': ['music history', 'cultural expression', 'social movements', 'global influences'],
      'athlete': ['sports history', 'cultural impact', 'team dynamics', 'community role models'],
      'scientist': ['science history', 'ethical considerations', 'global collaboration', 'social impact'],
      'artist': ['art history', 'cultural movements', 'social commentary', 'community engagement'],
      'veterinarian': ['animal welfare', 'environmental conservation', 'community health', 'cultural practices']
    };

    return careerSocialMap[career.id] || ['cultural understanding', 'community impact', 'history'];
  }

  /**
   * Get grade-level complexity
   */
  private getGradeLevelComplexity(grade: Grade): { difficulty: 'easy' | 'medium' | 'hard', depth: number } {
    const complexityMap: Record<string, { difficulty: 'easy' | 'medium' | 'hard', depth: number }> = {
      'K': { difficulty: 'easy', depth: 1 },
      '1': { difficulty: 'easy', depth: 1 },
      '2': { difficulty: 'easy', depth: 2 },
      '3': { difficulty: 'medium', depth: 2 },
      '4': { difficulty: 'medium', depth: 3 },
      '5': { difficulty: 'medium', depth: 3 },
      '6': { difficulty: 'hard', depth: 4 },
      '7': { difficulty: 'hard', depth: 4 },
      '8': { difficulty: 'hard', depth: 5 }
    };

    return complexityMap[grade] || { difficulty: 'medium', depth: 3 };
  }

  /**
   * Generate math examples
   */
  private generateMathExamples(
    skill: Skill,
    career: Career,
    gradeLevel: any
  ): AdaptationExample[] {
    return [
      {
        scenario: `A ${career.title} needs to calculate project costs`,
        application: `Use ${skill.name} to break down the budget into parts`,
        outcome: `Accurate budget that helps complete the project`
      },
      {
        scenario: `Solving a technical problem in ${career.title} work`,
        application: `Apply ${skill.name} to find the mathematical solution`,
        outcome: `Problem solved efficiently using math skills`
      }
    ];
  }

  /**
   * Generate ELA examples
   */
  private generateELAExamples(
    skill: Skill,
    career: Career,
    gradeLevel: any
  ): AdaptationExample[] {
    return [
      {
        scenario: `A ${career.title} needs to explain their work`,
        application: `Use ${skill.name} to organize and present ideas clearly`,
        outcome: `Clear communication that others understand`
      },
      {
        scenario: `Writing documentation for a ${career.title} project`,
        application: `Apply ${skill.name} to structure information logically`,
        outcome: `Professional documentation that helps others`
      }
    ];
  }

  /**
   * Generate science examples
   */
  private generateScienceExamples(
    skill: Skill,
    career: Career,
    gradeLevel: any
  ): AdaptationExample[] {
    return [
      {
        scenario: `A ${career.title} encounters a technical challenge`,
        application: `Use ${skill.name} with scientific method to find solution`,
        outcome: `Evidence-based solution that works`
      },
      {
        scenario: `Testing a new approach in ${career.title} work`,
        application: `Apply ${skill.name} to design and run experiments`,
        outcome: `Data-driven insights for improvement`
      }
    ];
  }

  /**
   * Generate social studies examples
   */
  private generateSocialStudiesExamples(
    skill: Skill,
    career: Career,
    gradeLevel: any
  ): AdaptationExample[] {
    return [
      {
        scenario: `A ${career.title} working with diverse communities`,
        application: `Use ${skill.name} to understand different perspectives`,
        outcome: `Inclusive solutions that benefit everyone`
      },
      {
        scenario: `Understanding the impact of ${career.title} on society`,
        application: `Apply ${skill.name} to analyze social effects`,
        outcome: `Awareness of how work affects communities`
      }
    ];
  }

  /**
   * Create generic adaptation for unmapped subjects
   */
  private createGenericAdaptation(
    skill: Skill,
    subject: Subject,
    career: Career,
    grade: Grade
  ): SkillAdaptation {
    return {
      originalSkill: skill,
      subject,
      adaptedDescription: `Apply ${skill.name} in ${subject} like a ${career.title}`,
      learningObjectives: [
        `Use ${skill.name} in ${subject} contexts`,
        `Connect ${subject} to ${career.title} work`,
        `Develop ${skill.name} through ${subject} practice`
      ],
      careerConnection: `${career.title}s use ${subject} skills daily`,
      practiceContext: `Practice ${skill.name} in ${subject}`,
      assessmentFocus: `Demonstrate ${skill.name} mastery in ${subject}`,
      examples: [],
      keywords: [
        skill.name?.toLowerCase() || '', 
        career.title?.toLowerCase() || '', 
        subject?.toLowerCase() || ''
      ].filter(k => k),
      difficulty: 'medium'
    };
  }
}

// Export singleton instance getter
export const getSkillAdaptationService = () => SkillAdaptationService.getInstance();