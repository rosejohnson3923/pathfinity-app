/**
 * Assessment Container
 * Final assessment after completing all skills in a category (A.1-A.5)
 * Determines if student can advance to next category (B.1)
 */

import React, { useState, useEffect } from 'react';
import { skillProgressionService } from '../../services/skillProgressionService';
import { aiLearningJourneyService } from '../../services/AILearningJourneyService';
import { useAICharacter } from '../ai-characters/AICharacterProvider';
import { useTheme } from '../../hooks/useTheme';
import { FloatingLearningDock } from '../learning-support/FloatingLearningDock';
import './AssessmentContainer.css';

// ================================================================
// INTERFACES
// ================================================================

interface AssessmentContainerProps {
  studentId: string;
  grade: string;
  cluster: string; // "A.", "B.", etc.
  career: string;
  companion: string;
  completedSkills: string[];
  onComplete: (results: AssessmentResults) => void;
  onBack?: () => void;
}

interface AssessmentResults {
  cluster: string;
  passed: boolean;
  score: number;
  subjectScores: {
    [subject: string]: number;
  };
  nextAction: 'advance' | 'review' | 'practice';
  nextCluster?: string;
  certificateEarned?: string;
}

interface AssessmentQuestion {
  id: string;
  skill: string;
  subject: string;
  question: string;
  correctAnswer: string | number | boolean;
  options?: (string | number)[];
  type: 'multiple_choice' | 'true_false' | 'numeric' | 'fill_blank';
  difficulty: 'easy' | 'medium' | 'hard';
}

// ================================================================
// ASSESSMENT CONTAINER COMPONENT
// ================================================================

