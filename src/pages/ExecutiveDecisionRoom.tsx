import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Trophy,
  MessageSquare,
  Play,
  Clock,
  TrendingUp,
  ChevronRight,
  LogOut,
  Crown,
  Target,
  Zap,
  AlertCircle,
  Send
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { careerChallengeService } from '../services/CareerChallengeService';
import { companyRoomService } from '../services/CompanyRoomService';
import {
  CompanyRoom,
  ExecutiveDecisionSession,
  CSuiteRole,
  BusinessScenario,
  SolutionCard,
  LensEffect
} from '../types/CareerChallengeTypes';
import ExecutiveSelectionModal from '../components/CareerChallenge/ExecutiveSelectionModal';
import SolutionSelectionScreen from '../components/CareerChallenge/SolutionSelectionScreen';
import ExecutiveResultsScreen from '../components/CareerChallenge/ExecutiveResultsScreen';
import { mapGradeLevelToCategory } from '../services/ai-prompts/rules/ExecutiveDecisionRules';

interface RoomPlayer {
  playerId: string;
  displayName: string;
  avatar?: string;
  isActive: boolean;
  currentScore: number;
  sessionCount: number;
  lastActiveAt: string;
}

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  type: 'chat' | 'system' | 'achievement';
  timestamp: string;
}

type GamePhase = 'lobby' | 'selecting-executive' | 'selecting-solutions' | 'results' | 'completed';

const ExecutiveDecisionRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false); // Prevent duplicate initialization from React StrictMode

  // Format player name with grade level: "FirstName(Grade)"
  const getPlayerDisplayName = (): string => {
    if (!user) return 'Player';

    let firstName = 'Player';

    // Try to get first name from full_name
    if (user.full_name) {
      const nameParts = user.full_name.trim().split(/\s+/);
      firstName = nameParts[0];
    } else if (user.firstName) {
      firstName = user.firstName;
    } else if (user.email) {
      // Use email username as fallback
      const emailName = user.email.split('@')[0];
      firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    // Add grade level if available
    if (user.grade_level) {
      return `${firstName}(${user.grade_level})`;
    }

    return firstName;
  };

  const playerDisplayName = getPlayerDisplayName();

  // Room state
  const [room, setRoom] = useState<CompanyRoom | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [lobbySessionId, setLobbySessionId] = useState<string | null>(null); // Session created on join

  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby');
  const [session, setSession] = useState<ExecutiveDecisionSession | null>(null);
  const [selectedExecutive, setSelectedExecutive] = useState<CSuiteRole | null>(null);
  const [selectedSolutions, setSelectedSolutions] = useState<SolutionCard[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [gameResults, setGameResults] = useState<any>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false); // Show leaderboard by default

  useEffect(() => {
    // Prevent duplicate initialization from React StrictMode double-mounting
    if (roomId && user && !initRef.current) {
      initRef.current = true;
      console.log('🔧 Initializing room - first mount only');
      initializeRoom();
    }

    return () => {
      if (roomId) {
        companyRoomService.unsubscribeFromRoom(roomId);
      }
    };
  }, [roomId, user]);

  useEffect(() => {
    scrollToBottomChat();
  }, [messages]);

  const initializeRoom = async () => {
    if (!roomId || !user) return;

    setLoading(true);
    try {
      // Get room details - try both grade categories to find the room
      let currentRoom: CompanyRoom | undefined;

      // First try to get room with user's grade category
      if (user.grade_level) {
        const gradeCategory = mapGradeLevelToCategory(user.grade_level) as 'elementary' | 'middle' | 'high';
        const rooms = await careerChallengeService.getCompanyRooms(gradeCategory);
        currentRoom = rooms.find(r => r.id === roomId);
      }

      // If not found, try fetching all rooms (both grade categories)
      if (!currentRoom) {
        const [elementaryRooms, otherRooms] = await Promise.all([
          careerChallengeService.getCompanyRooms('elementary'),
          careerChallengeService.getCompanyRooms('middle')
        ]);
        currentRoom = [...elementaryRooms, ...otherRooms].find(r => r.id === roomId);
      }

      setRoom(currentRoom || null);

      // Join room and create a session-specific instance with AI players
      const sessionId = await careerChallengeService.joinCompanyRoomAndCreateSession(
        roomId,
        user.id,
        playerDisplayName,
        6 // Total players including user
      );

      if (!sessionId) {
        console.error('Failed to create session');
        return;
      }

      setLobbySessionId(sessionId);
      console.log(`✅ Joined room with session ${sessionId}`);

      // Subscribe to real-time updates
      await companyRoomService.subscribeToRoom(
        roomId,
        handleNewMessage,
        handlePlayersUpdate,
        handleLeaderboardUpdate
      );

      // Load initial data for this specific session
      console.log(`🔍 Loading data for session ${sessionId}...`);
      const [sessionPlayers, roomMessages, sessionLeaderboard] = await Promise.all([
        companyRoomService.getSessionPlayers(sessionId),
        companyRoomService.getRoomMessages(roomId),
        careerChallengeService.getSessionLeaderboard(sessionId)
      ]);

      console.log(`📊 Session players loaded:`, sessionPlayers.length, sessionPlayers);
      console.log(`📊 Session leaderboard loaded:`, sessionLeaderboard.length, sessionLeaderboard);

      setPlayers(sessionPlayers);
      setMessages(roomMessages);
      setLeaderboard(sessionLeaderboard);

      setLoading(false);

      // Auto-start the game immediately instead of showing lobby
      await startGame();
    } catch (error) {
      console.error('Error initializing room:', error);
      setLoading(false);
    }
  };

  const handleNewMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const handlePlayersUpdate = (updatedPlayers: RoomPlayer[]) => {
    setPlayers(updatedPlayers);
  };

  const handleLeaderboardUpdate = (updatedLeaderboard: any[]) => {
    setLeaderboard(updatedLeaderboard);
  };

  const scrollToBottomChat = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !roomId || !user) return;

    await companyRoomService.sendMessage(
      roomId,
      user.id,
      playerDisplayName,
      newMessage,
      'chat'
    );
    setNewMessage('');
  };

  const startGame = async () => {
    if (!roomId || !user) return;

    setLoading(true);
    setGamePhase('selecting-executive'); // Show loading state with correct phase

    try {
      // Get grade category from user's grade level
      let gradeCategory: 'elementary' | 'middle' | 'high' | undefined = undefined;
      if (user.grade_level) {
        gradeCategory = mapGradeLevelToCategory(user.grade_level) as 'elementary' | 'middle' | 'high';
        console.log('🎓 User grade level:', user.grade_level, '→ Category:', gradeCategory);
      }

      const newSession = await careerChallengeService.startExecutiveDecisionSession(
        roomId,
        user.id,
        3, // Default difficulty level (used for scoring/time only)
        gradeCategory
      );

      if (newSession) {
        setSession(newSession);
        // Phase already set above
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setGamePhase('lobby'); // Fallback to lobby on error
    } finally {
      setLoading(false);
    }
  };

  const handleExecutiveSelected = async (executive: CSuiteRole) => {
    if (!session) return;

    setSelectedExecutive(executive);
    await careerChallengeService.selectExecutive(session.id, executive);
    setGamePhase('selecting-solutions');
  };

  const handleSolutionsSubmitted = async (solutions: SolutionCard[], timeSeconds: number) => {
    if (!session || !selectedExecutive) return;

    setSelectedSolutions(solutions);
    setTimeSpent(timeSeconds);

    const results = await careerChallengeService.submitSolutions(
      session.id,
      solutions.map(s => s.id),
      timeSeconds
    );

    if (results) {
      setGameResults(results);
      setGamePhase('results');

      // Announce achievement if any
      if (results.newAchievements && results.newAchievements.length > 0 && roomId && user) {
        for (const achievement of results.newAchievements) {
          await companyRoomService.broadcastAchievement(
            roomId,
            user.id,
            playerDisplayName,
            achievement
          );
        }
      }
    }
  };

  const handlePlayAgain = () => {
    setSession(null);
    setSelectedExecutive(null);
    setSelectedSolutions([]);
    setTimeSpent(0);
    setGameResults(null);
    setGamePhase('lobby');
  };

  const leaveRoom = () => {
    if (roomId) {
      companyRoomService.unsubscribeFromRoom(roomId);
    }
    navigate('/discovered-live');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p>Room not found</p>
          <button
            onClick={() => navigate('/discovered-live')}
            className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="max-w-[1300px] mx-auto">
        <div className="h-screen flex">
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {/* Room Header */}
          <div className="bg-gray-900/50 backdrop-blur-sm border-b border-purple-500/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="w-6 h-6 mr-2 text-purple-400" />
                <div>
                  <h1 className="text-xl font-bold">{room.name}</h1>
                  <p className="text-xs text-gray-400">{room.description}</p>
                </div>
              </div>
              <button
                onClick={leaveRoom}
                className="flex items-center px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Leave Room
              </button>
            </div>
          </div>

          {/* Game Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            {gamePhase === 'lobby' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border-2 border-purple-500/30">
                  <div className="text-center mb-8">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                    <h2 className="text-3xl font-bold mb-2">Executive Decision Maker</h2>
                    <p className="text-gray-300">
                      Lead as CEO and make critical business decisions through executive lenses
                    </p>
                  </div>

                  {/* Company Values */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Company Values</h3>
                    <div className="flex flex-wrap gap-2">
                      {room.companyValues?.map((value, i) => (
                        <span
                          key={`value-${value}-${i}`}
                          className="px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-lg text-sm"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Start Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startGame}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Executive Challenge
                  </motion.button>
                </div>
              </motion.div>
            )}

            {gamePhase === 'selecting-executive' && session && (
              <ExecutiveSelectionModal
                scenario={session.scenario}
                onSelectExecutive={handleExecutiveSelected}
              />
            )}

            {gamePhase === 'selecting-solutions' && session && selectedExecutive && (
              <SolutionSelectionScreen
                session={session}
                executive={selectedExecutive}
                onSubmit={handleSolutionsSubmitted}
              />
            )}

            {gamePhase === 'results' && gameResults && (
              <ExecutiveResultsScreen
                results={gameResults}
                onPlayAgain={handlePlayAgain}
                onBackToLobby={() => navigate('/discovered-live')}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-64 bg-gray-900/50 backdrop-blur-sm border-l border-purple-500/20 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setShowChat(true)}
              className={`flex-1 py-3 px-4 font-semibold transition-colors ${
                showChat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chat ({messages.length})
            </button>
            <button
              onClick={() => setShowChat(false)}
              className={`flex-1 py-3 px-4 font-semibold transition-colors ${
                !showChat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Leaderboard
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {showChat ? (
              <div className="h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, msgIdx) => (
                    <div
                      key={`msg-${msg.id}-${msgIdx}`}
                      className={`${
                        msg.type === 'system'
                          ? 'text-center text-gray-400 text-sm italic'
                          : msg.type === 'achievement'
                          ? 'bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-2 text-sm'
                          : ''
                      }`}
                    >
                      {msg.type === 'chat' && (
                        <div>
                          <span className="font-semibold text-purple-400">
                            {msg.playerName}:
                          </span>
                          <span className="ml-2 text-gray-200">{msg.message}</span>
                        </div>
                      )}
                      {msg.type === 'system' && <span>{msg.message}</span>}
                      {msg.type === 'achievement' && (
                        <div className="flex items-center">
                          <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                          <span>{msg.message}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={sendChatMessage}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                  Room Leaderboard
                </h3>
                {leaderboard.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No players in room yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => {
                      const hasPlayed = entry.score > 0;
                      const isTopThree = index < 3 && hasPlayed;

                      return (
                        <div
                          key={`leaderboard-${entry.playerId}-${entry.rank || index}`}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isTopThree
                              ? index === 0
                                ? 'bg-yellow-900/20 border border-yellow-500/30'
                                : index === 1
                                ? 'bg-gray-600/20 border border-gray-500/30'
                                : 'bg-orange-900/20 border border-orange-500/30'
                              : 'bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="font-bold text-xl mr-3">
                              #{entry.rank}
                            </span>
                            <div>
                              <p className="font-semibold">{entry.displayName}</p>
                              <p className="text-xs text-gray-400">
                                {hasPlayed
                                  ? `Score: ${entry.score.toLocaleString()}`
                                  : 'Not played yet'}
                              </p>
                            </div>
                          </div>
                          {isTopThree && (
                            <Trophy
                              className={`w-5 h-5 ${
                                index === 0
                                  ? 'text-yellow-400'
                                  : index === 1
                                  ? 'text-gray-400'
                                  : 'text-orange-400'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export { ExecutiveDecisionRoom };
export default ExecutiveDecisionRoom;