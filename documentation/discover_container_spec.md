# DISCOVER Container - Technical Specification

## Architecture Overview

### Container Flow
```
ExperienceContainer (completed)
    ↓ [experienceResults handoff]
DiscoverContainer
    ├── NarrativeIntroCard (story setup with career context)
    ├── NarrativeStoryCard (interactive story with embedded questions)
    ├── NarrativeFeedbackCard (immediate response to answers)
    └── DiscoverProgressTracker (XP, badges, streaks)
        ↓ [completion trigger]
NextLearnContainer (advanced skill or new topic)
```

## Component Specifications

### 1. DiscoverContainer
**File:** `components/discover/DiscoverContainer.jsx`

```javascript
const DiscoverContainer = ({ 
  studentId, 
  experienceResults, // from completed ExperienceContainer (includes multi-subject data)
  onComplete // callback to trigger next learning cycle
}) => {
  const [currentPhase, setCurrentPhase] = useState('loading'); // 'loading' | 'intro' | 'story' | 'feedback' | 'complete'
  const [narrativeData, setNarrativeData] = useState(null);
  const [storyProgress, setStoryProgress] = useState({});
  const [studentAnswers, setStudentAnswers] = useState([]);
  
  useEffect(() => {
    const initializeNarrative = async () => {
      const careerProfile = await getCareerAnalytics(studentId);
      const narrative = await generateMultiSubjectPersonalizedNarrative(
        studentId, 
        experienceResults, 
        careerProfile
      );
      setNarrativeData(narrative);
      setCurrentPhase('intro');
    };
    initializeNarrative();
  }, [studentId, experienceResults]);

  return (
    <div className="discover-container">
      {currentPhase === 'loading' && (
        <NarrativeLoadingCard />
      )}
      
      {currentPhase === 'intro' && (
        <NarrativeIntroCard 
          narrative={narrativeData}
          experienceContext={experienceResults.careerData}
          multiSubjectContext={experienceResults.subjectsApplied}
          onStart={() => setCurrentPhase('story')}
        />
      )}
      
      {currentPhase === 'story' && (
        <NarrativeStoryCard 
          narrative={narrativeData}
          onAnswerSubmitted={(answer) => {
            setStudentAnswers([...studentAnswers, answer]);
            // Real-time feedback without interrupting story flow
            trackMultiSubjectAnswerAnalytics(studentId, answer, experienceResults);
          }}
          onStoryComplete={() => setCurrentPhase('feedback')}
        />
      )}
      
      {currentPhase === 'feedback' && (
        <NarrativeFeedbackCard 
          narrative={narrativeData}
          studentAnswers={studentAnswers}
          experienceContext={experienceResults}
          onComplete={(results) => {
            trackComprehensiveDiscoverSession(studentId, results, experienceResults);
            onComplete(results);
          }}
        />
      )}
      
      <DiscoverProgressTracker 
        studentId={studentId}
        currentSession={narrativeData}
        visible={currentPhase !== 'loading'}
      />
    </div>
  );
};
```

### 2. Multi-Subject Personalized Narrative Generation
**File:** `services/narrativeGenerationService.js`

