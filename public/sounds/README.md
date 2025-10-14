# Discovered Live! Sound Effects

This directory contains sound effects for the Discovered Live! multiplayer game.

## Required Sound Files

### Timer Sounds
- `timer-tick.mp3` - Soft tick sound for countdown (10-6 seconds remaining)
- `timer-warning.mp3` - Medium urgency sound (5-4 seconds remaining)
- `timer-urgent.mp3` - High urgency sound (3-1 seconds remaining)

### Answer Feedback
- `correct.mp3` - Positive, rewarding sound for correct answers
- `incorrect.mp3` - Gentle negative sound for incorrect answers

### Game Events
- `bingo.mp3` - Celebration sound for achieving bingo
- `game-start.mp3` - Exciting sound for game starting
- `game-complete.mp3` - Triumphant sound for game completion
- `question-start.mp3` - Attention sound for new question

### UI Interactions
- `countdown.mp3` - "3, 2, 1" countdown sound
- `click.mp3` - Subtle click sound for UI interactions
- `join.mp3` - Welcoming sound for joining room
- `leave.mp3` - Farewell sound for leaving room
- `spectator.mp3` - Ambient sound for entering spectator mode

### Background Music (Optional)
- `background-music.mp3` - Upbeat, non-intrusive background music

## Sound Specifications

### Format
- **File Type:** MP3 or OGG (MP3 recommended for browser compatibility)
- **Sample Rate:** 44.1 kHz
- **Bit Rate:** 128 kbps (good balance of quality and file size)
- **Channels:** Mono or Stereo

### Duration Guidelines
- **Timer sounds:** 0.1-0.3 seconds (quick ticks)
- **Answer feedback:** 0.5-1.5 seconds
- **Celebrations (bingo):** 2-3 seconds
- **Game events:** 1-2 seconds
- **UI sounds:** 0.1-0.5 seconds
- **Background music:** 2-5 minutes (looped)

### Volume Guidelines
All sounds should be normalized to prevent clipping:
- Peak volume: -3 dB
- Average volume: -12 to -18 dB
- The service will handle relative volume adjustments

## Free Sound Resources

### Recommended Sources for Game Sounds
1. **Freesound.org** - https://freesound.org/
   - Huge library of Creative Commons sounds
   - Search for: "timer tick", "correct answer", "celebration", "game start"

2. **Zapsplat** - https://www.zapsplat.com/
   - Free sound effects for game development
   - Great UI sounds and game events

3. **OpenGameArt.org** - https://opengameart.org/
   - Game-specific sound effects
   - Look in "Sound Effect" category

4. **BBC Sound Effects** - https://sound-effects.bbcrewind.co.uk/
   - Professional quality, free for personal and education use

5. **YouTube Audio Library** - https://studio.youtube.com/
   - Royalty-free music and sound effects
   - Good source for background music

### Creating Your Own Sounds
- **Audacity** (free) - https://www.audacityteam.org/
- **LMMS** (free) - https://lmms.io/
- **Bfxr** (online) - https://www.bfxr.net/ (great for retro game sounds)

## Installation

1. Download or create sound files following the specifications above
2. Place them in this directory (`public/sounds/`)
3. Ensure filenames match exactly as listed above
4. Test sounds using the Sound Settings component in-game

## Testing Sounds

Use the test page to verify all sounds work correctly:

```typescript
import { soundEffectsService } from '@/services/SoundEffectsService';

// Initialize
await soundEffectsService.initialize();

// Test individual sounds
soundEffectsService.playAnswerFeedback(true);
soundEffectsService.playBingoCelebration(1);
soundEffectsService.playTimerSound(3);
```

## Current Status

⚠️ **Currently using placeholder silence files**

To enable actual sound effects:
1. Add real sound files to this directory
2. Sounds will automatically be loaded by the SoundEffectsService
3. No code changes required

## License Considerations

When adding sound files:
- Ensure you have proper licensing for commercial use
- Include attribution in CREDITS.md if required
- Avoid copyrighted material without permission

## Fallback Behavior

If sound files are missing or fail to load:
- The service will continue to work without errors
- Sounds will simply not play
- The game remains fully playable
- Users can toggle sounds on/off in settings

## Volume Defaults

The service uses these default volumes:
- Master Volume: 70%
- Music Volume: 30%
- SFX Volume: 70%

Users can adjust these in the Sound Settings UI.

## Browser Compatibility

Supported audio formats by browser:
- **MP3:** All modern browsers
- **OGG:** Firefox, Chrome, Opera
- **WAV:** All modern browsers (but larger files)

**Recommendation:** Use MP3 for best compatibility and file size.

## Performance Notes

- All sounds are preloaded on game initialization
- Critical sounds (timer, answer feedback) load first
- Background music loads last to not block gameplay
- Total recommended size: < 5 MB for all sounds
- Individual files: < 500 KB each (except background music)

## Contact

For questions about sound implementation, see:
- Sound Effects Service: `/src/services/SoundEffectsService.ts`
- Sound Hooks: `/src/hooks/useSoundEffects.ts`
- Sound Settings UI: `/src/components/discovered-live/SoundSettings.tsx`
