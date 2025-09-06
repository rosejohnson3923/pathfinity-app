// ================================================================
// GAMIFIED CAREER SELECTOR
// Enhanced career selection with vector emojis and gamification
// ================================================================

import React, { useState, useEffect } from 'react';
import { Star, Lock, Zap, Trophy, Target } from 'lucide-react';
import { 
  vectorCareerEmojiService, 
  useVectorCareerEmoji, 
  VectorCareerEmoji 
} from '../services/vectorCareerEmojiService';

interface GamefiedCareerSelectorProps {
  gradeLevel: string;
  studentLevel?: number;
  studentXP?: number;
  onCareerSelect: (careerId: string) => void;
  selectedCareerId?: string;
  showAnimations?: boolean;
  availableCareerIds?: string[];
}

export const GamefiedCareerSelector: React.FC<GamefiedCareerSelectorProps> = ({
  gradeLevel,
  studentLevel = 1,
  studentXP = 0,
  onCareerSelect,
  selectedCareerId,
  showAnimations = true,
  availableCareerIds
}) => {
  const [hoveredCareer, setHoveredCareer] = useState<string | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  
  let careers = vectorCareerEmojiService.getGameifiedCareersForGrade(gradeLevel, studentLevel);
  console.log('🎮 Grade level passed:', gradeLevel, 'Student level:', studentLevel);
  console.log('🎮 Careers returned by service:', careers.map(c => c.id));
  
  // If availableCareerIds is provided, filter to only show those careers
  if (availableCareerIds && availableCareerIds.length > 0) {
    console.log('🎯 Available career IDs to filter:', availableCareerIds);
    careers = careers.filter(career => availableCareerIds.includes(career.id));
    console.log('🎯 Filtered careers result:', careers.map(c => c.id));
  }
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600', 
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  const filteredCareers = filterRarity === 'all' 
    ? careers 
    : careers.filter(c => c.gamification.rarity === filterRarity);

  return (
    <div className="gamified-career-selector p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            🎮 Choose Your Career Adventure
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Level {studentLevel} • {studentXP} XP • {gradeLevel}
          </p>
        </div>
        
        {/* Rarity Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
      </div>

      {/* Career Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {filteredCareers.map(career => (
          <GamefiedCareerCard
            key={career.id}
            career={career}
            gradeLevel={gradeLevel}
            studentLevel={studentLevel}
            isSelected={selectedCareerId === career.id}
            isHovered={hoveredCareer === career.id}
            showAnimations={showAnimations}
            onSelect={() => onCareerSelect(career.id)}
            onHover={() => setHoveredCareer(career.id)}
            onLeave={() => setHoveredCareer(null)}
          />
        ))}
      </div>

      {/* XP Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress to Level {studentLevel + 1}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {studentXP} / {(studentLevel + 1) * 100} XP
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (studentXP / ((studentLevel + 1) * 100)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Unlock Hints */}
      {careers.some(c => c.gamification.unlockLevel > studentLevel) && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {careers.filter(c => c.gamification.unlockLevel > studentLevel).length} careers unlock at higher levels!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual gamified career card
const GamefiedCareerCard: React.FC<{
  career: VectorCareerEmoji;
  gradeLevel: string;
  studentLevel: number;
  isSelected: boolean;
  isHovered: boolean;
  showAnimations: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}> = ({ 
  career, 
  gradeLevel, 
  studentLevel, 
  isSelected, 
  isHovered, 
  showAnimations,
  onSelect, 
  onHover, 
  onLeave 
}) => {
  const { renderIcon, unlockInfo, triggerAnimation } = useVectorCareerEmoji(career.id, gradeLevel, studentLevel);
  
  const isUnlocked = career.gamification.unlockLevel <= studentLevel;
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600', 
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  // Trigger animations on hover/selection
  useEffect(() => {
    if (isHovered && showAnimations && isUnlocked) {
      triggerAnimation('thinking');
    }
    if (isSelected && showAnimations && isUnlocked) {
      triggerAnimation('excited');
    }
  }, [isHovered, isSelected, showAnimations, isUnlocked, triggerAnimation]);

  return (
    <div
      className={`career-card relative p-4 rounded-xl transition-all duration-300 cursor-pointer ${
        isUnlocked ? 'hover:scale-105 hover:shadow-lg' : 'opacity-60 cursor-not-allowed'
      } ${
        isSelected 
          ? 'ring-4 ring-blue-400 ring-opacity-50 shadow-lg' 
          : 'hover:shadow-md'
      }`}
      style={{
        background: isUnlocked 
          ? `linear-gradient(135deg, ${career.theme.primaryColor}15, ${career.theme.secondaryColor}15)`
          : 'linear-gradient(135deg, #f3f4f615, #9ca3af15)',
        borderColor: career.theme.primaryColor,
        borderWidth: isSelected ? '2px' : '1px',
        borderStyle: 'solid'
      }}
      onClick={() => isUnlocked && onSelect()}
      onMouseEnter={() => isUnlocked && onHover()}
      onMouseLeave={() => isUnlocked && onLeave()}
    >
      {/* Rarity Indicator */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${rarityColors[career.gamification.rarity]}`}>
        {career.gamification.rarity.toUpperCase()}
      </div>

      {/* Lock Overlay for Locked Careers */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-xl">
          <div className="text-center">
            <Lock className="w-6 h-6 text-gray-500 mx-auto mb-1" />
            <span className="text-xs text-gray-500 font-medium">Level {career.gamification.unlockLevel}</span>
          </div>
        </div>
      )}

      {/* Career Icon */}
      <div className="flex justify-center mb-3">
        {renderIcon({ 
          size: 48, 
          style: showAnimations && (isHovered || isSelected) ? 'animated' : 'static',
          className: isUnlocked ? '' : 'grayscale'
        })}
      </div>

      {/* Career Info */}
      <div className="text-center">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
          {career.name}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize mb-2">
          {career.category}
        </p>

        {/* XP and Badges */}
        {isUnlocked && (
          <div className="flex items-center justify-center space-x-2 text-xs">
            <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
              <Zap className="w-3 h-3" />
              <span>{career.gamification.xpValue} XP</span>
            </div>
            <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
              <Trophy className="w-3 h-3" />
              <span>{career.gamification.badges.length}</span>
            </div>
          </div>
        )}

        {/* Prestige Indicator */}
        {career.gamification.prestige && (
          <div className="mt-2 flex items-center justify-center">
            <div className="px-2 py-1 bg-gradient-to-r from-gold-400 to-yellow-500 rounded-full text-xs font-bold text-white">
              ⭐ PRESTIGE
            </div>
          </div>
        )}
      </div>

      {/* Hover Effects */}
      {isHovered && isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-xl pointer-events-none" />
      )}
    </div>
  );
};

export default GamefiedCareerSelector;