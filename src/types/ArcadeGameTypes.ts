/**
 * Discovered Live! Arcade - Type Definitions
 *
 * Unified type system for the modular arcade infrastructure
 */

// ============================================================================
// GAME MECHANICS & CATALOG
// ============================================================================

export type GameMechanicCode =
  | 'bingo'
  | 'resource_management'
  | 'decision_tree'
  | 'scenario_roleplay';

export type GameCategory = 'matching' | 'strategy' | 'narrative' | 'simulation';

export interface GameMechanicType {
  mechanicCode: GameMechanicCode;
  displayName: string;
  description: string;
  category: GameCategory;
  configSchema: Record<string, any>;
  baseScoring: ScoringRules;
  componentName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScoringRules {
  correctAction: number;
  completionBonus: number;
  timeBonusEnabled: boolean;
  streakMultiplier: number;
}

export interface ArcadeGame {
  gameCode: string;
  displayName: string;
  description: string;
  icon: string;
  mechanicCode: GameMechanicCode;
  contentSource: string;
  contentFilters: Record<string, any>;
  gameConfig: Record<string, any>;
  gradeCategories: ('elementary' | 'middle' | 'high')[];
  unlockRequirements: Record<string, any>;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// GAME CONTENT
// ============================================================================

export type ContentSource = 'careers' | 'skills' | 'industries' | 'subjects';
export type ContentType =
  | 'clue'
  | 'scenario'
  | 'decision'
  | 'challenge'
  | 'resource_event';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GradeCategory = 'elementary' | 'middle' | 'high';

export interface GameContent {
  id: string;
  contentSource: ContentSource;
  contentType: ContentType;
  contentData: BingoClueContent | ResourceEventContent | DecisionNodeContent | ScenarioRoleplayContent;
  subjectId?: string;
  difficulty?: Difficulty;
  gradeCategory?: GradeCategory;
  tags: string[];
  timesUsed: number;
  timesCorrect: number;
  avgResponseTimeSeconds?: number;
  avgRating?: number;
  isActive: boolean;
  requiresReview: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CONTENT SCHEMAS BY MECHANIC TYPE
// ============================================================================

// BINGO Content
export interface BingoClueContent {
  subjectId: string;
  subjectName: string;
  prompt: string;
  answer: string;
  skillConnection: string;
  distractors: string[];
  hint?: string;
  imageUrl?: string;
}

// RESOURCE_MANAGEMENT Content
export interface ResourceEventContent {
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  careerCode: string;
  careerSituation: string;
  options: ResourceOption[];
  timePressure?: number;
  stakesLevel: 'low' | 'medium' | 'high';
}

export interface ResourceOption {
  id: string;
  label: string;
  description: string;
  resourceChanges: Record<string, number>;
  outcomeDescription: string;
  reputationImpact?: number;
  isOptimal: boolean;
  feedback: string;
}

// DECISION_TREE Content
export interface DecisionNodeContent {
  nodeId: string;
  nodeType: 'root' | 'branch' | 'leaf';
  depth: number;
  situationTitle: string;
  situationDescription: string;
  characterState?: {
    skills: string[];
    experienceLevel: number;
    resources: Record<string, number>;
  };
  careerCode?: string;
  careerStage: 'education' | 'entry_level' | 'mid_career' | 'senior';
  decisionPrompt: string;
  choices: DecisionChoice[];
  imageUrl?: string;
  backgroundMusic?: string;
}

export interface DecisionChoice {
  id: string;
  label: string;
  description: string;
  leadsToNode?: string;
  immediateOutcome: string;
  skillGained?: string[];
  xpImpact: number;
  careerImpact: {
    timeline: string;
    opportunitiesOpened: string[];
    opportunitiesClosed: string[];
  };
  isRecommended: boolean;
  mentorAdvice: string;
}

// SCENARIO_ROLEPLAY Content
export interface ScenarioRoleplayContent {
  scenarioId: string;
  scenarioTitle: string;
  scenarioType: 'day_in_life' | 'crisis_response' | 'skill_challenge';
  careerCode: string;
  careerRole: string;
  setting: {
    location: string;
    atmosphere: string;
    timeOfDay: string;
    season?: string;
  };
  challenges: ScenarioChallenge[];
  successCriteria: PerformanceMetrics;
  npcCharacters?: NPCCharacter[];
}

export interface ScenarioChallenge {
  challengeId: string;
  order: number;
  title: string;
  description: string;
  challengeType: 'decision' | 'task' | 'problem_solving' | 'interaction';
  task: {
    prompt: string;
    context: string;
    timeLimit?: number;
  };
  options: ScenarioChallengeOption[];
  imageUrl?: string;
  audioCue?: string;
}

export interface ScenarioChallengeOption {
  id: string;
  action: string;
  reasoning?: string;
  isCorrect: boolean;
  isProfessional: boolean;
  outcome: string;
  performanceScores: PerformanceMetrics;
  mentorFeedback: string;
  industryInsight: string;
  xpEarned: number;
}

export interface PerformanceMetrics {
  professionalism: number;
  efficiency: number;
  problemSolving: number;
  teamwork: number;
}

export interface NPCCharacter {
  name: string;
  role: string;
  personality: string;
  avatarUrl?: string;
}

// ============================================================================
// GAME SESSIONS
// ============================================================================

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface GameSession {
  id: string;
  gameCode: string;
  mechanicCode: GameMechanicCode;
  studentId: string;
  journeySummaryId?: string;
  sessionConfig: Record<string, any>;
  gameState: BingoGameState | ResourceManagementState | DecisionTreeState | ScenarioRoleplayState;
  status: SessionStatus;
  currentRound: number;
  totalRounds: number;
  contentShown: string[];
  correctCount: number;
  incorrectCount: number;
  baseXp: number;
  bonusXp: number;
  totalXp: number;
  currentStreak: number;
  maxStreak: number;
  performanceData: Record<string, any>;
  achievements: Achievement[];
  startedAt: string;
  completedAt?: string;
  timeElapsedSeconds?: number;
  userGamePlayCount: number;
}

// ============================================================================
// GAME STATE SCHEMAS BY MECHANIC TYPE
// ============================================================================

// BINGO Game State
export interface BingoGameState {
  grid: string[][]; // 5x5 grid of subject IDs
  unlockedPositions: GridPosition[];
  completedLines: {
    rows: number[];
    cols: number[];
    diagonals: number[];
  };
  centerFreeSpace: boolean;
  userSubjectInCenter?: string;
}

export interface GridPosition {
  row: number;
  col: number;
}

// RESOURCE_MANAGEMENT Game State
export interface ResourceManagementState {
  resources: Record<string, number>; // {"time": 35, "money": 850, "energy": 75}
  resourceLimits: Record<string, { min: number; max: number }>;
  reputation: number;
  eventsCompleted: string[];
  currentEventId?: string;
}

// DECISION_TREE Game State
export interface DecisionTreeState {
  currentNodeId: string;
  pathTaken: PathNode[];
  skillsAcquired: string[];
  experienceLevel: number;
  resources: Record<string, number>;
  opportunitiesUnlocked: string[];
  opportunitiesClosed: string[];
}

export interface PathNode {
  nodeId: string;
  choiceId: string;
  timestamp: string;
}

// SCENARIO_ROLEPLAY Game State
export interface ScenarioRoleplayState {
  currentChallengeIndex: number;
  challengesCompleted: string[];
  performanceScores: PerformanceMetrics;
  npcRelationships?: Record<string, number>; // NPC name -> relationship score
  inventoryItems?: string[];
}

// ============================================================================
// GAME INTERACTIONS
// ============================================================================

export type InteractionType = 'answer' | 'decision' | 'allocation' | 'action';

export interface GameInteraction {
  id: string;
  sessionId: string;
  contentId?: string;
  roundNumber: number;
  interactionType: InteractionType;
  interactionData: BingoInteraction | ResourceInteraction | DecisionInteraction | RoleplayInteraction;
  isCorrect?: boolean;
  isOptimal?: boolean;
  xpEarned: number;
  feedbackText?: string;
  feedbackData?: Record<string, any>;
  responseTimeSeconds?: number;
  createdAt: string;
}

// ============================================================================
// INTERACTION DATA SCHEMAS BY TYPE
// ============================================================================

export interface BingoInteraction {
  optionsShown: string[];
  studentSelection: string;
  correctAnswer: string;
  isCorrect: boolean;
  unlockedPosition?: GridPosition;
}

export interface ResourceInteraction {
  eventId: string;
  optionSelected: string;
  resourcesBefore: Record<string, number>;
  resourcesAfter: Record<string, number>;
  reputationChange: number;
  wasOptimal: boolean;
}

export interface DecisionInteraction {
  nodeId: string;
  choiceId: string;
  nextNodeId?: string;
  skillsGained: string[];
  opportunitiesChanged: {
    opened: string[];
    closed: string[];
  };
}

export interface RoleplayInteraction {
  challengeId: string;
  actionTaken: string;
  performanceScores: PerformanceMetrics;
  wasCorrect: boolean;
  wasProfessional: boolean;
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export type AchievementType =
  | 'bingo_line'
  | 'perfect_score'
  | 'speed_demon'
  | 'resource_master'
  | 'wise_decision'
  | 'career_expert';

export interface Achievement {
  type: AchievementType;
  description: string;
  xpBonus: number;
  earnedAt: string;
  iconUrl?: string;
}

// ============================================================================
// LEADERBOARDS
// ============================================================================

export type LeaderboardType = 'daily' | 'weekly' | 'monthly' | 'all_time' | 'grade_level';

export interface LeaderboardEntry {
  id: string;
  gameCode?: string;
  mechanicCode?: GameMechanicCode;
  leaderboardType: LeaderboardType;
  studentId: string;
  studentGradeLevel?: string;
  totalXp: number;
  gamesPlayed: number;
  gamesCompleted: number;
  avgScore?: number;
  bestScore?: number;
  rank?: number;
  percentile?: number;
  periodStart: string;
  periodEnd: string;
  updatedAt: string;
}

// ============================================================================
// DATABASE CONVERSION TYPES
// ============================================================================

// Database representations (snake_case from Postgres)
export interface DbGameSession {
  id: string;
  game_code: string;
  mechanic_code: string;
  student_id: string;
  journey_summary_id?: string;
  session_config: any;
  game_state: any;
  status: string;
  current_round: number;
  total_rounds: number;
  content_shown: string[];
  correct_count: number;
  incorrect_count: number;
  base_xp: number;
  bonus_xp: number;
  total_xp: number;
  current_streak: number;
  max_streak: number;
  performance_data: any;
  achievements: any;
  started_at: string;
  completed_at?: string;
  time_elapsed_seconds?: number;
  user_game_play_count: number;
}

export interface DbGameInteraction {
  id: string;
  session_id: string;
  content_id?: string;
  round_number: number;
  interaction_type: string;
  interaction_data: any;
  is_correct?: boolean;
  is_optimal?: boolean;
  xp_earned: number;
  feedback_text?: string;
  feedback_data?: any;
  response_time_seconds?: number;
  created_at: string;
}

// ============================================================================
// SERVICE REQUEST/RESPONSE TYPES
// ============================================================================

export interface StartGameRequest {
  gameCode: string;
  studentId: string;
  journeySummaryId?: string;
  gradeCategory: GradeCategory;
}

export interface StartGameResponse {
  session: GameSession;
  firstContent: GameContent | null;
}

export interface SubmitInteractionRequest {
  sessionId: string;
  roundNumber: number;
  interactionType: InteractionType;
  interactionData: any;
  responseTimeSeconds?: number;
}

export interface SubmitInteractionResponse {
  interaction: GameInteraction;
  updatedSession: GameSession;
  nextContent: GameContent | null;
  newAchievements: Achievement[];
  isSessionComplete: boolean;
}

export interface GetNextContentRequest {
  sessionId: string;
}

export interface GetNextContentResponse {
  content: GameContent | null;
  roundNumber: number;
  isLastRound: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type GameStateType =
  | BingoGameState
  | ResourceManagementState
  | DecisionTreeState
  | ScenarioRoleplayState;

export type InteractionDataType =
  | BingoInteraction
  | ResourceInteraction
  | DecisionInteraction
  | RoleplayInteraction;

export type ContentDataType =
  | BingoClueContent
  | ResourceEventContent
  | DecisionNodeContent
  | ScenarioRoleplayContent;
