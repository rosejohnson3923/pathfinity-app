# Discovered Live! Navigation Redesign

## Current Issues
1. Discovered Live! isn't prominently featured on Student Dashboard
2. Career Challenge (Pathfinity's hallmark) is buried in the navigation
3. "Today's Progress Goals" is redundant and clutters the dashboard
4. The journey from Student Dashboard to Career Challenge rooms is too long

## Proposed Navigation Flow

### Option A: Direct Integration (Recommended)
This option provides the cleanest, most direct path to Career Challenge while maintaining game ratings.

```
Student Dashboard (Redesigned)
├── Education Section (Top)
│   ├── LEARN Container
│   ├── EXPERIENCE Container
│   └── DISCOVER Container
│
└── Discovered Live! Section (Bottom - More Prominent)
    ├── Featured Games Banner
    │   ├── Career Challenge [T] - "Lead Your Company Today!"
    │   └── Bingo Careers [E] - "Quick Fun with Careers!"
    │
    └── Quick Access Buttons
        ├── [Play Career Challenge] → Company Rooms Selection
        ├── [Play Bingo Careers] → Direct to Game
        └── [Browse All Games] → Arcade Main Page
```

### Option B: Intermediate Selection Page
This option adds a selection page but provides clearer game categorization.

```
Student Dashboard
└── Discovered Live! Button (Large, Prominent)
    └── Game Selection Page (New)
        ├── Header: "Choose Your Experience"
        ├── Game Cards with Ratings
        │   ├── Bingo Careers
        │   │   ├── Rating: E (Everyone)
        │   │   ├── Players: Quick 5-minute games
        │   │   └── [Play Now] → Direct to Game
        │   │
        │   └── Career Challenge: Executive Decision
        │       ├── Rating: T (Teen 13+)
        │       ├── Players: Strategic leadership simulation
        │       └── [Select Room] → Company Rooms Page
        │
        └── Coming Soon Section
            ├── Career Trivia
            └── Skill Showdown
```

## Detailed Screen Designs

### 1. Redesigned Student Dashboard

```typescript
interface StudentDashboardRedesign {
  // Top Section - Educational Journey
  educationSection: {
    title: "Your Learning Journey";
    containers: [
      {
        name: "LEARN";
        status: "unlocked" | "locked" | "completed";
        progress: number;
        highlight: boolean;
      },
      {
        name: "EXPERIENCE";
        status: "unlocked" | "locked" | "completed";
        progress: number;
        highlight: boolean;
      },
      {
        name: "DISCOVER";
        status: "unlocked" | "locked" | "completed";
        progress: number;
        highlight: boolean;
      }
    ];
  };

  // Bottom Section - Entertainment (Discovered Live!)
  discoveredLiveSection: {
    title: "Discovered Live! - Play & Compete";
    featuredGames: [
      {
        name: "Career Challenge";
        tagline: "Be the CEO - Make Critical Decisions";
        rating: "T";
        playerCount: number;
        isNew: boolean;
        isFeatured: true;
      },
      {
        name: "Bingo Careers";
        tagline: "Quick Fun Career Matching";
        rating: "E";
        playerCount: number;
      }
    ];
    quickStats: {
      totalXP: number;
      leaderboardRank: number;
      streakDays: number;
    };
  };
}
```

### 2. Company Rooms Selection Screen (Career Challenge)

```typescript
interface CompanyRoomsScreen {
  header: {
    title: "Career Challenge: Executive Decision";
    subtitle: "Choose Your Company";
    rating: "T (Teen 13+)";
  };

  roomCategories: {
    featured: CompanyRoom[]; // Top 3 most active rooms
    all: CompanyRoom[];      // All 10 rooms in grid
  };

  roomCard: {
    companyName: string;
    industry: string;
    description: string;
    currentPlayers: number;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    todaysScenarios: string[]; // Preview of scenarios
    leaderboardPreview: {
      topPlayer: string;
      topScore: number;
    };
    joinButton: {
      text: "Join Room";
      isEnabled: boolean;
    };
  };
}
```

### 3. Game Selection Page (If Option B)

```typescript
interface GameSelectionScreen {
  header: {
    title: "Discovered Live!";
    subtitle: "Choose Your Game";
  };

  gameCards: [
    {
      id: "bingo-careers";
      name: "Bingo Careers";
      rating: {
        code: "E";
        description: "Everyone - All Ages";
        color: "#4CAF50"; // Green
      };
      features: [
        "Quick 5-minute rounds",
        "Match careers to bingo cards",
        "Solo or multiplayer"
      ];
      stats: {
        playersOnline: number;
        avgGameTime: "5 min";
        xpPerGame: "50-100";
      };
      action: "Play Now";
    },
    {
      id: "career-challenge";
      name: "Career Challenge";
      subtitle: "Executive Decision Maker";
      rating: {
        code: "T";
        description: "Teen (13+)";
        color: "#FF9800"; // Orange
      };
      features: [
        "Lead as CEO",
        "Make critical decisions",
        "6 C's Leadership scoring",
        "10 Industry rooms"
      ];
      stats: {
        playersOnline: number;
        avgGameTime: "10-15 min";
        xpPerGame: "100-500";
      };
      action: "Choose Company";
    }
  ];

  comingSoon: {
    title: "Coming Soon";
    games: ["Career Trivia", "Skill Showdown", "Industry Explorer"];
  };
}
```

## Visual Design Principles

### 1. Student Dashboard Redesign
- **Split Layout**: 60/40 split between Education and Entertainment
- **Visual Hierarchy**: Discovered Live! gets equal visual weight as education containers
- **Color Coding**:
  - Education: Blue/Purple gradient (existing)
  - Discovered Live!: Orange/Gold gradient (exciting, game-like)
- **Remove**: "Today's Progress Goals" section entirely

### 2. Game Rating Display
- **Prominent Badges**: Display rating badges clearly on each game card
- **Color System**:
  - E (Everyone): Green badge
  - E10+: Light blue badge
  - T (Teen): Orange badge
- **Tooltip Information**: Hover shows full rating description

### 3. Career Challenge Prominence
- **Hero Card**: Career Challenge gets a larger, featured card
- **Live Stats**: Show current player count and active scenarios
- **Quick Entry**: One-click access to company rooms from dashboard

## Implementation Priority

1. **Phase 1**: Dashboard Redesign
   - Remove "Today's Progress Goals"
   - Create split layout for Education/Entertainment
   - Add Discovered Live! featured section

2. **Phase 2**: Navigation Flow
   - Implement direct Career Challenge access
   - Create company rooms selection screen
   - Add game rating badges

3. **Phase 3**: Enhanced Features
   - Add live player counts
   - Implement room previews
   - Add quick-join for favorite rooms

## Benefits of This Approach

1. **Reduced Clicks**: 2 clicks to Career Challenge (Dashboard → Rooms)
2. **Clear Hierarchy**: Career Challenge elevated as flagship game
3. **Age Appropriate**: Clear rating system visible upfront
4. **Balanced Focus**: Education and entertainment equally featured
5. **Scalable**: Easy to add new games in the future

## Metrics to Track

- Click-through rate from Dashboard to Career Challenge
- Time to game start
- Player retention in rooms
- Return player rate
- Average session length