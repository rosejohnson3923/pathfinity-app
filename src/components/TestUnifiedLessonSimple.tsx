/**
 * Simple test component to debug rendering issues
 */

import React from 'react';

export const TestUnifiedLessonSimple: React.FC = () => {
  console.log('🧪 Simple test component rendering...');

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>🧪 Simple Test Component</h1>
      <p>This should render if React routing is working correctly.</p>
      <div style={{
        backgroundColor: '#f0f8ff',
        padding: '20px',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h2>Debug Information</h2>
        <p>✅ React component is rendering</p>
        <p>✅ Styles are working</p>
        <p>✅ Route configuration is correct</p>
        <p>Date: {new Date().toISOString()}</p>
      </div>
    </div>
  );
};