/**
 * Discovered Live! Multiplayer Types
 *
 * Type definitions for multiplayer features:
 * - Perpetual rooms
 * - Game sessions
 * - Session participants (human + AI)
 * - Spectators
 * - Click events
 * - Real-time game state
 */

import type { GridPosition, BingoGrid, CareerClue } from './DiscoveredLiveTypes';

// ================================================================
// PERPETUAL ROOMS
// ================================================================

/**
 * Perpetual Room
 * Always-on room that runs continuous games
 * Database table: cb_perpetual_rooms
 */
export interface PerpetualRoom {
  id: string;
  roomCode: string;                  // 'GLOBAL01', 'GAME01', etc.
  roomName: string;                  // 'All Careers - Room 1'
  themeCode?: string;                // 'global', 'game-tester', 'nurse'

  // Current state
  status: RoomStatus;
  currentGameNumber: number;
  currentGameId?: string;

  // Next game timing
  nextGameStartsAt?: string;
  intermissionDurationSeconds: number;

  // Capacity
  maxPlayersPerGame: number;
  currentPlayerCount: number;
  spectatorCount: number;

  // Game settings
  bingoSlotsPerGame: number;
  questionTimeLimitSeconds: number;
  questionsPerGame: number;
  gradeLevel: string;

  // AI configuration
  aiFillEnabled: boolean;
  aiDifficultyMix: 'mixed' | 'easy' | 'medium' | 'hard';

  // Analytics
  totalGamesPlayed: number;
  totalUniquePlayers: number;
  totalBingosWon: number;
  peakConcurrentPlayers: number;
  avgGameDurationSeconds?: number;

  // Status
  isActive: boolean;
  isFeatured: boolean;

  // Timestamps
  createdAt: string;
  lastGameStartedAt?: string;
  updatedAt: string;
}

/**
 * Database version of PerpetualRoom (snake_case)
 */
export interface DbPerpetualRoom {
  id: string;
  room_code: string;
  room_name: string;
  theme_code?: string;
  status: RoomStatus;
  current_game_number: number;
  current_game_id?: string;
  next_game_starts_at?: string;
  intermission_duration_seconds: number;
  max_players_per_game: number;
  current_player_count: number;
  spectator_count: number;
  bingo_slots_per_game: number;
  question_time_limit_seconds: number;
  questions_per_game: number;
  grade_level: string;
  ai_fill_enabled: boolean;
  ai_difficulty_mix: 'mixed' | 'easy' | 'medium' | 'hard';
  total_games_played: number;
  total_unique_players: number;
  total_bingos_won: number;
  peak_concurrent_players: number;
  avg_game_duration_seconds?: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  last_game_started_at?: string;
  updated_at: string;
}

export type RoomStatus = 'active' | 'intermission' | 'paused';

// ================================================================
// GAME SESSIONS
// ================================================================

/**
 * Game Session
 * Individual game within a perpetual room
 * Database table: cb_game_sessions
 */
export interface GameSession {
  id: string;
  perpetualRoomId: string;
  gameNumber: number;
  status: 'active' | 'completed' | 'abandoned';

  // Bingo configuration
  bingoSlotsTotal: number;
  bingoSlotsRemaining: number;
  bingoWinners: BingoWinner[];

  // Question sequence
  currentQuestionNumber: number;
  totalQuestions: number;
  questionsAsked: string[];          // Array of clue IDs

  // Timing
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;

  // Statistics
  totalParticipants: number;
  humanParticipants: number;
  aiParticipants: number;
}

/**
 * Database version of GameSession (snake_case)
 */
export interface DbGameSession {
  id: string;
  perpetual_room_id: string;
  game_number: number;
  status: 'active' | 'completed' | 'abandoned';
  bingo_slots_total: number;
  bingo_slots_remaining: number;
  bingo_winners: any; // JSONB
  current_question_number: number;
  total_questions: number;
  questions_asked: any; // JSONB
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  total_participants: number;
  human_participants: number;
  ai_participants: number;
}

