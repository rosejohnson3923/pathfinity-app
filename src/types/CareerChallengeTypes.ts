/**
 * Career Challenge Type Definitions
 *
 * Types for the Discovered Live! Career Challenge game mode
 * Maps to database schema with camelCase naming convention
 */

// ================================================================
// CORE TYPES
// ================================================================

/**
 * Industry Configuration
 * Defines a specific industry context for challenges
 */
export interface Industry {
  id: string;
  code: string; // 'esports', 'healthcare', 'construction'
  name: string; // 'Esports Organization'
  description?: string;
  icon?: string;
  colorScheme?: {
    primary: string;
    secondary: string;
    accent?: string;
  };

  // Challenge configuration
  challengeCategories: string[];
  difficultyLevels: string[];

  // Educational metadata
  gradeLevelMin: 'elementary' | 'middle' | 'high';
  gradeLevelMax: 'elementary' | 'middle' | 'high';
  learningObjectives?: string[];
  careerConnections?: string[];

  // Status
  isActive: boolean;
  isPremium: boolean;
  launchDate?: string;
  timesPlayed: number;
  avgRating?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Challenge Card
 * Represents a specific challenge scenario
 */
export interface Challenge {
  id: string;
  industryId: string;

  // Content
  challengeCode: string;
  title: string;
  scenarioText: string;
  category: string; // 'Finance', 'Operations', etc.

  // Difficulty
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  minRolesRequired: number;
  maxRolesAllowed: number;
  timePressureLevel: number; // 1-5

  // Success criteria
  baseDifficultyScore: number;
  perfectScore: number;
  failureThreshold: number;

  // Role requirements
  requiredRoles?: string[];
  recommendedRoles?: string[];
  restrictedRoles?: string[];

  // Educational
  skillConnections?: string[];
  learningOutcomes?: string[];
  realWorldExample?: string;

  // AI metadata
  aiGenerated: boolean;
  aiPromptUsed?: string;
  humanReviewed: boolean;

  // Statistics
  timesPresented: number;
  successRate?: number;
  avgTeamSize?: number;
  avgCompletionTime?: number;

  // Status
  isActive: boolean;
  isSeasonal: boolean;
  availableFrom?: string;
  availableUntil?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Role Card
 * Represents a playable character/role
 */
export interface RoleCard {
  id: string;
  industryId: string;

  // Identification
  roleCode: string;
  roleName: string;
  roleTitle?: string;
  avatarUrl?: string;

  // Card properties
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  cardSet?: string;

  // Power and abilities
  basePower: number; // 1-10
  categoryBonuses: Record<string, number>;
  specialAbilities?: SpecialAbility[];

  // Description
  description: string;
  flavorText?: string;
  backstory?: string;

  // Career info
  relatedCareerCode?: string;
  educationRequirements?: string[];
  keySkills?: string[];
  salaryRange?: string;

  // Synergies
  synergyPartners?: string[];
  antiSynergyPartners?: string[];

  // Statistics
  totalCopiesDistributed: number;
  timesPlayed: number;
  winRate?: number;

  // Status
  isActive: boolean;
  isCollectible: boolean;
  unlockRequirements?: UnlockRequirement;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Special Ability
 * Unique powers that role cards possess
 */
export interface SpecialAbility {
  name: string;
  effect: string;
  powerModifier?: number;
  triggerCondition?: string;
  cooldown?: number;
}

/**
 * Unlock Requirement
 * Conditions to unlock a role card
 */
export interface UnlockRequirement {
  level?: number;
  achievements?: string[];
  challengesCompleted?: number;
  specificChallenges?: string[];
}

/**
 * Synergy Definition
 * Bonus effects when specific roles are combined
 */
export interface Synergy {
  id: string;
  industryId: string;

  // Identification
  synergyName: string;
  synergyType: 'additive' | 'multiplicative' | 'special' | 'conditional';

  // Requirements
  requiredRoles: string[];
  optionalRoles?: string[];

  // Bonuses
  powerBonus: number;
  powerMultiplier: number;
  categoryBonuses?: Record<string, number>;
  specialEffect?: string;

  // Conditions
  minChallengeDifficulty?: string;
  requiredChallengeCategory?: string;
  activationChance: number;

  // Flavor
  description: string;
  explanation?: string;
  realWorldExample?: string;

