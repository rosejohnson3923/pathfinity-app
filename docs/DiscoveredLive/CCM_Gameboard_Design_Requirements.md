# CCM Gameboard Design Requirements
**Created:** October 16, 2025
**Status:** Draft - Awaiting Specifications
**Purpose:** Detailed UI/UX specifications for Career Challenge Multiplayer game board

---

## 1. Layout & Dimensions

### Overall Game Board
- [ ] Board width: `___________` (px, rem, or %)
- [ ] Board height: `___________` (px, rem, or %)
- [ ] Aspect ratio: `___________`
- [ ] Container padding: `___________`
- [ ] Responsive breakpoints:
  - Mobile: `___________`
  - Tablet: `___________`
  - Desktop: `___________`

### Component Dimensions
- [ ] Card width: `___________`
- [ ] Card height: `___________`
- [ ] Card aspect ratio: `___________`
- [ ] Gap between card stacks: `___________`
- [ ] Leaderboard width: `___________`
- [ ] Top banner height: `___________`

### Spacing System
- [ ] Base spacing unit: `___________`
- [ ] Padding inside cards: `___________`
- [ ] Margin between sections: `___________`

---

## 2. Visual Design Assets

### Card Graphics
- [ ] Card back design:
  - [ ] Use emoji (🎴)
  - [ ] Custom graphic (provide file: `___________`)
  - [ ] Gradient/pattern (specify: `___________`)
- [ ] Card front template: `___________`
- [ ] Card border style: `___________`

### Table Surface
- [ ] Literal table graphic: Yes / No
- [ ] If yes, provide file: `___________`
- [ ] Table texture/pattern: `___________`
- [ ] Background treatment: `___________`

### Challenge Master
- [ ] Avatar/character: Yes / No
- [ ] If yes, provide asset: `___________`
- [ ] Position on screen: `___________`
- [ ] Animation style: `___________`

### Player Avatars
- [ ] Show players around table: Yes / No
- [ ] Avatar style: Circle / Square / Custom
- [ ] Avatar size: `___________`
- [ ] Default avatar if no image: `___________`
- [ ] Positions: Top / Bottom / Left / Right / All

### Icons & Badges
- [ ] C-Suite icons: 👔💰📢💻🤝 or custom
- [ ] Challenge category icons: Custom / Emoji
- [ ] Rank badges: 🥇🥈🥉 or custom
- [ ] Status indicators: Custom / Standard

---

## 3. Color Specifications

### Background Colors
```
Primary gradient:
- Color 1: #___________
- Color 2: #___________
- Color 3: #___________
- Gradient direction: ___________
```

### Glass Card Colors
```
Background: rgba(___, ___, ___, ___)  // with opacity
Border: rgba(___, ___, ___, ___)
```

### Text Colors
```
Primary text: #___________
Secondary text: #___________
Tertiary text: #___________
Disabled text: #___________
```

### Accent Colors
```
C-Suite cards:
- CEO: #___________
- CFO: #___________
- CMO: #___________
- CTO: #___________
- CHRO: #___________

Challenge categories:
- People: #___________
- Product: #___________
- Pricing: #___________
- Process: #___________
- Proceeds: #___________
- Profits: #___________

Role cards: #___________
Synergy cards: #___________
```

### State Colors
```
Active stack: #___________
Inactive stack: #___________
Selected card: #___________
Hover state: #___________
Disabled state: #___________
```

### UI Element Colors
```
Success/Confirm: #___________
Warning/Timer low: #___________
Error: #___________
Info: #___________
```

---

## 4. Glassmorphism Parameters

### Glass Effect Specifications
```
Backdrop blur: _____ px
Background opacity: _____ %
Border opacity: _____ %
Border width: _____ px
Shadow: _____ px _____ px _____ px _____ px rgba(___, ___, ___, ___)
```

### Glass Variants
- [ ] glass-card: `___________`
- [ ] glass-game: `___________`
- [ ] glass-subtle: `___________`
- [ ] glass-accent: `___________`
- [ ] glass-panel: `___________`

---

## 5. Typography

### Font Family
- [ ] Primary font: `___________`
- [ ] Secondary font (if any): `___________`
- [ ] Monospace font: `___________`

### Font Sizes
```
Master message: _____ px/rem
Card titles: _____ px/rem
Card descriptions: _____ px/rem
Player names: _____ px/rem
Scores: _____ px/rem
Timer: _____ px/rem
Tags/labels: _____ px/rem
Button text: _____ px/rem
```

### Font Weights
```
Regular: _____
Medium: _____
Semibold: _____
Bold: _____
```

### Text Styling
```
Line height: _____
Letter spacing: _____ em
Text transform: ___________
```

---

## 6. Card Stack Behavior

### Inactive Stack Appearance
- [ ] Display style:
  - [ ] Single card back
  - [ ] Stack of cards (layered)
  - [ ] Card count overlay
  - [ ] Other: `___________`
- [ ] Stack indicator position: `___________`
- [ ] Stack depth visual: `___________`

### Active Stack Expansion
- [ ] Grid layout: _____ columns
- [ ] Maximum cards displayed: _____
- [ ] Card arrangement pattern: `___________`
- [ ] Expansion animation:
  - Type: Scale / Slide / Fade / Custom
  - Duration: _____ ms
  - Easing: `___________`

### Stack Rotation System
```
Round 1 - C-Suite:
- Active stack: Center
- Left stack: Empty / Hidden
- Right stack: Empty / Hidden

Round 2+ - Challenges:
- Active stack: Center (Challenge card)
- Left stack: Role cards (Active / Inactive?)
- Right stack: Synergy cards (Active / Inactive?)
```

- [ ] Rotation animation duration: _____ ms
- [ ] Rotation animation type: `___________`

---

## 7. Interaction Design

### Card Hover Effects
```
Scale amount: _____ (e.g., 1.05)
Duration: _____ ms
Shadow change: Yes / No
Shadow specs: _____________________
Y-offset: _____ px
Other effects: _____________________
```

### Card Selection
```
Selection indicator:
- Ring color: #___________
- Ring thickness: _____ px
- Ring offset: _____ px
- Glow effect: Yes / No
- Glow color: #___________
- Glow blur: _____ px

Animation on select:
- Type: Scale / Pulse / Bounce / Custom
- Duration: _____ ms
```

### Click/Tap Feedback
```
Scale down to: _____ (e.g., 0.95)
Duration: _____ ms
Other effects: _____________________
```

### Confirm Button
```
Position: Center / Bottom / Right / Custom
Size: _____ x _____ px
Colors:
- Enabled bg: #___________
- Enabled text: #___________
- Disabled bg: #___________
- Disabled text: #___________
Border radius: _____ px
Shadow: _____________________
Hover scale: _____
```

### Turn Transitions
```
Animation when switching players:
- Type: _____________________
- Duration: _____ ms
- Visual indicator: _____________________
```

---

## 8. Round Flow Specifications

### Round 1: C-Suite Selection

#### Display
- [ ] Number of C-Suite cards shown: `_____` (typically 5)
- [ ] Layout: Grid / Horizontal / Custom
- [ ] Card arrangement: `___________`

#### Interaction
- [ ] Selection process:
  - [ ] Click once to select and confirm
  - [ ] Click to select, separate confirm button
  - [ ] Other: `___________`
- [ ] Show selection preview: Yes / No
- [ ] Confirmation required: Yes / No

### Rounds 2-6: Challenge Rounds

#### Challenge Card (Center)
```
Display size: _____ x _____ px
Position: Center / Top-center / Custom
Information shown:
- [ ] Round number
- [ ] Challenge category
- [ ] Challenge title
- [ ] Challenge description
- [ ] Difficulty stars
- [ ] Other: ___________
```

#### Role Cards (Left Stack)
```
Number of cards: _____
Display when:
- [ ] Always visible (expanded)
- [ ] Only when active for selection
- [ ] After challenge card is revealed
Layout: _____ columns
```

