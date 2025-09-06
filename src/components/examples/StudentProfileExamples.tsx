// ================================================================
// STUDENT PROFILE USAGE EXAMPLES
// Demonstration of service functions and React hooks
// ================================================================

import React, { useState } from 'react';
import { useStudentProfile, useStudentsByGrade, useGradeFilters } from '../../hooks/useStudentProfile';
import type { GradeLevel, CreateStudentProfile } from '../../services/studentProfileService';

// ================================================================
// EXAMPLE 1: Basic Profile Display Component
// ================================================================

interface ProfileDisplayProps {
  userId: string;
  userEmail?: string;
}

export function ProfileDisplay({ userId, userEmail }: ProfileDisplayProps) {
  const { 
    profile, 
    loading, 
    error, 
    displayName, 
    isProfileComplete,
    updateProfile,
    updateGradeLevel 
  } = useStudentProfile(userId, userEmail, true); // Auto-create enabled

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="profile-display">
      <h2>Welcome, {displayName}!</h2>
      
      {!isProfileComplete && (
        <div className="alert alert-warning">
          Profile is incomplete. Please update your information.
        </div>
      )}

      {profile ? (
        <div className="profile-info">
          <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
          <p><strong>Grade:</strong> {profile.grade_level}</p>
          <p><strong>Learning Style:</strong> {profile.learning_preferences?.learning_style || 'Not set'}</p>
          <p><strong>Enrollment Date:</strong> {new Date(profile.enrollment_date).toLocaleDateString()}</p>
          
          <button 
            onClick={() => updateGradeLevel('K')}
            className="btn btn-primary"
          >
            Update to Kindergarten
          </button>
        </div>
      ) : (
        <div className="no-profile">
          <p>No profile found. Creating default profile...</p>
        </div>
      )}
    </div>
  );
}

// ================================================================
// EXAMPLE 2: Profile Creation Form
// ================================================================

interface ProfileCreationFormProps {
  userId: string;
  onProfileCreated?: (profile: any) => void;
}