```javascript
export const generateMultiSubjectPersonalizedNarrative = async (studentId, experienceResults, careerProfile) => {
  const personalizationContext = {
    // From LEARN phase (multi-subject)
    allSkillsLearned: experienceResults.fromLearnSession.skillsCompleted,
    subjectsCompleted: experienceResults.fromLearnSession.subjectsCompleted,
    overallMasteryLevel: experienceResults.fromLearnSession.overallMastery,
    strongestSubject: experienceResults.fromLearnSession.strongestSubject,
    
    // From EXPERIENCE phase
    recentCareer: experienceResults.careerData.career,
    careerDepartment: experienceResults.careerData.department,
    skillsAppliedInCareer: experienceResults.skillReinforcement.multiSubjectApplications,
    crossSubjectSuccess: experienceResults.skillReinforcement.crossSubjectTransferSuccess,
    
    // From Career Analytics
    primaryCareerAffinity: careerProfile.topAffinities[0],
    narrativeComplexity: calculateNarrativeComplexity(careerProfile),
    studentGrade: careerProfile.gradeLevel
  };
  
  // Select narrative template that can integrate multiple subjects
  const template = await selectMultiSubjectNarrativeTemplate(personalizationContext);
  
  // Generate personalized content that weaves together all learned skills
  const personalizedNarrative = await personalizeMultiSubjectNarrativeContent(template, personalizationContext);
  
  return {
    id: generateNarrativeId(studentId),
    template: template,
    personalization: personalizationContext,
    story: personalizedNarrative.story,
    questions: personalizedNarrative.questions,
    characters: personalizedNarrative.characters,
    settings: personalizedNarrative.settings,
    careerConnections: personalizedNarrative.careerConnections,
    subjectIntegration: personalizedNarrative.subjectIntegration
  };
};

export const selectMultiSubjectNarrativeTemplate = async (context) => {
  // Select templates that can meaningfully integrate multiple subjects
  const multiSubjectNarrativeMap = {
    // Templates that combine Math + Science + ELA
    'math-science-ela': [
      'environmental-scientist-adventure',
      'chef-recipe-scientist-mystery', 
      'architect-building-challenge',
      'veterinarian-animal-rescue'
    ],
    
    // Templates that combine ELA + Social Studies + Science
    'ela-social-science': [
      'journalist-environmental-investigation',
      'teacher-community-project',
      'park-ranger-conservation-story'
    ],
    
    // Templates that combine Math + Social Studies + ELA
    'math-social-ela': [
      'business-owner-community-challenge',
      'city-planner-development-story',
      'economist-town-budget-crisis'
    ],
    
    // Universal templates that can adapt to any subject combination
    'universal': [
      'mystery-solving-adventure',
      'time-travel-learning-quest',
      'superhero-knowledge-mission'
    ]
  };
  
  // Determine subject combination
  const subjectCombination = determineSubjectCombination(context.subjectsCompleted);
  
  // Select appropriate template
  const availableTemplates = multiSubjectNarrativeMap[subjectCombination] || multiSubjectNarrativeMap['universal'];
  const selectedTheme = selectRandomTheme(availableTemplates);
  
  const template = await getNarrativeTemplate({
    theme: selectedTheme,
    subjectsToIntegrate: context.subjectsCompleted,
    careerContext: context.recentCareer,
    gradeLevel: context.studentGrade,
    complexity: context.narrativeComplexity
  });
  
  return template;
};

export const personalizeMultiSubjectNarrativeContent = async (template, context) => {
  // Create story sections that naturally integrate all learned subjects
  const storySections = await generateIntegratedStorySections(template, context);
  
  // Generate questions that test skills from different subjects
  const integratedQuestions = await generateCrossSubjectQuestions(context.allSkillsLearned, context.recentCareer);
  
  // Create characters that represent different career connections
  const characters = await generateCareerConnectedCharacters(context.recentCareer, context.allSkillsLearned);
  
  return {
    story: {
      title: template.title,
      theme: template.theme,
      sections: storySections
    },
    questions: integratedQuestions,
    characters: characters,
    settings: template.settings,
    careerConnections: {
      primary: context.recentCareer,
      skillApplications: context.skillsAppliedInCareer,
      realWorldRelevance: generateRealWorldConnections(context)
    },
    subjectIntegration: {
      subjectsIncluded: context.subjectsCompleted,
      crossSubjectConnections: identifyCrossSubjectConnections(context.allSkillsLearned),
      skillTransferOpportunities: generateSkillTransferMoments(context)
    }
  };
};

export const selectNarrativeTemplate = async (context) => {
  // Career-based narrative selection
  const careerNarrativeMap = {
    // Food service careers
    'chef': ['cooking-adventure', 'restaurant-mystery', 'recipe-rescue'],
    'nutritionist': ['healthy-eating-quest', 'meal-planning-challenge'],
    
    // Creative careers  
    'content-creator': ['viral-video-mystery', 'social-media-adventure'],
    'artist': ['art-gallery-heist', 'creativity-challenge'],
    'photographer': ['photo-scavenger-hunt', 'wildlife-expedition'],
    
    // Technology careers
    'software-engineer': ['code-debugging-mystery', 'app-development-adventure'],
    'game-designer': ['virtual-world-creation', 'gameplay-balance-challenge'],
    
    // Business careers
    'accountant': ['financial-mystery', 'budget-rescue-mission'],
    'marketing-director': ['brand-crisis-management', 'campaign-creation-challenge']
  };
  
  const availableTemplates = careerNarrativeMap[context.recentCareer] || ['general-problem-solving'];
  
  // Select template based on skill and grade level
  const template = await getNarrativeTemplate({
    theme: selectRandomTheme(availableTemplates),
    skillArea: context.skill,
    gradeLevel: context.studentGrade,
    complexity: context.narrativeComplexity
  });
  
  return template;
};
```

