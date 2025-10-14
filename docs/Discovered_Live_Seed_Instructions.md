# Discovered Live! - Seed Data Instructions

## The Problem
The original seed file (`039b_career_clues_seed.sql`) contains clues for 16 careers, but many of those career codes may not exist in your `career_paths` table, causing foreign key constraint errors.

## The Solution - 3 Step Process

### Step 1: Verify Existing Careers

Run this query in Supabase SQL Editor to see which careers exist:

**File:** `docs/verify_existing_careers.sql`

```sql
SELECT career_code, career_name, is_active
FROM career_paths
WHERE career_code IN (
  'artist', 'athlete', 'chef', 'coach', 'doctor', 'engineer',
  'farmer', 'firefighter', 'librarian', 'musician', 'nurse',
  'pilot', 'police-officer', 'scientist', 'teacher', 'veterinarian'
)
ORDER BY career_code;
```

**What to look for:** Note which `career_code` values appear in the results. These are the careers you can use.

---

### Step 2: Use Minimal Seed File (Recommended)

The minimal seed file only includes the 3 most common careers:
- `teacher`
- `doctor`
- `nurse`

**File:** `database/migrations/039b_career_clues_seed_minimal.sql`

**To use:**
1. Copy the entire contents of `039b_career_clues_seed_minimal.sql`
2. Paste into Supabase SQL Editor
3. Click **Run**

**Result:** 15 clues (5 per career) - enough to test the game!

---

### Step 3 (Optional): Add More Careers

If Step 1 showed that other careers exist (like `chef`, `firefighter`, `police-officer`), you can add them:

1. Open the backup file: `database/migrations/039b_career_clues_seed.sql.backup`
2. Find the section for the career you want (e.g., `CHEF CLUES`)
3. Copy just that section
4. Add it to a new SQL query in Supabase
5. Run it

**Example - Adding Chef:**
```sql
INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('chef', 'This career counts ingredients like eggs and cups of flour to make yummy food.', 'counting', 'easy', 'elementary', 0, ARRAY['teacher', 'baker'], 'random'),
('chef', 'This career reads recipes with lots of letters and words to know what to cook.', 'letters', 'easy', 'elementary', 0, ARRAY['librarian', 'teacher'], 'related'),
('chef', 'This career uses shapes when cutting vegetables into circles, squares, and triangles.', 'shapes', 'easy', 'elementary', 0, ARRAY['artist', 'teacher'], 'related'),
('chef', 'This career measures 2 cups of flour and 3 eggs to create delicious recipes.', 'counting', 'medium', 'elementary', 3, ARRAY['scientist', 'nurse'], 'related'),
('chef', 'This career works in a restaurant kitchen where they help their community by making meals.', 'community', 'medium', 'elementary', 3, ARRAY['firefighter', 'teacher'], 'related');
```

---

## Files Created

| File | Purpose |
|------|---------|
| `docs/verify_existing_careers.sql` | Check which careers exist in your database |
| `database/migrations/039b_career_clues_seed_clean.sql` | **RECOMMENDED** - Clean seed with 14 verified careers (70 clues) |
| `database/migrations/039b_career_clues_seed_minimal.sql` | Minimal seed with 3 common careers (15 clues) - for quick testing |
| `database/migrations/039b_career_clues_seed.sql.backup` | Full original seed file (80 clues, 16 careers - includes missing careers) |
| `database/migrations/039b_career_clues_seed.sql` | Legacy file, use clean version instead |

---

## Quick Start (Recommended)

**For fastest testing:**

1. Run verification query to confirm teacher/doctor/nurse exist
2. Run the minimal seed file: `039b_career_clues_seed_minimal.sql`
3. Test the game at `http://localhost:3000/test/discovered-live`

You'll have 15 clues across 3 careers - plenty to test all game features:
- Intro screen
- Question answering
- Bingo grid unlocking
- Streak bonuses
- Bingo line detection
- Results celebration

---

## Adding Custom Clues Later

Once the game is working, you can add more clues by:

1. Checking which careers exist in your database
2. Writing clues for those careers
3. Inserting them using the same format

**Clue Format:**
```sql
INSERT INTO dl_clues (
  career_code,           -- Must exist in career_paths table
  clue_text,            -- The question shown to students
  skill_connection,     -- 'counting', 'letters', 'shapes', 'community'
  difficulty,           -- 'easy', 'medium', 'hard'
  grade_category,       -- 'elementary', 'middle', 'high'
  min_play_count,       -- 0 for easy, 3+ for medium/hard
  distractor_careers,   -- Array of wrong answer options
  distractor_strategy   -- 'random', 'related', 'same_skill'
) VALUES
('career-code-here', 'Clue text here...', 'counting', 'easy', 'elementary', 0, ARRAY['other', 'careers'], 'random');
```

---

## Troubleshooting

**Error: "violates foreign key constraint"**
- The career_code doesn't exist in your `career_paths` table
- Run Step 1 to verify which careers exist
- Only use career codes from the verification results

**Error: "relation dl_clues does not exist"**
- You haven't run the main migration yet
- Run `database/migrations/039_discovered_live_game_tables.sql` first

**No clues appearing in game**
- Check that `is_active = true` on the clues
- Verify clues exist: `SELECT COUNT(*) FROM dl_clues;`
- Check browser console for errors

---

## Summary

✅ **Recommended approach:** Use `039b_career_clues_seed_clean.sql` (70 clues, 14 careers) - this has been verified to work with your existing careers

⚡ **Quick testing:** Use `039b_career_clues_seed_minimal.sql` (15 clues, 3 careers) for faster initial testing

⚠️ **Avoid:** Running the original `039b_career_clues_seed.sql` or backup file - they contain careers that don't exist in your database
