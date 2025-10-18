/**
 * CCM AI Player Service
 * Handles AI player decision-making for perpetual room games
 *
 * Note: This is different from CareerChallengeAIService (content generation).
 * This service makes gameplay decisions for AI agents filling empty seats.
 */

import { supabase } from '../lib/supabase';
import { CCMParticipantState } from './CCMGameEngine';

export type AIPersonality =
  | 'conservative'   // Plays safe, avoids risks
  | 'balanced'       // Mix of strategies
  | 'aggressive';    // Takes risks for high scores

export type AIDifficulty =
  | 'beginner'   // Makes obvious mistakes, random choices
  | 'steady'     // Decent choices, some mistakes
  | 'skilled'    // Good choices, occasional optimal plays
  | 'expert';    // Near-optimal play, uses advanced strategies

export interface AIDecision {
  roleCardId: string;
  synergyCardId: string;
  useGoldenCard: boolean;
  useMvpBonus: boolean;
  confidence: number; // 0-100
  reasoning?: string; // For debugging
}

export class CCMAIPlayerService {
  private static instance: CCMAIPlayerService;
  private supabase: any;

  private constructor() {
    this.initSupabase();
  }

  static getInstance(): CCMAIPlayerService {
    if (!CCMAIPlayerService.instance) {
      CCMAIPlayerService.instance = new CCMAIPlayerService();
    }
    return CCMAIPlayerService.instance;
  }

  private async initSupabase() {
    this.supabase = await supabase();
  }

  /**
   * Make a card selection decision for an AI player
   */
  async makeDecision(
    participant: CCMParticipantState,
    challengeCard: any,
    difficulty: AIDifficulty = 'steady',
    personality: AIPersonality = 'balanced'
  ): Promise<AIDecision> {
    // Get available cards
    const roleCards = participant.roleHand;
    const synergyCards = participant.synergyHand;

    if (roleCards.length === 0 || synergyCards.length === 0) {
      throw new Error('AI player has no cards available');
    }

    // Decision-making based on difficulty
    switch (difficulty) {
      case 'beginner':
        return this.makeBeginnerDecision(participant, roleCards, synergyCards, challengeCard);
      case 'steady':
        return this.makeSteadyDecision(participant, roleCards, synergyCards, challengeCard, personality);
      case 'skilled':
        return this.makeSkilledDecision(participant, roleCards, synergyCards, challengeCard, personality);
      case 'expert':
        return this.makeExpertDecision(participant, roleCards, synergyCards, challengeCard, personality);
      default:
        return this.makeSteadyDecision(participant, roleCards, synergyCards, challengeCard, personality);
    }
  }

  /**
   * Beginner AI: Random choices with occasional mistakes
   */
  private makeBeginnerDecision(
    participant: CCMParticipantState,
    roleCards: string[],
    synergyCards: string[],
    challengeCard: any
  ): AIDecision {
    // Pick random cards
    const roleCardId = roleCards[Math.floor(Math.random() * roleCards.length)];
    const synergyCardId = synergyCards[Math.floor(Math.random() * synergyCards.length)];

    // Rarely use golden card (20% chance)
    const useGoldenCard = participant.hasGoldenCard && Math.random() < 0.2;

    return {
      roleCardId,
      synergyCardId,
      useGoldenCard,
      useMvpBonus: false, // Beginners don't use MVP bonuses
      confidence: 30 + Math.random() * 30, // 30-60% confidence
      reasoning: 'Random selection (Beginner AI)',
    };
  }

