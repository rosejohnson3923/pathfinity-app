# Career Challenge Multiplayer (CCM) - Live Multiplayer Design Document
**Game Name:** Career Challenge Multiplayer (Discovered Live: Career Bingo)
**Game Type:** Simultaneous Multiplayer Business Strategy Game
**Players:** 2-8 players per room
**Duration:** ~10-15 minutes per game
**Created:** October 18, 2025

---

## Executive Summary

Career Challenge Multiplayer is a **real-time simultaneous multiplayer game** where all players are CEOs and are competing to address real world business problems in a roundtable/boardroom table virtual environment.   Each player is the CEO of their own successful organization and has called a meeting with the company’s C-Suite members and has the ability to delegate the business problem to only one of the members or he can choose to retain ownership of the issue and solve it.  Players simultaneously respond to business challenges through their delegated C-Suite member who brings  their unique executive lens (C-Suite perspective) to the solution while assigning Role and Synergy cards to solve problems across the 6 P's of Business.

**Core Mechanic:** Simultaneous play where all players see the same challenge, make selections at the same time, and compete for the highest score through strategic card selection and timing bonuses.


---

## Game Overview

### The Premise
- **You are a CEO** competing against other CEOs in real-time
- **You have delegation authority** to delegate to a member of your C-Suite or choose to retain ownership of the challenge
- **Choose your Executive Lens** (C-Suite role) in Round 1 to frame your perspective
- **Face business challenges** across 5 randomly selected P categories
- **Select cards simultaneously** with other players (no turn-taking!)
- **Compete for highest score** through Role + Synergy combinations or special cards

### Educational Objectives
1. Understand how different executives (CEO, CFO, CMO, CTO, CHRO, COO) view business problems differently through their unique "lens"
2. Learn the strategic value of delegation vs. retaining ownership (CEO choice)
3. Practice using the 6 P's of Business framework (People, Product, Process, Place, Promotion, Price)
4. Learn strategic decision-making under time pressure
5. Develop soft skills through Role and Synergy card selection
6. Experience competitive business scenarios in a safe learning environment

---

## Visual Layout: The Boardroom Table

### Circular Table Design
```
                     [Player 3]
                     Name: "Alex"
                     CTO lens
					 Cards: [Role][Role][Role]
                     Status: 🟢 Locked In

    [Player 2]                              [Player 4]
    Name: "Sam"                             Name: "Jordan"
    CMO Lens**								CFO lens
	Cards: [....]                           Cards: [....]
    Status: 🟡 Thinking                     Status: 🟢 Locked In


[Player 1 (YOU)]        [CHALLENGE]         [Player 5]
Name: "Rosi"            📦 Product           Name: "Casey"
CMO Lens                Problem              COO lens
Cards: [....]			Timer: 35s           Status: 🟡 Thinking
Score: 340              

                     [Challenge Card]
                     Round 3 of 6


    [Player 8]                              [Player 6]
    Name: "Morgan"                          Name: "Taylor"
    CEO lens								CHRO lens
	Cards: [....]                           Cards: [....]
    Status: 🟢 Locked In                    Status: 🔴 Disconnected

                     [Player 7]
                     Name: "Riley"
                     CMO lens
					 Cards: [....]
                     Status: 🟡 Thinking
```

**Key Elements:**
- **Circular arrangement** - All players visible simultaneously around the table
- **Center position** - Challenge card and timer visible to all
- **Player cards** - Each player's hand visible in their position
- **Status indicators** - Real-time status (Thinking/Locked In/Disconnected)
- **Current player** - Your position highlighted

---

## Complete Game Flow

### Game Structure
- **1 game = 6 rounds total**
- **Round 1:** C-Suite Selection (20 seconds)
- **Rounds 2-6:** Challenge Rounds (45 seconds each)
- **Between rounds:** Brief intermission (5-10 seconds)
- **Total duration:** ~10-15 minutes

---

## Round 1: C-Suite Selection (Executive Lens)

### Phase Duration: 20 seconds

### What Happens
**ALL PLAYERS SIMULTANEOUSLY:**
1. See 6 C-Suite executive cards in the center
2. Each player select ONE executive that becomes their "lens" for the entire game
3. Lock in their choice before timer expires
4. Choices are PERMANENT for all remaining rounds

### C-Suite Options
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│     CEO      │  │     CFO      │  │     CMO      │
│      👔      │  │      💰      │  │      📢      │
│              │  │              │  │              │
│  Retain      │  │ Financial    │  │ Marketing    │
│ Ownership    │  │ Excellence   │  │ Innovation   │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│     CTO      │  │    CHRO      │  │     COO      │
│      💻      │  │      🤝      │  │      ⚙️      │
│              │  │              │  │              │
│ Technology   │  │   People     │  │ Operations   │
│ Expertise    │  │  Champion    │  │  Excellence  │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Executive Lens Effects
Your C-Suite choice affects:
- **Scoring multipliers** - Certain roles score higher for certain P categories
- **Card affinity** - Role cards aligned with your executive get bonus points
- **Visual emphasis** - UI highlights cards matching your lens

