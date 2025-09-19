# Math Testing Checklist
## Use for EVERY test run

### Pre-Test Setup
- [ ] Clear browser console
- [ ] Note current time
- [ ] Confirm grade/student
- [ ] Select Math subject
- [ ] Choose any career

### During Test - Instruction Phase
- [ ] Content loads without errors
- [ ] Career context appears
- [ ] Examples render correctly
- [ ] Visual elements display

### During Test - Practice Phase
- [ ] Count practice questions: ___ (should be 5)
- [ ] Note question types used:
  - [ ] multiple_choice
  - [ ] true_false
  - [ ] numeric
  - [ ] counting
  - [ ] fill_blank
  - [ ] other: ___

- [ ] Check each question for:
  - [ ] Question text displays
  - [ ] Answer options layout (grid/vertical)
  - [ ] Visual elements render
  - [ ] Submit button works
  - [ ] Feedback displays

### During Test - Assessment Phase
- [ ] Assessment question loads
- [ ] Answer validates correctly
- [ ] Feedback is accurate

### Console Log Analysis
- [ ] No undefined/null errors
- [ ] correct_answer field present
- [ ] Layout decisions logged
- [ ] No TypeErrors
- [ ] No failed API calls

### Issue Recording Format
```
ISSUE: [Brief description]
PHASE: Instruction/Practice/Assessment
QUESTION: [Question number/type]
ERROR: [Console error if any]
IMPACT: Low/Medium/High/BLOCKING
```

### Comparison Points (After fixes)
- [ ] Question count same as baseline
- [ ] Question types unchanged
- [ ] Layout decisions consistent
- [ ] No new errors introduced
- [ ] Previous errors resolved