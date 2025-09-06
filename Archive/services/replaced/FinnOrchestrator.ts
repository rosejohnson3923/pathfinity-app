// ================================================================
// FINN ORCHESTRATOR
// AI-powered tool manifestation and configuration system
// Analyzes assignment content and selects appropriate tools
// ================================================================

import { ToolType, ToolConfiguration, AssignmentContext } from '../components/tools/MasterToolInterface';

// Assignment analysis results
interface AssignmentAnalysis {
  primaryConcept: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  learningStyle: 'visual' | 'kinesthetic' | 'analytical' | 'mixed';
  requiredTools: ToolType[];
  suggestedDuration: number;
  prerequisites: string[];
  keywords: string[];
}

// Tool selection criteria
interface ToolSelectionCriteria {
  gradeLevel: string;
  subject: string;
  topic: string;
  studentProfile?: {
    preferredLearningStyle: string;
    attentionSpan: number;
    previousPerformance: number;
  };
}

export class FinnOrchestrator {
  private static instance: FinnOrchestrator;
  private toolDatabase: Map<string, ToolConfiguration>;
  private analysisCache: Map<string, AssignmentAnalysis>;

  private constructor() {
    this.toolDatabase = new Map();
    this.analysisCache = new Map();
    this.initializeToolDatabase();
  }

  public static getInstance(): FinnOrchestrator {
    if (!FinnOrchestrator.instance) {
      FinnOrchestrator.instance = new FinnOrchestrator();
    }
    return FinnOrchestrator.instance;
  }

  // ================================================================
  // TOOL DATABASE INITIALIZATION
  // ================================================================

  private initializeToolDatabase(): void {
    // Algebra Tiles configurations for different contexts
    this.toolDatabase.set('algebra-tiles-linear', {
      toolType: 'algebra-tiles',
      toolName: 'Algebra Tiles - Linear Equations',
      description: 'Visual manipulation of algebraic expressions using tiles',
      instructions: 'Use tiles to represent variables and constants. Combine like terms to solve equations.',
      parameters: {
        tileTypes: ['variable', 'unit', 'negative'],
        maxTiles: 50,
        showHints: true,
        autoCheck: false
      },
      appearance: {
        width: 800,
        height: 600,
        position: 'center',
        theme: 'auto'
      },
      interactions: {
        allowMinimize: true,
        allowFullscreen: true,
        allowSettings: true,
        autoFocus: true
      }
    });

    this.toolDatabase.set('algebra-tiles-quadratic', {
      toolType: 'algebra-tiles',
      toolName: 'Algebra Tiles - Quadratic Expressions',
      description: 'Advanced tile manipulation for quadratic expressions',
      instructions: 'Use quadratic tiles (x²) along with linear and unit tiles to factor expressions.',
      parameters: {
        tileTypes: ['quadratic', 'variable', 'unit', 'negative'],
        maxTiles: 75,
        showHints: true,
        autoCheck: false,
        factoring: true
      },
      appearance: {
        width: 900,
        height: 700,
        position: 'center',
        theme: 'auto'
      },
      interactions: {
        allowMinimize: true,
        allowFullscreen: true,
        allowSettings: true,
        autoFocus: true
      }
    });

    this.toolDatabase.set('basic-calculator-middle', {
      toolType: 'basic-calculator',
      toolName: 'Basic Calculator',
      toolDescription: 'Simple calculator for middle school math operations',
      instructions: 'Use the calculator to perform basic arithmetic operations: addition, subtraction, multiplication, and division.',
      parameters: {
        operations: ['add', 'subtract', 'multiply', 'divide', 'percent'],
        showSteps: true,
        showHistory: true,
        maxDecimals: 4,
        hintsEnabled: true
      },
      appearance: {
        width: 400,
        height: 600,
        position: 'center',
        theme: 'calculator'
      },
      interactions: {
        allowMinimize: true,
        allowFullscreen: false,
        allowSettings: true,
        autoFocus: true
      }
    });

    this.toolDatabase.set('graphing-calculator-basic', {
      toolType: 'graphing-calculator',
      toolName: 'Graphing Calculator',
      description: 'Interactive graphing tool for functions and equations',
      instructions: 'Plot functions and analyze their behavior. Use zoom and trace features.',
      parameters: {
        gridSize: 'standard',
        allowTrace: true,
        functions: ['linear', 'quadratic', 'exponential'],
        maxFunctions: 5
      },
      appearance: {
        width: 700,
        height: 500,
        position: 'center',
        theme: 'auto'
      },
      interactions: {
        allowMinimize: true,
        allowFullscreen: true,
        allowSettings: true,
        autoFocus: true
      }
    });

    this.toolDatabase.set('virtual-lab-chemistry', {
      toolType: 'virtual-lab',
      toolName: 'Chemistry Virtual Lab',
      description: 'Safe virtual environment for chemistry experiments',
      instructions: 'Mix chemicals, observe reactions, and record results safely.',
      parameters: {
        labType: 'chemistry',
        safetyMode: true,
        availableChemicals: ['acids', 'bases', 'salts', 'indicators'],
        equipment: ['beakers', 'test-tubes', 'bunsen-burner']
      },
      appearance: {
        width: 800,
        height: 600,
        position: 'center',
        theme: 'auto'
      },
      interactions: {
        allowMinimize: true,
        allowFullscreen: true,
        allowSettings: true,
        autoFocus: true
      }
    });

    this.toolDatabase.set('writing-studio-essay', {
      toolType: 'writing-studio',
      toolName: 'Essay Writing Studio',
      description: 'Structured writing environment with AI assistance',
      instructions: 'Plan, draft, and revise your essay with guided prompts.',
      parameters: {
        essayType: 'persuasive',
        wordLimit: 1000,
        showOutline: true,
        grammarCheck: true,
        citationStyle: 'MLA'
      },
      appearance: {
        width: 900,
        height: 650,
        position: 'center',
        theme: 'auto'
      },
      interactions: {
        allowMinimize: true,
        allowFullscreen: true,
        allowSettings: true,
        autoFocus: true
      }
    });

    this.toolDatabase.set('writing-studio-narrative', {
      toolType: 'writing-studio',
      toolName: 'Narrative Writing Studio',
      description: 'Creative writing environment for storytelling',
      instructions: 'Craft compelling narratives with character and plot development.',
      parameters: {
        essayType: 'narrative',
        wordLimit: 800,
        showOutline: true,
        characterTracker: true,
        plotStructure: true
      },
      appearance: {
        width: 900,
        height: 650,
        position: 'center',
        theme: 'auto'
      },
      interactions: {
        allowMinimize: true,
        allowFullscreen: true,
        allowSettings: true,
        autoFocus: true
      }
    });

    this.toolDatabase.set('virtual-lab-physics', {
      toolType: 'virtual-lab',
      toolName: 'Physics Virtual Lab',
      description: 'Safe virtual environment for physics experiments',
      instructions: 'Explore motion, forces, and energy with virtual equipment.',
      parameters: {
        labType: 'physics',
        safetyMode: true,
        availableEquipment: ['spring-scale', 'timer', 'ruler', 'weights'],
        experiments: ['pendulum', 'incline-plane', 'momentum']
      },
      appearance: {
        width: 800,
        height: 600,
        position: 'center',
        theme: 'auto'
      },
      interactions: {
        allowMinimize: true,
        allowFullscreen: true,
        allowSettings: true,
        autoFocus: true
      }
    });

    this.toolDatabase.set('graphing-calculator-advanced', {
      toolType: 'graphing-calculator',
      toolName: 'Advanced Graphing Calculator',
      description: 'Comprehensive graphing tool with calculus features',
      instructions: 'Explore derivatives, integrals, and advanced function analysis.',
      parameters: {
        gridSize: 'detailed',
        allowTrace: true,
        allowDerivatives: true,
        allowIntegrals: true,
        functions: ['polynomial', 'trigonometric', 'exponential', 'logarithmic'],
        maxFunctions: 8
      },
      appearance: {
        width: 1000,
        height: 700,
        position: 'center',
        theme: 'auto'
      },
      interactions: {
        allowMinimize: true,
        allowFullscreen: true,
        allowSettings: true,
        autoFocus: true
      }
    });

    this.toolDatabase.set('interactive-video-basic', {
      toolType: 'interactive-video',
      toolName: 'Interactive Video Learning',
      description: 'Video-based learning tool with interactive practice and assessment',
      instructions: 'Watch educational videos, practice concepts, and complete assessments.',
      parameters: {
        videoType: 'educational',
        showTranscript: true,
        allowPause: true,
        showProgress: true,
        interactiveElements: true
      },
      appearance: {
        width: 1000,
        height: 700,
        theme: 'video',
        position: 'center'
      },
      interactions: {
        allowMinimize: true,
        allowFullscreen: true,
        allowSettings: true,
        autoFocus: true
      },
      reasoning: '',
      confidence: 0.0
    });

    console.log('🧠 Finn Orchestrator initialized with', this.toolDatabase.size, 'tool configurations');
  }

  // ================================================================
  // ASSIGNMENT ANALYSIS
  // ================================================================

  public analyzeAssignment(assignment: AssignmentContext): AssignmentAnalysis {
    const cacheKey = `${assignment.skillCode}-${assignment.topic}`;
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    const analysis = this.performAssignmentAnalysis(assignment);
    this.analysisCache.set(cacheKey, analysis);
    
    console.log('📊 Assignment analyzed:', assignment.skillName, analysis);
    return analysis;
  }

  private performAssignmentAnalysis(assignment: AssignmentContext): AssignmentAnalysis {
    const topic = (assignment.topic || '').toLowerCase();
    const skillName = (assignment.skillName || '').toLowerCase();
    const subject = (assignment.subject || '').toLowerCase();
    const learningObjective = (assignment.learningObjective || '').toLowerCase();
    
    console.log('🧠 FinnOrchestrator analyzing assignment:', {
      topic, skillName, subject, learningObjective, gradeLevel: assignment.gradeLevel,
      originalAssignment: assignment
    });

    // Analyze primary concept with enhanced detection
    let primaryConcept = 'general';
    
    // Math concepts
    if (topic.includes('equation') || skillName.includes('equation') || skillName.includes('solve')) {
      primaryConcept = 'equation-solving';
    } else if (topic.includes('graph') || skillName.includes('graph') || topic.includes('plot')) {
      primaryConcept = 'graphing';
    } else if (topic.includes('function') || skillName.includes('function') || topic.includes('quadratic') || topic.includes('linear') || skillName.includes('domain') || skillName.includes('range')) {
      primaryConcept = 'functions';
    } else if (topic.includes('factor') || skillName.includes('factor')) {
      primaryConcept = 'factoring';
    } else if (skillName.includes('latitude') || skillName.includes('longitude') || skillName.includes('coordinates') || skillName.includes('location') || skillName.includes('geography')) {
      primaryConcept = 'geography';
    } 
    
    // Science concepts
    else if (topic.includes('lab') || topic.includes('experiment') || topic.includes('reaction') || topic.includes('chemistry')) {
      primaryConcept = 'experimentation';
    } else if (topic.includes('acid') || topic.includes('base') || topic.includes('chemical')) {
      primaryConcept = 'chemistry';
    } 
    
    // ELA concepts  
    else if (topic.includes('essay') || topic.includes('writing') || skillName.includes('write')) {
      primaryConcept = 'writing';
    } else if (topic.includes('persuasive') || topic.includes('narrative') || topic.includes('expository')) {
      primaryConcept = 'composition';
    } else if (topic.includes('analysis') || topic.includes('literature')) {
      primaryConcept = 'literary-analysis';
    }

    // Determine difficulty
    let difficulty: 'basic' | 'intermediate' | 'advanced' = 'basic';
    if (assignment.difficulty >= 7 || assignment.gradeLevel >= '11') {
      difficulty = 'advanced';
    } else if (assignment.difficulty >= 4 || assignment.gradeLevel >= '9') {
      difficulty = 'intermediate';
    }

    // Suggest learning style based on concept
    let learningStyle: 'visual' | 'kinesthetic' | 'analytical' | 'mixed' = 'visual';
    if (primaryConcept === 'equation-solving' || primaryConcept === 'factoring') {
      learningStyle = 'kinesthetic'; // Algebra tiles work well
    } else if (primaryConcept === 'graphing' || primaryConcept === 'functions') {
      learningStyle = 'visual'; // Graphing calculator
    } else if (primaryConcept === 'experimentation' || primaryConcept === 'chemistry') {
      learningStyle = 'kinesthetic'; // Lab work
    } else if (primaryConcept === 'writing' || primaryConcept === 'composition') {
      learningStyle = 'analytical'; // Writing process
    } else if (primaryConcept === 'literary-analysis') {
      learningStyle = 'mixed'; // Reading and writing
    }

    // Determine required tools with enhanced logic
    const requiredTools: ToolType[] = [];
    
    // Math tool selection
    if (subject === 'math' || subject === 'algebra1' || subject === 'algebra2' || subject === 'geometry' || subject === 'precalculus' || subject === 'calculus') {
      // Check grade level for appropriate calculator
      const gradeNum = parseInt(assignment.gradeLevel);
      console.log('🧠 Math subject detected, grade:', gradeNum);
      
      if (gradeNum >= 7 && gradeNum <= 8) {
        // Middle school gets basic calculator
        console.log('🧠 Grade 7-8 detected, selecting basic-calculator');
        requiredTools.push('basic-calculator');
      } else if (primaryConcept === 'equation-solving' || primaryConcept === 'factoring') {
        console.log('🧠 Equation-solving/factoring detected, selecting algebra-tiles');
        requiredTools.push('algebra-tiles');
      } else if (primaryConcept === 'graphing' || primaryConcept === 'functions') {
        console.log('🧠 Graphing/functions detected, selecting graphing-calculator');
        requiredTools.push('graphing-calculator');
      } else {
        console.log('🧠 Default math selection, selecting algebra-tiles');
        requiredTools.push('algebra-tiles'); // Default for high school math
      }
    } 
    
    // Science tool selection
    else if (subject === 'science') {
      if (primaryConcept === 'experimentation' || primaryConcept === 'chemistry') {
        requiredTools.push('virtual-lab');
      } else {
        requiredTools.push('virtual-lab'); // Default for science
      }
    } 
    
    // ELA tool selection
    else if (subject === 'ela') {
      console.log('🧠 ELA subject detected, primaryConcept:', primaryConcept);
      if (primaryConcept === 'writing' || primaryConcept === 'composition') {
        console.log('🧠 Writing/composition detected, selecting writing-studio');
        requiredTools.push('writing-studio');
      } else {
        console.log('🧠 Default ELA selection, selecting writing-studio');
        requiredTools.push('writing-studio'); // Default for ELA
      }
    } 
    
    // Social Studies tool selection
    else if (subject === 'socialstudies' || subject === 'social studies' || subject === 'history' || subject === 'geography' || subject === 'civics') {
      console.log('🧠 Social Studies subject detected, primaryConcept:', primaryConcept);
      if (primaryConcept === 'writing' || primaryConcept === 'composition') {
        console.log('🧠 Writing/composition detected, selecting writing-studio');
        requiredTools.push('writing-studio'); // For essays, reports
      } else if (primaryConcept === 'geography' || primaryConcept === 'location' || primaryConcept === 'mapping') {
        console.log('🧠 Geography/location detected, selecting interactive-video');
        requiredTools.push('interactive-video'); // For geography, coordinates, maps
      } else {
        console.log('🧠 Default Social Studies selection, selecting interactive-video');
        requiredTools.push('interactive-video'); // Default for Social Studies (video-based learning)
      }
    }
    
    // Fallback
    else {
      console.log('🧠 No matching subject found, using generic fallback. Subject was:', subject);
      requiredTools.push('generic');
    }
    
    console.log('🧠 Final tool selection:', requiredTools);

    // Suggest duration based on complexity
    let suggestedDuration = 15; // minutes
    if (difficulty === 'advanced') {
      suggestedDuration = 30;
    } else if (difficulty === 'intermediate') {
      suggestedDuration = 20;
    }

    // Extract keywords
    const keywords = [
      ...topic.split(' '),
      ...skillName.split(' '),
      subject,
      primaryConcept
    ].filter(word => word.length > 3);

    return {
      primaryConcept,
      difficulty,
      learningStyle,
      requiredTools,
      suggestedDuration,
      prerequisites: [], // TODO: Implement prerequisite analysis
      keywords
    };
  }

