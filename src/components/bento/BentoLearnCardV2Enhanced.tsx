/**
 * BentoLearnCardV2 Enhanced with Narrative-First Architecture
 * Integrates InstructionalVideoComponent while preserving existing Practice/Assessment modals
 * Maintains all existing production styling and functionality
 */

import React, { useState, useEffect } from 'react';
import { BentoLearnCardV2, BentoLearnCardV2Props } from './BentoLearnCardV2';
import InstructionalVideoComponent from '../containers/InstructionalVideoComponent';
import { contentOrchestrator } from '../../services/ContentOrchestrator';
import { NarrativeToBentoAdapter } from '../../services/adapters/NarrativeToBentoAdapter';
import { MasterNarrative } from '../../services/narrative/MasterNarrativeGenerator';
import { LearnContainerContent } from '../../services/micro-generators/LearnMicroGenerator';
import styles from './BentoLearnCardV2.module.css';

interface BentoLearnCardV2EnhancedProps {
  // Core learning data
  studentName: string;
  gradeLevel: string;
  career: string;
  subject: string;
  skill: {
    skillCode: string;
    skillName: string;
    description: string;
  };

  // Navigation
  onComplete: (success: boolean) => void;
  onBack?: () => void;

  // Optional existing narrative (for reuse)
  existingNarrative?: MasterNarrative;

  // Optional flags
  skipInstruction?: boolean;  // Skip video phase for assessment-only mode
  useMockData?: boolean;       // Use mock data for testing
}

type EnhancedPhase = 'loading' | 'instruction' | 'practice' | 'assessment' | 'complete';

