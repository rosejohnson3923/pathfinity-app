import React, { useState } from 'react';
import { youTubeService } from './services/content-providers/YouTubeService';
import { SkillOptimizationService } from './services/SkillOptimizationService';
import type { YouTubeVideo } from './services/content-providers/types';

export default function YouTubeTest() {
  const [results, setResults] = useState<string>('Click a test button to see results...');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const testOptimization = async () => {
    setResults('Testing search optimization for Sam and Taylor...');
    setVideos([]);
    setSelectedVideo(null);

    try {
      // Test Sam (Kindergarten)
      const samSkill = 'Count to 100';
      const samOptimization = SkillOptimizationService.optimizeSkill(samSkill, 'Math', 'K');

      // Test Taylor (Grade 10)
      const taylorSkill = 'Determine the main idea of a passage';
      const taylorOptimization = SkillOptimizationService.optimizeSkill(taylorSkill, 'ELA', '10');

      let output = '🔍 SKILL OPTIMIZATION TEST\n';
      output += '=' .repeat(50) + '\n\n';

      output += '👦 SAM (Kindergarten Math)\n';
      output += '  Original: ' + samSkill + '\n';
      output += '  Optimized: ' + samOptimization.youtube_search_terms + '\n';
      output += '  Key Terms: ' + samOptimization.simplified_terms.join(', ') + '\n\n';

      output += '👩 TAYLOR (Grade 10 ELA)\n';
      output += '  Original: ' + taylorSkill + '\n';
      output += '  Optimized: ' + taylorOptimization.youtube_search_terms + '\n';
      output += '  Key Terms: ' + taylorOptimization.simplified_terms.join(', ') + '\n\n';

      output += '✅ Both optimizations successful!\n\n';
      output += 'Now searching YouTube with optimized terms...\n\n';

      // Search for Sam's videos
      const samResults = await youTubeService.searchEducationalVideos('K', 'Math', samSkill);
      output += `Sam's Videos: Found ${samResults.videos.length} results\n`;
      if (samResults.videos.length > 0) {
        output += `  Top result: ${samResults.videos[0].title}\n\n`;
      }

      // Search for Taylor's videos
      const taylorResults = await youTubeService.searchEducationalVideos('10', 'ELA', taylorSkill);
      output += `Taylor's Videos: Found ${taylorResults.videos.length} results\n`;
      if (taylorResults.videos.length > 0) {
        output += `  Top result: ${taylorResults.videos[0].title}\n`;
      }

      setResults(output);
    } catch (error: any) {
      console.error('Optimization test error:', error);
      setResults(`Error: ${error.message}\n\nCheck the browser console for details.`);
    }
  };

  const testSearch = async () => {
    setResults('Searching for Kindergarten counting videos...');
    setVideos([]);
    setSelectedVideo(null);

    try {
      const searchResults = await youTubeService.searchEducationalVideos('K', 'Math', 'Counting to 10');
      console.log('Search results received:', searchResults);

      if (!searchResults || !searchResults.videos) {
        setResults('No search results returned');
        return;
      }

      let output = `Found ${searchResults.videos.length} videos:\n\n`;

      searchResults.videos.forEach((video, index) => {
        output += `${index + 1}. ${video.title}\n`;
        output += `   Channel: ${video.channelTitle}\n`;
        output += `   Duration: ${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}\n`;
        output += `   Views: ${video.viewCount !== undefined && video.viewCount !== null ? video.viewCount.toLocaleString() : 'N/A'}\n`;
        output += `   Has Ads: ${video.hasAds ? 'Yes ⚠️' : 'No ✅'}\n`;
        output += `   Educational Score: ${video.educationalScore || 0}/100\n\n`;
      });

      setResults(output);
      setVideos(searchResults.videos);
    } catch (error: any) {
      console.error('Test search error:', error);
      setResults(`Error: ${error.message}\n\nCheck the browser console for details.`);
    }
  };

  const testOptimalSelection = async () => {
    setResults('Finding optimal video...');

    try {
      const searchResults = await youTubeService.searchEducationalVideos('K', 'Math', 'Counting to 10');
      const optimal = await youTubeService.selectOptimalVideo(searchResults.videos, 'K');

      if (optimal) {
        let output = 'Optimal Video Selected:\n\n';
        output += `Title: ${optimal.title}\n`;
        output += `Channel: ${optimal.channelTitle}\n`;
        output += `Duration: ${Math.floor(optimal.duration / 60)}:${(optimal.duration % 60).toString().padStart(2, '0')}\n`;
        output += `Has Ads: ${optimal.hasAds ? 'Yes ⚠️' : 'No ✅'}\n`;
        output += `Educational Score: ${optimal.educationalScore}/100\n`;
        output += `\nThis video was selected because:\n`;
        output += optimal.hasAds ? '' : '- No ads detected\n';
        output += optimal.duration < 480 ? '- Short duration (no mid-roll ads)\n' : '';
        output += optimal.educationalScore > 70 ? '- High educational score\n' : '';

        setResults(output);
        setSelectedVideo(optimal);
      }
    } catch (error: any) {
      setResults(`Error: ${error.message}`);
    }
  };

  const testTopVideos = async () => {
    setResults('Finding top 5 videos...');

    try {
      const searchResults = await youTubeService.searchEducationalVideos('K', 'Math', 'Counting to 10');
      const topVideos = await youTubeService.getTopVideos(searchResults.videos, 5);

      let output = 'Top 5 Videos (Ranked by Quality Score):\n\n';

      topVideos.forEach((video, index) => {
        output += `${index + 1}. ${video.title}\n`;
        output += `   Channel: ${video.channelTitle}\n`;
        output += `   Duration: ${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}\n`;
        output += `   Has Ads: ${video.hasAds ? 'Yes ⚠️' : 'No ✅'}\n`;
        output += `   Educational Score: ${video.educationalScore}/100\n`;
        output += `   Views: ${video.viewCount !== undefined && video.viewCount !== null ? video.viewCount.toLocaleString() : 'N/A'}\n`;
        output += `   Why selected: ${!video.hasAds ? 'Ad-free, ' : ''}${video.duration <= 480 ? 'Good duration, ' : ''}High quality\n\n`;
      });

      setResults(output);
      setVideos(topVideos);
    } catch (error: any) {
      setResults(`Error: ${error.message}`);
    }
  };

  const testEmbedding = async () => {
    setResults('Loading video with Pathfinity intro...');

    try {
      const searchResults = await youTubeService.searchEducationalVideos('K', 'Math', 'Counting to 10');
      const optimal = await youTubeService.selectOptimalVideo(searchResults.videos, 'K');

      if (optimal) {
        setSelectedVideo(optimal);
        setShowIntro(true);
        setCountdown(10);

        // Start countdown
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setShowIntro(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setResults('Video embedded successfully! Watch the 10-second intro.');
      }
    } catch (error: any) {
      setResults(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>🎬 YouTube Educational API Test</h1>

      <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '15px', margin: '20px 0', borderRadius: '8px' }}>
        <strong>Note:</strong> You may see yellow warning icons in the browser due to YouTube's cross-origin resource policies
        when embedding videos in localhost. This is normal in development and doesn't affect video playback.
      </div>

      <div style={{ background: 'white', padding: '20px', margin: '20px 0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Test Controls</h2>
        <button onClick={testOptimization} style={{ ...buttonStyle, background: '#10b981' }}>🎯 Test Sam & Taylor Optimization</button>
        <button onClick={testSearch} style={buttonStyle}>Test Search API</button>
        <button onClick={testOptimalSelection} style={buttonStyle}>Test Optimal Video Selection</button>
        <button onClick={testEmbedding} style={buttonStyle}>Test Video Embedding</button>
        <button onClick={testTopVideos} style={buttonStyle}>Test Top 5 Videos</button>
        <button onClick={() => { setResults('Results cleared.'); setVideos([]); setSelectedVideo(null); }} style={buttonStyle}>Clear Results</button>
      </div>

      <div style={{ background: 'white', padding: '20px', margin: '20px 0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Results</h2>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
          {results}
        </pre>
      </div>

      {selectedVideo && (
        <div style={{ background: 'white', padding: '20px', margin: '20px 0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Video Preview</h2>
          <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto' }}>
            {showIntro && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '8px',
                zIndex: 10,
                height: '315px'
              }}>
                <h2>Sam's Marine Biology Journey</h2>
                <p>Let's learn to count the baby sea turtles!</p>
                <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px' }}>{countdown}</div>
                <p>Video starts in...</p>
              </div>
            )}
            <iframe
              src={`${selectedVideo.embedUrl}?modestbranding=1&rel=0&start=10${!showIntro ? '&autoplay=1' : ''}`}
              style={{
                width: '100%',
                height: '315px',
                border: 'none',
                borderRadius: '8px',
                visibility: showIntro ? 'hidden' : 'visible'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontWeight: 'bold', color: '#1a73e8' }}>{selectedVideo.title}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>Channel: {selectedVideo.channelTitle}</div>
            <div style={{ color: selectedVideo.hasAds ? 'orange' : 'green', fontWeight: 'bold' }}>
              {selectedVideo.hasAds ? '⚠️ May contain ads' : '✅ Ad-free video'}
            </div>
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div style={{ background: 'white', padding: '20px', margin: '20px 0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>All Videos Found</h2>
          {videos.slice(0, 5).map((video, index) => (
            <div key={video.id} style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
              <div style={{ fontWeight: 'bold', color: '#1a73e8' }}>{index + 1}. {video.title}</div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                {video.channelTitle} • {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')} • {video.viewCount !== undefined && video.viewCount !== null ? video.viewCount.toLocaleString() : 'N/A'} views
              </div>
              <div style={{ color: video.hasAds ? 'orange' : 'green' }}>
                {video.hasAds ? '⚠️ Ads' : '✅ No ads'} • Score: {video.educationalScore || 0}/100
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  background: '#1a73e8',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  margin: '5px',
  fontSize: '14px'
};