#### Synergy Cards (Right Stack)
```
Number of cards: _____
Display when:
- [ ] Always visible (expanded)
- [ ] Only when active for selection
- [ ] After role card selected
Layout: _____ columns
Optional: [ ] Yes [ ] No
```

#### Selection Order
- [ ] Simultaneous (pick role + synergy at once)
- [ ] Sequential (role first, then synergy)
- [ ] Free choice (either order)
- [ ] Other: `___________`

#### Card Pairing
- [ ] Show selected role + synergy together: Yes / No
- [ ] Preview combined effect: Yes / No
- [ ] Position for preview: `___________`

---

## 9. Player Display

### Player Positions Around Table
- [ ] Show players around table: **Yes / No**

If Yes, specify positions:
- [ ] Top: _____ players
- [ ] Bottom: _____ players (typically current player)
- [ ] Left: _____ players
- [ ] Right: _____ players

### Player Card Design
```
Size: _____ x _____ px
Contains:
- [ ] Avatar
- [ ] Name
- [ ] Score
- [ ] C-Suite badge
- [ ] Turn indicator
- [ ] Status (played/waiting)
- [ ] Other: ___________

Turn indicator style:
- Type: Glow / Ring / Arrow / Pulse / Custom
- Color: #___________
- Animation: _____________________
```

### Current Player Highlight
```
Visual treatment:
- [ ] Border color change
- [ ] Background color change
- [ ] Scale increase
- [ ] Glow effect
- [ ] Other: ___________

Specs: _____________________
```

---

## 10. Animation Timings

### Card Animations
```
Card flip duration: _____ ms
Card reveal duration: _____ ms
Card deal duration: _____ ms (per card)
Stack rotation duration: _____ ms
Card hover duration: _____ ms
Card select duration: _____ ms
```

### Transition Animations
```
Round transition: _____ ms
Player turn transition: _____ ms
Score update: _____ ms
Leaderboard reorder: _____ ms
```

### UI Animations
```
Button hover: _____ ms
Modal appear: _____ ms
Toast notification: _____ ms
Timer warning pulse: _____ ms
```

### Easing Functions
```
Default easing: ease / ease-in / ease-out / ease-in-out / cubic-bezier(___,___,___,___)
Card animations: _____________________
Transitions: _____________________
Hover effects: _____________________
```

---

## 11. Responsive Design

### Breakpoints
```
Mobile: < _____ px
Tablet: _____ px - _____ px
Desktop: > _____ px
Large desktop: > _____ px
```

### Layout Adjustments

#### Mobile (< 768px)
```
- [ ] Stack cards vertically
- [ ] Hide inactive stacks
- [ ] Simplify leaderboard
- [ ] Collapse player avatars
- [ ] Other: ___________
```

#### Tablet (768px - 1024px)
```
- [ ] 2-column card grid
- [ ] Side-by-side leaderboard
- [ ] Show limited player avatars
- [ ] Other: ___________
```

#### Desktop (> 1024px)
```
- [ ] Full 3-stack layout
- [ ] All players visible
- [ ] Expanded leaderboard
- [ ] Other: ___________
```

---

## 12. Accessibility Requirements

### Keyboard Navigation
- [ ] Tab order: `___________`
- [ ] Enter/Space to select cards
- [ ] Escape to cancel/deselect
- [ ] Arrow keys for card navigation

### Screen Reader Support
- [ ] ARIA labels for all interactive elements
- [ ] Announce turn changes
- [ ] Announce score updates
- [ ] Announce timer warnings

### Visual Accessibility
- [ ] Minimum contrast ratio: _____ (WCAG AA/AAA)
- [ ] Text size adjustments supported
- [ ] Color-blind friendly mode: Yes / No
- [ ] Focus indicators: `___________`

### Motion Preferences
- [ ] Respect prefers-reduced-motion
- [ ] Disable animations option: Yes / No

---

## 13. Reference Files

### Screenshots/Mockups
- [ ] Initial load state: `___________`
- [ ] Round 1 (C-Suite): `___________`
- [ ] Round 2 (Challenge): `___________`
- [ ] Card selection in progress: `___________`
- [ ] Victory screen: `___________`
- [ ] Mobile view: `___________`