  /**
   * Steady AI: Decent choices with some strategy
   */
  private makeSteadyDecision(
    participant: CCMParticipantState,
    roleCards: string[],
    synergyCards: string[],
    challengeCard: any,
    personality: AIPersonality
  ): AIDecision {
    // Evaluate cards with basic scoring
    const roleScores = roleCards.map((cardId, index) => ({
      cardId,
      score: this.evaluateRoleCard(cardId, challengeCard) + Math.random() * 10, // Add randomness
    }));

    const synergyScores = synergyCards.map((cardId, index) => ({
      cardId,
      score: this.evaluateSynergyCard(cardId, challengeCard) + Math.random() * 10,
    }));

    // Sort and pick top cards (with some randomness)
    roleScores.sort((a, b) => b.score - a.score);
    synergyScores.sort((a, b) => b.score - a.score);

    // Pick from top 3 cards (not always the best)
    const topRole = roleScores[Math.floor(Math.random() * Math.min(3, roleScores.length))];
    const topSynergy = synergyScores[Math.floor(Math.random() * Math.min(3, synergyScores.length))];

    // Use golden card based on personality (40-60% chance)
    let useGoldenCard = false;
    if (participant.hasGoldenCard) {
      const goldenChance = personality === 'aggressive' ? 0.6 : personality === 'balanced' ? 0.5 : 0.4;
      useGoldenCard = Math.random() < goldenChance;
    }

    return {
      roleCardId: topRole.cardId,
      synergyCardId: topSynergy.cardId,
      useGoldenCard,
      useMvpBonus: false, // Steady AI doesn't track MVP bonuses yet
      confidence: 50 + Math.random() * 30, // 50-80% confidence
      reasoning: `Selected high-value cards (Steady AI, ${personality})`,
    };
  }

  /**
   * Skilled AI: Good choices with occasional optimal plays
   */
  private makeSkilledDecision(
    participant: CCMParticipantState,
    roleCards: string[],
    synergyCards: string[],
    challengeCard: any,
    personality: AIPersonality
  ): AIDecision {
    // More sophisticated evaluation
    const roleScores = roleCards.map(cardId => ({
      cardId,
      score: this.evaluateRoleCard(cardId, challengeCard, true), // Advanced evaluation
    }));

    const synergyScores = synergyCards.map(cardId => ({
      cardId,
      score: this.evaluateSynergyCard(cardId, challengeCard, true),
    }));

    // Skilled AI picks best cards most of the time
    roleScores.sort((a, b) => b.score - a.score);
    synergyScores.sort((a, b) => b.score - a.score);

    // 80% chance to pick best, 20% pick second best
    const roleIndex = Math.random() < 0.8 ? 0 : Math.min(1, roleScores.length - 1);
    const synergyIndex = Math.random() < 0.8 ? 0 : Math.min(1, synergyScores.length - 1);

    const selectedRole = roleScores[roleIndex];
    const selectedSynergy = synergyScores[synergyIndex];

    // Strategic golden card usage
    let useGoldenCard = false;
    if (participant.hasGoldenCard) {
      const expectedScore = selectedRole.score + selectedSynergy.score;
      const goldenThreshold = personality === 'aggressive' ? 50 : personality === 'balanced' ? 70 : 90;
      useGoldenCard = expectedScore >= goldenThreshold;
    }

    return {
      roleCardId: selectedRole.cardId,
      synergyCardId: selectedSynergy.cardId,
      useGoldenCard,
      useMvpBonus: false, // Would need to track MVP status
      confidence: 70 + Math.random() * 20, // 70-90% confidence
      reasoning: `Strategic selection based on synergy (Skilled AI, ${personality})`,
    };
  }

