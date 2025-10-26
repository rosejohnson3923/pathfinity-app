/**
 * Career Match Service
 * Manages Career Match gameplay with perpetual rooms
 *
 * Architecture:
 * - Perpetual rooms that auto-assign players (like Career Bingo)
 * - Turn-based memory matching gameplay
 * - AI player fill for incomplete rooms
 * - 10:1 Arcade XP to PathIQ XP conversion
 */

import { supabase } from '../lib/supabase';
import { aiPlayerPoolService } from './AIPlayerPoolService';
import { careerMatchXPService } from './CareerMatchXPService';
import type {
  CMPerpetualRoom,
  CMGameSession,
  CMSessionParticipant,
  CMCard,
  CMMove,
  CareerMatchDifficulty,
} from '../types/CareerMatchTypes';

// ================================================================
// REQUEST/RESPONSE TYPES
// ================================================================

export interface JoinGameRequest {
  userId: string; // User ID from AuthContext
  displayName?: string; // Optional display name override
  difficulty?: CareerMatchDifficulty; // Preferred difficulty (will find matching room)
}

export interface JoinGameResponse {
  room: CMPerpetualRoom;
  session: CMGameSession;
  participant: CMSessionParticipant;
  allParticipants: CMSessionParticipant[];
  isHost: boolean; // First user in session
}

export interface FlipCardRequest {
  game_session_id: string;
  position: number;
  userId?: string; // User ID from AuthContext (for users)
  participantId?: string; // Participant ID (for AI players)
}

export interface FlipCardResponse {
  card: CMCard;
  is_first_flip: boolean; // First or second card in turn
  is_match: boolean | null; // null if first flip, true/false if second flip
  matched_pair?: {
    card1: CMCard;
    card2: CMCard;
    career_name: string;
    xp_earned: number;
    streak_count: number;
  };
  next_turn_player_id?: string; // Who goes next (if turn ended)
}

export interface GetGameStateRequest {
  game_session_id: string;
}

export interface GetGameStateResponse {
  session: CMGameSession;
  participants: CMSessionParticipant[];
  cards: CMCard[];
  room: CMPerpetualRoom;
}

// ================================================================
// MAIN SERVICE CLASS
// ================================================================

class CareerMatchService {
  private static instance: CareerMatchService;

  private constructor() {}

  static getInstance(): CareerMatchService {
    if (!CareerMatchService.instance) {
      CareerMatchService.instance = new CareerMatchService();
    }
    return CareerMatchService.instance;
  }

  // ================================================================
  // JOIN GAME (AUTO-ASSIGNMENT)
  // ================================================================

  /**
   * Join Career Match game
   * Automatically assigns player to next available room with preferred difficulty
   */
  async joinGame(request: JoinGameRequest): Promise<JoinGameResponse> {
    const client = await supabase();
    const { userId, displayName: providedDisplayName, difficulty } = request;

    console.log('[CareerMatchService] joinGame called:', { userId, difficulty });

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Use provided display name or fallback to 'Player'
    const displayName = providedDisplayName || 'Player';

    // Find available room with preferred difficulty
    const room = await this.findAvailableRoom(request.difficulty);

    // Get or create active session for this room
    const session = await this.getOrCreateActiveSession(room.id);

    // Add player as participant
    const participant = await this.addUserParticipant(
      session.id,
      room.id,
      userId,
      displayName
    );

    // Get all participants
    const allParticipants = await this.getSessionParticipants(session.id);

    // Determine if this player is the host (first user)
    const userParticipants = allParticipants.filter(p => p.participant_type === 'user');
    const isHost = userParticipants[0]?.id === participant.id;

    // Auto-start if we have enough players or this is the first player
    if (allParticipants.length === 1) {
      // First player - wait for more or trigger AI fill after timeout
      console.log('First player joined, waiting for more players...');
    } else if (allParticipants.length >= room.max_players_per_game) {
      // Room is full - start game if not already started
      if (!session.current_turn_player_id) {
        await this.startGameSession(session.id);
      }
    }

    return {
      room,
      session,
      participant,
      allParticipants,
      isHost,
    };
  }

