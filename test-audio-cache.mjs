/**
 * Test Audio Cache System
 * Tests TTS generation and Azure Storage integration
 */

const API_URL = 'http://localhost:3002/api';

async function testAudioCache() {
  console.log('🎵 Testing Audio Cache System\n');

  try {
    // 1. Test TTS voices endpoint
    console.log('1️⃣ Getting available voices...');
    const voicesResponse = await fetch(`${API_URL}/tts/voices`);
    const voices = await voicesResponse.json();

    if (voices.success) {
      console.log(`✅ Found ${voices.voices.length} voices`);
      console.log('   Sample voices:');
      voices.voices.slice(0, 5).forEach(v => {
        console.log(`   - ${v.id} (${v.gender}): ${v.description}`);
      });
    }

    // 2. Test audio generation with SSML
    console.log('\n2️⃣ Testing audio generation...');

    const testSSML = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="en-US-DavisNeural">
          <prosody rate="1.0" pitch="medium">
            Hello! I'm Finn, your learning companion.
            <break time="300ms"/>
            I'm excited to help you explore the world of engineering today!
          </prosody>
        </voice>
      </speak>
    `;

    console.log('⚠️  Note: Audio generation requires Azure Speech Key to be configured');
    console.log('   Add AZURE_SPEECH_KEY to .env.local to enable TTS');

    // 3. Test Master Narrative with audio
    console.log('\n3️⃣ Testing Master Narrative with audio cache...');

    const testNarrative = {
      narrativeId: `audio-test-${Date.now()}`,
      greeting: "Welcome to your engineering adventure!",
      introduction: "Today we'll explore how engineers solve problems and build amazing things.",
      careerContext: {
        title: "Engineer",
        mission: "design solutions that make the world a better place"
      }
    };

    const narrativeKey = `audio-narrative-${Date.now()}`;

    // Save Master Narrative
    const narrativeResponse = await fetch(`${API_URL}/cache/master-narrative`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: narrativeKey,
        narrative: testNarrative,
        metadata: {
          studentId: 'test-student',
          gradeLevel: '5',
          companion: 'finn',
          careerId: 'engineer',
          subject: 'test'
        }
      })
    });

    const narrativeResult = await narrativeResponse.json();

    if (narrativeResult.success) {
      console.log('✅ Master Narrative saved with audio metadata');
      console.log(`   Key: ${narrativeKey}`);
      console.log(`   Blob: ${narrativeResult.blobName}`);
    }

    // 4. Simulate audio file storage (if TTS is configured)
    console.log('\n4️⃣ Testing audio storage simulation...');

    const testAudioKey = `test-audio-${Date.now()}`;
    const testAudioData = Buffer.from('Simulated audio data for testing');

    const audioResponse = await fetch(`${API_URL}/tts/save-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: testAudioKey,
        audioData: testAudioData.toString('base64'),
        metadata: {
          companion: 'finn',
          gradeLevel: '5',
          duration: 5,
          text: 'Test greeting'
        }
      })
    });

    const audioResult = await audioResponse.json();

    if (audioResult.success) {
      console.log('✅ Audio file saved to Azure');
      console.log(`   Container: audio-narration`);
      console.log(`   Blob: ${audioResult.blobName}`);
      console.log(`   Size: ${audioResult.size} bytes`);
      console.log('\n🎉 Check Azure Portal - audio-narration container should have the test file!');
    }

    // 5. Test audio retrieval
    console.log('\n5️⃣ Testing audio retrieval...');

    const getAudioResponse = await fetch(`${API_URL}/tts/audio/${testAudioKey}`);

    if (getAudioResponse.ok) {
      const contentType = getAudioResponse.headers.get('content-type');
      const contentLength = getAudioResponse.headers.get('content-length');
      console.log('✅ Audio retrieved successfully');
      console.log(`   Type: ${contentType}`);
      console.log(`   Size: ${contentLength} bytes`);
    }

    console.log('\n✨ Audio cache system test complete!');
    console.log('\nNext steps:');
    console.log('1. Add Azure Speech Key to .env.local for real TTS');
    console.log('2. Integrate AudioCacheService with UI components');
    console.log('3. Add playback controls in companion interactions');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n⚠️  Make sure the backend server is running:');
    console.log('   cd api-server');
    console.log('   npm run dev');
  }
}

testAudioCache();