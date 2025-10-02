# Full Integration Checklist for Lesson Plan System

## Current Status
✅ **Completed:**
- StandardizedLessonPlan.ts template structure
- LessonArchiveService.ts for Azure Storage
- Booster framework design
- Career database (273 careers)
- Generic tools library design

🚧 **In Progress:**
- PDF generator for lesson plans

⏳ **Pending:**
- Full system integration

---

## Integration Tasks Required

### 1. Database Setup (Supabase)
```sql
-- Need to create these tables:
- lesson_archives          -- Main storage metadata
- parent_access_logs       -- Track parent views
- bulk_exports            -- Export history
- lesson_metrics          -- Performance tracking
```

**Action Required:**
```bash
# Run migration
psql $DATABASE_URL -f database/migrations/021_lesson_archive_tables.sql
```

### 2. PDF Generator Component
```typescript
// src/services/pdf/PDFGenerator.ts
class PDFGenerator {
  static async generateLessonPlanPDF(
    lessonPlan: StandardizedLessonPlan
  ): Promise<Buffer> {
    // Using react-pdf or puppeteer
    // Generate formatted PDF with:
    // - Cover page with student name, career, date
    // - Learning objectives
    // - Activities and instructions
    // - Parent guide
    // - Assessment rubric
  }
}
```

**Dependencies to install:**
```bash
npm install @react-pdf/renderer
# or
npm install puppeteer
```

### 3. Connect LessonPlanGenerator to Services

#### A. Wire up MasterNarrativeGenerator
```typescript
// src/services/LessonPlanOrchestrator.ts
import { MasterNarrativeGenerator } from './narrative/MasterNarrativeGenerator';
import { JustInTimeContentService } from './content/JustInTimeContentService';
import { lessonArchive } from './storage/LessonArchiveService';

class LessonPlanOrchestrator {
  async generateDailyLessons(student: Student) {
    // 1. Get today's curriculum skills
    const todaySkills = await this.getCurriculumSkills(student.gradeLevel);

    // 2. Get student's selected career
    const career = await this.getStudentCareer(student.id);

    // 3. Get subscription/template type
    const template = await this.getTemplateType(student.subscription);

    // 4. For each subject, generate lesson
    for (const skill of todaySkills) {
      const lessonPlan = await this.generateLesson(
        student,
        career,
        skill,
        template
      );

      // 5. Generate PDF
      const pdfBuffer = await PDFGenerator.generateLessonPlanPDF(lessonPlan);

      // 6. Archive to Azure
      await lessonArchive.archiveLessonPlan(lessonPlan, pdfBuffer);
    }
  }
}
```

#### B. Integrate with existing components
```typescript
// Connect to existing infrastructure:
- NarrativeLearnContainer → Display lesson narrative
- InstructionalVideoComponent → Play lesson videos
- AICompanionModalV2 → Spark guides the lesson
```

### 4. Update Spark AI Companion

```typescript
// src/screens/modal-first/sub-modals/AICompanionModalV2.tsx
// Add lesson orchestration capabilities

interface SparkLessonMode {
  currentLesson: StandardizedLessonPlan;
  currentSection: 'learn' | 'video' | 'practice' | 'assessment';

  startLesson(lessonPlan: StandardizedLessonPlan): void {
    // Spark introduces the lesson
    this.speak(`Hi ${lessonPlan.student.name}! Ready to be a ${lessonPlan.career.careerName} today?`);
    // Navigate to learn section
    this.navigateToSection('learn');
  }

  guideSection(section: string): void {
    // Spark provides context for each section
    switch(section) {
      case 'learn':
        this.speak('Let me tell you about...');
        break;
      case 'practice':
        this.speak('Now let\'s practice...');
        break;
    }
  }
}
```

### 5. Parent Dashboard Component

```typescript
// src/components/parent/ParentLessonDashboard.tsx
export const ParentLessonDashboard = () => {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    // Fetch child's lessons
    lessonArchive.getStudentLessons(childName).then(setLessons);
  }, []);

  return (
    <div>
      <h2>Sam's Learning Journey</h2>
      <WeeklyProgress lessons={lessons} />
      <LessonHistory lessons={lessons} />
      <DownloadButtons lessons={lessons} />
    </div>
  );
};
```

### 6. Environment Variables Setup

```env
# .env.local
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=pathfinitystorage;AccountKey=...;EndpointSuffix=core.windows.net
AZURE_STORAGE_ACCOUNT_NAME=pathfinitystorage
NEXT_PUBLIC_STORAGE_URL=https://pathfinitystorage.blob.core.windows.net
```

