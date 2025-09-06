#!/usr/bin/env node

/**
 * Fix Skills Master Grade Constraint
 * Updates the skills_master table to allow all required grades
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key since service key not in env

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - VITE_SUPABASE_URL');
    console.error('   - VITE_SUPABASE_ANON_KEY (or service role key)');
    process.exit(1);
}

console.log('🔗 Connecting to Supabase database...');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateGradeConstraint() {
    console.log('\n🔧 Updating grade constraint...');
    
    const newGrades = ['Pre-K', 'K', '1', '3', '7', 'Algebra1', 'Precalculus'];
    const gradeCheckClause = `grade IN (${newGrades.map(g => `'${g}'`).join(', ')})`;
    
    console.log(`   New constraint: ${gradeCheckClause}`);
    
    try {
        // Step 1: Drop existing constraint
        console.log('   1. Dropping existing constraint...');
        const { error: dropError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE skills_master DROP CONSTRAINT IF EXISTS skills_master_grade_check;'
        });
        
        if (dropError) {
            console.error('❌ Error dropping constraint:', dropError);
            return false;
        }
        
        // Step 2: Add new constraint
        console.log('   2. Adding new constraint...');
        const { error: addError } = await supabase.rpc('exec_sql', {
            sql: `ALTER TABLE skills_master ADD CONSTRAINT skills_master_grade_check CHECK (${gradeCheckClause});`
        });
        
        if (addError) {
            console.error('❌ Error adding new constraint:', addError);
            return false;
        }
        
        console.log('✅ Constraint updated successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error executing SQL:', error);
        return false;
    }
}

async function testNewConstraint() {
    console.log('\n🧪 Testing new constraint...');
    
    const testGrades = ['Pre-K', 'K', '1', '3', '7', 'Algebra1', 'Precalculus'];
    
    for (const grade of testGrades) {
        console.log(`   Testing grade: ${grade}`);
        
        // Try to insert a test record
        const testSkillNumber = `TEST_${grade}_${Date.now()}`;
        const { error } = await supabase
            .from('skills_master')
            .insert({
                subject: 'Math',
                grade: grade,
                skills_area: 'TEST',
                skills_cluster: 'TEST',
                skill_number: testSkillNumber,
                skill_name: `Test skill for ${grade}`,
                skill_description: 'Test description',
                difficulty_level: 1,
                estimated_time_minutes: 15
            });
        
        if (error) {
            console.error(`   ❌ Failed for grade ${grade}:`, error.message);
        } else {
            console.log(`   ✅ Success for grade ${grade}`);
            
            // Clean up test record
            await supabase
                .from('skills_master')
                .delete()
                .eq('skill_number', testSkillNumber);
        }
    }
}

async function main() {
    try {
        console.log('🚀 Starting Skills Master Constraint Fix');
        console.log('=====================================');
        
        // Update constraint
        const success = await updateGradeConstraint();
        if (!success) {
            console.log('\n❌ Constraint update failed. You may need to run the SQL migration manually.');
            console.log('Use this SQL command:');
            console.log('ALTER TABLE skills_master DROP CONSTRAINT IF EXISTS skills_master_grade_check;');
            console.log('ALTER TABLE skills_master ADD CONSTRAINT skills_master_grade_check CHECK (grade IN (\'Pre-K\', \'K\', \'1\', \'3\', \'7\', \'Algebra1\', \'Precalculus\'));');
            process.exit(1);
        }
        
        // Verify the update worked
        await testNewConstraint();
        
        console.log('\n🎉 Skills Master constraint fix completed successfully!');
        console.log('   You can now import skills for grades: Pre-K, K, 1, 3, 7, Algebra1, Precalculus');
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
    }
}

// Run the script
main();