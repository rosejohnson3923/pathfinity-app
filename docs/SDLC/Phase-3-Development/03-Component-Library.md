# Component Library Documentation
## Pathfinity Revolutionary Learning Platform

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Living Documentation  
**Owner:** Frontend Architecture Team  
**Reviewed By:** DevOps Director, UI/UX Team, Engineering Team

---

## Executive Summary

This document catalogs Pathfinity's revolutionary component library - the building blocks that bring our Career-First philosophy to life. Each component is designed to support our value hierarchy (Career-First → PathIQ → Finn) while maintaining the performance and flexibility needed to serve millions of students at <$0.05 per day.

---

## 1. Component Architecture Overview

### 1.1 Component Categories

```typescript
// Component hierarchy aligned with value proposition
components/
├── career/                 // PRIMARY VALUE: Career-First components
│   ├── CareerSelector/
│   ├── CareerDashboard/
│   ├── CareerProgress/
│   └── CareerBadges/
├── containers/            // PRIMARY VALUE: Three-container system
│   ├── LearnContainer/
│   ├── ExperienceContainer/
│   ├── DiscoverContainer/
│   └── ContainerOrchestrator/
├── pathiq/               // SECONDARY VALUE: PathIQ intelligence
│   ├── FlowStateIndicator/
│   ├── PersonalizationEngine/
│   ├── PredictiveAnalytics/
│   └── AdaptiveContent/
├── finn/                 // TERTIARY VALUE: Finn agents
│   ├── FinnToolAgent/
│   ├── FinnSeeAgent/
│   ├── FinnSpeakAgent/
│   └── AgentCollaborator/
└── shared/              // Shared/common components
    ├── Button/
    ├── Card/
    ├── Modal/
    └── Layout/
```

### 1.2 Component Standards

```typescript
// Every component follows this structure
interface ComponentStandard {
  // Required files
  Component.tsx         // Main component
  Component.styles.ts   // Styled components or Tailwind
  Component.types.ts    // TypeScript interfaces
  Component.test.tsx    // Test file
  Component.stories.tsx // Storybook stories
  index.ts             // Public API
  README.md            // Documentation
}

// Component template
export interface ComponentProps {
  // Props definition
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export const Component: React.FC<ComponentProps> = ({
  className,
  children,
  testId = 'component',
}) => {
  return (
    <div className={className} data-testid={testId}>
      {children}
    </div>
  );
};

Component.displayName = 'Component';
```

---

## 2. Career-First Components

### 2.1 CareerSelector

**Purpose:** Daily career selection interface - the heart of our revolution  
**Value Hierarchy:** PRIMARY (Career-First)  
**Location:** `/components/career/CareerSelector`

```typescript
interface CareerSelectorProps {
  studentId: string;
  availableCareers: Career[];
  onSelect: (career: Career) => void;
  previousCareers?: Career[];
  selectionMode?: 'daily' | 'exploration' | 'retry';
  animated?: boolean;
}

// Usage
<CareerSelector
  studentId={student.id}
  availableCareers={dailyCareers}
  onSelect={handleCareerSelection}
  previousCareers={last5Careers}
  animated
/>
```

**Features:**
- Animated career wheel with 4 options
- Visual preview on hover
- Career history indicator
- Passion career highlighting
- Accessibility compliant

**Visual Design:**
```tsx
// Career wheel implementation
const CareerWheel: React.FC<WheelProps> = ({ careers, onSelect }) => {
  return (
    <div className="career-wheel">
      <div className="wheel-container">
        {careers.map((career, index) => (
          <CareerOption
            key={career.id}
            career={career}
            angle={index * 90}
            isPassion={career.isPassion}
            onClick={() => onSelect(career)}
          />
        ))}
      </div>
      <SpinButton className="wheel-center" />
    </div>
  );
};
```

### 2.2 CareerDashboard

**Purpose:** Comprehensive career experience dashboard  
**Value Hierarchy:** PRIMARY (Career-First)  
**Location:** `/components/career/CareerDashboard`

