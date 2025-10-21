# Career Challenge - Table Surface Midjourney Prompts

**Created:** October 18, 2025
**Purpose:** Midjourney prompts for Career Challenge table surface background
**Asset Type:** Generic playing surface for card placement (no pre-designated zones)

---

## Design Requirements

### Visual Style
- **Theme:** Professional executive boardroom table
- **Purpose:** Background surface for card game
- **Usage:** Cards will be positioned via CSS on top of this surface
- **Integration:** Clean backdrop that doesn't compete with cards

### Technical Specs
- **Aspect Ratio:** Wide landscape (16:9 or similar)
- **Resolution:** High-res for full-screen web use
- **Format:** PNG
- **Themes:** Light mode and Dark mode versions

### Design Elements
- Professional table texture (wood, glass, or modern surface)
- Subtle executive/corporate aesthetic
- Clean and uncluttered - cards are the focus
- Elegant and modern
- Age-appropriate for middle/high school students

---

## Midjourney Prompt - LIGHT THEME

```
Professional executive boardroom table surface, top-down view, glassmorphic aesthetic with purple-to-pink gradient background (from #9333ea to #ec4899), frosted translucent white glass tabletop (rgba 255,255,255,0.7), subtle reflective sheen, clean modern design, minimalist professional style, soft shadows and depth, ethereal light texture, no objects on table, clean empty surface ready for card placement, premium corporate aesthetic, 16:9 wide angle, high detail, smooth gradients --ar 16:9 --style raw --v 6
```

### Key Elements:
- **Base Gradient:** Purple to Pink (#9333ea → #ec4899)
- **Surface:** Frosted white glass (rgba 255,255,255,0.7)
- **Texture:** Subtle reflective sheen, smooth and clean
- **Style:** Minimalist, professional, uncluttered
- **Mood:** Modern, corporate, premium

### Visual Reference:
- Think: High-end conference table, clean executive workspace
- Style: Glassmorphic, translucent, modern
- Avoid: Busy patterns, objects on table, cluttered

---

## Midjourney Prompt - DARK THEME

```
Professional executive boardroom table surface for dark mode, top-down view, glassmorphic aesthetic with deep purple-to-dark-pink gradient background (from #581c87 through #7e22ce to #701a75), frosted translucent dark glass tabletop (rgba 0,0,0,0.5), subtle reflective sheen with purple tint (rgba 102,126,234,0.25), clean modern design, minimalist premium style, soft shadows and depth, ethereal dark texture, no objects on table, clean empty surface ready for card placement, sophisticated corporate aesthetic, 16:9 wide angle, high detail, smooth gradients --ar 16:9 --style raw --v 6
```

### Key Elements:
- **Base Gradient:** Deep Purple → Dark Purple → Dark Pink (#581c87 → #7e22ce → #701a75)
- **Surface:** Frosted dark glass (rgba 0,0,0,0.5)
- **Texture:** Subtle reflective sheen with purple tint
- **Style:** Minimalist, premium, sophisticated
- **Mood:** Executive, elegant, high-end

### Visual Reference:
- Think: Premium dark mode UI, luxury boardroom at night
- Style: Glassmorphic dark glass, translucent layers
- Avoid: Too bright, busy patterns, objects on table

---

## Alternative Variations (If Needed)

### Variation A - More Textured
Add "subtle wood grain texture visible through glass, executive desk surface"

### Variation B - More Minimal
Replace surface details with "pure gradient with minimal texture, ultra-clean"

### Variation C - With Subtle Grid
Add "very subtle grid lines or geometric pattern, barely visible guides"

---

## Post-Generation Adjustments

### If Too Busy:
- Request "simpler version, reduce texture, more empty space"
- Add "cleaner surface, less detail"

### If Too Plain:
- Request "add subtle texture, slight reflective highlights"
- Add "more depth and dimension while keeping clean"

### If Colors Off:
- **Light:** "increase purple-pink saturation, brighten frosted glass"
- **Dark:** "deepen purples, increase glass translucency"

---

## Usage in Game

### Card Placement Zones (via CSS):
1. **Center Zone** - Challenge Card stack
2. **Left Zone** - Role Cards (hand of 10)
3. **Right Zone** - Synergy Cards (hand of 5)
4. **Player Areas** - Around edges (optional)

### Implementation:
- Table surface as full-screen `background-image`
- Cards positioned via CSS Grid or Flexbox
- Glassmorphism effects on cards themselves
- Responsive layout for mobile/tablet/desktop

---

## Comparison: Table Surface vs. Gradient Only

### Option 1: Table Surface Image
✅ More immersive "sitting at a table" feel
✅ Professional boardroom aesthetic
❌ Additional asset to load
❌ May not scale perfectly on all screens

### Option 2: Pure Gradient Background (No Image)
✅ Faster load time
✅ Perfect scaling on all devices
✅ Simpler implementation
❌ Less immersive

**Recommendation:** Generate table surface and compare. If it doesn't add significant value over plain gradient, use gradient only.

---

## File Naming Convention

**Generated Files:**
- `CC_Table_Surface_Light.png` - Light theme version
- `CC_Table_Surface_Dark.png` - Dark theme version

**Location:**
- `/public/assets/career-challenge/`

---

## Design Goals

✅ **Professional** - Executive boardroom aesthetic
✅ **Clean** - Doesn't compete with cards
✅ **Versatile** - Works with any card arrangement
✅ **Modern** - Appeals to target age group
✅ **Thematic** - Reinforces corporate theme
✅ **Scalable** - Works at various screen sizes

---

## Approval Checklist

- [ ] Prompt generates clean, professional surface
- [ ] Light theme has good contrast for cards
- [ ] Dark theme feels premium and sophisticated
- [ ] Surface is subtle enough - cards are the focus
- [ ] Both themes match overall game aesthetic
- [ ] Design adds value over simple gradient
- [ ] Files exported at high resolution

---

## Decision Point

After generating, compare:
- **Table Surface Image** (this asset)
- **vs. CSS Gradient Only** (`bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600`)

Choose the option that provides best balance of:
- Visual appeal
- Performance
- Maintainability
- Responsive design flexibility