export const BentoLearnCardV2Enhanced: React.FC<BentoLearnCardV2EnhancedProps> = ({
  studentName,
  gradeLevel,
  career,
  subject,
  skill,
  onComplete,
  onBack,
  existingNarrative,
  skipInstruction = false,
  useMockData = false
}) => {
  // State management
  const [currentPhase, setCurrentPhase] = useState<EnhancedPhase>(
    skipInstruction ? 'practice' : 'instruction'
  );
  const [narrative, setNarrative] = useState<MasterNarrative | null>(existingNarrative || null);
  const [learnContent, setLearnContent] = useState<LearnContainerContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adaptedContent, setAdaptedContent] = useState<any>(null);

  // Practice/Assessment state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [practiceScore, setPracticeScore] = useState(0);
  const [assessmentScore, setAssessmentScore] = useState(0);

  // Generate content on mount
  useEffect(() => {
    generateNarrativeContent();
  }, []);

  const generateNarrativeContent = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Generating narrative-enhanced content...');

      let generatedContent;

      if (useMockData) {
        // Use mock for testing
        generatedContent = getMockContent();
      } else if (existingNarrative) {
        // Use existing narrative, just generate micro content
        const microContent = await contentOrchestrator.generateSingleContent(
          existingNarrative,
          'learn',
          subject,
          skill,
          gradeLevel
        );
        generatedContent = {
          narrative: existingNarrative,
          content: microContent
        };
      } else {
        // Generate full journey
        const journey = await contentOrchestrator.generateLearningJourney({
          studentName,
          gradeLevel,
          career,
          subjects: [subject],
          containers: ['learn'],
          useCache: false
        });

        generatedContent = {
          narrative: journey.narrative,
          content: journey.containers.learn[subject as keyof typeof journey.containers.learn]
        };
      }

      setNarrative(generatedContent.narrative);
      setLearnContent(generatedContent.content);

      // Adapt content for BentoLearnCardV2
      const adapted = NarrativeToBentoAdapter.adaptFullJourney(
        generatedContent.content,
        generatedContent.narrative
      );
      setAdaptedContent(adapted);

      console.log('✅ Content generation and adaptation complete');
    } catch (error) {
      console.error('Failed to generate content:', error);
      // Fallback to mock
      const mock = getMockContent();
      setNarrative(mock.narrative);
      setLearnContent(mock.content);
      setAdaptedContent(NarrativeToBentoAdapter.adaptFullJourney(mock.content, mock.narrative));
    } finally {
      setIsLoading(false);
    }
  };

  const getMockContent = () => {
    // Return mock data structure matching the expected format
    return {
      narrative: {
        narrativeId: 'mock_narrative',
        character: {
          name: studentName,
          role: career,
          greeting: 'Ready to learn something amazing?',
          encouragement: 'You can do this!',
          tone: 'friendly'
        },
        cohesiveStory: {
          mission: `help people as a ${career}`
        },
        subjectContextsAligned: {
          [subject]: {
            learn: `This skill helps ${career}s every day!`
          }
        }
      } as MasterNarrative,
      content: {
        instructional: {
          introduction: `Hi ${studentName}! Let's learn ${skill.skillName}`,
          videoIntro: {
            hook: `Discover how ${career}s use ${skill.skillName}`,
            careerContext: `This is essential for your future career!`
          },
          keyLearningPoints: [
            `Understanding ${skill.skillName}`,
            'Practicing with examples',
            'Applying your knowledge'
          ]
        },
        practice: {
          introduction: `Let's practice ${skill.skillName}!`,
          questions: [
            {
              question: `Practice question about ${skill.skillName}`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 'Option A',
              hint: 'Think about what we just learned!',
              type: 'multiple-choice'
            }
          ],
          encouragement: 'Great job practicing!'
        },
        assessment: {
          introduction: 'Show what you learned!',
          questions: [
            {
              question: `Assessment question about ${skill.skillName}`,
              options: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
              correctAnswer: 'Choice 1',
              type: 'multiple-choice'
            }
          ],
          successMessage: 'You mastered it!'
        },
        metadata: {
          subject,
          skill: skill.skillCode,
          generatedAt: new Date(),
          cost: 0
        }
      } as LearnContainerContent
    };
  };

  // Phase navigation handlers
  const handleInstructionComplete = () => {
    console.log('✅ Instruction phase complete');
    setCurrentPhase('practice');
    setCurrentQuestionIndex(0);
  };

  const handlePracticeComplete = (success: boolean) => {
    console.log('✅ Practice phase complete:', success);
    setCurrentPhase('assessment');
    setCurrentQuestionIndex(0);
  };

  const handleAssessmentComplete = (success: boolean) => {
    console.log('✅ Assessment phase complete:', success);
    setCurrentPhase('complete');
    setTimeout(() => onComplete(success), 2000);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className={styles.bentoContainerV2}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Generating your personalized learning journey...</p>
          <p className={styles.careerTag}>Career: {career}</p>
        </div>
      </div>
    );
  }

  if (!narrative || !learnContent || !adaptedContent) {
    return (
      <div className={styles.bentoContainerV2}>
        <div className={styles.errorContainer}>
          <p>Unable to load content. Please try again.</p>
          <button onClick={onBack} className={styles.backButton}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render based on current phase
  switch (currentPhase) {
    case 'instruction':
      return (
        <InstructionalVideoComponent
          content={learnContent}
          narrative={narrative}
          studentName={studentName}
          gradeLevel={gradeLevel}
          subject={subject}
          skill={skill}
          onComplete={handleInstructionComplete}
          onSkipToQuestions={handleInstructionComplete}
        />
      );

    case 'practice':
      const practiceQuestions = adaptedContent.practiceQuestions;
      if (!practiceQuestions || practiceQuestions.length === 0) {
        handlePracticeComplete(true);
        return null;
      }

      return (
        <BentoLearnCardV2
          question={practiceQuestions[currentQuestionIndex]}
          onAnswerSubmit={(answer) => {
            // Handle answer submission
            const isCorrect = answer === practiceQuestions[currentQuestionIndex].correctAnswer;
            if (isCorrect) setPracticeScore(prev => prev + 1);
          }}
          onNextQuestion={() => {
            if (currentQuestionIndex < practiceQuestions.length - 1) {
              setCurrentQuestionIndex(prev => prev + 1);
            } else {
              handlePracticeComplete(practiceScore >= practiceQuestions.length * 0.7);
            }
          }}
          progress={{
            current: currentQuestionIndex + 1,
            total: practiceQuestions.length,
            score: practiceScore
          }}
          gradeLevel={gradeLevel}
          subject={subject}
          skill="Practice"  // This tells BentoLearnCardV2 it's in practice mode
          feedback={undefined}
        />
      );

    case 'assessment':
      const assessmentQuestions = adaptedContent.assessmentQuestions;
      if (!assessmentQuestions || assessmentQuestions.length === 0) {
        handleAssessmentComplete(true);
        return null;
      }

      return (
        <BentoLearnCardV2
          question={assessmentQuestions[currentQuestionIndex]}
          onAnswerSubmit={(answer) => {
            const isCorrect = answer === assessmentQuestions[currentQuestionIndex].correctAnswer;
            if (isCorrect) setAssessmentScore(prev => prev + 1);
          }}
          onNextQuestion={() => {
            if (currentQuestionIndex < assessmentQuestions.length - 1) {
              setCurrentQuestionIndex(prev => prev + 1);
            } else {
              handleAssessmentComplete(assessmentScore >= assessmentQuestions.length * 0.8);
            }
          }}
          progress={{
            current: currentQuestionIndex + 1,
            total: assessmentQuestions.length,
            score: assessmentScore
          }}
          gradeLevel={gradeLevel}
          subject={subject}
          skill="Assessment"  // This tells BentoLearnCardV2 it's in assessment mode
          feedback={undefined}
        />
      );

    case 'complete':
      return (
        <div className={styles.bentoContainerV2}>
          <div className={styles.completionContainer}>
            <h2>🎉 Congratulations, {studentName}!</h2>
            <p>You've completed your learning journey!</p>
            <div className={styles.scoreDisplay}>
              <div>Practice Score: {practiceScore}/{adaptedContent.practiceQuestions.length}</div>
              <div>Assessment Score: {assessmentScore}/{adaptedContent.assessmentQuestions.length}</div>
            </div>
            <p className={styles.careerMessage}>
              You're on your way to becoming an amazing {career}!
            </p>
            <button onClick={() => onComplete(true)} className={styles.continueButton}>
              Continue Learning Journey
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default BentoLearnCardV2Enhanced;