# Career Match - Testing Checklist

**Created:** October 24, 2025
**Status:** Ready for Testing

---

## 🔧 Pre-Testing Setup

### 1. Database Migration
- [ ] Run migration 058: `058_create_career_match_tables.sql`
- [ ] Verify all tables created:
  - `cm_rooms`
  - `cm_players`
  - `cm_cards`
  - `cm_moves`
- [ ] Check RLS policies are active
- [ ] Test room code generation function: `SELECT cm_generate_room_code();`
- [ ] Test card initialization function

**How to Run Migration:**
```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Using psql
psql -h <host> -U <user> -d <database> -f database/migrations/058_create_career_match_tables.sql

# Option 3: Paste SQL directly into Supabase SQL Editor
```

### 2. Verify Career Images
- [ ] Check that career images exist at `/public/assets/Discovered Live/Role - Landscape/`
- [ ] Count images (should have at least 15 for hard mode)
- [ ] Create placeholder image if needed: `/public/assets/placeholder-career.png`

### 3. Import Components
- [ ] Verify TypeScript compiles without errors
- [ ] Check all imports resolve correctly
- [ ] Verify MasterSoundSystem is available
- [ ] Verify AIPlayerPoolService is available

---

## 🧪 Unit Testing

### CareerMatchService
- [ ] **createRoom()**: Creates room with correct difficulty settings
- [ ] **createRoom()**: Fills room with AI players
- [ ] **joinRoom()**: Allows user to join by room code
- [ ] **joinRoom()**: Rejects invalid room codes
- [ ] **joinRoom()**: Prevents joining full rooms
- [ ] **startGame()**: Only host can start
- [ ] **startGame()**: Requires minimum 2 players
- [ ] **startGame()**: Initializes cards correctly
- [ ] **flipCard()**: First flip reveals card
- [ ] **flipCard()**: Second flip checks for match
- [ ] **flipCard()**: Match gives bonus turn
- [ ] **flipCard()**: No match advances to next player
- [ ] **flipCard()**: Validates it's user's turn
- [ ] **completeGame()**: Calculates final scores correctly
- [ ] **completeGame()**: Awards placement bonuses
- [ ] **completeGame()**: Detects perfect memory (no misses)

### CareerMatchRealtimeService
- [ ] **subscribeToRoom()**: Creates channel successfully
- [ ] **unsubscribeFromRoom()**: Cleans up channel
- [ ] **broadcast*()**: All broadcast methods work
- [ ] Database changes trigger events
- [ ] Multiple subscribers receive same events

---

## 🎮 Integration Testing

### Test Case 1: Solo Game (Easy Mode)
**Setup:**
1. Create new room (Easy difficulty)
2. Start game with 1 human + 3 AI players

**Tests:**
- [ ] Room created with code
- [ ] 3 AI players added automatically
- [ ] Lobby shows all 4 players
- [ ] Start button enabled (4 >= 2 players)
- [ ] Game starts and shows 12 cards (3×4 grid)
- [ ] Cards are face down initially
- [ ] Click a card → flips face up
- [ ] Click second card → checks match
- [ ] Match found → cards stay up, earn XP, go again
- [ ] No match → cards flip back after 2s, next player's turn
- [ ] AI players take turns automatically
- [ ] AI players make reasonable moves (30% memory)
- [ ] Leaderboard updates in real-time
- [ ] Game ends when all pairs matched
- [ ] Completion screen shows final scores
- [ ] XP calculated correctly (50 per match + bonuses)

### Test Case 2: Multiplayer (Medium Mode)
**Setup:**
1. Player 1 creates room (Medium difficulty)
2. Player 2 joins by room code
3. Add 2 AI players to fill

**Tests:**
- [ ] Player 2 can join with room code
- [ ] Both players see each other in lobby
- [ ] Host badge shows on Player 1
- [ ] Only host can start game
- [ ] Game shows 20 cards (4×5 grid)
- [ ] Time countdown shows 5:00
- [ ] Both players see same game state
- [ ] Card flips sync instantly
- [ ] Turn indicator shows correct player
- [ ] Can't click cards when not your turn
- [ ] Match celebrations show for all players
- [ ] Streak bonuses trigger at 3 matches
- [ ] Time warning at 1:00 remaining
- [ ] Time pressure (2x XP) in last 60s
- [ ] Game ends at 0:00 or all pairs found
- [ ] Both players see same final scores

### Test Case 3: Full Room (Hard Mode)
**Setup:**
1. Create room with 6 max players
2. Fill with 1 human + 5 AI players

**Tests:**
- [ ] All 6 slots filled
- [ ] Game shows 30 cards (5×6 grid)
- [ ] Turn order cycles through all 6 players
- [ ] AI players (90% memory) make smart moves
- [ ] AI remembers card positions well
- [ ] Leaderboard shows all 6 players sorted
- [ ] Ranks update as matches change
- [ ] Perfect memory bonus (500 XP) awarded
- [ ] 1st/2nd/3rd place bonuses awarded correctly
- [ ] Game completes in ~8 minutes or less

---

## 🔊 Sound System Testing

### Background Music
- [ ] Music starts when game begins
- [ ] Music loops seamlessly (no gap)
- [ ] Music volume appropriate (0.3)
- [ ] Music stops on game end
- [ ] Music stops when leaving game

