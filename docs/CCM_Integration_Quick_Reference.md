# CCM Challenge Integration - Quick Reference Guide

## 🎯 **What Changed vs. What Stays the Same**

### ✅ **What STAYS THE SAME**
- Game flow: 6 rounds, multiplayer mechanics
- Player interactions: Real-time sync, lobby system
- Scoring system: Base points + bonuses
- UI/UX: Design system, animations, layout
- Technical stack: React, Supabase, TypeScript

### 🔄 **What CHANGES**
| Screen | Before | After |
|--------|--------|-------|
| **CCMHub** | Generic rooms (GLOBAL, SKILL) | 30 Company lobbies (QUICKSERVE, TRENDFWD, etc.) |
| **Waiting Room** | Basic info | Company branding + challenge preview |
| **Round 1** | Generic C-Suite descriptions | Company-specific executive pitches |
| **Round 2-7** | Generic challenges | Real business scenarios with context |
| **Scoring** | Flat points | Base points × lens multipliers |
| **Results** | Basic rankings | Lens performance analysis |

---

## 📋 **Component Update Checklist**

### **1. CCMHub.tsx** ⭐ PRIORITY 1
```typescript
// BEFORE:
getFeaturedRooms() → Returns generic rooms

// AFTER:
getCompanyLobbies(gradeLevel) → Returns 30 companies from database
  - Query: ccm_company_rooms
  - Filter: by grade_category
  - Display: Company icon, name, industry, stats
```

**Visual Changes:**
- Company logo icons (🍔, 👕, ✈️, etc.)
- Grade level tabs (Elementary | Middle | High)
- Company color schemes
- Industry badges

---

### **2. CCMGameRoom.tsx** ⭐ PRIORITY 2
```typescript
// ADD: Company context display
const companyDetails = await getCompanyRoomDetails(companyRoomId);

// SHOW:
- Company name + logo
- "6 business challenges across all P categories"
- Difficulty level indicator
- Industry information
```

**Visual Changes:**
- Large company header
- Info panel with company stats
- Challenge preview icons

---

### **3. C-Suite Selection** ⭐ PRIORITY 3
```typescript
// BEFORE:
executiveCards = STATIC_C_SUITE_INFO

// AFTER:
const pitches = await getFirstChallengePitches(companyRoomId);
executiveCards = pitches.map(role => ({
  ...role,
  pitch: pitches[role.id],  // Company-specific pitch
  emphasis: extractEmphasis(pitches[role.id])
}));
```

**Visual Changes:**
- Executive pitch text (2-3 sentences per role)
- Company context: "As you join QuickServe Global..."
- Emphasis highlights
- Role-specific colors

---

### **4. Challenge Display** ⭐ PRIORITY 4
```typescript
// GET: Challenge for current round
const challenge = await getChallengeForRound(companyRoomId, roundNumber);

// DISPLAY:
{
  title: challenge.title,
  description: challenge.description,
  context: challenge.context,
  pCategory: challenge.p_category,

  // NEW:
  selectedLensPitch: challenge.executivePitches[playerLens],
  multiplierBonus: challenge.lensMultipliers[playerLens],
  company: challenge.company
}
```

**Visual Changes:**
- Challenge card with company colors
- Executive pitch panel showing YOUR lens perspective
- Multiplier indicator: "⭐ 1.30x bonus!"
- P-category badge

---

### **5. Round Results** ⭐ PRIORITY 5
```typescript
// CALCULATE: Scores with multipliers
const results = players.map(player => {
  const multiplier = challenge.lensMultipliers[player.selectedLens];
  const finalScore = player.baseScore * multiplier;

  return {
    ...player,
    baseScore: player.baseScore,
    multiplier,
    finalScore,
    wasOptimal: multiplier === maxMultiplier
  };
});
```

**Visual Changes:**
- Score breakdown table with multiplier column
- Optimal lens indicator
- Visual multiplier bars
- Next round preview

---

### **6. Victory Screen** ⭐ PRIORITY 6
```typescript
// SHOW: Complete game analysis
{
  finalRankings: [...],
  lensPerformance: {
    avgMultiplier: 1.18,
    totalBonus: +108 pts,
    optimalChoices: 3/6 rounds
  },
  challengeMastery: {
    company: "QuickServe Global",
    pCategoriesCompleted: ['people', 'product', ...], // All 6
    percentComplete: 100%
  }
}
```

**Visual Changes:**
- Lens strategy analysis card
- Challenge mastery checklist
- Performance insights

---

## 🗄️ **Database Queries Reference**

### **Query 1: Get Company Lobbies**
```sql
SELECT
  cr.*,
  i.name as industry_name,
  i.code as industry_code,
  COUNT(DISTINCT bs.id) as challenge_count
FROM ccm_company_rooms cr
LEFT JOIN cc_industries i ON cr.industry_id = i.id
LEFT JOIN ccm_business_scenarios bs ON cr.id = bs.company_room_id
WHERE cr.is_active = true
  AND (cr.grade_category = $1 OR $1 IS NULL)
GROUP BY cr.id, i.id
ORDER BY cr.grade_category, cr.name;
```

### **Query 2: Get Company Details**
```sql
SELECT
  cr.*,
  json_agg(
    json_build_object(
      'id', bs.id,
      'pCategory', bs.p_category,
      'difficulty', bs.difficulty_level
    )
  ) as challenges
FROM ccm_company_rooms cr
LEFT JOIN ccm_business_scenarios bs ON cr.id = bs.company_room_id
WHERE cr.id = $1
GROUP BY cr.id;
```

