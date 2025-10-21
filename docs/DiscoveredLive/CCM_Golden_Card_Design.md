# CCM Golden Card (AI Companion) - Design Specification

**Created:** October 18, 2025
**Status:** Design Documented, Ready for Implementation

---

## 🎴 What is the Golden Card?

The **Golden Card** is the player's **AI Companion card** that can be used once per game to guarantee a **perfect score of 120 points**.

---

## 📊 Game Mechanics

### Scoring
- **Base Score:** 120 points (perfect score)
- **Multipliers:** None applied (flat 120 points regardless of other factors)
- **MVP Bonus:** Cannot be combined with Golden Card in same round

### Usage Rules
- **Single use per game** (5 rounds)
- **Mutually exclusive with MVP card** in any given round
- Player can use Golden Card **OR** MVP card, not both
- Golden Card is consumed after use (cannot be used again in same game)

### Strategic Considerations
- Use on hardest challenge for guaranteed success
- Save for critical moment in game
- Combine with timing when other players might score low

---

## 🎨 Visual Design

### Card Structure
```
┌─────────────────────┐
│   GOLD BACKGROUND   │  ← Gold gradient or solid gold color
│                     │
│   ┌───────────┐     │
│   │           │     │
│   │ AI Image  │     │  ← User's selected aiCompanion image
│   │           │     │     (overlay on gold background)
│   └───────────┘     │
│                     │
│  AI COMPANION 🏆    │  ← Card label
│   120 POINTS        │  ← Perfect score indicator
└─────────────────────┘
```

### Design Elements

**Background:**
- Gold gradient or metallic gold background
- CSS: `background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)`
- Alternate: Solid gold with shine effect
- Border: Thick gold/yellow border to distinguish from other cards

**AI Companion Image:**
- User's selected AI companion character from profile
- Centered on card
- Rounded corners or circular frame
- Shadow/glow effect to make it pop from background
- Size: ~60-70% of card height

**Card Labels:**
- Top: "AI COMPANION" or "GOLDEN CARD"
- Bottom: "120 POINTS" or "PERFECT SCORE"
- Font: Bold, readable, white or dark text with gold outline
- Trophy emoji (🏆) or star (⭐) icon

**Visual Effects:**
- Subtle gold particle animation (optional)
- Shine/glimmer effect on hover
- Pulsing glow when available to use
- Grayed out after use (with "USED" overlay)

---

## 💻 Implementation Notes

### Data Source
```typescript
// User's AI Companion selection from profile
const aiCompanion = {
  id: 'ai-companion-1',
  name: 'Alex',
  imageUrl: '/assets/ai-companions/alex.png',
  // ... other properties
};
```

### Component Structure
```tsx
<div className="golden-card">
  <div className="golden-card-background" />
  <div className="golden-card-content">
    <img
      src={user.selectedAiCompanion.imageUrl}
      alt={user.selectedAiCompanion.name}
      className="ai-companion-image"
    />
    <div className="golden-card-label">
      <span className="card-title">AI COMPANION 🏆</span>
      <span className="card-score">120 POINTS</span>
    </div>
  </div>
</div>
```

### CSS Example
```css
.golden-card {
  position: relative;
  width: 200px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  border: 4px solid #FFD700;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
}

.golden-card-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
}

.ai-companion-image {
  width: 70%;
  height: auto;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.golden-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(255, 215, 0, 0.8);
}

.golden-card.used {
  opacity: 0.5;
  filter: grayscale(1);
}
```

---

## 🔄 State Management

### Available States
1. **Available** - Can be played (glowing, interactive)
2. **Selected** - Player has selected to use it (highlighted)
3. **Used** - Already played this game (grayed out, non-interactive)
4. **Locked** - Cannot be used with MVP card (dimmed)

### State Transitions
```
Initial Game State → Available (hasGoldenCard: true)
Player Selects → Selected (visual feedback)
Player Confirms → Used (hasGoldenCard: false)
Next Game → Reset to Available
```

---

## 📦 Assets Needed

### AI Companion Images
- Source: User profile → selected AI companion
- Format: PNG with transparency preferred
- Size: 512x512px minimum
- Stored in: `/assets/ai-companions/` or via user profile data

### Gold Background Options
1. **Gradient:** CSS gradient (no asset needed)
2. **Texture:** Gold metallic texture image
3. **Animated:** Gold particles or shimmer effect

---

## 🎯 User Experience

### Discovery
- Player sees Golden Card in their hand at game start
- Tooltip: "AI Companion Card - Use once per game for 120 points!"
- Visual indicator showing it's special (gold glow, larger size)

### Selection
- Click to select Golden Card as slot 3 (special card slot)
- Confirmation prompt: "Use AI Companion for perfect 120 points?"
- Cannot select if MVP card already selected (mutually exclusive)

### After Use
- Card grayed out with "USED" overlay
- Tooltip: "Golden Card already used this game"
- Resets for next game

---

## 🧪 Testing Checklist

- [ ] Golden Card displays with user's AI companion image
- [ ] Card shows 120 points score indicator
- [ ] Card is available at start of game (hasGoldenCard: true)
- [ ] Card cannot be used with MVP card in same round
- [ ] Using card awards exactly 120 points
- [ ] Card becomes unavailable after use (hasGoldenCard: false)
- [ ] Card resets for next game
- [ ] Visual states (available, selected, used) work correctly
- [ ] Hover effects and animations work smoothly
- [ ] Card scales properly on mobile/tablet/desktop

---

## 📝 Related Files

**Services:**
- `src/services/CCMGameEngine.ts` - Scoring logic (CONFIG.GOLDEN_CARD_PERFECT_SCORE = 120)

**Components:**
- `src/components/ccm/CCMGameRoom.tsx` - Game UI (needs Golden Card component)

**APIs:**
- `src/pages/api/ccm/game/[sessionId]/lock-in.ts` - Validates Golden Card usage

**Documentation:**
- `CCM_Architecture_Overview.md` - Game mechanics overview
- `CCM_Implementation_Status.md` - Current progress

---

## 🚀 Implementation Status

✅ **COMPLETED** (October 18, 2025)

1. ✅ Created `CCMGoldenCard.tsx` component with all states (available, selected, used, disabled)
2. ✅ Integrated with AICharacterProvider to fetch user's selected AI companion
3. ✅ Implemented gold card CSS styling with animations (pulse-glow effect)
4. ✅ Added to CCMGameRoom card selection UI (displayed in rounds 2-6)
5. ✅ Updated CCMGameEngine scoring logic (flat 120 points, no multipliers)
6. ✅ Updated lock-in API to validate Golden Card usage (no role/synergy required)
7. ✅ Added state management (hasGoldenCard tracked per game, resets on new game)

## 🎯 Golden Card Implementation Summary

The Golden Card has been fully integrated into the CCM game system:

**Frontend:**
- `CCMGoldenCard.tsx` - Reusable card component with visual states
- `CCMGameRoom.tsx` - Integrated selection logic and UI display
- `index.css` - Added pulse-glow animation for available state

**Backend:**
- `CCMGameEngine.ts` - Returns flat 120 points when `specialCardType: 'golden'`
- `lock-in.ts` - Validates Golden Card usage (allows null roleCardId/synergyCardId)

**Visual Assets:**
- Uses existing `MCC_Card_Golden.png` (golden background with center glow)
- Overlays user's selected AI companion image (finn/harmony/sage/spark)
- Theme-aware (light/dark variants)

**Game Flow:**
1. Player starts game with `hasGoldenCard: true`
2. Golden Card displayed in rounds 2-6 (not available in round 1)
3. Player can click to select Golden Card
4. Selecting Golden Card deselects any role/synergy cards
5. Confirm button shows "Confirm Golden Card (120 Points)"
6. After use: `hasGoldenCard: false`, card shows "USED" overlay
7. Resets to `true` for next game

**Mutual Exclusivity:**
- Cannot be used with MVP card in same round (future feature)
- Cannot be used in Round 1 (C-Suite selection only)
- Once used, cannot be used again in same game
