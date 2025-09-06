import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export class LearningService {
  // ===== SECURE METHODS FOR FINN ORCHESTRATION CONTEXT =====
  
  /**
   * FERPA-compliant method to get secure student data
   * This should only be called from server-side contexts or with proper authentication
   */
  static async getSecureStudentData(userId: string, dataType: string) {
    try {
      // Validate input parameters
      if (!userId || !dataType) {
        throw new Error('Missing required parameters: userId or dataType');
      }

      // Call secure RPC function that validates permissions and returns encrypted data
      const { data, error } = await supabase
        .rpc('get_secure_student_analytics', {
          p_user_id: userId,
          p_data_type: dataType
        });

      if (error) {
        console.error(`Error fetching secure ${dataType}:`, error);
        throw error;
      }

      return { data, success: true };
    } catch (error) {
      console.error(`Error in getSecureStudentData for ${dataType}:`, error);
      
      // Return fallback data based on type to ensure system continues functioning
      const fallbackData = this.getSecureFallbackData(dataType);
      return { data: fallbackData, success: false, fallback: true };
    }
  }

  /**
   * Get struggling topics for a user (FERPA-protected)
   */
  static async getSecureStrugglingTopics(userId: string): Promise<string[]> {
    try {
      const response = await this.getSecureStudentData(userId, 'strugglingTopics');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch struggling topics:', error);
      return []; // Safe fallback
    }
  }

  /**
   * Get completion rate for a user (FERPA-protected)
   */
  static async getSecureCompletionRate(userId: string): Promise<number> {
    try {
      const response = await this.getSecureStudentData(userId, 'completionRate');
      return response.data || 0;
    } catch (error) {
      console.error('Failed to fetch completion rate:', error);
      return 0; // Safe fallback
    }
  }

  /**
   * Get current mood for a user (FERPA-protected)
   */
  static async getSecureCurrentMood(userId: string): Promise<string> {
    try {
      const response = await this.getSecureStudentData(userId, 'currentMood');
      return response.data || 'neutral';
    } catch (error) {
      console.error('Failed to fetch current mood:', error);
      return 'neutral'; // Safe fallback
    }
  }

  /**
   * Get encouragement needs for a user (FERPA-protected)
   */
  static async getSecureNeedsEncouragement(userId: string): Promise<boolean> {
    try {
      const response = await this.getSecureStudentData(userId, 'needsEncouragement');
      return response.data || false;
    } catch (error) {
      console.error('Failed to fetch encouragement status:', error);
      return false; // Safe fallback
    }
  }

  /**
   * Get strong topics for a user (FERPA-protected)
   */
  static async getSecureStrongTopics(userId: string): Promise<string[]> {
    try {
      const response = await this.getSecureStudentData(userId, 'strongTopics');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch strong topics:', error);
      return []; // Safe fallback
    }
  }

  /**
   * Get average time per lesson for a user (FERPA-protected)
   */
  static async getSecureAvgTimePerLesson(userId: string): Promise<number> {
    try {
      const response = await this.getSecureStudentData(userId, 'avgTimePerLesson');
      return response.data || 30;
    } catch (error) {
      console.error('Failed to fetch avg time per lesson:', error);
      return 30; // Safe fallback (30 minutes)
    }
  }

  /**
   * Get comprehensive learning context for Finn AI analysis
   */
  static async getLearningContext(userId: string, tenantId: string) {
    try {
      // Get public learning data (safe for client-side)
      const publicContext = {
        todaysLessons: await this.getTodaysLessons(userId),
        recentProgress: await this.getRecentProgressSummary(userId, tenantId),
        activeSubjects: await this.getActiveSubjects(userId, tenantId),
        sessionInfo: await this.getCurrentSessionInfo(userId)
      };

      // Server-side only: Get sensitive analytics
      const sensitiveContext = {
        strugglingTopics: await this.getSecureStrugglingTopics(userId),
        strongTopics: await this.getSecureStrongTopics(userId),
        completionRate: await this.getSecureCompletionRate(userId),
        currentMood: await this.getSecureCurrentMood(userId),
        needsEncouragement: await this.getSecureNeedsEncouragement(userId),
        avgTimePerLesson: await this.getSecureAvgTimePerLesson(userId)
      };

      return {
        public: publicContext,
        secure: sensitiveContext,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting learning context:', error);
      
      // Return minimal context to keep system functioning
      return {
        public: {
          todaysLessons: [],
          recentProgress: null,
          activeSubjects: [],
          sessionInfo: null
        },
        secure: {
          strugglingTopics: [],
          strongTopics: [],
          completionRate: 0,
          currentMood: 'neutral',
          needsEncouragement: false,
          avgTimePerLesson: 30
        },
        timestamp: new Date().toISOString(),
        fallback: true
      };
    }
  }

  /**
   * Update secure student analytics (server-side only)
   */
  static async updateSecureStudentAnalytics(
    userId: string, 
    tenantId: string, 
    updates: {
      strugglingTopics?: string[];
      strongTopics?: string[];
      completionRate?: number;
      currentMood?: string;
      needsEncouragement?: boolean;
      avgTimePerLesson?: number;
    }
  ) {
    try {
      const { data, error } = await supabase
        .rpc('update_secure_student_analytics', {
          p_user_id: userId,
          p_tenant_id: tenantId,
          p_updates: updates
        });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error updating secure student analytics:', error);
      throw error;
    }
  }

  /**
   * Get fallback data for secure methods when real data is unavailable
   */
  private static getSecureFallbackData(dataType: string): any {
    const fallbackMap: Record<string, any> = {
      'strugglingTopics': [],
      'strongTopics': [],
      'completionRate': 0,
      'currentMood': 'neutral',
      'needsEncouragement': false,
      'avgTimePerLesson': 30
    };

    return fallbackMap[dataType] || null;
  }

  // ===== ENHANCED PUBLIC METHODS =====

  /**
   * Get recent progress summary (public data only)
   */
  static async getRecentProgressSummary(userId: string, tenantId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_recent_progress_summary', {
          p_user_id: userId,
          p_tenant_id: tenantId,
          p_days: 7 // Last 7 days
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching recent progress summary:', error);
      return null;
    }
  }

  /**
   * Get active subjects for user (public data)
   */
  static async getActiveSubjects(userId: string, tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select(`
          subjects (
            id,
            name,
            code,
            color,
            icon
          )
        `)
        .eq('student_id', userId)
        .eq('tenant_id', tenantId)
        .gte('last_activity_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;
      
      const uniqueSubjects = data?.map(item => item.subjects).filter(Boolean) || [];
      return uniqueSubjects;
    } catch (error) {
      console.error('Error fetching active subjects:', error);
      return [];
    }
  }

  /**
   * Get current session info (public data)
   */
  static async getCurrentSessionInfo(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_current_session_info', {
          p_user_id: userId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching current session info:', error);
      return {
        sessionStartTime: new Date(),
        isActiveSession: false,
        lastInteractionTime: new Date()
      };
    }
  }

  // ===== EXISTING METHODS (UNCHANGED) =====

  static async getStudentProgress(studentId: string, tenantId: string) {
    try {
      // Validate input parameters
      if (!studentId || !tenantId) {
        throw new Error('Missing required parameters: studentId or tenantId');
      }

      const { data, error } = await supabase
        .from('student_progress')
        .select(`
          id,
          subject_id,
          mastery_group_id,
          skills_topic_id,
          mastery_level,
          progress_percentage,
          streak_days,
          last_activity_date,
          total_time_spent_minutes,
          lessons_completed,
          assessments_passed,
          subjects (
            id,
            name,
            code,
            color,
            icon
          )
        `)
        .eq('student_id', studentId)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      return null;
    }
  }

  static async updateProgress(
    studentId: string,
    subjectId: string,
    tenantId: string,
    updates: {
      progress_percentage?: number;
      mastery_level?: string;
      streak_days?: number;
      total_time_spent_minutes?: number;
      lessons_completed?: number;
    }
  ) {
    try {
      // Validate input parameters
      if (!studentId || !subjectId || !tenantId) {
        throw new Error('Missing required parameters');
      }

      const { data, error } = await supabase
        .from('student_progress')
        .update(updates)
        .eq('student_id', studentId)
        .eq('subject_id', subjectId)
        .eq('tenant_id', tenantId)
        .select();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  static async getSubjects(tenantId: string, gradeLevel?: string) {
    try {
      // Validate input parameters
      if (!tenantId || !tenantId.trim()) {
        throw new Error('Missing required parameter: tenantId');
      }

      try {
        let query = supabase
          .from('subjects')
          .select('*')
          .eq('tenant_id', tenantId);

        if (gradeLevel) {
          query = query.contains('grade_levels', [gradeLevel]);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data && data.length > 0) {
          return data;
        }
      } catch (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        // Continue to fallback data
      }

      // Return mock data as fallback
      return [
        {
          id: '550e8400-e29b-41d4-a716-446655440030',
          tenant_id: tenantId,
          name: 'Mathematics',
          code: 'MATH',
          grade_levels: ['9', '10', '11', '12'],
          description: 'Comprehensive mathematics curriculum covering algebra, geometry, statistics, and calculus',
          color: '#3B82F6',
          icon: 'calculator',
          is_active: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440031',
          tenant_id: tenantId,
          name: 'English Language Arts',
          code: 'ELA',
          grade_levels: ['9', '10', '11', '12'],
          description: 'Language arts curriculum focusing on reading comprehension, writing, and communication skills',
          color: '#8B5CF6',
          icon: 'book-open',
          is_active: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440032',
          tenant_id: tenantId,
          name: 'Science',
          code: 'SCI',
          grade_levels: ['9', '10', '11', '12'],
          description: 'Comprehensive science curriculum covering biology, chemistry, physics, and environmental science',
          color: '#10B981',
          icon: 'microscope',
          is_active: true
        }
      ];
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return null;
    }
  }

  static async getLearningPath(studentId: string, subjectId: string) {
    try {
      // Validate input parameters
      if (!studentId || !studentId.trim() || !subjectId || !subjectId.trim()) {
        throw new Error('Missing required parameters');
      }

      try {
        const { data, error } = await supabase
          .from('learning_paths')
          .select('*')
          .eq('student_id', studentId)
          .eq('subject_id', subjectId)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

        if (data) {
          return data;
        }
      } catch (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        // Continue to fallback data
      }

      // Return mock data as fallback
      return {
        id: 'mock-learning-path-id',
        student_id: studentId,
        subject_id: subjectId,
        path_sequence: ['550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440203'],
        current_position: 1,
        is_active: true
      };
    } catch (error) {
      console.error('Error fetching learning path:', error);
      return null;
    }
  }

  static async getTodaysLessons(userId: string, date?: string) {
    try {
      console.log('Getting today\'s lessons for user:', userId);

      // Try to fetch lessons from Supabase
      try {
        // Use the get_todays_lessons function instead of direct query
        const { data, error } = await supabase
          .rpc('get_todays_lessons', { p_user_id: userId });

        if (error) {
          console.error('Supabase error fetching lessons:', error);
          throw error;
        }

        if (data && data.length > 0) {
          console.log(`Found ${data.length} lessons in Supabase`);
          return data;
        } else {
          console.log('No lessons found in Supabase, using fallback data');
        }
      } catch (supabaseError) {
        console.error('Error fetching lessons from Supabase:', supabaseError);
        // Continue to fallback data
      }

      // Fallback to minimal mock data if Supabase query fails or returns no data
      console.log('Using fallback mock data for lessons');
      return [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          tenant_id: '550e8400-e29b-41d4-a716-446655440000',
          student_id: userId,
          skills_topic_id: '550e8400-e29b-41d4-a716-446655440201',
          lesson_type: 'reinforcement',
          content: {
            title: 'Linear Equations Mastery',
            description: 'Master the fundamentals of linear equations through step-by-step problem solving and real-world applications',
            activities: [
              'Solve one-step linear equations',
              'Solve multi-step linear equations',
              'Graph linear equations on coordinate plane',
              'Apply linear equations to real-world problems'
            ]
          },
          difficulty_adjustment: 0,
          estimated_duration_minutes: 45,
          scheduled_date: date || new Date().toISOString().split('T')[0],
          status: 'scheduled',
          completion_percentage: 0,
          time_spent_minutes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          skills_topics: {
            id: '550e8400-e29b-41d4-a716-446655440201',
            name: 'Linear Equations',
            description: 'Solving and graphing linear equations',
            learning_objectives: [
              'Solve one-step linear equations',
              'Solve multi-step linear equations',
              'Graph linear equations',
              'Interpret linear equations in real-world contexts'
            ],
            difficulty_level: 2,
            estimated_duration_minutes: 45,
            mastery_groups: {
              id: '550e8400-e29b-41d4-a716-446655440101',
              name: 'Algebra Foundations',
              subjects: {
                id: '550e8400-e29b-41d4-a716-446655440030',
                name: 'Mathematics',
                color: '#3B82F6',
                icon: '📊'
              }
            }
          }
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440007',
          tenant_id: '550e8400-e29b-41d4-a716-446655440000',
          student_id: userId,
          skills_topic_id: '550e8400-e29b-41d4-a716-446655440207',
          lesson_type: 'reinforcement',
          content: {
            title: 'Advanced Problem Solving Techniques',
            description: 'Develop sophisticated problem-solving strategies through systematic analysis, critical thinking, and creative solution development',
            activities: [
              'Apply systematic problem-solving frameworks',
              'Practice breaking down complex problems',
              'Develop multiple solution approaches',
              'Evaluate and refine solution strategies'
            ]
          },
          difficulty_adjustment: 0,
          estimated_duration_minutes: 45,
          scheduled_date: date || new Date().toISOString().split('T')[0],
          status: 'scheduled',
          completion_percentage: 0,
          time_spent_minutes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          skills_topics: {
            id: '550e8400-e29b-41d4-a716-446655440207',
            name: 'Main Idea & Details',
            description: 'Identifying main ideas and supporting details',
            learning_objectives: [
              'Identify explicit main ideas',
              'Infer implicit main ideas',
              'Distinguish between main ideas and supporting details',
              'Summarize texts effectively'
            ],
            difficulty_level: 2,
            estimated_duration_minutes: 40,
            mastery_groups: {
              id: '550e8400-e29b-41d4-a716-446655440105',
              name: 'Reading Comprehension',
              subjects: {
                id: '550e8400-e29b-41d4-a716-446655440031',
                name: 'English Language Arts',
                color: '#8B5CF6',
                icon: '📚'
              }
            }
          }
        }
      ];
    } catch (error) {
      console.error('Error fetching today\'s lessons:', error);
      return null;
    }
  }

  static async completeLesson(lessonId: string, completionData: {
    completion_percentage: number;
    time_spent_minutes: number;
    status: string;
  }) {
    try {
      console.log('Completing lesson:', lessonId, completionData);

      // Validate completion data
      const validatedData = {
        completion_percentage: Math.max(0, Math.min(100, completionData.completion_percentage || 0)),
        time_spent_minutes: Math.max(0, completionData.time_spent_minutes || 0),
        status: completionData.status
      };

      try {
        // Use the complete_lesson function instead of direct update
        const { data, error } = await supabase
          .rpc('complete_lesson', {
            p_lesson_id: lessonId,
            p_completion_percentage: validatedData.completion_percentage,
            p_time_spent_minutes: validatedData.time_spent_minutes,
            p_status: validatedData.status
          });

        if (error) {
          console.error('Supabase error completing lesson:', error);
          throw error;
        }

        console.log('Lesson completed successfully:', data);
        return data;
      } catch (supabaseError) {
        console.error('Error updating lesson in Supabase:', supabaseError);
        // Return a mock successful response as fallback
        return {
          id: lessonId,
          ...validatedData,
          updated_at: new Date().toISOString(),
          message: 'Lesson completed successfully (mock data)'
        };
      }

    } catch (error) {
      console.error('Error completing lesson:', error);
      throw error;
    }
  }

  static async getSubjectById(subjectId: string, tenantId: string) {
    try {
      // Validate input parameters
      if (!subjectId || !subjectId.trim() || !tenantId || !tenantId.trim()) {
        throw new Error('Missing required parameters: subjectId or tenantId');
      }

      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('id', subjectId)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        if (data && data.length > 0) {
          return data[0];
        }
      } catch (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        // Continue to fallback data
      }

      // Return mock data as fallback
      return {
        id: subjectId,
        tenant_id: tenantId,
        name: 'Mathematics',
        code: 'MATH',
        grade_levels: ['9', '10', '11', '12'],
        description: 'Comprehensive mathematics curriculum covering algebra, geometry, statistics, and calculus',
        color: '#3B82F6',
        icon: 'calculator',
        is_active: true
      };
    } catch (error) {
      console.error('Error fetching subject by ID:', error);
      return null;
    }
  }
  
  static async getMasteryGroupsBySubject(subjectId: string, tenantId: string) {
    try {
      // Validate input parameters
      if (!subjectId || !subjectId.trim() || !tenantId || !tenantId.trim()) {
        throw new Error('Missing required parameters: subjectId or tenantId');
      }

      try {
        const { data, error } = await supabase
          .from('mastery_groups')
          .select(`
            id,
            name,
            description,
            grade_level,
            sequence_order,
            skills_topics (
              id,
              name,
              description,
              difficulty_level,
              estimated_duration_minutes,
              learning_objectives,
              sequence_order
            )
          `)
          .eq('subject_id', subjectId)
          .eq('tenant_id', tenantId)
          .order('sequence_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          return data;
        }
      } catch (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        // Continue to fallback data
      }

      // Return mock data as fallback
      return [
        {
          id: '550e8400-e29b-41d4-a716-446655440101',
          name: 'Algebra Foundations',
          description: 'Core algebraic concepts and fundamental skills',
          grade_level: '9',
          sequence_order: 1,
          skills_topics: [
            {
              id: '550e8400-e29b-41d4-a716-446655440201',
              name: 'Linear Equations',
              description: 'Solving and graphing linear equations',
              difficulty_level: 2,
              estimated_duration_minutes: 45,
              sequence_order: 1,
              learning_objectives: [
                'Solve one-step linear equations',
                'Solve multi-step linear equations',
                'Graph linear equations',
                'Interpret linear equations in real-world contexts'
              ]
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440202',
              name: 'Algebraic Expressions',
              description: 'Simplifying and evaluating algebraic expressions',
              difficulty_level: 2,
              estimated_duration_minutes: 40,
              sequence_order: 2,
              learning_objectives: [
                'Identify terms and coefficients',
                'Combine like terms',
                'Evaluate expressions with variables',
                'Apply the distributive property'
              ]
            }
          ]
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440102',
          name: 'Geometry Essentials',
          description: 'Essential geometric principles and spatial reasoning',
          grade_level: '9',
          sequence_order: 2,
          skills_topics: [
            {
              id: '550e8400-e29b-41d4-a716-446655440204',
              name: 'Angles & Triangles',
              description: 'Properties of angles and triangles',
              difficulty_level: 2,
              estimated_duration_minutes: 45,
              sequence_order: 1,
              learning_objectives: [
                'Identify angle relationships',
                'Apply angle sum theorems',
                'Classify triangles',
                'Apply triangle congruence criteria'
              ]
            }
          ]
        }
      ];
    } catch (error) {
      console.error('Error fetching mastery groups by subject:', error);
      return null;
    }
  }
  
  static async getAssessmentsBySubject(subjectId: string, studentId: string, tenantId: string) {
    try {
      // Validate input parameters
      if (!subjectId || !studentId || !tenantId) {
        throw new Error('Missing required parameters');
      }

      // First get all skills topics for this subject
      const { data: skillsTopics, error: skillsTopicsError } = await supabase
        .from('skills_topics')
        .select('id')
        .eq('mastery_groups.subject_id', subjectId)
        .eq('tenant_id', tenantId);

      if (skillsTopicsError) throw skillsTopicsError;

      if (!skillsTopics || skillsTopics.length === 0) {
        return [];
      }

      // Get all assessments for these skills topics
      const skillsTopicIds = skillsTopics.map(topic => topic.id);
      
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .eq('student_id', studentId)
        .eq('tenant_id', tenantId)
        .in('skills_topic_id', skillsTopicIds)
        .order('completed_at', { ascending: false });

      if (assessmentsError) throw assessmentsError;

      return assessments || [];
    } catch (error) {
      console.error('Error fetching assessments by subject:', error);
      return null;
    }
  }
  
  // Helper function to generate a UUID
  static generateUUID() {
    return uuidv4();
  }
}