### 3. NarrativeStoryCard (Interactive Story Component)
**File:** `components/discover/NarrativeStoryCard.jsx`

```javascript
const NarrativeStoryCard = ({ narrative, onAnswerSubmitted, onStoryComplete }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [storyState, setStoryState] = useState({
    charactersIntroduced: [],
    plotPoints: [],
    questionsAnswered: 0
  });
  
  const currentStorySection = narrative.story.sections[currentSection];
  const embeddedQuestion = currentStorySection.question;
  
  const handleAnswerSubmit = (answer) => {
    const answerData = {
      questionId: embeddedQuestion.id,
      selectedAnswer: answer,
      isCorrect: answer.isCorrect,
      timestamp: new Date().toISOString(),
      timeSpent: getTimeOnQuestion(),
      storyContext: {
        section: currentSection,
        character: currentStorySection.activeCharacter,
        plotPoint: currentStorySection.plotPoint
      }
    };
    
    onAnswerSubmitted(answerData);
    
    // Provide immediate contextual feedback
    setStoryState({
      ...storyState,
      questionsAnswered: storyState.questionsAnswered + 1
    });
    
    // Continue story flow
    setTimeout(() => {
      if (currentSection < narrative.story.sections.length - 1) {
        setCurrentSection(currentSection + 1);
      } else {
        onStoryComplete();
      }
    }, 2000); // Brief pause for feedback absorption
  };

  return (
    <div className="narrative-story-card">
      <StoryHeader 
        title={narrative.story.title}
        progress={(currentSection + 1) / narrative.story.sections.length}
        careerConnection={narrative.careerConnections.current}
      />
      
      <StoryContent 
        section={currentStorySection}
        characters={narrative.characters}
        setting={narrative.settings.current}
      />
      
      {embeddedQuestion && (
        <EmbeddedQuestion 
          question={embeddedQuestion}
          onSubmit={handleAnswerSubmit}
          storyContext={currentStorySection.context}
          skillHint={narrative.careerConnections.skillApplication}
        />
      )}
      
      <FinnNarrativeGuide 
        message={generateContextualHint(currentStorySection, narrative.careerConnections)}
        tone="story-guide"
      />
    </div>
  );
};
```

### 4. Career-Connected Question Generation
**File:** `services/questionGenerationService.js`

```javascript
export const generateCareerConnectedQuestions = (skill, careerContext, gradeLevel) => {
  const questionTemplates = {
    'adding-fractions-like-denominators': {
      'chef': [
        {
          context: "Chef Maya needs to combine ingredients for her famous soup",
          question: "She has 2/8 cup of carrots and 3/8 cup of celery. How much vegetables total?",
          answers: [
            { text: "5/8 cup", isCorrect: true, feedback: "Perfect! You helped Maya measure her vegetables correctly!" },
            { text: "5/16 cup", isCorrect: false, feedback: "Remember, when denominators are the same, just add the numerators!" },
            { text: "2/3 cup", isCorrect: false, feedback: "Check your addition - 2 + 3 = ?" }
          ],
          careerConnection: "Chefs use fractions every day when measuring ingredients and scaling recipes!"
        }
      ],
      'content-creator': [
        {
          context: "Alex is editing a video and needs to time the segments perfectly",
          question: "The intro is 1/4 minute and the main content is 2/4 minute. What's the total time?",
          answers: [
            { text: "3/4 minute", isCorrect: true, feedback: "Excellent! Your video timing skills helped Alex!" },
            { text: "3/8 minute", isCorrect: false, feedback: "When denominators match, add the numerators: 1 + 2 = 3" },
            { text: "1/2 minute", isCorrect: false, feedback: "Double-check: 1/4 + 2/4 = ?" }
          ],
          careerConnection: "Content creators constantly work with time segments and need precise measurements!"
        }
      ],
      'firefighter': [
        {
          context: "Captain Johnson is checking water pressure in different hoses",
          question: "Hose A has 2/10 pressure and Hose B has 5/10 pressure. What's the combined pressure?",
          answers: [
            { text: "7/10 pressure", isCorrect: true, feedback: "Great work! You helped ensure the fire equipment is ready!" },
            { text: "7/20 pressure", isCorrect: false, feedback: "Same denominators mean we just add the tops: 2 + 5 = 7" },
            { text: "3/5 pressure", isCorrect: false, feedback: "Keep the denominator as 10: 2/10 + 5/10 = ?" }
          ],
          careerConnection: "Firefighters need to understand measurements for water pressure, chemical mixtures, and equipment!"
        }
      ]
    }
  };
  
  const skillQuestions = questionTemplates[skill] || {};
  const careerQuestions = skillQuestions[careerContext] || skillQuestions['general'] || [];
  
  return selectQuestionsByGrade(careerQuestions, gradeLevel);
};
```

