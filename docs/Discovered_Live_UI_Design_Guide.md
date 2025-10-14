# Discovered Live! - UI Design Guide

**Game:** Discovered Live!
**Brand Assets:** `/public/images/DiscoveredLive/DL Logo.png`
**Design System:** GlassMorphism
**Status:** Ready for Implementation

---

## Design Philosophy

**Discovered Live!** uses **GlassMorphism design** throughout all screens to create a modern, engaging, and cohesive experience. This matches the visual style of:
- `SummaryCelebrationScreen`
- `WelcomeBackModal`

### Key Visual Principles
1. **Frosted Glass Effects** - Translucent backgrounds with backdrop blur
2. **Layered Depth** - Multiple glass layers create visual hierarchy
3. **Smooth Animations** - Framer Motion for fluid transitions
4. **Celebration Moments** - Confetti and visual feedback for achievements
5. **Brand Colors** - Purple, Pink, and Teal gradients

---

## GlassMorphism Pattern Library

### 1. Full-Screen Backdrop
**When to use:** Behind all modal/overlay screens

```tsx
<motion.div
  className="fixed inset-0 z-50 flex items-center justify-center"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  {/* Glassmorphism Backdrop */}
  <motion.div
    className="absolute inset-0 bg-black/40 backdrop-blur-md"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  />

  {/* Animated Background Pattern */}
  <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
    <motion.div
      className="absolute inset-0"
      animate={{
        backgroundPosition: ['0% 0%', '100% 100%'],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        repeatType: 'reverse'
      }}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Cpolygon fill='%239333ea' opacity='0.1' points='30 0 45 15 30 30 15 15'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }}
    />
  </div>

  {/* Content goes here */}
</motion.div>
```

**Classes:**
- Backdrop: `bg-black/40 backdrop-blur-md`
- Pattern overlay: `opacity-5 dark:opacity-10`
- Animation: `backgroundPosition` moving pattern

---

### 2. Main Glass Card
**When to use:** Primary content container

```tsx
<motion.div
  className="relative max-w-3xl w-full mx-4 bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/20"
  initial={{ opacity: 0, scale: 0.8, rotateX: -30 }}
  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
  exit={{ opacity: 0, scale: 0.8, rotateX: 30 }}
  transition={{ type: "spring", damping: 15, stiffness: 100 }}
>
  {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />

  {/* Content */}
  <div className="relative p-12">
    {/* Your content here */}
  </div>
</motion.div>
```

**Classes:**
- Card: `bg-white/95 dark:bg-gray-900/95 rounded-3xl backdrop-blur-xl border border-white/20`
- Gradient overlay: `bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10`
- Entrance animation: 3D rotation + spring physics

---

### 3. Inner Glass Cards
**When to use:** Nested content sections (stats, options, etc.)

```tsx
<motion.div
  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  whileHover={{ scale: 1.02, y: -2 }}
>
  {/* Inner content */}
</motion.div>
```

**Classes:**
- Inner card: `bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border`
- Hover effect: `scale: 1.02, y: -2`

---

### 4. Floating Achievement Badges
**When to use:** Top-right corner achievements/rewards

```tsx
<div className="absolute top-6 right-6 flex space-x-2">
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", delay: 0.2 }}
    className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
  >
    <Trophy className="w-6 h-6 text-white" />
  </motion.div>
</div>
```

**Pattern:**
- Staggered entrance with rotation
- Gradient backgrounds
- Icons from `lucide-react`

---

## Discovered Live! Component Specifications

### Game Logo Usage
**File:** `/public/images/DiscoveredLive/DL Logo.png`

```tsx
<img
  src="/images/DiscoveredLive/DL Logo.png"
  alt="Discovered Live!"
  className="h-16 w-auto"
/>
```

**Placement:**
- Top center of intro screen
- Small version in header during gameplay

---

### Screen 1: Game Intro / Instructions

