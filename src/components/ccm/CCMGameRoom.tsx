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
  Sparkles
} from 'lucide-react';
import '../../design-system/index.css';

interface CCMGameRoomProps {
  roomId: string;
  roomCode: string;
  playerId: string;
  playerName: string;
  onLeave: () => void;
}

interface Player {
  id: string;
  name: string;
  score: number;
  rank: number;
  hasPlayed: boolean;
  cSuiteLens: string | null;
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

export const CCMGameRoom: React.FC<CCMGameRoomProps> = ({
  roomId,
  roomCode,
  playerId,
  playerName,
  onLeave
}) => {
  // Game state
  const [gamePhase, setGamePhase] = useState<'waiting' | 'playing' | 'complete'>('waiting');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundType, setRoundType] = useState<RoundType>('c-suite');
  const [roundTimer, setRoundTimer] = useState(60);
  const [masterMessage, setMasterMessage] = useState('Waiting for players...');

  // Players
  const [players, setPlayers] = useState<Player[]>([
    { id: playerId, name: playerName, score: 0, rank: 1, hasPlayed: false, cSuiteLens: null }
  ]);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState(0);

  // Card stacks
  const [leftStack, setLeftStack] = useState<Card[]>([]);
  const [centerStack, setCenterStack] = useState<Card[]>([]);
  const [rightStack, setRightStack] = useState<Card[]>([]);
  const [activeStack, setActiveStack] = useState<'left' | 'center' | 'right'>('center');