  /**
   * Find available perpetual room with preferred difficulty
   */
  private async findAvailableRoom(preferredDifficulty?: CareerMatchDifficulty): Promise<CMPerpetualRoom> {
    const client = await supabase();

    // Get all active featured rooms, optionally filtered by difficulty
    let query = client
      .from('cm_perpetual_rooms')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true);

    if (preferredDifficulty) {
      query = query.eq('difficulty', preferredDifficulty);
    }

    const { data: rooms, error } = await query.order('current_player_count', { ascending: true });

    console.log('[CareerMatchService] findAvailableRoom:', {
      preferredDifficulty,
      error,
      roomCount: rooms?.length,
      rooms
    });

    if (error) {
      console.error('[CareerMatchService] Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!rooms || rooms.length === 0) {
      // Debug: Try to query without filters
      const { data: allRooms, error: allError } = await client
        .from('cm_perpetual_rooms')
        .select('*');

      console.error('[CareerMatchService] No filtered rooms found.');
      console.error('[CareerMatchService] All rooms query (no filter):', {
        allError,
        allRooms,
        roomCount: allRooms?.length
      });

      // If we can see rooms without filters, it's a query issue
      if (allRooms && allRooms.length > 0) {
        console.error('[CareerMatchService] Rooms exist but filters are blocking them!');
        console.error('[CareerMatchService] First room:', allRooms[0]);
        // Return first room as fallback
        return this.mapDbRoomToRoom(allRooms[0]);
      }

      throw new Error('No available rooms found. Please check database migration.');
    }

    // Find room with space available
    const availableRoom = rooms.find(r => r.current_player_count < r.max_players_per_game);

    if (!availableRoom) {
      // All rooms full, return first room (will queue for next game)
      return this.mapDbRoomToRoom(rooms[0]);
    }

    return this.mapDbRoomToRoom(availableRoom);
  }

  /**
   * Get or create active session for a room
   */
  private async getOrCreateActiveSession(roomId: string): Promise<CMGameSession> {
    const client = await supabase();

    // Check for existing active session
    const { data: existingSession } = await client
      .from('cm_game_sessions')
      .select('*')
      .eq('perpetual_room_id', roomId)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSession) {
      return this.mapDbSessionToSession(existingSession);
    }

    // Create new session
    const { data: room } = await client
      .from('cm_perpetual_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (!room) {
      throw new Error('Room not found');
    }

    const gameNumber = room.current_game_number + 1;

    const { data: newSession, error: sessionError } = await client
      .from('cm_game_sessions')
      .insert({
        perpetual_room_id: roomId,
        game_number: gameNumber,
        status: 'active',
        total_pairs: room.total_pairs,
        pairs_remaining: room.total_pairs,
        winners: [],
        current_turn_number: 0,
        total_participants: 0,
        user_participants: 0,
        ai_participants: 0,
      })
      .select()
      .single();

    if (sessionError || !newSession) {
      throw new Error(`Failed to create game session: ${sessionError?.message}`);
    }

    // Initialize cards for this session
    await client.rpc('cm_initialize_cards', {
      p_game_session_id: newSession.id,
      p_difficulty: room.difficulty,
    });