**Example:**
- **CMO lens** viewing a **Promotion (Marketing) challenge** = 1.5x multiplier (marketing expert!)
- **CFO lens** viewing a **Promotion challenge** = 1.0x multiplier (neutral)
- **COO lens** viewing a **Promotion challenge** = 1.0x multiplier (neutral)
- **CTO lens** viewing a **Promotion challenge** = 1.0x multiplier (neutral)

### Player Experience
- **Simultaneous selection** - All players choose at once
- **Timer countdown** - 20 seconds displayed prominently
- **Lock-in indicator** - See when other players have locked in (🟢 green checkmark)
- **Auto-lock** - If timer expires, random C-Suite is assigned

### C-Suite Lens Benefits Display

**After locking in C-Suite choice, players see WHY their lens matters:**

Each C-Suite lens provides different strategic perspectives and scoring advantages:

**CEO Lens - Retain Ownership:**
- **People:** "As CEO, you see this as a culture and leadership crisis affecting the entire organization." (1.2x multiplier)
- **Product:** "As CEO, you see this as a strategic positioning opportunity requiring executive oversight." (1.2x multiplier)
- **Process:** "As CEO, you see this as an operational efficiency challenge requiring organizational alignment." (1.2x multiplier)
- **Price:** "As CEO, you see this as a profitability decision with long-term strategic implications." (1.2x multiplier)

**CMO Lens - Delegate to Marketing:**
- **Promotion:** "As CMO, this is your core expertise—redefining how the brand connects with modern audiences." (1.5x multiplier)
- **Product:** "As CMO, you see this as a brand positioning and customer perception challenge." (1.2x multiplier)

**CTO Lens - Delegate to Technology:**
- **Product:** "As CTO, this is your core expertise—driving innovation and technical excellence." (1.5x multiplier)
- **Process:** "As CTO, you see this as an automation and systems optimization opportunity." (1.2x multiplier)

**CFO Lens - Delegate to Finance:**
- **Price:** "As CFO, this is your core expertise—optimizing pricing for maximum profitability." (1.5x multiplier)
- **Process:** "As CFO, you see this as a cost control and efficiency improvement challenge." (1.2x multiplier)

**CHRO Lens - Delegate to People:**
- **People:** "As CHRO, this is your core expertise—transforming culture and employee experience." (1.5x multiplier)
- **Process:** "As CHRO, you see this as a talent development and organizational design opportunity." (1.2x multiplier)

**COO Lens - Delegate to Operations:**
- **Process:** "As COO, this is your core expertise—optimizing operations for efficiency and scale." (1.5x multiplier)
- **Product:** "As COO, you see this as a delivery and quality assurance challenge." (1.2x multiplier)

**UI Display:** This lens explanation appears briefly (3-5 seconds) after all players lock in their selections during the "All Players Ready" transition phase before Round 2 begins.

### Round 1 Complete State
- All players have chosen C-Suite lens
- All players have seen their lens benefits explanation
- Leaderboard shows each player's chosen executive
- Player positions around table show executive icon
- System randomly selects 5 of 6 P categories for Rounds 2-6

---

## Rounds 2-6: Challenge Rounds

### Phase Duration: 45 seconds per round

### Random P Category Selection
**System randomly picks 5 of the 6 P's (one is excluded):**
- People
- Product
- Process
- Place
- Promotion
- Price

**Example game sequence:**
- Round 2: Product
- Round 3: People
- Round 4: Price
- Round 5: Promotion
- Round 6: Process
(Place was randomly excluded this game)

### Challenge Card Display

**CENTER OF TABLE (visible to all players):**
```
╔═══════════════════════════════════════════════╗
║  ROUND 3 OF 6                    Timer: 42s  ║
╠═══════════════════════════════════════════════╣
║                                               ║
║              👥 PEOPLE PROBLEM                ║
║                                               ║
║         Employee Retention Crisis             ║
║                                               ║
║  Your chain of organic coffee shops is        ║
║  experiencing declining foot traffic across   ║
║  all 50 locations. Employee morale is down,   ║
║  training programs are outdated, and customer ║
║  service scores have dropped 15% this quarter.║
║  The Board expects a turnaround plan by next  ║
║  month.                                       ║
║                                               ║
║  Difficulty: ⭐⭐⭐⭐ (Hard)                   ║
║  Grade Level: All                             ║
╚═══════════════════════════════════════════════╝
```

**Note:** All challenges are written from CEO perspective at enterprise scale (chains, divisions, corporations) requiring C-Suite level decision-making.

