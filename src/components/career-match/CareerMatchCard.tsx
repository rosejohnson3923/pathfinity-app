/**
 * Career Match Card Component
 * Individual flippable card with 3D flip animation
 * Shows career image when revealed, branded back when face-down
 */

import React from 'react';
import styles from './CareerMatchCard.module.css';
import type { CareerMatchCardState } from '@/types/CareerMatchTypes';

interface CareerMatchCardProps {
  card: CareerMatchCardState;
  onFlip: (position: number) => void;
  disabled: boolean;
  size?: 'small' | 'medium' | 'large';
  showDebugInfo?: boolean;
  isFlipped: boolean; // Parent controls flip state based on match_state
  showMatchedOverlay?: boolean; // Show green checkmark (only when match_state === 'M3')
}

const CareerMatchCard: React.FC<CareerMatchCardProps> = ({
  card,
  onFlip,
  disabled,
  size = 'medium',
  showDebugInfo = false,
  isFlipped,
  showMatchedOverlay = false,
}) => {
  const handleClick = () => {
    if (disabled || card.is_matched || isFlipped) {
      return; // Can't flip if disabled, already matched, or already flipped
    }
    onFlip(card.position);
  };

  // Debug logging for flipped cards
  if (isFlipped) {
    console.log(`[CareerMatchCard] Card ${card.position} is FLIPPED:`, {
      isFlipped,
      isMatched: card.is_matched,
      careerName: card.career_name,
      imagePath: card.career_image_path,
      cardId: card.id,
    });
  }

  return (
    <div
      className={`${styles.cardContainer} ${styles[size]}`}
      style={{ animationDelay: `${card.flip_delay}ms` }}
    >
      <div
        className={`${styles.card} ${isFlipped ? styles.flipped : ''} ${
          card.is_matched ? styles.matched : ''
        } ${disabled ? styles.disabled : ''}`}
        onClick={handleClick}
      >
        {/* Card Front (Career Image) */}
        <div className={`${styles.cardFace} ${styles.cardFront}`}>
          <div className={styles.careerImageWrapper}>
            <img
              src={card.career_image_path}
              alt={card.career_name}
              className={styles.careerImage}
              loading="eager"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                console.error(`[CareerMatchCard] Image failed to load: ${card.career_image_path}`);
                (e.target as HTMLImageElement).src = '/assets/placeholder-career.png';
              }}
              onLoad={() => {
                console.log(`[CareerMatchCard] Image loaded successfully: ${card.career_image_path}`);
              }}
            />
            <div className={styles.careerNameBanner}>
              <span className={styles.careerName}>{card.career_name}</span>
            </div>
          </div>

          {showMatchedOverlay && (
            <div className={styles.matchedOverlay}>
              <div className={styles.matchedBadge}>✓</div>
            </div>
          )}

          {showDebugInfo && (
            <div className={styles.debugInfo}>
              Position: {card.position} | Pair: {card.pair_id}
            </div>
          )}
        </div>

        {/* Card Back (Pathfinity Branding) */}
        <div className={`${styles.cardFace} ${styles.cardBack}`}>
          <div className={styles.backDesign}>
            <div className={styles.backLogo}>
              <div className={styles.logoCircle}>
                <span className={styles.logoText}>CM</span>
              </div>
              <div className={styles.brandName}>Career Match</div>
            </div>
            <div className={styles.backPattern}>
              {/* Decorative pattern */}
              <div className={styles.patternGrid}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={styles.patternDot} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerMatchCard;
