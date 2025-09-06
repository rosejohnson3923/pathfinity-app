/**
 * Learning Service
 * Core service for managing learning activities and progress
 */

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  grade: string;
  skill: string;
  duration: number;
  objectives: string[];
  activities: Activity[];
  status?: 'not-started' | 'in-progress' | 'completed';
  progress?: number;
}

export interface Activity {
  id: string;
  type: 'video' | 'interactive' | 'quiz' | 'practice';
  title: string;
  content: any;
  duration: number;
  completed?: boolean;
}

export interface LearningProgress {
  studentId: string;
  lessonId: string;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  timeSpent: number;
}

export class LearningService {
  private lessons: Map<string, Lesson> = new Map();
  private progress: Map<string, LearningProgress> = new Map();
  
  constructor() {
    this.initializeSampleLessons();
  }
  
  /**
   * Initialize sample lessons
   */
  private initializeSampleLessons() {
    const sampleLessons: Lesson[] = [
      {
        id: 'lesson-k-math-1',
        title: 'Counting to 3',
        subject: 'Math',
        grade: 'Kindergarten',
        skill: 'Counting to 3',
        duration: 15,
        objectives: [
          'Count objects up to 3',
          'Recognize numbers 1, 2, 3',
          'Match quantities to numbers'
        ],
        activities: [
          {
            id: 'activity-1',
            type: 'interactive',
            title: 'Count the apples',
            content: { visuals: ['🍎', '🍎', '🍎'] },
            duration: 5
          },
          {
            id: 'activity-2',
            type: 'practice',
            title: 'Practice counting',
            content: { questions: 5 },
            duration: 10
          }
        ]
      }
    ];
    
    sampleLessons.forEach(lesson => {
      this.lessons.set(lesson.id, lesson);
    });
  }
  
  /**
   * Get lesson by ID
   */
  async getLesson(lessonId: string): Promise<Lesson | undefined> {
    return this.lessons.get(lessonId);
  }
  
  /**
   * Get lessons by grade and subject
   */
  async getLessonsByGradeAndSubject(grade: string, subject: string): Promise<Lesson[]> {
    const result: Lesson[] = [];
    this.lessons.forEach(lesson => {
      if (lesson.grade === grade && lesson.subject === subject) {
        result.push(lesson);
      }
    });
    return result;
  }
  
  /**
   * Start a lesson
   */
  async startLesson(studentId: string, lessonId: string): Promise<LearningProgress> {
    const progressKey = `${studentId}-${lessonId}`;
    
    const progress: LearningProgress = {
      studentId,
      lessonId,
      progress: 0,
      startedAt: new Date(),
      timeSpent: 0
    };
    
    this.progress.set(progressKey, progress);
    
    // Update lesson status
    const lesson = this.lessons.get(lessonId);
    if (lesson) {
      lesson.status = 'in-progress';
      lesson.progress = 0;
    }
    
    return progress;
  }
  
  /**
   * Update lesson progress
   */
  async updateProgress(
    studentId: string, 
    lessonId: string, 
    progressPercent: number,
    score?: number
  ): Promise<LearningProgress> {
    const progressKey = `${studentId}-${lessonId}`;
    const progress = this.progress.get(progressKey);
    
    if (!progress) {
      throw new Error('Progress not found');
    }
    
    progress.progress = progressPercent;
    if (score !== undefined) {
      progress.score = score;
    }
    
    if (progressPercent >= 100) {
      progress.completedAt = new Date();
      
      // Update lesson status
      const lesson = this.lessons.get(lessonId);
      if (lesson) {
        lesson.status = 'completed';
        lesson.progress = 100;
      }
    }
    
    this.progress.set(progressKey, progress);
    return progress;
  }
  
  /**
   * Complete an activity
   */
  async completeActivity(
    lessonId: string, 
    activityId: string
  ): Promise<void> {
    const lesson = this.lessons.get(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }
    
    const activity = lesson.activities.find(a => a.id === activityId);
    if (activity) {
      activity.completed = true;
    }
    
    // Calculate overall progress
    const completedCount = lesson.activities.filter(a => a.completed).length;
    const totalCount = lesson.activities.length;
    lesson.progress = Math.round((completedCount / totalCount) * 100);
  }
  
  /**
   * Get student progress
   */
  async getStudentProgress(studentId: string): Promise<LearningProgress[]> {
    const result: LearningProgress[] = [];
    this.progress.forEach((progress, key) => {
      if (key.startsWith(studentId)) {
        result.push(progress);
      }
    });
    return result;
  }
  
  /**
   * Get recommended next lesson
   */
  async getRecommendedLesson(
    studentId: string, 
    currentGrade: string, 
    currentSubject: string
  ): Promise<Lesson | undefined> {
    // Find uncompleted lessons for the grade/subject
    const lessons = await this.getLessonsByGradeAndSubject(currentGrade, currentSubject);
    
    for (const lesson of lessons) {
      const progressKey = `${studentId}-${lesson.id}`;
      const progress = this.progress.get(progressKey);
      
      if (!progress || progress.progress < 100) {
        return lesson;
      }
    }
    
    return undefined;
  }
}

// Export singleton instance
export const learningService = new LearningService();