### Player's Card Selection Area (YOUR VIEW)

**Your available cards displayed in YOUR position around the table:**

```
┌─────────────────────────────────────────────────────────────┐
│ YOUR CARDS (CMO Lens Active 📢)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ROLE CARDS (Select 1):                                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│ │Marketing │ │HR Manager│ │Teacher   │                     │
│ │Manager   │ │          │ │          │                     │
│ │📊        │ │🤝        │ │📚        │                     │
│ │          │ │          │ │          │                     │
│ │Senior•Biz│ │Mid•HR    │ │Mid•Edu   │                     │
│ │⭐⭐⭐    │ │⭐⭐⭐⭐  │ │⭐⭐      │                     │
│ │Perfect   │ │Perfect   │ │Good      │                     │
│ │for CMO!  │ │for CHRO! │ │Match     │                     │
│ └──────────┘ └──────────┘ └──────────┘                     │
│                                                             │
│ SYNERGY CARDS (Select 1):                                   │
│ ┌──────────┐ ┌──────────┐                                  │
│ │Captain   │ │The       │                                  │
│ │Connector │ │Pathfinder│                                  │
│ │🤝        │ │🧠        │                                  │
│ │Teamwork  │ │Planning  │                                  │
│ │+20%      │ │+15%      │                                  │
│ └──────────┘ └──────────┘                                  │
│                                                             │
│ SPECIAL CARDS:                                              │
│ ┌──────────┐ ┌──────────┐                                  │
│ │GOLDEN    │ │MVP       │                                  │
│ │🏆        │ │⭐        │                                  │
│ │AI Comp.  │ │Saved Role│                                  │
│ │130pts    │ │+10 bonus │                                  │
│ │Available │ │Locked    │                                  │
│ └──────────┘ └──────────┘                                  │
│                                                             │
│ CURRENT SELECTION:                                          │
│ Role: [Marketing Manager] + Synergy: [Captain Connector]   │
│                                                             │
│            [LOCK IN SELECTION] Button                       │
└─────────────────────────────────────────────────────────────┘
```

### Simultaneous Gameplay

**CRITICAL:** All players see this interface **at the same time** and make selections **simultaneously**

**Real-time Status Indicators:**
```
Around the table, each player shows:

[Player 2 - Sam]        Status: 🟡 Selecting cards...
[Player 3 - Alex]       Status: 🟢 Locked In! (32s remaining)
[Player 4 - Jordan]     Status: 🟡 Selecting cards...
[Player 5 - Casey]      Status: 🟢 Locked In! (28s remaining)
[Player 6 - Taylor]     Status: 🔴 Disconnected
[Player 7 - Riley]      Status: 🟡 Selecting cards...
[Player 8 - Morgan]     Status: 🟢 Locked In! (35s remaining)
[YOU - Rosi]            Status: 🟡 Selecting cards...
```

### Selection Options

**Players can choose ONE of these strategies each round:**

**Option 1: Role + Synergy Combo**
- Select 1 Role card from hand (3 options)
- Select 1 Synergy card from hand (2-3 options)
- Score = Base points + Synergy bonus + Lens multiplier

**Option 2: Golden Card (AI Companion)**
- Use your one-time Golden Card
- Automatic 120 points (flat, no multipliers)
- Can only be used ONCE per game
- Available from Round 2 onwards

**Option 3: MVP Card (Saved Role)**
- Use a Role card saved from previous round
- Requires Synergy card to activate
- Bonus +10 points for reusing your best card

### Card Selection Mechanics

**Role Cards - Dynamic Filtering by Challenge Type:**
- **6 roles** displayed per round, filtered based on current P category challenge
- Filtering uses `quality_for_X` fields from database (where X = current P category)
- **Priority 1:** All "perfect" quality roles for current P category
- **Priority 2:** "good" quality roles to fill remaining slots (up to 6 total)
- **Excluded:** "not_in" quality roles never shown for that P category
- **Cross-C-Suite Selection:** Players see roles from ALL C-Suite orgs that match the challenge, not just their chosen lens
- Visual indicator shows quality rating (perfect ⭐⭐⭐⭐⭐ / good ⭐⭐⭐ / not_in ⭐)

**Example for PEOPLE Challenge:**
- Roles shown: HR Manager (CHRO - perfect), Team Manager (CEO - perfect), Psychologist (CHRO - perfect), Community Manager (CMO - good), Social Media Manager (CMO - good), Head Coach (CEO - perfect)
- Roles excluded: Software Engineer (CTO - not_in), Accountant (CFO - not_in), Broadcast Engineer (CTO - not_in)

**Example for PRODUCT Challenge:**
- Roles shown: Game Designer (CTO - perfect), Software Engineer (CTO - perfect), Product Manager (COO - perfect), Graphic Designer (CMO - good), Marketing Manager (CMO - good), Brand Manager (CMO - good)
- Roles excluded: HR Manager (CHRO - not_in), Accountant (CFO - not_in)

