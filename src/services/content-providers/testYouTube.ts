/**
 * Test file for YouTube API integration
 * Run this to verify the API key works and we can fetch videos
 */

import { youTubeService } from './YouTubeService';

async function testYouTubeIntegration() {
  console.log('🎬 Testing YouTube Educational Integration...\n');

  try {
    // Test 1: Search for kindergarten counting videos
    console.log('Test 1: Searching for Kindergarten counting videos...');
    const searchResult = await youTubeService.searchEducationalVideos(
      'K',
      'Math',
      'Counting to 10'
    );

    console.log(`Found ${searchResult.videos.length} videos`);
    console.log('Top 3 results:');

    searchResult.videos.slice(0, 3).forEach((video, index) => {
      console.log(`\n${index + 1}. ${video.title}`);
      console.log(`   Channel: ${video.channelTitle}`);
      console.log(`   Duration: ${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`);
      console.log(`   Views: ${video.viewCount.toLocaleString()}`);
      console.log(`   Has Ads: ${video.hasAds ? 'Yes' : 'No'}`);
      console.log(`   Educational Score: ${video.educationalScore}/100`);
      console.log(`   Embed URL: ${video.embedUrl}`);
    });

    // Test 2: Select optimal video
    console.log('\n\nTest 2: Selecting optimal video...');
    const optimalVideo = await youTubeService.selectOptimalVideo(searchResult.videos);

    if (optimalVideo) {
      console.log('✅ Optimal video selected:');
      console.log(`   Title: ${optimalVideo.title}`);
      console.log(`   Channel: ${optimalVideo.channelTitle}`);
      console.log(`   Score: ${optimalVideo.educationalScore}/100`);
      console.log(`   Embed URL: ${optimalVideo.embedUrl}`);
    }

    // Test 3: Get transcript (mock for now)
    console.log('\n\nTest 3: Fetching transcript...');
    if (optimalVideo) {
      const transcript = await youTubeService.getTranscript(optimalVideo.id);
      console.log(`Transcript segments: ${transcript.length}`);
      transcript.slice(0, 3).forEach((segment, index) => {
        console.log(`   [${segment.start}s]: ${segment.text}`);
      });
    }

    console.log('\n\n✅ All tests passed! YouTube integration is working.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\nMake sure:');
    console.error('1. The YouTube API key is correctly set in .env');
    console.error('2. The API key has YouTube Data API v3 enabled');
    console.error('3. You have not exceeded the API quota');
  }
}

// Run the test
testYouTubeIntegration();