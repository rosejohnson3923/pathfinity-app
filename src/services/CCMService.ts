/**
 * Career Challenge Multiplayer (CCM) Service
 *
 * Core service for managing CCM perpetual room multiplayer, including:
 * - Perpetual room management (always-on 24/7 rooms)
 * - Game session lifecycle (5-round games)
 * - Player drop-in/drop-out
 * - Card generation and scoring
 * - Achievement tracking
 *
 * IMPORTANT: This is separate from CC (Career Challenge single-player)
 * Tables: ccm_* prefix (NOT cc_*)
 */

import { supabase } from '../lib/supabase';

class CCMService {
  private static instance: CCMService;
  private client: any;

  private constructor() {}

  static getInstance(): CCMService {
    if (!CCMService.instance) {
      CCMService.instance = new CCMService();
    }
    return CCMService.instance;
  }

  async initialize() {
    this.client = await supabase();
  }

  // ================================================================
  // PERPETUAL ROOM MANAGEMENT
  // ================================================================

  /**
   * Get all featured perpetual rooms
   */
  async getFeaturedRooms(): Promise<any[]> {
    if (!this.client) await this.initialize();

    const { data, error } = await this.client
      .from('ccm_perpetual_rooms')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('feature_order', { ascending: true });

    if (error) {
      console.error('Error fetching featured rooms:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get company lobbies filtered by grade level
   * @param gradeCategory - Optional filter for 'elementary', 'middle', or 'high'
   * @returns Array of company rooms with challenge counts
   */
  async getCompanyLobbies(gradeCategory?: 'elementary' | 'middle' | 'high'): Promise<any[]> {
    if (!this.client) await this.initialize();

    let query = this.client
      .from('ccm_company_rooms')
      .select(`
        *,
        ccm_industries:industry_id (
          id,
          name,
          code,
          icon,
          color_scheme
        )
      `)
      .eq('is_active', true);

    if (gradeCategory) {
      query = query.eq('grade_category', gradeCategory);
    }

    query = query.order('grade_category').order('name');

    const { data: companies, error } = await query;

    if (error) {
      console.error('Error fetching company lobbies:', error);
      return [];
    }

    if (!companies) return [];

    // Get challenge counts for each company
    const companiesWithCounts = await Promise.all(
      companies.map(async (company) => {
        const { count } = await this.client
          .from('ccm_business_scenarios')
          .select('id', { count: 'exact', head: true })
          .eq('company_room_id', company.id);

        return {
          ...company,
          challengeCount: count || 0,
          industry: company.ccm_industries
        };
      })
    );

    return companiesWithCounts;
  }

  /**
   * Get company room details with all challenges
   * @param companyRoomId - The company room ID
   * @returns Company details with all associated challenges
   */
  async getCompanyRoomDetails(companyRoomId: string): Promise<any> {
    if (!this.client) await this.initialize();

    const { data: company, error: companyError } = await this.client
      .from('ccm_company_rooms')
      .select(`
        *,
        ccm_industries:industry_id (
          id,
          name,
          code,
          icon,
          color_scheme
        )
      `)
      .eq('id', companyRoomId)
      .single();

    if (companyError) {
      console.error('Error fetching company room details:', companyError);
      return null;
    }

    // Get all challenges for this company
    const { data: challenges, error: challengesError } = await this.client
      .from('ccm_business_scenarios')
      .select('*')
      .eq('company_room_id', companyRoomId)
      .order('p_category');

    if (challengesError) {
      console.error('Error fetching company challenges:', challengesError);
    }

    return {
      ...company,
      industry: company.ccm_industries,
      challenges: challenges || []
    };
  }

  /**
   * Get challenges for a specific company room
   * @param companyRoomId - The company room ID
   * @param pCategory - Optional P category filter
   * @returns Array of business scenarios
   */
  async getCompanyChallenges(companyRoomId: string, pCategory?: string): Promise<any[]> {
    if (!this.client) await this.initialize();

    let query = this.client
      .from('ccm_business_scenarios')
      .select('*')
      .eq('company_room_id', companyRoomId);

    if (pCategory) {
      query = query.eq('p_category', pCategory);
    }

    query = query.order('p_category');

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching company challenges:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get room status (active or intermission)
   */
  async getRoomStatus(roomId: string): Promise<any> {
    if (!this.client) await this.initialize();

    const { data, error } = await this.client
      .from('ccm_perpetual_rooms')
      .select(`
        *,
        ccm_game_sessions (
          id,
          status,
          current_round,
          started_at
        )
      `)
      .eq('id', roomId)
      .single();

    if (error) {
      console.error('Error fetching room status:', error);
      return null;
    }

    return data;
  }

  /**
   * Join a perpetual room (queue for next game)
   */
  async joinRoom(
    roomId: string,
    playerId: string,
    displayName: string
  ): Promise<{ success: boolean; message?: string }> {
    if (!this.client) await this.initialize();

    // Check if room exists and has capacity
    const { data: room } = await this.client
      .from('ccm_perpetual_rooms')
      .select('current_player_count, max_players_per_game, status')
      .eq('id', roomId)
      .single();

    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    if (room.current_player_count >= room.max_players_per_game) {
      return { success: false, message: 'Room is full' };
    }

    // If game is active, player must wait for intermission
    if (room.status === 'active') {
      return {
        success: true,
        message: 'Game in progress. You will join the next game during intermission.'
      };
    }

    // Room is in intermission, player can join immediately
    return { success: true, message: 'Joined room successfully' };
  }

  // ================================================================
  // GAME SESSION MANAGEMENT
  // ================================================================

  /**
   * Create a new game session in perpetual room
   */
  async createGameSession(roomId: string): Promise<any> {
    if (!this.client) await this.initialize();

    // Get room to determine game number
    const { data: room } = await this.client
      .from('ccm_perpetual_rooms')
      .select('current_game_number')
      .eq('id', roomId)
      .single();

    if (!room) {
      throw new Error('Room not found');
    }

    const gameNumber = room.current_game_number || 1;

    // Create game session
    const { data: session, error } = await this.client
      .from('ccm_game_sessions')
      .insert({
        perpetual_room_id: roomId,
        game_number: gameNumber,
        status: 'active',
        current_round: 1,
        total_rounds: 5,
        rounds_completed: 0,
        total_participants: 0,
        human_participants: 0,
        ai_participants: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating game session:', error);
      throw new Error('Failed to create game session');
    }

    // Update room status
    await this.client
      .from('ccm_perpetual_rooms')
      .update({
        status: 'active',
        current_game_id: session.id,
        current_game_number: gameNumber,
        last_game_started_at: new Date().toISOString()
      })
      .eq('id', roomId);

    return session;
  }

  /**
   * Add participant to game session
   */
  async addParticipant(
    sessionId: string,
    roomId: string,
    playerId: string | null,
    displayName: string,
    isAI: boolean = false
  ): Promise<any> {
    if (!this.client) await this.initialize();

    const participantData: any = {
      game_session_id: sessionId,
      perpetual_room_id: roomId,
      participant_type: isAI ? 'ai_agent' : 'human',
      display_name: displayName,
      role_hand: [],
      synergy_hand: [],
      has_golden_card: true,
      total_score: 0,
      ccm_points_earned: 0,
      xp_earned: 0,
      is_active: true
    };

    if (!isAI && playerId) {
      participantData.student_id = playerId;
    }

    if (isAI) {
      // Assign AI difficulty
      const difficulties = ['beginner', 'steady', 'skilled', 'expert'];
      participantData.ai_difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      participantData.ai_personality = `AI-${Math.random().toString(36).substring(7)}`;
    }

    const { data, error } = await this.client
      .from('ccm_session_participants')
      .insert(participantData)
      .select()
      .single();

    if (error) {
      console.error('Error adding participant:', error);
      return null;
    }

    // Update session participant counts
    const { data: session } = await this.client
      .from('ccm_game_sessions')
      .select('total_participants, human_participants, ai_participants')
      .eq('id', sessionId)
      .single();

    if (session) {
      await this.client
        .from('ccm_game_sessions')
        .update({
          total_participants: session.total_participants + 1,
          human_participants: isAI ? session.human_participants : session.human_participants + 1,
          ai_participants: isAI ? session.ai_participants + 1 : session.ai_participants
        })
        .eq('id', sessionId);
    }

    return data;
  }

  /**
   * Get random challenge card for a specific round
   * Optionally filter by P category if specified
   */
  async getChallengeCard(pCategory?: string): Promise<any> {
    if (!this.client) await this.initialize();

    let query = this.client
      .from('ccm_challenge_cards')
      .select('*')
      .eq('is_active', true);

    if (pCategory) {
      query = query.eq('p_category', pCategory);
    }

    const { data: challenges, error } = await query;

    if (error) {
      console.error('Error fetching challenge cards:', error);
      return null;
    }

    if (!challenges || challenges.length === 0) {
      return null;
    }

    // Return random challenge from filtered set
    const randomIndex = Math.floor(Math.random() * challenges.length);
    return challenges[randomIndex];
  }

  /**
   * Get 6 role cards dynamically filtered by challenge P category
   *
   * Filtering logic:
   * 1. Prioritize "perfect" quality roles for the current P category
   * 2. Fill remaining slots with "good" quality roles (up to 6 total)
   * 3. Exclude "not_in" quality roles
   * 4. Exclude C-Suite leader roles (CEO, CFO, CMO, CTO, CHRO, COO) - they are lens choices, not playable cards
   * 5. Shuffle results to randomize order
   *
   * @param pCategory - The P category of the current challenge (people, product, process, place, promotion, price)
   * @returns Array of 6 role card IDs filtered for the challenge
   */
  async getRoleCardsForChallenge(pCategory: string): Promise<string[]> {
    if (!this.client) await this.initialize();

    const qualityField = `quality_for_${pCategory}`;

    // C-Suite leader card codes to exclude (these are lens choices, not playable role cards)
    const excludedCardCodes = [
      'CCM_CEO_EXECUTIVE_LEADER',
      'CCM_CFO_FINANCIAL_OFFICER',
      'CCM_CMO_MARKETING_OFFICER',
      'CCM_CTO_TECHNOLOGY_OFFICER',
      'CCM_CHRO_HR_OFFICER',
      'CCM_COO_OPERATIONS_OFFICER'
    ];

    // Get all "perfect" quality roles for this P category (excluding C-Suite leaders)
    const { data: perfectRoles, error: perfectError } = await this.client
      .from('ccm_role_cards')
      .select('id, card_code')
      .eq(qualityField, 'perfect')
      .eq('is_active', true)
      .not('card_code', 'in', `(${excludedCardCodes.join(',')})`);

    if (perfectError) {
      console.error('Error fetching perfect roles:', perfectError);
    }

    // Get "good" quality roles to fill remaining slots (excluding C-Suite leaders)
    const { data: goodRoles, error: goodError } = await this.client
      .from('ccm_role_cards')
      .select('id, card_code')
      .eq(qualityField, 'good')
      .eq('is_active', true)
      .not('card_code', 'in', `(${excludedCardCodes.join(',')})`);

    if (goodError) {
      console.error('Error fetching good roles:', goodError);
    }

    // Combine: All perfect + good to reach 6 total
    let availableRoles = [...(perfectRoles || [])];
    const remainingSlots = 6 - availableRoles.length;

    if (remainingSlots > 0 && goodRoles) {
      // Shuffle good roles before taking to add variety
      const shuffledGood = goodRoles.sort(() => Math.random() - 0.5);
      availableRoles = [...availableRoles, ...shuffledGood.slice(0, remainingSlots)];
    }

    // Shuffle final selection to randomize order
    const shuffled = availableRoles.sort(() => Math.random() - 0.5);

    // Ensure we return exactly 6 roles
    return shuffled.slice(0, 6).map((role: any) => role.id);
  }

  /**
   * Deal cards to participant
   */
  async dealCards(participantId: string): Promise<{ roleCards: string[]; synergyCards: string[] }> {
    if (!this.client) await this.initialize();

    // Get 10 random role cards
    const { data: roleCards } = await this.client
      .from('ccm_role_cards')
      .select('id')
      .eq('is_active', true)
      .limit(50);

    const shuffledRoles = roleCards?.sort(() => 0.5 - Math.random()).slice(0, 10) || [];
    const roleHand = shuffledRoles.map((c: any) => c.id);

    // Get all 5 synergy cards (everyone gets the same 5)
    const { data: synergyCards } = await this.client
      .from('ccm_synergy_cards')
      .select('id')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    const synergyHand = synergyCards?.map((c: any) => c.id) || [];

    // Update participant hands
    await this.client
      .from('ccm_session_participants')
      .update({
        role_hand: roleHand,
        synergy_hand: synergyHand
      })
      .eq('id', participantId);

    return {
      roleCards: roleHand,
      synergyCards: synergyHand
    };
  }

  /**
   * Complete game and start intermission
   */
  async completeGame(sessionId: string): Promise<void> {
    if (!this.client) await this.initialize();

    // Get session data
    const { data: session } = await this.client
      .from('ccm_game_sessions')
      .select('perpetual_room_id, started_at')
      .eq('id', sessionId)
      .single();

    if (!session) return;

    const duration = Math.floor((new Date().getTime() - new Date(session.started_at).getTime()) / 1000);

    // Update session
    await this.client
      .from('ccm_game_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: duration,
        rounds_completed: 5
      })
      .eq('id', sessionId);

    // Start intermission
    const nextGameStartsAt = new Date(Date.now() + 15000); // 15 seconds

    await this.client
      .from('ccm_perpetual_rooms')
      .update({
        status: 'intermission',
        next_game_starts_at: nextGameStartsAt.toISOString(),
        total_games_played: this.client.rpc('increment', { x: 1 }),
        total_rounds_played: this.client.rpc('increment', { x: 5 })
      })
      .eq('id', session.perpetual_room_id);
  }

  // ================================================================
  // PLACEHOLDER FOR ADDITIONAL METHODS
  // ================================================================

  // TODO: Copy and adapt these methods from CC as needed:
  // - Scoring calculation
  // - MVP selection
  // - Achievement tracking
  // - Leaderboard queries
  // - Real-time sync helpers
}

export const ccmService = CCMService.getInstance();
export type { CCMService };