### 7. API Routes for Lesson Generation

```typescript
// src/pages/api/lessons/generate.ts
export async function POST(req: Request) {
  const { studentId, date } = await req.json();

  // Generate lessons for the day
  const orchestrator = new LessonPlanOrchestrator();
  const lessons = await orchestrator.generateDailyLessons(studentId, date);

  return Response.json({ lessons });
}

// src/pages/api/lessons/[lessonId]/pdf.ts
export async function GET(req: Request, { params }) {
  const { lessonId } = params;

  // Generate parent access link
  const accessUrl = await lessonArchive.generateParentAccessLink(lessonId);

  return Response.redirect(accessUrl);
}
```

### 8. Daily Lesson Scheduler

```typescript
// src/services/scheduler/DailyLessonScheduler.ts
class DailyLessonScheduler {
  async scheduleDailyLessons() {
    // Run every day at 6 AM
    const students = await this.getActiveStudents();

    for (const student of students) {
      await this.generateAndNotify(student);
    }
  }

  async generateAndNotify(student: Student) {
    // Generate lessons
    const lessons = await orchestrator.generateDailyLessons(student);

    // Notify parent
    await this.sendParentNotification(student.parentEmail, lessons);

    // Prepare Spark
    await this.prepareSparkForDay(student.id, lessons);
  }
}
```

### 9. Testing Flow

```typescript
// src/tests/lesson-generation.test.ts
describe('Lesson Generation E2E', () => {
  it('should generate a complete lesson for Sam', async () => {
    // 1. Create test student
    const sam = { name: 'Sam', gradeLevel: 'K' };

    // 2. Set career
    const career = 'CHEF';

    // 3. Set curriculum skill
    const skill = { subject: 'Math', objective: 'Count to 3' };

    // 4. Generate lesson
    const lesson = await generator.generateLesson(sam, career, skill);

    // 5. Verify all components
    expect(lesson.content.narrativeContext).toBeDefined();
    expect(lesson.content.practice).toBeDefined();
    expect(lesson.content.assessment).toBeDefined();

    // 6. Generate PDF
    const pdf = await PDFGenerator.generateLessonPlanPDF(lesson);
    expect(pdf).toBeInstanceOf(Buffer);

    // 7. Archive
    const result = await lessonArchive.archiveLessonPlan(lesson, pdf);
    expect(result.pdfUrl).toContain('blob.core.windows.net');
  });
});
```

---

## Implementation Order

### Week 1: Core Infrastructure
1. ✅ Create Supabase tables (Day 1)
2. ⬜ Build PDF generator (Day 2-3)
3. ⬜ Connect to MasterNarrativeGenerator (Day 4)
4. ⬜ Test lesson generation (Day 5)

### Week 2: Integration
1. ⬜ Wire up Spark orchestration (Day 1-2)
2. ⬜ Build parent dashboard (Day 3-4)
3. ⬜ Create API endpoints (Day 5)

### Week 3: Polish
1. ⬜ Add daily scheduler
2. ⬜ Implement parent notifications
3. ⬜ Performance optimization
4. ⬜ Error handling

### Week 4: Launch Prep
1. ⬜ Full E2E testing
2. ⬜ Load testing with 100 students
3. ⬜ Parent onboarding flow
4. ⬜ Documentation

---

## Quick Start Commands

```bash
# Install dependencies
npm install @react-pdf/renderer @azure/storage-blob

# Create database tables
npm run migrate

# Test lesson generation
npm run test:lessons

# Start development
npm run dev
```

---

## Success Criteria

- [ ] Generate 1 lesson in < 5 seconds
- [ ] PDF generation in < 3 seconds
- [ ] Parent can access PDF within 10 seconds
- [ ] Spark successfully guides through lesson
- [ ] Archives searchable by date/career/subject
- [ ] 100 concurrent users supported

---

## Next Immediate Steps

1. **Create Supabase tables** (30 min)
   ```sql
   -- Simple schema for lesson_archives table
   ```

2. **Build minimal PDF generator** (2 hours)
   ```typescript
   // Basic PDF with lesson content
   ```

3. **Connect one service** (1 hour)
   ```typescript
   // Wire up MasterNarrativeGenerator
   ```

4. **Test with Sam + Chef** (30 min)
   ```typescript
   // Generate one complete lesson
   ```

This gets you to a working prototype in less than 1 day!