**Synergy Cards:**
- 2-5 universal soft skill cards
- Captain Connector (Teamwork +20%)
- The Pathfinder (Planning +15%)
- Master Improver (Innovation +20%)
- Mission Starter (Analysis +15%)
- Chief Vibe (Leadership +15%)

**Quality Ratings System:**
Each Role card has ratings for each P category:
- **perfect** = Ideal match, maximum points
- **good** = Decent match, standard points
- **not_in** = Poor match, reduced points

**Example:**
```
Marketing Manager (CMO role):
- quality_for_promotion: "perfect" (⭐⭐⭐⭐⭐)
- quality_for_people: "good" (⭐⭐⭐)
- quality_for_price: "not_in" (⭐)
```

### Lock-In Process

**When you click "Lock In Selection":**
1. Your selection is submitted to server
2. Your status changes to 🟢 "Locked In!"
3. Your lock-in time is recorded (for speed bonus)
4. You can see other players' status but NOT their selections
5. You wait for all players to lock in OR timer expires

### Round End Conditions

**Round ends when:**
- All active players have locked in, OR
- Timer reaches 0:00

**Then:**
- Brief reveal animation (3 seconds)
- Scores calculated and displayed
- Leaderboard updates
- 5-second intermission
- Next round begins

---

## Scoring System

### Base Scoring Formula

```
TOTAL SCORE = (Base Points + Synergy Bonus) × Lens Multiplier × Speed Bonus
```

### Base Points

**Role Card Selection:**
- **Perfect quality match:** 60 points
- **Good quality match:** 40 points
- **Not_in quality match:** 25 points

**Golden Card:**
- Flat 130 points (no multipliers applied, equals theoretical maximum)

**MVP Card:**
- Base role points + 10 bonus points

### Synergy Bonus

Synergy cards add percentage bonus to base points:
- Captain Connector: +20%
- The Pathfinder: +15%
- Master Improver: +20%
- Mission Starter: +15%
- Chief Vibe: +15%

**Example:**
- Role: 60 points (perfect match)
- Synergy: +20% (Captain Connector)
- After synergy: 60 + (60 × 0.20) = 72 points

### Lens Multiplier

Your C-Suite choice × Current P category:

| C-Suite | People | Product | Process | Place | Promotion | Price |
|---------|--------|---------|---------|-------|-----------|-------|
| CEO     | 1.2x   | 1.2x    | 1.2x    | 1.0x  | 1.0x      | 1.2x  |
| CFO     | 1.0x   | 1.0x    | 1.2x    | 1.2x  | 1.0x      | 1.5x  |
| CMO     | 1.0x   | 1.2x    | 1.0x    | 1.0x  | 1.5x      | 1.0x  |
| CTO     | 1.0x   | 1.5x    | 1.2x    | 1.2x  | 1.0x      | 1.0x  |
| CHRO    | 1.5x   | 1.0x    | 1.2x    | 1.0x  | 1.0x      | 1.0x  |
| COO     | 1.0x   | 1.2x    | 1.5x    | 1.2x  | 1.0x      | 1.0x  |

**Examples:**
- CMO lens + Promotion challenge = 1.5x multiplier → 72 points × 1.5 = 108 points
- COO lens + Process challenge = 1.5x multiplier → 72 points × 1.5 = 108 points
- CEO lens + People challenge = 1.2x multiplier → 72 points × 1.2 = 86 points

### Speed Bonus

**First to lock in:** +20% bonus
**Second to lock in:** +10% bonus
**Third to lock in:** +5% bonus
**Fourth+ to lock in:** No bonus

**Example final score:**
- 108 points × 1.20 (first to lock) = **130 points** (maximum possible)

### Golden Card Scoring

Golden Card bypasses the formula:
- **Always:** 130 points (equals maximum possible score)
- **No multipliers** (lens, synergy, speed)
- **Strategic use:** Guaranteed max score when your lens is weak OR you lack perfect quality cards

---

## XP Points Conversion System

### Game Points → XP Conversion

At the end of each CCM game, players' **total game points** are converted to **XP Points** for the Learn/Experience/Discover progression system.

**Conversion Formula:**
```
XP Points = Total Game Points ÷ 10
```

### XP Rewards by Performance

**Maximum Possible:**
```
Perfect Game: 650 points → 65 XP
  - 5 scoring rounds × 130 max per round = 650 points
  - Round 1 (C-Suite selection) = 0 points
```

**Typical XP Earnings:**
```
Performance Level       Total Points    XP Earned
─────────────────────────────────────────────────
Champion (1st place)     500-650    →   50-65 XP
Strong Performance       400-500    →   40-50 XP
Average Performance      300-400    →   30-40 XP
Struggling Player        200-300    →   20-30 XP
```

