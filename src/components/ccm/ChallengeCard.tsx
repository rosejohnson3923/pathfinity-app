/**
 * CCM Challenge Card Component
 *
 * Displays the current business challenge card that all players are solving.
 * Shown prominently in the center of the game board.
 *
 * Features:
 * - Card back background (light/dark theme)
 * - Challenge title and description
 * - P category indicator (people/product/process/place/promotion/price)
 * - Difficulty level
 * - Context/educational information
 * - Animated entrance and emphasis
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  Cog,
  MapPin,
  Megaphone,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Info
} from 'lucide-react';

interface ChallengeCardProps {
  cardData: {
    id: string;
    cardCode: string;
    pCategory: 'people' | 'product' | 'process' | 'place' | 'promotion' | 'price';
    title: string;
    description: string;
    context: string;
    difficultyLevel: 'easy' | 'medium' | 'hard';
    gradeLevel: string;
  };
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showContext?: boolean;
  roundNumber?: number;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  cardData,
  size = 'large',
  showContext = true,
  roundNumber
}) => {
  const theme = useTheme();

  // Size configurations
  const sizeConfig = {
    small: {
      width: 200,
      height: 300,
      titleSize: 'text-sm',
      descSize: 'text-xs',
      contextSize: 'text-[10px]',
      iconSize: 'w-6 h-6'
    },
    medium: {
      width: 260,
      height: 390,
      titleSize: 'text-base',
      descSize: 'text-sm',
      contextSize: 'text-xs',
      iconSize: 'w-8 h-8'
    },
    large: {
      width: 320,
      height: 480,
      titleSize: 'text-lg',
      descSize: 'text-sm',
      contextSize: 'text-xs',
      iconSize: 'w-10 h-10'
    },
    xlarge: {
      width: 400,
      height: 600,
      titleSize: 'text-xl',
      descSize: 'text-base',
      contextSize: 'text-sm',
      iconSize: 'w-12 h-12'
    }
  };

  const config = sizeConfig[size];

  // Card back image based on theme
  const cardBackImage = theme === 'dark'
    ? '/assets/career-challenge/MCC_Card_Back_Dark.png'
    : '/assets/career-challenge/MCC_Card_Back_Light.png';

  // P Category configuration
  const pCategoryConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bgGradient: string }> = {
    people: {
      icon: <Users className={config.iconSize} />,
      label: 'PEOPLE',
      color: 'text-pink-100',
      bgGradient: 'from-pink-600 to-rose-600'
    },
    product: {
      icon: <Package className={config.iconSize} />,
      label: 'PRODUCT',
      color: 'text-blue-100',
      bgGradient: 'from-blue-600 to-cyan-600'
    },
    process: {
      icon: <Cog className={config.iconSize} />,
      label: 'PROCESS',
      color: 'text-purple-100',
      bgGradient: 'from-purple-600 to-indigo-600'
    },
    place: {
      icon: <MapPin className={config.iconSize} />,
      label: 'PLACE',
      color: 'text-green-100',
      bgGradient: 'from-green-600 to-emerald-600'
    },
    promotion: {
      icon: <Megaphone className={config.iconSize} />,
      label: 'PROMOTION',
      color: 'text-orange-100',
      bgGradient: 'from-orange-600 to-amber-600'
    },
    price: {
      icon: <DollarSign className={config.iconSize} />,
      label: 'PRICE',
      color: 'text-emerald-100',
      bgGradient: 'from-emerald-600 to-teal-600'
    }
  };

  const category = pCategoryConfig[cardData.pCategory];

  // Difficulty level configuration
  const difficultyConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    easy: {
      label: 'Easy',
      color: 'bg-green-500 text-white',
      icon: <TrendingUp className="w-4 h-4" />
    },
    medium: {
      label: 'Medium',
      color: 'bg-yellow-500 text-white',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    hard: {
      label: 'Hard',
      color: 'bg-red-500 text-white',
      icon: <AlertTriangle className="w-4 h-4" />
    }
  };

  const difficulty = difficultyConfig[cardData.difficultyLevel];

  return (
    <motion.div
      className="relative rounded-xl overflow-hidden shadow-2xl"
      style={{ width: config.width, height: config.height }}
      initial={{ scale: 0.8, opacity: 0, rotateY: -180 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      {/* Card Back Background */}
      <img
        src={cardBackImage}
        alt="Challenge Card Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Card Content Overlay */}
      <div className="absolute inset-0 p-4 flex flex-col">
        {/* Header with P Category and Round Number */}
        <div className="flex justify-between items-center mb-3">
          {/* P Category Badge */}
          <div className={`bg-gradient-to-r ${category.bgGradient} ${category.color} rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg flex-1`}>
            {category.icon}
            <div>
              <div className="text-xs font-bold opacity-80">Challenge</div>
              <div className="text-sm font-extrabold">{category.label}</div>
            </div>
          </div>

          {/* Round Number */}
          {roundNumber && (
            <div className="ml-2 bg-gray-900/90 text-white rounded-lg px-3 py-2 text-center">
              <div className="text-xs opacity-80">Round</div>
              <div className="text-xl font-bold">{roundNumber}</div>
            </div>
          )}
        </div>

        {/* Challenge Title */}
        <div className="bg-white/95 dark:bg-gray-900/95 rounded-lg px-3 py-3 mb-3 shadow-lg">
          <h2 className={`${config.titleSize} font-bold text-gray-900 dark:text-white leading-tight`}>
            {cardData.title}
          </h2>
        </div>

        {/* Challenge Description */}
        <div className="flex-1 bg-white/90 dark:bg-gray-800/90 rounded-lg p-3 mb-3 overflow-y-auto shadow-md">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className={`${config.descSize} font-bold text-gray-700 dark:text-gray-300`}>
                The Challenge
              </span>
            </div>
            <p className={`${config.descSize} text-gray-800 dark:text-gray-200 leading-relaxed`}>
              {cardData.description}
            </p>
          </div>

          {/* Context Section */}
          {showContext && (
            <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className={`${config.contextSize} font-bold text-gray-700 dark:text-gray-300`}>
                  Context
                </span>
              </div>
              <p className={`${config.contextSize} text-gray-600 dark:text-gray-400 leading-relaxed italic`}>
                {cardData.context}
              </p>
            </div>
          )}
        </div>

        {/* Footer with Difficulty */}
        <div className="flex justify-between items-center">
          <div className={`${difficulty.color} rounded-lg px-3 py-2 flex items-center gap-2 font-bold text-sm shadow-md`}>
            {difficulty.icon}
            <span>{difficulty.label}</span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 text-xs font-semibold">
            {cardData.gradeLevel.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Pulsing Glow Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          boxShadow: [
            `0 0 20px rgba(147, 51, 234, 0.3)`,
            `0 0 40px rgba(147, 51, 234, 0.5)`,
            `0 0 20px rgba(147, 51, 234, 0.3)`
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
    </motion.div>
  );
};

// Compact version for showing in round summary
export const ChallengeCardCompact: React.FC<{ cardData: ChallengeCardProps['cardData'] }> = ({ cardData }) => {
  const pCategoryIcons: Record<string, React.ReactNode> = {
    people: <Users className="w-5 h-5" />,
    product: <Package className="w-5 h-5" />,
    process: <Cog className="w-5 h-5" />,
    place: <MapPin className="w-5 h-5" />,
    promotion: <Megaphone className="w-5 h-5" />,
    price: <DollarSign className="w-5 h-5" />
  };

  const pCategoryColors: Record<string, string> = {
    people: 'bg-pink-500',
    product: 'bg-blue-500',
    process: 'bg-purple-500',
    place: 'bg-green-500',
    promotion: 'bg-orange-500',
    price: 'bg-emerald-500'
  };

  return (
    <div className="glass-card p-3 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`${pCategoryColors[cardData.pCategory]} text-white p-2 rounded-lg`}>
          {pCategoryIcons[cardData.pCategory]}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm glass-text-primary">{cardData.title}</h4>
          <p className="text-xs glass-text-tertiary">{cardData.pCategory.toUpperCase()} Challenge</p>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
