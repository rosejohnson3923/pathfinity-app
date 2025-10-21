# CCM Challenge Library Integration - Screen-by-Screen Analysis

## Executive Summary
This document provides a detailed analysis of every screen in the CCM multiplayer game flow and identifies exactly what needs to be updated to integrate the new 180-challenge library with executive pitches and lens multipliers.

---

## 🎮 Game Flow Overview

```
1. CCMHub (Company Lobby Selection)
   ↓
2. CCMGameRoom (Waiting Room)
   ↓
3. Round 1: C-Suite Lens Selection
   ↓
4. Round 2: Challenge Display & Answer Selection
   ↓
5. CCMIntermission (Scoreboard)
   ↓
6. CCMVictoryScreen (Final Results)
```

---

## 📊 Screen-by-Screen Integration Analysis

### **SCREEN 1: CCMHub - Company Lobby Browser**
**File:** `src/components/ccm/CCMHub.tsx`

#### Current State:
- Shows list of perpetual rooms (generic rooms)
- Uses room codes like `GLOBAL`, `SKILL`, `CASUAL`
- No company-specific branding

#### What Needs to Change:
✅ **Replace generic rooms with 30 companies**

#### Integration Tasks:

```typescript
// UPDATE: CCMHub.tsx - Line 28-41

interface CompanyLobby {
  id: string;
  code: string;              // e.g., 'QUICKSERVE', 'TRENDFWD'
  name: string;              // e.g., 'QuickServe Global'
  description: string;       // Company description
  gradeCategory: 'elementary' | 'middle' | 'high';
  industry: {
    id: string;
    name: string;
    code: string;
  };
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logoIcon: string;          // Emoji icon
  companySize: string;       // e.g., '50,000 employees'
  revenue: string;           // e.g., '$15B revenue'
  headquarters: string;      // e.g., 'Dallas, TX'
  knownFor: string;          // e.g., 'Fast food innovation'

  // Runtime data
  status: 'active' | 'intermission';
  currentPlayerCount: number;
  maxPlayersPerGame: number;
  currentGameNumber: number;
  nextGameStartsAt?: string;
}
```

#### Database Query Needed:

```typescript
// ADD: src/services/CCMService.ts

async getCompanyLobbies(gradeLevel?: string): Promise<CompanyLobby[]> {
  const { data, error } = await this.supabase
    .from('ccm_company_rooms')
    .select(`
      *,
      industry:cc_industries(id, code, name),
      current_sessions:ccm_game_sessions!left(
        id,
        status,
        current_player_count,
        next_game_starts_at
      )
    `)
    .eq('is_active', true)
    .order('grade_category')
    .order('name');

  if (error) throw error;

  return data.map(dbCompanyRoomToCompanyLobby);
}
```

#### Visual Changes:
1. **Company Cards** - Display company icon, colors, size info
2. **Grade Level Filters** - Elementary / Middle / High tabs
3. **Company Branding** - Use company color schemes
4. **Info Display** - Show company stats (size, revenue, HQ)

---

### **SCREEN 2: CCMGameRoom - Waiting Lobby**
**File:** `src/components/ccm/CCMGameRoom.tsx`

#### Current State:
- Generic waiting room
- Shows player list
- Basic room info

#### What Needs to Change:
✅ **Add company context and challenge preview**

#### Integration Tasks:

```typescript
// UPDATE: CCMGameRoom.tsx - Add company context

interface GameRoomState {
  companyRoom: {
    id: string;
    code: string;
    name: string;
    description: string;
    colorScheme: any;
    logoIcon: string;
    companySize: string;
  };

  challengePreview: {
    totalChallenges: number;  // Always 6
    pCategories: string[];     // All 6 P's
    difficultyRange: string;   // Based on grade level
  };

  players: Player[];
  gameStatus: 'waiting' | 'starting' | 'in_progress';
}
```

#### Database Query Needed:

