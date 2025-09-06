/**
 * Daily Learning Sub-Modal
 * Shows today's learning objectives with progress tracking
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useStudentProfile } from '../../../hooks/useStudentProfile';
import { contentGenerationService } from '../../../services/contentGenerationService';
import { personalizationEngine } from '../../../services/personalizationEngine';
import './DailyLearningModal.css';

interface DailyLearningModalProps {
  theme: 'light' | 'dark';
  onClose: (result?: any) => void;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  topic: string;
  duration: string;
  objectives: string[];
  progress: number;
  skills: string[];
}

export const DailyLearningModal: React.FC<DailyLearningModalProps> = ({ theme, onClose }) => {
  const { user } = useAuth();
  const { profile } = useStudentProfile();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get completed subjects from localStorage (tracking actual container progress)
  const getCompletedSubjects = () => {
    const completedKey = `pathfinity-completed-subjects-${user?.id}-${new Date().toDateString()}`;
    const completed = localStorage.getItem(completedKey);
    return completed ? JSON.parse(completed) : { math: false, ela: false, science: false, social: false };
  };
  
  // Theme colors based on UI guidelines
  const colors = {
    light: {
      background: '#FFFFFF',
      text: '#1A202C',
      subtext: '#718096',
      border: '#E2E8F0',
      cardBg: '#F7FAFC',
      progressBg: '#E2E8F0',
      hover: '#F0F4F8'
    },
    dark: {
      background: '#2D3748',
      text: '#F7FAFC',
      subtext: '#CBD5E0',
      border: '#4A5568',
      cardBg: '#374151',
      progressBg: '#4A5568',
      hover: '#374151'
    }
  }[theme];

  // Generate AI-powered content based on user's grade level
  useEffect(() => {
    const generateDailyContent = async () => {
      if (!profile?.grade) {
        setError('Grade level not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Get actual completed subjects from today's progress
        const completedSubjects = getCompletedSubjects();

        // Generate content for each core subject based on grade level
        const subjectPromises = [
          { id: 'math', name: 'Mathematics', icon: '🔢', color: '#8B5CF6' },
          { id: 'ela', name: 'English Language Arts', icon: '📚', color: '#3B82F6' },
          { id: 'science', name: 'Science', icon: '🔬', color: '#10B981' },
          { id: 'social', name: 'Social Studies', icon: '🗺️', color: '#F59E0B' }
        ].map(async (subjectInfo) => {
          try {
            const content = await contentGenerationService.generateContent({
              contentType: 'lesson',
              grade: profile.grade_level,
              subject: subjectInfo.name,
              skill: 'daily_overview',
              difficulty: 'medium',
              personalizedFor: user?.id,
              useFinnAgents: true
            });

            return {
              id: subjectInfo.id,
              name: subjectInfo.name,
              icon: subjectInfo.icon,
              color: subjectInfo.color,
              topic: content.title || `Grade ${profile.grade_level} ${subjectInfo.name}`,
              duration: content.estimatedDuration || '25-30 minutes',
              objectives: content.content?.learningObjectives || [
                `Explore grade ${profile.grade_level} ${subjectInfo.name} concepts`,
                'Practice key skills',
                'Apply knowledge'
              ],
              progress: completedSubjects[subjectInfo.id] ? 100 : 0, // Use actual completion status
              skills: content.content?.skills || ['Critical Thinking', 'Problem Solving', 'Analysis']
            };
          } catch (error) {
            console.error(`Error generating content for ${subjectInfo.name}:`, error);
            // Grade-appropriate fallback content
            const gradeLevel = profile.grade_level?.toUpperCase();
            return {
              id: subjectInfo.id,
              name: subjectInfo.name,
              icon: subjectInfo.icon,
              color: subjectInfo.color,
              topic: `${gradeLevel} ${subjectInfo.name} Fundamentals`,
              duration: '25-30 minutes',
              objectives: [
                `Study grade ${gradeLevel} ${subjectInfo.name} concepts`,
                'Practice essential skills',
                'Build understanding'
              ],
              progress: completedSubjects[subjectInfo.id.toLowerCase()] ? 100 : 0,
              skills: ['Learning', 'Practice', 'Growth']
            };
          }
        });

        const generatedSubjects = await Promise.all(subjectPromises);
        setSubjects(generatedSubjects);
      } catch (error) {
        console.error('Error generating daily content:', error);
        setError('Failed to generate personalized content');
        
        // Fallback to basic grade-appropriate content
        const gradeLevel = profile?.grade?.toUpperCase() || 'K';
        const completedSubjects = getCompletedSubjects();
        setSubjects([
          {
            id: 'math',
            name: 'Mathematics',
            icon: '🔢',
            color: '#8B5CF6',
            topic: `Grade ${gradeLevel} Math Fundamentals`,
            duration: '25-30 minutes',
            objectives: [`Practice grade ${gradeLevel} math skills`, 'Solve problems', 'Build confidence'],
            progress: completedSubjects.math ? 100 : 0,
            skills: ['Problem Solving', 'Critical Thinking']
          },
          {
            id: 'science',
            name: 'Science',
            icon: '🔬',
            color: '#10B981',
            topic: `Grade ${gradeLevel} Science Exploration`,
            duration: '25-30 minutes',
            objectives: [`Discover grade ${gradeLevel} science concepts`, 'Conduct observations', 'Ask questions'],
            progress: completedSubjects.science ? 100 : 0,
            skills: ['Scientific Inquiry', 'Observation']
          },
          {
            id: 'ela',
            name: 'English Language Arts',
            icon: '📚',
            color: '#3B82F6',
            topic: `Grade ${gradeLevel} Reading & Writing`,
            duration: '25-30 minutes',
            objectives: [`Practice grade ${gradeLevel} reading skills`, 'Write clearly', 'Express ideas'],
            progress: completedSubjects.ela ? 100 : 0,
            skills: ['Reading', 'Writing', 'Communication']
          },
          {
            id: 'social',
            name: 'Social Studies',
            icon: '🗺️',
            color: '#F59E0B',
            topic: `Grade ${gradeLevel} Social Studies`,
            duration: '25-30 minutes',
            objectives: [`Learn about grade ${gradeLevel} social concepts`, 'Understand community', 'Explore history'],
            progress: completedSubjects.social ? 100 : 0,
            skills: ['Cultural Awareness', 'Historical Thinking']
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    generateDailyContent();
  }, [profile?.grade, user?.id]);

  // Calculate actual progress based on completed subjects (0%, 25%, 50%, 75%, or 100%)
  const totalProgress = useMemo(() => {
    const completedCount = subjects.filter(s => s.progress === 100).length;
    return Math.round((completedCount / 4) * 100);
  }, [subjects]);

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(selectedSubject === subjectId ? null : subjectId);
  };

  const handleStartLearning = () => {
    onClose({
      progress: totalProgress,
      selectedSubject,
      subjects: subjects.map(s => ({ id: s.id, progress: s.progress }))
    });
  };

  return (
    <div className={`daily-learning-modal theme-${theme}`} style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="modal-header">
        <button 
          className="back-btn" 
          onClick={() => onClose()}
          style={{ color: colors.text }}
        >
          ← Back
        </button>
        <h2 style={{ color: colors.text }}>Today's Learning Journey</h2>
        <div className="progress-summary" style={{ backgroundColor: colors.cardBg }}>
          <span style={{ color: colors.subtext }}>
            {isLoading ? 'Loading subjects...' : `${subjects.filter(s => s.progress === 100).length} of 4 Subjects Complete`}
          </span>
          <div className="progress-bar" style={{ backgroundColor: colors.progressBg }}>
            <div 
              className="progress-fill"
              style={{ 
                width: `${totalProgress}%`,
                background: totalProgress === 100 ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' :
                           totalProgress > 0 ? 'linear-gradient(90deg, #8B5CF6 0%, #10B981 100%)' :
                           'linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%)'
              }}
            />
          </div>
          <span className="progress-text" style={{ color: colors.text }}>
            {totalProgress}% Complete
          </span>
        </div>
      </div>

      {/* Subject Cards */}
      <div className="subjects-container">
        {subjects.map((subject, index) => (
          <div
            key={subject.id}
            className={`subject-card ${selectedSubject === subject.id ? 'selected' : ''}`}
            style={{ 
              backgroundColor: colors.cardBg,
              borderColor: selectedSubject === subject.id ? subject.color : colors.border,
              animationDelay: `${index * 0.1}s`
            }}
            onClick={() => handleSubjectSelect(subject.id)}
          >
            <div className="subject-header">
              <div className="subject-icon" style={{ backgroundColor: subject.color }}>
                {subject.icon}
              </div>
              <div className="subject-info">
                <h3 style={{ color: colors.text }}>{subject.name}</h3>
                <p className="topic" style={{ color: colors.subtext }}>
                  {subject.progress === 100 ? '✓ Complete' : subject.progress > 0 ? `In Progress (${subject.progress}%)` : 'Not Started'}
                </p>
              </div>
              <div className="duration-badge" style={{ 
                backgroundColor: subject.progress === 100 ? '#10b981' : colors.background,
                color: subject.progress === 100 ? 'white' : colors.subtext 
              }}>
                {subject.progress === 100 ? '✓' : '15 min'}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="subject-progress">
              <div className="progress-header">
                <span style={{ color: colors.subtext }}>Progress</span>
                <span style={{ color: subject.color }}>{subject.progress}%</span>
              </div>
              <div className="progress-bar" style={{ backgroundColor: colors.progressBg }}>
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${subject.progress}%`,
                    backgroundColor: subject.color 
                  }}
                />
              </div>
            </div>

            {/* Expanded Content */}
            {selectedSubject === subject.id && (
              <div className="subject-details">
                <div className="objectives">
                  <h4 style={{ color: colors.text }}>Today's Objectives</h4>
                  <ul>
                    {subject.objectives.map((objective, i) => (
                      <li key={i} style={{ color: colors.subtext }}>
                        <span className="check-icon">○</span> {objective}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="skills">
                  <h4 style={{ color: colors.text }}>Skills You'll Build</h4>
                  <div className="skills-tags">
                    {subject.skills.map((skill, i) => (
                      <span 
                        key={i} 
                        className="skill-tag"
                        style={{ 
                          backgroundColor: subject.color + '20',
                          color: subject.color,
                          borderColor: subject.color
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Daily Goals */}
      <div className="daily-goals" style={{ backgroundColor: colors.cardBg }}>
        <h3 style={{ color: colors.text }}>🎯 Daily Goals</h3>
        <div className="goals-grid">
          <div className="goal-item" style={{ borderColor: colors.border }}>
            <span className="goal-icon">📖</span>
            <span style={{ color: colors.subtext }}>Complete 4 subjects</span>
          </div>
          <div className="goal-item" style={{ borderColor: colors.border }}>
            <span className="goal-icon">⭐</span>
            <span style={{ color: colors.subtext }}>Earn 100 XP</span>
          </div>
          <div className="goal-item" style={{ borderColor: colors.border }}>
            <span className="goal-icon">🏆</span>
            <span style={{ color: colors.subtext }}>Master 1 skill</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="modal-footer">
        <button 
          className="start-btn"
          onClick={handleStartLearning}
          style={{ 
            background: totalProgress === 100 ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' :
                      'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
          }}
        >
          {totalProgress === 100 ? '🎉 All Subjects Complete!' : 
           totalProgress > 0 ? `Continue Learning (${4 - subjects.filter(s => s.progress === 100).length} subjects left) 🚀` : 
           'Start Today\'s Journey 🚀'}
        </button>
        <p style={{ color: colors.subtext, marginTop: '1rem', fontSize: '0.875rem' }}>
          {totalProgress === 100 ? 'Great job! You\'ve completed all subjects for today.' :
           'Complete all 4 subjects to achieve your daily learning goal'}
        </p>
      </div>
    </div>
  );
};