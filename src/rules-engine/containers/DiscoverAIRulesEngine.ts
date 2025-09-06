/**
 * Discover AI Rules Engine
 * Manages rules for the Discover container including exploration,
 * self-directed learning, curiosity-driven activities, and research projects
 */

import { BaseRulesEngine, Rule, RuleContext, RuleResult } from '../core/BaseRulesEngine';

// ============================================================================
// DISCOVER CONTEXT DEFINITIONS
// ============================================================================

export interface DiscoverContext extends RuleContext {
  student: {
    id: string;
    grade: string;
    interests?: string[];
    curiosityLevel?: 'low' | 'medium' | 'high';
    explorationStyle?: 'guided' | 'semi-guided' | 'independent';
    priorKnowledge?: Map<string, number>; // topic -> proficiency
  };
  exploration: {
    type: 'research' | 'investigation' | 'creative' | 'experimental' | 'collaborative';
    topic: string;
    depth: 'surface' | 'intermediate' | 'deep';
    resources?: string[];
    duration?: number;
  };
  career?: {
    id: string;
    name: string;
  };
  companion?: {
    id: string;
    name: string;
  };
  theme?: 'light' | 'dark';
  discovery?: {
    findings: string[];
    connections: string[];
    questions: string[];
    hypotheses: string[];
  };
  collaboration?: {
    mode: 'solo' | 'pair' | 'group';
    role?: string;
    peers?: string[];
  };
}

export interface ExplorationRules {
  pathways: Map<string, ExplorationPathway>;
  scaffolding: ScaffoldingRules;
  curiosity: CuriosityRules;
  boundaries: BoundaryRules;
}

export interface ExplorationPathway {
  id: string;
  name: string;
  startingPoint: string;
  branches: PathwayBranch[];
  endGoals: string[];
  estimatedTime: number;
}

export interface PathwayBranch {
  id: string;
  topic: string;
  prerequisities: string[];
  resources: string[];
  activities: string[];
  nextBranches: string[];
}

export interface ScaffoldingRules {
  level: 'minimal' | 'moderate' | 'extensive';
  hints: boolean;
  checkpoints: boolean;
  guidance: GuidanceLevel;
  feedback: 'on-demand' | 'periodic' | 'continuous';
}

export interface GuidanceLevel {
  navigation: boolean;
  suggestions: boolean;
  warnings: boolean;
  confirmations: boolean;
}

export interface CuriosityRules {
  triggers: CuriosityTrigger[];
  rewards: CuriosityReward[];
  tracking: CuriosityTracking;
}

export interface CuriosityTrigger {
  type: 'question' | 'exploration' | 'connection' | 'hypothesis';
  condition: string;
  action: string;
  points: number;
}

export interface CuriosityReward {
  type: 'unlock' | 'badge' | 'resource' | 'recognition';
  trigger: string;
  value: any;
}

export interface CuriosityTracking {
  questionsAsked: number;
  topicsExplored: Set<string>;
  connectionsM<br>: number;
  depthReached: Map<string, number>;
}

export interface BoundaryRules {
  contentFiltering: boolean;
  ageAppropriate: boolean;
  timeLimit?: number;
  topicRestrictions?: string[];
  safeSearch: boolean;
}

export interface ResearchRules {
  methodology: ResearchMethodology;
  documentation: DocumentationRules;
  validation: ValidationRules;
  presentation: PresentationRules;
}

export interface ResearchMethodology {
  steps: string[];
  tools: string[];
  dataCollection: boolean;
  analysis: boolean;
  peerReview: boolean;
}

export interface DocumentationRules {
  required: string[];
  format: 'journal' | 'report' | 'presentation' | 'portfolio';
  citations: boolean;
  reflection: boolean;
}

export interface ValidationRules {
  factChecking: boolean;
  sourceVerification: boolean;
  peerValidation: boolean;
  expertReview: boolean;
}

export interface PresentationRules {
  formats: string[];
  audience: 'peers' | 'teacher' | 'parents' | 'public';
  interactive: boolean;
  multimedia: boolean;
}

export interface CreativityRules {
  openEnded: boolean;
  constraints: CreativeConstraint[];
  inspiration: InspirationSource[];
  evaluation: CreativeEvaluation;
}

export interface CreativeConstraint {
  type: 'time' | 'resources' | 'theme' | 'format';
  value: any;
  flexible: boolean;
}

export interface InspirationSource {
  type: 'examples' | 'prompts' | 'challenges' | 'collaborations';
  content: string[];
  frequency: 'always' | 'sometimes' | 'on-request';
}

export interface CreativeEvaluation {
  criteria: string[];
  selfAssessment: boolean;
  peerFeedback: boolean;
  showcasing: boolean;
}

// ============================================================================
// DISCOVER AI RULES ENGINE
// ============================================================================

export class DiscoverAIRulesEngine extends BaseRulesEngine<DiscoverContext> {
  private explorationRules: ExplorationRules;
  private researchRules: ResearchRules;
  private creativityRules: CreativityRules;
  private studentJourneys: Map<string, StudentJourney> = new Map();

  constructor() {
    super('DiscoverAIRulesEngine', {
      name: 'Discover AI Rules Engine',
      description: 'Manages exploration and discovery-based learning rules'
    });
    
    this.explorationRules = this.initializeExplorationRules();
    this.researchRules = this.initializeResearchRules();
    this.creativityRules = this.initializeCreativityRules();
  }

  /**
   * Register discover-specific rules
   */
  protected registerRules(): void {
    // Rule: Initialize exploration pathway
    this.addRuleInternal({
      id: 'init_pathway',
      name: 'Initialize Exploration Pathway',
      priority: 1,
      condition: (context) => !!context.exploration,
      action: (context) => this.initializePathway(context)
    });

    // Rule: Apply scaffolding
    this.addRuleInternal({
      id: 'apply_scaffolding',
      name: 'Apply Learning Scaffolding',
      priority: 2,
      condition: (context) => !!context.student.explorationStyle,
      action: (context) => this.applyScaffolding(context)
    });

    // Rule: Track curiosity
    this.addRuleInternal({
      id: 'track_curiosity',
      name: 'Track Curiosity Metrics',
      priority: 3,
      condition: (context) => !!context.discovery,
      action: (context) => this.trackCuriosity(context)
    });

    // Rule: Enforce boundaries
    this.addRuleInternal({
      id: 'enforce_boundaries',
      name: 'Enforce Safety Boundaries',
      priority: 4,
      condition: (context) => true,
      action: (context) => this.enforceBoundaries(context)
    });

    // Rule: Guide research
    this.addRuleInternal({
      id: 'guide_research',
      name: 'Guide Research Process',
      priority: 5,
      condition: (context) => context.exploration.type === 'research',
      action: (context) => this.guideResearch(context)
    });

    // Rule: Foster creativity
    this.addRuleInternal({
      id: 'foster_creativity',
      name: 'Foster Creative Exploration',
      priority: 6,
      condition: (context) => context.exploration.type === 'creative',
      action: (context) => this.fosterCreativity(context)
    });

    // Rule: Facilitate collaboration
    this.addRuleInternal({
      id: 'facilitate_collaboration',
      name: 'Facilitate Collaborative Discovery',
      priority: 7,
      condition: (context) => context.collaboration && context.collaboration.mode !== 'solo',
      action: (context) => this.facilitateCollaboration(context)
    });

    // Rule: Apply career context
    this.addRuleInternal({
      id: 'career_exploration',
      name: 'Apply Career Exploration Context',
      priority: 8,
      condition: (context) => !!context.career,
      action: (context) => this.applyCareerExploration(context)
    });

    // Rule: Generate recommendations
    this.addRuleInternal({
      id: 'generate_recommendations',
      name: 'Generate Next Steps',
      priority: 9,
      condition: (context) => !!context.discovery,
      action: (context) => this.generateRecommendations(context)
    });

    // Rule: Document discoveries
    this.addRuleInternal({
      id: 'document_discoveries',
      name: 'Document Learning Discoveries',
      priority: 10,
      condition: (context) => context.discovery && context.discovery.findings.length > 0,
      action: (context) => this.documentDiscoveries(context)
    });
  }

