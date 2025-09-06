# APPLICATION INTEGRATION PLAN: Connecting Current Logic to New Database Structure
## Phase 2 of System Overhaul - After Database Setup

**Created**: 2025-08-26  
**Prerequisite**: FINAL_IMPLEMENTATION_PLAN.md must be completed first  
**Objective**: Refactor existing application to use database-driven architecture instead of hardcoded data

---

## 🎯 INTEGRATION OVERVIEW

### Current State (Browser-Based):
- Question types hardcoded in services
- Skills data loaded from text files
- Detection logic scattered across multiple files
- No career path integration
- No Common Core alignment

### Target State (Database-Driven):
- Question types from `question_type_definitions` table
- Skills from `skills_master_v2` and `common_core_standards` tables
- Centralized detection using `detection_rules` table
- Career paths from `career_paths` and mappings
- Common Core aligned learning

---

## 📋 PHASE A: SERVICE LAYER REFACTORING (Days 11-13)
**Prerequisite**: Database migrations and data imports complete

### A.1: Replace Hardcoded Question Types
**Files to Update**:

#### `/src/services/AILearningJourneyService.ts`
```typescript
// BEFORE (Current):
const questionTypes = {
  'true_false': { /* hardcoded */ },
  'multiple_choice': { /* hardcoded */ },
  // ... 13 more types
};

// AFTER (New):
import { DatabaseQuestionTypeService } from './database/DatabaseQuestionTypeService';

async function detectQuestionType(content, skill, student) {
  // Use database-driven detection
  const detectedType = await DatabaseQuestionTypeService.detectQuestionType(
    content.assessment.question,
    student.grade_level,
    skill.subject
  );
  
  content.assessment.type = detectedType;
  
  // Log detection for monitoring
  await logDetectionEvent(student.id, detectedType, content);
}
```

#### `/src/services/content/QuestionTemplateEngine.ts`
```typescript
// BEFORE (Current):
getQuestionTypes(grade, subject) {
  // Hardcoded logic
  if (grade === '10') {
    return ['multiple_choice', 'true_false', ...];
  }
}

// AFTER (New):
async getQuestionTypes(grade: string, subject: string) {
  const { data } = await supabase
    .from('grade_configurations')
    .select('preferred_types, unsuitable_types, testable_types')
    .eq('grade', grade)
    .single();
    
  const { data: types } = await supabase
    .from('question_type_definitions')
    .select('*')
    .in('id', data.testable_types)
    .order('priority');
    
  return types;
}
```

#### `/src/services/pathIQService.ts`
```typescript
// Update to use database question types
async function generateAssessment(skill, grade, subject) {
  const questionTypes = await DatabaseQuestionTypeService.getQuestionTypesForGrade(
    grade, 
    subject
  );
  // Rest of generation logic
}
```

---

### A.2: Replace Skills Data Loading
**Files to Update**:

#### `/src/services/content/JustInTimeContentService.ts`
```typescript
// BEFORE (Current):
import { skillsDataComplete_Grade10 } from '../data/skillsDataComplete_Grade10.txt';

function getSkillsForGrade(grade) {
  // Parse text file
  return parseSkillsFile(skillsDataComplete_Grade10);
}

// AFTER (New):
async function getSkillsForGrade(grade: string, subject?: string, careerPath?: string) {
  if (careerPath) {
    // Career-aligned skills from Common Core
    const { data } = await supabase
      .from('career_standard_mapping')
      .select(`
        common_core_standards (
          common_core_id,
          skill_name,
          subject,
          grade,
          skills_area,
          difficulty_level
        )
      `)
      .eq('career_code', careerPath)
      .eq('common_core_standards.grade', grade)
      .in('relevance_level', ['Essential', 'Recommended']);
      
    return data.map(d => d.common_core_standards);
  } else {
    // Traditional subject-based skills
    const { data } = await supabase
      .from('skills_master_v2')
      .select('*')
      .eq('grade', grade)
      .eq('subject', subject);
      
    return data;
  }
}
```