**Component:** `DiscoveredLiveIntro.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│         [DL Logo]                   │
│                                     │
│   🎮 Welcome to Discovered Live!   │
│                                     │
│   [Bingo Grid Preview - 4x4]       │
│   [Your Career Highlighted]        │
│                                     │
│   📋 How to Play:                  │
│   • Answer career clues            │
│   • Match skills to careers        │
│   • Unlock bingo squares           │
│   • Complete rows/columns/diagonals│
│                                     │
│   [Let's Play! Button]             │
└─────────────────────────────────────┘
```

**Glass Structure:**
- **Backdrop:** `bg-black/40 backdrop-blur-md`
- **Main Card:** `bg-white/95 dark:bg-gray-900/95 rounded-3xl`
- **Bingo Preview:** `bg-white/80 dark:bg-gray-800/80 rounded-xl` (nested glass)
- **Button:** `bg-gradient-to-r from-purple-600 to-pink-600` with hover animation

**Animations:**
- Logo: Gentle floating (`animate={{ y: [-5, 5, -5] }}`)
- Bingo preview: Fade in with stagger on each square
- Instructions: Slide in from left with delays
- Button: Pulse effect on hover

---

### Screen 2: Question Screen

**Component:** `DiscoveredLiveQuestion.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│  Question 3/12        [Streak: 🔥2] │
│                                     │
│  🧮 "This career uses counting     │
│       to track ingredients"         │
│                                     │
│  [Career Option A] 👨‍🍳             │
│  [Career Option B] 👩‍🏫             │
│  [Career Option C] 👨‍💼             │
│  [Career Option D] 👩‍🔬             │
│                                     │
│  [Hint Button]        [Timer: 0:15] │
│                                     │
│  [Bingo Progress Mini - 4x4]       │
└─────────────────────────────────────┘
```

**Glass Structure:**
- **Main Card:** Centered glass card
- **Question Box:** `bg-purple-50/80 dark:bg-purple-900/20 rounded-xl backdrop-blur-sm`
- **Option Cards:** `bg-white/80 dark:bg-gray-800/80 rounded-xl` with hover states
- **Progress Mini:** `bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm`

**Interactions:**
- **Option Hover:** `scale: 1.03, shadow-lg`
- **Option Select:** Glow effect + scale pulse
- **Correct Answer:** Green glow + confetti + unlock animation
- **Wrong Answer:** Red shake + hint reveal

**Animations:**
- Question: Slide in from top
- Options: Stagger fade-in from bottom
- Selected: Scale + glow border
- Correct: Confetti burst + bingo square unlock animation
- Wrong: Shake + fade to 50% opacity

---

### Screen 3: Bingo Grid Screen

**Component:** `DiscoveredLiveBingoGrid.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│         Discovered Live!            │
│                                     │
│  ╔═══╦═══╦═══╦═══╗                 │
│  ║ 👨‍🍳║ 👩‍🏫║ 👨‍💼║ 👩‍🔬║                 │
│  ║Chef║Tchr║Boss║Sci║                 │
│  ╠═══╬═══╬═══╬═══╣                 │
│  ║ 🌟║ 👨‍⚕️║ 👩‍💻║ 👨‍🎨║                 │
│  ║You║Doc║Dev║Art║                 │
│  ╠═══╬═══╬═══╬═══╣                 │
│  ║ 👩‍🚒║ 👨‍🔧║ 👩‍✈️║ 👨‍🌾║                 │
│  ║Fire║Mech║Plt║Farm║                 │
│  ╠═══╬═══╬═══╬═══╣                 │
│  ║ 👩‍⚖️║ 👨‍🎓║ 👩‍🎤║ 👨‍🚀║                 │
│  ║Law║Prof║Sing║Astro║                │
│  ╚═══╩═══╩═══╩═══╝                 │
│                                     │
│  Progress: ⬜⬜⬜✅✅✅ 3/12        │
│  XP: 30 | Streak: 🔥 3             │
│                                     │
│  [Continue Button]                  │
└─────────────────────────────────────┘
```