### Sound Effects
- [ ] **card-flip** plays on every card flip
- [ ] **match-success** plays when cards match
- [ ] **card-mismatch** plays when no match (after 1.5s)
- [ ] **turn-change** plays on turn switch
- [ ] **game-start** plays at game beginning
- [ ] **game-complete** plays at game end
- [ ] **streak-bonus** plays on 3+ consecutive matches
- [ ] **time-warning** plays at 60s remaining
- [ ] No overlapping sounds
- [ ] All volumes appropriate

---

## 🤖 AI Player Testing

### AI Behavior
- [ ] AI players have realistic names from pool
- [ ] AI players marked with "AI" badge
- [ ] AI players take turns automatically
- [ ] AI delay feels natural (2-5 seconds)
- [ ] Easy AI forgets cards (70% forget rate)
- [ ] Medium AI remembers some cards (40% forget rate)
- [ ] Hard AI has good memory (10% forget rate)
- [ ] AI makes strategic moves when remembers match
- [ ] AI makes random guesses when doesn't know

### AI Integration
- [ ] AIPlayerPoolService assigns unique names
- [ ] No duplicate AI names in same room
- [ ] AI player IDs are valid UUIDs
- [ ] AI players tracked in database correctly

---

## 🏆 Leaderboard Testing

### In-Game Leaderboard
- [ ] Shows all players sorted by matches
- [ ] Updates instantly on match
- [ ] Shows current streak (🔥 icon)
- [ ] Highlights active player
- [ ] Highlights current user (YOU)
- [ ] Ranks update correctly (1st, 2nd, 3rd)

### Global Leaderboard (Future)
- [ ] Stats recorded after game
- [ ] Total matches incremented
- [ ] Win rate calculated
- [ ] Perfect memory games counted
- [ ] Longest streak recorded
- [ ] Arcade XP → PathIQ XP conversion (10:1)

---

## 🎨 UI/UX Testing

### Card Component
- [ ] Cards flip smoothly (600ms)
- [ ] 3D rotation looks good
- [ ] Career images load correctly
- [ ] Career names display in banner
- [ ] Matched cards show checkmark
- [ ] Matched cards have green glow
- [ ] Disabled cards don't respond to clicks
- [ ] Hover effects work on desktop
- [ ] Cards responsive on mobile

### Game Board
- [ ] Grid adjusts to screen size
- [ ] Sidebar shows on desktop, stacks on mobile
- [ ] Timer counts down correctly
- [ ] Timer turns red at 1:00
- [ ] Turn indicator clear and visible
- [ ] Loading spinner shows during load
- [ ] Error messages display if issues occur

### Lobby
- [ ] Room code large and readable
- [ ] Copy button works
- [ ] "Copied!" feedback shows
- [ ] Player list updates in real-time
- [ ] Empty slots show "Waiting..."
- [ ] Start button disabled if < 2 players
- [ ] Leave button works
- [ ] Tips section helpful

---

## 📱 Responsive Testing

### Desktop (1920×1080)
- [ ] Full layout with sidebar
- [ ] Large cards (medium size)
- [ ] All elements visible
- [ ] No horizontal scroll

### Tablet (768×1024)
- [ ] Sidebar stacks on top
- [ ] Cards slightly smaller
- [ ] Touch targets large enough
- [ ] Readable text

### Mobile (375×667)
- [ ] Single column layout
- [ ] Small cards
- [ ] Room code fits on screen
- [ ] Buttons accessible
- [ ] No tiny text

---

## 🔒 Security Testing

### RLS Policies
- [ ] Users can only see rooms they're in
- [ ] Users can only flip cards when their turn
- [ ] Users can't modify other players' data
- [ ] AI players can be created by system

### Input Validation
- [ ] Room codes must be 6 characters
- [ ] Can't flip same card twice
- [ ] Can't flip matched cards
- [ ] Can't start with < 2 players
- [ ] Can't join full rooms

---

## 🐛 Edge Cases

### Disconnections
- [ ] Player disconnect during lobby
- [ ] Player disconnect during game
- [ ] Host disconnect transfers host role?
- [ ] Game continues with remaining players

### Timing
- [ ] Game ends exactly at 0:00
- [ ] Cards flip back exactly after 2s
- [ ] No race conditions on simultaneous clicks
- [ ] Turn timeout (30s) works

### Data Consistency
- [ ] Refresh page maintains state
- [ ] Multiple tabs stay in sync
- [ ] No duplicate cards in grid
- [ ] All pairs have exactly 2 cards

---

## ✅ Pre-Deployment Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Sound system fully working
- [ ] AI players behaving correctly
- [ ] Realtime sync working
- [ ] Mobile responsive
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Database migration successful
- [ ] Performance acceptable (<100ms card flip)
- [ ] Memory usage reasonable
- [ ] Network requests efficient

---

## 🚀 Post-Testing Tasks

### If Tests Pass:
1. Create git commit with comprehensive message
2. Push to repository
3. Deploy database migration
4. Add to Discovered Live Arcade menu
5. Create game icon/thumbnail
6. Update main navigation

### If Tests Fail:
1. Document all failing tests
2. Prioritize critical bugs
3. Fix issues systematically
4. Re-test after fixes
5. Repeat until all pass

---

## 📝 Test Results Log

**Tester:** ________________
**Date:** ________________
**Environment:** ________________

### Summary
- Total Tests: _____ / _____
- Passed: _____
- Failed: _____
- Blocked: _____

### Critical Issues Found:
1.
2.
3.

### Notes:

---

**Status:** ⏳ AWAITING TESTING
