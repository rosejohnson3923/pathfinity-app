/**
 * Quick test script to verify Azure Storage connection
 * Run with: node test-azure-connection.js
 */

require('dotenv').config({ path: '.env.local' });

async function quickTest() {
  console.log('🔍 Testing Azure Storage Connection...\n');

  // Check if connection string exists
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (!connectionString) {
    console.error('❌ No connection string found in .env.local');
    return;
  }

  console.log('✅ Connection string found');
  console.log(`   Account: pathfinitystorage`);
  console.log(`   Key ends with: ...${connectionString.slice(-10)}`);

  try {
    // Simple check - we'll do full test after installing packages
    const { BlobServiceClient } = require('@azure/storage-blob');

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    console.log('\n📦 Listing containers...');
    const containers = [];
    for await (const container of blobServiceClient.listContainers()) {
      containers.push(container.name);
      console.log(`   ✅ ${container.name}`);
    }

    if (containers.length === 0) {
      console.log('   ⚠️  No containers found. Please create them in Azure Portal.');
    } else {
      console.log(`\n🎉 Success! Found ${containers.length} containers`);
    }

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\n📦 Azure SDK not installed yet.');
      console.log('   Run: npm install @azure/storage-blob');
    } else {
      console.error('\n❌ Error:', error.message);
    }
  }
}

quickTest();