  // ================================================================
  // TOOL SELECTION AND CONFIGURATION
  // ================================================================

  public selectTool(
    assignment: AssignmentContext, 
    criteria?: ToolSelectionCriteria
  ): ToolConfiguration {
    const analysis = this.analyzeAssignment(assignment);
    
    // Select the most appropriate tool
    const selectedToolType = this.selectOptimalTool(analysis, criteria);
    
    // Get base configuration
    const baseConfig = this.getToolConfiguration(selectedToolType, analysis);
    
    // Customize configuration for assignment
    const customizedConfig = this.customizeConfiguration(baseConfig, assignment, analysis);
    
    console.log('🎯 Tool selected:', selectedToolType, 'for', assignment.skillName);
    return customizedConfig;
  }

  private selectOptimalTool(
    analysis: AssignmentAnalysis, 
    criteria?: ToolSelectionCriteria
  ): string {
    const primaryTool = analysis.requiredTools[0];
    
    // Enhanced algebra tiles selection
    if (primaryTool === 'algebra-tiles') {
      if (analysis.primaryConcept === 'factoring' || analysis.keywords.includes('quadratic')) {
        return 'algebra-tiles-quadratic';
      } else {
        return 'algebra-tiles-linear';
      }
    }
    
    // Enhanced graphing calculator selection
    if (primaryTool === 'graphing-calculator') {
      if (analysis.difficulty === 'advanced' || analysis.keywords.includes('calculus') || analysis.keywords.includes('derivative')) {
        return 'graphing-calculator-advanced';
      } else {
        return 'graphing-calculator-basic';
      }
    }
    
    // Enhanced virtual lab selection
    if (primaryTool === 'virtual-lab') {
      if (analysis.primaryConcept === 'chemistry' || analysis.keywords.includes('chemical') || analysis.keywords.includes('reaction')) {
        return 'virtual-lab-chemistry';
      } else if (analysis.keywords.includes('physics') || analysis.keywords.includes('motion') || analysis.keywords.includes('force')) {
        return 'virtual-lab-physics';
      } else {
        return 'virtual-lab-chemistry'; // Default to chemistry
      }
    }
    
    // Enhanced writing studio selection
    if (primaryTool === 'writing-studio') {
      if (analysis.primaryConcept === 'composition' && analysis.keywords.includes('narrative')) {
        return 'writing-studio-narrative';
      } else {
        return 'writing-studio-essay'; // Default to essay
      }
    }
    
    // Interactive Video selection
    if (primaryTool === 'interactive-video') {
      return 'interactive-video-basic'; // Start with basic version
    }
    
    // Basic Calculator selection
    if (primaryTool === 'basic-calculator') {
      return 'basic-calculator-middle'; // For middle school math
    }
    
    // Default fallback
    return 'algebra-tiles-linear';
  }

