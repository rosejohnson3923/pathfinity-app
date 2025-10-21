/**
 * Career Challenge Service
 *
 * Core service for managing Career Challenge game logic, including:
 * - Challenge selection and presentation
 * - Role card deployment and team building
 * - Synergy calculations
 * - Challenge resolution
 * - Player collections and progress
 */

import { supabase } from '../lib/supabase';
import {
  Industry,
  Challenge,
  RoleCard,
  Synergy,
  ChallengeSession,
  PlayerCollection,
  PlayerProgress,
  ChallengeResult,
  InitializeChallengeOptions,
  DeployRoleOptions,
  TeamComposition,
  dbIndustryToIndustry,
  dbChallengeToChallenge,
  dbRoleCardToRoleCard,
  // Executive Decision Maker types
  CompanyRoom,
  BusinessScenario,
  SolutionCard,
  LensEffect,
  CSuiteRole,
  ExecutiveDecisionSession,
  ExecutiveDecisionResult,
  SixCs,
  LeadershipInsights,
  ScenarioType,
  IndustryContext
} from '../types/CareerChallengeTypes';
import { scenarioManager } from './ScenarioManager';
import { lensEffectEngine } from './LensEffectEngine';
import { leadershipAnalyzer } from './LeadershipAnalyzer';
import { executiveDecisionAIService } from './ExecutiveDecisionAIService';
import { aiPlayerPoolService } from './AIPlayerPoolService';

class CareerChallengeService {
  private static instance: CareerChallengeService;
  private client: any;

  private constructor() {}

  static getInstance(): CareerChallengeService {
    if (!CareerChallengeService.instance) {
      CareerChallengeService.instance = new CareerChallengeService();
    }
    return CareerChallengeService.instance;
  }

  async initialize() {
    this.client = await supabase();
  }

  // ================================================================
  // INDUSTRY & CHALLENGE MANAGEMENT
  // ================================================================

  /**
   * Get all available industries
   */
  async getIndustries(onlyActive = true): Promise<Industry[]> {
    if (!this.client) await this.initialize();

    const query = this.client
      .from('dd_industries')
      .select('*')
      .order('name');

    if (onlyActive) {
      query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching industries:', error);
      return [];
    }

    return data?.map(dbIndustryToIndustry) || [];
  }

  /**
   * Get challenges for a specific industry
   */
  async getChallengesForIndustry(
    industryId: string,
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert'
  ): Promise<Challenge[]> {
    if (!this.client) await this.initialize();

    let query = this.client
      .from('dd_challenges')
      .select('*')
      .eq('industry_id', industryId)
      .eq('is_active', true);

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query.order('title');

    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }

