#!/usr/bin/env node

/**
 * Extract A.1 skills for all grades and subjects from skills_master table
 * This script queries the database to get the exact A.1 skills for demo lesson content
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function extractA1Skills() {
  try {
    console.log('🔍 Extracting A.1 skills from skills_master table...\n');

    // Query for A.1 skills across all grades and subjects
    const { data: skills, error } = await supabase
      .from('skills_master')
      .select('*')
      .eq('skill_number', 'A.1')
      .order('subject', { ascending: true })
      .order('grade', { ascending: true });

    if (error) throw error;

    if (!skills || skills.length === 0) {
      console.log('❌ No A.1 skills found in database');
      return;
    }

    console.log(`✅ Found ${skills.length} A.1 skills\n`);

    // Group by grade, then by subject
    const gradeGroups = {};

    skills.forEach(skill => {
      if (!gradeGroups[skill.grade]) {
        gradeGroups[skill.grade] = {};
      }
      gradeGroups[skill.grade][skill.subject] = skill;
    });

    // Display results organized by our demo students
    const demoStudents = [
      { name: 'Sam', grade: 'K', career: 'Chef' },
      { name: 'Alex', grade: '1', career: 'Doctor' },
      { name: 'Jordan', grade: '7', career: 'Game Designer' },
      { name: 'Taylor', grade: '10', career: 'Sports Agent' }
    ];

    console.log('📚 A.1 Skills for Demo Students:\n');
    console.log('='.repeat(80));

    demoStudents.forEach(student => {
      console.log(`\n${student.name} (Grade ${student.grade}) - ${student.career}:`);
      console.log('-'.repeat(50));

      const gradeSkills = gradeGroups[student.grade];
      if (!gradeSkills) {
        console.log(`❌ No Grade ${student.grade} skills found`);
        return;
      }

      ['Math', 'ELA', 'Science', 'Social Studies'].forEach(subject => {
        const skill = gradeSkills[subject];
        if (skill) {
          console.log(`  ${subject} A.1: "${skill.skill_name}"`);
          console.log(`    Description: ${skill.description || 'N/A'}`);
          console.log(`    Skills Area: ${skill.skills_area || 'N/A'}`);
        } else {
          console.log(`  ${subject} A.1: ❌ NOT FOUND`);
        }
      });
    });

    // Export as JSON for use in code
    console.log('\n' + '='.repeat(80));
    console.log('📄 JSON Export for Code:');
    console.log('='.repeat(80));

    const exportData = {};
    demoStudents.forEach(student => {
      const gradeSkills = gradeGroups[student.grade];
      if (gradeSkills) {
        exportData[`${student.name.toLowerCase()}_grade${student.grade}`] = {
          math: gradeSkills['Math'] || null,
          ela: gradeSkills['ELA'] || null,
          science: gradeSkills['Science'] || null,
          social_studies: gradeSkills['Social Studies'] || null
        };
      }
    });

    console.log(JSON.stringify(exportData, null, 2));

  } catch (error) {
    console.error('❌ Error extracting skills:', error);
  }
}

// Run the extraction
extractA1Skills();