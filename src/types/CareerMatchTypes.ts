/**
 * Career Match Types
 * Memory matching game for career exploration
 * Category: QuickPlay (Discovered Live Arcade)
 */

// ============================================================================
// ENUMS
// ============================================================================

export type CareerMatchDifficulty = 'easy' | 'medium' | 'hard';

export type CareerMatchRoomStatus = 'waiting' | 'active' | 'completed' | 'cancelled';

export type CareerMatchEventType =
  | 'player_joined'
  | 'player_left'
  | 'game_started'
  | 'card_flipped'
  | 'match_found'
  | 'no_match'
  | 'turn_changed'
  | 'game_ended'
  | 'streak_bonus'
  | 'time_warning'
  | 'player_stats_updated';

// ============================================================================
// PERPETUAL ROOMS (NEW ARCHITECTURE)
// ============================================================================
// Auto-assignment perpetual room system (like Career Bingo)
// Replaces manual room creation with room codes

export interface CMPerpetualRoom {
  id: string;
  room_code: string; // 'MATCH01', 'MATCH02', etc.
  room_name: string;
  difficulty: CareerMatchDifficulty;

  // Current state
  status: 'active' | 'intermission' | 'paused';
  current_game_number: number;
  current_game_id: string | null;

  // Next game timing
  next_game_starts_at: string | null;
  intermission_duration_seconds: number;

  // Capacity
  max_players_per_game: number;
  current_player_count: number;

  // Game settings (based on difficulty)
  total_pairs: number;
  grid_rows: number;
  grid_cols: number;
  turn_time_limit_seconds: number;
  match_xp: number;
  streak_bonus_xp: number;

  // AI configuration
  ai_fill_enabled: boolean;
  ai_difficulty_mix: string;

  // Status
  is_active: boolean;
  is_featured: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CMGameSession {
  id: string;
  perpetual_room_id: string;
  game_number: number;

  // Game state
  status: 'active' | 'completed' | 'abandoned';

  // Match tracking
  total_pairs: number;
  pairs_remaining: number;
  winners: CMWinner[];

  // Turn tracking
  current_turn_player_id: string | null;
  current_turn_number: number;
  first_card_flipped: number | null; // Position of first card in turn (temporary state)
  second_card_flipped: number | null; // Position of second card in turn (temporary state)

  // Timing
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;

  // Statistics
  total_participants: number;
  user_participants: number;
  ai_participants: number;
  total_turns: number;
}

export interface CMWinner {
  participant_id: string;
  display_name: string;
  pairs_matched: number;
  total_xp: number;
  arcade_xp: number;
  rank: number;
}

export interface CMSessionParticipant {
  id: string;
  game_session_id: string;
  perpetual_room_id: string;

  // Participant type
  participant_type: 'user' | 'ai_agent';
  user_id: string | null;
  display_name: string;

  // AI config (if AI)
  ai_difficulty: string | null;
  ai_personality: string | null;

  // Game state
  is_active_turn: boolean;
  turn_started_at: string | null;

  // Scoring
  pairs_matched: number;
  total_xp: number;
  arcade_xp: number;
  current_streak: number;
  max_streak: number;
  turns_taken: number;

  // Status
  is_active: boolean;
  connection_status: string;

  // Timing
  joined_at: string;
  left_at: string | null;
}

export interface CMCard {
  id: string;
  game_session_id: string;

  // Card identification
  position: number;
  pair_id: number;
  career_name: string;
  career_image_path: string;

  // Card state (is_revealed removed - now managed by frontend 4-state machine)
  is_matched: boolean;
  matched_by_participant_id: string | null;
  matched_at: string | null;

  // Animation
  flip_delay: number;

  created_at: string;
}

export interface CMMove {
  id: string;
  game_session_id: string;
  participant_id: string;
  card_id: string;

  // Move details
  turn_number: number;
  flip_number: 1 | 2; // First or second flip in turn
  position: number;
  career_name: string;
  pair_id: number;

  // Result (only known after second flip)
  is_match: boolean | null;
  xp_earned: number;
  streak_count: number | null;

