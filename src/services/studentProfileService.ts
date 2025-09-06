// ================================================================
// STUDENT PROFILE SERVICE
// Comprehensive profile management for Pathfinity students
// ================================================================

import { supabase } from '../lib/supabase';
import { 
  ServiceErrorHandler, 
  ValidationUtils, 
  PerformanceMonitor,
  globalCache 
} from './serviceUtils';
import type { ServiceResponse } from '../types/services';
import { isDemoUser } from '../utils/demoUserDetection';
import { DEMO_USER_CACHE } from '../data/demoCache/demoUserCache';

// ================================================================
// TYPES
// ================================================================

export interface StudentProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  grade_level: GradeLevel;
  date_of_birth?: string;
  enrollment_date: string;
  learning_preferences: LearningPreferences;
  parent_email?: string;
  school_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentProfileSummary {
  id: string;
  user_id: string;
  display_name: string;
  grade_level: GradeLevel;
  age?: number;
  enrollment_date: string;
  learning_style?: string;
  attention_span?: string;
  is_active: boolean;
  created_at: string;
}

export interface LearningPreferences {
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  favorite_subjects?: string[];
  attention_span?: 'short' | 'medium' | 'long';
  prefers_hands_on?: boolean;
  prefers_group_work?: boolean;
  prefers_individual_work?: boolean;
  needs_encouragement?: boolean;
  difficulty_preference?: 'easy' | 'moderate' | 'challenging';
  session_length_preference?: number; // minutes
  best_time_of_day?: 'morning' | 'afternoon' | 'evening';
  [key: string]: any; // Allow for additional custom preferences
}

export type GradeLevel = 'Pre-K' | 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

// Additional interfaces for the specific requirements
export interface CreateStudentProfile {
  first_name: string;
  last_name: string;
  display_name: string;
  grade_level: GradeLevel;
  date_of_birth?: string;
  parent_email?: string;
  school_id?: string;
}

export interface StudentProfileResponse {
  profile: StudentProfile | null;
  displayName: string; // Fallback to email if profile missing
  isProfileComplete: boolean;
}

export interface CreateProfileRequest {
  user_id: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  grade_level: GradeLevel;
  date_of_birth?: string;
  learning_preferences?: LearningPreferences;
  parent_email?: string;
  school_id?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  grade_level?: GradeLevel;
  date_of_birth?: string;
  learning_preferences?: LearningPreferences;
  parent_email?: string;
  school_id?: string;
  is_active?: boolean;
}

// ================================================================
// SUPABASE CLIENT
// ================================================================

// Using unified Supabase client from ../lib/supabase

// ================================================================
// STUDENT PROFILE SERVICE
// ================================================================

export class StudentProfileService {
  private static readonly CACHE_TTL = 300000; // 5 minutes
  private static readonly CACHE_PREFIX = 'student_profile_';

  /**
   * Create a new student profile
   */
  static async createProfile(
    profileData: CreateProfileRequest
  ): Promise<ServiceResponse<StudentProfile>> {
    const startTime = Date.now();
    
    try {
      // Validation
      const validation = this.validateProfileData(profileData);
      if (!validation.isValid) {
        return ServiceErrorHandler.createErrorResponse(
          validation.errors.join(', '),
          'VALIDATION_ERROR',
          startTime
        );
      }

      // Prepare data with defaults
      const insertData = {
        ...profileData,
        display_name: profileData.display_name || profileData.first_name,
        learning_preferences: profileData.learning_preferences || {},
        enrollment_date: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('student_profiles')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        return ServiceErrorHandler.handleSupabaseError(error, startTime);
      }

      // Clear cache for this user
      this.clearUserCache(profileData.user_id);

      PerformanceMonitor.recordMetric('profile_creation', Date.now() - startTime);
      
      return ServiceErrorHandler.createSuccessResponse(data, startTime, {
        profile_id: data.id,
        grade_level: data.grade_level
      });

    } catch (error) {
      return ServiceErrorHandler.handleUnknownError(error, startTime);
    }
  }