### Per-Round XP Contribution

```
Round Quality         Points/Round    XP/Round
───────────────────────────────────────────────
Perfect round            130      →    13 XP
Strong round             100      →    10 XP
Good round                86      →   8.6 XP
Average round             65      →   6.5 XP
Weak round                54      →   5.4 XP
```

### XP Award Timing

**When XP is awarded:**
1. At the end of Round 6 (game complete)
2. Displayed on Victory Screen
3. Shows both: "520 points → 52 XP earned!"
4. Added to player's total XP immediately

**All players earn XP** based on their individual performance (no placement bonuses currently).

### Integration with Pathfinity XP System

**CCM as XP Source:**
- 10-15 minute time investment
- Earns 20-65 XP per game
- Complements other XP sources (Learn modules, Journey completion, Discover activities)
- Encourages competitive multiplayer engagement
- Balanced to not overwhelm single-player XP sources

---

## Card Types & Content

### Challenge Cards (30 total)

**Structure:**
- 5 challenges per P category (5 × 6 = 30)
- Each with title, description, difficulty, grade level
- Randomly drawn based on selected P categories
- **All written from CEO perspective at enterprise scale**

**Challenge Writing Guidelines:**
- CEO perspective: "Your company needs...", "The Board expects...", "Your division must..."
- Enterprise scale: Chains, divisions, multiple locations (NOT local shops, single stores)
- Measurable metrics: "15% decline", "30% of orders", "40% year-over-year"
- Executive-level implications: Board expectations, strategic decisions, cross-functional impact

**Example Challenges by Category:**

**PEOPLE:**
```
"Employee Retention Crisis"
Your chain of organic coffee shops is experiencing declining foot traffic across
all 50 locations. Employee morale is down, training programs are outdated, and
customer service scores have dropped 15% this quarter. The Board expects a
turnaround plan by next month.
```

**PRODUCT:**
```
"Product Innovation Gap"
Your fitness equipment company is losing market share to competitors with smarter,
connected devices. Customer feedback indicates our product line feels outdated.
R&D needs direction on whether to innovate existing products or develop an entirely
new category.
```

**PROCESS:**
```
"Supply Chain Breakdown"
Your manufacturing division is struggling with supply chain delays affecting 30%
of customer orders. Quality control issues have increased product returns by 20%.
Operations needs to overhaul processes to restore efficiency and customer trust.
```

**PLACE:**
```
"Distribution Strategy Crisis"
Your retail distribution network is underperforming in digital channels while
physical store traffic declines. E-commerce competitors are capturing your
traditional customer base. The company needs a comprehensive omnichannel
distribution strategy.
```

**PROMOTION:**
```
"Brand Relevance Decline"
Your brand's marketing campaigns are failing to reach Gen Z and Millennial
audiences despite increased ad spend. Social media engagement is down 40%
year-over-year. Marketing needs a fresh strategy to rebuild brand relevance.
```

**PRICE:**
```
"Pricing Misalignment"
Your SaaS product pricing is misaligned with market expectations—enterprise
clients say it's too low (questions quality), while SMBs say it's too high
(lack of value perception). Finance needs a pricing restructure that serves
both segments profitably.
```

### Role Cards (60 total)

**Distribution:**
- 10 roles per C-Suite organization (6 organizations × 10 = 60 cards)
- CEO roles, CFO roles, CMO roles, CTO roles, CHRO roles, COO roles
- Each role has quality ratings for all 6 P's

**Example:**
```
Card: "Marketing Manager"
C-Suite Org: CMO
Display Name: "Marketing Manager"
Description: "Senior • Business"
Primary Skills: ["creativity", "strategic-thinking", "communication"]
Quality Ratings:
  - quality_for_people: "good"
  - quality_for_product: "good"
  - quality_for_process: "not_in"
  - quality_for_place: "not_in"
  - quality_for_promotion: "perfect"
  - quality_for_price: "good"
```

### Synergy Cards (5 total)

**Universal soft skill cards available to all:**
1. **Captain Connector** - Collaboration & Communication (+20%)
2. **The Pathfinder** - Critical Thinking & Planning (+15%)
3. **Master Improver** - Innovation & Creativity (+20%)
4. **Mission Starter** - Analytical Thinking & Research (+15%)
5. **Chief Vibe ** - Empathy & Leadership (+15%)

### Special Cards

**Golden Card (AI Companion):**
- 1 per player per game
- Flat 130 points (equals maximum possible score)
- Shows player's selected AI companion image
- Can be used Rounds 2-6
- Once used, becomes disabled ("USED" overlay)
- Strategic value: Guarantees max score when lens is weak

**MVP Card:**
- Unlocked at end of Round 1
- Player can save their selected Role card
- Can be reused in any future round
- Requires Synergy card pairing
- +10 bonus points when used

