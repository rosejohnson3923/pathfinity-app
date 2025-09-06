/**
 * CareerContextScreen Component
 * Full-screen experience showing how skills map to careers
 * Features particle effects and professional animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { careerContextConverter } from '../../services/content/CareerContextConverter';
import './CareerContextScreen.css';

interface CareerContextScreenProps {
  // Content from AI
  instruction: string;
  
  // Context
  studentName: string;
  careerName: string;
  gradeLevel: string;
  subject: string;
  skillName: string;
  containerType: 'learn' | 'experience' | 'discover';
  
  // Avatar
  avatarUrl?: string;
  companionName?: string;
  
  // Actions
  onStart: () => void;
  
  // Audio (future integration)
  audioUrl?: string;
  autoPlayAudio?: boolean;
}

// Particle class for background animation
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;

  constructor(canvas: HTMLCanvasElement, color: string) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = Math.random() * 3 + 2; // Increased from 1-3 to 2-5
    this.color = color;
    this.alpha = Math.random() * 0.4 + 0.6; // Increased from 0.3-0.8 to 0.6-1.0
  }

  update(canvas: HTMLCanvasElement) {
    this.x += this.vx;
    this.y += this.vy;

    // Wrap around edges
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export const CareerContextScreen: React.FC<CareerContextScreenProps> = ({
  instruction,
  studentName,
  careerName,
  gradeLevel,
  subject,
  skillName,
  containerType,
  avatarUrl,
  companionName = 'Sage',
  onStart,
  audioUrl,
  autoPlayAudio = true
}) => {
  // Debug: Log that component is rendering
  console.log('🎯 CareerContextScreen rendering with emergency buttons');
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Use converter to parse and simplify instruction
  const { greeting, concept, careerConnection } = careerContextConverter.convertInstruction(
    instruction,
    studentName,
    skillName,
    careerName
  );
  
  // Get companion avatar based on name and theme
  const getCompanionAvatar = () => {
    if (avatarUrl) return avatarUrl;
    
    const companionNameLower = (companionName || 'sage').toLowerCase();
    const themeMode = theme === 'dark' ? 'dark' : 'light';
    return `/images/companions/${companionNameLower}-${themeMode}.png`;
  };
  
  // Get grade category for age-appropriate styling
  const getGradeCategory = (grade: string): 'elementary' | 'middle' | 'high' => {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 5) return 'elementary';
    if (gradeNum <= 8) return 'middle';
    return 'high';
  };
  
  const gradeCategory = getGradeCategory(gradeLevel);
  
  // Career icons mapping
  const careerIcons: Record<string, string> = {
    'Chef': '👨‍🍳',
    'Artist': '🎨',
    'Doctor': '👨‍⚕️',
    'Engineer': '👷',
    'Scientist': '🔬',
    'Teacher': '👨‍🏫',
    'Musician': '🎵',
    'Athlete': '⚽',
    'Writer': '✍️',
    'Designer': '🎨',
    'Firefighter': '🚒',
    'Police Officer': '👮',
    'Astronaut': '🚀',
    'Pilot': '✈️',
    'Nurse': '👩‍⚕️',
    'Explorer': '🧭'
  };
  
  const careerIcon = careerIcons[careerName] || '💼';
  
  // Container theme colors
  const getContainerColor = () => {
    switch (containerType) {
      case 'learn':
        return { primary: '#8b5cf6', secondary: '#7c3aed' };
      case 'experience':
        return { primary: '#3b82f6', secondary: '#2563eb' };
      case 'discover':
        return { primary: '#10b981', secondary: '#059669' };
      default:
        return { primary: '#8b5cf6', secondary: '#7c3aed' };
    }
  };
  
  const colors = getContainerColor();
  
  // Initialize particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create particles with brighter colors for visibility
    const particleCount = 100;
    const particles: Particle[] = [];
    // Use white/light purple particles for better visibility on dark background
    const particleColor = theme === 'dark' ? '#e9d5ff' : colors.primary; // Light purple for dark theme
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas, particleColor));
    }
    particlesRef.current = particles;
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Just draw free-flowing particles without connections
      particles.forEach(particle => {
        particle.update(canvas);
        particle.draw(ctx);
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [colors.primary]);
  
  const handleStart = () => {
    // Stop audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onStart();
    }, 500);
  };
  
  // Handle text-to-speech
  const handlePlayAudio = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(`${greeting}. ${concept}`);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Select voice based on grade level
        const voices = window.speechSynthesis.getVoices();
        const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
        if (gradeNum <= 5 && voices.length > 0) {
          // Use a friendlier voice for younger students
          const friendlyVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha')) || voices[0];
          utterance.voice = friendlyVoice;
        }
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <>
      {/* SUPER EMERGENCY SKIP - Absolutely top level */}
      {import.meta.env.DEV && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2147483647,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          alignItems: 'center'
        }}>
          <button 
            onClick={handleStart}
            style={{
              padding: '30px 80px',
              backgroundColor: '#ff0000',
              color: 'white',
              border: '5px solid #ffffff',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '24px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          >
            🚨 EMERGENCY SKIP 🚨
          </button>
          <div style={{
            color: 'white',
            fontSize: '14px',
            textAlign: 'center',
            background: 'rgba(0,0,0,0.8)',
            padding: '10px',
            borderRadius: '8px'
          }}>
            Dev Mode: Click to continue
          </div>
        </div>
      )}
      
      {/* Emergency Skip Buttons Overlay - Outside main container to ensure visibility */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483646,
        pointerEvents: 'none'
      }}>
        {/* Emergency Skip Button - Top Left */}
        <button 
          onClick={handleStart}
          className="emergency-skip-green"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '15px 30px',
            backgroundColor: '#10b981',
            color: 'white',
            border: '3px solid #059669',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto'
          }}
        >
          ⏭️ SKIP / CONTINUE
        </button>
        
        {/* Emergency Skip Button - Top Right */}
        <button 
          onClick={handleStart}
          className="emergency-skip-yellow"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '15px 30px',
            backgroundColor: '#f59e0b',
            color: 'black',
            border: '3px solid #d97706',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto'
          }}
        >
          🚀 SKIP TO NEXT
        </button>
        
        {/* Emergency Skip Button - Center Bottom */}
        <button 
          onClick={handleStart}
          className="emergency-skip-red"
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '20px 60px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: '3px solid #dc2626',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '20px',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.5)',
            animation: 'pulse 2s infinite',
            pointerEvents: 'auto'
          }}
        >
          ➡️ CONTINUE TO NEXT SCREEN ➡️
        </button>
      </div>
      
      <div className={`career-context-screen ${theme} ${isAnimatingOut ? 'animating-out' : ''}`}>
        <canvas ref={canvasRef} className="particle-canvas" />
      
      <div className="career-context-content">
        {/* Header Section with Audio Button */}
        <div className="career-context-header">
          <div className="header-content-row">
            <div className="career-badge-large">
              <span className="career-icon-large">{careerIcon}</span>
              <div className="career-title-group">
                <h2 className="career-name">{careerName}</h2>
                <div className="skill-badge">
                  <span className="skill-subject">{subject}</span>
                  <span className="skill-separator">•</span>
                  <span className="skill-name">{skillName}</span>
                </div>
              </div>
            </div>
            
            {/* Audio Control Button */}
            <button 
              className="audio-control-button"
              onClick={handlePlayAudio}
              title={isPlaying ? "Stop Audio" : "Play Audio"}
            >
              <span className="audio-icon">
                {isPlaying ? '🔊' : '🔈'}
              </span>
              <span className="audio-label">
                {isPlaying ? 'Stop' : 'Listen'}
              </span>
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="career-context-main">
          {/* Companion Avatar */}
          <div className="companion-section">
            <div className="companion-avatar-wrapper">
              <div className="avatar-glow" />
              <div className="companion-avatar">
                <img 
                  src={getCompanionAvatar()} 
                  alt={companionName}
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const emojiSpan = document.createElement('span');
                    emojiSpan.className = 'avatar-emoji';
                    emojiSpan.textContent = '🎓';
                    target.parentElement?.appendChild(emojiSpan);
                  }}
                />
              </div>
              <div className="companion-name">{companionName}</div>
            </div>
          </div>
          
          {/* Career Context Content */}
          <div className="context-content-wrapper">
            <div className="greeting-section">
              <h1 className="greeting-text">{greeting}</h1>
            </div>
            
            <div className="concept-section">
              <p className="concept-text">{concept}</p>
            </div>
            
            {/* Visual Skills Preview with Animation */}
            <div className="skills-preview">
              <div className="preview-title">What You'll Master Today:</div>
              <div className="skill-cards">
                <div className="skill-card" style={{ animationDelay: '0.1s' }}>
                  <div className="skill-icon">🎯</div>
                  <div className="skill-label">Identify</div>
                </div>
                <div className="skill-card" style={{ animationDelay: '0.2s' }}>
                  <div className="skill-icon">🔢</div>
                  <div className="skill-label">Count</div>
                </div>
                <div className="skill-card" style={{ animationDelay: '0.3s' }}>
                  <div className="skill-icon">🧮</div>
                  <div className="skill-label">Apply</div>
                </div>
              </div>
            </div>
            
            {/* Career Connection Highlight */}
            <div className="career-connection">
              <div className="connection-icon">🔗</div>
              <div className="connection-text">
                Real {careerName} Skills • Real-World Application • Your Future Starts Now
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Section */}
        <div className="career-context-footer">
          <button className="start-journey-button" onClick={handleStart}>
            <span className="button-text">Begin Your {careerName} Journey</span>
            <span className="button-arrow">→</span>
          </button>
          
          <div className="progress-indicator">
            <div className="progress-dots">
              <div className="dot active" />
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};