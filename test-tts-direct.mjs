/**
 * Direct TTS Test
 */

const API_URL = 'http://localhost:3002/api';

async function testTTS() {
  console.log('🎤 Testing Azure TTS Generation...\n');

  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="en-US-DavisNeural">
        <prosody rate="1.0" pitch="medium">
          Hello! I'm Finn, your learning companion.
          Welcome to Pathfinity!
        </prosody>
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
        ssml,
        companion: 'finn',
        gradeLevel: '5'
      })
    });

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      console.log('✅ TTS generation successful!');
      console.log(`   Audio size: ${audioBuffer.byteLength} bytes`);
      console.log(`   Companion: ${response.headers.get('X-Companion')}`);
      console.log(`   Grade: ${response.headers.get('X-Grade-Level')}`);
    } else {
      const error = await response.json();
      console.log('❌ TTS generation failed:', error);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testTTS();
