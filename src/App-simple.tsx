import React from 'react';

function App() {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#1f2937', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀 Pathfinity - System Check</h1>
      <p>✅ React is working!</p>
      <p>✅ Basic rendering functional!</p>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#2563eb', borderRadius: '8px' }}>
        <h2>🧪 Chemical Tool Test</h2>
        <button 
          onClick={() => alert('Button works!')}
          style={{ 
            backgroundColor: 'white', 
            color: '#2563eb', 
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;