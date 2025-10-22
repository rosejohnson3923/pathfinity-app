/**
 * AI Player Pool Service
 * Centralized service for managing AI player names across all Discovered Live! games
 *
 * Features:
 * - Global pool of realistic AI player names
 * - Random assignment to games/rooms (no repeats within same session)
 * - Enforces prohibited names (AI Companions, Demo Users)
 * - First Name Last Initial format (e.g., "Sara S.", "James T.")
 * - Session-based tracking to avoid same players appearing together repeatedly
 */

import { v4 as uuidv4 } from 'uuid';

interface AIPlayer {
  id: string;
  name: string;
  avatar?: string;
}

/**
 * Reserved name combinations to avoid conflicts with:
 * - AI Companions: Finn, Harmony, Sage, Spark
 * - Demo Users: Sam B., Alex D., Jordan S., Taylor J.
 */
const PROHIBITED_NAMES = ['Finn', 'Harmony', 'Sage', 'Spark'];
const PROHIBITED_COMBOS = ['Sam B.', 'Alex D.', 'Jordan S.', 'Taylor J.'];

/**
 * Master pool of AI player names
 * Format: First Name Last Initial
 * NOTE: Can use Sam, Alex, Jordan, Taylor but with DIFFERENT last initials
 */
const AI_PLAYER_NAME_POOL = [
  // Female names (30)
  'Sara S.', 'Emily R.', 'Maya P.', 'Sophia L.', 'Ava C.',
  'Isabella H.', 'Mia D.', 'Charlotte F.', 'Amelia W.', 'Harper B.',
  'Ella K.', 'Grace M.', 'Lily N.', 'Chloe T.', 'Zoe J.',
  'Nora V.', 'Hannah G.', 'Layla Q.', 'Riley X.', 'Aria Z.',
  'Luna R.', 'Scarlett P.', 'Victoria K.', 'Penelope H.', 'Madison C.',
  'Addison F.', 'Aubrey L.', 'Brooklyn N.', 'Bella M.', 'Natalie W.',

  // Male names (30)
  'James T.', 'Lucas M.', 'Noah W.', 'Ethan B.', 'Mason J.',
  'Logan H.', 'Oliver K.', 'Elijah R.', 'Aiden P.', 'Jackson D.',
  'Liam F.', 'Carter N.', 'Owen G.', 'Leo V.', 'Henry C.',
  'Jack S.', 'Ryan L.', 'Tyler Q.', 'Dylan X.', 'Caleb Z.',
  'Sebastian H.', 'Matthew K.', 'Daniel P.', 'William R.', 'Alexander C.',
  'Michael F.', 'Benjamin V.', 'Elias N.', 'Theodore M.', 'Gabriel W.',

  // Gender-neutral names (20) - OK to use Sam, Alex, Jordan, Taylor with different last initials
  // Note: Avoid "Sage" (AI Companion), "Finn" (AI Companion), "Harmony" (AI Companion), "Spark" (AI Companion)
  'Sam W.', 'Alex Y.', 'Jordan E.', 'Taylor I.', 'Casey A.',
  'Morgan O.', 'Jamie U.', 'Quinn R.', 'Avery P.', 'Dakota M.',
  'River K.', 'Blake C.', 'Phoenix L.', 'Rowan F.', 'Charlie T.',
  'Drew H.', 'Reese N.', 'Skylar V.', 'Emerson G.', 'Ash B.',
];

/**
 * Avatars pool for AI players
 */
const AVATAR_POOL = [
  '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻',
  '👨‍🔬', '👩‍🔬', '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍⚕️',
  '👨‍🎨', '👩‍🎨', '👨‍🚀', '👩‍🚀', '👨‍🏭', '👩‍🏭',
];

class AIPlayerPoolService {
  private static instance: AIPlayerPoolService;
  private playerPool: AIPlayer[];
  private usedCombinations: Set<string>; // Track recent player combinations to avoid repeats

  private constructor() {
    // Initialize player pool with all names using uuid library (more reliable than crypto.randomUUID)
    this.playerPool = AI_PLAYER_NAME_POOL.map((name, index) => ({
      id: uuidv4(), // Generate proper UUID for database compatibility
      name: name,
      avatar: AVATAR_POOL[index % AVATAR_POOL.length],
    }));

    this.usedCombinations = new Set<string>();

    // Validate no prohibited names exist in pool
    this.validatePool();

    // Log first player ID to verify UUID format
    if (this.playerPool.length > 0) {
      console.log('✅ AI Player Pool created with UUID format. Sample ID:', this.playerPool[0].id);
    }
  }

  static getInstance(): AIPlayerPoolService {
    if (!AIPlayerPoolService.instance) {
      console.log('🔨 Creating NEW AIPlayerPoolService instance...');
      AIPlayerPoolService.instance = new AIPlayerPoolService();
    }
    return AIPlayerPoolService.instance;
  }

  /**
   * Force reset the singleton instance (useful after code changes or for testing)
   */
  static resetInstance(): void {
    console.log('🔄 Resetting AIPlayerPoolService instance...');
    AIPlayerPoolService.instance = new AIPlayerPoolService();
    console.log('✅ AIPlayerPoolService reset complete');
  }

  /**
   * Validate that pool doesn't contain any prohibited names
   */
  private validatePool(): void {
    for (const player of this.playerPool) {
      // Check prohibited single names (AI Companions)
      const firstName = player.name.split(' ')[0];
      if (PROHIBITED_NAMES.includes(firstName)) {
        console.error(`❌ VALIDATION ERROR: Prohibited name "${firstName}" found in AI player pool`);
        throw new Error(`Prohibited name "${firstName}" found in AI player pool`);
      }

      // Check prohibited combos (Demo Users)
      if (PROHIBITED_COMBOS.includes(player.name)) {
        console.error(`❌ VALIDATION ERROR: Prohibited combo "${player.name}" found in AI player pool`);
        throw new Error(`Prohibited combo "${player.name}" found in AI player pool`);
      }

      // Validate format: "FirstName L." (First Name Last Initial with period)
      const formatRegex = /^[A-Z][a-z]+ [A-Z]\.$/;
      if (!formatRegex.test(player.name)) {
        console.warn(`⚠️ WARNING: Name "${player.name}" doesn't match "FirstName L." format`);
      }
    }

    console.log(`✅ AI Player Pool validated: ${this.playerPool.length} names, 0 prohibited names found`);
  }

  /**
   * Get random AI players for a game/room
   * @param count - Number of AI players needed
   * @param roomId - Optional room/game identifier for tracking combinations
   * @returns Array of AI players with unique names
   */
  getRandomPlayers(count: number, roomId?: string): AIPlayer[] {
    if (count > this.playerPool.length) {
      console.warn(`⚠️ Requested ${count} AI players but pool only has ${this.playerPool.length}. Returning all.`);
      count = this.playerPool.length;
    }

    // Create a shuffled copy of the pool
    const shuffled = [...this.playerPool].sort(() => Math.random() - 0.5);

    // Try to find a combination we haven't used recently
    let selectedPlayers: AIPlayer[];
    let attempts = 0;
    const maxAttempts = 10;

    do {
      selectedPlayers = shuffled.slice(attempts * count, (attempts + 1) * count);

      // If we don't have enough players from this slice, wrap around
      if (selectedPlayers.length < count) {
        const remaining = count - selectedPlayers.length;
        selectedPlayers = [...selectedPlayers, ...shuffled.slice(0, remaining)];
      }

      const combinationKey = selectedPlayers.map(p => p.id).sort().join('-');

      // If this is a fresh combination, use it
      if (!this.usedCombinations.has(combinationKey)) {
        this.usedCombinations.add(combinationKey);

        // Keep only last 50 combinations to prevent memory bloat
        if (this.usedCombinations.size > 50) {
          const firstKey = Array.from(this.usedCombinations)[0];
          this.usedCombinations.delete(firstKey);
        }

        break;
      }

      attempts++;
    } while (attempts < maxAttempts);

    // If we exhausted attempts, just use the last selection (rare edge case)
    if (attempts >= maxAttempts) {
      console.log('🔄 Max attempts reached, using current selection (rare edge case)');
    }

    console.log(`🎲 Generated ${selectedPlayers.length} AI players for ${roomId || 'game'}:`,
      selectedPlayers.map(p => p.name).join(', '));

    return selectedPlayers;
  }

