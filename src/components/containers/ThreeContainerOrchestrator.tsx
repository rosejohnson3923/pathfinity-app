// ================================================================
// THREE-CONTAINER ORCHESTRATOR
// Manages the complete Learn → Experience → Discover journey
// ================================================================

import React, { useState, useEffect } from 'react';
import { Sun, Moon, FastForward } from 'lucide-react';
import { AIThreeContainerOrchestrator } from './AIThreeContainerOrchestrator';
// Legacy containers kept for fallback
import LearnContainer from './LearnContainer';
import ExperienceContainer from './ExperienceContainer';
import DiscoverContainer from './DiscoverContainer';
import LearnMasterContainer from '../mastercontainers/LearnMasterContainer';
import ExperienceMasterContainer from '../mastercontainers/ExperienceMasterContainer';
import DiscoverMasterContainer from '../mastercontainers/DiscoverMasterContainer';
import TimeTracker from '../TimeTracker';
import SimpleParticlesBackground from '../SimpleParticlesBackground';
import { ContainerContentGenerator } from '../../utils/ContainerContentGenerators';
import { JourneyCacheManager } from '../../utils/JourneyCacheManager';
import { timeBudgetService } from '../../services/timeBudgetService';
import { CareerBadge } from '../../types/CareerTypes';
import { 
  MultiSubjectAssignment, 
  ContainerHandoff, 
  SkillMasteryJourney,
  StudentLearningProfile 
} from '../../types/LearningTypes';

interface ThreeContainerOrchestratorProps {
  assignment: MultiSubjectAssignment;
  studentName: string;
  gradeLevel: string;
  studentId: string;
  onComplete: (journeys: SkillMasteryJourney[], analytics: StudentLearningProfile) => void;
  onExit: () => void;
}

type ContainerPhase = 'learn' | 'experience' | 'discover' | 'complete';

