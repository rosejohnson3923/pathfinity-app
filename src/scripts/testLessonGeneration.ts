/**
 * Test script for lesson generation
 * Run with: npx ts-node src/scripts/testLessonGeneration.ts
 */

import { lessonOrchestrator } from '../services/orchestration/LessonPlanOrchestrator';

async function testLessonGeneration() {
  console.log('🚀 Starting lesson generation test...\n');

  try {
    // Generate lessons for student "Sam"
    const result = await lessonOrchestrator.generateDailyLessons('student_sam_id');

    console.log('✅ Successfully generated lessons:');
    console.log(`- Total lessons: ${result.lessons.length}`);
    console.log(`- Archives created: ${result.archives.length}\n`);

    // Display lesson details
    result.lessons.forEach((lesson, index) => {
      console.log(`📚 Lesson ${index + 1}:`);
      console.log(`   Subject: ${lesson.curriculum.subject}`);
      console.log(`   Career: ${lesson.career.careerName} ${lesson.career.icon}`);
      console.log(`   Skill: ${lesson.curriculum.skillObjective}`);
      console.log(`   PDF: ${lesson.pdfData.filename}\n`);
    });

    // Show archive URLs
    if (result.archives.length > 0) {
      console.log('📁 Archive URLs:');
      result.archives.forEach((archive) => {
        console.log(`   PDF: ${archive.pdfUrl}`);
        console.log(`   JSON: ${archive.jsonUrl}\n`);
      });
    }

    console.log('✨ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLessonGeneration();