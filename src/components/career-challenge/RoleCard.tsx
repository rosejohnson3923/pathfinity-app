/**
 * Role Card Component
 *
 * Displays a role/character card with rarity effects, power levels, and animations
 * Used in Career Challenge game mode
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Zap,
  Shield,
  Award,
  TrendingUp,
  Users,
  Sparkles,
  Lock,
  CheckCircle,
  Info,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import type { RoleCard as RoleCardType, Industry } from '../../types/CareerChallengeTypes';

interface RoleCardProps {
  card: RoleCardType;
  industry?: Industry;
  isOwned?: boolean;
  quantity?: number;
  isSelected?: boolean;
  isDisabled?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  onClick?: () => void;
  onInfoClick?: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  card,
  industry,
  isOwned = false,
  quantity = 0,
  isSelected = false,
  isDisabled = false,
  showDetails = false,
  compact = false,
  onClick,
  onInfoClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showBack, setShowBack] = useState(false);

  // Rarity colors and effects
  const rarityConfig = {
    common: {
      gradient: 'from-gray-400 to-gray-600',
      borderColor: 'border-gray-400',
      glowColor: 'rgba(156, 163, 175, 0.5)',
      particleColor: '#9CA3AF',
      icon: '⚪',
      label: 'Common'
    },
    uncommon: {
      gradient: 'from-green-400 to-green-600',
      borderColor: 'border-green-400',
      glowColor: 'rgba(74, 222, 128, 0.5)',
      particleColor: '#4ADE80',
      icon: '🟢',
      label: 'Uncommon'
    },
    rare: {
      gradient: 'from-blue-400 to-blue-600',
      borderColor: 'border-blue-400',
      glowColor: 'rgba(96, 165, 250, 0.5)',
      particleColor: '#60A5FA',
      icon: '🔵',
      label: 'Rare'
    },
    epic: {
      gradient: 'from-purple-400 to-purple-600',
      borderColor: 'border-purple-400',
      glowColor: 'rgba(196, 181, 253, 0.5)',
      particleColor: '#C4B5FD',
      icon: '💜',
      label: 'Epic'
    },
    legendary: {
      gradient: 'from-yellow-400 via-orange-400 to-red-500',
      borderColor: 'border-yellow-400',
      glowColor: 'rgba(251, 191, 36, 0.6)',
      particleColor: '#FBBF24',
      icon: '⭐',
      label: 'Legendary',
      animated: true
    },
    mythic: {
      gradient: 'from-pink-400 via-purple-500 to-indigo-600',
      borderColor: 'border-pink-400',
      glowColor: 'rgba(236, 72, 153, 0.7)',
      particleColor: '#EC4899',
      icon: '🌟',
      label: 'Mythic',
      animated: true
    }
  };

  const rarity = rarityConfig[card.rarity] || rarityConfig.common;
  const cardSize = compact ? 'h-72 w-52' : 'h-96 w-72';

  // Calculate total power with category bonuses
  const totalPower = card.basePower +
    (card.categoryBonuses ? Object.values(card.categoryBonuses).reduce((a, b) => a + b, 0) : 0);

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBack(!showBack);
  };

  return (
    <motion.div
      className={`${cardSize} relative perspective-1000 ${isDisabled ? 'opacity-50' : 'cursor-pointer'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      onClick={handleClick}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className={`absolute inset-0 rounded-2xl border-4 ${rarity.borderColor} shadow-2xl`} />
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-t ${rarity.gradient} opacity-20`} />
        </motion.div>
      )}

      <motion.div
        className="relative w-full h-full transform-style-preserve-3d"
        animate={{ rotateY: showBack ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        {/* Card Front */}
        <div className="absolute inset-0 backface-hidden">
          <div
            className={`
              relative w-full h-full rounded-2xl
              bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900
              border-4 ${rarity.borderColor}
              shadow-xl overflow-hidden
            `}
            style={{
              boxShadow: isHovered && !isDisabled ? `0 0 30px ${rarity.glowColor}` : undefined
            }}
          >
            {/* Rarity gradient header */}
            <div className={`h-20 bg-gradient-to-r ${rarity.gradient} relative`}>
              {/* Animated particles for high rarity */}
              {rarity.animated && (
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full"
                      style={{
                        backgroundColor: rarity.particleColor,
                        left: `${20 + i * 15}%`
                      }}
                      animate={{
                        y: [-20, -100],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.3,
                        repeat: Infinity
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Industry icon */}
              <div className="absolute top-2 left-2 text-2xl">
                {industry?.icon || '💼'}
              </div>

              {/* Rarity badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/30 rounded-full px-2 py-1">
                <span className="text-sm">{rarity.icon}</span>
                <span className="text-white text-xs font-bold">{rarity.label}</span>
              </div>

              {/* Power level */}
              <div className="absolute bottom-2 right-2">
                <div className="flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 rounded-full px-3 py-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-gray-900 dark:text-white">{card.basePower}</span>
                </div>
              </div>
            </div>

            {/* Card content */}
            <div className={`${compact ? 'p-3' : 'p-4'}`}>
              {/* Role name and title */}
              <h3 className={`font-bold text-gray-900 dark:text-white ${compact ? 'text-base' : 'text-lg'} mb-1`}>
                {card.roleName}
              </h3>
              {card.roleTitle && (
                <p className={`text-gray-600 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'} mb-2`}>
                  {card.roleTitle}
                </p>
              )}

              {/* Description */}
              <p className={`text-gray-700 dark:text-gray-300 ${compact ? 'text-xs line-clamp-3' : 'text-sm line-clamp-4'} mb-3`}>
                {card.description}
              </p>

              {/* Category bonuses */}
              {card.categoryBonuses && Object.keys(card.categoryBonuses).length > 0 && (
                <div className={`${compact ? 'mb-2' : 'mb-3'}`}>
                  <div className={`text-gray-500 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'} mb-1`}>
                    Bonuses:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(card.categoryBonuses)
                      .filter(([_, value]) => value > 0)
                      .slice(0, compact ? 2 : 3)
                      .map(([category, value]) => (
                        <div
                          key={category}
                          className={`
                            bg-gray-100 dark:bg-gray-800 rounded-full
                            ${compact ? 'px-2 py-0.5 text-xs' : 'px-2 py-1 text-xs'}
                          `}
                        >
                          <span className="text-gray-600 dark:text-gray-400">{category}</span>
                          <span className="text-green-600 dark:text-green-400 font-bold ml-1">+{value}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Special abilities (if any) */}
              {card.specialAbilities && card.specialAbilities.length > 0 && !compact && (
                <div className="mb-2">
                  <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {card.specialAbilities[0].name}
                    </span>
                  </div>
                </div>
              )}

              {/* Synergy indicators */}
              {card.synergyPartners && card.synergyPartners.length > 0 && !compact && (
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Users className="w-3 h-3" />
                  <span className="text-xs">
                    Synergies: {card.synergyPartners.length}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom section */}
            <div className={`
              absolute bottom-0 left-0 right-0
              bg-gradient-to-t from-gray-100 to-transparent dark:from-gray-900
              ${compact ? 'p-2' : 'p-3'}
            `}>
              <div className="flex justify-between items-center">
                {/* Ownership indicator */}
                <div className="flex items-center gap-2">
                  {isOwned ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {quantity > 1 && (
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          x{quantity}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {/* Info button */}
                {onInfoClick && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInfoClick();
                    }}
                    className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Info className="w-3 h-3" />
                  </motion.button>
                )}

                {/* Flip button */}
                <motion.button
                  onClick={handleFlip}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  whileHover={{ scale: 1.05 }}
                >
                  Details →
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Card Back (Details) */}
        <div className="absolute inset-0 rotate-y-180 backface-hidden">
          <div
            className={`
              relative w-full h-full rounded-2xl
              bg-gradient-to-br ${rarity.gradient}
              border-4 ${rarity.borderColor}
              shadow-xl overflow-hidden p-4
            `}
          >
            <div className="bg-white/95 dark:bg-gray-900/95 rounded-xl h-full p-4 overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {card.roleName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.roleTitle}
                  </p>
                </div>
                <button
                  onClick={handleFlip}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ← Back
                </button>
              </div>

              {/* Career Information */}
              {card.relatedCareerCode && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Career Path
                  </h4>
                  <div className="space-y-2">
                    {card.salaryRange && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {card.salaryRange}
                        </span>
                      </div>
                    )}
                    {card.educationRequirements && (
                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {card.educationRequirements.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Key Skills */}
              {card.keySkills && card.keySkills.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Key Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {card.keySkills.map(skill => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Backstory */}
              {card.backstory && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Backstory
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.backstory}
                  </p>
                </div>
              )}

              {/* Flavor text */}
              {card.flavorText && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs italic text-gray-600 dark:text-gray-400">
                    "{card.flavorText}"
                  </p>
                </div>
              )}

              {/* Statistics */}
              {showDetails && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div>Times Played: {card.timesPlayed || 0}</div>
                    <div>Win Rate: {card.winRate || 0}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Disabled overlay */}
      {isDisabled && (
        <div className="absolute inset-0 bg-gray-900/50 rounded-2xl flex items-center justify-center">
          <Lock className="w-8 h-8 text-white" />
        </div>
      )}
    </motion.div>
  );
};

/**
 * Role Card Collection Grid
 * Displays multiple role cards in a grid layout
 */
export const RoleCardGrid: React.FC<{
  cards: RoleCardType[];
  industry?: Industry;
  ownedCards?: Set<string>;
  selectedCards?: Set<string>;
  onCardClick?: (card: RoleCardType) => void;
  maxSelection?: number;
  compact?: boolean;
}> = ({
  cards,
  industry,
  ownedCards = new Set(),
  selectedCards = new Set(),
  onCardClick,
  maxSelection,
  compact = false
}) => {
  return (
    <div className={`grid ${compact ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}`}>
      <AnimatePresence>
        {cards.map((card) => {
          const isSelected = selectedCards.has(card.id);
          const isDisabled = !isSelected && maxSelection !== undefined && selectedCards.size >= maxSelection;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <RoleCard
                card={card}
                industry={industry}
                isOwned={ownedCards.has(card.id)}
                isSelected={isSelected}
                isDisabled={isDisabled}
                compact={compact}
                onClick={() => onCardClick?.(card)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default RoleCard;