---

## Multiplayer Synchronization

### Real-time Events (Supabase Channels)

**Channel:** `ccm:room:{roomId}`

**Broadcast Events:**
1. **player_joined** - New player enters room
2. **player_left** - Player disconnects
3. **game_started** - Round 1 begins
4. **round_started** - New round begins (includes round number, P category)
5. **player_locked_in** - Player submitted selection
6. **round_ended** - All players locked in or timer expired
7. **scores_revealed** - Round scores calculated and shown
8. **leaderboard_updated** - Cumulative scores updated
9. **game_ended** - All 6 rounds complete
10. **c_suite_selected** - Player chose C-Suite in Round 1
11. **mvp_selected** - Player saved MVP card

### Presence Tracking

Each player's connection status tracked:
- Online (🟢 green)
- Selecting (🟡 yellow)
- Locked In (🟢 green checkmark)
- Disconnected (🔴 red)

### State Synchronization

**Server maintains:**
- Current round number
- Active P category
- Round timer
- All player selections (hidden until round ends)
- Lock-in timestamps (for speed bonus calculation)
- Cumulative scores

**Client receives:**
- Current game state on join
- Real-time updates via broadcast events
- Leaderboard updates after each round

---

## Database Schema (Existing Tables)

### Core Tables

**ccm_challenge_cards** (30 cards)
```sql
- card_code (unique identifier)
- p_category (people/product/process/place/promotion/price)
- title
- description
- context
- difficulty_level (easy/medium/hard)
- grade_level (middle/high/all)
- is_active
```

**ccm_role_cards** (60 cards - 10 per C-Suite)
```sql
- card_code
- display_name
- description
- c_suite_org (ceo/cfo/cmo/cto/chro/coo)
- quality_for_people (perfect/good/not_in)
- quality_for_product (perfect/good/not_in)
- quality_for_process (perfect/good/not_in)
- quality_for_place (perfect/good/not_in)
- quality_for_promotion (perfect/good/not_in)
- quality_for_price (perfect/good/not_in)
- primary_soft_skills (JSON array)
- secondary_soft_skills (JSON array)
- color_theme
- grade_level
- is_active
```

**ccm_synergy_cards** (5 cards)
```sql
- card_code
- display_name
- tagline
- description
- soft_skills_tags (JSON array)
- effectiveness_for_people (primary/secondary/neutral)
- effectiveness_for_product
- effectiveness_for_process
- effectiveness_for_place
- effectiveness_for_promotion
- effectiveness_for_price
- color_theme
- display_order
- is_active
```

**ccm_perpetual_rooms** (4 rooms)
```sql
- room_code (CCM_GLOBAL_01, etc.)
- room_name ("Global CEO Challenge", etc.)
- description
- status (active/intermission)
- max_players_per_game (6-8)
- intermission_duration_seconds (10-15)
- theme_color
- is_featured
- feature_order
- is_active
```

**ccm_game_sessions**
```sql
- id (UUID)
- perpetual_room_id
- session_number
- game_number
- status (waiting/active/complete)
- current_round (1-6)
- current_p_category (randomly selected)
- round_timer_started_at
- selected_p_categories (JSON array of 5 P's)
- created_at
- started_at
- completed_at
```

**ccm_session_participants**
```sql
- id (UUID)
- game_session_id
- user_id
- display_name
- c_suite_choice (ceo/cfo/cmo/cto/chro/coo)
- join_position (1-8)
- is_active
- joined_at
- left_at
```

**ccm_round_submissions**
```sql
- id (UUID)
- game_session_id
- participant_id
- round_number
- selected_role_card_id (or NULL if golden/mvp)
- selected_synergy_card_id
- special_card_type (NULL/'golden'/'mvp')
- locked_in_at (for speed bonus)
- base_score
- synergy_bonus
- lens_multiplier
- speed_bonus
- total_score
- created_at
```

**ccm_leaderboard**
```sql
- id (UUID)
- game_session_id
- participant_id
- total_score (sum across all rounds)
- rank
- rounds_played
- has_locked_in (current round status)
- updated_at
```

---

## UI Components Architecture

### Main Game Container
**CCMGameRoom.tsx**
- Manages overall game state
- Handles real-time synchronization
- Coordinates phase transitions

### Core Components

**1. GameBoard.tsx**
- Circular table layout
- Renders all player positions
- Shows center challenge card
- Displays timer

**2. PlayerPosition.tsx** (renders 8 times)
- Shows player name
- Displays C-Suite icon
- Shows card stacks
- Status indicator (thinking/locked/disconnected)

**3. ChallengeCard.tsx**
- Central challenge display
- P category icon
- Difficulty indicator
- Round number

**4. CardSelectionPanel.tsx** (your view only)
- Role cards (3 options)
- Synergy cards (2-5 options)
- Special cards (Golden, MVP)
- Lock in button

