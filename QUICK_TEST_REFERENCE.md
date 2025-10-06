# Quick Testing Reference Card

## 🚀 Start Testing in 3 Steps

### Step 1: Test Unified Career Page (No Login Required)
```
URL: http://localhost:3000/test/unified-career

1. Select demo student: Sam (K, Chef)
2. Click "Generate Lesson Plan"
3. Look for enrichment indicators (see checklist below)
4. Click "Download PDF"
5. Verify PDF has 4 enrichment sections
```

### Step 2: Test Daily Lesson Plan Page (Login Required)
```
URL: http://localhost:3000/app/daily-lessons

Login: parent@pathfinity.com / parent123

1. Should auto-load Sam Brown's data
2. Click "Generate Lesson Plan"
3. Verify enrichment appears in UI
4. Download PDF and verify same enrichment sections
```

### Step 3: Repeat for All 4 Demo Users
```
ONLY test these 4 demo users (others are marketing-only):
- ✓ Sam (K, Chef)
- ✓ Alex (1, Doctor)
- ✓ Jordan (7, Game Designer)
- ✓ Taylor (10, Sports Agent)

Note: Zara, Alexis, David, Mike are marketing users only - do NOT test
```

---

## ✅ Quick Enrichment Checklist

### In Lesson Plan UI:
- [ ] Career name appears (e.g., "Chef Alex")
- [ ] Workplace specific (e.g., "CareerInc Culinary Kitchen")
- [ ] All 4 subjects present (Math, ELA, Science, Social Studies)
- [ ] Activities are career-themed (not generic)
- [ ] Student name appears in content

### In PDF (4 Sections):
- [ ] **🎯 Learning Milestones** (Gold theme) - 4 milestones
- [ ] **💜 Why This Matters** (Purple theme) - 4 value props
- [ ] **🌍 Real-World Applications** (Green theme) - Per subject (Math/ELA/Science/SS)
- [ ] **✓ Quality Assurance** (Blue theme) - Standards checklist

---

## ❌ Red Flags (Fallback Content)

**FAIL If You See**:
- "Help with math today" (generic)
- "You will learn" (not personalized)
- PDF missing enrichment sections
- "undefined" or null in PDF
- Same content for Chef and Doctor careers

**PASS If You See**:
- "Chef Alex needs help counting ingredients in the kitchen"
- "Sam will see how chefs use math in real kitchens"
- PDF has all 4 colored enrichment sections
- Different content for each career
- Student name throughout

---

## 🐛 Quick Troubleshooting

**No enrichment showing?**
1. Check browser console for "🎨 Generating ENRICHED Master Narrative"
2. If missing → orchestrator calling wrong method
3. Clear cache and retry

**PDF missing sections?**
1. Generate lesson
2. Check browser DevTools → Network tab
3. Look for lesson data response
4. Verify `content.enrichment` exists in JSON

**Generic content across careers?**
1. Clear browser cache
2. Test Sam (Chef) → should say "kitchen"
3. Test Alex (Doctor) → should say "hospital"
4. If same → cache issue or career not passing

---

## 📊 Demo User Quick Reference

**ONLY 4 DEMO USERS** (Zara, Alexis, David, Mike are marketing-only)

| Student | Grade | Career | Companion | Login Needed? |
|---------|-------|--------|-----------|---------------|
| Sam | K | Chef | Spark | No (test page) |
| Alex | 1 | Doctor | Finn | No (test page) |
| Jordan | 7 | Game Designer | Sage | No (test page) |
| Taylor | 10 | Sports Agent | Harmony | No (test page) |

**Parent Login**: `parent@pathfinity.com` / `parent123` (sees Sam)
**Teacher Login**: `teacher@pathfinity.com` / `teacher123` (sees all students)

---

## 📝 Report Template (Copy & Fill)

```
## Test Results - [Date]

### Page 1: /test/unified-career
- Sam (Chef): ✅ Enriched / ❌ Generic - PDF: ✅ / ❌
- Alex (Doctor): ✅ Enriched / ❌ Generic - PDF: ✅ / ❌
- Jordan (Game Designer): ✅ Enriched / ❌ Generic - PDF: ✅ / ❌
- Taylor (Sports Agent): ✅ Enriched / ❌ Generic - PDF: ✅ / ❌

### Page 2: /app/daily-lessons
- Parent login: ✅ Success / ❌ Failed
- Enrichment showing: ✅ Yes / ❌ No
- PDF valid: ✅ Yes / ❌ No

### Overall Status
- [ ] PASS - All enrichment present
- [ ] FAIL - Issues found: [describe]

### Notes
[Any observations, issues, or screenshots]
```

---

## 📚 Full Documentation

See `ENRICHMENT_TESTING_GUIDE.md` for:
- Detailed testing procedures
- Layer-by-layer validation checklist
- Troubleshooting guide
- Success criteria
- Reporting templates

---

**Quick Start**: Open `http://localhost:3000/test/unified-career` and select Sam!