export function ProfileCreationForm({ userId, onProfileCreated }: ProfileCreationFormProps) {
  const { createProfile, loading, error } = useStudentProfile(userId);
  const [formData, setFormData] = useState<CreateStudentProfile>({
    first_name: '',
    last_name: '',
    display_name: '',
    grade_level: 'K',
    parent_email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProfile(formData);
      onProfileCreated?.(formData);
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };

  const handleChange = (field: keyof CreateStudentProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h3>Create Student Profile</h3>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="first_name">First Name:</label>
        <input
          type="text"
          id="first_name"
          value={formData.first_name}
          onChange={(e) => handleChange('first_name', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="last_name">Last Name:</label>
        <input
          type="text"
          id="last_name"
          value={formData.last_name}
          onChange={(e) => handleChange('last_name', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="display_name">Display Name:</label>
        <input
          type="text"
          id="display_name"
          value={formData.display_name}
          onChange={(e) => handleChange('display_name', e.target.value)}
          placeholder="Preferred name for UI"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="grade_level">Grade Level:</label>
        <select
          id="grade_level"
          value={formData.grade_level}
          onChange={(e) => handleChange('grade_level', e.target.value as GradeLevel)}
        >
          <option value="Pre-K">Pre-K</option>
          <option value="K">Kindergarten</option>
          <option value="1">Grade 1</option>
          <option value="2">Grade 2</option>
          <option value="3">Grade 3</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="parent_email">Parent Email:</label>
        <input
          type="email"
          id="parent_email"
          value={formData.parent_email || ''}
          onChange={(e) => handleChange('parent_email', e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Creating...' : 'Create Profile'}
      </button>
    </form>
  );
}

// ================================================================
// EXAMPLE 3: Grade-Based Student List
// ================================================================

interface StudentListProps {
  gradeLevel: GradeLevel;
}

export function StudentList({ gradeLevel }: StudentListProps) {
  const { students, loading, error, refreshStudents } = useStudentsByGrade(gradeLevel);
  const gradeFilters = useGradeFilters(gradeLevel);

  if (loading) return <div>Loading students...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="student-list">
      <div className="list-header">
        <h3>{gradeLevel} Students ({students.length})</h3>
        <button onClick={refreshStudents} className="btn btn-secondary">
          Refresh
        </button>
      </div>

      {gradeFilters && (
        <div className="grade-filters">
          <h4>Grade-Appropriate Filters:</h4>
          <ul>
            <li>Max Difficulty: {gradeFilters.maxDifficulty}</li>
            <li>Max Time: {gradeFilters.maxTimeMinutes} minutes</li>
            <li>Session Length: {gradeFilters.sessionLength} minutes</li>
            <li>Subjects: {gradeFilters.allowedSubjects.join(', ')}</li>
            <li>Tools: {gradeFilters.recommendedTools.join(', ')}</li>
          </ul>
        </div>
      )}

      <div className="students-grid">
        {students.map(student => (
          <div key={student.id} className="student-card">
            <h4>{student.display_name}</h4>
            <p>{student.first_name} {student.last_name}</p>
            <p>Grade: {student.grade_level}</p>
            <p>Learning Style: {student.learning_preferences?.learning_style || 'Not set'}</p>
            <p>Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="no-students">
          <p>No students found for {gradeLevel}</p>
        </div>
      )}
    </div>
  );
}

// ================================================================
// EXAMPLE 4: Learning Preferences Editor
// ================================================================

interface LearningPreferencesEditorProps {
  userId: string;
}

export function LearningPreferencesEditor({ userId }: LearningPreferencesEditorProps) {
  const { 
    profile, 
    loading, 
    error, 
    updateLearningPreferences 
  } = useStudentProfile(userId);

  const [preferences, setPreferences] = useState({
    learning_style: profile?.learning_preferences?.learning_style || 'mixed',
    attention_span: profile?.learning_preferences?.attention_span || 'medium',
    session_length_preference: profile?.learning_preferences?.session_length_preference || 20,
    prefers_hands_on: profile?.learning_preferences?.prefers_hands_on || false,
    needs_encouragement: profile?.learning_preferences?.needs_encouragement || false
  });

  const handleSave = async () => {
    try {
      await updateLearningPreferences(preferences);
      alert('Preferences updated successfully!');
    } catch (error) {
      alert('Failed to update preferences');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="preferences-editor">
      <h3>Learning Preferences</h3>

      <div className="form-group">
        <label>Learning Style:</label>
        <select
          value={preferences.learning_style}
          onChange={(e) => setPreferences(prev => ({ 
            ...prev, 
            learning_style: e.target.value as any 
          }))}
        >
          <option value="visual">Visual</option>
          <option value="auditory">Auditory</option>
          <option value="kinesthetic">Kinesthetic</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>

      <div className="form-group">
        <label>Attention Span:</label>
        <select
          value={preferences.attention_span}
          onChange={(e) => setPreferences(prev => ({ 
            ...prev, 
            attention_span: e.target.value as any 
          }))}
        >
          <option value="short">Short (5-10 minutes)</option>
          <option value="medium">Medium (10-20 minutes)</option>
          <option value="long">Long (20+ minutes)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Preferred Session Length (minutes):</label>
        <input
          type="number"
          min="5"
          max="60"
          value={preferences.session_length_preference}
          onChange={(e) => setPreferences(prev => ({ 
            ...prev, 
            session_length_preference: parseInt(e.target.value) 
          }))}
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={preferences.prefers_hands_on}
            onChange={(e) => setPreferences(prev => ({ 
              ...prev, 
              prefers_hands_on: e.target.checked 
            }))}
          />
          Prefers hands-on activities
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={preferences.needs_encouragement}
            onChange={(e) => setPreferences(prev => ({ 
              ...prev, 
              needs_encouragement: e.target.checked 
            }))}
          />
          Needs extra encouragement
        </label>
      </div>

      <button onClick={handleSave} className="btn btn-primary">
        Save Preferences
      </button>
    </div>
  );
}

// ================================================================
// EXAMPLE 5: Auth Integration Component
// ================================================================

interface AuthIntegratedProfileProps {
  // This would integrate with your actual auth context
  user?: {
    id: string;
    email: string;
  };
}

export function AuthIntegratedProfile({ user }: AuthIntegratedProfileProps) {
  const { 
    profile, 
    loading, 
    displayName, 
    isProfileComplete,
    createProfileForNewUser 
  } = useStudentProfile(user?.id, user?.email, true);

  const handleCompleteProfile = async () => {
    if (!user) return;
    
    try {
      await createProfileForNewUser(user.email, {
        grade_level: 'K',
        first_name: user.email.split('@')[0],
        last_name: '',
        display_name: user.email.split('@')[0]
      });
    } catch (error) {
      console.error('Failed to complete profile:', error);
    }
  };

  if (!user) {
    return <div>Please log in to view profile</div>;
  }

  if (loading) {
    return <div>Loading your profile...</div>;
  }

  return (
    <div className="auth-integrated-profile">
      <h2>Hello, {displayName}!</h2>
      
      {profile ? (
        <div className="profile-complete">
          <p>Grade: {profile.grade_level}</p>
          <p>Learning Style: {profile.learning_preferences?.learning_style || 'Not set'}</p>
          
          {!isProfileComplete && (
            <div className="incomplete-notice">
              <p>Your profile needs some updates!</p>
              <button onClick={handleCompleteProfile} className="btn btn-primary">
                Complete Profile
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="no-profile">
          <p>Setting up your profile...</p>
        </div>
      )}
    </div>
  );
}

// ================================================================
// EXAMPLE 6: Service Function Usage (Non-React)
// ================================================================

export class ProfileServiceExamples {
  
  /**
   * Example: Create profile for new user
   */
  static async createNewUserProfile(userId: string, email: string) {
    try {
      // Method 1: Using service function directly
      const profile = await StudentProfileService.createProfileForNewUser(
        userId,
        email,
        {
          grade_level: 'Pre-K',
          first_name: 'Emma',
          last_name: 'Student'
        }
      );
      
      console.log('Created profile:', profile);
      return profile;
      
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  }

  /**
   * Example: Get grade-appropriate content
   */
  static async getGradeContent(userId: string) {
    try {
      // Get the student's profile
      const profile = await StudentProfileService.getStudentProfile(userId);
      
      if (!profile) {
        throw new Error('Profile not found');
      }

      // Get grade-appropriate filters
      const filters = StudentProfileService.getGradeAppropriateFilters(profile.grade_level);
      
      console.log('Grade filters:', filters);
      
      // Use filters to customize content
      return {
        maxDifficulty: filters.maxDifficulty,
        allowedSubjects: filters.allowedSubjects,
        recommendedTools: filters.recommendedTools,
        sessionLength: filters.sessionLength
      };
      
    } catch (error) {
      console.error('Failed to get grade content:', error);
      throw error;
    }
  }

  /**
   * Example: Validate and update profile
   */
  static async updateProfileSafely(userId: string, updates: Partial<StudentProfile>) {
    try {
      // Validate the updates first
      const validationErrors = StudentProfileService.validateProfile(updates);
      
      if (validationErrors.length > 0) {
        console.error('Validation errors:', validationErrors);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Update the profile
      const updatedProfile = await StudentProfileService.updateStudentProfile(userId, updates);
      
      console.log('Profile updated successfully:', updatedProfile);
      return updatedProfile;
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Example: Batch operations
   */
  static async getClassroomData(gradeLevel: GradeLevel) {
    try {
      // Get all students in the grade
      const students = await StudentProfileService.getStudentsByGrade(gradeLevel);
      
      // Get grade-appropriate filters
      const filters = StudentProfileService.getGradeAppropriateFilters(gradeLevel);
      
      // Analyze learning preferences
      const learningStyles = students.reduce((acc, student) => {
        const style = student.learning_preferences?.learning_style || 'unknown';
        acc[style] = (acc[style] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        totalStudents: students.length,
        gradeLevel,
        filters,
        learningStyleBreakdown: learningStyles,
        students
      };
      
    } catch (error) {
      console.error('Failed to get classroom data:', error);
      throw error;
    }
  }
}