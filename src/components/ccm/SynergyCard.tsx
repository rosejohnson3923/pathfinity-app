/**
 * CCM Synergy Card Component
 *
 * Displays a soft skills synergy card with:
 * - Card back background (light/dark theme)
 * - Synergy name and tagline
 * - Soft skills tags
 * - Effectiveness indicators for each P category (primary/secondary/neutral)
 * - Color-coded by synergy type
 *
 * Synergies provide a 1.20× multiplier when used
 *
 * States:
 * - available: Can be selected (interactive)
 * - selected: Player has selected this card (highlighted)
 * - disabled: Cannot be used (grayed out)
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Circle } from 'lucide-react';

interface SynergyCardProps {
  cardData: {
    id: string;
    cardCode: string;
    displayName: string;
    tagline: string;
    description: string;
    softSkillsTags: string[];
    effectivenessForPeople: 'primary' | 'secondary' | 'neutral';
    effectivenessForProduct: 'primary' | 'secondary' | 'neutral';
    effectivenessForProcess: 'primary' | 'secondary' | 'neutral';
    effectivenessForPlace: 'primary' | 'secondary' | 'neutral';
    effectivenessForPromotion: 'primary' | 'secondary' | 'neutral';
    effectivenessForPrice: 'primary' | 'secondary' | 'neutral';
    colorTheme: string;
    displayOrder: number;
  };
  state: 'available' | 'selected' | 'disabled';
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  showFullDescription?: boolean;
}

export const SynergyCard: React.FC<SynergyCardProps> = ({
  cardData,
  state,
  onClick,
  size = 'medium',
  showFullDescription = false
}) => {
  const theme = useTheme();

  // Size configurations
  const sizeConfig = {
    small: {
      width: 140,
      height: 210,
      titleSize: 'text-xs',
      taglineSize: 'text-[9px]',
      effectivenessSize: 'w-3 h-3',
      fontSize: 'text-[9px]'
    },
    medium: {
      width: 180,
      height: 270,
      titleSize: 'text-sm',
      taglineSize: 'text-[10px]',
      effectivenessSize: 'w-4 h-4',
      fontSize: 'text-[10px]'
    },
    large: {
      width: 220,
      height: 330,
      titleSize: 'text-base',
      taglineSize: 'text-xs',
      effectivenessSize: 'w-5 h-5',
      fontSize: 'text-xs'
    }
  };

  const config = sizeConfig[size];

  // Card back image based on theme
  const cardBackImage = theme === 'dark'
    ? '/assets/career-challenge/MCC_Card_Back_Dark.png'
    : '/assets/career-challenge/MCC_Card_Back_Light.png';

  // Synergy color mapping
  const synergyColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    blue: {
      bg: 'bg-blue-600',
      text: 'text-blue-100',
      border: 'border-blue-400',
      gradient: 'from-blue-500 to-cyan-500'
    },
    purple: {
      bg: 'bg-purple-600',
      text: 'text-purple-100',
      border: 'border-purple-400',
      gradient: 'from-purple-500 to-pink-500'
    },
    orange: {
      bg: 'bg-orange-600',
      text: 'text-orange-100',
      border: 'border-orange-400',
      gradient: 'from-orange-500 to-red-500'
    },
    green: {
      bg: 'bg-green-600',
      text: 'text-green-100',
      border: 'border-green-400',
      gradient: 'from-green-500 to-emerald-500'
    },
    pink: {
      bg: 'bg-pink-600',
      text: 'text-pink-100',
      border: 'border-pink-400',
      gradient: 'from-pink-500 to-rose-500'
    }
  };

  const colors = synergyColors[cardData.colorTheme] || synergyColors.blue;

  // P Category effectiveness indicators
  const pCategories = [
    { key: 'people', label: 'PPL', effectiveness: cardData.effectivenessForPeople },
    { key: 'product', label: 'PRD', effectiveness: cardData.effectivenessForProduct },
    { key: 'process', label: 'PRC', effectiveness: cardData.effectivenessForProcess },
    { key: 'place', label: 'PLC', effectiveness: cardData.effectivenessForPlace },
    { key: 'promotion', label: 'PRM', effectiveness: cardData.effectivenessForPromotion },
    { key: 'price', label: 'PRI', effectiveness: cardData.effectivenessForPrice }
  ];

  const getEffectivenessColor = (effectiveness: string) => {
    if (effectiveness === 'primary') return 'bg-yellow-500 text-white';
    if (effectiveness === 'secondary') return 'bg-blue-500 text-white';
    return 'bg-gray-500 text-gray-200';
  };

  const getEffectivenessIcon = (effectiveness: string) => {
    if (effectiveness === 'primary') return <Sparkles className={config.effectivenessSize} fill="currentColor" />;
    if (effectiveness === 'secondary') return <Zap className={config.effectivenessSize} />;
    return <Circle className={config.effectivenessSize} />;
  };

  // Determine if card is interactive
  const isInteractive = state === 'available' && onClick;
  const isDisabled = state === 'disabled';

  return (
    <motion.div
      className={`
        relative rounded-xl overflow-hidden shadow-xl
        ${isInteractive ? 'cursor-pointer hover:scale-105 hover:shadow-2xl' : 'cursor-default'}
        ${state === 'selected' ? `ring-4 ${colors.border} scale-105 shadow-2xl` : ''}
        ${isDisabled ? 'opacity-50 grayscale' : ''}
        transition-all duration-300
      `}
      style={{ width: config.width, height: config.height }}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      aria-label={`${cardData.displayName} - Synergy Card - ${state}`}
      tabIndex={isInteractive ? 0 : -1}
      whileHover={isInteractive ? { y: -5 } : undefined}
      whileTap={isInteractive ? { scale: 0.98 } : undefined}
    >
      {/* Card Back Background */}
      <img
        src={cardBackImage}
        alt="Synergy Card Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Card Content Overlay */}
      <div className="absolute inset-0 p-3 flex flex-col">
        {/* Synergy Badge with Multiplier */}
        <div className={`bg-gradient-to-r ${colors.gradient} text-white rounded-lg px-2 py-1.5 text-center font-bold shadow-md mb-2`}>
          <div className={config.taglineSize}>SYNERGY CARD</div>
          <div className="text-lg font-extrabold">×1.20</div>
        </div>

        {/* Synergy Name */}
        <div className="bg-white/95 dark:bg-gray-900/95 rounded-lg px-2 py-2 mb-2 shadow-md">
          <h3 className={`${config.titleSize} font-bold text-gray-900 dark:text-white text-center leading-tight`}>
            {cardData.displayName}
          </h3>
          <p className={`${config.taglineSize} text-gray-600 dark:text-gray-400 text-center mt-0.5`}>
            {cardData.tagline}
          </p>
        </div>

        {/* Effectiveness Grid (6 P's) */}
        <div className="bg-black/60 rounded-lg p-2 mb-2">
          <div className="grid grid-cols-3 gap-1">
            {pCategories.map((cat) => (
              <div
                key={cat.key}
                className={`${getEffectivenessColor(cat.effectiveness)} rounded px-1 py-0.5 flex items-center justify-between ${config.fontSize}`}
              >
                <span className="font-bold">{cat.label}</span>
                <span className="ml-1">{getEffectivenessIcon(cat.effectiveness)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Soft Skills Tags */}
        <div className="flex-1 bg-white/90 dark:bg-gray-800/90 rounded-lg p-2 overflow-hidden">
          <div className={`${config.fontSize} font-bold text-gray-700 dark:text-gray-300 mb-1.5`}>
            Soft Skills
          </div>
          <div className="flex flex-wrap gap-1">
            {cardData.softSkillsTags.slice(0, 5).map((skill, idx) => (
              <span
                key={idx}
                className={`${config.fontSize} bg-gradient-to-r ${colors.gradient} text-white px-1.5 py-0.5 rounded font-medium`}
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Full Description (if enabled) */}
          {showFullDescription && (
            <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
              <p className={`${config.fontSize} text-gray-700 dark:text-gray-300 leading-tight`}>
                {cardData.description.slice(0, 100)}...
              </p>
            </div>
          )}

          {/* Benefits Note */}
          <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
            <p className={`${config.fontSize} text-gray-600 dark:text-gray-400 italic text-center`}>
              Adds 1.20× multiplier to your score
            </p>
          </div>
        </div>
      </div>

      {/* Selection Indicator */}
      {state === 'selected' && (
        <div className="absolute top-2 right-2">
          <div className={`bg-gradient-to-r ${colors.gradient} text-white rounded-full p-1.5 shadow-lg`}>
            <Sparkles className="w-5 h-5" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Disabled Overlay */}
      {state === 'disabled' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-gray-600/90 text-white font-bold px-4 py-2 rounded-lg text-sm">
            UNAVAILABLE
          </div>
        </div>
      )}

      {/* Glow Effect for Available State */}
      {state === 'available' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)] animate-pulse`} />
        </div>
      )}
    </motion.div>
  );
};

// Helper component for displaying effectiveness legend
export const SynergyCardLegend: React.FC = () => {
  return (
    <div className="glass-card p-4 rounded-lg">
      <h4 className="font-bold mb-2 glass-text-primary">Effectiveness Ratings</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" fill="currentColor" />
          <span className="glass-text-secondary">Primary - Most effective for this category</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" />
          <span className="glass-text-secondary">Secondary - Moderately effective</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-gray-500" />
          <span className="glass-text-secondary">Neutral - Basic effectiveness</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/20">
        <p className="text-xs glass-text-tertiary">
          All synergy cards add a 1.20× multiplier to your score regardless of effectiveness rating.
        </p>
      </div>
    </div>
  );
};

export default SynergyCard;
