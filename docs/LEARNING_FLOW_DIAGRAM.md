# Learning System Flow Diagrams

## Student Journey Overview

```mermaid
graph TD
    Start[Student Login] --> Career[Select Career<br/>Athlete/Doctor/Artist/etc]
    Career --> Companion[Choose AI Companion<br/>Finn/Spark/Sage/Harmony]
    Companion --> CheckProgress{Check Daily Progress}
    
    CheckProgress -->|New Day| NextSkill[Get Next Skill<br/>e.g., A.1]
    CheckProgress -->|Continuing| Resume[Resume Current Skill]
    
    NextSkill --> MultiSubject[Multi-Subject Learning]
    Resume --> MultiSubject
    
    MultiSubject --> Math[Math Container<br/>4 Practice + 5 Lesson]
    Math --> ELA[ELA Container<br/>4 Practice + 5 Lesson]
    ELA --> Science[Science Container<br/>4 Practice + 5 Lesson]
    Science --> Social[Social Studies<br/>4 Practice + 5 Lesson]
    
    Social --> Experience[Experience Container<br/>Apply Skills]
    Experience --> Discover[Discover Container<br/>Explore Creatively]
    
    Discover --> UpdateProgress[Mark Skill Complete]
    UpdateProgress --> CheckCategory{All A.1-A.5<br/>Complete?}
    
    CheckCategory -->|No| NextDay[Next Day → Next Skill]
    CheckCategory -->|Yes| Review[Review Container<br/>Review All Skills]
    
    Review --> Assessment[Assessment Container<br/>Final Test]
    Assessment --> Result{Pass ≥80%?}
    
    Result -->|Yes| Advance[Advance to B.1<br/>+ Certificate]
    Result -->|No| Practice[Additional Practice<br/>Weak Areas]
    
    Practice --> Review
    Advance --> NextCategory[Start B Category]
```

## Daily Skill Progression

```mermaid
graph LR
    subgraph Monday
        A1[A.1 All Subjects]
    end
    
    subgraph Tuesday
        A2[A.2 All Subjects]
    end
    
    subgraph Wednesday
        A3[A.3 All Subjects]
    end
    
    subgraph Thursday
        A4[A.4 All Subjects]
    end
    
    subgraph Friday
        A5[A.5 All Subjects]
    end
    
    subgraph "Next Week"
        Rev[Review A.1-A.5]
        Assess[Assessment]
    end
    
    A1 --> A2 --> A3 --> A4 --> A5 --> Rev --> Assess
```

## Single Skill Learning Flow (e.g., A.1)

```mermaid
graph TD
    Start[Start A.1] --> LoadSkills[Load Skills from<br/>skillsDataComplete.ts]
    
    LoadSkills --> GetSubjects[Get All Subjects<br/>Math, ELA, Science, Social]
    
    GetSubjects --> Math{Math Learning}
    Math --> MathInstruct[Instruction Phase<br/>Learn Concepts]
    MathInstruct --> MathPractice[Practice Phase<br/>4 Questions]
    MathPractice --> MathLesson[Lesson Phase<br/>5 Questions]
    MathLesson --> MathComplete[Math Complete ✓]
    
    MathComplete --> Transition1[Companion Message<br/>'Great job with Math!<br/>Ready for Reading?']
    
    Transition1 --> ELA{ELA Learning}
    ELA --> ELAFlow[... Same Flow ...]
    ELAFlow --> ELAComplete[ELA Complete ✓]
    
    ELAComplete --> Transition2[Companion Message<br/>'Excellent reading!<br/>Let's explore Science!']
    
    Transition2 --> Science{Science Learning}
    Science --> SciFlow[... Same Flow ...]
    SciFlow --> SciComplete[Science Complete ✓]
    
    SciComplete --> Transition3[Companion Message<br/>'Amazing science work!<br/>Time for Social Studies!']
    
    Transition3 --> Social{Social Studies}
    Social --> SocFlow[... Same Flow ...]
    SocFlow --> SocComplete[Social Complete ✓]
    
    SocComplete --> AllDone[All Subjects Complete<br/>for A.1]
    
    AllDone --> Experience[Experience Container]
    Experience --> Discover[Discover Container]
    Discover --> MarkComplete[A.1 Marked Complete]
```

