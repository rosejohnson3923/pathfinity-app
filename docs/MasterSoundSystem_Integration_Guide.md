# Master Sound System - Integration Guide

## Overview

The **MasterSoundSystem** is a centralized sound orchestration service following the same singleton pattern as `aiPlayerPoolService` and `leaderboardService`. It provides plug-and-play sound integration for all Discovered Live! games with minimal code changes.

## Architecture

```
┌─────────────────────────────────────────────┐
│         Game Components                      │
│  (Career Bingo, CEO Takeover, etc.)         │
└──────────────────┬──────────────────────────┘
                   │
                   │ 2-3 method calls
                   ↓
┌─────────────────────────────────────────────┐
│       MasterSoundSystem (singleton)         │
│   - startGameSession()                       │
│   - playCorrectAnswer()                      │
│   - endGameSession()                         │
└──────────────────┬──────────────────────────┘
                   │
                   │ Orchestrates
                   ↓
┌─────────────────────────────────────────────┐
│      SoundEffectsService (singleton)        │
│   - Manages audio playback                   │
│   - Volume controls                          │
│   - Fade effects                             │
└─────────────────────────────────────────────┘
```

## Quick Start - Integration in 3 Steps

### Step 1: Import the service

```typescript
import { masterSoundSystem } from '../../services/MasterSoundSystem';
```

### Step 2: Start sound when game begins

```typescript
useEffect(() => {
  // Start background music and sound effects when game room loads
  masterSoundSystem.startGameSession('career-bingo');

  return () => {
    // Stop background music when leaving game
    masterSoundSystem.endGameSession();
  };
}, []);
```

### Step 3: Play sounds during gameplay

```typescript
// When player answers correctly
const handleCorrectAnswer = () => {
  masterSoundSystem.playCorrectAnswer();
  // ... rest of your logic
};

// When player answers incorrectly
const handleIncorrectAnswer = () => {
  masterSoundSystem.playIncorrectAnswer();
  // ... rest of your logic
};

// When player achieves bingo (Career Bingo specific)
const handleBingo = () => {
  masterSoundSystem.playBingoCelebration();
  // ... rest of your logic
};
```

That's it! The system handles all music fading, volume management, and playback.

---

## Complete Integration Examples

### Career Bingo (MultiplayerGameRoom.tsx)

```typescript
import { masterSoundSystem } from '../../services/MasterSoundSystem';

export const MultiplayerGameRoom: React.FC<Props> = ({ ... }) => {

  // Start sound system when component mounts
  useEffect(() => {
    initializeGame();

    // Start background music and game sounds
    masterSoundSystem.startGameSession('career-bingo');

    return () => {
      // Cleanup
      discoveredLiveRealtimeService.unsubscribeFromRoom(roomId);
      companyRoomService.unsubscribeFromRoom(roomId);

      // Stop background music with fade out
      masterSoundSystem.endGameSession();
    };
  }, []);

  // Play sounds during gameplay
  const handleSquareClick = async (row: number, col: number) => {
    // ... validation logic

    const result = await gameOrchestrator.processClick(...);

    if (result.isCorrect) {
      masterSoundSystem.playCorrectAnswer(); // ✅ Sound effect
      // ... show XP notification
    } else {
      masterSoundSystem.playIncorrectAnswer(); // ❌ Sound effect
      // ... show error feedback
    }
  };

  const handleBingoClaimed = (event: any) => {
    // ... update player stats

    if (payload.participantId === myParticipantId) {
      masterSoundSystem.playBingoCelebration(); // 🎉 Celebration sound
      setShowBingoAnimation(true);
      confetti({ ... });
    }
  };

  const handleGameEnded = (event: any) => {
    // ... prepare summary

    masterSoundSystem.playGameComplete(); // 🏁 Game complete sound
    confetti({ ... });

    setTimeout(() => {
      onComplete(summaryData);
    }, 3000);
  };
};
```

### CEO Takeover / Decision Desk (ExecutiveDecisionIntegration.tsx)

```typescript
import { masterSoundSystem } from '../../services/MasterSoundSystem';

export const ExecutiveDecisionIntegration: React.FC<Props> = ({ ... }) => {

  // Start sound when entering game
  useEffect(() => {
    masterSoundSystem.startGameSession('decision-desk');

    return () => {
      masterSoundSystem.endGameSession();
    };
  }, []);

  // Play sounds during decision-making
  const handleDecisionSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      masterSoundSystem.playCorrectAnswer();
    } else {
      masterSoundSystem.playIncorrectAnswer();
    }
  };

  const handleRoundComplete = () => {
    masterSoundSystem.playGameComplete();
  };
};
```

### Career Challenge Hub (CareerChallengeHub.tsx)

```typescript
import { masterSoundSystem } from '../../services/MasterSoundSystem';

export const CareerChallengeHub: React.FC = () => {

  // Start sound when challenge begins
  const handleStartChallenge = (challengeType: string) => {
    masterSoundSystem.startGameSession('career-challenge');
    // ... start challenge logic
  };

  // Stop sound when challenge ends
  const handleEndChallenge = () => {
    masterSoundSystem.endGameSession();
    // ... end challenge logic
  };

  // Play feedback sounds
  const handleAnswerFeedback = (isCorrect: boolean) => {
    if (isCorrect) {
      masterSoundSystem.playCorrectAnswer();
    } else {
      masterSoundSystem.playIncorrectAnswer();
    }
  };
};
```

---

## Available Methods

### Game Lifecycle

| Method | Description | When to Use |
|--------|-------------|-------------|
| `startGameSession(gameType)` | Start background music and enable SFX | When player enters game room |
| `endGameSession()` | Stop background music with fade out | When player leaves game or game ends |
| `pauseBackgroundMusic()` | Pause music temporarily | During cutscenes or modals |
| `resumeBackgroundMusic()` | Resume paused music | After cutscene/modal closes |

### Gameplay Sounds

| Method | Description | When to Use |
|--------|-------------|-------------|
| `playCorrectAnswer()` | Play success sound | When player answers correctly |
| `playIncorrectAnswer()` | Play error sound | When player answers incorrectly |
| `playBingoCelebration()` | Play bingo celebration | When player achieves bingo (Career Bingo) |
| `playGameComplete()` | Play game end sound | When game completes |
| `playQuestionStart()` | Play new question sound | When new question appears |
| `playCountdown()` | Play 3-2-1 countdown | Before game/round starts |

### Timer Sounds

| Method | Description | When to Use |
|--------|-------------|-------------|
| `playTimerTick()` | Play tick sound | Every second (optional) |
| `playTimerWarning()` | Play warning sound | When timer < 5 seconds |
| `playTimerUrgent()` | Play urgent sound | When timer < 3 seconds |

### UI Sounds

| Method | Description | When to Use |
|--------|-------------|-------------|
| `playJoinRoom()` | Play join sound | When player joins room |
| `playLeaveRoom()` | Play leave sound | When player leaves room |
| `playClick()` | Play click sound | On button clicks (optional) |
| `playSpectatorMode()` | Play spectator sound | When entering spectator mode |

### Volume Controls

| Method | Description |
|--------|-------------|
| `setMasterVolume(0-1)` | Set overall volume |
| `setMusicVolume(0-1)` | Set background music volume |
| `setSFXVolume(0-1)` | Set sound effects volume |
| `mute()` | Mute all sounds |
| `unmute()` | Unmute all sounds |

---

## Configuration Options

### Custom Session Configuration

```typescript
masterSoundSystem.startGameSession('career-bingo', {
  enableBackgroundMusic: true,    // Enable/disable music
  enableSFX: true,                 // Enable/disable sound effects
  fadeInDuration: 2000,            // Music fade in (ms)
  fadeOutDuration: 1000,           // Music fade out (ms)
});
```

### Disable Music, Keep SFX

```typescript
masterSoundSystem.startGameSession('career-bingo', {
  enableBackgroundMusic: false,  // No music
  enableSFX: true,               // Keep sound effects
});
```

---

## Benefits

✅ **Centralized**: All sound logic in one place
✅ **Plug-and-play**: 2-3 method calls per game
✅ **Consistent**: Same sound behavior across all games
✅ **Maintainable**: Update sound system without touching game code
✅ **Singleton pattern**: Follows project conventions (like aiPlayerPoolService)
✅ **Automatic cleanup**: Background music stops when game ends
✅ **User preferences**: Volume and mute settings persist across sessions

---

## Troubleshooting

### No sound playing?

1. **Check sound files exist**: Sound files must be in `/public/sounds/` directory
2. **Check browser console**: Look for audio loading errors
3. **Check volume settings**: `masterSoundSystem.getStatus()` shows current volumes
4. **Check mute state**: `masterSoundSystem.isMuted()` returns current state

### Background music not starting?

1. **Browser autoplay policy**: Some browsers block autoplay. User interaction required first.
2. **Check if session started**: `masterSoundSystem.isSessionActive()` should return `true`
3. **Check configuration**: Ensure `enableBackgroundMusic: true` in config

### Debugging

```typescript
// Get current sound system status
const status = masterSoundSystem.getStatus();
console.log('Sound System Status:', status);

/*
Output:
{
  sessionActive: true,
  gameType: 'career-bingo',
  backgroundMusicPlaying: true,
  masterVolume: 0.7,
  musicVolume: 0.3,
  sfxVolume: 0.5,
  muted: false
}
*/
```

---

## Migration Checklist

- [ ] Import `masterSoundSystem` in game component
- [ ] Call `startGameSession(gameType)` when game starts
- [ ] Call `endGameSession()` when game ends
- [ ] Add sound calls for correct/incorrect answers
- [ ] Add sound calls for special events (bingo, game complete, etc.)
- [ ] Test volume controls in SoundSettings UI
- [ ] Test mute/unmute functionality
- [ ] Verify background music fades in/out smoothly

---

## Next Steps

1. **Add sound files** to `/public/sounds/` directory (see `/public/sounds/README.md` for specifications)
2. **Integrate into games** using the examples above
3. **Test across browsers** (Chrome, Firefox, Safari) for autoplay compatibility
4. **Customize volumes** in `SoundSettings.tsx` component for user preferences