  /**
   * Get a specific number of players with specific gender distribution
   * @param total - Total number of players
   * @param femaleCount - Number of female players (rest will be random)
   * @param maleCount - Number of male players (rest will be random)
   * @returns Array of AI players
   */
  getPlayersWithGenderMix(
    total: number,
    femaleCount?: number,
    maleCount?: number
  ): AIPlayer[] {
    const result: AIPlayer[] = [];

    // Get female players
    if (femaleCount && femaleCount > 0) {
      const females = this.playerPool
        .filter(p => this.isFemaleAvatar(p.avatar || ''))
        .sort(() => Math.random() - 0.5)
        .slice(0, femaleCount);
      result.push(...females);
    }

    // Get male players
    if (maleCount && maleCount > 0) {
      const males = this.playerPool
        .filter(p => this.isMaleAvatar(p.avatar || ''))
        .sort(() => Math.random() - 0.5)
        .slice(0, maleCount);
      result.push(...males);
    }

    // Fill remaining with random players
    const remaining = total - result.length;
    if (remaining > 0) {
      const usedIds = new Set(result.map(p => p.id));
      const available = this.playerPool
        .filter(p => !usedIds.has(p.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, remaining);
      result.push(...available);
    }

    return result;
  }

  /**
   * Helper to check if avatar represents female
   */
  private isFemaleAvatar(avatar: string): boolean {
    return avatar.includes('♀') || ['👩‍💼', '👩‍🎓', '👩‍💻', '👩‍🔬', '👩‍🏫', '👩‍⚕️', '👩‍🎨', '👩‍🚀', '👩‍🏭'].includes(avatar);
  }

  /**
   * Helper to check if avatar represents male
   */
  private isMaleAvatar(avatar: string): boolean {
    return avatar.includes('♂') || ['👨‍💼', '👨‍🎓', '👨‍💻', '👨‍🔬', '👨‍🏫', '👨‍⚕️', '👨‍🎨', '👨‍🚀', '👨‍🏭'].includes(avatar);
  }

  /**
   * Get total number of players in the pool
   */
  getPoolSize(): number {
    return this.playerPool.length;
  }

  /**
   * Get all player names (for debugging/admin)
   */
  getAllPlayerNames(): string[] {
    return this.playerPool.map(p => p.name);
  }

  /**
   * Reset used combinations (useful for testing or after extended play sessions)
   */
  resetCombinationHistory(): void {
    this.usedCombinations.clear();
    console.log('🔄 AI player combination history reset');
  }

  /**
   * Get a single random AI player
   */
  getRandomPlayer(): AIPlayer {
    const randomIndex = Math.floor(Math.random() * this.playerPool.length);
    return this.playerPool[randomIndex];
  }

  /**
   * Check if a name is prohibited
   */
  isNameProhibited(name: string): boolean {
    // Check single word names (AI Companions)
    if (PROHIBITED_NAMES.includes(name)) {
      return true;
    }

    // Check full combos (Demo Users)
    if (PROHIBITED_COMBOS.includes(name)) {
      return true;
    }

    return false;
  }

  /**
   * Get prohibited names list (for reference)
   */
  getProhibitedNames(): { names: string[]; combos: string[] } {
    return {
      names: PROHIBITED_NAMES,
      combos: PROHIBITED_COMBOS,
    };
  }
}

export const aiPlayerPoolService = AIPlayerPoolService.getInstance();
export { AIPlayerPoolService }; // Export class for static method access
export type { AIPlayer };
