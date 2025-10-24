/**
 * CCM (Career Challenge Multiplayer) Game Room
 * Board game style with rotating card stacks orchestrated by Challenge Master
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Trophy,
  Users,
  Crown,
  AlertCircle,
  Play,
  Sparkles,
  Award,
  Package,
  Cog,
  MapPin,
  Megaphone,
  DollarSign,
  Briefcase,
  Target
} from 'lucide-react';
import { ccmRealtimeService } from '../../services/CCMRealtimeService';
import type { CCMEvent } from '../../services/CCMRealtimeService';
import { ccmService } from '../../services/CCMService';
import { aiPlayerPoolService } from '../../services/AIPlayerPoolService';
import { useAICharacter } from '../ai-characters/AICharacterProvider';
import { masterSoundSystem } from '../../services/MasterSoundSystem';
import { CCMGoldenCard } from './CCMGoldenCard';
import { RoleCard } from './RoleCard';
import { SynergyCard } from './SynergyCard';
import { ChallengeCard } from './ChallengeCard';
import { MVPCard } from './MVPCard';
import { GameBoard } from './GameBoard';
import { PlayerCardTray } from './PlayerCardTray';
import { BonusPlayModal } from './BonusPlayModal';
import '../../design-system/index.css';
import './ccm-cards.css';

interface CCMGameRoomProps {
  roomId: string;
  roomCode: string;
  playerId: string;
  playerName: string;
  onLeave: () => void;
}

interface CompanyDetails {
  id: string;
  code: string;
  name: string;
  description: string;
  industryId: string;
  industry: {
    id: string;
    code: string;
    name: string;
  };
  companySize: string;
  revenue: string;
  headquarters: string;
  knownFor: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logoIcon: string;
  gradeCategory: 'elementary' | 'middle' | 'high';
  challengeCount: number;
  pCategories: string[];
}

interface Player {
  id: string;
  name: string;
  score: number;
  rank: number;
  hasPlayed: boolean;
  cSuiteLens: string | null;
  avatar?: string;
  selectedRoleCard?: string; // Name of selected role card
  selectedSpecialCard?: 'golden' | 'mvp' | null; // Type of special card selected
}

type RoundType = 'c-suite' | 'people' | 'product' | 'pricing' | 'process' | 'proceeds' | 'profits';

interface Card {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  difficulty?: number;
  tags?: string[];
}

// Role Card Data (matching RoleCard component interface)
interface RoleCardData {
  type: 'role';
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

// Synergy Card Data (matching SynergyCard component interface)
interface SynergyCardData {
  type: 'synergy';
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
}

// Challenge Card Data (matching ChallengeCard component interface)
interface ChallengeCardData {
  type: 'challenge';
  id: string;
  cardCode: string;
  pCategory: 'people' | 'product' | 'process' | 'place' | 'promotion' | 'price';
  title: string;
  description: string;
  context: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  gradeLevel: string;
}

// C-Suite Selection Card (for Round 1)
interface CSuiteCardData {
  type: 'csuite';
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

type GameCard = RoleCardData | SynergyCardData | ChallengeCardData | CSuiteCardData;

export const CCMGameRoom: React.FC<CCMGameRoomProps> = ({
  roomId,
  roomCode,
  playerId,
  playerName,
  onLeave
}) => {
  /**
   * Handle leaving the room
   */
  const handleLeaveRoom = async () => {
    try {
      const response = await fetch(`/api/ccm/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('Left room successfully:', result.message);
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    } finally {
      // Always call onLeave to return to hub
      onLeave();
    }
  };
  // Game state
  const [gamePhase, setGamePhase] = useState<'waiting' | 'playing' | 'complete'>('waiting');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundType, setRoundType] = useState<RoundType>('c-suite');
  const [roundTimer, setRoundTimer] = useState(60);
  const [masterMessage, setMasterMessage] = useState('Waiting for players...');

  // 6 P's random selection: randomly select 5 of 6 P categories per game
  const [selectedPCategories, setSelectedPCategories] = useState<RoundType[]>([]);

  // Players - Start with only the real user who entered the room
  // AI players will be added when game starts to fill remaining slots
  const [players, setPlayers] = useState<Player[]>([
    { id: playerId, name: playerName, score: 0, rank: 1, hasPlayed: false, cSuiteLens: null, avatar: '👤' }
  ]);

  // Card stacks
  const [leftStack, setLeftStack] = useState<GameCard[]>([]);
  const [centerStack, setCenterStack] = useState<GameCard[]>([]);
  const [rightStack, setRightStack] = useState<GameCard[]>([]);
  const [activeStack, setActiveStack] = useState<'left' | 'center' | 'right'>('center');

  // UI state
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showVictory, setShowVictory] = useState(false);

  // Golden Card state
  const [hasGoldenCard, setHasGoldenCard] = useState(true); // Player has 1 Golden Card per game
  const [selectedGoldenCard, setSelectedGoldenCard] = useState(false); // Whether Golden Card is selected this round

  // MVP Card state - Store full RoleCardData so we can display it in Bonus Play modal
  const [randomlyAssignedMVPCardId, setRandomlyAssignedMVPCardId] = useState<string | null>(null); // Randomly assigned card when Round 2 starts
  const [mvpCard, setMvpCard] = useState<{
    roleCardData: RoleCardData; // Full card data for display in modal
    lockedInRound: number; // Which round it was locked/last swapped
  } | null>(null); // The locked MVP card (becomes available after first Bonus Play)
  const [hasMVPCard, setHasMVPCard] = useState(false); // Whether MVP card is available to use
  const [selectedMVPCard, setSelectedMVPCard] = useState(false); // Whether MVP Card is selected this round
  const [showBonusPlayModal, setShowBonusPlayModal] = useState(false); // Show "Bonus Play" modal after Rounds 2, 3, 4
  const [bonusPlayRound, setBonusPlayRound] = useState<number | null>(null); // Which round triggered Bonus Play

  // Company details
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [companyChallenges, setCompanyChallenges] = useState<any[]>([]); // Store actual company challenges

  // Get user's AI companion from context for Golden Card display
  const aiCharacterContext = useAICharacter();
  const aiCompanionName: 'finn' | 'harmony' | 'sage' | 'spark' =
    (aiCharacterContext?.currentCharacter?.id as 'finn' | 'harmony' | 'sage' | 'spark') || 'finn';

  /**
   * Load company details on mount
   */
  useEffect(() => {
    const loadCompanyDetails = async () => {
      try {
        await ccmService.initialize();
        const details = await ccmService.getCompanyRoomDetails(roomId);

        if (details) {
          // Extract P categories from challenges
          const pCategories = [...new Set(details.challenges?.map((c: any) => c.p_category) || [])];

          setCompanyDetails({
            id: details.id,
            code: details.code,
            name: details.name,
            description: details.description,
            industryId: details.industry_id,
            industry: details.industry || { id: '', code: 'general', name: 'General' },
            companySize: details.company_size,
            revenue: details.revenue,
            headquarters: details.headquarters,
            knownFor: details.known_for,
            colorScheme: details.color_scheme || { primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA' },
            logoIcon: details.logo_icon || '🏢',
            gradeCategory: details.grade_category,
            challengeCount: details.challenges?.length || 6,
            pCategories
          });

          // Store company challenges
          setCompanyChallenges(details.challenges || []);
        }

        setLoadingCompany(false);
      } catch (error) {
        console.error('Error loading company details:', error);
        setLoadingCompany(false);
      }
    };

    loadCompanyDetails();
  }, [roomId]);

  /**
   * Sound system lifecycle
   */
  useEffect(() => {
    // Start sound session for CEO Takeover
    masterSoundSystem.startGameSession('career-bingo'); // Using career-bingo type for now

    return () => {
      // Stop sound session when leaving
      masterSoundSystem.endGameSession();
    };
  }, []);

  /**
   * Initialize card stacks
   */
  useEffect(() => {
    if (gamePhase === 'playing') {
      initializeRound();
    }
  }, [gamePhase, currentRound]);

  /**
   * Round timer
   */
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const timer = setInterval(() => {
      setRoundTimer((prev) => {
        if (prev <= 1) return 60;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase]);

  /**
   * Mock AI Players - Simulate realistic lock-in behavior
   * Some lock in before user, some after, with random delays
   */
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    console.log(`[AI Players] Setting up AI players for Round ${currentRound}`);

    // Create realistic lock-in times for mock players (2-20 seconds into the round)
    const mockPlayerLockInSchedule: Array<{ playerId: string; lockInTime: number }> = [];

    players.forEach(player => {
      if (player.id !== playerId && !player.hasPlayed) {
        // Random lock-in time between 2-20 seconds
        const lockInTime = Math.floor(Math.random() * 18000) + 2000; // 2000-20000ms
        mockPlayerLockInSchedule.push({ playerId: player.id, lockInTime });
        console.log(`[AI Players] Scheduling ${player.name} to lock in after ${lockInTime}ms`);
      }
    });

    // Schedule each mock player to lock in at their designated time
    const timeouts = mockPlayerLockInSchedule.map(({ playerId: mockPlayerId, lockInTime }) => {
      return setTimeout(() => {
        console.log(`[AI Players] ${mockPlayerId} timeout fired, attempting to lock in...`);
        setPlayers(prevPlayers => {
          const mockPlayer = prevPlayers.find(p => p.id === mockPlayerId);
          if (!mockPlayer) {
            console.log(`[AI Players] ERROR: Mock player ${mockPlayerId} not found!`);
            return prevPlayers;
          }
          if (mockPlayer.hasPlayed) {
            console.log(`[AI Players] ${mockPlayer.name} already locked in, skipping`);
            return prevPlayers;
          }

          console.log(`[AI Players] Locking in ${mockPlayer.name}...`);

          // Auto-lock mock player
          const cSuiteLenses = ['ceo', 'cfo', 'cmo', 'cto', 'chro', 'coo'];
          const roleCards = ['r1', 'r2', 'r3'];

          let updatedPlayers;
          if (currentRound === 1) {
            // Round 1: Assign C-Suite lens
            const randomLens = cSuiteLenses[Math.floor(Math.random() * cSuiteLenses.length)];
            updatedPlayers = prevPlayers.map(p =>
              p.id === mockPlayerId
                ? { ...p, cSuiteLens: randomLens, hasPlayed: true }
                : p
            );
            console.log(`[AI Players] ${mockPlayer.name} selected ${randomLens.toUpperCase()}`);
            setMasterMessage(`${mockPlayer.name} selected ${randomLens.toUpperCase()}!`);
          } else {
            // Rounds 2-6: Lock in with random score and random card selection
            const roleCardNames = ['Software Engineer', 'Marketing Manager', 'Learning & Development Manager'];
            const specialCardOptions: Array<'golden' | 'mvp' | null> = ['golden', 'mvp', null];

            // Randomly select either a role card or a special card
            const useSpecialCard = Math.random() < 0.3; // 30% chance to use special card
            const selectedRoleCard = useSpecialCard ? undefined : roleCardNames[Math.floor(Math.random() * roleCardNames.length)];
            const selectedSpecialCard = useSpecialCard ? specialCardOptions[Math.floor(Math.random() * specialCardOptions.length)] : null;

            const scoreToAdd = Math.floor(Math.random() * 50) + 40; // 40-90 points
            updatedPlayers = prevPlayers.map(p =>
              p.id === mockPlayerId
                ? { ...p, hasPlayed: true, score: p.score + scoreToAdd, selectedRoleCard, selectedSpecialCard }
                : p
            );
            setMasterMessage(`${mockPlayer.name} locked in! ${updatedPlayers.filter(p => p.hasPlayed).length}/${updatedPlayers.length} ready`);
          }

          // Check if all players have locked in
          const allLocked = updatedPlayers.every(p => p.hasPlayed);
          const lockedCount = updatedPlayers.filter(p => p.hasPlayed).length;
          console.log(`[AI Players] Players locked in: ${lockedCount}/${updatedPlayers.length}, allLocked: ${allLocked}`);

          if (allLocked) {
            console.log('[AI Players] All players locked in! Advancing round in 2 seconds...');
            setTimeout(() => {
              if (currentRound >= 6) {
                console.log('[AI Players] Game complete! Showing victory screen...');
                setGamePhase('complete');
                setShowVictory(true);

                // Play game complete sound
                masterSoundSystem.playGameComplete();
              } else {
                console.log(`[AI Players] Advancing from Round ${currentRound} to Round ${currentRound + 1}`);
                setCurrentRound(currentRound + 1);
                setPlayers(prevPlayers => prevPlayers.map(p => ({ ...p, hasPlayed: false, selectedRoleCard: undefined, selectedSpecialCard: undefined })));
                setMasterMessage('Round complete! Starting next round...');
              }
            }, 2000);
          }

          return updatedPlayers;
        });
      }, lockInTime);
    });

    // Cleanup timeouts on unmount or round change
    return () => {
      console.log(`[AI Players] Cleaning up ${timeouts.length} scheduled AI player timeouts`);
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [gamePhase, currentRound, playerId]);

  /**
   * Fetch leaderboard periodically (fallback for when real-time isn't working)
   */
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`/api/ccm/game/${roomId}/leaderboard`);
        const result = await response.json();

        if (result.success && result.leaderboard) {
          // Update players with leaderboard data
          const updatedPlayers = players.map(player => {
            const leaderboardEntry = result.leaderboard.find(
              (entry: any) => entry.participantId === player.id
            );
            if (leaderboardEntry) {
              return {
                ...player,
                score: leaderboardEntry.totalScore,
                rank: leaderboardEntry.rank,
                hasPlayed: leaderboardEntry.hasLockedIn
              };
            }
            return player;
          });
          setPlayers(updatedPlayers);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    // Fetch immediately and then every 3 seconds
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 3000);

    return () => clearInterval(interval);
  }, [gamePhase, roomId, currentRound]);

  /**
   * Subscribe to real-time room events
   */
  useEffect(() => {
    const subscribeToRoom = async () => {
      try {
        console.log(`[CCMGameRoom] Subscribing to room ${roomId}`);

        // Subscribe to room with event handlers
        await ccmRealtimeService.subscribeToRoom(roomId, {
          player_joined: (event: CCMEvent) => {
            console.log('[CCMGameRoom] Player joined:', event.data);
            // TODO: Update players list
          },

          player_left: (event: CCMEvent) => {
            console.log('[CCMGameRoom] Player left:', event.data);
            // TODO: Remove player from list
          },

          player_locked_in: (event: CCMEvent) => {
            console.log('[CCMGameRoom] Player locked in:', event.data);
            const { participantId, displayName, roundNumber } = event.data;

            // Mark player as having played this round
            setPlayers(prevPlayers =>
              prevPlayers.map(p =>
                p.id === participantId
                  ? { ...p, hasPlayed: true }
                  : p
              )
            );

            // Show notification
            setMasterMessage(`${displayName} has locked in their selection!`);
          },

          round_started: (event: CCMEvent) => {
            console.log('[CCMGameRoom] Round started:', event.data);
            const { roundNumber, roundType } = event.data;

            // Update round state
            setCurrentRound(roundNumber);
            setRoundType(roundType);
            setRoundTimer(60);

            // Reset players hasPlayed status
            setPlayers(prevPlayers =>
              prevPlayers.map(p => ({ ...p, hasPlayed: false }))
            );

            setMasterMessage(`Round ${roundNumber} has started!`);
          },

          round_ended: (event: CCMEvent) => {
            console.log('[CCMGameRoom] Round ended:', event.data);
            // TODO: Show round summary
          },

          game_started: (event: CCMEvent) => {
            console.log('[CCMGameRoom] Game started:', event.data);
            const { sessionId, gameNumber, participants } = event.data;

            setGamePhase('playing');
            setCurrentRound(1);
            setRoundTimer(60);
            setMasterMessage(`Game #${gameNumber} has begun!`);
          },

          game_ended: (event: CCMEvent) => {
            console.log('[CCMGameRoom] Game ended:', event.data);
            setGamePhase('complete');
            setShowVictory(true);

            // Play game complete sound
            masterSoundSystem.playGameComplete();
          },

          leaderboard_updated: (event: CCMEvent) => {
            console.log('[CCMGameRoom] Leaderboard updated:', event.data);
            // Trigger leaderboard refresh
            // (the polling useEffect will pick this up)
          },

          c_suite_selected: (event: CCMEvent) => {
            console.log('[CCMGameRoom] C-Suite selected:', event.data);
            const { participantId, cSuiteChoice } = event.data;

            // Update player's C-Suite lens
            setPlayers(prevPlayers =>
              prevPlayers.map(p =>
                p.id === participantId
                  ? { ...p, cSuiteLens: cSuiteChoice }
                  : p
              )
            );
          },

          mvp_selected: (event: CCMEvent) => {
            console.log('[CCMGameRoom] MVP selected:', event.data);
            const { displayName, afterRound } = event.data;
            setMasterMessage(`${displayName} selected their MVP card!`);
          },
        });

        // Track presence
        await ccmRealtimeService.trackPresence(roomId, playerId, {
          player_name: playerName,
          online_at: new Date().toISOString()
        });

        console.log(`[CCMGameRoom] Successfully subscribed to room ${roomId}`);
      } catch (error) {
        console.error('[CCMGameRoom] Error subscribing to room:', error);
      }
    };

    subscribeToRoom();

    // Cleanup on unmount
    return () => {
      console.log(`[CCMGameRoom] Unsubscribing from room ${roomId}`);
      ccmRealtimeService.unsubscribeFromRoom(roomId);
    };
  }, [roomId, playerId, playerName]);

  /**
   * Initialize round with appropriate cards
   */
  const initializeRound = async () => {
    if (currentRound === 1) {
      // Round 1: C-Suite selection
      setRoundType('c-suite');
      setActiveStack('center');
      setMasterMessage('Choose Your C-Suite Lens (Round 1 Only)');
      setCenterStack([
        { type: 'csuite', id: 'ceo', title: 'CEO', description: 'Chief Executive Officer', icon: '👔', color: 'from-purple-500 to-pink-500' },
        { type: 'csuite', id: 'cfo', title: 'CFO', description: 'Chief Financial Officer', icon: '💰', color: 'from-green-500 to-emerald-500' },
        { type: 'csuite', id: 'cmo', title: 'CMO', description: 'Chief Marketing Officer', icon: '📢', color: 'from-orange-500 to-red-500' },
        { type: 'csuite', id: 'cto', title: 'CTO', description: 'Chief Technology Officer', icon: '💻', color: 'from-blue-500 to-cyan-500' },
        { type: 'csuite', id: 'chro', title: 'CHRO', description: 'Chief HR Officer', icon: '🤝', color: 'from-pink-500 to-rose-500' },
        { type: 'csuite', id: 'coo', title: 'COO', description: 'Chief Operating Officer', icon: '⚙️', color: 'from-teal-500 to-cyan-500' },
      ]);
      setLeftStack([]);
      setRightStack([]);
    } else {
      // Rounds 2-6: Problem categories with Role and Synergy cards
      // Use the 5 randomly selected P categories for this game
      if (selectedPCategories.length === 0) {
        console.error('[CCMGameRoom] No P categories selected! This should not happen.');
        return;
      }

      const type = selectedPCategories[currentRound - 2]; // Rounds 2-6 map to indices 0-4
      setRoundType(type);
      setActiveStack('center');

      // Map round type to P category
      const pCategoryMap: Record<string, 'people' | 'product' | 'process' | 'place' | 'promotion' | 'price'> = {
        'people': 'people',
        'product': 'product',
        'pricing': 'price',
        'process': 'process',
        'proceeds': 'promotion',
        'profits': 'price'
      };

      const pCategory = pCategoryMap[type] || 'people';

      // Fetch challenge card and business scenario separately, then combine
      let challengeCard: ChallengeCardData;

      try {
        // Step 1: Get generic challenge card for this P category AND grade level
        await ccmService.initialize();
        const challengeCardData = await ccmService.getChallengeCard(pCategory, companyDetails?.gradeCategory);

        if (!challengeCardData) {
          throw new Error(`No challenge card found for P category: ${pCategory}, grade level: ${companyDetails?.gradeCategory}`);
        }

        console.log('[CCMGameRoom] Challenge card from ccm_challenge_cards:', challengeCardData);

        // Step 2: Get company-specific business scenario for context
        let businessContext = '';
        if (companyChallenges.length > 0) {
          const matchingScenarios = companyChallenges.filter((c: any) => c.p_category === pCategory);
          if (matchingScenarios.length > 0) {
            const scenarioIndex = (currentRound - 2) % matchingScenarios.length;
            const scenario = matchingScenarios[scenarioIndex];
            businessContext = scenario.context || scenario.description || '';
            console.log('[CCMGameRoom] Business scenario context from ccm_business_scenarios:', scenario);
          }
        }

        // Step 3: Combine challenge card + business scenario
        challengeCard = {
          type: 'challenge',
          id: challengeCardData.id,
          cardCode: challengeCardData.challenge_code || challengeCardData.card_code || `CCM_CHALLENGE_${challengeCardData.id.substring(0, 8)}`,
          pCategory: challengeCardData.primary_p_category || challengeCardData.p_category || pCategory,
          title: challengeCardData.display_name || challengeCardData.title || 'Challenge',
          description: challengeCardData.description || '',
          context: businessContext || getRoundContext(type),
          difficultyLevel: challengeCardData.difficulty || (currentRound <= 3 ? 'easy' : currentRound <= 5 ? 'medium' : 'hard'),
          gradeLevel: challengeCardData.grade_level || 'all'
        };

        console.log('[CCMGameRoom] Combined challenge card:', {
          title: challengeCard.title,
          description: challengeCard.description,
          descriptionLength: challengeCard.description?.length || 0,
          context: challengeCard.context,
          contextLength: challengeCard.context?.length || 0
        });
      } catch (error) {
        console.error('[CCMGameRoom] Error loading challenge card:', error);
        // Fall back to checking company challenges only
        if (companyChallenges.length > 0) {
          const matchingChallenges = companyChallenges.filter((c: any) => c.p_category === pCategory);

          if (matchingChallenges.length > 0) {
            // Use business scenario as fallback
            const challengeIndex = (currentRound - 2) % matchingChallenges.length;
            const challenge = matchingChallenges[challengeIndex];

            challengeCard = {
              type: 'challenge',
              id: challenge.id,
              cardCode: challenge.card_code || `CCM_CHALLENGE_${challenge.id.substring(0, 8)}`,
              pCategory: challenge.p_category,
              title: challenge.title,
              description: challenge.description || '',
              context: challenge.context || '',
              difficultyLevel: challenge.difficulty_level || (currentRound <= 3 ? 'easy' : currentRound <= 5 ? 'medium' : 'hard'),
              gradeLevel: challenge.grade_level || 'all'
            };
          } else {
            // No matching challenges, use mock data
            console.warn(`[CCMGameRoom] No challenges found for P category: ${pCategory}, using mock data`);
            challengeCard = {
              type: 'challenge',
            id: 'challenge-' + currentRound,
            cardCode: 'CCM_CHALLENGE_' + currentRound,
            pCategory: pCategory,
            title: getRoundTitle(type),
            description: getRoundDescription(type),
            context: getRoundContext(type),
            difficultyLevel: currentRound <= 3 ? 'easy' : currentRound <= 5 ? 'medium' : 'hard',
            gradeLevel: 'all'
          };
        }
      } else {
        // No company challenges loaded, use mock data
        console.warn('[CCMGameRoom] No company challenges loaded, using mock data');
        challengeCard = {
          type: 'challenge',
          id: 'challenge-' + currentRound,
          cardCode: 'CCM_CHALLENGE_' + currentRound,
          pCategory: pCategory,
          title: getRoundTitle(type),
          description: getRoundDescription(type),
          context: getRoundContext(type),
          difficultyLevel: currentRound <= 3 ? 'easy' : currentRound <= 5 ? 'medium' : 'hard',
          gradeLevel: 'all'
        };
      }
      }

      // Set challenge card in center stack
      setCenterStack([challengeCard]);

      // Dynamically fetch 6 role cards filtered by challenge P category
      try {
        await ccmService.initialize();

        // Fetch 6 dynamically filtered role card IDs
        const roleCardIds = await ccmService.getRoleCardsForChallenge(pCategory);

        console.log('[CCMGameRoom] Fetched role card IDs for', pCategory, ':', roleCardIds);

        // Fetch full role card data for each ID using supabase
        const supabaseClient = await import('../../lib/supabase').then(m => m.supabase());
        const { data: roleCardsData, error: roleError } = await supabaseClient
          .from('ccm_role_cards')
          .select('*')
          .in('id', roleCardIds);

        if (roleError) {
          console.error('Error fetching role cards:', roleError);
          setLeftStack([]);
        } else if (!roleCardsData || roleCardsData.length === 0) {
          console.warn('[CCMGameRoom] No role cards returned from database');
          setLeftStack([]);
        } else {
          console.log('[CCMGameRoom] Successfully fetched', roleCardsData.length, 'role cards');
          console.log('[CCMGameRoom] Role cards:', roleCardsData.map((c: any) => ({
            name: c.display_name,
            cSuite: c.c_suite_org,
            qualityForThisCategory: c[`quality_for_${pCategory}`]
          })));

          // Transform database format to RoleCardData format
          const transformedRoleCards: RoleCardData[] = (roleCardsData || []).map((card: any) => ({
            type: 'role' as const,
            id: card.id,
            cardCode: card.card_code,
            displayName: card.display_name,
            description: card.description,
            cSuiteOrg: card.c_suite_org,
            qualityForPeople: card.quality_for_people,
            qualityForProduct: card.quality_for_product,
            qualityForProcess: card.quality_for_process,
            qualityForPlace: card.quality_for_place,
            qualityForPromotion: card.quality_for_promotion,
            qualityForPrice: card.quality_for_price,
            primarySoftSkills: card.primary_soft_skills || [],
            secondarySoftSkills: card.secondary_soft_skills || [],
            colorTheme: card.color_theme,
            gradeLevel: card.grade_level
          }));

          setLeftStack(transformedRoleCards);

          // Round 2: Randomly assign MVP card - SEPARATE from hand, VISIBLE and USABLE immediately
          if (currentRound === 2 && !mvpCard && transformedRoleCards.length > 0) {
            // Fetch a DIFFERENT role card that is NOT in the current leftStack
            // This ensures the MVP card is unique and not a duplicate
            const currentCardIds = transformedRoleCards.map(card => card.id);

            const { data: otherRoleCards, error: mvpError } = await supabaseClient
              .from('ccm_role_cards')
              .select('*')
              .eq('is_active', true)
              .not('id', 'in', `(${currentCardIds.join(',')})`) // Exclude current hand cards
              .limit(10); // Get 10 candidates

            if (mvpError || !otherRoleCards || otherRoleCards.length === 0) {
              console.error('[CCM MVP] Error fetching separate MVP card:', mvpError);
              // Fallback: use a card from hand if we can't get a separate one
              const randomIndex = Math.floor(Math.random() * transformedRoleCards.length);
              const fallbackCard = transformedRoleCards[randomIndex];

              setMvpCard({
                roleCardData: fallbackCard,
                lockedInRound: 2
              });
              setHasMVPCard(true);
              console.warn('[CCM MVP] FALLBACK: Using card from hand as MVP:', fallbackCard.displayName);
            } else {
              // Successfully fetched separate cards - pick one randomly
              const randomIndex = Math.floor(Math.random() * otherRoleCards.length);
              const mvpCardRaw = otherRoleCards[randomIndex];

              // Transform to RoleCardData format
              const mvpRoleCard: RoleCardData = {
                type: 'role' as const,
                id: mvpCardRaw.id,
                cardCode: mvpCardRaw.card_code,
                displayName: mvpCardRaw.display_name,
                description: mvpCardRaw.description,
                cSuiteOrg: mvpCardRaw.c_suite_org,
                qualityForPeople: mvpCardRaw.quality_for_people,
                qualityForProduct: mvpCardRaw.quality_for_product,
                qualityForProcess: mvpCardRaw.quality_for_process,
                qualityForPlace: mvpCardRaw.quality_for_place,
                qualityForPromotion: mvpCardRaw.quality_for_promotion,
                qualityForPrice: mvpCardRaw.quality_for_price,
                primarySoftSkills: mvpCardRaw.primary_soft_skills || [],
                secondarySoftSkills: mvpCardRaw.secondary_soft_skills || [],
                colorTheme: mvpCardRaw.color_theme,
                gradeLevel: mvpCardRaw.grade_level
              };

              setMvpCard({
                roleCardData: mvpRoleCard, // Store complete card data
                lockedInRound: 2
              });
              setHasMVPCard(true); // Enable MVP card for use

              console.log('[CCM MVP] Randomly assigned UNIQUE MVP card (NOT in hand):', mvpRoleCard.displayName, '(ID:', mvpRoleCard.id, ')');
              console.log('[CCM MVP] Player can use this card for +10 bonus points, or wait for Bonus Play after Round 2 to swap');
            }
          }
        }
      } catch (error) {
        console.error('Error loading dynamic role cards:', error);
        setLeftStack([]);
      }

      // Mock synergy cards on right
      setRightStack([
        {
          type: 'synergy',
          id: 's1',
          cardCode: 'CCM_SYNERGY_CAPTAIN_CONNECTOR',
          displayName: 'Captain Connector',
          tagline: 'Collaboration & Communication',
          description: 'Excels at bringing people together, fostering teamwork, and ensuring clear communication across all levels.',
          softSkillsTags: ['collaboration', 'communication', 'relationship-building', 'teamwork', 'listening'],
          effectivenessForPeople: 'primary',
          effectivenessForProduct: 'secondary',
          effectivenessForProcess: 'secondary',
          effectivenessForPlace: 'secondary',
          effectivenessForPromotion: 'primary',
          effectivenessForPrice: 'neutral',
          colorTheme: 'blue',
          displayOrder: 1
        },
        {
          type: 'synergy',
          id: 's2',
          cardCode: 'CCM_SYNERGY_MASTER_IMPROVER',
          displayName: 'Master Improver',
          tagline: 'Innovation & Creativity',
          description: 'Unleashes innovative thinking and fresh perspectives to challenge conventional approaches with novel solutions.',
          softSkillsTags: ['creativity', 'innovation', 'design-thinking', 'entrepreneurship', 'risk-taking'],
          effectivenessForPeople: 'neutral',
          effectivenessForProduct: 'primary',
          effectivenessForProcess: 'secondary',
          effectivenessForPlace: 'neutral',
          effectivenessForPromotion: 'primary',
          effectivenessForPrice: 'neutral',
          colorTheme: 'orange',
          displayOrder: 3
        },
      ]);

      setMasterMessage(getMasterMessage(type));
    }
  };

  const getRoundTitle = (type: RoundType): string => {
    const titles = {
      people: 'People Problem - Increase Store Traffic',
      product: 'Product Problem - Variety of Products',
      pricing: 'Pricing Problem - Sales Promotion',
      process: 'Process Problem - Organize Store Layout',
      proceeds: 'Proceeds Problem - Community Giving',
      profits: 'Profits Problem - Reduce Costs'
    };
    return titles[type] || 'Challenge';
  };

  const getRoundDescription = (type: RoundType): string => {
    const descriptions = {
      people: 'Your local coffee shop is struggling with foot traffic. The owner needs help attracting more customers and creating buzz in the community. What approach would work best to increase store visits?',
      product: 'A small retail store is facing competition from larger chains. They need to differentiate themselves by offering a unique product selection. How can they stand out while staying profitable?',
      pricing: 'A new online marketplace is launching its first major sale event. The team must price their products competitively while maintaining healthy margins. What pricing strategy makes the most sense?',
      process: 'A growing bakery is overwhelmed with inefficient workflows. Orders are getting mixed up, inventory is disorganized, and staff are stressed. How can they streamline operations?',
      proceeds: 'A family-owned business wants to give back to their community through charitable programs. They need to balance social impact with business sustainability. What approach should they take?',
      profits: 'A startup is burning through cash too quickly. They need to reduce operational costs without sacrificing product quality or customer experience. Where should they focus their cost-cutting efforts?'
    };
    return descriptions[type] || 'Select the best Role and Synergy cards to solve this challenge';
  };

  const getRoundContext = (type: RoundType): string => {
    const contexts = {
      people: 'People challenges focus on attracting, engaging, and retaining customers or employees. Success requires understanding human behavior, communication strategies, and building strong relationships.',
      product: 'Product challenges involve creating value through offerings that meet customer needs. Consider quality, differentiation, innovation, and how products solve real problems.',
      pricing: 'Pricing challenges balance profitability with customer value perception. Strategic pricing considers costs, competition, perceived value, and market positioning.',
      process: 'Process challenges require improving workflows, efficiency, and operational systems. Focus on eliminating waste, standardizing procedures, and optimizing resource allocation.',
      proceeds: 'Proceeds challenges explore revenue generation, social impact, and community engagement. Balance financial sustainability with creating positive outcomes for stakeholders.',
      profits: 'Profit challenges focus on managing costs and maximizing financial returns. Success requires identifying inefficiencies, reducing waste, and making smart resource allocation decisions.'
    };
    return contexts[type] || 'This is a business challenge that tests your strategic thinking and decision-making skills.';
  };

  const getRoundIcon = (type: RoundType): string => {
    const icons = {
      people: '👥',
      product: '📦',
      pricing: '💰',
      process: '⚙️',
      proceeds: '💝',
      profits: '📈'
    };
    return icons[type] || '🎯';
  };

  const getMasterMessage = (type: RoundType): string => {
    const messages = {
      people: 'Round 2: People Problem - Select Role Card',
      product: 'Round 3: Product Problem - Select Role Card',
      pricing: 'Round 4: Pricing Problem - Select Role Card',
      process: 'Round 5: Process Problem - Select Role Card',
      proceeds: 'Round 6: Proceeds Problem - Select Role Card',
      profits: 'Round 7: Profits Problem - Select Role Card'
    };
    return messages[type] || 'Select your cards';
  };

  /**
   * Start game
   */
  const handleStartGame = () => {
    // Randomly select 5 of 6 P categories for this game
    const allPCategories: RoundType[] = ['people', 'product', 'pricing', 'process', 'proceeds', 'profits'];
    const shuffled = allPCategories.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5); // Take first 5 after shuffle

    console.log('[CCM Game] Selected 5 P categories for this game:', selected);
    setSelectedPCategories(selected);

    // Add AI players to fill remaining slots (up to 4 total)
    const currentPlayerCount = players.length;
    const maxPlayers = 4;
    const aiPlayersNeeded = maxPlayers - currentPlayerCount;

    if (aiPlayersNeeded > 0) {
      console.log(`[CCM Game] Adding ${aiPlayersNeeded} AI players to fill room (current: ${currentPlayerCount}, max: ${maxPlayers})`);

      // Get AI players from centralized pool
      const aiPlayers = aiPlayerPoolService.getRandomPlayers(aiPlayersNeeded, roomId);

      // Create AI player objects
      const aiPlayerObjects: Player[] = aiPlayers.map((aiPlayer, index) => ({
        id: `ai-player-${index + 1}`,
        name: aiPlayer.name,
        score: 0,
        rank: currentPlayerCount + index + 1,
        hasPlayed: false,
        cSuiteLens: null,
        avatar: aiPlayer.avatar || '🤖'
      }));

      // Add AI players to the game
      setPlayers(prevPlayers => [...prevPlayers, ...aiPlayerObjects]);
      console.log('[CCM Game] AI players added:', aiPlayerObjects.map(p => p.name).join(', '));
    } else {
      console.log(`[CCM Game] Room full with ${currentPlayerCount} real players, no AI needed`);
    }

    setGamePhase('playing');
    setCurrentRound(1);
    setRoundTimer(60);
    setMasterMessage('The Challenge Master begins the game...');

    // Play game start sound
    masterSoundSystem.playGameStart();
  };

  /**
   * Select a card
   */
  const handleSelectCard = (cardId: string) => {
    // Check if current player has already locked in
    const currentPlayer = players.find(p => p.id === playerId);
    if (currentPlayer?.hasPlayed) return; // Already locked in this round

    // Play click sound
    masterSoundSystem.playClick();

    setSelectedCardId(cardId);
    // Deselect special cards if a regular card is selected
    setSelectedGoldenCard(false);
    setSelectedMVPCard(false);
  };

  /**
   * Select Golden Card
   */
  const handleSelectGoldenCard = () => {
    // Check if current player has already locked in
    const currentPlayer = players.find(p => p.id === playerId);
    if (currentPlayer?.hasPlayed) return; // Already locked in this round
    if (!hasGoldenCard) return; // Can't use if already used
    if (currentRound === 1) return; // Can't use in Round 1 (C-Suite selection)

    // Round 5 restriction: Can't use Golden if MVP is already selected
    if (currentRound === 5 && selectedMVPCard) {
      console.log('[CCM Round 5] Cannot select Golden Card - MVP card already selected. You can only use ONE special card in Round 5.');
      return;
    }

    // Play click sound
    masterSoundSystem.playClick();

    // Toggle Golden Card selection
    setSelectedGoldenCard(!selectedGoldenCard);
    // Clear other selections when Golden Card is selected
    if (!selectedGoldenCard) {
      setSelectedCardId(null);
      setSelectedMVPCard(false);
    }
  };

  /**
   * Select MVP Card
   */
  const handleSelectMVPCard = () => {
    // Check if current player has already locked in
    const currentPlayer = players.find(p => p.id === playerId);
    if (currentPlayer?.hasPlayed) return; // Already locked in this round
    if (!hasMVPCard || !mvpCard) return; // Can't use if not available or already used
    if (currentRound === 1) return; // Can't use in Round 1 (C-Suite selection)

    // Round 5 restriction: Can't use MVP if Golden is already selected
    if (currentRound === 5 && selectedGoldenCard) {
      console.log('[CCM Round 5] Cannot select MVP Card - Golden card already selected. You can only use ONE special card in Round 5.');
      return;
    }

    // Play click sound
    masterSoundSystem.playClick();

    // Toggle MVP Card selection
    setSelectedMVPCard(!selectedMVPCard);
    // Clear other selections when MVP Card is selected
    if (!selectedMVPCard) {
      setSelectedCardId(null);
      setSelectedGoldenCard(false);
    }
  };

  /**
   * Handle keeping the current MVP card (Bonus Play decision)
   */
  const handleKeepMVPCard = () => {
    if (!mvpCard || !bonusPlayRound) return;

    console.log(`[CCM MVP] Player chose to keep MVP card: ${mvpCard.roleCardData.displayName} (Round ${bonusPlayRound})`);

    // Update the locked round to track when it was last confirmed
    setMvpCard({
      ...mvpCard,
      lockedInRound: bonusPlayRound
    });

    // Close modal and advance to next round
    setShowBonusPlayModal(false);
    setBonusPlayRound(null);

    // Advance to next round
    setTimeout(() => {
      setCurrentRound(bonusPlayRound + 1);
      setPlayers(prevPlayers => prevPlayers.map(p => ({ ...p, hasPlayed: false, selectedRoleCard: undefined, selectedSpecialCard: undefined })));
      setMasterMessage(`Round ${bonusPlayRound + 1} starting...`);
    }, 1000);
  };

  /**
   * Handle swapping the MVP card for a different role card (Bonus Play decision)
   */
  const handleSwapMVPCard = (newCardId: string) => {
    if (!bonusPlayRound) return;

    // Find the new card from the available role cards
    const newCard = leftStack.find(card => card.type === 'role' && card.id === newCardId) as RoleCardData | undefined;

    if (!newCard) {
      console.error('[CCM MVP] ERROR: Cannot find new card to swap to:', newCardId);
      return;
    }

    console.log(`[CCM MVP] Player swapped MVP card from ${mvpCard?.roleCardData.displayName || 'none'} to ${newCard.displayName} (Round ${bonusPlayRound})`);

    // Update MVP card with the new selection - store full RoleCardData
    setMvpCard({
      roleCardData: newCard, // Store complete card data
      lockedInRound: bonusPlayRound
    });

    // Close modal and advance to next round
    setShowBonusPlayModal(false);
    setBonusPlayRound(null);

    // Advance to next round
    setTimeout(() => {
      setCurrentRound(bonusPlayRound + 1);
      setPlayers(prevPlayers => prevPlayers.map(p => ({ ...p, hasPlayed: false, selectedRoleCard: undefined, selectedSpecialCard: undefined })));
      setMasterMessage(`MVP Card swapped! Round ${bonusPlayRound + 1} starting...`);
    }, 1000);
  };

  /**
   * Confirm selection
   */
  const handleConfirmSelection = async () => {
    // Require either a card selection OR Golden Card OR MVP Card selected
    if (!selectedCardId && !selectedGoldenCard && !selectedMVPCard) return;

    console.log('[CCMGameRoom] Confirm selection clicked', { currentRound, selectedCardId, selectedGoldenCard });

    try {
      // Round 1: C-Suite selection
      if (currentRound === 1) {
        console.log('[CCMGameRoom] Round 1 - C-Suite selection:', selectedCardId);

        // MOCK MODE: Skip API call and just update UI state
        // In production, this would call the API
        /*
        const response = await fetch(`/api/ccm/game/${roomId}/c-suite-select`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: playerId,
            cSuiteChoice: selectedCardId
          })
        });

        const result = await response.json();
        if (!result.success) {
          console.error('C-Suite selection failed:', result.error);
          return;
        }

        // Broadcast C-Suite selection
        await ccmRealtimeService.broadcastCSuiteSelected(
          roomId,
          roomId, // sessionId (using roomId as proxy for now)
          playerId,
          selectedCardId
        );
        */

        // Update current player with C-Suite lens
        const newPlayers = players.map(p =>
          p.id === playerId
            ? { ...p, cSuiteLens: selectedCardId, hasPlayed: true }
            : p
        );
        setPlayers(newPlayers);
        setMasterMessage(`${playerName} selected ${selectedCardId?.toUpperCase()}! ${newPlayers.filter(p => p.hasPlayed).length}/${newPlayers.length} ready`);

        // Check if all players have locked in
        const allLocked = newPlayers.every(p => p.hasPlayed);
        console.log(`[User Lock-In] Round 1: ${newPlayers.filter(p => p.hasPlayed).length}/${newPlayers.length} players ready, allLocked: ${allLocked}`);

        if (allLocked) {
          console.log('[User Lock-In] All players locked in Round 1! Advancing to Round 2 in 2 seconds...');
          setTimeout(() => {
            setCurrentRound(2);
            setPlayers(prevPlayers => prevPlayers.map(p => ({ ...p, hasPlayed: false, selectedRoleCard: undefined, selectedSpecialCard: undefined })));
            setMasterMessage('Round 1 complete! Starting Round 2...');
          }, 2000);
        }
      } else {
        // Rounds 2-6: Lock in card selection
        console.log('[CCMGameRoom] Round 2+ - Card selection:', { selectedCardId, selectedGoldenCard });

        // MOCK MODE: Calculate score locally
        // TODO: In production, this should use CCMGameEngine.calculateRoundScore()
        let scoreToAdd = 0;
        if (selectedGoldenCard) {
          scoreToAdd = 130; // Golden Card = flat 130 points
          console.log('[CCMGameRoom] Golden Card used! +130 points');
        } else if (selectedMVPCard && mvpCard) {
          // MVP Card = base score (like regular card) + 10 bonus
          const baseScore = Math.floor(Math.random() * 50) + 40; // 40-90 points
          scoreToAdd = baseScore + 10; // +10 MVP bonus
          console.log('[CCMGameRoom] MVP Card used!', mvpCard.roleCardData.displayName, '+' + scoreToAdd + ' points (base: ' + baseScore + ' + MVP bonus: 10)');
        } else {
          scoreToAdd = Math.floor(Math.random() * 50) + 40; // Regular cards: 40-90 points
          console.log('[CCMGameRoom] Regular card used! +' + scoreToAdd + ' points');
        }

        /*
        const response = await fetch(`/api/ccm/game/${roomId}/lock-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: playerId,
            roleCardId: selectedGoldenCard ? null : selectedCardId,
            synergyCardId: null,
            specialCardType: selectedGoldenCard ? 'golden' : null
          })
        });

        const result = await response.json();
        if (!result.success) {
          console.error('Lock-in failed:', result.error);
          return;
        }

        await ccmRealtimeService.broadcastPlayerLockedIn(
          roomId,
          roomId,
          playerId,
          playerName,
          currentRound
        );
        */

        // If Golden Card was used, mark it as used
        if (selectedGoldenCard) {
          setHasGoldenCard(false);
          setSelectedGoldenCard(false);
        }

        // If MVP Card was used, mark it as used
        if (selectedMVPCard) {
          setHasMVPCard(false);
          setSelectedMVPCard(false);
        }

        // Determine what the player selected
        const playerSelectedRoleCard = selectedGoldenCard || selectedMVPCard ? undefined :
          leftStack.find(card => card.type === 'role' && card.id === selectedCardId)?.displayName;
        const playerSelectedSpecialCard = selectedGoldenCard ? 'golden' as const :
          selectedMVPCard ? 'mvp' as const : null;

        // Update player score and mark as locked in
        const newPlayers = players.map(p =>
          p.id === playerId
            ? { ...p, hasPlayed: true, score: p.score + scoreToAdd, selectedRoleCard: playerSelectedRoleCard, selectedSpecialCard: playerSelectedSpecialCard }
            : p
        );
        setPlayers(newPlayers);
        setMasterMessage(`${playerName} locked in! ${newPlayers.filter(p => p.hasPlayed).length}/${newPlayers.length} ready`);

        // Check if all players have locked in
        const allLocked = newPlayers.every(p => p.hasPlayed);
        console.log(`[User Lock-In] Round ${currentRound}: ${newPlayers.filter(p => p.hasPlayed).length}/${newPlayers.length} players ready, allLocked: ${allLocked}`);

        if (allLocked) {
          // Check if this is a Bonus Play round (after Rounds 2, 3, or 4)
          if (currentRound >= 2 && currentRound <= 4 && mvpCard) {
            console.log(`[CCM MVP] All players locked in Round ${currentRound}! Triggering Bonus Play modal...`);
            setTimeout(() => {
              setBonusPlayRound(currentRound);
              setShowBonusPlayModal(true);
              setMasterMessage(`Round ${currentRound} complete! Choose your MVP card strategy...`);
            }, 2000);
          } else {
            console.log(`[User Lock-In] All players locked in Round ${currentRound}! Advancing round in 2 seconds...`);
            setTimeout(() => {
              if (currentRound >= 6) {
                console.log('[User Lock-In] Game complete! Showing victory screen...');
                setGamePhase('complete');
                setShowVictory(true);

                // Play game complete sound
                masterSoundSystem.playGameComplete();
              } else {
                console.log(`[User Lock-In] Advancing from Round ${currentRound} to Round ${currentRound + 1}`);
                setCurrentRound(currentRound + 1);
                setPlayers(prevPlayers => prevPlayers.map(p => ({ ...p, hasPlayed: false, selectedRoleCard: undefined, selectedSpecialCard: undefined })));
                setMasterMessage('Round complete! Starting next round...');
              }
            }, 2000);
          }
        }
      }

      setSelectedCardId(null);
    } catch (error) {
      console.error('Error confirming selection:', error);
    }
  };

  /**
   * Render card stack
   */
  const renderCardStack = (cards: GameCard[], stackPosition: 'left' | 'center' | 'right', label: string) => {
    const isActive = activeStack === stackPosition;

    return (
      <div className={`flex flex-col items-center ${isActive ? 'z-20' : 'z-10'}`}>
        <div className="mb-3">
          <div className={`glass-card px-4 py-2 ${isActive ? 'glass-accent' : 'glass-subtle'}`}>
            <p className="glass-text-primary font-semibold text-sm flex items-center gap-2">
              {isActive && <Sparkles className="w-4 h-4 glass-icon-accent" />}
              {label}
            </p>
          </div>
        </div>

        <motion.div
          animate={{ scale: isActive ? 1.1 : 1 }}
          className="relative"
        >
          {!isActive && cards.length > 0 ? (
            // Show card back for inactive stacks
            <div className="relative w-32 h-48 rounded-xl overflow-hidden shadow-lg ccm-card-back">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/assets/career-challenge/MCC_Card_Back_Light.png')`
                }}
              />
              <div
                className="absolute inset-0 bg-cover bg-center dark-theme-card"
                style={{
                  backgroundImage: `url('/assets/career-challenge/MCC_Card_Back_Dark.png')`
                }}
              />
              <div className="absolute inset-0 flex items-end justify-center pb-3 z-10">
                <div className="glass-card-sm px-2 py-1">
                  <p className="text-xs glass-text-primary font-semibold">{cards.length} cards</p>
                </div>
              </div>
            </div>
          ) : (
            // Show expanded cards for active stack
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl">
              {cards.map((card) => {
                // Render appropriate card component based on type
                if (card.type === 'role') {
                  return (
                    <div key={card.id} onClick={() => handleSelectCard(card.id)}>
                      <RoleCard
                        cardData={card}
                        state={selectedCardId === card.id ? 'selected' : 'available'}
                        onClick={() => handleSelectCard(card.id)}
                        size="small"
                      />
                    </div>
                  );
                } else if (card.type === 'synergy') {
                  return (
                    <div key={card.id} onClick={() => handleSelectCard(card.id)}>
                      <SynergyCard
                        cardData={card}
                        state={selectedCardId === card.id ? 'selected' : 'available'}
                        onClick={() => handleSelectCard(card.id)}
                        size="small"
                      />
                    </div>
                  );
                } else if (card.type === 'challenge') {
                  return (
                    <div key={card.id} className="flex justify-center">
                      <ChallengeCard
                        cardData={card}
                        size="medium"
                        showContext={true}
                        roundNumber={currentRound}
                      />
                    </div>
                  );
                } else if (card.type === 'csuite') {
                  // C-Suite selection cards (Round 1)
                  return (
                    <motion.button
                      key={card.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectCard(card.id)}
                      className={`glass-card p-6 rounded-xl transition-all min-w-[140px] ${
                        selectedCardId === card.id
                          ? 'ring-4 ring-green-400 glass-accent'
                          : 'hover:glass-hover'
                      }`}
                    >
                      <div className="text-5xl mb-3">{card.icon}</div>
                      <p className="glass-text-primary font-bold text-base mb-1">{card.title}</p>
                      <p className="glass-text-secondary text-xs">{card.description}</p>
                    </motion.button>
                  );
                }
                return null;
              })}
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  /**
   * Render waiting room
   */
  if (gamePhase === 'waiting') {
    return (
      <div className="min-h-screen glass-gradient p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold glass-text-primary flex items-center gap-3">
                <Sparkles className="w-8 h-8 glass-icon-accent" />
                Career Challenge Multiplayer
              </h1>
              <p className="glass-text-secondary">Room: {roomCode}</p>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Leave Room
            </button>
          </div>

          {/* Waiting */}
          {loadingCompany ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-white text-xl">Loading company details...</div>
            </div>
          ) : companyDetails ? (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Company Info Card - Takes 2 columns */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card md:col-span-2"
                style={{ borderTop: `4px solid ${companyDetails.colorScheme.primary}` }}
              >
                {/* Company Header with Logo */}
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg text-4xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${companyDetails.colorScheme.primary}, ${companyDetails.colorScheme.secondary})`
                    }}
                  >
                    {companyDetails.logoIcon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold glass-text-primary mb-1">
                      {companyDetails.name}
                    </h2>
                    <p className="glass-text-secondary text-sm flex items-center gap-1 mb-2">
                      <Briefcase className="w-4 h-4" />
                      {companyDetails.industry.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold text-white"
                        style={{ background: companyDetails.colorScheme.primary }}
                      >
                        {companyDetails.gradeCategory.toUpperCase()}
                      </span>
                      <span className="glass-subtle px-2 py-1 rounded text-xs font-medium glass-text-secondary">
                        {companyDetails.companySize}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="glass-text-secondary text-sm mb-4 leading-relaxed">
                  {companyDetails.description}
                </p>

                {/* Company Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-subtle rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs font-semibold glass-text-secondary">Challenges</span>
                    </div>
                    <p className="text-lg font-bold glass-text-primary">{companyDetails.challengeCount}</p>
                    <p className="text-xs glass-text-tertiary">Across 6 P categories</p>
                  </div>
                  <div className="glass-subtle rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold glass-text-secondary">Difficulty</span>
                    </div>
                    <p className="text-lg font-bold glass-text-primary capitalize">{companyDetails.gradeCategory}</p>
                    <p className="text-xs glass-text-tertiary">Level</p>
                  </div>
                </div>

                {/* P Categories */}
                {companyDetails.pCategories && companyDetails.pCategories.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs font-semibold glass-text-secondary mb-2">P Categories:</p>
                    <div className="flex flex-wrap gap-1">
                      {companyDetails.pCategories.map((category) => (
                        <span
                          key={category}
                          className="px-2 py-1 glass-subtle rounded text-xs glass-text-secondary capitalize"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Players List Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card"
              >
                <h3 className="text-lg font-semibold mb-4 glass-text-primary flex items-center gap-2">
                  <Users className="w-5 h-5 glass-icon-primary" />
                  Players ({players.length}/4)
                </h3>
                <div className="space-y-2 mb-6">
                  {players.map((player) => (
                    <div key={player.id} className="glass-subtle p-3 rounded-lg">
                      <span className="glass-text-primary font-medium">{player.name}</span>
                    </div>
                  ))}
                </div>

                {/* Game Info */}
                <div className="glass-subtle rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 glass-icon-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="glass-text-primary font-medium text-sm mb-1">How to Play</p>
                      <ul className="glass-text-secondary text-xs space-y-1">
                        <li>• Round 1: Choose your C-Suite lens</li>
                        <li>• Round 2: Receive a random MVP card</li>
                        <li>• Rounds 2-6: Solve business challenges</li>
                        <li>• Bonus Play: After Rounds 2-4, keep or swap your MVP card</li>
                        <li>• MVP card gives +10 bonus points when used</li>
                        <li>• Round 5: Use MVP OR Golden card (not both!)</li>
                        <li>• Lens multipliers boost your score!</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartGame}
                  className="w-full px-8 py-4 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${companyDetails.colorScheme.primary}, ${companyDetails.colorScheme.secondary})`
                  }}
                >
                  <Play className="w-6 h-6" />
                  Start Game
                </motion.button>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="text-6xl mb-4">🎴</div>
                <h2 className="text-4xl font-bold glass-text-primary">
                  Waiting for Players
                </h2>
                <p className="glass-text-secondary text-xl">The Challenge Master will begin soon...</p>
              </motion.div>

              <div className="glass-card w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 glass-text-primary flex items-center gap-2">
                  <Users className="w-5 h-5 glass-icon-primary" />
                  Players ({players.length}/4)
                </h3>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div key={player.id} className="glass-subtle p-3 rounded-lg">
                      <span className="glass-text-primary font-medium">{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartGame}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Game
              </motion.button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /**
   * Render victory screen
   */
  if (showVictory) {
    return (
      <div className="min-h-screen glass-gradient flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card max-w-md w-full"
        >
          <div className="text-center space-y-6">
            <Trophy className="w-24 h-24 mx-auto glass-icon-accent" />
            <h2 className="text-3xl font-bold glass-text-primary">Game Complete!</h2>
            <div className="space-y-3">
              {players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0
                        ? 'glass-accent'
                        : 'glass-subtle'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <span className="glass-text-primary font-medium">{player.name}</span>
                    </div>
                    <span className="text-xl font-bold glass-text-primary">{player.score}</span>
                  </div>
                ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setGamePhase('waiting');
                  setCurrentRound(1);
                  setShowVictory(false);
                  setPlayers(players.map(p => ({ ...p, score: 0, hasPlayed: false, cSuiteLens: null })));
                  // Reset Golden Card for new game
                  setHasGoldenCard(true);
                  setSelectedGoldenCard(false);
                  // Reset MVP Card for new game
                  setMvpCard(null);
                  setHasMVPCard(false); // MVP card assigned in Round 2, not at start
                  setSelectedMVPCard(false);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold"
              >
                Play Again
              </button>
              <button
                onClick={handleLeaveRoom}
                className="flex-1 py-3 glass-subtle rounded-xl font-semibold glass-text-primary hover:glass-hover"
              >
                Back to Companies
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /**
   * Render game board
   */
  return (
    <div className="min-h-screen glass-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Banner */}
        <div className="glass-card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="w-6 h-6 glass-icon-accent" />
              <div>
                <p className="glass-text-primary font-bold text-lg">{masterMessage}</p>
                <p className="glass-text-tertiary text-sm">
                  Round {currentRound}/6 • {players.filter(p => p.hasPlayed).length}/{players.length} Locked In
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${roundTimer <= 10 ? 'glass-icon-warning animate-pulse' : 'glass-icon-primary'}`} />
                <span className={`text-2xl font-bold ${roundTimer <= 10 ? 'text-red-500' : 'glass-text-primary'}`}>
                  {roundTimer}s
                </span>
              </div>
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Leave
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Left: Leaderboard */}
          <div className="glass-card lg:col-span-1">
            <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 glass-text-primary flex items-center gap-2">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 glass-icon-accent" />
              Leaderboard
            </h3>
            <div className="space-y-2">
              {players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg transition-all ${
                      player.hasPlayed
                        ? 'glass-subtle opacity-75' // Locked in - grayed out
                        : player.id === playerId
                        ? 'glass-accent ring-2 ring-green-400' // Current player hasn't locked in
                        : 'glass-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <div>
                          <p className="glass-text-primary font-medium text-sm flex items-center gap-1">
                            {player.name}
                            {player.hasPlayed && <span className="text-green-500 text-xs">✓</span>}
                          </p>
                          {player.cSuiteLens && (
                            <p className="glass-text-tertiary text-xs flex items-center gap-1">
                              <Crown className="w-3 h-3" /> {player.cSuiteLens.toUpperCase()}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-lg font-bold glass-text-primary">{player.score}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right: Board Game Table */}
          <div className="lg:col-span-3">
            {/* Rounds 2+: Challenge Banner (Full Width at Top) */}
            {currentRound > 1 && centerStack.length > 0 && centerStack[0].type === 'challenge' && (() => {
              const challenge = centerStack[0];
              const pCategoryConfig: Record<string, { icon: React.ReactNode; label: string; bgGradient: string }> = {
                people: {
                  icon: <Users className="w-6 h-6" />,
                  label: 'PEOPLE',
                  bgGradient: 'from-pink-600 to-rose-600'
                },
                product: {
                  icon: <Package className="w-6 h-6" />,
                  label: 'PRODUCT',
                  bgGradient: 'from-blue-600 to-cyan-600'
                },
                process: {
                  icon: <Cog className="w-6 h-6" />,
                  label: 'PROCESS',
                  bgGradient: 'from-purple-600 to-indigo-600'
                },
                place: {
                  icon: <MapPin className="w-6 h-6" />,
                  label: 'PLACE',
                  bgGradient: 'from-green-600 to-emerald-600'
                },
                promotion: {
                  icon: <Megaphone className="w-6 h-6" />,
                  label: 'PROMOTION',
                  bgGradient: 'from-orange-600 to-amber-600'
                },
                price: {
                  icon: <DollarSign className="w-6 h-6" />,
                  label: 'PRICE',
                  bgGradient: 'from-emerald-600 to-teal-600'
                }
              };

              const category = pCategoryConfig[challenge.pCategory];

              return (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 md:mb-6 glass-card rounded-2xl overflow-hidden shadow-xl"
                >
                  {/* Banner Header */}
                  <div className={`bg-gradient-to-r ${category.bgGradient} p-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        {category.icon}
                      </div>
                      <div>
                        <div className="text-white/80 text-xs font-semibold">Round {currentRound} Challenge</div>
                        <div className="text-white text-xl font-bold">{category.label}</div>
                      </div>
                    </div>
                    <div className="text-white/90 text-sm font-medium bg-white/20 px-4 py-2 rounded-lg">
                      {challenge.difficultyLevel.charAt(0).toUpperCase() + challenge.difficultyLevel.slice(1)}
                    </div>
                  </div>

                  {/* Banner Content */}
                  <div className="p-4 md:p-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Challenge Description - 2/3 width with larger font */}
                      <div className="md:col-span-2">
                        <h3 className="text-xl md:text-2xl font-bold glass-text-primary mb-3">
                          {challenge.title}
                        </h3>
                        <p className="glass-text-secondary text-base md:text-lg leading-relaxed">
                          {challenge.description && challenge.description.trim() !== ''
                            ? challenge.description
                            : 'Select the best Role and Synergy cards to solve this business challenge.'}
                        </p>
                      </div>

                      {/* Context - 1/3 width */}
                      <div className="md:col-span-1 glass-subtle rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 glass-icon-primary" />
                          <span className="text-xs font-bold glass-text-primary">CONTEXT</span>
                        </div>
                        <p className="text-xs glass-text-secondary leading-relaxed italic">
                          {challenge.context}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            <div className="glass-game p-4 md:p-8 rounded-2xl min-h-[500px] md:min-h-[600px]">
              {/* Round 1: C-Suite Lens Selection */}
              {currentRound === 1 && (
                <div className="max-w-5xl mx-auto">
                  {/* Header */}
                  <div className="text-center mb-6 md:mb-8">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-block"
                    >
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl mb-4">
                        <h2 className="text-xl md:text-2xl font-bold">Choose Your C-Suite Lens</h2>
                        <p className="text-sm opacity-90 mt-1">Your perspective will give you scoring advantages</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* C-Suite Selection Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {[
                      {
                        id: 'ceo',
                        icon: '👔',
                        title: 'CEO',
                        subtitle: 'Chief Executive Officer',
                        pitch: 'I lead with vision and strategy. I balance all stakeholders and drive company culture.',
                        color: 'from-purple-600 to-indigo-600',
                        multipliers: [
                          { category: 'People', value: '+25%' },
                          { category: 'Price', value: '+25%' }
                        ]
                      },
                      {
                        id: 'cfo',
                        icon: '💰',
                        title: 'CFO',
                        subtitle: 'Chief Financial Officer',
                        pitch: 'Master the numbers game. Optimize costs, maximize profits, and ensure every dollar drives value.',
                        color: 'from-green-600 to-emerald-600',
                        multipliers: [
                          { category: 'Process', value: '+20%' },
                          { category: 'Price', value: '+30%' }
                        ]
                      },
                      {
                        id: 'cmo',
                        icon: '📢',
                        title: 'CMO',
                        subtitle: 'Chief Marketing Officer',
                        pitch: 'Own the customer journey. Build brands, create demand, and turn insights into irresistible campaigns.',
                        color: 'from-orange-600 to-red-600',
                        multipliers: [
                          { category: 'Promotion', value: '+30%' },
                          { category: 'Product', value: '+15%' }
                        ]
                      },
                      {
                        id: 'cto',
                        icon: '💻',
                        title: 'CTO',
                        subtitle: 'Chief Technology Officer',
                        pitch: 'Innovate through technology. Build cutting-edge solutions, scale systems, and future-proof the business.',
                        color: 'from-blue-600 to-cyan-600',
                        multipliers: [
                          { category: 'Product', value: '+30%' },
                          { category: 'Process', value: '+15%' }
                        ]
                      },
                      {
                        id: 'chro',
                        icon: '🤝',
                        title: 'CHRO',
                        subtitle: 'Chief HR Officer',
                        pitch: 'People are everything. Build elite teams, shape culture, and unlock human potential at scale.',
                        color: 'from-pink-600 to-rose-600',
                        multipliers: [
                          { category: 'People', value: '+30%' },
                          { category: 'Process', value: '+15%' }
                        ]
                      },
                      {
                        id: 'coo',
                        icon: '⚙️',
                        title: 'COO',
                        subtitle: 'Chief Operating Officer',
                        pitch: 'Execute with precision. Streamline operations, eliminate waste, and turn strategy into flawless delivery.',
                        color: 'from-teal-600 to-cyan-600',
                        multipliers: [
                          { category: 'Process', value: '+25%' },
                          { category: 'Place', value: '+25%' }
                        ]
                      },
                    ].map((lens) => (
                      <motion.button
                        key={lens.id}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectCard(lens.id)}
                        className={`glass-card p-4 md:p-6 rounded-xl transition-all ${
                          selectedCardId === lens.id
                            ? 'ring-4 ring-green-400 shadow-2xl'
                            : 'hover:shadow-xl'
                        }`}
                      >
                        {/* Icon & Title */}
                        <div className={`bg-gradient-to-r ${lens.color} text-white rounded-lg p-3 mb-3`}>
                          <div className="text-4xl md:text-5xl mb-2">{lens.icon}</div>
                          <p className="font-bold text-lg md:text-xl">{lens.title}</p>
                          <p className="text-xs opacity-90">{lens.subtitle}</p>
                        </div>

                        {/* Executive Pitch */}
                        <div className="mb-3">
                          <p className="text-xs glass-text-secondary leading-relaxed italic">{lens.pitch}</p>
                        </div>

                        {/* Multipliers */}
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold glass-text-secondary uppercase mb-2">Bonus Points</p>
                          {lens.multipliers.map((mult, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs glass-subtle rounded px-2 py-1">
                              <span className="glass-text-secondary">{mult.category}</span>
                              <span className="font-bold text-green-600 dark:text-green-400">{mult.value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Selected Indicator */}
                        {selectedCardId === lens.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-3 bg-green-500 text-white text-xs font-bold py-2 rounded-lg"
                          >
                            ✓ Selected
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Helper Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 text-center"
                  >
                    <div className="glass-subtle inline-block px-6 py-3 rounded-lg">
                      <p className="glass-text-secondary text-sm">
                        💡 <span className="font-semibold">Tip:</span> Choose a lens that matches your strategic thinking style!
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Rounds 2+: GameBoard with Circular Timer and Players */}
              {currentRound > 1 && (
                <GameBoard
                  players={players.map(p => ({
                    id: p.id,
                    name: p.name,
                    score: p.score,
                    hasPlayed: p.hasPlayed,
                    isCurrentUser: p.id === playerId,
                    cSuiteChoice: p.cSuiteLens || undefined,
                    rank: p.rank,
                    avatar: p.avatar,
                    selectedRoleCard: p.selectedRoleCard,
                    selectedSpecialCard: p.selectedSpecialCard
                  }))}
                  currentRound={currentRound}
                  totalRounds={6}
                  timeRemaining={roundTimer}
                  showTimer={true}
                />
              )}

              {/* Current Player's Card Tray - Positioned based on player's location on board */}
              {currentRound > 1 && !players.find(p => p.id === playerId)?.hasPlayed && (() => {
                // Find current player's index to determine their position on the board
                const currentPlayerIndex = players.findIndex(p => p.id === playerId);
                const positions = ['top', 'right', 'bottom', 'left'];
                const playerPosition = positions[currentPlayerIndex % 4];

                // Position card tray based on player's board position
                let trayPositionClass = '';
                if (playerPosition === 'bottom' || playerPosition === 'top') {
                  // For top/bottom players: show tray at bottom (most natural)
                  trayPositionClass = 'mt-8';
                } else {
                  // For left/right players: also show at bottom for consistency
                  trayPositionClass = 'mt-8';
                }

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={trayPositionClass}
                  >
                    <PlayerCardTray
                      playerName={playerName}
                      isInteractive={true}
                      roleCards={leftStack.filter((card): card is RoleCardData => card.type === 'role')}
                      selectedRoleCardId={selectedCardId}
                      onRoleCardSelect={handleSelectCard}
                      hasGoldenCard={hasGoldenCard}
                      selectedGoldenCard={selectedGoldenCard}
                      aiCompanionName={aiCompanionName}
                      onGoldenCardSelect={handleSelectGoldenCard}
                      currentRound={currentRound}
                      savedMVPCombo={mvpCard ? {
                        roleCardName: mvpCard.roleCardData.displayName,
                        synergyCardName: '', // Not used in new flow
                        cSuiteOrg: mvpCard.roleCardData.cSuiteOrg,
                        averageScore: 70, // Mock average score (base 60 + MVP bonus 10)
                        savedFromGameNumber: mvpCard.lockedInRound
                      } : null}
                      hasMVPCard={hasMVPCard}
                      selectedMVPCard={selectedMVPCard}
                      onMVPCardSelect={handleSelectMVPCard}
                    />
                  </motion.div>
                );
              })()}

              {/* Action Button */}
              {!players.find(p => p.id === playerId)?.hasPlayed && (selectedCardId || selectedGoldenCard || selectedMVPCard) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex justify-center"
                >
                  <button
                    onClick={handleConfirmSelection}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  >
                    {selectedGoldenCard ? 'Lock In Golden Card (130 Points)' :
                     selectedMVPCard && mvpCard ? `Lock In MVP Card (+10 Bonus)` :
                     'Lock In Selection'}
                  </button>
                </motion.div>
              )}

              {/* Locked In Message */}
              {players.find(p => p.id === playerId)?.hasPlayed && (
                <div className="mt-8 text-center">
                  <div className="glass-card inline-block px-6 py-3">
                    <p className="glass-text-primary text-lg flex items-center gap-2">
                      <span className="text-green-500 text-2xl">✓</span>
                      <span className="font-semibold">Locked In!</span>
                    </p>
                    <p className="glass-text-secondary text-sm mt-1">
                      Waiting for other players...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bonus Play Modal - Appears after Rounds 2, 3, 4 */}
        <AnimatePresence>
          {showBonusPlayModal && bonusPlayRound && mvpCard && (
            <BonusPlayModal
              roundNumber={bonusPlayRound}
              currentMVPCard={mvpCard.roleCardData} // Use stored card data directly
              availableRoleCards={leftStack.filter(
                (card): card is RoleCardData => card.type === 'role' && card.id !== selectedCardId
              )} // Filter out the card that was just used this round (only 5 cards available)
              onKeepMVPCard={handleKeepMVPCard}
              onSwapMVPCard={handleSwapMVPCard}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CCMGameRoom;
