# BentoExperience Grade-Specific Tile Layouts

## 🎓 Grade Category Design Principles

### Elementary K-2 (Ages 5-7)
- **Large tiles** with high visibility
- **Minimal text**, maximum visuals
- **2x2 or 2x3 grid** maximum
- **Single focus** per screen
- **Big touch targets** (min 64px)
- **Bright, engaging colors**

### Elementary 3-5 (Ages 8-10)
- **Medium tiles** with balanced visuals/text
- **3x3 grid** capacity
- **Multiple elements** visible
- **Clear visual hierarchy**
- **Interactive elements** prominent
- **Encouraging feedback**

### Middle School 6-8 (Ages 11-13)
- **Flexible tile sizes** 
- **3x4 or 4x3 grid** 
- **More text content** acceptable
- **Multiple panels** can be open
- **Data visualization** elements
- **Professional aesthetic** emerging

### High School 9-12 (Ages 14-18)
- **Dense information** layouts
- **4x4 grid** capability
- **Complex interactions**
- **Multiple tools** visible
- **Professional UI** patterns
- **Minimal decorative elements**

---

## 📐 Grade-Specific Screen Layouts

## K-2 LAYOUTS (Kindergarten - 2nd Grade)

### K-2: Challenge Introduction
```
┌─────────────────────────────────────┐
│     🦊 COMPANION MEGA TILE          │
│      "Hi Chef Sam! I'm Finn!"       │
│         (Animated, Large)           │
│      Speech bubble bounces          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        👨‍🍳 CAREER TILE              │
│      "You are a CHEF!"              │
│     Big icon, simple text           │
└─────────────────────────────────────┘

┌──────────────┬──────────────────────┐
│   1️⃣2️⃣3️⃣      │    [BIG START]       │
│  NUMBERS!    │     ▶️ PLAY          │
└──────────────┴──────────────────────┘
```

### K-2: Scenario Screen
```
┌─────────────────────────────────────┐
│         VISUAL SCENARIO             │
│     🍎 🍎 🍎  (Large, Clear)        │
│    "How many apples?"               │
└─────────────────────────────────────┘

┌──────────────┬──────────────────────┐
│      1       │         2            │
│   One 🍎     │      Two 🍎🍎        │
│   (Huge)     │      (Huge)          │
├──────────────┼──────────────────────┤
│      3       │    🦊 Finn Says:     │
│  Three 🍎🍎🍎 │   "Count them!"      │
│   (Huge)     │    (Helper tile)     │
└──────────────┴──────────────────────┘
```

### K-2: Interaction Features
- **Tap-only** interactions (no complex drag-drop)
- **Audio support** for all text
- **Visual feedback** immediate and obvious
- **Auto-progression** after success
- **Celebration animations** big and rewarding

---

## 3-5 LAYOUTS (3rd - 5th Grade)

### 3-5: Challenge Introduction
```
┌─────────────────────┬───────────────┐
│   WELCOME TILE      │  COMPANION    │
│  "Chef Journey!"    │   🦊 Finn     │
│   Career: Chef      │  "Ready to    │
│   Skill: Fractions  │   learn?"     │
└─────────────────────┴───────────────┘

┌─────────────────────────────────────┐
│        HOW CHEFS USE FRACTIONS      │
│   🍕 Pizza = 8 slices = fractions!  │
│   Visual examples with explanations │
└─────────────────────────────────────┘

┌─────────┬─────────┬─────────────────┐
│  SKILL  │  GOALS  │     START       │
│ 1/2 1/4 │ 4 Tasks │   [Begin →]     │
└─────────┴─────────┴─────────────────┘
```

### 3-5: Scenario Screen
```
┌─────────────────────────────────────┐
│       SCENARIO DESCRIPTION          │
│  "A customer wants 1/2 of a pizza"  │
└─────────────────────────────────────┘

┌───────────────┬─────────────────────┐
│  WORK AREA    │   TOOLS PALETTE     │
│  🍕 Pizza     │   ✂️ Cut in 2      │
│  [Interactive]│   ✂️ Cut in 4      │
│               │   ✂️ Cut in 8      │
└───────────────┴─────────────────────┘

┌─────────┬─────────┬─────────────────┐
│ Choice A│ Choice B│   🦊 Helper     │
│  "1/2"  │  "1/4"  │  "Which is      │
│         │         │   bigger?"      │
└─────────┴─────────┴─────────────────┘
```

