# Demo User Requirements & Testing Matrix
> Critical test users representing all grade categories with full skill progression

## 👥 Demo User Profiles

### Sam - Kindergarten (Elementary K-2)
```yaml
Grade: K
Age: 5-6
Career: Chef
Skills Level: Beginning reader, visual learner
UI Requirements:
  - Large buttons (min 64px)
  - Picture-based navigation
  - Audio instructions
  - Simple vocabulary
  - Bright, engaging colors
  - Minimal text
```

### Alex - Grade 1 (Elementary K-2)
```yaml
Grade: 1
Age: 6-7
Career: Artist
Skills Level: Early reader, basic counting
UI Requirements:
  - Large touch targets (min 56px)
  - Icon + text labels
  - Short sentences
  - Visual feedback
  - Drag-and-drop interactions
  - Celebration animations
```

### Jordan - Grade 7 (Middle School)
```yaml
Grade: 7
Age: 12-13
Career: Engineer
Skills Level: Independent reader, abstract thinking
UI Requirements:
  - Standard buttons (44px)
  - More text-based content
  - Data visualizations
  - Multi-step processes
  - Collaborative features
  - Progress tracking
```

### Taylor - Grade 10 (High School)
```yaml
Grade: 10
Age: 15-16
Career: Doctor
Skills Level: Advanced reader, complex reasoning
UI Requirements:
  - Compact UI (36px buttons)
  - Professional interface
  - Detailed explanations
  - Research tools
  - Note-taking features
  - Career simulations
```

## 📊 Skills-Master Table Structure

```sql
-- Each demo user has complete skill trees
SELECT * FROM skills_master 
WHERE user_id IN ('sam_k', 'alex_1', 'jordan_7', 'taylor_10');

-- Example data structure
{
  user_id: 'sam_k',
  career_id: 'chef',
  skills: [
    { id: 'counting', level: 1, progress: 100 },
    { id: 'measuring', level: 1, progress: 75 },
    { id: 'patterns', level: 1, progress: 50 },
    { id: 'shapes', level: 1, progress: 25 }
  ]
}
```

## 🎨 Age-Specific Bento UI Requirements

### Elementary (K-2) - Sam & Alex
```tsx
// Learn Container
<BentoLearnCard grade="elementary-k2">
  - Huge title text (32px)
  - Picture instructions
  - 1-2 questions at a time
  - Voice-over support
  - Animated mascot helper
  - Touch/drag interactions
</BentoLearnCard>

// Experience Container  
<BentoExperienceCard grade="elementary-k2">
  - Virtual manipulatives (blocks, shapes)
  - Simple drag-and-drop
  - Immediate visual feedback
  - Sound effects
  - "Show me" hints
  - 3-5 minute activities
</BentoExperienceCard>

// Discover Container
<BentoDiscoverCard grade="elementary-k2">
  - Short videos (2-3 min)
  - Picture books
  - Interactive stories
  - Simple games
  - Parent connection ideas
</BentoDiscoverCard>
```

### Middle School - Jordan
```tsx
// Learn Container
<BentoLearnCard grade="middle">
  - Standard text (18px)
  - Diagram support
  - 5-10 questions
  - Self-paced
  - Progress tracking
  - Hint system
</BentoLearnCard>

// Experience Container
<BentoExperienceCard grade="middle">
  - Simulations
  - Data collection
  - Hypothesis testing
  - Collaborative challenges
  - Save/resume progress
  - 10-15 minute activities
</BentoExperienceCard>

// Discover Container
<BentoDiscoverCard grade="middle">
  - Longer videos (5-10 min)
  - Articles
  - Interactive labs
  - Career interviews
  - Project ideas
</BentoDiscoverCard>
```

### High School - Taylor
```tsx
// Learn Container
<BentoLearnCard grade="high">
  - Compact text (16px)
  - Complex diagrams
  - 15-20 questions
  - Timed assessments
  - Detailed analytics
  - Study guides
</BentoLearnCard>

// Experience Container
<BentoExperienceCard grade="high">
  - Professional tools
  - Real-world scenarios
  - Portfolio building
  - Industry simulations
  - Certification prep
  - 20-30 minute projects
</BentoExperienceCard>

// Discover Container
<BentoDiscoverCard grade="high">
  - Full documentaries
  - Research papers
  - Virtual internships
  - College prep
  - Industry connections
</BentoDiscoverCard>
```

## 🧪 Test Scenarios for Each User

### Sam (K) - Chef Journey
```gherkin
Scenario: Complete counting lesson
  Given Sam is logged in
  When Sam opens Learn module
  Then UI shows large picture cards
  And Instructions are read aloud
  When Sam drags 3 apples to basket
  Then Celebration animation plays
  And Sam earns 5 XP
```

### Alex (1) - Artist Journey
```gherkin
Scenario: Color mixing experience
  Given Alex is logged in
  When Alex opens Experience module
  Then Virtual paint palette appears
  When Alex mixes red + blue
  Then Purple appears with sparkle effect
  And Professional artist explains primary colors
```

