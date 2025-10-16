/**
 * DLCC (Discovered Live! Career Challenge) Hub
 * Main entry point for Career Challenge within Discovered Live! arcade
 * Shows available industries and allows players to create or join rooms
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { careerChallengeService } from '../../services/CareerChallengeService';
import TutorialOverlay from './TutorialOverlay';
import SoundSettings from './SoundSettings';
import { soundManager, playButtonClick } from '../../services/CareerChallengeSoundManager';
import {
  Building2,
  Users,
  Trophy,
  Plus,
  Search,
  Clock,
  Shield,
  Briefcase,
  Heart,
  GraduationCap,
  Wrench,
  DollarSign,
  Cpu,
  Play,
  Lock,
  Star,
  TrendingUp,
  ChevronRight,
  ArrowLeft,
  Globe,
  Zap,
  HelpCircle
} from 'lucide-react';

type ViewMode = 'industries' | 'rooms' | 'create' | 'join';

interface Industry {
  id: string;
  name: string;
  code: string;
  icon: string;
  description: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  difficulty: 'Easy' | 'Medium' | 'Hard';
  playerCount?: number;
  activeRooms?: number;
}

interface GameRoom {
  id: string;
  roomCode: string;
  hostName: string;
  industryName: string;
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: string;
}

interface CareerChallengeHubProps {
  playerId: string;
  playerName: string;
  onBack: () => void;
  onStartGame: (roomCode: string, industryId: string) => void;
}

// Industry icon mapping
const getIndustryIcon = (icon: string) => {
  const iconMap: Record<string, any> = {
    '🏥': Heart,
    '💻': Cpu,
    '💰': DollarSign,
    '📚': GraduationCap,
    '⚙️': Wrench,
    '🏢': Building2,
    '💼': Briefcase,
    '🌍': Globe,
    '⚡': Zap
  };
  return iconMap[icon] || Building2;
};

export const CareerChallengeHub: React.FC<CareerChallengeHubProps> = ({
  playerId,
  playerName,
  onBack,
  onStartGame
}) => {
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [service, setService] = useState<typeof careerChallengeService | null>(null);

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('industries');
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [activeRooms, setActiveRooms] = useState<GameRoom[]>([]);
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Initialize service and load industries
  useEffect(() => {
    const initializeService = async () => {
      const client = await supabase();
      setSupabaseClient(client);
      await careerChallengeService.initialize();
      setService(careerChallengeService);
      loadIndustries(careerChallengeService);

      // Check if first time player (using localStorage)
      const hasSeenTutorial = localStorage.getItem('dlcc_tutorial_seen');
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }

      // Initialize sound manager and play menu music
      // This only happens when user actually enters the Career Challenge game
      soundManager.initialize().then(() => {
        soundManager.playMusic('menu');
      });
    };

    initializeService();

    // Cleanup on unmount
    return () => {
      soundManager.stopMusic(false);
    };
  }, []);

  // Load available industries
  const loadIndustries = async (careerService: typeof careerChallengeService) => {
    setLoading(true);
    try {
      const data = await careerService.getIndustries();
      const formattedIndustries = data.map(ind => ({
        id: ind.id,
        name: ind.name,
        code: ind.code,
        icon: ind.icon,
        description: ind.description || 'Challenge your career knowledge!',
        colorScheme: ind.color_scheme || {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#60A5FA'
        },
        difficulty: ind.difficulty || 'Medium',
        playerCount: 0,
        activeRooms: 0
      }));
      setIndustries(formattedIndustries);
    } catch (err) {
      console.error('Failed to load industries:', err);
      setError('Failed to load industries');
    } finally {
      setLoading(false);
    }
  };

  // Load active rooms for selected industry
  const loadActiveRooms = async () => {
    if (!service || !selectedIndustry) return;

    setLoading(true);
    try {
      const sessions = await service.getActiveSessions();
      const industryRooms = sessions
        .filter(s => s.industry_id === selectedIndustry.id && s.status === 'waiting')
        .map(s => ({
          id: s.id,
          roomCode: s.room_code,
          hostName: s.host_player_id, // Would need to fetch actual name
          industryName: selectedIndustry.name,
          playerCount: s.current_players || 1,
          maxPlayers: s.max_players || 6,
          status: s.status as 'waiting',
          createdAt: s.created_at
        }));
      setActiveRooms(industryRooms);
    } catch (err) {
      console.error('Failed to load rooms:', err);
      setError('Failed to load active rooms');
    } finally {
      setLoading(false);
    }
  };

  // Create a new room
  const handleCreateRoom = async () => {
    if (!service || !selectedIndustry) return;

    playButtonClick();
    setLoading(true);
    setError(null);

    try {
      // Generate a more unique room code using timestamp + random
      const timestamp = Date.now().toString().slice(-4);
      const random = Math.random().toString(36).substring(2, 4).toUpperCase();
      const newRoomCode = 'DLCC' + timestamp + random;

      const session = await service.createSession(
        playerId,
        selectedIndustry.id,
        newRoomCode,
        playerName
      );

      if (session) {
        soundManager.playSFX('gameStart');
        soundManager.stopMusic(true);
        onStartGame(newRoomCode, selectedIndustry.id);
      }
    } catch (err) {
      console.error('Failed to create room:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    localStorage.setItem('dlcc_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  // Handle tutorial skip
  const handleTutorialSkip = () => {
    localStorage.setItem('dlcc_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  // Join an existing room
  const handleJoinRoom = async (room?: GameRoom) => {
    if (!service) return;

    const targetRoomCode = room?.roomCode || roomCode;
    if (!targetRoomCode) {
      setError('Please enter a room code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find session by room code
      const sessions = await service.getActiveSessions();
      const session = sessions.find(s => s.room_code === targetRoomCode);

      if (!session) {
        setError('Room not found');
        return;
      }

      const joined = await service.joinSession(session.id, playerId);
      if (joined) {
        onStartGame(targetRoomCode, session.industry_id);
      }
    } catch (err) {
      console.error('Failed to join room:', err);
      setError('Failed to join room. It may be full or already started.');
    } finally {
      setLoading(false);
    }
  };

  // Industry selection screen
  const renderIndustrySelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Choose Your Industry
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select an industry to explore career challenges
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {industries.map((industry) => {
          const IconComponent = getIndustryIcon(industry.icon);
          return (
            <motion.button
              key={industry.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                playButtonClick();
                setSelectedIndustry(industry);
                setViewMode('rooms');
                loadActiveRooms();
              }}
              className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500"
              style={{
                background: `linear-gradient(135deg, ${industry.colorScheme.primary}10, ${industry.colorScheme.secondary}10)`
              }}
            >
              {/* Industry Icon */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto"
                style={{ backgroundColor: industry.colorScheme.primary + '20' }}
              >
                <IconComponent
                  className="w-8 h-8"
                  style={{ color: industry.colorScheme.primary }}
                />
              </div>

              {/* Industry Name */}
              <h3 className="text-xl font-bold mb-2">{industry.name}</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {industry.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {industry.activeRooms || 0} rooms
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  industry.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                  industry.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {industry.difficulty}
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 transition-all pointer-events-none" />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );

  // Room browser screen
  const renderRoomBrowser = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewMode('industries')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Industries</span>
        </button>

        <h2 className="text-2xl font-bold">
          {selectedIndustry?.name} Rooms
        </h2>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setViewMode('create')}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Room
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setViewMode('join')}
          className="flex-1 bg-white dark:bg-gray-800 border-2 border-purple-600 text-purple-600 py-3 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Join with Code
        </motion.button>
      </div>

      {/* Active Rooms */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Active Rooms ({activeRooms.length})
        </h3>

        {activeRooms.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              No active rooms. Create one to start playing!
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {activeRooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Room {room.roomCode}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Host: {room.hostName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">
                      {room.playerCount}/{room.maxPlayers} Players
                    </p>
                    <p className="text-xs text-gray-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(room.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleJoinRoom(room)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Join
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  // Create room screen
  const renderCreateRoom = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Create New Room</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Start a new {selectedIndustry?.name} challenge
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: selectedIndustry?.colorScheme.primary + '20' }}
          >
            {selectedIndustry && React.createElement(
              getIndustryIcon(selectedIndustry.icon),
              {
                className: "w-12 h-12",
                style: { color: selectedIndustry.colorScheme.primary }
              }
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">Room Settings</p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span>Industry</span>
              <span className="font-semibold">{selectedIndustry?.name}</span>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span>Max Players</span>
              <span className="font-semibold">6</span>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span>Victory Condition</span>
              <span className="font-semibold">100 Points</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setViewMode('rooms')}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateRoom}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  // Join room screen
  const renderJoinRoom = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Join Room</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter a room code to join
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Room Code</label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter 8-character code"
            maxLength={8}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-center text-2xl font-mono tracking-wider"
          />
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              setViewMode('rooms');
              setError(null);
              setRoomCode('');
            }}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleJoinRoom()}
            disabled={loading || roomCode.length < 6}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Room'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-yellow-400" />
                Career Challenge
              </h1>
              <p className="text-purple-200">Test your career knowledge</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SoundSettings compact={true} />
            <button
              onClick={() => setShowTutorial(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Show Tutorial"
            >
              <HelpCircle className="w-6 h-6 text-white" />
            </button>
            <div className="px-3 py-1 bg-orange-500/20 rounded-lg border border-orange-500/50">
              <span className="text-orange-300 font-medium text-sm">T (Teen 13+)</span>
            </div>
            <div className="text-white/80 text-right">
              <p className="text-sm">Playing as</p>
              <p className="font-semibold">{playerName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {loading && !industries.length ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-white text-xl">Loading...</div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'industries' && renderIndustrySelection()}
            {viewMode === 'rooms' && renderRoomBrowser()}
            {viewMode === 'create' && renderCreateRoom()}
            {viewMode === 'join' && renderJoinRoom()}
          </AnimatePresence>
        )}

        {/* Error Toast */}
        <AnimatePresence>
          {error && viewMode !== 'join' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isVisible={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
        industryName={selectedIndustry?.name}
      />
    </div>
  );
};

export default CareerChallengeHub;