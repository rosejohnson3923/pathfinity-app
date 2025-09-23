/**
 * Cache API Routes
 * Handles Master Narrative and Micro Content storage in Azure
 */

const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');
const router = express.Router();

// Azure Storage configuration - lazy initialization to prevent hanging
let blobServiceClient = null;

const getBlobServiceClient = () => {
  if (!blobServiceClient) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      console.error('⚠️ WARNING: Azure Storage connection string not found');
      return null;
    }
    try {
      blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    } catch (error) {
      console.error('Failed to initialize blob service client:', error);
      return null;
    }
  }
  return blobServiceClient;
};

// Middleware to check Azure connection
const requireAzure = (req, res, next) => {
  const client = getBlobServiceClient();
  if (!client) {
    return res.status(503).json({
      error: 'Azure Storage not configured',
      message: 'Storage service is temporarily unavailable'
    });
  }
  next();
};

/**
 * GET /api/cache/master-narrative/:key
 * Retrieve Master Narrative from Azure
 */
router.get('/master-narrative/:key', requireAzure, async (req, res) => {
  try {
    const { key } = req.params;
    console.log(`📥 Retrieving Master Narrative: ${key}`);

    const containerClient = blobServiceClient.getContainerClient('master-narratives');

    // Search for the narrative
    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.name.includes(key)) {
        const blobClient = containerClient.getBlobClient(blob.name);
        const downloadResponse = await blobClient.download();
        const content = await streamToString(downloadResponse.readableStreamBody);

        console.log(`✅ Found Master Narrative: ${blob.name}`);
        return res.json({
          success: true,
          data: JSON.parse(content),
          blobName: blob.name,
          size: blob.properties.contentLength
        });
      }
    }

    console.log(`❌ Master Narrative not found: ${key}`);
    res.status(404).json({
      success: false,
      message: 'Master Narrative not found'
    });

  } catch (error) {
    console.error('Error retrieving Master Narrative:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/cache/master-narrative
 * Store Master Narrative in Azure
 */
router.post('/master-narrative', requireAzure, async (req, res) => {
  try {
    const { key, narrative, metadata } = req.body;

    if (!key || !narrative) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: key and narrative'
      });
    }

    console.log(`📤 Storing Master Narrative: ${key}`);

    const containerClient = blobServiceClient.getContainerClient('master-narratives');

    // Create blob path
    const { gradeLevel = 'unknown', companion = 'unknown' } = metadata || {};
    const blobName = `${gradeLevel}/${companion}/${key}.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload content
    const content = JSON.stringify(narrative, null, 2);
    const uploadResponse = await blockBlobClient.upload(content, content.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json',
        blobCacheControl: 'public, max-age=2592000' // 30 days
      },
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString()
      }
    });

    console.log(`✅ Master Narrative stored: ${blobName}`);
    console.log(`   Size: ${(content.length / 1024).toFixed(2)} KB`);

    res.json({
      success: true,
      blobName,
      url: blockBlobClient.url,
      size: content.length,
      requestId: uploadResponse.requestId
    });

  } catch (error) {
    console.error('Error storing Master Narrative:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/cache/micro-content/:type/:key
 * Retrieve Micro Content from Azure
 */
router.get('/micro-content/:type/:key', requireAzure, async (req, res) => {
  try {
    const { type, key } = req.params;

    if (!['learn', 'experience', 'discover'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid container type'
      });
    }

    console.log(`📥 Retrieving Micro Content (${type}): ${key}`);

    const containerName = `micro-content-${type}`;
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Search for the content
    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.name.includes(key)) {
        const blobClient = containerClient.getBlobClient(blob.name);
        const downloadResponse = await blobClient.download();
        const content = await streamToString(downloadResponse.readableStreamBody);

        console.log(`✅ Found Micro Content: ${blob.name}`);
        return res.json({
          success: true,
          data: JSON.parse(content),
          blobName: blob.name,
          size: blob.properties.contentLength
        });
      }
    }

    console.log(`❌ Micro Content not found: ${key}`);
    res.status(404).json({
      success: false,
      message: 'Micro Content not found'
    });

  } catch (error) {
    console.error('Error retrieving Micro Content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/cache/micro-content
 * Store Micro Content in Azure
 */
router.post('/micro-content', requireAzure, async (req, res) => {
  try {
    const { key, content, containerType, metadata } = req.body;

    if (!key || !content || !containerType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: key, content, and containerType'
      });
    }

    if (!['learn', 'experience', 'discover'].includes(containerType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid container type'
      });
    }

    console.log(`📤 Storing Micro Content (${containerType}): ${key}`);

    const containerName = `micro-content-${containerType}`;
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create blob path
    const { gradeLevel = 'unknown', skillId = 'unknown' } = metadata || {};
    const blobName = `${gradeLevel}/${skillId}/${key}.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload content
    const contentStr = JSON.stringify(content, null, 2);
    const uploadResponse = await blockBlobClient.upload(contentStr, contentStr.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json',
        blobCacheControl: 'public, max-age=604800' // 7 days
      },
      metadata: {
        ...metadata,
        containerType,
        createdAt: new Date().toISOString()
      }
    });

    console.log(`✅ Micro Content stored: ${blobName}`);
    console.log(`   Size: ${(contentStr.length / 1024).toFixed(2)} KB`);

    res.json({
      success: true,
      blobName,
      url: blockBlobClient.url,
      size: contentStr.length,
      requestId: uploadResponse.requestId
    });

  } catch (error) {
    console.error('Error storing Micro Content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/cache/metrics
 * Store usage metrics in Azure
 */
router.post('/metrics', requireAzure, async (req, res) => {
  try {
    const metrics = req.body;

    console.log(`📊 Storing metrics`);

    const containerClient = blobServiceClient.getContainerClient('content-metrics');
    const date = new Date().toISOString().split('T')[0];
    const blobName = `metrics/${date}/metrics-${Date.now()}.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const content = JSON.stringify(metrics, null, 2);
    await blockBlobClient.upload(content, content.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json'
      }
    });

    console.log(`✅ Metrics stored: ${blobName}`);

    res.json({
      success: true,
      blobName
    });

  } catch (error) {
    console.error('Error storing metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/cache/stats
 * Get cache statistics
 */
router.get('/stats', requireAzure, async (req, res) => {
  try {
    console.log('📊 Getting cache statistics');

    const stats = {
      masterNarratives: 0,
      microContentLearn: 0,
      microContentExperience: 0,
      microContentDiscover: 0,
      totalSize: 0,
      containers: []
    };

    // Count blobs in each container
    const containers = [
      'master-narratives',
      'micro-content-learn',
      'micro-content-experience',
      'micro-content-discover',
      'audio-narration'
    ];

    for (const containerName of containers) {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      let count = 0;
      let size = 0;

      for await (const blob of containerClient.listBlobsFlat()) {
        count++;
        size += blob.properties.contentLength || 0;
      }

      stats.containers.push({
        name: containerName,
        count,
        size,
        sizeMB: (size / 1024 / 1024).toFixed(2)
      });

      stats.totalSize += size;

      // Update specific counts
      if (containerName === 'master-narratives') stats.masterNarratives = count;
      if (containerName === 'micro-content-learn') stats.microContentLearn = count;
      if (containerName === 'micro-content-experience') stats.microContentExperience = count;
      if (containerName === 'micro-content-discover') stats.microContentDiscover = count;
    }

    stats.totalSizeMB = (stats.totalSize / 1024 / 1024).toFixed(2);

    console.log(`✅ Cache stats retrieved`);
    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to convert stream to string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
}

module.exports = router;