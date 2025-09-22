/**
 * Test API Server TTS Endpoint
 */

const API_URL = 'http://localhost:3002/api';

async function testTTS() {
  console.log('🎤 Testing API Server TTS...\n');

  const testSSML = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="en-US-DavisNeural">
        Hello! This is Finn testing the Azure Text to Speech service.
      </voice>
    </speak>
  `;

  try {
    const response = await fetch(`${API_URL}/tts/generate`, {
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

    console.log('Response status:', response.status);
    console.log('Response headers:', {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });

    if (response.ok) {
      const audioData = await response.arrayBuffer();
      console.log('✅ TTS Success! Audio size:', audioData.byteLength, 'bytes');

      // The audio would be played in browser, not in Node
      console.log('\nAudio generated successfully!');
      console.log('To play this audio, it needs to be used in a browser context.');
    } else {
      const error = await response.text();
      console.error('❌ TTS failed:', error);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('\nMake sure the API server is running on port 3002');
  }
}

testTTS();