#### `/src/components/ai-containers/AILearnContainerV2.tsx`
```typescript
// BEFORE (Current):
const skills = skillsData[grade][subject];

// AFTER (New):
const [skills, setSkills] = useState([]);

useEffect(() => {
  async function loadSkills() {
    const userCareerPath = await getUserCareerPath(userId);
    const skillsData = await getSkillsForGrade(
      grade, 
      subject,
      userCareerPath
    );
    setSkills(skillsData);
  }
  loadSkills();
}, [grade, subject, userId]);
```

---

### A.3: Implement Career Path Integration
**New Components/Services**:

#### `/src/services/CareerPathService.ts` (NEW)
```typescript
export class CareerPathService {
  static async getUserCareerPath(userId: string) {
    const { data } = await supabase
      .from('student_career_interests')
      .select('primary_career_code')
      .eq('student_id', userId)
      .single();
      
    return data?.primary_career_code;
  }
  
  static async setUserCareerPath(userId: string, careerCode: string) {
    await supabase
      .from('student_career_interests')
      .upsert({
        student_id: userId,
        primary_career_code: careerCode,
        interest_level: 7,
        confidence_level: 5
      });
  }
  
  static async calculateReadiness(userId: string, careerCode: string) {
    const { data } = await supabase
      .rpc('calculate_career_readiness', {
        p_student_id: userId,
        p_career_code: careerCode
      });
      
    return data;
  }
  
  static async getCareerRelevantSkills(careerCode: string, grade: string) {
    const { data } = await supabase
      .from('career_standard_mapping')
      .select(`
        common_core_standards (*)
      `)
      .eq('career_code', careerCode)
      .eq('common_core_standards.grade', grade)
      .order('relevance_score', { ascending: false });
      
    return data.map(d => d.common_core_standards);
  }
}
```

#### Update `/src/screens/modal-first/sub-modals/CareerChoiceModal.tsx`
```typescript
// Add career selection that updates database
const handleCareerSelection = async (careerCode: string) => {
  await CareerPathService.setUserCareerPath(userId, careerCode);
  
  // Calculate initial readiness
  const readiness = await CareerPathService.calculateReadiness(userId, careerCode);
  
  // Update UI with readiness score
  setCareerReadiness(readiness);
  
  // Load career-relevant skills
  const skills = await CareerPathService.getCareerRelevantSkills(careerCode, grade);
  setAvailableSkills(skills);
};
```

---

### A.4: Update Content Generation
**Files to Update**:

#### `/src/services/AILearningJourneyService.ts`
```typescript
// BEFORE (Current):
async function generateContent(skill, grade, subject) {
  // Uses hardcoded logic
}

// AFTER (New):
async function generateContent(skill, grade, subject, careerContext = null) {
  // Check cache first
  const cached = await checkContentCache(skill.id, grade, subject);
  if (cached) return cached;
  
  // Get appropriate question types from database
  const questionTypes = await DatabaseQuestionTypeService.getQuestionTypesForGrade(
    grade,
    subject
  );
  
  // If career context, add career relevance to prompt
  let prompt = buildBasePrompt(skill, grade, subject);
  if (careerContext) {
    const careerApplication = await getCareerApplication(skill.id, careerContext);
    prompt += `\nCareer Context: ${careerApplication}`;
  }
  
  // Generate content
  const content = await generateAIContent(prompt);
  
  // Cache the result
  await cacheContent(skill.id, grade, subject, content);
  
  return content;
}
```

---

## 📋 PHASE B: DETECTION SYSTEM MIGRATION (Days 14-15)

### B.1: Centralize Detection Logic
**Create New Service**:

#### `/src/services/database/DetectionService.ts` (NEW)
```typescript
export class DetectionService {
  private static detectionRules: DetectionRule[] = null;
  
  static async loadDetectionRules() {
    if (this.detectionRules) return;
    
    const { data } = await supabase
      .from('detection_rules')
      .select('*')
      .order('priority');
      
    this.detectionRules = data;
  }
  
  static async detectQuestionType(
    text: string, 
    grade: string, 
    subject: string
  ): Promise<string> {
    await this.loadDetectionRules();
    
    const normalizedText = text.toLowerCase();
    
    // Apply rules in priority order
    for (const rule of this.detectionRules) {
      if (this.matchesRule(normalizedText, rule)) {
        // Log detection
        await this.logDetection(text, grade, subject, rule.type_id);
        return rule.type_id;
      }
    }
    
    // Default fallback
    return 'multiple_choice';
  }
  
  private static matchesRule(text: string, rule: DetectionRule): boolean {
    const pattern = new RegExp(rule.pattern, rule.flags || 'i');
    return pattern.test(text);
  }
  
  private static async logDetection(
    text: string,
    grade: string,
    subject: string,
    detectedType: string
  ) {
    await supabase
      .from('question_validation_log')
      .insert({
        question_text: text,
        grade,
        subject,
        detected_type: detectedType,
        detection_timestamp: new Date().toISOString()
      });
  }
}
```

