# Leaderboard Hybrid Mode

## Overview

The leaderboard system supports both **mock data** (for testing/development) and **real data** (from Supabase PathIQ profiles). This hybrid approach allows for gradual rollout and safe testing before going full production.

---

## Feature Flag Configuration

### Location
`.env` file at the project root

### Flag
```bash
VITE_USE_REAL_LEADERBOARD=false  # Mock data (default)
VITE_USE_REAL_LEADERBOARD=true   # Real data from Supabase
```

---

## How It Works

### Mock Data Mode (Default)
- **Safe for testing**: No database queries, no real user data
- **Predictable**: Always shows the same mock leaderboard with test users
- **Fast**: No network latency, instant loading
- **Privacy-friendly**: Uses anonymous display names like "Swift Explorer #1"
- **Current user appears as rank #2** with their actual XP from gamification profile

### Real Data Mode
- **Production-ready**: Pulls from `pathiq_profiles` table via `pathiq_leaderboard_view`
- **Live rankings**: Real-time XP and level data from actual students
- **Filtered by grade level**: Shows only students in the same grade
- **Anonymous by default**: Uses generated names for privacy
- **Current user highlighted**: Shows "You" instead of display name

---

## Switching Between Modes

### Step 1: Update Environment Variable

**For Mock Data (Testing):**
```bash
# In .env
VITE_USE_REAL_LEADERBOARD=false
```

**For Real Data (Production):**
```bash
# In .env
VITE_USE_REAL_LEADERBOARD=true
```

### Step 2: Restart Development Server
```bash
# Stop the server (Ctrl+C)
npm run dev  # Restart
```

### Step 3: Verify Mode
Check the browser console for the log message:
```
🏆 Leaderboard Mode: MOCK DATA
# or
🏆 Leaderboard Mode: REAL DATA
```

---

## Testing Checklist

### Before Enabling Real Data

- [ ] Verify database migrations are applied (005-007)
- [ ] Confirm `pathiq_profiles` table has data
- [ ] Test `pathiq_leaderboard_view` returns results
- [ ] Verify Row Level Security (RLS) policies are active
- [ ] Check that PathIQ XP awards are working in containers
- [ ] Confirm journey tracking sessions are completing

### After Enabling Real Data

- [ ] Dashboard loads without errors
- [ ] Leaderboard shows real student data (or empty state if no data)
- [ ] Current user's rank is accurate
- [ ] Anonymous display names are working
- [ ] Grade-level filtering is correct
- [ ] Loading states appear during data fetch
- [ ] No sensitive student information is exposed

---

## Mock Data Structure

The mock leaderboard includes:

```typescript
{
  players: [
    { rank: 1, displayName: 'Swift Explorer #1', xp: 1250, level: 5 },
    { rank: 2, displayName: 'You', xp: 980, level: 4 },  // Current user
    { rank: 3, displayName: 'Bright Scholar #3', xp: 920, level: 4 },
    { rank: 4, displayName: 'Clever Thinker #4', xp: 850, level: 4 },
    { rank: 5, displayName: 'Bold Achiever #5', xp: 780, level: 3 }
  ],
  totalPlayers: 25,
  currentUserRank: 2
}
```

---

## Real Data Structure

Real leaderboard data comes from `RealLeaderboardService`:

```typescript
{
  players: [
    {
      userId: 'uuid',
      rank: 1,
      displayName: 'Swift Explorer #1',  // Generated for privacy
      xp: 1250,
      level: 5,
      streakDays: 7,
      career: 'chef',
      careerIcon: '👨‍🍳',
      isCurrentUser: false
    },
    // ... more players
  ],
  totalPlayers: 42,
  currentUserRank: 5,
  currentUserXP: 890,
  lastUpdated: '2025-10-09T12:00:00Z',
  gradeLevel: 'K',
  tenantId: 'tenant-uuid'
}
```

---

## Dashboard Display

### Elementary Dashboard (K-5)
- Shows top 3 leaderboard entries
- Displays user's rank in large number format
- Side-by-side layout: rank badge + top 3 list

### Middle School Dashboard (6-8)
- Shows top 3 leaderboard entries
- Displays user's rank in large number format
- Grid layout: rank + leaderboard list

### High School Dashboard (9-12)
- Shows top 3 leaderboard entries in compact format
- List-style display with XP values

---

## Gradual Rollout Strategy

### Phase 1: Development (Current)
- Use mock data (`VITE_USE_REAL_LEADERBOARD=false`)
- Test UI/UX with predictable data
- Verify container integration works

### Phase 2: Internal Testing
- Enable real data for specific test accounts
- Monitor database performance
- Verify RLS policies work correctly
- Test with multiple students in same grade

### Phase 3: Beta Rollout
- Enable for small group of beta users
- Monitor for issues
- Gather user feedback
- Tune caching and performance

### Phase 4: Full Production
- Set `VITE_USE_REAL_LEADERBOARD=true` in production `.env`
- Deploy to all users
- Monitor leaderboard usage and performance

---

## Troubleshooting

### Issue: Leaderboard shows "No leaderboard data yet"

**Mock Mode:**
- This shouldn't happen with mock data
- Check console for errors

**Real Mode:**
- No students have earned XP yet
- Database connection issue
- Check Supabase logs

### Issue: Current user rank is wrong

**Mock Mode:**
- Expected - mock data uses fixed rank of 2

**Real Mode:**
- Verify PathIQ XP awards are working
- Check `pathiq_profiles` table has user's record
- Verify `getUserRank()` function in PathIQPersistenceService

### Issue: Loading never finishes

**Real Mode only:**
- Check network tab for failed requests
- Verify Supabase connection
- Check RLS policies allow read access
- Review `useLeaderboard` hook error states

---

## Performance Considerations

### Mock Data
- **Load time**: Instant (<1ms)
- **Database queries**: 0
- **Network requests**: 0

### Real Data
- **Load time**: 100-500ms (cached: 2-5ms)
- **Database queries**: 2-3 per load
- **Cache duration**: 2 minutes
- **Network requests**: 1-2 per load

---

## Related Files

### Components
- `src/components/dashboard/BentoDashboard.tsx` - Main dashboard with hybrid leaderboard

### Hooks
- `src/hooks/useLeaderboard.ts` - Real leaderboard data hook

### Services
- `src/services/leaderboard/RealLeaderboardService.ts` - Real data service
- `src/services/persistence/PathIQPersistenceService.ts` - PathIQ profiles and rankings

### Database
- `supabase/migrations/006_pathiq_profiles_persistence.sql` - PathIQ tables and views
- `pathiq_profiles` table - Student XP and levels
- `pathiq_leaderboard_view` - Ranked leaderboard view

---

## Support

For issues or questions:
1. Check console logs for error messages
2. Review Supabase logs for database issues
3. Verify environment variables are set correctly
4. Test with mock data first to isolate issues

---

**Last Updated**: October 2025