### Design Files
- [ ] Figma link: `___________`
- [ ] Sketch file: `___________`
- [ ] Adobe XD: `___________`
- [ ] Other: `___________`

### Assets Folder
- [ ] Card back graphics: `___________`
- [ ] Icon set: `___________`
- [ ] Background textures: `___________`
- [ ] Avatar templates: `___________`

### Brand Guidelines
- [ ] Style guide document: `___________`
- [ ] Color palette: `___________`
- [ ] Logo assets: `___________`

### Reference Games/Apps
Similar design inspiration:
1. `___________`
2. `___________`
3. `___________`

---

## 14. Performance Requirements

### Load Time
- [ ] Initial load: < _____ seconds
- [ ] Card assets: < _____ seconds
- [ ] Animation start: < _____ ms

### Frame Rate
- [ ] Target FPS: _____ (typically 60)
- [ ] Minimum acceptable FPS: _____

### Asset Optimization
- [ ] Maximum card image size: _____ KB
- [ ] Image format: WebP / PNG / SVG / Other
- [ ] Lazy load non-visible cards: Yes / No

---

## 15. Audio (Optional)

### Sound Effects
- [ ] Card deal: `___________`
- [ ] Card flip: `___________`
- [ ] Card select: `___________`
- [ ] Confirm selection: `___________`
- [ ] Turn change: `___________`
- [ ] Timer warning: `___________`
- [ ] Round complete: `___________`
- [ ] Victory: `___________`

### Background Music
- [ ] Lobby music: `___________`
- [ ] Gameplay music: `___________`
- [ ] Volume control: Yes / No
- [ ] Mute option: Yes / No

---

## 16. Special Features

### Animations/Effects
- [ ] Confetti on victory: Yes / No
- [ ] Particle effects: Yes / No
- [ ] Card glow effects: Yes / No
- [ ] Transition wipes: Yes / No
- [ ] Other: `___________`

### Easter Eggs
- [ ] Special animations: `___________`
- [ ] Hidden features: `___________`

### Customization
- [ ] Theme selection: Yes / No
- [ ] Card back options: Yes / No
- [ ] Table texture options: Yes / No

---

## 17. Technical Constraints

### Browser Support
- [ ] Chrome: Version _____+
- [ ] Firefox: Version _____+
- [ ] Safari: Version _____+
- [ ] Edge: Version _____+
- [ ] Mobile browsers: `___________`

### Device Support
- [ ] Desktop: Yes / No
- [ ] Tablet: Yes / No
- [ ] Mobile phone: Yes / No
- [ ] Minimum screen size: _____ px

### Libraries/Frameworks
- [ ] Animation library: Framer Motion / GSAP / React Spring / Other: `___________`
- [ ] UI components: Custom / Library: `___________`
- [ ] CSS approach: Tailwind / CSS Modules / Styled Components / Other: `___________`

---

## 18. Implementation Notes

### Development Phases
**Phase 1: Core Structure**
- [ ] Basic layout skeleton
- [ ] Card stack positioning
- [ ] Leaderboard integration

**Phase 2: Visual Design**
- [ ] Apply glassmorphism
- [ ] Color scheme implementation
- [ ] Typography system

**Phase 3: Interactions**
- [ ] Card selection logic
- [ ] Hover/click animations
- [ ] Turn-based system

**Phase 4: Polish**
- [ ] Smooth transitions
- [ ] Loading states
- [ ] Error handling
- [ ] Accessibility features

### Testing Checklist
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Performance profiling
- [ ] Accessibility audit
- [ ] User acceptance testing

---

## Approval & Sign-off

**Design approved by:** `___________`
**Date:** `___________`
**Implementation start:** `___________`
**Target completion:** `___________`

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-16 | 1.0 | Initial draft | Claude |
|  |  |  |  |
|  |  |  |  |

---

## Additional Notes

*Add any additional specifications, constraints, or requirements here:*

```
[Space for notes]
```
