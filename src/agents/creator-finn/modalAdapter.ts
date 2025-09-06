/**
 * Creator Finn Modal Adapter
 * Handles creative content generation through modals
 */

import { BaseFinnModalAdapter, FinnAgentConfig } from '../base-modal-adapter';
import { ModalTypeEnum } from '../../ai-engine/types';

const CREATOR_CONFIG: FinnAgentConfig = {
  agentId: 'creator-finn',
  agentName: 'Creator Finn',
  defaultContainer: 'EXPERIENCE',
  supportedModalTypes: [
    ModalTypeEnum.DRAWING,
    ModalTypeEnum.CODE_EDITOR,
    ModalTypeEnum.ESSAY,
    ModalTypeEnum.COLLAB_DOC,
    ModalTypeEnum.BRAINSTORM,
    ModalTypeEnum.MATRIX,
    ModalTypeEnum.SHORT_ANSWER,
    ModalTypeEnum.PROJECT
  ],
  personality: {
    tone: 'encouraging',
    avatar: '/assets/agents/creator-finn.png',
    color: '#6366F1' // Indigo
  }
};

export class CreatorFinnModalAdapter extends BaseFinnModalAdapter {
  constructor() {
    super(CREATOR_CONFIG);
  }

  /**
   * Generate creative content
   */
  protected async generateContent(intent: any, modalType: ModalTypeEnum): Promise<any> {
    switch (modalType) {
      case ModalTypeEnum.DRAWING:
        return this.generateDrawingContent(intent);
      
      case ModalTypeEnum.CODE_EDITOR:
        return this.generateCodingContent(intent);
      
      case ModalTypeEnum.ESSAY:
        return this.generateWritingContent(intent);
      
      case ModalTypeEnum.COLLAB_DOC:
        return this.generateCollaborativeContent(intent);
      
      case ModalTypeEnum.BRAINSTORM:
        return this.generateBrainstormContent(intent);
      
      case ModalTypeEnum.MATRIX:
        return this.generateMatrixContent(intent);
      
      case ModalTypeEnum.PROJECT:
        return this.generateProjectContent(intent);
      
      default:
        return this.generateDefaultCreativeContent(intent);
    }
  }

  /**
   * Generate drawing content
   */
  private generateDrawingContent(intent: any): any {
    const theme = this.extractCreativeTheme(intent);
    
    return {
      title: "🎨 Creative Canvas",
      instruction: `Create a drawing about: ${theme}`,
      canvas: {
        width: 800,
        height: 600,
        backgroundColor: '#FFFFFF',
        gridEnabled: this.context.gradeLevel === 'K-2' || this.context.gradeLevel === '3-5'
      },
      tools: this.getDrawingTools(),
      templates: this.getDrawingTemplates(theme),
      prompts: [
        "Express your ideas visually",
        "Use colors to show emotions",
        "Add details to tell your story"
      ],
      saveOptions: {
        formats: ['png', 'jpg', 'svg'],
        shareEnabled: true,
        portfolioEnabled: true
      }
    };
  }

  /**
   * Generate coding content
   */
  private generateCodingContent(intent: any): any {
    const project = this.selectCodingProject(intent);
    const language = this.selectProgrammingLanguage();
    
    return {
      title: "💻 Code Creator",
      problem: project.description,
      language: language,
      starterCode: project.starter,
      testCases: project.tests,
      hints: project.hints,
      documentation: {
        enabled: true,
        references: this.getLanguageReferences(language)
      },
      features: {
        syntaxHighlighting: true,
        autoComplete: true,
        linting: true,
        debugging: this.context.gradeLevel === '9-12'
      },
      objectives: project.objectives,
      creativity: {
        bonusFeatures: project.bonusFeatures,
        stylePoints: true,
        customization: true
      }
    };
  }

  /**
   * Generate writing content
   */
  private generateWritingContent(intent: any): any {
    const writingType = this.determineWritingType(intent);
    
    return {
      title: "✍️ Writing Workshop",
      prompt: this.generateWritingPrompt(writingType),
      writingType: writingType,
      requirements: {
        minWords: this.getMinWords(),
        maxWords: this.getMaxWords(),
        paragraphs: this.getParagraphRequirement(),
        style: this.getWritingStyle(writingType)
      },
      tools: {
        spellCheck: true,
        grammarCheck: true,
        thesaurus: true,
        citationHelper: this.context.gradeLevel === '9-12',
        outlineBuilder: true
      },
      inspiration: {
        prompts: this.getInspirationPrompts(writingType),
        examples: this.getWritingExamples(writingType),
        vocabulary: this.getSuggestedVocabulary()
      },
      rubric: this.getWritingRubric(writingType)
    };
  }