### B.2: Remove Scattered Detection Logic
**Files to Clean Up**:

- `/src/services/AILearningJourneyService.ts` - Remove inline detection
- `/src/services/content/QuestionTemplateEngine.ts` - Remove detection methods
- `/src/services/pathIQService.ts` - Use centralized detection
- `/src/components/ai-containers/*.tsx` - Remove any local detection

---

## 📋 PHASE C: PROGRESS TRACKING INTEGRATION (Days 16-17)

### C.1: Implement Student Progress Tracking

#### `/src/services/ProgressTrackingService.ts` (NEW)
```typescript
export class ProgressTrackingService {
  static async updateSkillProgress(
    studentId: string,
    skillId: string,
    status: 'in_progress' | 'completed' | 'mastered',
    score?: number
  ) {
    // Update Common Core progress
    await supabase
      .from('student_common_core_progress')
      .upsert({
        student_id: studentId,
        common_core_id: skillId,
        status,
        progress_percentage: this.calculateProgress(status),
        average_score: score,
        last_activity_at: new Date().toISOString()
      });
      
    // Update career readiness if applicable
    const careerPath = await CareerPathService.getUserCareerPath(studentId);
    if (careerPath) {
      await supabase.rpc('calculate_career_readiness', {
        p_student_id: studentId,
        p_career_code: careerPath
      });
    }
  }
  
  static async getStudentProgress(studentId: string, subject?: string) {
    const query = supabase
      .from('student_common_core_progress')
      .select(`
        *,
        common_core_standards (
          skill_name,
          subject,
          grade,
          difficulty_level
        )
      `)
      .eq('student_id', studentId);
      
    if (subject) {
      query.eq('common_core_standards.subject', subject);
    }
    
    const { data } = await query;
    return data;
  }
  
  private static calculateProgress(status: string): number {
    const progressMap = {
      'not_started': 0,
      'in_progress': 50,
      'completed': 80,
      'mastered': 100
    };
    return progressMap[status] || 0;
  }
}
```

### C.2: Update Container Components

#### Update all AI Container components:
```typescript
// In AILearnContainerV2.tsx, AIExperienceContainerV2.tsx, etc.
const handleQuestionComplete = async (correct: boolean, score: number) => {
  // Update progress in database
  await ProgressTrackingService.updateSkillProgress(
    userId,
    currentSkill.common_core_id || currentSkill.id,
    correct ? 'completed' : 'in_progress',
    score
  );
  
  // Pre-generate next content
  if (correct) {
    await preGenerateNextContent(currentSkill, containerType);
  }
};
```

---

## 📋 PHASE D: CACHING & PERFORMANCE (Days 18-19)

### D.1: Implement Content Caching

#### `/src/services/CacheService.ts` (NEW)
```typescript
export class CacheService {
  static async getContent(
    skillId: string,
    grade: string,
    containerType: string
  ) {
    const { data } = await supabase
      .from('content_cache')
      .select('content_data')
      .eq('skill_id', skillId)
      .eq('grade', grade)
      .eq('container_type', containerType)
      .gt('expires_at', new Date().toISOString())
      .single();
      
    if (data) {
      // Update access count
      await supabase
        .from('content_cache')
        .update({ 
          access_count: data.access_count + 1,
          last_accessed: new Date().toISOString()
        })
        .eq('skill_id', skillId)
        .eq('grade', grade)
        .eq('container_type', containerType);
    }
    
    return data?.content_data;
  }
  
  static async setContent(
    skillId: string,
    grade: string,
    containerType: string,
    content: any
  ) {
    await supabase
      .from('content_cache')
      .upsert({
        skill_id: skillId,
        grade,
        container_type: containerType,
        content_data: content,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        created_at: new Date().toISOString()
      });
  }
  
  static async warmCache(studentId: string) {
    // Pre-load likely next content
    const progress = await ProgressTrackingService.getStudentProgress(studentId);
    const nextSkills = this.predictNextSkills(progress);
    
    for (const skill of nextSkills) {
      // Queue for background generation
      await this.queueForGeneration(skill);
    }
  }
}
```