    return data?.map(dbChallengeToChallenge) || [];
  }

  /**
   * Get a random challenge for quick play
   */
  async getRandomChallenge(
    industryId?: string,
    difficulty?: string
  ): Promise<Challenge | null> {
    if (!this.client) await this.initialize();

    let query = this.client
      .from('dd_challenges')
      .select('*')
      .eq('is_active', true);

    if (industryId) {
      query = query.eq('industry_id', industryId);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    // Get all matching challenges
    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      console.error('Error fetching challenges:', error);
      return null;
    }

    // Select random challenge
    const randomIndex = Math.floor(Math.random() * data.length);
    return dbChallengeToChallenge(data[randomIndex]);
  }

  // ================================================================
  // ROLE CARD MANAGEMENT
  // ================================================================

  /**
   * Get all role cards for an industry
   */
  async getRoleCardsForIndustry(industryId: string): Promise<RoleCard[]> {
    if (!this.client) await this.initialize();

    const { data, error } = await this.client
      .from('dd_role_cards')
      .select('*')
      .eq('industry_id', industryId)
      .eq('is_active', true)
      .order('rarity', { ascending: false })
      .order('base_power', { ascending: false });

    if (error) {
      console.error('Error fetching role cards:', error);
      return [];
    }

    return data?.map(dbRoleCardToRoleCard) || [];
  }

  /**
   * Get player's card collection
   */
  async getPlayerCollection(playerId: string): Promise<PlayerCollection[]> {
    if (!this.client) await this.initialize();

    const { data, error } = await this.client
      .from('dd_player_collections')
      .select(`
        *,
        dd_role_cards (*)
      `)
      .eq('player_id', playerId)
      .gt('quantity', 0)
      .order('last_acquired_at', { ascending: false });

    if (error) {
      console.error('Error fetching player collection:', error);
      return [];
    }

    return data?.map((item: any) => ({
      id: item.id,
      playerId: item.player_id,
      roleCardId: item.role_card_id,
      roleCard: item.dd_role_cards ? dbRoleCardToRoleCard(item.dd_role_cards) : undefined,
      quantity: item.quantity,
      firstAcquiredAt: item.first_acquired_at,
      lastAcquiredAt: item.last_acquired_at,
      acquisitionMethod: item.acquisition_method,
      timesUsed: item.times_used,
      winsWithCard: item.wins_with_card,
      favoritePosition: item.favorite_position,
      isTradeable: item.is_tradeable,
      isFavorite: item.is_favorite,
      tradeLockedUntil: item.trade_locked_until,
      customNickname: item.custom_nickname,
      cardLevel: item.card_level,
      cardExperience: item.card_experience,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) || [];
  }

  /**
   * Add card to player's collection
   */
  async addCardToCollection(
    playerId: string,
    roleCardId: string,
    method: 'earned' | 'traded' | 'purchased' | 'gifted' = 'earned'
  ): Promise<boolean> {
    if (!this.client) await this.initialize();

    // Check if player already owns this card
    const { data: existing } = await this.client
      .from('dd_player_collections')
      .select('id, quantity')
      .eq('player_id', playerId)
      .eq('role_card_id', roleCardId)
      .single();

    if (existing) {
      // Update quantity
      const { error } = await this.client
        .from('dd_player_collections')
        .update({
          quantity: existing.quantity + 1,
          last_acquired_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      return !error;
    } else {
      // Insert new collection entry
      const { error } = await this.client
        .from('dd_player_collections')
        .insert({
          player_id: playerId,
          role_card_id: roleCardId,
          quantity: 1,
          acquisition_method: method
        });

      return !error;
    }
  }

  // ================================================================
  // SYNERGY CALCULATIONS
  // ================================================================

  /**
   * Get applicable synergies for a team composition
   */
  async calculateSynergies(
    roleCardIds: string[],
    industryId: string
  ): Promise<{ synergies: Synergy[], totalBonus: number }> {
    if (!this.client) await this.initialize();

    // Get role codes from card IDs
    const { data: roleCards } = await this.client
      .from('dd_role_cards')
      .select('role_code')
      .in('id', roleCardIds);

    if (!roleCards) {
      return { synergies: [], totalBonus: 0 };
    }

    const roleCodes = roleCards.map(rc => rc.role_code);

    // Get all synergies for this industry
    const { data: synergies, error } = await this.client
      .from('dd_synergy_definitions')
      .select('*')
      .eq('industry_id', industryId)
      .eq('is_active', true);

    if (error || !synergies) {
      return { synergies: [], totalBonus: 0 };
    }

    // Check which synergies apply
    const applicableSynergies: Synergy[] = [];
    let totalBonus = 0;

    for (const synergy of synergies) {
      // Check if all required roles are present
      const hasAllRequired = synergy.required_roles.every(
        (required: string) => roleCodes.includes(required)
      );

      if (hasAllRequired) {
        applicableSynergies.push({
          id: synergy.id,
          industryId: synergy.industry_id,
          synergyName: synergy.synergy_name,
          synergyType: synergy.synergy_type,
          requiredRoles: synergy.required_roles,
          optionalRoles: synergy.optional_roles,
          powerBonus: synergy.power_bonus,
          powerMultiplier: synergy.power_multiplier,
          categoryBonuses: synergy.category_bonuses,
          specialEffect: synergy.special_effect,
          minChallengeDifficulty: synergy.min_challenge_difficulty,
          requiredChallengeCategory: synergy.required_challenge_category,
          activationChance: synergy.activation_chance,
          description: synergy.description,
          explanation: synergy.explanation,
          realWorldExample: synergy.real_world_example,
          timesActivated: synergy.times_activated,
          successRateWithSynergy: synergy.success_rate_with_synergy,
          isActive: synergy.is_active,
          isHidden: synergy.is_hidden,
          createdAt: synergy.created_at,
          updatedAt: synergy.updated_at
        });

        totalBonus += synergy.power_bonus || 0;
      }
    }

    return { synergies: applicableSynergies, totalBonus };
  }

  /**
   * Calculate total team power including synergies
   */
  async calculateTeamPower(
    roleCardIds: string[],
    challengeId: string
  ): Promise<{
    basePower: number;
    synergyBonus: number;
    categoryBonus: number;
    totalPower: number;
    activeSynergies: string[];
  }> {
    if (!this.client) await this.initialize();

    // Get role cards
    const { data: roleCards } = await this.client
      .from('dd_role_cards')
      .select('*')
      .in('id', roleCardIds);

    if (!roleCards) {
      return {
        basePower: 0,
        synergyBonus: 0,
        categoryBonus: 0,
        totalPower: 0,
        activeSynergies: []
      };
    }

    // Get challenge details
    const { data: challenge } = await this.client
      .from('dd_challenges')
      .select('*, dd_industries(*)')
      .eq('id', challengeId)
      .single();

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Calculate base power
    const basePower = roleCards.reduce((sum: number, card: any) => sum + card.base_power, 0);

    // Calculate category bonus
    let categoryBonus = 0;
    const challengeCategory = challenge.category;

    for (const card of roleCards) {
      if (card.category_bonuses && card.category_bonuses[challengeCategory]) {
        categoryBonus += card.category_bonuses[challengeCategory];
      }
    }

    // Calculate synergies
    const { synergies, totalBonus: synergyBonus } = await this.calculateSynergies(
      roleCardIds,
      challenge.industry_id
    );

    const activeSynergies = synergies.map(s => s.synergyName);

    const totalPower = basePower + categoryBonus + synergyBonus;

    return {
      basePower,
      synergyBonus,
      categoryBonus,
      totalPower,
      activeSynergies
    };
  }

  // ================================================================
  // CHALLENGE SESSION MANAGEMENT
  // ================================================================

  /**
   * Initialize a new challenge session
   */
  async initializeChallenge(
    options: InitializeChallengeOptions
  ): Promise<ChallengeSession> {
    if (!this.client) await this.initialize();

    const { playerId, industryCode, difficulty, roomId, sessionId } = options;

    // Get industry
    const { data: industry } = await this.client
      .from('dd_industries')
      .select('id')
      .eq('code', industryCode)
      .single();

    if (!industry) {
      throw new Error(`Industry ${industryCode} not found`);
    }

    // Get random challenge
    const challenge = await this.getRandomChallenge(industry.id, difficulty);
    if (!challenge) {
      throw new Error('No challenges available');
    }

    // Create session
    const sessionData = {
      game_session_id: sessionId,
      room_id: roomId,
      challenge_id: challenge.id,
      challenge_number: 1,
      participants: [{
        player_id: playerId,
        display_name: 'Player',
        deployed_roles: [],
        is_ai: false
      }],
      outcome: 'in_progress',
      total_team_power: 0,
      synergies_activated: [],
      total_synergy_bonus: 0,
      challenge_difficulty_score: challenge.baseDifficultyScore,
      final_team_score: 0,
      outcome_margin: 0,
      turns_taken: 0,
      hints_used: 0
    };

    const { data: session, error } = await this.client
      .from('dd_challenge_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error || !session) {
      throw new Error('Failed to create challenge session');
    }

    return {
      id: session.id,
      gameSessionId: session.game_session_id,
      roomId: session.room_id,
      challengeId: session.challenge_id,
      challenge,
      challengeNumber: session.challenge_number,
      participants: session.participants,
      totalTeamPower: session.total_team_power,
      synergiesActivated: session.synergies_activated,
      totalSynergyBonus: session.total_synergy_bonus,
      challengeDifficultyScore: session.challenge_difficulty_score,
      finalTeamScore: session.final_team_score,
      outcome: session.outcome,
      outcomeMargin: session.outcome_margin,
      turnsTaken: session.turns_taken,
      hintsUsed: session.hints_used,
      startedAt: session.started_at,
      createdAt: session.created_at
    };
  }

  /**
   * Deploy role cards to a challenge
   */
  async deployRoles(
    sessionId: string,
    playerId: string,
    roleCardIds: string[]
  ): Promise<ChallengeResult> {
    if (!this.client) await this.initialize();

    // Get session
    const { data: session } = await this.client
      .from('dd_challenge_sessions')
      .select('*, dd_challenges(*)')
      .eq('id', sessionId)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    const challenge = dbChallengeToChallenge(session.dd_challenges);

    // Validate role count
    if (roleCardIds.length < challenge.minRolesRequired ||
        roleCardIds.length > challenge.maxRolesAllowed) {
      throw new Error(`Invalid role count. Required: ${challenge.minRolesRequired}-${challenge.maxRolesAllowed}`);
    }

    // Calculate team power
    const teamPower = await this.calculateTeamPower(roleCardIds, challenge.id);

    // Evaluate challenge outcome using database function
    const { data: evaluation } = await this.client
      .rpc('dd_evaluate_challenge', {
        p_team_power: teamPower.totalPower,
        p_challenge_id: challenge.id
      });

    const outcome = evaluation || 'failure';
    const outcomeMargin = teamPower.totalPower - challenge.baseDifficultyScore;

    // Calculate rewards
    let xpEarned = 0;
    const cardsEarned: RoleCard[] = [];
    const newAchievements: string[] = [];

    switch (outcome) {
      case 'perfect':
        xpEarned = 100;
        newAchievements.push('Perfect Challenge!');
        // Award a rare card
        const { data: rareCard } = await this.client
          .from('dd_role_cards')
          .select('*')
          .eq('industry_id', session.dd_challenges.industry_id)
          .in('rarity', ['rare', 'epic'])
          .limit(1)
          .single();
        if (rareCard) {
          cardsEarned.push(dbRoleCardToRoleCard(rareCard));
          await this.addCardToCollection(playerId, rareCard.id);
        }
        break;
      case 'success':
        xpEarned = 50;
        // Award a common card
        const { data: commonCard } = await this.client
          .from('dd_role_cards')
          .select('*')
          .eq('industry_id', session.dd_challenges.industry_id)
          .in('rarity', ['common', 'uncommon'])
          .limit(1)
          .single();
        if (commonCard) {
          cardsEarned.push(dbRoleCardToRoleCard(commonCard));
          await this.addCardToCollection(playerId, commonCard.id);
        }
        break;
      case 'failure':
        xpEarned = 10; // Participation XP
        break;
    }

    // Update session
    await this.client
      .from('dd_challenge_sessions')
      .update({
        team_composition: {
          formation: 'balanced',
          roles: roleCardIds,
          totalRoles: roleCardIds.length
        },
        total_team_power: teamPower.totalPower,
        synergies_activated: teamPower.activeSynergies,
        total_synergy_bonus: teamPower.synergyBonus,
        final_team_score: teamPower.totalPower,
        outcome,
        outcome_margin: outcomeMargin,
        xp_awarded: { [playerId]: xpEarned },
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    // Update player progress
    await this.updatePlayerProgress(playerId, outcome, xpEarned);

    // Update card usage stats
    for (const cardId of roleCardIds) {
      await this.updateCardUsageStats(playerId, cardId, outcome === 'success' || outcome === 'perfect');
    }

    return {
      success: outcome !== 'failure',
      outcome: outcome as 'success' | 'failure' | 'perfect',
      score: teamPower.totalPower,
      margin: outcomeMargin,
      xpEarned,
      cardsEarned,
      newAchievements,
      teamPerformance: {
        mvpRole: roleCardIds[0], // TODO: Calculate actual MVP
        synergiesUsed: teamPower.activeSynergies,
        missedSynergies: [] // TODO: Calculate missed synergies
      }
    };
  }

  // ================================================================
  // PLAYER PROGRESS
  // ================================================================

  /**
   * Get player progress
   */
  async getPlayerProgress(playerId: string): Promise<PlayerProgress | null> {
    if (!this.client) await this.initialize();

    const { data, error } = await this.client
      .from('dd_player_progress')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error || !data) {
      // Create initial progress record if doesn't exist
      if (error?.code === 'PGRST116') { // No rows returned
        const { data: newProgress } = await this.client
          .from('dd_player_progress')
          .insert({
            player_id: playerId,
            total_challenges_attempted: 0,
            total_challenges_succeeded: 0,
            total_challenges_perfect: 0,
            total_cards_collected: 0,
            unique_cards_collected: 0,
            total_xp: 0,
            current_level: 1,
            xp_to_next_level: 100,
            prestige_level: 0,
            current_win_streak: 0,
            best_win_streak: 0,
            trades_completed: 0,
            gifts_sent: 0,
            gifts_received: 0,
            friend_challenges_won: 0
          })
          .select()
          .single();

        return newProgress ? this.mapDbProgressToProgress(newProgress) : null;
      }
      return null;
    }

    return this.mapDbProgressToProgress(data);
  }

  /**
   * Update player progress after challenge
   */
  private async updatePlayerProgress(
    playerId: string,
    outcome: string,
    xpEarned: number
  ): Promise<void> {
    if (!this.client) await this.initialize();

    const progress = await this.getPlayerProgress(playerId);
    if (!progress) return;

    const updates: any = {
      total_challenges_attempted: progress.totalChallengesAttempted + 1,
      total_xp: progress.totalXp + xpEarned,
      last_played_at: new Date().toISOString()
    };

    if (outcome === 'success' || outcome === 'perfect') {
      updates.total_challenges_succeeded = progress.totalChallengesSucceeded + 1;
      updates.current_win_streak = progress.currentWinStreak + 1;

      if (updates.current_win_streak > progress.bestWinStreak) {
        updates.best_win_streak = updates.current_win_streak;
      }

      if (outcome === 'perfect') {
        updates.total_challenges_perfect = progress.totalChallengesPerfect + 1;
      }
    } else {
      updates.current_win_streak = 0;
    }

    // Calculate win rate
    updates.win_rate = (updates.total_challenges_succeeded / updates.total_challenges_attempted * 100).toFixed(2);

    // Check for level up
    if (updates.total_xp >= progress.xpToNextLevel) {
      updates.current_level = progress.currentLevel + 1;
      updates.xp_to_next_level = progress.xpToNextLevel + 50; // Increase requirement
    }

    await this.client
      .from('dd_player_progress')
      .update(updates)
      .eq('player_id', playerId);
  }

  /**
   * Update card usage statistics
   */
  private async updateCardUsageStats(
    playerId: string,
    cardId: string,
    won: boolean
  ): Promise<void> {
    if (!this.client) await this.initialize();

    const { data: collection } = await this.client
      .from('dd_player_collections')
      .select('times_used, wins_with_card')
      .eq('player_id', playerId)
      .eq('role_card_id', cardId)
      .single();

    if (collection) {
      const updates: any = {
        times_used: collection.times_used + 1
      };

      if (won) {
        updates.wins_with_card = collection.wins_with_card + 1;
      }

      await this.client
        .from('dd_player_collections')
        .update(updates)
        .eq('player_id', playerId)
        .eq('role_card_id', cardId);
    }
  }

  /**
   * Map database progress to typed progress
   */
  private mapDbProgressToProgress(db: any): PlayerProgress {
    return {
      id: db.id,
      playerId: db.player_id,
      totalChallengesAttempted: db.total_challenges_attempted,
      totalChallengesSucceeded: db.total_challenges_succeeded,
      totalChallengesPerfect: db.total_challenges_perfect,
      winRate: db.win_rate,
      totalCardsCollected: db.total_cards_collected,
      uniqueCardsCollected: db.unique_cards_collected,
      rarestCardRarity: db.rarest_card_rarity,
      favoriteIndustryId: db.favorite_industry_id,
      totalXp: db.total_xp,
      currentLevel: db.current_level,
      xpToNextLevel: db.xp_to_next_level,
      prestigeLevel: db.prestige_level,
      achievementsEarned: db.achievements_earned || [],
      industriesUnlocked: db.industries_unlocked || [],
      specialCardsUnlocked: db.special_cards_unlocked || [],
      titlesEarned: db.titles_earned || [],
      preferredTeamSize: db.preferred_team_size,
      favoriteRoleCards: db.favorite_role_cards,
      preferredDifficulty: db.preferred_difficulty,
      avgSessionLength: db.avg_session_length,
      tradesCompleted: db.trades_completed,
      giftsSent: db.gifts_sent,
      giftsReceived: db.gifts_received,
      friendChallengesWon: db.friend_challenges_won,
      currentWinStreak: db.current_win_streak,
      bestWinStreak: db.best_win_streak,
      fastestChallengeTime: db.fastest_challenge_time,
      highestTeamPower: db.highest_team_power,
      lastPlayedAt: db.last_played_at,
      lastChallengeId: db.last_challenge_id,
      lastIndustryPlayed: db.last_industry_played,
      createdAt: db.created_at,
      updatedAt: db.updated_at
    };
  }

  // ================================================================
  // GAME SESSION MANAGEMENT
  // ================================================================

  /**
   * Create a new game session
   */
  async createSession(
    hostPlayerId: string,
    industryId: string,
    roomCode: string,
    hostDisplayName: string = 'Host'
  ): Promise<any> {
    if (!this.client) await this.initialize();

    const { data, error } = await this.client
      .from('dd_game_sessions')
      .insert({
        host_player_id: hostPlayerId,
        industry_id: industryId,
        room_code: roomCode,
        status: 'waiting',
        max_players: 6,
        current_players: 1,
        victory_condition: { type: 'score', target: 100 }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating game session:', error);
      return null;
    }

    // Add host as first player
    if (data) {
      const { error: playerError } = await this.client
        .from('dd_game_session_players')
        .insert({
          session_id: data.id,
          player_id: hostPlayerId,
          display_name: hostDisplayName,
          is_ready: false,
          is_host: true,
          join_order: 1
        });

      if (playerError) {
        console.error('Error adding host player:', playerError);
        // Continue anyway - the session was created successfully
      }
    }

    return data;
  }

  /**
   * Join an existing game session
   */
  async joinSession(
    sessionId: string,
    playerId: string
  ): Promise<boolean> {
    if (!this.client) await this.initialize();

    // Check if session exists and has room
    const { data: session } = await this.client
      .from('dd_game_sessions')
      .select('current_players, max_players, status')
      .eq('id', sessionId)
      .single();

    if (!session || session.status !== 'waiting' || session.current_players >= session.max_players) {
      return false;
    }

    // Check if player is already in the session
    const { data: existingPlayer } = await this.client
      .from('dd_game_session_players')
      .select('id')
      .eq('session_id', sessionId)
      .eq('player_id', playerId)
      .single();

    if (existingPlayer) {
      console.log('Player already in session');
      return true; // Player is already in the session
    }

    // Add player to session
    const { error } = await this.client
      .from('dd_game_session_players')
      .insert({
        session_id: sessionId,
        player_id: playerId,
        display_name: `Player ${session.current_players + 1}`,
        is_ready: false,
        is_host: false,
        join_order: session.current_players + 1
      });

    if (error) {
      console.error('Error adding player to session:', error);
      return false;
    }

    // Update player count
    await this.client
      .from('dd_game_sessions')
      .update({ current_players: session.current_players + 1 })
      .eq('id', sessionId);

    return true;
  }

  /**
   * Get active game sessions
   */
  async getActiveSessions(): Promise<any[]> {
    if (!this.client) await this.initialize();

    const { data, error } = await this.client
      .from('dd_game_sessions')
      .select('*')
      .in('status', ['waiting', 'playing'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active sessions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get a specific game session
   */
  async getSession(sessionId: string): Promise<any> {
    if (!this.client) await this.initialize();

    const { data, error } = await this.client
      .from('dd_game_sessions')
      .select(`
        *,
        dd_game_session_players (*)
      `)
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }

    return data;
  }

  /**
   * End a game session
   */
  async endSession(sessionId: string, winnerId?: string): Promise<boolean> {
    if (!this.client) await this.initialize();

    const { error } = await this.client
      .from('dd_game_sessions')
      .update({
        status: 'finished',
        winner_player_id: winnerId,
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    return !error;
  }

  /**
   * Get challenges by industry for multiplayer
   */
  async getChallengesByIndustry(
    industryId: string,
    limit: number = 3
  ): Promise<Challenge[]> {
    if (!this.client) await this.initialize();

    // Get all challenges for the industry
    const { data, error } = await this.client
      .from('dd_challenges')
      .select('*')
      .eq('industry_id', industryId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Randomly select challenges
    const shuffled = data.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(limit, data.length));

    return selected.map(dbChallengeToChallenge);
  }

  /**
   * Draw role cards for a player
   */
  async drawRoleCards(
    sessionId: string,
    playerId: string,
    count: number = 3
  ): Promise<RoleCard[]> {
    if (!this.client) await this.initialize();

    // Get session industry
    const { data: session } = await this.client
      .from('dd_game_sessions')
      .select('industry_id')
      .eq('id', sessionId)
      .single();

    if (!session) return [];

    // Get all role cards for the industry
    const { data: cards, error } = await this.client
      .from('dd_role_cards')
      .select('*')
      .eq('industry_id', session.industry_id)
      .eq('is_active', true);

    if (error) {
      console.error('Error drawing role cards:', error);
      return [];
    }

    if (!cards || cards.length === 0) return [];

    // Randomly select cards with weighted probability based on rarity
    const weightedCards = cards.flatMap(card => {
      // Give different weights based on rarity
      const weight = card.rarity === 'common' ? 4 :
                    card.rarity === 'uncommon' ? 3 :
                    card.rarity === 'rare' ? 2 :
                    card.rarity === 'epic' ? 1 : 1;
      return Array(weight).fill(card);
    });

    const shuffled = weightedCards.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, cards.length));

    return selected.map(dbRoleCardToRoleCard);
  }

  /**
   * Attempt a challenge in multiplayer
   */
  async attemptChallenge(
    sessionId: string,
    playerId: string,
    challengeId: string,
    roleCardIds: string[]
  ): Promise<{ success: boolean; score: number; bonuses?: any[] }> {
    if (!this.client) await this.initialize();

    // Calculate team power
    const teamPower = await this.calculateTeamPower(roleCardIds, challengeId);

    // Get challenge
    const { data: challenge } = await this.client
      .from('dd_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (!challenge) {
      return { success: false, score: 0 };
    }

    // Determine success
    const success = teamPower.totalPower >= challenge.base_difficulty_score;
    let score = success ? challenge.base_points : Math.floor(challenge.base_points * 0.3);

    const bonuses = [];

    // Perfect score bonus
    if (teamPower.totalPower >= challenge.base_difficulty_score * 1.5) {
      bonuses.push({
        type: 'perfect',
        value: challenge.base_points * 0.5,
        description: 'Perfect execution!'
      });
      score += challenge.base_points * 0.5;
    }

    // Synergy bonus
    if (teamPower.synergyBonus > 0) {
      bonuses.push({
        type: 'synergy',
        value: teamPower.synergyBonus * 10,
        description: `${teamPower.activeSynergies.length} synergies activated`
      });
      score += teamPower.synergyBonus * 10;
    }

    return { success, score: Math.floor(score), bonuses };
  }

  // ================================================================
  // DAILY CHALLENGES
  // ================================================================

  /**
   * Get today's daily challenge
   */
  async getDailyChallenge(): Promise<Challenge | null> {
    if (!this.client) await this.initialize();

    const today = new Date().toISOString().split('T')[0];

    const { data } = await this.client
      .from('dd_daily_challenges')
      .select(`
        *,
        dd_challenges (*)
      `)
      .eq('active_date', today)
      .eq('challenge_type', 'daily')
      .single();

    if (data?.dd_challenges) {
      return dbChallengeToChallenge(data.dd_challenges);
    }

    // If no daily challenge exists, create one
    return this.createDailyChallenge();
  }

  /**
   * Create a new daily challenge
   */
  private async createDailyChallenge(): Promise<Challenge | null> {
    if (!this.client) await this.initialize();

    // Get a random challenge
    const challenge = await this.getRandomChallenge();
    if (!challenge) return null;

    const today = new Date().toISOString().split('T')[0];

    await this.client
      .from('dd_daily_challenges')
      .insert({
        challenge_id: challenge.id,
        active_date: today,
        challenge_type: 'daily',
        bonus_xp: 50,
        bonus_cards: [],
        special_reward_description: 'Complete today\'s challenge for bonus XP!'
      });

    return challenge;
  }

  // ================================================================
  // EXECUTIVE DECISION MAKER MODE
  // ================================================================

  /**
   * Get all company rooms filtered by grade category
   * Returns age-appropriate company rooms with complete data (name, description, etc.)
   */
  async getCompanyRooms(gradeCategory?: 'elementary' | 'middle' | 'high'): Promise<CompanyRoom[]> {
    if (!this.client) await this.initialize();

    // Determine which grade_category to filter by
    // Elementary (K-5) gets 'elementary' rooms, middle/high (6-12) gets 'other' rooms
    const dbGradeCategory = gradeCategory === 'elementary' ? 'elementary' : 'other';

    const { data, error } = await this.client
      .from('dd_company_rooms')
      .select(`
        *,
        dd_industries (*)
      `)
      .eq('is_active', true)
      .eq('grade_category', dbGradeCategory)
      .order('created_at');

    if (error) {
      console.error('Error fetching company rooms:', error);
      return [];
    }

    return data?.map((room: any) => ({
      id: room.id,
      code: room.code,
      name: room.name,
      industryId: room.industry_id,
      industry: room.dd_industries ? dbIndustryToIndustry(room.dd_industries) : undefined,
      description: room.description,
      companySize: room.company_size,
      revenue: room.revenue,
      headquarters: room.headquarters,
      knownFor: room.known_for,
      colorScheme: room.color_scheme || { primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA' },
      logoIcon: room.logo_icon,
      isActive: room.is_active,
      playerCapacity: room.player_capacity,
      difficultyModifier: room.difficulty_modifier,
      currentPlayers: 0, // Runtime property, would be calculated from active sessions
    })) || [];
  }

  /**
   * Join a company room and create a session-specific instance
   * Each player gets their own session with their own set of AI opponents
   */
  async joinCompanyRoomAndCreateSession(
    roomId: string,
    playerId: string,
    displayName: string,
    targetPlayerCount: number = 6
  ): Promise<string | null> {
    if (!this.client) await this.initialize();

    try {
      // Check if player already has an active session in this room
      const { data: existingSession, error: checkError } = await this.client
        .from('dd_game_session_players')
        .select('session_id')
        .eq('player_id', playerId)
        .eq('room_id', roomId)
        .eq('is_active', true)
        .not('session_id', 'is', null)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if no existing session
        console.warn(`⚠️ Error checking for existing session (might be missing room_id column):`, checkError);
      }

      if (existingSession?.session_id) {
        console.log(`Player ${displayName} already has session ${existingSession.session_id}`);
        return existingSession.session_id;
      }

      // Create a lobby session for this player
      const { data: session, error: sessionError } = await this.client
        .from('dd_executive_sessions')
        .insert({
          room_id: roomId,
          player_id: playerId,
          status: 'lobby', // New status for waiting in lobby
          total_score: 0,
        })
        .select()
        .single();

      if (sessionError || !session) {
        console.error('Error creating session:', sessionError);
        return null;
      }

      console.log(`✅ Created session ${session.id} for ${displayName} in room ${roomId}`);

      // Add player to session
      const { error: playerInsertError } = await this.client
        .from('dd_game_session_players')
        .insert({
          session_id: session.id,
          room_id: roomId,
          player_id: playerId,
          display_name: displayName,
          is_ready: true,
          is_host: true,
          is_active: true,
          join_order: 1
        });

      if (playerInsertError) {
        console.error(`❌ Error adding player to session:`, playerInsertError);
        // Continue anyway - player might already exist
      }

      // Add AI players to this specific session
      const aiPlayersNeeded = targetPlayerCount - 1; // -1 for the human player
      const aiPlayers = aiPlayerPoolService.getRandomPlayers(aiPlayersNeeded, `${roomId}-${session.id}`);

      for (let i = 0; i < aiPlayers.length; i++) {
        const aiPlayer = aiPlayers[i];
        const { error: aiInsertError } = await this.client
          .from('dd_game_session_players')
          .insert({
            session_id: session.id,
            room_id: roomId,
            player_id: aiPlayer.id,
            display_name: aiPlayer.name,
            is_ready: true,
            is_host: false,
            is_active: true,
            join_order: i + 2
          });

        if (aiInsertError) {
          console.error(`❌ Error adding AI player ${aiPlayer.name}:`, aiInsertError);
          // Continue anyway - player might already exist
        }
      }

      console.log(`✅ Added ${aiPlayers.length} AI players to session:`, aiPlayers.map(p => p.name).join(', '));

      return session.id;
    } catch (error) {
      console.error('Error joining room and creating session:', error);
      return null;
    }
  }

  /**
   * Join a company room (legacy method, consider using joinCompanyRoomAndCreateSession instead)
   */
  async joinCompanyRoom(
    roomId: string,
    playerId: string,
    displayName: string
  ): Promise<boolean> {
    if (!this.client) await this.initialize();

    // Check if room exists and has space
    const { data: room } = await this.client
      .from('dd_company_rooms')
      .select('current_players, max_players')
      .eq('id', roomId)
      .single();

    if (!room || room.current_players >= room.max_players) {
      return false;
    }

    // Check if player is already in a room
    const { data: existingPlayer } = await this.client
      .from('dd_game_session_players')
      .select('id')
      .eq('player_id', playerId)
      .eq('room_id', roomId)
      .eq('is_active', true)
      .single();

    if (existingPlayer) {
      return true; // Already in room
    }

    // Add player to room
    const { error } = await this.client
      .from('dd_game_session_players')
      .insert({
        session_id: null, // Will be set when game starts
        room_id: roomId,
        player_id: playerId,
        display_name: displayName,
        is_ready: true,
        is_host: false,
        is_active: true,
        join_order: room.current_players + 1
      });

    if (error) {
      console.error('Error joining room:', error);
      return false;
    }

    // Update room player count
    await this.client
      .from('dd_company_rooms')
      .update({ current_players: room.current_players + 1 })
      .eq('id', roomId);

    return true;
  }

  /**
   * Populate room with AI players from centralized pool
   * Uses AIPlayerPoolService to ensure consistent AI player names across all games
   */
  async populateRoomWithAIPlayers(
    roomId: string,
    targetPlayerCount: number = 4
  ): Promise<void> {
    if (!this.client) await this.initialize();

    try {
      // First, clean up any old AI players with generic "Player" names
      // These are from before the centralized AI pool was implemented
      const { data: oldAIPlayers } = await this.client
        .from('dd_game_session_players')
        .select('id')
        .eq('room_id', roomId)
        .eq('display_name', 'Player')
        .eq('is_active', true);

      if (oldAIPlayers && oldAIPlayers.length > 0) {
        console.log(`🧹 Removing ${oldAIPlayers.length} old generic AI players from room ${roomId}`);
        await this.client
          .from('dd_game_session_players')
          .delete()
          .eq('room_id', roomId)
          .eq('display_name', 'Player');
      }

      // Get current player count in room
      const { data: room } = await this.client
        .from('dd_company_rooms')
        .select('current_players, max_players')
        .eq('id', roomId)
        .single();

      if (!room) {
        console.error('Room not found:', roomId);
        return;
      }

      // Recalculate actual player count after cleanup
      const { data: activePlayers } = await this.client
        .from('dd_game_session_players')
        .select('id')
        .eq('room_id', roomId)
        .eq('is_active', true);

      const currentPlayerCount = activePlayers?.length || 0;
      const maxPlayers = Math.min(targetPlayerCount, room.max_players);
      const aiPlayersNeeded = maxPlayers - currentPlayerCount;

      if (aiPlayersNeeded <= 0) {
        console.log(`[Room ${roomId}] Already has ${currentPlayerCount} players, no AI needed`);
        // Update room player count to match reality
        await this.client
          .from('dd_company_rooms')
          .update({ current_players: currentPlayerCount })
          .eq('id', roomId);
        return;
      }

      console.log(`[Room ${roomId}] Adding ${aiPlayersNeeded} AI players (current: ${currentPlayerCount}, target: ${maxPlayers})`);

      // Get AI players from centralized pool
      const aiPlayers = aiPlayerPoolService.getRandomPlayers(aiPlayersNeeded, roomId);

      // Add each AI player to dd_game_session_players table
      for (let i = 0; i < aiPlayers.length; i++) {
        const aiPlayer = aiPlayers[i];

        const { error } = await this.client
          .from('dd_game_session_players')
          .insert({
            session_id: null,
            room_id: roomId,
            player_id: aiPlayer.id,
            display_name: aiPlayer.name,
            is_ready: true,
            is_host: false,
            is_active: true,
            join_order: currentPlayerCount + i + 1
          });

        if (error) {
          console.error(`Error adding AI player ${aiPlayer.name}:`, error);
        }
      }

      // Update room player count
      await this.client
        .from('dd_company_rooms')
        .update({ current_players: currentPlayerCount + aiPlayers.length })
        .eq('id', roomId);

      console.log(`✅ Added ${aiPlayers.length} AI players to room:`, aiPlayers.map(p => p.name).join(', '));
    } catch (error) {
      console.error('Error populating room with AI players:', error);
    }
  }

  /**
   * Start an Executive Decision session
   */
  async startExecutiveDecisionSession(
    roomId: string,
    playerId: string,
    difficultyLevel: number = 3,
    gradeCategory?: 'elementary' | 'middle' | 'high'
  ): Promise<ExecutiveDecisionSession | null> {
    if (!this.client) await this.initialize();

    // Get room and industry context
    const { data: room } = await this.client
      .from('dd_company_rooms')
      .select(`
        *,
        dd_industries (*)
      `)
      .eq('id', roomId)
      .single();

    if (!room) {
      console.error('Room not found');
      return null;
    }

    // Validate that the industry relationship is properly loaded
    if (!room.dd_industries) {
      console.error('Industry data not found for room');
      return null;
    }

    // Create industry context
    const industryContext: IndustryContext = {
      industryId: room.industry_id,
      industryName: room.dd_industries.name,
      industryCode: room.dd_industries.code,
      companySize: room.company_size,
      companyAge: room.company_age,
      companyValues: room.company_values,
    };

    // Generate scenario using AI (for all grade levels)
    console.log('🤖 Generating AI scenario for grade category:', gradeCategory);

    // Select random scenario type and business driver
    const scenarioTypes: ScenarioType[] = ['crisis', 'risk', 'opportunity'];
    const businessDrivers = ['people', 'product', 'financial', 'market', 'technology', 'proceeds'];

    const scenarioType = scenarioTypes[Math.floor(Math.random() * scenarioTypes.length)];
    const businessDriver = businessDrivers[Math.floor(Math.random() * businessDrivers.length)];

    let scenario: BusinessScenario;
    let perfect: SolutionCard[];
    let imperfect: SolutionCard[];

    try {
      // Use AI to generate scenario for ALL grade levels
      scenario = await executiveDecisionAIService.generateScenario({
        scenarioType,
        businessDriver,
        industryContext,
        difficultyLevel,
        gradeCategory,
        avoidTopics: [
          // Content policy: Avoid controversial topics
          'political parties', 'religion', 'DEI', 'discrimination',
          'abortion', 'gun control', 'immigration policy'
        ]
      });

      console.log('✅ AI scenario generated:', scenario.title);

      // Generate solutions using AI
      const solutions = await executiveDecisionAIService.generateSolutions({
        scenario,
        count: 10,
        perfectCount: 5,
        imperfectCount: 5,
        industryContext,
        gradeCategory
      });

      perfect = solutions.perfect;
      imperfect = solutions.imperfect;

      console.log('✅ AI solutions generated:', perfect.length, 'perfect,', imperfect.length, 'imperfect');
    } catch (error) {
      console.error('❌ AI generation failed, falling back to templates:', error);
      // Fallback to template-based generation if AI fails
      scenario = scenarioManager.getRandomScenario(difficultyLevel, industryContext, gradeCategory);
      const solutions = scenarioManager.generateSolutions(scenario, 10);
      perfect = solutions.perfect;
      imperfect = solutions.imperfect;
    }

    const allSolutions = [...perfect, ...imperfect].sort(() => Math.random() - 0.5);

    // Generate lens effects for all executives
    const lensEffects = scenarioManager.generateLensEffects(allSolutions, scenario);

    // Create session
    const { data: session, error } = await this.client
      .from('dd_executive_sessions')
      .insert({
        room_id: roomId,
        player_id: playerId,
        scenario_id: scenario.id,
        scenario_data: scenario,
        solution_cards: allSolutions,
        lens_effects: lensEffects,
        perfect_solutions: perfect.map(s => s.id),
        difficulty_level: difficultyLevel,
        time_limit_seconds: scenario.timeLimitSeconds,
        status: 'selecting_executive'
      })
      .select()
      .single();

    if (error || !session) {
      console.error('Error creating executive session:', error);
      return null;
    }

    return {
      id: session.id,
      roomId: session.room_id,
      playerId: session.player_id,
      scenario,
      solutionCards: allSolutions,
      lensEffects,
      perfectSolutions: perfect,
      selectedExecutive: null,
      selectedSolutions: [],
      timeSpentSeconds: 0,
      status: 'selecting_executive',
      createdAt: session.created_at,
    };
  }

  /**
   * Select executive for the scenario
   */
  async selectExecutive(
    sessionId: string,
    executive: CSuiteRole
  ): Promise<boolean> {
    if (!this.client) await this.initialize();

    const { error } = await this.client
      .from('dd_executive_sessions')
      .update({
        selected_executive: executive,
        status: 'selecting_solutions',
        executive_selected_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    return !error;
  }

  /**
   * Submit solution selection
   */
  async submitSolutions(
    sessionId: string,
    solutionIds: string[],
    timeSpentSeconds: number
  ): Promise<ExecutiveDecisionResult | null> {
    if (!this.client) await this.initialize();

    // Get session data with room information to determine grade category
    const { data: session } = await this.client
      .from('dd_executive_sessions')
      .select(`
        *,
        dd_company_rooms (grade_category)
      `)
      .eq('id', sessionId)
      .single();

    if (!session) {
      console.error('Session not found');
      return null;
    }

    const scenario: BusinessScenario = session.scenario_data;
    const allSolutions: SolutionCard[] = session.solution_cards;
    const perfectSolutionIds: string[] = session.perfect_solutions;
    const selectedExecutive: CSuiteRole = session.selected_executive;

    // Determine grade category from room
    // Database stores 'elementary' or 'other' (middle/high)
    // Convert 'other' to 'middle' for the analyzer (or leave as 'other' since function accepts elementary/middle/high)
    const dbGradeCategory = session.dd_company_rooms?.grade_category || 'other';
    const gradeCategory: 'elementary' | 'middle' | 'high' =
      dbGradeCategory === 'elementary' ? 'elementary' : 'middle';

    // Get selected solutions
    const selectedSolutions = allSolutions.filter(s => solutionIds.includes(s.id));
    const perfectSolutions = allSolutions.filter(s => perfectSolutionIds.includes(s.id));

    // Calculate score
    const scoreResult = scenarioManager.calculateRoundScore(
      selectedSolutions,
      perfectSolutions,
      selectedExecutive,
      scenario.optimalExecutive,
      timeSpentSeconds,
      scenario.timeLimitSeconds
    );

    // Analyze leadership
    const sixCs = leadershipAnalyzer.analyze6Cs(
      selectedSolutions,
      perfectSolutions,
      selectedExecutive,
      scenario.optimalExecutive,
      timeSpentSeconds
    );

    const insights = leadershipAnalyzer.generateInsights(sixCs);

    // Generate career recommendations with age-appropriate content
    const careerRecommendations = leadershipAnalyzer.getCareerRecommendations(
      sixCs,
      undefined,  // historicalData - could be added later
      gradeCategory
    );

    // Calculate XP and rewards
    const xpEarned = Math.floor(scoreResult.totalScore * 0.5);
    const coinsEarned = Math.floor(scoreResult.totalScore * 0.2);

    // Update session
    await this.client
      .from('dd_executive_sessions')
      .update({
        selected_solutions: solutionIds,
        time_spent_seconds: timeSpentSeconds,
        base_score: scoreResult.baseScore,
        lens_multiplier: scoreResult.lensMultiplier,
        speed_bonus: scoreResult.speedBonus,
        total_score: scoreResult.totalScore,
        perfect_selected: scoreResult.perfectSelected,
        imperfect_selected: scoreResult.imperfectSelected,
        six_cs_scores: sixCs,
        leadership_insights: insights,
        xp_earned: xpEarned,
        coins_earned: coinsEarned,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    // Update player XP and stats
    await this.updateExecutivePlayerStats(
      session.player_id,
      scoreResult.totalScore,
      xpEarned,
      sixCs
    );

    // Create result
    const result: ExecutiveDecisionResult = {
      sessionId,
      scenario,
      selectedExecutive,
      selectedSolutions,
      perfectSolutions,
      baseScore: scoreResult.baseScore,
      lensMultiplier: scoreResult.lensMultiplier,
      speedBonus: scoreResult.speedBonus,
      totalScore: scoreResult.totalScore,
      perfectSelected: scoreResult.perfectSelected,
      imperfectSelected: scoreResult.imperfectSelected,
      sixCs,
      leadershipInsights: insights,
      careerRecommendations,
      xpEarned,
      coinsEarned,
      newAchievements: this.checkExecutiveAchievements(scoreResult, sixCs),
      leaderboardRank: await this.getLeaderboardRank(session.room_id, scoreResult.totalScore),
    };

    return result;
  }

  /**
   * Get lensed solutions for display
   */
  getLensedSolutions(
    solutions: SolutionCard[],
    lensEffects: LensEffect[],
    executive: CSuiteRole
  ) {
    return lensEffectEngine.applyLensToSolutions(solutions, lensEffects, executive);
  }

  /**
   * Update player stats for Executive Decision mode
   */
  private async updateExecutivePlayerStats(
    playerId: string,
    score: number,
    xp: number,
    sixCs: SixCs
  ): Promise<void> {
    if (!this.client) await this.initialize();

    // Get current stats
    const { data: stats } = await this.client
      .from('dd_executive_stats')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (stats) {
      // Update existing stats
      const updates = {
        total_sessions_played: stats.total_sessions_played + 1,
        total_score: stats.total_score + score,
        highest_score: Math.max(stats.highest_score, score),
        total_xp: stats.total_xp + xp,
        avg_character_score: (stats.avg_character_score * stats.total_sessions_played + sixCs.character) / (stats.total_sessions_played + 1),
        avg_competence_score: (stats.avg_competence_score * stats.total_sessions_played + sixCs.competence) / (stats.total_sessions_played + 1),
        avg_communication_score: (stats.avg_communication_score * stats.total_sessions_played + sixCs.communication) / (stats.total_sessions_played + 1),
        avg_compassion_score: (stats.avg_compassion_score * stats.total_sessions_played + sixCs.compassion) / (stats.total_sessions_played + 1),
        avg_commitment_score: (stats.avg_commitment_score * stats.total_sessions_played + sixCs.commitment) / (stats.total_sessions_played + 1),
        avg_confidence_score: (stats.avg_confidence_score * stats.total_sessions_played + sixCs.confidence) / (stats.total_sessions_played + 1),
        last_played_at: new Date().toISOString()
      };

      await this.client
        .from('dd_executive_stats')
        .update(updates)
        .eq('player_id', playerId);
    } else {
      // Create new stats record
      await this.client
        .from('dd_executive_stats')
        .insert({
          player_id: playerId,
          total_sessions_played: 1,
          total_score: score,
          highest_score: score,
          total_xp: xp,
          avg_character_score: sixCs.character,
          avg_competence_score: sixCs.competence,
          avg_communication_score: sixCs.communication,
          avg_compassion_score: sixCs.compassion,
          avg_commitment_score: sixCs.commitment,
          avg_confidence_score: sixCs.confidence,
          last_played_at: new Date().toISOString()
        });
    }
  }

  /**
   * Check for new achievements
   */
  private checkExecutiveAchievements(
    scoreResult: any,
    sixCs: SixCs
  ): string[] {
    const achievements: string[] = [];

    // Perfect decision maker
    if (scoreResult.perfectSelected === 5 && scoreResult.imperfectSelected === 0) {
      achievements.push('Perfect Decision Maker');
    }

    // Speed demon
    if (scoreResult.speedBonus >= 45) {
      achievements.push('Speed Executive');
    }

    // High 6 C's scores
    const avgCScore = (sixCs.character + sixCs.competence + sixCs.communication +
                       sixCs.compassion + sixCs.commitment + sixCs.confidence) / 6;
    if (avgCScore >= 9) {
      achievements.push('Leadership Excellence');
    }

    // Lens master
    if (scoreResult.lensMultiplier === 1.5) {
      achievements.push('Perfect Lens Match');
    }

    return achievements;
  }

  /**
   * Get leaderboard rank
   */
  private async getLeaderboardRank(roomId: string, score: number): Promise<number> {
    if (!this.client) await this.initialize();

    const { count } = await this.client
      .from('dd_executive_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .eq('status', 'completed')
      .gt('total_score', score);

    return (count || 0) + 1;
  }

  /**
   * Get session-specific leaderboard (only players in this session)
   */
  async getSessionLeaderboard(
    sessionId: string
  ): Promise<any[]> {
    if (!this.client) await this.initialize();

    console.log(`🔍 getSessionLeaderboard called with sessionId: ${sessionId}`);

    // Get all players in this session
    const { data: sessionPlayers, error: playersError } = await this.client
      .from('dd_game_session_players')
      .select('player_id, display_name')
      .eq('session_id', sessionId)
      .eq('is_active', true);

    console.log(`🔍 Query result - sessionPlayers:`, sessionPlayers?.length || 0, playersError);

    if (!sessionPlayers || sessionPlayers.length === 0) {
      console.log(`⚠️ No session players found for session ${sessionId}`);
      return [];
    }

    const playerIds = sessionPlayers.map((p: any) => p.player_id);

    // Get completed sessions for these players in this room
    const { data: completedSessions } = await this.client
      .from('dd_executive_sessions')
      .select('player_id, total_score, six_cs_scores, completed_at, room_id')
      .eq('session_id', sessionId)
      .eq('status', 'completed');

    // Create a map of display names
    const nameMap = new Map(sessionPlayers.map((p: any) => [p.player_id, p.display_name]));

    // Create a map of best scores per player
    const scoreMap = new Map();
    if (completedSessions) {
      for (const session of completedSessions) {
        const existing = scoreMap.get(session.player_id);
        if (!existing || session.total_score > existing.total_score) {
          scoreMap.set(session.player_id, session);
        }
      }
    }

    // Build leaderboard with all session players
    const leaderboard = sessionPlayers.map((player: any) => {
      const session = scoreMap.get(player.player_id);
      return {
        playerId: player.player_id,
        displayName: player.display_name,
        score: session?.total_score || 0,
        sixCs: session?.six_cs_scores || null,
        completedAt: session?.completed_at || null,
      };
    });

    // Sort by score descending, then by name
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.displayName.localeCompare(b.displayName);
    });

    // Add rank
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  /**
   * Get room leaderboard (legacy - shows all players who ever played in room)
   */
  async getRoomLeaderboard(
    roomId: string,
    limit: number = 10
  ): Promise<any[]> {
    if (!this.client) await this.initialize();

    // Get completed sessions
    const { data: completedSessions, error } = await this.client
      .from('dd_executive_sessions')
      .select('player_id, total_score, six_cs_scores, completed_at')
      .eq('room_id', roomId)
      .eq('status', 'completed')
      .order('total_score', { ascending: false });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    // Get all active players in the room
    const { data: activePlayers } = await this.client
      .from('dd_game_session_players')
      .select('player_id, display_name')
      .eq('room_id', roomId)
      .eq('is_active', true);

    if (!activePlayers || activePlayers.length === 0) {
      return completedSessions?.map((entry: any, index: number) => ({
        rank: index + 1,
        playerId: entry.player_id,
        displayName: 'Unknown Player',
        score: entry.total_score,
        sixCs: entry.six_cs_scores,
        completedAt: entry.completed_at
      })) || [];
    }

    // Create a map of best scores per player
    const scoreMap = new Map();
    if (completedSessions) {
      for (const session of completedSessions) {
        const existing = scoreMap.get(session.player_id);
        if (!existing || session.total_score > existing.total_score) {
          scoreMap.set(session.player_id, session);
        }
      }
    }

    // Build leaderboard with all active players
    const leaderboard = activePlayers.map((player: any) => {
      const session = scoreMap.get(player.player_id);
      return {
        playerId: player.player_id,
        displayName: player.display_name,
        score: session?.total_score || 0,
        sixCs: session?.six_cs_scores || null,
        completedAt: session?.completed_at || null,
      };
    });

    // Sort by score descending, then by name
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.displayName.localeCompare(b.displayName);
    });

    // Add rank and limit results
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    })).slice(0, limit);
  }

  /**
   * Get player's Executive Decision history
   */
  async getExecutiveHistory(
    playerId: string,
    limit: number = 10
  ): Promise<any[]> {
    if (!this.client) await this.initialize();

    const { data, error } = await this.client
      .from('dd_executive_sessions')
      .select(`
        *,
        dd_company_rooms (name)
      `)
      .eq('player_id', playerId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    return data || [];
  }
}

export const careerChallengeService = CareerChallengeService.getInstance();
export type { CareerChallengeService };