```typescript
interface CareerDashboardProps {
  student: Student;
  currentCareer: Career;
  sessionProgress: SessionProgress;
  pathIQMetrics?: PathIQMetrics;
  finnAgents?: FinnAgentStatus[];
}

// Complex state management
const CareerDashboard: React.FC<CareerDashboardProps> = ({
  student,
  currentCareer,
  sessionProgress,
  pathIQMetrics,
  finnAgents,
}) => {
  const [activeContainer, setActiveContainer] = useState<ContainerType>('LEARN');
  const { flowState, updateFlow } = useFlowState(student.id);
  const { agentActivity } = useFinnAgents(finnAgents);
  
  return (
    <DashboardLayout career={currentCareer}>
      <CareerHeader career={currentCareer} student={student} />
      <ContainerTabs 
        active={activeContainer}
        onChange={setActiveContainer}
        progress={sessionProgress}
      />
      <ContentArea>
        {activeContainer === 'LEARN' && <LearnContainer />}
        {activeContainer === 'EXPERIENCE' && <ExperienceContainer />}
        {activeContainer === 'DISCOVER' && <DiscoverContainer />}
      </ContentArea>
      {pathIQMetrics && <FlowStateIndicator metrics={pathIQMetrics} />}
      {finnAgents && <AgentActivityPanel agents={agentActivity} />}
    </DashboardLayout>
  );
};
```

### 2.3 CareerProgress

**Purpose:** Visual representation of career mastery and progression  
**Value Hierarchy:** PRIMARY (Career-First)  
**Location:** `/components/career/CareerProgress`

```typescript
interface CareerProgressProps {
  careers: CareerHistory[];
  currentLevel: number;
  skills: SkillProgress[];
  achievements: Achievement[];
  displayMode?: 'timeline' | 'grid' | 'tree';
}

// Skill tree visualization
const SkillTree: React.FC<{ skills: SkillProgress[] }> = ({ skills }) => {
  return (
    <svg className="skill-tree" viewBox="0 0 800 600">
      {skills.map((skill) => (
        <SkillNode
          key={skill.id}
          skill={skill}
          x={skill.position.x}
          y={skill.position.y}
          unlocked={skill.unlocked}
          progress={skill.progress}
        />
      ))}
    </svg>
  );
};
```

### 2.4 CareerBadges

**Purpose:** Achievement and recognition system aligned with careers  
**Value Hierarchy:** PRIMARY (Career-First)  
**Location:** `/components/career/CareerBadges`

```typescript
interface CareerBadgesProps {
  badges: Badge[];
  recentlyEarned?: Badge[];
  onBadgeClick?: (badge: Badge) => void;
  displaySize?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

// Badge categories aligned with careers
enum BadgeCategory {
  CAREER_EXPLORER = 'career_explorer',      // Trying new careers
  CAREER_MASTER = 'career_master',          // Deep expertise
  SKILL_BUILDER = 'skill_builder',          // Cross-career skills
  COLLABORATOR = 'collaborator',            // Team achievements
  INNOVATOR = 'innovator',                  // Creative solutions
}
```

---

## 3. Three-Container System Components

### 3.1 LearnContainer (Purple)

**Purpose:** Career-contextualized traditional instruction  
**Value Hierarchy:** PRIMARY (Career-First)  
**Location:** `/components/containers/LearnContainer`

```typescript
interface LearnContainerProps {
  content: LearningContent;
  career: Career;
  student: Student;
  onComplete: (results: LearningResults) => void;
  pathIQEnabled?: boolean;
}

const LearnContainer: React.FC<LearnContainerProps> = ({
  content,
  career,
  student,
  onComplete,
  pathIQEnabled = true,
}) => {
  const [progress, setProgress] = useState(0);
  const { difficulty, adjustDifficulty } = useAdaptiveDifficulty(student);
  
  return (
    <Container color="purple" className="learn-container">
      <ContainerHeader>
        <CareerContext career={career} />
        <ProgressBar value={progress} max={100} />
      </ContainerHeader>
      
      <ContentArea>
        <TransformedContent 
          original={content}
          career={career}
          difficulty={difficulty}
        />
      </ContentArea>
      
      <InteractionZone>
        <ProblemSet 
          problems={content.problems}
          career={career}
          onAnswer={(answer) => {
            // Handle answer
            if (pathIQEnabled) {
              adjustDifficulty(answer.performance);
            }
          }}
        />
      </InteractionZone>
      
      <ContainerFooter>
        <NextButton onClick={() => onComplete(results)} />
      </ContainerFooter>
    </Container>
  );
};
```

