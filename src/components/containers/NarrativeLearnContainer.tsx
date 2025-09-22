/**
 * Narrative Learn Container
 * Orchestrates the three-phase learning experience with narrative context
 * Integrates Instructional (Video), Practice, and Assessment phases
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Target, CheckCircle, Clock, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import InstructionalVideoComponent from './InstructionalVideoComponent';
import { contentOrchestrator, LearningJourneyContent } from '../../services/ContentOrchestrator';
import { MasterNarrative } from '../../services/narrative/MasterNarrativeGenerator';
import { LearnContainerContent } from '../../services/micro-generators/LearnMicroGenerator';
import '../../design-system/index.css';

interface NarrativeLearnContainerProps {
  studentName: string;
  gradeLevel: string;
  career: string;
  subject: string;
  skill: {
    skillCode: string;
    skillName: string;
    description: string;
  };
  onComplete: (results: any) => void;
  onExit: () => void;
  existingNarrative?: MasterNarrative; // Optional: use existing narrative if available
}

type LearningPhase = 'instructional' | 'practice' | 'assessment' | 'complete';

interface PhaseResults {
  instructional: { completed: boolean; timeSpent: number };
  practice: { score: number; attempts: number; timeSpent: number };
  assessment: { score: number; correct: boolean; timeSpent: number };
}

export const NarrativeLearnContainer: React.FC<NarrativeLearnContainerProps> = ({
  studentName,
  gradeLevel,
  career,
  subject,
  skill,
  onComplete,
  onExit,
  existingNarrative
}) => {
  const [currentPhase, setCurrentPhase] = useState<LearningPhase>('instructional');
  const [narrative, setNarrative] = useState<MasterNarrative | null>(existingNarrative || null);
  const [learnContent, setLearnContent] = useState<LearnContainerContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phaseResults, setPhaseResults] = useState<PhaseResults>({
    instructional: { completed: false, timeSpent: 0 },
    practice: { score: 0, attempts: 0, timeSpent: 0 },
    assessment: { score: 0, correct: false, timeSpent: 0 }
  });
  const [startTime] = useState(new Date());
  const [phaseStartTime, setPhaseStartTime] = useState(new Date());
  const [selectedPracticeAnswer, setSelectedPracticeAnswer] = useState<string>('');
  const [selectedAssessmentAnswer, setSelectedAssessmentAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [practiceAttempts, setPracticeAttempts] = useState(0);

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Generating narrative-driven learn content...');

      let journeyContent: LearningJourneyContent;

      if (existingNarrative) {
        // Use existing narrative, just generate micro content
        const microGen = await contentOrchestrator.generateSingleContent(
          existingNarrative,
          'learn',
          subject,
          skill,
          gradeLevel
        );
        setLearnContent(microGen as LearnContainerContent);
        setNarrative(existingNarrative);
      } else {
        // Generate full journey (narrative + micro content)
        journeyContent = await contentOrchestrator.generateLearningJourney({
          studentName,
          gradeLevel,
          career,
          subjects: [subject],
          containers: ['learn'],
          useCache: false // Phase 1: No caching
        });

        setNarrative(journeyContent.narrative);
        setLearnContent(journeyContent.containers.learn[subject as keyof typeof journeyContent.containers.learn]);
      }

      console.log('✅ Content generation complete');
    } catch (error) {
      console.error('Failed to generate content:', error);
      // Fallback to mock content
      generateMockContent();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockContent = () => {
    // Mock content for fallback
    console.log('Using mock content as fallback');
    // Implementation would go here
  };

  const handleInstructionalComplete = () => {
    const timeSpent = new Date().getTime() - phaseStartTime.getTime();
    setPhaseResults(prev => ({
      ...prev,
      instructional: { completed: true, timeSpent }
    }));
    setCurrentPhase('practice');
    setPhaseStartTime(new Date());
  };

  const handlePracticeSubmit = () => {
    if (!selectedPracticeAnswer || !learnContent) return;

    setPracticeAttempts(prev => prev + 1);
    setShowFeedback(true);

    const isCorrect = selectedPracticeAnswer === learnContent.practice.questions[0].correctAnswer;
    const score = isCorrect ? 100 : 0;

    setTimeout(() => {
      const timeSpent = new Date().getTime() - phaseStartTime.getTime();
      setPhaseResults(prev => ({
        ...prev,
        practice: { score, attempts: practiceAttempts + 1, timeSpent }
      }));

      if (isCorrect || practiceAttempts >= 2) {
        setCurrentPhase('assessment');
        setPhaseStartTime(new Date());
        setShowFeedback(false);
        setSelectedPracticeAnswer('');
        setPracticeAttempts(0);
      } else {
        setShowFeedback(false);
        setSelectedPracticeAnswer('');
      }
    }, 2000);
  };

  const handleAssessmentSubmit = () => {
    if (!selectedAssessmentAnswer || !learnContent) return;

    const isCorrect = selectedAssessmentAnswer === learnContent.assessment.questions[0].correctAnswer;
    const score = isCorrect ? 100 : 0;
    const timeSpent = new Date().getTime() - phaseStartTime.getTime();

    setPhaseResults(prev => ({
      ...prev,
      assessment: { score, correct: isCorrect, timeSpent }
    }));

    setShowFeedback(true);

    setTimeout(() => {
      setCurrentPhase('complete');
      handleComplete(isCorrect, score);
    }, 3000);
  };

  const handleComplete = (correct: boolean, score: number) => {
    const totalTimeSpent = new Date().getTime() - startTime.getTime();

    const results = {
      skillCode: skill.skillCode,
      completed: true,
      correct,
      score,
      attempts: phaseResults.practice.attempts,
      timeSpent: totalTimeSpent,
      phaseResults,
      narrativeContext: {
        career: narrative?.character.role,
        mission: narrative?.cohesiveStory.mission
      }
    };

    onComplete(results);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen ds-bg-surface-primary flex items-center justify-center">
        <div className="text-center">
          <div className="ds-spinner-primary mb-4"></div>
          <p className="ds-text-content-secondary">Generating your personalized learning journey...</p>
          <p className="text-sm ds-text-content-tertiary mt-2">Career: {career}</p>
        </div>
      </div>
    );
  }

  if (!narrative || !learnContent) {
    return (
      <div className="min-h-screen ds-bg-surface-primary flex items-center justify-center">
        <div className="text-center">
          <p className="ds-text-error">Unable to load content. Please try again.</p>
          <button onClick={onExit} className="ds-btn-secondary mt-4">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ds-bg-gradient-subtle">
      {/* Header */}
      <div className="ds-bg-surface-primary ds-shadow-sm ds-border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onExit}
                className="ds-btn-icon hover:ds-bg-surface-secondary"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="ds-border-l ds-border-subtle pl-4">
                <h1 className="text-xl font-bold ds-text-content-primary">
                  {skill.skillName} - {subject}
                </h1>
                <p className="text-sm ds-text-content-secondary">
                  {studentName} • {gradeLevel} • Future {narrative.character.role}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 ds-text-content-tertiary">
              <Clock className="h-4 w-4" />
              <span className="text-sm">20 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center space-x-2 ${
            currentPhase === 'instructional' ? 'ds-text-primary' :
            phaseResults.instructional.completed ? 'ds-text-success' : 'ds-text-content-tertiary'
          }`}>
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Watch & Learn</span>
          </div>
          <div className="flex-1 h-2 mx-4 ds-bg-surface-secondary rounded-full">
            <div className={`h-full rounded-full transition-all duration-500 ${
              phaseResults.instructional.completed ? 'w-full ds-bg-success' : 'w-1/3 ds-bg-primary'
            }`}></div>
          </div>

          <div className={`flex items-center space-x-2 ${
            currentPhase === 'practice' ? 'ds-text-primary' :
            phaseResults.practice.score > 0 ? 'ds-text-success' : 'ds-text-content-tertiary'
          }`}>
            <Target className="h-5 w-5" />
            <span className="font-medium">Practice</span>
          </div>
          <div className="flex-1 h-2 mx-4 ds-bg-surface-secondary rounded-full">
            <div className={`h-full rounded-full transition-all duration-500 ${
              phaseResults.practice.score > 0 ? 'w-full ds-bg-success' :
              currentPhase === 'practice' ? 'w-1/3 ds-bg-primary' : 'w-0'
            }`}></div>
          </div>

          <div className={`flex items-center space-x-2 ${
            currentPhase === 'assessment' ? 'ds-text-primary' :
            currentPhase === 'complete' ? 'ds-text-success' : 'ds-text-content-tertiary'
          }`}>
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Assessment</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto">
          {/* Instructional Phase */}
          {currentPhase === 'instructional' && (
            <InstructionalVideoComponent
              content={learnContent}
              narrative={narrative}
              studentName={studentName}
              gradeLevel={gradeLevel}
              subject={subject}
              skill={skill}
              onComplete={handleInstructionalComplete}
              onSkipToQuestions={() => {
                handleInstructionalComplete();
              }}
            />
          )}

          {/* Practice Phase */}
          {currentPhase === 'practice' && (
            <div className="ds-card-primary">
              <div className="p-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 ds-bg-accent/10 rounded-full mb-4">
                    <Target className="h-8 w-8 ds-text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold ds-text-content-primary">
                    {learnContent.practice.introduction}
                  </h2>
                  <p className="ds-text-content-secondary mt-2">
                    {learnContent.practice.context}
                  </p>
                </div>

                {/* Practice Question */}
                <div className="space-y-4">
                  {learnContent.practice?.questions?.length > 0 ? (
                  <div className="ds-card-secondary p-4">
                    <p className="font-medium ds-text-content-primary mb-4">
                      {learnContent.practice.questions[0].question}
                    </p>
                    <div className="space-y-3">
                      {(learnContent.practice.questions[0].options || []).map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedPracticeAnswer(option)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedPracticeAnswer === option
                              ? 'ds-bg-primary/10 ds-border-primary border-2'
                              : 'ds-bg-surface-primary hover:ds-bg-surface-secondary border-2 border-transparent'
                          }`}
                          disabled={showFeedback}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedPracticeAnswer === option
                                ? 'ds-border-primary ds-bg-primary'
                                : 'ds-border-subtle'
                            }`}>
                              {selectedPracticeAnswer === option && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="ds-text-content-primary">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  ) : (
                    <div className="ds-card-secondary p-4 text-center">
                      <p className="ds-text-content-secondary">Loading practice questions...</p>
                    </div>
                  )}

                  {/* Feedback */}
                  {showFeedback && learnContent.practice?.questions?.length > 0 && (
                    <div className={`p-4 rounded-lg ${
                      selectedPracticeAnswer === learnContent.practice.questions[0].correctAnswer
                        ? 'ds-bg-success/10 ds-border-success border'
                        : 'ds-bg-warning/10 ds-border-warning border'
                    }`}>
                      <p className="font-medium ds-text-content-primary mb-2">
                        {selectedPracticeAnswer === learnContent.practice.questions[0].correctAnswer
                          ? '🎉 Great job!'
                          : `💭 Not quite. ${learnContent.practice.questions[0].hint}`}
                      </p>
                      <p className="text-sm ds-text-content-secondary">
                        {learnContent.practice.questions[0].explanation}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  {!showFeedback && (
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handlePracticeSubmit}
                        disabled={!selectedPracticeAnswer}
                        className="ds-btn-primary"
                      >
                        Submit Answer
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Assessment Phase */}
          {currentPhase === 'assessment' && (
            <div className="ds-card-primary">
              <div className="p-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 ds-bg-primary/10 rounded-full mb-4">
                    <CheckCircle className="h-8 w-8 ds-text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold ds-text-content-primary">
                    {learnContent.assessment.introduction}
                  </h2>
                  <p className="ds-text-content-secondary mt-2">
                    Show what you've learned about {skill.skillName}!
                  </p>
                </div>

                {/* Assessment Question */}
                <div className="space-y-4">
                  {learnContent.assessment?.questions?.length > 0 ? (
                  <div className="ds-card-secondary p-4">
                    <p className="font-medium ds-text-content-primary mb-4">
                      {learnContent.assessment.questions[0].question}
                    </p>
                    <div className="space-y-3">
                      {learnContent.assessment.questions[0].options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedAssessmentAnswer(option)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedAssessmentAnswer === option
                              ? 'ds-bg-primary/10 ds-border-primary border-2'
                              : 'ds-bg-surface-primary hover:ds-bg-surface-secondary border-2 border-transparent'
                          }`}
                          disabled={showFeedback}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedAssessmentAnswer === option
                                ? 'ds-border-primary ds-bg-primary'
                                : 'ds-border-subtle'
                            }`}>
                              {selectedAssessmentAnswer === option && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="ds-text-content-primary">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  ) : (
                    <div className="ds-card-secondary p-4 text-center">
                      <p className="ds-text-content-secondary">Loading assessment questions...</p>
                    </div>
                  )}

                  {/* Feedback */}
                  {showFeedback && learnContent.assessment?.questions?.length > 0 && (
                    <div className={`p-4 rounded-lg ${
                      selectedAssessmentAnswer === learnContent.assessment.questions[0].correctAnswer
                        ? 'ds-bg-success/10 ds-border-success border'
                        : 'ds-bg-error/10 ds-border-error border'
                    }`}>
                      <p className="font-medium ds-text-content-primary mb-2">
                        {selectedAssessmentAnswer === learnContent.assessment.questions[0].correctAnswer
                          ? `🌟 Excellent work, ${studentName}!`
                          : `Keep practicing, ${studentName}!`}
                      </p>
                      <p className="text-sm ds-text-content-secondary">
                        {learnContent.assessment.successMessage}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  {!showFeedback && (
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handleAssessmentSubmit}
                        disabled={!selectedAssessmentAnswer}
                        className="ds-btn-primary"
                      >
                        Submit Final Answer
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Complete Phase */}
          {currentPhase === 'complete' && (
            <div className="ds-card-primary text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 ds-bg-success/10 rounded-full mb-6">
                <Sparkles className="h-10 w-10 ds-text-success" />
              </div>
              <h2 className="text-3xl font-bold ds-text-content-primary mb-4">
                Amazing Job, {studentName}!
              </h2>
              <p className="text-lg ds-text-content-secondary mb-6">
                You've mastered {skill.skillName}!
              </p>
              <div className="ds-card-secondary inline-block p-4 mb-6">
                <p className="text-sm ds-text-content-tertiary mb-2">Your Score</p>
                <p className="text-4xl font-bold ds-text-primary">
                  {phaseResults.assessment.score}%
                </p>
              </div>
              <p className="ds-text-content-secondary mb-8">
                As a future {narrative.character.role}, you're learning skills that will help you {narrative.cohesiveStory.mission}!
              </p>
              <button
                onClick={() => onComplete(phaseResults)}
                className="ds-btn-primary ds-btn-lg"
              >
                Continue Learning Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NarrativeLearnContainer;