/**
 * Career Match AI Orchestrator
 * Manages AI player turns and decision-making for Career Match game
 *
 * Architecture:
 * - Watches for AI player turns via realtime subscriptions
 * - Simulates realistic delays (think time + flip time)
 * - Memory-based AI: remembers previously seen cards
 * - Difficulty-based memory accuracy (easy: 30%, medium: 60%, hard: 90%)
 */

import CareerMatchService from './CareerMatchService';
import type { CMSessionParticipant, CMCard } from '@/types/CareerMatchTypes';

interface AIMemory {
  [position: number]: {
    careerId: string;
    careerName: string;
    pairId: number;
    seenAt: number;
  };
}

interface AIPlayerState {
  participant: CMSessionParticipant;
  memory: AIMemory;
  memoryAccuracy: number; // 0.3, 0.6, or 0.9
}

export class CareerMatchAIOrchestrator {
  private static instance: CareerMatchAIOrchestrator;
  private aiPlayers: Map<string, AIPlayerState> = new Map(); // participantId -> state
  private activeSessions: Set<string> = new Set(); // sessionIds being monitored
  private isProcessing: boolean = false;

  private constructor() {
    console.log('🤖 [CareerMatchAI] AI Orchestrator initialized');
  }

  static getInstance(): CareerMatchAIOrchestrator {
    if (!CareerMatchAIOrchestrator.instance) {
      CareerMatchAIOrchestrator.instance = new CareerMatchAIOrchestrator();
    }
    return CareerMatchAIOrchestrator.instance;
  }

  /**
   * Start monitoring a game session for AI turns
   */
  async startMonitoring(sessionId: string): Promise<void> {
    if (this.activeSessions.has(sessionId)) {
      console.log(`🤖 [CareerMatchAI] Already monitoring session ${sessionId}`);
      return;
    }

    console.log(`🤖 [CareerMatchAI] Starting monitoring for session ${sessionId}`);
    this.activeSessions.add(sessionId);

    // Initialize AI players for this session
    await this.initializeAIPlayers(sessionId);

    // Start checking for AI turns
    this.checkForAITurn(sessionId);
  }

  /**
   * Stop monitoring a session
   */
  stopMonitoring(sessionId: string): void {
    console.log(`🤖 [CareerMatchAI] Stopping monitoring for session ${sessionId}`);
    this.activeSessions.delete(sessionId);

    // Clear AI player state for this session
    for (const [participantId, state] of this.aiPlayers.entries()) {
      if (state.participant.game_session_id === sessionId) {
        this.aiPlayers.delete(participantId);
      }
    }
  }

  /**
   * Initialize AI player states
   */
  private async initializeAIPlayers(sessionId: string): Promise<void> {
    try {
      const participants = await CareerMatchService.getSessionParticipants(sessionId);
      const aiParticipants = participants.filter(p => p.participant_type === 'ai_agent');

      for (const participant of aiParticipants) {
        const memoryAccuracy = this.getMemoryAccuracy(participant.ai_difficulty);

        this.aiPlayers.set(participant.id, {
          participant,
          memory: {},
          memoryAccuracy,
        });

        console.log(`🤖 [CareerMatchAI] Initialized AI player ${participant.display_name} (${participant.ai_difficulty}, accuracy: ${memoryAccuracy})`);
      }
    } catch (error) {
      console.error(`🤖 [CareerMatchAI] Error initializing AI players:`, error);
    }
  }

  /**
   * Get memory accuracy based on difficulty
   */
  private getMemoryAccuracy(difficulty: string | null): number {
    switch (difficulty) {
      case 'easy': return 0.3;
      case 'medium': return 0.6;
      case 'hard': return 0.9;
      default: return 0.6;
    }
  }

  /**
   * Check if it's an AI player's turn and take action
   */
  private async checkForAITurn(sessionId: string): Promise<void> {
    if (!this.activeSessions.has(sessionId) || this.isProcessing) {
      return;
    }

    try {
      this.isProcessing = true;

      const state = await CareerMatchService.getGameState({ game_session_id: sessionId });

      // Check if game is still active
      if (state.session.status !== 'active') {
        this.stopMonitoring(sessionId);
        return;
      }

      // Find current turn player
      const currentPlayer = state.participants.find(p => p.is_active_turn);

      if (!currentPlayer) {
        console.log(`🤖 [CareerMatchAI] No active player found`);
        this.isProcessing = false;
        // Schedule next check
        setTimeout(() => this.checkForAITurn(sessionId), 2000);
        return;
      }

      // Check if it's an AI player
      if (currentPlayer.participant_type !== 'ai_agent') {
        console.log(`🤖 [CareerMatchAI] User turn: ${currentPlayer.display_name}`);
        this.isProcessing = false;
        // Schedule next check
        setTimeout(() => this.checkForAITurn(sessionId), 2000);
        return;
      }

      // It's an AI turn!
      console.log(`🤖 [CareerMatchAI] AI turn: ${currentPlayer.display_name}`);
      await this.takeAITurn(sessionId, currentPlayer, state.cards, state.session);

    } catch (error) {
      console.error(`🤖 [CareerMatchAI] Error checking for AI turn:`, error);
    } finally {
      this.isProcessing = false;

      // Schedule next check
      if (this.activeSessions.has(sessionId)) {
        setTimeout(() => this.checkForAITurn(sessionId), 2000);
      }
    }
  }

  /**
   * Execute an AI turn
   */
  private async takeAITurn(sessionId: string, participant: CMSessionParticipant, cards: CMCard[], session: any): Promise<void> {
    const aiState = this.aiPlayers.get(participant.id);
    if (!aiState) {
      console.error(`🤖 [CareerMatchAI] AI state not found for ${participant.display_name}`);
      return;
    }

    // Simulate think time (2s - 4s) - increased for debugging
    const thinkTime = 2000 + Math.random() * 2000;
    await this.delay(thinkTime);

    // Get unmatched cards, excluding first_card_flipped if it exists
    // (is_revealed column removed in schema simplification - use session.first_card_flipped instead)
    const firstCardFlipped = session.first_card_flipped;
    const availableCards = cards.filter(c =>
      !c.is_matched && c.position !== firstCardFlipped
    );

    if (availableCards.length === 0) {
      console.log(`🤖 [CareerMatchAI] No cards available to flip`);
      return;
    }

    // Decide which card to flip
    const cardToFlip = this.chooseCard(availableCards, aiState);

    console.log(`🤖 [CareerMatchAI] ${participant.display_name} flipping position ${cardToFlip.position}`, {
      participantId: participant.id,
      participantUserId: participant.user_id,
      participantType: participant.participant_type,
    });

    try {
      // Flip the card
      const response = await CareerMatchService.flipCard({
        game_session_id: sessionId,
        position: cardToFlip.position,
        participantId: participant.id, // Use participant ID for AI players
      });

      // Update memory
      this.updateMemory(aiState, cardToFlip.position, cardToFlip);

      // If this was the first flip of the turn, wait and flip second card
      if (response.is_first_flip) {
        await this.delay(3000); // Delay before second flip - increased for debugging

        // Choose second card
        const secondCard = this.chooseSecondCard(availableCards, aiState, cardToFlip, response.card);

        if (secondCard) {
          console.log(`🤖 [CareerMatchAI] ${participant.display_name} flipping second card at position ${secondCard.position}`);

          const secondResponse = await CareerMatchService.flipCard({
            game_session_id: sessionId,
            position: secondCard.position,
            participantId: participant.id, // Use participant ID for AI players
          });

          // Update memory
          this.updateMemory(aiState, secondCard.position, secondCard);

          if (secondResponse.is_match) {
            console.log(`🤖 [CareerMatchAI] ${participant.display_name} found a match! 🎉`);
          } else {
            console.log(`🤖 [CareerMatchAI] ${participant.display_name} no match`);
          }
        }
      }
    } catch (error) {
      console.error(`🤖 [CareerMatchAI] Error during AI turn:`, error);
    }
  }

  /**
   * Choose which card to flip
   */
  private chooseCard(availableCards: CMCard[], aiState: AIPlayerState): CMCard {
    // Check if AI remembers any matching pairs
    if (Math.random() < aiState.memoryAccuracy) {
      // Try to find a known match in memory
      for (const card of availableCards) {
        const position = card.position;

        // Check if we remember this card's pair
        for (const [memPos, memCard] of Object.entries(aiState.memory)) {
          const memPosition = parseInt(memPos);
          if (memPosition !== position && memCard.pairId === card.pair_id) {
            // Found a remembered match!
            const pairCard = availableCards.find(c => c.position === memPosition);
            if (pairCard) {
              console.log(`🤖 [CareerMatchAI] Remembered match: positions ${position} and ${memPosition}`);
              return card;
            }
          }
        }
      }
    }

    // No remembered match, pick random card
    return availableCards[Math.floor(Math.random() * availableCards.length)];
  }

  /**
   * Choose second card to flip
   */
  private chooseSecondCard(
    availableCards: CMCard[],
    aiState: AIPlayerState,
    firstCardChosen: CMCard,
    firstCardRevealed: any
  ): CMCard | null {
    const remainingCards = availableCards.filter(c => c.position !== firstCardChosen.position);

    if (remainingCards.length === 0) {
      return null;
    }

    // Check if AI remembers the pair for the first card
    if (Math.random() < aiState.memoryAccuracy) {
      for (const [memPos, memCard] of Object.entries(aiState.memory)) {
        const memPosition = parseInt(memPos);
        if (memCard.pairId === firstCardRevealed.pair_id && memPosition !== firstCardChosen.position) {
          const pairCard = remainingCards.find(c => c.position === memPosition);
          if (pairCard) {
            console.log(`🤖 [CareerMatchAI] Trying to match with remembered card at position ${memPosition}`);
            return pairCard;
          }
        }
      }
    }

    // No remembered match, pick random
    return remainingCards[Math.floor(Math.random() * remainingCards.length)];
  }

  /**
   * Update AI memory after seeing a card
   */
  private updateMemory(aiState: AIPlayerState, position: number, card: CMCard): void {
    // Only remember if it passes the memory accuracy check
    if (Math.random() < aiState.memoryAccuracy) {
      aiState.memory[position] = {
        careerId: card.id,
        careerName: card.career_name,
        pairId: card.pair_id,
        seenAt: Date.now(),
      };
    }
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const careerMatchAIOrchestrator = CareerMatchAIOrchestrator.getInstance();
export default careerMatchAIOrchestrator;
