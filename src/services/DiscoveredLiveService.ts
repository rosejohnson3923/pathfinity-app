/**
 * Discovered Live! Service
 * Manages the interactive bingo-style career clue game
 *
 * Game Flow:
 * 1. Initialize game with 5x5 bingo grid (center FREE space)
 * 2. Present career clues one at a time
 * 3. Track answers and unlock bingo squares
 * 4. Detect bingos (5 in a row/column/diagonal)
 * 5. Calculate XP and save results
 */

import { supabase } from '../lib/supabase';
import { dbClueToClue, dbGameToGame } from '../types/DiscoveredLiveTypes';
import type {
  CareerClue,
  DiscoveredLiveGame,
  DiscoveredLiveAnswer,
  DbCareerClue,
  DbDiscoveredLiveGame,
  DbDiscoveredLiveAnswer,
  BingoGrid,
  GridPosition,
  CareerOption,
  QuestionData,
  AnswerSubmission,
  AnswerResult,
  BingoAchievement,
  GameSummary
} from '../types/DiscoveredLiveTypes';

/**
 * Game initialization options
 */
interface GameInitOptions {
  studentId: string;
  journeySummaryId?: string;
  gradeCategory: 'elementary' | 'middle' | 'high';
  totalQuestions?: number; // Default: 20 (for 5x5 grid)
  userCareerCode?: string; // User's chosen career to place on grid
}

class DiscoveredLiveService {
  private static instance: DiscoveredLiveService;

  private constructor() {}

  static getInstance(): DiscoveredLiveService {
    if (!DiscoveredLiveService.instance) {
      DiscoveredLiveService.instance = new DiscoveredLiveService();
    }
    return DiscoveredLiveService.instance;
  }

  /**
   * Initialize a new game
   * Creates bingo grid, selects clues, and stores game in database
   */
  async initializeGame(options: GameInitOptions): Promise<DiscoveredLiveGame> {
    const {
      studentId,
      journeySummaryId,
      gradeCategory,
      totalQuestions = 20,
      userCareerCode
    } = options;

    // Get supabase client
    const client = await supabase();

    // 1. Get student's play count to determine difficulty
    const { data: playCountData, error: playCountError } = await client
      .rpc('get_student_dl_play_count', { p_student_id: studentId });

    if (playCountError) {
      console.error('Error getting play count:', playCountError);
      throw new Error('Failed to get play count');
    }

    const playCount = playCountData || 0;

    // 2. Generate 4x4 bingo grid with diverse careers
    const bingoGrid = await this.generateBingoGrid(gradeCategory, userCareerCode);

    // 3. Auto-unlock user's career square if provided
    const initialUnlockedSquares: GridPosition[] = [];
    if (userCareerCode) {
      initialUnlockedSquares.push(bingoGrid.userCareerPosition);
      console.log(`🎯 Auto-unlocked user's career at position:`, bingoGrid.userCareerPosition);
    }

    // 4. Create game record
    const gameData: Partial<DbDiscoveredLiveGame> = {
      student_id: studentId,
      journey_summary_id: journeySummaryId || undefined,
      bingo_grid: bingoGrid as any,
      total_questions: totalQuestions,
      status: 'in_progress',
      current_question_index: 0,
      questions_asked: [],
      correct_answers: 0,
      incorrect_answers: 0,
      unlocked_squares: initialUnlockedSquares as any,
      completed_rows: [],
      completed_columns: [],
      completed_diagonals: [],
      base_xp_earned: 0,
      bingo_bonus_xp: 0,
      streak_bonus_xp: 0,
      total_xp: 0,
      current_streak: 0,
      max_streak: 0,
      user_play_count: playCount + 1
    };

    const { data: game, error } = await client
      .from('cb_games')
      .insert(gameData)
      .select()
      .single();

    if (error || !game) {
      console.error('Error creating game:', error);
      throw new Error('Failed to create game');
    }

    return dbGameToGame(game);
  }

