# Pathfinity Functional Wireframe Inventory
> Documenting all UI elements and data requirements for clean rebuild

## 📐 Wireframe Purpose
- **NOT** for pixel-perfect design
- **YES** for understanding data flow
- **YES** for identifying required components
- **YES** for mapping user interactions

---

## 1️⃣ LOGIN/AUTH FLOW

### Login Page
```
┌─────────────────────────────────┐
│          [Logo]                 │
│                                 │
│   Email: [___________]          │
│   Password: [________]          │
│                                 │
│   [Sign In] [Sign Up]           │
│                                 │
│   [Forgot Password?]            │
└─────────────────────────────────┘
```
**Data Required:**
- Email validation
- Password validation
- Error messages
- Redirect URL after login

**Services Used:**
- `supabase.auth.signInWithPassword()`
- `supabase.auth.signUp()`

---

## 2️⃣ ONBOARDING FLOW

### Career Selection
```
┌─────────────────────────────────┐
│   "Choose Your Adventure"       │
│                                 │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│ │Chef│ │Doc │ │Eng │ │Art │    │
│ │ 👨‍🍳│ │ 👨‍⚕️│ │ 👷 │ │ 🎨 │    │
│ └────┘ └────┘ └────┘ └────┘    │
│                                 │
│ Grade: [K-12 Dropdown]          │
│                                 │
│         [Continue →]            │
└─────────────────────────────────┘
```
**Data Required:**
- Career list by grade
- Career icons/descriptions
- User grade level
- Save selection to profile

**Services Used:**
- `pathIQService.getCareers(gradeCategory)`
- `supabase.from('user_profiles').update()`

---

## 3️⃣ MAIN DASHBOARD

### Student Dashboard (Bento Grid)
```
┌─────────────────────────────────────────┐
│ Welcome back, [Name]!         🔔 👤     │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │   LEARN (100%)  │ │ EXPERIENCE(70%) │ │
│ │   [════════]    │ │   [═══════   ]  │ │
│ │   📚 Continue   │ │   🎯 Continue   │ │
│ └─────────────────┘ └─────────────────┘ │
│                                         │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │  DISCOVER(40%)  │ │    CHAT         │ │
│ │   [════    ]    │ │   💬 Ask Sage   │ │
│ │   🔍 Explore    │ │                 │ │
│ └─────────────────┘ └─────────────────┘ │
│                                         │
│ ┌──────────────────────────────────────┐ │
│ │         PROGRESS OVERVIEW             │ │
│ │  Level 5 | 1,250 XP | 3 Achievements │ │
│ └──────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```
**Data Required:**
- User name, avatar
- Progress for each module
- XP and achievements
- Current career/skill context

**Services Used:**
- `AILearningJourneyService.getUserProgress()`
- `pathIQGamificationService.getUserStats()`

---

## 4️⃣ LEARNING MODULE

### Learn Container
```
┌─────────────────────────────────────────┐
│ ← Back    Skill: Addition    Progress   │
│           Career: Chef         [══   ]   │
├─────────────────────────────────────────┤
│                                         │
│   "Let's learn about measuring          │
│    ingredients like a chef!"            │
│                                         │
│   [Visual/Interactive Content Area]     │
│                                         │
│   Question 1 of 5:                     │
│   If a recipe needs 2 cups and you     │
│   add 3 more cups, how many total?     │
│                                         │
│   [2] [3] [5] [6]                      │
│                                         │
│            [Check Answer]               │
└─────────────────────────────────────────┘
```
**Data Required:**
- Current skill/career context
- AI-generated instruction
- Question set with answers
- Progress tracking
- XP rewards

**Services Used:**
- `AILearningJourneyService.generateContent()`
- `CareerContextConverter.convertInstruction()`
- `pathIQService.trackProgress()`

---

## 5️⃣ EXPERIENCE MODULE

### Experience Container (2 Screens)

#### Screen 1: Career Context
```
┌─────────────────────────────────────────┐
│                                         │
│         [Particle Effects]              │
│                                         │
│   👨‍🍳 "Welcome to the Kitchen!"         │
│                                         │
│   Today you'll learn how chefs use     │
│   math to create perfect recipes!      │
│                                         │
│   [Begin Your Chef Journey →]          │
│                                         │
└─────────────────────────────────────────┘
```

#### Screen 2: Interactive Challenge
```
┌─────────────────────────────────────────┐
│ Professional Challenge      +15 XP      │
├─────────────────────────────────────────┤
│                                         │
│  Situation: A customer ordered 3x      │
│  the normal recipe. If normal uses     │
│  2 cups flour, how much do you need?   │
│                                         │
│  [Workspace/Manipulatives Area]        │
│                                         │
│  Your Answer: [____] cups               │
│                                         │
│  💬 Ask Professional  │  Submit Answer  │
└─────────────────────────────────────────┘
```
**Data Required:**
- Career scenario context
- Interactive elements by grade
- Chat integration
- Solution validation

**Services Used:**
- `AILearningJourneyService.generateExperience()`
- `chatbotService.sendMessage()`
- `pathIQGamificationService.awardPoints()`

---

## 6️⃣ DISCOVERY MODULE

### Discover Container
```
┌─────────────────────────────────────────┐
│ Discover: Real World Connections        │
├─────────────────────────────────────────┤
│                                         │
│  📺 Video: "Day in the Life of a Chef"  │
│  ▶️ ━━━━━━●━━━━━━━━━━━━━ 3:45/10:00    │
│                                         │
│  Related Articles:                      │
│  • How Math Makes Better Recipes       │
│  • Famous Chefs Who Love Math          │
│  • Kitchen Chemistry Basics            │
│                                         │
│  🎯 Try This: Measure ingredients      │
│     for your favorite snack!           │
│                                         │
│            [Complete Module]            │
└─────────────────────────────────────────┘
```
**Data Required:**
- External content links
- Videos/articles by topic
- Real-world activities
- Completion tracking

---

## 📊 Component Inventory

### Atoms (Reusable Elements)
```
- Button (primary, secondary, disabled)
- Input (text, number, password)
- Card (content container)
- ProgressBar (with percentage)
- Badge (XP, achievements)
- Avatar (user, companion)
- Icon (career, skill, navigation)
```

### Molecules (Combinations)
```
- QuestionCard (question + answer options)
- ProgressHeader (title + progress bar)
- CareerCard (icon + name + description)
- ChatMessage (avatar + text + timestamp)
- AchievementBadge (icon + name + XP)
```

### Organisms (Complex Components)
```
- BentoGrid (responsive grid layout)
- NavigationHeader (logo + nav + user menu)
- ExperienceCanvas (interactive workspace)
- ChatInterface (messages + input)
- ProgressDashboard (stats + charts)
```

### Templates (Page Layouts)
```
- AuthLayout (centered, minimal)
- DashboardLayout (header + sidebar + main)
- FullscreenLayout (immersive, no chrome)
- ModalLayout (overlay + content)
```

---

## 🔄 User Flow Map

```
START
  ↓
[Login] → [New User?] → [Onboarding]
  ↓            ↓
  ↓         [Career Selection]
  ↓            ↓
  └─────→ [Dashboard] ←─────┘
              ↓
    ┌─────────┼─────────┬────────┐
    ↓         ↓         ↓        ↓
[Learn] [Experience] [Discover] [Chat]
    ↓         ↓         ↓        ↓
    └─────────┴─────────┴────────┘
              ↓
         [Progress++]
              ↓
         [Dashboard]
```

---

## 🎯 Critical Data Points Per Page

### Every Page Needs:
- User authentication state
- Current theme (light/dark)
- Navigation ability

### Dashboard Needs:
- All module progress
- User stats
- Recent activity
- Next recommended action

### Learn/Experience/Discover Need:
- Current career context
- Skill being practiced
- Progress in module
- AI-generated content
- Completion callbacks

---

## 📝 State Management Requirements

```typescript
interface AppState {
  // User
  user: {
    id: string;
    name: string;
    grade: string;
    avatar: string;
  };
  
  // Career & Progress
  career: {
    current: Career;
    skills: Skill[];
    progress: Map<skillId, percentage>;
  };
  
  // Current Activity
  activity: {
    module: 'learn' | 'experience' | 'discover';
    content: any;
    progress: number;
  };
  
  // UI State
  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    currentModal: string | null;
  };
}
```

---

## ✅ Migration Checklist

For each page, ensure we have:
- [ ] Identified all data requirements
- [ ] Listed all user interactions
- [ ] Mapped service dependencies
- [ ] Defined success/error states
- [ ] Documented loading states
- [ ] Specified responsive behavior

---

**Note**: These are FUNCTIONAL wireframes. The actual UI in the new app can be much cleaner and modern, as long as it includes these data points and interactions.