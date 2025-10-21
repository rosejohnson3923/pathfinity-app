# Career Challenge - Card Back Midjourney Prompts

**Created:** October 18, 2025
**Purpose:** Midjourney prompts for Career Challenge card back designs
**Asset Type:** Reusable card backs for all card types (C-Suite, Role, Synergy, Challenge)

---

## Design Requirements

### Visual Style
- **Theme:** Professional business/corporate aesthetic
- **Purpose:** Card backs for Crisis Commander game
- **Usage:** Background for C-Suite, Role, Synergy, and Challenge cards
- **Integration:** Will have glassmorphism overlay with text content

### Technical Specs
- **Aspect Ratio:** Portrait card (2:3 or similar playing card ratio)
- **Resolution:** High-res for web use
- **Format:** PNG with transparency potential
- **Themes:** Light mode and Dark mode versions

### Design Elements
- Subtle executive/business motifs (boardroom, skyscrapers, strategy)
- Professional color palette
- Not too busy - needs to work as background
- Elegant and modern
- Age-appropriate for middle/high school students

---

## Midjourney Prompt - LIGHT THEME

```
A professional business card back design with glassmorphic aesthetic, soft gradient background from purple (#9333ea) to pink (#ec4899), subtle geometric patterns inspired by skyscrapers and boardrooms, frosted glass texture with translucent white overlay (rgba 255,255,255,0.7), minimalist executive style, clean lines, diagonal accent lines suggesting upward growth, small abstract icons of buildings and business charts in watermark style, professional playing card back, modern and sophisticated, ethereal and light, 2:3 aspect ratio, high detail, clean design suitable for text overlay --ar 2:3 --style raw --v 6
```

### Key Elements:
- **Base Gradient:** Purple to Pink (#9333ea → #ec4899)
- **Glass Overlay:** Translucent white (rgba 255,255,255,0.7)
- **Accents:** White, subtle purple tint (rgba 102,126,234,0.15)
- **Pattern:** Subtle geometric boardroom/cityscape motifs
- **Texture:** Frosted glass, glassmorphism blur effect
- **Mood:** Professional, modern, aspirational, clean

### Visual Reference:
- Think: Glassmorphic UI card, modern corporate identity with depth
- Style: Minimal, professional, semi-transparent layers
- Avoid: Too playful, too dark, too cluttered, solid backgrounds

---

## Midjourney Prompt - DARK THEME

```
A professional business card back design for dark mode with glassmorphic aesthetic, gradient background from deep purple (#581c87) through dark purple (#7e22ce) to dark pink (#701a75), subtle geometric patterns inspired by night cityscape and executive boardrooms, frosted dark glass texture with translucent black overlay (rgba 0,0,0,0.5), minimalist premium style, clean lines, diagonal accent lines suggesting upward momentum, small abstract icons of buildings and business charts in subtle watermark style with purple tint (rgba 102,126,234,0.25), professional playing card back, sophisticated and elegant, ethereal depth, 2:3 aspect ratio, high detail, clean design suitable for text overlay --ar 2:3 --style raw --v 6
```

### Key Elements:
- **Base Gradient:** Deep Purple to Dark Pink (#581c87 → #7e22ce → #701a75)
- **Glass Overlay:** Translucent black (rgba 0,0,0,0.5)
- **Accents:** White borders (rgba 255,255,255,0.1), purple tint (rgba 102,126,234,0.25)
- **Pattern:** Subtle night cityscape/boardroom motifs
- **Texture:** Frosted dark glass, glassmorphism depth
- **Mood:** Premium, sophisticated, executive, ethereal

### Visual Reference:
- Think: Glassmorphic dark UI, premium executive interface with depth layers
- Style: Sleek, modern, semi-transparent with depth
- Avoid: Too bright, too neon, too busy, solid black backgrounds

---

## Alternative Variations (If Needed)

### Variation A - More Abstract
Replace "buildings and business charts" with "abstract corporate symbols and strategic arrows"

### Variation B - More Minimal
Remove icon references, focus on "pure gradient with subtle linear geometric pattern"

### Variation C - More Textured
Add "embossed texture, subtle leather grain, premium card stock feel"

---

## Post-Generation Adjustments

### If Too Busy:
- Request "simpler version with reduced pattern density"
- Add "more negative space, cleaner background"

### If Too Plain:
- Request "add subtle texture, increase pattern detail"
- Add "more visual interest while maintaining elegance"

### If Colors Off:
- **Light:** "shift to cooler blue tones, increase brightness"
- **Dark:** "deepen navy, add more metallic accents"

---

## Usage in Game

### Card Types That Use This Back:
1. **C-Suite Cards** (CEO, CFO, CMO, CTO, CHRO)
2. **Challenge Cards** (Crisis scenarios)
3. **Role Cards** (Solution options - player's hand of 10)
4. **Synergy Cards** (Bonus solutions - player's hand of 5)

### Implementation:
- Card back image as `background-image` in CSS
- Glassmorphism overlay with `backdrop-filter: blur()`
- Text content rendered on top
- Light/Dark theme switching via `data-theme` attribute

---

## File Naming Convention

**Generated Files:**
- `CC_Card_Back_Light.png` - Light theme version
- `CC_Card_Back_Dark.png` - Dark theme version

**Location:**
- `/public/assets/career-challenge/`

---

## Design Goals

✅ **Professional** - Suitable for business education
✅ **Versatile** - Works for all card types
✅ **Readable** - Doesn't interfere with text overlay
✅ **Modern** - Appeals to middle/high school students
✅ **Thematic** - Reinforces corporate/executive theme
✅ **Scalable** - Works at various card sizes

---

## Approval Checklist

- [ ] Prompt generates professional-looking card back
- [ ] Light theme has good contrast for text
- [ ] Dark theme feels premium and sophisticated
- [ ] Pattern is subtle enough for text overlay
- [ ] Both themes match overall game aesthetic
- [ ] Design appeals to target age group
- [ ] Files exported at high resolution

---

## Notes

- Keep background patterns subtle - primary focus is on the text content
- Consider that cards will have glassmorphism effect on top
- Test with sample card text to ensure readability
- May need slight blur or opacity adjustment in CSS for optimal text legibility
