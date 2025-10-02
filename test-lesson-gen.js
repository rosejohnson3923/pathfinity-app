// Test lesson generation directly in Node.js
import { lessonOrchestrator } from './src/services/orchestration/LessonPlanOrchestrator.js';

async function testLessonGeneration() {
  console.log('🚀 Testing lesson generation...\n');

  try {
    // Mock student
    const mockStudent = {
      id: 'test_student_1',
      name: 'Sam',
      gradeLevel: 'K',
      subscription: {
        tier: 'basic',
        boosters: [],
        aiEnabled: false
      }
    };

    // Mock career
    const mockCareer = {
      career_code: 'ELEM_CHEF',
      career_name: 'Chef',
      icon: '👨‍🍳',
      career_category: 'Culinary Arts',
      description: 'create delicious meals'
    };

    // Mock skill
    const mockSkill = {
      subject: 'Math',
      standardCode: 'K.A.1',
      objective: 'Count to 3',
      gradeLevel: 'K'
    };

    console.log('Generating lesson for:');
    console.log('- Student:', mockStudent.name, '(Grade', mockStudent.gradeLevel + ')');
    console.log('- Career:', mockCareer.career_name);
    console.log('- Subject:', mockSkill.subject);
    console.log('- Skill:', mockSkill.objective);
    console.log('');

    // Generate single lesson
    const lesson = await lessonOrchestrator.generateSingleLesson(
      mockStudent,
      mockCareer,
      mockSkill,
      'BASIC_STANDARD'
    );

    console.log('✅ Lesson generated successfully!');
    console.log('- Lesson ID:', lesson.lessonId);
    console.log('- Title:', lesson.content.narrativeContext.title);
    console.log('- Introduction:', lesson.content.narrativeContext.introduction);
    console.log('');

    // Show master narrative excerpt
    const narrative = JSON.parse(lesson.content.narrativeContext.masterNarrative);
    console.log('📖 Master Narrative:');
    console.log('- Character Role:', narrative.character?.role);
    console.log('- Workplace:', narrative.character?.workplace);
    console.log('- Mission:', narrative.cohesiveStory?.mission);
    console.log('');

    return lesson;

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run test
testLessonGeneration()
  .then(() => {
    console.log('🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });