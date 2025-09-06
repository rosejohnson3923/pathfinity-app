/**
 * Teacher Analytics Service
 * Provides analytics and insights for teachers about student performance
 */

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  grade: string;
  overallProgress: number;
  accuracy: number;
  timeSpent: number;
  skillsMastered: number;
  skillsInProgress: number;
  lastActive: Date;
  engagementLevel: 'low' | 'medium' | 'high';
}

export interface ClassInsights {
  totalStudents: number;
  averageProgress: number;
  averageAccuracy: number;
  topPerformers: StudentPerformance[];
  strugglingStudents: StudentPerformance[];
  skillsBreakdown: SkillBreakdown[];
  engagementDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface SkillBreakdown {
  skillId: string;
  skillName: string;
  subject: string;
  studentsMastered: number;
  studentsAttempting: number;
  averageAccuracy: number;
  averageAttempts: number;
}

export interface TeacherReport {
  classId: string;
  className: string;
  reportDate: Date;
  insights: ClassInsights;
  recommendations: string[];
  alerts: Alert[];
}

export interface Alert {
  type: 'warning' | 'info' | 'success';
  message: string;
  studentId?: string;
  skillId?: string;
  timestamp: Date;
}

class TeacherAnalyticsService {
  private studentData: Map<string, StudentPerformance> = new Map();
  private classInsights: ClassInsights | null = null;
  
  constructor() {
    this.initializeSampleData();
  }
  
  /**
   * Initialize with sample data
   */
  private initializeSampleData() {
    const sampleStudents: StudentPerformance[] = [
      {
        studentId: 'sam-k',
        studentName: 'Sam',
        grade: 'Kindergarten',
        overallProgress: 35,
        accuracy: 0.85,
        timeSpent: 120,
        skillsMastered: 3,
        skillsInProgress: 5,
        lastActive: new Date(),
        engagementLevel: 'high'
      },
      {
        studentId: 'alex-k',
        studentName: 'Alex',
        grade: 'Kindergarten',
        overallProgress: 28,
        accuracy: 0.72,
        timeSpent: 95,
        skillsMastered: 2,
        skillsInProgress: 4,
        lastActive: new Date(Date.now() - 86400000),
        engagementLevel: 'medium'
      },
      {
        studentId: 'jordan-k',
        studentName: 'Jordan',
        grade: 'Kindergarten',
        overallProgress: 42,
        accuracy: 0.91,
        timeSpent: 150,
        skillsMastered: 4,
        skillsInProgress: 3,
        lastActive: new Date(),
        engagementLevel: 'high'
      }
    ];
    
    sampleStudents.forEach(student => {
      this.studentData.set(student.studentId, student);
    });
  }
  
  /**
   * Get class insights
   */
  async getClassInsights(classId: string): Promise<ClassInsights> {
    const students = Array.from(this.studentData.values());
    
    const insights: ClassInsights = {
      totalStudents: students.length,
      averageProgress: this.calculateAverage(students.map(s => s.overallProgress)),
      averageAccuracy: this.calculateAverage(students.map(s => s.accuracy)),
      topPerformers: this.getTopPerformers(students, 3),
      strugglingStudents: this.getStrugglingStudents(students, 3),
      skillsBreakdown: this.getSkillsBreakdown(students),
      engagementDistribution: this.getEngagementDistribution(students)
    };
    
    this.classInsights = insights;
    return insights;
  }
  
  /**
   * Get student performance
   */
  async getStudentPerformance(studentId: string): Promise<StudentPerformance | undefined> {
    return this.studentData.get(studentId);
  }
  
  /**
   * Get all students
   */
  async getAllStudents(): Promise<StudentPerformance[]> {
    return Array.from(this.studentData.values());
  }
  
  /**
   * Generate teacher report
   */
  async generateReport(classId: string, className: string): Promise<TeacherReport> {
    const insights = await this.getClassInsights(classId);
    
    const report: TeacherReport = {
      classId,
      className,
      reportDate: new Date(),
      insights,
      recommendations: this.generateRecommendations(insights),
      alerts: this.generateAlerts(insights)
    };
    
    return report;
  }
  