### D.2: Implement Pre-generation Queue

#### `/src/services/PreGenerationService.ts` (NEW)
```typescript
export class PreGenerationService {
  static async queueContent(
    skillId: string,
    grade: string,
    containerType: string,
    priority: number = 5
  ) {
    await supabase
      .from('generation_queue')
      .insert({
        skill_id: skillId,
        grade,
        container_type: containerType,
        priority,
        status: 'pending'
      });
  }
  
  static async processQueue() {
    // Get next item from queue
    const { data: item } = await supabase
      .from('generation_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .limit(1)
      .single();
      
    if (!item) return;
    
    // Mark as processing
    await supabase
      .from('generation_queue')
      .update({ status: 'processing' })
      .eq('id', item.id);
    
    try {
      // Generate content
      const content = await AILearningJourneyService.generateContent(
        item.skill_id,
        item.grade,
        item.container_type
      );
      
      // Cache it
      await CacheService.setContent(
        item.skill_id,
        item.grade,
        item.container_type,
        content
      );
      
      // Mark as completed
      await supabase
        .from('generation_queue')
        .update({ status: 'completed' })
        .eq('id', item.id);
    } catch (error) {
      // Mark as failed
      await supabase
        .from('generation_queue')
        .update({ 
          status: 'failed',
          error_message: error.message 
        })
        .eq('id', item.id);
    }
  }
}

// Background worker (runs every 10 seconds)
setInterval(() => {
  PreGenerationService.processQueue();
}, 10000);
```

---

## 📋 PHASE E: REMOVE OLD CODE (Days 20-21)

### E.1: Remove Hardcoded Data Files
**Files to Remove/Archive**:
- `/src/data/questionTypes.js` - Move to archive
- `/src/data/hardcodedSkills.js` - Move to archive
- Inline question type definitions in services

### E.2: Remove Old Detection Logic
**Code to Remove**:
```typescript
// Remove from AILearningJourneyService.ts
if (content.assessment.visual && skill.subject === 'Math' && student.grade_level <= '2') {
  content.assessment.type = 'counting';
}
// ... other hardcoded detection
```

### E.3: Clean Up Imports
```typescript
// Remove these imports from all files:
import { questionTypes } from '../data/questionTypes';
import { skillsData } from '../data/skillsData';
// Replace with:
import { DatabaseQuestionTypeService } from './database/DatabaseQuestionTypeService';
import { SkillsService } from './database/SkillsService';
```

---

## 📋 PHASE F: TESTING THE INTEGRATION (Days 22-23)

### F.1: Integration Test Suite
```typescript
describe('Database Integration Tests', () => {
  test('Question types load from database', async () => {
    const types = await DatabaseQuestionTypeService.getAllTypes();
    expect(types).toHaveLength(15);
    expect(types[0]).toHaveProperty('priority');
  });
  
  test('Detection uses database rules', async () => {
    const type = await DetectionService.detectQuestionType(
      'True or False: The earth is round',
      '10',
      'Science'
    );
    expect(type).toBe('true_false');
  });
  
  test('Career path skills filter correctly', async () => {
    const skills = await CareerPathService.getCareerRelevantSkills(
      'engineering',
      '10'
    );
    expect(skills.length).toBeGreaterThan(0);
    expect(skills[0]).toHaveProperty('common_core_id');
  });
  
  test('Progress tracking updates database', async () => {
    await ProgressTrackingService.updateSkillProgress(
      'test-user',
      'HSA-SSE.A.1',
      'completed',
      85
    );
    const progress = await ProgressTrackingService.getStudentProgress('test-user');
    expect(progress).toContainEqual(
      expect.objectContaining({ 
        common_core_id: 'HSA-SSE.A.1',
        status: 'completed'
      })
    );
  });
});
```

