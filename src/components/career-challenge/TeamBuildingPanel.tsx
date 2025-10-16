/**
 * Team Building Panel for DLCC (Discovered Live! Career Challenge)
 * Interactive drag-and-drop interface for assembling teams to tackle challenges
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Users,
  Shield,
  Star,
  Zap,
  TrendingUp,
  Award,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Target,
  Lock,
  Unlock
} from 'lucide-react';
import type { RoleCard, Challenge } from '../../types/CareerChallengeTypes';

interface TeamBuildingPanelProps {
  myRoleCards: RoleCard[];
  activeChallenge: Challenge | null;
  selectedTeam: Set<string>;
  isMyTurn: boolean;
  onToggleCard: (roleCardId: string) => void;
  onSubmitTeam: () => void;
  industryColorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface TeamSlot {
  id: number;
  roleCard: RoleCard | null;
}

export const TeamBuildingPanel: React.FC<TeamBuildingPanelProps> = ({
  myRoleCards,
  activeChallenge,
  selectedTeam,
  isMyTurn,
  onToggleCard,
  onSubmitTeam,
  industryColorScheme = {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#60A5FA'
  }
}) => {
  const [teamSlots, setTeamSlots] = useState<TeamSlot[]>([]);
  const [draggingCard, setDraggingCard] = useState<RoleCard | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [showSynergyHint, setShowSynergyHint] = useState(false);

  // Initialize team slots based on challenge requirements
  useEffect(() => {
    if (activeChallenge) {
      const slots: TeamSlot[] = [];
      for (let i = 0; i < activeChallenge.maxRolesAllowed; i++) {
        const roleCard = myRoleCards.find(card => selectedTeam.has(card.id));
        slots.push({
          id: i,
          roleCard: roleCard && i < Array.from(selectedTeam).indexOf(roleCard.id) ? roleCard : null
        });
      }
      setTeamSlots(slots);
    }
  }, [activeChallenge, selectedTeam, myRoleCards]);

  // Get rarity color gradient
  const getRarityGradient = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'from-yellow-400 via-orange-500 to-red-500';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'uncommon':
        return 'from-green-400 to-green-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  // Get rarity glow effect
  const getRarityGlow = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'shadow-[0_0_30px_rgba(251,191,36,0.5)]';
      case 'epic':
        return 'shadow-[0_0_25px_rgba(168,85,247,0.5)]';
      case 'rare':
        return 'shadow-[0_0_20px_rgba(59,130,246,0.5)]';
      case 'uncommon':
        return 'shadow-[0_0_15px_rgba(34,197,94,0.5)]';
      default:
        return 'shadow-lg';
    }
  };

  // Calculate team power
  const calculateTeamPower = () => {
    let totalPower = 0;
    selectedTeam.forEach(cardId => {
      const card = myRoleCards.find(c => c.id === cardId);
      if (card) {
        totalPower += card.basePower;
        // Add category bonuses if they match the challenge
        if (activeChallenge && card.category_bonuses) {
          const bonus = card.category_bonuses[activeChallenge.category];
          if (bonus) totalPower += bonus;
        }
      }
    });
    return totalPower;
  };

  // Check if team meets requirements
  const isTeamValid = () => {
    if (!activeChallenge) return false;
    const teamSize = selectedTeam.size;
    return teamSize >= activeChallenge.minRolesRequired &&
           teamSize <= activeChallenge.maxRolesAllowed;
  };

  // Handle drag start
  const handleDragStart = (card: RoleCard) => {
    setDraggingCard(card);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingCard(null);
    setHoveredSlot(null);
  };

  // Handle drop on slot
  const handleDropOnSlot = (slotId: number) => {
    if (draggingCard && !selectedTeam.has(draggingCard.id)) {
      onToggleCard(draggingCard.id);
    }
    setDraggingCard(null);
    setHoveredSlot(null);
  };

  if (!activeChallenge) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6 text-center">
        <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Select a challenge first
        </p>
      </div>
    );
  }

  if (!isMyTurn) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6 text-center">
        <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Wait for your turn to build a team
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          Build Your Team
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-500">Power: </span>
            <span className="text-2xl font-bold text-purple-600">
              {calculateTeamPower()}
            </span>
          </div>
          <button
            onClick={() => setShowSynergyHint(!showSynergyHint)}
            className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Team Slots */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Team Composition ({selectedTeam.size}/{activeChallenge.maxRolesAllowed})
          </p>
          {isTeamValid() ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: activeChallenge.maxRolesAllowed }).map((_, index) => {
            const isRequired = index < activeChallenge.minRolesRequired;
            const roleCard = myRoleCards.find(card =>
              Array.from(selectedTeam)[index] === card.id
            );

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoveredSlot(index);
                }}
                onDragLeave={() => setHoveredSlot(null)}
                onDrop={() => handleDropOnSlot(index)}
                className={`
                  relative aspect-[3/4] rounded-xl border-2 border-dashed transition-all
                  ${hoveredSlot === index
                    ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30'
                    : isRequired
                    ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/10'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50'
                  }
                  ${roleCard ? getRarityGlow(roleCard.rarity) : ''}
                `}
              >
                {roleCard ? (
                  <motion.div
                    layoutId={`role-card-${roleCard.id}`}
                    className="absolute inset-0 p-2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <div className={`
                      h-full rounded-lg p-3 bg-gradient-to-br ${getRarityGradient(roleCard.rarity)}
                      text-white flex flex-col justify-between
                    `}>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                          {roleCard.rarity}
                        </p>
                        <p className="font-bold text-sm mt-1 line-clamp-2">
                          {roleCard.roleName}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          <span className="font-bold">{roleCard.basePower}</span>
                        </div>
                        <button
                          onClick={() => onToggleCard(roleCard.id)}
                          className="p-1 bg-white/20 rounded hover:bg-white/30"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    {isRequired ? (
                      <>
                        <Plus className="w-8 h-8 mb-2" />
                        <p className="text-xs font-medium">Required</p>
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 mb-1 opacity-50" />
                        <p className="text-xs">Optional</p>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Requirements Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Requirements:</strong> {activeChallenge.minRolesRequired} minimum, {activeChallenge.maxRolesAllowed} maximum roles
            {activeChallenge.recommended_roles && (
              <span className="block mt-1">
                <strong>Recommended:</strong> {activeChallenge.recommended_roles.join(', ')}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Available Role Cards */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
          Available Roles ({myRoleCards.filter(c => !selectedTeam.has(c.id)).length})
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
          <AnimatePresence>
            {myRoleCards
              .filter(card => !selectedTeam.has(card.id))
              .map((card) => (
                <motion.div
                  key={card.id}
                  layoutId={`role-card-${card.id}`}
                  draggable
                  onDragStart={() => handleDragStart(card)}
                  onDragEnd={handleDragEnd}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleCard(card.id)}
                  className={`
                    relative p-4 rounded-xl cursor-pointer transition-all
                    bg-gradient-to-br ${getRarityGradient(card.rarity)}
                    ${getRarityGlow(card.rarity)}
                  `}
                >
                  <div className="text-white">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                      {card.rarity}
                    </p>
                    <p className="font-bold text-sm mt-1 mb-2 line-clamp-2">
                      {card.roleName}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        <span className="font-bold">{card.basePower}</span>
                      </div>
                      {card.category_bonuses?.[activeChallenge.category] && (
                        <div className="flex items-center gap-1 text-yellow-300">
                          <Zap className="w-4 h-4" />
                          <span className="text-xs font-bold">
                            +{card.category_bonuses[activeChallenge.category]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.div
                    className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSubmitTeam}
        disabled={!isTeamValid()}
        className={`
          w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all
          ${isTeamValid()
            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {!isTeamValid()
          ? `Add ${activeChallenge.minRolesRequired - selectedTeam.size} more role${activeChallenge.minRolesRequired - selectedTeam.size > 1 ? 's' : ''}`
          : `Submit Team (Power: ${calculateTeamPower()})`
        }
      </motion.button>

      {/* Synergy Hint */}
      <AnimatePresence>
        {showSynergyHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="text-sm text-purple-700 dark:text-purple-300">
                <p className="font-semibold mb-1">Synergy Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Combine roles with matching specialties for bonus effects</li>
                  <li>Look for category bonuses that match the challenge</li>
                  <li>Higher rarity cards provide more base power</li>
                  <li>Some role combinations unlock special synergies</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamBuildingPanel;