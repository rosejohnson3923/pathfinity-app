/**
 * Researcher Finn Modal Adapter
 * Facilitates research and investigation through modals
 */

import { BaseFinnModalAdapter, FinnAgentConfig } from '../base-modal-adapter';
import { ModalTypeEnum } from '../../ai-engine/types';

const RESEARCHER_CONFIG: FinnAgentConfig = {
  agentId: 'researcher-finn',
  agentName: 'Researcher Finn',
  defaultContainer: 'LEARN',
  supportedModalTypes: [
    ModalTypeEnum.SHORT_ANSWER,
    ModalTypeEnum.ESSAY,
    ModalTypeEnum.MATRIX,
    ModalTypeEnum.GRAPH_CHART,
    ModalTypeEnum.TIMELINE,
    ModalTypeEnum.COLLAB_DOC,
    ModalTypeEnum.PEER_REVIEW,
    ModalTypeEnum.CITATION
  ],
  personality: {
    tone: 'professional',
    avatar: '/assets/agents/researcher-finn.png',
    color: '#3B82F6' // Blue
  }
};

export class ResearcherFinnModalAdapter extends BaseFinnModalAdapter {
  private researchTopics: Map<string, any> = new Map();
  private sources: Map<string, any> = new Map();
  private citations: any[] = [];

  constructor() {
    super(RESEARCHER_CONFIG);
  }

  /**
   * Generate research content
   */
  protected async generateContent(intent: any, modalType: ModalTypeEnum): Promise<any> {
    switch (modalType) {
      case ModalTypeEnum.SHORT_ANSWER:
        return this.generateResearchQuestionContent(intent);
      
      case ModalTypeEnum.ESSAY:
        return this.generateResearchPaperContent(intent);
      
      case ModalTypeEnum.MATRIX:
        return this.generateResearchMatrixContent(intent);
      
      case ModalTypeEnum.GRAPH_CHART:
        return this.generateDataAnalysisContent(intent);
      
      case ModalTypeEnum.TIMELINE:
        return this.generateResearchTimelineContent(intent);
      
      case ModalTypeEnum.COLLAB_DOC:
        return this.generateCollaborativeResearchContent(intent);
      
      case ModalTypeEnum.PEER_REVIEW:
        return this.generateResearchReviewContent(intent);
      
      case ModalTypeEnum.CITATION:
        return this.generateCitationContent(intent);
      
      default:
        return this.generateDefaultResearchContent(intent);
    }
  }

  /**
   * Generate research question content
   */
  private generateResearchQuestionContent(intent: any): any {
    const topic = this.extractResearchTopic(intent);
    const depth = this.determineResearchDepth();
    
    return {
      title: "🔍 Research Investigation",
      researchQuestion: this.formulateResearchQuestion(topic),
      methodology: {
        approach: this.selectResearchApproach(topic),
        methods: this.getResearchMethods(topic),
        tools: this.getResearchTools()
      },
      guidingQuestions: [
        "What do we already know about this topic?",
        "What questions remain unanswered?",
        "What evidence supports different viewpoints?",
        "How can we verify our findings?"
      ],
      sources: {
        primary: this.getPrimarySources(topic),
        secondary: this.getSecondarySources(topic),
        recommended: this.getRecommendedReadings(topic)
      },
      framework: {
        hypothesis: this.generateHypothesis(topic),
        variables: this.identifyVariables(topic),
        controls: this.identifyControls(topic)
      },
      depth: depth,
      credibilityChecklist: [
        "Is the source authoritative?",
        "Is the information current?",
        "Are there citations?",
        "Is there bias present?"
      ]
    };
  }

  /**
   * Generate research paper content
   */
  private generateResearchPaperContent(intent: any): any {
    const topic = this.extractResearchTopic(intent);
    const paperType = this.determinePaperType(intent);
    
    return {
      title: "📝 Research Paper Workshop",
      topic: topic,
      paperType: paperType,
      structure: this.getResearchPaperStructure(paperType),
      requirements: {
        minWords: this.getMinWordCount(paperType),
        maxWords: this.getMaxWordCount(paperType),
        sections: this.getRequiredSections(paperType),
        citations: this.getCitationRequirements(paperType)
      },
      outline: {
        template: this.generateOutlineTemplate(topic, paperType),
        sections: [
          { name: 'Introduction', guidelines: this.getIntroGuidelines() },
          { name: 'Literature Review', guidelines: this.getLitReviewGuidelines() },
          { name: 'Methodology', guidelines: this.getMethodologyGuidelines() },
          { name: 'Results', guidelines: this.getResultsGuidelines() },
          { name: 'Discussion', guidelines: this.getDiscussionGuidelines() },
          { name: 'Conclusion', guidelines: this.getConclusionGuidelines() }
        ]
      },
      researchTools: {
        noteCards: true,
        bibliographyBuilder: true,
        outlineBuilder: true,
        citationManager: true,
        plagiarismChecker: this.context.gradeLevel === '9-12'
      },
      writingSupport: {
        transitionPhrases: this.getAcademicTransitions(),
        academicVocabulary: this.getAcademicVocabulary(),
        citationFormats: ['APA', 'MLA', 'Chicago'],
        peerReview: true
      },
      evaluation: {
        rubric: this.getResearchRubric(paperType),
        selfAssessment: this.getSelfAssessmentChecklist()
      }
    };
  }

