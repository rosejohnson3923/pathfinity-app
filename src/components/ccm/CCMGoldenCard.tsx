/**
 * CCM Golden Card Component
 *
 * The Golden Card is the player's AI Companion card that can be used once per game
 * to guarantee a perfect score of 120 points.
 *
 * Visual: Golden card background with user's selected aiCompanion image in the center glow
 *
 * States:
 * - available: Can be played (glowing, interactive)
 * - selected: Player has selected to use it (highlighted)
 * - used: Already played this game (grayed out, non-interactive)
 * - disabled: Cannot be used (e.g., when MVP card is selected)
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface CCMGoldenCardProps {
  aiCompanionName: 'finn' | 'harmony' | 'sage' | 'spark';
  state: 'available' | 'selected' | 'used' | 'disabled';
  onClick?: () => void;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const CCMGoldenCard: React.FC<CCMGoldenCardProps> = ({
  aiCompanionName,
  state,
  onClick,
  showLabel = true,
  size = 'medium'
}) => {
  const theme = useTheme();

  // Get the appropriate aiCompanion image based on theme
  const aiCompanionImage = `/images/companions/${aiCompanionName}-${theme === 'dark' ? 'dark' : 'light'}.png`;

  // Size configurations
  const sizeConfig = {
    small: {
      width: 120,
      height: 180,
      imageSize: 70,
      fontSize: 'text-xs'
    },
    medium: {
      width: 160,
      height: 240,
      imageSize: 100,
      fontSize: 'text-sm'
    },
    large: {
      width: 200,
      height: 300,
      imageSize: 130,
      fontSize: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Determine if card is interactive
  const isInteractive = state === 'available' && onClick;
  const isDisabled = state === 'used' || state === 'disabled';

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden transition-all duration-300
        ${isInteractive ? 'cursor-pointer hover:scale-105 hover:shadow-2xl' : 'cursor-default'}
        ${state === 'available' ? 'animate-pulse-glow' : ''}
        ${state === 'selected' ? 'ring-4 ring-yellow-400 scale-105 shadow-2xl' : ''}
        ${isDisabled ? 'opacity-50 grayscale' : ''}
      `}
      style={{ width: config.width, height: config.height }}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      aria-label={`Golden Card - AI Companion (${aiCompanionName}) - ${state}`}
      tabIndex={isInteractive ? 0 : -1}
    >
      {/* Golden Card Background */}
      <img
        src="/assets/career-challenge/MCC_Card_Golden.png"
        alt="Golden Card Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* AI Companion Image in Center Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={aiCompanionImage}
          alt={`${aiCompanionName} AI Companion`}
          className="rounded-full border-4 border-white/30 shadow-2xl transition-transform duration-300"
          style={{
            width: config.imageSize,
            height: config.imageSize,
            transform: state === 'selected' ? 'scale(1.1)' : 'scale(1)'
          }}
        />
      </div>

      {/* Card Labels */}
      {showLabel && (
        <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
          <div className="bg-gradient-to-t from-black/80 to-transparent rounded-b-xl p-2">
            <p className={`font-bold text-white drop-shadow-lg ${config.fontSize}`}>
              AI COMPANION 🏆
            </p>
            <p className={`font-extrabold text-yellow-300 drop-shadow-lg ${config.fontSize}`}>
              130 POINTS
            </p>
          </div>
        </div>
      )}

      {/* State Overlay */}
      {state === 'used' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-red-600/90 text-white font-bold px-6 py-3 rounded-lg text-xl transform rotate-12">
            USED
          </div>
        </div>
      )}

      {state === 'disabled' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-gray-600/90 text-white font-bold px-4 py-2 rounded-lg text-sm">
            LOCKED
          </div>
        </div>
      )}

      {/* Glow Effect for Available State */}
      {state === 'available' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.6)] animate-pulse" />
        </div>
      )}
    </div>
  );
};

// Companion component to display Golden Card info tooltip
export const CCMGoldenCardTooltip: React.FC<{ aiCompanionName: string; hasBeenUsed: boolean }> = ({
  aiCompanionName,
  hasBeenUsed
}) => {
  return (
    <div className="glass-card p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
        <span>🏆</span>
        <span>Golden Card - AI Companion</span>
      </h3>
      <div className="space-y-2 text-sm">
        <p><strong>Companion:</strong> {aiCompanionName}</p>
        <p><strong>Score:</strong> Perfect 130 points</p>
        <p><strong>Usage:</strong> Once per game</p>
        {hasBeenUsed ? (
          <p className="text-red-500 font-semibold">✓ Already used this game</p>
        ) : (
          <p className="text-green-500 font-semibold">✓ Available to use</p>
        )}
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Use this card to guarantee a perfect score on any challenge! No role or synergy cards needed.
          Cannot be combined with MVP card.
        </p>
      </div>
    </div>
  );
};

export default CCMGoldenCard;