**Glass Structure:**
- **Bingo Grid:** Center stage with maximum focus
- **Each Square:** `bg-white/90 dark:bg-gray-800/90 rounded-lg border-2`
- **Unlocked Square:** `bg-gradient-to-br from-green-400/20 to-emerald-500/20 border-green-500`
- **Your Career Square:** `bg-gradient-to-br from-purple-400/30 to-pink-500/30 border-purple-500 ring-4 ring-purple-300`
- **Completed Row/Col:** Gold border animation

**States:**
- **Locked:** Grayscale + blur filter
- **Unlocked:** Full color + scale animation
- **Your Career:** Always visible, pulsing glow
- **Bingo Complete:** Wave animation + confetti shower

**Animations:**
- **Square Unlock:** Scale from 0.5 → 1.2 → 1.0 with rotation
- **Bingo Line:** Animated line drawing effect (SVG path)
- **Completed Grid:** Fireworks + full-screen confetti

---

### Screen 4: Results / Celebration Screen

**Component:** `DiscoveredLiveResults.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│  🎉 Amazing Work, [Name]! 🎉       │
│                                     │
│     [Trophy Icon]                   │
│                                     │
│  You completed Discovered Live!     │
│                                     │
│  ╔═══════════════════════╗         │
│  ║   +120 XP EARNED!     ║         │
│  ║   ⚡⚡⚡⚡⚡            ║         │
│  ╚═══════════════════════╝         │
│                                     │
│  📊 Your Stats:                    │
│  • Correct Answers: 10/12          │
│  • Max Streak: 🔥 5                │
│  • Lines Completed: 3 Bingos       │
│  • Time: 4:32                      │
│                                     │
│  [Continue to Career Hub]          │
└─────────────────────────────────────┘
```

**Glass Structure:**
- **Main Card:** Same as SummaryCelebrationScreen
- **XP Display:** `bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 shadow-xl`
- **Stats Cards:** Grid of inner glass cards
- **Achievement Badges:** Floating top-right corner

**Animations:**
- **Entrance:** Enhanced confetti (4-second burst)
- **XP Card:** Pulsing glow effect
- **Stats:** Stagger animation (each stat flies in)
- **Achievement Badges:** Rotate entrance
- **Auto-advance:** 6 seconds to Career Hub

---

## Brand Colors

### Primary Palette
```css
/* Purple - Primary Brand */
purple-400: #c084fc
purple-500: #a855f7
purple-600: #9333ea

/* Pink - Secondary Brand */
pink-400: #f472b6
pink-500: #ec4899
pink-600: #db2777

/* Teal - Accent */
teal-400: #2dd4bf
teal-500: #14b8a6
teal-600: #0d9488
```

### Gradient Combinations
```css
/* Main Brand Gradient */
bg-gradient-to-r from-purple-600 to-pink-600

/* Success States */
bg-gradient-to-br from-green-400 to-emerald-500

/* Achievement Badges */
bg-gradient-to-br from-yellow-400 to-orange-500  /* Gold */
bg-gradient-to-br from-purple-400 to-pink-500    /* Purple-Pink */
bg-gradient-to-br from-blue-400 to-cyan-500      /* Blue */
```

---

## Animation Library

### Entrance Animations

**Full Screen Modal:**
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
```

**Main Card:**
```tsx
initial={{ opacity: 0, scale: 0.8, rotateX: -30 }}
animate={{ opacity: 1, scale: 1, rotateX: 0 }}
exit={{ opacity: 0, scale: 0.8, rotateX: 30 }}
transition={{ type: "spring", damping: 15, stiffness: 100 }}
```

**Staggered Content:**
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.1 }}
```

### Interaction Animations