  /**
   * Generate a 5x5 bingo grid with diverse career codes
   * Center square (2,2) is the FREE SPACE with user's career
   */
  private async generateBingoGrid(
    gradeCategory: 'elementary' | 'middle' | 'high',
    userCareerCode?: string
  ): Promise<BingoGrid> {
    const client = await supabase();

    // Get distinct career codes that have active clues for this grade category
    const { data: cluesData, error: cluesError } = await client
      .from('cb_clues')
      .select('career_code')
      .eq('grade_category', gradeCategory)
      .eq('is_active', true);

    if (cluesError || !cluesData || cluesData.length === 0) {
      console.error('Error fetching careers with clues:', cluesError);
      throw new Error(`No careers found with clues for grade: ${gradeCategory}`);
    }

    // Get unique career codes
    const uniqueCareerCodes = [...new Set(cluesData.map(c => c.career_code))];

    // Get career details for these codes
    const { data: careers, error } = await client
      .from('career_paths')
      .select('career_code')
      .eq('is_active', true)
      .in('career_code', uniqueCareerCodes)
      .limit(30);

    if (error || !careers || careers.length === 0) {
      console.error('Error fetching careers:', error);
      throw new Error('Failed to fetch careers for grid');
    }

    // If user has a career, remove it from the pool (it will go in center)
    let filteredCareers = careers;
    if (userCareerCode) {
      filteredCareers = careers.filter(c => c.career_code !== userCareerCode);
    }

    // Shuffle careers
    const shuffledCareers = filteredCareers
      .map(c => c.career_code)
      .sort(() => Math.random() - 0.5);

    // We need 24 careers for a 5x5 grid (25 squares - 1 center FREE space = 24)
    // If we don't have enough, repeat careers to fill the grid
    const gridCareers: string[] = [];
    while (gridCareers.length < 24) {
      for (const career of shuffledCareers) {
        gridCareers.push(career);
        if (gridCareers.length >= 24) break;
      }
    }

    // Generate 5x5 grid with center as placeholder
    const grid: string[][] = [];
    let careerIndex = 0;

    for (let row = 0; row < 5; row++) {
      grid[row] = [];
      for (let col = 0; col < 5; col++) {
        // Center square (2,2) is the FREE SPACE
        if (row === 2 && col === 2) {
          // Place user's career in center, or a default career if none provided
          grid[row][col] = userCareerCode || 'teacher';
        } else {
          grid[row][col] = gridCareers[careerIndex];
          careerIndex++;
        }
      }
    }

    // User career is always at center (2,2) - FREE SPACE
    const userCareerPosition: GridPosition = { row: 2, col: 2 };

    return {
      careers: grid,
      userCareerPosition
    };
  }

  /**
   * Get next question data for a game
   * Selects appropriate clue and generates answer options
   */
  async getNextQuestion(gameId: string): Promise<QuestionData | null> {
    const client = await supabase();

    // 1. Get game details
    const { data: gameDB, error: gameError } = await client
      .from('cb_games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !gameDB) {
      console.error('Error fetching game:', gameError);
      return null;
    }

    const game = dbGameToGame(gameDB);

    // Check if game is complete
    if (game.currentQuestionIndex >= game.totalQuestions) {
      return null;
    }

    // 2. Get next clue
    const clue = await this.getNextClue(game);
    if (!clue) {
      return null;
    }

    // 3. Generate answer options
    const options = await this.generateAnswerOptions(clue, game);

    // 4. Find correct option index
    const correctOptionIndex = options.findIndex(opt => opt.careerCode === clue.careerCode);

    return {
      clue,
      questionNumber: game.currentQuestionIndex + 1,
      options,
      correctOptionIndex,
      timeStarted: Date.now()
    };
  }