### 3.2 ExperienceContainer (Orange)

**Purpose:** Hands-on career simulation and practice  
**Value Hierarchy:** PRIMARY (Career-First)  
**Location:** `/components/containers/ExperienceContainer`

```typescript
interface ExperienceContainerProps {
  simulation: CareerSimulation;
  career: Career;
  student: Student;
  collaborative?: boolean;
  onComplete: (experience: ExperienceResults) => void;
}

const ExperienceContainer: React.FC<ExperienceContainerProps> = ({
  simulation,
  career,
  student,
  collaborative = false,
  onComplete,
}) => {
  const [tools, setTools] = useState<ProfessionalTool[]>([]);
  const { peers, connectPeers } = useCollaboration(collaborative);
  
  return (
    <Container color="orange" className="experience-container">
      <SimulationEnvironment career={career}>
        <Workspace>
          <ToolPanel tools={tools} career={career} />
          <SimulationCanvas 
            scenario={simulation.scenario}
            onInteraction={(action) => {
              // Handle professional interactions
            }}
          />
        </Workspace>
        
        {collaborative && (
          <CollaborationPanel peers={peers} onConnect={connectPeers} />
        )}
        
        <TaskList tasks={simulation.tasks} />
        <RealTimeCoaching student={student} />
      </SimulationEnvironment>
    </Container>
  );
};

// Professional tool examples
const ProfessionalTools = {
  SOFTWARE_ENGINEER: ['IDE', 'Debugger', 'Terminal', 'Git'],
  ARCHITECT: ['CAD', '3D Modeler', 'Material Library', 'Calculator'],
  CHEF: ['Recipe Builder', 'Inventory', 'Timer', 'Nutrition Calculator'],
  SCIENTIST: ['Lab Equipment', 'Data Logger', 'Graph Plotter', 'Hypothesis Tool'],
};
```

### 3.3 DiscoverContainer (Pink)

**Purpose:** Career-embedded adventure narratives  
**Value Hierarchy:** PRIMARY (Career-First)  
**Location:** `/components/containers/DiscoverContainer`

```typescript
interface DiscoverContainerProps {
  episode: StoryEpisode;
  career: Career;
  student: Student;
  previousChoices?: StoryChoice[];
  onComplete: (choices: StoryChoice[]) => void;
}

const DiscoverContainer: React.FC<DiscoverContainerProps> = ({
  episode,
  career,
  student,
  previousChoices = [],
  onComplete,
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [choices, setChoices] = useState<StoryChoice[]>([]);
  
  return (
    <Container color="pink" className="discover-container">
      <StoryEnvironment>
        <NarrativeDisplay 
          scene={episode.scenes[currentScene]}
          career={career}
          animated
        />
        
        <CharacterPanel>
          <CareerHero career={career} />
          <SupportingCharacters scene={currentScene} />
        </CharacterPanel>
        
        <DecisionPoint 
          options={episode.scenes[currentScene].choices}
          onChoice={(choice) => {
            setChoices([...choices, choice]);
            // Progress story based on choice
          }}
        />
        
        <CliffhangerPreview next={episode.nextEpisode} />
      </StoryEnvironment>
    </Container>
  );
};
```

### 3.4 ContainerOrchestrator

**Purpose:** Manages transitions and flow between containers  
**Value Hierarchy:** PRIMARY (Career-First)  
**Location:** `/components/containers/ContainerOrchestrator`

