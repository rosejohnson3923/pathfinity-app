/**
 * Explorer Finn Modal Adapter
 * Handles discovery and exploration through modals
 */

import { BaseFinnModalAdapter, FinnAgentConfig } from '../base-modal-adapter';
import { ModalTypeEnum } from '../../ai-engine/types';

const EXPLORER_CONFIG: FinnAgentConfig = {
  agentId: 'explorer-finn',
  agentName: 'Explorer Finn',
  defaultContainer: 'DISCOVER',
  supportedModalTypes: [
    ModalTypeEnum.SCENARIO,
    ModalTypeEnum.SIMULATION,
    ModalTypeEnum.TIMELINE,
    ModalTypeEnum.HOTSPOT,
    ModalTypeEnum.GRAPH_CHART,
    ModalTypeEnum.DRAG_DROP,
    ModalTypeEnum.SINGLE_SELECT,
    ModalTypeEnum.GAME
  ],
  personality: {
    tone: 'playful',
    avatar: '/assets/agents/explorer-finn.png',
    color: '#10B981' // Emerald
  }
};

export class ExplorerFinnModalAdapter extends BaseFinnModalAdapter {
  constructor() {
    super(EXPLORER_CONFIG);
  }

  /**
   * Generate exploration content
   */
  protected async generateContent(intent: any, modalType: ModalTypeEnum): Promise<any> {
    switch (modalType) {
      case ModalTypeEnum.SCENARIO:
        return this.generateScenarioContent(intent);
      
      case ModalTypeEnum.SIMULATION:
        return this.generateSimulationContent(intent);
      
      case ModalTypeEnum.TIMELINE:
        return this.generateTimelineContent(intent);
      
      case ModalTypeEnum.HOTSPOT:
        return this.generateHotspotContent(intent);
      
      case ModalTypeEnum.GRAPH_CHART:
        return this.generateGraphContent(intent);
      
      default:
        return this.generateDefaultExplorationContent(intent);
    }
  }

  /**
   * Generate scenario exploration content
   */
  private generateScenarioContent(intent: any): any {
    const scenarios = this.getExplorationScenarios();
    const scenario = this.selectScenarioBasedOnContext(scenarios);
    
    return {
      title: "🗺️ Exploration Scenario",
      scenario: {
        setting: scenario.setting,
        challenge: scenario.challenge,
        choices: scenario.choices.map(choice => ({
          id: `choice-${Math.random().toString(36).substr(2, 9)}`,
          text: choice.text,
          consequence: choice.consequence,
          leadsTo: choice.leadsTo
        })),
        currentState: scenario.initialState,
        resources: scenario.resources
      },
      instruction: "Explore this scenario and make choices to discover different outcomes!",
      hint: "Think carefully about each choice - they all lead somewhere interesting!"
    };
  }

  /**
   * Generate simulation content
   */
  private generateSimulationContent(intent: any): any {
    return {
      title: "🔬 Interactive Simulation",
      simulation: {
        type: this.getSimulationType(),
        parameters: this.getSimulationParameters(),
        initialState: this.getInitialSimulationState(),
        controls: [
          { name: 'Speed', type: 'slider', min: 0, max: 10, default: 5 },
          { name: 'Temperature', type: 'slider', min: 0, max: 100, default: 20 },
          { name: 'Pressure', type: 'slider', min: 0, max: 10, default: 1 }
        ]
      },
      instruction: "Adjust the controls to see how the simulation changes!",
      objectives: [
        "Observe what happens when you increase the temperature",
        "Try different combinations of settings",
        "Find the optimal configuration"
      ]
    };
  }

  /**
   * Generate timeline content
   */
  private generateTimelineContent(intent: any): any {
    const topic = this.extractTopicFromIntent(intent);
    
    return {
      title: `📅 Timeline: ${topic}`,
      timeline: {
        events: this.generateTimelineEvents(topic),
        startDate: this.getStartDate(topic),
        endDate: this.getEndDate(topic),
        markers: this.getImportantMarkers(topic)
      },
      instruction: "Explore events along the timeline to learn more!",
      interactive: true,
      allowZoom: true
    };
  }

  /**
   * Generate hotspot content
   */
  private generateHotspotContent(intent: any): any {
    return {
      title: "🎯 Discovery Hotspots",
      image: this.getExplorationImage(),
      hotspots: [
        {
          id: 'hs1',
          x: 150,
          y: 200,
          radius: 30,
          label: 'Discovery Point 1',
          content: 'Click to learn more about this area!'
        },
        {
          id: 'hs2',
          x: 400,
          y: 150,
          radius: 30,
          label: 'Discovery Point 2',
          content: 'Another interesting fact awaits here!'
        },
        {
          id: 'hs3',
          x: 300,
          y: 350,
          radius: 30,
          label: 'Discovery Point 3',
          content: 'Explore this hidden gem!'
        }
      ],
      instruction: "Click on the glowing spots to discover hidden information!",
      completionRequirement: 'all' // Must click all hotspots
    };
  }