/**
 * Bingo Winner
 * Details about a player who won a bingo
 */
export interface BingoWinner {
  participantId: string;
  bingoNumber: number;               // 1st bingo, 2nd bingo, etc.
  bingoType: 'row' | 'column' | 'diagonal';
  bingoIndex: number;                // Which row/column/diagonal
  claimedAt: string;
  questionNumber: number;
}

// ================================================================
// SESSION PARTICIPANTS
// ================================================================

/**
 * Session Participant
 * A player in a game session (human or AI)
 * Database table: cb_session_participants
 */
export interface SessionParticipant {
  id: string;
  gameSessionId: string;
  perpetualRoomId: string;

  // Participant type
  participantType: 'human' | 'ai_agent';
  studentId?: string;                // NULL for AI
  displayName: string;

  // AI config (if AI)
  aiDifficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  aiPersonality?: string;            // 'QuickBot', 'SteadyBot', 'ThinkBot'

  // Game state
  bingoCard: BingoGrid;              // Each player has unique card
  unlockedSquares: GridPosition[];
  completedLines: CompletedLines;

  // Scoring
  bingosWon: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalXp: number;
  currentStreak: number;
  maxStreak: number;

  // Status
  isActive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'spectating';

  // Timing
  joinedAt: string;
  leftAt?: string;
}

/**
 * Database version of SessionParticipant (snake_case)
 */
export interface DbSessionParticipant {
  id: string;
  game_session_id: string;
  perpetual_room_id: string;
  participant_type: 'human' | 'ai_agent';
  student_id?: string;
  display_name: string;
  ai_difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  ai_personality?: string;
  bingo_card: any; // JSONB
  unlocked_squares: any; // JSONB
  completed_lines: any; // JSONB
  bingos_won: number;
  correct_answers: number;
  incorrect_answers: number;
  total_xp: number;
  current_streak: number;
  max_streak: number;
  is_active: boolean;
  connection_status: 'connected' | 'disconnected' | 'spectating';
  joined_at: string;
  left_at?: string;
}

/**
 * Completed Lines
 * Tracks which lines have been completed
 */
export interface CompletedLines {
  rows: number[];                    // [0, 2, 4] = rows 0, 2, 4 complete
  columns: number[];                 // [1, 3] = columns 1, 3 complete
  diagonals: number[];               // [0, 1] = both diagonals complete
}

// ================================================================
// SPECTATORS
// ================================================================

/**
 * Spectator
 * User watching a room, waiting for next game
 * Database table: cb_spectators
 */
export interface Spectator {
  id: string;
  perpetualRoomId: string;
  currentGameSessionId?: string;
  studentId: string;
  displayName: string;
  willJoinNextGame: boolean;
  startedSpectatingAt: string;
}

/**
 * Database version of Spectator (snake_case)
 */
export interface DbSpectator {
  id: string;
  perpetual_room_id: string;
  current_game_session_id?: string;
  student_id: string;
  display_name: string;
  will_join_next_game: boolean;
  started_spectating_at: string;
}

// ================================================================
// CLICK EVENTS
// ================================================================

/**
 * Click Event
 * Individual click in a multiplayer game
 * Database table: cb_click_events
 */
export interface ClickEvent {
  id: string;
  gameSessionId: string;
  participantId: string;
  questionNumber: number;
  clueId: string;

  // Click details
  clickedCareerCode: string;
  clickedPosition: GridPosition;
  correctCareerCode: string;
  isCorrect: boolean;

  // Timing
  questionStartedAt: string;
  clickedAt: string;
  responseTimeSeconds: number;

  // Result
  unlockedPosition?: GridPosition;
  bingoAchieved: boolean;
  bingoNumber?: number;
  bingoType?: 'row' | 'column' | 'diagonal';
  bingoIndex?: number;

  createdAt: string;
}

/**
 * Database version of ClickEvent (snake_case)
 */
export interface DbClickEvent {
  id: string;
  game_session_id: string;
  participant_id: string;
  question_number: number;
  clue_id: string;
  clicked_career_code: string;
  clicked_position: any; // JSONB
  correct_career_code: string;
  is_correct: boolean;
  question_started_at: string;
  clicked_at: string;
  response_time_seconds: number;
  unlocked_position?: any; // JSONB
  bingo_achieved: boolean;
  bingo_number?: number;
  bingo_type?: 'row' | 'column' | 'diagonal';
  bingo_index?: number;
  created_at: string;
}

// ================================================================
// REAL-TIME GAME STATE
// ================================================================

/**
 * Current Question
 * Question being asked right now
 */
export interface CurrentQuestion {
  questionNumber: number;
  clue: CareerClue;
  correctCareerCode: string;
  startedAt: string;
  endsAt: string;
  timeRemainingSeconds: number;
}

/**
 * Participant Status
 * Real-time status of a participant
 */
export interface ParticipantStatus {
  participantId: string;
  displayName: string;
  isAI: boolean;
  hasAnswered: boolean;
  isCorrect?: boolean;
  responseTime?: number;
  currentXp: number;
  bingosWon: number;
  currentStreak: number;
  connectionStatus: 'connected' | 'disconnected' | 'spectating';
}

/**
 * Room State
 * Complete state of a room for real-time updates
 */
export interface RoomState {
  room: PerpetualRoom;
  currentSession?: GameSession;
  participants: SessionParticipant[];
  spectators: Spectator[];
  currentQuestion?: CurrentQuestion;
  participantStatuses: ParticipantStatus[];
}

// ================================================================
// WEBSOCKET EVENTS
// ================================================================

/**
 * WebSocket Event Types
 */
export type WebSocketEventType =
  | 'room_joined'
  | 'room_left'
  | 'game_started'
  | 'game_completed'
  | 'intermission_started'
  | 'question_started'
  | 'question_ended'
  | 'player_clicked'
  | 'player_correct'
  | 'player_incorrect'
  | 'bingo_achieved'
  | 'participant_joined'
  | 'participant_left'
  | 'participant_disconnected'
  | 'participant_reconnected'
  | 'spectator_joined'
  | 'spectator_left';

/**
 * Base WebSocket Event
 */
export interface WebSocketEvent {
  type: WebSocketEventType;
  roomId: string;
  timestamp: string;
  data: any;
}

/**
 * Game Started Event
 */
export interface GameStartedEvent extends WebSocketEvent {
  type: 'game_started';
  data: {
    gameNumber: number;
    gameSessionId: string;
    participants: SessionParticipant[];
    bingoSlotsTotal: number;
  };
}

/**
 * Question Started Event
 */
export interface QuestionStartedEvent extends WebSocketEvent {
  type: 'question_started';
  data: {
    questionNumber: number;
    clueText: string;
    skillConnection: string;
    correctCareerCode: string;
    timeLimitSeconds: number;
    endsAt: string;
  };
}

/**
 * Player Clicked Event
 */
export interface PlayerClickedEvent extends WebSocketEvent {
  type: 'player_clicked' | 'player_correct' | 'player_incorrect';
  data: {
    participantId: string;
    displayName: string;
    clickedCareerCode: string;
    clickedPosition: GridPosition;
    isCorrect: boolean;
    responseTime: number;
    unlockedPosition?: GridPosition;
    newStreak?: number;
    xpEarned?: number;
  };
}

/**
 * Bingo Achieved Event
 */
export interface BingoAchievedEvent extends WebSocketEvent {
  type: 'bingo_achieved';
  data: {
    participantId: string;
    displayName: string;
    bingoNumber: number;
    bingoType: 'row' | 'column' | 'diagonal';
    bingoIndex: number;
    bingoSlotsRemaining: number;
    xpBonus: number;
  };
}

/**
 * Game Completed Event
 */
