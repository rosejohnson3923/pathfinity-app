# Page Capture Script for Migration Reference
> Capture all existing pages as PDFs for accurate migration reference

## Why Screenshots/PDFs are Better:

1. **Shows ACTUAL functionality** - Not simplified versions
2. **Captures all edge cases** - Loading states, error states, transitions
3. **Shows real data** - How content actually renders
4. **Preserves interactions** - Hover states, animations, modals
5. **Documents current bugs** - So we know what NOT to replicate

## 📸 Pages to Capture

### For Each Demo User (Sam, Alex, Jordan, Taylor):

#### 1. Authentication Flow
- [ ] Login page (empty)
- [ ] Login page (with error)
- [ ] Sign up page
- [ ] Password reset page

#### 2. Onboarding Flow
- [ ] Welcome screen
- [ ] Career selection (grade-specific careers shown)
- [ ] AI Companion selection
- [ ] Onboarding complete

#### 3. Dashboard States
- [ ] Dashboard - Fresh login
- [ ] Dashboard - Learn tile highlighted
- [ ] Dashboard - Experience tile highlighted
- [ ] Dashboard - Discover tile highlighted
- [ ] Dashboard - With notifications
- [ ] Dashboard - With achievements popup

#### 4. Learn Module
- [ ] Learn - Career context screen
- [ ] Learn - Instruction screen
- [ ] Learn - Question presentation (multiple choice)
- [ ] Learn - Question presentation (fill-in-blank)
- [ ] Learn - Question presentation (drag-drop)
- [ ] Learn - Correct answer feedback
- [ ] Learn - Incorrect answer feedback
- [ ] Learn - Progress screen
- [ ] Learn - Completion screen

#### 5. Experience Module  
- [ ] Experience - Career context intro
- [ ] Experience - Challenge presentation
- [ ] Experience - Interactive workspace (K-2 manipulatives)
- [ ] Experience - Interactive workspace (7-10 simulations)
- [ ] Experience - Professional chat open
- [ ] Experience - Solution reveal
- [ ] Experience - Achievement earned
- [ ] Experience - Completion screen

#### 6. Discover Module
- [ ] Discover - Content selection
- [ ] Discover - Video player
- [ ] Discover - Article reader
- [ ] Discover - Interactive activity
- [ ] Discover - Real-world connection
- [ ] Discover - Completion screen

#### 7. Additional Screens
- [ ] Profile/Settings
- [ ] Achievements gallery
- [ ] Progress reports
- [ ] Parent view (if applicable)
- [ ] Chat with companion

## 🎯 Capture Method

### Manual Browser Method:
```javascript
// Run in browser console for each page
// This will capture the current view as PDF

// Method 1: Print to PDF
window.print(); // Then save as PDF

// Method 2: Full page screenshot (Chrome DevTools)
// Ctrl+Shift+P → "Capture full size screenshot"
```

### Automated Capture Script:
```javascript
// capture-all-pages.js
const puppeteer = require('puppeteer');

const DEMO_USERS = [
  { username: 'sam_k', password: 'demo123' },
  { username: 'alex_1', password: 'demo123' },
  { username: 'jordan_7', password: 'demo123' },
  { username: 'taylor_10', password: 'demo123' }
];

async function captureAllPages() {
  const browser = await puppeteer.launch({ headless: false });
  
  for (const user of DEMO_USERS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Login
    await page.goto('http://localhost:3000/login');
    await page.screenshot({ 
      path: `captures/${user.username}/01-login-empty.png`,
      fullPage: true 
    });
    
    // Fill login
    await page.type('#email', user.username);
    await page.type('#password', user.password);
    await page.screenshot({ 
      path: `captures/${user.username}/02-login-filled.png`,
      fullPage: true 
    });
    
    // Submit and wait for dashboard
    await page.click('#login-button');
    await page.waitForSelector('.dashboard');
    await page.screenshot({ 
      path: `captures/${user.username}/03-dashboard.png`,
      fullPage: true 
    });
    
    // Navigate to Learn
    await page.click('.bento-learn-card');
    await page.waitForSelector('.career-context-screen');
    await page.screenshot({ 
      path: `captures/${user.username}/04-learn-context.png`,
      fullPage: true 
    });
    
    // Continue capturing all states...
    
    await page.pdf({ 
      path: `captures/${user.username}/complete-flow.pdf`,
      format: 'A4',
      printBackground: true
    });
  }
  
  await browser.close();
}

captureAllPages();
```

## 📁 Organized Capture Structure

```
captures/
├── sam_k/
│   ├── 01-login/
│   ├── 02-dashboard/
│   ├── 03-learn/
│   │   ├── context-screen.png
│   │   ├── instruction.png
│   │   ├── question-1.png
│   │   └── completion.png
│   ├── 04-experience/
│   ├── 05-discover/
│   └── complete-flow.pdf
├── alex_1/
│   └── ... (same structure)
├── jordan_7/
│   └── ... (same structure)
└── taylor_10/
    └── ... (same structure)
```

## ✅ What to Document for Each Capture

For each screenshot/PDF, note:

1. **URL/Route** - What URL shows this page
2. **User State** - Logged in as who, what progress
3. **Data Shown** - What content is displayed
4. **Interactions Available** - What can be clicked
5. **Responsive Breakpoint** - Desktop/tablet/mobile
6. **Theme** - Light/dark mode
7. **Errors/Issues** - Any bugs visible

## 🔍 Analysis Template

```markdown
# Page: Dashboard
User: Sam (K)
URL: /dashboard
State: Fresh login, no progress

## Visible Elements:
- Welcome message with name
- Bento grid with 4 cards
- Learn card shows 0% progress
- Career badge shows Chef icon

## Interactions:
- Click Learn → Goes to career context
- Click Experience → Currently locked
- Click Discover → Currently locked
- Click Chat → Opens companion chat

## Data Dependencies:
- user.name
- user.career
- progress.learn
- progress.experience
- progress.discover

## Issues Found:
- [ ] Button text overflowing on Learn card
- [ ] Progress bar not aligned properly
- [ ] Dark mode text not visible

## New App Requirements:
- Keep same data structure
- Fix button overflow
- Improve dark mode contrast
- Simplify card hover states
```

## 🚀 Quick Capture Commands

```bash
# Install puppeteer
npm install puppeteer

# Run capture script
node capture-all-pages.js

# Convert PNGs to PDF
convert captures/sam_k/*.png captures/sam_k/complete.pdf

# Or use browser extension
# Chrome: Full Page Screen Capture
# Firefox: Screenshot Tool
```

## 💡 Benefits of This Approach

1. **Perfect Reference** - See exactly what exists
2. **Identify Problems** - Document what to fix
3. **Preserve Good Parts** - Keep what works
4. **Test Comparison** - Compare old vs new
5. **Stakeholder Communication** - Show before/after

---

**You're absolutely right - having PDFs of all actual pages is much better than simplified wireframes. We'll have perfect references showing all the complex interactions, edge cases, and actual UI elements that my wireframes missed!**

Would you like me to:
1. Create the puppeteer script to automate captures?
2. Document specific interaction flows to capture?
3. Set up a comparison framework for old vs new?