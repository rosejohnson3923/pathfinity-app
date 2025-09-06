# Career, Inc. Lobby - Technical Specification

## Architecture Overview

### Container Structure
```
LearnContainer (completed) 
    ↓ [handoff trigger]
ExperienceContainer 
    ├── CareerIncLobby (career selection interface)
    ├── CareerScenarioCard (individual work assignments)
    └── ExperienceProgressTracker
        ↓ [handoff trigger]
DiscoverContainer
    ├── NarrativeCard (personalized stories)
    └── DiscoverProgressTracker
```

## Component Specifications

### 1. ExperienceContainer
**File:** `components/experience/ExperienceContainer.jsx`

```javascript
const ExperienceContainer = ({ 
  studentId, 
  learnResults, // Multi-subject results from completed LearnContainer
  onComplete // callback to trigger DiscoverContainer
}) => {
  const [currentPhase, setCurrentPhase] = useState('lobby'); // 'lobby' | 'scenario'
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [careerChoices, setCareerChoices] = useState([]);
  
  return (
    <div className="experience-container">
      {currentPhase === 'lobby' && (
        <CareerIncLobby 
          studentId={studentId}
          learnResults={learnResults}
          onCareerSelected={(career) => {
            setSelectedCareer(career);
            setCurrentPhase('scenario');
          }}
        />
      )}
      
      {currentPhase === 'scenario' && (
        <CareerScenarioCard 
          career={selectedCareer}
          learnResults={learnResults}
          onComplete={(results) => {
            // Track career analytics with multi-subject context
            trackMultiSubjectCareerSession(studentId, selectedCareer, results, learnResults);
            onComplete(results);
          }}
        />
      )}
    </div>
  );
};
```

### 2. CareerIncLobby (Grade-Adaptive Interface)
**File:** `components/experience/CareerIncLobby.jsx`

```javascript
const CareerIncLobby = ({ studentId, learnResults, onCareerSelected }) => {
  const [careerChoices, setCareerChoices] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  
  useEffect(() => {
    const initializeLobby = async () => {
      const profile = await getStudentProfile(studentId);
      const choices = await generateCareerChoices(profile, learnResults);
      setStudentProfile(profile);
      setCareerChoices(choices);
    };
    initializeLobby();
  }, [studentId, learnResults]);

  const lobbyConfig = getLobbyConfigByGrade(studentProfile?.gradeLevel);

  return (
    <div className={`career-lobby ${lobbyConfig.styleClass}`}>
      <LobbyHeader config={lobbyConfig} />
      <FinnGreeting 
        studentProfile={studentProfile} 
        learnResults={learnResults}
        message="Welcome to Career, Inc.! You've learned some amazing skills today. Now let's put them to work!"
      />
      <CareerChoiceGrid 
        choices={careerChoices}
        config={lobbyConfig}
        learnResults={learnResults}
        onSelect={(career) => {
          trackMultiSubjectCareerChoice(studentId, careerChoices, career, learnResults);
          onCareerSelected(career);
        }}
      />
    </div>
  );
};
```

### 3. Grade-Level Lobby Configurations
**File:** `config/lobbyConfigs.js`

```javascript
export const lobbyConfigs = {
  'prek-5': {
    styleClass: 'lobby-elementary',
    title: 'Welcome to Career Town! 🏘️',
    description: 'Choose your helper job for today!',
    departments: [
      { id: 'school', name: 'School Helpers', icon: '🏫', color: '#4CAF50' },
      { id: 'safety', name: 'Safety Heroes', icon: '🚒', color: '#F44336' },
      { id: 'health', name: 'Health Helpers', icon: '🏥', color: '#2196F3' },
      { id: 'community', name: 'Community Workers', icon: '🏪', color: '#FF9800' },
      { id: 'creative', name: 'Creative Corner', icon: '🎨', color: '#9C27B0' }
    ],
    cardStyle: 'large-icons',
    navigation: 'simple-grid',
    finnTone: 'friendly-simple'
  },
  
  '6-8': {
    styleClass: 'lobby-middle',
    title: 'Career Exploration Hub 🚀',
    description: 'Discover your path through hands-on experience',
    departments: [
      { id: 'business', name: 'Business & Leadership', icon: '💼', color: '#1976D2' },
      { id: 'technology', name: 'Technology & Innovation', icon: '💻', color: '#388E3C' },
      { id: 'marketing', name: 'Marketing & Communications', icon: '🎯', color: '#F57C00' },
      { id: 'science', name: 'Science & Research', icon: '🔬', color: '#7B1FA2' },
      { id: 'government', name: 'Law & Government', icon: '⚖️', color: '#5D4037' }
    ],
    cardStyle: 'detailed-descriptions',
    navigation: 'hover-details',
    finnTone: 'encouraging-guide'
  },
  
  '9-12': {
    styleClass: 'lobby-high',
    title: 'Professional Development Center 🏢',
    description: 'Build expertise in your field of interest',
    departments: [
      { id: 'c-suite', name: 'Executive Leadership', icon: '👔', color: '#263238' },
      { id: 'operations', name: 'Operations & Management', icon: '⚙️', color: '#37474F' },
      { id: 'technology', name: 'Technology & Engineering', icon: '🖥️', color: '#455A64' },
      { id: 'finance', name: 'Finance & Strategy', icon: '📊', color: '#546E7A' },
      { id: 'marketing', name: 'Marketing & Business Dev', icon: '📈', color: '#607D8B' }
    ],
    cardStyle: 'professional-layout',
    navigation: 'dashboard-style',
    finnTone: 'executive-mentor'
  }
};
```