export interface GameCompletedEvent extends WebSocketEvent {
  type: 'game_completed';
  data: {
    gameNumber: number;
    winners: BingoWinner[];
    leaderboard: ParticipantResult[];
    nextGameStartsAt: string;
    intermissionSeconds: number;
  };
}

/**
 * Participant Result
 * Final results for a participant
 */
export interface ParticipantResult {
  participantId: string;
  displayName: string;
  isAI: boolean;
  rank: number;
  bingosWon: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  totalXp: number;
  maxStreak: number;
}

// ================================================================
// AI AGENT TYPES
// ================================================================

/**
 * AI Agent Configuration
 */
export interface AIAgentConfig {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  personality: string;               // 'QuickBot', 'SteadyBot', 'ThinkBot', 'ExpertBot'
  displayName: string;

  // Behavior parameters
  accuracyRate: number;              // 0.0 - 1.0
  avgResponseTime: number;           // seconds
  responseTimeVariance: number;      // +/- seconds
  mistakeRate: number;               // 0.0 - 1.0
}

/**
 * AI Click Decision
 * Result of AI agent deciding what to click
 */
export interface AIClickDecision {
  careerCode: string;
  position: GridPosition;
  responseTime: number;
  confidence: number;
}

// ================================================================
// UI COMPONENT PROPS
// ================================================================

/**
 * Room Browser Props
 */
export interface RoomBrowserProps {
  onRoomSelect: (roomCode: string) => void;
  featuredOnly?: boolean;
}

/**
 * Room Card Props
 */
export interface RoomCardProps {
  room: PerpetualRoom;
  onJoin: (roomCode: string) => void;
}

/**
 * Spectator View Props
 */
export interface SpectatorViewProps {
  roomState: RoomState;
  studentId: string;
  onLeaveRoom: () => void;
}

/**
 * Multiplayer Card Props
 */
export interface MultiplayerCardProps {
  myCard: BingoGrid;
  unlockedSquares: GridPosition[];
  completedLines: CompletedLines;
  currentQuestion: CurrentQuestion | null;
  onSquareClick: (row: number, col: number) => void;
  disabled: boolean;
  timeRemaining: number;
}

/**
 * Player Status Bar Props
 */
export interface PlayerStatusBarProps {
  participants: SessionParticipant[];
  participantStatuses: ParticipantStatus[];
  currentParticipantId: string;
  bingoSlotsRemaining: number;
  bingoSlotsTotal: number;
}

/**
 * Leaderboard Props
 */
export interface LeaderboardProps {
  participants: ParticipantResult[];
  highlightParticipantId?: string;
}

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

/**
 * Convert database room to app room
 */
export function dbRoomToRoom(dbRoom: DbPerpetualRoom): PerpetualRoom {
  return {
    id: dbRoom.id,
    roomCode: dbRoom.room_code,
    roomName: dbRoom.room_name,
    themeCode: dbRoom.theme_code,
    status: dbRoom.status,
    currentGameNumber: dbRoom.current_game_number,
    currentGameId: dbRoom.current_game_id,
    nextGameStartsAt: dbRoom.next_game_starts_at,
    intermissionDurationSeconds: dbRoom.intermission_duration_seconds,
    maxPlayersPerGame: dbRoom.max_players_per_game,
    currentPlayerCount: dbRoom.current_player_count,
    spectatorCount: dbRoom.spectator_count,
    bingoSlotsPerGame: dbRoom.bingo_slots_per_game,
    questionTimeLimitSeconds: dbRoom.question_time_limit_seconds,
    questionsPerGame: dbRoom.questions_per_game,
    gradeLevel: dbRoom.grade_level,
    aiFillEnabled: dbRoom.ai_fill_enabled,
    aiDifficultyMix: dbRoom.ai_difficulty_mix,
    totalGamesPlayed: dbRoom.total_games_played,
    totalUniquePlayers: dbRoom.total_unique_players,
    totalBingosWon: dbRoom.total_bingos_won,
    peakConcurrentPlayers: dbRoom.peak_concurrent_players,
    avgGameDurationSeconds: dbRoom.avg_game_duration_seconds,
    isActive: dbRoom.is_active,
    isFeatured: dbRoom.is_featured,
    createdAt: dbRoom.created_at,
    lastGameStartedAt: dbRoom.last_game_started_at,
    updatedAt: dbRoom.updated_at,
  };
}

