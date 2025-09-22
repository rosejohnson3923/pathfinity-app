/**
 * Debug Audio System
 * Test if TTS and audio storage are working
 */

const API_URL = 'http://localhost:3002/api';

async function testAudioSystem() {
  console.log('🎵 Testing Audio System Debug\n');

  try {
    // 1. Test API health
    console.log('1️⃣ Testing API connection...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const health = await healthResponse.json();
    console.log('✅ API Status:', health.status);

    // 2. Test simple TTS generation
    console.log('\n2️⃣ Testing TTS generation...');

    const testSSML = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="en-US-DavisNeural">
          Hello! Testing audio generation.
        </voice>
      </speak>
    `;

    const ttsResponse = await fetch(`${API_URL}/tts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ssml: testSSML,
        companion: 'finn',
        gradeLevel: '5'
      })
    });

    console.log('TTS Response status:', ttsResponse.status);
    console.log('TTS Response headers:', {
      contentType: ttsResponse.headers.get('content-type'),
      contentLength: ttsResponse.headers.get('content-length')
    });

    if (ttsResponse.ok) {
      const audioData = await ttsResponse.arrayBuffer();
      console.log('✅ Audio generated! Size:', audioData.byteLength, 'bytes');
    } else {
      const error = await ttsResponse.text();
      console.error('❌ TTS failed:', error);
    }

    // 3. Check what's in audio-narration container
    console.log('\n3️⃣ Checking Azure Storage stats...');
    const statsResponse = await fetch(`${API_URL}/cache/stats`);
    const stats = await statsResponse.json();

    if (stats.success) {
      console.log('📦 Storage containers:');
      stats.stats.containers.forEach(c => {
        console.log(`   ${c.name}: ${c.count} files (${c.sizeMB} MB)`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Check if api-server is running on port 3002');
    console.log('2. Check if Azure Speech key is configured in .env.local');
    console.log('3. Check browser console for CORS errors');
  }
}

testAudioSystem();