  /**
   * Initialize exploration rules
   */
  private initializeExplorationRules(): ExplorationRules {
    const pathways = new Map<string, ExplorationPathway>();
    
    // Science exploration pathway
    pathways.set('science', {
      id: 'science',
      name: 'Scientific Discovery',
      startingPoint: 'observation',
      branches: [
        {
          id: 'observation',
          topic: 'Making Observations',
          prerequisities: [],
          resources: ['microscope', 'notebook', 'camera'],
          activities: ['observe_nature', 'record_data', 'identify_patterns'],
          nextBranches: ['hypothesis', 'experimentation']
        },
        {
          id: 'hypothesis',
          topic: 'Forming Hypotheses',
          prerequisities: ['observation'],
          resources: ['research_papers', 'data_sets'],
          activities: ['create_hypothesis', 'research_background'],
          nextBranches: ['experimentation', 'analysis']
        },
        {
          id: 'experimentation',
          topic: 'Conducting Experiments',
          prerequisities: ['hypothesis'],
          resources: ['lab_equipment', 'simulation_tools'],
          activities: ['design_experiment', 'collect_data', 'control_variables'],
          nextBranches: ['analysis', 'conclusion']
        }
      ],
      endGoals: ['scientific_paper', 'presentation', 'discovery'],
      estimatedTime: 3600 // 1 hour
    });

    // History exploration pathway
    pathways.set('history', {
      id: 'history',
      name: 'Historical Investigation',
      startingPoint: 'timeline',
      branches: [
        {
          id: 'timeline',
          topic: 'Understanding Timeline',
          prerequisities: [],
          resources: ['historical_maps', 'documents', 'artifacts'],
          activities: ['create_timeline', 'identify_events', 'find_connections'],
          nextBranches: ['causes', 'effects']
        },
        {
          id: 'causes',
          topic: 'Investigating Causes',
          prerequisities: ['timeline'],
          resources: ['primary_sources', 'expert_interviews'],
          activities: ['analyze_causes', 'compare_perspectives'],
          nextBranches: ['effects', 'significance']
        }
      ],
      endGoals: ['historical_report', 'documentary', 'exhibition'],
      estimatedTime: 2400 // 40 minutes
    });

    const scaffolding: ScaffoldingRules = {
      level: 'moderate',
      hints: true,
      checkpoints: true,
      guidance: {
        navigation: true,
        suggestions: true,
        warnings: true,
        confirmations: false
      },
      feedback: 'periodic'
    };

    const curiosity: CuriosityRules = {
      triggers: [
        {
          type: 'question',
          condition: 'asks_why',
          action: 'reward_curiosity',
          points: 5
        },
        {
          type: 'exploration',
          condition: 'explores_new_topic',
          action: 'unlock_resource',
          points: 10
        },
        {
          type: 'connection',
          condition: 'connects_concepts',
          action: 'bonus_points',
          points: 15
        },
        {
          type: 'hypothesis',
          condition: 'forms_hypothesis',
          action: 'unlock_experiment',
          points: 20
        }
      ],
      rewards: [
        {
          type: 'unlock',
          trigger: 'exploration_milestone',
          value: 'advanced_tools'
        },
        {
          type: 'badge',
          trigger: 'curiosity_streak',
          value: 'curious_mind'
        },
        {
          type: 'resource',
          trigger: 'deep_dive',
          value: 'expert_content'
        }
      ],
      tracking: {
        questionsAsked: 0,
        topicsExplored: new Set(),
        connectionsMade: 0,
        depthReached: new Map()
      }
    };

    const boundaries: BoundaryRules = {
      contentFiltering: true,
      ageAppropriate: true,
      timeLimit: 3600, // 1 hour default
      topicRestrictions: [],
      safeSearch: true
    };

    return {
      pathways,
      scaffolding,
      curiosity,
      boundaries
    };
  }

  /**
   * Initialize research rules
   */
  private initializeResearchRules(): ResearchRules {
    return {
      methodology: {
        steps: [
          'define_question',
          'gather_information',
          'form_hypothesis',
          'test_hypothesis',
          'analyze_results',
          'draw_conclusions'
        ],
        tools: ['search_engine', 'notebook', 'citation_manager', 'data_analyzer'],
        dataCollection: true,
        analysis: true,
        peerReview: true
      },
      documentation: {
        required: ['research_question', 'sources', 'findings', 'conclusion'],
        format: 'journal',
        citations: true,
        reflection: true
      },
      validation: {
        factChecking: true,
        sourceVerification: true,
        peerValidation: true,
        expertReview: false
      },
      presentation: {
        formats: ['written_report', 'oral_presentation', 'poster', 'video'],
        audience: 'peers',
        interactive: true,
        multimedia: true
      }
    };
  }

  /**
   * Initialize creativity rules
   */
  private initializeCreativityRules(): CreativityRules {
    return {
      openEnded: true,
      constraints: [
        {
          type: 'time',
          value: 1800, // 30 minutes
          flexible: true
        },
        {
          type: 'theme',
          value: 'innovation',
          flexible: true
        }
      ],
      inspiration: [
        {
          type: 'examples',
          content: ['famous_discoveries', 'student_projects', 'real_world_applications'],
          frequency: 'sometimes'
        },
        {
          type: 'prompts',
          content: ['what_if_questions', 'creative_challenges', 'design_problems'],
          frequency: 'always'
        },
        {
          type: 'collaborations',
          content: ['peer_brainstorming', 'expert_mentorship'],
          frequency: 'on-request'
        }
      ],
      evaluation: {
        criteria: ['originality', 'effort', 'presentation', 'impact'],
        selfAssessment: true,
        peerFeedback: true,
        showcasing: true
      }
    };
  }

  // Rule action methods

  private initializePathway(context: DiscoverContext): RuleResult {
    const { exploration } = context;
    const pathway = this.explorationRules.pathways.get(exploration.topic) || 
                   this.createCustomPathway(exploration);

    const journey = this.getOrCreateJourney(context.student.id);
    journey.currentPathway = pathway;
    journey.currentBranch = pathway.startingPoint;

    return {
      success: true,
      data: {
        pathway: pathway.name,
        startingPoint: pathway.startingPoint,
        estimatedTime: pathway.estimatedTime,
        branches: pathway.branches.length
      }
    };
  }

  private applyScaffolding(context: DiscoverContext): RuleResult {
    const { explorationStyle } = context.student;
    const scaffolding = { ...this.explorationRules.scaffolding };

    switch (explorationStyle) {
      case 'guided':
        scaffolding.level = 'extensive';
        scaffolding.hints = true;
        scaffolding.checkpoints = true;
        scaffolding.feedback = 'continuous';
        scaffolding.guidance = {
          navigation: true,
          suggestions: true,
          warnings: true,
          confirmations: true
        };
        break;

      case 'semi-guided':
        scaffolding.level = 'moderate';
        scaffolding.hints = true;
        scaffolding.checkpoints = true;
        scaffolding.feedback = 'periodic';
        break;

      case 'independent':
        scaffolding.level = 'minimal';
        scaffolding.hints = false;
        scaffolding.checkpoints = false;
        scaffolding.feedback = 'on-demand';
        scaffolding.guidance = {
          navigation: false,
          suggestions: false,
          warnings: true,
          confirmations: false
        };
        break;
    }

    // Adjust for grade level
    const gradeNum = context.student.grade_level === 'K' ? 0 : parseInt(context.student.grade_level);
    if (gradeNum <= 2) {
      scaffolding.level = 'extensive';
      scaffolding.hints = true;
    }

    return {
      success: true,
      data: {
        scaffolding,
        style: explorationStyle,
        applied: true
      }
    };
  }

  private trackCuriosity(context: DiscoverContext): RuleResult {
    const { discovery } = context;
    if (!discovery) {
      return { success: false, error: 'No discovery data' };
    }

    const journey = this.getOrCreateJourney(context.student.id);
    const tracking = journey.curiosityTracking;

    // Update tracking
    tracking.questionsAsked += discovery.questions.length;
    discovery.findings.forEach(f => tracking.topicsExplored.add(f));
    tracking.connectionsMade += discovery.connections.length;

    // Calculate curiosity score
    const curiosityScore = 
      tracking.questionsAsked * 5 +
      tracking.topicsExplored.size * 10 +
      tracking.connectionsMade * 15;

    // Check for triggers and rewards
    const triggeredRewards: any[] = [];
    
    this.explorationRules.curiosity.triggers.forEach(trigger => {
      let triggered = false;
      
      switch (trigger.type) {
        case 'question':
          triggered = discovery.questions.length > 0;
          break;
        case 'connection':
          triggered = discovery.connections.length > 0;
          break;
        case 'hypothesis':
          triggered = discovery.hypotheses.length > 0;
          break;
      }
      
      if (triggered) {
        triggeredRewards.push({
          type: trigger.type,
          points: trigger.points,
          action: trigger.action
        });
      }
    });

    return {
      success: true,
      data: {
        curiosityScore,
        questionsAsked: tracking.questionsAsked,
        topicsExplored: tracking.topicsExplored.size,
        connectionsMade: tracking.connectionsMade,
        rewards: triggeredRewards
      }
    };
  }