**Button Hover:**
```tsx
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

**Card Hover:**
```tsx
whileHover={{ scale: 1.02, y: -2 }}
```

**Pulsing Glow:**
```tsx
animate={{
  boxShadow: [
    '0 0 0 0px rgba(168, 85, 247, 0.4)',
    '0 0 0 20px rgba(168, 85, 247, 0)',
  ]
}}
transition={{
  duration: 2,
  repeat: Infinity,
}}
```

### Celebration Animations

**Confetti Burst:**
```tsx
useEffect(() => {
  const duration = 4000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 40, spread: 360, ticks: 80, zIndex: 9999 };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 60 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);

  return () => clearInterval(interval);
}, []);
```

**Scale Pulse:**
```tsx
animate={{ scale: [1, 1.2, 1] }}
transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3 }}
```

---

## Responsive Breakpoints

### Mobile (< 640px)
- Card: `max-w-full mx-2`
- Padding: `p-6`
- Bingo grid: Single column view
- Font sizes: Reduce by 25%

### Tablet (640px - 1024px)
- Card: `max-w-2xl mx-4`
- Padding: `p-8`
- Bingo grid: Show full 4x4

### Desktop (> 1024px)
- Card: `max-w-3xl mx-4`
- Padding: `p-12`
- Bingo grid: Show full 4x4 with larger squares

---

## Accessibility

### Focus States
```tsx
focus:ring-4 focus:ring-purple-300 focus:outline-none
```

### Keyboard Navigation
- Tab through all interactive elements
- Enter to select options
- Space to confirm
- Escape to dismiss hints

### Screen Reader
```tsx
<div role="region" aria-label="Bingo Game Board">
  <div role="button" aria-label={`Career: ${careerName}, ${isUnlocked ? 'Unlocked' : 'Locked'}`}>
    {/* Square content */}
  </div>
</div>
```

### Color Contrast
- All text: WCAG AA compliant (4.5:1 minimum)
- Interactive elements: Clear borders and focus states
- Dark mode: Tested for accessibility

---

## Component File Structure

```
src/components/discovered-live/
├── DiscoveredLiveIntro.tsx          # Welcome/Instructions screen
├── DiscoveredLiveQuestion.tsx       # Question screen with options
├── DiscoveredLiveBingoGrid.tsx      # Bingo grid display
├── DiscoveredLiveBingoCard.tsx      # Individual bingo square
├── DiscoveredLiveResults.tsx        # Results/celebration screen
├── DiscoveredLiveProgressBar.tsx    # Progress indicator
├── DiscoveredLiveStreakBadge.tsx    # Streak counter
└── index.ts                          # Barrel export
```

---

## Implementation Checklist

### Phase 1: Core Components
- [ ] Create component folder structure
- [ ] Build `DiscoveredLiveIntro.tsx` with GlassMorphism
- [ ] Build `DiscoveredLiveQuestion.tsx` with animations
- [ ] Build `DiscoveredLiveBingoCard.tsx` with states
- [ ] Build `DiscoveredLiveBingoGrid.tsx` with layout
- [ ] Build `DiscoveredLiveResults.tsx` with celebration

### Phase 2: Integration
- [ ] Connect to `DiscoveredLiveService`
- [ ] Wire up XP calculations
- [ ] Integrate confetti celebrations
- [ ] Add sound effects (optional)
- [ ] Test with real database queries

### Phase 3: Polish
- [ ] Mobile responsiveness
- [ ] Dark mode testing
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] User testing

---

## Design References

**Inspiration Screens:**
- `/src/components/celebration/SummaryCelebrationScreen.tsx` - Main reference for GlassMorphism
- `/src/components/modals/WelcomeBackModal.tsx` - Interaction patterns and animations

**Assets:**
- Logo: `/public/images/DiscoveredLive/DL Logo.png`
- Companion images: `/public/images/companions/`

---

## Notes for Developers

1. **Always use framer-motion** for animations
2. **Always use backdrop-blur** for glass effect
3. **Always include dark mode** variants
4. **Always stagger animations** for visual interest
5. **Always celebrate achievements** with confetti
6. **Always test on mobile** devices
7. **Always provide keyboard navigation**

---

**Design Guide Version:** 1.0
**Last Updated:** 2025-10-11
**Ready for Implementation:** ✅ YES
