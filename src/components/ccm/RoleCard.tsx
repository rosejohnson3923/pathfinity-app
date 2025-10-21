/**
 * CCM Role Card Component
 *
 * Displays a career role card with:
 * - Card back background (light/dark theme)
 * - Role name and C-Suite organization
 * - Quality indicators for each P category (perfect/good/not-in)
 * - Primary and secondary soft skills
 * - Color-coded by C-Suite org
 *
 * States:
 * - available: Can be selected (interactive)
 * - selected: Player has selected this card (highlighted)
 * - disabled: Cannot be used (grayed out)
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Check } from 'lucide-react';

interface RoleCardProps {
  cardData: {
    id: string;
    cardCode: string;
    displayName: string;
    description: string;
    cSuiteOrg: 'ceo' | 'cfo' | 'cmo' | 'cto' | 'chro' | 'coo';
    qualityForPeople: 'perfect' | 'good' | 'not_in';
    qualityForProduct: 'perfect' | 'good' | 'not_in';
    qualityForProcess: 'perfect' | 'good' | 'not_in';
    qualityForPlace: 'perfect' | 'good' | 'not_in';
    qualityForPromotion: 'perfect' | 'good' | 'not_in';
    qualityForPrice: 'perfect' | 'good' | 'not_in';
    primarySoftSkills: string[];
    secondarySoftSkills: string[];
    colorTheme: string;
    gradeLevel: string;
  };
  state: 'available' | 'selected' | 'disabled';
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  showFullDescription?: boolean;
}

export const RoleCard: React.FC<RoleCardProps> = ({
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
      orgSize: 'text-[10px]',
      qualitySize: 'w-3 h-3',
      fontSize: 'text-[9px]'
    },
    medium: {
      width: 180,
      height: 270,
      titleSize: 'text-sm',
      orgSize: 'text-xs',
      qualitySize: 'w-4 h-4',
      fontSize: 'text-[10px]'
    },
    large: {
      width: 220,
      height: 330,
      titleSize: 'text-base',
      orgSize: 'text-sm',
      qualitySize: 'w-5 h-5',
      fontSize: 'text-xs'
    }
  };

  const config = sizeConfig[size];

  // Card back image based on theme
  const cardBackImage = theme === 'dark'
    ? '/assets/career-challenge/MCC_Card_Back_Dark.png'
    : '/assets/career-challenge/MCC_Card_Back_Light.png';

  // C-Suite organization display
  const cSuiteLabels: Record<string, string> = {
    ceo: 'CEO',
    cfo: 'CFO',
    cmo: 'CMO',
    cto: 'CTO',
    chro: 'CHRO',
    coo: 'COO'
  };

  // C-Suite color mapping
  const cSuiteColors: Record<string, { bg: string; text: string; border: string }> = {
    ceo: { bg: 'bg-purple-600', text: 'text-purple-100', border: 'border-purple-400' },
    cfo: { bg: 'bg-green-600', text: 'text-green-100', border: 'border-green-400' },
    cmo: { bg: 'bg-orange-600', text: 'text-orange-100', border: 'border-orange-400' },
    cto: { bg: 'bg-blue-600', text: 'text-blue-100', border: 'border-blue-400' },
    chro: { bg: 'bg-pink-600', text: 'text-pink-100', border: 'border-pink-400' },
    coo: { bg: 'bg-teal-600', text: 'text-teal-100', border: 'border-teal-400' }
  };

  const colors = cSuiteColors[cardData.cSuiteOrg];

  // P Category quality icons
  const pCategories = [
    { key: 'people', label: 'PPL', quality: cardData.qualityForPeople },
    { key: 'product', label: 'PRD', quality: cardData.qualityForProduct },
    { key: 'process', label: 'PRC', quality: cardData.qualityForProcess },
    { key: 'place', label: 'PLC', quality: cardData.qualityForPlace },
    { key: 'promotion', label: 'PRM', quality: cardData.qualityForPromotion },
    { key: 'price', label: 'PRI', quality: cardData.qualityForPrice }
  ];

  const getQualityColor = (quality: string) => {
    if (quality === 'perfect') return 'bg-green-500 text-white';
    if (quality === 'good') return 'bg-blue-500 text-white';
    return 'bg-gray-400 text-gray-200';
  };

  const getQualityIcon = (quality: string) => {
    if (quality === 'perfect') return <Star className={config.qualitySize} fill="currentColor" />;
    if (quality === 'good') return <Check className={config.qualitySize} />;
    return null;
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
      aria-label={`${cardData.displayName} - ${cSuiteLabels[cardData.cSuiteOrg]} Role Card - ${state}`}
      tabIndex={isInteractive ? 0 : -1}
      whileHover={isInteractive ? { y: -5 } : undefined}
      whileTap={isInteractive ? { scale: 0.98 } : undefined}
    >
      {/* Card Back Background */}
      <img
        src={cardBackImage}
        alt="Role Card Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Card Content Overlay */}
      <div className="absolute inset-0 p-3 flex flex-col">
        {/* C-Suite Badge */}
        <div className={`${colors.bg} ${colors.text} rounded-lg px-2 py-1 text-center font-bold ${config.orgSize} shadow-md mb-2`}>
          {cSuiteLabels[cardData.cSuiteOrg]} ORGANIZATION
        </div>

        {/* Role Title */}
        <div className="bg-white/95 dark:bg-gray-900/95 rounded-lg px-2 py-2 mb-2 shadow-md">
          <h3 className={`${config.titleSize} font-bold text-gray-900 dark:text-white text-center leading-tight`}>
            {cardData.displayName}
          </h3>
        </div>

        {/* Quality Grid (6 P's) */}
        <div className="bg-black/60 rounded-lg p-2 mb-2">
          <div className="grid grid-cols-3 gap-1">
            {pCategories.map((cat) => (
              <div
                key={cat.key}
                className={`${getQualityColor(cat.quality)} rounded px-1 py-0.5 flex items-center justify-between ${config.fontSize}`}
              >
                <span className="font-bold">{cat.label}</span>
                <span className="ml-1">{getQualityIcon(cat.quality)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div className="flex-1 bg-white/90 dark:bg-gray-800/90 rounded-lg p-2 overflow-hidden">
          {/* Primary Skills */}
          <div className="mb-2">
            <div className={`${config.fontSize} font-bold text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1`}>
              <TrendingUp className={config.qualitySize} />
              <span>Primary Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {cardData.primarySoftSkills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className={`${config.fontSize} bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Secondary Skills */}
          <div>
            <div className={`${config.fontSize} font-bold text-blue-700 dark:text-blue-300 mb-1`}>
              Secondary Skills
            </div>
            <div className="flex flex-wrap gap-1">
              {cardData.secondarySoftSkills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className={`${config.fontSize} bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Full Description (if enabled) */}
          {showFullDescription && (
            <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
              <p className={`${config.fontSize} text-gray-700 dark:text-gray-300 leading-tight`}>
                {cardData.description.slice(0, 120)}...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selection Indicator */}
      {state === 'selected' && (
        <div className="absolute top-2 right-2">
          <div className={`${colors.bg} text-white rounded-full p-1.5 shadow-lg`}>
            <Check className="w-5 h-5" />
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
    </motion.div>
  );
};

// Helper component for displaying quality legend
export const RoleCardLegend: React.FC = () => {
  return (
    <div className="glass-card p-4 rounded-lg">
      <h4 className="font-bold mb-2 glass-text-primary">Quality Ratings</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-green-500" fill="currentColor" />
          <span className="glass-text-secondary">Perfect (60 pts) - Best lens alignment</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-blue-500" />
          <span className="glass-text-secondary">Good (40 pts) - Solid alignment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded" />
          <span className="glass-text-secondary">Not-In (25 pts) - Weak alignment</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/20">
        <p className="text-xs glass-text-tertiary">
          PPL = People, PRD = Product, PRC = Process, PLC = Place, PRM = Promotion, PRI = Price
        </p>
      </div>
    </div>
  );
};

export default RoleCard;