/**
 * Convert database session to app session
 */
export function dbSessionToSession(dbSession: DbGameSession): GameSession {
  return {
    id: dbSession.id,
    perpetualRoomId: dbSession.perpetual_room_id,
    gameNumber: dbSession.game_number,
    status: dbSession.status,
    bingoSlotsTotal: dbSession.bingo_slots_total,
    bingoSlotsRemaining: dbSession.bingo_slots_remaining,
    bingoWinners: dbSession.bingo_winners || [],
    currentQuestionNumber: dbSession.current_question_number,
    totalQuestions: dbSession.total_questions,
    questionsAsked: dbSession.questions_asked || [],
    startedAt: dbSession.started_at,
    completedAt: dbSession.completed_at,
    durationSeconds: dbSession.duration_seconds,
    totalParticipants: dbSession.total_participants,
    humanParticipants: dbSession.human_participants,
    aiParticipants: dbSession.ai_participants,
  };
}

/**
 * Convert database participant to app participant
 */
export function dbParticipantToParticipant(dbParticipant: DbSessionParticipant): SessionParticipant {
  return {
    id: dbParticipant.id,
    gameSessionId: dbParticipant.game_session_id,
    perpetualRoomId: dbParticipant.perpetual_room_id,
    participantType: dbParticipant.participant_type,
    studentId: dbParticipant.student_id,
    displayName: dbParticipant.display_name,
    aiDifficulty: dbParticipant.ai_difficulty,
    aiPersonality: dbParticipant.ai_personality,
    bingoCard: dbParticipant.bingo_card,
    unlockedSquares: dbParticipant.unlocked_squares || [],
    completedLines: dbParticipant.completed_lines || { rows: [], columns: [], diagonals: [] },
    bingosWon: dbParticipant.bingos_won,
    correctAnswers: dbParticipant.correct_answers,
    incorrectAnswers: dbParticipant.incorrect_answers,
    totalXp: dbParticipant.total_xp,
    currentStreak: dbParticipant.current_streak,
    maxStreak: dbParticipant.max_streak,
    isActive: dbParticipant.is_active,
    connectionStatus: dbParticipant.connection_status,
    joinedAt: dbParticipant.joined_at,
    leftAt: dbParticipant.left_at,
  };
}

/**
 * Convert database spectator to app spectator
 */
export function dbSpectatorToSpectator(dbSpectator: DbSpectator): Spectator {
  return {
    id: dbSpectator.id,
    perpetualRoomId: dbSpectator.perpetual_room_id,
    currentGameSessionId: dbSpectator.current_game_session_id,
    studentId: dbSpectator.student_id,
    displayName: dbSpectator.display_name,
    willJoinNextGame: dbSpectator.will_join_next_game,
    startedSpectatingAt: dbSpectator.started_spectating_at,
  };
}

/**
 * Calculate bingo slots based on player count
 */
export function calculateBingoSlots(playerCount: number): number {
  // Base: Half the players can win, rounded up
  // Min 2 bingos, Max 6 bingos
  return Math.max(2, Math.min(6, Math.ceil(playerCount / 2)));
}

/**
 * Calculate estimated wait time based on current game progress
 */
export function calculateEstimatedWaitTime(session: GameSession): number {
  const questionsRemaining = session.totalQuestions - session.currentQuestionNumber;
  const avgQuestionTime = 20; // seconds (including question + answer + transition)
  return questionsRemaining * avgQuestionTime;
}

/**
 * Format wait time as human-readable string
 */
export function formatWaitTime(seconds: number): string {
  if (seconds < 60) {
    return `~${Math.ceil(seconds / 10) * 10}s`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `~${minutes} min`;
}