  /**
   * Generate research matrix content
   */
  private generateResearchMatrixContent(intent: any): any {
    const topic = this.extractResearchTopic(intent);
    
    return {
      title: "📊 Research Comparison Matrix",
      purpose: "Compare and contrast different sources and perspectives",
      matrix: {
        rows: this.generateMatrixRows(topic),
        columns: this.generateMatrixColumns(),
        cells: this.initializeMatrixCells()
      },
      categories: [
        'Source',
        'Main Argument',
        'Evidence',
        'Methodology',
        'Strengths',
        'Weaknesses',
        'Relevance'
      ],
      instructions: [
        "Add sources as rows",
        "Fill in each category for comparison",
        "Identify patterns across sources",
        "Draw conclusions from the comparison"
      ],
      analysis: {
        patterns: true,
        contradictions: true,
        gaps: true,
        synthesis: true
      },
      export: {
        formats: ['csv', 'pdf', 'doc'],
        includeAnalysis: true
      }
    };
  }

  /**
   * Generate data analysis content
   */
  private generateDataAnalysisContent(intent: any): any {
    const dataset = this.getResearchDataset(intent);
    
    return {
      title: "📈 Research Data Analysis",
      dataset: dataset,
      analysisType: this.selectAnalysisType(dataset),
      visualization: {
        chartTypes: this.getAppropriateChartTypes(dataset),
        interactive: true,
        customizable: true,
        exportable: true
      },
      tools: {
        statistics: this.getStatisticalTools(),
        filters: this.getDataFilters(dataset),
        correlations: true,
        trends: true
      },
      interpretation: {
        guidelines: this.getInterpretationGuidelines(),
        questions: [
          "What patterns do you observe?",
          "Are there any outliers?",
          "What conclusions can we draw?",
          "What limitations exist?"
        ],
        templates: this.getAnalysisTemplates()
      },
      methodology: {
        dataCollection: this.explainDataCollection(dataset),
        sampleSize: dataset.sampleSize,
        reliability: this.assessReliability(dataset),
        validity: this.assessValidity(dataset)
      },
      reporting: {
        format: 'scientific',
        sections: ['Methods', 'Results', 'Discussion'],
        visualizations: true,
        tables: true
      }
    };
  }

  /**
   * Generate research timeline content
   */
  private generateResearchTimelineContent(intent: any): any {
    const project = this.extractResearchProject(intent);
    
    return {
      title: "📅 Research Project Timeline",
      projectName: project.name,
      phases: [
        {
          name: 'Topic Selection',
          duration: '1 week',
          tasks: ['Brainstorm ideas', 'Narrow focus', 'Formulate question'],
          deliverable: 'Research question'
        },
        {
          name: 'Literature Review',
          duration: '2 weeks',
          tasks: ['Search databases', 'Read sources', 'Take notes', 'Organize findings'],
          deliverable: 'Annotated bibliography'
        },
        {
          name: 'Data Collection',
          duration: '2 weeks',
          tasks: ['Design methodology', 'Gather data', 'Organize data'],
          deliverable: 'Dataset'
        },
        {
          name: 'Analysis',
          duration: '1 week',
          tasks: ['Analyze data', 'Create visualizations', 'Interpret results'],
          deliverable: 'Analysis report'
        },
        {
          name: 'Writing',
          duration: '2 weeks',
          tasks: ['Create outline', 'Write draft', 'Revise', 'Edit'],
          deliverable: 'Research paper'
        },
        {
          name: 'Presentation',
          duration: '3 days',
          tasks: ['Create slides', 'Practice', 'Present'],
          deliverable: 'Presentation'
        }
      ],
      milestones: this.generateResearchMilestones(project),
      resources: this.getTimelineResources(),
      tracking: {
        progress: true,
        deadlines: true,
        reminders: true
      }
    };
  }

  /**
   * Generate collaborative research content
   */
  private generateCollaborativeResearchContent(intent: any): any {
    return {
      title: "👥 Collaborative Research Project",
      projectType: 'group-research',
      collaboration: {
        roles: [
          { role: 'Lead Researcher', responsibilities: ['Coordinate team', 'Synthesize findings'] },
          { role: 'Data Analyst', responsibilities: ['Analyze data', 'Create visualizations'] },
          { role: 'Writer', responsibilities: ['Draft sections', 'Edit content'] },
          { role: 'Fact Checker', responsibilities: ['Verify sources', 'Check citations'] },
          { role: 'Presenter', responsibilities: ['Create presentation', 'Present findings'] }
        ],
        communication: {
          sharedDocs: true,
          comments: true,
          versionControl: true,
          meetings: true
        }
      },
      workspace: {
        sharedLibrary: true,
        noteSharing: true,
        taskManagement: true,
        deadlineTracking: true
      },
      process: {
        phases: ['Planning', 'Research', 'Analysis', 'Writing', 'Review'],
        checkpoints: this.getCollaborationCheckpoints(),
        peerReview: true
      },
      deliverables: {
        individualContributions: true,
        groupSynthesis: true,
        presentation: true
      }
    };
  }

  /**
   * Generate research review content
   */
  private generateResearchReviewContent(intent: any): any {
    return {
      title: "🔎 Research Peer Review",
      reviewType: 'academic',
      criteria: {
        thesis: 'Is the research question clear and focused?',
        evidence: 'Is the evidence sufficient and credible?',
        analysis: 'Is the analysis thorough and logical?',
        organization: 'Is the paper well-structured?',
        citations: 'Are sources properly cited?',
        writing: 'Is the writing clear and academic?'
      },
      reviewProcess: {
        steps: [
          'Read for overall understanding',
          'Evaluate against criteria',
          'Provide specific feedback',
          'Suggest improvements',
          'Summarize strengths and areas for growth'
        ],
        tools: {
          rubric: this.getReviewRubric(),
          commentBank: this.getCommentBank(),
          trackChanges: true
        }
      },
      feedbackGuidelines: [
        'Be specific and constructive',
        'Balance criticism with praise',
        'Focus on the work, not the person',
        'Provide actionable suggestions'
      ],
      ethics: {
        confidentiality: true,
        objectivity: true,
        respect: true
      }
    };
  }

  /**
   * Generate citation content
   */
  private generateCitationContent(intent: any): any {
    const source = this.extractSourceInfo(intent);
    
    return {
      title: "📚 Citation Builder",
      sourceType: this.identifySourceType(source),
      citationStyles: {
        APA: this.generateAPACitation(source),
        MLA: this.generateMLACitation(source),
        Chicago: this.generateChicagoCitation(source)
      },
      fields: this.getCitationFields(source),
      inTextCitation: {
        APA: this.generateInTextAPA(source),
        MLA: this.generateInTextMLA(source),
        Chicago: this.generateInTextChicago(source)
      },
      bibliography: {
        entries: this.citations,
        formatting: this.getBibliographyFormatting(),
        sorting: 'alphabetical'
      },
      tools: {
        autoFormat: true,
        urlImport: true,
        isbnLookup: true,
        doiResolver: true
      },
      guidance: {
        whenToCite: this.getWhenToCiteGuidance(),
        howToCite: this.getHowToCiteGuidance(),
        avoidPlagiarism: this.getPlagiarismGuidance()
      }
    };
  }

  /**
   * Generate default research content
   */
  private generateDefaultResearchContent(intent: any): any {
    return {
      title: "🔬 Research Assistant",
      greeting: "Let's explore and investigate together!",
      question: "What would you like to research today?",
      options: [
        {
          id: 'start',
          content: '🔍 Start New Research Project',
          description: 'Begin a guided research journey'
        },
        {
          id: 'sources',
          content: '📚 Find Credible Sources',
          description: 'Learn to evaluate and find reliable information'
        },
        {
          id: 'organize',
          content: '📋 Organize Research Notes',
          description: 'Structure your findings effectively'
        },
        {
          id: 'analyze',
          content: '📊 Analyze Research Data',
          description: 'Make sense of your findings'
        },
        {
          id: 'write',
          content: '✍️ Write Research Paper',
          description: 'Transform research into writing'
        }
      ],
      recentResearch: this.getRecentResearchTopics(),
      savedSources: this.getSavedSources(),
      tips: [
        "Always verify information from multiple sources",
        "Keep detailed notes with source information",
        "Look for peer-reviewed sources when possible",
        "Question everything - be a critical thinker!"
      ]
    };
  }

