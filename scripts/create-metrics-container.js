#!/usr/bin/env node
/**
 * Create metrics container in Azure Storage
 * Run this once to create the container for TTS logging
 */

require('dotenv').config({ path: '.env.local' });
const { BlobServiceClient } = require('@azure/storage-blob');

async function createMetricsContainer() {
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
      console.error('❌ AZURE_STORAGE_CONNECTION_STRING not found in .env.local');
      process.exit(1);
    }

    console.log('🔗 Connecting to Azure Storage...');
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    const containerName = 'metrics';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Check if container exists
    const exists = await containerClient.exists();

    if (exists) {
      console.log('✅ Container "metrics" already exists');
    } else {
      console.log('📦 Creating container "metrics"...');
      await containerClient.create({
        access: 'blob' // Allow public read access to blobs
      });
      console.log('✅ Container "metrics" created successfully');
    }

    // Create a test file to verify write access
    console.log('📝 Testing write access...');
    const testBlobName = 'test/container-created.json';
    const blockBlobClient = containerClient.getBlockBlobClient(testBlobName);

    const testData = {
      message: 'Metrics container created successfully',
      timestamp: new Date().toISOString(),
      createdBy: 'create-metrics-container.js'
    };

    await blockBlobClient.upload(
      JSON.stringify(testData, null, 2),
      JSON.stringify(testData).length,
      {
        blobHTTPHeaders: {
          blobContentType: 'application/json'
        }
      }
    );

    console.log('✅ Test file written successfully');
    console.log(`   URL: ${blockBlobClient.url}`);
    console.log('\n🎉 Metrics container is ready for TTS logging!');

  } catch (error) {
    console.error('❌ Error creating metrics container:', error.message);
    console.error('   Details:', error);
    process.exit(1);
  }
}

// Run the script
createMetricsContainer();