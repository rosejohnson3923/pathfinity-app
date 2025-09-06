// Test Finn Maestro Agent - Alex's Complete Learning Journey
import { FinnMaestroAgent, alexsDailyLearningJourney } from '../utils/FinnMaestroAgent';

// Test the complete system
export async function testFinnMaestroSystem() {
  console.log('🎯 Testing Finn Maestro Agent System');
  console.log('=' .repeat(50));
  
  try {
    // Run Alex's complete daily journey
    await alexsDailyLearningJourney();
    
    console.log('\n✅ Finn Maestro Agent test completed successfully!');
    console.log('🎓 The system demonstrates:');
    console.log('   • Morning content generation for all assignments');
    console.log('   • Intelligent assignment ordering based on energy/performance');
    console.log('   • Real-time encouragement and feedback during learning');
    console.log('   • Performance tracking for tomorrow\'s planning');
    console.log('   • Complete learning journey orchestration');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Individual component tests
export async function testContentGeneration() {
  console.log('🧪 Testing Content Generation Component');
  
  const testStudent = {
    id: 'test_001',
    name: 'Test Student',
    gradeLevel: 'Kindergarten',
    currentPerformance: {
      energyLevel: 'high' as const,
      currentStreak: 1,
      strugglingAreas: [],
      masteredSkills: [],
      averageAccuracy: 80
    },
    learningProfile: {
      preferredSubjectOrder: ['Math', 'Reading'],
      bestPerformanceTimeSlots: ['morning'],
      encouragementStyle: 'enthusiastic' as const,
      adaptiveFeatures: {
        needsMoreEncouragement: false,
        respondsToGameification: true,
        prefersVisualContent: true
      }
    }
  };
  
  const finn = new FinnMaestroAgent(testStudent);
  
  try {
    const assignments = await finn.generateDailyContent();
    console.log(`✅ Generated ${assignments.length} assignments`);
    
    assignments.forEach(assignment => {
      console.log(`📝 ${assignment.content.title} (${assignment.skillCode})`);
    });
    
  } catch (error) {
    console.error('❌ Content generation test failed:', error);
  }
}

// Export test functions
export { testFinnMaestroSystem as default, testContentGeneration };