**5. RoleCard.tsx**
- Card visual design
- Quality indicator for current P
- Soft skills tags
- Grade level

**6. SynergyCard.tsx**
- Synergy name and tagline
- Bonus percentage
- Soft skills highlighted

**7. GoldenCard.tsx** (existing)
- AI companion image
- 120 point indicator
- Available/Used states

**8. MVPCard.tsx**
- Saved role card display
- +10 bonus indicator
- Locked/Available states

**9. RoundTimer.tsx**
- Countdown display
- Visual urgency indicators
- Auto-advance when expires

**10. Leaderboard.tsx**
- Player rankings
- Cumulative scores
- Round-by-round scores
- C-Suite icons

**11. ScoreReveal.tsx**
- Animated score calculation
- Breakdown (base + synergy + lens + speed)
- Leaderboard position change

**12. VictoryScreen.tsx**
- Final rankings
- MVP award (highest scorer)
- Play again / Leave room options

---

## Game Engine Logic

### CCMGameEngine.ts

**Responsibilities:**
1. Random P category selection (5 of 6)
2. Round timer management
3. Lock-in detection
4. Score calculation
5. Leaderboard ranking
6. Phase transitions

**Key Methods:**

```typescript
class CCMGameEngine {
  // Select 5 random P categories at game start
  selectRandomPCategories(): string[] {
    const categories = ['people', 'product', 'process', 'place', 'promotion', 'price'];
    return shuffleArray(categories).slice(0, 5);
  }

  // Start a new round
  async startRound(sessionId: string, roundNumber: number, pCategory: string) {
    // Broadcast round_started event
    // Start timer
    // Reset player lock-in statuses
  }

  // Handle player lock-in
  async handleLockIn(sessionId: string, participantId: string, selection: Selection) {
    // Record lock-in timestamp
    // Store selection
    // Calculate score
    // Broadcast player_locked_in event
    // Check if all players locked in
    // If yes, end round early
  }

  // Calculate round score
  calculateScore(
    roleCard: RoleCard,
    synergyCard: SynergyCard,
    cSuiteLens: string,
    pCategory: string,
    lockInPosition: number,
    specialCardType: string | null
  ): ScoreBreakdown {
    // If golden card, return 120
    if (specialCardType === 'golden') {
      return { total: 120, breakdown: { base: 120 } };
    }

    // Get base points from role quality
    const quality = roleCard[`quality_for_${pCategory}`];
    const basePoints = quality === 'perfect' ? 80 : quality === 'good' ? 60 : 30;

    // Add MVP bonus if applicable
    const mvpBonus = specialCardType === 'mvp' ? 10 : 0;

    // Apply synergy bonus
    const synergyPercent = getSynergyBonus(synergyCard);
    const afterSynergy = (basePoints + mvpBonus) * (1 + synergyPercent);

    // Apply lens multiplier
    const lensMultiplier = getLensMultiplier(cSuiteLens, pCategory);
    const afterLens = afterSynergy * lensMultiplier;

    // Apply speed bonus
    const speedBonus = getSpeedBonus(lockInPosition);
    const finalScore = afterLens * (1 + speedBonus);

    return {
      total: Math.round(finalScore),
      breakdown: {
        base: basePoints,
        mvpBonus,
        synergyBonus: synergyPercent,
        lensMultiplier,
        speedBonus,
      }
    };
  }

  // End round when all locked in or timer expires
  async endRound(sessionId: string) {
    // Calculate all scores
    // Update leaderboard
    // Broadcast scores_revealed event
    // Wait for intermission
    // Start next round or end game
  }
}
```

---

## Implementation Priorities

### Phase 1: Core Simultaneous Gameplay (Week 1)
**Goal:** Make the game truly simultaneous

1. **Remove turn-based logic**
   - Delete `currentPlayerTurn` state
   - Remove turn rotation logic
   - Enable all players to act simultaneously

2. **Implement circular table layout**
   - Create GameBoard component
   - Add PlayerPosition components (8 positions)
   - Position players in circle around center

3. **Add real-time status indicators**
   - Show "Thinking" / "Locked In" for all players
   - Display lock-in timestamps
   - Add disconnection detection

4. **Fix card selection flow**
   - All players see cards at same time
   - Lock-in submits to server
   - Wait for all players or timer

**Deliverable:** Multiplayer game where all players act simultaneously

---

### Phase 2: Scoring & P Category System (Week 2)
**Goal:** Implement proper scoring with lens multipliers

1. **Random P selection**
   - Generate 5 random P's at game start
   - Store in game session
   - Display current P each round

2. **Lens multiplier system**
   - Implement scoring matrix
   - Apply C-Suite × P category multipliers
   - Show visual feedback for optimal combinations

3. **Quality-based scoring**
   - Read role card quality ratings
   - Calculate base points (perfect/good/not_in)
   - Apply synergy bonuses correctly

4. **Speed bonus calculation**
   - Track lock-in order
   - Apply bonus percentages
   - Display in score breakdown

**Deliverable:** Complete scoring system with lens effects

---

### Phase 3: Visual Polish & UX (Week 3)
**Goal:** Professional boardroom aesthetic

1. **Circular table design**
   - Visual table graphic
   - Player position cards
   - Center challenge spotlight

2. **Animations**
   - Card selection highlighting
   - Lock-in animations
   - Score reveal effects
   - Leaderboard updates

3. **Status indicators**
   - Player avatars
   - C-Suite icons
   - Lock-in checkmarks
   - Timer urgency

4. **Mobile responsive**
   - Adapt table layout for smaller screens
   - Touch-friendly card selection
   - Readable on mobile

**Deliverable:** Polished, professional UI

---

## Testing Plan

### Unit Tests
- [ ] Score calculation (all combinations)
- [ ] Lens multiplier matrix
- [ ] Speed bonus logic
- [ ] Random P selection (no duplicates)

### Integration Tests
- [ ] Round flow (start → select → lock → reveal)
- [ ] Real-time synchronization
- [ ] Disconnect/reconnect handling
- [ ] Timer auto-advance

### Multiplayer Tests
- [ ] 2 player game
- [ ] 8 player game (max capacity)
- [ ] Simultaneous lock-ins
- [ ] Mixed lock-in speeds
- [ ] Player disconnection mid-game

### Content Validation
- [ ] All 30 challenges loadable
- [ ] All 60 role cards accessible (10 per C-Suite)
- [ ] Quality ratings correct for all 6 P's
- [ ] Synergy bonuses accurate for all 5 synergies
- [ ] Lens multiplier matrix working correctly

---

## Success Criteria

### Must Have (MVP)
- ✅ Simultaneous multiplayer (all players act at once)
- ✅ Circular table layout with all players visible
- ✅ 6-round structure (1 C-Suite + 5 random P's)
- ✅ Role + Synergy + Golden + MVP cards working
- ✅ Lens multiplier scoring
- ✅ Real-time status indicators
- ✅ Speed bonuses for fast lock-ins
- ✅ Leaderboard updates each round

### Should Have (Post-MVP)
- AI-powered opponent bots for solo practice
- Tutorial mode for new players
- Replay/review of past games
- Achievement system
- Season rankings

### Could Have (Future)
- Custom rooms with rule variations
- Tournament mode
- Team play (2v2, 3v3)
- Voice chat integration
- Mobile app

---

## Open Questions & Decisions Needed

1. **MVP Card mechanics:**
   - Can MVP be selected in Round 1 and used in Round 2?
   - Or only cards from Round 2+ can become MVP?

2. **Golden Card timing:**
   - Currently disabled Round 1, available Round 2+
   - Confirm this is correct design?

3. **Disconnection handling:**
   - Auto-assign random cards if player disconnects?
   - Or skip their score for that round?

4. **Timer behavior:**
   - Hard cutoff at 0:00?
   - Grace period (1-2 seconds)?

5. **C-Suite selection:**
   - Random assignment if player doesn't choose?
   - Or force choice before advancing?

---

## Conclusion

This design document captures the **true intended design** for Career Challenge Multiplayer based on:
- The circular gameboard layout (gameboard.pdf)
- Original design documents (CareerChallenge_GameDesignGuide.md)
- User corrections emphasizing CEO delegation narrative
- Database schema already created
- Real-time multiplayer architecture

**Key Distinction:** This is a **simultaneous multiplayer game** where all players compete in real-time around a virtual boardroom table, NOT a turn-based game.

**Core Educational Value:**
1. **Delegation Narrative** - Players are CEOs who must decide whether to retain ownership (CEO lens) or delegate to C-Suite members (CFO/CMO/CTO/CHRO/COO)
2. **Lens System** - Your C-Suite choice affects scoring, teaching that different executives view the same business problem differently
3. **6 P's Framework** - Understanding how People, Product, Process, Place, Promotion, and Price interconnect
4. **Strategic Timing** - Speed bonuses reward quick decision-making under pressure

**Content Summary:**
- 30 Challenge Cards (5 per P category)
- 60 Role Cards (10 per C-Suite organization)
- 5 Synergy Cards (Captain Connector, The Pathfinder, Master Improver, Mission Starter, Chief Vibe)
- 2 Special Cards per player (Golden Card, MVP Card)
- 6 C-Suite Options (CEO, CFO, CMO, CTO, CHRO, COO)
- 4 Perpetual Rooms

**Next Steps:** Implement Phase 1 (Simultaneous Gameplay) to transform the current turn-based prototype into the true real-time multiplayer experience.
