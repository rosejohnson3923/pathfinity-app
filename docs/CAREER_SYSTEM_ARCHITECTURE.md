# Career System Architecture
## Scalable & Age-Appropriate Career Framework

### Overview
The Career System is designed to be highly scalable and age-appropriate, supporting unlimited career additions while ensuring content is properly graduated by student age/grade level.

---

## 🏗️ Architecture Components

### 1. CareerAIRulesEngine
- **Purpose**: Core rules engine for career-specific adaptations
- **Location**: `src/rules-engine/career/CareerAIRulesEngine.ts`
- **Lines**: 1,500+
- **Features**:
  - 15 default careers fully implemented
  - Vocabulary adaptation system
  - Scenario generation
  - Visual theming
  - Mentorship system
  - Badge and achievement tracking

### 2. CareerProgressionSystem (NEW)
- **Purpose**: Manages age-appropriate career exposure levels
- **Location**: `src/rules-engine/career/CareerProgressionSystem.ts`
- **Lines**: 650+
- **Features**:
  - 5 progression levels (Explorer → Expert)
  - Age-appropriate content delivery
  - Scalable career registration
  - Career import/export system
  - CareerBuilder helper class

---

## 📊 Progression Levels

### Career Exposure Levels by Grade

| Level | Label | Grades | Age Range | Focus |
|-------|-------|--------|-----------|--------|
| **EXPLORER** | Little Helper [Career] | K-1 | 5-7 years | Basic introduction, "What does X do?" |
| **APPRENTICE** | [Career] in Training | 2-3 | 7-9 years | Learn tools and basic activities |
| **PRACTITIONER** | Junior [Career] | 4-5 | 9-11 years | Understand processes and skills |
| **SPECIALIST** | [Career] Specialist | 6-8 | 11-14 years | Deeper knowledge, specializations |
| **EXPERT** | [Career] Expert | 9-12 | 14+ years | Career pathways, advanced concepts |

### Example: Doctor Career Progression

```typescript
Grade K-1: "Little Helper Doctor"
- Vocabulary: sick, healthy, medicine, boo-boo
- Tools: toy stethoscope, bandaids
- Activity: "Check teddy bear's temperature"

Grade 2-3: "Doctor in Training"
- Vocabulary: patient, symptom, diagnosis
- Tools: real stethoscope, thermometer
- Activity: "Create a healthy habits chart"

Grade 4-5: "Junior Doctor"
- Vocabulary: immune system, specialist, prescription
- Tools: x-ray viewer, microscope
- Activity: "Diagnose mystery illness"
```

---

## 🚀 Adding New Careers (Scalable)

### Method 1: Using CareerBuilder

```typescript
import { CareerBuilder, CareerExposureLevel } from './CareerProgressionSystem';

const newCareer = new CareerBuilder()
  .setBasicInfo('robotics_engineer', 'Robotics Engineer', 'Technology')
  .setBaseProfile({
    description: 'Robotics engineers design and build robots',
    coreSkills: ['programming', 'engineering', 'creativity'],
    primaryTools: ['computer', 'sensors', '3D printer'],
    workEnvironments: ['lab', 'factory', 'research center'],
    iconEmoji: '🤖',
    themeColor: '#FF6B6B',
    introductionAge: '6+'
  })
  .addProgressionLevel(CareerExposureLevel.EXPLORER, {
    level: CareerExposureLevel.EXPLORER,
    label: 'Robot Friend',
    vocabulary: ['robot', 'move', 'help', 'build'],
    concepts: ['robots help people', 'following instructions'],
    activities: ['draw a robot', 'robot says game'],
    tools: ['blocks', 'toy robot'],
    scenarios: ['Your robot helps clean up...'],
    roleModels: [{
      name: 'Baymax',
      achievement: 'Healthcare companion robot',
      quote: 'I will always help you',
      ageAppropriate: true
    }],
    dailyTasks: ['make robot move', 'help people'],
    challenges: ['making it work'],
    rewards: ['cool robots', 'helping others']
  })
  .build();

// Register the career
careerProgressionSystem.registerCareer(newCareer);
```

### Method 2: JSON Import

```json
{
  "id": "marine_biologist",
  "name": "Marine Biologist",
  "category": "Science",
  "baseProfile": {
    "description": "Marine biologists study ocean life",
    "coreSkills": ["observation", "swimming", "research"],
    "primaryTools": ["microscope", "diving gear", "camera"],
    "workEnvironments": ["ocean", "aquarium", "lab"],
    "iconEmoji": "🐠",
    "themeColor": "#0891B2",
    "introductionAge": "5+"
  },
  "progressionLevels": {
    "explorer": {
      "level": "explorer",
      "label": "Ocean Explorer",
      "vocabulary": ["fish", "ocean", "swim", "coral"],
      "concepts": ["ocean animals", "keeping oceans clean"],
      "activities": ["identify sea creatures", "ocean cleanup game"],
      "tools": ["aquarium", "picture books"],
      "scenarios": ["A dolphin needs help..."],
      "roleModels": [...]
    }
  }
}
```

---

## 🎯 Integration Points

### 1. With Learn Container
```typescript
// Get age-appropriate career content
const careerContent = careerProgressionSystem.getCareerContentForGrade(
  'doctor',
  student.grade
);

// Apply career vocabulary to questions
const adaptedQuestion = await careerAIRulesEngine.execute({
  career: { name: 'Doctor' },
  student: { grade: '3' },
  activity: { subject: 'math' }
});
```