    // Update room
    await client
      .from('cm_perpetual_rooms')
      .update({
        current_game_number: gameNumber,
        current_game_id: newSession.id,
        last_game_started_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    return this.mapDbSessionToSession(newSession);
  }

  /**
   * Add user participant to session
   */
  private async addUserParticipant(
    sessionId: string,
    roomId: string,
    userId: string,
    displayName: string
  ): Promise<CMSessionParticipant> {
    const client = await supabase();

    // Check if participant already exists in this session
    const { data: existing } = await client
      .from('cm_session_participants')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return this.mapDbParticipantToParticipant(existing);
    }

    const { data, error } = await client
      .from('cm_session_participants')
      .insert({
        game_session_id: sessionId,
        perpetual_room_id: roomId,
        participant_type: 'user',
        user_id: userId,
        display_name: displayName,
        is_active_turn: false,
        pairs_matched: 0,
        total_xp: 0,
        arcade_xp: 0,
        current_streak: 0,
        max_streak: 0,
        turns_taken: 0,
        is_active: true,
        connection_status: 'connected',
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to add participant: ${error?.message}`);
    }

    return this.mapDbParticipantToParticipant(data);
  }

  // ================================================================
  // START GAME
  // ================================================================

  /**
   * Start game session (fill with AI if needed)
   * Called by host or automatically when room fills
   */
  async startGameSession(sessionId: string): Promise<void> {
    const client = await supabase();

    // Get session and room
    const { data: session } = await client
      .from('cm_game_sessions')
      .select('*, cm_perpetual_rooms(*)')
      .eq('id', sessionId)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    const room = session.cm_perpetual_rooms;

    // Count current participants
    const { data: participants } = await client
      .from('cm_session_participants')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('is_active', true);

    const currentCount = participants?.length || 0;
    const aiNeeded = Math.max(0, room.max_players_per_game - currentCount);

    // Add AI players if needed
    if (aiNeeded > 0 && room.ai_fill_enabled) {
      await this.addAIPlayers(sessionId, room.id, aiNeeded, room.ai_difficulty_mix);
    }

    // Get all participants after AI fill
    const { data: allParticipants } = await client
      .from('cm_session_participants')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('is_active', true)
      .order('joined_at');

    if (!allParticipants || allParticipants.length === 0) {
      throw new Error('No participants in game');
    }

    // Initialize cards for the game
    console.log(`🎴 Initializing cards for session ${sessionId} with difficulty: ${room.difficulty}`);
    await client.rpc('cm_initialize_cards', {
      p_game_session_id: sessionId,
      p_difficulty: room.difficulty,
    });
    console.log(`✅ Cards initialized for session ${sessionId}`);

    // Select first player randomly
    const randomIndex = Math.floor(Math.random() * allParticipants.length);
    const firstPlayer = allParticipants[randomIndex];

    // Reset all participants' is_active_turn to false
    await client
      .from('cm_session_participants')
      .update({ is_active_turn: false })
      .eq('game_session_id', sessionId);

    // Update session with first player and mark as active
    await client
      .from('cm_game_sessions')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
        current_turn_player_id: firstPlayer.id,
        current_turn_number: 1,
      })
      .eq('id', sessionId);

    // Update first player
    await client
      .from('cm_session_participants')
      .update({
        is_active_turn: true,
        turn_started_at: new Date().toISOString(),
      })
      .eq('id', firstPlayer.id);

    console.log(`✅ Game started! First turn: ${firstPlayer.display_name}`);
  }

  /**
   * Add AI players to session
   */
  private async addAIPlayers(
    sessionId: string,
    roomId: string,
    count: number,
    difficultyMix: string
  ): Promise<void> {
    const client = await supabase();

    const aiPlayers = aiPlayerPoolService.getRandomPlayers(count, roomId);
    console.log(`🤖 Adding ${aiPlayers.length} AI players:`, aiPlayers.map(p => p.name).join(', '));

    for (const aiPlayer of aiPlayers) {
      const difficulty = difficultyMix === 'mixed'
        ? ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
        : difficultyMix;

      await client
        .from('cm_session_participants')
        .insert({
          game_session_id: sessionId,
          perpetual_room_id: roomId,
          participant_type: 'ai_agent',
          user_id: aiPlayer.id,
          display_name: aiPlayer.name,
          ai_difficulty: difficulty,
          ai_personality: 'friendly',
          is_active_turn: false,
          pairs_matched: 0,
          total_xp: 0,
          arcade_xp: 0,
          current_streak: 0,
          max_streak: 0,
          turns_taken: 0,
          is_active: true,
          connection_status: 'connected',
        });
    }

    console.log(`✅ Added ${aiPlayers.length} AI players to session ${sessionId}`);
  }

  // ================================================================
  // GAMEPLAY
  // ================================================================

  /**
   * Flip a card - NEW CLEAN ARCHITECTURE
   * Just validates and marks matched cards, no setTimeout or timing logic
   * Frontend handles visual state (unflipped, flipped, persist-flipped, persist-unflipped)
   */
  async flipCard(request: FlipCardRequest): Promise<FlipCardResponse> {
    const client = await supabase();
    const { game_session_id, position, userId, participantId } = request;

    if (!userId && !participantId) {
      throw new Error('User ID or Participant ID is required');
    }

    // ============================================================================
    // VALIDATION: Session, Turn, Card
    // ============================================================================

    // Get session
    const { data: session } = await client
      .from('cm_game_sessions')
      .select('*')
      .eq('id', game_session_id)
      .single();

    if (!session || session.status !== 'active') {
      throw new Error('Game session not active');
    }

    // Get current turn participant
    const { data: currentParticipant } = await client
      .from('cm_session_participants')
      .select('*')
      .eq('id', session.current_turn_player_id)
      .single();

    if (!currentParticipant) {
      throw new Error('Current turn player not found');
    }

    // DEBUG: Log validation details
    console.log('[flipCard] Validation check:', {
      currentParticipantId: currentParticipant.id,
      currentParticipantUserId: currentParticipant.user_id,
      currentParticipantType: currentParticipant.participant_type,
      currentParticipantName: currentParticipant.display_name,
      requestParticipantId: participantId,
      requestUserId: userId,
    });

    // Verify it's this player's turn
    if (participantId) {
      if (currentParticipant.id !== participantId) {
        console.error('[flipCard] VALIDATION FAILED: Participant ID mismatch', {
          expected: currentParticipant.id,
          received: participantId,
        });
        throw new Error('Not your turn');
      }
    } else if (userId) {
      if (currentParticipant.user_id !== userId) {
        console.error('[flipCard] VALIDATION FAILED: User ID mismatch', {
          expected: currentParticipant.user_id,
          received: userId,
        });
        throw new Error('Not your turn');
      }
    }

    // Get the card being flipped
    const { data: card } = await client
      .from('cm_cards')
      .select('*')
      .eq('game_session_id', game_session_id)
      .eq('position', position)
      .single();

    if (!card) {
      throw new Error('Card not found');
    }

    // Check if card is already matched
    if (card.is_matched) {
      throw new Error('Card already matched');
    }

    // ============================================================================
    // GAME LOGIC: First Flip vs Second Flip
    // ============================================================================

    const isFirstFlip = session.first_card_flipped === null;

    if (isFirstFlip) {
      // ========================================================================
      // FIRST FLIP - Set card to M1 state (flipped, waiting for second card)
      // ========================================================================

      // Update card state to M1 (flipped)
      await client
        .from('cm_cards')
        .update({ match_state: 'M1' })
        .eq('id', card.id);

      // Mark which card was flipped first in session
      await client
        .from('cm_game_sessions')
        .update({
          first_card_flipped: position,
        })
        .eq('id', game_session_id);

      // Record move
      await client.from('cm_moves').insert({
        game_session_id,
        participant_id: currentParticipant.id,
        card_id: card.id,
        turn_number: session.current_turn_number,
        flip_number: 1,
        position,
        career_name: card.career_name,
        pair_id: card.pair_id,
      });

      return {
        card: this.mapDbCardToCard(card),
        is_first_flip: true,
        is_match: null,
        first_card_position: position,
      };
    } else {
      // ========================================================================
      // SECOND FLIP - Set to M1, then check for match
      // ========================================================================

      // Set second card to M1 (flipped)
      await client
        .from('cm_cards')
        .update({ match_state: 'M1' })
        .eq('id', card.id);

      // Record the second card position for visual state
      await client
        .from('cm_game_sessions')
        .update({
          second_card_flipped: position,
        })
        .eq('id', game_session_id);

      // IMPORTANT: Add delay so users can see the second card before match/no-match
      // This gives players time to visually compare both cards
      await new Promise(resolve => setTimeout(resolve, 1200)); // 1.2 second reveal time

      const { data: firstCard } = await client
        .from('cm_cards')
        .select('*')
        .eq('game_session_id', game_session_id)
        .eq('position', session.first_card_flipped)
        .single();

      if (!firstCard) {
        throw new Error('First card not found');
      }

      const isMatch = firstCard.pair_id === card.pair_id;

      if (isMatch) {
        // ========================================================================
        // MATCH! Use M1→M2→M3 state machine for synchronized UI updates
        // ========================================================================

        const newStreak = currentParticipant.current_streak + 1;
        const matchXp = 100;
        const streakBonus = newStreak >= 3 ? 50 : 0;
        const totalXp = matchXp + streakBonus;

        // STEP 1: Update first card to M2 (match detected, waiting to persist)
        // This fires an individual UPDATE event
        await client
          .from('cm_cards')
          .update({ match_state: 'M2' })
          .eq('id', firstCard.id);

        // STEP 2: Update second card to M2 (match detected, waiting to persist)
        // This fires a second individual UPDATE event
        await client
          .from('cm_cards')
          .update({ match_state: 'M2' })
          .eq('id', card.id);

        // STEP 3: Update BOTH cards to M3 + set is_matched (match persisted, show checkmark)
        // Bulk update is OK here - frontend shows checkmark when EITHER card reaches M3
        await client
          .from('cm_cards')
          .update({
            match_state: 'M3',
            is_matched: true,
            matched_by_participant_id: currentParticipant.id,
            matched_at: new Date().toISOString(),
          })
          .in('id', [firstCard.id, card.id]);

        // Update participant score
        await client
          .from('cm_session_participants')
          .update({
            pairs_matched: currentParticipant.pairs_matched + 1,
            arcade_xp: currentParticipant.arcade_xp + totalXp,
            total_xp: currentParticipant.total_xp + Math.floor(totalXp / 10), // 10:1 conversion
            current_streak: newStreak,
            max_streak: Math.max(currentParticipant.max_streak, newStreak),
          })
          .eq('id', currentParticipant.id);

        // Reset both card positions for next turn
        await client
          .from('cm_game_sessions')
          .update({
            pairs_remaining: session.pairs_remaining - 1,
            first_card_flipped: null,
            second_card_flipped: null,
          })
          .eq('id', game_session_id);

        // Record move
        await client.from('cm_moves').insert({
          game_session_id,
          participant_id: currentParticipant.id,
          card_id: card.id,
          turn_number: session.current_turn_number,
          flip_number: 2,
          position,
          career_name: card.career_name,
          pair_id: card.pair_id,
          is_match: true,
          xp_earned: totalXp,
          streak_count: newStreak,
        });

        // Check if game is complete
        if (session.pairs_remaining - 1 === 0) {
          await this.completeGame(game_session_id);
        }

        // Player gets another turn on match
        return {
          card: this.mapDbCardToCard(card),
          is_first_flip: false,
          is_match: true,
          matched_pair: {
            card1: this.mapDbCardToCard(firstCard),
            card2: this.mapDbCardToCard(card),
            career_name: card.career_name,
            xp_earned: totalXp,
            streak_count: newStreak,
          },
          next_turn_player_id: currentParticipant.id, // Same player continues
        };
      } else {
        // ========================================================================
        // NO MATCH - Reset both cards to NULL (face-down) after delay
        // ========================================================================

        // IMPORTANT: Add delay so users can see both non-matching cards
        // This gives players time to remember the card positions
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second view time for non-matching cards

        // Reset both cards to NULL state (face-down)
        await client
          .from('cm_cards')
          .update({ match_state: null })
          .in('id', [firstCard.id, card.id]);

        // Reset streak
        await client
          .from('cm_session_participants')
          .update({ current_streak: 0 })
          .eq('id', currentParticipant.id);

        // Clear both card positions
        await client
          .from('cm_game_sessions')
          .update({
            first_card_flipped: null,
            second_card_flipped: null,
          })
          .eq('id', game_session_id);

        // Record move
        await client.from('cm_moves').insert({
          game_session_id,
          participant_id: currentParticipant.id,
          card_id: card.id,
          turn_number: session.current_turn_number,
          flip_number: 2,
          position,
          career_name: card.career_name,
          pair_id: card.pair_id,
          is_match: false,
          xp_earned: 0,
        });

        // Advance to next player
        const nextPlayerId = await this.advanceTurn(game_session_id);

        // Return with mismatch info
        // Frontend will show both cards for 2.5s before resetting visuals
        return {
          card: this.mapDbCardToCard(card),
          is_first_flip: false,
          is_match: false,
          first_card_position: session.first_card_flipped,
          second_card_position: position,
          next_turn_player_id: nextPlayerId,
        };
      }
    }
  }

  /**
   * Advance to next player's turn
   */
  private async advanceTurn(sessionId: string): Promise<string> {
    const client = await supabase();

    // Get session
    const { data: session } = await client
      .from('cm_game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    // Get all active participants in order
    const { data: participants } = await client
      .from('cm_session_participants')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('is_active', true)
      .order('joined_at');

    if (!participants || participants.length === 0) {
      throw new Error('No participants found');
    }

    // Find current player index
    const currentIndex = participants.findIndex(p => p.id === session.current_turn_player_id);
    const nextIndex = (currentIndex + 1) % participants.length;
    const nextPlayer = participants[nextIndex];

    // Update session
    await client
      .from('cm_game_sessions')
      .update({
        current_turn_player_id: nextPlayer.id,
        current_turn_number: session.current_turn_number + 1,
        first_card_flipped: null,
        total_turns: session.total_turns + 1,
      })
      .eq('id', sessionId);

    // Reset all participants' is_active_turn to false
    await client
      .from('cm_session_participants')
      .update({ is_active_turn: false })
      .eq('game_session_id', sessionId);

    // Set next player's turn
    await client
      .from('cm_session_participants')
      .update({
        is_active_turn: true,
        turn_started_at: new Date().toISOString(),
        turns_taken: nextPlayer.turns_taken + 1,
      })
      .eq('id', nextPlayer.id);

    // No broadcast needed - postgres_changes will automatically notify clients
    // when current_turn_player_id changes in cm_game_sessions table

    return nextPlayer.id;
  }

  /**
   * Complete game and calculate winners
   */
  private async completeGame(sessionId: string): Promise<void> {
    const client = await supabase();

    // Get all participants with scores
    const { data: participants } = await client
      .from('cm_session_participants')
      .select('*')
      .eq('game_session_id', sessionId)
      .order('pairs_matched', { ascending: false })
      .order('total_xp', { ascending: false });

    if (!participants || participants.length === 0) {
      return;
    }

    // Calculate winners
    const winners = participants.map((p, index) => ({
      participant_id: p.id,
      display_name: p.display_name,
      pairs_matched: p.pairs_matched,
      total_xp: p.total_xp,
      arcade_xp: p.arcade_xp,
      rank: index + 1,
    }));

    // Get session start time
    const { data: session } = await client
      .from('cm_game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) return;

    const durationSeconds = Math.floor(
      (new Date().getTime() - new Date(session.started_at).getTime()) / 1000
    );

    // Update session
    await client
      .from('cm_game_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        winners,
      })
      .eq('id', sessionId);

    // Update room to intermission
    await client
      .from('cm_perpetual_rooms')
      .update({
        status: 'intermission',
        next_game_starts_at: new Date(Date.now() + 10000).toISOString(), // 10 seconds
      })
      .eq('current_game_id', sessionId);

    console.log('✅ Game completed!', winners);

    // Award XP to all participants and update leaderboards
    try {
      const rewards = await careerMatchXPService.awardXPToParticipants(sessionId);
      console.log('✅ XP awarded to', rewards.length, 'participants');
    } catch (xpError) {
      console.error('❌ Error awarding XP:', xpError);
      // Don't throw - game completed successfully, XP is bonus
    }
  }

  // ================================================================
  // QUERIES
  // ================================================================

  /**
   * Get current game state
   */
  async getGameState(request: GetGameStateRequest): Promise<GetGameStateResponse> {
    const client = await supabase();

    const { data: session } = await client
      .from('cm_game_sessions')
      .select('*, cm_perpetual_rooms(*)')
      .eq('id', request.game_session_id)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    const { data: participants } = await client
      .from('cm_session_participants')
      .select('*')
      .eq('game_session_id', request.game_session_id)
      .eq('is_active', true);

    const { data: cards } = await client
      .from('cm_cards')
      .select('*')
      .eq('game_session_id', request.game_session_id)
      .order('position');

    return {
      session: this.mapDbSessionToSession(session),
      participants: (participants || []).map(this.mapDbParticipantToParticipant),
      cards: (cards || []).map(this.mapDbCardToCard),
      room: this.mapDbRoomToRoom(session.cm_perpetual_rooms),
    };
  }

  /**
   * Get session participants
   */
  async getSessionParticipants(sessionId: string): Promise<CMSessionParticipant[]> {
    const client = await supabase();

    const { data, error } = await client
      .from('cm_session_participants')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('is_active', true);

    if (error || !data) {
      return [];
    }

    return data.map(this.mapDbParticipantToParticipant);
  }

  // ================================================================
  // MAPPERS
  // ================================================================

  private mapDbRoomToRoom(db: any): CMPerpetualRoom {
    return {
      id: db.id,
      room_code: db.room_code,
      room_name: db.room_name,
      difficulty: db.difficulty,
      status: db.status,
      current_game_number: db.current_game_number,
      current_game_id: db.current_game_id,
      next_game_starts_at: db.next_game_starts_at,
      intermission_duration_seconds: db.intermission_duration_seconds,
      max_players_per_game: db.max_players_per_game,
      current_player_count: db.current_player_count,
      total_pairs: db.total_pairs,
      grid_rows: db.grid_rows,
      grid_cols: db.grid_cols,
      turn_time_limit_seconds: db.turn_time_limit_seconds,
      match_xp: db.match_xp,
      streak_bonus_xp: db.streak_bonus_xp,
      ai_fill_enabled: db.ai_fill_enabled,
      ai_difficulty_mix: db.ai_difficulty_mix,
      is_active: db.is_active,
      is_featured: db.is_featured,
      created_at: db.created_at,
      updated_at: db.updated_at,
    };
  }

  private mapDbSessionToSession(db: any): CMGameSession {
    return {
      id: db.id,
      perpetual_room_id: db.perpetual_room_id,
      game_number: db.game_number,
      status: db.status,
      total_pairs: db.total_pairs,
      pairs_remaining: db.pairs_remaining,
      winners: db.winners || [],
      current_turn_player_id: db.current_turn_player_id,
      current_turn_number: db.current_turn_number,
      first_card_flipped: db.first_card_flipped,
      second_card_flipped: db.second_card_flipped,
      started_at: db.started_at,
      completed_at: db.completed_at,
      duration_seconds: db.duration_seconds,
      total_participants: db.total_participants,
      user_participants: db.user_participants,
      ai_participants: db.ai_participants,
      total_turns: db.total_turns,
    };
  }

  private mapDbParticipantToParticipant(db: any): CMSessionParticipant {
    return {
      id: db.id,
      game_session_id: db.game_session_id,
      perpetual_room_id: db.perpetual_room_id,
      participant_type: db.participant_type,
      user_id: db.user_id,
      display_name: db.display_name,
      ai_difficulty: db.ai_difficulty,
      ai_personality: db.ai_personality,
      is_active_turn: db.is_active_turn,
      turn_started_at: db.turn_started_at,
      pairs_matched: db.pairs_matched,
      total_xp: db.total_xp,
      arcade_xp: db.arcade_xp,
      current_streak: db.current_streak,
      max_streak: db.max_streak,
      turns_taken: db.turns_taken,
      is_active: db.is_active,
      connection_status: db.connection_status,
      joined_at: db.joined_at,
      left_at: db.left_at,
    };
  }

  private mapDbCardToCard(db: any): CMCard {
    return {
      id: db.id,
      game_session_id: db.game_session_id,
      position: db.position,
      pair_id: db.pair_id,
      career_name: db.career_name,
      career_image_path: db.career_image_path,
      match_state: db.match_state, // M1/M2/M3 state machine
      is_matched: db.is_matched,
      matched_by_participant_id: db.matched_by_participant_id,
      matched_at: db.matched_at,
      flip_delay: db.flip_delay,
      created_at: db.created_at,
    };
  }
}

export default CareerMatchService.getInstance();
