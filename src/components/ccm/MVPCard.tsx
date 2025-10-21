/**
 * CCM MVP Card Component
 *
 * The MVP (Most Valuable Play) card is earned by saving your best card combo
 * from a previous game. It can be used once per game as a guaranteed high-scoring play.
 *
 * Visual: Special card with saved role + synergy combo displayed
 *
 * States:
 * - available: Can be played (glowing, interactive)
 * - selected: Player has selected to use it (highlighted)
 * - used: Already played this game (grayed out, non-interactive)
 * - disabled: Cannot be used (e.g., when Golden Card is selected)
 * - none: Player has no saved MVP card
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import { Award, Star, Lock, Zap } from 'lucide-react';

interface SavedCardCombo {
  roleCardName: string;
  synergyCardName: string;
  cSuiteOrg: 'ceo' | 'cfo' | 'cmo' | 'cto' | 'chro' | 'coo';
  averageScore: number;
  savedFromGameNumber: number;
}

interface MVPCardProps {
  savedCombo: SavedCardCombo | null;
  state: 'available' | 'selected' | 'used' | 'disabled' | 'none';
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const MVPCard: React.FC<MVPCardProps> = ({
  savedCombo,
  state,
  onClick,
  size = 'medium'
}) => {
  const theme = useTheme();

  // Size configurations
  const sizeConfig = {
    small: {
      width: 120,
      height: 180,
      titleSize: 'text-xs',
      fontSize: 'text-[9px]',
      iconSize: 'w-6 h-6'
    },
    medium: {
      width: 160,
      height: 240,
      titleSize: 'text-sm',
      fontSize: 'text-[10px]',
      iconSize: 'w-8 h-8'
    },
    large: {
      width: 200,
      height: 300,
      titleSize: 'text-base',
      fontSize: 'text-xs',
      iconSize: 'w-10 h-10'
    }
  };

  const config = sizeConfig[size];

  // Card back image based on theme
  const cardBackImage = theme === 'dark'
    ? '/assets/career-challenge/MCC_Card_Back_Dark.png'
    : '/assets/career-challenge/MCC_Card_Back_Light.png';

  // C-Suite color mapping
  const cSuiteColors: Record<string, { bg: string; text: string; gradient: string }> = {
    ceo: { bg: 'bg-purple-600', text: 'text-purple-100', gradient: 'from-purple-600 to-pink-600' },
    cfo: { bg: 'bg-green-600', text: 'text-green-100', gradient: 'from-green-600 to-emerald-600' },
    cmo: { bg: 'bg-orange-600', text: 'text-orange-100', gradient: 'from-orange-600 to-red-600' },
    cto: { bg: 'bg-blue-600', text: 'text-blue-100', gradient: 'from-blue-600 to-cyan-600' },
    chro: { bg: 'bg-pink-600', text: 'text-pink-100', gradient: 'from-pink-600 to-rose-600' },
    coo: { bg: 'bg-teal-600', text: 'text-teal-100', gradient: 'from-teal-600 to-cyan-600' }
  };

  const colors = savedCombo ? cSuiteColors[savedCombo.cSuiteOrg] : cSuiteColors.ceo;

  // Determine if card is interactive
  const isInteractive = state === 'available' && onClick && savedCombo;
  const isDisabled = state === 'used' || state === 'disabled';
  const hasNoMVP = state === 'none' || !savedCombo;

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden transition-all duration-300
        ${isInteractive ? 'cursor-pointer hover:scale-105 hover:shadow-2xl' : 'cursor-default'}
        ${state === 'available' && savedCombo ? 'animate-pulse-glow' : ''}
        ${state === 'selected' ? 'ring-4 ring-yellow-400 scale-105 shadow-2xl' : ''}
        ${isDisabled ? 'opacity-50 grayscale' : ''}
      `}
      style={{ width: config.width, height: config.height }}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      aria-label={`MVP Card - ${savedCombo ? 'Saved Combo' : 'No Saved Combo'} - ${state}`}
      tabIndex={isInteractive ? 0 : -1}
    >
      {/* Card Back Background */}
      <img
        src={cardBackImage}
        alt="MVP Card Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Card Content */}
      {hasNoMVP ? (
        // No MVP Saved State
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="bg-gray-600/90 rounded-lg p-4 text-center">
            <Lock className={`${config.iconSize} mx-auto mb-2 text-gray-300`} />
            <p className={`${config.titleSize} font-bold text-white mb-1`}>NO MVP SAVED</p>
            <p className={`${config.fontSize} text-gray-300`}>
              Win a game to save your best combo as an MVP card
            </p>
          </div>
        </div>
      ) : (
        // MVP Saved State
        <div className="absolute inset-0 p-3 flex flex-col">
          {/* MVP Badge */}
          <div className={`bg-gradient-to-r ${colors.gradient} text-white rounded-lg px-2 py-2 text-center font-bold shadow-lg mb-2`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="w-5 h-5" />
              <span className={config.titleSize}>MVP CARD</span>
            </div>
            <div className="text-xs opacity-90">Most Valuable Play</div>
          </div>

          {/* Saved Combo Info */}
          <div className="bg-white/95 dark:bg-gray-900/95 rounded-lg p-2 mb-2 shadow-md flex-1">
            {/* Role Card */}
            <div className="mb-2 pb-2 border-b border-gray-300 dark:border-gray-600">
              <div className={`${config.fontSize} text-gray-500 dark:text-gray-400 mb-0.5`}>
                ROLE CARD
              </div>
              <div className={`${config.titleSize} font-bold text-gray-900 dark:text-white leading-tight`}>
                {savedCombo.roleCardName}
              </div>
            </div>

            {/* Synergy Card */}
            <div className="mb-2 pb-2 border-b border-gray-300 dark:border-gray-600">
              <div className={`${config.fontSize} text-gray-500 dark:text-gray-400 mb-0.5`}>
                SYNERGY CARD
              </div>
              <div className={`${config.titleSize} font-bold text-gray-900 dark:text-white leading-tight`}>
                {savedCombo.synergyCardName}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className={`${config.fontSize} text-gray-600 dark:text-gray-400`}>
                  Avg Score:
                </span>
                <span className={`${config.fontSize} font-bold text-green-600 dark:text-green-400 flex items-center gap-1`}>
                  <Zap className="w-3 h-3" />
                  {savedCombo.averageScore}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${config.fontSize} text-gray-600 dark:text-gray-400`}>
                  From Game:
                </span>
                <span className={`${config.fontSize} font-bold text-purple-600 dark:text-purple-400`}>
                  #{savedCombo.savedFromGameNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Usage Note */}
          <div className="bg-yellow-500/90 text-black rounded-lg px-2 py-1.5 text-center">
            <p className={`${config.fontSize} font-bold`}>
              Use once per game
            </p>
          </div>
        </div>
      )}

      {/* State Overlays */}
      {state === 'used' && savedCombo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-red-600/90 text-white font-bold px-6 py-3 rounded-lg text-xl transform rotate-12">
            USED
          </div>
        </div>
      )}

      {state === 'disabled' && savedCombo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-gray-600/90 text-white font-bold px-4 py-2 rounded-lg text-sm">
            LOCKED
          </div>
        </div>
      )}

      {/* Glow Effect for Available State */}
      {state === 'available' && savedCombo && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.6)] animate-pulse" />
        </div>
      )}

      {/* Selected Indicator */}
      {state === 'selected' && (
        <div className="absolute top-2 right-2">
          <div className="bg-yellow-500 text-black rounded-full p-1.5 shadow-lg">
            <Star className="w-5 h-5" fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
};

// Companion component for MVP card info tooltip
export const MVPCardTooltip: React.FC<{ savedCombo: SavedCardCombo | null; hasBeenUsed: boolean }> = ({
  savedCombo,
  hasBeenUsed
}) => {
  if (!savedCombo) {
    return (
      <div className="glass-card p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          <span>MVP Card - Not Saved</span>
        </h3>
        <div className="space-y-2 text-sm">
          <p className="glass-text-secondary">
            Win a game to save your best card combo as an MVP card!
          </p>
          <p className="text-xs glass-text-tertiary">
            Your MVP card can be used once per game to replay your winning combination.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
        <Award className="w-5 h-5" />
        <span>MVP Card - Saved Combo</span>
      </h3>
      <div className="space-y-2 text-sm">
        <p><strong>Role:</strong> {savedCombo.roleCardName}</p>
        <p><strong>Synergy:</strong> {savedCombo.synergyCardName}</p>
        <p><strong>Average Score:</strong> {savedCombo.averageScore}</p>
        <p><strong>From Game:</strong> #{savedCombo.savedFromGameNumber}</p>
        <p><strong>Usage:</strong> Once per game</p>
        {hasBeenUsed ? (
          <p className="text-red-500 font-semibold">✓ Already used this game</p>
        ) : (
          <p className="text-green-500 font-semibold">✓ Available to use</p>
        )}
        <p className="text-xs glass-text-tertiary mt-2">
          Play this combo to replicate your winning strategy! Cannot be combined with Golden Card.
        </p>
      </div>
    </div>
  );
};

export default MVPCard;