  // Statistics
  timesActivated: number;
  successRateWithSynergy?: number;

  // Status
  isActive: boolean;
  isHidden: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ================================================================
// PLAYER DATA TYPES
// ================================================================

/**
 * Player Collection Entry
 * A role card owned by a player
 */
export interface PlayerCollection {
  id: string;
  playerId: string;
  roleCardId: string;
  roleCard?: RoleCard; // Joined data

  // Collection details
  quantity: number;
  firstAcquiredAt: string;
  lastAcquiredAt: string;
  acquisitionMethod: 'earned' | 'traded' | 'purchased' | 'gifted';

  // Experience
  timesUsed: number;
  winsWithCard: number;
  favoritePosition?: number;

  // Trading
  isTradeable: boolean;
  isFavorite: boolean;
  tradeLockedUntil?: string;

  // Customization
  customNickname?: string;
  cardLevel: number;
  cardExperience: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Player Progress
 * Overall Career Challenge statistics
 */
export interface PlayerProgress {
  id: string;
  playerId: string;

  // Statistics
  totalChallengesAttempted: number;
  totalChallengesSucceeded: number;
  totalChallengesPerfect: number;
  winRate?: number;

  // Collection
  totalCardsCollected: number;
  uniqueCardsCollected: number;
  rarestCardRarity?: string;
  favoriteIndustryId?: string;

  // Experience
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  prestigeLevel: number;

  // Achievements
  achievementsEarned: string[];
  industriesUnlocked: string[];
  specialCardsUnlocked: string[];
  titlesEarned: string[];

  // Preferences
  preferredTeamSize?: number;
  favoriteRoleCards?: string[];
  preferredDifficulty?: string;
  avgSessionLength?: number;

  // Social
  tradesCompleted: number;
  giftsSent: number;
  giftsReceived: number;
  friendChallengesWon: number;

  // Records
  currentWinStreak: number;
  bestWinStreak: number;
  fastestChallengeTime?: number;
  highestTeamPower?: number;

  // Activity
  lastPlayedAt?: string;
  lastChallengeId?: string;
  lastIndustryPlayed?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ================================================================
// GAME SESSION TYPES
// ================================================================

/**
 * Game Session
 * A multiplayer Career Challenge game
 */
export interface GameSession {
  id: string;
  hostPlayerId: string;
  roomCode: string;
  industryId: string;

  // Status
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  currentRound: number;
  maxRounds: number;

  // Players
  currentPlayers: number;
  maxPlayers: number;

  // Winner
  winnerId?: string;
  winnerName?: string;
  finalScores?: Record<string, number>;

  // Timing
  startedAt?: string;
  completedAt?: string;
  lastActivityAt: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Game Session Player
 * A player in a multiplayer game
 */
export interface GameSessionPlayer {
  id: string;
  sessionId: string;
  playerId: string;
  displayName: string;

  // Status
  isHost: boolean;
  isReady: boolean;
  isActive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';

  // Game state
  currentScore: number;
  roundsWon: number;
  cardsInHand: number;

  // Stats
  joinedAt: string;
  leftAt?: string;
  lastActionAt: string;
}

/**
 * Challenge Session
 * A single challenge attempt
 */
export interface ChallengeSession {
  id: string;
  gameSessionId?: string; // If part of multiplayer
  roomId?: string;

  // Challenge
  challengeId: string;
  challenge?: Challenge; // Joined data
  challengeNumber: number;

  // Participants
  participants: ChallengeParticipant[];

  // Team composition
  teamComposition?: TeamComposition;
  totalTeamPower: number;
  synergiesActivated: string[];
  totalSynergyBonus: number;

  // Resolution
  challengeDifficultyScore: number;
  finalTeamScore: number;
  outcome: 'success' | 'failure' | 'perfect' | 'abandoned' | 'in_progress';
  outcomeMargin: number;

  // Rewards
  xpAwarded: Record<string, number>;
  cardsAwarded?: Record<string, string[]>;
  achievementsUnlocked?: string[];

  // Timing
  startedAt: string;
  completedAt?: string;
  timeSpentSeconds?: number;

  // Statistics
  turnsTaken: number;
  hintsUsed: number;

