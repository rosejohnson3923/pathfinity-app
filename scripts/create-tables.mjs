#!/usr/bin/env node

// ================================================================
// CREATE TABLES SCRIPT
// Direct table creation for remote Supabase instance
// ================================================================

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// Load environment variables
config({ path: join(PROJECT_ROOT, '.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log(chalk.blue('🚀 Creating Pathfinity database tables...'));

// ================================================================
// TABLE CREATION SCRIPTS
// ================================================================

const createSkillsMasterTable = `
  CREATE TABLE IF NOT EXISTS skills_master (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL CHECK (subject IN ('Math', 'ELA', 'Science', 'SocialStudies')),
    grade TEXT NOT NULL CHECK (grade IN ('Pre-K', 'K')),
    skills_area TEXT NOT NULL,
    skills_cluster TEXT NOT NULL,
    skill_number TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    skill_description TEXT,
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 10),
    estimated_time_minutes INTEGER NOT NULL CHECK (estimated_time_minutes > 0),
    prerequisites UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subject, grade, skills_area, skill_number)
  );
`;

const createStudentProgressTable = `
  CREATE TABLE IF NOT EXISTS student_skill_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    skill_id UUID NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
    attempts INTEGER DEFAULT 0 CHECK (attempts >= 0),
    score DECIMAL(3,2) CHECK (score >= 0 AND score <= 1),
    time_spent_minutes INTEGER DEFAULT 0 CHECK (time_spent_minutes >= 0),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, skill_id)
  );
`;

const createDailyAssignmentsTable = `
  CREATE TABLE IF NOT EXISTS daily_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    assignment_date DATE NOT NULL,
    skill_id UUID NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (subject IN ('Math', 'ELA', 'Science', 'SocialStudies')),
    estimated_time_minutes INTEGER NOT NULL CHECK (estimated_time_minutes > 0),
    assigned_tool TEXT NOT NULL CHECK (assigned_tool IN ('MasterToolInterface', 'AlgebraTiles', 'GraphingCalculator', 'VirtualLab', 'WritingStudio', 'BrandStudio')),
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'started', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, assignment_date, skill_id)
  );
`;

// ================================================================
// INDEX CREATION
// ================================================================

const createIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_skills_master_grade_subject ON skills_master(grade, subject);',
  'CREATE INDEX IF NOT EXISTS idx_skills_master_skills_area ON skills_master(skills_area);',
  'CREATE INDEX IF NOT EXISTS idx_student_progress_student_skill ON student_skill_progress(student_id, skill_id);',
  'CREATE INDEX IF NOT EXISTS idx_student_progress_status ON student_skill_progress(status);',
  'CREATE INDEX IF NOT EXISTS idx_daily_assignments_date_student ON daily_assignments(assignment_date, student_id);',
  'CREATE INDEX IF NOT EXISTS idx_daily_assignments_status ON daily_assignments(status);'
];

// ================================================================
// RLS POLICIES
// ================================================================

const rlsPolicies = [
  'ALTER TABLE skills_master ENABLE ROW LEVEL SECURITY;',
  'ALTER TABLE student_skill_progress ENABLE ROW LEVEL SECURITY;',
  'ALTER TABLE daily_assignments ENABLE ROW LEVEL SECURITY;',
  
  `CREATE POLICY IF NOT EXISTS "skills_master_read_policy" 
   ON skills_master FOR SELECT 
   USING (true);`,
   
  `CREATE POLICY IF NOT EXISTS "student_progress_user_policy" 
   ON student_skill_progress FOR ALL 
   USING (auth.uid()::text = student_id OR auth.jwt() ->> 'role' = 'service_role');`,
   
  `CREATE POLICY IF NOT EXISTS "daily_assignments_user_policy" 
   ON daily_assignments FOR ALL 
   USING (auth.uid()::text = student_id OR auth.jwt() ->> 'role' = 'service_role');`
];

// ================================================================
// EXECUTION
// ================================================================

async function createTables() {
  try {
    console.log(chalk.yellow('📊 Creating skills_master table...'));
    const { error: skillsError } = await supabase.rpc('exec', { 
      query: createSkillsMasterTable 
    });
    
    if (skillsError) {
      console.log(chalk.red('❌ Error creating skills_master:', skillsError.message));
    } else {
      console.log(chalk.green('✅ skills_master table created'));
    }

    console.log(chalk.yellow('📈 Creating student_skill_progress table...'));
    const { error: progressError } = await supabase.rpc('exec', { 
      query: createStudentProgressTable 
    });
    
    if (progressError) {
      console.log(chalk.red('❌ Error creating student_skill_progress:', progressError.message));
    } else {
      console.log(chalk.green('✅ student_skill_progress table created'));
    }

    console.log(chalk.yellow('📅 Creating daily_assignments table...'));
    const { error: assignmentsError } = await supabase.rpc('exec', { 
      query: createDailyAssignmentsTable 
    });
    
    if (assignmentsError) {
      console.log(chalk.red('❌ Error creating daily_assignments:', assignmentsError.message));
    } else {
      console.log(chalk.green('✅ daily_assignments table created'));
    }

    // Create indexes
    console.log(chalk.yellow('🏗️ Creating indexes...'));
    for (const indexSql of createIndexes) {
      const { error } = await supabase.rpc('exec', { query: indexSql });
      if (error) {
        console.log(chalk.red(`❌ Index error: ${error.message}`));
      }
    }
    console.log(chalk.green('✅ Indexes created'));

    // Create RLS policies
    console.log(chalk.yellow('🔒 Setting up RLS policies...'));
    for (const policySql of rlsPolicies) {
      const { error } = await supabase.rpc('exec', { query: policySql });
      if (error) {
        console.log(chalk.red(`❌ RLS policy error: ${error.message}`));
      }
    }
    console.log(chalk.green('✅ RLS policies created'));

    console.log(chalk.green('🎉 Database setup completed successfully!'));

  } catch (error) {
    console.error(chalk.red('💥 Fatal error:'), error);
    process.exit(1);
  }
}

// Alternative approach using raw SQL execution
async function createTablesAlternative() {
  try {
    // First, let's try to execute the SQL directly
    const allSql = [
      createSkillsMasterTable,
      createStudentProgressTable, 
      createDailyAssignmentsTable,
      ...createIndexes,
      ...rlsPolicies
    ];

    console.log(chalk.yellow('🔧 Executing SQL directly...'));
    
    for (let i = 0; i < allSql.length; i++) {
      const sql = allSql[i];
      console.log(chalk.gray(`Executing statement ${i + 1}/${allSql.length}...`));
      
      try {
        // Try using different RPC function names
        let result = await supabase.rpc('exec', { query: sql });
        
        if (result.error && result.error.message.includes('does not exist')) {
          // Try alternative function names
          result = await supabase.rpc('execute_sql', { sql });
        }
        
        if (result.error && result.error.message.includes('does not exist')) {
          result = await supabase.rpc('exec_sql', { sql });
        }
        
        if (result.error) {
          console.log(chalk.yellow(`⚠️ SQL execution warning: ${result.error.message}`));
        }
        
      } catch (error) {
        console.log(chalk.yellow(`⚠️ Could not execute SQL: ${error.message}`));
      }
    }

    console.log(chalk.green('✅ SQL execution completed'));
    
  } catch (error) {
    console.error(chalk.red('💥 Alternative method failed:'), error);
  }
}

// Run both methods
console.log(chalk.blue('Attempting table creation...'));
await createTables();
await createTablesAlternative();

console.log(chalk.blue('\n🔍 Verifying tables were created...'));

// Verify tables exist
const tables = ['skills_master', 'student_skill_progress', 'daily_assignments'];
for (const table of tables) {
  try {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(chalk.red(`❌ Cannot access ${table}: ${error.message}`));
    } else {
      console.log(chalk.green(`✅ ${table} is accessible`));
    }
  } catch (e) {
    console.log(chalk.red(`❌ ${table} verification failed`));
  }
}

console.log(chalk.blue('\n🎯 Next steps:'));
console.log('1. Run: npm run db:check');
console.log('2. Run: npm run db:import-all-early');
console.log('3. Run: npm run db:seed');