  // UI state
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showVictory, setShowVictory] = useState(false);

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
   * Initialize round with appropriate cards
   */
  const initializeRound = () => {
    if (currentRound === 1) {
      // Round 1: C-Suite selection
      setRoundType('c-suite');
      setActiveStack('center');
      setMasterMessage('Choose Your C-Suite Lens (Round 1 Only)');
      setCenterStack([
        { id: 'ceo', title: 'CEO', description: 'Chief Executive Officer', icon: '👔', color: 'from-purple-500 to-pink-500' },
        { id: 'cfo', title: 'CFO', description: 'Chief Financial Officer', icon: '💰', color: 'from-green-500 to-emerald-500' },
        { id: 'cmo', title: 'CMO', description: 'Chief Marketing Officer', icon: '📢', color: 'from-orange-500 to-red-500' },
        { id: 'cto', title: 'CTO', description: 'Chief Technology Officer', icon: '💻', color: 'from-blue-500 to-cyan-500' },
        { id: 'chro', title: 'CHRO', description: 'Chief HR Officer', icon: '🤝', color: 'from-yellow-500 to-orange-500' },
      ]);
      setLeftStack([]);
      setRightStack([]);
    } else {
      // Rounds 2-6: Problem categories with Role and Synergy cards
      const roundTypes: RoundType[] = ['people', 'product', 'pricing', 'process', 'proceeds', 'profits'];
      const type = roundTypes[currentRound - 2];
      setRoundType(type);
      setActiveStack('center');

      // Mock challenge card in center
      setCenterStack([
        {
          id: 'challenge',
          title: getRoundTitle(type),
          description: getRoundDescription(type),
          icon: getRoundIcon(type),
          color: 'from-purple-500 to-blue-500',
          difficulty: Math.floor(Math.random() * 5) + 1
        }
      ]);

      // Mock role cards on left
      setLeftStack([
        { id: 'r1', title: 'Software Engineer', description: 'Mid • Tech', icon: '💻', color: 'from-blue-400 to-blue-600', tags: ['Coding', 'Problem Solving'] },
        { id: 'r2', title: 'Marketing Manager', description: 'Senior • Business', icon: '📊', color: 'from-orange-400 to-orange-600', tags: ['Strategy', 'Analytics'] },
        { id: 'r3', title: 'Teacher', description: 'Mid • Education', icon: '📚', color: 'from-green-400 to-green-600', tags: ['Communication', 'Leadership'] },
      ]);

      // Mock synergy cards on right
      setRightStack([
        { id: 's1', title: 'Team Collaboration', description: '+20% team bonus', icon: '🤝', color: 'from-yellow-400 to-yellow-600' },
        { id: 's2', title: 'Innovation', description: '+15% creative bonus', icon: '💡', color: 'from-purple-400 to-purple-600' },
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
    return 'Select the best Role and Synergy cards to solve this challenge';
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
    setGamePhase('playing');
    setCurrentRound(1);
    setRoundTimer(60);
    setMasterMessage('The Challenge Master begins the game...');
  };

  /**
   * Select a card
   */
  const handleSelectCard = (cardId: string) => {
    if (players[currentPlayerTurn].id !== playerId) return;
    setSelectedCardId(cardId);
  };

  /**
   * Confirm selection
   */
  const handleConfirmSelection = () => {
    if (!selectedCardId) return;

    // Update player
    const newPlayers = [...players];
    newPlayers[currentPlayerTurn].hasPlayed = true;
    newPlayers[currentPlayerTurn].score += Math.floor(Math.random() * 50) + 30;

    if (currentRound === 1) {
      newPlayers[currentPlayerTurn].cSuiteLens = selectedCardId;
    }

    setPlayers(newPlayers);
    setSelectedCardId(null);

    // Next player or next round
    if (currentPlayerTurn < players.length - 1) {
      setCurrentPlayerTurn(currentPlayerTurn + 1);
      setMasterMessage(`${players[currentPlayerTurn + 1].name}'s turn...`);
    } else {
      // All players have played, move to next round
      setTimeout(() => {
        if (currentRound >= 6) {
          setGamePhase('complete');
          setShowVictory(true);
        } else {
          setCurrentRound(currentRound + 1);
          setCurrentPlayerTurn(0);
          setPlayers(players.map(p => ({ ...p, hasPlayed: false })));
        }
      }, 1500);
    }
  };

  /**
   * Render card stack
   */
  const renderCardStack = (cards: Card[], stackPosition: 'left' | 'center' | 'right', label: string) => {
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
            <div className="glass-game w-32 h-48 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎴</div>
                <p className="text-xs glass-text-tertiary">{cards.length} cards</p>
              </div>
            </div>
          ) : (
            // Show expanded cards for active stack
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl">
              {cards.map((card) => (
                <motion.button
                  key={card.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectCard(card.id)}
                  className={`glass-card p-4 rounded-xl transition-all ${
                    selectedCardId === card.id
                      ? 'ring-4 ring-green-400 glass-accent'
                      : 'hover:glass-hover'
                  }`}
                >
                  <div className="text-4xl mb-2">{card.icon}</div>
                  <p className="glass-text-primary font-bold text-sm mb-1">{card.title}</p>
                  <p className="glass-text-secondary text-xs">{card.description}</p>
                  {card.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {card.tags.map((tag, i) => (
                        <span key={i} className="glass-subtle text-[10px] px-2 py-0.5 rounded glass-text-tertiary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {card.difficulty && (
                    <div className="flex items-center justify-center gap-0.5 mt-2">
                      {Array.from({ length: card.difficulty }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      ))}
                    </div>
                  )}
                </motion.button>
              ))}
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
        <div className="max-w-4xl mx-auto">
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
              onClick={onLeave}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Leave Room
            </button>
          </div>

          {/* Waiting */}
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
                Players ({players.length}/8)
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
                }}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold"
              >
                Play Again
              </button>
              <button
                onClick={onLeave}
                className="flex-1 py-3 glass-subtle rounded-xl font-semibold glass-text-primary hover:glass-hover"
              >
                Return to Arcade
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
                <p className="glass-text-tertiary text-sm">Round {currentRound}/6 • {players[currentPlayerTurn]?.name}'s Turn</p>
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
                onClick={onLeave}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Leave
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Left: Leaderboard */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold mb-3 glass-text-primary flex items-center gap-2">
              <Trophy className="w-5 h-5 glass-icon-accent" />
              Leaderboard
            </h3>
            <div className="space-y-2">
              {players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg transition-all ${
                      players[currentPlayerTurn].id === player.id
                        ? 'glass-accent ring-2 ring-blue-400'
                        : 'glass-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <div>
                          <p className="glass-text-primary font-medium text-sm">{player.name}</p>
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
          <div className="col-span-3">
            <div className="glass-game p-8 rounded-2xl min-h-[600px]">
              {/* Three Card Stacks */}
              <div className="flex items-center justify-between gap-8">
                {/* Left Stack - Roles */}
                {renderCardStack(leftStack, 'left', 'Role Cards')}

                {/* Center Stack - Active */}
                {renderCardStack(centerStack, 'center', currentRound === 1 ? 'C-Suite Selection' : 'Challenge')}

                {/* Right Stack - Synergies */}
                {renderCardStack(rightStack, 'right', 'Synergy Cards')}
              </div>

              {/* Action Button */}
              {players[currentPlayerTurn].id === playerId && selectedCardId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex justify-center"
                >
                  <button
                    onClick={handleConfirmSelection}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  >
                    Confirm Selection
                  </button>
                </motion.div>
              )}

              {/* Waiting Message */}
              {players[currentPlayerTurn].id !== playerId && (
                <div className="mt-8 text-center">
                  <p className="glass-text-secondary text-lg">
                    Waiting for {players[currentPlayerTurn].name} to play...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCMGameRoom;
