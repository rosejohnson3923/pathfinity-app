#!/usr/bin/env node

/**
 * PLAINVIEW ISD INTELLIGENT TESTBED GENERATOR
 * Creates realistic school district data with Claude.ai generated content
 * 
 * Organizational Structure:
 * - Plainview ISD (District)
 *   - City View High School (9-12) - Mr John Land - Taylor
 *   - Ocean View Middle School (6-8) - Ms Brenda Sea - Jordan  
 *   - Sand View Elementary (Pre-K-5) - Ms Jenna Grain - Alex & Sam
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import chalk from 'chalk';
import { CONTENT_GENERATION_RULES, buildContentPrompt, validateContent } from './content-generation-rules.js';

// Load environment variables
dotenv.config();

// Configuration
const CONFIG = {
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY
  },
  anthropic: {
    apiKey: process.env.VITE_ANTHROPIC_API_KEY
  },
  generation: {
    rateLimitMs: 2000,
    maxRetries: 3,
    outputDir: './plainview-isd-testbed'
  }
};

// Plainview ISD Structure
const PLAINVIEW_ISD = {
  district: {
    id: 'plainview_isd',
    name: 'Plainview ISD',
    type: 'public_school_district',
    location: 'Plainview, TX',
    superintendent: {
      id: 'patricia_williams',
      name: 'Dr. Patricia Williams',
      email: 'superintendent@plainviewisd.edu',
      role: 'district_admin',
      years_experience: 20,
      leadership_style: 'transformational'
    }
  },
  schools: [
    {
      id: 'city_view_high',
      name: 'City View High School',
      grades: ['9', '10', '11', '12'],
      school_type: 'high_school',
      principal: 'Dr. Sarah Martinez',
      teachers: [
        // Mathematics Department
        {
          id: 'john_land',
          name: 'Mr John Land',
          subject_specialties: ['Algebra I', 'Algebra II'],
          grades_taught: ['9', '10', '11'],
          years_experience: 8,
          teaching_style: 'project_based'
        },
        {
          id: 'patricia_summit',
          name: 'Ms Patricia Summit',
          subject_specialties: ['Geometry', 'Pre-Calculus'],
          grades_taught: ['10', '11', '12'],
          years_experience: 10,
          teaching_style: 'analytical'
        },
        {
          id: 'robert_peak',
          name: 'Mr Robert Peak',
          subject_specialties: ['Calculus', 'Statistics'],
          grades_taught: ['11', '12'],
          years_experience: 15,
          teaching_style: 'conceptual'
        },
        // English Department
        {
          id: 'jennifer_slope',
          name: 'Ms Jennifer Slope',
          subject_specialties: ['English I', 'English II'],
          grades_taught: ['9', '10'],
          years_experience: 7,
          teaching_style: 'discussion_based'
        },
        {
          id: 'david_ridge',
          name: 'Mr David Ridge',
          subject_specialties: ['English III', 'English IV'],
          grades_taught: ['11', '12'],
          years_experience: 12,
          teaching_style: 'literature_focused'
        },
        {
          id: 'angela_cliff',
          name: 'Ms Angela Cliff',
          subject_specialties: ['Creative Writing', 'Literature'],
          grades_taught: ['9', '10', '11', '12'],
          years_experience: 9,
          teaching_style: 'creative_expression'
        },
        // Science Department
        {
          id: 'michael_heights',
          name: 'Dr Michael Heights',
          subject_specialties: ['Biology', 'Environmental Science'],
          grades_taught: ['9', '10', '11', '12'],
          years_experience: 18,
          teaching_style: 'inquiry_based'
        },
        {
          id: 'laura_canyon',
          name: 'Ms Laura Canyon',
          subject_specialties: ['Chemistry', 'Physics'],
          grades_taught: ['10', '11', '12'],
          years_experience: 11,
          teaching_style: 'laboratory_focused'
        },
        {
          id: 'steven_mesa',
          name: 'Mr Steven Mesa',
          subject_specialties: ['Anatomy', 'AP Sciences'],
          grades_taught: ['11', '12'],
          years_experience: 14,
          teaching_style: 'advanced_application'
        },
        // Social Studies Department
        {
          id: 'rachel_plateau',
          name: 'Ms Rachel Plateau',
          subject_specialties: ['World History', 'Geography'],
          grades_taught: ['9', '10'],
          years_experience: 6,
          teaching_style: 'visual_storytelling'
        },
        {
          id: 'daniel_bluff',
          name: 'Mr Daniel Bluff',
          subject_specialties: ['US History', 'Government'],
          grades_taught: ['11', '12'],
          years_experience: 13,
          teaching_style: 'civic_engagement'
        },
        {
          id: 'victoria_crest',
          name: 'Ms Victoria Crest',
          subject_specialties: ['Psychology', 'Economics'],
          grades_taught: ['11', '12'],
          years_experience: 8,
          teaching_style: 'real_world_application'
        }
      ],
      students: [
        {
          id: 'taylor_cityview',
          first_name: 'Taylor',
          last_name: 'Johnson',
          display_name: 'Taylor',
          current_grade: '10',
          age: 16,
          learning_preferences: {
            learning_style: 'visual',
            favorite_subjects: ['Math', 'Science'],
            attention_span: 'long',
            collaboration_preference: 'mixed',
            technology_comfort: 'high'
          }
        }
      ]
    },
    {
      id: 'ocean_view_middle',
      name: 'Ocean View Middle School',
      grades: ['6', '7', '8'],
      school_type: 'middle_school',
      principal: 'Ms. Maria Rodriguez',
      teachers: [
        // Core Subject Teachers
        {
          id: 'brenda_sea',
          name: 'Ms Brenda Sea',
          subject_specialties: ['ELA'],
          grades_taught: ['6', '7', '8'],
          years_experience: 12,
          teaching_style: 'collaborative'
        },
        {
          id: 'derek_ocean',
          name: 'Mr Derek Ocean',
          subject_specialties: ['Math'],
          grades_taught: ['6', '7', '8'],
          years_experience: 9,
          teaching_style: 'step_by_step'
        },
        {
          id: 'sandra_wave',
          name: 'Ms Sandra Wave',
          subject_specialties: ['Science'],
          grades_taught: ['6', '7', '8'],
          years_experience: 8,
          teaching_style: 'experimental'
        },
        {
          id: 'tony_bay',
          name: 'Mr Tony Bay',
          subject_specialties: ['Social Studies'],
          grades_taught: ['6', '7', '8'],
          years_experience: 11,
          teaching_style: 'historical_connections'
        },
        // Specialist Teachers
        {
          id: 'kelly_tide',
          name: 'Ms Kelly Tide',
          subject_specialties: ['Art'],
          grades_taught: ['6', '7', '8'],
          years_experience: 7,
          teaching_style: 'creative_exploration'
        },
        {
          id: 'steve_coral',
          name: 'Mr Steve Coral',
          subject_specialties: ['Physical Education'],
          grades_taught: ['6', '7', '8'],
          years_experience: 15,
          teaching_style: 'active_participation'
        },
        {
          id: 'nancy_shell',
          name: 'Ms Nancy Shell',
          subject_specialties: ['Technology', 'Computer Science'],
          grades_taught: ['6', '7', '8'],
          years_experience: 5,
          teaching_style: 'hands_on_technology'
        }
      ],
      students: [
        {
          id: 'jordan_oceanview',
          first_name: 'Jordan',
          last_name: 'Smith',
          display_name: 'Jordan',
          current_grade: '7',
          age: 13,
          learning_preferences: {
            learning_style: 'auditory',
            favorite_subjects: ['ELA', 'Social Studies'],
            attention_span: 'medium',
            collaboration_preference: 'group_work',
            technology_comfort: 'medium'
          }
        }
      ]
    },
    {
      id: 'sand_view_elementary',
      name: 'Sand View Elementary School',
      grades: ['Pre-K', 'K', '1', '2', '3', '4', '5'],
      school_type: 'elementary_school',
      principal: 'Mr. David Wilson',
      teachers: [
        // Core Subject Teachers
        {
          id: 'jenna_grain',
          name: 'Ms Jenna Grain',
          subject_specialties: ['Math'],
          grades_taught: ['Pre-K', 'K', '1', '2', '3', '4', '5'],
          years_experience: 6,
          teaching_style: 'hands_on'
        },
        {
          id: 'marcus_river',
          name: 'Mr Marcus River',
          subject_specialties: ['ELA'],
          grades_taught: ['Pre-K', 'K', '1', '2', '3', '4', '5'],
          years_experience: 8,
          teaching_style: 'phonics_focused'
        },
        {
          id: 'diana_forest',
          name: 'Ms Diana Forest',
          subject_specialties: ['Science'],
          grades_taught: ['Pre-K', 'K', '1', '2', '3', '4', '5'],
          years_experience: 5,
          teaching_style: 'discovery_based'
        },
        {
          id: 'rosa_valley',
          name: 'Ms Rosa Valley',
          subject_specialties: ['Social Studies'],
          grades_taught: ['3', '4', '5'],
          years_experience: 10,
          teaching_style: 'community_connected'
        },
        // Specialist Teachers
        {
          id: 'james_creek',
          name: 'Mr James Creek',
          subject_specialties: ['Art'],
          grades_taught: ['Pre-K', 'K', '1', '2', '3', '4', '5'],
          years_experience: 12,
          teaching_style: 'creative_expression'
        },
        {
          id: 'lisa_mountain',
          name: 'Ms Lisa Mountain',
          subject_specialties: ['Physical Education'],
          grades_taught: ['Pre-K', 'K', '1', '2', '3', '4', '5'],
          years_experience: 9,
          teaching_style: 'movement_based'
        },
        {
          id: 'carlos_stone',
          name: 'Mr Carlos Stone',
          subject_specialties: ['Music'],
          grades_taught: ['Pre-K', 'K', '1', '2', '3', '4', '5'],
          years_experience: 7,
          teaching_style: 'rhythm_and_melody'
        }
      ],
      students: [
        {
          id: 'alex_sandview',
          first_name: 'Alex',
          last_name: 'Davis',
          display_name: 'Alex',
          current_grade: '1',
          age: 7,
          learning_preferences: {
            learning_style: 'kinesthetic',
            favorite_subjects: ['Math', 'Science'],
            attention_span: 'short',
            collaboration_preference: 'individual',
            technology_comfort: 'beginner'
          }
        },
        {
          id: 'sam_sandview',
          first_name: 'Sam',
          last_name: 'Brown',
          display_name: 'Sam',
          current_grade: 'K',
          age: 6,
          learning_preferences: {
            learning_style: 'visual',
            favorite_subjects: ['ELA', 'Art'],
            attention_span: 'short',
            collaboration_preference: 'small_groups',
            technology_comfort: 'beginner'
          }
        }
      ]
    }
  ]
};

// Subject mappings by grade level
const SUBJECTS_BY_GRADE = {
  'Pre-K': ['Math', 'Science', 'ELA'],
  'K': ['Math', 'Science', 'ELA'],
  '1': ['Math', 'Science', 'ELA'],
  '2': ['Math', 'Science', 'ELA'],
  '3': ['Math', 'Science', 'ELA', 'Social Studies'],
  '4': ['Math', 'Science', 'ELA', 'Social Studies'],
  '5': ['Math', 'Science', 'ELA', 'Social Studies'],
  '6': ['Math', 'Science', 'ELA', 'Social Studies'],
  '7': ['Math', 'Science', 'ELA', 'Social Studies'],
  '8': ['Math', 'Science', 'ELA', 'Social Studies'],
  '9': ['Algebra I', 'Biology', 'English I', 'World History'],
  '10': ['Geometry', 'Chemistry', 'English II', 'World Geography'],
  '11': ['Algebra II', 'Physics', 'English III', 'US History'],
  '12': ['Pre-Calculus', 'Environmental Science', 'English IV', 'Government']
};

class PlainviewISDTestbed {
  constructor() {
    this.supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);
    this.anthropic = new Anthropic({ apiKey: CONFIG.anthropic.apiKey });
    this.generatedData = {
      schools: [],
      teachers: [],
      students: [],
      content: [],
      questions: [],
      sessions: [],
      analytics: []
    };
  }

  /**
   * Generate complete Plainview ISD testbed
   */
  async generateCompleteTestbed() {
    console.log(chalk.blue('🏫 Generating Plainview ISD Intelligent Testbed\n'));
    
    try {
      // 1. Create organizational structure
      await this.createOrganizationalStructure();
      
      // For now, skip Claude API content generation and focus on structure verification
      console.log(chalk.yellow('\n📋 Skipping Claude API content generation (no API key configured)'));
      console.log(chalk.yellow('🔍 Focusing on organizational structure verification...\n'));
      
      // Generate sample analytics data to demonstrate the structure
      await this.generateSampleAnalyticsData();
      
      // 5. Save organizational data  
      await this.saveStructuralData();
      
      console.log(chalk.green('\n🎉 Plainview ISD Structure Generation Complete!'));
      this.printStructureSummary();
      
    } catch (error) {
      console.error(chalk.red(`❌ Generation failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Create school district organizational structure
   */
  async createOrganizationalStructure() {
    console.log(chalk.yellow('🏢 Creating organizational structure...'));
    
    // Create district admin data
    const superintendent = PLAINVIEW_ISD.district.superintendent;
    this.generatedData.teachers.push({
      id: superintendent.id,
      name: superintendent.name,
      email: superintendent.email,
      role: superintendent.role,
      district_id: PLAINVIEW_ISD.district.id,
      district_name: PLAINVIEW_ISD.district.name,
      school_id: null, // District-level, not school-specific
      school_name: 'District Office',
      subject_specialties: ['Administration', 'Policy', 'Strategic Planning'],
      grades_taught: ['All'],
      years_experience: superintendent.years_experience,
      teaching_style: superintendent.leadership_style,
      created_at: new Date().toISOString()
    });
    
    // Create schools data
    for (const school of PLAINVIEW_ISD.schools) {
      this.generatedData.schools.push({
        id: school.id,
        name: school.name,
        district_id: PLAINVIEW_ISD.district.id,
        district_name: PLAINVIEW_ISD.district.name,
        school_type: school.school_type,
        grade_levels: school.grades,
        principal_name: school.principal,
        created_at: new Date().toISOString()
      });

      // Create principal data for each school
      const principalId = `${school.id}_principal`;
      this.generatedData.teachers.push({
        id: principalId,
        name: school.principal,
        email: `principal@${school.id.replace(/_/g, '')}.edu`,
        role: 'school_admin',
        district_id: PLAINVIEW_ISD.district.id,
        district_name: PLAINVIEW_ISD.district.name,
        school_id: school.id,
        school_name: school.name,
        subject_specialties: ['Administration', 'Leadership', 'Curriculum'],
        grades_taught: school.grades,
        years_experience: 12 + Math.floor(Math.random() * 8), // 12-20 years
        teaching_style: 'instructional_leadership',
        created_at: new Date().toISOString()
      });

      // Create teachers data
      for (const teacher of school.teachers) {
        this.generatedData.teachers.push({
          id: teacher.id,
          name: teacher.name,
          school_id: school.id,
          school_name: school.name,
          subject_specialties: teacher.subject_specialties,
          grades_taught: teacher.grades_taught,
          years_experience: teacher.years_experience,
          teaching_style: teacher.teaching_style,
          created_at: new Date().toISOString()
        });
      }

      // Create students data with subject-specific teacher assignments
      for (const student of school.students) {
        // Create student-teacher relationships for each subject they study
        const subjects = SUBJECTS_BY_GRADE[student.current_grade] || ['Math', 'Science', 'ELA'];
        
        // For each subject, find the appropriate teacher
        for (const subject of subjects) {
          const subjectTeacher = this.findTeacherForSubject(school.teachers, subject, student.current_grade);
          
          if (subjectTeacher) {
            this.generatedData.students.push({
              id: `${student.id}_${subject.toLowerCase().replace(/\s+/g, '_')}`,
              user_id: `test_user_${student.id}`,
              first_name: student.first_name,
              last_name: student.last_name,
              display_name: student.display_name,
              grade_level: student.current_grade,
              age: student.age,
              school_id: school.id,
              school_name: school.name,
              subject: subject,
              teacher_id: subjectTeacher.id,
              teacher_name: subjectTeacher.name,
              learning_preferences: student.learning_preferences,
              enrollment_date: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 1 year ago
              is_active: true,
              created_at: new Date().toISOString()
            });
          }
        }
      }
    }

    console.log(chalk.green(`✅ Created structure: ${this.generatedData.schools.length} schools, ${this.generatedData.teachers.length} teachers (including 1 district admin, 3 school admins), ${this.generatedData.students.length} student-teacher assignments`));
  }

  /**
   * Generate educational content for each student based on their grade level
   */
  async generateStudentContent() {
    console.log(chalk.yellow('\n📚 Generating personalized educational content...'));
    
    for (const student of this.generatedData.students) {
      const subjects = SUBJECTS_BY_GRADE[student.grade_level] || ['Math', 'Science', 'ELA'];
      
      console.log(chalk.blue(`  Generating content for ${student.display_name} (Grade ${student.grade_level})...`));
      
      for (const subject of subjects) {
        // Generate content for each learning container
        const learnContent = await this.generateLearnContent(student, subject);
        const experienceContent = await this.generateExperienceContent(student, subject);
        const discoverContent = await this.generateDiscoverContent(student, subject);
        
        this.generatedData.content.push(...learnContent, ...experienceContent, ...discoverContent);
        
        // Generate questions for the content
        const questions = await this.generateQuestionsForContent([...learnContent, ...experienceContent, ...discoverContent]);
        this.generatedData.questions.push(...questions);
        
        // Rate limiting
        await this.delay(CONFIG.generation.rateLimitMs);
      }
    }

    console.log(chalk.green(`✅ Generated ${this.generatedData.content.length} content items and ${this.generatedData.questions.length} questions`));
  }

  /**
   * Generate Learn container content personalized for student
   */
  async generateLearnContent(student, subject) {
    const grade = student.grade_level;
    const textRules = CONTENT_GENERATION_RULES.text_guidelines[grade];
    const visualRules = CONTENT_GENERATION_RULES.visual_guidelines[grade];
    
    const prompt = buildContentPrompt(student, subject, 'Learn container instruction') + `

SUBJECT: ${subject}
CONTAINER: Learn (Traditional/Abstract Learning)

Create 2 pieces of content following ALL rules above:

1. INSTRUCTION - Teaching content with precise word limits
2. PRACTICE - Interactive exercises matching attention span

CRITICAL REQUIREMENTS:
- INSTRUCTION text must be under ${textRules.word_count_max} words
- Each sentence maximum ${textRules.sentence_length_max} words
- Maximum ${textRules.instruction_steps_max} instruction steps
- Include ${visualRules.images_per_instruction} visual descriptions if images required
- Reading level: ${textRules.reading_level}

Return ONLY valid JSON:
{
  "content": [
    {
      "content_type": "instruction",
      "title": "...",
      "skill_code": "...",
      "difficulty_level": 1-10,
      "estimated_duration_minutes": 5-${textRules.instruction_steps_max * 2},
      "word_count": 0,
      "reading_level": ${textRules.reading_level},
      "content_data": {
        "learning_objectives": ["..."],
        "instruction_steps": ["..."],
        "visual_elements": ${visualRules.images_required ? '["..."]' : '[]'},
        "vocabulary_level": "${textRules.vocabulary_level}",
        "personalization_notes": "Grade ${grade} content adapted for ${student.learning_preferences.learning_style} learner"
      },
      "personalization": {
        "learning_style_adaptations": ["..."],
        "attention_span_considerations": ["..."],
        "technology_integration": "..."
      },
      "content_validation": {
        "grade_appropriate": true,
        "word_count_compliant": true,
        "reading_level_appropriate": true
      }
    },
    {
      "content_type": "practice",
      "title": "...",
      "skill_code": "...",
      "difficulty_level": 1-10,
      "estimated_duration_minutes": 5-15,
      "word_count": 0,
      "content_data": {
        "practice_activities": ["..."],
        "interaction_frequency": "every_${student.learning_preferences.attention_span === 'short' ? '30_seconds' : student.learning_preferences.attention_span === 'medium' ? '2_minutes' : '5_minutes'}",
        "success_criteria": ["..."]
      }
    }
  ]
}`;

    const response = await this.callClaudeAPI(prompt);
    const content = this.addStudentMetadata(response.content || [], student, subject, 'learn');
    
    // Validate generated content against rules
    for (const item of content) {
      const validation = validateContent(item, student.grade_level, student.learning_preferences.learning_style, student.learning_preferences.attention_span);
      if (!validation.valid) {
        console.log(chalk.yellow(`⚠️  Content validation warnings for ${student.display_name} ${subject}:`));
        validation.errors.forEach(error => console.log(chalk.red(`   ❌ ${error}`)));
        validation.warnings.forEach(warning => console.log(chalk.yellow(`   ⚠️  ${warning}`)));
      }
      
      // Add validation results to content
      item.validation_results = validation;
    }
    
    return content;
  }

  /**
   * Generate Experience container content
   */
  async generateExperienceContent(student, subject) {
    const prompt = `Generate Experience container career content for this student:

STUDENT PROFILE:
- Name: ${student.display_name}  
- Grade: ${student.grade_level}
- Learning Style: ${student.learning_preferences.learning_style}
- Collaboration Preference: ${student.learning_preferences.collaboration_preference}
- Favorite Subjects: ${student.learning_preferences.favorite_subjects.join(', ')}

CONTENT REQUIREMENTS:
Subject: ${subject}
Container: Experience (Career-based Applied Learning)

Create 1 career scenario that:
- Connects to their favorite subjects: ${student.learning_preferences.favorite_subjects.join(', ')}
- Matches collaboration preference: ${student.learning_preferences.collaboration_preference}
- Is engaging for Grade ${student.grade_level}

Return ONLY valid JSON:
{
  "scenarios": [
    {
      "career_id": "...",
      "career_name": "...",
      "scenario_title": "...",
      "scenario_description": "...",
      "tasks": [...],
      "personalization": {
        "why_chosen": "Selected because student likes ${student.learning_preferences.favorite_subjects.join(' and ')}",
        "collaboration_match": "Designed for ${student.learning_preferences.collaboration_preference} preference"
      }
    }
  ]
}`;

    const response = await this.callClaudeAPI(prompt);
    return this.addStudentMetadata(response.scenarios || [], student, subject, 'experience');
  }

  /**
   * Generate Discover container content
   */
  async generateDiscoverContent(student, subject) {
    const prompt = `Generate Discover container narrative content for this student:

STUDENT PROFILE:
- Name: ${student.display_name}
- Grade: ${student.grade_level}  
- Age: ${student.age}
- Learning Style: ${student.learning_preferences.learning_style}

Create 1 engaging story for ${subject} that:
- Features a protagonist similar to ${student.display_name}
- Is age-appropriate for ${student.age} year old
- Integrates ${subject} skills naturally
- Matches Grade ${student.grade_level} complexity

Return ONLY valid JSON:
{
  "narratives": [
    {
      "title": "...",
      "theme": "...",
      "story_elements": {
        "introduction": "...",
        "main_story": "...",
        "climax": "...",
        "resolution": "..."
      },
      "personalization": {
        "protagonist_connection": "Features character similar to ${student.display_name}",
        "age_appropriateness": "Designed for ${student.age} year old"
      }
    }
  ]
}`;

    const response = await this.callClaudeAPI(prompt);
    return this.addStudentMetadata(response.narratives || [], student, subject, 'discover');
  }

  /**
   * Generate realistic learning sessions and activity data
   */
  async generateLearningActivities() {
    console.log(chalk.yellow('\n📊 Generating realistic learning activity data...'));
    
    // Generate 3 months of learning sessions for each student
    const months = 3;
    const sessionsPerWeek = 5;
    const totalSessions = months * 4 * sessionsPerWeek;
    
    for (const student of this.generatedData.students) {
      console.log(chalk.blue(`  Generating ${totalSessions} sessions for ${student.display_name}...`));
      
      const studentContent = this.generatedData.content.filter(c => c.student_id === student.id);
      
      for (let i = 0; i < totalSessions; i++) {
        const sessionDate = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)); // Going back in time
        const content = studentContent[Math.floor(Math.random() * studentContent.length)];
        
        if (content) {
          const session = this.generateRealisticSession(student, content, sessionDate);
          this.generatedData.sessions.push(session);
        }
      }
    }
    
    console.log(chalk.green(`✅ Generated ${this.generatedData.sessions.length} learning sessions`));
  }

  /**
   * Generate a realistic learning session based on student profile
   */
  generateRealisticSession(student, content, sessionDate) {
    const baseSuccessRate = this.getStudentSuccessRate(student, content.subject);
    const sessionLength = this.getTypicalSessionLength(student);
    const questionsCount = Math.floor(sessionLength / 3); // Roughly 1 question per 3 minutes
    
    const questionsCorrect = Math.floor(questionsCount * baseSuccessRate);
    const engagement = this.calculateEngagementScore(student, content);
    
    return {
      id: `session_${student.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      student_id: student.user_id,
      student_name: student.display_name,
      content_id: content.id,
      session_type: content.learning_container,
      subject: content.subject,
      grade_level: student.grade_level,
      
      // Timing
      started_at: sessionDate.toISOString(),
      ended_at: new Date(sessionDate.getTime() + (sessionLength * 60 * 1000)).toISOString(),
      total_duration_seconds: sessionLength * 60,
      active_engagement_seconds: Math.floor(sessionLength * 60 * engagement),
      
      // Performance
      completion_status: 'completed',
      completion_percentage: 100,
      questions_attempted: questionsCount,
      questions_correct: questionsCorrect,
      score: Math.round((questionsCorrect / questionsCount) * 100),
      
      // Learning context
      learning_context_preference: this.mapLearningStyle(student.learning_preferences.learning_style),
      help_requests_count: Math.floor(Math.random() * 3),
      hint_usage_count: Math.floor(Math.random() * 2),
      engagement_score: engagement,
      
      created_at: sessionDate.toISOString()
    };
  }

  /**
   * Generate analytics data for teachers and admins
   */
  async generateAnalyticsData() {
    console.log(chalk.yellow('\n📈 Generating analytics data...'));
    
    for (const student of this.generatedData.students) {
      const studentSessions = this.generatedData.sessions.filter(s => s.student_id === student.user_id);
      
      const analytics = {
        id: `analytics_${student.id}`,
        student_id: student.user_id,
        student_name: student.display_name,
        grade_level: student.grade_level,
        school_id: student.school_id,
        teacher_id: student.teacher_id,
        
        // Learning preferences (calculated from sessions)
        preferred_learning_context: this.mapLearningStyle(student.learning_preferences.learning_style),
        visual_learning_score: student.learning_preferences.learning_style === 'visual' ? 0.9 : 0.5,
        auditory_learning_score: student.learning_preferences.learning_style === 'auditory' ? 0.9 : 0.5,
        kinesthetic_learning_score: student.learning_preferences.learning_style === 'kinesthetic' ? 0.9 : 0.5,
        
        // Performance metrics
        mastery_velocity: this.calculateMasteryVelocity(studentSessions),
        retention_rate: 0.75 + (Math.random() * 0.2), // 75-95%
        transfer_ability: 0.6 + (Math.random() * 0.3), // 60-90%
        
        // Engagement patterns
        optimal_session_length_minutes: this.getTypicalSessionLength(student),
        collaboration_preference: this.mapCollaborationPreference(student.learning_preferences.collaboration_preference),
        help_seeking_frequency: 0.2 + (Math.random() * 0.4), // 20-60%
        persistence_score: 0.6 + (Math.random() * 0.4), // 60-100%
        
        // Career interests (based on favorite subjects)
        career_interests: this.generateCareerInterests(student.learning_preferences.favorite_subjects),
        career_exploration_breadth: 0.4 + (Math.random() * 0.4), // 40-80%
        
        last_calculated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      this.generatedData.analytics.push(analytics);
    }
    
    console.log(chalk.green(`✅ Generated analytics for ${this.generatedData.analytics.length} students`));
  }

  /**
   * Save all generated data to database and files
   */
  async saveAllData() {
    console.log(chalk.blue('\n💾 Saving Plainview ISD testbed data...'));
    
    try {
      // Create output directory
      await fs.mkdir(CONFIG.generation.outputDir, { recursive: true });
      
      // Save each data type to files
      for (const [type, data] of Object.entries(this.generatedData)) {
        if (data.length > 0) {
          const filename = `plainview_isd_${type}.json`;
          const filepath = `${CONFIG.generation.outputDir}/${filename}`;
          await fs.writeFile(filepath, JSON.stringify(data, null, 2));
          console.log(chalk.green(`✅ Saved ${data.length} ${type} items to ${filename}`));
        }
      }
      
      // Save summary report
      const summary = this.generateSummaryReport();
      await fs.writeFile(
        `${CONFIG.generation.outputDir}/plainview_isd_summary.json`,
        JSON.stringify(summary, null, 2)
      );
      
      console.log(chalk.green('✅ All data saved successfully'));
      
    } catch (error) {
      console.error(chalk.red(`❌ Save failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Utility methods
   */
  async callClaudeAPI(prompt, retries = 0) {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      
      return JSON.parse(jsonMatch[0]);
      
    } catch (error) {
      if (retries < CONFIG.generation.maxRetries) {
        await this.delay(CONFIG.generation.rateLimitMs * (retries + 1));
        return this.callClaudeAPI(prompt, retries + 1);
      }
      throw error;
    }
  }

  addStudentMetadata(items, student, subject, container) {
    return items.map((item, index) => ({
      id: `${container}_${student.id}_${subject}_${Date.now()}_${index}`,
      ...item,
      student_id: student.id,
      student_name: student.display_name,
      grade_level: student.grade_level,
      subject: subject,
      learning_container: container,
      school_id: student.school_id,
      teacher_id: student.teacher_id,
      created_at: new Date().toISOString()
    }));
  }

  async generateQuestionsForContent(contentItems) {
    // Simplified for this example - generate 2-3 questions per content item
    const questions = [];
    for (const content of contentItems.slice(0, 3)) { // Limit for demo
      questions.push({
        id: `question_${content.id}_${Math.random().toString(36).substr(2, 9)}`,
        content_id: content.id,
        question_text: `Sample question for ${content.title}`,
        question_type: 'multiple_choice',
        correct_answer: 'A',
        answer_options: ['A) Correct answer', 'B) Wrong answer', 'C) Another wrong', 'D) Also wrong'],
        explanation: 'This is the correct answer because...',
        learning_container: content.learning_container,
        skill_code: content.skill_code || 'general',
        grade_level: content.grade_level,
        subject: content.subject,
        created_at: new Date().toISOString()
      });
    }
    return questions;
  }

  // Helper methods for realistic data generation
  getStudentSuccessRate(student, subject) {
    const favorites = student.learning_preferences.favorite_subjects;
    const baseRate = favorites.includes(subject) ? 0.8 : 0.7;
    return baseRate + (Math.random() * 0.2 - 0.1); // ±10% variation
  }

  getTypicalSessionLength(student) {
    const spanMap = { 'short': 10, 'medium': 20, 'long': 30 };
    return spanMap[student.learning_preferences.attention_span] || 20;
  }

  calculateEngagementScore(student, content) {
    let base = 0.7;
    if (student.learning_preferences.favorite_subjects.includes(content.subject)) base += 0.2;
    if (content.learning_container === 'experience' && student.learning_preferences.collaboration_preference === 'group_work') base += 0.1;
    return Math.min(1.0, base + (Math.random() * 0.2 - 0.1));
  }

  calculateMasteryVelocity(sessions) {
    if (sessions.length === 0) return 0;
    const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
    const avgScore = totalScore / sessions.length;
    return avgScore / 100 * 2; // Convert to skills per hour estimate
  }

  mapLearningStyle(style) {
    const map = { 'visual': 'abstract', 'auditory': 'applied', 'kinesthetic': 'applied' };
    return map[style] || 'abstract';
  }

  mapCollaborationPreference(pref) {
    const map = { 'individual': 0.2, 'small_groups': 0.6, 'group_work': 0.9, 'mixed': 0.5 };
    return map[pref] || 0.5;
  }

  generateCareerInterests(favoriteSubjects) {
    const interests = {};
    const careerMap = {
      'Math': ['engineering', 'finance', 'data_science'],
      'Science': ['medicine', 'research', 'environmental'],
      'ELA': ['journalism', 'education', 'creative_writing'],
      'Social Studies': ['law', 'politics', 'social_work']
    };
    
    favoriteSubjects.forEach(subject => {
      const careers = careerMap[subject] || [];
      careers.forEach(career => {
        interests[career] = 0.6 + (Math.random() * 0.4); // 60-100% interest
      });
    });
    
    return interests;
  }

  generateSummaryReport() {
    return {
      district: PLAINVIEW_ISD.district,
      generation_timestamp: new Date().toISOString(),
      statistics: {
        schools: this.generatedData.schools.length,
        teachers: this.generatedData.teachers.length,
        students: this.generatedData.students.length,
        content_items: this.generatedData.content.length,
        assessment_questions: this.generatedData.questions.length,
        learning_sessions: this.generatedData.sessions.length,
        analytics_profiles: this.generatedData.analytics.length
      },
      schools_breakdown: PLAINVIEW_ISD.schools.map(school => ({
        name: school.name,
        grades: school.grades,
        teachers: school.teachers.length,
        students: school.students.length
      }))
    };
  }

  printSummary() {
    const stats = this.generateSummaryReport().statistics;
    
    console.log(chalk.blue('\n📊 PLAINVIEW ISD TESTBED SUMMARY'));
    console.log(chalk.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.green(`🏫 Schools: ${stats.schools}`));
    console.log(chalk.green(`👨‍🏫 Teachers: ${stats.teachers}`));
    console.log(chalk.green(`👩‍🎓 Students: ${stats.students}`));
    console.log(chalk.green(`📚 Content Items: ${stats.content_items}`));
    console.log(chalk.green(`❓ Questions: ${stats.assessment_questions}`));
    console.log(chalk.green(`📊 Learning Sessions: ${stats.learning_sessions}`));
    console.log(chalk.green(`📈 Analytics Profiles: ${stats.analytics_profiles}`));
    console.log(chalk.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.yellow('🎯 Ready for Teacher/Admin Dashboard Testing!'));
  }

  /**
   * Generate sample analytics data to demonstrate teacher-student relationships
   */
  async generateSampleAnalyticsData() {
    console.log(chalk.yellow('📊 Generating sample analytics data...'));
    
    for (const studentRecord of this.generatedData.students) {
      const analytics = {
        id: `analytics_${studentRecord.id}`,
        student_id: studentRecord.user_id,
        student_name: studentRecord.display_name,
        grade_level: studentRecord.grade_level,
        subject: studentRecord.subject,
        school_id: studentRecord.school_id,
        teacher_id: studentRecord.teacher_id,
        teacher_name: studentRecord.teacher_name,
        
        // Sample performance metrics
        average_score: 75 + Math.floor(Math.random() * 20), // 75-95%
        engagement_score: 0.7 + (Math.random() * 0.3), // 70-100%
        sessions_completed: Math.floor(Math.random() * 50) + 10, // 10-60 sessions
        
        // Learning preferences (from student profile)
        learning_style: studentRecord.learning_preferences.learning_style,
        attention_span: studentRecord.learning_preferences.attention_span,
        collaboration_preference: studentRecord.learning_preferences.collaboration_preference,
        
        created_at: new Date().toISOString()
      };
      
      this.generatedData.analytics.push(analytics);
    }
    
    console.log(chalk.green(`✅ Generated analytics for ${this.generatedData.analytics.length} student-teacher-subject combinations`));
  }

  /**
   * Save structural data to files (without database operations)
   */
  async saveStructuralData() {
    console.log(chalk.blue('\n💾 Saving Plainview ISD structure data...'));
    
    try {
      // Create output directory
      await fs.mkdir(CONFIG.generation.outputDir, { recursive: true });
      
      // Save each data type to files
      for (const [type, data] of Object.entries(this.generatedData)) {
        if (data.length > 0) {
          const filename = `plainview_isd_${type}.json`;
          const filepath = `${CONFIG.generation.outputDir}/${filename}`;
          await fs.writeFile(filepath, JSON.stringify(data, null, 2));
          console.log(chalk.green(`✅ Saved ${data.length} ${type} items to ${filename}`));
        }
      }
      
      // Save summary report
      const summary = this.generateStructureSummary();
      await fs.writeFile(
        `${CONFIG.generation.outputDir}/plainview_isd_structure_summary.json`,
        JSON.stringify(summary, null, 2)
      );
      
      console.log(chalk.green('✅ All structural data saved successfully'));
      
    } catch (error) {
      console.error(chalk.red(`❌ Save failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Generate summary report focused on structure
   */
  generateStructureSummary() {
    return {
      district: PLAINVIEW_ISD.district,
      generation_timestamp: new Date().toISOString(),
      structure_focus: 'teacher_subject_specialization',
      statistics: {
        schools: this.generatedData.schools.length,
        teachers: this.generatedData.teachers.length,
        student_teacher_assignments: this.generatedData.students.length,
        analytics_profiles: this.generatedData.analytics.length
      },
      schools_breakdown: PLAINVIEW_ISD.schools.map(school => ({
        name: school.name,
        grades: school.grades,
        teachers: school.teachers.length,
        teacher_specializations: school.teachers.map(t => ({
          name: t.name,
          subjects: t.subject_specialties,
          grades: t.grades_taught
        })),
        students: school.students.length
      })),
      teacher_student_relationships: this.generatedData.students.map(s => ({
        student: s.display_name,
        grade: s.grade_level,
        subject: s.subject,
        teacher: s.teacher_name,
        school: s.school_name
      }))
    };
  }

  /**
   * Print structure-focused summary
   */
  printStructureSummary() {
    const stats = this.generateStructureSummary().statistics;
    
    console.log(chalk.blue('\n📊 PLAINVIEW ISD STRUCTURE SUMMARY'));
    console.log(chalk.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.green(`🏫 Schools: ${stats.schools}`));
    console.log(chalk.green(`👨‍🏫 Specialized Teachers: ${stats.teachers}`));
    console.log(chalk.green(`👩‍🎓 Student-Teacher-Subject Assignments: ${stats.student_teacher_assignments}`));
    console.log(chalk.green(`📈 Analytics Profiles: ${stats.analytics_profiles}`));
    console.log(chalk.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    
    // Show district leadership
    console.log(chalk.blue('\n🏛️ DISTRICT LEADERSHIP:'));
    console.log(chalk.yellow(`${PLAINVIEW_ISD.district.name}:`));
    console.log(chalk.white(`  • ${PLAINVIEW_ISD.district.superintendent.name} - Superintendent`));
    
    // Show school leadership
    console.log(chalk.blue('\n🏫 SCHOOL LEADERSHIP:'));
    for (const school of PLAINVIEW_ISD.schools) {
      console.log(chalk.yellow(`${school.name}:`));
      console.log(chalk.white(`  • ${school.principal} - Principal`));
    }
    
    // Show detailed teacher specializations
    console.log(chalk.blue('\n👨‍🏫 TEACHER SPECIALIZATIONS:'));
    for (const school of PLAINVIEW_ISD.schools) {
      console.log(chalk.yellow(`\n${school.name}:`));
      for (const teacher of school.teachers) {
        console.log(chalk.white(`  • ${teacher.name} - ${teacher.subject_specialties.join(', ')} (Grades ${teacher.grades_taught.join(', ')})`));
      }
    }
    
    // Show student-teacher assignments
    console.log(chalk.blue('\n👩‍🎓 STUDENT-TEACHER ASSIGNMENTS:'));
    const assignmentsByStudent = {};
    for (const assignment of this.generatedData.students) {
      if (!assignmentsByStudent[assignment.display_name]) {
        assignmentsByStudent[assignment.display_name] = [];
      }
      assignmentsByStudent[assignment.display_name].push(assignment);
    }
    
    for (const [studentName, assignments] of Object.entries(assignmentsByStudent)) {
      const firstAssignment = assignments[0];
      console.log(chalk.yellow(`\n${studentName} (Grade ${firstAssignment.grade_level}, ${firstAssignment.school_name}):`));
      for (const assignment of assignments) {
        console.log(chalk.white(`  • ${assignment.subject}: ${assignment.teacher_name}`));
      }
    }
    
    console.log(chalk.white('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.yellow('🎯 Realistic Teacher-Subject Specialization Complete!'));
    console.log(chalk.yellow('📊 Ready for Teacher/Admin Dashboard Testing!'));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Find the appropriate teacher for a subject and grade level
   */
  findTeacherForSubject(teachers, subject, grade) {
    // Map general subjects to specific grade-level subjects
    const subjectMap = {
      'Math': {
        'Pre-K': 'Math', 'K': 'Math', '1': 'Math', '2': 'Math', '3': 'Math', '4': 'Math', '5': 'Math',
        '6': 'Math', '7': 'Math', '8': 'Math',
        '9': 'Algebra I', '10': 'Geometry', '11': 'Algebra II', '12': 'Pre-Calculus'
      },
      'Science': {
        'Pre-K': 'Science', 'K': 'Science', '1': 'Science', '2': 'Science', '3': 'Science', '4': 'Science', '5': 'Science',
        '6': 'Science', '7': 'Science', '8': 'Science',
        '9': 'Biology', '10': 'Chemistry', '11': 'Physics', '12': 'Environmental Science'
      },
      'ELA': {
        'Pre-K': 'ELA', 'K': 'ELA', '1': 'ELA', '2': 'ELA', '3': 'ELA', '4': 'ELA', '5': 'ELA',
        '6': 'ELA', '7': 'ELA', '8': 'ELA',
        '9': 'English I', '10': 'English II', '11': 'English III', '12': 'English IV'
      },
      'Social Studies': {
        '3': 'Social Studies', '4': 'Social Studies', '5': 'Social Studies',
        '6': 'Social Studies', '7': 'Social Studies', '8': 'Social Studies',
        '9': 'World History', '10': 'Geography', '11': 'US History', '12': 'Government'
      }
    };

    const specificSubject = subjectMap[subject]?.[grade] || subject;

    // Find teacher who teaches this specific subject and grade
    const teacher = teachers.find(teacher => {
      const teachesSubject = teacher.subject_specialties.some(specialty => 
        specialty === specificSubject || specialty === subject
      );
      const teachesGrade = teacher.grades_taught.includes(grade);
      return teachesSubject && teachesGrade;
    });

    // Fallback: find any teacher who teaches this general subject
    if (!teacher && subject !== specificSubject) {
      return teachers.find(teacher => 
        teacher.subject_specialties.includes(subject) && 
        teacher.grades_taught.includes(grade)
      );
    }

    return teacher;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new PlainviewISDTestbed();
  generator.generateCompleteTestbed().catch(console.error);
}

export { PlainviewISDTestbed };