  // Timing
  flipped_at: string;
  response_time_seconds: number | null;
}

// ============================================================================
// DATABASE MODELS (DEPRECATED - OLD MANUAL ROOM SYSTEM)
// ============================================================================
// These types are deprecated and will be removed after full migration

export interface CareerMatchRoom {
  id: string;
  room_code: string;
  host_user_id: string | null;
  difficulty: CareerMatchDifficulty;
  max_players: number;
  current_player_count: number;
  status: CareerMatchRoomStatus;

  // Game configuration
  grid_size: number; // 12, 20, or 30 cards
  time_limit_seconds: number | null;

  // Game state
  current_turn_player_id: string | null;
  cards_matched: number;
  total_pairs: number;
  game_data: CareerMatchGameData | null;

  // Timestamps
  created_at: string;
  started_at: string | null;
  ended_at: string | null;

  // Metadata
  winner_user_id: string | null;
  total_turns: number;
}

export interface CareerMatchPlayer {
  id: string;
  room_id: string;
  user_id: string | null;
  display_name: string;

  // Player type
  is_ai_player: boolean;
  ai_player_id: string | null;
  ai_difficulty: CareerMatchDifficulty | null;

  // Turn order
  turn_order: number;
  is_active_turn: boolean;

  // Game stats
  matches_found: number;
  misses: number;
  consecutive_matches: number;
  longest_streak: number;

  // XP and scoring
  arcade_xp_earned: number;

  // Timestamps
  joined_at: string;
  last_action_at: string | null;
}

export interface CareerMatchCard {
  id: string;
  room_id: string;

  // Card position and identity
  position: number;
  career_name: string;
  career_image_path: string;
  pair_id: number;

  // Card state
  match_state: 'M1' | 'M2' | 'M3' | null; // UI state machine: NULL=face-down, M1=flipped, M2=match-detected, M3=match-persisted
  is_matched: boolean; // Game logic: prevents re-clicking matched cards
  matched_by_player_id: string | null;
  matched_at: string | null;
}

export interface CareerMatchMove {
  id: string;
  room_id: string;
  player_id: string;
  turn_number: number;

  // Move details
  card_1_position: number;
  card_2_position: number;
  card_1_career: string;
  card_2_career: string;
  is_match: boolean;

  // Timing
  time_taken_ms: number | null;
  created_at: string;
}

// ============================================================================
// GAME DATA (JSONB)
// ============================================================================

export interface CareerMatchGameData {
  // Currently revealed cards (during a turn)
  revealed_positions: number[];

  // Turn tracking
  turn_start_time: number | null; // Timestamp when current turn started

  // AI player memory state
  ai_memories: Record<string, AIPlayerMemory>; // player_id → memory

