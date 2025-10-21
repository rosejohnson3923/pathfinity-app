/**
 * Discovered Live! Game Types
 *
 * Type definitions for Discovered Live! - an interactive bingo-style game
 * where students match career clues to careers, unlocking a bingo grid.
 *
 * NOTE: Database columns use snake_case, TypeScript interfaces use camelCase.
 * Database tables use DL_ prefix: cb_clues, cb_games, cb_answers
 * See docs/NAMING_CONVENTIONS.md for details.
 */

// ================================================================
// CORE GAME TYPES
// ================================================================

/**
 * Career Clue
 * A single question/clue that students answer to unlock bingo squares
 * Database table: cb_clues
 */
export interface CareerClue {
  id: string;
  careerCode: string;
  clueText: string;
  skillConnection: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gradeCategory: 'elementary' | 'middle' | 'high';
  minPlayCount: number;
  distractorCareers?: string[];
  distractorStrategy?: 'random' | 'related' | 'same_skill';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  timesShown: number;
  timesCorrect: number;
  avgResponseTimeSeconds?: number;
}

/**
 * Discovered Live! Game Session
 * Tracks an individual game session
 * Database table: cb_games
 */
export interface DiscoveredLiveGame {
  id: string;
  studentId: string;
  journeySummaryId?: string;
  bingoGrid: BingoGrid;
  totalQuestions: number;
  status: GameStatus;
  currentQuestionIndex: number;
  questionsAsked: string[]; // Array of clue IDs
  correctAnswers: number;
  incorrectAnswers: number;
  unlockedSquares: GridPosition[];
  completedRows: number[];
  completedColumns: number[];
  completedDiagonals: number[];
  baseXpEarned: number;
  bingoBonusXp: number;
  streakBonusXp: number;
  totalXp: number;
  currentStreak: number;
  maxStreak: number;
  avgResponseTimeSeconds?: number;
  startedAt: string;
  completedAt?: string;
  timeElapsedSeconds?: number;
  userPlayCount: number;
}

/**
 * Discovered Live! Answer
 * Tracks a single answer within a game
 * Database table: cb_answers
 */
export interface DiscoveredLiveAnswer {
  id: string;
  gameId: string;
  clueId: string;
  questionNumber: number;
  careerCode: string;
  optionsShown: CareerOption[];
  correctOptionIndex: number;
  studentAnswerIndex?: number;
  isCorrect: boolean;
  responseTimeSeconds?: number;
  answeredAt: string;
  unlockedPosition?: GridPosition;
}

// ================================================================
// SUPPORTING TYPES
// ================================================================

/**
 * Game Status
 */
export type GameStatus = 'in_progress' | 'completed' | 'abandoned';

/**
 * Grid Position
 * Represents a position on the 5x5 bingo grid
 */
export interface GridPosition {
  row: number; // 0-4
  col: number; // 0-4
}

/**
 * Bingo Grid
 * 5x5 grid of careers with the user's career in center (position 12)
 * Center square is always the user's chosen career (free space)
 */
export interface BingoGrid {
  careers: string[][]; // 5x5 array of career_codes
  userCareerPosition: GridPosition; // Always {row: 2, col: 2} (center)
}

/**
 * Career Option
 * An answer option shown to the student
 */
export interface CareerOption {
  careerCode: string;
  careerName: string;
  icon: string;
}

/**
 * Bingo Achievement
 * Represents a completed line (row, column, or diagonal)
 */
export interface BingoAchievement {
  type: 'row' | 'column' | 'diagonal';
  index: number; // Which row/column (0-3) or which diagonal (0-1)
  xpBonus: number;
}

// ================================================================
// AI GENERATION TYPES
// ================================================================

/**
 * Clue Generation Request
 * Used to request AI-generated clues for a specific skill
 */
export interface ClueGenerationRequest {
  careerCode: string;
  careerName: string;
  skillName: string;
  skillDescription?: string;
  gradeLevel: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  existingClues?: string[]; // To avoid duplicates
}

/**
 * Generated Clue
 * AI-generated clue before being saved to database
 */
