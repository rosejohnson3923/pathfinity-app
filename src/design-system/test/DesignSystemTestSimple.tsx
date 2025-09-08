import React, { useState, useEffect } from 'react';

export const DesignSystemTest: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const cardStyle = {
    background: theme === 'dark' ? '#1f2937' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  const sectionStyle = {
    marginBottom: '48px'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme === 'dark' ? '#111827' : '#f9fafb',
      color: theme === 'dark' ? '#f3f4f6' : '#111827',
      transition: 'all 0.3s ease',
      padding: '40px 20px'
    }}>
      {/* Theme Switcher */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
        <button 
          onClick={toggleTheme}
          style={{
            padding: '12px 24px',
            background: theme === 'dark' ? '#6b21a8' : '#9333ea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
        </button>
      </div>

      {/* Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px', paddingTop: '20px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '16px' }}>
            Design System Test
          </h1>
          <p style={{ fontSize: '1.25rem', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
            Testing the new token-based design system with automatic theme switching
          </p>
        </div>

        {/* Color Showcase */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '24px' }}>
            Color System
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={cardStyle}>
              <div style={{ 
                width: '100%', 
                height: '60px', 
                background: '#9333ea',
                borderRadius: '8px',
                marginBottom: '8px'
              }} />
              <p>Primary Purple</p>
            </div>
            <div style={cardStyle}>
              <div style={{ 
                width: '100%', 
                height: '60px', 
                background: '#14b8a6',
                borderRadius: '8px',
                marginBottom: '8px'
              }} />
              <p>Experience Teal</p>
            </div>
            <div style={cardStyle}>
              <div style={{ 
                width: '100%', 
                height: '60px', 
                background: '#d946ef',
                borderRadius: '8px',
                marginBottom: '8px'
              }} />
              <p>Discover Magenta</p>
            </div>
            <div style={cardStyle}>
              <div style={{ 
                width: '100%', 
                height: '60px', 
                background: theme === 'dark' ? '#374151' : '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '8px'
              }} />
              <p>Background Color</p>
            </div>
          </div>
        </section>

        {/* Typography Showcase */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '24px' }}>
            Typography Scale
          </h2>
          <div style={cardStyle}>
            <p style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '8px' }}>Heading 3XL Bold</p>
            <p style={{ fontSize: '1.875rem', fontWeight: '600', marginBottom: '8px' }}>Heading 2XL Semibold</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '500', marginBottom: '8px' }}>Heading XL Medium</p>
            <p style={{ fontSize: '1.125rem', marginBottom: '8px' }}>Large Text</p>
            <p style={{ fontSize: '1rem', marginBottom: '8px', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Base Text (Secondary)</p>
            <p style={{ fontSize: '0.875rem', color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}>Small Text (Tertiary)</p>
          </div>
        </section>

        {/* Button Examples */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '24px' }}>
            Button Components
          </h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button style={{
              padding: '10px 20px',
              background: '#9333ea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              Primary Button
            </button>
            <button style={{
              padding: '10px 20px',
              background: theme === 'dark' ? '#374151' : '#e5e7eb',
              color: theme === 'dark' ? '#f3f4f6' : '#111827',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              Secondary Button
            </button>
            <button style={{
              padding: '6px 12px',
              background: '#9333ea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Small Button
            </button>
            <button style={{
              padding: '14px 28px',
              background: '#9333ea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '500'
            }}>
              Large Button
            </button>
          </div>
        </section>

        {/* Shadow Examples */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '24px' }}>
            Shadow System
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div style={{
              ...cardStyle,
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
            }}>
              <p style={{ fontWeight: '500' }}>Shadow XS</p>
            </div>
            <div style={{
              ...cardStyle,
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)'
            }}>
              <p style={{ fontWeight: '500' }}>Shadow SM</p>
            </div>
            <div style={{
              ...cardStyle,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)'
            }}>
              <p style={{ fontWeight: '500' }}>Shadow MD</p>
            </div>
            <div style={{
              ...cardStyle,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)'
            }}>
              <p style={{ fontWeight: '500' }}>Shadow LG</p>
            </div>
          </div>
        </section>

        {/* Container Examples */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '24px' }}>
            Themed Containers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ 
              padding: '32px',
              borderRadius: '16px',
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)'
                : 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              color: theme === 'dark' ? '#f3f4f6' : '#111827'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Learn Container</h3>
              <p style={{ color: theme === 'dark' ? '#d8b4fe' : '#6b21a8' }}>
                Purple gradient background with automatic theme adjustment
              </p>
            </div>
            <div style={{ 
              padding: '32px',
              borderRadius: '16px',
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #134e4a 0%, #115e59 100%)'
                : 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
              color: theme === 'dark' ? '#f3f4f6' : '#111827'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Experience Container</h3>
              <p style={{ color: theme === 'dark' ? '#5eead4' : '#0d9488' }}>
                Teal gradient background with automatic theme adjustment
              </p>
            </div>
            <div style={{ 
              padding: '32px',
              borderRadius: '16px',
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #701a75 0%, #86198f 100%)'
                : 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
              color: theme === 'dark' ? '#f3f4f6' : '#111827'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Discover Container</h3>
              <p style={{ color: theme === 'dark' ? '#f0abfc' : '#a21caf' }}>
                Magenta gradient background with automatic theme adjustment
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Summary */}
        <section style={{...sectionStyle, marginTop: '60px'}}>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '24px' }}>
            Key Benefits of New System
          </h2>
          <div style={cardStyle}>
            <ul style={{ lineHeight: '2', fontSize: '1.125rem' }}>
              <li>✅ Single source of truth for all design values</li>
              <li>✅ Automatic theme switching without JavaScript logic</li>
              <li>✅ No inline styles competing with CSS</li>
              <li>✅ Predictable cascade and specificity</li>
              <li>✅ Easy to debug and maintain</li>
              <li>✅ Gradual migration path - adopt incrementally</li>
              <li>✅ Consistent styling across all components</li>
              <li>✅ Changes won't get reverted due to conflicts</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};