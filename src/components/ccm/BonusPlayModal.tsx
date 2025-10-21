/**
 * CCM Bonus Play Modal
 *
 * Appears after Rounds 2, 3, and 4 to allow players to:
 * 1. Keep their current randomly assigned/previously locked MVP card
 * 2. Swap it for a different role card from their hand
 *
 * The selected card becomes the locked MVP card for remaining rounds.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, RefreshCw, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import { RoleCard } from './RoleCard';
import '../../design-system/index.css';

interface RoleCardData {
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
}

interface BonusPlayModalProps {
  roundNumber: number; // Round that just completed (2, 3, or 4)
  currentMVPCard: RoleCardData; // The currently assigned/locked MVP card
  availableRoleCards: RoleCardData[]; // All role cards from player's hand
  onKeepMVPCard: () => void;
  onSwapMVPCard: (newCardId: string) => void;
}

export const BonusPlayModal: React.FC<BonusPlayModalProps> = ({
  roundNumber,
  currentMVPCard,
  availableRoleCards,
  onKeepMVPCard,
  onSwapMVPCard
}) => {
  const [selectedSwapCardId, setSelectedSwapCardId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Filter out the current MVP card from available cards (can't swap for itself)
  const swapOptions = availableRoleCards.filter(card => card.id !== currentMVPCard.id);

  const handleKeepCard = () => {
    onKeepMVPCard();
  };

  const handleConfirmSwap = () => {
    if (selectedSwapCardId) {
      onSwapMVPCard(selectedSwapCardId);
    }
  };

  const selectedSwapCard = swapOptions.find(card => card.id === selectedSwapCardId);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto mx-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(234, 179, 8, 0.5) rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div className="glass-card rounded-xl p-6 mb-6 border-2 border-yellow-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold glass-text-primary flex items-center gap-2">
                  Bonus Play
                  <span className="px-2 py-1 bg-yellow-500/20 rounded text-sm border border-yellow-500/50 text-yellow-300">
                    After Round {roundNumber}
                  </span>
                </h2>
                <p className="glass-text-secondary text-sm">
                  Keep your MVP card or swap it for a different role card from your hand
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="glass-subtle rounded-lg p-4 mb-6 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="glass-text-primary font-medium mb-1">MVP Card Strategy</p>
              <p className="glass-text-secondary text-sm">
                Your MVP card provides a <span className="text-yellow-400 font-bold">+10 bonus</span> on top of the base score when played.
                You can only use it once per game, so choose wisely! {roundNumber < 4 && 'You can swap again after the next round.'}
              </p>
            </div>
          </div>
        </div>

        {/* Current MVP Card Section */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold glass-text-primary">Current MVP Card</h3>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center z-10 shadow-lg">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <RoleCard
                cardData={currentMVPCard}
                state="available"
                size="large"
              />
            </div>
          </div>
        </div>

        {/* Decision Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Option 1: Keep Current MVP Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`glass-card rounded-xl p-6 cursor-pointer border-2 transition-all ${
              !selectedSwapCardId
                ? 'border-green-500 ring-2 ring-green-500/50'
                : 'border-white/20 hover:border-green-500/50'
            }`}
            onClick={() => setSelectedSwapCardId(null)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-bold glass-text-primary">Keep Current Card</h4>
            </div>
            <p className="glass-text-secondary text-sm mb-3">
              Lock in <span className="glass-text-primary font-semibold">{currentMVPCard.displayName}</span> as your MVP card for the remaining rounds.
            </p>
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
              <Lock className="w-4 h-4" />
              No changes - play it safe
            </div>
          </motion.div>

          {/* Option 2: Swap for Different Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`glass-card rounded-xl p-6 cursor-pointer border-2 transition-all ${
              selectedSwapCardId
                ? 'border-purple-500 ring-2 ring-purple-500/50'
                : 'border-white/20 hover:border-purple-500/50'
            }`}
            onClick={() => {
              // If no card selected yet, pre-select the first available option
              if (!selectedSwapCardId && swapOptions.length > 0) {
                setSelectedSwapCardId(swapOptions[0].id);
              }
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-bold glass-text-primary">Swap for Different Card</h4>
            </div>
            <p className="glass-text-secondary text-sm mb-3">
              Choose a different role card from your hand to become your new MVP card.
            </p>
            <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
              <RefreshCw className="w-4 h-4" />
              Strategic swap - higher risk/reward
            </div>
          </motion.div>
        </div>

        {/* Swap Card Selection Grid */}
        <AnimatePresence>
          {selectedSwapCardId !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-xl p-6 mb-6 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold glass-text-primary">Select New MVP Card</h3>
                <span className="glass-text-tertiary text-sm">({swapOptions.length} available)</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(168, 85, 247, 0.5) rgba(255, 255, 255, 0.1)',
                }}
              >
                {swapOptions.map((card) => (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedSwapCardId(card.id)}
                    className="cursor-pointer"
                  >
                    <RoleCard
                      cardData={card}
                      state={selectedSwapCardId === card.id ? 'selected' : 'available'}
                      onClick={() => setSelectedSwapCardId(card.id)}
                      size="medium"
                    />
                  </motion.div>
                ))}
              </div>

              {selectedSwapCard && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 glass-subtle rounded-lg p-4 border border-purple-500/30"
                >
                  <p className="glass-text-primary text-sm">
                    <span className="font-semibold text-purple-400">Selected:</span> {selectedSwapCard.displayName}
                  </p>
                  <p className="glass-text-tertiary text-xs mt-1">{selectedSwapCard.description}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleKeepCard}
            className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all ${
              !selectedSwapCardId
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                : 'glass-subtle glass-text-secondary hover:bg-white/10'
            }`}
          >
            <Lock className="w-5 h-5" />
            Keep {currentMVPCard.displayName}
          </motion.button>

          {selectedSwapCardId && selectedSwapCard && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirmSwap}
              className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50"
            >
              Swap to {selectedSwapCard.displayName}
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Bottom Hint */}
        <div className="mt-6 text-center">
          <p className="glass-text-tertiary text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-3 h-3" />
            {roundNumber < 4
              ? `You can swap your MVP card again after Round ${roundNumber + 1}`
              : 'This is your final chance to swap your MVP card!'
            }
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BonusPlayModal;