  // Helper methods
  private extractResearchTopic(intent: any): string {
    const input = intent.originalInput.toLowerCase();
    // Extract topic using keyword matching or NLP
    if (input.includes('climate')) return 'Climate Change';
    if (input.includes('technology')) return 'Technology Impact';
    if (input.includes('history')) return 'Historical Events';
    return 'General Research';
  }

  private determineResearchDepth(): string {
    const depths = {
      'K-2': 'basic',
      '3-5': 'introductory',
      '6-8': 'intermediate',
      '9-12': 'advanced'
    };
    return depths[this.context.gradeLevel] || 'intermediate';
  }

  private formulateResearchQuestion(topic: string): string {
    return `How does ${topic} impact our understanding of the world?`;
  }

  private selectResearchApproach(topic: string): string {
    const approaches = ['qualitative', 'quantitative', 'mixed-methods'];
    // Select based on topic nature
    return approaches[0];
  }

  private getResearchMethods(topic: string): string[] {
    return ['Literature review', 'Data analysis', 'Surveys', 'Interviews', 'Observations'];
  }

  private getResearchTools(): string[] {
    return ['Search engines', 'Academic databases', 'Citation managers', 'Note-taking apps'];
  }

  private getPrimarySources(topic: string): any[] {
    return [
      { type: 'Original research', example: 'Scientific studies' },
      { type: 'Historical documents', example: 'Letters, diaries' },
      { type: 'Raw data', example: 'Statistics, surveys' }
    ];
  }

  private getSecondarySources(topic: string): any[] {
    return [
      { type: 'Review articles', example: 'Literature reviews' },
      { type: 'Textbooks', example: 'Academic texts' },
      { type: 'Analyses', example: 'Expert commentary' }
    ];
  }

  private getRecommendedReadings(topic: string): any[] {
    return [
      { title: 'Introduction to Research Methods', level: 'beginner' },
      { title: 'Critical Thinking in Research', level: 'intermediate' },
      { title: 'Advanced Research Techniques', level: 'advanced' }
    ];
  }

  private generateHypothesis(topic: string): string {
    return `If we investigate ${topic}, then we will discover...`;
  }

  private identifyVariables(topic: string): any {
    return {
      independent: 'What we change',
      dependent: 'What we measure',
      controlled: 'What we keep constant'
    };
  }

  private identifyControls(topic: string): string[] {
    return ['Time', 'Location', 'Sample size', 'Methods'];
  }

  private getMinWordCount(paperType: string): number {
    const counts = {
      'K-2': 50,
      '3-5': 200,
      '6-8': 500,
      '9-12': 1000
    };
    return counts[this.context.gradeLevel] || 500;
  }

  private getMaxWordCount(paperType: string): number {
    const counts = {
      'K-2': 200,
      '3-5': 500,
      '6-8': 1000,
      '9-12': 2500
    };
    return counts[this.context.gradeLevel] || 1000;
  }

  private getRecentResearchTopics(): string[] {
    // Get from user history
    return ['Solar System', 'Ancient Civilizations', 'Ecosystems'];
  }

  private getSavedSources(): any[] {
    return Array.from(this.sources.values()).slice(0, 5);
  }

  /**
   * Special research methods
   */
  public async startResearchProject(topic: string): Promise<AIContentResponseV2> {
    this.addToHistory('system', `Starting research project on ${topic}`);
    this.researchTopics.set(topic, { startDate: new Date(), status: 'active' });
    return this.processInput(`I want to research ${topic}`);
  }

  public async saveSource(source: any): void {
    const sourceId = `source-${Date.now()}`;
    this.sources.set(sourceId, source);
    this.citations.push(this.formatCitation(source));
  }

  private formatCitation(source: any): string {
    // Format based on citation style
    return `${source.author} (${source.year}). ${source.title}. ${source.publisher}.`;
  }

  public async generateBibliography(): Promise<string[]> {
    return this.citations.sort();
  }
}

// Singleton instance
export const researcherFinn = new ResearcherFinnModalAdapter();

// Add missing modal type
declare module '../../ai-engine/types' {
  export enum ModalTypeEnum {
    CITATION = 'CitationModal',
    PROJECT = 'ProjectModal'
  }
}