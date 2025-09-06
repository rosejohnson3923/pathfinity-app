/**
 * Review Container
 * Comprehensive review of all skills in a category (A.1-A.5) before assessment
 * Reviews across all subjects to ensure mastery
 */

import React, { useState, useEffect } from 'react';
import { skillProgressionService, SkillCategory } from '../../services/skillProgressionService';
import { aiLearningJourneyService } from '../../services/AILearningJourneyService';
import { useAICharacter } from '../ai-characters/AICharacterProvider';
import { useTheme } from '../../hooks/useTheme';
import { FloatingLearningDock } from '../learning-support/FloatingLearningDock';
import './ReviewContainer.css';

// ================================================================
// INTERFACES
// ================================================================

interface ReviewContainerProps {
  studentId: string;
  grade: string;
  cluster: string; // "A.", "B.", etc.
  career: string;
  companion: string;
  completedSkills: string[];
  weakAreas?: { skill: string; subject: string; score: number }[];
  onComplete: (results: ReviewResults) => void;
  onBack?: () => void;
}

interface ReviewResults {
  cluster: string;
  reviewedSkills: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  readyForAssessment: boolean;
  reviewScore: number;
}

interface ReviewQuestion {
  skill: string;
  subject: string;
  question: string;
  answer: string | number;
  options?: string[];
  type: 'multiple_choice' | 'true_false' | 'numeric';
}

// ================================================================
// REVIEW CONTAINER COMPONENT
// ================================================================