### 3-5: Interaction Features
- **Drag-and-drop** enabled
- **Visual + text** instructions
- **Multi-step** problems
- **Hints available** on request
- **Progress tracking** visible

---

## 6-8 LAYOUTS (Middle School)

### 6-8: Challenge Introduction
```
┌──────────────┬──────────────┬──────────────┐
│   WELCOME    │   COMPANION  │   PROGRESS   │
│ Engineer Path│   🦉 Sage    │   Ch 1 of 3  │
│  Algebra     │  "Let's      │   ○○○────    │
│              │  explore"    │              │
└──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────┐
│         PROFESSIONAL CONTEXT                │
│   Engineers use algebra to design bridges   │
│   [Visual diagram of force calculations]    │
└─────────────────────────────────────────────┘

┌──────────────┬──────────────┬───────────────┐
│ OBJECTIVES   │ RESOURCES    │    ACTION     │
│ • Solve for x│ 📊 Calculator│  [Start] →    │
│ • Apply form │ 📐 Graph     │               │
└──────────────┴──────────────┴───────────────┘
```

### 6-8: Scenario Screen
```
┌─────────────────────────┬───────────────────┐
│    PROBLEM SPACE        │   DATA PANEL      │
│  Bridge load: 2x + 500  │   Given:          │
│  Max capacity: 2000 kg  │   • x = cars      │
│  Solve for max cars (x) │   • Each = 250kg  │
└─────────────────────────┴───────────────────┘

┌─────────────────────────┬───────────────────┐
│    WORKSPACE            │   TOOLS           │
│  2x + 500 = 2000       │  Calculator 🔢    │
│  2x = 1500             │  Graph Tool 📊    │
│  x = ?                 │  Formula Ref 📋   │
└─────────────────────────┴───────────────────┘

┌──────────┬──────────┬──────────┬────────────┐
│ x = 500  │ x = 750  │ x = 1000 │ 🦉 Hint    │
└──────────┴──────────┴──────────┴────────────┘
```

### 6-8: Interaction Features
- **Multiple tools** available
- **Workspace** for calculations
- **Data visualization** tools
- **Save progress** capability
- **Peer comparison** (optional)

---

## 9-12 LAYOUTS (High School)

### 9-12: Challenge Introduction
```
┌────────┬────────┬────────┬────────┬────────┐
│ CAREER │ SKILL  │PROGRESS│RESOURCES│PROFILE│
│Engineer│Calculus│ 1/2    │ Docs   │ Alex  │
└────────┴────────┴────────┴────────┴────────┘

┌─────────────────────────────────────────────┐
│         PROFESSIONAL SCENARIO               │
│  NASA trajectory calculations for Mars      │
│  [Complex diagram with equations]           │
├─────────────────────────┬───────────────────┤
│   LEARNING OBJECTIVES   │   SAGE INSIGHTS   │
│ • Derivatives in physics│  "This mirrors    │
│ • Real-world application│   actual NASA     │
│ • Multi-variable calc   │   calculations"   │
└─────────────────────────┴───────────────────┘

┌──────────┬──────────┬──────────┬────────────┐
│Simulation│Equations │ Examples │   BEGIN    │
└──────────┴──────────┴──────────┴────────────┘
```

### 9-12: Scenario Screen
```
┌───────────────────┬─────────────┬───────────┐
│   MAIN CANVAS     │  EQUATIONS  │   DATA    │
│                   │  v = dx/dt  │  t = 0s   │
│  [Graph/Sim]      │  a = dv/dt  │  x = 0m   │
│                   │  F = ma     │  v = 50m/s│
├───────────────────┼─────────────┼───────────┤
│   CODE EDITOR     │   OUTPUT    │   DEBUG   │
│ def calculate():  │  Result:    │  Line 3:  │
│   velocity = ...  │  125.5 m/s  │  Check    │
└───────────────────┴─────────────┴───────────┘

┌────────┬────────┬────────┬────────┬─────────┐
│Submit A│Submit B│Submit C│ Tools  │ 🦉 Guide│
└────────┴────────┴────────┴────────┴─────────┘
```

### 9-12: Interaction Features
- **Professional tools** (IDE, graphing, simulation)
- **Multi-panel** workspace
- **Code integration** where relevant
- **Real data sets**
- **Portfolio building** features
- **Complex problem solving**

---

## 🎨 Visual Design by Grade

### K-2 Visual Language
```css
.k2-tile {
  border-radius: 24px;  /* Very rounded */
  font-size: 24px;      /* Large text */
  padding: 32px;        /* Spacious */
  animation: bounce;    /* Playful */
  background: linear-gradient(135deg, #FFE5B4, #FFD700);
}
```
- Primary colors
- Big emojis (48px+)
- Thick borders (4px)
- Playful animations

### 3-5 Visual Language
```css
.elementary-tile {
  border-radius: 16px;  /* Friendly rounded */
  font-size: 18px;      /* Readable */
  padding: 20px;        /* Comfortable */
  animation: slide;     /* Smooth */
  background: linear-gradient(135deg, #E3F2FD, #90CAF9);
}
```
- Bright but sophisticated
- Icons + text combo
- Medium borders (2px)
- Smooth transitions

### 6-8 Visual Language
```css
.middle-tile {
  border-radius: 12px;  /* Moderate round */
  font-size: 14px;      /* Standard */
  padding: 16px;        /* Efficient */
  animation: fade;      /* Professional */
  background: linear-gradient(135deg, #F5F5F5, #E0E0E0);
}
```
- Muted colors
- Smaller icons
- Thin borders (1px)
- Subtle animations

### 9-12 Visual Language
```css
.high-tile {
  border-radius: 8px;   /* Minimal round */
  font-size: 13px;      /* Compact */
  padding: 12px;        /* Dense */
  animation: none;      /* Minimal */
  background: #FFFFFF;  /* Clean */
  border: 1px solid #E0E0E0;
}
```
- Professional palette
- Text-focused
- Minimal decoration
- Focus on function

---

## 📱 Responsive Adjustments by Grade

### K-2 Responsive
- **Mobile**: 1 tile at a time, swipe between
- **Tablet**: 2x2 grid maximum
- **Desktop**: 2x3 grid with larger tiles

### 3-5 Responsive
- **Mobile**: 2x3 grid, scrollable
- **Tablet**: 3x3 grid, all visible
- **Desktop**: 3x4 grid with tools

### 6-8 Responsive
- **Mobile**: Tabbed interface
- **Tablet**: 3x4 grid
- **Desktop**: 4x4 grid with panels

### 9-12 Responsive
- **Mobile**: Accordion/collapsed panels
- **Tablet**: Multi-column with tabs
- **Desktop**: Full multi-panel IDE-like

---

## 🔧 Implementation Specifics

### Grade Detection & Layout Selection
```typescript
function getLayoutConfig(gradeLevel: string) {
  const grade = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
  
  if (grade <= 2) {
    return {
      gridCols: 2,
      gridRows: 3,
      tileSize: 'large',
      fontSize: '24px',
      interaction: 'tap',
      complexity: 'simple'
    };
  } else if (grade <= 5) {
    return {
      gridCols: 3,
      gridRows: 3,
      tileSize: 'medium',
      fontSize: '18px',
      interaction: 'drag-drop',
      complexity: 'moderate'
    };
  } else if (grade <= 8) {
    return {
      gridCols: 4,
      gridRows: 3,
      tileSize: 'flexible',
      fontSize: '14px',
      interaction: 'multi-tool',
      complexity: 'complex'
    };
  } else {
    return {
      gridCols: 4,
      gridRows: 4,
      tileSize: 'compact',
      fontSize: '13px',
      interaction: 'professional',
      complexity: 'advanced'
    };
  }
}
```

### Dynamic CSS Classes
```typescript
const getContainerClass = (gradeLevel: string) => {
  const grade = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
  
  if (grade <= 2) return styles.k2Layout;
  if (grade <= 5) return styles.elementaryLayout;
  if (grade <= 8) return styles.middleLayout;
  return styles.highLayout;
};
```

---

## 🎯 Key Differentiators by Grade

### K-2 Priority
1. **Visual over text** (80/20 ratio)
2. **Single action** per screen
3. **Immediate feedback**
4. **Audio support** essential
5. **Celebration** prominent

### 3-5 Priority
1. **Balanced visual/text** (60/40 ratio)
2. **2-3 actions** per screen
3. **Progressive disclosure**
4. **Optional hints**
5. **Achievement tracking**

### 6-8 Priority
1. **Text over visual** (40/60 ratio)
2. **Multiple tools** available
3. **Data manipulation**
4. **Save/resume** capability
5. **Performance metrics**

### 9-12 Priority
1. **Text-heavy** (20/80 ratio)
2. **Professional tools**
3. **Complex workflows**
4. **Portfolio integration**
5. **Real-world data**

This grade-specific approach ensures age-appropriate experiences while maintaining the core Bento tile system across all levels.