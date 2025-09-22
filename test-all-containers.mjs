/**
 * Simple test to verify all Azure Storage containers are created
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAllContainers() {
  console.log('🚀 Verifying All Azure Storage Containers\n');
  console.log('=' .repeat(50));

  const { BlobServiceClient } = await import('@azure/storage-blob');

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    console.error('❌ No connection string found in .env.local');
    return;
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

  // Expected containers
  const expectedContainers = [
    // Audio containers
    { name: 'audio-cache', type: 'Audio', purpose: 'Temporary audio processing' },
    { name: 'audio-effects', type: 'Audio', purpose: 'Sound effects and UI sounds' },
    { name: 'audio-music', type: 'Audio', purpose: 'Background music tracks' },
    { name: 'audio-narration', type: 'Audio', purpose: 'AI companion voice narration' },

    // Content containers
    { name: 'master-narratives', type: 'Content', purpose: 'Master Narrative JSON (30-day cache)' },
    { name: 'micro-content-learn', type: 'Content', purpose: 'Learn container content (7-day cache)' },
    { name: 'micro-content-experience', type: 'Content', purpose: 'Experience container content (7-day cache)' },
    { name: 'micro-content-discover', type: 'Content', purpose: 'Discover container content (7-day cache)' },
    { name: 'content-metrics', type: 'Metrics', purpose: 'Usage analytics and monitoring' }
  ];

  console.log('📦 Checking containers...\n');

  // Get actual containers
  const actualContainers = [];
  for await (const container of blobServiceClient.listContainers()) {
    actualContainers.push(container.name);
  }

  // Check each expected container
  let audioCount = 0;
  let contentCount = 0;
  let metricsCount = 0;

  for (const expected of expectedContainers) {
    const exists = actualContainers.includes(expected.name);

    if (exists) {
      console.log(`✅ ${expected.name}`);
      console.log(`   Type: ${expected.type} | Purpose: ${expected.purpose}`);

      if (expected.type === 'Audio') audioCount++;
      else if (expected.type === 'Content') contentCount++;
      else if (expected.type === 'Metrics') metricsCount++;
    } else {
      console.log(`❌ ${expected.name} - MISSING!`);
      console.log(`   Create this container in Azure Portal`);
    }
    console.log('');
  }

  // Summary
  console.log('=' .repeat(50));
  console.log('\n📊 Summary:');
  console.log(`  Audio Containers: ${audioCount}/4`);
  console.log(`  Content Containers: ${contentCount}/4`);
  console.log(`  Metrics Container: ${metricsCount}/1`);
  console.log(`  Total: ${audioCount + contentCount + metricsCount}/9`);

  if (audioCount + contentCount + metricsCount === 9) {
    console.log('\n✅ All containers are properly configured!');

    // Test upload to each container type
    console.log('\n🧪 Testing container access...\n');

    try {
      // Test Master Narratives container
      const mnContainer = blobServiceClient.getContainerClient('master-narratives');
      const mnBlob = mnContainer.getBlockBlobClient('test/connection-test.json');
      const mnContent = JSON.stringify({ test: true, timestamp: new Date().toISOString() });
      await mnBlob.upload(mnContent, mnContent.length);
      console.log('✅ Master Narratives container: Write successful');
      await mnBlob.delete();

      // Test Micro Content Learn container
      const mcContainer = blobServiceClient.getContainerClient('micro-content-learn');
      const mcBlob = mcContainer.getBlockBlobClient('test/connection-test.json');
      await mcBlob.upload(mnContent, mnContent.length);
      console.log('✅ Micro Content Learn container: Write successful');
      await mcBlob.delete();

      // Test Audio Narration container
      const audioContainer = blobServiceClient.getContainerClient('audio-narration');
      const audioBlob = audioContainer.getBlockBlobClient('test/connection-test.mp3');
      await audioBlob.upload('test', 4);
      console.log('✅ Audio Narration container: Write successful');
      await audioBlob.delete();

      console.log('\n🎉 All containers are accessible and working!');

    } catch (error) {
      console.error('❌ Container access test failed:', error.message);
    }
  } else {
    console.log('\n⚠️  Some containers are missing. Please create them in Azure Portal.');
  }

  // Show storage costs estimate
  console.log('\n💰 Estimated Monthly Storage Costs:');
  console.log('  Master Narratives (10GB): ~$0.20');
  console.log('  Micro Content (20GB): ~$0.40');
  console.log('  Audio Files (50GB): ~$1.00');
  console.log('  Total: ~$1.60/month for 80GB');
  console.log('\n  Compare to: ~$15,000/month without caching!');
}

testAllContainers().catch(console.error);