## Component Communication Flow

```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant Orchestrator
    participant Journey
    participant MultiSubject
    participant Learn
    participant Service
    participant Data
    
    User->>Dashboard: Start Learning
    Dashboard->>Service: getNextLearningAction()
    Service->>Data: Check completedSkills
    Data-->>Service: Return progress
    Service-->>Dashboard: Next: A.1
    
    Dashboard->>Orchestrator: Start skill A.1
    Orchestrator->>Journey: Initialize journey
    Journey->>MultiSubject: Start multi-subject
    
    MultiSubject->>Service: getSkillsForDay('K', 'A.1')
    Service->>Data: Query skillsDataComplete
    Data-->>Service: Return 4 subjects
    Service-->>MultiSubject: Math, ELA, Science, Social
    
    loop For Each Subject
        MultiSubject->>Learn: Start subject
        Learn->>Learn: Instruction
        Learn->>Learn: Practice (4)
        Learn->>Learn: Lesson (5)
        Learn-->>MultiSubject: Subject complete
        MultiSubject->>MultiSubject: Update progress
    end
    
    MultiSubject-->>Journey: All subjects done
    Journey->>Journey: Start Experience
    Journey->>Journey: Start Discover
    Journey-->>Orchestrator: Skill complete
    Orchestrator->>Service: Mark A.1 complete
    Service->>Data: Update progress
```

## Review & Assessment Flow

```mermaid
graph TD
    Start[A.1-A.5 Complete] --> TriggerReview[Trigger Review]
    
    TriggerReview --> LoadSkills[Load All Category Skills]
    LoadSkills --> IdentifyWeak[Identify Weak Areas<br/>Scores < 80%]
    
    IdentifyWeak --> GenerateQuestions[Generate Review Questions]
    GenerateQuestions --> PrioritizeWeak[Prioritize Weak Skills]
    PrioritizeWeak --> AddGeneral[Add General Review]
    
    AddGeneral --> StartReview[Start Review Session]
    StartReview --> Question1[Review Question 1]
    Question1 --> Feedback1[Immediate Feedback]
    Feedback1 --> Question2[Review Question 2]
    Question2 --> Feedback2[Immediate Feedback]
    Feedback2 --> More[... More Questions ...]
    
    More --> CalculateReady{Ready Score ≥75%?}
    CalculateReady -->|Yes| ToAssessment[Proceed to Assessment]
    CalculateReady -->|No| MorePractice[Additional Practice]
    
    ToAssessment --> AssessmentStart[Assessment Instructions]
    AssessmentStart --> AssessQ1[Assessment Question 1<br/>No Feedback]
    AssessQ1 --> AssessQ2[Assessment Question 2<br/>No Feedback]
    AssessQ2 --> AssessMore[... All Questions ...]
    
    AssessMore --> Calculate[Calculate Scores]
    Calculate --> Overall{Overall ≥80%?}
    
    Overall -->|Yes| Pass[PASS<br/>Certificate Earned<br/>Advance to B.1]
    Overall -->|No| Fail[FAIL<br/>Return to Practice]
    
    Fail --> MorePractice
    MorePractice --> StartReview
```

## Data Structure Flow

```mermaid
graph TD
    subgraph "skillsDataComplete.ts"
        Grade[Grade: Kindergarten]
        Grade --> MathSkills[Math Skills]
        Grade --> ELASkills[ELA Skills]
        Grade --> SciSkills[Science Skills]
        Grade --> SocSkills[Social Studies Skills]
        
        MathSkills --> MA0[A.0: Numbers to 3<br/>Category Header]
        MathSkills --> MA1[A.1: Identify numbers]
        MathSkills --> MA2[A.2: Count to 3]
        MathSkills --> MA3[A.3: Compare groups]
        
        ELASkills --> EA0[A.0: Letters & Sounds<br/>Category Header]
        ELASkills --> EA1[A.1: Find letters]
        ELASkills --> EA2[A.2: Match letters]
    end
    
    subgraph "skillProgressionService"
        GetSkills[getSkillsForDay<br/>'K', 'A.1']
        GetSkills --> Query{Query All Subjects}
        Query --> ReturnSkills[Return DailySkills]
        
        ReturnSkills --> Output[Output:<br/>- Math A.1<br/>- ELA A.1<br/>- Science A.1<br/>- Social A.1]
    end
    
    MA1 -.-> GetSkills
    EA1 -.-> GetSkills
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> NoProgress: New Student
    NoProgress --> A1_Started: Start A.1
    
    A1_Started --> A1_Math: Complete Math
    A1_Math --> A1_ELA: Complete ELA
    A1_ELA --> A1_Science: Complete Science
    A1_Science --> A1_Social: Complete Social
    A1_Social --> A1_Experience: Apply Skills
    A1_Experience --> A1_Discover: Explore
    A1_Discover --> A1_Complete: Mark Complete
    
    A1_Complete --> A2_Started: Next Day
    A2_Started --> A2_Complete: [Similar Flow]
    A2_Complete --> A3_Started: Next Day
    A3_Started --> A3_Complete: [Similar Flow]
    A3_Complete --> A4_Started: Next Day
    A4_Started --> A4_Complete: [Similar Flow]
    A4_Complete --> A5_Started: Next Day
    A5_Started --> A5_Complete: [Similar Flow]
    
    A5_Complete --> Review_Started: All Skills Done
    Review_Started --> Review_Complete: Pass Review
    Review_Complete --> Assessment_Started: Start Test
    
    Assessment_Started --> Assessment_Pass: Score ≥80%
    Assessment_Started --> Assessment_Fail: Score <80%
    
    Assessment_Pass --> B1_Started: Advance
    Assessment_Fail --> Review_Started: Retry
    
    B1_Started --> [*]: Continue Learning
```

## Error Handling Flow

```mermaid
graph TD
    Action[User Action] --> Try{Try Operation}
    
    Try -->|Success| Continue[Continue Flow]
    Try -->|Error| Catch[Catch Error]
    
    Catch --> ErrorType{Error Type?}
    
    ErrorType -->|Network| Retry[Retry with Backoff]
    ErrorType -->|Data Missing| Fallback[Use Fallback Data]
    ErrorType -->|Invalid State| Reset[Reset to Safe State]
    ErrorType -->|Unknown| Log[Log & Show Message]
    
    Retry -->|Success| Continue
    Retry -->|Fail 3x| Offline[Offline Mode]
    
    Fallback --> Continue
    Reset --> Safe[Return to Dashboard]
    Log --> Support[Contact Support]
    
    Offline --> Cache[Use Cached Content]
    Cache --> Continue
```

## Performance Optimization Flow

```mermaid
graph LR
    subgraph "Initial Load"
        Login[Student Login] --> LoadMin[Load Minimum Data]
        LoadMin --> ShowUI[Show UI Quickly]
    end
    
    subgraph "Progressive Loading"
        ShowUI --> Background[Background Tasks]
        Background --> LoadSkills[Load Today's Skills]
        Background --> PreloadNext[Preload Tomorrow]
        Background --> CacheImages[Cache Images]
    end
    
    subgraph "Caching Strategy"
        Cache[(Cache)]
        LoadSkills --> Cache
        Cache --> CheckExpiry{Expired?}
        CheckExpiry -->|No| UseCache[Use Cached]
        CheckExpiry -->|Yes| Refresh[Refresh Data]
        Refresh --> Cache
    end
    
    subgraph "AI Content Generation"
        Generate[Generate Content] --> CheckCache{In Cache?}
        CheckCache -->|Yes| Return[Return Cached]
        CheckCache -->|No| CallAI[Call AI Service]
        CallAI --> StoreCache[Store in Cache]
        StoreCache --> Return
    end
```

---

## Key Decision Points

### When to Show Review?
```
IF all skills A.1-A.5 are complete
AND review not yet done
THEN show ReviewContainer
```

### When to Show Assessment?
```
IF all skills A.1-A.5 are complete
AND review is complete
AND assessment not yet done
THEN show AssessmentContainer
```

### When to Advance Category?
```
IF assessment score >= 80%
THEN advance to next category (B.1)
ELSE return to practice weak areas
```

### How to Determine Daily Skill?
```
1. Check completedSkills array
2. Find first incomplete skill in current category
3. If all complete, check for review/assessment
4. If category complete, advance to next
```

---

*These diagrams provide a visual understanding of the learning system's flow and architecture.*