  /**
   * Expert AI: Near-optimal play with advanced strategies
   */
  private makeExpertDecision(
    participant: CCMParticipantState,
    roleCards: string[],
    synergyCards: string[],
    challengeCard: any,
    personality: AIPersonality
  ): AIDecision {
    // Expert evaluation with combo analysis
    let bestDecision: AIDecision = {
      roleCardId: roleCards[0],
      synergyCardId: synergyCards[0],
      useGoldenCard: false,
      useMvpBonus: false,
      confidence: 95,
      reasoning: 'Optimal combination selected (Expert AI)',
    };

    let bestScore = -Infinity;

    // Evaluate all combinations
    for (const roleCardId of roleCards) {
      for (const synergyCardId of synergyCards) {
        const comboScore = this.evaluateCombo(roleCardId, synergyCardId, challengeCard);

        // Consider golden card multiplier
        const scoreWithGolden = participant.hasGoldenCard ? comboScore * 2 : comboScore;

        if (comboScore > bestScore) {
          bestScore = comboScore;
          bestDecision = {
            roleCardId,
            synergyCardId,
            useGoldenCard: false,
            useMvpBonus: false,
            confidence: 95,
          };
        }

        // If golden card makes this the best, use it
        if (participant.hasGoldenCard && scoreWithGolden > bestScore * 1.5) {
          bestScore = scoreWithGolden;
          bestDecision = {
            roleCardId,
            synergyCardId,
            useGoldenCard: true,
            useMvpBonus: false,
            confidence: 98,
          };
        }
      }
    }

    // Apply personality adjustments
    if (personality === 'conservative' && bestDecision.useGoldenCard) {
      // Conservative AI only uses golden if significantly better
      if (bestScore < 100) {
        bestDecision.useGoldenCard = false;
      }
    } else if (personality === 'aggressive') {
      // Aggressive AI uses golden card more often
      if (participant.hasGoldenCard && !bestDecision.useGoldenCard && Math.random() < 0.3) {
        bestDecision.useGoldenCard = true;
      }
    }

    bestDecision.reasoning = `Optimal combo analysis (Expert AI, ${personality}, score: ${Math.round(bestScore)})`;

    return bestDecision;
  }

  /**
   * Evaluate a single role card's value
   */
  private evaluateRoleCard(
    roleCardId: string,
    challengeCard: any,
    advanced: boolean = false
  ): number {
    // Placeholder scoring logic
    // In production, this would query role card data and match against challenge requirements
    let score = 50 + Math.random() * 30; // Base score 50-80

    // Advanced evaluation considers more factors
    if (advanced) {
      // Check if role matches challenge requirements
      // Check base power
      // Check special abilities
      score += Math.random() * 20; // Additional bonus for advanced
    }

    return score;
  }

  /**
   * Evaluate a single synergy card's value
   */
  private evaluateSynergyCard(
    synergyCardId: string,
    challengeCard: any,
    advanced: boolean = false
  ): number {
    // Placeholder scoring logic
    // In production, this would query synergy card data
    let score = 40 + Math.random() * 30; // Base score 40-70

    if (advanced) {
      // Check synergy bonuses
      // Check category match
      score += Math.random() * 20;
    }

    return score;
  }

  /**
   * Evaluate a combination of role + synergy cards
   */
  private evaluateCombo(
    roleCardId: string,
    synergyCardId: string,
    challengeCard: any
  ): number {
    // This is where soft skills matrix would be queried
    // For now, use placeholder logic
    const roleScore = this.evaluateRoleCard(roleCardId, challengeCard, true);
    const synergyScore = this.evaluateSynergyCard(synergyCardId, challengeCard, true);

    // Combo bonus (would come from soft skills matrix)
    const comboBonus = Math.random() * 15; // 0-15 bonus

    return roleScore + synergyScore + comboBonus;
  }

  /**
   * Get random AI personality
   */
  getRandomPersonality(): AIPersonality {
    const personalities: AIPersonality[] = ['conservative', 'balanced', 'aggressive'];
    return personalities[Math.floor(Math.random() * personalities.length)];
  }

  /**
   * Get random AI difficulty (weighted towards balanced difficulties)
   */
  getRandomDifficulty(): AIDifficulty {
    const rand = Math.random();
    if (rand < 0.15) return 'beginner';
    if (rand < 0.50) return 'steady';
    if (rand < 0.85) return 'skilled';
    return 'expert';
  }
}

export const ccmAIPlayerService = CCMAIPlayerService.getInstance();