```typescript
interface ContainerOrchestratorProps {
  student: Student;
  career: Career;
  session: LearningSession;
  onSessionComplete: (results: SessionResults) => void;
}

const ContainerOrchestrator: React.FC<ContainerOrchestratorProps> = ({
  student,
  career,
  session,
  onSessionComplete,
}) => {
  const [currentContainer, setCurrentContainer] = useState<ContainerType>('LEARN');
  const [containerResults, setContainerResults] = useState<ContainerResults[]>([]);
  const { shouldTransition, nextContainer } = useContainerFlow(student);
  
  const handleContainerComplete = (results: ContainerResults) => {
    setContainerResults([...containerResults, results]);
    
    if (shouldTransition()) {
      const next = nextContainer(currentContainer);
      if (next) {
        setCurrentContainer(next);
      } else {
        onSessionComplete(aggregateResults(containerResults));
      }
    }
  };
  
  return (
    <OrchestratorWrapper>
      <TransitionAnimation from={previousContainer} to={currentContainer}>
        {currentContainer === 'LEARN' && (
          <LearnContainer 
            content={session.learnContent}
            career={career}
            student={student}
            onComplete={handleContainerComplete}
          />
        )}
        {currentContainer === 'EXPERIENCE' && (
          <ExperienceContainer 
            simulation={session.experienceSimulation}
            career={career}
            student={student}
            onComplete={handleContainerComplete}
          />
        )}
        {currentContainer === 'DISCOVER' && (
          <DiscoverContainer 
            episode={session.discoverEpisode}
            career={career}
            student={student}
            onComplete={handleContainerComplete}
          />
        )}
      </TransitionAnimation>
      
      <ContainerProgress 
        completed={containerResults}
        current={currentContainer}
        remaining={getRemainingContainers(currentContainer)}
      />
    </OrchestratorWrapper>
  );
};
```

---

## 4. PathIQ Intelligence Components

### 4.1 FlowStateIndicator

**Purpose:** Real-time flow state visualization  
**Value Hierarchy:** SECONDARY (PathIQ)  
**Location:** `/components/pathiq/FlowStateIndicator`

```typescript
interface FlowStateIndicatorProps {
  metrics: PathIQMetrics;
  targetRange?: { min: number; max: number };
  displayMode?: 'minimal' | 'detailed' | 'scientific';
  position?: 'top-right' | 'bottom-right' | 'floating';
}

const FlowStateIndicator: React.FC<FlowStateIndicatorProps> = ({
  metrics,
  targetRange = { min: 70, max: 85 },
  displayMode = 'minimal',
  position = 'top-right',
}) => {
  const flowPercentage = calculateFlowState(metrics);
  const isInFlow = flowPercentage >= targetRange.min && flowPercentage <= targetRange.max;
  
  return (
    <IndicatorContainer position={position}>
      {displayMode === 'minimal' && (
        <MinimalDisplay>
          <FlowMeter value={flowPercentage} inFlow={isInFlow} />
        </MinimalDisplay>
      )}
      
      {displayMode === 'detailed' && (
        <DetailedDisplay>
          <MetricGrid>
            <Metric label="Engagement" value={metrics.engagement} />
            <Metric label="Challenge" value={metrics.challenge} />
            <Metric label="Skill Match" value={metrics.skillMatch} />
            <Metric label="Focus" value={metrics.focus} />
          </MetricGrid>
          <FlowChart data={metrics.history} />
        </DetailedDisplay>
      )}
      
      {displayMode === 'scientific' && (
        <ScientificDisplay>
          <CsikszentmihalyiDiagram 
            challenge={metrics.challenge}
            skill={metrics.skill}
            currentState={flowPercentage}
          />
          <DetailedMetrics metrics={metrics} />
        </ScientificDisplay>
      )}
    </IndicatorContainer>
  );
};
```

### 4.2 PersonalizationEngine

**Purpose:** 47-dimension personalization interface  
**Value Hierarchy:** SECONDARY (PathIQ)  
**Location:** `/components/pathiq/PersonalizationEngine`

