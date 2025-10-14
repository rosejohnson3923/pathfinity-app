# Discovered Live! Testing Guide

## Quick Testing Status

You now have **TWO** standalone HTML test pages:

1. **`test-discovered-live-multiplayer.html`** - Full-featured version with Tailwind CSS
2. **`test-multiplayer-simple.html`** - Simplified debugging version (recommended to try first)

---

## Step-by-Step Testing Instructions

### Option 1: Simplified Test Page (Try This First!)

**File:** `test-multiplayer-simple.html`

**Why use this version:**
- Self-contained (no external dependencies)
- Has console logging for debugging
- Simpler code structure
- Easier to identify issues

**How to test:**

1. **Open the file:**
   - Navigate to the project folder
   - Find `test-multiplayer-simple.html`
   - **Right-click → Open With → Your Browser** (Chrome, Firefox, Edge, Safari)
   - **DO NOT** open through `localhost:3000` or Vite dev server

2. **Open Browser Console:**
   - Press `F12` (or `Cmd+Option+I` on Mac)
   - Click the "Console" tab

3. **Check for these console messages:**
   ```
   Script loaded!
   Page loaded!
   ✅ Page loaded. Click START NEW GAME!
   ```

4. **Click the "🚀 START NEW GAME" button**

5. **Expected console messages:**
   ```
   Starting game...
   🎮 Starting new game!
   ```

6. **Expected visual changes:**
   - Bingo grid (5×5) appears with career names and icons
   - Question displays (e.g., "Q1: I prepare delicious meals")
   - Players list shows 6 players (You + 5 AI bots)
   - Timer starts counting down (15s)
   - Status changes to "Question 1/20"

7. **Play the game:**
   - Read the question
   - Click the matching career on your bingo card
   - Watch for ✅ or ❌ feedback in the Event Log
   - Continue through 20 questions
   - View results screen at the end

---

### Option 2: Full-Featured Test Page

**File:** `test-discovered-live-multiplayer.html`

**Why use this version:**
- Better styling with Tailwind CSS
- Configurable settings (number of players, questions, timer)
- More polished UI
- Closer to production design

**How to test:**

1. **Open the file:**
   - Right-click `test-discovered-live-multiplayer.html`
   - Select "Open With" → Your Browser
   - **DO NOT** use localhost or Vite

2. **Configure settings (optional):**
   - Click "⚙️ Settings" button
   - Adjust:
     - Number of Players (2-10)
     - Questions Per Game (5-30)
     - Timer Duration (5-30 seconds)

3. **Click "🚀 START NEW GAME"**

4. **Play the game** (same as simplified version)

---

## Troubleshooting

### Issue: Console shows no messages at all

**Possible causes:**
- JavaScript is disabled in your browser
- File didn't open correctly
- Browser security settings blocking local files

**Solutions:**
1. Enable JavaScript in browser settings
2. Try a different browser (Chrome usually most permissive)
3. Check browser security settings for local file access

---

### Issue: Console shows "Script loaded!" but nothing when clicking button

**Possible causes:**
- Button onclick handler not wiring up
- Event listener issue
- Browser cache problem

**Solutions:**
1. **Hard refresh:** Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Clear cache:** Browser settings → Clear browsing data → Cached files
3. **Try opening in Incognito/Private mode**
4. **Try a different browser**

---

### Issue: "Starting game..." appears but grid doesn't show

**Check console for JavaScript errors:**
- Look for red error messages
- Common causes:
  - Syntax errors
  - Function not defined
  - Missing variables

**Solutions:**
1. Screenshot the console errors and report them
2. Try the simplified version if the full version fails

---

### Issue: Game starts but timer doesn't count down

**Check:**
- Does the timer show a number (like "15s")?
- Does it change at all?

**Solutions:**
1. Check console for errors during timer execution
2. Wait 1-2 seconds to see if it starts
3. Try refreshing and starting a new game

---

### Issue: Clicking careers does nothing

**Check:**
- Are you clicking during an active question?
- Is the timer still running (> 0s)?

**Expected behavior:**
- Only unlocked careers can be clicked
- Clicking shows ✅ or ❌ in the Event Log
- Correct answers turn the square green

---

## What Should Happen During a Normal Game

### Game Start:
✅ Bingo grid appears (5×5 = 25 squares)
✅ Center square is yellow with "❓ Question" (free square)
✅ Each other square has a career name and icon
✅ Question 1 displays
✅ Timer starts at 15s (or your configured duration)
✅ Players list shows all players with 0 XP

### During Questions:
✅ Each question shows career clue text
✅ Timer counts down second by second
✅ Clicking correct career:
   - Square turns green
   - "✅ You clicked [Career]. Correct!" in log
   - Your XP increases (+10)
   - Your "correct" count increases
   - AI bots also answer (shown in log)
✅ Clicking wrong career:
   - "❌ You clicked [Career]. Wrong!" in log
   - Square stays unchanged
   - No XP gained

### Bingo Detection:
✅ Completing a full row → "🎉 BINGO! Row completed! +50 XP"
✅ Completing a column → Similar message
✅ Completing a diagonal → Similar message
✅ Bingo count increases
✅ Bonus XP added (50 per bingo)

### Game End (After 20 Questions):
✅ Status changes to "Complete!"
✅ Results modal appears
✅ Podium shows top 3 players
✅ Full rankings displayed
✅ "🔄 Play Again" button available

---

## Performance Checklist

Test these scenarios:

- ✅ **Quick game:** 5 questions, 2 players
- ✅ **Normal game:** 20 questions, 6 players
- ✅ **Large game:** 30 questions, 10 players
- ✅ **Fast timer:** 5 seconds per question
- ✅ **Slow timer:** 30 seconds per question
- ✅ **Multiple games:** Play 3 games in a row

