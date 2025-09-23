/**
 * Text-to-Speech API Routes
 * Handles Azure Cognitive Services Speech synthesis
 */

const express = require('express');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { BlobServiceClient } = require('@azure/storage-blob');
const router = express.Router();

// Azure Speech configuration - Using AI Foundry key
const speechKey = process.env.AZURE_AI_FOUNDRY_KEY || process.env.AZURE_SPEECH_KEY;
const speechRegion = process.env.AZURE_AI_FOUNDRY_REGION || process.env.AZURE_SPEECH_REGION || 'eastus';

// Azure Storage configuration - lazy initialization to prevent hanging
let blobServiceClient = null;
const getBlobServiceClient = () => {
  if (!blobServiceClient && process.env.AZURE_STORAGE_CONNECTION_STRING) {
    try {
      blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    } catch (error) {
      console.error('Failed to initialize blob service client:', error);
    }
  }
  return blobServiceClient;
};

/**
 * POST /api/tts/generate
 * Generate speech from SSML
 */
router.post('/generate', async (req, res) => {
  try {
    const { ssml, companion, gradeLevel, scriptId = 'unknown', variables = {} } = req.body;

    if (!ssml) {
      return res.status(400).json({
        error: 'Missing required field: ssml'
      });
    }

    if (!speechKey) {
      console.error('⚠️ Azure Speech key not configured');
      return res.status(503).json({
        error: 'TTS service not configured'
      });
    }

    // Extract text content from SSML for logging
    // Remove SSML tags to get the actual text being spoken
    const textContent = ssml
      .replace(/<[^>]*>/g, '') // Remove all XML/SSML tags
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();

    console.log(`🎤 Generating TTS for ${companion} (Grade ${gradeLevel})`);
    console.log(`   🏷️ Script ID: ${scriptId}`);
    if (Object.keys(variables).length > 0) {
      console.log(`   📊 Variables: ${JSON.stringify(variables)}`);
    }
    console.log(`   📝 Text: "${textContent}"`);
    console.log(`   SSML length: ${ssml.length} characters`);
    console.log(`   Text length: ${textContent.length} characters`);
    console.log(`   Speech Region: ${speechRegion}`);
    console.log(`   Key configured: ${speechKey ? 'Yes' : 'No'}`);

    // Configure Azure Speech
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    // Add timeout
    speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "5000");
    speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "5000");

    // Create synthesizer with audio output stream
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null); // null for getting audio data

    // Generate speech from SSML
    console.log('   Starting synthesis...');
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        synthesizer.close();
        reject(new Error('TTS synthesis timeout after 10 seconds'));
      }, 10000);

      synthesizer.speakSsmlAsync(
        ssml,
        result => {
          clearTimeout(timeout);
          synthesizer.close();
          console.log('   Synthesis completed');
          resolve(result);
        },
        error => {
          clearTimeout(timeout);
          synthesizer.close();
          console.error('   Synthesis error:', error);
          reject(new Error(error));
        }
      );
    });

    // Check if synthesis was successful
    if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
      console.log(`✅ TTS generated successfully`);
      console.log(`   Audio size: ${result.audioData.byteLength} bytes`);

      // Log TTS metrics to storage if configured
      if (blobServiceClient) {
        try {
          const containerClient = blobServiceClient.getContainerClient('metrics');

          // Ensure container exists (only try to create if not exists)
          try {
            await containerClient.createIfNotExists();
          } catch (createError) {
            // Container might already exist, continue
            console.log('   ℹ️ Metrics container status:', createError.message);
          }

          const timestamp = new Date().toISOString();
          const blobName = `tts-logs/${timestamp.split('T')[0]}/tts-${Date.now()}.json`;
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);

          const metricsData = {
            timestamp,
            scriptId,
            variables,
            companion,
            gradeLevel,
            textContent,
            textLength: textContent.length,
            ssmlLength: ssml.length,
            audioSize: result.audioData.byteLength,
            duration: result.audioDuration / 10000000, // Convert to seconds
            region: speechRegion
          };

          await blockBlobClient.upload(
            JSON.stringify(metricsData, null, 2),
            JSON.stringify(metricsData).length,
            {
              blobHTTPHeaders: { blobContentType: 'application/json' }
            }
          );

          console.log(`   📊 Metrics logged to: ${blobName}`);
        } catch (metricsError) {
          console.warn('   ⚠️ Could not log metrics:', metricsError.message);
        }
      }

      // Return audio data as response
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': result.audioData.byteLength,
        'X-Companion': companion,
        'X-Grade-Level': gradeLevel
      });

      res.send(Buffer.from(result.audioData));
    } else {
      console.error('TTS synthesis failed:', result.errorDetails);
      res.status(500).json({
        error: 'Speech synthesis failed',
        details: result.errorDetails
      });
    }

  } catch (error) {
    console.error('Error generating TTS:', error);
    res.status(500).json({
      error: error.message || 'TTS generation failed'
    });
  }
});

/**
 * POST /api/tts/save-audio
 * Save generated audio to Azure Storage
 */
router.post('/save-audio', async (req, res) => {
  try {
    const { key, audioData, metadata } = req.body;

    if (!key || !audioData) {
      return res.status(400).json({
        error: 'Missing required fields: key and audioData'
      });
    }

    if (!blobServiceClient) {
      return res.status(503).json({
        error: 'Azure Storage not configured'
      });
    }

    console.log(`📤 Saving audio to Azure: ${key}`);

    const containerClient = blobServiceClient.getContainerClient('audio-narration');

    // Create blob path
    const { companion = 'unknown', gradeLevel = 'unknown' } = metadata || {};
    const blobName = `${gradeLevel}/${companion}/${key}.mp3`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Convert base64 to buffer if needed
    const buffer = Buffer.isBuffer(audioData)
      ? audioData
      : Buffer.from(audioData, 'base64');

    // Upload audio
    const uploadResponse = await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: 'audio/mpeg',
        blobCacheControl: 'public, max-age=2592000' // 30 days
      },
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString()
      }
    });

    console.log(`✅ Audio saved: ${blobName}`);
    console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);

    res.json({
      success: true,
      blobName,
      url: blockBlobClient.url,
      size: buffer.length,
      requestId: uploadResponse.requestId
    });

  } catch (error) {
    console.error('Error saving audio:', error);
    res.status(500).json({
      error: error.message || 'Failed to save audio'
    });
  }
});

/**
 * GET /api/tts/audio/:key
 * Retrieve audio from Azure Storage
 */
router.get('/audio/:key', async (req, res) => {
  try {
    const { key } = req.params;

    if (!blobServiceClient) {
      return res.status(503).json({
        error: 'Azure Storage not configured'
      });
    }

    console.log(`📥 Retrieving audio: ${key}`);

    const containerClient = blobServiceClient.getContainerClient('audio-narration');

    // Search for the audio file
    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.name.includes(key)) {
        const blobClient = containerClient.getBlobClient(blob.name);
        const downloadResponse = await blobClient.download();

        console.log(`✅ Found audio: ${blob.name}`);

        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': blob.properties.contentLength,
          'Cache-Control': 'public, max-age=2592000'
        });

        downloadResponse.readableStreamBody.pipe(res);
        return;
      }
    }

    console.log(`❌ Audio not found: ${key}`);
    res.status(404).json({
      error: 'Audio not found'
    });

  } catch (error) {
    console.error('Error retrieving audio:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve audio'
    });
  }
});

/**
 * GET /api/tts/voices
 * Get available Azure voices
 */
router.get('/voices', async (req, res) => {
  try {
    const voices = [
      // Male voices
      { id: 'en-US-BrianNeural', gender: 'Male', description: 'Professional adult male' },
      { id: 'en-US-ChristopherNeural', gender: 'Male', description: 'Warm adult male' },
      { id: 'en-US-DavisNeural', gender: 'Male', description: 'Young enthusiastic male' },
      { id: 'en-US-EricNeural', gender: 'Male', description: 'Conversational male' },
      { id: 'en-US-GuyNeural', gender: 'Male', description: 'Newscast male' },
      { id: 'en-US-JasonNeural', gender: 'Male', description: 'Teenage male' },
      { id: 'en-US-TonyNeural', gender: 'Male', description: 'Professional male' },

      // Female voices
      { id: 'en-US-AmberNeural', gender: 'Female', description: 'Warm female' },
      { id: 'en-US-AriaNeural', gender: 'Female', description: 'Conversational female' },
      { id: 'en-US-AshleyNeural', gender: 'Female', description: 'Upbeat female' },
      { id: 'en-US-CoraNeural', gender: 'Female', description: 'Professional female' },
      { id: 'en-US-ElizabethNeural', gender: 'Female', description: 'Friendly female' },
      { id: 'en-US-JennyNeural', gender: 'Female', description: 'General female' },
      { id: 'en-US-MichelleNeural', gender: 'Female', description: 'Young female' },
      { id: 'en-US-MonicaNeural', gender: 'Female', description: 'Professional female' },
      { id: 'en-US-SaraNeural', gender: 'Female', description: 'Pleasant female' },

      // Child voices
      { id: 'en-US-AnaNeural', gender: 'Child', description: 'Child female' }
    ];

    res.json({
      success: true,
      voices,
      region: speechRegion
    });

  } catch (error) {
    console.error('Error getting voices:', error);
    res.status(500).json({
      error: error.message || 'Failed to get voices'
    });
  }
});

module.exports = router;