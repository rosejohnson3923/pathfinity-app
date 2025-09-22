/**
 * Test utility to verify YouTube search optimization
 * Run this to test video loading for Sam and Taylor
 */

import { YouTubeService } from '../services/content-providers/YouTubeService';
import { SkillOptimizationService } from '../services/SkillOptimizationService';

export async function testVideoOptimization() {
  const youtubeService = new YouTubeService();

  // Test cases for Sam (Kindergarten) and Taylor (Grade 10)
  const testCases = [
    {
      user: 'Sam',
      grade: 'K',
      subject: 'Math',
      skillName: 'Count to 100',
      expectedOptimized: 'counting Math kindergarten'
    },
    {
      user: 'Sam',
      grade: 'K',
      subject: 'Math',
      skillName: 'Identify and describe shapes',
      expectedOptimized: 'shapes Math kindergarten'
    },
    {
      user: 'Taylor',
      grade: '10',
      subject: 'ELA',
      skillName: 'Determine the main idea of a passage',
      expectedOptimized: 'main idea ELA 10th grade'
    },
    {
      user: 'Taylor',
      grade: '10',
      subject: 'Math',
      skillName: 'Solve quadratic equations',
      expectedOptimized: 'equations Math 10th grade'
    }
  ];

  console.log('🧪 Starting Video Optimization Tests...\n');

  for (const test of testCases) {
    console.log(`\n📚 Testing ${test.user} - ${test.skillName}`);
    console.log('━'.repeat(50));

    // Test optimization
    const optimization = SkillOptimizationService.optimizeSkill(
      test.skillName,
      test.subject,
      test.grade
    );

    console.log('✅ Optimization Results:');
    console.log('  Original:', test.skillName);
    console.log('  Optimized:', optimization.youtube_search_terms);
    console.log('  Key Terms:', optimization.simplified_terms);
    console.log('  Expected:', test.expectedOptimized);
    console.log('  Match:', optimization.youtube_search_terms === test.expectedOptimized ? '✅' : '⚠️');

    // Test YouTube search
    try {
      console.log('\n🔍 Searching YouTube...');
      const results = await youtubeService.searchEducationalVideos(
        test.grade,
        test.subject,
        test.skillName
      );

      console.log(`✅ Found ${results.videos.length} videos`);
      if (results.videos.length > 0) {
        console.log('\n📺 Top 3 Results:');
        results.videos.slice(0, 3).forEach((video, index) => {
          console.log(`  ${index + 1}. ${video.title}`);
          console.log(`     Channel: ${video.channelTitle}`);
          console.log(`     Duration: ${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`);
        });
      } else {
        console.log('⚠️ No videos found - check search terms');
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
    }
  }

  console.log('\n\n🎉 Video Optimization Test Complete!');
  console.log('Check the console output above for results.');

  return true;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testVideoOptimization = testVideoOptimization;
  console.log('💡 Test function loaded. Run: testVideoOptimization()');
}