Check:
- ✅ Load time < 2 seconds
- ✅ Smooth animations (no stuttering)
- ✅ No memory leaks (check browser Task Manager)
- ✅ Timer stays accurate (doesn't skip seconds)
- ✅ Event log updates properly
- ✅ No console errors

---

## Browser Compatibility Testing

Test in these browsers:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

---

## Mobile Testing

1. Open the test page on your mobile device:
   - Transfer the HTML file to your phone
   - Open in mobile browser
   - OR access via local network (if running a local server)

2. Check:
   - ✅ Bingo grid fits on screen
   - ✅ Squares are large enough to tap
   - ✅ Text is readable
   - ✅ No horizontal scrolling
   - ✅ Buttons are easily tappable
   - ✅ Modal overlays display correctly

---

## Reporting Issues

If you encounter problems, please provide:

1. **Browser and version** (e.g., Chrome 118, Firefox 119)
2. **Operating system** (e.g., Windows 11, macOS Sonoma)
3. **Which test file** (simple or full-featured)
4. **Console messages** (screenshot or copy/paste)
5. **What happened vs. what you expected**
6. **Steps to reproduce**

---

## Next Steps After Successful Testing

Once both test pages work correctly:

### For Development:
1. Test the React components:
   - Run `npm run dev`
   - Navigate to `http://localhost:3000/discovered-live-test`
   - Test with mock data first
   - Then test with real database

2. Test multiplayer functionality:
   - Navigate to `http://localhost:3000/discovered-live-multiplayer-test`
   - Join a test room
   - Test with multiple browser windows

### For Production:
1. **Database Setup:**
   - Run migrations: `database/migrations/039_*.sql`
   - Seed career clues: `database/migrations/039b_*.sql`
   - Verify seed data: `docs/Discovered_Live_Verification_Queries.sql`

2. **Enable Real-time:**
   - Configure Supabase Realtime
   - Test WebSocket connections
   - Monitor connection stability

3. **Start Scheduler:**
   ```typescript
   import { perpetualRoomScheduler } from '@/services/PerpetualRoomScheduler';
   perpetualRoomScheduler.start();
   ```

4. **Deploy:**
   - Build: `npm run build`
   - Test production build: `npm run preview`
   - Deploy to hosting platform

---

## Additional Resources

**Documentation:**
- `TEST_INSTRUCTIONS.md` - Detailed testing instructions
- `docs/Discovered_Live_Final_Completion_Summary.md` - Complete feature list
- `docs/Performance_Optimization_Guide.md` - Performance tips
- `public/sounds/README.md` - Sound effects setup

**Component Files:**
- `src/services/GameOrchestrator.ts` - Main game logic
- `src/components/discovered-live/MultiplayerCard.tsx` - Main game UI
- `src/components/discovered-live/MultiplayerResults.tsx` - Results screen
- `src/components/discovered-live/SpectatorView.tsx` - Spectator mode

**Test Files:**
- `test-multiplayer-simple.html` - Simplified test (debugging)
- `test-discovered-live-multiplayer.html` - Full-featured test
- `src/pages/DiscoveredLiveTestPage.tsx` - React test page
- `src/pages/DiscoveredLiveMultiplayerTestPage.tsx` - Advanced React test

---

## Common Test Scenarios

### Scenario 1: First-Time User
1. Open `test-multiplayer-simple.html`
2. Click START NEW GAME
3. Play through 5 questions
4. Verify understanding of game mechanics

### Scenario 2: Bingo Achievement
1. Start game
2. Answer 5 consecutive questions correctly
3. Try to complete a row or column
4. Verify 50 XP bonus awarded

### Scenario 3: Multiple Games
1. Complete one full game
2. Click "Play Again"
3. Verify state resets correctly
4. Play second game
5. Check for memory leaks

### Scenario 4: Timer Expiration
1. Start game
2. Don't click any career
3. Wait for timer to reach 0
4. Verify game moves to next question

### Scenario 5: Wrong Answers
1. Start game
2. Intentionally click wrong careers
3. Verify no XP gained
4. Verify squares stay locked

---

## Success Criteria

The test is successful when:

✅ Game starts without errors
✅ Bingo grid displays correctly (5×5)
✅ Questions cycle through (1-20)
✅ Timer counts down accurately
✅ Clicking careers works (correct/incorrect)
✅ XP calculations are correct
✅ Bingo detection works (rows, columns, diagonals)
✅ AI opponents respond
✅ Leaderboard updates in real-time
✅ Results screen displays
✅ Can play multiple games in a row
✅ No console errors
✅ Smooth performance throughout

---

---

## Recent Bug Fixes (Latest)

### ✅ Fixed: Questions Skipping Too Fast
**Problem:** Questions were advancing immediately after clicking, not giving users time to play.

**Solution:** Timer is now authoritative - each question displays for the full timer duration (default 15 seconds). Questions only advance when the timer expires.

### ✅ Fixed: Bot Names
**Changed:** "QuickBot", "SmartBot" → "Aaron B.", "Jessica M.", "Marcus L." etc.

**Result:** More realistic multiplayer experience with human-like names.

### ✅ Fixed: Grid Generation
**Problem:** Only 24 careers but needed 25 for 5×5 grid, causing infinite loop.

**Solution:** Added "Accountant" as 25th career.

**See:** `docs/Test_Page_Bug_Fixes.md` for complete technical details.

---

## 🎉 You're Ready!

Start with `test-multiplayer-simple.html` to verify everything works, then move to the full-featured version for a polished experience!

**Expected Experience:**
- ✅ 15 seconds per question (configurable)
- ✅ AI players answer at random times throughout the question
- ✅ You can answer anytime during the 15 seconds
- ✅ Question advances only when timer expires
- ✅ Realistic multiplayer feel

**Happy Testing! 🚀**
