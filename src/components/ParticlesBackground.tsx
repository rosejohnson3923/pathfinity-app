// ================================================================
// PARTICLES BACKGROUND - Engaging animated background for transitions
// Inspired by react-bits repository for engaging educational UX
// ================================================================

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  symbol?: string;
}

interface ParticlesBackgroundProps {
  className?: string;
  particleCount?: number;
  speed?: number;
  theme?: 'learning' | 'experience' | 'discover' | 'general';
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({
  className = '',
  particleCount = 50,
  speed = 1,
  theme = 'general'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  // Theme-specific colors and symbols
  const getThemeConfig = (theme: string) => {
    switch (theme) {
      case 'learning':
        return {
          colors: ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7'],
          symbols: ['📚', '✏️', '🧠', '💡', '📝', '🎯'],
          baseSpeed: 0.5
        };
      case 'experience':
        return {
          colors: ['#8B5CF6', '#A855F7', '#C084FC', '#E879F9'],
          symbols: ['💼', '🏢', '⚡', '🎯', '🚀', '⭐'],
          baseSpeed: 0.8
        };
      case 'discover':
        return {
          colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
          symbols: ['🔍', '📖', '✨', '🌟', '🎨', '🔮'],
          baseSpeed: 0.6
        };
      default:
        return {
          colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'],
          symbols: ['⭐', '✨', '💫', '🌟', '💎', '🎆'],
          baseSpeed: 0.7
        };
    }
  };

  const initializeParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { colors, symbols, baseSpeed } = getThemeConfig(theme);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * baseSpeed * speed,
        vy: (Math.random() - 0.5) * baseSpeed * speed,
        size: 3 + Math.random() * 6, // Only dots, consistent size range
        opacity: 0.4 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        symbol: undefined // No symbols, only dots
      });
    }

    particlesRef.current = particles;
  };

  const updateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    particlesRef.current.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      // Subtle opacity pulsing
      particle.opacity += Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.01;
      particle.opacity = Math.max(0.1, Math.min(1, particle.opacity));
    });
  };

  const drawParticles = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw particles
    particlesRef.current.forEach((particle) => {
      ctx.globalAlpha = particle.opacity;

      if (particle.symbol) {
        // Draw emoji symbol
        ctx.font = `${particle.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(particle.symbol, particle.x, particle.y);
      } else {
        // Draw colored circle
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw connections between nearby particles (optional - disabled for cleaner look)
    // Uncomment if connections are desired
    /*
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < particlesRef.current.length; i++) {
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const p1 = particlesRef.current[i];
        const p2 = particlesRef.current[j];
        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

        if (distance < 80) {
          const opacity = (1 - distance / 80) * 0.15;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    */

    ctx.globalAlpha = 1;
  };

  const animate = () => {
    updateParticles();
    drawParticles();
    animationRef.current = requestAnimationFrame(animate);
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initializeParticles();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial size
    resizeCanvas();

    // Start animation
    animate();

    // Handle resize
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, speed, theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full pointer-events-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
};

export default ParticlesBackground;