# 📸 Page Capture Instructions

## Quick Start

### 1. Install Puppeteer
```bash
npm install puppeteer
```

### 2. Update Login Credentials
Edit `capture-pages.js` and update the DEMO_USERS array with correct emails:
```javascript
const DEMO_USERS = [
  { 
    username: 'sam_k@demo.com',  // <- Update this
    password: 'demo123',         // <- And this
    displayName: 'Sam',
    grade: 'K'
  },
  // ... update others
];
```

### 3. Make Sure App is Running
```bash
# In one terminal:
npm start
# Wait for app to load on http://localhost:3000
```

### 4. Run the Capture
```bash
# In another terminal:
node capture-pages.js

# Or use the helper script:
bash run-capture.sh
```

## What Gets Captured

The script will create this structure:
```
captures/
├── sam_gradeK/
│   ├── 01-auth/
│   │   ├── 01-login-empty.png
│   │   └── 02-login-filled.png
│   ├── 02-dashboard/
│   │   ├── 01-main-view.png
│   │   └── 02-learn-hover.png
│   ├── 03-learn/
│   │   ├── 01-career-context.png
│   │   ├── 02-after-start.png
│   │   └── 03-question.png
│   ├── 04-experience/
│   │   ├── 01-experience-intro.png
│   │   └── 02-interactive.png
│   ├── 05-discover/
│   │   └── 01-discover-content.png
│   ├── 06-profile/
│   │   └── 01-profile-menu.png
│   ├── sam_complete_flow.pdf
│   └── capture_summary.json
├── alex_grade1/
│   └── ... (same structure)
├── jordan_grade7/
│   └── ... (same structure)
└── taylor_grade10/
    └── ... (same structure)
```

## Customization

### Change What's Captured
Edit `capture-pages.js` to add more pages:

```javascript
// Add more screenshot points
await page.screenshot({ 
  path: path.join(dirs.learn, '04-completion.png'),
  fullPage: true 
});
```

### Capture Dark Mode
Add theme toggle:
```javascript
// Toggle to dark mode
await page.click('.theme-toggle');
await delay(1000);
await page.screenshot({ 
  path: path.join(dirs.dashboard, '03-dark-mode.png'),
  fullPage: true 
});
```

### Capture Different Viewports
Add mobile/tablet views:
```javascript
// Tablet view
await page.setViewport({ width: 768, height: 1024 });
await page.screenshot({ 
  path: path.join(dirs.dashboard, '04-tablet.png'),
  fullPage: true 
});

// Mobile view
await page.setViewport({ width: 375, height: 667 });
await page.screenshot({ 
  path: path.join(dirs.dashboard, '05-mobile.png'),
  fullPage: true 
});
```

## Troubleshooting

### Issue: "Cannot find module 'puppeteer'"
**Solution**: Run `npm install puppeteer`

### Issue: "Timeout waiting for selector"
**Solution**: The app might use different class names. Check DevTools and update selectors:
```javascript
// Instead of:
await page.waitForSelector('.dashboard');

// Try:
await page.waitForSelector('[class*="dashboard"], [class*="Dashboard"]');
```

### Issue: "Login fails"
**Solution**: Check the actual login field selectors:
```javascript
// Open DevTools, right-click email field, Inspect
// Look for id, name, or unique class
// Update selector:
await page.type('#your-email-field-id', user.username);
```

### Issue: "Navigation timeout"
**Solution**: Increase delays:
```javascript
await delay(5000); // Increase from 2000 to 5000
```

### Issue: "Browser closes immediately"
**Solution**: Set headless to false to see what's happening:
```javascript
const browser = await puppeteer.launch({ 
  headless: false,  // See the browser
  slowMo: 250      // Slow down actions
});
```

## Manual Alternative

If the script has issues, capture manually:

### Chrome Method:
1. Open Chrome DevTools (F12)
2. Click the 3-dot menu → More Tools → Rendering
3. Check "Emulate CSS media type: screen"
4. Press `Ctrl+Shift+P` → type "screenshot"
5. Choose "Capture full size screenshot"

### Quick Captures List:
- [ ] Login page (empty)
- [ ] Login page (with error)
- [ ] Dashboard (Sam - K)
- [ ] Dashboard (Alex - 1)
- [ ] Dashboard (Jordan - 7)
- [ ] Dashboard (Taylor - 10)
- [ ] Learn - Career Context
- [ ] Learn - Instruction
- [ ] Learn - Question
- [ ] Experience - Introduction
- [ ] Experience - Challenge
- [ ] Discover - Content
- [ ] Profile/Settings

## Using the Captures

Once captured, use these as references when building the new app:

1. **Open old and new side-by-side**
2. **Match functionality, not exact pixels**
3. **Note what to fix** (overflow, contrast issues)
4. **Document differences** in migration notes

---

**Time Estimate**: ~10 minutes for all 4 users
**Storage Needed**: ~50-100MB for all images/PDFs