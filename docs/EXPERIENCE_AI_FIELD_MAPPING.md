# Experience Container AI Field Mapping

## New AI Response Structure (After PromptBuilder Updates)

```json
{
  "title": "Engaging scenario title with career context",
  "introduction": "Set the scene - describe the work situation",
  "challenges": [
    {
      "scenario": "A specific situation this professional faces",
      "question": "What would you do?",
      "options": [
        "First realistic action",
        "Second realistic action",
        "Third realistic action",
        "Fourth realistic action"
      ],
      "correct_answer": 0, // Index of best option (0-3)
      "explanation": "Why this is the best professional choice",
      "outcome": "What happens when you choose correctly",
      "learning_point": "Key professional insight gained"
    }
  ],
  "conclusion": "Wrap up the experience and celebrate learning"
}
```

## UI Component Mapping

### 1. Introduction Screen
- **Title**: `generatedContent.title` → Displayed as main header
- **Introduction**: `generatedContent.introduction` → Welcome message/scene setting
- **Companion Message**: Generated based on companion personality

### 2. Scenario/Challenge Screen
Each challenge in `generatedContent.challenges[]` maps to:

#### Challenge Display
- **Scenario Context**: `challenge.scenario` → Main scenario description
- **Question Prompt**: `challenge.question` → The decision prompt (e.g., "What would you do?")
- **Options**: `challenge.options[]` → 4 action choices displayed as buttons
- **Correct Answer**: `challenge.correct_answer` → Index (0-3) for validation

#### Feedback Display
- **Explanation**: `challenge.explanation` → Why the answer is correct/incorrect
- **Outcome**: `challenge.outcome` → What happens as a result
- **Learning Point**: `challenge.learning_point` → Key takeaway

### 3. Completion Screen
- **Conclusion**: `generatedContent.conclusion` → Final celebration message
- **Progress**: Calculated from completed challenges
- **Achievements**: Generated based on performance

## Key Changes from Previous Format

### Removed Fields
- ❌ `visual` - No longer needed for Experience container
- ❌ `type` - Not applicable for scenario-based challenges
- ❌ `practiceSupport` - Not needed for Experience storytelling
- ❌ `hint` - Generated contextually if needed

### New Fields
- ✅ `scenario` - Detailed situation description
- ✅ `question` - Explicit decision prompt
- ✅ `outcome` - Result of correct choice
- ✅ `learning_point` - Professional insight
- ✅ `introduction` - Scene setting at container level
- ✅ `conclusion` - Wrap-up message

## Implementation Status

### ✅ Completed
1. PromptBuilder updated to generate Experience-specific format
2. Language constraints separated from Learn-specific rules
3. AIExperienceContainerV2-UNIFIED updated to map new fields
4. Challenge display updated to show scenario + question

### 🔄 In Progress
1. Testing with actual AI responses
2. Verifying all fields display correctly

### 📋 To Do
1. Update ExperienceCard component if needed
2. Test with different grade levels
3. Verify career-specific scenarios generate properly

## Example Mapped Content

### Teacher + Counting Skill → Classroom Organization Scenario

**AI Response:**
```json
{
  "title": "A Day in Ms. Johnson's Classroom",
  "introduction": "Welcome to your classroom! As a teacher, you'll use counting skills every day to organize your students and materials.",
  "challenges": [
    {
      "scenario": "It's the first day of school. You have 30 students arriving and need to organize your classroom supplies. You have boxes of crayons, and each student needs exactly 5 crayons.",
      "question": "What should you do first?",
      "options": [
        "Count how many boxes of crayons you have and calculate if you have enough",
        "Start handing out crayons randomly",
        "Wait for students to ask for crayons",
        "Give some students extra crayons"
      ],
      "correct_answer": 0,
      "explanation": "Teachers always plan ahead by counting supplies to ensure every student gets what they need.",
      "outcome": "Perfect! You counted 6 boxes with 25 crayons each, giving you 150 crayons total - exactly what you need!",
      "learning_point": "Teachers use multiplication and division daily to manage classroom resources efficiently."
    }
  ],
  "conclusion": "Excellent work! You've shown how teachers use math skills to create organized, fair classrooms where every student has what they need to learn."
}
```

**UI Display:**
1. **Intro Screen**: Shows title and introduction
2. **Challenge Screen**:
   - Displays the classroom scenario
   - Shows "What should you do first?" as the question
   - Presents 4 action options as buttons
3. **Feedback**: Shows outcome and learning point after selection
4. **Completion**: Displays conclusion message

## Notes

- The new format focuses on **storytelling and decision-making** rather than counting exercises
- Each scenario creates **professional immersion** where students experience the career
- Language is **grade-appropriate** through the language constraints system
- No visual emojis needed - the scenarios are descriptive enough