  /**
   * Generate graph/chart content
   */
  private generateGraphContent(intent: any): any {
    return {
      title: "📊 Data Explorer",
      chartType: 'interactive-line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Discovery Progress',
            data: [12, 19, 23, 25, 32, 38],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          },
          {
            label: 'Learning Points',
            data: [8, 15, 18, 22, 28, 35],
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)'
          }
        ]
      },
      instruction: "Interact with the graph to explore the data patterns!",
      interactive: {
        zoom: true,
        pan: true,
        tooltip: true,
        legend: true
      }
    };
  }

  /**
   * Generate default exploration content
   */
  private generateDefaultExplorationContent(intent: any): any {
    return {
      title: "🌟 Let's Explore!",
      question: "What would you like to discover today?",
      options: [
        {
          id: 'opt1',
          content: '🌍 Explore World Geography',
          isCorrect: true,
          feedback: 'Great choice! Geography is full of amazing discoveries!'
        },
        {
          id: 'opt2',
          content: '🔬 Discover Science Mysteries',
          isCorrect: true,
          feedback: 'Excellent! Science has endless wonders to explore!'
        },
        {
          id: 'opt3',
          content: '📚 Journey Through History',
          isCorrect: true,
          feedback: 'Wonderful! History is filled with fascinating stories!'
        },
        {
          id: 'opt4',
          content: '🎨 Explore Art & Culture',
          isCorrect: true,
          feedback: 'Amazing! Art and culture offer beautiful discoveries!'
        }
      ],
      instruction: "Choose your exploration path - all paths lead to adventure!"
    };
  }

  // Helper methods
  private getExplorationScenarios(): any[] {
    return [
      {
        setting: 'Ancient Pyramid',
        challenge: 'Find the hidden treasure',
        choices: [
          {
            text: 'Enter through the main entrance',
            consequence: 'You trigger an ancient mechanism',
            leadsTo: 'puzzle_room'
          },
          {
            text: 'Look for a secret entrance',
            consequence: 'You discover a hidden passage',
            leadsTo: 'secret_chamber'
          }
        ],
        initialState: 'entrance',
        resources: ['Torch', 'Map', 'Rope']
      },
      {
        setting: 'Space Station',
        challenge: 'Repair the oxygen system',
        choices: [
          {
            text: 'Check the control panel',
            consequence: 'You find an error code',
            leadsTo: 'diagnostics'
          },
          {
            text: 'Inspect the oxygen tanks',
            consequence: 'You notice a leak',
            leadsTo: 'repair_bay'
          }
        ],
        initialState: 'command_center',
        resources: ['Toolkit', 'Scanner', 'Spare Parts']
      }
    ];
  }

  private selectScenarioBasedOnContext(scenarios: any[]): any {
    // Select based on grade level and subject
    const gradeIndex = ['K-2', '3-5', '6-8', '9-12'].indexOf(this.context.gradeLevel);
    return scenarios[Math.min(gradeIndex, scenarios.length - 1)];
  }

  private getSimulationType(): string {
    const types = ['physics', 'chemistry', 'biology', 'ecology', 'astronomy'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getSimulationParameters(): any {
    return {
      gravity: 9.8,
      friction: 0.3,
      elasticity: 0.7
    };
  }

  private getInitialSimulationState(): any {
    return {
      particles: 100,
      temperature: 20,
      pressure: 1,
      volume: 1000
    };
  }

  private extractTopicFromIntent(intent: any): string {
    // Extract topic from user input
    const input = intent.originalInput.toLowerCase();
    if (input.includes('history')) return 'World History';
    if (input.includes('science')) return 'Scientific Discoveries';
    if (input.includes('space')) return 'Space Exploration';
    if (input.includes('nature')) return 'Natural Wonders';
    return 'Amazing Discoveries';
  }

  private generateTimelineEvents(topic: string): any[] {
    // Generate topic-specific timeline events
    return [
      {
        date: '1900',
        title: 'Early Discovery',
        description: 'The journey begins...',
        importance: 'high'
      },
      {
        date: '1950',
        title: 'Major Breakthrough',
        description: 'A significant milestone is reached...',
        importance: 'critical'
      },
      {
        date: '2000',
        title: 'Modern Era',
        description: 'Technology transforms everything...',
        importance: 'high'
      },
      {
        date: '2024',
        title: 'Current Day',
        description: 'Where we are now...',
        importance: 'medium'
      }
    ];
  }

  private getStartDate(topic: string): string {
    return '1900';
  }

  private getEndDate(topic: string): string {
    return '2024';
  }

  private getImportantMarkers(topic: string): any[] {
    return [
      { date: '1969', label: 'Moon Landing', type: 'milestone' },
      { date: '1989', label: 'Internet Era', type: 'revolution' },
      { date: '2007', label: 'Mobile Revolution', type: 'innovation' }
    ];
  }

  private getExplorationImage(): string {
    const images = [
      '/assets/exploration/world-map.jpg',
      '/assets/exploration/solar-system.jpg',
      '/assets/exploration/ancient-ruins.jpg',
      '/assets/exploration/ocean-depths.jpg'
    ];
    return images[Math.floor(Math.random() * images.length)];
  }

  /**
   * Special exploration methods
   */
  public async startGuidedExploration(topic: string): Promise<AIContentResponseV2> {
    this.addToHistory('system', `Starting guided exploration of ${topic}`);
    return this.processInput(`I want to explore ${topic} with interactive activities`);
  }

  public async createExplorationPath(interests: string[]): Promise<AIContentResponseV2[]> {
    const responses = [];
    
    for (const interest of interests) {
      const response = await this.processInput(`Show me something interesting about ${interest}`);
      responses.push(response);
    }
    
    return responses;
  }
}

// Singleton instance
export const explorerFinn = new ExplorerFinnModalAdapter();