export const AssessmentContainer: React.FC<AssessmentContainerProps> = ({
  studentId,
  grade,
  cluster,
  career,
  companion,
  completedSkills,
  onComplete,
  onBack
}) => {
  const theme = useTheme();
  const { currentCharacter, speakMessage } = useAICharacter();
  
  const [phase, setPhase] = useState<'loading' | 'instructions' | 'assessment' | 'results'>('loading');
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [id: string]: any }>({});
  const [timeStarted, setTimeStarted] = useState<number>(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [subjectScores, setSubjectScores] = useState<{ [subject: string]: number }>({});
  const [companionMessage, setCompanionMessage] = useState<{ text: string; emotion: string } | null>(null);
  
  // Load assessment questions on mount
  useEffect(() => {
    loadAssessmentQuestions();
  }, [grade, cluster]);
  
  const loadAssessmentQuestions = async () => {
    const categorySkills = skillProgressionService.getCategorySkillsAcrossSubjects(grade, cluster);
    const questions: AssessmentQuestion[] = [];
    
    // Generate 2-3 questions per subject covering all skills in the category
    Object.entries(categorySkills).forEach(([subject, category]) => {
      // Easy question (from A.1-A.2)
      const easySkill = category.skills.find(s => s.skillNumber.endsWith('.1') || s.skillNumber.endsWith('.2'));
      if (easySkill) {
        questions.push(generateQuestion(easySkill.skillNumber, subject, easySkill.skillName, 'easy'));
      }
      
      // Medium question (from A.3-A.4)
      const mediumSkill = category.skills.find(s => s.skillNumber.endsWith('.3') || s.skillNumber.endsWith('.4'));
      if (mediumSkill) {
        questions.push(generateQuestion(mediumSkill.skillNumber, subject, mediumSkill.skillName, 'medium'));
      }
      
      // Hard question (from A.5 or mixed)
      const hardSkill = category.skills.find(s => s.skillNumber.endsWith('.5'));
      if (hardSkill) {
        questions.push(generateQuestion(hardSkill.skillNumber, subject, hardSkill.skillName, 'hard'));
      }
    });
    
    // Shuffle questions for variety
    const shuffled = questions.sort(() => Math.random() - 0.5);
    setAssessmentQuestions(shuffled);
    
    setPhase('instructions');
  };
  
  const generateQuestion = (
    skill: string, 
    subject: string, 
    skillName: string, 
    difficulty: 'easy' | 'medium' | 'hard'
  ): AssessmentQuestion => {
    // Simplified question generation - in production would use AI
    const questionTypes: AssessmentQuestion['type'][] = ['multiple_choice', 'true_false'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    return {
      id: `${subject}-${skill}-${Date.now()}`,
      skill,
      subject,
      question: `${subject} Assessment: ${skillName} (${difficulty})`,
      correctAnswer: type === 'true_false' ? true : 'A',
      options: type === 'multiple_choice' ? ['A', 'B', 'C', 'D'] : undefined,
      type,
      difficulty
    };
  };
  
  const handleStartAssessment = () => {
    setTimeStarted(Date.now());
    setPhase('assessment');
    
    // Companion encouragement
    setCompanionMessage({
      text: `You've got this! Show me everything you've learned about ${cluster} skills!`,
      emotion: 'encouraging'
    });
  };
  
  const handleAnswerSubmit = (answer: any) => {
    const question = assessmentQuestions[currentQuestionIndex];
    const newAnswers = { ...userAnswers, [question.id]: answer };
    setUserAnswers(newAnswers);
    
    // Don't show feedback during assessment (summative, not formative)
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      // Occasional encouragement
      if ((currentQuestionIndex + 1) % 4 === 0) {
        setCompanionMessage({
          text: `Keep going! You're doing great!`,
          emotion: 'encouraging'
        });
      }
    } else {
      // Assessment complete
      calculateResults(newAnswers);
    }
  };
  
  const calculateResults = (answers: { [id: string]: any }) => {
    const scores: { [subject: string]: { correct: number; total: number } } = {};
    let totalCorrect = 0;
    let totalQuestions = assessmentQuestions.length;
    
    // Check each answer
    assessmentQuestions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = checkAnswer(userAnswer, question);
      
      // Track by subject
      if (!scores[question.subject]) {
        scores[question.subject] = { correct: 0, total: 0 };
      }
      scores[question.subject].total++;
      
      if (isCorrect) {
        scores[question.subject].correct++;
        totalCorrect++;
      }
    });
    
    // Calculate percentages
    const overallScore = Math.round((totalCorrect / totalQuestions) * 100);
    const subjectPercentages: { [subject: string]: number } = {};
    
    Object.entries(scores).forEach(([subject, data]) => {
      subjectPercentages[subject] = Math.round((data.correct / data.total) * 100);
    });
    
    setAssessmentScore(overallScore);
    setSubjectScores(subjectPercentages);
    
    // Determine next action
    const passed = overallScore >= 80; // 80% to pass
    const nextCluster = skillProgressionService.getNextCluster(cluster);
    
    const results: AssessmentResults = {
      cluster,
      passed,
      score: overallScore,
      subjectScores: subjectPercentages,
      nextAction: passed ? 'advance' : (overallScore >= 60 ? 'review' : 'practice'),
      nextCluster: passed ? nextCluster : undefined,
      certificateEarned: passed ? `${cluster} Master Certificate` : undefined
    };
    
    // Show results
    setPhase('results');
    
    // Companion reaction
    if (passed) {
      setCompanionMessage({
        text: `AMAZING! You've mastered all ${cluster} skills! You're ready for ${nextCluster}!`,
        emotion: 'excited'
      });
    } else {
      setCompanionMessage({
        text: `Good effort! Let's review a bit more and you'll ace it next time!`,
        emotion: 'supportive'
      });
    }
    
    // Auto-complete after showing results
    setTimeout(() => {
      onComplete(results);
    }, 7000);
  };
  
  const checkAnswer = (userAnswer: any, question: AssessmentQuestion): boolean => {
    // Simplified answer checking - in production would be more sophisticated
    if (question.type === 'true_false') {
      return userAnswer === question.correctAnswer;
    }
    if (question.type === 'multiple_choice') {
      return userAnswer === question.correctAnswer;
    }
    // For demo, random success based on difficulty
    const successRate = question.difficulty === 'easy' ? 0.9 : 
                       question.difficulty === 'medium' ? 0.7 : 0.5;
    return Math.random() < successRate;
  };
  
  const renderWithDock = (content: React.ReactNode) => {
    return (
      <>
        {content}
        <FloatingLearningDock
          companionName={companion}
          companionId={companion.toLowerCase()}
          userId={studentId}
          currentQuestion={phase === 'assessment' ? assessmentQuestions[currentQuestionIndex]?.question : undefined}
          currentSkill={`${cluster} Assessment`}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={assessmentQuestions.length}
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
      <div className="assessment-container loading">
        <h2>Preparing your assessment...</h2>
        <div className="loading-spinner">📝</div>
      </div>
    );
  }
  
  if (phase === 'instructions') {
    const categorySkills = skillProgressionService.getCategorySkillsAcrossSubjects(grade, cluster);
    const mathCategory = categorySkills['Math'];
    const categoryName = mathCategory?.categoryHeader?.skillName || `${cluster} Skills`;
    
    return renderWithDock(
      <div className="assessment-container instructions">
        <div className="assessment-header">
          <h1>🎯 Assessment Time!</h1>
          <h2>{categoryName}</h2>
        </div>
        
        <div className="instructions-content">
          <div className="instruction-card">
            <span className="icon">📋</span>
            <h3>What to Expect</h3>
            <ul>
              <li>{assessmentQuestions.length} questions total</li>
              <li>Questions from all subjects</li>
              <li>Mix of easy, medium, and hard questions</li>
              <li>About {Math.round(assessmentQuestions.length * 1.5)} minutes to complete</li>
            </ul>
          </div>
          
          <div className="instruction-card">
            <span className="icon">🎯</span>
            <h3>How to Succeed</h3>
            <ul>
              <li>Read each question carefully</li>
              <li>Take your time - no rush!</li>
              <li>Trust what you've learned</li>
              <li>Do your best!</li>
            </ul>
          </div>
          
          <div className="instruction-card">
            <span className="icon">🏆</span>
            <h3>Your Goal</h3>
            <ul>
              <li>Score 80% or higher to advance to {skillProgressionService.getNextCluster(cluster)}</li>
              <li>Earn your {cluster} Master Certificate</li>
              <li>Unlock new learning adventures!</li>
            </ul>
          </div>
        </div>
        
        <div className="companion-message">
          <img src={currentCharacter?.avatar || '/avatars/default.png'} alt={companion} />
          <p>"{companion} here! I know you've worked hard on these skills. You're going to do great! Remember, this is just to see what you've learned - there's no pressure!"</p>
        </div>
        
        <button 
          className="start-assessment-btn"
          onClick={handleStartAssessment}
        >
          I'm Ready! Let's Go! 🚀
        </button>
      </div>
    );
  }
  
  if (phase === 'assessment') {
    const question = assessmentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;
    
    return renderWithDock(
      <div className="assessment-container assessment">
        <div className="assessment-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-info">
            <span>Question {currentQuestionIndex + 1} of {assessmentQuestions.length}</span>
            <span className="subject-tag">
              {getSubjectEmoji(question.subject)} {question.subject}
            </span>
          </div>
        </div>
        
        <div className="question-container">
          <div className="difficulty-indicator">
            {question.difficulty === 'easy' && '⭐'}
            {question.difficulty === 'medium' && '⭐⭐'}
            {question.difficulty === 'hard' && '⭐⭐⭐'}
          </div>
          
          <h2 className="question-text">
            {question.question}
          </h2>
          
          <div className="answer-section">
            {question.type === 'multiple_choice' && question.options && (
              <div className="multiple-choice-options">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    className="option-button"
                    onClick={() => handleAnswerSubmit(option)}
                  >
                    <span className="option-letter">{option}</span>
                    <span className="option-content">Option {option}</span>
                  </button>
                ))}
              </div>
            )}
            
            {question.type === 'true_false' && (
              <div className="true-false-options">
                <button
                  className="tf-button true"
                  onClick={() => handleAnswerSubmit(true)}
                >
                  ✓ True
                </button>
                <button
                  className="tf-button false"
                  onClick={() => handleAnswerSubmit(false)}
                >
                  ✗ False
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (phase === 'results') {
    const passed = assessmentScore >= 80;
    const nextCluster = skillProgressionService.getNextCluster(cluster);
    
    return renderWithDock(
      <div className="assessment-container results">
        <div className="results-celebration">
          {passed && <div className="confetti">🎉🎊🎉</div>}
          
          <h1>{passed ? '🏆 Congratulations!' : '💪 Good Effort!'}</h1>
          
          <div className="score-circle">
            <div className="score-number">{assessmentScore}%</div>
            <div className="score-label">Overall Score</div>
          </div>
          
          <div className="pass-status">
            {passed ? (
              <p className="pass">✓ You Passed! Ready for {nextCluster}!</p>
            ) : (
              <p className="retry">Score 80% or higher to advance</p>
            )}
          </div>
        </div>
        
        <div className="subject-scores">
          <h3>Subject Scores:</h3>
          <div className="scores-grid">
            {Object.entries(subjectScores).map(([subject, score]) => (
              <div key={subject} className="subject-score-card">
                <span className="subject-emoji">{getSubjectEmoji(subject)}</span>
                <span className="subject-name">{subject}</span>
                <span className="subject-score">{score}%</span>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {passed && (
          <div className="certificate">
            <h3>🏅 Certificate Earned!</h3>
            <div className="certificate-card">
              <p>This certifies that</p>
              <h2>{studentId}</h2>
              <p>has successfully mastered</p>
              <h3>{cluster} Skills</h3>
              <p>and is ready to advance to {nextCluster}</p>
            </div>
          </div>
        )}
        
        <div className="next-steps">
          <p>
            {passed 
              ? `Amazing work! You'll start ${nextCluster} skills next!` 
              : `Let's review the areas that need practice and try again!`}
          </p>
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

export default AssessmentContainer;