  // Special events
  first_match_claimed: boolean;
  time_pressure_active: boolean; // Last 60 seconds
}

export interface AIPlayerMemory {
  remembered_cards: Record<number, string>; // position → career_name
  memory_accuracy: number; // 0.3, 0.6, or 0.9
  last_updated: number;
}

// ============================================================================
// CLIENT-SIDE MODELS
// ============================================================================

export interface CareerMatchCardState extends CareerMatchCard {
  is_flipping: boolean; // Animation state
  flip_delay: number; // Staggered animation
}

export interface CareerMatchPlayerState extends CareerMatchPlayer {
  is_current_user: boolean;
  rank: number; // Current standing (1st, 2nd, 3rd, etc.)
}

export interface CareerMatchRoomState extends CareerMatchRoom {
  players: CareerMatchPlayerState[];
  cards: CareerMatchCardState[];
  time_remaining: number | null; // Seconds remaining
  is_user_turn: boolean;
}

// ============================================================================
// REALTIME EVENTS
// ============================================================================

export type CareerMatchEvent =
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | GameStartedEvent
  | CardFlippedEvent
  | MatchFoundEvent
  | NoMatchEvent
  | TurnChangedEvent
  | GameEndedEvent
  | StreakBonusEvent
  | TimeWarningEvent
  | PlayerStatsUpdatedEvent;

export interface PlayerJoinedEvent {
  type: 'player_joined';
  data: {
    player: CareerMatchPlayer;
    room_code: string;
  };
}

export interface PlayerLeftEvent {
  type: 'player_left';
  data: {
    player_id: string;
    display_name: string;
  };
}

export interface GameStartedEvent {
  type: 'game_started';
  data: {
    cards: CareerMatchCard[];
    first_player_id: string;
    started_at: string;
  };
}

export interface CardFlippedEvent {
  type: 'card_flipped';
  data: {
    position: number;
    card_id: string;
    player_id: string;
    is_first_flip: boolean; // First or second card in turn
  };
}

export interface MatchFoundEvent {
  type: 'match_found';
  data: {
    player_id: string;
    player_name: string;
    card_1_position: number;
    card_2_position: number;
    career_name: string;
    pair_id: number;
    xp_earned: number;
    consecutive_matches: number;
  };
}

export interface NoMatchEvent {
  type: 'no_match';
  data: {
    player_id: string;
    card_1_position: number;
    card_2_position: number;
  };
}

export interface TurnChangedEvent {
  type: 'turn_changed';
  data: {
    previous_player_id: string;
    next_player_id: string;
    next_player_name: string;
    turn_number: number;
  };
}

export interface GameEndedEvent {
  type: 'game_ended';
  data: {
    winners: CareerMatchFinalScore[];
    total_turns: number;
    duration_seconds: number;
    ended_at: string;
  };
}

export interface StreakBonusEvent {
  type: 'streak_bonus';
  data: {
    player_id: string;
    player_name: string;
    streak_count: number;
    bonus_xp: number;
  };
}

export interface TimeWarningEvent {
  type: 'time_warning';
  data: {
    seconds_remaining: number;
    message: string;
  };
}

export interface PlayerStatsUpdatedEvent {
  type: 'player_stats_updated';
  data: {
    player_id: string;
    participant_id: string;
    user_id: string | null;
    display_name: string;
    pairs_matched: number;
    total_xp: number;
    arcade_xp: number;
    current_streak: number;
    max_streak: number;
  };
}

// ============================================================================
// SERVICE REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateRoomRequest {
  difficulty: CareerMatchDifficulty;
  max_players?: number;
  fill_with_ai?: boolean;
}

export interface CreateRoomResponse {
  room: CareerMatchRoom;
  room_code: string;
  player: CareerMatchPlayer;
}

export interface JoinRoomRequest {
  room_code: string;
}

export interface JoinRoomResponse {
  room: CareerMatchRoom;
  player: CareerMatchPlayer;
  players: CareerMatchPlayer[];
  is_host: boolean;
}

export interface StartGameRequest {
  room_id: string;
}

export interface StartGameResponse {
  success: boolean;
  cards: CareerMatchCard[];
  first_player_id: string;
}

export interface FlipCardRequest {
  room_id: string;
  position: number;
}

export interface FlipCardResponse {
  card: CareerMatchCard;
  is_match: boolean | null; // null if first flip, true/false if second flip
  match_data?: MatchData;
  next_player_id?: string;
}

export interface MatchData {
  pair_id: number;
  career_name: string;
  xp_earned: number;
  consecutive_matches: number;
  is_streak_bonus: boolean; // 3+ consecutive matches
}

// ============================================================================
// GAME COMPLETION
// ============================================================================

export interface CareerMatchFinalScore {
  player_id: string;
  user_id: string | null;
  display_name: string;
  is_ai_player: boolean;
  rank: number; // 1, 2, 3, etc.

  // Stats
  matches_found: number;
  misses: number;
  longest_streak: number;
  perfect_memory: boolean; // No misses

  // XP breakdown
  match_xp: number; // matches_found * 50
  placement_bonus: number; // 200/100/50 for top 3
  streak_bonus: number; // 100 XP if longest_streak >= 3
  perfect_bonus: number; // 500 XP if perfect_memory
  first_match_bonus: number; // 50 XP for first match
  time_pressure_bonus: number; // Extra XP from last 60s
  total_arcade_xp: number;
  total_pathiq_xp: number; // total_arcade_xp / 10
}

