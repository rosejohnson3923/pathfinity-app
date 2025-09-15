/**
 * AI-FIRST EXPERIENCE CONTAINER V2 - JIT INTEGRATION
 * Refactored to use Just-In-Time Content Service with real-world simulations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';
import { unifiedLearningAnalyticsService } from '../../services/unifiedLearningAnalyticsService';
import { voiceManagerService } from '../../services/voiceManagerService';
import { companionReactionService } from '../../services/companionReactionService';
import { useAICharacter } from '../ai-characters/AICharacterProvider';
import { AICharacterAvatar } from '../ai-characters/AICharacterAvatar';
import { ContainerNavigationHeader } from './ContainerNavigationHeader';
import { FloatingLearningDock } from '../learning-support/FloatingLearningDock';
import { CompanionChatBox } from '../learning-support/CompanionChatBox';
import { EnhancedLoadingScreen } from './EnhancedLoadingScreen';
import { useTheme } from '../../hooks/useTheme';
import { usePathIQGamification } from '../../hooks/usePathIQGamification';
import { useModeContext } from '../../contexts/ModeContext';
import { XPDisplay } from '../gamification/XPDisplay';

// NEW JIT IMPORTS
import { Question } from '../../services/content/QuestionTypes';
import { questionValidator, ValidationResult } from '../../services/content/QuestionValidator';
import { getDailyLearningContext } from '../../services/content/DailyLearningContextManager';
import { getJustInTimeContentService } from '../../services/content/JustInTimeContentService';
import { getPerformanceTracker } from '../../services/content/PerformanceTracker';
import { getSessionStateManager } from '../../services/content/SessionStateManager';
import { getConsistencyValidator } from '../../services/content/ConsistencyValidator';
import { getSkillAdaptationService } from '../../services/content/SkillAdaptationService';
import { QuestionRenderer } from '../../services/content/QuestionRenderer';

// Import styles
import '../../styles/containers/ExperienceContainer.css';

// ================================================================
// COMPONENT INTERFACES
// ================================================================

interface AIExperienceContainerV2Props {
  student: StudentProfile;
  skill: LearningSkill;
  selectedCharacter?: string;
  selectedCareer?: any;
  onComplete: (success: boolean) => void;
  onNext: () => void;
  onBack?: () => void;
  userId?: string;
}

type ExperiencePhase = 'loading' | 'career_intro' | 'real_world' | 'simulation' | 'reflection' | 'complete';

interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  careerContext: string;
  skillApplication: string;
  challenge: any; // Question object
  realWorldExample: string;
  toolsUsed: string[];
  successCriteria: string;
}

interface ExperienceMetrics {
  simulationAttempts: number;
  problemsSolved: number;
  toolsExplored: number;
  realWorldConnections: number;
  engagementScore: number;
}

// ================================================================
// AI EXPERIENCE CONTAINER V2 WITH JIT INTEGRATION
// ================================================================

export const AIExperienceContainerV2: React.FC<AIExperienceContainerV2Props> = ({
  student,
  skill,
  selectedCharacter,
  selectedCareer,
  onComplete,
  onNext,
  onBack,
  userId
}) => {
  // ================================================================
  // STATE MANAGEMENT
  // ================================================================
  
  const [phase, setPhase] = useState<ExperiencePhase>('loading');
  const [content, setContent] = useState<any>(null);
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario | null>(null);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulationResults, setSimulationResults] = useState<Record<string, boolean>>({});
  const [experienceMetrics, setExperienceMetrics] = useState<ExperienceMetrics>({
    simulationAttempts: 0,
    problemsSolved: 0,
    toolsExplored: 0,
    realWorldConnections: 0,
    engagementScore: 0
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [companionMessage, setCompanionMessage] = useState('');
  const [companionEmotion, setCompanionEmotion] = useState('excited');
  const [scenarioStartTime, setScenarioStartTime] = useState(Date.now());
  
  // ================================================================
  // CONTEXT & HOOKS
  // ================================================================
  
  const theme = useTheme();
  const { currentMode } = useModeContext();
  const { currentCharacter, generateCharacterResponse, speakMessage, selectCharacter } = useAICharacter();
  const { features, awardXP, profile } = usePathIQGamification(
    userId || student?.id || 'default',
    student?.grade_level
  );
  
  // JIT Services
  const dailyContextManager = getDailyLearningContext();
  const jitService = getJustInTimeContentService();
  const performanceTracker = getPerformanceTracker();
  const sessionManager = getSessionStateManager();
  const consistencyValidator = getConsistencyValidator();
  const skillAdaptationService = getSkillAdaptationService();
  
  // Refs
  const containerStartTime = useRef<number>(Date.now());
  const contentGeneratedRef = useRef(false);
  const containerId = useRef(`experience-${skill?.subject?.toLowerCase() || 'general'}-${Date.now()}`);
  
  // Character setup
  const character = currentCharacter || { id: 'finn', name: 'Finn' };
  const career = selectedCareer?.name || 'Explorer';
  
  // Select character if specified
  useEffect(() => {
    if (selectedCharacter) {
      const normalizedCharacter = selectedCharacter.toLowerCase();
      if (currentCharacter?.id !== normalizedCharacter) {
        selectCharacter(normalizedCharacter);
      }
    }
  }, [selectedCharacter, currentCharacter, selectCharacter]);
  
  // ================================================================
  // JIT CONTENT GENERATION FOR EXPERIENCE
  // ================================================================
  
  useEffect(() => {
    if (contentGeneratedRef.current) {
      console.log('[JIT-Experience] Content already generated');
      return;
    }
    
    const generateExperienceContent = async () => {
      console.log('[JIT-Experience] Generating experience content');
      contentGeneratedRef.current = true;
      setIsLoading(true);
      setError(null);
      
      try {
        // Get or create daily context
        let dailyContext = dailyContextManager.getCurrentContext();
        if (!dailyContext) {
          console.log('[JIT-Experience] Creating daily context');
          dailyContext = dailyContextManager.createDailyContext({
            id: student.id,
            grade: student.grade_level,
            currentSkill: skill,
            selectedCareer: {
              id: career.toLowerCase(),
              title: career,
              description: `Working as a ${career}`,
              skills: [],
              education: '',
              salary: ''
            },
            companion: character,
            enrolledSubjects: ['Math', 'ELA', 'Science', 'Social Studies']
          } as any);
        }
        
        // Track container progression
        sessionManager.trackContainerProgression(
          student.id,
          containerId.current,
          'experience',
          skill.subject || 'General'
        );
        
        // Get performance context for adaptation
        const sessionState = sessionManager.getCurrentState(student.id);
        const performanceContext = sessionState ? {
          recentAccuracy: sessionState.performance.overallAccuracy,
          averageTimePerQuestion: sessionState.performance.averageTimePerQuestion,
          hintsUsedRate: sessionState.performance.totalHintsUsed / Math.max(1, sessionState.performance.totalQuestionsAnswered),
          streakCount: sessionState.performance.streakCount,
          adaptationLevel: sessionState.adaptationLevel
        } : undefined;
        
        // Generate experience-focused content
        console.log('[JIT-Experience] Requesting JIT generation');
        const startTime = performance.now();
        
        const generatedContent = await jitService.generateContainerContent({
          userId: student.id,
          container: containerId.current,
          containerType: 'experience',
          subject: skill.subject || 'General',
          performanceContext,
          timeConstraint: currentMode?.name === 'demo' ? 2 : 10, // Shorter for experience
          forceRegenerate: false
        });
        
        const generationTime = performance.now() - startTime;
        console.log(`[JIT-Experience] Generated in ${generationTime.toFixed(0)}ms`);
        
        // Get skill adaptation for real-world context
        const skillAdaptation = skillAdaptationService.adaptSkill(
          skill,
          skill.subject || 'General',
          dailyContext.career,
          dailyContext.grade
        );
        
        // Create simulation scenarios from generated questions
        const experienceScenarios = await createSimulationScenarios(
          generatedContent.questions,
          dailyContext.career,
          skill,
          skillAdaptation
        );
        
        // Validate consistency
        const consistencyReport = consistencyValidator.validateCrossSubjectCoherence(
          experienceScenarios.map(s => ({
            type: 'scenario' as any,
            subject: skill.subject || 'General',
            text: JSON.stringify(s)
          })),
          dailyContext
        );
        
        console.log('[JIT-Experience] Consistency:', consistencyReport.overallScore.toFixed(0) + '%');
        
        // Structure content for experience container
        const structuredContent = {
          careerIntro: generateCareerIntro(dailyContext.career, skill, skillAdaptation),
          realWorldContext: skillAdaptation.careerConnection,
          scenarios: experienceScenarios,
          instructions: generatedContent.instructions,
          companionMessages: generateExperienceMessages(character, dailyContext.career, skill),
          metadata: {
            ...generatedContent.metadata,
            careerFocus: dailyContext.career.title,
            skillFocus: skill.name,
            estimatedTime: generatedContent.estimatedTime
          }
        };
        
        setContent(structuredContent);
        setScenarios(experienceScenarios);
        setCurrentScenario(experienceScenarios[0]);
        setPhase('career_intro');
        
        // Log cache performance
        const cacheStats = jitService.getCacheStats();
        console.log('[JIT-Experience] Cache stats:', {
          hitRate: cacheStats.hitRate.toFixed(1) + '%',
          entries: cacheStats.totalEntries
        });
        
      } catch (err) {
        console.error('[JIT-Experience] Generation failed:', err);
        setError('Failed to generate experience content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    generateExperienceContent();
  }, [skill?.id, student?.id]);
  
  // ================================================================
  // SIMULATION SCENARIO CREATION
  // ================================================================
  
  const createSimulationScenarios = async (
    questions: any[],
    career: any,
    skill: LearningSkill,
    adaptation: any
  ): Promise<SimulationScenario[]> => {
    return questions.map((question, index) => ({
      id: `scenario-${index}`,
      title: `${career.title} Challenge ${index + 1}`,
      description: `Apply ${skill.name} as a ${career.title}`,
      careerContext: adaptation.careerConnection,
      skillApplication: adaptation.practiceContext,
      challenge: question,
      realWorldExample: adaptation.examples?.[index % adaptation.examples.length]?.scenario || 
                       `A ${career.title} uses ${skill.name} to solve problems`,
      toolsUsed: getCareerTools(career.title),
      successCriteria: `Correctly apply ${skill.name} to complete the task`
    }));
  };
  
  const getCareerTools = (careerTitle: string): string[] => {
    const toolsMap: Record<string, string[]> = {
      'Game Developer': ['Code Editor', 'Game Engine', 'Debugger', 'Version Control'],
      'Chef': ['Recipe Book', 'Kitchen Timer', 'Measuring Tools', 'Taste Testing'],
      'Architect': ['CAD Software', 'Blueprint', 'Scale Ruler', '3D Modeler'],
      'Scientist': ['Lab Equipment', 'Data Logger', 'Microscope', 'Calculator'],
      'Artist': ['Canvas', 'Palette', 'Brushes', 'Color Wheel'],
      'Musician': ['Instrument', 'Sheet Music', 'Metronome', 'Recording Software'],
      'Athlete': ['Training Plan', 'Stopwatch', 'Performance Tracker', 'Equipment'],
      'Veterinarian': ['Medical Tools', 'Diagnostic Kit', 'Treatment Guide', 'Patient Records']
    };
    
    return toolsMap[careerTitle] || ['Professional Tools', 'Computer', 'Notebook', 'Calculator'];
  };
  
  const generateCareerIntro = (career: any, skill: LearningSkill, adaptation: any): string => {
    return `Welcome to the world of ${career.title}! Today, you'll experience how 
            professionals use ${skill.name} in real situations. ${adaptation.careerConnection}`;
  };
  
  const generateExperienceMessages = (character: any, career: any, skill: LearningSkill): string[] => {
    return [
      `Let's explore how ${career.title}s use ${skill.name} in their work!`,
      `Great job! You're thinking like a real ${career.title}!`,
      `This is exactly what ${career.title}s do every day!`,
      `You're mastering professional skills!`
    ];
  };
  
  // ================================================================
  // PERFORMANCE TRACKING
  // ================================================================
  
  const trackScenarioPerformance = useCallback((scenario: SimulationScenario, correct: boolean, timeSpent: number) => {
    // Track with performance tracker
    performanceTracker.trackQuestionPerformance(
      student.id,
      {
        ...scenario.challenge,
        id: scenario.id,
        subject: skill.subject || 'General',
        skill: skill,
        containerId: containerId.current
      },
      {
        correct,
        timeSpent,
        hintsUsed: 0,
        attempts: experienceMetrics.simulationAttempts + 1
      }
    );
    
    // Update experience metrics
    setExperienceMetrics(prev => ({
      ...prev,
      simulationAttempts: prev.simulationAttempts + 1,
      problemsSolved: prev.problemsSolved + (correct ? 1 : 0),
      toolsExplored: prev.toolsExplored + scenario.toolsUsed.length,
      realWorldConnections: prev.realWorldConnections + 1,
      engagementScore: Math.min(100, prev.engagementScore + (correct ? 20 : 10))
    }));
    
    // Award XP for engagement
    if (features.xpEnabled) {
      const xpAmount = correct ? 25 : 10; // More XP for experience activities
      awardXP(xpAmount, correct ? 'simulation_success' : 'simulation_attempt');
    }
    
    // Get insights for companion feedback
    const analytics = performanceTracker.getPerformanceAnalytics(student.id);
    if (analytics.insights.length > 0) {
      setCompanionMessage(analytics.insights[0].message);
      setCompanionEmotion(correct ? 'excited' : 'encouraging');
    }
  }, [student.id, skill, experienceMetrics, features, awardXP]);
  
  // ================================================================
  // PHASE HANDLERS
  // ================================================================
  
  const handleCareerIntroComplete = () => {
    setPhase('real_world');
    voiceManagerService.stopSpeaking();
  };
  
  const handleRealWorldComplete = () => {
    setPhase('simulation');
    setScenarioStartTime(Date.now());
  };
  
  const handleSimulationAnswer = (answer: any) => {
    const timeSpent = Math.round((Date.now() - scenarioStartTime) / 1000);
    const validationResult = validateAnswer(currentScenario?.challenge, answer);
    const isCorrect = validationResult.correct;
    
    // Show feedback if available
    if (validationResult.feedback) {
      setCompanionMessage({
        text: validationResult.feedback,
        emotion: isCorrect ? 'excited' : 'encouraging'
      });
    }
    
    // Track performance
    if (currentScenario) {
      trackScenarioPerformance(currentScenario, isCorrect, timeSpent);
      setSimulationResults({
        ...simulationResults,
        [currentScenario.id]: isCorrect
      });
    }
    
    // Provide feedback
    setCompanionEmotion(isCorrect ? 'excited' : 'supportive');
    setCompanionMessage(
      isCorrect 
        ? `Excellent! That's exactly how a ${career} would solve it!`
        : `Good try! ${career}s sometimes face challenges too. Let's learn from this.`
    );
    
    // Move to next scenario or complete
    setTimeout(() => {
      if (currentScenarioIndex < scenarios.length - 1) {
        setCurrentScenarioIndex(currentScenarioIndex + 1);
        setCurrentScenario(scenarios[currentScenarioIndex + 1]);
        setScenarioStartTime(Date.now());
      } else {
        setPhase('reflection');
      }
    }, 2000);
  };
  
  const handleReflectionComplete = () => {
    // Complete container tracking
    sessionManager.completeContainer(student.id, containerId.current);
    
    // Calculate success
    const correctCount = Object.values(simulationResults).filter(r => r).length;
    const successRate = correctCount / Math.max(1, scenarios.length);
    const overallSuccess = successRate > 0.6;
    
    // Update skill progress
    if (overallSuccess) {
      sessionManager.updateSkillProgress(student.id, skill.id, 15); // More progress for experience
    }
    
    // Preload next content
    jitService.preloadNextContent(student.id, containerId.current);
    
    setPhase('complete');
    
    // Notify parent
    setTimeout(() => {
      onComplete(overallSuccess);
    }, 3000);
  };
  
  const validateAnswer = (question: Question, answer: any): { 
    correct: boolean; 
    feedback?: string; 
    score: number;
    partialCredit?: any;
  } => {
    if (!question || answer === null || answer === undefined) {
      return { correct: false, score: 0, feedback: 'No answer provided' };
    }
    
    // Use the comprehensive QuestionValidator
    const result: ValidationResult = questionValidator.validateAnswer(question, answer);
    
    // Log for debugging
    console.log(`Experience answer validation:`, {
      questionType: question.type,
      correct: result.isCorrect,
      score: result.score,
      feedback: result.feedback
    });
    
    return {
      correct: result.isCorrect || false,
      feedback: result.feedback,
      score: result.score,
      partialCredit: result.partialCredit
    };
  };
  
  // ================================================================
  // NAVIGATION HANDLERS
  // ================================================================
  
  const handleNavNext = () => {
    voiceManagerService.stopSpeaking();
    onNext();
  };
  
  const handleNavBack = () => {
    if (onBack) {
      voiceManagerService.stopSpeaking();
      onBack();
    }
  };
  
  // ================================================================
  // RENDER
  // ================================================================
  
  if (isLoading || phase === 'loading') {
    return (
      <EnhancedLoadingScreen
        message="Preparing your real-world experience..."
        companion={character}
        skill={skill}
        career={career}
      />
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Experience Setup Failed</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  
  return (
    <div className={`ai-experience-container-v2 theme-${theme}`}>
      <ContainerNavigationHeader
        title={`Experience: ${skill?.name || 'Loading...'}`}
        onBack={handleNavBack}
        showProgress={true}
        currentStep={
          phase === 'career_intro' ? 1 :
          phase === 'real_world' ? 2 :
          phase === 'simulation' ? 3 + currentScenarioIndex :
          phase === 'reflection' ? 3 + scenarios.length :
          4 + scenarios.length
        }
        totalSteps={4 + scenarios.length}
      />
      
      <div className="experience-content">
        {/* Career Introduction Phase */}
        {phase === 'career_intro' && content && (
          <div className="career-intro-phase">
            <AICharacterAvatar
              character={character}
              emotion="excited"
              size="large"
            />
            <div className="intro-content">
              <h2>Welcome to Your {career} Experience!</h2>
              <p>{content.careerIntro}</p>
              <div className="career-highlights">
                <h3>Today You'll:</h3>
                <ul>
                  <li>Experience real {career} challenges</li>
                  <li>Use professional tools and techniques</li>
                  <li>Apply {skill.name} in authentic scenarios</li>
                  <li>Think like a {career} professional</li>
                </ul>
              </div>
              <button 
                className="btn-primary"
                onClick={handleCareerIntroComplete}
              >
                Start Experience
              </button>
            </div>
          </div>
        )}
        
        {/* Real World Context Phase */}
        {phase === 'real_world' && content && (
          <div className="real-world-phase">
            <div className="real-world-content">
              <h2>Real-World Application</h2>
              <p className="context">{content.realWorldContext}</p>
              
              <div className="tools-showcase">
                <h3>Professional Tools</h3>
                <div className="tools-grid">
                  {getCareerTools(career).map((tool, idx) => (
                    <div key={idx} className="tool-card">
                      <span className="tool-icon">🛠️</span>
                      <span className="tool-name">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="skill-application">
                <h3>How {career}s Use {skill.name}</h3>
                <p>{skillAdaptationService.adaptSkill(
                  skill,
                  skill.subject || 'General',
                  { id: career.toLowerCase(), title: career } as any,
                  student.grade
                ).practiceContext}</p>
              </div>
              
              <button 
                className="btn-primary"
                onClick={handleRealWorldComplete}
              >
                Try It Yourself
              </button>
            </div>
          </div>
        )}
        
        {/* Simulation Phase */}
        {phase === 'simulation' && currentScenario && (
          <div className="simulation-phase">
            <div className="scenario-header">
              <h3>{currentScenario.title}</h3>
              <span className="scenario-progress">
                Scenario {currentScenarioIndex + 1} of {scenarios.length}
              </span>
              {/* XP Display removed - now shown in dock */}
            </div>
            
            <div className="scenario-context">
              <p className="scenario-description">{currentScenario.description}</p>
              <div className="real-world-example">
                <strong>Real Example:</strong> {currentScenario.realWorldExample}
              </div>
            </div>
            
            <div className="simulation-challenge">
              <QuestionRenderer
                question={currentScenario.challenge}
                onAnswer={handleSimulationAnswer}
                showResult={simulationResults[currentScenario.id] !== undefined}
                isCorrect={simulationResults[currentScenario.id]}
                disabled={simulationResults[currentScenario.id] !== undefined}
              />
            </div>
            
            {simulationResults[currentScenario.id] !== undefined && (
              <div className={`simulation-feedback ${simulationResults[currentScenario.id] ? 'success' : 'retry'}`}>
                <p>{companionMessage}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Reflection Phase */}
        {phase === 'reflection' && (
          <div className="reflection-phase">
            <AICharacterAvatar
              character={character}
              emotion="proud"
              size="large"
            />
            <div className="reflection-content">
              <h2>Experience Reflection</h2>
              <p>Let's review what you learned as a {career}!</p>
              
              <div className="metrics-summary">
                <h3>Your Performance</h3>
                <div className="metrics-grid">
                  <div className="metric">
                    <span className="metric-value">{experienceMetrics.problemsSolved}</span>
                    <span className="metric-label">Problems Solved</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">{experienceMetrics.toolsExplored}</span>
                    <span className="metric-label">Tools Explored</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">{experienceMetrics.engagementScore}%</span>
                    <span className="metric-label">Engagement</span>
                  </div>
                </div>
              </div>
              
              <div className="key-learnings">
                <h3>Key Takeaways</h3>
                <ul>
                  <li>You experienced how {career}s use {skill.name}</li>
                  <li>You solved real-world challenges</li>
                  <li>You used professional tools and methods</li>
                  <li>You're ready for more advanced challenges!</li>
                </ul>
              </div>
              
              <button 
                className="btn-primary"
                onClick={handleReflectionComplete}
              >
                Complete Experience
              </button>
            </div>
          </div>
        )}
        
        {/* Complete Phase */}
        {phase === 'complete' && (
          <div className="complete-phase">
            <AICharacterAvatar
              character={character}
              emotion="excited"
              size="large"
            />
            <div className="completion-content">
              <h2>Experience Complete!</h2>
              <p>You've successfully completed your {career} experience!</p>
              
              <div className="final-results">
                <p>Scenarios Completed: {Object.keys(simulationResults).length}/{scenarios.length}</p>
                <p>Success Rate: {
                  Math.round(
                    Object.values(simulationResults).filter(r => r).length / 
                    Math.max(1, Object.keys(simulationResults).length) * 100
                  )
                }%</p>
              </div>
              
              <button 
                className="btn-primary"
                onClick={handleNavNext}
              >
                Continue Journey
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Dock */}
      <FloatingLearningDock
        isOpen={true}
        onToggle={() => {}}
        character={character}
        onOpenChat={() => setIsChatOpen(true)}
        showHint={false}
      />
      
      {/* Chat Box */}
      {isChatOpen && (
        <CompanionChatBox
          character={character}
          onClose={() => setIsChatOpen(false)}
          initialMessage={companionMessage || content?.companionMessages?.[0]}
        />
      )}
    </div>
  );
};

export default AIExperienceContainerV2;