  /**
   * Generate collaborative content
   */
  private generateCollaborativeContent(intent: any): any {
    return {
      title: "👥 Collaboration Space",
      projectName: this.generateProjectName(intent),
      collaborationType: 'real-time',
      workspace: {
        documentType: 'rich-text',
        sharing: 'team',
        permissions: 'edit',
        versionControl: true
      },
      team: {
        maxMembers: 5,
        roles: ['Leader', 'Researcher', 'Designer', 'Writer', 'Reviewer'],
        communication: {
          chat: true,
          comments: true,
          mentions: true,
          videoCall: false
        }
      },
      templates: this.getCollaborationTemplates(),
      objectives: [
        "Work together to create something amazing",
        "Share ideas and build on each other's work",
        "Learn from different perspectives"
      ],
      timeline: {
        phases: ['Planning', 'Creation', 'Review', 'Finalization'],
        duration: '1 week'
      }
    };
  }

  /**
   * Generate brainstorm content
   */
  private generateBrainstormContent(intent: any): any {
    const topic = this.extractBrainstormTopic(intent);
    
    return {
      title: "💡 Idea Generator",
      topic: topic,
      mode: 'mind-map',
      canvas: {
        centerNode: topic,
        branches: [],
        maxDepth: 4
      },
      tools: {
        nodeTypes: ['idea', 'question', 'resource', 'action'],
        connections: ['relates-to', 'causes', 'requires', 'leads-to'],
        colors: this.getBrainstormColors(),
        icons: true
      },
      techniques: [
        "Start with wild ideas - no judgment!",
        "Build on others' ideas",
        "Quantity over quality at first",
        "Combine different concepts"
      ],
      prompts: this.getBrainstormPrompts(topic),
      timer: {
        enabled: true,
        duration: 300, // 5 minutes
        intervals: [60, 120, 180, 240, 300]
      }
    };
  }

  /**
   * Generate matrix content
   */
  private generateMatrixContent(intent: any): any {
    const matrixType = this.determineMatrixType(intent);
    
    return {
      title: "🔲 Creative Matrix",
      type: matrixType,
      dimensions: this.getMatrixDimensions(matrixType),
      cells: this.initializeMatrixCells(matrixType),
      instructions: this.getMatrixInstructions(matrixType),
      interactions: {
        dragDrop: true,
        multiSelect: true,
        colorCoding: true,
        formulas: matrixType === 'calculation'
      },
      validation: {
        required: this.getRequiredCells(matrixType),
        rules: this.getMatrixRules(matrixType)
      }
    };
  }

  /**
   * Generate project content
   */
  private generateProjectContent(intent: any): any {
    const projectType = this.selectProjectType(intent);
    
    return {
      title: "🚀 Project Builder",
      projectName: projectType.name,
      description: projectType.description,
      phases: projectType.phases,
      currentPhase: 0,
      resources: {
        materials: projectType.materials,
        tools: projectType.tools,
        references: projectType.references
      },
      milestones: projectType.milestones,
      deliverables: projectType.deliverables,
      collaboration: {
        enabled: true,
        teamSize: projectType.teamSize,
        roles: projectType.roles
      },
      showcase: {
        portfolio: true,
        presentation: true,
        peerReview: true,
        badges: projectType.badges
      },
      timeline: projectType.timeline,
      rubric: projectType.rubric
    };
  }

  /**
   * Generate default creative content
   */
  private generateDefaultCreativeContent(intent: any): any {
    return {
      title: "🌈 Create Something Amazing!",
      question: "What would you like to create today?",
      options: [
        {
          id: 'opt1',
          content: '🎨 Digital Artwork',
          image: '/assets/create/art-icon.png',
          description: 'Express yourself through digital art'
        },
        {
          id: 'opt2',
          content: '📝 Creative Story',
          image: '/assets/create/story-icon.png',
          description: 'Write an original story or poem'
        },
        {
          id: 'opt3',
          content: '💻 Code Project',
          image: '/assets/create/code-icon.png',
          description: 'Build something with code'
        },
        {
          id: 'opt4',
          content: '🎬 Multimedia Project',
          image: '/assets/create/media-icon.png',
          description: 'Combine different media types'
        }
      ],
      instruction: "Choose your creative path and let's build something together!"
    };
  }

  // Helper methods
  private extractCreativeTheme(intent: any): string {
    const input = intent.originalInput.toLowerCase();
    if (input.includes('nature')) return 'Nature and Environment';
    if (input.includes('future')) return 'Vision of the Future';
    if (input.includes('story')) return 'Visual Storytelling';
    if (input.includes('abstract')) return 'Abstract Expression';
    return 'Creative Expression';
  }

  private getDrawingTools(): any[] {
    const basicTools = ['pen', 'eraser', 'fill', 'shapes', 'text'];
    const advancedTools = ['layers', 'filters', 'gradients', 'patterns'];
    
    if (this.context.gradeLevel === 'K-2' || this.context.gradeLevel === '3-5') {
      return basicTools;
    }
    return [...basicTools, ...advancedTools];
  }

  private getDrawingTemplates(theme: string): any[] {
    return [
      { name: 'Blank Canvas', thumbnail: '/assets/templates/blank.png' },
      { name: 'Comic Strip', thumbnail: '/assets/templates/comic.png' },
      { name: 'Poster', thumbnail: '/assets/templates/poster.png' },
      { name: 'Infographic', thumbnail: '/assets/templates/infographic.png' }
    ];
  }