export interface CareerMatchGameResult {
  room_id: string;
  room_code: string;
  difficulty: CareerMatchDifficulty;
  duration_seconds: number;
  total_turns: number;

  // Final scores
  players: CareerMatchFinalScore[];
  winner: CareerMatchFinalScore;

  // Timestamps
  started_at: string;
  ended_at: string;
}

// ============================================================================
// LEADERBOARD
// ============================================================================

export interface CareerMatchLeaderboardEntry {
  game_type: 'career-match';
  player_id: string;
  display_name: string;

  // Primary metrics
  total_matches_found: number;
  total_games_played: number;
  total_wins: number;

  // Performance metrics
  win_rate: number; // wins / games_played
  average_matches_per_game: number;
  perfect_memory_games: number;
  memory_streak_record: number;

  // XP and ranking
  total_arcade_xp: number;
  total_pathiq_xp: number;
  global_rank: number;

  // Timestamps
  last_played: Date;
  first_played: Date;
}

export interface CareerMatchPersonalStats {
  // Overview
  games_played: number;
  total_playtime: string; // "2h 34m"

  // Performance
  win_rate: number; // 0.65 = 65%
  average_matches: number; // 4.2 per game
  total_matches_found: number; // 127

  // Records
  best_game_matches: number; // 8 matches
  longest_memory_streak: number; // 5 consecutive
  perfect_memory_games: number; // 3

  // Rankings
  global_rank: number; // #42 out of 1,250 players
  percentile: number; // Top 3%

  // XP Progress
  total_arcade_xp: number; // 4,280
  total_pathiq_xp: number; // 428
  next_rank_threshold: number; // 5,000 XP
}

// ============================================================================
// UI COMPONENT PROPS
// ============================================================================

export interface CareerMatchCardProps {
  card: CareerMatchCardState;
  onFlip: (position: number) => void;
  disabled: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface CareerMatchGameBoardProps {
  room: CareerMatchRoomState;
  onCardFlip: (position: number) => void;
  currentUserId: string;
}

export interface CareerMatchPlayerPanelProps {
  players: CareerMatchPlayerState[];
  currentTurnPlayerId: string;
  timeRemaining: number | null;
}

export interface CareerMatchLobbyProps {
  room: CareerMatchRoom;
  players: CareerMatchPlayer[];
  currentUserId: string;
  isHost: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export interface CareerMatchCompletionScreenProps {
  result: CareerMatchGameResult;
  currentUserId: string;
  onPlayAgain: () => void;
  onViewCareers: () => void;
  onExit: () => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface GridDimensions {
  rows: number;
  cols: number;
  total: number;
}

export const GRID_LAYOUTS: Record<CareerMatchDifficulty, GridDimensions> = {
  easy: { rows: 3, cols: 4, total: 12 },
  medium: { rows: 4, cols: 5, total: 20 },
  hard: { rows: 5, cols: 6, total: 30 },
};

export const XP_REWARDS = {
  MATCH: 50, // Per match found
  FIRST_PLACE: 200,
  SECOND_PLACE: 100,
  THIRD_PLACE: 50,
  STREAK_BONUS: 100, // 3+ consecutive matches
  PERFECT_MEMORY: 500, // No misses
  FIRST_MATCH: 50, // First match in the game
  TIME_PRESSURE_MULTIPLIER: 2, // Last 60 seconds
} as const;

export const DIFFICULTY_CONFIG = {
  easy: {
    grid_size: 12,
    pairs: 6,
    time_limit: null, // No time limit
    ai_memory_accuracy: 0.3,
  },
  medium: {
    grid_size: 20,
    pairs: 10,
    time_limit: 300, // 5 minutes
    ai_memory_accuracy: 0.6,
  },
  hard: {
    grid_size: 30,
    pairs: 15,
    time_limit: 480, // 8 minutes
    ai_memory_accuracy: 0.9,
  },
} as const;

export const TURN_TIMEOUT_SECONDS = 30;
export const FLIP_ANIMATION_DURATION_MS = 600;
export const MISMATCH_DISPLAY_DURATION_MS = 2000;
export const MATCH_CELEBRATION_DURATION_MS = 1500;