### Jordan (7) - Engineer Journey
```gherkin
Scenario: Bridge building simulation
  Given Jordan is logged in
  When Jordan opens Experience module
  Then Engineering workspace loads
  When Jordan designs bridge with constraints
  Then Simulation tests weight capacity
  And Results show in data graph
```

### Taylor (10) - Doctor Journey
```gherkin
Scenario: Diagnosis simulation
  Given Taylor is logged in
  When Taylor opens Experience module
  Then Patient case study loads
  When Taylor reviews symptoms and orders tests
  Then Differential diagnosis tool activates
  And Attending physician provides feedback
```

## 📐 Responsive Breakpoints by Grade

```css
/* Elementary K-2 (Sam, Alex) */
.grade-elementary-k2 {
  --min-touch-target: 64px;
  --base-font-size: 20px;
  --heading-size: 32px;
  --spacing-unit: 24px;
  --max-content-width: 800px;
}

/* Middle School (Jordan) */
.grade-middle {
  --min-touch-target: 48px;
  --base-font-size: 16px;
  --heading-size: 24px;
  --spacing-unit: 16px;
  --max-content-width: 1000px;
}

/* High School (Taylor) */
.grade-high {
  --min-touch-target: 36px;
  --base-font-size: 14px;
  --heading-size: 20px;
  --spacing-unit: 12px;
  --max-content-width: 1200px;
}
```

## 🔄 Migration Testing Checklist

### For Each Demo User:
- [ ] Can log in successfully
- [ ] Sees age-appropriate UI
- [ ] Career displays correctly
- [ ] Skills load from skills-master
- [ ] Progress saves to Supabase

### Sam (K) Specific:
- [ ] Pictures appear for all instructions
- [ ] Audio plays when requested
- [ ] Drag-and-drop works smoothly
- [ ] Cannot access text-heavy content
- [ ] Parent mode available

### Alex (1) Specific:
- [ ] Simple reading passages work
- [ ] Counting activities to 20
- [ ] Art tools are intuitive
- [ ] Rewards are visual/animated

### Jordan (7) Specific:
- [ ] Can handle multi-step problems
- [ ] Data visualizations render
- [ ] Can save and resume work
- [ ] Collaboration features work

### Taylor (10) Specific:
- [ ] Complex scenarios load
- [ ] Research tools available
- [ ] Portfolio features work
- [ ] College/career resources accessible

## 🎯 Component Requirements Matrix

| Component | Sam (K) | Alex (1) | Jordan (7) | Taylor (10) |
|-----------|---------|----------|------------|-------------|
| Button Size | 64px | 56px | 48px | 36px |
| Text Size | 24px | 20px | 16px | 14px |
| Questions/Page | 1 | 1-2 | 5-10 | 15-20 |
| Activity Length | 3-5 min | 5-7 min | 10-15 min | 20-30 min |
| Reading Level | Pictures | Simple | Grade-level | Advanced |
| Feedback | Immediate | Immediate | On-submit | Detailed |
| Navigation | Picture | Icon+Text | Text | Minimal |

## 💾 Supabase Queries for Demo Users

```typescript
// Load demo user with full context
export async function loadDemoUser(username: string) {
  // Get user profile
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  // Get career details
  const { data: career } = await supabase
    .from('careers')
    .select('*')
    .eq('id', user.career_id)
    .single();
  
  // Get skill progression
  const { data: skills } = await supabase
    .from('skills_master')
    .select('*')
    .eq('user_id', user.id)
    .order('sequence', { ascending: true });
  
  // Get current progress
  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', user.id);
  
  return {
    user,
    career,
    skills,
    progress,
    gradeCategory: getGradeCategory(user.grade)
  };
}

// Test data integrity
export async function validateDemoUserData() {
  const demoUsers = ['sam_k', 'alex_1', 'jordan_7', 'taylor_10'];
  
  for (const username of demoUsers) {
    const userData = await loadDemoUser(username);
    
    console.assert(userData.user, `User ${username} exists`);
    console.assert(userData.career, `Career assigned for ${username}`);
    console.assert(userData.skills.length > 0, `Skills loaded for ${username}`);
    console.assert(
      userData.skills.every(s => s.skill_data), 
      `All skills have data for ${username}`
    );
  }
}
```

## 🚀 Quick Test Commands

```bash
# Test as Sam (Kindergarten)
npm run test:user -- --user=sam_k

# Test as Alex (Grade 1)
npm run test:user -- --user=alex_1

# Test as Jordan (Grade 7)
npm run test:user -- --user=jordan_7

# Test as Taylor (Grade 10)
npm run test:user -- --user=taylor_10

# Run all demo user tests
npm run test:demo-users
```

## ⚠️ Critical Requirements

1. **Never show Taylor's content to Sam** - Age-inappropriate
2. **Always provide audio option for K-2** - Accessibility
3. **Maintain skill progression** - Don't lose progress data
4. **Respect grade-level vocabulary** - Use age-appropriate language
5. **Test on actual devices** - K-2 uses tablets, 7-10 uses laptops

---

**These demo users are our North Star for the migration. If all four can successfully use the new app with their full skill trees, we know the migration is successful!**