export interface GeneratedClue {
  clueText: string;
  skillConnection: string;
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedDistractors: string[]; // Suggested career_codes for wrong answers
}

/**
 * Clue Cache Entry
 * Cached clue for reuse
 */
export interface ClueCacheEntry {
  clue: CareerClue;
  usageCount: number;
  lastUsed: string;
}

// ================================================================
// GAME LOGIC TYPES
// ================================================================

/**
 * Question Data
 * Data needed to present a question to the student
 */
export interface QuestionData {
  clue: CareerClue;
  questionNumber: number;
  options: CareerOption[]; // 4 options (1 correct + 3 distractors)
  correctOptionIndex: number;
  timeStarted: number; // Timestamp when question was shown
}

/**
 * Answer Submission
 * Student's answer to a question
 */
export interface AnswerSubmission {
  gameId: string;
  clueId: string;
  questionNumber: number;
  selectedOptionIndex: number;
  responseTimeSeconds: number;
  options: CareerOption[]; // The exact options that were shown to the user
}

/**
 * Answer Result
 * Result of submitting an answer
 */
export interface AnswerResult {
  isCorrect: boolean;
  correctOptionIndex: number;
  explanation: string;
  xpEarned: number;
  newStreak: number;
  unlockedPosition?: GridPosition;
  newAchievements: BingoAchievement[];
  gameCompleted: boolean;
}

/**
 * Game Summary
 * Summary shown when game completes
 */
export interface GameSummary {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number; // Percentage
  totalXp: number;
  baseXp: number;
  bonusXp: number;
  maxStreak: number;
  achievements: BingoAchievement[];
  completedLines: number; // Total rows + columns + diagonals
  timeElapsedSeconds: number;
  avgResponseTimeSeconds: number;
}

// ================================================================
// UI COMPONENT PROPS
// ================================================================

/**
 * Bingo Card Props
 * Props for the bingo grid display
 */
export interface BingoCardProps {
  grid: BingoGrid;
  unlockedSquares: GridPosition[];
  completedRows: number[];
  completedColumns: number[];
  completedDiagonals: number[];
  highlightUserCareer?: boolean;
}

/**
 * Question Card Props
 * Props for the question display
 */
export interface QuestionCardProps {
  questionData: QuestionData;
  onAnswerSubmit: (answerIndex: number) => void;
  showHint?: boolean;
  disabled?: boolean;
}

/**
 * Progress Stats Props
 * Props for showing game progress
 */
export interface ProgressStatsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  currentStreak: number;
  maxStreak: number;
  totalXp: number;
  unlockedSquares: number;
}

// ================================================================
// DATABASE QUERY TYPES (for Supabase queries)
// ================================================================

/**
 * Database Career Clue (snake_case as returned from Supabase)
 * Use this when working directly with Supabase queries
 */
export interface DbCareerClue {
  id: string;
  career_code: string;
  clue_text: string;
  skill_connection: string;
  difficulty: 'easy' | 'medium' | 'hard';
  grade_category: 'elementary' | 'middle' | 'high';
  min_play_count: number;
  distractor_careers?: string[];
  distractor_strategy?: 'random' | 'related' | 'same_skill';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  times_shown: number;
  times_correct: number;
  avg_response_time_seconds?: number;
}

/**
 * Database Career Detective Game (snake_case as returned from Supabase)
 */
export interface DbDiscoveredLiveGame {
  id: string;
  student_id: string;
  journey_summary_id?: string;
  bingo_grid: any; // JSONB
  total_questions: number;
  status: GameStatus;
  current_question_index: number;
  questions_asked: any; // JSONB array
  correct_answers: number;
  incorrect_answers: number;
  unlocked_squares: any; // JSONB array
  completed_rows: number[];
  completed_columns: number[];
  completed_diagonals: number[];
  base_xp_earned: number;
  bingo_bonus_xp: number;
  streak_bonus_xp: number;
  total_xp: number;
  current_streak: number;
  max_streak: number;
  avg_response_time_seconds?: number;
  started_at: string;
  completed_at?: string;
  time_elapsed_seconds?: number;
  user_play_count: number;
}

/**
 * Database Career Detective Answer (snake_case as returned from Supabase)
 */
