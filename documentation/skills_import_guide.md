# Skills Import Guide

## Overview

The Skills Import Script is a comprehensive Node.js utility for importing educational skills data from Excel files into the Pathfinity Supabase database. It supports Pre-K and Kindergarten curriculum data with intelligent validation, error handling, and batch processing.

## Prerequisites

### 1. Environment Setup
Ensure your `.env` file contains the Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Schema
Make sure the skills database schema is deployed:

```bash
# Apply the skills migration
supabase db push
```

### 3. Excel File Location
The script looks for the Excel file in these locations (in order):
1. `./Skill Area By Grade_Categorized_MVP.xlsx` (project root)
2. `./data/Skill Area By Grade_Categorized_MVP.xlsx`
3. `./Skill Area By Grade.xlsx`
4. `./data/Skill Area By Grade.xlsx`

## Excel File Structure

### Expected Tabs
The script can import from these specific tabs:
- `Math_PreK` - Pre-Kindergarten Math skills
- `ELA_PreK` - Pre-Kindergarten English/Language Arts skills
- `Math_K` - Kindergarten Math skills
- `ELA_K` - Kindergarten English/Language Arts skills
- `Science_K` - Kindergarten Science skills
- `SocialStudies_K` - Kindergarten Social Studies skills

### Column Structure
Each tab should contain these columns:

| Column | Name | Description | Required |
|--------|------|-------------|----------|
| A | Subject | Subject area (Math, ELA, Science, SocialStudies) | Yes |
| B | Grade | Grade level (Pre-K, K) | Yes |
| C | SkillsArea | Skills category (e.g., Numbers, Counting, Reading) | Yes |
| D | SkillsCluster | Skills cluster (e.g., A., B., C.) | Yes |
| E | SkillNumber | Unique skill identifier (e.g., A.0, A.1, A.2) | Yes |
| F | SkillName | Descriptive skill name | Yes |
| G | SkillDescription | Optional detailed description | No |

**Alternative Column Mapping**: The script can also work with standard column headers instead of letters (Subject, Grade, SkillsArea, etc.).

## Usage Examples

### 1. Basic Import (All Pre-K and K Tabs)
```bash
npm run import-skills:all
```

### 2. Dry Run (Test Without Database Changes)
```bash
npm run import-skills:dry-run
```

### 3. Import Specific Tabs
```bash
npm run import-skills -- --tabs="Math_PreK,ELA_PreK"
```

### 4. Import with Custom File Path
```bash
npm run import-skills -- --file="./custom/path/Skills.xlsx" --tabs="Math_K"
```

### 5. Verbose Logging
```bash
npm run import-skills -- --all-prek-k --verbose --log-level=debug
```

### 6. Custom Batch Size
```bash
npm run import-skills -- --all-prek-k --batch-size=25
```

## Command Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--file` | `-f` | Excel file path | `./Skill Area By Grade_Categorized_MVP.xlsx` |
| `--tabs` | `-t` | Comma-separated list of tabs | All Pre-K/K tabs |
| `--all-prek-k` | | Import all Pre-K and K tabs | false |
| `--dry-run` | | Test without database changes | false |
| `--verbose` | `-v` | Enable verbose logging | false |
| `--batch-size` | `-b` | Database insert batch size | 50 |
| `--log-level` | | Log level (error, warn, info, debug) | info |

## Data Processing

### 1. Automatic Subject/Grade Detection
The script extracts subject and grade from tab names:
- `Math_PreK` → Subject: Math, Grade: Pre-K
- `ELA_K` → Subject: ELA, Grade: K
- `Science_K` → Subject: Science, Grade: K

### 2. Difficulty Level Calculation
Difficulty is automatically calculated based on:
- **Grade level**: Pre-K starts at level 1, K starts at level 3
- **Skill number**: Later skills are typically harder
- **Keywords**: Words like "identify" (easier) vs "analyze" (harder)

**Pre-K Difficulty Rules**:
- Base level: 1
- Keywords: identify (+1), count (+2), compare (+3), solve (+4)

**K Difficulty Rules**:
- Base level: 3  
- Keywords: identify (+1), add (+3), subtract (+4), analyze (+5)

### 3. Time Estimation
Estimated completion time is calculated based on:
- **Grade level**: Pre-K base 10min, K base 15min
- **Difficulty multiplier**: Harder skills take longer
- **Subject adjustments**: ELA typically takes 20-30% longer

### 4. Data Validation
Each skill is validated for:
- Required fields (subject, grade, skill_name, etc.)
- Valid subject values (Math, ELA, Science, SocialStudies)
- Valid grade values (Pre-K, K)
- Difficulty level range (1-10)
- Positive time estimates

## Error Handling

### 1. File Errors
- Missing Excel file at expected locations
- Invalid file format or corrupted file
- Missing tabs or empty worksheets

### 2. Data Validation Errors
- Missing required fields
- Invalid subject or grade values
- Empty skill names or descriptions
- Invalid difficulty levels or time estimates

### 3. Database Errors
- Connection failures
- Duplicate skill entries (handled gracefully)
- Constraint violations
- Permission issues

### 4. Processing Errors
- Malformed Excel data
- Unexpected column structures
- Row parsing failures

## Output and Reporting

### 1. Progress Logging
```
🔄 Reading Excel file: Skill Area By Grade_Categorized_MVP.xlsx
ℹ️  INFO: Excel file loaded successfully. Found 6 sheets
🔄 Processing tab: Math_PreK
ℹ️  INFO: Read 25 data rows from tab 'Math_PreK'
🔄 Inserting batch 1/1 (25 skills)
```

### 2. Summary Report
```
============================================================
📊 IMPORT SUMMARY
============================================================
Status: ✅ SUCCESS
Message: Successfully imported 150 skills from 6 tabs

📈 Statistics:
  Tabs processed: 6/6
  Total rows: 180
  Valid rows: 150
  Inserted: 150
  Skipped: 0
  Errors: 0
  Processing time: 3.45s

📋 Tab Results:
  ✅ Math_PreK: 25 inserted, 0 skipped
  ✅ ELA_PreK: 30 inserted, 0 skipped
  ✅ Math_K: 35 inserted, 0 skipped
  ✅ ELA_K: 28 inserted, 0 skipped
  ✅ Science_K: 20 inserted, 0 skipped
  ✅ SocialStudies_K: 12 inserted, 0 skipped
============================================================
```

### 3. Error Reporting
When errors occur, detailed information is provided:
```
❌ ERROR: Validation failed for row 15
   Field: difficulty_level
   Value: 15
   Message: Difficulty level must be between 1 and 10
   
⚠️  WARN: Skipped duplicate skill: Count to 10
```

## Troubleshooting

### Common Issues

#### 1. "Excel file not found"
**Solution**: 
- Check file exists at expected location
- Use `--file` option to specify custom path
- Ensure filename matches exactly (case-sensitive)

#### 2. "Tab not found in Excel file"
**Solution**:
- Verify tab names match exactly (Math_PreK, ELA_K, etc.)
- Check for extra spaces or different naming
- Use `--tabs` to specify existing tab names

#### 3. "Supabase configuration missing"
**Solution**:
- Verify `.env` file exists with correct variables
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Ensure environment variables are accessible to Node.js

#### 4. "Database connection test failed"
**Solution**:
- Verify Supabase project is running
- Check database schema is deployed
- Validate API keys have correct permissions
- Test connection with: `npm run import-skills -- --dry-run`

#### 5. "Duplicate skill entries"
**Solution**:
- This is normal for re-runs
- Script handles duplicates gracefully
- Check `skills_master` table for existing data
- Use unique constraints on (subject, grade, skill_number)

### Performance Optimization

#### 1. Batch Size Tuning
- Default batch size: 50 skills per database insert
- Increase for faster imports: `--batch-size=100`
- Decrease for memory constraints: `--batch-size=25`

#### 2. Selective Imports
- Import specific tabs: `--tabs="Math_PreK,Math_K"`
- Test with dry run first: `--dry-run`
- Use verbose logging to monitor progress: `--verbose`

### Data Quality Tips

#### 1. Excel File Preparation
- Ensure consistent column headers
- Remove empty rows and columns
- Validate subject/grade values
- Check for special characters in skill names

#### 2. Validation Best Practices
- Use descriptive skill names
- Keep skill numbers consistent within clusters
- Ensure skill descriptions are helpful but concise
- Validate data with dry run before actual import

## Integration with Pathfinity

### 1. Dashboard Integration
Once imported, skills automatically appear in:
- Student dashboard assignment cards
- Daily assignment generation
- Progress tracking system
- AI tool assignment logic

### 2. Assignment Generation
The `SkillsService.generateDailyAssignments()` function uses imported skills to:
- Create personalized daily assignments
- Match skills to appropriate AI tools
- Progress students through curriculum
- Track completion and mastery

### 3. Progress Tracking
Imported skills enable:
- Individual student progress monitoring
- Skill completion analytics
- Time investment tracking
- Difficulty progression analysis

## Maintenance

### 1. Regular Updates
- Re-run import when curriculum changes
- Update difficulty rules as needed
- Adjust time estimates based on usage data
- Add new subjects or grade levels

### 2. Data Cleanup
- Remove obsolete skills periodically
- Update skill descriptions for clarity
- Validate prerequisite relationships
- Monitor for unused or duplicate skills

### 3. Performance Monitoring
- Track import execution time
- Monitor database storage usage
- Analyze error rates and patterns
- Optimize batch sizes for efficiency