  /**
   * Calculate average
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }
  
  /**
   * Get top performers
   */
  private getTopPerformers(students: StudentPerformance[], count: number): StudentPerformance[] {
    return students
      .sort((a, b) => b.overallProgress - a.overallProgress)
      .slice(0, count);
  }
  
  /**
   * Get struggling students
   */
  private getStrugglingStudents(students: StudentPerformance[], count: number): StudentPerformance[] {
    return students
      .filter(s => s.accuracy < 0.7 || s.overallProgress < 30)
      .sort((a, b) => a.overallProgress - b.overallProgress)
      .slice(0, count);
  }
  
  /**
   * Get skills breakdown
   */
  private getSkillsBreakdown(students: StudentPerformance[]): SkillBreakdown[] {
    // Sample skills breakdown
    return [
      {
        skillId: 'Math_K_4',
        skillName: 'Counting to 3',
        subject: 'Math',
        studentsMastered: students.filter(s => s.skillsMastered > 0).length,
        studentsAttempting: students.length,
        averageAccuracy: 0.82,
        averageAttempts: 12
      },
      {
        skillId: 'Math_K_14',
        skillName: 'Numbers to 5',
        subject: 'Math',
        studentsMastered: students.filter(s => s.skillsMastered > 2).length,
        studentsAttempting: students.filter(s => s.skillsInProgress > 0).length,
        averageAccuracy: 0.75,
        averageAttempts: 8
      }
    ];
  }
  
  /**
   * Get engagement distribution
   */
  private getEngagementDistribution(students: StudentPerformance[]): any {
    return {
      low: students.filter(s => s.engagementLevel === 'low').length,
      medium: students.filter(s => s.engagementLevel === 'medium').length,
      high: students.filter(s => s.engagementLevel === 'high').length
    };
  }
  
  /**
   * Generate recommendations
   */
  private generateRecommendations(insights: ClassInsights): string[] {
    const recommendations: string[] = [];
    
    if (insights.averageAccuracy < 0.7) {
      recommendations.push('Consider reviewing fundamental concepts with the class');
    }
    
    if (insights.strugglingStudents.length > insights.totalStudents * 0.3) {
      recommendations.push('Several students need additional support - consider small group instruction');
    }
    
    if (insights.engagementDistribution.low > insights.totalStudents * 0.2) {
      recommendations.push('Engagement is low for some students - try incorporating more interactive activities');
    }
    
    if (insights.topPerformers.length > 0) {
      recommendations.push('Top performers may benefit from advanced challenges');
    }
    
    return recommendations;
  }
  
  /**
   * Generate alerts
   */
  private generateAlerts(insights: ClassInsights): Alert[] {
    const alerts: Alert[] = [];
    
    insights.strugglingStudents.forEach(student => {
      alerts.push({
        type: 'warning',
        message: `${student.studentName} is struggling with accuracy (${Math.round(student.accuracy * 100)}%)`,
        studentId: student.studentId,
        timestamp: new Date()
      });
    });
    
    insights.topPerformers.forEach(student => {
      alerts.push({
        type: 'success',
        message: `${student.studentName} is excelling with ${student.skillsMastered} skills mastered!`,
        studentId: student.studentId,
        timestamp: new Date()
      });
    });
    
    if (insights.averageProgress > 40) {
      alerts.push({
        type: 'info',
        message: 'Class is making good overall progress',
        timestamp: new Date()
      });
    }
    
    return alerts;
  }
  
  /**
   * Export data to CSV
   */
  async exportToCSV(): Promise<string> {
    const students = await this.getAllStudents();
    
    let csv = 'Student Name,Grade,Progress %,Accuracy %,Time Spent (min),Skills Mastered,Engagement\n';
    
    students.forEach(student => {
      csv += `${student.studentName},${student.grade},${student.overallProgress},`;
      csv += `${Math.round(student.accuracy * 100)},${student.timeSpent},`;
      csv += `${student.skillsMastered},${student.engagementLevel}\n`;
    });
    
    return csv;
  }
}

// Export singleton instance
export const teacherAnalyticsService = new TeacherAnalyticsService();