```typescript
interface PersonalizationEngineProps {
  student: Student;
  dimensions: PersonalizationDimension[];
  onProfileUpdate: (profile: PersonalizationProfile) => void;
  autoAdjust?: boolean;
}

// 47 dimensions of personalization
const PERSONALIZATION_DIMENSIONS = {
  // Cognitive dimensions
  LEARNING_PACE: { min: 0.5, max: 2.0, default: 1.0 },
  ABSTRACTION_LEVEL: { min: 1, max: 10, default: 5 },
  COGNITIVE_LOAD_TOLERANCE: { min: 1, max: 10, default: 5 },
  
  // Behavioral dimensions
  ATTENTION_SPAN: { min: 5, max: 60, default: 20 }, // minutes
  BREAK_FREQUENCY: { min: 15, max: 90, default: 45 }, // minutes
  SESSION_LENGTH: { min: 30, max: 180, default: 60 }, // minutes
  
  // Preference dimensions
  VISUAL_PREFERENCE: { min: 0, max: 1, default: 0.5 },
  AUDITORY_PREFERENCE: { min: 0, max: 1, default: 0.5 },
  KINESTHETIC_PREFERENCE: { min: 0, max: 1, default: 0.5 },
  
  // Social dimensions
  COLLABORATION_PREFERENCE: { min: 0, max: 1, default: 0.5 },
  COMPETITION_COMFORT: { min: 0, max: 1, default: 0.5 },
  PEER_LEARNING: { min: 0, max: 1, default: 0.5 },
  
  // ... 35 more dimensions
};

const PersonalizationEngine: React.FC<PersonalizationEngineProps> = ({
  student,
  dimensions,
  onProfileUpdate,
  autoAdjust = true,
}) => {
  const [profile, setProfile] = useState<PersonalizationProfile>(
    () => loadStudentProfile(student.id)
  );
  
  const { analyze, adjust } = usePathIQAnalysis(student.id);
  
  useEffect(() => {
    if (autoAdjust) {
      const subscription = analyze().subscribe((metrics) => {
        const adjustments = calculateAdjustments(metrics, profile);
        if (adjustments.length > 0) {
          const newProfile = applyAdjustments(profile, adjustments);
          setProfile(newProfile);
          onProfileUpdate(newProfile);
        }
      });
      
      return () => subscription.unsubscribe();
    }
  }, [autoAdjust, analyze, profile]);
  
  return (
    <PersonalizationPanel>
      <DimensionGrid>
        {dimensions.map((dimension) => (
          <DimensionControl
            key={dimension.id}
            dimension={dimension}
            value={profile[dimension.id]}
            onChange={(value) => updateDimension(dimension.id, value)}
          />
        ))}
      </DimensionGrid>
      
      <ProfileVisualization profile={profile} />
      <OptimizationSuggestions profile={profile} student={student} />
    </PersonalizationPanel>
  );
};
```

### 4.3 PredictiveAnalytics

**Purpose:** 30-day predictive intervention system  
**Value Hierarchy:** SECONDARY (PathIQ)  
**Location:** `/components/pathiq/PredictiveAnalytics`

```typescript
interface PredictiveAnalyticsProps {
  student: Student;
  timeframe?: number; // days
  onInterventionNeeded: (intervention: Intervention) => void;
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  student,
  timeframe = 30,
  onInterventionNeeded,
}) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  
  const predictFutureChallenges = async () => {
    const history = await loadStudentHistory(student.id);
    const upcomingContent = await loadUpcomingContent(student.gradeLevel);
    
    const model = await loadPredictiveModel();
    const predictions = model.predict({
      studentProfile: student,
      historicalPerformance: history,
      upcomingChallenges: upcomingContent,
      timeframe,
    });
    
    return predictions;
  };
  
  return (
    <PredictivePanel>
      <TimelineVisualization 
        predictions={predictions}
        timeframe={timeframe}
      />
      
      <RiskIndicators>
        {predictions
          .filter(p => p.riskLevel > 0.7)
          .map(prediction => (
            <RiskAlert
              key={prediction.id}
              prediction={prediction}
              onIntervene={() => {
                const intervention = createIntervention(prediction);
                onInterventionNeeded(intervention);
              }}
            />
          ))}
      </RiskIndicators>
      
      <InterventionSchedule interventions={interventions} />
    </PredictivePanel>
  );
};
```

---

## 5. Finn Agent Components

### 5.1 FinnToolAgent

**Purpose:** Orchestration and tool management agent  
**Value Hierarchy:** TERTIARY (Finn)  
**Location:** `/components/finn/FinnToolAgent`