export const ReviewContainer: React.FC<ReviewContainerProps> = ({
  studentId,
  grade,
  cluster,
  career,
  companion,
  completedSkills,
  weakAreas = [],
  onComplete,
  onBack
}) => {
  const theme = useTheme();
  const { currentCharacter, generateCharacterResponse, speakMessage } = useAICharacter();
  
  const [phase, setPhase] = useState<'loading' | 'overview' | 'practice' | 'results'>('loading');
  const [categorySkills, setCategorySkills] = useState<{ [subject: string]: SkillCategory }>({});
  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [index: number]: any }>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [reviewScore, setReviewScore] = useState(0);
  const [companionMessage, setCompanionMessage] = useState<{ text: string; emotion: string } | null>(null);
  
  // Load category skills on mount
  useEffect(() => {
    loadCategorySkills();
  }, [grade, cluster]);
  
  const loadCategorySkills = async () => {
    const skills = skillProgressionService.getCategorySkillsAcrossSubjects(grade, cluster);
    setCategorySkills(skills);
    
    // Get category header for context
    const mathCategory = skills['Math'];
    const categoryName = mathCategory?.categoryHeader?.skillName || `${cluster} Skills`;
    
    
    // Generate review questions focusing on weak areas
    await generateReviewQuestions(skills);
    setPhase('overview');
  };
  
  const generateReviewQuestions = async (skills: { [subject: string]: SkillCategory }) => {
    const questions: ReviewQuestion[] = [];
    
    // Prioritize weak areas
    if (weakAreas.length > 0) {
      
      for (const weak of weakAreas.slice(0, 5)) { // Top 5 weak areas
        questions.push({
          skill: weak.skill,
          subject: weak.subject,
          question: `Review: ${weak.subject} - ${weak.skill}`,
          answer: '', // Will be generated
          type: 'multiple_choice'
        });
      }
    }
    
    // Add general review questions (2 per subject)
    Object.entries(skills).forEach(([subject, category]) => {
      // Pick 2 random skills from this subject
      const shuffled = [...category.skills].sort(() => Math.random() - 0.5);
      shuffled.slice(0, 2).forEach(skill => {
        questions.push({
          skill: skill.skillNumber,
          subject: subject,
          question: `${subject}: ${skill.skillName}`,
          answer: '', // Will be generated
          type: Math.random() > 0.5 ? 'multiple_choice' : 'true_false'
        });
      });
    });
    
    setReviewQuestions(questions);
  };
  
  const handleAnswerSubmit = (answer: any) => {
    const newAnswers = { ...userAnswers, [currentQuestionIndex]: answer };
    setUserAnswers(newAnswers);
    
    // Check if answer is correct
    const question = reviewQuestions[currentQuestionIndex];
    const isCorrect = checkAnswer(answer, question);
    
    // Show companion feedback
    const feedback = isCorrect 
      ? `Great job! You remember ${question.skill} well!`
      : `Let's review ${question.skill} a bit more.`;
    
    setCompanionMessage({ 
      text: feedback, 
      emotion: isCorrect ? 'happy' : 'encouraging' 
    });
    
    setShowFeedback(true);
    
    // Move to next question after delay
    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestionIndex < reviewQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        calculateResults();
      }
    }, 2000);
  };
  
  const checkAnswer = (answer: any, question: ReviewQuestion): boolean => {
    // Simplified answer checking - in production, would check against actual answer
    return Math.random() > 0.3; // 70% success rate for demo
  };
  
  const calculateResults = () => {
    const correctCount = Object.entries(userAnswers).filter(([index, answer]) => {
      const question = reviewQuestions[parseInt(index)];
      return checkAnswer(answer, question);
    }).length;
    
    const score = Math.round((correctCount / reviewQuestions.length) * 100);
    setReviewScore(score);
    
    // Determine strengths and improvements
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    Object.values(categorySkills).forEach(category => {
      category.skills.forEach(skill => {
        // Check performance on this skill
        const performance = Math.random(); // Would check actual performance
        if (performance > 0.7) {
          strengths.push(skill.skillName);
        } else if (performance < 0.5) {
          improvements.push(skill.skillName);
        }
      });
    });
    
    setPhase('results');
    
    // Prepare results
    const results: ReviewResults = {
      cluster,
      reviewedSkills: completedSkills,
      strengthAreas: strengths.slice(0, 3), // Top 3 strengths
      improvementAreas: improvements.slice(0, 3), // Top 3 improvements
      readyForAssessment: score >= 75,
      reviewScore: score
    };
    
    // Auto-complete after showing results
    setTimeout(() => {
      onComplete(results);
    }, 5000);
  };
  
  const renderWithDock = (content: React.ReactNode) => {
    return (
      <>
        {content}
        <FloatingLearningDock
          companionName={companion}
          companionId={companion.toLowerCase()}
          userId={studentId}
          currentQuestion={phase === 'practice' ? reviewQuestions[currentQuestionIndex]?.question : undefined}
          currentSkill={`${cluster} Review`}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={reviewQuestions.length}
          companionFeedback={companionMessage}
          theme={theme}
        />
      </>
    );
  };
  
  // ================================================================
  // RENDER PHASES
  // ================================================================
  
  if (phase === 'loading') {
    return renderWithDock(
      <div className="review-container loading">
        <h2>Preparing your review...</h2>
        <div className="loading-spinner">📚</div>
      </div>
    );
  }
  
  if (phase === 'overview') {
    const mathCategory = categorySkills['Math'];
    const categoryName = mathCategory?.categoryHeader?.skillName || `${cluster} Skills`;
    
    return renderWithDock(
      <div className="review-container overview">
        <div className="review-header">
          <h1>🔄 Review Time!</h1>
          <h2>{categoryName}</h2>
        </div>
        
        <div className="review-info">
          <div className="info-card">
            <span className="info-icon">📚</span>
            <h3>What We'll Review</h3>
            <p>All the skills you've learned in {cluster} category</p>
          </div>
          
          <div className="info-card">
            <span className="info-icon">🎯</span>
            <h3>Focus Areas</h3>
            <p>{weakAreas.length > 0 ? `${weakAreas.length} skills need practice` : 'General review of all skills'}</p>
          </div>
          
          <div className="info-card">
            <span className="info-icon">⏱️</span>
            <h3>Time Estimate</h3>
            <p>About {reviewQuestions.length * 2} minutes</p>
          </div>
        </div>
        
        <div className="skills-to-review">
          <h3>Skills You'll Review:</h3>
          <div className="skills-grid">
            {Object.entries(categorySkills).map(([subject, category]) => (
              <div key={subject} className="subject-skills">
                <h4>{getSubjectEmoji(subject)} {subject}</h4>
                <ul>
                  {category.skills.slice(0, 3).map(skill => (
                    <li key={skill.skillNumber}>
                      {skill.skillNumber}: {skill.skillName}
                    </li>
                  ))}
                  {category.skills.length > 3 && (
                    <li>...and {category.skills.length - 3} more</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="start-review-btn"
          onClick={() => setPhase('practice')}
        >
          Start Review 🚀
        </button>
      </div>
    );
  }
  
  if (phase === 'practice') {
    const question = reviewQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / reviewQuestions.length) * 100;
    
    return renderWithDock(
      <div className="review-container practice">
        <div className="review-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">
            Question {currentQuestionIndex + 1} of {reviewQuestions.length}
          </span>
        </div>
        
        <div className="question-card">
          <div className="question-header">
            <span className="subject-badge">
              {getSubjectEmoji(question.subject)} {question.subject}
            </span>
            <span className="skill-badge">{question.skill}</span>
          </div>
          
          <h2 className="question-text">
            Let's review: {question.question}
          </h2>
          
          {/* Simplified question UI - would be more complex in production */}
          <div className="answer-options">
            {question.type === 'multiple_choice' && (
              <>
                {['Option A', 'Option B', 'Option C', 'Option D'].map((option, index) => (
                  <button
                    key={index}
                    className="option-btn"
                    onClick={() => handleAnswerSubmit(option)}
                    disabled={showFeedback}
                  >
                    {option}
                  </button>
                ))}
              </>
            )}
            
            {question.type === 'true_false' && (
              <>
                <button
                  className="option-btn true"
                  onClick={() => handleAnswerSubmit(true)}
                  disabled={showFeedback}
                >
                  True
                </button>
                <button
                  className="option-btn false"
                  onClick={() => handleAnswerSubmit(false)}
                  disabled={showFeedback}
                >
                  False
                </button>
              </>
            )}
          </div>
          
          {showFeedback && companionMessage && (
            <div className="feedback-message">
              <span className="companion-emoji">
                {currentCharacter?.emoji || '🤖'}
              </span>
              <p>{companionMessage.text}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (phase === 'results') {
    const isReady = reviewScore >= 75;
    
    return renderWithDock(
      <div className="review-container results">
        <div className="results-header">
          <h1>📊 Review Complete!</h1>
          <div className="score-display">
            <span className="score-number">{reviewScore}%</span>
            <span className="score-label">Review Score</span>
          </div>
        </div>
        
        <div className="results-message">
          {isReady ? (
            <>
              <h2>🎉 Great job! You're ready for the assessment!</h2>
              <p>You've shown strong understanding of {cluster} skills.</p>
            </>
          ) : (
            <>
              <h2>💪 Good effort! Let's practice a bit more.</h2>
              <p>A little more review will help you ace the assessment.</p>
            </>
          )}
        </div>
        
        <div className="results-details">
          <div className="strength-areas">
            <h3>✨ Your Strengths</h3>
            <ul>
              {['Math concepts', 'Reading comprehension', 'Pattern recognition'].map((strength, i) => (
                <li key={i}>{strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="improvement-areas">
            <h3>📚 Areas to Review</h3>
            <ul>
              {['Word problems', 'Letter sounds', 'Shape classification'].map((area, i) => (
                <li key={i}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="next-steps">
          <p>Moving to {isReady ? 'Assessment' : 'Additional Practice'} in 5 seconds...</p>
        </div>
      </div>
    );
  }
  
  return null;
};

// ================================================================
// HELPER FUNCTIONS
// ================================================================

function getSubjectEmoji(subject: string): string {
  const emojis: Record<string, string> = {
    'Math': '🔢',
    'ELA': '📚',
    'Science': '🔬',
    'Social Studies': '🌍'
  };
  return emojis[subject] || '📖';
}

export default ReviewContainer;