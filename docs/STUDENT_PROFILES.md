# Student Profiles Database Schema

Complete student profile management system for Pathfinity with grade-level assignments and learning personalization.

## Database Schema

### `student_profiles` Table

```sql
CREATE TABLE student_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,           -- Links to auth.users
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,             -- Preferred name for UI
  grade_level TEXT NOT NULL,              -- 'Pre-K' through '12'
  date_of_birth DATE,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  learning_preferences JSONB DEFAULT '{}', -- AI personalization data
  parent_email TEXT,
  school_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
- `idx_student_profiles_user_id` - Fast user lookup
- `idx_student_profiles_grade_level` - Grade-based queries
- `idx_student_profiles_school_id` - School-based filtering
- `idx_student_profiles_grade_active` - Active students by grade
- `idx_student_profiles_enrollment_date` - Date-based sorting

### Views
- `student_profile_summary` - Optimized view for dashboards with calculated age

## Learning Preferences Schema

The `learning_preferences` JSONB field supports AI personalization:

```typescript
interface LearningPreferences {
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  favorite_subjects?: string[];
  attention_span?: 'short' | 'medium' | 'long';
  prefers_hands_on?: boolean;
  prefers_group_work?: boolean;
  prefers_individual_work?: boolean;
  needs_encouragement?: boolean;
  difficulty_preference?: 'easy' | 'moderate' | 'challenging';
  session_length_preference?: number; // minutes
  best_time_of_day?: 'morning' | 'afternoon' | 'evening';
  [key: string]: any; // Extensible for future preferences
}
```

## Test Data

Pre-configured test profiles for development:

### Profile 1: Emma (Pre-K)
- **Grade**: Pre-K
- **Learning Style**: Visual, hands-on
- **Attention Span**: Short
- **Subjects**: Math, Art

### Profile 2: Alex (Kindergarten)
- **Grade**: K  
- **Learning Style**: Auditory, group-oriented
- **Attention Span**: Medium
- **Subjects**: ELA, Science

### Profile 3: Sam (Grade 1)
- **Grade**: 1
- **Learning Style**: Kinesthetic, individual
- **Attention Span**: Long
- **Subjects**: Math, PE

### Profile 4: Maya (Pre-K)
- **Grade**: Pre-K
- **Learning Style**: Mixed, needs encouragement
- **Attention Span**: Short
- **Subjects**: Art, Music

## Setup Instructions

### 1. Execute Database Migration

**Option A: Supabase SQL Editor (Recommended)**
```sql
-- Copy and paste the contents of student-profiles-setup.sql
-- into Supabase SQL Editor and execute
```

**Option B: Command Line**
```bash
npm run profiles:setup
```

### 2. Verify Setup
```bash
npm run profiles:verify
```

### 3. Test in Application
```typescript
import { StudentProfileService } from './services/studentProfileService';

// Get profile by user ID
const profile = await StudentProfileService.getProfileByUserId('user-123');

// Create new profile
const newProfile = await StudentProfileService.createProfile({
  user_id: 'user-456',
  first_name: 'John',
  last_name: 'Doe',
  grade_level: 'K',
  learning_preferences: {
    learning_style: 'visual',
    attention_span: 'medium'
  }
});
```

## Service Functions

### Core Operations

#### `createProfile(profileData)`
Create a new student profile with validation.

#### `getProfileByUserId(userId)`
Retrieve profile for a specific user (with caching).

#### `updateProfile(userId, updates)`
Update profile fields with automatic timestamp.

#### `updateLearningPreferences(userId, preferences)`
Merge new learning preferences with existing ones.

#### `getProfilesByGrade(gradeLevel, limit?)`
Get all active profiles for a specific grade.

#### `getProfileSummary(userId)`
Get optimized profile summary for dashboards.

### Advanced Queries

#### `getProfilesBySchool(schoolId, limit?)`
Filter profiles by school ID.

#### `deactivateProfile(userId)`
Soft delete (set is_active = false).

#### `getLearningPreferences(userId)`
Extract just the learning preferences for AI systems.

### Convenience Functions

#### `createProfileWithDefaults(userId, firstName, lastName, gradeLevel)`
Create profile with grade-appropriate default preferences.

## Integration with Existing Systems

### Auth Context Integration
```typescript
// In your auth context
const { user } = useAuthContext();
const profile = await StudentProfileService.getProfileByUserId(user.id);

// Update current grade in FinnOrchestrationContext
updateStudentContext({ 
  currentGrade: profile.grade_level,
  currentSubject: profile.learning_preferences.favorite_subjects?.[0] || 'Math'
});
```

### Skills Database Integration
```typescript
// Link with skills system
const skillsForGrade = await skillsService.getSkillsByGradeAndSubject(
  profile.grade_level,
  'Math'
);
```

### AI Personalization
```typescript
// Use learning preferences for AI decisions
const preferences = await StudentProfileService.getLearningPreferences(userId);

if (preferences.attention_span === 'short') {
  // Suggest shorter activities
  const shortActivities = skills.filter(s => s.estimated_time_minutes <= 10);
}

if (preferences.learning_style === 'visual') {
  // Recommend visual tools
  recommendedTool = 'MasterToolInterface';
}
```

## Security & Privacy

### Row Level Security (RLS)
- Students can only access their own profiles
- Service role can access all profiles
- Admin role has full access

### FERPA Compliance
- No sensitive data in client-side cache
- Parent email stored securely
- Learning preferences anonymized for AI

### Data Validation
- Grade level constraints enforced
- Email format validation
- Required field validation
- Input sanitization

## Performance Considerations

### Caching Strategy
- 5-minute TTL for profile data
- Automatic cache invalidation on updates
- Grade-level result caching

### Query Optimization
- Indexed lookups for common queries
- Batch operations for multiple profiles
- Optimized view for dashboard queries

### Monitoring
- Performance metrics collection
- Error tracking and reporting
- Cache hit rate monitoring

## Error Handling

### Common Error Scenarios
- Profile not found (returns null)
- Invalid grade level (validation error)
- Duplicate user_id (unique constraint)
- Invalid email format (validation error)

### Error Response Format
```typescript
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    execution_time_ms: number;
    [key: string]: any;
  };
}
```

## Migration History

- **20250707213000**: Initial student_profiles schema
- Indexes and RLS policies
- Test data insertion
- Profile summary view
- Updated triggers

## Testing

### Unit Tests
```bash
# Test profile service functions
npm test student-profile-service

# Test database constraints
npm test profile-constraints

# Test RLS policies
npm test profile-security
```

### Integration Tests
```bash
# Test with auth system
npm test profile-auth-integration

# Test with skills database
npm test profile-skills-integration
```

## Troubleshooting

### Common Issues

1. **Table doesn't exist**
   - Execute `student-profiles-setup.sql` in Supabase SQL Editor
   - Run `npm run profiles:verify` to check status

2. **Permission denied**
   - Check RLS policies are correctly applied
   - Verify service role key is configured

3. **Insert fails with UUID error**
   - Ensure user_id is valid UUID format
   - Check unique constraint on user_id

4. **Learning preferences not saving**
   - Verify JSON format is valid
   - Check JSONB column constraints

### Debug Commands
```bash
# Verify table setup
npm run profiles:verify

# Check current profiles
npm run profiles:seed

# Reset test data
npm run db:reset && npm run profiles:setup
```

## Future Enhancements

- Profile analytics dashboard
- Learning preference ML recommendations
- Parent portal integration
- Bulk profile import/export
- Profile history tracking
- Advanced search and filtering