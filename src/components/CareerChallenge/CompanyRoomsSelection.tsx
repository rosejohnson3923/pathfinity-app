import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Trophy,
  TrendingUp,
  Clock,
  Star,
  Zap,
  ChevronRight,
  Info,
  Sparkles,
  Crown,
  Target,
  Briefcase,
  Globe,
  Shield
} from 'lucide-react';
import { careerChallengeService } from '../../services/CareerChallengeService';
import { CompanyRoom } from '../../types/CareerChallengeTypes';
import { useAuth } from '../../contexts/AuthContext';

interface RoomStats {
  roomId: string;
  topPlayer: string;
  topScore: number;
  activeScenarios: string[];
  avgDifficulty: number;
}

const CompanyRoomsSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<CompanyRoom[]>([]);
  const [roomStats, setRoomStats] = useState<Map<string, RoomStats>>(new Map());
  const [selectedRoom, setSelectedRoom] = useState<CompanyRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const companyRooms = await careerChallengeService.getCompanyRooms();
      setRooms(companyRooms);

      // Load stats for each room
      const stats = new Map<string, RoomStats>();
      for (const room of companyRooms) {
        const leaderboard = await careerChallengeService.getRoomLeaderboard(room.id, 1);
        stats.set(room.id, {
          roomId: room.id,
          topPlayer: leaderboard[0]?.displayName || 'No games yet',
          topScore: leaderboard[0]?.score || 0,
          activeScenarios: ['Challenge Management', 'Market Opportunity', 'Risk Mitigation'],
          avgDifficulty: Math.floor(Math.random() * 3) + 3, // Mock difficulty 3-5
        });
      }
      setRoomStats(stats);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIndustryIcon = (industryCode?: string) => {
    const icons: Record<string, React.ReactNode> = {
      'TECH': <Globe className="w-6 h-6" />,
      'HEALTH': <Shield className="w-6 h-6" />,
      'RETAIL': <Building2 className="w-6 h-6" />,
      'FINANCE': <TrendingUp className="w-6 h-6" />,
      'MFG': <Briefcase className="w-6 h-6" />,
      'EDU': <Target className="w-6 h-6" />,
      'ENERGY': <Zap className="w-6 h-6" />,
      'MEDIA': <Sparkles className="w-6 h-6" />,
      'FOOD': <Star className="w-6 h-6" />,
      'TRANSPORT': <Globe className="w-6 h-6" />,
    };
    return icons[industryCode || ''] || <Building2 className="w-6 h-6" />;
  };

  const getCompanySizeColor = (size?: string) => {
    switch (size) {
      case 'small':
        return 'text-green-400 bg-green-900/30';
      case 'medium':
        return 'text-blue-400 bg-blue-900/30';
      case 'large':
        return 'text-purple-400 bg-purple-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
        }`}
      />
    ));
  };

  const handleJoinRoom = async (room: CompanyRoom) => {
    if (!user) return;

    const success = await careerChallengeService.joinCompanyRoom(
      room.id,
      user.id,
      user.username || 'Player'
    );

    if (success) {
      navigate(`/career-challenge/room/${room.id}`);
    }
  };

  // Sort rooms: Featured (most players) first, then by display order
  const sortedRooms = [...rooms].sort((a, b) => {
    // First 3 rooms with most players are featured
    const aPlayers = a.currentPlayers || 0;
    const bPlayers = b.currentPlayers || 0;
    if (aPlayers !== bPlayers) return bPlayers - aPlayers;
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  const featuredRooms = sortedRooms.slice(0, 3);
  const otherRooms = sortedRooms.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading company rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Trophy className="w-8 h-8 mr-3 text-yellow-400" />
                Career Challenge: Executive Decision
              </h1>
              <p className="text-gray-300">
                Choose your company and lead as CEO through critical business scenarios
              </p>
            </div>
            <div className="bg-orange-500 px-3 py-1 rounded-lg font-semibold">
              T (Teen 13+)
            </div>
          </div>

          {/* Info Bar */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-400" />
                  <span className="text-sm">Make executive decisions through different C-Suite lenses</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-400" />
                  <span className="text-sm">10-15 min per session</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  <span className="text-sm">100-500 XP per game</span>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                <span className="text-sm font-semibold">
                  {rooms.reduce((sum, r) => sum + (r.currentPlayers || 0), 0)} players online
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured Rooms */}
        {featuredRooms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Crown className="w-6 h-6 mr-2 text-yellow-400" />
              Most Active Rooms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredRooms.map((room, index) => {
                const stats = roomStats.get(room.id);
                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onMouseEnter={() => setHoveredRoom(room.id)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => setSelectedRoom(room)}
                    className="relative bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-sm rounded-xl p-5 border-2 border-yellow-500/50 cursor-pointer hover:border-yellow-400 transition-all"
                  >
                    {/* Featured Badge */}
                    <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <Crown className="w-3 h-3 mr-1" />
                      FEATURED
                    </div>

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {getIndustryIcon(room.industry?.code)}
                        <div className="ml-3">
                          <h3 className="text-lg font-bold">{room.name}</h3>
                          <p className="text-xs text-gray-400">{room.industry?.name}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getCompanySizeColor(room.companySize)}`}>
                        {room.companySize?.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                      {room.description}
                    </p>

                    {/* Room Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Players:</span>
                        <span className="font-semibold text-green-400">
                          {room.currentPlayers}/{room.maxPlayers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Top Score:</span>
                        <span className="font-semibold text-yellow-400">
                          {stats?.topScore.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Difficulty:</span>
                        <div className="flex">{getDifficultyStars(stats?.avgDifficulty || 3)}</div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full mt-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinRoom(room);
                      }}
                    >
                      Join Room
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Rooms Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">All Company Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedRooms.map((room, index) => {
              const stats = roomStats.get(room.id);
              const isFeatured = featuredRooms.includes(room);

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  onClick={() => setSelectedRoom(room)}
                  className={`relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border-2 cursor-pointer transition-all ${
                    isFeatured
                      ? 'border-yellow-500/50 hover:border-yellow-400'
                      : 'border-gray-700 hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      {getIndustryIcon(room.industry?.code)}
                      <div className="ml-2">
                        <h3 className="text-md font-bold">{room.name}</h3>
                        <p className="text-xs text-gray-400">{room.industry?.name}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                    {room.description}
                  </p>

                  {/* Company Values */}
                  {room.companyValues && room.companyValues.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {room.companyValues.slice(0, 2).map((value, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-purple-900/30 border border-purple-500/30 rounded"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center text-green-400">
                      <Users className="w-3 h-3 mr-1" />
                      {room.currentPlayers} online
                    </div>
                    <div className="flex items-center text-yellow-400">
                      <Trophy className="w-3 h-3 mr-1" />
                      {stats?.topScore || 0}
                    </div>
                  </div>

                  <button
                    className={`w-full py-2 rounded-lg font-semibold transition-all text-sm ${
                      isFeatured
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinRoom(room);
                    }}
                  >
                    Join Room
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Room Details Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setSelectedRoom(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border-2 border-purple-500"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {getIndustryIcon(selectedRoom.industry?.code)}
                  <div className="ml-3">
                    <h2 className="text-2xl font-bold">{selectedRoom.name}</h2>
                    <p className="text-gray-400">{selectedRoom.industry?.name} Industry</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-300 mb-6">{selectedRoom.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Company Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Size:</span>
                      <span className="font-semibold capitalize">{selectedRoom.companySize}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Age:</span>
                      <span className="font-semibold">{selectedRoom.companyAge} years</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Players:</span>
                      <span className="font-semibold text-green-400">
                        {selectedRoom.currentPlayers}/{selectedRoom.maxPlayers}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Company Values</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.companyValues?.map((value, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-purple-900/30 border border-purple-500/30 rounded"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-orange-400 mb-2">Today's Scenarios</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {roomStats.get(selectedRoom.id)?.activeScenarios.map((scenario, i) => (
                    <div key={i} className="flex items-center text-gray-300">
                      <Target className="w-3 h-3 mr-1 text-orange-400" />
                      {scenario}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleJoinRoom(selectedRoom)}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-semibold transition-all flex items-center justify-center"
                >
                  Join Room
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyRoomsSelection;