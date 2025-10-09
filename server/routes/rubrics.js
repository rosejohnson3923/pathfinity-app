/**
 * Rubric Storage API Routes
 * Handles Enriched Narratives, Story Rubrics, and Data Rubrics storage in Azure
 */

const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');
const router = express.Router();

// Initialize Azure Storage
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connectionString) {
  console.error('⚠️ WARNING: Azure Storage connection string not found');
}

const blobServiceClient = connectionString
  ? BlobServiceClient.fromConnectionString(connectionString)
  : null;

const containerNames = {
  enrichedNarratives: 'enriched-narratives',
  storyRubrics: 'story-rubrics',
  dataRubrics: 'data-rubrics'
};

// Middleware to check Azure connection
const requireAzure = (req, res, next) => {
  if (!blobServiceClient) {
    return res.status(503).json({
      error: 'Azure Storage not configured',
      message: 'Storage service is temporarily unavailable'
    });
  }
  next();
};

/**
 * Helper: Get or create container
 */
async function getContainerClient(containerType) {
  const containerName = containerNames[containerType];
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Ensure container exists
  await containerClient.createIfNotExists({
    access: 'private'
  });

  return containerClient;
}

/**
 * Helper: Convert stream to string
 */
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

// ========================================================================
// ENRICHED NARRATIVE ENDPOINTS
// ========================================================================

/**
 * POST /api/rubrics/enriched-narrative
 * Save Enriched Master Narrative
 */
router.post('/enriched-narrative', requireAzure, async (req, res) => {
  try {
    const { enrichedNarrative } = req.body;

    if (!enrichedNarrative || !enrichedNarrative.sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: enrichedNarrative with sessionId'
      });
    }

    console.log(`💾 Saving Enriched Narrative: ${enrichedNarrative.sessionId}`);

    const containerClient = await getContainerClient('enrichedNarratives');
    const blobPath = `${enrichedNarrative.sessionId}.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const content = JSON.stringify(enrichedNarrative, null, 2);
    const uploadResponse = await blockBlobClient.upload(content, content.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json',
        blobCacheControl: 'public, max-age=2592000' // 30 days
      },
      metadata: {
        sessionId: enrichedNarrative.sessionId,
        userId: enrichedNarrative.userId || 'unknown',
        gradeLevel: enrichedNarrative.gradeLevel || 'unknown',
        companion: enrichedNarrative.companion || 'unknown',
        career: enrichedNarrative.career || 'unknown',
        createdAt: new Date().toISOString()
      }
    });

    console.log(`✅ Enriched Narrative saved: ${blobPath}`);
    console.log(`   Size: ${(content.length / 1024).toFixed(2)} KB`);

    res.json({
      success: true,
      url: blockBlobClient.url,
      blobName: blobPath,
      size: content.length,
      requestId: uploadResponse.requestId
    });

  } catch (error) {
    console.error('❌ Failed to save Enriched Narrative:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rubrics/enriched-narrative/:sessionId
 * Retrieve Enriched Master Narrative
 */
router.get('/enriched-narrative/:sessionId', requireAzure, async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`🔍 Retrieving Enriched Narrative: ${sessionId}`);

    const containerClient = await getContainerClient('enrichedNarratives');
    const blobPath = `${sessionId}.json`;
    const blobClient = containerClient.getBlobClient(blobPath);

    const downloadResponse = await blobClient.download();
    const content = await streamToString(downloadResponse.readableStreamBody);

    console.log(`✅ Retrieved Enriched Narrative: ${blobPath}`);
    res.json({
      success: true,
      data: JSON.parse(content),
      blobName: blobPath
    });

  } catch (error) {
    if (error.statusCode === 404) {
      console.log(`⚠️ Enriched Narrative not found: ${req.params.sessionId}`);
      return res.status(404).json({
        success: false,
        message: 'Enriched Narrative not found'
      });
    }
    console.error('❌ Failed to retrieve Enriched Narrative:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================================================
// STORY RUBRIC ENDPOINTS
// ========================================================================

/**
 * POST /api/rubrics/story-rubric
 * Save Story Rubric
 */
router.post('/story-rubric', requireAzure, async (req, res) => {
  try {
    const { storyRubric } = req.body;

    if (!storyRubric || !storyRubric.sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: storyRubric with sessionId'
      });
    }

    console.log(`💾 Saving Story Rubric: ${storyRubric.sessionId}`);

    const containerClient = await getContainerClient('storyRubrics');
    const blobPath = `${storyRubric.sessionId}.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const content = JSON.stringify(storyRubric, null, 2);
    const uploadResponse = await blockBlobClient.upload(content, content.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json',
        blobCacheControl: 'public, max-age=2592000'
      },
      metadata: {
        sessionId: storyRubric.sessionId,
        createdAt: new Date().toISOString()
      }
    });

    console.log(`✅ Story Rubric saved: ${blobPath}`);

    res.json({
      success: true,
      url: blockBlobClient.url,
      blobName: blobPath,
      size: content.length,
      requestId: uploadResponse.requestId
    });

  } catch (error) {
    console.error('❌ Failed to save Story Rubric:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rubrics/story-rubric/:sessionId
 * Retrieve Story Rubric
 */
router.get('/story-rubric/:sessionId', requireAzure, async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`🔍 Retrieving Story Rubric: ${sessionId}`);

    const containerClient = await getContainerClient('storyRubrics');
    const blobPath = `${sessionId}.json`;
    const blobClient = containerClient.getBlobClient(blobPath);

    const downloadResponse = await blobClient.download();
    const content = await streamToString(downloadResponse.readableStreamBody);

    console.log(`✅ Retrieved Story Rubric: ${blobPath}`);
    res.json({
      success: true,
      data: JSON.parse(content),
      blobName: blobPath
    });

  } catch (error) {
    if (error.statusCode === 404) {
      console.log(`⚠️ Story Rubric not found: ${req.params.sessionId}`);
      return res.status(404).json({
        success: false,
        message: 'Story Rubric not found'
      });
    }
    console.error('❌ Failed to retrieve Story Rubric:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================================================
// DATA RUBRIC ENDPOINTS
// ========================================================================

/**
 * POST /api/rubrics/data-rubric
 * Save single Data Rubric
 */
router.post('/data-rubric', requireAzure, async (req, res) => {
  try {
    const { dataRubric } = req.body;

    if (!dataRubric || !dataRubric.sessionId || !dataRubric.container || !dataRubric.subject) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: dataRubric with sessionId, container, and subject'
      });
    }

    const rubricId = `${dataRubric.container}-${dataRubric.subject}`;
    console.log(`💾 Saving Data Rubric: ${dataRubric.sessionId}/${rubricId}`);

    const containerClient = await getContainerClient('dataRubrics');
    const blobPath = `${dataRubric.sessionId}/${rubricId}.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const content = JSON.stringify(dataRubric, null, 2);
    const uploadResponse = await blockBlobClient.upload(content, content.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json',
        blobCacheControl: 'public, max-age=2592000'
      },
      metadata: {
        sessionId: dataRubric.sessionId,
        container: dataRubric.container,
        subject: dataRubric.subject,
        skillId: dataRubric.skill?.id || 'unknown',
        gradeLevel: dataRubric.skill?.gradeLevel || 'unknown',
        createdAt: new Date().toISOString()
      }
    });

    console.log(`✅ Data Rubric saved: ${blobPath}`);

    res.json({
      success: true,
      url: blockBlobClient.url,
      blobName: blobPath,
      size: content.length,
      requestId: uploadResponse.requestId
    });

  } catch (error) {
    console.error('❌ Failed to save Data Rubric:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/rubrics/data-rubrics/batch
 * Save multiple Data Rubrics in batch
 */
router.post('/data-rubrics/batch', requireAzure, async (req, res) => {
  try {
    const { dataRubrics } = req.body;

    if (!Array.isArray(dataRubrics) || dataRubrics.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: dataRubrics array'
      });
    }

    console.log(`💾 Saving ${dataRubrics.length} Data Rubrics in batch...`);

    const results = [];

    // Save all rubrics in parallel
    const promises = dataRubrics.map(async (dataRubric) => {
      const rubricId = `${dataRubric.container}-${dataRubric.subject}`;
      const containerClient = await getContainerClient('dataRubrics');
      const blobPath = `${dataRubric.sessionId}/${rubricId}.json`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

      const content = JSON.stringify(dataRubric, null, 2);
      await blockBlobClient.upload(content, content.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/json',
          blobCacheControl: 'public, max-age=2592000'
        },
        metadata: {
          sessionId: dataRubric.sessionId,
          container: dataRubric.container,
          subject: dataRubric.subject,
          skillId: dataRubric.skill?.id || 'unknown',
          gradeLevel: dataRubric.skill?.gradeLevel || 'unknown',
          createdAt: new Date().toISOString()
        }
      });

      return { blobPath, size: content.length };
    });

    const uploadResults = await Promise.all(promises);

    console.log(`✅ All ${dataRubrics.length} Data Rubrics saved`);

    res.json({
      success: true,
      count: dataRubrics.length,
      results: uploadResults
    });

  } catch (error) {
    console.error('❌ Failed to save Data Rubrics batch:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rubrics/data-rubric/:sessionId/:container/:subject
 * Retrieve single Data Rubric
 */
router.get('/data-rubric/:sessionId/:container/:subject', requireAzure, async (req, res) => {
  try {
    const { sessionId, container, subject } = req.params;
    const rubricId = `${container}-${subject}`;
    console.log(`🔍 Retrieving Data Rubric: ${sessionId}/${rubricId}`);

    const containerClient = await getContainerClient('dataRubrics');
    const blobPath = `${sessionId}/${rubricId}.json`;
    const blobClient = containerClient.getBlobClient(blobPath);

    const downloadResponse = await blobClient.download();
    const content = await streamToString(downloadResponse.readableStreamBody);

    console.log(`✅ Retrieved Data Rubric: ${blobPath}`);
    res.json({
      success: true,
      data: JSON.parse(content),
      blobName: blobPath
    });

  } catch (error) {
    if (error.statusCode === 404) {
      console.log(`⚠️ Data Rubric not found: ${req.params.sessionId}/${req.params.container}-${req.params.subject}`);
      return res.status(404).json({
        success: false,
        message: 'Data Rubric not found'
      });
    }
    console.error('❌ Failed to retrieve Data Rubric:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rubrics/data-rubrics/:sessionId
 * Retrieve all Data Rubrics for a session (12 total: 3 containers × 4 subjects)
 */
router.get('/data-rubrics/:sessionId', requireAzure, async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`🔍 Retrieving all Data Rubrics for session: ${sessionId}`);

    const containers = ['LEARN', 'EXPERIENCE', 'DISCOVER'];
    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];

    const rubrics = [];

    // Fetch all rubrics in parallel
    const promises = containers.flatMap(container =>
      subjects.map(async (subject) => {
        try {
          const rubricId = `${container}-${subject}`;
          const containerClient = await getContainerClient('dataRubrics');
          const blobPath = `${sessionId}/${rubricId}.json`;
          const blobClient = containerClient.getBlobClient(blobPath);

          const downloadResponse = await blobClient.download();
          const content = await streamToString(downloadResponse.readableStreamBody);

          return JSON.parse(content);
        } catch (error) {
          if (error.statusCode === 404) {
            return null; // Rubric doesn't exist yet
          }
          throw error;
        }
      })
    );

    const results = await Promise.all(promises);

    // Filter out nulls
    for (const rubric of results) {
      if (rubric) {
        rubrics.push(rubric);
      }
    }

    console.log(`✅ Retrieved ${rubrics.length} Data Rubrics`);

    res.json({
      success: true,
      count: rubrics.length,
      data: rubrics
    });

  } catch (error) {
    console.error('❌ Failed to retrieve Data Rubrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/rubrics/data-rubric
 * Update existing Data Rubric (for adaptive content)
 */
router.put('/data-rubric', requireAzure, async (req, res) => {
  try {
    const { dataRubric } = req.body;

    if (!dataRubric || !dataRubric.sessionId || !dataRubric.container || !dataRubric.subject) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: dataRubric with sessionId, container, and subject'
      });
    }

    const rubricId = `${dataRubric.container}-${dataRubric.subject}`;
    console.log(`🔄 Updating Data Rubric: ${dataRubric.sessionId}/${rubricId}`);

    // Use same logic as POST (overwrites existing)
    const containerClient = await getContainerClient('dataRubrics');
    const blobPath = `${dataRubric.sessionId}/${rubricId}.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const content = JSON.stringify(dataRubric, null, 2);
    const uploadResponse = await blockBlobClient.upload(content, content.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json',
        blobCacheControl: 'public, max-age=2592000'
      },
      metadata: {
        sessionId: dataRubric.sessionId,
        container: dataRubric.container,
        subject: dataRubric.subject,
        skillId: dataRubric.skill?.id || 'unknown',
        gradeLevel: dataRubric.skill?.gradeLevel || 'unknown',
        updatedAt: new Date().toISOString()
      }
    });

    console.log(`✅ Data Rubric updated: ${blobPath}`);

    res.json({
      success: true,
      url: blockBlobClient.url,
      blobName: blobPath,
      size: content.length,
      requestId: uploadResponse.requestId
    });

  } catch (error) {
    console.error('❌ Failed to update Data Rubric:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/rubrics/test-connection
 * Test Azure Storage connection
 */
router.post('/test-connection', requireAzure, async (req, res) => {
  try {
    console.log('🔍 Testing Azure Storage connection for rubrics...');

    const containers = [];
    for await (const container of blobServiceClient.listContainers()) {
      containers.push(container.name);
    }

    // Ensure rubric containers exist
    for (const containerType of Object.keys(containerNames)) {
      await getContainerClient(containerType);
    }

    console.log('✅ Connection test successful');

    res.json({
      success: true,
      message: 'Azure Storage connection working',
      containers: containers,
      rubricContainers: Object.values(containerNames)
    });

  } catch (error) {
    console.error('❌ Connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================================================
// SESSION STATE ENDPOINTS
// ========================================================================

/**
 * POST /api/rubrics/session-state
 * Save session state
 */
router.post('/session-state', requireAzure, async (req, res) => {
  try {
    const { sessionState } = req.body;

    if (!sessionState || !sessionState.sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: sessionState with sessionId'
      });
    }

    console.log(`💾 Saving session state: ${sessionState.sessionId}`);

    const containerClient = await getContainerClient('dataRubrics');
    const blobPath = `sessions/${sessionState.sessionId}-state.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const content = JSON.stringify(sessionState, null, 2);
    const uploadResponse = await blockBlobClient.upload(content, content.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json',
        blobCacheControl: 'public, max-age=600' // 10 minutes (session data changes frequently)
      },
      metadata: {
        sessionId: sessionState.sessionId,
        userId: sessionState.userId,
        activeDevice: sessionState.activeDevice?.deviceId || 'unknown',
        createdAt: new Date().toISOString()
      }
    });

    console.log(`✅ Session state saved: ${blobPath}`);

    res.json({
      success: true,
      blobName: blobPath,
      size: content.length,
      requestId: uploadResponse.requestId
    });

  } catch (error) {
    console.error('❌ Failed to save session state:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rubrics/session-state/:sessionId
 * Retrieve session state
 */
router.get('/session-state/:sessionId', requireAzure, async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`🔍 Retrieving session state: ${sessionId}`);

    const containerClient = await getContainerClient('dataRubrics');
    const blobPath = `sessions/${sessionId}-state.json`;
    const blobClient = containerClient.getBlobClient(blobPath);

    const downloadResponse = await blobClient.download();
    const content = await streamToString(downloadResponse.readableStreamBody);

    console.log(`✅ Retrieved session state: ${blobPath}`);
    res.json({
      success: true,
      data: JSON.parse(content),
      blobName: blobPath
    });

  } catch (error) {
    if (error.statusCode === 404) {
      console.log(`⚠️ Session state not found: ${req.params.sessionId}`);
      return res.status(404).json({
        success: false,
        message: 'Session state not found'
      });
    }
    console.error('❌ Failed to retrieve session state:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