  private selectCodingProject(intent: any): any {
    const projects = {
      game: {
        description: 'Create an interactive game',
        starter: '// Game initialization\nlet score = 0;\nlet player = { x: 0, y: 0 };\n\nfunction setup() {\n  // Your code here\n}',
        tests: [
          { description: 'Player can move', test: 'movePlayer()' },
          { description: 'Score increases', test: 'updateScore()' }
        ],
        hints: ['Think about game mechanics', 'Add collision detection'],
        objectives: ['Create player movement', 'Add scoring system', 'Design levels'],
        bonusFeatures: ['Sound effects', 'High score', 'Multiple levels']
      },
      animation: {
        description: 'Build an animation',
        starter: '// Animation setup\nlet frame = 0;\n\nfunction animate() {\n  // Your animation code\n}',
        tests: [
          { description: 'Animation runs', test: 'animate()' },
          { description: 'Smooth transitions', test: 'checkFrameRate()' }
        ],
        hints: ['Use frame counting', 'Implement easing functions'],
        objectives: ['Create smooth motion', 'Add visual effects'],
        bonusFeatures: ['Interactive elements', 'Multiple scenes']
      }
    };
    
    const input = intent.originalInput.toLowerCase();
    if (input.includes('game')) return projects.game;
    if (input.includes('animation')) return projects.animation;
    return projects.game;
  }

  private selectProgrammingLanguage(): string {
    const languages = {
      'K-2': 'blockly',
      '3-5': 'scratch',
      '6-8': 'python',
      '9-12': 'javascript'
    };
    return languages[this.context.gradeLevel] || 'python';
  }

  private getLanguageReferences(language: string): string[] {
    const refs = {
      python: ['https://docs.python.org', 'Python basics guide'],
      javascript: ['MDN Web Docs', 'JavaScript tutorial'],
      scratch: ['Scratch blocks reference', 'Project examples'],
      blockly: ['Visual programming guide', 'Block descriptions']
    };
    return refs[language] || [];
  }

  private determineWritingType(intent: any): string {
    const input = intent.originalInput.toLowerCase();
    if (input.includes('story')) return 'narrative';
    if (input.includes('essay')) return 'essay';
    if (input.includes('poem')) return 'poetry';
    if (input.includes('report')) return 'report';
    return 'creative';
  }

  private generateWritingPrompt(type: string): string {
    const prompts = {
      narrative: "Write a story about an unexpected adventure",
      essay: "Discuss the importance of creativity in learning",
      poetry: "Create a poem about your favorite season",
      report: "Research and report on an interesting discovery",
      creative: "Express your thoughts on what makes you unique"
    };
    return prompts[type] || prompts.creative;
  }

  private getMinWords(): number {
    const mins = { 'K-2': 20, '3-5': 50, '6-8': 100, '9-12': 200 };
    return mins[this.context.gradeLevel] || 100;
  }

  private getMaxWords(): number {
    const maxs = { 'K-2': 100, '3-5': 250, '6-8': 500, '9-12': 1000 };
    return maxs[this.context.gradeLevel] || 500;
  }

  private getParagraphRequirement(): number {
    const paras = { 'K-2': 1, '3-5': 2, '6-8': 3, '9-12': 5 };
    return paras[this.context.gradeLevel] || 3;
  }

  private getWritingStyle(type: string): string {
    const styles = {
      narrative: 'descriptive',
      essay: 'formal',
      poetry: 'expressive',
      report: 'informative',
      creative: 'free-form'
    };
    return styles[type] || 'free-form';
  }

  // Additional helper methods...
  private getInspirationPrompts(type: string): string[] {
    return [
      "What if...",
      "Imagine a world where...",
      "The most interesting thing about...",
      "A day in the life of..."
    ];
  }

  private getWritingExamples(type: string): any[] {
    return [
      { title: 'Example 1', excerpt: 'Sample opening...', rating: 4.5 },
      { title: 'Example 2', excerpt: 'Another approach...', rating: 4.7 }
    ];
  }

  private getSuggestedVocabulary(): string[] {
    return ['vivid', 'extraordinary', 'innovative', 'remarkable'];
  }

  private getWritingRubric(type: string): any {
    return {
      criteria: [
        { name: 'Creativity', weight: 30 },
        { name: 'Organization', weight: 25 },
        { name: 'Grammar', weight: 20 },
        { name: 'Vocabulary', weight: 15 },
        { name: 'Originality', weight: 10 }
      ]
    };
  }

  /**
   * Special creator methods
   */
  public async startCreativeProject(type: string): Promise<AIContentResponseV2> {
    this.addToHistory('system', `Starting creative project: ${type}`);
    return this.processInput(`I want to create a ${type} project`);
  }

  public async saveToPortfolio(work: any): Promise<void> {
    // Save creative work to student portfolio
    console.log('Saving to portfolio:', work);
  }
}

// Singleton instance
export const creatorFinn = new CreatorFinnModalAdapter();