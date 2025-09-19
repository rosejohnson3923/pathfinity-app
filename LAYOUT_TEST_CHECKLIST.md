# Intelligent Layout System Test Checklist

## Pre-Test Setup
1. Open browser console
2. Enable layout debugging: `localStorage.setItem("DEBUG_LAYOUT", "true")`
3. Clear console
4. Note test configuration:
   - [ ] Student: _________
   - [ ] Grade: _________
   - [ ] Subject: _________
   - [ ] Time: _________

## During Each Question

### Visual Inspection
- [ ] **Layout Type** (check one):
  - [ ] Vertical (stacked list)
  - [ ] Grid 2-column
  - [ ] Grid 3-column
  - [ ] Grid 4-column
  - [ ] Input field (no options)

- [ ] **Visual Issues**:
  - [ ] Text wrapping awkwardly
  - [ ] Options cut off
  - [ ] Uneven spacing
  - [ ] Text too small/large
  - [ ] Options misaligned

### Console Verification
Look for "BENTOLEARN LAYOUT DECISION" in console and verify:

1. **Options Analysis**:
   - [ ] Correct option count
   - [ ] Character counts accurate
   - [ ] Word counts correct

2. **Content Detection**:
   - [ ] `hasArrays`: _____ (should be true for [...] patterns)
   - [ ] `allNumeric`: _____ (should be true for pure numbers)
   - [ ] `hasEmojis`: _____ (should be true for emoji content)
   - [ ] `contentType`: _____ (numeric/emoji/text/longText/array)

3. **Layout Decision**:
   - [ ] `layoutType`: _____ (vertical/grid-2/grid-3/grid-4)
   - [ ] `reasoning`: Makes sense for content?

### Expected Behaviors

#### Should be VERTICAL:
- [ ] Sentences (>3 words)
- [ ] Arrays like [1, 2, 3]
- [ ] Long text (>20 chars average)
- [ ] High variance in option lengths

#### Should be GRID:
- [ ] Single numbers (1, 2, 3, 4)
- [ ] Short words (<10 chars)
- [ ] Emojis only
- [ ] Consistent short options

## Post-Test Analysis

Run in console:
```javascript
// View summary
layoutSummary()

// Export data
layoutExport()
```

### Summary Review
- [ ] Total questions analyzed: _____
- [ ] Vertical layouts: _____%
- [ ] Grid layouts: _____%
- [ ] Most common content type: _____

### Issues Found

| Question # | Expected Layout | Actual Layout | Issue | Screenshot |
|------------|----------------|---------------|-------|------------|
| | | | | |
| | | | | |
| | | | | |

## Grade-Specific Expectations

### Elementary (K-2)
- [ ] Larger touch targets visible
- [ ] Simple 2-column grids for numbers
- [ ] Vertical for any text options

### Middle School (3-8)
- [ ] Balanced layouts
- [ ] Can handle 3-column grids
- [ ] Smart text wrapping

### High School (9-12)
- [ ] More compact layouts
- [ ] Can handle 4-column grids
- [ ] Efficient use of space

## Final Verification
- [ ] No console errors related to layout
- [ ] All options clickable/selectable
- [ ] Layout responsive on resize
- [ ] Dark mode displays correctly

## Quick Debug Commands

```javascript
// Enable debugging
localStorage.setItem("DEBUG_LAYOUT", "true")

// View current summary
layoutSummary()

// Export all data
layoutExport()

// Clear data
layoutClear()

// Check specific layout CSS
document.querySelectorAll('[class*="layoutGrid"]')
document.querySelectorAll('[class*="layoutVertical"]')
```