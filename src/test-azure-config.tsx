/**
 * Test Azure Configuration
 * Verifies that Azure keys are properly loaded in the frontend
 */

import React, { useEffect, useState } from 'react';

export const TestAzureConfig: React.FC = () => {
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConfig = () => {
      console.log('🔍 Testing Azure Configuration...');

      // Check environment variables directly
      const envStatus = {
        hasSpeechKey: !!import.meta.env.VITE_AZURE_SPEECH_KEY,
        hasSpeechRegion: !!import.meta.env.VITE_AZURE_SPEECH_REGION,
        hasOpenAIKey: !!import.meta.env.VITE_AZURE_OPENAI_API_KEY,
        hasAPIUrl: !!import.meta.env.VITE_API_URL,
        apiUrl: import.meta.env.VITE_API_URL,
        mode: import.meta.env.MODE,
        // Show partial key for debugging (first 10 chars)
        speechKeyPreview: import.meta.env.VITE_AZURE_SPEECH_KEY ?
          import.meta.env.VITE_AZURE_SPEECH_KEY.substring(0, 10) + '...' : 'Not found'
      };

      console.log('📋 Environment Variables Status:', envStatus);

      setConfigStatus({
        environment: envStatus,
        timestamp: new Date().toISOString()
      });

      setLoading(false);
    };

    checkConfig();
  }, []);

  // Test TTS directly
  const testBrowserTTS = () => {
    console.log('🔊 Testing Browser TTS...');
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Testing speech synthesis. Can you hear me?');
      utterance.onstart = () => console.log('🔊 Speech started');
      utterance.onend = () => console.log('🔊 Speech ended');
      utterance.onerror = (e) => console.error('🔊 Speech error:', e);
      speechSynthesis.speak(utterance);
    } else {
      console.error('❌ Speech synthesis not supported');
    }
  };

  const testAPIEndpoint = async () => {
    console.log('🌐 Testing API Server...');
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      console.error('❌ API URL not configured');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      console.log('✅ API Server Response:', data);
      alert(`API Server Status: ${data.status}\nAzure Storage: ${data.services?.storage ? 'Connected' : 'Not Connected'}`);
    } catch (error) {
      console.error('❌ API Server Error:', error);
      alert(`Failed to connect to API server at ${apiUrl}`);
    }
  };

  if (loading) {
    return <div>Loading configuration...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Azure Configuration Test</h2>

      <h3>Environment Variables</h3>
      <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify(configStatus?.environment, null, 2)}
      </pre>

      {configStatus?.error && (
        <>
          <h3>Error</h3>
          <pre style={{ background: '#ffebee', padding: '10px', borderRadius: '5px', color: '#c62828' }}>
            {configStatus.error}
          </pre>
        </>
      )}

      <h3>Test Actions</h3>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button
          onClick={testBrowserTTS}
          style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Browser TTS
        </button>

        <button
          onClick={testAPIEndpoint}
          style={{
            padding: '10px 20px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test API Server
        </button>
      </div>

      <div style={{ marginTop: '20px', color: '#666' }}>
        <p>Check the browser console for detailed logs</p>
        <p>Timestamp: {configStatus?.timestamp}</p>
      </div>
    </div>
  );
};

export default TestAzureConfig;