### 5. Real-Time Analytics and Feedback
**File:** `services/discoverAnalytics.js`

```javascript
export const trackAnswerAnalytics = async (studentId, answerData) => {
  const analyticsEvent = {
    studentId,
    sessionId: answerData.sessionId,
    questionId: answerData.questionId,
    timestamp: answerData.timestamp,
    response: {
      selectedAnswer: answerData.selectedAnswer.text,
      isCorrect: answerData.isCorrect,
      timeSpent: answerData.timeSpent,
      hintsUsed: answerData.hintsUsed || 0
    },
    storyContext: {
      narrativeTheme: answerData.storyContext.theme,
      character: answerData.storyContext.character,
      plotPoint: answerData.storyContext.plotPoint,
      careerConnection: answerData.storyContext.careerConnection
    },
    skill: {
      area: answerData.skill.area,
      subArea: answerData.skill.subArea,
      difficulty: answerData.skill.difficulty
    }
  };
  
  // Store event for analytics
  await storeDiscoverEvent(analyticsEvent);
  
  // Update real-time progress
  await updateDiscoverProgress(studentId, analyticsEvent);
  
  // Calculate XP and badge progress
  await calculateDiscoverRewards(studentId, analyticsEvent);
};

export const updateDiscoverProgress = async (studentId, analyticsEvent) => {
  const progress = await getDiscoverProgress(studentId);
  
  // Update skill-specific progress
  const skill = analyticsEvent.skill.area;
  if (!progress.skillMastery[skill]) {
    progress.skillMastery[skill] = {
      questionsAnswered: 0,
      correctAnswers: 0,
      averageTime: 0,
      narrativeContexts: []
    };
  }
  
  progress.skillMastery[skill].questionsAnswered += 1;
  if (analyticsEvent.response.isCorrect) {
    progress.skillMastery[skill].correctAnswers += 1;
  }
  
  // Track narrative engagement
  progress.narrativeEngagement.push({
    theme: analyticsEvent.storyContext.narrativeTheme,
    character: analyticsEvent.storyContext.character,
    engagement: calculateEngagementScore(analyticsEvent),
    timestamp: analyticsEvent.timestamp
  });
  
  // Update streaks
  if (analyticsEvent.response.isCorrect) {
    progress.currentStreak += 1;
    progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
  } else {
    progress.currentStreak = 0;
  }
  
  await saveDiscoverProgress(studentId, progress);
};
```

### 6. XP and Badge System
**File:** `services/discoverRewardSystem.js`