export const ThreeContainerOrchestrator: React.FC<ThreeContainerOrchestratorProps> = ({
  assignment,
  studentName,
  gradeLevel,
  studentId,
  onComplete,
  onExit
}) => {
  // Use AI-first containers by default
  const useAIContainers = import.meta.env.VITE_USE_AI_CONTAINERS !== 'false';
  
  console.log(`🤖 ThreeContainerOrchestrator: Using ${useAIContainers ? 'AI-first' : 'legacy'} containers`);
  
  // If using AI containers, delegate to AI orchestrator
  if (useAIContainers) {
    return (
      <AIThreeContainerOrchestrator
        assignment={assignment}
        studentName={studentName}
        gradeLevel={gradeLevel}
        studentId={studentId}
        onComplete={onComplete}
        onExit={onExit}
      />
    );
  }
  
  // Legacy implementation below
  const [currentPhase, setCurrentPhase] = useState<ContainerPhase>('learn');
  const [learnHandoff, setLearnHandoff] = useState<ContainerHandoff | null>(null);
  const [experienceHandoff, setExperienceHandoff] = useState<ContainerHandoff | null>(null);
  const [completedJourneys, setCompletedJourneys] = useState<SkillMasteryJourney[]>([]);
  const [startTime] = useState(new Date());
  const [isPreGenerating, setIsPreGenerating] = useState(true); // Always show personalization screen
  const [preGenerationProgress, setPreGenerationProgress] = useState({ completed: 0, total: 0 });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showExtensionOffer, setShowExtensionOffer] = useState(false);
  const [justFinishedPersonalization, setJustFinishedPersonalization] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [careerBadge, setCareerBadge] = useState<CareerBadge | null>(null);
  const [isGeneratingExperienceDiscover, setIsGeneratingExperienceDiscover] = useState(false);
  
  // Track assessment results from all containers for comprehensive XP calculation
  const [allContainerResults, setAllContainerResults] = useState<{
    learn: AssessmentResults[];
    experience: AssessmentResults[];
    discover: AssessmentResults[];
  }>({
    learn: [],
    experience: [],
    discover: []
  });
  const [contentGenerator] = useState(() => {
    const apiKey = import.meta.env.VITE_AZURE_GPT4_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key') || '';
    return new ContainerContentGenerator(apiKey);
  });
  const [journeyCacheManager] = useState(() => new JourneyCacheManager(contentGenerator));
  const [journeyCache, setJourneyCache] = useState<any>(null);

  // Handle Finn personalization screen logic and Learn phase caching
  useEffect(() => {
    const cacheLearnPhase = async () => {
      if (isPreGenerating) {
        try {
          console.log('🎯 Starting Learn phase caching...');
          const learnMasterContainer = await journeyCacheManager.cacheLearnPhase(
            assignment,
            studentName,
            gradeLevel,
            (step, progress) => {
              console.log(`📦 ${step} - ${progress}%`);
              setPreGenerationProgress({ completed: progress, total: 100 });
            }
          );
          
          // Create partial journey cache with only Learn phase
          const partialJourneyCache = {
            studentName,
            gradeLevel,
            assignment,
            learnMasterContainer,
            experienceMasterContainer: null,
            discoverMasterContainer: null,
            cacheTimestamp: new Date(),
            isFullyCached: false
          };
          
          setJourneyCache(partialJourneyCache);
          console.log('✅ Learn phase cached!');
          
          // Show personalization for remaining time
          setTimeout(() => {
            setIsPreGenerating(false);
            setJustFinishedPersonalization(true);
          }, 2000); // Additional 2 seconds for "personalization"
          
        } catch (error) {
          console.error('❌ Learn phase caching failed:', error);
          // Fallback to old containers
          setTimeout(() => {
            setIsPreGenerating(false);
            setJustFinishedPersonalization(true);
          }, 5000);
        }
      }
    };

    cacheLearnPhase();
  }, [isPreGenerating, assignment, studentName, gradeLevel, journeyCacheManager]);

  // Reset the justFinishedPersonalization flag after a short delay
  useEffect(() => {
    if (justFinishedPersonalization) {
      const timer = setTimeout(() => {
        setJustFinishedPersonalization(false);
      }, 1000); // Reset after 1 second
      return () => clearTimeout(timer);
    }
  }, [justFinishedPersonalization]);

  // Start learning session when component mounts
  useEffect(() => {
    const startLearningSession = async () => {
      try {
        const { sessionId } = await timeBudgetService.startSession(
          studentId,
          currentPhase,
          assignment.id
        );
        setCurrentSessionId(sessionId);
        console.log(`📊 Started ${currentPhase} session: ${sessionId}`);
      } catch (error) {
        console.error('Error starting learning session:', error);
      }
    };

    if (!isPreGenerating && !currentSessionId) {
      startLearningSession();
    }
  }, [isPreGenerating, currentPhase, studentId, assignment.id, currentSessionId]);

  // Handle Skip to Experience (for testing)
  const handleSkipToExperience = () => {
    console.log('🚀 Skipping Learn container, jumping to Experience for testing');
    
    // Create mock learn results for testing
    const mockLearnHandoff: ContainerHandoff = {
      assignmentId: assignment.id,
      studentId: studentId,
      completedSkills: [
        {
          skill_number: 'A.1',
          subject: 'Math',
          correct: true,
          timeSpent: 300,
          attempts: 1
        },
        {
          skill_number: 'A.1', 
          subject: 'ELA',
          correct: true,
          timeSpent: 280,
          attempts: 1
        },
        {
          skill_number: 'A.1',
          subject: 'Science', 
          correct: true,
          timeSpent: 320,
          attempts: 1
        },
        {
          skill_number: 'A.1',
          subject: 'Social Studies',
          correct: true,
          timeSpent: 290,
          attempts: 1
        }
      ],
      skillsNeedingMastery: [],
      studentStrengths: ['Math', 'ELA', 'Science', 'Social Studies'],
      recommendedApproach: 'narrative',
      timeSpent: 1190,
      containerSource: 'learn',
      timestamp: new Date()
    };
    
    setLearnHandoff(mockLearnHandoff);
    setCurrentPhase('experience');
  };
  
  // Handle Learn Container completion
  const handleLearnComplete = async (handoff: ContainerHandoff) => {
    console.log('🎓 Learn container completed, transitioning to Experience with Career, Inc. lobby');
    console.log('Learn results:', handoff);
    
    // Store Learn container results
    setAllContainerResults(prev => ({
      ...prev,
      learn: handoff.completedSkills
    }));
    
    // End current session
    if (currentSessionId) {
      await timeBudgetService.endSession(studentId, currentSessionId);
      setCurrentSessionId(null);
    }
    
    // Store handoff data and transition directly to Experience
    setLearnHandoff(handoff);
    setCurrentPhase('experience');
  };

  // Handle career selection from Career, Inc. lobby (now happens within Experience phase)
  const handleCareerSelected = async (career: string, badge?: CareerBadge) => {
    console.log('🎯 Career selected from Experience phase:', career, 'Badge:', badge);
    setSelectedCareer(career);
    if (badge) {
      setCareerBadge(badge);
    }
    
    // Career selection now happens within the Experience phase
    // No phase transition needed
  };

  // Handle Experience Container completion
  const handleExperienceComplete = async (handoff: ContainerHandoff) => {
    console.log('💼 Experience container completed, transitioning to Discover');
    console.log('Experience results:', handoff);
    
    // Store Experience container results
    setAllContainerResults(prev => ({
      ...prev,
      experience: handoff.completedSkills
    }));
    
    // End current session and start new one
    if (currentSessionId) {
      await timeBudgetService.endSession(studentId, currentSessionId);
      setCurrentSessionId(null);
    }
    
    // Store handoff data and transition to Discover
    setExperienceHandoff(handoff);
    setCurrentPhase('discover');
  };

  // Handle Discover Container completion
  const handleDiscoverComplete = async (handoff: ContainerHandoff) => {
    console.log('📖 Discover container completed, analyzing complete learning journey');
    console.log('Final handoff:', handoff);
    
    // Store Discover container results
    const updatedResults = {
      learn: allContainerResults.learn,
      experience: allContainerResults.experience,
      discover: handoff.completedSkills
    };
    
    setAllContainerResults(updatedResults);
    
    console.log('📊 All container results:', updatedResults);
    
    // Build comprehensive journey data from all container results
    const skillMap = new Map<string, SkillMasteryJourney>();
    
    // Process results from all containers
    ['learn', 'experience', 'discover'].forEach(containerType => {
      const containerResults = updatedResults[containerType as keyof typeof updatedResults];
      
      containerResults.forEach((skill, skillIndex) => {
        const skillNumber = skill.skill_number;
        
        // Create a unique key that combines skill number and subject
        // For demo data with A.1, use position-based subject detection
        const subject = getSubjectFromSkillNumber(skillNumber, skill, skillIndex);
        const uniqueKey = `${skillNumber}-${subject}`;
        
        if (!skillMap.has(uniqueKey)) {
          // Create new journey entry
          skillMap.set(uniqueKey, {
            skill_number: uniqueKey, // Use unique key to differentiate subjects
            studentId: studentId,
            assignmentId: uniqueKey,
            masteryAchieved: false, // Will be updated below
            totalAttempts: 0,
            finalScore: 0,
            attempts: {}
          });
        }
        
        const journey = skillMap.get(uniqueKey)!;
        
        // Add this container's assessment result
        journey.attempts[containerType as 'learn' | 'experience' | 'discover'] = skill;
        
        // Update mastery and final score
        journey.totalAttempts += skill.attempts || 1;
        if (skill.score > journey.finalScore) {
          journey.finalScore = skill.score;
        }
        if (skill.correct && skill.score >= 80) {
          journey.masteryAchieved = true;
          if (!journey.firstCorrectContext) {
            journey.firstCorrectContext = containerType as 'learn' | 'experience' | 'discover';
          }
        }
      });
    });
    
    // Convert map to array
    const journeys: SkillMasteryJourney[] = Array.from(skillMap.values());
    
    // End current session - mark curriculum as complete
    if (currentSessionId) {
      const budget = await timeBudgetService.endSession(studentId, currentSessionId, true); // true = curriculum complete
      setCurrentSessionId(null);
      
      // Check if extension should be offered
      const extensionOpp = timeBudgetService.shouldOfferExtension(budget);
      if (extensionOpp.shouldOffer) {
        setShowExtensionOffer(true);
        setCompletedJourneys(journeys); // Store for later use
        return; // Don't complete yet, wait for extension decision
      }
    }
    
    // Analyze complete learning journey and generate analytics
    const analytics = generateLearningAnalytics(journeys);
    
    setCompletedJourneys(journeys);
    onComplete(journeys, analytics);
  };

  // Helper function to determine subject from skill number or context
  const getSubjectFromSkillNumber = (skillNumber: string, containerResults?: any, skillIndex?: number): string => {
    // Try to get subject from skill number patterns first
    if (skillNumber.includes('CC') || skillNumber.includes('NF') || skillNumber.includes('Math')) return 'Math';
    if (skillNumber.includes('PS') || skillNumber.includes('Science')) return 'Science';  
    if (skillNumber.includes('RL') || skillNumber.includes('ELA')) return 'ELA';
    if (skillNumber.includes('SS') || skillNumber.includes('Social') || skillNumber.includes('SocialStudies')) return 'Social Studies';
    
    // For demo data with skill_number 'A.1', use position-based detection
    if (skillNumber === 'A.1' && typeof skillIndex === 'number') {
      const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
      return subjects[skillIndex] || 'General';
    }
    
    return 'General';
  };

  // Calculate XP points to match the real-time step-by-step awards
  const calculateXP = (assessment: any, containerType: 'learn' | 'experience' | 'discover'): number => {
    if (!assessment || !assessment.score) return 0;

    const score = assessment.score;
    
    // Container-specific XP per step (matches Master Container logic exactly)
    const stepXP = {
      learn: { instruction: 10, practice: 15, assessment: 20 },
      experience: { instruction: 15, practice: 25, assessment: 30 },
      discover: { instruction: 20, practice: 35, assessment: 45 }
    };
    
    // Calculate XP for each step individually (like the real-time awards)
    const instructionXP = stepXP[containerType].instruction;
    const practiceXP = stepXP[containerType].practice;
    
    // Assessment XP with score-based multiplier (matches Master Container logic)
    let assessmentXP = stepXP[containerType].assessment;
    if (score >= 90) {
      assessmentXP = containerType === 'discover' ? 100 : containerType === 'experience' ? 75 : 50;
    } else if (score >= 80) {
      assessmentXP = containerType === 'discover' ? 85 : containerType === 'experience' ? 60 : 40;
    } else if (score >= 70) {
      assessmentXP = containerType === 'discover' ? 65 : containerType === 'experience' ? 45 : 30;
    } else {
      assessmentXP = containerType === 'discover' ? 45 : containerType === 'experience' ? 30 : 20;
    }
    
    // Total XP for completing all 3 steps of this skill in this container
    return instructionXP + practiceXP + assessmentXP;
  };

  // Generate comprehensive learning analytics from the complete journey
  const generateLearningAnalytics = (journeys: SkillMasteryJourney[]): StudentLearningProfile => {
    console.log('📊 Generating learning analytics for student:', studentId);
    
    // Calculate XP totals for each container and subject
    const xpData = {
      totalXP: 0,
      containerXP: { learn: 0, experience: 0, discover: 0 },
      subjectXP: {} as { [subject: string]: number }
    };
    
    journeys.forEach(journey => {
      // Calculate XP for each container attempt
      if (journey.attempts.learn) {
        const learnXP = calculateXP(journey.attempts.learn, 'learn');
        xpData.containerXP.learn += learnXP;
        xpData.totalXP += learnXP;
      }
      if (journey.attempts.experience) {
        const experienceXP = calculateXP(journey.attempts.experience, 'experience');
        xpData.containerXP.experience += experienceXP;
        xpData.totalXP += experienceXP;
      }
      if (journey.attempts.discover) {
        const discoverXP = calculateXP(journey.attempts.discover, 'discover');
        xpData.containerXP.discover += discoverXP;
        xpData.totalXP += discoverXP;
      }
      
      // Group XP by subject - extract subject from unique key (e.g., "A.1-Math" -> "Math")
      let subject = 'General';
      if (journey.skill_number.includes('-')) {
        // For unique keys like "A.1-Math", extract the subject part
        subject = journey.skill_number.split('-')[1] || 'General';
      } else {
        // For non-unique keys, use the helper function
        subject = getSubjectFromSkillNumber(journey.skill_number);
      }
      
      if (!xpData.subjectXP[subject]) {
        xpData.subjectXP[subject] = 0;
      }
      
      const skillTotalXP = (journey.attempts.learn ? calculateXP(journey.attempts.learn, 'learn') : 0) +
                          (journey.attempts.experience ? calculateXP(journey.attempts.experience, 'experience') : 0) +
                          (journey.attempts.discover ? calculateXP(journey.attempts.discover, 'discover') : 0);
      xpData.subjectXP[subject] += skillTotalXP;
    });
    
    // Analyze success patterns across contexts
    const learnSuccesses = journeys.filter(j => j.attempts.learn?.correct).length;
    const experienceSuccesses = journeys.filter(j => j.attempts.experience?.correct).length;
    const discoverSuccesses = journeys.filter(j => j.attempts.discover?.correct).length;
    
    const totalSkills = journeys.length;
    const learnSuccessRate = totalSkills > 0 ? learnSuccesses / totalSkills : 0;
    const experienceBreakthroughRate = totalSkills > 0 ? experienceSuccesses / totalSkills : 0;
    const discoverBreakthroughRate = totalSkills > 0 ? discoverSuccesses / totalSkills : 0;
    
    // Determine best learning context
    let bestContext: 'abstract' | 'applied' | 'narrative' = 'abstract';
    if (experienceBreakthroughRate > learnSuccessRate && experienceBreakthroughRate > discoverBreakthroughRate) {
      bestContext = 'applied';
    } else if (discoverBreakthroughRate > learnSuccessRate && discoverBreakthroughRate > experienceBreakthroughRate) {
      bestContext = 'narrative';
    }
    
    // Analyze subject-specific patterns
    const subjectPreferences: { [subject: string]: any } = {};
    
    // Group journeys by subject - using skill_number and checking for null/undefined
    const mathJourneys = journeys.filter(j => j.skill_number && (j.skill_number.includes('CC') || j.skill_number.includes('NF') || j.skill_number.includes('Math')));
    const scienceJourneys = journeys.filter(j => j.skill_number && (j.skill_number.includes('PS') || j.skill_number.includes('Science')));
    const elaJourneys = journeys.filter(j => j.skill_number && (j.skill_number.includes('RL') || j.skill_number.includes('ELA')));
    const socialStudiesJourneys = journeys.filter(j => j.skill_number && (j.skill_number.includes('SS') || j.skill_number.includes('Social') || j.skill_number.includes('SocialStudies')));
    
    // Analyze math preferences
    if (mathJourneys.length > 0) {
      const mathPreferredContext = determineMostSuccessfulContext(mathJourneys);
      const mathAvgAttempts = mathJourneys.reduce((sum, j) => sum + j.totalAttempts, 0) / mathJourneys.length;
      
      subjectPreferences['Math'] = {
        preferredContext: mathPreferredContext,
        averageAttempts: mathAvgAttempts,
        strengthAreas: mathJourneys.filter(j => j.masteryAchieved).map(j => j.skill_number),
        challengeAreas: mathJourneys.filter(j => !j.masteryAchieved).map(j => j.skill_number)
      };
    }
    
    // Analyze science preferences
    if (scienceJourneys.length > 0) {
      const sciencePreferredContext = determineMostSuccessfulContext(scienceJourneys);
      const scienceAvgAttempts = scienceJourneys.reduce((sum, j) => sum + j.totalAttempts, 0) / scienceJourneys.length;
      
      subjectPreferences['Science'] = {
        preferredContext: sciencePreferredContext,
        averageAttempts: scienceAvgAttempts,
        strengthAreas: scienceJourneys.filter(j => j.masteryAchieved).map(j => j.skill_number),
        challengeAreas: scienceJourneys.filter(j => !j.masteryAchieved).map(j => j.skill_number)
      };
    }
    
    // Analyze ELA preferences
    if (elaJourneys.length > 0) {
      const elaPreferredContext = determineMostSuccessfulContext(elaJourneys);
      const elaAvgAttempts = elaJourneys.reduce((sum, j) => sum + j.totalAttempts, 0) / elaJourneys.length;
      
      subjectPreferences['ELA'] = {
        preferredContext: elaPreferredContext,
        averageAttempts: elaAvgAttempts,
        strengthAreas: elaJourneys.filter(j => j.masteryAchieved).map(j => j.skill_number),
        challengeAreas: elaJourneys.filter(j => !j.masteryAchieved).map(j => j.skill_number)
      };
    }
    
    // Analyze Social Studies preferences
    if (socialStudiesJourneys.length > 0) {
      const socialStudiesPreferredContext = determineMostSuccessfulContext(socialStudiesJourneys);
      const socialStudiesAvgAttempts = socialStudiesJourneys.reduce((sum, j) => sum + j.totalAttempts, 0) / socialStudiesJourneys.length;
      
      subjectPreferences['Social Studies'] = {
        preferredContext: socialStudiesPreferredContext,
        averageAttempts: socialStudiesAvgAttempts,
        strengthAreas: socialStudiesJourneys.filter(j => j.masteryAchieved).map(j => j.skill_number),
        challengeAreas: socialStudiesJourneys.filter(j => !j.masteryAchieved).map(j => j.skill_number)
      };
    }
    
    // Create comprehensive learning profile
    const profile: StudentLearningProfile = {
      studentId,
      lastUpdated: new Date(),
      learningPatterns: {
        bestContext,
        needsRealWorld: experienceBreakthroughRate > 0.5,
        needsStoryContext: discoverBreakthroughRate > 0.5,
        abstractFirst: learnSuccessRate > 0.7,
        learnSuccessRate,
        experienceBreakthroughRate,
        discoverBreakthroughRate
      },
      subjectPreferences,
      skillHistory: journeys.reduce((history, journey) => {
        history[journey.skill_number] = journey;
        return history;
      }, {} as { [skill_number: string]: SkillMasteryJourney }),
      xpData
    };
    
    console.log('📈 Generated learning profile:', profile);
    return profile;
  };

  // Helper function to determine most successful context for a set of journeys
  const determineMostSuccessfulContext = (journeys: SkillMasteryJourney[]): 'abstract' | 'applied' | 'narrative' => {
    const learnSuccesses = journeys.filter(j => j.attempts.learn?.correct).length;
    const experienceSuccesses = journeys.filter(j => j.attempts.experience?.correct).length;
    const discoverSuccesses = journeys.filter(j => j.attempts.discover?.correct).length;
    
    if (experienceSuccesses >= learnSuccesses && experienceSuccesses >= discoverSuccesses) {
      return 'applied';
    } else if (discoverSuccesses >= learnSuccesses && discoverSuccesses >= experienceSuccesses) {
      return 'narrative';
    }
    return 'abstract';
  };

  // Handle extension offer response
  const handleExtensionResponse = async (acceptExtension: boolean) => {
    if (acceptExtension) {
      // Start extension session
      const { sessionId } = await timeBudgetService.startExtensionSession(
        studentId,
        'career-depth', // Default type, could be made configurable
        { studentInitiated: true }
      );
      setCurrentSessionId(sessionId);
      setShowExtensionOffer(false);
      
      // Could transition to extension learning mode here
      console.log('🚀 Extension session started:', sessionId);
      
      // For now, just complete the learning journey
      setTimeout(() => {
        handleExtensionComplete();
      }, 1000);
    } else {
      // Complete the learning journey
      setShowExtensionOffer(false);
      const analytics = generateLearningAnalytics(completedJourneys);
      onComplete(completedJourneys, analytics);
    }
  };

  // Handle extension completion
  const handleExtensionComplete = async () => {
    if (currentSessionId) {
      await timeBudgetService.endExtensionSession(
        studentId,
        currentSessionId,
        'completed',
        { engagementLevel: 'high', masteryGained: 2 }
      );
      setCurrentSessionId(null);
    }
    
    const analytics = generateLearningAnalytics(completedJourneys);
    onComplete(completedJourneys, analytics);
  };

  // Handle extension request from TimeTracker
  const handleExtensionRequest = () => {
    setShowExtensionOffer(true);
  };

  // Handle exit from any container
  const handleContainerExit = async () => {
    console.log('❌ User exited from container, phase:', currentPhase);
    
    // End current session if active
    if (currentSessionId) {
      await timeBudgetService.endSession(studentId, currentSessionId);
      setCurrentSessionId(null);
    }
    
    onExit();
  };

  // Show pre-generation progress while content is being prepared
  if (isPreGenerating) {
    const { completed, total } = preGenerationProgress;
    const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
        <SimpleParticlesBackground theme="learning" particleCount={60} />
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center max-w-md relative z-20 shadow-2xl">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              <span className="text-2xl mr-2">🎯</span> Finn is personalizing your learning adventure...
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              Crafting lessons perfectly tailored to {studentName}'s learning style and grade level
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              Every lesson is unique and built just for you! <span className="text-lg">✨</span>
            </p>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {progressPercentage > 0 ? `${Math.round(progressPercentage)}% complete` : 'Starting...'}
          </p>
        </div>
      </div>
    );
  }

  // Show Experience/Discover caching screen
  if (isGeneratingExperienceDiscover) {
    const { completed, total } = preGenerationProgress;
    const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900/90 dark:to-cyan-900/90 flex items-center justify-center relative overflow-hidden">
        <SimpleParticlesBackground theme="experience" particleCount={80} />
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center max-w-md relative z-20 shadow-2xl">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              <span className="text-2xl mr-2">🎭</span> Finn is preparing your {selectedCareer} adventure...
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              Creating personalized career scenarios and story adventures based on your choice!
            </p>
            <p className="text-blue-600 dark:text-cyan-400 text-sm font-medium">
              Your {selectedCareer} journey awaits! <span className="text-lg">🚀</span>
            </p>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {progressPercentage > 0 ? `${Math.round(progressPercentage)}% complete` : 'Preparing...'}
          </p>
        </div>
      </div>
    );
  }

  // Render current container based on phase
  if (currentPhase === 'learn') {
    // Use new Master Container if journey is cached
    if (journeyCache && journeyCache.learnMasterContainer) {
      console.log('🎯 Using LearnMasterContainer with cached data');
      return (
        <>
          <LearnMasterContainer
            masterContainerData={journeyCache.learnMasterContainer}
            onComplete={handleLearnComplete}
            onExit={handleContainerExit}
            skipLoadingScreen={justFinishedPersonalization}
          />
          <TimeTracker 
            studentId={studentId}
            onExtensionRequest={handleExtensionRequest}
            variant="compact"
          />
          
          {/* Skip to Experience Button (Testing) */}
          <button
            onClick={handleSkipToExperience}
            className="fixed top-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105"
            title="Skip to Experience Container (Testing)"
          >
            <FastForward className="w-4 h-4" />
            <span className="hidden sm:inline">Skip to Experience</span>
          </button>
        </>
      );
    }
    
    console.log('❌ Falling back to old LearnContainer - journey cache not available:', {
      hasJourneyCache: !!journeyCache,
      hasLearnMasterContainer: !!journeyCache?.learnMasterContainer
    });
    
    // Fallback to old container if cache failed
    return (
      <>
        <LearnContainer
          assignment={assignment}
          studentName={studentName}
          gradeLevel={gradeLevel}
          contentGenerator={contentGenerator}
          onComplete={handleLearnComplete}
          onExit={handleContainerExit}
          skipLoadingScreen={justFinishedPersonalization}
        />
        <TimeTracker 
          studentId={studentId}
          onExtensionRequest={handleExtensionRequest}
          variant="compact"
        />
        
        {/* Skip to Experience Button (Testing) */}
        <button
          onClick={handleSkipToExperience}
          className="fixed top-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105"
          title="Skip to Experience Container (Testing)"
        >
          <FastForward className="w-4 h-4" />
          <span className="hidden sm:inline">Skip to Experience</span>
        </button>
      </>
    );
  }


  if (currentPhase === 'experience' && learnHandoff) {
    // Generate simple Experience Master Container data from Learn results
    const experienceMasterContainer = {
      subjectCards: learnHandoff.completedSkills.map((skill, index) => ({
        subject: skill.subject || 'General',
        assignments: [{
          skill: {
            skill_number: skill.skill_number,
            skillCode: skill.skill_number,
            skillName: `Apply ${skill.subject || 'General'} Skills`,
            subject: skill.subject || 'General',
            gradeLevel: gradeLevel
          },
          title: `${skill.subject || 'General'} Career Application`,
          steps: {
            instruction: {
              title: `Welcome to Your Career Role!`,
              content: `Apply your ${skill.subject || 'General'} skills in a professional setting.`
            },
            practice: {
              scenarios: []
            },
            assessment: {
              question: `How would you apply ${skill.subject || 'General'} skills in your career?`,
              options: [
                'Use systematic problem-solving methods',
                'Skip analysis and jump to solutions',  
                'Ask others to solve it instead',
                'Use trial and error without planning'
              ],
              correctAnswer: 'Use systematic problem-solving methods'
            }
          }
        }]
      })),
      metadata: {
        studentName,
        gradeLevel,
        totalSubjects: learnHandoff.completedSkills.length,
        totalAssignments: learnHandoff.completedSkills.length,
        createdAt: new Date()
      }
    };

    return (
      <>
        <ExperienceMasterContainer
          masterContainerData={experienceMasterContainer}
          onComplete={handleExperienceComplete}
          onExit={handleContainerExit}
          skipLoadingScreen={false}
          originalLearnResults={learnHandoff.completedSkills}
        />
        <TimeTracker 
          studentId={studentId}
          onExtensionRequest={handleExtensionRequest}
          variant="compact"
        />
      </>
    );
  }

  if (currentPhase === 'discover' && experienceHandoff) {
    // Use cached Discover Master Container if available
    if (journeyCache && journeyCache.discoverMasterContainer) {
      console.log('🎯 Using cached Discover Master Container');
      return (
        <>
          <DiscoverMasterContainer
            masterContainerData={journeyCache.discoverMasterContainer}
            onComplete={handleDiscoverComplete}
            onExit={handleContainerExit}
            skipLoadingScreen={true} // Skip loading since content is already cached
          />
          <TimeTracker 
            studentId={studentId}
            onExtensionRequest={handleExtensionRequest}
            variant="compact"
          />
        </>
      );
    }
    
    // Fallback to old container
    return (
      <>
        <DiscoverContainer
          experienceHandoff={experienceHandoff}
          studentName={studentName}
          gradeLevel={gradeLevel}
          onComplete={handleDiscoverComplete}
          onExit={handleContainerExit}
        />
        <TimeTracker 
          studentId={studentId}
          onExtensionRequest={handleExtensionRequest}
          variant="compact"
        />
      </>
    );
  }

  // Show extension offer modal
  if (showExtensionOffer) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <SimpleParticlesBackground theme="general" particleCount={60} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center max-w-md mx-4 relative z-10 shadow-2xl">
            <div className="mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                <span className="text-3xl mr-2">🎉</span> Amazing Work, {studentName}!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You've completed your 4-hour learning goal! You're showing incredible dedication to learning.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Would you like to continue your adventure and explore even deeper into your favorite subjects?
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleExtensionResponse(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-xl mr-2">🚀</span> Yes! Let's Keep Learning!
              </button>
              
              <button
                onClick={() => handleExtensionResponse(false)}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <span className="text-xl mr-2">📚</span> I'm Ready to Finish for Today
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Either choice is perfect! You've already accomplished so much today.
            </p>
          </div>
        </div>
        <TimeTracker 
          studentId={studentId}
          onExtensionRequest={handleExtensionRequest}
          variant="compact"
        />
      </>
    );
  }

  // Fallback - shouldn't happen in normal flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SimpleParticlesBackground theme="general" particleCount={60} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center relative z-10 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Loading Learning Adventure...
        </h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default ThreeContainerOrchestrator;