```typescript
interface FinnToolAgentProps {
  task: LearningTask;
  availableAgents: FinnAgent[];
  onOrchestrationComplete: (result: OrchestrationResult) => void;
}

const FinnToolAgent: React.FC<FinnToolAgentProps> = ({
  task,
  availableAgents,
  onOrchestrationComplete,
}) => {
  const [activeAgents, setActiveAgents] = useState<FinnAgent[]>([]);
  const [orchestrationPlan, setOrchestrationPlan] = useState<OrchestrationPlan>();
  
  const orchestrate = async () => {
    // Determine optimal agent combination
    const plan = await createOrchestrationPlan(task, availableAgents);
    setOrchestrationPlan(plan);
    
    // Execute plan
    const results = await executePlan(plan);
    onOrchestrationComplete(results);
  };
  
  return (
    <AgentPanel agentType="tool">
      <AgentAvatar agent="FinnTool" status="orchestrating" />
      <OrchestrationVisualizer>
        {orchestrationPlan && (
          <PlanDiagram 
            plan={orchestrationPlan}
            activeAgents={activeAgents}
          />
        )}
      </OrchestrationVisualizer>
      <AgentCommunication>
        {activeAgents.map(agent => (
          <AgentMessage 
            key={agent.id}
            from="FinnTool"
            to={agent.name}
            message={agent.currentTask}
          />
        ))}
      </AgentCommunication>
    </AgentPanel>
  );
};
```

### 5.2 FinnSeeAgent

**Purpose:** Visual learning and content generation  
**Value Hierarchy:** TERTIARY (Finn)  
**Location:** `/components/finn/FinnSeeAgent`

```typescript
interface FinnSeeAgentProps {
  content: LearningContent;
  career: Career;
  visualPreference: number; // 0-1
  onVisualizationReady: (visual: Visualization) => void;
}

const FinnSeeAgent: React.FC<FinnSeeAgentProps> = ({
  content,
  career,
  visualPreference,
  onVisualizationReady,
}) => {
  const [visualization, setVisualization] = useState<Visualization>();
  const [renderMode, setRenderMode] = useState<'2D' | '3D' | 'AR'>('2D');
  
  const generateVisualization = async () => {
    const visual = await createCareerVisualization(content, career, {
      complexity: visualPreference,
      mode: renderMode,
      interactive: true,
    });
    
    setVisualization(visual);
    onVisualizationReady(visual);
  };
  
  return (
    <AgentPanel agentType="visual">
      <AgentAvatar agent="FinnSee" status="creating" />
      <VisualizationCanvas>
        {visualization && (
          <>
            {renderMode === '2D' && <Canvas2D data={visualization} />}
            {renderMode === '3D' && <Canvas3D data={visualization} />}
            {renderMode === 'AR' && <ARView data={visualization} />}
          </>
        )}
      </VisualizationCanvas>
      <VisualizationControls>
        <ModeSelector value={renderMode} onChange={setRenderMode} />
        <InteractivityToggle />
        <ExportOptions />
      </VisualizationControls>
    </AgentPanel>
  );
};
```

### 5.3 AgentCollaborator

**Purpose:** Multi-agent collaboration coordinator  
**Value Hierarchy:** TERTIARY (Finn)  
**Location:** `/components/finn/AgentCollaborator`

```typescript
interface AgentCollaboratorProps {
  agents: FinnAgent[];
  collaborationMode: 'sequential' | 'parallel' | 'competitive' | 'consensus';
  task: ComplexTask;
  onComplete: (result: CollaborationResult) => void;
}

const AgentCollaborator: React.FC<AgentCollaboratorProps> = ({
  agents,
  collaborationMode,
  task,
  onComplete,
}) => {
  const [agentStates, setAgentStates] = useState<Map<string, AgentState>>();
  const [collaborationProgress, setProgress] = useState(0);
  
  const executeCollaboration = async () => {
    switch (collaborationMode) {
      case 'sequential':
        return executeSequential(agents, task);
      case 'parallel':
        return executeParallel(agents, task);
      case 'competitive':
        return executeCompetitive(agents, task);
      case 'consensus':
        return executeConsensus(agents, task);
    }
  };
  
  return (
    <CollaborationPanel>
      <AgentNetwork>
        {agents.map(agent => (
          <AgentNode
            key={agent.id}
            agent={agent}
            state={agentStates?.get(agent.id)}
            connections={getAgentConnections(agent, collaborationMode)}
          />
        ))}
      </AgentNetwork>
      
      <CollaborationTimeline 
        mode={collaborationMode}
        progress={collaborationProgress}
      />
      
      <CommunicationLog>
        {/* Real-time agent communication */}
      </CommunicationLog>
    </CollaborationPanel>
  );
};
```