```typescript
// ADD: src/services/CCMService.ts

async getCompanyRoomDetails(companyRoomId: string) {
  const { data, error } = await this.supabase
    .from('ccm_company_rooms')
    .select(`
      *,
      challenges:ccm_business_scenarios!left(
        id,
        p_category,
        difficulty_level
      )
    `)
    .eq('id', companyRoomId)
    .single();

  if (error) throw error;

  return {
    ...data,
    challengePreview: {
      totalChallenges: data.challenges.length,
      pCategories: [...new Set(data.challenges.map(c => c.p_category))],
      difficultyRange: data.grade_category
    }
  };
}
```

#### Visual Changes:
1. **Company Header** - Large logo, name, tagline
2. **Company Info Panel** - Size, industry, headquarters
3. **Challenge Preview** - "6 business challenges await"
4. **P-Category Icons** - Show all 6 P categories
5. **Difficulty Badge** - Elementary/Middle/High indicator

---

### **SCREEN 3: Round 1 - C-Suite Lens Selection**
**File:** `src/components/ccm/CCMGameRoom.tsx` (Phase: `c-suite-selection`)

#### Current State:
- Shows 6 C-Suite roles
- Generic descriptions
- No scenario-specific pitches

#### What Needs to Change:
✅ **Display executive pitches from first challenge**

#### Integration Tasks:

```typescript
// UPDATE: Round 1 Display

interface CSuiteLensWithPitches {
  role: 'ceo' | 'cfo' | 'cmo' | 'cto' | 'chro' | 'coo';
  name: string;
  icon: string;
  color: string;

  // NEW: From first challenge's executive_pitches
  pitch: string;  // Specific to the company/challenge
  emphasis: string[];
}
```

#### Database Query Needed:

```typescript
// ADD: Get first challenge for Round 1 pitches

async getFirstChallengePitches(companyRoomId: string) {
  const { data, error } = await this.supabase
    .from('ccm_business_scenarios')
    .select('executive_pitches, title, p_category')
    .eq('company_room_id', companyRoomId)
    .limit(1)
    .single();

  if (error) throw error;

  return {
    challenge: data,
    pitches: data.executive_pitches  // JSONB with all 6 pitches
  };
}
```

#### Visual Changes:
1. **Executive Cards** - Show company-specific pitches
2. **Context Header** - "As you join [CompanyName]..."
3. **Pitch Display** - Full executive pitch text
4. **Selection UI** - Highlight chosen lens with company colors

---

### **SCREEN 4: Round 2 - Challenge Display & Gameplay**
**File:** `src/components/ccm/GameBoard.tsx`, `src/components/ccm/ChallengeCard.tsx`

#### Current State:
- Shows generic challenge cards
- No executive perspectives
- No lens multipliers

#### What Needs to Change:
✅ **Display full challenge with selected lens perspective**
✅ **Show lens multiplier bonuses**
✅ **Display company-specific context**

#### Integration Tasks:

```typescript
// UPDATE: ChallengeCard.tsx

interface EnhancedChallenge {
  // Base challenge data
  id: string;
  title: string;
  description: string;
  context: string;
  pCategory: 'people' | 'product' | 'process' | 'place' | 'promotion' | 'price';
  difficultyLevel: 'easy' | 'medium' | 'hard';
  gradeCategory: 'elementary' | 'middle' | 'high';

  // NEW: Company context
  company: {
    name: string;
    icon: string;
    colorScheme: any;
  };

  // NEW: Executive pitches
  executivePitches: {
    ceo: string;
    cfo: string;
    cmo: string;
    cto: string;
    chro: string;
    coo: string;
  };

  // NEW: Lens multipliers
  lensMultipliers: {
    ceo: number;
    cfo: number;
    cmo: number;
    cto: number;
    chro: number;
    coo: number;
  };

  // Player's selected lens
  selectedLens?: 'ceo' | 'cfo' | 'cmo' | 'cto' | 'chro' | 'coo';

  // Calculated multiplier bonus
  myMultiplier?: number;  // e.g., 1.30 if CHRO on people challenge
}
```

