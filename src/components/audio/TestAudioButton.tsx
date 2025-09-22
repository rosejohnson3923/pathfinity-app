/**
 * Test Audio Button
 * Simple button to test if browser TTS is working
 */

import React from 'react';

export const TestAudioButton: React.FC = () => {
  const testAudio = () => {
    console.warn('🔊 TEST: Testing browser speech synthesis...');

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser!');
      return;
    }

    // Simple test
    const utterance = new SpeechSynthesisUtterance('Hello! Testing audio. Can you hear me?');
    utterance.volume = 1.0;
    utterance.rate = 1.0;

    utterance.onstart = () => console.warn('🔊 TEST: Speech started');
    utterance.onend = () => console.warn('🔊 TEST: Speech ended');
    utterance.onerror = (e) => console.error('🔊 TEST: Speech error:', e);

    speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={testAudio}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      🔊 Test Audio
    </button>
  );
};