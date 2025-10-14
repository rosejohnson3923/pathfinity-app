# Generate Production Career Bingo Clues

## Overview

This guide explains how to generate **production-quality, age-appropriate career clues** for Career Bingo using OpenAI.

---

## What Gets Generated

**30 clues per career** (10 per grade category):

### Elementary (K-5)
- **Length:** 5-7 words
- **Vocabulary:** Simple, everyday words
- **Focus:** Concrete, observable actions
- **Examples:**
  - "I help people feel better"
  - "I teach students every day"
  - "I cook food in restaurants"

### Middle School (6-8)
- **Length:** 10-15 words
- **Vocabulary:** Technical terms with context
- **Focus:** Skills and responsibilities
- **Examples:**
  - "I use scientific methods to research and discover new medical treatments"
  - "I design buildings and create blueprints for construction projects"

### High School (9-12)
- **Length:** Varied structures
- **Vocabulary:** Complex, technical concepts
- **Focus:** Specialized skills and advanced responsibilities
- **Examples:**
  - "I analyze complex data patterns to develop strategic business solutions and optimize organizational performance"

---

## Age-Appropriate Language System

The clue generator uses **strict language constraints** from:
```
src/services/ai-prompts/rules/UniversalContentRules.ts
```

**Grade-Level Mapping:**
- Elementary → Uses `K` constraints (kindergarten-level language)
- Middle → Uses `6-8` constraints (middle school vocabulary)
- High → Uses `9-12` constraints (high school complexity)

This is enforced automatically by `CareerBingoClueGenerator.generateCareerClues()`.

---

## Prerequisites

### 1. Environment Variables
Ensure your `.env` file contains:
```bash
VITE_SUPABASE_URL=https://zohdmprtfyijneqnwjsu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SUPABASE_ANON_KEY=your_anon_key

# Azure OpenAI (for clue generation)
VITE_AZURE_OPENAI_ENDPOINT=your_endpoint
VITE_AZURE_OPENAI_API_KEY=your_key
VITE_AZURE_OPENAI_GPT4O_DEPLOYMENT=gpt-4o
```

### 2. Database Tables
Ensure tables exist:
- `career_paths` - List of careers
- `dl_clues` - Storage for generated clues

---

## Running the Script

### Generate All Clues
```bash
npx tsx scripts/generate-production-clues.ts
```

**What it does:**
1. Fetches all active careers from `career_paths` table
2. For each career, generates 10 clues × 3 grades = 30 clues
3. Skips careers that already have 10+ clues per grade
4. Inserts new clues into `dl_clues` table
5. Shows progress and summary

**Expected Output:**
```
🚀 Career Bingo Production Clue Generator

Using age-appropriate language constraints from:
  src/services/ai-prompts/rules/UniversalContentRules.ts

Configuration:
  - Elementary (K-5): 5-7 words, simple vocabulary
  - Middle (6-8): 10-15 words, technical terms
  - High (9-12): Varied length, complex concepts
  - Clues per career per grade: 10

📚 Found 50 active careers

[1/50] 🎯 Teacher (teacher)
  🤖 elementary: Generating 10 clues...
  ✅ elementary: Inserted 10 clues
  🤖 middle: Generating 10 clues...
  ✅ middle: Inserted 10 clues
  🤖 high: Generating 10 clues...
  ✅ high: Inserted 10 clues

...

============================================================
📊 Generation Complete!

✅ Successfully generated: 150 career/grade combinations
⏭️  Skipped (already exist): 0
❌ Failed: 0
📈 Total new clues: 1500
============================================================
```

---

## Rate Limiting

The script includes automatic rate limiting:
- **1 second delay** between API calls
- Processes **1 career at a time**
- Safe for Azure OpenAI rate limits

**Estimated Time:**
- 50 careers × 3 grades × 1 second = ~2.5 minutes

---

## Verification

After generation, the script shows:

```
🔍 Verification:

  elementary: 500 total clues
  middle: 500 total clues
  high: 500 total clues

📝 Sample clues:

  [elementary/easy] teacher: "I help students learn new things"
  [middle/medium] nurse: "I provide medical care and monitor patient health in hospitals"
  [high/hard] engineer: "I apply advanced mathematical principles to design complex systems"
```

---

## Database Schema

Clues are inserted with this structure:

```sql
CREATE TABLE dl_clues (
  id UUID PRIMARY KEY,
  career_code VARCHAR NOT NULL,
  clue_text TEXT NOT NULL,
  skill_connection TEXT,
  difficulty VARCHAR, -- 'easy', 'medium', 'hard'
  grade_category VARCHAR NOT NULL, -- 'elementary', 'middle', 'high'
  min_play_count INTEGER DEFAULT 0,
  distractor_careers TEXT[], -- Similar careers for wrong answers
  is_active BOOLEAN DEFAULT true,
  times_shown INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Troubleshooting

### Error: "Missing Supabase credentials"
**Solution:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` file

### Error: "Failed to generate clues for [career]"
**Solution:** Check Azure OpenAI credentials and rate limits

### Clues too long/short for grade level
**Solution:** Check `UniversalContentRules.ts` - constraints are enforced there

### Want to regenerate clues?
**Solution:** Delete existing clues first:
```sql
DELETE FROM dl_clues WHERE career_code = 'teacher';
```
Then run script again.

---

## Example Generated Clues

### Teacher (Elementary)
1. "I help students learn new things" (easy)
2. "I teach reading and math" (easy)
3. "I grade homework and tests" (medium)
4. "I plan fun learning activities" (medium)
5. "I explain hard ideas simply" (hard)

### Nurse (Middle School)
1. "I monitor vital signs and provide medical care to patients in hospitals" (easy)
2. "I administer medications and assist doctors with medical procedures" (medium)
3. "I document patient health information and communicate with medical teams" (hard)

### Engineer (High School)
1. "I apply advanced mathematical principles to design complex mechanical systems" (easy)
2. "I utilize computational modeling to optimize structural integrity and performance" (medium)
3. "I integrate multidisciplinary knowledge to solve sophisticated engineering challenges" (hard)

---

## Next Steps

After generating clues:

1. ✅ **Verify clue quality** - Review sample clues in each grade category
2. ✅ **Test in game** - Run Career Bingo with real clues
3. ✅ **Monitor analytics** - Track `times_shown` and `times_correct` in database
4. ✅ **Iterate** - Regenerate clues for careers with poor performance

---

## Production Checklist

Before launching:

- [ ] All active careers have 10+ clues per grade
- [ ] Elementary clues use 5-7 words
- [ ] Middle school clues use 10-15 words
- [ ] High school clues are appropriately complex
- [ ] Distractor careers are relevant (similar to correct answer)
- [ ] No inappropriate language or content
- [ ] Clues are diverse (not repetitive)

---

## Cost Estimation

**Azure OpenAI Costs:**
- ~50 careers × 3 grades × 10 clues = 1,500 clues
- Each generation = ~500 tokens (prompt + response)
- Total tokens = 1,500 × 500 = 750,000 tokens
- Cost (GPT-4o): ~$0.005 per 1K tokens = **$3.75 total**

**One-time cost, provides years of gameplay content!**

---

## Maintenance

**When to regenerate:**
- Adding new careers to the system
- Updating language standards
- Poor clue performance (low accuracy rates)
- User feedback suggests clues are too hard/easy

**Frequency:** Once per quarter or as needed

---

## Support

**Questions?** Check:
1. `src/services/CareerBingoClueGenerator.ts` - Core generation logic
2. `src/services/ai-prompts/rules/UniversalContentRules.ts` - Language constraints
3. `docs/Career_Bingo_Implementation_Status.md` - Full implementation guide