```javascript
export const calculateDiscoverRewards = async (studentId, analyticsEvent) => {
  const rewards = {
    xpEarned: 0,
    badgesUnlocked: [],
    achievements: []
  };
  
  // Base XP calculation
  if (analyticsEvent.response.isCorrect) {
    rewards.xpEarned += 10; // Base correct answer XP
    
    // Speed bonus
    if (analyticsEvent.response.timeSpent < 30) {
      rewards.xpEarned += 5; // Quick thinking bonus
    }
    
    // Streak bonus
    const progress = await getDiscoverProgress(studentId);
    if (progress.currentStreak >= 5) {
      rewards.xpEarned += progress.currentStreak * 2; // Streak multiplier
    }
  }
  
  // Career connection bonus
  if (analyticsEvent.storyContext.careerConnection) {
    rewards.xpEarned += 3; // Career application bonus
  }
  
  // Check for badge unlocks
  const newBadges = await checkBadgeUnlocks(studentId, analyticsEvent);
  rewards.badgesUnlocked = newBadges;
  
  // Apply rewards
  await applyDiscoverRewards(studentId, rewards);
  
  return rewards;
};

export const checkBadgeUnlocks = async (studentId, analyticsEvent) => {
  const progress = await getDiscoverProgress(studentId);
  const newBadges = [];
  
  // Skill mastery badges
  const skill = analyticsEvent.skill.area;
  const skillProgress = progress.skillMastery[skill];
  const accuracy = skillProgress.correctAnswers / skillProgress.questionsAnswered;
  
  if (accuracy >= 0.9 && skillProgress.questionsAnswered >= 10) {
    if (!progress.badges.includes(`${skill}-master`)) {
      newBadges.push({
        id: `${skill}-master`,
        name: `${skill} Master`,
        description: `Achieved 90%+ accuracy in ${skill} with 10+ questions`,
        icon: '🏆',
        rarity: 'gold'
      });
    }
  }
  
  // Narrative engagement badges
  const uniqueThemes = [...new Set(progress.narrativeEngagement.map(n => n.theme))];
  if (uniqueThemes.length >= 5) {
    if (!progress.badges.includes('story-explorer')) {
      newBadges.push({
        id: 'story-explorer',
        name: 'Story Explorer',
        description: 'Experienced 5 different narrative themes',
        icon: '📚',
        rarity: 'silver'
      });
    }
  }
  
  // Career connection badges
  const careerContexts = progress.narrativeEngagement
    .filter(n => n.careerConnection)
    .length;
  
  if (careerContexts >= 20) {
    if (!progress.badges.includes('career-connector')) {
      newBadges.push({
        id: 'career-connector',
        name: 'Career Connector',
        description: 'Applied skills in 20+ career contexts',
        icon: '🔗',
        rarity: 'platinum'
      });
    }
  }
  
  return newBadges;
};
```

### 7. Handoff to Next Learning Cycle
**File:** `services/learningCycleService.js`

```javascript
export const completeDiscoverPhase = async (studentId, discoverResults) => {
  // Compile complete learning cycle data
  const completeCycleData = {
    studentId,
    cycleId: generateCycleId(),
    completionTimestamp: new Date().toISOString(),
    
    // LEARN phase data
    learnResults: discoverResults.fromLearnSession,
    
    // EXPERIENCE phase data  
    experienceResults: discoverResults.fromExperienceSession,
    
    // DISCOVER phase data
    discoverResults: {
      narrativeTheme: discoverResults.narrative.theme,
      questionsAnswered: discoverResults.questions.length,
      correctAnswers: discoverResults.questions.filter(q => q.isCorrect).length,
      totalTimeSpent: discoverResults.totalTime,
      engagementLevel: discoverResults.engagementMetrics.level,
      storyConnection: discoverResults.storyConnectionStrength,
      xpEarned: discoverResults.rewards.xpEarned,
      badgesUnlocked: discoverResults.rewards.badgesUnlocked
    },
    
    // Overall cycle analytics
    overallMastery: calculateOverallMastery(discoverResults),
    skillTransferSuccess: evaluateSkillTransfer(discoverResults),
    careerEngagement: evaluateCareerEngagement(discoverResults),
    readyForAdvancement: determineAdvancementReadiness(discoverResults)
  };
  
  // Store complete cycle data
  await storeLearningCycle(completeCycleData);
  
  // Generate next learning recommendation
  const nextRecommendation = await generateNextLearningPath(studentId, completeCycleData);
  
  return {
    cycleComplete: true,
    cycleData: completeCycleData,
    nextRecommendation: nextRecommendation
  };
};

export const generateNextLearningPath = async (studentId, cycleData) => {
  const careerProfile = await getCareerAnalytics(studentId);
  const skillProgression = await getSkillProgression(studentId);
  
  // Determine next skill based on performance and progression
  let nextSkill;
  if (cycleData.overallMastery >= 85) {
    // Advance to next skill in sequence
    nextSkill = getNextSkillInSequence(cycleData.learnResults.skill);
  } else {
    // Reinforce current skill with different approach
    nextSkill = generateReinforcementVariation(cycleData.learnResults.skill);
  }
  
  // Suggest career context based on demonstrated interests
  const suggestedCareerContext = {
    department: careerProfile.topAffinities[0]?.department,
    career: careerProfile.topAffinities[0]?.career,
    reason: `High engagement in ${careerProfile.topAffinities[0]?.career} activities`
  };
  
  // Suggest narrative theme for continuity
  const suggestedNarrativeTheme = generateContinuityTheme(
    cycleData.discoverResults.narrativeTheme,
    careerProfile.primaryInterests
  );
  
  return {
    nextSkill: nextSkill,
    suggestedCareerContext: suggestedCareerContext,
    suggestedNarrativeTheme: suggestedNarrativeTheme,
    difficultyAdjustment: calculateDifficultyAdjustment(cycleData),
    personalizedElements: generatePersonalizedElements(studentId, careerProfile)
  };
};
```

