/**
 * Multi-Container Visualization Component
 * ========================================
 * Provides unified visualization system for Learn, Experience, and Discover containers
 * Adapts visual complexity and styling based on grade level
 * 
 * Created: 2025-08-30
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GradeContentAdapter from '../../services/GradeContentAdapter';
import './MultiContainerVisualization.css';

interface VisualizationProps {
  containerType: 'learn' | 'experience' | 'discover';
  grade: string;
  currentPhase: string;
  progress: number;
  skillName: string;
  careerName: string;
  studentName: string;
  onPhaseComplete?: () => void;
}

interface VisualElement {
  id: string;
  type: 'particle' | 'shape' | 'icon' | 'text';
  position: { x: number; y: number };
  animation?: string;
  content?: string;
  color?: string;
}

const MultiContainerVisualization: React.FC<VisualizationProps> = ({
  containerType,
  grade,
  currentPhase,
  progress,
  skillName,
  careerName,
  studentName,
  onPhaseComplete
}) => {
  const [visualElements, setVisualElements] = useState<VisualElement[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  const gradeRange = GradeContentAdapter.getGradeRange(grade);
  const visualRatio = GradeContentAdapter.getVisualRatio(grade);
  const attentionSpan = GradeContentAdapter.getAttentionSpan(grade);

  // Container-specific color themes
  const containerThemes = {
    learn: {
      primary: '#14b8a6',
      secondary: '#06b6d4',
      accent: '#0891b2',
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
      particles: ['📚', '🎓', '💡', '✨'],
      shapes: ['circle', 'hexagon', 'star']
    },
    experience: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#dc2626',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      particles: ['⚡', '🎯', '🚀', '💫'],
      shapes: ['triangle', 'diamond', 'burst']
    },
    discover: {
      primary: '#ec4899',
      secondary: '#a855f7',
      accent: '#d946ef',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
      particles: ['🌟', '🔮', '🌈', '✨'],
      shapes: ['spiral', 'wave', 'orbit']
    }
  };

  const theme = containerThemes[containerType];

  // Grade-based visual complexity
  const getVisualComplexity = () => {
    switch (gradeRange) {
      case 'K-2':
        return { elementCount: 5, animationSpeed: 'slow', complexity: 'simple' };
      case '3-5':
        return { elementCount: 8, animationSpeed: 'medium', complexity: 'moderate' };
      case '6-8':
        return { elementCount: 12, animationSpeed: 'fast', complexity: 'complex' };
      case '9-12':
        return { elementCount: 15, animationSpeed: 'dynamic', complexity: 'advanced' };
      default:
        return { elementCount: 10, animationSpeed: 'medium', complexity: 'moderate' };
    }
  };

  // Initialize visual elements based on phase and grade
  useEffect(() => {
    const { elementCount, complexity } = getVisualComplexity();
    const elements: VisualElement[] = [];

    for (let i = 0; i < elementCount; i++) {
      const elementType = Math.random() > (visualRatio.visual / 100) ? 'text' : 
                         Math.random() > 0.5 ? 'particle' : 'shape';
      
      elements.push({
        id: `element-${i}`,
        type: elementType,
        position: {
          x: Math.random() * 100,
          y: Math.random() * 100
        },
        animation: getAnimationType(complexity),
        content: elementType === 'particle' ? 
                 theme.particles[Math.floor(Math.random() * theme.particles.length)] :
                 elementType === 'text' ? getPhaseText(currentPhase) : undefined,
        color: getElementColor(i, elementCount)
      });
    }

    setVisualElements(elements);
  }, [currentPhase, grade, containerType]);

  // Canvas animation for advanced grades
  useEffect(() => {
    if (gradeRange === '6-8' || gradeRange === '9-12') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw animated background patterns
        drawBackgroundPattern(ctx, canvas.width, canvas.height);
        
        // Draw progress visualization
        drawProgressVisualization(ctx, canvas.width, canvas.height, progress);
        
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [gradeRange, progress, containerType]);

  const getAnimationType = (complexity: string): string => {
    const animations = {
      simple: ['float', 'pulse'],
      moderate: ['float', 'pulse', 'rotate', 'bounce'],
      complex: ['float', 'pulse', 'rotate', 'bounce', 'orbit', 'wave'],
      advanced: ['float', 'pulse', 'rotate', 'bounce', 'orbit', 'wave', 'spiral', 'quantum']
    };
    
    const availableAnimations = animations[complexity as keyof typeof animations];
    return availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
  };

  const getPhaseText = (phase: string): string => {
    const phaseTexts = {
      learn: ['Learning!', 'Exploring', 'Understanding'],
      experience: ['Practicing', 'Applying', 'Creating'],
      discover: ['Discovering', 'Innovating', 'Imagining']
    };
    
    const texts = phaseTexts[containerType];
    return texts[Math.floor(Math.random() * texts.length)];
  };

  const getElementColor = (index: number, total: number): string => {
    const hue = (360 / total) * index;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const drawBackgroundPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = theme.primary;
    
    // Draw container-specific patterns
    switch (containerType) {
      case 'learn':
        // Grid pattern for learning
        for (let x = 0; x < width; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;
        
      case 'experience':
        // Dynamic lines for experience
        const time = Date.now() * 0.001;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(0, height * (i + 1) / 6);
          for (let x = 0; x < width; x += 10) {
            const y = height * (i + 1) / 6 + Math.sin(x * 0.01 + time) * 20;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        break;
        
      case 'discover':
        // Spiral pattern for discovery
        ctx.beginPath();
        const centerX = width / 2;
        const centerY = height / 2;
        for (let angle = 0; angle < Math.PI * 10; angle += 0.1) {
          const radius = angle * 10;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        break;
    }
    
    ctx.globalAlpha = 1;
  };

  const drawProgressVisualization = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    progress: number
  ) => {
    const gradient = ctx.createLinearGradient(0, 0, width * progress / 100, 0);
    gradient.addColorStop(0, theme.primary);
    gradient.addColorStop(1, theme.secondary);
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, height - 10, width * progress / 100, 10);
    ctx.globalAlpha = 1;
  };

  const handlePhaseTransition = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      if (onPhaseComplete) {
        onPhaseComplete();
      }
    }, 1000);
  };

  return (
    <div 
      className={`multi-container-visualization ${containerType} grade-${gradeRange}`}
      data-grade-range={gradeRange}
    >
      {/* Background Canvas for Advanced Grades */}
      {(gradeRange === '6-8' || gradeRange === '9-12') && (
        <canvas
          ref={canvasRef}
          className="visualization-canvas"
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}

      {/* Main Visualization Area */}
      <div className="visualization-stage">
        <AnimatePresence>
          {visualElements.map((element) => (
            <motion.div
              key={element.id}
              className={`visual-element ${element.type} ${element.animation}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: `${element.position.x}%`,
                y: `${element.position.y}%`
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
              style={{
                color: element.color || theme.primary,
                background: element.type === 'shape' ? theme.gradient : 'transparent'
              }}
            >
              {element.content}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className="progress-track">
            <motion.div 
              className="progress-fill"
              style={{ background: theme.gradient }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="progress-label">
            {gradeRange === 'K-2' ? `${Math.round(progress)}% Done! 🎉` :
             gradeRange === '3-5' ? `Progress: ${Math.round(progress)}%` :
             `${Math.round(progress)}% Complete`}
          </div>
        </div>

        {/* Phase Information */}
        <motion.div 
          className="phase-info"
          animate={{ opacity: isAnimating ? 0 : 1 }}
        >
          <h3 className="phase-title">
            {currentPhase === 'introduction' && `Welcome to ${careerName} ${containerType}!`}
            {currentPhase === 'learning' && `Learning ${skillName}`}
            {currentPhase === 'practicing' && `Practicing ${skillName}`}
            {currentPhase === 'completing' && `Completing ${skillName} Journey`}
          </h3>
          
          {gradeRange === 'K-2' && (
            <div className="encouragement">
              Great job, {studentName}! Keep going! 🌟
            </div>
          )}
        </motion.div>

        {/* Interactive Elements for Younger Grades */}
        {(gradeRange === 'K-2' || gradeRange === '3-5') && (
          <div className="interactive-elements">
            <motion.button
              className="fun-button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePhaseTransition}
              style={{ background: theme.gradient }}
            >
              {gradeRange === 'K-2' ? 'Next! →' : 'Continue →'}
            </motion.button>
          </div>
        )}
      </div>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {progress >= 100 && (
          <motion.div
            className="achievement-notification"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{ background: theme.gradient }}
          >
            <span className="achievement-icon">🏆</span>
            <span className="achievement-text">
              {gradeRange === 'K-2' ? 'You did it! Amazing!' :
               gradeRange === '3-5' ? 'Great work! Phase complete!' :
               'Achievement Unlocked!'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiContainerVisualization;