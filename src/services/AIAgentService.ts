/**
 * AI Agent Service
 * Simulates AI players for multiplayer Discovered Live! games
 *
 * Features:
 * - Realistic click behavior based on difficulty
 * - Variable response times
 * - Human-like names (e.g., "Sara S.", "James T.")
 * - Grid-aware position finding
 */

import type {
  AIAgentConfig,
  AIClickDecision,
  SessionParticipant,
  BingoGrid,
  GridPosition,
} from '../types/DiscoveredLiveMultiplayerTypes';
import type { CareerClue } from '../types/DiscoveredLiveTypes';

/**
 * Reserved name combinations to avoid conflicts with:
 * - AI Companions: Finn, Harmony, Sage, Spark
 * - Demo Users: Sam B., Alex D., Jordan S., Taylor J.
 */
const RESERVED_NAMES = ['Finn', 'Harmony', 'Sage', 'Spark'];
const RESERVED_NAME_COMBOS = ['Sam B.', 'Alex D.', 'Jordan S.', 'Taylor J.'];

/**
 * Human-like names for AI players in multiplayer games
 * Format: FirstName LastInitial.
 * NOTE: Can use Sam, Alex, Jordan, Taylor but with DIFFERENT last initials
 * Avoided combinations: Sam B., Alex D., Jordan S., Taylor J.
 */
const AI_PLAYER_NAMES = [
  // Female names
  'Sara S.', 'Emily R.', 'Maya P.', 'Sophia L.', 'Ava C.',
  'Isabella H.', 'Mia D.', 'Charlotte F.', 'Amelia W.', 'Harper B.',
  'Ella K.', 'Grace M.', 'Lily N.', 'Chloe T.', 'Zoe J.',
  'Nora V.', 'Hannah G.', 'Layla Q.', 'Riley X.', 'Aria Z.',

  // Male names
  'James T.', 'Lucas M.', 'Noah W.', 'Ethan B.', 'Mason J.',
  'Logan H.', 'Oliver K.', 'Elijah R.', 'Aiden P.', 'Jackson D.',
  'Liam F.', 'Carter N.', 'Owen G.', 'Leo V.', 'Henry C.',
  'Jack S.', 'Ryan L.', 'Tyler Q.', 'Dylan X.', 'Caleb Z.',

  // Gender-neutral names (OK to use Sam, Alex, Jordan, Taylor with different last initials)
  'Sam W.', 'Alex Y.', 'Jordan E.', 'Taylor I.', 'Casey A.', 'Morgan O.',
  'Jamie U.', 'Quinn R.', 'Avery P.', 'Dakota M.',
];

/**
 * Predefined AI Agent Configurations
 */
export const AI_AGENT_PRESETS: Record<string, AIAgentConfig> = {
  Beginner: {
    difficulty: 'easy',
    personality: 'Beginner',
    displayName: 'Beginner', // Will be replaced with human name
    accuracyRate: 0.6,           // 60% correct
    avgResponseTime: 2.5,        // Fast clicks (2.5s)
    responseTimeVariance: 1.0,   // +/- 1s
    mistakeRate: 0.4,            // 40% mistakes
  },
  Steady: {
    difficulty: 'medium',
    personality: 'Steady',
    displayName: 'Steady', // Will be replaced with human name
    accuracyRate: 0.75,          // 75% correct
    avgResponseTime: 4.0,        // Medium speed (4s)
    responseTimeVariance: 1.5,   // +/- 1.5s
    mistakeRate: 0.25,           // 25% mistakes
  },
  Skilled: {
    difficulty: 'hard',
    personality: 'Skilled',
    displayName: 'Skilled', // Will be replaced with human name
    accuracyRate: 0.9,           // 90% correct
    avgResponseTime: 6.0,        // Slow but accurate (6s)
    responseTimeVariance: 2.0,   // +/- 2s
    mistakeRate: 0.1,            // 10% mistakes
  },
  Expert: {
    difficulty: 'expert',
    personality: 'Expert',
    displayName: 'Expert', // Will be replaced with human name
    accuracyRate: 0.95,          // 95% correct
    avgResponseTime: 3.0,        // Fast AND accurate (3s)
    responseTimeVariance: 1.0,   // +/- 1s
    mistakeRate: 0.05,           // 5% mistakes
  },
};

/**
 * AI Agent Service
 */
class AIAgentService {
  private static instance: AIAgentService;

  private constructor() {}

  static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  /**
   * Get a random unused human name
   */
  private getRandomHumanName(usedNames: Set<string>): string {
    const availableNames = AI_PLAYER_NAMES.filter(name => !usedNames.has(name));

    if (availableNames.length === 0) {
      // If all names are used, append a number to a random name
      const baseName = AI_PLAYER_NAMES[Math.floor(Math.random() * AI_PLAYER_NAMES.length)];
      const nameWithoutDot = baseName.replace('.', '');
      return `${nameWithoutDot} ${Math.floor(Math.random() * 100)}`;
    }

    return availableNames[Math.floor(Math.random() * availableNames.length)];
  }

  /**
   * Create an AI agent with specified difficulty or preset
   */
  createAgent(
    difficulty: 'easy' | 'medium' | 'hard' | 'expert',
    customName?: string
  ): AIAgentConfig {
    const presetKey = Object.keys(AI_AGENT_PRESETS).find(
      key => AI_AGENT_PRESETS[key].difficulty === difficulty
    );

    const preset = presetKey ? AI_AGENT_PRESETS[presetKey] : AI_AGENT_PRESETS.Steady;

    return {
      ...preset,
      displayName: customName || preset.displayName,
    };
  }

  /**
   * Create a mixed team of AI agents with realistic human names
   */
  createMixedTeam(count: number): AIAgentConfig[] {
    const agents: AIAgentConfig[] = [];
    const difficulties: Array<'easy' | 'medium' | 'hard' | 'expert'> = ['easy', 'medium', 'hard', 'expert'];
    const usedNames = new Set<string>();

    for (let i = 0; i < count; i++) {
      // Distribute difficulties evenly
      const difficultyIndex = i % difficulties.length;
      const difficulty = difficulties[difficultyIndex];

      // Assign a unique human name
      const humanName = this.getRandomHumanName(usedNames);
      usedNames.add(humanName);

      agents.push(this.createAgent(difficulty, humanName));
    }

    return agents;
  }

  /**
   * Simulate AI agent deciding which square to click
   *
   * @param clue - The current clue/question
   * @param agentCard - The AI agent's unique bingo card
   * @param config - The AI agent's configuration
   * @returns Click decision with position and response time
   */
  async decideClick(
    clue: CareerClue,
    agentCard: BingoGrid,
    config: AIAgentConfig
  ): Promise<AIClickDecision> {
    const correctCareer = clue.careerCode;

    // 1. Determine if AI will answer correctly based on accuracy rate
    const shouldAnswerCorrectly = Math.random() < config.accuracyRate;

    let targetCareer: string;
    let foundPosition: GridPosition | null = null;
    let confidence: number;

    if (shouldAnswerCorrectly) {
      // Find correct career on agent's card
      targetCareer = correctCareer;
      foundPosition = this.findCareerOnGrid(agentCard, targetCareer);
      confidence = 0.8 + Math.random() * 0.2; // 80-100% confidence

      if (!foundPosition) {
        // Fallback: correct career not on card (shouldn't happen in well-designed game)
        // Click random square as panic click
        foundPosition = this.getRandomPosition(agentCard);
        targetCareer = this.getCareerAtPosition(agentCard, foundPosition);
        confidence = 0.3; // Low confidence
        console.warn(`AI couldn't find correct career ${correctCareer} on card`);
      }
    } else {
      // Pick a random wrong career from the card
      const allCareers = agentCard.careers.flat().filter(c => c !== correctCareer);
      targetCareer = allCareers[Math.floor(Math.random() * allCareers.length)];
      foundPosition = this.findCareerOnGrid(agentCard, targetCareer);
      confidence = 0.3 + Math.random() * 0.4; // 30-70% confidence (wrong answer)

      if (!foundPosition) {
        // Fallback: pick random square
        foundPosition = this.getRandomPosition(agentCard);
        targetCareer = this.getCareerAtPosition(agentCard, foundPosition);
      }
    }

    // 2. Calculate realistic response time based on difficulty
    const responseTime = this.calculateResponseTime(config, shouldAnswerCorrectly);

    return {
      careerCode: targetCareer,
      position: foundPosition,
      responseTime,
      confidence,
    };
  }

  /**
   * Find career position on a bingo grid
   */
  private findCareerOnGrid(grid: BingoGrid, careerCode: string): GridPosition | null {
    for (let row = 0; row < grid.careers.length; row++) {
      for (let col = 0; col < grid.careers[row].length; col++) {
        if (grid.careers[row][col] === careerCode) {
          return { row, col };
        }
      }
    }
    return null;
  }

  /**
   * Get career code at a specific position
   */
  private getCareerAtPosition(grid: BingoGrid, position: GridPosition): string {
    return grid.careers[position.row][position.col];
  }

  /**
   * Get a random valid position on the grid
   */
  private getRandomPosition(grid: BingoGrid): GridPosition {
    const rows = grid.careers.length;
    const cols = grid.careers[0].length;

    return {
      row: Math.floor(Math.random() * rows),
      col: Math.floor(Math.random() * cols),
    };
  }

  /**
   * Calculate realistic response time based on agent config
   *
   * Factors:
   * - Base response time from config
   * - Random variance
   * - Slightly faster for correct answers (pattern recognition)
   * - Minimum 1 second (even experts need time)
   */
  private calculateResponseTime(config: AIAgentConfig, isCorrect: boolean): number {
    let baseTime = config.avgResponseTime;

    // Correct answers are slightly faster (better pattern recognition)
    if (isCorrect) {
      baseTime *= 0.9;
    }

    // Add random variance
    const variance = (Math.random() - 0.5) * 2 * config.responseTimeVariance;
    let responseTime = baseTime + variance;

    // Ensure minimum 1 second, maximum 15 seconds
    responseTime = Math.max(1.0, Math.min(15.0, responseTime));

    // Round to 2 decimal places
    return Math.round(responseTime * 100) / 100;
  }

  /**
   * Batch process: Get click decisions for multiple agents
   */
  async batchDecideClicks(
    clue: CareerClue,
    participants: SessionParticipant[]
  ): Promise<Map<string, AIClickDecision>> {
    const decisions = new Map<string, AIClickDecision>();

    // Get only AI participants
    const aiParticipants = participants.filter(p => p.participantType === 'ai_agent');

    // Process each AI agent
    for (const participant of aiParticipants) {
      if (!participant.aiDifficulty || !participant.aiPersonality) {
        console.warn(`AI participant ${participant.id} missing difficulty/personality`);
        continue;
      }

      const config = this.createAgent(
        participant.aiDifficulty,
        participant.displayName
      );

      const decision = await this.decideClick(
        clue,
        participant.bingoCard,
        config
      );

      decisions.set(participant.id, decision);
    }

    return decisions;
  }

  /**
   * Simulate AI click delay (for scheduling clicks after question starts)
   */
  scheduleAIClick(
    participantId: string,
    decision: AIClickDecision,
    onClickReady: (participantId: string, decision: AIClickDecision) => void
  ): NodeJS.Timeout {
    const delayMs = decision.responseTime * 1000;

    return setTimeout(() => {
      onClickReady(participantId, decision);
    }, delayMs);
  }

  /**
   * Generate a unique AI agent name with number suffix
   */
  generateUniqueName(personality: string, existingNames: Set<string>): string {
    let name = personality;
    let counter = 1;

    while (existingNames.has(name)) {
      counter++;
      name = `${personality}${counter}`;
    }

    return name;
  }

  /**
   * Get AI difficulty distribution for a room
   * Returns count of each difficulty level
   */
  getBalancedDifficultyMix(totalAI: number): Array<'easy' | 'medium' | 'hard' | 'expert'> {
    const difficulties: Array<'easy' | 'medium' | 'hard' | 'expert'> = [];

    // Distribution pattern: 1 easy, 2 medium, 1 hard (repeating)
    const pattern: Array<'easy' | 'medium' | 'hard' | 'expert'> = ['easy', 'medium', 'medium', 'hard'];

    for (let i = 0; i < totalAI; i++) {
      difficulties.push(pattern[i % pattern.length]);
    }

    return difficulties;
  }

  /**
   * Simulate AI "thinking" animation state
   * Returns sequence of states: idle -> thinking -> ready
   */
  getThinkingStates(responseTime: number): Array<{ state: string; durationMs: number }> {
    const thinkingTime = responseTime * 1000 * 0.7; // 70% of time spent "thinking"
    const readyTime = responseTime * 1000 * 0.3;    // 30% of time in "ready" state

    return [
      { state: 'idle', durationMs: 100 },
      { state: 'thinking', durationMs: thinkingTime },
      { state: 'ready', durationMs: readyTime },
      { state: 'clicked', durationMs: 0 },
    ];
  }
}

export const aiAgentService = AIAgentService.getInstance();
export type { AIAgentConfig, AIClickDecision };
