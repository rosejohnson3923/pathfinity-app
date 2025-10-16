/**
 * Particle Effects Component
 * Creates dynamic visual effects for celebrations and interactions
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  lifetime: number;
  type: 'confetti' | 'sparkle' | 'star' | 'coin' | 'burst';
}

interface ParticleEffectsProps {
  trigger?: 'victory' | 'achievement' | 'synergy' | 'streak' | 'perfect' | null;
  position?: { x: number; y: number };
  onComplete?: () => void;
}

export const ParticleEffects: React.FC<ParticleEffectsProps> = ({
  trigger,
  position,
  onComplete
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Particle configurations for different triggers
  const getParticleConfig = (triggerType: string) => {
    switch (triggerType) {
      case 'victory':
        return {
          count: 100,
          colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB'],
          types: ['confetti', 'star'] as const,
          spread: 360,
          velocity: { min: 5, max: 15 },
          size: { min: 8, max: 16 },
          lifetime: 3000
        };
      case 'achievement':
        return {
          count: 50,
          colors: ['#FFD700', '#FFF700', '#FFED4E'],
          types: ['star', 'sparkle'] as const,
          spread: 180,
          velocity: { min: 3, max: 10 },
          size: { min: 6, max: 12 },
          lifetime: 2000
        };
      case 'synergy':
        return {
          count: 30,
          colors: ['#9333EA', '#3B82F6', '#8B5CF6'],
          types: ['sparkle', 'burst'] as const,
          spread: 120,
          velocity: { min: 2, max: 8 },
          size: { min: 4, max: 10 },
          lifetime: 1500
        };
      case 'streak':
        return {
          count: 40,
          colors: ['#FF6B35', '#F72585', '#FF006E'],
          types: ['burst', 'star'] as const,
          spread: 270,
          velocity: { min: 4, max: 12 },
          size: { min: 5, max: 12 },
          lifetime: 2000
        };
      case 'perfect':
        return {
          count: 60,
          colors: ['#10B981', '#34D399', '#6EE7B7'],
          types: ['coin', 'sparkle'] as const,
          spread: 360,
          velocity: { min: 3, max: 10 },
          size: { min: 6, max: 14 },
          lifetime: 2500
        };
      default:
        return null;
    }
  };

  // Create particles based on trigger
  useEffect(() => {
    if (!trigger) return;

    const config = getParticleConfig(trigger);
    if (!config) return;

    const centerX = position?.x || window.innerWidth / 2;
    const centerY = position?.y || window.innerHeight / 2;

    const newParticles: Particle[] = [];

    for (let i = 0; i < config.count; i++) {
      const angle = (Math.random() * config.spread * Math.PI) / 180 - (config.spread * Math.PI) / 360;
      const velocity = config.velocity.min + Math.random() * (config.velocity.max - config.velocity.min);
      const type = config.types[Math.floor(Math.random() * config.types.length)];

      newParticles.push({
        id: `${Date.now()}-${i}`,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - Math.random() * 5, // Add some upward bias
        size: config.size.min + Math.random() * (config.size.max - config.size.min),
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        opacity: 1,
        lifetime: config.lifetime,
        type
      });
    }

    setParticles(newParticles);
    startTimeRef.current = Date.now();

    // Start animation
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [trigger, position]);

  // Animation loop
  const animate = () => {
    if (!startTimeRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;

    setParticles(prevParticles => {
      const updatedParticles = prevParticles
        .map(particle => {
          // Update position
          const newX = particle.x + particle.vx;
          const newY = particle.y + particle.vy + 0.5; // Add gravity

          // Update velocity (friction and gravity)
          const newVx = particle.vx * 0.99;
          const newVy = particle.vy + 0.3;

          // Update opacity based on lifetime
          const progress = elapsed / particle.lifetime;
          const newOpacity = Math.max(0, 1 - progress);

          return {
            ...particle,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            opacity: newOpacity
          };
        })
        .filter(particle => particle.opacity > 0);

      // Check if animation is complete
      if (updatedParticles.length === 0) {
        onComplete?.();
        return [];
      }

      return updatedParticles;
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Render particle shapes
  const renderParticle = (particle: Particle) => {
    switch (particle.type) {
      case 'confetti':
        return (
          <div
            style={{
              width: particle.size,
              height: particle.size * 0.6,
              backgroundColor: particle.color,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        );
      case 'sparkle':
        return (
          <svg width={particle.size} height={particle.size} viewBox="0 0 24 24" fill={particle.color}>
            <path d="M12 0l3 9h9l-7.5 5.5L19.5 24l-7.5-5.5L4.5 24l3-9.5L0 9h9z" />
          </svg>
        );
      case 'star':
        return (
          <svg width={particle.size} height={particle.size} viewBox="0 0 24 24" fill={particle.color}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      case 'coin':
        return (
          <div
            style={{
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size / 2}px ${particle.color}`
            }}
          />
        );
      case 'burst':
        return (
          <div
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            }}
          />
        );
      default:
        return (
          <div
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: '50%'
            }}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            style={{
              position: 'absolute',
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              opacity: particle.opacity,
              transform: 'translate3d(0, 0, 0)', // Force GPU acceleration
              willChange: 'transform, opacity'
            }}
          >
            {renderParticle(particle)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Confetti Burst Component for specific locations
export const ConfettiBurst: React.FC<{
  x: number;
  y: number;
  intensity?: 'low' | 'medium' | 'high';
}> = ({ x, y, intensity = 'medium' }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const counts = { low: 10, medium: 25, high: 50 };
    const count = counts[intensity];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: `burst-${Date.now()}-${i}`,
      angle: (360 / count) * i,
      distance: 50 + Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 1000);
    return () => clearTimeout(timer);
  }, [x, y, intensity]);

  return (
    <AnimatePresence>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          initial={{
            x,
            y,
            scale: 0,
            opacity: 1
          }}
          animate={{
            x: x + Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
            y: y + Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
            scale: 1,
            opacity: 0
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: 'easeOut'
          }}
          className="fixed pointer-events-none z-50"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%'
          }}
        />
      ))}
    </AnimatePresence>
  );
};

// Floating Emojis Component
export const FloatingEmojis: React.FC<{
  emoji: string;
  count?: number;
  duration?: number;
}> = ({ emoji, count = 5, duration = 3000 }) => {
  const [emojis, setEmojis] = useState<any[]>([]);

  useEffect(() => {
    const newEmojis = Array.from({ length: count }).map((_, i) => ({
      id: `emoji-${Date.now()}-${i}`,
      x: Math.random() * window.innerWidth,
      delay: i * 200
    }));

    setEmojis(newEmojis);

    const timer = setTimeout(() => setEmojis([]), duration);
    return () => clearTimeout(timer);
  }, [emoji, count, duration]);

  return (
    <AnimatePresence>
      {emojis.map(item => (
        <motion.div
          key={item.id}
          initial={{
            x: item.x,
            y: window.innerHeight + 50,
            scale: 0,
            rotate: 0
          }}
          animate={{
            y: -100,
            scale: [0, 1.2, 1, 1.2, 0],
            rotate: 360
          }}
          transition={{
            duration: duration / 1000,
            delay: item.delay / 1000,
            ease: 'easeOut'
          }}
          className="fixed text-4xl pointer-events-none z-50"
        >
          {emoji}
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default ParticleEffects;