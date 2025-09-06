/**
 * Visual Renderer Component
 * Properly renders visual content from AI-generated questions
 * Handles emojis, text descriptions, and React Icons for counting visuals
 */

import React, { useEffect, useState } from 'react';
import { iconVisualService } from '../../services/iconVisualService';
import { useAuth } from '../../hooks/useAuth';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import styles from '../../styles/shared/components/VisualRenderer.module.css';

interface VisualRendererProps {
  visual: string | React.ReactElement;
  theme?: string;
  size?: 'small' | 'medium' | 'large';
}

export const VisualRenderer: React.FC<VisualRendererProps> = ({ 
  visual, 
  theme = 'light',
  size = 'large' 
}) => {
  // Debug log to track what visual content is being rendered
  if (typeof visual === 'string' && visual.toLowerCase().includes('spark')) {
    console.warn('⚠️ VisualRenderer received visual containing "Spark":', visual);
    console.trace('Stack trace for Spark in visual prop');
  }
  
  const { user } = useAuth();
  const { profile } = useStudentProfile();
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  
  // Check if visual is a React component
  if (React.isValidElement(visual)) {
    return <>{visual}</>;
  }
  
  // Check if visual is already an image URL (http/https/data URL)
  const isImageUrl = visual && typeof visual === 'string' && (
    visual.startsWith('http://') || 
    visual.startsWith('https://') || 
    visual.startsWith('data:image/')
  );
  
  // If it's already an image URL, use it directly
  useEffect(() => {
    if (isImageUrl) {
      setGeneratedImageUrl(visual);
    }
  }, [visual, isImageUrl]);
  
  // Check if this is a visual identification question with a letter
  // Pattern: "emoji (description with 'LETTER')" or similar
  const letterVisualMatch = visual && typeof visual === 'string' && visual.match(/([^\s]+)\s*\([^)]*with\s*['"]([A-Z])['"][^)]*\)/);
  const isLetterVisual = !!letterVisualMatch;
  
  // Check if this is a counting visual that should use React Icons
  // IMPORTANT: Exclude letter visuals from being treated as counting visuals
  const isCountingVisual = !isImageUrl && !isLetterVisual && visual && typeof visual === 'string' && (
    visual.toLowerCase().includes('soccer ball') ||
    visual.toLowerCase().includes('basketball') ||
    visual.toLowerCase().includes('tennis ball') ||
    visual.toLowerCase().includes('football') ||
    visual.toLowerCase().includes('baseball') ||
    visual.toLowerCase().includes('water bottle') ||
    visual.toLowerCase().includes('trophy') ||
    visual.toLowerCase().includes('medal') ||
    visual.toLowerCase().includes('book') ||
    visual.toLowerCase().includes('pencil') ||
    visual.toLowerCase().includes('apple') ||
    visual.toLowerCase().includes('pizza') ||
    visual.toLowerCase().includes('cookie') ||
    (visual.toLowerCase().includes('picture') && visual.match(/\d+/))
  );
  
  // Extract count and item type from visual text
  const extractCountAndItem = (text: string): { count: number; item: string; career: string } => {
    const lowerText = text.toLowerCase();
    
    // Extract number
    const numberMatch = text.match(/\b(\d+)\b/);
    const count = numberMatch ? parseInt(numberMatch[1]) : 1;
    
    // Determine career and item type
    let career = 'Teacher'; // Default
    let item = 'book'; // Default
    
    if (lowerText.includes('soccer') || lowerText.includes('basketball') || 
        lowerText.includes('tennis') || lowerText.includes('football') || 
        lowerText.includes('baseball') || lowerText.includes('water bottle')) {
      career = 'Athlete';
      if (lowerText.includes('soccer')) item = 'soccer_ball';
      else if (lowerText.includes('basketball')) item = 'basketball';
      else if (lowerText.includes('tennis')) item = 'tennis_ball';
      else if (lowerText.includes('football')) item = 'football';
      else if (lowerText.includes('baseball')) item = 'baseball';
      else if (lowerText.includes('water bottle')) item = 'water_bottle';
    } else if (lowerText.includes('stethoscope') || lowerText.includes('thermometer') || 
               lowerText.includes('bandage') || lowerText.includes('medicine')) {
      career = 'Doctor';
      if (lowerText.includes('stethoscope')) item = 'stethoscope';
      else if (lowerText.includes('thermometer')) item = 'thermometer';
      else if (lowerText.includes('bandage')) item = 'bandage';
      else if (lowerText.includes('medicine')) item = 'medicine';
    } else if (lowerText.includes('pizza') || lowerText.includes('cookie') || 
               lowerText.includes('hamburger') || lowerText.includes('cupcake')) {
      career = 'Chef';
      if (lowerText.includes('pizza')) item = 'pizza';
      else if (lowerText.includes('cookie')) item = 'cookie';
      else if (lowerText.includes('hamburger')) item = 'hamburger';
      else if (lowerText.includes('cupcake')) item = 'cupcake';
    } else if (lowerText.includes('book') || lowerText.includes('pencil') || 
               lowerText.includes('apple') || lowerText.includes('ruler')) {
      career = 'Teacher';
      if (lowerText.includes('book')) item = 'book';
      else if (lowerText.includes('pencil')) item = 'pencil';
      else if (lowerText.includes('apple')) item = 'apple';
      else if (lowerText.includes('ruler')) item = 'ruler';
    }
    
    return { count, item, career };
  };
  
  // No longer need AI image generation
  const needsAIImage = false;
  
  // Parse the visual content
  const parseVisual = (visualText: string): { emojis: string; description: string } => {
    // Debug log to track what's being parsed
    if (visualText && visualText.toLowerCase().includes('spark')) {
      console.warn('⚠️ VisualRenderer parseVisual: Text containing "Spark":', visualText);
      console.trace('Stack trace for Spark rendering');
    }
    
    // Handle undefined or null visual content
    if (!visualText) {
      return { emojis: '', description: '' };
    }
    
    // If it's an image URL, don't parse it as text
    if (isImageUrl) {
      return { emojis: '', description: '' };
    }
    
    // Remove "Visual:" prefix if present
    let cleaned = visualText.replace(/^Visual:\s*/i, '').trim();
    
    // Check if it's primarily emojis or has a description with emojis
    // Pattern 1: "Three colorful books 📚📚📚" - extract emojis
    // Pattern 2: "📚 📚 📚" - just emojis
    // Pattern 3: "Books: 📚📚📚" - label with emojis
    
    // Extract all emojis from the text
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F910}-\u{1F96B}]|[\u{1F980}-\u{1F9E0}]/gu;
    const emojis = cleaned.match(emojiRegex) || [];
    
    // Remove emojis from text to get description
    const description = cleaned.replace(emojiRegex, '').replace(/\s+/g, ' ').trim();
    
    // If we have emojis, use them. Otherwise, try to generate appropriate visual
    if (emojis.length > 0) {
      return {
        emojis: emojis.join(' '),
        description: description
      };
    }
    
    // If no emojis found, try to interpret the description and add appropriate ones
    const visualMap: Record<string, string> = {
      'book': '📚',
      'books': '📚',
      'apple': '🍎',
      'apples': '🍎',
      'star': '⭐',
      'stars': '⭐',
      'heart': '❤️',
      'hearts': '❤️',
      'tree': '🌳',
      'trees': '🌳',
      'flower': '🌸',
      'flowers': '🌸',
      'car': '🚗',
      'cars': '🚗',
      'ball': '⚽',
      'balls': '⚽',
      'dog': '🐕',
      'dogs': '🐕',
      'cat': '🐱',
      'cats': '🐱',
      'house': '🏠',
      'houses': '🏠',
      'sun': '☀️',
      'moon': '🌙',
      'cloud': '☁️',
      'clouds': '☁️',
      'pencil': '✏️',
      'pencils': '✏️',
      'circle': '⭕',
      'circles': '⭕',
      'square': '⬜',
      'squares': '⬜',
      'triangle': '🔺',
      'triangles': '🔺'
    };
    
    // Try to find a number and item in the description
    const numberMatch = description.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i);
    const itemMatch = description.toLowerCase().match(/\b(book|apple|star|heart|tree|flower|car|ball|dog|cat|house|sun|moon|cloud|pencil|circle|square|triangle)s?\b/);
    
    if (numberMatch && itemMatch) {
      const numberMap: Record<string, number> = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      };
      
      const count = isNaN(Number(numberMatch[1])) 
        ? numberMap[numberMatch[1].toLowerCase()] || 1
        : Number(numberMatch[1]);
        
      const itemKey = itemMatch[1].toLowerCase();
      const emoji = visualMap[itemKey] || visualMap[itemKey + 's'] || '•';
      
      return {
        emojis: Array(Math.min(count, 10)).fill(emoji).join(' '),
        description: description
      };
    }
    
    // Fallback: return the original text
    return {
      emojis: '',
      description: cleaned
    };
  };
  
  const { emojis, description } = parseVisual(typeof visual === 'string' ? visual : '');
  
  // Determine font size based on size prop
  const fontSize = size === 'small' ? '2rem' : size === 'medium' ? '2.5rem' : '3rem';
  
  // Extract number from visual text if present
  const visualStr = typeof visual === 'string' ? visual : '';
  const numberMatch = visualStr.match(/\b(\d+)\b/);
  const displayNumber = numberMatch ? numberMatch[1] : null;
  
  // Check if this is a counting/number visual
  const isNumberVisual = visualStr.toLowerCase().includes('number') || 
                        visualStr.toLowerCase().includes('written') ||
                        visualStr.toLowerCase().includes('beside') ||
                        visualStr.toLowerCase().includes('count') ||
                        description?.toLowerCase().includes('drum');
  
  // If this is a letter visual (emoji with letter), render it specially
  if (isLetterVisual && letterVisualMatch) {
    const emoji = letterVisualMatch[1];
    const letter = letterVisualMatch[2];
    
    return (
      <div className={styles.visualRenderer}>
        <div className={styles.letterVisualContainer} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem'
        }}>
          {/* Display the emoji */}
          <span style={{
            fontSize: size === 'small' ? '3rem' : size === 'medium' ? '4rem' : '5rem',
            lineHeight: 1
          }}>
            {emoji}
          </span>
          
          {/* Display the letter prominently */}
          <span style={{
            fontSize: size === 'small' ? '4rem' : size === 'medium' ? '5rem' : '6rem',
            fontWeight: 'bold',
            color: theme === 'dark' ? '#a78bfa' : '#7c3aed',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            {letter}
          </span>
        </div>
      </div>
    );
  }
  
  // If this is a counting visual, use React Icons
  if (isCountingVisual) {
    const { count, item, career } = extractCountAndItem(typeof visual === 'string' ? visual : '');
    const iconVisual = iconVisualService.generateCountingVisual(
      career,
      item,
      count,
      {
        size: size === 'small' ? 40 : size === 'medium' ? 50 : 60,
        spacing: 16,
        arrangement: count > 3 ? 'grid' : 'horizontal',
        theme: theme as 'light' | 'dark'
      }
    );
    
    return (
      <div className={styles.visualRenderer}>
        <div className={styles.iconGrid}>
          {iconVisual}
        </div>
        {/* Show the number prominently if it's part of the visual description */}
        {typeof visual === 'string' && visual.toLowerCase().includes('number') && (
          <div className={styles.numberDisplay}>
            {count}
          </div>
        )}
      </div>
    );
  }

  // Remove loading state since we're not generating images anymore

  // Otherwise, use the emoji/text rendering
  return (
    <div className={styles.visualRenderer}>
      <div className={`${styles.visualContent} ${isNumberVisual && displayNumber ? '' : styles.compact}`}>
        {emojis && (
          <div className={`${styles.emojiContainer} ${styles[size]}`}>
            {emojis.split(' ').filter(e => e.trim()).map((emoji, index) => {
              // Debug log to identify excessive rendering
              if (emoji.toLowerCase().includes('spark')) {
                console.warn('⚠️ Unexpected "Spark" in emoji rendering:', emoji);
              }
              return (
                <span 
                  key={index} 
                  className={styles.emojiItem}
                  style={{
                    animationDelay: `${index * 0.1}s`
                }}>
                  {emoji}
                </span>
              );
            })}
          </div>
        )}
        
        {/* Display large number if this is a number visual */}
        {isNumberVisual && displayNumber && (
          <div style={{
            fontSize: size === 'large' ? '5rem' : size === 'medium' ? '3.5rem' : '2.5rem',
            fontWeight: 'bold',
            color: theme === 'dark' ? '#a78bfa' : '#7c3aed',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            animation: 'pulse 2s infinite'
          }}>
            {displayNumber}
          </div>
        )}
        
        {/* For counting visuals, show equals sign and number */}
        {!isNumberVisual && displayNumber && emojis && (
          <div className={styles.numberDisplay}>
            <span style={{ color: 'var(--text-secondary)' }}>=</span>
            <span>{displayNumber}</span>
          </div>
        )}
      </div>
      
      {description && !emojis && (
        <div className={styles.descriptionOnly}>
          {description}
        </div>
      )}
      
      {description && emojis && !isNumberVisual && (
        <div className={styles.descriptionSubtle}>
          {description}
        </div>
      )}
    </div>
  );
};

export default VisualRenderer;