export interface DbDiscoveredLiveAnswer {
  id: string;
  game_id: string;
  clue_id: string;
  question_number: number;
  career_code: string;
  options_shown: any; // JSONB
  correct_option_index: number;
  student_answer_index?: number;
  is_correct: boolean;
  response_time_seconds?: number;
  answered_at: string;
  unlocked_position?: any; // JSONB
}

// ================================================================
// UTILITY FUNCTIONS (Type Guards & Converters)
// ================================================================

/**
 * Convert database clue to app clue
 */
export function dbClueToClue(dbClue: DbCareerClue): CareerClue {
  return {
    id: dbClue.id,
    careerCode: dbClue.career_code,
    clueText: dbClue.clue_text,
    skillConnection: dbClue.skill_connection,
    difficulty: dbClue.difficulty,
    gradeCategory: dbClue.grade_category,
    minPlayCount: dbClue.min_play_count,
    distractorCareers: dbClue.distractor_careers,
    distractorStrategy: dbClue.distractor_strategy,
    createdAt: dbClue.created_at,
    updatedAt: dbClue.updated_at,
    isActive: dbClue.is_active,
    timesShown: dbClue.times_shown,
    timesCorrect: dbClue.times_correct,
    avgResponseTimeSeconds: dbClue.avg_response_time_seconds,
  };
}

/**
 * Convert database game to app game
 */
export function dbGameToGame(dbGame: DbDiscoveredLiveGame): DiscoveredLiveGame {
  return {
    id: dbGame.id,
    studentId: dbGame.student_id,
    journeySummaryId: dbGame.journey_summary_id,
    bingoGrid: dbGame.bingo_grid,
    totalQuestions: dbGame.total_questions,
    status: dbGame.status,
    currentQuestionIndex: dbGame.current_question_index,
    questionsAsked: dbGame.questions_asked,
    correctAnswers: dbGame.correct_answers,
    incorrectAnswers: dbGame.incorrect_answers,
    unlockedSquares: dbGame.unlocked_squares,
    completedRows: dbGame.completed_rows,
    completedColumns: dbGame.completed_columns,
    completedDiagonals: dbGame.completed_diagonals,
    baseXpEarned: dbGame.base_xp_earned ?? 0,
    bingoBonusXp: dbGame.bingo_bonus_xp ?? 0,
    streakBonusXp: dbGame.streak_bonus_xp ?? 0,
    totalXp: dbGame.total_xp ?? 0,
    currentStreak: dbGame.current_streak ?? 0,
    maxStreak: dbGame.max_streak ?? 0,
    avgResponseTimeSeconds: dbGame.avg_response_time_seconds,
    startedAt: dbGame.started_at,
    completedAt: dbGame.completed_at,
    timeElapsedSeconds: dbGame.time_elapsed_seconds,
    userPlayCount: dbGame.user_play_count,
  };
}

/**
 * Convert app game to database game (for inserts/updates)
 */
export function gameToDbGame(game: DiscoveredLiveGame): DbDiscoveredLiveGame {
  return {
    id: game.id,
    student_id: game.studentId,
    journey_summary_id: game.journeySummaryId,
    bingo_grid: game.bingoGrid,
    total_questions: game.totalQuestions,
    status: game.status,
    current_question_index: game.currentQuestionIndex,
    questions_asked: game.questionsAsked,
    correct_answers: game.correctAnswers,
    incorrect_answers: game.incorrectAnswers,
    unlocked_squares: game.unlockedSquares,
    completed_rows: game.completedRows,
    completed_columns: game.completedColumns,
    completed_diagonals: game.completedDiagonals,
    base_xp_earned: game.baseXpEarned,
    bingo_bonus_xp: game.bingoBonusXp,
    streak_bonus_xp: game.streakBonusXp,
    total_xp: game.totalXp,
    current_streak: game.currentStreak,
    max_streak: game.maxStreak,
    avg_response_time_seconds: game.avgResponseTimeSeconds,
    started_at: game.startedAt,
    completed_at: game.completedAt,
    time_elapsed_seconds: game.timeElapsedSeconds,
    user_play_count: game.userPlayCount,
  };
}
