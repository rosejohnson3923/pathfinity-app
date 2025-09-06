// ================================================================
// STUDENT PROFILE REACT HOOK
// Easy integration with React components and auth system
// ================================================================

import { useState, useEffect, useCallback } from 'react';
import { StudentProfileService } from '../services/studentProfileService';
import type { 
  StudentProfile, 
  CreateStudentProfile, 
  GradeLevel,
  LearningPreferences,
  StudentProfileResponse
} from '../services/studentProfileService';

// ================================================================
// TYPES
// ================================================================

interface UseStudentProfileState {
  profile: StudentProfile | null;
  loading: boolean;
  error: string | null;
  isProfileComplete: boolean;
  displayName: string;
}

interface UseStudentProfileActions {
  createProfile: (profileData: CreateStudentProfile) => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  updateGradeLevel: (newGrade: GradeLevel) => Promise<void>;
  updateLearningPreferences: (preferences: Partial<LearningPreferences>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  createProfileForNewUser: (userEmail: string, initialData?: Partial<CreateStudentProfile>) => Promise<void>;
}

export interface UseStudentProfileReturn extends UseStudentProfileState, UseStudentProfileActions {}

// ================================================================
// STUDENT PROFILE HOOK
// ================================================================

/**
 * React hook for student profile management
 * Handles loading, caching, and CRUD operations
 */
export function useStudentProfile(
  userId?: string,
  userEmail?: string,
  autoCreate = false
): UseStudentProfileReturn {
  
  const [state, setState] = useState<UseStudentProfileState>({
    profile: null,
    loading: false,
    error: null,
    isProfileComplete: false,
    displayName: userEmail?.split('@')[0] || 'Student'
  });

  // Load profile on mount or when userId changes
  useEffect(() => {
    if (userId) {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setState(prev => {
          if (prev.loading) {
            console.warn('⚠️ Profile loading timeout after 10 seconds, forcing error state');
            console.log('Current state:', prev);
            return {
              ...prev,
              loading: false,
              error: 'Profile loading timed out. This might be a database connection issue.'
            };
          }
          return prev;
        });
      }, 10000); // 10 second timeout

      loadProfile();

      return () => clearTimeout(timeoutId);
    }
  }, [userId]);

  // Auto-create profile for new users if enabled
  useEffect(() => {
    if (userId && userEmail && autoCreate && !state.profile && !state.loading) {
      handleAutoCreateProfile();
    }
  }, [userId, userEmail, autoCreate, state.profile, state.loading]);

  /**
   * Load student profile with fallback display name
   */
  const loadProfile = useCallback(async () => {
    if (!userId) return;

    console.log('🔍 Loading student profile for userId:', userId, 'email:', userEmail);
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await StudentProfileService.getStudentProfileWithFallback(
        userId, 
        userEmail
      );

      console.log('✅ Profile loaded successfully:', response);
      
      // Legacy diagnostic code removed - now using proper multi-tenant structure
      
      setState(prev => ({
        ...prev,
        profile: response.profile,
        displayName: response.displayName,
        isProfileComplete: response.isProfileComplete,
        loading: false
      }));

    } catch (error) {
      console.error('❌ Profile loading failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load profile',
        loading: false
      }));
    }
  }, [userId, userEmail]);

  /**
   * Auto-create profile for new users
   */
  const handleAutoCreateProfile = useCallback(async () => {
    if (!userId || !userEmail) return;

    console.log('🆕 Auto-creating profile for new user:', userId, userEmail);
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const profile = await StudentProfileService.createProfileForNewUser(
        userId,
        userEmail
      );

      console.log('✅ Profile auto-created successfully:', profile);
      setState(prev => ({
        ...prev,
        profile,
        displayName: profile.display_name,
        isProfileComplete: StudentProfileService.isProfileComplete(profile),
        loading: false
      }));

    } catch (error) {
      console.error('❌ Profile auto-creation failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create profile',
        loading: false
      }));
    }
  }, [userId, userEmail]);

  /**
   * Create a new student profile
   */
  const createProfile = useCallback(async (profileData: CreateStudentProfile) => {
    if (!userId) throw new Error('User ID is required');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const profile = await StudentProfileService.createStudentProfile(userId, profileData);
      
      setState(prev => ({
        ...prev,
        profile,
        displayName: profile.display_name,
        isProfileComplete: StudentProfileService.isProfileComplete(profile),
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, [userId]);

  /**
   * Update student profile
   */
  const updateProfile = useCallback(async (updates: Partial<StudentProfile>) => {
    if (!userId) throw new Error('User ID is required');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const profile = await StudentProfileService.updateStudentProfile(userId, updates);
      
      setState(prev => ({
        ...prev,
        profile,
        displayName: profile.display_name,
        isProfileComplete: StudentProfileService.isProfileComplete(profile),
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, [userId]);

  /**
   * Update grade level
   */
  const updateGradeLevel = useCallback(async (newGrade: GradeLevel) => {
    if (!userId) throw new Error('User ID is required');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const profile = await StudentProfileService.updateGradeLevel(userId, newGrade);
      
      setState(prev => ({
        ...prev,
        profile,
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update grade level';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, [userId]);

  /**
   * Update learning preferences
   */
  const updateLearningPreferences = useCallback(async (preferences: Partial<LearningPreferences>) => {
    if (!userId) throw new Error('User ID is required');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get current profile to merge preferences
      const currentProfile = state.profile;
      if (!currentProfile) {
        throw new Error('Profile not found');
      }

      const mergedPreferences = {
        ...currentProfile.learning_preferences,
        ...preferences
      };

      const profile = await StudentProfileService.updateStudentProfile(userId, {
        learning_preferences: mergedPreferences
      });
      
      setState(prev => ({
        ...prev,
        profile,
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update learning preferences';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, [userId, state.profile]);

  /**
   * Refresh profile from server
   */
  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  /**
   * Create profile for new user (manual trigger)
   */
  const createProfileForNewUser = useCallback(async (
    userEmail: string, 
    initialData?: Partial<CreateStudentProfile>
  ) => {
    if (!userId) throw new Error('User ID is required');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const profile = await StudentProfileService.createProfileForNewUser(
        userId,
        userEmail,
        initialData
      );

      setState(prev => ({
        ...prev,
        profile,
        displayName: profile.display_name,
        isProfileComplete: StudentProfileService.isProfileComplete(profile),
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile for new user';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, [userId]);

  return {
    // State
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    isProfileComplete: state.isProfileComplete,
    displayName: state.displayName,
    
    // Actions
    createProfile,
    updateProfile,
    updateGradeLevel,
    updateLearningPreferences,
    refreshProfile,
    createProfileForNewUser
  };
}

// ================================================================
// ADDITIONAL HOOKS
// ================================================================

/**
 * Hook to get students by grade level
 */
export function useStudentsByGrade(gradeLevel?: GradeLevel) {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    if (!gradeLevel) return;

    setLoading(true);
    setError(null);

    try {
      const studentList = await StudentProfileService.getStudentsByGrade(gradeLevel);
      setStudents(studentList);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [gradeLevel]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return {
    students,
    loading,
    error,
    refreshStudents: loadStudents
  };
}

/**
 * Hook to get grade-appropriate content filters
 */
export function useGradeFilters(gradeLevel?: GradeLevel) {
  const filters = gradeLevel 
    ? StudentProfileService.getGradeAppropriateFilters(gradeLevel)
    : null;

  return filters;
}

/**
 * Hook for profile validation
 */
export function useProfileValidation(profile: Partial<StudentProfile> | null) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (profile) {
      const errors = StudentProfileService.validateProfile(profile);
      setValidationErrors(errors);
      setIsValid(errors.length === 0);
    } else {
      setValidationErrors([]);
      setIsValid(false);
    }
  }, [profile]);

  return {
    validationErrors,
    isValid,
    validateField: (field: keyof StudentProfile, value: any) => {
      const testProfile = { ...profile, [field]: value };
      return StudentProfileService.validateProfile(testProfile);
    }
  };
}

// ================================================================
// CONVENIENCE EXPORTS
// ================================================================

export { StudentProfileService } from '../services/studentProfileService';
export type {
  StudentProfile,
  CreateStudentProfile,
  GradeLevel,
  LearningPreferences,
  StudentProfileResponse
} from '../services/studentProfileService';