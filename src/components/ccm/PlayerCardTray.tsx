/**
 * CCM Player Card Tray Component
 *
 * Displays a player's card selection area in a horizontal layout:
 * - Role cards on the LEFT side
 * - Special cards (Golden, MVP) on the RIGHT side
 *
 * States:
 * - interactive: Current player can select cards
 * - display: Other players' trays shown for display only
 */

import React, { useRef } from 'react';
import { RoleCard } from './RoleCard';
import { CCMGoldenCard } from './CCMGoldenCard';
import { MVPCard } from './MVPCard';
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

interface SavedMVPCombo {
  roleCardName: string;
  synergyCardName: string;
  cSuiteOrg: 'ceo' | 'cfo' | 'cmo' | 'cto' | 'chro' | 'coo';
  averageScore: number;
  savedFromGameNumber: number;
}

interface PlayerCardTrayProps {
  playerName: string;
  isInteractive: boolean;

  // Role cards
  roleCards: RoleCardData[];
  selectedRoleCardId?: string | null;
  onRoleCardSelect?: (cardId: string) => void;

  // Golden card
  hasGoldenCard: boolean;
  selectedGoldenCard: boolean;
  aiCompanionName: 'finn' | 'harmony' | 'sage' | 'spark';
  onGoldenCardSelect?: () => void;
  currentRound: number;

  // MVP card
  savedMVPCombo: SavedMVPCombo | null;
  hasMVPCard: boolean;
  selectedMVPCard: boolean;
  onMVPCardSelect?: () => void;

  // Display mode (for other players)
  displayedRoleCard?: string; // Name of the role card they selected
  displayedSpecialCard?: 'golden' | 'mvp' | null;
}

