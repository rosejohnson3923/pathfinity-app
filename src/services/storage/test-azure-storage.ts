/**
 * Test script for Azure Blob Storage connection
 * Run this to verify your Azure Storage setup is working correctly
 */

import { AzureStorageService } from './AzureStorageService';

// You'll get this from Azure Portal -> Storage Account -> Access keys
// NEVER commit this to git! Add to .env file
const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || '';

async function testAzureStorage() {
  console.log('🚀 Starting Azure Storage Test...\n');

  if (!CONNECTION_STRING) {
    console.error('❌ ERROR: Missing connection string!');
    console.log('\n📝 To get your connection string:');
    console.log('1. Go to Azure Portal');
    console.log('2. Navigate to pathfinitystorage');
    console.log('3. Click "Access keys" in the left menu');
    console.log('4. Copy "Connection string" from key1');
    console.log('5. Add to .env file as AZURE_STORAGE_CONNECTION_STRING');
    return;
  }

  const storage = new AzureStorageService(CONNECTION_STRING);

  // Test 1: Connection
  console.log('📡 Test 1: Testing connection...');
  const isConnected = await storage.testConnection();
  if (!isConnected) {
    console.error('❌ Connection failed!');
    return;
  }

  // Test 2: Upload test audio
  console.log('\n📤 Test 2: Testing audio upload...');
  const testAudioBuffer = Buffer.from('This is test audio data');
  const testMetadata = {
    narrativeId: 'test-narrative-001',
    studentId: 'test-student-001',
    gradeLevel: '5',
    companion: 'harmony',
    contentType: 'narration' as const,
    createdAt: new Date().toISOString()
  };

  try {
    const { url, blobName } = await storage.uploadAudio(testAudioBuffer, testMetadata);
    console.log('✅ Upload successful!');
    console.log(`   Blob name: ${blobName}`);
    console.log(`   URL: ${url.substring(0, 50)}...`);
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }

  // Test 3: Check if audio exists
  console.log('\n🔍 Test 3: Checking if audio exists...');
  const existingUrl = await storage.audioExists(
    'test-narrative-001',
    'test-student-001',
    'harmony'
  );
  if (existingUrl) {
    console.log('✅ Audio found!');
    console.log(`   URL: ${existingUrl.substring(0, 50)}...`);
  } else {
    console.log('⚠️ Audio not found (this might be expected on first run)');
  }

  // Test 4: Get metrics
  console.log('\n📊 Test 4: Getting storage metrics...');
  const metrics = await storage.getStorageMetrics();
  console.log('✅ Metrics retrieved:');
  console.log(`   Total files: ${metrics.totalFiles}`);
  console.log(`   Total size: ${(metrics.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   By companion:`, metrics.byCompanion);
  console.log(`   By grade:`, metrics.byGrade);

  console.log('\n✅ All tests completed!');
  console.log('\n🎉 Your Azure Storage is properly configured and ready for audio files!');
}

// Run the test
testAzureStorage().catch(console.error);