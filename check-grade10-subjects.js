import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkGrade10() {
  // Check what subjects exist for Grade 10
  const { data: subjects, error: subjectError } = await supabase
    .from('skills_master_v2')
    .select('subject')
    .eq('grade_level', '10');

  if (subjectError) {
    console.error('Error fetching subjects:', subjectError);
    return;
  }

  const uniqueSubjects = [...new Set(subjects.map(s => s.subject))];
  console.log('Grade 10 subjects in database:', uniqueSubjects);

  // Check a sample of skills for each subject
  for (const subject of uniqueSubjects) {
    const { data: skills, error } = await supabase
      .from('skills_master_v2')
      .select('skill_number, skill_description')
      .eq('grade_level', '10')
      .eq('subject', subject)
      .limit(3);

    if (!error && skills) {
      console.log(`\n${subject} skills (first 3):`);
      skills.forEach(skill => {
        console.log(`  ${skill.skill_number}: ${skill.skill_description}`);
      });
    }
  }
}

checkGrade10();