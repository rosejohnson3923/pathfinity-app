# Pathfinity UI Design Guidelines

## Primary Brand Colors
- PURPLE SPECTRUM
•	Primary Purple: #8B5CF6 (purple-500) → #7C3AED (purple-600)
•	Light Purple: #A78BFA (purple-400) - Used for accents and hover states
•	Dark Purple: #6D28D9 (purple-700) - Used for emphasis and dark mode
•	Purple Backgrounds: #F3E8FF (purple-50) - Light backgrounds and subtle highlights
- INDIGO SPECTRUM
•	Primary Indigo: #6366F1 (indigo-500) → #4F46E5 (indigo-600)
•	Light Indigo: #818CF8 (indigo-400) - Secondary accents
•	Dark Indigo: #3730A3 (indigo-700) - Strong emphasis
•	Indigo Backgrounds: #EEF2FF (indigo-50) - Subtle section backgrounds
- SIGNATURE GRADIENTS
•	Primary Brand: from-purple-600 to-indigo-600 - Main CTAs, hero elements
•	Hero Background: from-purple-50 via-blue-50 to-indigo-50 (light) / from-gray-900 via-purple-900/90 to-indigo-900/90 (dark)
•	Card Highlights: from-purple-500/10 to-indigo-600/10 - Subtle card backgrounds

## Secondary Feature Colors
- LEARN MODE (PURPLE-INDIGO)
•	Gradient: from-purple-500 to-indigo-600
•	Background: Purple-tinted gradients
•	Accent: Purple-300 for interaction highlights
- EXPERIENCE MODE (BLUE-CYAN)
•	Gradient: from-blue-500 to-cyan-600
•	Background: Blue-tinted gradients
•	Accent: Blue-300 for interaction highlights
- DISCOVER MODE (EMERALD-TEAL)
•	Gradient: from-emerald-500 to-teal-600
•	Background: Green-tinted gradients
•	Accent: Emerald-300 for interaction highlights

## Functional Colors
- SUCCESS & POSITIVE STATES
•	Success Green: #10B981 (emerald-500) - Checkmarks, completed states
•	Achievement: #059669 (emerald-600) - Progress indicators
•	Light Success: #D1FAE5 (emerald-100) - Success backgrounds
- WARNING & ATTENTION
•	Warning Yellow: #F59E0B (amber-500) - Alerts, important notices
•	Star Rating: #FBBF24 (amber-400) - Review stars, ratings
- INFORMATION & LINKS
•	Info Blue: #3B82F6 (blue-500) - Links, informational elements
•	Hover Blue: #2563EB (blue-600) - Link hover states

## Neutral Color System
- LIGHT MODE NEUTRALS
•	Primary Text: #111827 (gray-900) - Main headings, important text
•	Secondary Text: #4B5563 (gray-600) - Body text, descriptions
•	Muted Text: #6B7280 (gray-500) - Supporting text, captions
•	Background: #FFFFFF (white) - Main backgrounds
•	Card Background: #FFFFFF (white) - Card containers
•	Border: #F3F4F6 (gray-100) - Subtle borders
•	Section Background: #F9FAFB (gray-50) - Alternating sections
- DARK MODE NEUTRALS
•	Primary Text: #FFFFFF (white) - Main headings, important text
•	Secondary Text: #D1D5DB (gray-300) - Body text, descriptions
•	Muted Text: #9CA3AF (gray-400) - Supporting text, captions
•	Background: #111827 (gray-900) - Main backgrounds
•	Card Background: #1F2937 (gray-800) - Card containers
•	Border: #374151 (gray-700) - Subtle borders
•	Section Background: #111827 (gray-900) - Consistent dark sections

## Typography Guidelines
-FONT FAMILY: Default sans-serif.
-FONT WEIGHTS:
•	font-bold
•	font-semibold
•	font-medium
-FONT SIZES:
•	text-6xl (e.g., for main headings like "Infinite Paths. One You.")
•	text-5xl (e.g., for main headings)
•	text-4xl (e.g., for section titles)
•	text-3xl (e.g., for sub-section titles, metrics)
•	text-2xl (e.g., for navigation, card titles, Finn's name)
•	text-xl (e.g., for hero section paragraph, section descriptions)
•	text-lg (e.g., for testimonial quotes, mode details description)
•	text-base (default, implied for most body text)
•	text-sm (e.g., for smaller descriptions, navigation links, footer text)
•	text-xs (e.g., for very small text like "Students" under Finn's card, leaderboard ranks)
-LINE HEIGHTS:
•	leading-tight (e.g., for h1 elements)
•	leading-relaxed (e.g., for paragraph text)

## Color Usage Guidelines
- HIERARCHY & EMPHASIS
1.	Primary Actions: Purple-to-indigo gradients
2.	Secondary Actions: Border-only with purple/indigo text
3.	Success States: Emerald green with checkmarks
4.	Feature Differentiation: Mode-specific color gradients
5.	Text Hierarchy: Gray-900 → Gray-600 → Gray-500 (light mode)
- ACCESSIBILITY COMPLIANCE
•	Contrast Ratios: All text meets WCAG AA standards (4.5:1 minimum)
•	Color Blindness: Information never conveyed by color alone
•	Focus States: High contrast focus rings on interactive elements
- RESPONSIVE COLOR BEHAVIOR
•	Mobile: Simplified color palette, focus on primary brand colors
•	Desktop: Full color spectrum with subtle gradients and effects
•	Dark Mode: Automatic color inversion with maintained contrast ratios
- BRAND COLOR APPLICATIONS
•	Navigation: Purple-600 for active states, gray for inactive
•	CTAs: Primary gradient for main actions, secondary colors for supporting actions
•	Cards: White/gray-800 backgrounds with colored accents
•	Icons: Match surrounding text color or use brand purple for emphasis
•	Backgrounds: Subtle gradients using brand colors at low opacity


## Core Components
- **Button**: Primary, secondary, ghost variants with loading states
- **Card**: Elevated container with optional header, body, footer sections
- **Modal**: Overlay dialog with backdrop blur and close functionality
- **Input**: Text fields with labels, validation states, and help text
- **Badge**: Status indicators with color variants and count displays
- **Avatar**: User profile images with fallback initials and status dots
- **Navigation**: Sidebar and top bar with active states, icons and role-based visibility
- **Progress**: Linear and circular indicators with percentage labels and animations

## Key Screens
- **Login**: Authentication with SSO options and tenant selection
- **Dashboard**: Personalized overview with daily lessons and progress tracking
- **Learn Mode**: Adaptive learning interface with AI tutor chat panel
- **Experience Mode**: Project workspace with team collaboration tools
- **Discover Mode**: Gamified assessments with talent identification results
- **BRAND Studio**: Media creation workspace with templates and editing tools
- **COLLAB Marketplace**: Team formation and skill sharing platform
- **MEET Platform**: Video conferencing with chat and screen sharing
- **EARN Dashboard**: Gamification overview with points, badges, and leaderboards
- **Analytics**: Progress tracking with charts and performance insights
- **Admin Panel**: Tenant management with user roles and system configuration
- **Onboarding Wizard: Student skills assessment and pathway setup interface

## Implementation Guidelines & Updates

### Container-Specific Background Implementation
**Learn Container (Learn Mode)**
- Light mode: `bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50`
- Dark mode: `dark:from-gray-900 dark:via-gray-800 dark:to-gray-900` (for transition screens)
- Progress elements: `from-purple-500 to-indigo-600` gradients
- CTAs: `bg-gradient-to-r from-purple-500 to-indigo-600`

**Experience Container (Experience Mode)**
- Light mode: `bg-gradient-to-br from-blue-50 to-cyan-50`
- Dark mode: `dark:from-gray-900 dark:via-blue-900/90 dark:to-cyan-900/90`
- Career elements: `from-blue-500 to-cyan-600` gradients
- Badge generation: `from-blue-600 to-cyan-600` backgrounds

**Discover Container (Discover Mode)**
- Light mode: `bg-gradient-to-br from-emerald-50 to-teal-50`
- Dark mode: `dark:from-gray-900 dark:via-emerald-900/90 dark:to-teal-900/90`
- Story elements: `from-emerald-500 to-teal-600` gradients
- Interactive elements: emerald-300 accents for highlights

### Transition Screen Guidelines
**Particle Background Screens**
- Consistent dark background for seamless transitions: `dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`
- Light mode maintains mode-specific colors
- Used in: Learn progress, ThreeContainerOrchestrator loading, CareerBadgeLanyard creation

### Dark Mode Contrast Requirements
- Main container backgrounds use 90% opacity for proper darkness: `dark:via-[mode]-900/90`
- Card backgrounds: `dark:bg-gray-800` for main content, `dark:bg-gray-700` for overlays
- Transition backgrounds: solid gray gradients for consistency
- Border enhancement: `border-2 border-gray-200 dark:border-gray-500` for definition

### Brand Compliance Checklist
✅ **Learn Mode**: Purple-indigo theming implemented across all screens
✅ **Experience Mode**: Blue-cyan theming with proper Career, Inc. branding
✅ **Discover Mode**: Emerald-teal theming for narrative experiences
✅ **Dark Mode**: Proper contrast ratios and consistent transition backgrounds
✅ **Typography**: Existing hierarchy maintained and verified
✅ **Hero Gradients**: Mode-specific backgrounds implemented per specification