  // Timestamp
  createdAt: string;
}

/**
 * Challenge Participant
 * A player in a challenge session
 */
export interface ChallengeParticipant {
  playerId: string;
  displayName: string;
  deployedRoles: string[];
  isAI: boolean;
  teamPosition?: number;
}

/**
 * Team Composition
 * How roles are arranged in a team
 */
export interface TeamComposition {
  formation: 'balanced' | 'offensive' | 'defensive' | 'specialized';
  frontLine: string[]; // Role codes
  support: string[];
  specialist: string[];
  totalRoles: number;
}

// ================================================================
// TRADING TYPES
// ================================================================

/**
 * Trade Offer
 * A card trade between players
 */
export interface TradeOffer {
  id: string;

  // Participants
  offeringPlayerId: string;
  receivingPlayerId?: string; // Null for open offers

  // Contents
  offeredCards: TradedCard[];
  requestedCards?: TradedCard[] | TradeRequirement;

  // Details
  tradeType: 'exchange' | 'gift' | 'auction' | 'quest_reward';
  tradeStatus: 'open' | 'pending' | 'completed' | 'cancelled' | 'expired';
  message?: string;

  // Timing
  expiresAt?: string;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;

  // Audit
  cancelledBy?: string;
  cancellationReason?: string;
}

/**
 * Traded Card
 * A card being offered or requested
 */
export interface TradedCard {
  cardId: string;
  quantity: number;
  card?: RoleCard; // Joined data
}

/**
 * Trade Requirement
 * Criteria for requested cards
 */
export interface TradeRequirement {
  minRarity?: string;
  specificIndustry?: string;
  specificCategory?: string;
  minPower?: number;
  quantity: number;
}

// ================================================================
// DAILY/SPECIAL EVENTS
// ================================================================

/**
 * Daily Challenge
 * Special rotating challenges
 */
export interface DailyChallenge {
  id: string;
  challengeId: string;
  challenge?: Challenge; // Joined data

  // Schedule
  activeDate: string;
  challengeType: 'daily' | 'weekly' | 'weekend' | 'special' | 'seasonal';

  // Rewards
  bonusXp: number;
  bonusCards?: string[];
  specialRewardDescription?: string;

  // Participation
  timesAttempted: number;
  timesCompleted: number;
  uniquePlayers: number;

  // Leaderboard
  leaderboard?: LeaderboardEntry[];