### **Query 3: Get Challenge with Pitches**
```sql
SELECT
  bs.*,
  cr.code as company_code,
  cr.name as company_name,
  cr.logo_icon,
  cr.color_scheme
FROM ccm_business_scenarios bs
JOIN ccm_company_rooms cr ON bs.company_room_id = cr.id
WHERE bs.company_room_id = $1
ORDER BY bs.p_category
LIMIT 1 OFFSET $2;  -- roundNumber - 1
```

---

## 🎨 **UI Component Updates**

### **Company Card Component**
```tsx
<CompanyCard
  icon={company.logoIcon}          // 🍔
  name={company.name}              // "QuickServe Global"
  industry={company.industry.name} // "Food Service"
  size={company.companySize}       // "50,000 employees"
  colorScheme={company.colorScheme}
  gradeLevel={company.gradeCategory}
  challengeCount={6}
  status={company.status}
  onJoin={() => joinCompany(company.id)}
/>
```

### **Executive Pitch Card**
```tsx
<ExecutivePitchCard
  role="ceo"
  icon="👔"
  color="#8B5CF6"
  pitch={challenge.executivePitches.ceo}
  isSelected={playerLens === 'ceo'}
  multiplier={challenge.lensMultipliers.ceo}  // 1.25
  onSelect={() => selectLens('ceo')}
/>
```

### **Enhanced Challenge Card**
```tsx
<ChallengeCard
  title={challenge.title}
  description={challenge.description}
  context={challenge.context}
  pCategory={challenge.pCategory}
  difficultyLevel={challenge.difficultyLevel}

  company={{
    name: challenge.company.name,
    icon: challenge.company.logoIcon,
    colors: challenge.company.colorScheme
  }}

  selectedLens={{
    role: playerLens,
    pitch: challenge.executivePitches[playerLens],
    multiplier: challenge.lensMultipliers[playerLens]
  }}
/>
```

### **Score Breakdown Component**
```tsx
<ScoreBreakdown
  players={[
    {
      name: "Alice",
      lens: "CHRO",
      baseScore: 100,
      multiplier: 1.30,
      finalScore: 130,
      isOptimal: true
    },
    // ...
  ]}
  optimalLens="CHRO"
  averageMultiplier={1.15}
/>
```

---

## 🧪 **Testing Checklist**

### **Data Integration Tests**
- [ ] Company lobbies load correctly (30 companies)
- [ ] Each company has exactly 6 challenges
- [ ] All executive pitches display
- [ ] All lens multipliers calculate correctly
- [ ] Grade-level filtering works

### **Gameplay Tests**
- [ ] Can select company lobby
- [ ] Can select C-Suite lens
- [ ] Challenges display with correct context
- [ ] Scores calculate with multipliers
- [ ] Results show complete breakdown

### **Edge Cases**
- [ ] Missing executive pitch (fallback)
- [ ] Invalid lens selection (error handling)
- [ ] Network errors during challenge load
- [ ] Multiplayer sync with new data
- [ ] Mobile responsive layout

---

## 📊 **Data Flow Diagram**

```
┌─────────────────┐
│  Player Opens   │
│   CCM Hub       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Load 30 Companies from Database │
│ - ccm_company_rooms             │
│ - Filter by grade_category      │
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────┐
│ Player Selects   │
│ Company Lobby    │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────┐
│ Load Company + 6 Challenges    │
│ - Company details              │
│ - All challenges for company   │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Round 1: C-Suite Selection │
│ - Show first challenge's   │
│   executive pitches        │
└────────┬───────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Rounds 2-7: Each Challenge  │
│ ┌─────────────────────────┐ │
│ │ 1. Load challenge       │ │
│ │ 2. Show lens pitch      │ │
│ │ 3. Display options      │ │
│ │ 4. Calculate score      │ │
│ │    baseScore × mult     │ │
│ └─────────────────────────┘ │
└────────┬────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Victory Screen         │
│ - Final rankings       │
│ - Lens performance     │
│ - Challenge mastery    │
└────────────────────────┘
```

---

## 🚀 **Quick Start Guide**

### **Step 1: Update CCMService**
```bash
# File: src/services/CCMService.ts
# Add new methods from integration doc
```

### **Step 2: Update Types**
```bash
# File: src/types/CareerChallengeTypes.ts
# Add executivePitches and lensMultipliers to BusinessScenario
```

### **Step 3: Update CCMHub**
```bash
# File: src/components/ccm/CCMHub.tsx
# Replace getFeaturedRooms with getCompanyLobbies
```

### **Step 4: Update Challenge Display**
```bash
# File: src/components/ccm/ChallengeCard.tsx
# Add executive pitch panel and multiplier indicator
```

### **Step 5: Update Scoring**
```bash
# File: src/services/CCMGameEngine.ts
# Implement multiplier calculations
```

### **Step 6: Test End-to-End**
```bash
# Test complete game flow with real data
# Verify all 30 companies work
# Check all 180 challenges display correctly
```

---

## 📞 **Need Help?**

**Reference Documents:**
- Full Analysis: `docs/CCM_Challenge_Integration_Analysis.md`
- Database Schema: `database/migrations/ccm_*.sql`
- Challenge Seeds: `database/seed/ccm_*_challenges.sql`

**Key Concepts:**
- **Executive Pitches**: Each of 6 C-Suite roles explains why they're best for the challenge
- **Lens Multipliers**: Bonus scoring based on role-challenge alignment (1.0x to 1.30x)
- **P Categories**: 6 types of business challenges (people, product, process, place, promotion, price)
- **Grade Categories**: 3 difficulty levels (elementary, middle, high)

---

**Last Updated:** {{ current_date }}
**Status:** ✅ Ready for Implementation