  /**
   * Get student profile by user ID
   */
  static async getProfileByUserId(
    userId: string
  ): Promise<ServiceResponse<StudentProfile | null>> {
    const startTime = Date.now();
    const cacheKey = `${this.CACHE_PREFIX}user_${userId}`;

    try {
      // Check cache first
      const cached = globalCache.get<StudentProfile>(cacheKey);
      if (cached) {
        return ServiceErrorHandler.createSuccessResponse(cached, startTime, { 
          cache_hit: true 
        });
      }

      console.log('🔍 Querying student_profiles for userId:', userId);
      
      // Debug: Check current auth state
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 Current auth user:', user?.id, user?.email);
      
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      console.log('📥 Supabase response:', { data, error });
      if (error) {
        console.error('🔍 Detailed Supabase error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
      }

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          return ServiceErrorHandler.createSuccessResponse(null, startTime);
        }
        return ServiceErrorHandler.handleSupabaseError(error, startTime);
      }

      // Cache the result
      globalCache.set(cacheKey, data, this.CACHE_TTL);

      PerformanceMonitor.recordMetric('profile_retrieval', Date.now() - startTime);

      return ServiceErrorHandler.createSuccessResponse(data, startTime, {
        profile_id: data.id,
        grade_level: data.grade_level
      });

    } catch (error) {
      return ServiceErrorHandler.handleUnknownError(error, startTime);
    }
  }

  /**
   * Get student profile by profile ID
   */
  static async getProfileById(
    profileId: string
  ): Promise<ServiceResponse<StudentProfile | null>> {
    const startTime = Date.now();
    const cacheKey = `${this.CACHE_PREFIX}id_${profileId}`;

    try {
      // Check cache first
      const cached = globalCache.get<StudentProfile>(cacheKey);
      if (cached) {
        return ServiceErrorHandler.createSuccessResponse(cached, startTime, { 
          cache_hit: true 
        });
      }

      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', profileId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return ServiceErrorHandler.createSuccessResponse(null, startTime);
        }
        return ServiceErrorHandler.handleSupabaseError(error, startTime);
      }

      // Cache the result
      globalCache.set(cacheKey, data, this.CACHE_TTL);

      return ServiceErrorHandler.createSuccessResponse(data, startTime, {
        profile_id: data.id,
        grade_level: data.grade_level
      });

    } catch (error) {
      return ServiceErrorHandler.handleUnknownError(error, startTime);
    }
  }

  /**
   * Update student profile
   */
  static async updateProfile(
    userId: string,
    updates: UpdateProfileRequest
  ): Promise<ServiceResponse<StudentProfile>> {
    const startTime = Date.now();

    try {
      // Validation for updates
      if (updates.grade_level && !this.isValidGradeLevel(updates.grade_level)) {
        return ServiceErrorHandler.createErrorResponse(
          'Invalid grade level',
          'VALIDATION_ERROR',
          startTime
        );
      }

      const { data, error } = await supabase
        .from('student_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return ServiceErrorHandler.handleSupabaseError(error, startTime);
      }

      // Clear cache for this user
      this.clearUserCache(userId);

      PerformanceMonitor.recordMetric('profile_update', Date.now() - startTime);

      return ServiceErrorHandler.createSuccessResponse(data, startTime, {
        profile_id: data.id,
        updated_fields: Object.keys(updates)
      });

    } catch (error) {
      return ServiceErrorHandler.handleUnknownError(error, startTime);
    }
  }

  /**
   * Update learning preferences
   */
  static async updateLearningPreferences(
    userId: string,
    preferences: Partial<LearningPreferences>
  ): Promise<ServiceResponse<StudentProfile>> {
    const startTime = Date.now();

    try {
      // Get current profile to merge preferences
      const currentProfile = await this.getProfileByUserId(userId);
      if (!currentProfile.success || !currentProfile.data) {
        return ServiceErrorHandler.createErrorResponse(
          'Profile not found',
          'NOT_FOUND',
          startTime
        );
      }

      const mergedPreferences = {
        ...currentProfile.data.learning_preferences,
        ...preferences
      };

      return await this.updateProfile(userId, {
        learning_preferences: mergedPreferences
      });

    } catch (error) {
      return ServiceErrorHandler.handleUnknownError(error, startTime);
    }
  }

  /**
   * Get profiles by grade level
   */
  static async getProfilesByGrade(
    gradeLevel: GradeLevel,
    limit = 50
  ): Promise<ServiceResponse<StudentProfile[]>> {
    const startTime = Date.now();
    const cacheKey = `${this.CACHE_PREFIX}grade_${gradeLevel}_limit_${limit}`;

    try {
      // Check cache first
      const cached = globalCache.get<StudentProfile[]>(cacheKey);
      if (cached) {
        return ServiceErrorHandler.createSuccessResponse(cached, startTime, { 
          cache_hit: true 
        });
      }

      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('grade_level', gradeLevel)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return ServiceErrorHandler.handleSupabaseError(error, startTime);
      }

      // Cache the result
      globalCache.set(cacheKey, data, this.CACHE_TTL);

      return ServiceErrorHandler.createSuccessResponse(data, startTime, {
        count: data.length,
        grade_level: gradeLevel
      });

    } catch (error) {
      return ServiceErrorHandler.handleUnknownError(error, startTime);
    }
  }

  /**
   * Get profile summary view
   */
  static async getProfileSummary(
    userId: string
  ): Promise<ServiceResponse<StudentProfileSummary | null>> {
    const startTime = Date.now();
    const cacheKey = `${this.CACHE_PREFIX}summary_${userId}`;

    try {
      // Check cache first
      const cached = globalCache.get<StudentProfileSummary>(cacheKey);
      if (cached) {
        return ServiceErrorHandler.createSuccessResponse(cached, startTime, { 
          cache_hit: true 
        });
      }

      const { data, error } = await supabase
        .from('student_profile_summary')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return ServiceErrorHandler.createSuccessResponse(null, startTime);
        }
        return ServiceErrorHandler.handleSupabaseError(error, startTime);
      }

      // Cache the result
      globalCache.set(cacheKey, data, this.CACHE_TTL);

      return ServiceErrorHandler.createSuccessResponse(data, startTime, {
        profile_id: data.id,
        grade_level: data.grade_level
      });

    } catch (error) {
      return ServiceErrorHandler.handleUnknownError(error, startTime);
    }
  }

  /**
   * Search profiles by school
   */
  static async getProfilesBySchool(
    schoolId: string,
    limit = 100
  ): Promise<ServiceResponse<StudentProfile[]>> {
    const startTime = Date.now();

    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('grade_level', { ascending: true })
        .order('last_name', { ascending: true })
        .limit(limit);

      if (error) {
        return ServiceErrorHandler.handleSupabaseError(error, startTime);
      }

      return ServiceErrorHandler.createSuccessResponse(data, startTime, {
        count: data.length,
        school_id: schoolId
      });

    } catch (error) {
      return ServiceErrorHandler.handleUnknownError(error, startTime);
    }
  }

  /**
   * Deactivate profile (soft delete)
   */
  static async deactivateProfile(
    userId: string
  ): Promise<ServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      const { error } = await supabase
        .from('student_profiles')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        return ServiceErrorHandler.handleSupabaseError(error, startTime);
      }

      // Clear cache for this user
      this.clearUserCache(userId);

      return ServiceErrorHandler.createSuccessResponse(true, startTime);

    } catch (error) {
      return ServiceErrorHandler.handleUnknownError(error, startTime);
    }
  }

  /**
   * Get learning preferences for AI personalization
   */
  static async getLearningPreferences(
    userId: string
  ): Promise<ServiceResponse<LearningPreferences>> {
    const startTime = Date.now();

    try {
      const profileResponse = await this.getProfileByUserId(userId);
      
      if (!profileResponse.success || !profileResponse.data) {
        return ServiceErrorHandler.createErrorResponse(
          'Profile not found',
          'NOT_FOUND',
          startTime
        );
      }

      return ServiceErrorHandler.createSuccessResponse(
        profileResponse.data.learning_preferences,
        startTime,
        { profile_id: profileResponse.data.id }
      );

    } catch (error) {
      return ServiceErrorHandler.handleUnknownError(error, startTime);
    }
  }

  // ================================================================
  // SPECIFIC CRUD FUNCTIONS (as requested in prompt)
  // ================================================================

  /**
   * Get student profile (simplified interface)
   * Returns null if profile doesn't exist
   */
  static async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    try {
      const response = await this.getProfileByUserId(userId);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error getting student profile:', error);
      return null;
    }
  }

  /**
   * Update student profile (simplified interface)
   * Returns updated profile or throws error
   */
  static async updateStudentProfile(
    userId: string, 
    updates: Partial<StudentProfile>
  ): Promise<StudentProfile> {
    try {
      const response = await this.updateProfile(userId, updates);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update profile');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating student profile:', error);
      throw error;
    }
  }

  /**
   * Create student profile (simplified interface)
   * Returns created profile or throws error
   */
  static async createStudentProfile(
    userId: string, 
    profileData: CreateStudentProfile
  ): Promise<StudentProfile> {
    try {
      const createData: CreateProfileRequest = {
        user_id: userId,
        ...profileData
      };

      const response = await this.createProfile(createData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create profile');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating student profile:', error);
      throw error;
    }
  }

  /**
   * Get students by grade (simplified interface)
   * Returns array of profiles for the specified grade
   */
  static async getStudentsByGrade(gradeLevel: GradeLevel): Promise<StudentProfile[]> {
    try {
      const response = await this.getProfilesByGrade(gradeLevel);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting students by grade:', error);
      return [];
    }
  }

  /**
   * Update grade level for a student
   * Returns updated profile or throws error
   */
  static async updateGradeLevel(
    userId: string, 
    newGrade: GradeLevel
  ): Promise<StudentProfile> {
    try {
      // Validate the new grade level
      if (!this.isValidGradeLevel(newGrade)) {
        throw new Error(`Invalid grade level: ${newGrade}`);
      }

      const response = await this.updateProfile(userId, { 
        grade_level: newGrade 
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update grade level');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating grade level:', error);
      throw error;
    }
  }

  // ================================================================
  // INTEGRATION FEATURES
  // ================================================================

  /**
   * Get student profile with fallback display name
   * Returns profile with email-based display name if profile missing
   */
  static async getStudentProfileWithFallback(
    userId: string,
    userEmail?: string
  ): Promise<StudentProfileResponse> {
    try {
      // Check if this is a demo user first
      if (userEmail && isDemoUser({ email: userEmail, id: userId })) {
        console.log('🎭 Demo user detected, returning demo profile for:', userEmail);
        return this.getDemoUserProfile(userEmail);
      }

      const profile = await this.getStudentProfile(userId);
      
      if (profile) {
        return {
          profile,
          displayName: profile.display_name,
          isProfileComplete: this.isProfileComplete(profile)
        };
      }

      // Fallback for real users without a profile
      // They should create a profile through onboarding
      const fallbackDisplayName = userEmail 
        ? userEmail.split('@')[0] 
        : 'Student';

      console.log('⚠️ Real user without profile:', userId, userEmail);
      console.log('User should complete profile setup to select grade level');

      return {
        profile: null,
        displayName: fallbackDisplayName,
        isProfileComplete: false
      };

    } catch (error) {
      console.error('Error getting profile with fallback:', error);
      
      const fallbackDisplayName = userEmail 
        ? userEmail.split('@')[0] 
        : 'Student';

      return {
        profile: null,
        displayName: fallbackDisplayName,
        isProfileComplete: false
      };
    }
  }

  /**
   * Get demo user profile from cache
   * Returns a complete demo profile for demo users
   */
  private static getDemoUserProfile(userEmail: string): StudentProfileResponse {
    try {
      // Extract the user name from email (e.g., sam.brown@... -> Sam Brown)
      const emailName = userEmail.split('@')[0];
      const nameParts = emailName.split('.');
      const userName = nameParts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');

      // Check if we have demo data for this user
      const demoData = DEMO_USER_CACHE[userName as keyof typeof DEMO_USER_CACHE];
      
      if (demoData) {
        console.log('📋 Found demo data for:', userName, 'Grade:', demoData.user.grade);
        
        // Create a mock StudentProfile from demo data
        const demoProfile: StudentProfile = {
          id: `demo-${emailName}`,
          user_id: `demo-${emailName}`,
          first_name: nameParts[0] || 'Student',
          last_name: nameParts[1] || '',
          display_name: userName,
          grade_level: demoData.user.grade as GradeLevel,
          enrollment_date: new Date().toISOString().split('T')[0],
          learning_preferences: {
            learning_style: 'mixed',
            attention_span: 'medium',
            favorite_subjects: demoData.dashboardCards?.map(card => card.subject) || ['Math', 'ELA'],
            session_length_preference: 20,
            best_time_of_day: 'morning'
          },
          parent_email: userEmail,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        return {
          profile: demoProfile,
          displayName: userName,
          isProfileComplete: true
        };
      }

      // Fallback for demo users not in cache
      console.log('⚠️ Demo user not found in cache, using defaults:', userName);
      
      // For demo users without cache data, we should not assume grade from email
      // This should only happen for demo users, real users get their grade from profile
      const fallbackProfile: StudentProfile = {
        id: `demo-${emailName}`,
        user_id: `demo-${emailName}`,
        first_name: nameParts[0] || 'Student',
        last_name: nameParts[1] || '',
        display_name: userName,
        grade_level: 'K', // Default to K for unknown demo users only
        enrollment_date: new Date().toISOString().split('T')[0],
        learning_preferences: {
          learning_style: 'mixed',
          attention_span: 'medium',
          favorite_subjects: ['Math', 'ELA'],
          session_length_preference: 20,
          best_time_of_day: 'morning'
        },
        parent_email: userEmail,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        profile: fallbackProfile,
        displayName: userName,
        isProfileComplete: true
      };

    } catch (error) {
      console.error('Error creating demo profile:', error);
      
      // Fallback to basic demo profile
      const emailName = userEmail.split('@')[0];
      const nameParts = emailName.split('.');
      const userName = nameParts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');

      const basicProfile: StudentProfile = {
        id: `demo-${emailName}`,
        user_id: `demo-${emailName}`,
        first_name: nameParts[0] || 'Student',
        last_name: nameParts[1] || '',
        display_name: userName,
        grade_level: 'K',
        enrollment_date: new Date().toISOString().split('T')[0],
        learning_preferences: {},
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        profile: basicProfile,
        displayName: userName,
        isProfileComplete: true
      };
    }
  }

  /**
   * Create profile automatically for new users
   * Uses default values based on provided information
   */
  static async createProfileForNewUser(
    userId: string,
    userEmail: string,
    initialData?: Partial<CreateStudentProfile>
  ): Promise<StudentProfile> {
    try {
      // Check if this is a demo user first
      if (isDemoUser({ email: userEmail, id: userId })) {
        console.log('🎭 Demo user detected in createProfileForNewUser, returning demo profile');
        const demoResponse = this.getDemoUserProfile(userEmail);
        if (demoResponse.profile) {
          return demoResponse.profile;
        }
      }

      // Check if profile already exists
      const existingProfile = await this.getStudentProfile(userId);
      if (existingProfile) {
        // Profile exists, return it
        return existingProfile;
      }

      // Extract name from email as fallback
      const emailName = userEmail.split('@')[0];
      const nameParts = emailName.split('.');
      
      const defaultProfile: CreateStudentProfile = {
        first_name: nameParts[0] || 'Student',
        last_name: nameParts[1] || '',
        display_name: nameParts[0] || 'Student',
        grade_level: 'K', // Default grade
        parent_email: userEmail,
        ...initialData
      };

      return await this.createStudentProfile(userId, defaultProfile);

    } catch (error) {
      console.error('Error creating profile for new user:', error);
      throw error;
    }
  }

  /**
   * Get grade-appropriate content filtering criteria
   * Returns filtering rules based on student's grade level
   */
  static getGradeAppropriateFilters(gradeLevel: GradeLevel) {
    const filters = {
      maxDifficulty: 5,
      maxTimeMinutes: 30,
      allowedSubjects: ['Math', 'ELA'],
      recommendedTools: ['MasterToolInterface'],
      sessionLength: 20,
      needsEncouragement: true
    };

    switch (gradeLevel) {
      case 'Pre-K':
        return {
          ...filters,
          maxDifficulty: 2,
          maxTimeMinutes: 15,
          allowedSubjects: ['Math', 'ELA', 'Art'],
          recommendedTools: ['MasterToolInterface'],
          sessionLength: 15,
          needsEncouragement: true
        };

      case 'K':
        return {
          ...filters,
          maxDifficulty: 3,
          maxTimeMinutes: 20,
          allowedSubjects: ['Math', 'ELA', 'Science', 'Art'],
          recommendedTools: ['MasterToolInterface'],
          sessionLength: 20,
          needsEncouragement: true
        };

      case '1':
      case '2':
        return {
          ...filters,
          maxDifficulty: 4,
          maxTimeMinutes: 25,
          allowedSubjects: ['Math', 'ELA', 'Science', 'SocialStudies'],
          recommendedTools: ['MasterToolInterface'],
          sessionLength: 25,
          needsEncouragement: false
        };

      default:
        return {
          ...filters,
          maxDifficulty: 6,
          maxTimeMinutes: 45,
          allowedSubjects: ['Math', 'ELA', 'Science', 'SocialStudies'],
          recommendedTools: ['MasterToolInterface'],
          sessionLength: 30,
          needsEncouragement: false
        };
    }
  }

  /**
   * Validate profile completeness
   * Checks if all required fields are present
   */
  static isProfileComplete(profile: StudentProfile): boolean {
    const requiredFields = [
      'first_name', 
      'last_name', 
      'display_name', 
      'grade_level'
    ];
    
    return requiredFields.every(field => 
      profile[field as keyof StudentProfile] && 
      String(profile[field as keyof StudentProfile]).trim().length > 0
    );
  }

  /**
   * Get profile validation errors
   * Returns array of validation error messages
   */
  static validateProfile(profile: Partial<StudentProfile>): string[] {
    const errors: string[] = [];

    if (!profile.first_name?.trim()) {
      errors.push('First name is required');
    }

    if (!profile.last_name?.trim()) {
      errors.push('Last name is required');
    }

    if (!profile.display_name?.trim()) {
      errors.push('Display name is required');
    }

    if (!profile.grade_level) {
      errors.push('Grade level is required');
    } else if (!this.isValidGradeLevel(profile.grade_level)) {
      errors.push('Invalid grade level');
    }

    if (profile.parent_email && !ValidationUtils.isValidEmail(profile.parent_email)) {
      errors.push('Invalid parent email format');
    }

    return errors;
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  /**
   * Validate profile data
   */
  private static validateProfileData(data: CreateProfileRequest) {
    const errors: string[] = [];

    if (!ValidationUtils.isValidUUID(data.user_id)) {
      errors.push('Invalid user ID format');
    }

    if (!data.first_name?.trim()) {
      errors.push('First name is required');
    }

    if (!data.last_name?.trim()) {
      errors.push('Last name is required');
    }

    if (!this.isValidGradeLevel(data.grade_level)) {
      errors.push('Invalid grade level');
    }

    if (data.parent_email && !ValidationUtils.isValidEmail(data.parent_email)) {
      errors.push('Invalid parent email format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate grade level
   */
  private static isValidGradeLevel(grade: string): grade is GradeLevel {
    const validGrades: GradeLevel[] = [
      'Pre-K', 'K', '1', '2', '3', '4', '5', '6', 
      '7', '8', '9', '10', '11', '12'
    ];
    return validGrades.includes(grade as GradeLevel);
  }

  /**
   * Clear cache for a specific user
   */
  private static clearUserCache(userId: string) {
    globalCache.delete(`${this.CACHE_PREFIX}user_${userId}`);
    globalCache.delete(`${this.CACHE_PREFIX}summary_${userId}`);
    // Clear any grade-level caches (they may contain this user)
    const validGrades: GradeLevel[] = [
      'Pre-K', 'K', '1', '2', '3', '4', '5', '6', 
      '7', '8', '9', '10', '11', '12'
    ];
    validGrades.forEach(grade => {
      globalCache.delete(`${this.CACHE_PREFIX}grade_${grade}_limit_50`);
    });
  }
}

// ================================================================
// CONVENIENCE FUNCTIONS
// ================================================================

/**
 * Create a profile with default preferences for a grade level
 */
export async function createProfileWithDefaults(
  userId: string,
  firstName: string,
  lastName: string,
  gradeLevel: GradeLevel,
  additionalData?: Partial<CreateProfileRequest>
): Promise<ServiceResponse<StudentProfile>> {
  
  const defaultPreferences: LearningPreferences = {
    learning_style: 'mixed',
    attention_span: gradeLevel === 'Pre-K' ? 'short' : gradeLevel === 'K' ? 'medium' : 'long',
    session_length_preference: gradeLevel === 'Pre-K' ? 15 : gradeLevel === 'K' ? 20 : 30,
    best_time_of_day: 'morning',
    favorite_subjects: gradeLevel === 'Pre-K' ? ['Math', 'Art'] : ['Math', 'ELA']
  };

  return StudentProfileService.createProfile({
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
    display_name: firstName,
    grade_level: gradeLevel,
    learning_preferences: defaultPreferences,
    ...additionalData
  });
}

// Register performance monitoring
PerformanceMonitor.recordMetric('student_profile_service_init', 0);