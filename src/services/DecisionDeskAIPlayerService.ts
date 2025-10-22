/**
 * Decision Desk AI Player Service
 * Handles AI player automated gameplay for The Decision Desk
 *
 * AI players automatically:
 * - Start game sessions when human player starts
 * - Select executives (random or weighted by scenario)
 * - Select solutions (mix of perfect and imperfect)
 * - Submit solutions with realistic timing
 * - Update scores on leaderboard
 */

import { careerChallengeService } from './CareerChallengeService';
import type { CSuiteRole, SolutionCard, BusinessScenario } from '../types/CareerChallengeTypes';

export type AIDifficulty =
  | 'beginner'   // Random choices, 1-2 perfect solutions
  | 'steady'     // Mix of good choices, 2-3 perfect solutions
  | 'skilled'    // Good choices, 3-4 perfect solutions
  | 'expert';    // Optimal play, 4-5 perfect solutions

export interface AIPlayerConfig {
  playerId: string;
  displayName: string;
  difficulty: AIDifficulty;
  delaySeconds: number; // How long to wait before submitting
}

class DecisionDeskAIPlayerService {
  private static instance: DecisionDeskAIPlayerService;
  private activeSimulations: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): DecisionDeskAIPlayerService {
    if (!DecisionDeskAIPlayerService.instance) {
      DecisionDeskAIPlayerService.instance = new DecisionDeskAIPlayerService();
    }
    return DecisionDeskAIPlayerService.instance;
  }

  /**
   * Start AI player simulations for a room
   * Called when human player starts a game
   */
  async simulateAIPlayers(
    roomId: string,
    aiPlayers: AIPlayerConfig[],
    scenario: BusinessScenario,
    allSolutions: SolutionCard[],
    perfectSolutionIds: string[],
    gradeCategory?: 'elementary' | 'middle' | 'high'
  ): Promise<void> {
    console.log(`🤖 Starting AI player simulations for ${aiPlayers.length} players in room ${roomId}`);

    for (const aiPlayer of aiPlayers) {
      // Start each AI player's game asynchronously
      this.simulateSingleAIPlayer(
        roomId,
        aiPlayer,
        scenario,
        allSolutions,
        perfectSolutionIds,
        gradeCategory
      ).catch(error => {
        console.error(`❌ Error simulating AI player ${aiPlayer.displayName}:`, error);
      });
    }
  }

  /**
   * Simulate a single AI player's gameplay
   */
  private async simulateSingleAIPlayer(
    roomId: string,
    aiPlayer: AIPlayerConfig,
    scenario: BusinessScenario,
    allSolutions: SolutionCard[],
    perfectSolutionIds: string[],
    gradeCategory?: 'elementary' | 'middle' | 'high'
  ): Promise<void> {
    const simulationKey = `${roomId}-${aiPlayer.playerId}`;

    // Clear any existing simulation for this player
    if (this.activeSimulations.has(simulationKey)) {
      clearTimeout(this.activeSimulations.get(simulationKey)!);
    }

    // Wait for AI's "thinking time" before submitting
    const timeout = setTimeout(async () => {
      try {
        console.log(`🤖 ${aiPlayer.displayName} is making decisions...`);

        // 1. Create session for AI player
        const session = await careerChallengeService.startExecutiveDecisionSession(
          roomId,
          aiPlayer.playerId,
          3, // difficulty level
          gradeCategory
        );

        if (!session) {
          console.error(`❌ Failed to create session for AI player ${aiPlayer.displayName}`);
          return;
        }

        // 2. Select executive (random or weighted by scenario)
        const selectedExecutive = this.selectExecutive(scenario, aiPlayer.difficulty);
        console.log(`🤖 ${aiPlayer.displayName} selected ${selectedExecutive}`);

        await careerChallengeService.selectExecutive(session.id, selectedExecutive);

        // 3. Select solutions based on difficulty
        const selectedSolutions = this.selectSolutions(
          allSolutions,
          perfectSolutionIds,
          aiPlayer.difficulty
        );

        console.log(`🤖 ${aiPlayer.displayName} selected ${selectedSolutions.length} solutions`);

        // 4. Submit solutions
        const result = await careerChallengeService.submitSolutions(
          session.id,
          selectedSolutions.map(s => s.id),
          aiPlayer.delaySeconds
        );

        if (result) {
          console.log(`✅ ${aiPlayer.displayName} completed game with score: ${result.totalScore}`);
        }

        // Clean up
        this.activeSimulations.delete(simulationKey);
      } catch (error) {
        console.error(`❌ Error in AI player ${aiPlayer.displayName} simulation:`, error);
        this.activeSimulations.delete(simulationKey);
      }
    }, aiPlayer.delaySeconds * 1000);

    this.activeSimulations.set(simulationKey, timeout);
  }

  /**
   * Select executive based on AI difficulty
   */
  private selectExecutive(scenario: BusinessScenario, difficulty: AIDifficulty): CSuiteRole {
    const executives: CSuiteRole[] = ['CEO', 'CFO', 'CMO', 'COO', 'CTO'];

    switch (difficulty) {
      case 'beginner':
        // Random selection
        return executives[Math.floor(Math.random() * executives.length)];

      case 'steady':
        // 50% chance to pick optimal, 50% random
        if (Math.random() < 0.5 && scenario.optimalExecutive) {
          return scenario.optimalExecutive;
        }
        return executives[Math.floor(Math.random() * executives.length)];

      case 'skilled':
        // 70% chance to pick optimal
        if (Math.random() < 0.7 && scenario.optimalExecutive) {
          return scenario.optimalExecutive;
        }
        return executives[Math.floor(Math.random() * executives.length)];

      case 'expert':
        // 90% chance to pick optimal
        if (Math.random() < 0.9 && scenario.optimalExecutive) {
          return scenario.optimalExecutive;
        }
        return executives[Math.floor(Math.random() * executives.length)];

      default:
        return executives[Math.floor(Math.random() * executives.length)];
    }
  }

  /**
   * Select solutions based on AI difficulty
   */
  private selectSolutions(
    allSolutions: SolutionCard[],
    perfectSolutionIds: string[],
    difficulty: AIDifficulty
  ): SolutionCard[] {
    const perfectSolutions = allSolutions.filter(s => perfectSolutionIds.includes(s.id));
    const imperfectSolutions = allSolutions.filter(s => !perfectSolutionIds.includes(s.id));

    let perfectCount = 0;
    let imperfectCount = 5;

    // Determine how many perfect solutions to pick based on difficulty
    switch (difficulty) {
      case 'beginner':
        perfectCount = Math.floor(Math.random() * 2) + 1; // 1-2 perfect
        break;
      case 'steady':
        perfectCount = Math.floor(Math.random() * 2) + 2; // 2-3 perfect
        break;
      case 'skilled':
        perfectCount = Math.floor(Math.random() * 2) + 3; // 3-4 perfect
        break;
      case 'expert':
        perfectCount = Math.floor(Math.random() * 2) + 4; // 4-5 perfect
        break;
    }

    imperfectCount = 5 - perfectCount;

    // Randomly select solutions
    const selectedPerfect = this.shuffleArray([...perfectSolutions]).slice(0, perfectCount);
    const selectedImperfect = this.shuffleArray([...imperfectSolutions]).slice(0, imperfectCount);

    return this.shuffleArray([...selectedPerfect, ...selectedImperfect]).slice(0, 5);
  }

  /**
   * Shuffle array (Fisher-Yates)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate AI player configs with varied difficulties and delays
   */
  generateAIPlayerConfigs(aiPlayerIds: { id: string; name: string }[]): AIPlayerConfig[] {
    const difficulties: AIDifficulty[] = ['beginner', 'steady', 'skilled', 'expert'];

    return aiPlayerIds.map((aiPlayer, index) => {
      // Distribute difficulties across AI players
      const difficulty = difficulties[index % difficulties.length];

      // Vary submission time (8-20 seconds)
      const delaySeconds = 8 + Math.random() * 12;

      return {
        playerId: aiPlayer.id,
        displayName: aiPlayer.name,
        difficulty,
        delaySeconds
      };
    });
  }

  /**
   * Cancel all active simulations for a room
   */
  cancelSimulations(roomId: string): void {
    console.log(`🛑 Canceling AI simulations for room ${roomId}`);

    for (const [key, timeout] of this.activeSimulations.entries()) {
      if (key.startsWith(roomId)) {
        clearTimeout(timeout);
        this.activeSimulations.delete(key);
      }
    }
  }

  /**
   * Cancel simulation for specific player
   */
  cancelPlayerSimulation(roomId: string, playerId: string): void {
    const simulationKey = `${roomId}-${playerId}`;
    const timeout = this.activeSimulations.get(simulationKey);

    if (timeout) {
      clearTimeout(timeout);
      this.activeSimulations.delete(simulationKey);
      console.log(`🛑 Canceled AI simulation for ${playerId}`);
    }
  }
}

export const decisionDeskAIPlayerService = DecisionDeskAIPlayerService.getInstance();
export default decisionDeskAIPlayerService;
