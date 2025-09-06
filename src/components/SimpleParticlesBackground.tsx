// Simple fallback particles background using CSS animations
import React from 'react';

interface SimpleParticlesBackgroundProps {
  theme?: 'learning' | 'experience' | 'discover' | 'general';
  particleCount?: number;
}

export const SimpleParticlesBackground: React.FC<SimpleParticlesBackgroundProps> = ({
  theme = 'general',
  particleCount = 20
}) => {
  console.log('🎨 SimpleParticlesBackground rendering with theme:', theme, 'count:', particleCount);
  
  // Check if we're in dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const getThemeSymbols = (theme: string) => {
    switch (theme) {
      case 'learning':
        return ['📚', '✏️', '🧠', '💡', '📝', '🎯'];
      case 'experience':
        return ['💼', '🏢', '⚡', '🎯', '🚀', '⭐'];
      case 'discover':
        return ['🔍', '📖', '✨', '🌟', '🎨', '🔮'];
      default:
        return ['⭐', '✨', '💫', '🌟', '💎', '🎆'];
    }
  };

  const symbols = getThemeSymbols(theme);
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    left: Math.random() * 100,
    animationDelay: Math.random() * 10,
    animationDuration: 15 + Math.random() * 10,
    size: 1 + Math.random() * 1.5,
  }));

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      
      {/* Floating colored dots */}
      {Array.from({ length: 60 }, (_, i) => {
        // Different colors for light/dark mode
        const colors = isDarkMode 
          ? ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD700', '#E879F9', '#A78BFA'] // More colors for variety
          : ['#8B5CF6', '#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EC4899']; // More vibrant for light mode
        
        const color = colors[i % colors.length];
        const shadowIntensity = isDarkMode ? '20px' : '12px';
        const shadowOpacity = isDarkMode ? color : `${color}88`; // Less transparency for light mode
        
        // Vary sizes more
        const size = 4 + Math.random() * 8; // 4-12px
        
        return (
          <div
            key={`dot-${i}`}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: `0 0 ${shadowIntensity} ${shadowOpacity}`,
              opacity: isDarkMode ? 0.9 : 0.7, // More visible in both modes
              animation: `${i % 3 === 0 ? 'pulse' : i % 3 === 1 ? 'float' : 'twinkle'} ${2 + Math.random() * 3}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        );
      })}

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-110vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-10px) translateX(5px);
          }
          66% {
            transform: translateY(5px) translateX(-5px);
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleParticlesBackground;