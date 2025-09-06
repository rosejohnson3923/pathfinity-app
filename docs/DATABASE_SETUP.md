# Database Setup Guide

Comprehensive guide for setting up and managing the Pathfinity skills database system.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize database
npm run db:setup

# Import skills data and generate test data
npm run db:full-setup

# Check database health
npm run db:check
```

## Available Commands

### Core Database Operations

```bash
# Initialize database with schema and indexes
npm run db:setup

# Generate test data (5 students, basic skills)
npm run db:seed

# Clear all test data
npm run db:reset

# Run comprehensive health check
npm run db:check
```

### Data Import Commands

```bash
# Import Pre-K Math and ELA skills
npm run db:import-prek

# Import Kindergarten Math, ELA, Science, Social Studies
npm run db:import-k

# Import all Pre-K and K subjects
npm run db:import-all-early
```

### Advanced Setup Commands

```bash
# Generate large test dataset (20 students, 50 skills per subject)
npm run db:seed-large

# Complete setup: initialize + import + seed
npm run db:full-setup
```

## Command Details

### Database Initialization (`npm run db:setup`)

Performs the following operations:
- ✅ Checks database connection
- ✅ Runs pending migrations
- ✅ Creates performance indexes
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates initial admin user (if needed)

### Test Data Generation (`npm run db:seed`)

Creates realistic test data:
- **Students**: 5 test student accounts
- **Skills**: Sample skills for Math, ELA, Science, Social Studies
- **Progress**: Realistic progress tracking data
- **Assignments**: Daily assignments for the past week

**Custom Options:**
```bash
# Custom student count and skills
node scripts/database-setup.mjs seed --student-count 10 --skills-per-subject 20
```

### Health Check (`npm run db:check`)

Comprehensive validation:
- ✅ Database connection
- ✅ Table structure validation
- ✅ Index optimization check
- ✅ RLS policy verification
- ✅ Data integrity validation
- ✅ Performance metrics

### Data Import (`npm run db:import-*`)

Imports real curriculum data:
- **Pre-K**: Math and ELA fundamentals
- **Kindergarten**: Math, ELA, Science, Social Studies
- **All Early**: Complete Pre-K through K curriculum

## Database Schema

### Core Tables

1. **skills_master**
   - Curriculum skills database
   - Grade levels, subjects, difficulty
   - Prerequisites and sequences

2. **student_skill_progress**
   - Individual student progress tracking
   - Scores, attempts, completion status
   - Time spent on each skill

3. **daily_assignments**
   - AI-generated daily assignments
   - Tool assignments and scheduling
   - Progress tracking

### Performance Indexes

Automatically created for optimal performance:
- `idx_skills_master_grade_subject`
- `idx_skills_master_skills_area`
- `idx_student_progress_student_skill`
- `idx_student_progress_status`
- `idx_daily_assignments_date_student`
- `idx_daily_assignments_status`

## Environment Setup

### Required Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Logging level
LOG_LEVEL=info  # debug, info, warn, error
```

### Supabase Local Development

```bash
# Start Supabase locally
npx supabase start

# Check status
npx supabase status

# Reset local database
npx supabase db reset
```

## Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd pathfinity-revolutionary

# Install dependencies
npm install

# Start Supabase
npx supabase start

# Initialize database
npm run db:setup
```

### 2. Import Curriculum Data
```bash
# Option A: Import specific grades
npm run db:import-prek
npm run db:import-k

# Option B: Import everything
npm run db:import-all-early
```

### 3. Add Test Data
```bash
# Basic test data
npm run db:seed

# Or larger dataset for testing
npm run db:seed-large
```

### 4. Verify Setup
```bash
# Run health check
npm run db:check

# Should show:
# ✅ Database connection OK
# ✅ All required tables exist
# ✅ Index validation completed
# ✅ Data integrity validation completed
```

## Troubleshooting

### Common Issues

**"Database connection failed"**
```bash
# Check if Supabase is running
npx supabase status

# Start if needed
npx supabase start

# Verify environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

**"Missing tables" error**
```bash
# Run migration manually
npx supabase db push

# Then reinitialize
npm run db:setup
```

**"Import script not found"**
```bash
# Ensure Excel file exists
ls data/

# Run import manually
node scripts/import-skills.mjs --verbose
```

### Performance Issues

**Slow query performance**
```bash
# Check indexes
npm run db:check

# View performance metrics in health check output
```

**Large dataset testing**
```bash
# Clear existing data first
npm run db:reset

# Generate larger dataset
npm run db:seed-large
```

## Data Management

### Backup and Restore

```bash
# Export data (manual process)
npx supabase db dump --file backup.sql

# Import data
npx supabase db reset
psql -f backup.sql
```

### Clearing Data

```bash
# Clear only test data (keeps real curriculum)
npm run db:reset

# Clear everything and start fresh
npx supabase db reset
npm run db:full-setup
```

## Advanced Configuration

### Custom Test Data

Modify `scripts/database-setup.mjs` to customize:
- Student profiles and grades
- Skill difficulty distributions
- Progress completion rates
- Assignment patterns

### Performance Tuning

Monitor query performance:
```bash
# Check current metrics
npm run db:check

# Review slow queries in Supabase dashboard
# Add additional indexes if needed
```

## Integration with Services

The database setup integrates with:
- **Skills Service**: CRUD operations on curriculum
- **Progress Service**: Student progress tracking
- **Assignment Service**: Daily assignment generation
- **Finn Integration**: AI-powered recommendations

## Monitoring and Analytics

Health check provides key metrics:
- **Connection latency**
- **Table record counts**
- **Query performance**
- **Index usage**
- **Data integrity status**

Use these metrics to:
- Optimize query performance
- Plan capacity scaling
- Monitor data quality
- Debug integration issues

## Production Deployment

For production environments:

1. **Use production Supabase instance**
2. **Set proper environment variables**
3. **Run health checks regularly**
4. **Monitor performance metrics**
5. **Backup data regularly**

```bash
# Production health check
SUPABASE_URL=https://your-project.supabase.co npm run db:check
```

## Support

For issues or questions:
1. Check this documentation
2. Run `npm run db:check` for diagnostics
3. Review Supabase logs
4. Check GitHub issues