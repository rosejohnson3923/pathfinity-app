import React, { useState, useEffect } from 'react';
import '../tokens/colors.css';
import '../tokens/spacing.css';
import '../tokens/layout.css';
import '../tokens/typography.css';
import '../tokens/effects.css';
import '../components/base.css';
import '../components/containers.css';
import { BentoCardMigrated } from '../examples/BentoCard-migrated';

export const DesignSystemTest: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="theme-container" style={{ 
      minHeight: '100vh', 
      background: theme === 'dark' ? '#111827' : '#ffffff',
      color: theme === 'dark' ? '#f3f4f6' : '#111827',
      transition: 'all 0.3s ease'
    }}>
      {/* Theme Switcher */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
        <button 
          onClick={toggleTheme}
          style={{
            padding: '10px 20px',
            background: theme === 'dark' ? '#6b21a8' : '#9333ea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
        </button>
      </div>

      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px', paddingTop: '40px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '16px' }}>Design System Test</h1>
          <p style={{ fontSize: '1.25rem', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
            Testing the new token-based design system with automatic theme switching
          </p>
        </div>

        {/* Color Showcase */}
        <section className="container-section">
          <h2 className="section-title">Color System</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <div style={{ 
                width: '100%', 
                height: '60px', 
                background: 'var(--purple-500)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-2)'
              }} />
              <p className="text-sm text-secondary">Primary Purple</p>
            </div>
            <div className="card">
              <div style={{ 
                width: '100%', 
                height: '60px', 
                background: 'var(--teal-500)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-2)'
              }} />
              <p className="text-sm text-secondary">Experience Teal</p>
            </div>
            <div className="card">
              <div style={{ 
                width: '100%', 
                height: '60px', 
                background: 'var(--magenta-500)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-2)'
              }} />
              <p className="text-sm text-secondary">Discover Magenta</p>
            </div>
            <div className="card">
              <div style={{ 
                width: '100%', 
                height: '60px', 
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-2)'
              }} />
              <p className="text-sm text-secondary">Background</p>
            </div>
          </div>
        </section>

        {/* Typography Showcase */}
        <section className="container-section">
          <h2 className="section-title">Typography Scale</h2>
          <div className="card card-spacious">
            <p className="text-3xl font-bold text-primary">Heading 3XL Bold</p>
            <p className="text-2xl font-semibold text-primary">Heading 2XL Semibold</p>
            <p className="text-xl font-medium text-primary">Heading XL Medium</p>
            <p className="text-lg text-primary">Large Text</p>
            <p className="text-base text-secondary">Base Text (Secondary)</p>
            <p className="text-sm text-tertiary">Small Text (Tertiary)</p>
          </div>
        </section>

        {/* Spacing Showcase */}
        <section className="container-section">
          <h2 className="section-title">Spacing System</h2>
          <div className="card">
            {[1, 2, 4, 6, 8, 12, 16].map(space => (
              <div key={space} className="flex items-center gap-4 my-2">
                <span className="text-sm text-tertiary" style={{ width: '60px' }}>
                  space-{space}
                </span>
                <div style={{
                  width: `var(--space-${space})`,
                  height: '24px',
                  background: 'var(--purple-500)',
                  borderRadius: 'var(--radius-sm)'
                }} />
              </div>
            ))}
          </div>
        </section>

        {/* Button Showcase */}
        <section className="container-section">
          <h2 className="section-title">Button Components</h2>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <button className="btn btn-primary">Primary</button>
              <button className="btn btn-secondary">Secondary</button>
            </div>
            <div className="flex gap-4">
              <button className="btn btn-primary btn-sm">Small Primary</button>
              <button className="btn btn-primary btn-lg">Large Primary</button>
            </div>
          </div>
        </section>

        {/* Shadow Showcase */}
        <section className="container-section">
          <h2 className="section-title">Shadow System</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['xs', 'sm', 'md', 'lg'].map(size => (
              <div 
                key={size}
                className="card"
                style={{ boxShadow: `var(--shadow-current-${size})` }}
              >
                <p className="text-sm font-medium">Shadow {size.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bento Card Examples */}
        <section className="container-section">
          <h2 className="section-title">Migrated Bento Cards</h2>
          <p className="section-description">
            These cards use the new design system - no inline styles, automatic theme switching
          </p>
          <div className="container-grid">
            <BentoCardMigrated
              title="Welcome Back!"
              description="Continue your learning journey"
              type="welcome"
              grade="professional"
              isActive={true}
            />
            <BentoCardMigrated
              title="Skills Progress"
              description="Track your skill development"
              type="skills"
              grade="college"
            />
            <BentoCardMigrated
              title="Projects"
              description="Showcase your work"
              type="projects"
              grade="high"
            />
            <BentoCardMigrated
              title="Achievements"
              description="Celebrate your success"
              type="achievements"
              grade="middle"
            />
          </div>
        </section>

        {/* Container Examples */}
        <section className="container-section">
          <h2 className="section-title">Themed Containers</h2>
          <div className="flex flex-col gap-6">
            <div className="container-learn" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)' }}>
              <h3 className="text-2xl font-semibold mb-2">Learn Container</h3>
              <p className="text-secondary">Purple gradient background with automatic theme adjustment</p>
            </div>
            <div className="container-experience" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)' }}>
              <h3 className="text-2xl font-semibold mb-2">Experience Container</h3>
              <p className="text-secondary">Teal gradient background with automatic theme adjustment</p>
            </div>
            <div className="container-discover" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)' }}>
              <h3 className="text-2xl font-semibold mb-2">Discover Container</h3>
              <p className="text-secondary">Magenta gradient background with automatic theme adjustment</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};