  /**
   * Get next clue for a game
   * Selects appropriate clue based on play count, grade, and careers in grid
   * Prioritizes careers whose positions are not yet unlocked
   */
  private async getNextClue(game: DiscoveredLiveGame): Promise<CareerClue | null> {
    const client = await supabase();

    // 1. Get careers in the bingo grid and find which positions are unlocked
    const gridCareers = game.bingoGrid.careers.flat();

    // Build a set of careers that are fully unlocked (all their positions unlocked)
    const unlockedCareerPositions = new Set<string>();
    for (const unlockedPos of game.unlockedSquares) {
      const careerAtPos = game.bingoGrid.careers[unlockedPos.row]?.[unlockedPos.col];
      if (careerAtPos) {
        unlockedCareerPositions.add(`${careerAtPos}-${unlockedPos.row}-${unlockedPos.col}`);
      }
    }

    // Find careers that still have unlockable positions
    const careersWithLockedPositions: string[] = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const careerCode = game.bingoGrid.careers[row][col];
        const posKey = `${careerCode}-${row}-${col}`;
        if (!unlockedCareerPositions.has(posKey)) {
          careersWithLockedPositions.push(careerCode);
        }
      }
    }

    // 2. Determine difficulty based on play count
    const difficulty = this.getDifficultyForPlayCount(game.userPlayCount);

    // 3. Get suitable clues for careers in grid
    const { data: clues, error: cluesError } = await client
      .from('cb_clues')
      .select('*')
      .in('career_code', gridCareers)
      .eq('is_active', true)
      .lte('min_play_count', game.userPlayCount)
      .order('times_shown', { ascending: true }) // Prefer less-shown clues
      .limit(50); // Increased limit to have more options

    if (cluesError || !clues || clues.length === 0) {
      console.error('Error fetching clues:', cluesError);
      return null;
    }

    // 4. Filter out already-asked clues
    const askedClueIds = game.questionsAsked as string[];
    let availableClues = clues.filter(c => !askedClueIds.includes(c.id));

    if (availableClues.length === 0) {
      console.error('No available clues remaining');
      return null;
    }

    // 5. Prioritize clues for careers with locked positions
    const cluesForLockedPositions = availableClues.filter(c =>
      careersWithLockedPositions.includes(c.career_code)
    );

    // Use prioritized clues if available, otherwise fall back to all available
    const cluePool = cluesForLockedPositions.length > 0 ? cluesForLockedPositions : availableClues;

    // 6. Select a random clue from the pool
    const selectedClue = cluePool[Math.floor(Math.random() * cluePool.length)];

    console.log(`🎯 Selected clue for ${selectedClue.career_code} (${cluesForLockedPositions.length} careers with locked positions available)`);

    return dbClueToClue(selectedClue as DbCareerClue);
  }

  /**
   * Determine difficulty level based on play count
   */
  private getDifficultyForPlayCount(playCount: number): 'easy' | 'medium' | 'hard' {
    if (playCount <= 2) return 'easy';
    if (playCount <= 5) return 'medium';
    return 'hard';
  }

  /**
   * Generate 4 answer options for a clue (1 correct + 3 distractors)
   */
  private async generateAnswerOptions(
    clue: CareerClue,
    game: DiscoveredLiveGame
  ): Promise<CareerOption[]> {
    const gridCareers = game.bingoGrid.careers.flat();

    // Start with correct answer
    const correctCareer = await this.getCareerDetails(clue.careerCode);
    const options: CareerOption[] = correctCareer ? [correctCareer] : [];

    // Generate 3 distractors from grid
    const availableDistractors = gridCareers.filter(c => c !== clue.careerCode);

    // Use clue's distractor strategy
    let distractorCodes: string[] = [];

    if (clue.distractorCareers && clue.distractorCareers.length > 0) {
      // Use suggested distractors if available
      distractorCodes = clue.distractorCareers
        .filter(d => gridCareers.includes(d) && d !== clue.careerCode)
        .slice(0, 3);
    }

    // Fill remaining slots with random careers from grid
    while (distractorCodes.length < 3 && availableDistractors.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableDistractors.length);
      const distractor = availableDistractors[randomIndex];

      if (!distractorCodes.includes(distractor)) {
        distractorCodes.push(distractor);
      }

      availableDistractors.splice(randomIndex, 1);
    }

    // Get career details for all distractors
    const distractorDetails = await Promise.all(
      distractorCodes.map(code => this.getCareerDetails(code))
    );

    options.push(...distractorDetails.filter((d): d is CareerOption => d !== null));

    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  }

  /**
   * Get career details (name and icon) for a career code
   */
  private async getCareerDetails(careerCode: string): Promise<CareerOption | null> {
    const client = await supabase();

    const { data, error } = await client
      .from('career_paths')
      .select('career_code, career_name, icon')
      .eq('career_code', careerCode)
      .single();

    if (error || !data) {
      console.error('Error fetching career details:', error);
      return null;
    }

    return {
      careerCode: data.career_code,
      careerName: data.career_name,
      icon: data.icon || '💼'
    };
  }

  /**
   * Submit an answer and update game state
   */
  async submitAnswer(submission: AnswerSubmission): Promise<AnswerResult> {
    const { gameId, clueId, questionNumber, selectedOptionIndex, responseTimeSeconds, options } = submission;
    const client = await supabase();

    // 1. Get game and clue
    const [gameResponse, clueResponse] = await Promise.all([
      client.from('cb_games').select('*').eq('id', gameId).single(),
      client.from('cb_clues').select('*').eq('id', clueId).single()
    ]);

    if (gameResponse.error || !gameResponse.data) {
      throw new Error('Game not found');
    }
    if (clueResponse.error || !clueResponse.data) {
      throw new Error('Clue not found');
    }

    const game = dbGameToGame(gameResponse.data);
    const clue = dbClueToClue(clueResponse.data as DbCareerClue);

    // 2. Use the options that were shown to the user (no regeneration!)
    const selectedCareer = options[selectedOptionIndex];
    const isCorrect = selectedCareer.careerCode === clue.careerCode;
    const correctOptionIndex = options.findIndex(opt => opt.careerCode === clue.careerCode);

    // 3. Find position of career in bingo grid (if correct)
    let unlockedPosition: GridPosition | undefined;
    if (isCorrect) {
      unlockedPosition = this.findCareerInGrid(game.bingoGrid, clue.careerCode);
      console.log(`✅ Correct! Career: ${clue.careerCode}, Found position:`, unlockedPosition);
    } else {
      console.log(`❌ Incorrect. Selected: ${selectedCareer.careerCode}, Correct: ${clue.careerCode}`);
    }

    // 4. Calculate XP and streaks
    const baseXP = isCorrect ? 10 : 0;
    const newStreak = isCorrect ? game.currentStreak + 1 : 0;
    const streakBonus = this.calculateStreakBonus(newStreak);

    // 5. Record answer in database
    const answerData: Partial<DbDiscoveredLiveAnswer> = {
      game_id: gameId,
      clue_id: clueId,
      question_number: questionNumber,
      career_code: selectedCareer.careerCode,
      options_shown: options as any,
      correct_option_index: correctOptionIndex,
      student_answer_index: selectedOptionIndex,
      is_correct: isCorrect,
      response_time_seconds: responseTimeSeconds,
      unlocked_position: unlockedPosition as any
    };

    await client.from('cb_answers').insert(answerData);

    // 6. Update game state
    const updatedUnlockedSquares = [...game.unlockedSquares];
    if (unlockedPosition) {
      // Only add if not already unlocked (prevent duplicates from repeated careers)
      const alreadyUnlocked = updatedUnlockedSquares.some(
        pos => pos.row === unlockedPosition.row && pos.col === unlockedPosition.col
      );

      if (!alreadyUnlocked) {
        updatedUnlockedSquares.push(unlockedPosition);
        console.log(`🔓 Unlocked new square at ${unlockedPosition.row},${unlockedPosition.col}`);
      } else {
        console.log(`⚠️ Square ${unlockedPosition.row},${unlockedPosition.col} already unlocked`);
      }
    }

    // 7. Check for new bingos
    const newBingos = this.checkForBingos(updatedUnlockedSquares, game);
    const totalNewBingos = newBingos.rows.length + newBingos.columns.length + newBingos.diagonals.length;
    const bingoBonus = this.calculateBingoBonus(totalNewBingos);

    if (totalNewBingos > 0) {
      console.log(`🎉 BINGO! Completed lines:`, newBingos);
      console.log(`   Unlocked squares:`, updatedUnlockedSquares);
    }

    // 8. Convert bingo indices to achievements
    const newAchievements: BingoAchievement[] = [
      ...newBingos.rows.map(row => ({ type: 'row' as const, index: row, xpBonus: 25 })),
      ...newBingos.columns.map(col => ({ type: 'column' as const, index: col, xpBonus: 25 })),
      ...newBingos.diagonals.map(diag => ({ type: 'diagonal' as const, index: diag, xpBonus: 25 }))
    ];

    // 9. Update game in database
    const newBaseXp = (game.baseXpEarned || 0) + baseXP;
    const newBingoXp = (game.bingoBonusXp || 0) + bingoBonus;
    const newStreakXp = (game.streakBonusXp || 0) + streakBonus;
    const newTotalXp = newBaseXp + newBingoXp + newStreakXp;

    const updatedGame: Partial<DbDiscoveredLiveGame> = {
      current_question_index: game.currentQuestionIndex + 1,
      questions_asked: [...game.questionsAsked, clueId] as any,
      correct_answers: game.correctAnswers + (isCorrect ? 1 : 0),
      incorrect_answers: game.incorrectAnswers + (isCorrect ? 0 : 1),
      unlocked_squares: updatedUnlockedSquares as any,
      completed_rows: [...game.completedRows, ...newBingos.rows.filter(r => !game.completedRows.includes(r))],
      completed_columns: [...game.completedColumns, ...newBingos.columns.filter(c => !game.completedColumns.includes(c))],
      completed_diagonals: [...game.completedDiagonals, ...newBingos.diagonals.filter(d => !game.completedDiagonals.includes(d))],
      base_xp_earned: newBaseXp,
      bingo_bonus_xp: newBingoXp,
      streak_bonus_xp: newStreakXp,
      total_xp: newTotalXp,
      current_streak: newStreak,
      max_streak: Math.max(game.maxStreak, newStreak)
    };

    // Check if game is complete
    const gameCompleted = game.currentQuestionIndex + 1 >= game.totalQuestions;
    if (gameCompleted) {
      updatedGame.status = 'completed';
      updatedGame.completed_at = new Date().toISOString();
      updatedGame.time_elapsed_seconds = Math.floor(
        (new Date().getTime() - new Date(game.startedAt).getTime()) / 1000
      );
    }

    console.log('Updating game with data:', updatedGame);

    const { data: updateResult, error: updateError } = await client
      .from('cb_games')
      .update(updatedGame)
      .eq('id', gameId);

    if (updateError) {
      console.error('PATCH ERROR:', updateError);
      throw new Error(`Failed to update game: ${updateError.message}`);
    }

    console.log('Update successful:', updateResult);

    return {
      isCorrect,
      correctOptionIndex,
      explanation: isCorrect
        ? `Correct! ${clue.skillConnection}`
        : `The correct answer was ${options[correctOptionIndex].careerName}. ${clue.skillConnection}`,
      xpEarned: baseXP + bingoBonus + streakBonus,
      newStreak,
      unlockedPosition,
      newAchievements,
      gameCompleted
    };
  }

  /**
   * Find career position in bingo grid (5x5)
   */
  private findCareerInGrid(grid: BingoGrid, careerCode: string): GridPosition | undefined {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (grid.careers[row][col] === careerCode) {
          return { row, col };
        }
      }
    }
    return undefined;
  }

  /**
   * Calculate streak bonus XP
   */
  private calculateStreakBonus(streak: number): number {
    if (streak < 3) return 0;
    if (streak < 5) return 5;
    if (streak < 7) return 10;
    return 15;
  }

  /**
   * Check for new bingos (rows, columns, diagonals)
   * 5x5 grid requires 5 squares in a line
   */
  private checkForBingos(
    unlockedSquares: GridPosition[],
    game: DiscoveredLiveGame
  ): { rows: number[]; columns: number[]; diagonals: number[] } {
    const newRows: number[] = [];
    const newColumns: number[] = [];
    const newDiagonals: number[] = [];

    // Check rows (0-4)
    for (let row = 0; row < 5; row++) {
      if (game.completedRows.includes(row)) continue;

      const rowComplete = [0, 1, 2, 3, 4].every(col =>
        unlockedSquares.some(pos => pos.row === row && pos.col === col)
      );

      if (rowComplete) {
        newRows.push(row);
      }
    }

    // Check columns (0-4)
    for (let col = 0; col < 5; col++) {
      if (game.completedColumns.includes(col)) continue;

      const colComplete = [0, 1, 2, 3, 4].every(row =>
        unlockedSquares.some(pos => pos.row === row && pos.col === col)
      );

      if (colComplete) {
        newColumns.push(col);
      }
    }

    // Check diagonal 1 (top-left to bottom-right: 0)
    if (!game.completedDiagonals.includes(0)) {
      const diag1Complete = [0, 1, 2, 3, 4].every(i =>
        unlockedSquares.some(pos => pos.row === i && pos.col === i)
      );

      if (diag1Complete) {
        newDiagonals.push(0);
      }
    }

    // Check diagonal 2 (top-right to bottom-left: 1)
    if (!game.completedDiagonals.includes(1)) {
      const diag2Complete = [0, 1, 2, 3, 4].every(i =>
        unlockedSquares.some(pos => pos.row === i && pos.col === 4 - i)
      );

      if (diag2Complete) {
        newDiagonals.push(1);
      }
    }

    return { rows: newRows, columns: newColumns, diagonals: newDiagonals };
  }

  /**
   * Calculate bonus XP for completing bingos
   */
  private calculateBingoBonus(bingoCount: number): number {
    return bingoCount * 25; // 25 XP per bingo
  }

  /**
   * Get game by ID
   */
  async getGame(gameId: string): Promise<DiscoveredLiveGame | null> {
    const client = await supabase();

    const { data, error } = await client
      .from('cb_games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error || !data) {
      console.error('Error fetching game:', error);
      return null;
    }

    return dbGameToGame(data);
  }

  /**
   * Get student's recent games
   */
  async getStudentGames(studentId: string, limit: number = 10): Promise<DiscoveredLiveGame[]> {
    const client = await supabase();

    const { data, error } = await client
      .from('cb_games')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error('Error fetching student games:', error);
      return [];
    }

    return data.map(dbGameToGame);
  }

  /**
   * Get game summary for completed game
   */
  async getGameSummary(gameId: string): Promise<GameSummary | null> {
    const game = await this.getGame(gameId);
    if (!game || game.status !== 'completed') {
      return null;
    }

    const achievements: BingoAchievement[] = [
      ...game.completedRows.map(row => ({ type: 'row' as const, index: row, xpBonus: 25 })),
      ...game.completedColumns.map(col => ({ type: 'column' as const, index: col, xpBonus: 25 })),
      ...game.completedDiagonals.map(diag => ({ type: 'diagonal' as const, index: diag, xpBonus: 25 }))
    ];

    const totalAnswers = game.correctAnswers + game.incorrectAnswers;
    const accuracy = totalAnswers > 0 ? (game.correctAnswers / totalAnswers) * 100 : 0;

    return {
      totalQuestions: game.totalQuestions,
      correctAnswers: game.correctAnswers,
      incorrectAnswers: game.incorrectAnswers,
      accuracy,
      totalXp: game.totalXp,
      baseXp: game.baseXpEarned,
      bonusXp: game.bingoBonusXp + game.streakBonusXp,
      maxStreak: game.maxStreak,
      achievements,
      completedLines: achievements.length,
      timeElapsedSeconds: game.timeElapsedSeconds || 0,
      avgResponseTimeSeconds: game.avgResponseTimeSeconds || 0
    };
  }

  /**
   * Get student's total stats across all games
   */
  async getStudentStats(studentId: string): Promise<{
    totalGames: number;
    completedGames: number;
    totalXP: number;
    totalCorrectAnswers: number;
    totalIncorrectAnswers: number;
    averageAccuracy: number;
    totalBingos: number;
    maxStreak: number;
  }> {
    const client = await supabase();

    const { data, error } = await client
      .from('cb_games')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'completed');

    if (error || !data) {
      console.error('Error fetching student stats:', error);
      return {
        totalGames: 0,
        completedGames: 0,
        totalXP: 0,
        totalCorrectAnswers: 0,
        totalIncorrectAnswers: 0,
        averageAccuracy: 0,
        totalBingos: 0,
        maxStreak: 0
      };
    }

    const games = data.map(dbGameToGame);

    const stats = games.reduce(
      (acc, game) => ({
        totalGames: acc.totalGames + 1,
        completedGames: acc.completedGames + 1,
        totalXP: acc.totalXP + game.totalXp,
        totalCorrectAnswers: acc.totalCorrectAnswers + game.correctAnswers,
        totalIncorrectAnswers: acc.totalIncorrectAnswers + game.incorrectAnswers,
        totalBingos: acc.totalBingos + game.completedRows.length + game.completedColumns.length + game.completedDiagonals.length,
        maxStreak: Math.max(acc.maxStreak, game.maxStreak)
      }),
      {
        totalGames: 0,
        completedGames: 0,
        totalXP: 0,
        totalCorrectAnswers: 0,
        totalIncorrectAnswers: 0,
        totalBingos: 0,
        maxStreak: 0
      }
    );

    const totalAnswers = stats.totalCorrectAnswers + stats.totalIncorrectAnswers;
    const averageAccuracy = totalAnswers > 0 ? (stats.totalCorrectAnswers / totalAnswers) * 100 : 0;

    return {
      ...stats,
      averageAccuracy
    };
  }
}

export const discoveredLiveService = DiscoveredLiveService.getInstance();
export type { GameInitOptions };