---

## 6. Shared Components

### 6.1 Button

**Purpose:** Consistent button component with variants  
**Location:** `/components/shared/Button`

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'career' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  career?: Career; // For career-themed styling
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  career,
  loading = false,
  disabled = false,
  onClick,
  children,
}) => {
  const careerStyles = career ? getCareerStyles(career) : {};
  
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      style={careerStyles}
    >
      {loading ? <Spinner /> : children}
    </StyledButton>
  );
};

// Style variants
const StyledButton = styled.button<ButtonProps>`
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return css`
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        `;
      case 'career':
        return css`
          background: var(--career-primary);
          color: var(--career-text);
        `;
      // ... other variants
    }
  }}
`;
```

### 6.2 Card

**Purpose:** Flexible card component for content display  
**Location:** `/components/shared/Card`

```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  career?: Career;
  interactive?: boolean;
  elevation?: 0 | 1 | 2 | 3;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  career,
  interactive = false,
  elevation = 1,
  children,
}) => {
  return (
    <CardContainer 
      elevation={elevation}
      interactive={interactive}
      career={career}
    >
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
          {career && <CareerBadge career={career} />}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </CardContainer>
  );
};
```

### 6.3 Modal

**Purpose:** Accessible modal dialog system  
**Location:** `/components/shared/Modal`

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  closeOnOverlayClick = true,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <ModalOverlay onClick={closeOnOverlayClick ? onClose : undefined}>
      <ModalContent size={size} onClick={(e) => e.stopPropagation()}>
        {title && (
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
            <CloseButton onClick={onClose} />
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};
```

---

## 7. Component Composition Patterns

### 7.1 Compound Components

```typescript
// Career dashboard with compound components
const CareerDashboard = {
  Root: DashboardRoot,
  Header: DashboardHeader,
  Navigation: DashboardNavigation,
  Content: DashboardContent,
  Sidebar: DashboardSidebar,
  Footer: DashboardFooter,
};

// Usage
<CareerDashboard.Root career={currentCareer}>
  <CareerDashboard.Header student={student} />
  <CareerDashboard.Navigation tabs={containerTabs} />
  <CareerDashboard.Content>
    {activeContainer === 'LEARN' && <LearnContainer />}
  </CareerDashboard.Content>
  <CareerDashboard.Sidebar>
    <FlowStateIndicator />
    <AgentActivity />
  </CareerDashboard.Sidebar>
</CareerDashboard.Root>
```

### 7.2 Provider Pattern

```typescript
// PathIQ context provider
const PathIQProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flowState, setFlowState] = useState<FlowState>();
  const [personalization, setPersonalization] = useState<PersonalizationProfile>();
  
  const value = {
    flowState,
    personalization,
    updateFlowState: setFlowState,
    updatePersonalization: setPersonalization,
  };
  
  return (
    <PathIQContext.Provider value={value}>
      {children}
    </PathIQContext.Provider>
  );
};

// Hook for consuming context
const usePathIQ = () => {
  const context = useContext(PathIQContext);
  if (!context) {
    throw new Error('usePathIQ must be used within PathIQProvider');
  }
  return context;
};
```

### 7.3 Render Props Pattern

```typescript
// Flexible agent renderer
interface AgentRendererProps {
  agent: FinnAgent;
  children: (props: AgentRenderProps) => React.ReactNode;
}

const AgentRenderer: React.FC<AgentRendererProps> = ({ agent, children }) => {
  const [status, setStatus] = useState(agent.status);
  const [activity, setActivity] = useState(agent.currentActivity);
  
  return children({
    agent,
    status,
    activity,
    updateStatus: setStatus,
    updateActivity: setActivity,
  });
};

// Usage
<AgentRenderer agent={finnSeeAgent}>
  {({ agent, status, activity }) => (
    <div>
      <AgentAvatar agent={agent} status={status} />
      <ActivityDisplay activity={activity} />
    </div>
  )}
</AgentRenderer>
```