### F.2: End-to-End Testing
```typescript
describe('E2E: Complete Learning Journey', () => {
  test('Student selects career and completes skill', async () => {
    // 1. Select career
    await CareerPathService.setUserCareerPath('taylor', 'engineering');
    
    // 2. Load career-relevant skills
    const skills = await getSkillsForGrade('10', null, 'engineering');
    expect(skills.length).toBeGreaterThan(0);
    
    // 3. Generate content (should use cache or queue)
    const content = await generateContent(skills[0], '10', 'Math', 'engineering');
    expect(content).toHaveProperty('assessment');
    
    // 4. Detect question type
    const type = await DetectionService.detectQuestionType(
      content.assessment.question,
      '10',
      'Math'
    );
    expect(type).toBeTruthy();
    
    // 5. Complete skill
    await ProgressTrackingService.updateSkillProgress(
      'taylor',
      skills[0].common_core_id,
      'completed',
      90
    );
    
    // 6. Check career readiness update
    const readiness = await CareerPathService.calculateReadiness('taylor', 'engineering');
    expect(readiness).toBeGreaterThan(0);
  });
});
```

---

## 📊 MIGRATION VERIFICATION CHECKLIST

### Before Marking Complete:
- [ ] All services using database instead of hardcoded data
- [ ] Question type detection using detection_rules table
- [ ] Skills loading from skills_master_v2 or common_core_standards
- [ ] Career path selection working
- [ ] Progress tracking updating database
- [ ] Content caching implemented
- [ ] Pre-generation queue working
- [ ] Old hardcoded logic removed
- [ ] All tests passing
- [ ] Performance metrics maintained or improved

### Performance Targets:
| Metric | Target | Measurement |
|--------|--------|-------------|
| Skill Load Time | <200ms | From database with caching |
| Question Detection | <50ms | Using cached rules |
| Content Generation | <100ms | From cache, <2s if generating |
| Progress Update | <100ms | Database write |
| Career Readiness Calc | <500ms | Database function |

---

## 🚨 ROLLBACK PLAN

If integration causes issues:

### 1. Feature Flag Approach
```typescript
// Add to environment variables
VITE_USE_DATABASE_INTEGRATION=false

// In services
if (process.env.VITE_USE_DATABASE_INTEGRATION === 'true') {
  // Use database
  return await DatabaseQuestionTypeService.getTypes();
} else {
  // Use old hardcoded
  return hardcodedQuestionTypes;
}
```

### 2. Quick Rollback
```bash
# Revert to previous commit
git revert HEAD
npm run build
npm run deploy

# Keep database but use old logic
UPDATE feature_flags SET enabled = false WHERE feature = 'database_integration';
```

---

## 📅 TIMELINE

This integration happens AFTER the initial database setup:

| Phase | Duration | Dependencies | Start | End |
|-------|----------|--------------|-------|-----|
| A. Service Refactoring | 3 days | DB setup complete | Day 11 | Day 13 |
| B. Detection Migration | 2 days | Phase A | Day 14 | Day 15 |
| C. Progress Tracking | 2 days | Phase B | Day 16 | Day 17 |
| D. Caching & Performance | 2 days | Phase C | Day 18 | Day 19 |
| E. Remove Old Code | 2 days | Phase D | Day 20 | Day 21 |
| F. Integration Testing | 2 days | Phase E | Day 22 | Day 23 |

**Total Additional Time**: 13 days after initial 10-day implementation

---

## 📝 KEY INTEGRATION POINTS

### Critical Files That Bridge Old and New:
1. **AILearningJourneyService.ts** - Main content generation
2. **QuestionTemplateEngine.ts** - Question type selection
3. **JustInTimeContentService.ts** - Skill loading
4. **All AI Container Components** - UI integration
5. **CareerChoiceModal.tsx** - Career selection

### New Services That Replace Old Logic:
1. **DatabaseQuestionTypeService** - Replaces hardcoded types
2. **DetectionService** - Replaces scattered detection
3. **CareerPathService** - New career functionality
4. **ProgressTrackingService** - New progress tracking
5. **CacheService** - New performance layer
6. **PreGenerationService** - New background processing

---

This integration plan ensures that once the database is set up (from FINAL_IMPLEMENTATION_PLAN.md), we can systematically update the application to use it, rather than continuing with the old hardcoded approach.