### 2. With Companion Messages
```typescript
// Get career-specific companion message with appropriate label
const label = careerProgressionSystem.getCareerLabel('scientist', grade);
const message = `As a ${label}, you're doing great!`;
```

### 3. With Gamification
```typescript
// Award career-specific badges based on level
const level = careerProgressionSystem.getExposureLevelForGrade(grade);
const badges = careerAIRulesEngine.getCareerBadgesForLevel(career, level);
```

---

## 📈 Scalability Features

### 1. Dynamic Registration
- Add careers at runtime without code changes
- Import/export careers as JSON
- Version control for career definitions

### 2. Validation System
- Automatic validation of new careers
- Required progression levels check
- Age-appropriateness verification

### 3. Event System
```typescript
// Emit events when careers are added
careerProgressionSystem.on('careerRegistered', (career) => {
  // Update UI
  // Notify other systems
  // Analytics tracking
});
```

### 4. Metadata Support
- Tags for categorization
- Educational standards alignment
- Popularity tracking
- Author attribution

---

## 🔒 Age-Appropriate Safeguards

### Content Complexity by Level

| Aspect | Explorer | Apprentice | Practitioner | Specialist | Expert |
|--------|----------|------------|--------------|------------|--------|
| **Vocabulary** | Basic | Intermediate | Advanced | Technical | Professional |
| **Tools** | Observe | Identify | Basic Use | Proficient | Expert |
| **Concepts** | Surface | Foundational | Comprehensive | Detailed | Mastery |
| **Problems** | Single-step | Multi-step | Analytical | Strategic | Innovative |
| **Real World** | Simple | Relatable | Practical | Industry | Professional |

### Restrictions Example
```typescript
customRules: {
  restrictions: [
    {
      type: 'age',
      condition: 'age < 10',
      message: 'Medical procedures content not available yet'
    },
    {
      type: 'grade',
      condition: 'grade < 6',
      message: 'Advanced engineering concepts unlock in middle school'
    }
  ]
}
```

---

## 📊 Current Career Distribution

### By Category
- **Healthcare**: 2 (Doctor, Veterinarian)
- **Education**: 1 (Teacher)
- **STEM**: 2 (Scientist, Engineer)
- **Arts**: 3 (Artist, Musician, Writer)
- **Service**: 1 (Chef)
- **Sports**: 1 (Athlete)
- **Technology**: 1 (Pilot)
- **Nature**: 1 (Farmer)
- **Public Safety**: 2 (Police Officer, Firefighter)
- **Exploration**: 1 (Astronaut)

### Expansion Plan
- **Phase 1**: Add 5 technology careers
- **Phase 2**: Add 5 environmental careers
- **Phase 3**: Add 5 business careers
- **Phase 4**: Add 5 trade careers
- **Target**: 50+ careers by end of year

---

## 🧪 Testing Career Additions

### Validation Checklist
- [ ] All 5 progression levels defined (minimum 3 required)
- [ ] Age-appropriate vocabulary for each level
- [ ] Role models are suitable for age group
- [ ] Tools progress from simple to complex
- [ ] Scenarios relate to grade-level understanding
- [ ] Visual theme is distinct and appropriate
- [ ] Career aligns with educational standards

### Test Commands
```typescript
// Test career registration
const success = careerProgressionSystem.registerCareer(newCareer);
console.log(`Registration: ${success ? '✅' : '❌'}`);

// Test age-appropriate content
const content = careerProgressionSystem.getCareerContentForGrade('doctor', '2');
console.log(`Grade 2 Doctor Label: ${content.label}`);

// Test progression
const level = careerProgressionSystem.getExposureLevelForGrade('K');
console.log(`Kindergarten Level: ${level}`); // Should be EXPLORER
```

---

## 🎓 Educational Alignment

### Standards Support
- **NGSS**: Science careers align with Next Generation Science Standards
- **CCSS**: Math/ELA integration in career contexts
- **ISTE**: Technology careers support digital citizenship
- **SEL**: Social-emotional learning through career exploration

### Learning Objectives by Level
1. **Explorer**: Awareness and curiosity
2. **Apprentice**: Basic understanding and identification
3. **Practitioner**: Skill development and application
4. **Specialist**: Deep knowledge and analysis
5. **Expert**: Career readiness and planning

---

## 🚦 Implementation Status

### Completed ✅
- Core CareerAIRulesEngine
- CareerProgressionSystem
- 15 default careers
- Age-appropriate levels
- Scalable registration system
- CareerBuilder helper

### In Progress 🔄
- Event system integration
- Analytics tracking
- Career recommendation engine

### Planned 📋
- Career marketplace
- Community-contributed careers
- AR/VR career experiences
- Parent dashboard for career tracking

---

## 📚 Developer Resources

### Adding a Career Checklist
1. Choose unique ID and category
2. Define base profile with emoji and color
3. Create content for minimum 3 progression levels
4. Add age-appropriate role models
5. Test with CareerBuilder
6. Validate registration
7. Document in career catalog

### API Reference
```typescript
// Core methods
registerCareer(registration: CareerRegistration): boolean
getCareerContentForGrade(careerId: string, grade: string): CareerLevelContent
getExposureLevelForGrade(grade: string): CareerExposureLevel
getCareerLabel(careerId: string, grade: string): string
getAllCareers(): CareerRegistration[]
exportCareer(careerId: string): string
importCareer(jsonData: string): boolean
```

---

**Architecture Version**: 2.0
**Last Updated**: [Current Date]
**Maintainer**: Pathfinity Development Team