### 4. Career Choice Generation System
**File:** `services/careerChoiceService.js`

```javascript
export const generateCareerChoices = async (studentProfile, learnResults) => {
  const gradeLevel = studentProfile.gradeLevel;
  const careerProfile = await getCareerAnalytics(studentProfile.id);
  
  // Extract all skills learned across subjects
  const skillsLearned = extractSkillsFromLearnResults(learnResults);
  const subjectsCompleted = extractSubjectsFromLearnResults(learnResults);
  
  // Get grade-appropriate career pool
  let availableCareers = getCareersByGrade(gradeLevel);
  
  // Filter careers that can meaningfully apply the learned skills
  availableCareers = filterCareersBySkillApplicability(availableCareers, skillsLearned);
  
  // Apply smart weighting based on student patterns
  if (careerProfile.hasStrongPreferences) {
    availableCareers = applyCareerWeighting(availableCareers, careerProfile);
  }
  
  // Select 5 random careers ensuring variety across departments
  const choices = selectDiverseRandomCareers(availableCareers, 5);
  
  return choices.map(career => ({
    id: career.id,
    name: career.displayName,
    emoji: career.emoji,
    department: career.department,
    description: career.gradeAppropriateDescription[gradeLevel],
    skillApplications: generateMultiSkillConnections(career, skillsLearned),
    subjectIntegration: mapCareerToSubjects(career, subjectsCompleted),
    difficulty: calculateOverallDifficulty(learnResults.performanceData)
  }));
};

export const generateMultiSkillConnections = (career, skillsLearned) => {
  // Map how each learned skill applies to this career
  const connections = {};
  
  skillsLearned.forEach(skill => {
    const application = getSkillApplicationForCareer(career.id, skill);
    if (application) {
      connections[skill.subject] = {
        skill: skill.name,
        application: application.description,
        realWorldExample: application.example
      };
    }
  });
  
  return connections;
};

export const filterCareersBySkillApplicability = (careers, skillsLearned) => {
  return careers.filter(career => {
    // Career must be able to apply at least 2 of the learned skills
    const applicableSkills = skillsLearned.filter(skill => 
      careerCanApplySkill(career.id, skill)
    );
    return applicableSkills.length >= 2;
  });
};
```

### 5. Career Choice Tracking System
**File:** `services/careerAnalytics.js`

```javascript
export const trackCareerChoice = async (studentId, presentedChoices, selectedCareer) => {
  const choiceEvent = {
    studentId,
    timestamp: new Date().toISOString(),
    presentedChoices: presentedChoices.map((choice, index) => ({
      careerId: choice.id,
      position: index + 1,
      department: choice.department
    })),
    selectedCareer: {
      careerId: selectedCareer.id,
      department: selectedCareer.department,
      selectionTime: getSelectionTime(), // tracked from choice presentation
      selectionPattern: analyzeSelectionBehavior(selectedCareer, presentedChoices)
    },
    rejectedCareers: presentedChoices
      .filter(choice => choice.id !== selectedCareer.id)
      .map(choice => choice.id),
    skillContext: selectedCareer.skillApplication
  };
  
  // Store event
  await storeCareerChoiceEvent(choiceEvent);
  
  // Update real-time analytics
  await updateCareerProfile(studentId, choiceEvent);
  
  // Trigger analytics calculation
  await calculateCareerAffinities(studentId);
};

export const updateCareerProfile = async (studentId, choiceEvent) => {
  const profile = await getCareerProfile(studentId);
  
  // Update career-specific metrics
  const careerId = choiceEvent.selectedCareer.careerId;
  if (!profile.careerExperience[careerId]) {
    profile.careerExperience[careerId] = {
      timesPresented: 0,
      timesSelected: 0,
      avgSelectionTime: 0,
      totalTimeSpent: 0,
      badgeLevel: 'explorer'
    };
  }
  
  // Increment selection metrics
  profile.careerExperience[careerId].timesSelected += 1;
  profile.careerExperience[careerId].avgSelectionTime = calculateMovingAverage(
    profile.careerExperience[careerId].avgSelectionTime,
    choiceEvent.selectedCareer.selectionTime
  );
  
  // Update department affinity
  const department = choiceEvent.selectedCareer.department;
  profile.departmentAffinities[department] = 
    (profile.departmentAffinities[department] || 0) + 1;
  
  // Calculate selection rates
  profile.careerExperience[careerId].selectionRate = 
    profile.careerExperience[careerId].timesSelected / 
    profile.careerExperience[careerId].timesPresented;
  
  await saveCareerProfile(studentId, profile);
};
```

### 6. Data Models

#### CareerChoice Schema
```javascript
const careerChoiceSchema = {
  id: 'string', // UUID
  studentId: 'string',
  timestamp: 'ISO-8601',
  presentedChoices: [{
    careerId: 'string',
    position: 'number', // 1-5
    department: 'string'
  }],
  selectedCareer: {
    careerId: 'string',
    department: 'string', 
    selectionTime: 'number', // seconds
    selectionPattern: 'immediate' | 'hesitated' | 'explored'
  },
  rejectedCareers: ['string'], // array of career IDs
  skillContext: {
    skill: 'string',
    fromLearnSession: 'string' // session ID
  }
};
```

#### Career Profile Schema
```javascript
const careerProfileSchema = {
  studentId: 'string',
  lastUpdated: 'ISO-8601',
  careerExperience: {
    [careerId]: {
      timesPresented: 'number',
      timesSelected: 'number', 
      selectionRate: 'number', // 0-1
      avgSelectionTime: 'number',
      totalTimeSpent: 'number', // minutes in scenarios
      badgeLevel: 'explorer' | 'apprentice' | 'specialist' | 'expert' | 'master',
      lastEngaged: 'ISO-8601'
    }
  },
  departmentAffinities: {
    [departmentId]: 'number' // selection count
  },
  overallPatterns: {
    avgSelectionTime: 'number',
    consistencyScore: 'number', // 0-1, how predictable choices are
    explorationLevel: 'focused' | 'exploratory' | 'random',
    strongPreferences: 'boolean'
  }
};
```

### 7. Handoff to DiscoverContainer
**File:** `services/phaseTransition.js`

```javascript
export const completeExperiencePhase = async (studentId, careerSessionData) => {
  // Prepare data package for DISCOVER phase
  const experienceResults = {
    studentId,
    fromLearnSession: careerSessionData.learnSessionId,
    careerData: {
      career: careerSessionData.selectedCareer,
      department: careerSessionData.department,
      timeSpent: careerSessionData.timeSpent,
      taskPerformance: careerSessionData.score,
      realWorldApplication: careerSessionData.taskCompleted,
      engagementLevel: careerSessionData.engagementMetrics.level,
      careerInterest: careerSessionData.interestIndicators
    },
    skillReinforcement: {
      skill: careerSessionData.skillApplied,
      contextualMastery: careerSessionData.skillPerformance,
      transferSuccess: careerSessionData.skillTransferSuccess
    },
    nextPhase: 'DISCOVER'
  };
  
  // Update career analytics
  await trackCareerSession(studentId, experienceResults);
  
  // Trigger DISCOVER container initialization
  return experienceResults;
};
```

## Implementation Priority

1. **Phase 1**: Build `ExperienceContainer` and basic `CareerIncLobby`
2. **Phase 2**: Implement choice tracking and analytics system
3. **Phase 3**: Add grade-level adaptations and smart career weighting
4. **Phase 4**: Build handoff to `DiscoverContainer`

## Performance Requirements

- **Career choice generation**: < 200ms
- **Choice tracking**: < 50ms (non-blocking)
- **Profile updates**: < 100ms
- **Container transitions**: < 300ms

## Testing Strategy

- Unit tests for career choice algorithms
- Integration tests for container handoffs
- A/B testing for lobby interfaces by grade level
- Analytics validation for choice tracking accuracy