  private enforceBoundaries(context: DiscoverContext): RuleResult {
    const boundaries = { ...this.explorationRules.boundaries };
    const { grade } = context.student;
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);

    // Age-appropriate adjustments
    if (gradeNum <= 2) {
      boundaries.contentFiltering = true;
      boundaries.timeLimit = 1200; // 20 minutes
      boundaries.safeSearch = true;
    } else if (gradeNum <= 5) {
      boundaries.contentFiltering = true;
      boundaries.timeLimit = 2400; // 40 minutes
      boundaries.safeSearch = true;
    } else {
      boundaries.timeLimit = 3600; // 1 hour
    }

    // Check exploration against boundaries
    const violations: string[] = [];
    
    if (context.exploration.duration && context.exploration.duration > boundaries.timeLimit!) {
      violations.push('Time limit exceeded');
    }

    if (boundaries.topicRestrictions && boundaries.topicRestrictions.length > 0) {
      if (boundaries.topicRestrictions.includes(context.exploration.topic)) {
        violations.push('Restricted topic');
      }
    }

    return {
      success: violations.length === 0,
      warnings: violations.length > 0 ? violations : undefined,
      data: {
        boundaries,
        safe: violations.length === 0
      }
    };
  }

  private guideResearch(context: DiscoverContext): RuleResult {
    const methodology = this.researchRules.methodology;
    const journey = this.getOrCreateJourney(context.student.id);

    // Determine current step
    let currentStep = journey.researchStep || 0;
    const currentStepName = methodology.steps[currentStep];

    // Provide guidance based on step
    const guidance: any = {
      step: currentStepName,
      nextStep: methodology.steps[currentStep + 1],
      tools: methodology.tools,
      progress: ((currentStep + 1) / methodology.steps.length) * 100
    };

    // Step-specific guidance
    switch (currentStepName) {
      case 'define_question':
        guidance.prompts = [
          'What do you want to know?',
          'Why is this important?',
          'How will you find answers?'
        ];
        break;
      
      case 'gather_information':
        guidance.prompts = [
          'What sources will you use?',
          'How will you verify information?',
          'Are sources reliable?'
        ];
        break;
      
      case 'analyze_results':
        guidance.prompts = [
          'What patterns do you see?',
          'What do the results mean?',
          'Are there alternative explanations?'
        ];
        break;
    }

    // Update journey
    if (context.discovery && context.discovery.findings.length > 0) {
      journey.researchStep = Math.min(currentStep + 1, methodology.steps.length - 1);
    }

    return {
      success: true,
      data: guidance
    };
  }

  private fosterCreativity(context: DiscoverContext): RuleResult {
    const creativity = this.creativityRules;
    const inspiration: any[] = [];

    // Provide inspiration based on settings
    creativity.inspiration.forEach(source => {
      if (source.frequency === 'always' || 
          (source.frequency === 'sometimes' && Math.random() > 0.5)) {
        inspiration.push({
          type: source.type,
          content: source.content[Math.floor(Math.random() * source.content.length)]
        });
      }
    });

    // Apply constraints creatively
    const activeConstraints = creativity.constraints.filter(c => !c.flexible || Math.random() > 0.3);

    return {
      success: true,
      data: {
        openEnded: creativity.openEnded,
        inspiration,
        constraints: activeConstraints,
        evaluationCriteria: creativity.evaluation.criteria
      }
    };
  }

  private facilitateCollaboration(context: DiscoverContext): RuleResult {
    const { collaboration } = context;
    if (!collaboration) {
      return { success: false, error: 'No collaboration data' };
    }

    const facilitation: any = {
      mode: collaboration.mode,
      role: collaboration.role
    };

    // Mode-specific facilitation
    switch (collaboration.mode) {
      case 'pair':
        facilitation.structure = 'think-pair-share';
        facilitation.roles = ['researcher', 'recorder'];
        facilitation.communication = 'synchronous';
        break;
      
      case 'group':
        facilitation.structure = 'jigsaw';
        facilitation.roles = ['leader', 'researcher', 'presenter', 'timekeeper'];
        facilitation.communication = 'mixed';
        facilitation.coordination = 'required';
        break;
    }

    // Grade-appropriate collaboration
    const gradeNum = context.student.grade_level === 'K' ? 0 : parseInt(context.student.grade_level);
    if (gradeNum <= 2) {
      facilitation.support = 'high';
      facilitation.structure = 'simple-pairs';
    } else if (gradeNum <= 5) {
      facilitation.support = 'moderate';
    } else {
      facilitation.support = 'minimal';
    }

    return {
      success: true,
      data: facilitation
    };
  }

  private applyCareerExploration(context: DiscoverContext): RuleResult {
    if (!context.career) {
      return { success: false, error: 'No career context' };
    }

    const careerExplorations: Record<string, any> = {
      'Scientist': {
        pathways: ['scientific_method', 'lab_investigation', 'field_research'],
        tools: ['microscope', 'data_logger', 'analysis_software'],
        realWorldConnections: ['current_research', 'nobel_prizes', 'breakthroughs'],
        expertInterviews: true,
        virtualLabs: true
      },
      'Historian': {
        pathways: ['primary_sources', 'archaeological_dig', 'oral_history'],
        tools: ['archive_access', 'timeline_creator', 'mapping_tools'],
        realWorldConnections: ['museums', 'historical_sites', 'documentaries'],
        expertInterviews: true,
        virtualTours: true
      },
      'Engineer': {
        pathways: ['design_thinking', 'prototyping', 'testing_iteration'],
        tools: ['cad_software', '3d_printer', 'simulation_tools'],
        realWorldConnections: ['bridges', 'robotics', 'space_exploration'],
        expertInterviews: true,
        makerSpace: true
      },
      'Artist': {
        pathways: ['creative_process', 'art_history', 'technique_exploration'],
        tools: ['digital_canvas', 'color_mixer', 'portfolio_builder'],
        realWorldConnections: ['galleries', 'art_movements', 'contemporary_artists'],
        expertInterviews: true,
        virtualStudios: true
      },
      'Writer': {
        pathways: ['story_development', 'research_writing', 'journalism'],
        tools: ['word_processor', 'idea_mapper', 'publishing_platform'],
        realWorldConnections: ['authors', 'newspapers', 'literary_magazines'],
        expertInterviews: true,
        writingWorkshops: true
      }
      // Add more careers as needed
    };

    const exploration = careerExplorations[context.career.name] || careerExplorations['Scientist'];

    return {
      success: true,
      data: {
        career: context.career.name,
        exploration,
        integrated: true
      }
    };
  }

  private generateRecommendations(context: DiscoverContext): RuleResult {
    const { discovery, student } = context;
    const recommendations: any[] = [];

    if (discovery) {
      // Based on questions asked
      if (discovery.questions.length > 0) {
        recommendations.push({
          type: 'explore_answers',
          topics: discovery.questions.slice(0, 3),
          reason: 'curiosity'
        });
      }

      // Based on connections made
      if (discovery.connections.length > 0) {
        recommendations.push({
          type: 'deepen_understanding',
          topics: discovery.connections,
          reason: 'connections'
        });
      }

      // Based on hypotheses
      if (discovery.hypotheses.length > 0) {
        recommendations.push({
          type: 'test_hypothesis',
          experiments: discovery.hypotheses.map(h => `Test: ${h}`),
          reason: 'scientific_method'
        });
      }
    }

    // Based on interests
    if (student.interests && student.interests.length > 0) {
      recommendations.push({
        type: 'interest_based',
        topics: student.interests,
        reason: 'personal_interests'
      });
    }

    // Career-based recommendations
    if (context.career) {
      recommendations.push({
        type: 'career_exploration',
        topic: `${context.career.name} in action`,
        reason: 'career_connection'
      });
    }

    return {
      success: true,
      data: {
        recommendations,
        nextSteps: recommendations.slice(0, 3)
      }
    };
  }

  private documentDiscoveries(context: DiscoverContext): RuleResult {
    const { discovery } = context;
    if (!discovery) {
      return { success: false, error: 'No discovery data' };
    }

    const journey = this.getOrCreateJourney(context.student.id);
    const documentation = this.researchRules.documentation;

    // Create journal entry
    const entry: JournalEntry = {
      timestamp: new Date(),
      topic: context.exploration.topic,
      findings: discovery.findings,
      connections: discovery.connections,
      questions: discovery.questions,
      hypotheses: discovery.hypotheses,
      resources: context.exploration.resources || [],
      reflection: ''
    };

    // Add reflection prompts
    const reflectionPrompts = [
      'What surprised you most?',
      'What would you explore next?',
      'How does this connect to what you already knew?',
      'What questions do you still have?'
    ];

    journey.journal.push(entry);

    // Check documentation requirements
    const requiredFields = documentation.required;
    const completedFields = [];
    
    if (discovery.questions.length > 0) completedFields.push('research_question');
    if (context.exploration.resources && context.exploration.resources.length > 0) completedFields.push('sources');
    if (discovery.findings.length > 0) completedFields.push('findings');
    if (discovery.hypotheses.length > 0) completedFields.push('conclusion');

    const completionRate = (completedFields.length / requiredFields.length) * 100;

    return {
      success: true,
      data: {
        documented: true,
        entry,
        reflectionPrompts,
        completionRate,
        format: documentation.format
      }
    };
  }

  // Helper methods

  private createCustomPathway(exploration: any): ExplorationPathway {
    return {
      id: 'custom',
      name: `Custom ${exploration.topic} Exploration`,
      startingPoint: 'introduction',
      branches: [
        {
          id: 'introduction',
          topic: exploration.topic,
          prerequisities: [],
          resources: exploration.resources || [],
          activities: ['explore', 'investigate', 'document'],
          nextBranches: ['deep_dive']
        },
        {
          id: 'deep_dive',
          topic: `Advanced ${exploration.topic}`,
          prerequisities: ['introduction'],
          resources: [],
          activities: ['analyze', 'synthesize', 'create'],
          nextBranches: []
        }
      ],
      endGoals: ['presentation', 'portfolio', 'project'],
      estimatedTime: 2400
    };
  }

  private getOrCreateJourney(studentId: string): StudentJourney {
    let journey = this.studentJourneys.get(studentId);
    
    if (!journey) {
      journey = {
        studentId,
        startTime: new Date(),
        currentPathway: null,
        currentBranch: null,
        completedBranches: new Set(),
        researchStep: 0,
        curiosityTracking: {
          questionsAsked: 0,
          topicsExplored: new Set(),
          connectionsMade: 0,
          depthReached: new Map()
        },
        journal: []
      };
      this.studentJourneys.set(studentId, journey);
    }
    
    return journey;
  }

  // Public methods

  public getJourneyProgress(studentId: string): any {
    const journey = this.studentJourneys.get(studentId);
    if (!journey) return null;

    return {
      currentPathway: journey.currentPathway?.name,
      currentBranch: journey.currentBranch,
      completedBranches: Array.from(journey.completedBranches),
      researchProgress: journey.researchStep ? 
        (journey.researchStep / this.researchRules.methodology.steps.length) * 100 : 0,
      curiosityScore: 
        journey.curiosityTracking.questionsAsked * 5 +
        journey.curiosityTracking.topicsExplored.size * 10 +
        journey.curiosityTracking.connectionsMade * 15,
      journalEntries: journey.journal.length
    };
  }

  public getRecommendedPathway(context: DiscoverContext): ExplorationPathway | undefined {
    const { interests, grade } = context.student;
    
    // Find matching pathway based on interests
    if (interests && interests.length > 0) {
      for (const interest of interests) {
        const pathway = this.explorationRules.pathways.get(interest.toLowerCase());
        if (pathway) return pathway;
      }
    }

    // Default based on grade
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 5) {
      return this.explorationRules.pathways.get('science');
    } else {
      return this.explorationRules.pathways.get('history');
    }
  }

  public getJournal(studentId: string): JournalEntry[] {
    const journey = this.studentJourneys.get(studentId);
    return journey ? journey.journal : [];
  }
}

// Helper interfaces
interface StudentJourney {
  studentId: string;
  startTime: Date;
  currentPathway: ExplorationPathway | null;
  currentBranch: string | null;
  completedBranches: Set<string>;
  researchStep: number;
  curiosityTracking: CuriosityTracking;
  journal: JournalEntry[];
}

interface JournalEntry {
  timestamp: Date;
  topic: string;
  findings: string[];
  connections: string[];
  questions: string[];
  hypotheses: string[];
  resources: string[];
  reflection: string;
}

interface CuriosityTracking {
  questionsAsked: number;
  topicsExplored: Set<string>;
  connectionsMade: number;
  depthReached: Map<string, number>;
}

// Export singleton instance
export const discoverAIRulesEngine = new DiscoverAIRulesEngine();