  private getToolConfiguration(toolKey: string, analysis: AssignmentAnalysis): ToolConfiguration {
    const config = this.toolDatabase.get(toolKey);
    if (!config) {
      console.warn('⚠️ Tool configuration not found:', toolKey);
      return this.toolDatabase.get('algebra-tiles-linear')!; // Fallback
    }
    return { ...config }; // Deep copy
  }

  private customizeConfiguration(
    config: ToolConfiguration,
    assignment: AssignmentContext,
    analysis: AssignmentAnalysis
  ): ToolConfiguration {
    // Customize based on grade level
    if (assignment.gradeLevel === '9' || assignment.gradeLevel === '10') {
      config.parameters.showHints = true;
      config.appearance.width = Math.min(config.appearance.width, 700);
    } else if (assignment.gradeLevel === '11' || assignment.gradeLevel === '12') {
      config.parameters.showHints = false;
      config.appearance.width = Math.max(config.appearance.width, 800);
    }

    // Customize based on difficulty
    if (analysis.difficulty === 'advanced') {
      config.interactions.allowSettings = true;
      config.parameters.autoCheck = false;
    } else if (analysis.difficulty === 'basic') {
      config.parameters.autoCheck = true;
      config.parameters.showHints = true;
    }

    // Update tool name to include assignment context
    config.toolName = `${config.toolName} - ${assignment.skillName}`;
    
    return config;
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  public getAvailableTools(): string[] {
    return Array.from(this.toolDatabase.keys());
  }

  public getToolConfig(toolKey: string): ToolConfiguration | null {
    return this.toolDatabase.get(toolKey) || null;
  }

  public updateToolConfiguration(toolKey: string, config: ToolConfiguration): void {
    this.toolDatabase.set(toolKey, config);
    console.log('🔧 Tool configuration updated:', toolKey);
  }

  public clearAnalysisCache(): void {
    this.analysisCache.clear();
    console.log('🧹 Analysis cache cleared');
  }

  // ================================================================
  // FINN AI INTEGRATION
  // ================================================================

  public async getFinnRecommendation(
    assignment: AssignmentContext,
    studentHistory?: any[]
  ): Promise<{
    toolConfiguration: ToolConfiguration;
    reasoning: string;
    confidence: number;
  }> {
    // Enhanced AI-like reasoning
    const analysis = this.analyzeAssignment(assignment);
    const toolConfig = this.selectTool(assignment);
    
    // Generate contextual reasoning based on analysis
    let reasoning = '';
    let confidence = 0.75;

    if (analysis.primaryConcept === 'equation-solving') {
      reasoning = `For "${assignment.skillName}", I'm recommending ${toolConfig.toolName} because hands-on manipulation of algebraic concepts helps students visualize abstract mathematical relationships. The kinesthetic learning approach works especially well for ${assignment.gradeLevel} grade students.`;
      confidence = 0.92;
    } else if (analysis.primaryConcept === 'functions' || analysis.primaryConcept === 'graphing') {
      reasoning = `Since this assignment focuses on "${assignment.skillName}", ${toolConfig.toolName} is perfect for exploring function behavior visually. Graphing helps students understand how mathematical expressions translate to visual patterns, which is crucial for ${assignment.gradeLevel} grade comprehension.`;
      confidence = 0.89;
    } else if (analysis.primaryConcept === 'experimentation' || analysis.primaryConcept === 'chemistry') {
      reasoning = `For "${assignment.skillName}", ${toolConfig.toolName} provides a safe environment to explore chemical reactions and scientific principles. Virtual experiments allow unlimited practice while maintaining safety protocols essential for ${assignment.gradeLevel} grade students.`;
      confidence = 0.94;
    } else if (analysis.primaryConcept === 'writing' || analysis.primaryConcept === 'composition') {
      reasoning = `${toolConfig.toolName} is ideal for "${assignment.skillName}" because structured writing processes help students organize thoughts and express ideas clearly. The AI assistance and step-by-step approach support ${assignment.gradeLevel} grade writing development effectively.`;
      confidence = 0.88;
    } else {
      reasoning = `Based on the assignment "${assignment.skillName}" for ${assignment.gradeLevel} grade ${assignment.subject}, I recommend ${toolConfig.toolName} as it provides the most appropriate interactive learning experience for this concept type.`;
      confidence = 0.75;
    }

    // Adjust confidence based on grade level appropriateness
    if (assignment.gradeLevel >= '9' && assignment.gradeLevel <= '12') {
      confidence += 0.05; // Higher confidence for high school tools
    }

    // Consider learning style match
    if (analysis.learningStyle === 'kinesthetic' && toolConfig.toolType === 'algebra-tiles') {
      confidence += 0.03;
    } else if (analysis.learningStyle === 'visual' && toolConfig.toolType === 'graphing-calculator') {
      confidence += 0.03;
    }

    return {
      toolConfiguration: toolConfig,
      reasoning,
      confidence: Math.min(confidence, 0.99)
    };
  }

  public async provideFinnGuidance(
    assignment: AssignmentContext,
    studentAction: string,
    toolState: any
  ): Promise<{
    message: string;
    hint?: string;
    encouragement?: string;
  }> {
    // This would integrate with Finn's personality and guidance system
    // For now, providing basic responses
    
    const responses = {
      // Algebra Tiles responses
      'tile-placed': [
        "Great start! You're building the equation step by step.",
        "Nice work placing that tile. Keep going!",
        "Excellent! You're visualizing the algebra perfectly."
      ],
      'tile-removed': [
        "Good thinking! Sometimes we need to try different approaches.",
        "That's okay, learning is about experimenting.",
        "Keep exploring different combinations."
      ],
      'workspace-cleared': [
        "Fresh start! Sometimes clearing the workspace helps us think better.",
        "Ready to try again? I'm here to help!",
        "Let's approach this step by step."
      ],
      'solution-correct': [
        "Fantastic! You solved it correctly!",
        "Amazing work! You really understand this concept.",
        "Perfect! You've mastered this skill."
      ],
      'solution-incorrect': [
        "Almost there! Try thinking about what each tile represents.",
        "Good attempt! Let's try a different approach.",
        "You're learning! Each try gets you closer to the solution."
      ],

      // Graphing Calculator responses
      'function-changed': [
        "Interesting function! Let's see how it behaves on the graph.",
        "Good choice! Functions help us understand mathematical relationships.",
        "Nice! Try adjusting the viewing window to see more of the graph."
      ],
      'function-analyzed': [
        "Excellent analysis! Understanding function behavior is key to mastery.",
        "Great work exploring the function's properties!",
        "You're developing strong mathematical intuition!"
      ],

      // Virtual Lab responses
      'chemical-selected': [
        "Good choice! Always consider the properties of each chemical.",
        "Safety first! Make sure you understand each chemical's behavior.",
        "Excellent selection! Let's see what happens when we combine these."
      ],
      'experiment-run': [
        "Fantastic experiment! Science is all about observation and discovery.",
        "Great work! You're thinking like a real scientist.",
        "Amazing! Your hypothesis testing skills are improving."
      ],
      'observation-recorded': [
        "Excellent documentation! Good scientists always record their observations.",
        "Perfect! Detailed notes help us understand what we've learned.",
        "Great scientific practice! Your lab skills are developing well."
      ],

      // Writing Studio responses
      'outline-updated': [
        "Excellent planning! A strong outline leads to great writing.",
        "Good organizational thinking! Your ideas are taking shape.",
        "Perfect! Planning your writing makes the drafting process smoother."
      ],
      'writing-analyzed': [
        "Great self-reflection! Analyzing your writing helps you improve.",
        "Excellent! Understanding your writing strengths helps you grow.",
        "Perfect approach! Critical thinking about your own work is valuable."
      ],
      'ai-assistance-requested': [
        "Smart move! Getting help when you need it shows wisdom.",
        "Excellent! Using available resources is part of good writing.",
        "Great thinking! Writers often collaborate and seek feedback."
      ]
    };

    const actionResponses = responses[studentAction as keyof typeof responses] || [
      "Keep working! You're doing great.",
      "I'm here to help you learn!",
      "Every step is progress."
    ];

    const message = actionResponses[Math.floor(Math.random() * actionResponses.length)];
    
    return {
      message,
      hint: studentAction === 'solution-incorrect' ? "Try grouping similar tiles together." : undefined,
      encouragement: "You're building strong mathematical thinking!"
    };
  }
}

// Export singleton instance
export const finnOrchestrator = FinnOrchestrator.getInstance();
export default FinnOrchestrator;