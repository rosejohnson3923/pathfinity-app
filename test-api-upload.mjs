/**
 * Test API Upload Directly
 * This tests if the backend API can upload to Azure
 */

const API_URL = 'http://localhost:3002/api';

async function testAPIUpload() {
  console.log('🧪 Testing API Upload to Azure\n');

  // Test data
  const testNarrative = {
    narrativeId: `test-${Date.now()}`,
    greeting: 'Hello from API test!',
    introduction: 'This is a test narrative uploaded via API',
    timestamp: new Date().toISOString()
  };

  const testKey = `test-api-${Date.now()}`;

  try {
    // 1. Test health check
    console.log('1️⃣ Testing API health check...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const health = await healthResponse.json();
    console.log('✅ API is healthy:', health);

    // 2. Test Master Narrative upload
    console.log('\n2️⃣ Uploading Master Narrative via API...');
    const uploadResponse = await fetch(`${API_URL}/cache/master-narrative`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: testKey,
        narrative: testNarrative,
        metadata: {
          studentId: 'test-student',
          gradeLevel: '5',
          companion: 'harmony',
          careerId: 'test-career',
          subject: 'test'
        }
      })
    });

    const result = await uploadResponse.json();

    if (result.success) {
      console.log('✅ Upload successful!');
      console.log(`   Blob name: ${result.blobName}`);
      console.log(`   Size: ${result.size} bytes`);
      console.log(`   URL: ${result.url}`);
      console.log('\n🎉 Check Azure Portal - you should see this file in master-narratives container!');
    } else {
      console.error('❌ Upload failed:', result.error);
    }

    // 3. Test retrieval
    console.log('\n3️⃣ Retrieving the narrative back...');
    const getResponse = await fetch(`${API_URL}/cache/master-narrative/${testKey}`);
    const getResult = await getResponse.json();

    if (getResult.success) {
      console.log('✅ Retrieved successfully!');
      console.log('   Content:', getResult.data);
    } else {
      console.log('❌ Retrieval failed:', getResult.message);
    }

    // 4. Get cache stats
    console.log('\n4️⃣ Getting cache statistics...');
    const statsResponse = await fetch(`${API_URL}/cache/stats`);
    const stats = await statsResponse.json();

    if (stats.success) {
      console.log('✅ Cache stats:');
      console.log(`   Master Narratives: ${stats.stats.masterNarratives}`);
      console.log(`   Total size: ${stats.stats.totalSizeMB} MB`);
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n⚠️  Make sure the backend server is running:');
    console.log('   cd server');
    console.log('   npm install');
    console.log('   npm run dev');
  }
}

testAPIUpload();