---

## 8. Accessibility Standards

### 8.1 WCAG 2.1 AA Compliance

```typescript
// Every interactive component must include
interface AccessibilityProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  role?: string;
  tabIndex?: number;
}

// Example: Accessible career selector
const CareerOption: React.FC<CareerOptionProps> = ({ career, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(career)}
      aria-label={`Select ${career.name} as today's career`}
      aria-describedby={`career-description-${career.id}`}
      role="option"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(career);
        }
      }}
    >
      <CareerIcon career={career} />
      <span id={`career-description-${career.id}`}>
        {career.description}
      </span>
    </button>
  );
};
```

### 8.2 Keyboard Navigation

```typescript
// Full keyboard support required
const useKeyboardNavigation = (items: any[], onSelect: (item: any) => void) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          setFocusedIndex((prev) => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          setFocusedIndex((prev) => Math.min(items.length - 1, prev + 1));
          break;
        case 'Enter':
          onSelect(items[focusedIndex]);
          break;
        case 'Escape':
          // Handle escape
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, items, onSelect]);
  
  return { focusedIndex };
};
```

---

## 9. Performance Optimization

### 9.1 Code Splitting

```typescript
// Lazy load heavy components
const HeavyVisualization = lazy(() => 
  import(/* webpackChunkName: "visualization" */ './HeavyVisualization')
);

const VisualizationWrapper: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyVisualization />
    </Suspense>
  );
};
```

### 9.2 Memoization

```typescript
// Memo for expensive renders
const ExpensiveCareerGrid = memo<CareerGridProps>(
  ({ careers, onSelect }) => {
    // Expensive rendering logic
    return (
      <Grid>
        {careers.map(career => (
          <CareerCard key={career.id} career={career} onClick={onSelect} />
        ))}
      </Grid>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.careers.length === nextProps.careers.length &&
      prevProps.careers.every((c, i) => c.id === nextProps.careers[i].id)
    );
  }
);
```

---

## 10. Storybook Documentation

### 10.1 Story Structure

```typescript
// CareerSelector.stories.tsx
export default {
  title: 'Career/CareerSelector',
  component: CareerSelector,
  parameters: {
    docs: {
      description: {
        component: 'Daily career selection interface - the heart of Career-First philosophy',
      },
    },
  },
  argTypes: {
    onSelect: { action: 'career selected' },
  },
} as Meta<typeof CareerSelector>;

const Template: StoryFn<typeof CareerSelector> = (args) => <CareerSelector {...args} />;

export const Default = Template.bind({});
Default.args = {
  studentId: '123',
  availableCareers: mockCareers,
};

export const WithHistory = Template.bind({});
WithHistory.args = {
  ...Default.args,
  previousCareers: mockPreviousCareers,
};

export const AnimatedSelection = Template.bind({});
AnimatedSelection.args = {
  ...Default.args,
  animated: true,
};
```

---

## Component Development Workflow

### Development Process

1. **Design Review** - UX/UI approval
2. **Component Planning** - API design
3. **Implementation** - Follow standards
4. **Testing** - Unit & integration
5. **Documentation** - Storybook & README
6. **Review** - Code review
7. **Integration** - Feature integration

### Quality Gates

- TypeScript strict mode compliance
- 100% prop-types coverage
- >90% test coverage
- Storybook story complete
- Accessibility audit passed
- Performance budget met
- Documentation complete

---

## Appendices

### Appendix A: Design Tokens

```typescript
const designTokens = {
  colors: {
    careerPrimary: 'var(--career-primary)',
    learnPurple: '#8B5CF6',
    experienceOrange: '#F97316',
    discoverPink: '#EC4899',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  animation: {
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
  },
};
```

### Appendix B: Component Checklist

- [ ] TypeScript interfaces defined
- [ ] Props documented
- [ ] Error boundaries implemented
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states designed
- [ ] Accessibility compliant
- [ ] Performance optimized
- [ ] Tests written
- [ ] Storybook story created

---

*End of Component Library Documentation*

**Next Document:** Service Catalog

---