export const PlayerCardTray: React.FC<PlayerCardTrayProps> = ({
  playerName,
  isInteractive,
  roleCards,
  selectedRoleCardId,
  onRoleCardSelect,
  hasGoldenCard,
  selectedGoldenCard,
  aiCompanionName,
  onGoldenCardSelect,
  currentRound,
  savedMVPCombo,
  hasMVPCard,
  selectedMVPCard,
  onMVPCardSelect,
  displayedRoleCard,
  displayedSpecialCard
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`glass-card p-3 md:p-4 rounded-xl transition-all ${isInteractive ? 'ring-2 ring-green-400 shadow-lg' : 'opacity-90'}`}>
      {/* Player Name Header */}
      <div className="mb-2 md:mb-3">
        <h3 className="glass-text-primary font-bold text-xs md:text-sm flex items-center justify-between">
          <span>
            {playerName}'s Card Tray {isInteractive && <span className="text-green-400 ml-2">(You)</span>}
          </span>
          {!isInteractive && displayedRoleCard && (
            <span className="glass-text-tertiary text-xs italic">Display Only</span>
          )}
        </h3>
      </div>

      {/* Card Tray Layout: Grid with Vertical Scroll */}
      <div className="flex gap-3 md:gap-4">
        {/* LEFT SIDE: Role Cards (2 per row, 3 rows visible, vertical scroll) */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] md:text-xs glass-text-secondary mb-2 font-semibold flex items-center justify-between">
            <span>ROLE CARDS ({roleCards.length})</span>
            {isInteractive && roleCards.length > 4 && (
              <span className="text-xs glass-text-accent font-bold">
                ↓ Scroll ↓
              </span>
            )}
          </div>
          {isInteractive ? (
            // Interactive mode: Show all role cards in 2-column grid with vertical scroll
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto pr-2"
              style={{
                maxHeight: '600px', // Fits approximately 2 rows of medium cards
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(59, 130, 246, 0.5) rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                {roleCards.map((card) => (
                  <div key={card.id} onClick={() => onRoleCardSelect?.(card.id)}>
                    <RoleCard
                      cardData={card}
                      state={selectedRoleCardId === card.id ? 'selected' : 'available'}
                      onClick={() => onRoleCardSelect?.(card.id)}
                      size="medium"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Display mode: Show placeholder or selected card
            <div className="flex justify-center items-center h-[140px]">
              {displayedRoleCard ? (
                <div className="glass-subtle p-3 md:p-4 rounded-lg text-center max-w-[200px]">
                  <p className="glass-text-primary font-bold text-xs md:text-sm mb-1">{displayedRoleCard}</p>
                  <p className="glass-text-tertiary text-[9px] md:text-[10px]">Role Selected</p>
                </div>
              ) : (
                <div className="glass-subtle p-3 md:p-4 rounded-lg text-center">
                  <p className="glass-text-tertiary text-xs">Selecting...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="w-px bg-white/20 self-stretch" />

        {/* RIGHT SIDE: Special Cards (Golden & MVP) - Vertical Stack */}
        <div className="flex-shrink-0 w-[180px] md:w-[200px]">
          <div className="text-[10px] md:text-xs glass-text-secondary mb-2 font-semibold">
            SPECIAL CARDS
          </div>
          {isInteractive ? (
            // Interactive mode: Show both Golden and MVP cards vertically
            <div className="space-y-3">
              {/* Golden Card */}
              <div onClick={hasGoldenCard && currentRound > 1 ? onGoldenCardSelect : undefined}>
                <CCMGoldenCard
                  aiCompanionName={aiCompanionName}
                  state={
                    currentRound === 1 ? 'disabled' :
                    !hasGoldenCard ? 'used' :
                    selectedGoldenCard ? 'selected' :
                    'available'
                  }
                  onClick={hasGoldenCard && currentRound > 1 ? onGoldenCardSelect : undefined}
                  size="medium"
                />
              </div>

              {/* MVP Card */}
              <div onClick={hasMVPCard && currentRound > 1 && savedMVPCombo ? onMVPCardSelect : undefined}>
                <MVPCard
                  savedCombo={savedMVPCombo}
                  state={
                    currentRound === 1 ? 'disabled' :
                    !hasMVPCard ? 'used' :
                    selectedMVPCard ? 'selected' :
                    savedMVPCombo ? 'available' : 'none'
                  }
                  onClick={hasMVPCard && currentRound > 1 && savedMVPCombo ? onMVPCardSelect : undefined}
                  size="medium"
                />
              </div>
            </div>
          ) : (
            // Display mode: Show indicator of what they selected
            <div className="flex justify-center items-center h-[140px]">
              {displayedSpecialCard === 'golden' && (
                <div className="glass-subtle p-3 md:p-4 rounded-lg text-center">
                  <p className="text-2xl md:text-3xl mb-2">⭐</p>
                  <p className="glass-text-primary font-bold text-xs">Golden Card</p>
                </div>
              )}
              {displayedSpecialCard === 'mvp' && (
                <div className="glass-subtle p-3 md:p-4 rounded-lg text-center">
                  <p className="text-2xl md:text-3xl mb-2">🏆</p>
                  <p className="glass-text-primary font-bold text-xs">MVP Card</p>
                </div>
              )}
              {!displayedSpecialCard && (
                <div className="glass-subtle p-3 md:p-4 rounded-lg text-center">
                  <p className="glass-text-tertiary text-xs">No Special Card</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Current Round Info */}
      {isInteractive && currentRound === 1 && (
        <div className="mt-3 text-center">
          <p className="glass-text-tertiary text-xs italic">
            Special cards available from Round 2
          </p>
        </div>
      )}

      {/* Selection Confirmation Message */}
      {isInteractive && (selectedRoleCardId || selectedGoldenCard || selectedMVPCard) && (
        <div className="mt-3 text-center">
          <p className="glass-text-accent text-sm font-semibold">
            {selectedGoldenCard && '⭐ Golden Card Selected (130 pts)'}
            {selectedMVPCard && savedMVPCombo && `🏆 MVP Card Selected (${savedMVPCombo.averageScore} pts)`}
            {selectedRoleCardId && !selectedGoldenCard && !selectedMVPCard && '✓ Role Card Selected'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PlayerCardTray;