  // Status
  isActive: boolean;
  createdAt: string;
}

/**
 * Leaderboard Entry
 */
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  score: number;
  teamPower: number;
  completionTime: number;
  achievedAt: string;
}

// ================================================================
// UI/DISPLAY TYPES
// ================================================================

/**
 * Card Display Data
 * Combined data for showing a role card in UI
 */
export interface CardDisplayData {
  card: RoleCard;
  owned: boolean;
  quantity: number;
  isNew: boolean;
  canUse: boolean;
  lockedReason?: string;
}

/**
 * Challenge Display Data
 * Combined data for showing a challenge
 */
export interface ChallengeDisplayData {
  challenge: Challenge;
  industry: Industry;
  userBestScore?: number;
  globalBestScore?: number;
  recommendedTeam?: string[];
  estimatedDifficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Team Builder State
 * UI state for building a team
 */
export interface TeamBuilderState {
  selectedRoles: RoleCard[];
  availableRoles: RoleCard[];
  teamPower: number;
  activeSynergies: Synergy[];
  projectedOutcome: 'likely_fail' | 'possible' | 'likely_success' | 'guaranteed';
  warnings?: string[];
  suggestions?: string[];
}

// ================================================================
// WEBSOCKET EVENT TYPES
// ================================================================

/**
 * Career Challenge Event Types
 */
export type CareerChallengeEventType =
  | 'challenge_started'
  | 'role_deployed'
  | 'synergy_activated'
  | 'challenge_completed'
  | 'card_earned'
  | 'trade_offered'
  | 'trade_completed';

/**
 * Challenge Started Event
 */
export interface ChallengeStartedEvent {
  type: 'challenge_started';
  sessionId: string;
  challenge: Challenge;
  participants: string[];
  timeLimit: number;
}

/**
 * Role Deployed Event
 */
export interface RoleDeployedEvent {
  type: 'role_deployed';
  playerId: string;
  roleCard: RoleCard;
  position: number;
  teamPower: number;
}

/**
 * Challenge Completed Event
 */
export interface ChallengeCompletedEvent {
  type: 'challenge_completed';
  sessionId: string;
  outcome: 'success' | 'failure' | 'perfect';
  finalScore: number;
  rewards: {
    xp: number;
    cards: RoleCard[];
    achievements: string[];
  };
  leaderboard: LeaderboardEntry[];
}

// ================================================================
// SERVICE METHOD TYPES
// ================================================================

/**
 * Initialize Challenge Game Options
 */
export interface InitializeChallengeOptions {
  playerId: string;
  industryCode: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  roomId?: string; // For multiplayer
  sessionId?: string;
}

/**
 * Deploy Role Options
 */
export interface DeployRoleOptions {
  sessionId: string;
  playerId: string;
  roleCardId: string;
  position?: number;
}

/**
 * Challenge Result
 */
export interface ChallengeResult {
  success: boolean;
  outcome: 'success' | 'failure' | 'perfect';
  score: number;
  margin: number;
  xpEarned: number;
  cardsEarned: RoleCard[];
  newAchievements: string[];
  teamPerformance: {
    mvpRole: string;
    weakLink?: string;
    synergiesUsed: string[];
    missedSynergies: string[];
  };
}

// ================================================================
// EXPORT DATABASE CONVERTERS
// ================================================================

/**
 * Convert snake_case database fields to camelCase
 */
export function dbIndustryToIndustry(db: any): Industry {
  return {
    id: db.id,
    code: db.code,
    name: db.name,
    description: db.description,
    icon: db.icon,
    colorScheme: db.color_scheme,
    challengeCategories: db.challenge_categories,
    difficultyLevels: db.difficulty_levels,
    gradeLevelMin: db.grade_level_min,
    gradeLevelMax: db.grade_level_max,
    learningObjectives: db.learning_objectives,
    careerConnections: db.career_connections,
    isActive: db.is_active,
    isPremium: db.is_premium,
    launchDate: db.launch_date,
    timesPlayed: db.times_played,
    avgRating: db.avg_rating,
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

export function dbChallengeToChallenge(db: any): Challenge {
  return {
    id: db.id,
    industryId: db.industry_id,
    challengeCode: db.challenge_code,
    title: db.title,
    scenarioText: db.scenario_text,
    category: db.category,
    difficulty: db.difficulty,
    minRolesRequired: db.min_roles_required,
    maxRolesAllowed: db.max_roles_allowed,
    timePressureLevel: db.time_pressure_level,
    baseDifficultyScore: db.base_difficulty_score,
    perfectScore: db.perfect_score,
    failureThreshold: db.failure_threshold,
    requiredRoles: db.required_roles,
    recommendedRoles: db.recommended_roles,
    restrictedRoles: db.restricted_roles,
    skillConnections: db.skill_connections,
    learningOutcomes: db.learning_outcomes,
    realWorldExample: db.real_world_example,
    aiGenerated: db.ai_generated,
    aiPromptUsed: db.ai_prompt_used,
    humanReviewed: db.human_reviewed,
    timesPresented: db.times_presented,
    successRate: db.success_rate,
    avgTeamSize: db.avg_team_size,
    avgCompletionTime: db.avg_completion_time,
    isActive: db.is_active,
    isSeasonal: db.is_seasonal,
    availableFrom: db.available_from,
    availableUntil: db.available_until,
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

export function dbRoleCardToRoleCard(db: any): RoleCard {
  return {
    id: db.id,
    industryId: db.industry_id,
    roleCode: db.role_code,
    roleName: db.role_name,
    roleTitle: db.role_title,
    avatarUrl: db.avatar_url,
    rarity: db.rarity,
    cardSet: db.card_set,
    basePower: db.base_power,
    categoryBonuses: db.category_bonuses,
    specialAbilities: db.special_abilities,
    description: db.description,
    flavorText: db.flavor_text,
    backstory: db.backstory,
    relatedCareerCode: db.related_career_code,
    educationRequirements: db.education_requirements,
    keySkills: db.key_skills,
    salaryRange: db.salary_range,
    synergyPartners: db.synergy_partners,
    antiSynergyPartners: db.anti_synergy_partners,
    totalCopiesDistributed: db.total_copies_distributed,
    timesPlayed: db.times_played,
    winRate: db.win_rate,
    isActive: db.is_active,
    isCollectible: db.is_collectible,
    unlockRequirements: db.unlock_requirements,
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

// ================================================================
// GAME ENGINE TYPES
// ================================================================

// Game phase management
export type GamePhase = 'waiting' | 'playing' | 'paused' | 'finished';
export type TurnPhase = 'idle' | 'selecting_challenge' | 'selecting_team' | 'resolving';

export interface GameAction {
  type: 'select_challenge' | 'submit_team' | 'trade_card' | 'use_power' | 'skip_turn';
  playerId: string;
  data: any;
  timestamp: string;
}

export interface GameEvent {
  type:
    | 'game_started'
    | 'game_ended'
    | 'turn_started'
    | 'turn_ended'
    | 'challenge_selected'
    | 'challenge_attempted'
    | 'player_joined'
    | 'player_left'
    | 'turn_skipped'
    | 'timer_warning';
  playerId: string;
  data?: any;
  timestamp: string;
}

export interface VictoryCondition {
  type: 'score' | 'challenges' | 'time';
  target: number;
}

// Utility function to check rarity tier
export function getRarityTier(rarity: string): number {
  const tiers: Record<string, number> = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
    mythic: 6,
  };
  return tiers[rarity.toLowerCase()] || 1;
}

// ============================================
// EXECUTIVE DECISION MAKER TYPES
// Added for Career Challenge expansion
// ============================================

/**
 * Represents the 6 P's of Business
 */
export type BusinessDriver = 'people' | 'product' | 'pricing' | 'process' | 'proceeds' | 'profits';

/**
 * Types of business scenarios
 */
export type ScenarioType = 'crisis' | 'risk' | 'opportunity';

/**
 * C-Suite executive roles
 */
export type CSuiteRole = 'CMO' | 'COO' | 'CFO' | 'CTO' | 'CHRO';

/**
 * Player leadership levels
 */
export type LeadershipLevel = 'Bronze CEO' | 'Silver CEO' | 'Gold CEO' | 'Platinum CEO' | 'Diamond CEO';

/**
 * Game modes for scenario selection
 */
export type GameMode = 'mixed' | 'crisis_only' | 'opportunity_only' | 'risk_only';

/**
 * Executive Decision game phases
 */
export type ExecutivePhase = 'scenario_reveal' | 'executive_selection' | 'solution_selection' | 'solution_reveal' | 'leadership_analysis';

/**
 * Represents a company room where players compete
 */
export interface CompanyRoom {
  id: string;
  code: string; // e.g., 'MEDICORE'
  name: string; // e.g., 'MediCore Solutions'
  industryId: string;
  description: string;
  companySize: string;
  revenue: string;
  headquarters: string;
  knownFor: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logoIcon: string;
  isActive: boolean;
  playerCapacity: number;
  difficultyModifier: number;
  currentPlayers?: number; // Runtime property
}

/**
 * Business scenario (Crisis, Risk, or Opportunity)
 */
export interface BusinessScenario {
  id: string;
  title: string;
  description: string;
  businessDriver: BusinessDriver;
  scenarioType: ScenarioType;
  specificSituation?: string;
  optimalExecutive: CSuiteRole;
  optimalRationale?: string;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  basePoints: number;
  timeLimitSeconds: number;
  companyRoomId?: string; // If specific to a company
  industrySpecific: boolean;
  executivePitches: Record<CSuiteRole, string>;
  lensMultipliers: Record<CSuiteRole, number>; // Scoring multipliers for each executive lens
  tags?: string[];
  context?: string; // Additional context for the challenge
  pCategory?: string; // P category (people, product, process, place, promotion, price)
  gradeCategory?: 'elementary' | 'middle' | 'high'; // Grade level
}

/**
 * Solution card for a scenario
 */
export interface SolutionCard {
  id: string;
  scenarioId: string;
  content: string;
  detailedExplanation?: string;
  isPerfect: boolean;
  solutionRank: number; // 1-10
  category?: string;
  leadershipImpacts: Partial<SixCs>;
  realWorldExample?: string;
  learningPoint?: string;
}

/**
 * How a solution appears through an executive's lens
 */
export interface LensEffect {
  id: string;
  solutionId: string;
  executiveRole: CSuiteRole;
  perceivedValue: 1 | 2 | 3 | 4 | 5; // Stars
  lensDescription: string;
  emphasisLevel: 'low' | 'medium' | 'high';
  visualIndicators: {
    badges?: string[];
    warnings?: string[];
    color?: string;
  };
  distortsPerception: boolean;
  biasType?: string;
}

/**
 * Solution with lens effect applied
 */
export interface LensedSolution extends SolutionCard {
  displayValue: number; // Perceived value through lens
  displayDescription: string; // Lens-specific description
  visualEmphasis: 'low' | 'medium' | 'high';
  badges: string[];
  warnings: string[];
  isPerfectHidden: boolean; // True if lens hides real quality
}

/**
 * The 6 C's of Leadership scores
 */
export interface SixCs {
  character: number;      // 1-5
  competence: number;     // 1-5
  communication: number;  // 1-5
  compassion: number;     // 1-5
  commitment: number;     // 1-5
  confidence: number;     // 1-5
}

/**
 * Leadership score for a game round
 */
export interface LeadershipScore {
  id: string;
  playerId: string;
  sessionId: string;
  roundNumber: number;
  scenarioId: string;
  selectedExecutive: CSuiteRole;
  wasOptimal: boolean;
  selectedSolutionIds: string[];
  perfectSolutionsCount: number;
  sixCs: SixCs;
  baseScore: number;
  lensMultiplier: number;
  speedBonus: number;
  totalScore: number;
  decisionTimeSeconds: number;
  leadershipFeedback: {
    strengths: string[];
    improvements: string[];
    realWorldParallel?: string;
  };
}

/**
 * Player's overall progression
 */
export interface ExecutivePlayerProgression {
  playerId: string;
  totalXp: number;
  leadershipLevel: LeadershipLevel;
  currentStreak: number;
  longestStreak: number;
  gamesPlayed: number;
  gamesWon: number;
  perfectRounds: number;
  totalScenariosCompleted: number;

  // Scenario type stats
  crisisScenariosCompleted: number;
  riskScenariosCompleted: number;
  opportunityScenariosCompleted: number;

  // Company experience
  companyExperience: Record<string, {
    games: number;
    avgScore: number;
    bestScore: number;
  }>;

  // 6 C's averages
  avgCharacter: number;
  avgCompetence: number;
  avgCommunication: number;
  avgCompassion: number;
  avgCommitment: number;
  avgConfidence: number;

  // Achievements
  specializationBadges: string[];
  achievementsUnlocked: Array<{
    id: string;
    unlockedAt: string;
    name: string;
  }>;

  // Career insights
  careerInsights: {
    recommendedPaths: string[];
    leadershipStyle: string;
    strengths: string[];
    developmentAreas: string[];
  };

  // Preferences
  preferredScenarioType?: ScenarioType;
  preferredCompanyRoom?: string;
  preferredExecutive?: CSuiteRole;
}

/**
 * Executive pitch for a scenario
 */
export interface ExecutivePitch {
  role: CSuiteRole;
  pitch: string; // What they say about the crisis
  emphasis: string[]; // What they focus on
  biasIndicators: string[]; // Visual hints about their bias
}

/**
 * Leadership insight from game analysis
 */
export interface LeadershipInsight {
  category: keyof SixCs;
  score: number;
  feedback: string;
  example: string;
  improvementTip?: string;
}

/**
 * Career path recommendation
 */
export interface CareerPath {
  title: string;
  matchPercentage: number;
  requiredStrengths: string[];
  yourStrengths: string[];
  developmentNeeded: string[];
}

/**
 * Game session with Executive Decision Maker additions
 */
export interface ExecutiveGameSession extends GameSession {
  scenarioId?: string;
  scenarioType?: ScenarioType;
  companyRoomId?: string;
  gameMode: GameMode;
  currentScenario?: BusinessScenario;
  availableSolutions?: SolutionCard[];
  roundScores: LeadershipScore[];
  currentPhase?: ExecutivePhase;
}

/**
 * Executive Decision daily challenge
 */
export interface ExecutiveDailyChallenge {
  id: string;
  challengeDate: string;
  scenarioId: string;
  companyRoomId?: string;
  bonusMultiplier: number;
  specialRules: {
    timeLimit?: number;
    noLensHints?: boolean;
    allSolutionsVisible?: boolean;
  };
  xpReward: number;
  badgeReward?: string;
  totalAttempts: number;
  totalCompletions: number;
  averageScore: number;
}

/**
 * Real-time game event for Executive Decision Maker
 */
export interface ExecutiveGameEvent extends GameEvent {
  type: GameEvent['type'] | 'executive_selected' | 'solutions_submitted' | 'round_complete' | 'leadership_analyzed';
  executiveSelection?: {
    playerId: string;
    executive: CSuiteRole;
    timestamp: number;
  };
  solutionSubmission?: {
    playerId: string;
    solutionIds: string[];
    timestamp: number;
  };
  roundResult?: {
    playerId: string;
    score: number;
    sixCs: SixCs;
  };
}

/**
 * Score calculation result
 */
export interface ScoreCalculationResult {
  baseScore: number;
  perfectSolutionBonus: number;
  lensMultiplier: number;
  speedBonus: number;
  sixCsBonuses: Record<keyof SixCs, number>;
  totalScore: number;
  breakdown: string[]; // Explanation of scoring
}

/**
 * Database converters for Executive Decision types
 */
export function dbCompanyRoomToCompanyRoom(db: any): CompanyRoom {
  return {
    id: db.id,
    code: db.code,
    name: db.name,
    industryId: db.industry_id,
    description: db.description,
    companySize: db.company_size,
    revenue: db.revenue,
    headquarters: db.headquarters,
    knownFor: db.known_for,
    colorScheme: db.color_scheme,
    logoIcon: db.logo_icon,
    isActive: db.is_active,
    playerCapacity: db.player_capacity,
    difficultyModifier: db.difficulty_modifier,
  };
}

export function dbBusinessScenarioToBusinessScenario(db: any): BusinessScenario {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    businessDriver: db.business_driver,
    scenarioType: db.scenario_type,
    specificSituation: db.specific_situation,
    optimalExecutive: db.optimal_executive,
    optimalRationale: db.optimal_rationale,
    difficultyLevel: db.difficulty_level,
    basePoints: db.base_points,
    timeLimitSeconds: db.time_limit_seconds,
    companyRoomId: db.company_room_id,
    industrySpecific: db.industry_specific,
    executivePitches: db.executive_pitches || {},
    lensMultipliers: db.lens_multipliers || {},
    tags: db.tags,
    context: db.context,
    pCategory: db.p_category,
    gradeCategory: db.grade_category,
  };
}

export function dbSolutionCardToSolutionCard(db: any): SolutionCard {
  return {
    id: db.id,
    scenarioId: db.scenario_id,
    content: db.content,
    detailedExplanation: db.detailed_explanation,
    isPerfect: db.is_perfect,
    solutionRank: db.solution_rank,
    category: db.category,
    leadershipImpacts: db.leadership_impacts || {},
    realWorldExample: db.real_world_example,
    learningPoint: db.learning_point,
  };
}

export function dbLensEffectToLensEffect(db: any): LensEffect {
  return {
    id: db.id,
    solutionId: db.solution_id,
    executiveRole: db.executive_role,
    perceivedValue: db.perceived_value,
    lensDescription: db.lens_description,
    emphasisLevel: db.emphasis_level,
    visualIndicators: db.visual_indicators || {},
    distortsPerception: db.distorts_perception,
    biasType: db.bias_type,
  };
}

export function dbLeadershipScoreToLeadershipScore(db: any): LeadershipScore {
  return {
    id: db.id,
    playerId: db.player_id,
    sessionId: db.session_id,
    roundNumber: db.round_number,
    scenarioId: db.scenario_id,
    selectedExecutive: db.selected_executive,
    wasOptimal: db.was_optimal,
    selectedSolutionIds: db.selected_solution_ids,
    perfectSolutionsCount: db.perfect_solutions_count,
    sixCs: {
      character: db.character_score,
      competence: db.competence_score,
      communication: db.communication_score,
      compassion: db.compassion_score,
      commitment: db.commitment_score,
      confidence: db.confidence_score,
    },
    baseScore: db.base_score,
    lensMultiplier: db.lens_multiplier,
    speedBonus: db.speed_bonus,
    totalScore: db.total_score,
    decisionTimeSeconds: db.decision_time_seconds,
    leadershipFeedback: db.leadership_feedback || {},
  };
}