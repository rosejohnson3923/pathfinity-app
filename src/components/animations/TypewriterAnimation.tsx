// ================================================================
// TYPEWRITER ANIMATION COMPONENT
// Animated text effect for hero titles with cycling words
// ================================================================

import React, { useState, useEffect } from 'react';

interface TypewriterAnimationProps {
  staticText: string; // "Where Learning Meets "
  animatedWords: string[]; // ["Real Life", "Real Careers", "Real Skills", "Real Results"]
  typingSpeed?: number; // milliseconds per character
  deletingSpeed?: number; // milliseconds per character when deleting
  pauseDuration?: number; // pause between words in milliseconds
  className?: string;
  cursorClassName?: string;
  showCursor?: boolean;
}

export const TypewriterAnimation: React.FC<TypewriterAnimationProps> = ({
  staticText,
  animatedWords,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className = '',
  cursorClassName = '',
  showCursor = true
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentWord = animatedWords[currentWordIndex];
    
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (currentText === '') {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % animatedWords.length);
        return;
      }
      
      const deleteTimer = setTimeout(() => {
        setCurrentText(prev => prev.slice(0, -1));
      }, deletingSpeed);
      
      return () => clearTimeout(deleteTimer);
    } else {
      if (currentText === currentWord) {
        setIsPaused(true);
        return;
      }
      
      const typeTimer = setTimeout(() => {
        setCurrentText(prev => currentWord.slice(0, prev.length + 1));
      }, typingSpeed);
      
      return () => clearTimeout(typeTimer);
    }
  }, [currentText, isDeleting, isPaused, currentWordIndex, animatedWords, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {staticText}
      <span className="typewriter-animated-text">
        {currentText}
        {showCursor && (
          <span 
            className={`typewriter-cursor ${cursorClassName}`}
            style={{
              marginLeft: '2px'
            }}
          >
            |
          </span>
        )}
      </span>
      
      <style>
        {`
        @keyframes typewriter-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .typewriter-animated-text {
          color: #6366f1; /* Indigo color for animated text */
          font-weight: 600;
        }
        
        .typewriter-cursor {
          color: #6366f1;
          font-weight: 300;
          animation: typewriter-blink 1s infinite;
        }
        `}
      </style>
    </span>
  );
};

// Pre-configured component for Pathfinity hero
export const PathfinityHeroTypewriter: React.FC<{
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}> = ({ 
  className = 'text-4xl md:text-6xl font-bold text-gray-900 dark:text-white',
  typingSpeed = 120,
  deletingSpeed = 60,
  pauseDuration = 2500
}) => {
  return (
    <TypewriterAnimation
      staticText="Where Learning Meets "
      animatedWords={["Real Life", "Real Careers", "Real Skills", "Real Results"]}
      typingSpeed={typingSpeed}
      deletingSpeed={deletingSpeed}
      pauseDuration={pauseDuration}
      className={className}
      showCursor={true}
    />
  );
};

// Advanced version with more customization
export const AdvancedTypewriterAnimation: React.FC<{
  lines: Array<{
    static: string;
    animated: string[];
  }>;
  className?: string;
  lineClassName?: string;
  animatedTextClassName?: string;
  cursorClassName?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  linePauseDuration?: number;
}> = ({
  lines,
  className = '',
  lineClassName = '',
  animatedTextClassName = 'text-indigo-500 font-semibold',
  cursorClassName = 'text-indigo-500',
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  linePauseDuration = 500
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isLineComplete, setIsLineComplete] = useState(false);

  useEffect(() => {
    if (isLineComplete && currentLineIndex < lines.length - 1) {
      const lineTimer = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setIsLineComplete(false);
      }, linePauseDuration);
      
      return () => clearTimeout(lineTimer);
    }
  }, [isLineComplete, currentLineIndex, lines.length, linePauseDuration]);

  return (
    <div className={className}>
      {lines.map((line, index) => (
        <div 
          key={index} 
          className={`${lineClassName} ${index > currentLineIndex ? 'opacity-0' : 'opacity-100'}`}
          style={{
            transition: 'opacity 0.5s ease-in-out'
          }}
        >
          {index === currentLineIndex ? (
            <TypewriterAnimation
              staticText={line.static}
              animatedWords={line.animated}
              typingSpeed={typingSpeed}
              deletingSpeed={deletingSpeed}
              pauseDuration={pauseDuration}
              className={animatedTextClassName}
              cursorClassName={cursorClassName}
              showCursor={index === currentLineIndex}
            />
          ) : index < currentLineIndex ? (
            <span>
              {line.static}
              <span className={animatedTextClassName}>
                {line.animated[line.animated.length - 1]}
              </span>
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default TypewriterAnimation;