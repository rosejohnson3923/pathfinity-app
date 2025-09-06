/**
 * Lightweight Practice Support Service
 * Provides streamlined practice support for learning activities
 */

export interface PracticeSession {
  sessionId: string;
  studentId: string;
  skillId: string;
  questions: PracticeQuestion[];
  currentQuestionIndex: number;
  score: number;
  startTime: Date;
  endTime?: Date;
  hintsUsed: number;
  completed: boolean;
}

export interface PracticeQuestion {
  id: string;
  skillId: string;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  hint?: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
}

export interface PracticeResult {
  questionId: string;
  userAnswer: string | number;
  correct: boolean;
  timeSpent: number;
  hintsUsed: number;
}

export interface PracticeFeedback {
  message: string;
  type: 'success' | 'error' | 'info' | 'encouragement';
  suggestion?: string;
  nextStep?: string;
}

class LightweightPracticeSupportService {
  private activeSessions: Map<string, PracticeSession> = new Map();
  private questionBank: Map<string, PracticeQuestion[]> = new Map();
  private sessionResults: Map<string, PracticeResult[]> = new Map();
  
  constructor() {
    this.initializeQuestionBank();
  }
  
  /**
   * Initialize question bank with sample questions
   */
  private initializeQuestionBank() {
    // Kindergarten Math - Counting to 3
    this.questionBank.set('Math_K_4', [
      {
        id: 'mk4-1',
        skillId: 'Math_K_4',
        question: 'How many apples are there? 🍎 🍎',
        options: ['1', '2', '3'],
        correctAnswer: '2',
        hint: 'Count each apple one by one',
        explanation: 'There are 2 apples. We count: one, two!',
        difficulty: 'easy',
        timeLimit: 30
      },
      {
        id: 'mk4-2',
        skillId: 'Math_K_4',
        question: 'Count the stars: ⭐ ⭐ ⭐',
        options: ['1', '2', '3'],
        correctAnswer: '3',
        hint: 'Point to each star as you count',
        explanation: 'There are 3 stars. We count: one, two, three!',
        difficulty: 'easy',
        timeLimit: 30
      },
      {
        id: 'mk4-3',
        skillId: 'Math_K_4',
        question: 'How many fingers am I holding up? ✋ (showing 1 finger)',
        options: ['1', '2', '3'],
        correctAnswer: '1',
        hint: 'Look carefully at how many fingers',
        explanation: 'There is 1 finger showing!',
        difficulty: 'easy',
        timeLimit: 30
      }
    ]);
    
    // Kindergarten Math - Numbers to 5
    this.questionBank.set('Math_K_14', [
      {
        id: 'mk14-1',
        skillId: 'Math_K_14',
        question: 'What number comes after 3?',
        options: ['2', '4', '5'],
        correctAnswer: '4',
        hint: 'Count up from 3',
        explanation: 'After 3 comes 4. We count: 1, 2, 3, 4, 5',
        difficulty: 'medium',
        timeLimit: 30
      },
      {
        id: 'mk14-2',
        skillId: 'Math_K_14',
        question: 'Which number is biggest: 2, 5, or 3?',
        options: ['2', '3', '5'],
        correctAnswer: '5',
        hint: '5 is the most!',
        explanation: '5 is bigger than both 2 and 3',
        difficulty: 'medium',
        timeLimit: 30
      }
    ]);
  }
  
  /**
   * Start a practice session
   */
  async startPracticeSession(
    studentId: string,
    skillId: string
  ): Promise<PracticeSession> {
    const sessionId = `practice-${Date.now()}`;
    const questions = this.questionBank.get(skillId) || [];
    
    if (questions.length === 0) {
      // Generate generic questions if none exist
      questions.push(this.generateGenericQuestion(skillId));
    }
    
    const session: PracticeSession = {
      sessionId,
      studentId,
      skillId,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      startTime: new Date(),
      hintsUsed: 0,
      completed: false
    };
    
    this.activeSessions.set(sessionId, session);
    this.sessionResults.set(sessionId, []);
    
    return session;
  }
  
  /**
   * Get current question
   */
  async getCurrentQuestion(sessionId: string): Promise<PracticeQuestion | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.currentQuestionIndex >= session.questions.length) {
      return null;
    }
    
    return session.questions[session.currentQuestionIndex];
  }
  
  /**
   * Submit answer
   */
  async submitAnswer(
    sessionId: string,
    answer: string | number
  ): Promise<PracticeFeedback> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return {
        message: 'Session not found',
        type: 'error'
      };
    }
    
    const question = session.questions[session.currentQuestionIndex];
    const correct = String(answer) === String(question.correctAnswer);
    
    // Record result
    const results = this.sessionResults.get(sessionId) || [];
    results.push({
      questionId: question.id,
      userAnswer: answer,
      correct,
      timeSpent: Date.now() - session.startTime.getTime(),
      hintsUsed: session.hintsUsed
    });
    this.sessionResults.set(sessionId, results);
    
    // Update score
    if (correct) {
      session.score++;
    }
    
    // Generate feedback
    let feedback: PracticeFeedback;
    if (correct) {
      feedback = {
        message: this.getSuccessMessage(),
        type: 'success',
        suggestion: question.explanation
      };
    } else {
      feedback = {
        message: this.getEncouragementMessage(),
        type: 'encouragement',
        suggestion: question.hint,
        nextStep: 'Try again or use a hint!'
      };
    }
    
    // Move to next question if correct
    if (correct) {
      session.currentQuestionIndex++;
      if (session.currentQuestionIndex >= session.questions.length) {
        session.completed = true;
        session.endTime = new Date();
        feedback.nextStep = 'Practice session complete! Great job!';
      }
    }
    
    this.activeSessions.set(sessionId, session);
    return feedback;
  }
  
  /**
   * Get hint for current question
   */
  async getHint(sessionId: string): Promise<string | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;
    
    const question = session.questions[session.currentQuestionIndex];
    session.hintsUsed++;
    this.activeSessions.set(sessionId, session);
    
    return question.hint || 'Take your time and think about it!';
  }
  
  /**
   * Skip question
   */
  async skipQuestion(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    
    session.currentQuestionIndex++;
    if (session.currentQuestionIndex >= session.questions.length) {
      session.completed = true;
      session.endTime = new Date();
    }
    
    this.activeSessions.set(sessionId, session);
    return true;
  }
  
  /**
   * End practice session
   */
  async endSession(sessionId: string): Promise<{
    score: number;
    total: number;
    percentage: number;
    timeSpent: number;
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return { score: 0, total: 0, percentage: 0, timeSpent: 0 };
    }
    
    session.endTime = new Date();
    session.completed = true;
    
    const timeSpent = (session.endTime.getTime() - session.startTime.getTime()) / 1000;
    const percentage = session.questions.length > 0 
      ? (session.score / session.questions.length) * 100 
      : 0;
    
    this.activeSessions.set(sessionId, session);
    
    return {
      score: session.score,
      total: session.questions.length,
      percentage,
      timeSpent
    };
  }
  
  /**
   * Get session progress
   */
  async getSessionProgress(sessionId: string): Promise<{
    current: number;
    total: number;
    score: number;
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return { current: 0, total: 0, score: 0 };
    }
    
    return {
      current: session.currentQuestionIndex + 1,
      total: session.questions.length,
      score: session.score
    };
  }
  
  /**
   * Generate generic question
   */
  private generateGenericQuestion(skillId: string): PracticeQuestion {
    return {
      id: `generic-${Date.now()}`,
      skillId,
      question: 'Practice question for ' + skillId,
      options: ['Option A', 'Option B', 'Option C'],
      correctAnswer: 'Option A',
      hint: 'Think carefully about the answer',
      explanation: 'This is a practice question',
      difficulty: 'medium',
      timeLimit: 60
    };
  }
  
  /**
   * Get random success message
   */
  private getSuccessMessage(): string {
    const messages = [
      'Excellent work!',
      'You got it!',
      'Fantastic!',
      'Great job!',
      'Perfect!',
      'Amazing!',
      'You\'re doing great!',
      'Keep it up!',
      'Wonderful!',
      'Outstanding!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  /**
   * Get random encouragement message
   */
  private getEncouragementMessage(): string {
    const messages = [
      'Nice try!',
      'Almost there!',
      'Keep going!',
      'You can do it!',
      'Don\'t give up!',
      'Try again!',
      'So close!',
      'Keep practicing!',
      'You\'re learning!',
      'Good effort!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

// Export singleton instance
export const lightweightPracticeSupportService = new LightweightPracticeSupportService();

// Also export the class for testing
export { LightweightPracticeSupportService };