#### Database Query Needed:

```typescript
// ADD: Get challenge for current round

async getChallengeForRound(
  companyRoomId: string,
  roundNumber: number
): Promise<EnhancedChallenge> {
  const { data: challenges, error } = await this.supabase
    .from('ccm_business_scenarios')
    .select(`
      *,
      company:ccm_company_rooms!inner(
        id,
        code,
        name,
        logo_icon,
        color_scheme
      )
    `)
    .eq('company_room_id', companyRoomId)
    .order('p_category');  // Consistent order

  if (error) throw error;

  // Return challenge for this round (0-indexed)
  const challenge = challenges[roundNumber - 1];

  return {
    ...challenge,
    company: challenge.company,
    executivePitches: challenge.executive_pitches,
    lensMultipliers: challenge.lens_multipliers
  };
}
```

#### Visual Changes:
1. **Challenge Card Header**
   - Company logo and colors
   - P-category badge
   - Difficulty indicator

2. **Challenge Description**
   - Main scenario text
   - Business context explanation
   - Company-specific details

3. **Executive Pitch Panel** (NEW!)
   - Show YOUR selected executive's pitch
   - Highlight their perspective
   - Use executive's color scheme

4. **Lens Multiplier Indicator** (NEW!)
   ```
   [Icon] Your CEO Lens
   ⭐ 1.25x Multiplier on this People challenge!
   ```

5. **Answer Options**
   - Multiple choice answers
   - Lens-specific hints
   - Point values with multiplier

---

### **SCREEN 5: CCMIntermission - Round Results**
**File:** `src/components/ccm/CCMIntermission.tsx`

#### Current State:
- Shows basic scores
- Generic feedback

#### What Needs to Change:
✅ **Show lens effectiveness**
✅ **Display challenge solution explanation**
✅ **Show multiplier breakdown**

#### Integration Tasks:

```typescript
// UPDATE: CCMIntermission.tsx

interface RoundResult {
  roundNumber: number;

  challenge: {
    title: string;
    pCategory: string;
    optimalLens?: string;  // Which lens had best multiplier
  };

  playerResults: {
    playerId: string;
    playerName: string;
    selectedLens: string;
    baseScore: number;
    multiplier: number;      // e.g., 1.30
    finalScore: number;      // baseScore * multiplier
    wasOptimal: boolean;     // Did they pick best lens?
    rank: number;
  }[];

  insights: {
    bestLens: string;
    bestMultiplier: number;
    averageScore: number;
    perfectAnswers: number;
  };
}
```

#### Visual Changes:
1. **Challenge Summary**
   - What was the challenge
   - What P-category it was

2. **Player Scoreboard** (Enhanced)
   ```
   Player Name | Lens | Base | × Multiplier | = Final | Rank
   Alice       | CHRO | 100  | × 1.30      | = 130  | 1st 🏆
   Bob         | CEO  | 100  | × 1.25      | = 125  | 2nd
   ```

3. **Lens Analysis** (NEW!)
   - "CHRO was optimal for this People challenge (+30% bonus)"
   - "CEO also strong (+25% bonus)"
   - Visual bar chart showing multipliers

4. **Next Round Preview**
   - "Next: A Product challenge"
   - "CTO and CMO lenses will be strong!"

---

### **SCREEN 6: CCMVictoryScreen - Final Results**
**File:** `src/components/ccm/CCMVictoryScreen.tsx`

#### Current State:
- Shows final rankings
- Basic stats

#### What Needs to Change:
✅ **Show lens performance across all rounds**
✅ **Display challenge variety completed**
✅ **Company-specific achievements**

#### Integration Tasks:

```typescript
// UPDATE: CCMVictoryScreen.tsx

interface GameSummary {
  company: {
    name: string;
    code: string;
    logoIcon: string;
  };

  finalRankings: {
    playerId: string;
    playerName: string;
    totalScore: number;
    rank: number;
    selectedLens: string;

    // Performance breakdown
    roundScores: number[];
    avgMultiplier: number;
    bestRound: number;
    worstRound: number;
  }[];

  challengesCompleted: {
    pCategory: string;
    title: string;
    yourScore: number;
    topScore: number;
  }[];

  lensPerformance: {
    lensUsed: string;
    timesUsed: number;
    avgMultiplier: number;
    totalBonus: number;
    wasOptimal: boolean;
  };

  companyMastery: {
    challengesCompleted: number;
    totalAvailable: number;        // 6
    pCategoriesCompleted: string[]; // All 6 P's
    percentComplete: number;        // 100%
  };
}
```

#### Visual Changes:
1. **Winner Podium**
   - With company branding
   - Final scores with multiplier totals

2. **Lens Strategy Analysis** (NEW!)
   ```
   Your CEO Lens Performance:
   - 6 rounds played
   - Average 1.15x multiplier
   - +90 bonus points
   - Optimal choice in 2/6 rounds
   ```

3. **Challenge Mastery** (NEW!)
   ```
   QuickServe Global - Complete! ✅
   ✓ People     130 pts
   ✓ Product    125 pts
   ✓ Process    135 pts
   ✓ Place      120 pts
   ✓ Promotion  128 pts
   ✓ Price      132 pts
   ```

4. **Career Insights**
   - "Strong in Operations (COO lens)"
   - "Consider Finance careers (high CFO performance)"

---

## 🗄️ Database Schema Updates Needed

### **NO SCHEMA CHANGES REQUIRED!**
✅ All tables already exist:
- `ccm_company_rooms` ✅
- `ccm_business_scenarios` ✅
- `cc_industries` ✅

### **NEW: Game Session Tables** (if not exist)

```sql
-- Store which lens each player selected
CREATE TABLE IF NOT EXISTS ccm_player_lens_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES ccm_game_sessions(id),
  player_id UUID REFERENCES users(id),
  round_number INTEGER,
  selected_lens TEXT,  -- 'ceo', 'cfo', 'cmo', 'cto', 'chro', 'coo'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store round scores with multipliers
CREATE TABLE IF NOT EXISTS ccm_round_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES ccm_game_sessions(id),
  player_id UUID REFERENCES users(id),
  round_number INTEGER,
  challenge_id UUID REFERENCES ccm_business_scenarios(id),

  selected_lens TEXT,
  base_score INTEGER,
  lens_multiplier DECIMAL(3,2),  -- e.g., 1.30
  final_score INTEGER,           -- base_score * lens_multiplier

  was_optimal_lens BOOLEAN,      -- Did they pick best lens for this P?
  rank_in_round INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📝 Type Definition Updates

### **File:** `src/types/CareerChallengeTypes.ts`

```typescript
// UPDATE: BusinessScenario interface (line 925-941)

export interface BusinessScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  businessDriver: 'people' | 'product' | 'process' | 'place' | 'promotion' | 'price';
  pCategory: 'people' | 'product' | 'process' | 'place' | 'promotion' | 'price';
  difficultyLevel: 'easy' | 'medium' | 'hard';
  gradeCategory: 'elementary' | 'middle' | 'high';
  basePoints: number;

  companyRoomId: string;
  company?: CompanyRoom;  // Joined data

  // NEW FIELDS:
  executivePitches: {
    ceo: string;
    cfo: string;
    cmo: string;
    cto: string;
    chro: string;
    coo: string;
  };

  lensMultipliers: {
    ceo: number;
    cfo: number;
    cmo: number;
    cto: number;
    chro: number;
    coo: number;
  };

  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔧 Service Layer Updates

### **File:** `src/services/CCMService.ts`

```typescript
export class CCMService {

  // EXISTING METHODS - UPDATE THESE

  async getFeaturedRooms(gradeLevel?: string) {
    // REPLACE: Generic rooms
    // WITH: Actual company rooms from database
    return this.getCompanyLobbies(gradeLevel);
  }

  async joinRoom(roomId: string, playerId: string, playerName: string) {
    // UPDATE: Reference company_room_id instead of generic room
    // Rest of logic stays the same
  }

  // NEW METHODS - ADD THESE

  async getCompanyLobbies(gradeLevel?: string): Promise<CompanyLobby[]> {
    // Implementation above
  }

  async getCompanyRoomDetails(companyRoomId: string) {
    // Implementation above
  }

  async getFirstChallengePitches(companyRoomId: string) {
    // Implementation above
  }

  async getChallengeForRound(
    companyRoomId: string,
    roundNumber: number
  ): Promise<EnhancedChallenge> {
    // Implementation above
  }

  async calculateRoundScore(
    baseScore: number,
    selectedLens: string,
    challengePCategory: string,
    lensMultipliers: Record<string, number>
  ) {
    const multiplier = lensMultipliers[selectedLens] || 1.0;
    const finalScore = Math.round(baseScore * multiplier);

    // Find optimal lens
    const optimalLens = Object.entries(lensMultipliers)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    return {
      baseScore,
      multiplier,
      finalScore,
      wasOptimal: selectedLens === optimalLens,
      optimalLens,
      bonus: finalScore - baseScore
    };
  }
}
```

---

## 🎯 Implementation Priority

### **Phase 1: Core Data Integration** (Week 1)
1. ✅ Update CCMHub to display company lobbies
2. ✅ Update CCMGameRoom with company context
3. ✅ Create database queries for companies and challenges

### **Phase 2: Round 1 Enhancement** (Week 2)
4. ✅ Add executive pitches to C-Suite selection
5. ✅ Update lens selection UI with company context

### **Phase 3: Round 2 Enhancement** (Week 3)
6. ✅ Display challenges with full context
7. ✅ Show selected lens perspective
8. ✅ Add lens multiplier indicators

### **Phase 4: Scoring & Results** (Week 4)
9. ✅ Implement multiplier calculations
10. ✅ Update intermission screen with lens analysis
11. ✅ Enhance victory screen with full breakdown

### **Phase 5: Polish & Testing** (Week 5)
12. ✅ Grade-level filtering
13. ✅ Visual refinements with company branding
14. ✅ Comprehensive testing across all 30 companies

---

## 📊 Data Flow Summary

```
Player selects company
  ↓
Load company + 6 challenges
  ↓
Round 1: Show first challenge's executive pitches
  ↓
Player selects C-Suite lens
  ↓
Round 2-7: For each challenge:
  ├─ Load challenge details
  ├─ Show player's lens perspective
  ├─ Calculate score with lens multiplier
  └─ Store results
  ↓
Final results:
  ├─ Total scores across all rounds
  ├─ Lens performance analysis
  └─ Company challenge mastery
```

---

## ✅ Validation Checklist

Before deployment, verify:

- [ ] All 30 companies display in hub
- [ ] Each company shows 6 challenges
- [ ] All executive pitches display correctly
- [ ] Lens multipliers calculate properly
- [ ] Scores persist across rounds
- [ ] Grade-level filtering works
- [ ] Company branding displays correctly
- [ ] Mobile responsiveness maintained
- [ ] Real-time sync works for multiplayer
- [ ] Victory screen shows complete breakdown

---

## 📚 Reference Files

- Database Seed: `database/seed/ccm_*_challenges.sql`
- Types: `src/types/CareerChallengeTypes.ts`
- Service: `src/services/CCMService.ts`
- Components: `src/components/ccm/*.tsx`
- Migration: `database/migrations/ccm_company_scenarios_tables.sql`

---

**Last Updated:** {{ current_date }}
**Challenge Library Version:** 1.0 (180 challenges complete)
