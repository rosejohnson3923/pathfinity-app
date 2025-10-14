# Discovered Live! Testing Instructions

## Quick Start Testing

### Option 1: Standalone HTML Test Page (Recommended for Quick Testing)

**File:** `test-discovered-live-multiplayer.html`

**How to Use:**
1. Open `test-discovered-live-multiplayer.html` directly in your browser (double-click or right-click → Open With → Browser)
2. Click "⚙️ Settings" to configure:
   - Number of Players (2-10)
   - Questions Per Game (5-30)
   - Timer Duration (5-30 seconds)
3. Click "🚀 Start New Game"
4. Play the game:
   - Read the career clue
   - Click the matching career on your bingo card
   - Watch AI opponents compete
   - Complete rows, columns, or diagonals for bonus XP
5. View results at the end
6. Click "🔄 Play Again" to test again

**What This Tests:**
- ✅ Full multiplayer gameplay simulation
- ✅ Bingo card generation (5×5 grid)
- ✅ Question cycling with timer
- ✅ AI opponents with different difficulty levels
- ✅ Click validation and feedback
- ✅ Bingo detection (rows, columns, diagonals)
- ✅ XP calculation and tracking
- ✅ Live leaderboard updates
- ✅ Results screen with podium
- ✅ Event logging
- ✅ Game flow from start to finish

**Features:**
- 🎮 Fully interactive game simulation
- 🤖 AI opponents (QuickBot, SteadyBot, SmartBot, etc.)
- 📊 Real-time leaderboard
- 🏆 Podium results screen
- 📝 Event log showing all actions
- ⚙️ Configurable settings
- 📱 Mobile responsive

**No Requirements:**
- ❌ No server needed
- ❌ No database needed
- ❌ No authentication needed
- ❌ No build process needed
- ✅ Just open and play!

---

### Option 2: React Test Page (Full Integration)

**File:** `src/pages/DiscoveredLiveTestPage.tsx`

**How to Access:**
1. Make sure your React app is running: `npm run dev`
2. Navigate to: `http://localhost:3000/discovered-live-test`
3. Configure test settings:
   - Use Mock Data (toggle on for testing without login)
   - Student Name
   - Grade Category
   - User Career Code
4. Click "Start New Game"

**What This Tests:**
- ✅ Full React component integration
- ✅ Database connectivity
- ✅ Supabase integration
- ✅ Authentication flow
- ✅ Real clue fetching from database
- ✅ Game persistence
- ✅ Production-ready components

**Requirements:**
- ✅ React app running
- ✅ Database migrations run
- ✅ Supabase configured
- ⚠️ Seed data recommended (but optional)

---

### Option 3: Multiplayer Test Page (Advanced)

**File:** `src/pages/DiscoveredLiveMultiplayerTestPage.tsx`

**How to Access:**
1. Make sure your React app is running
2. Navigate to: `http://localhost:3000/discovered-live-multiplayer-test`

**What This Tests:**
- ✅ Full multiplayer functionality
- ✅ Real-time WebSocket events
- ✅ Room management
- ✅ Participant tracking
- ✅ AI opponent simulation
- ✅ GameOrchestrator service
- ✅ All multiplayer features

---

## Testing Checklist

### Basic Gameplay ✅
- [ ] Game starts correctly
- [ ] Questions display properly
- [ ] Timer counts down
- [ ] Clicking careers works
- [ ] Correct answers unlock squares
- [ ] Incorrect answers show feedback
- [ ] Bingo detection works (rows, columns, diagonals)
- [ ] XP is calculated correctly
- [ ] Game completes after all questions

### Multiplayer Features ✅
- [ ] Multiple players shown in leaderboard
- [ ] AI opponents answer questions
- [ ] Leaderboard updates in real-time
- [ ] Different AI difficulty levels work
- [ ] Player ranking is correct

### UI/UX ✅
- [ ] Bingo card looks good
- [ ] Question card is readable
- [ ] Timer is visible and clear
- [ ] Leaderboard is formatted correctly
- [ ] Results screen displays properly
- [ ] Podium shows top 3 players
- [ ] Event log shows actions
- [ ] Animations are smooth
- [ ] Responsive on mobile

### Edge Cases ✅
- [ ] Timer expiring works correctly
- [ ] Clicking wrong career shows feedback
- [ ] Completing multiple bingos works
- [ ] Game ends when questions run out
- [ ] Starting new game resets state
- [ ] All players finish with correct scores

---

## Common Issues & Solutions

### Issue: HTML page shows blank grid
**Solution:** Make sure JavaScript is enabled in your browser

### Issue: Timer not counting down
**Solution:** Check browser console for errors, refresh page

### Issue: No AI opponents responding
**Solution:** This is simulated - they respond after you click

### Issue: React test page won't load
**Solution:**
1. Check that migrations are run: See `database/migrations/039_*.sql`
2. Verify Supabase connection
3. Check browser console for errors

### Issue: "Career not found" error
**Solution:** The career code must exist in your database's `career_paths` table

---

## Performance Testing

### Test Scenarios:
1. **Minimum Players (2):** Test with just 2 players
2. **Maximum Players (10):** Test with 10 players to see performance
3. **Quick Games (5 questions):** Fast completion test
4. **Long Games (30 questions):** Endurance test
5. **Fast Timer (5s):** High-pressure scenario
6. **Slow Timer (30s):** Relaxed gameplay

### What to Watch:
- ⏱️ Load time (should be < 2 seconds)
- 🎨 Animation smoothness (should be 60 FPS)
- 🔄 Leaderboard update speed
- 💾 Memory usage (check browser DevTools)
- 📱 Mobile responsiveness

---

## Browser Testing

Test in these browsers:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Next Steps After Testing

Once you've tested and everything works:

1. **For Production:**
   - Use the React components (not HTML test page)
   - Connect to real database
   - Enable Supabase Realtime
   - Start the scheduler: `perpetualRoomScheduler.start()`
   - Deploy to production

2. **Optional Enhancements:**
   - Add real sound effects (see `/public/sounds/README.md`)
   - Enable background music
   - Add more career clues to database
   - Customize theming

3. **Monitor:**
   - Check logs for errors
   - Monitor WebSocket connections
   - Track player engagement
   - Gather user feedback

---

## Need Help?

**Documentation:**
- High Priority Features: `docs/Discovered_Live_High_Priority_Completion_Summary.md`
- Medium Priority Features: `docs/Discovered_Live_Medium_Priority_Completion_Summary.md`
- Performance Guide: `docs/Performance_Optimization_Guide.md`
- Complete Status: `docs/Discovered_Live_Complete_Implementation_Status.md`
- Final Summary: `docs/Discovered_Live_Final_Completion_Summary.md`

**Component Locations:**
- GameOrchestrator: `src/services/GameOrchestrator.ts`
- Multiplayer Card: `src/components/discovered-live/MultiplayerCard.tsx`
- Results Screen: `src/components/discovered-live/MultiplayerResults.tsx`
- Spectator View: `src/components/discovered-live/SpectatorView.tsx`

**Quick Commands:**
```bash
# Run React app
npm run dev

# Build for production
npm run build

# Run tests (if you add them)
npm test
```

---

## 🎉 Happy Testing!

The standalone HTML test page (`test-discovered-live-multiplayer.html`) is the **easiest way** to quickly test the complete game flow without any setup. Just open it in your browser and start playing!

For full integration testing with real database and authentication, use the React test pages.
