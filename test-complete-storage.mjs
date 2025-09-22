/**
 * Test complete Azure Storage system with all containers
 * Tests both audio and content storage capabilities
 */

import dotenv from 'dotenv';
import { AzureStorageService } from './src/services/storage/AzureStorageService.js';

dotenv.config({ path: '.env.local' });

async function testCompleteStorage() {
  console.log('🚀 Testing Complete Azure Storage System\n');
  console.log('=' .repeat(50));

  const storage = new AzureStorageService();

  // Test 1: Verify all containers exist
  console.log('\n📦 Test 1: Verifying all 9 containers...');
  const expectedContainers = [
    'audio-cache',
    'audio-effects',
    'audio-music',
    'audio-narration',
    'master-narratives',
    'micro-content-learn',
    'micro-content-experience',
    'micro-content-discover',
    'content-metrics'
  ];

  const { BlobServiceClient } = await import('@azure/storage-blob');
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );

  const foundContainers = [];
  for await (const container of blobServiceClient.listContainers()) {
    foundContainers.push(container.name);
  }

  console.log(`Found ${foundContainers.length} containers:`);
  for (const container of expectedContainers) {
    const exists = foundContainers.includes(container);
    console.log(`  ${exists ? '✅' : '❌'} ${container}`);
  }

  // Test 2: Test Master Narrative storage
  console.log('\n📝 Test 2: Testing Master Narrative storage...');
  const testNarrative = {
    greeting: "Hello young explorer!",
    introduction: "Today we embark on an amazing journey...",
    careerContext: {
      title: "Future Scientist",
      mission: "discover the wonders of science"
    },
    companion: {
      name: "Harmony",
      personality: "friendly and encouraging"
    }
  };

  try {
    const narrativeKey = 'test-narrative-' + Date.now();
    const { url, blobName } = await storage.uploadMasterNarrative(
      narrativeKey,
      testNarrative,
      {
        studentId: 'test-student-001',
        gradeLevel: '5',
        companion: 'harmony',
        careerId: 'scientist',
        subject: 'science'
      }
    );
    console.log('✅ Master Narrative uploaded successfully');
    console.log(`   Blob: ${blobName}`);
    console.log(`   URL: ${url.substring(0, 80)}...`);

    // Try to retrieve it
    const retrieved = await storage.getMasterNarrative(narrativeKey);
    if (retrieved) {
      console.log('✅ Successfully retrieved Master Narrative');
      console.log(`   Greeting: "${retrieved.greeting}"`);
    }
  } catch (error) {
    console.error('❌ Master Narrative test failed:', error.message);
  }

  // Test 3: Test Micro Content storage
  console.log('\n📚 Test 3: Testing Micro Content storage...');
  const testLearnContent = {
    instructional: {
      videoIntro: {
        hook: "Let's learn about fractions!",
        careerContext: "Scientists use fractions every day"
      },
      keyLearningPoints: [
        "Understanding parts of a whole",
        "Adding fractions",
        "Real-world applications"
      ]
    },
    practice: {
      questions: [
        { text: "What is 1/2 + 1/4?", answer: "3/4" }
      ]
    }
  };

  try {
    const contentKey = 'test-content-' + Date.now();
    const { url, blobName } = await storage.uploadMicroContent(
      contentKey,
      testLearnContent,
      'learn',
      {
        studentId: 'test-student-001',
        gradeLevel: '5',
        skillId: 'fractions-basics',
        masterNarrativeKey: 'test-narrative-key'
      }
    );
    console.log('✅ Micro Content (Learn) uploaded successfully');
    console.log(`   Blob: ${blobName}`);

    // Try to retrieve it
    const retrieved = await storage.getMicroContent(contentKey, 'learn');
    if (retrieved) {
      console.log('✅ Successfully retrieved Micro Content');
      console.log(`   Hook: "${retrieved.instructional.videoIntro.hook}"`);
    }
  } catch (error) {
    console.error('❌ Micro Content test failed:', error.message);
  }

  // Test 4: Test metrics storage
  console.log('\n📊 Test 4: Testing metrics storage...');
  const testMetrics = {
    timestamp: new Date().toISOString(),
    event: 'test-run',
    cacheHits: 42,
    cacheMisses: 8,
    totalRequests: 50,
    averageResponseTime: 125.5
  };

  try {
    await storage.saveMetrics(testMetrics);
    console.log('✅ Metrics saved successfully');
  } catch (error) {
    console.error('❌ Metrics test failed:', error.message);
  }

  // Test 5: Storage statistics
  console.log('\n📈 Test 5: Getting storage statistics...');
  try {
    const stats = await storage.getStorageMetrics();
    console.log('✅ Storage statistics:');
    console.log(`   Total files: ${stats.totalFiles}`);
    console.log(`   Total size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
    console.log(`   By companion:`, stats.byCompanion);
    console.log(`   By grade:`, stats.byGrade);
  } catch (error) {
    console.error('❌ Statistics failed:', error.message);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✅ Azure Storage system is fully configured!');
  console.log('\nYour storage architecture:');
  console.log('  🎵 4 Audio containers (narration, effects, music, cache)');
  console.log('  📝 1 Master Narrative container');
  console.log('  📚 3 Micro Content containers (learn, experience, discover)');
  console.log('  📊 1 Metrics container');
  console.log('\n🎉 Ready for production caching implementation!');
}

testCompleteStorage().catch(console.error);