### 8. Data Models

#### Narrative Data Schema
```javascript
const narrativeSchema = {
  id: 'string', // UUID
  templateId: 'string',
  studentId: 'string',
  personalizationContext: {
    skill: 'string',
    recentCareer: 'string',
    careerDepartment: 'string',
    gradeLevel: 'number',
    complexity: 'beginner' | 'intermediate' | 'advanced'
  },
  story: {
    title: 'string',
    theme: 'string',
    sections: [{
      id: 'string',
      content: 'string',
      activeCharacter: 'string',
      plotPoint: 'string',
      question: {
        id: 'string',
        text: 'string',
        answers: [{
          text: 'string',
          isCorrect: 'boolean',
          feedback: 'string'
        }],
        skillConnection: 'string',
        careerConnection: 'string'
      }
    }]
  },
  characters: [{
    id: 'string',
    name: 'string',
    role: 'string',
    careerConnection: 'string'
  }],
  settings: {
    primary: 'string',
    description: 'string',
    careerRelevance: 'string'
  },
  careerConnections: {
    primary: 'string',
    skillApplication: 'string',
    realWorldRelevance: 'string'
  }
};
```

#### Discover Progress Schema
```javascript
const discoverProgressSchema = {
  studentId: 'string',
  totalXP: 'number',
  currentStreak: 'number',
  longestStreak: 'number',
  badges: ['string'], // array of badge IDs
  skillMastery: {
    [skillArea]: {
      questionsAnswered: 'number',
      correctAnswers: 'number',
      averageTime: 'number',
      narrativeContexts: ['string'],
      masteryLevel: 'beginner' | 'developing' | 'proficient' | 'advanced'
    }
  },
  narrativeEngagement: [{
    theme: 'string',
    character: 'string',
    engagement: 'number', // 0-100
    careerConnection: 'string',
    timestamp: 'ISO-8601'
  }],
  recentAchievements: [{
    type: 'xp' | 'badge' | 'streak' | 'mastery',
    description: 'string',
    timestamp: 'ISO-8601'
  }]
};
```

## Implementation Priority

1. **Phase 1**: Build `DiscoverContainer` with basic narrative flow
2. **Phase 2**: Implement personalized narrative generation
3. **Phase 3**: Add real-time analytics and reward system  
4. **Phase 4**: Build handoff to next learning cycle

## Performance Requirements

- **Narrative generation**: < 800ms
- **Question response tracking**: < 100ms
- **XP/badge calculations**: < 200ms
- **Story transitions**: < 300ms
- **Complete cycle processing**: < 1000ms

## Testing Strategy

- Unit tests for narrative personalization algorithms
- Integration tests for EXPERIENCE → DISCOVER handoff
- A/B testing for narrative themes and engagement
- Performance testing for real-time analytics
- User testing for story flow and question integration