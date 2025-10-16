/**
 * Executive Decision Maker Integration
 * Replaces deprecated Career Challenge card game
 * Shows company rooms and launches Executive Decision Maker sessions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { careerChallengeService } from '../../services/CareerChallengeService';
import { CompanyRoom } from '../../types/CareerChallengeTypes';
import {
  Building2,
  Users,
  Trophy,
  ArrowLeft,
  Play,
  Shield,
  Briefcase,
  TrendingUp,
  Target
} from 'lucide-react';

interface ExecutiveDecisionIntegrationProps {
  studentId: string;
  studentName: string;
  gradeCategory?: 'elementary' | 'middle' | 'high';
  onExit: () => void;
}

export const ExecutiveDecisionIntegration: React.FC<ExecutiveDecisionIntegrationProps> = ({
  studentId,
  studentName,
  gradeCategory,
  onExit
}) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<CompanyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyRooms();
  }, [gradeCategory]);

  const loadCompanyRooms = async () => {
    setLoading(true);
    try {
      const companyRooms = await careerChallengeService.getCompanyRooms(gradeCategory);
      setRooms(companyRooms);
    } catch (err) {
      console.error('Failed to load company rooms:', err);
      setError('Failed to load company rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (room: CompanyRoom) => {
    try {
      // Join the room
      await careerChallengeService.joinCompanyRoom(
        room.id,
        studentId,
        studentName
      );

      // Navigate to the room
      navigate(`/executive-decision/room/${room.id}`);
    } catch (err) {
      console.error('Failed to join room:', err);
      setError('Failed to join room. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading Executive Decision Maker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onExit}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-yellow-400" />
                  Executive Decision Maker
                </h1>
                <p className="text-purple-200">
                  Lead as CEO and make critical business decisions
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-purple-200">Playing as</p>
              <p className="font-semibold">{studentName}</p>
              {gradeCategory && (
                <p className="text-xs text-purple-300 mt-1">
                  Grade: {gradeCategory.charAt(0).toUpperCase() + gradeCategory.slice(1)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
          >
            <p className="text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Company Rooms Grid */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-400" />
              Select a Company
            </h2>
            <p className="text-gray-300 mb-6">
              Choose a company to lead through executive challenges
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/30 hover:border-purple-500 transition-all cursor-pointer"
                onClick={() => handleJoinRoom(room)}
              >
                {/* Room Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{room.name}</h3>
                      <p className="text-xs text-gray-400">
                        {room.industry?.name || 'Business'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                  {room.description}
                </p>

                {/* Company Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Company Size</span>
                    <span className="font-semibold capitalize">{room.companySize}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Age</span>
                    <span className="font-semibold">{room.companyAge} years</span>
                  </div>
                </div>

                {/* Company Values */}
                {room.companyValues && room.companyValues.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Company Values</p>
                    <div className="flex flex-wrap gap-1">
                      {room.companyValues.slice(0, 3).map((value, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-purple-900/30 border border-purple-500/30 rounded text-xs"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Players */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {room.currentPlayers || 0}/{room.maxPlayers} Players
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-sm flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinRoom(room);
                    }}
                  >
                    <Play className="w-4 h-4" />
                    Join
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {rooms.length === 0 && !loading && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No company rooms available</p>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-yellow-400" />
            How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-purple-400">1</span>
              </div>
              <div>
                <p className="font-semibold mb-1">Choose Your Executive</p>
                <p className="text-gray-400">
                  Select which C-suite role you'll play (CEO, CFO, CMO, etc.)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-purple-400">2</span>
              </div>
              <div>
                <p className="font-semibold mb-1">Make Decisions</p>
                <p className="text-gray-400">
                  Select 5 solutions to business scenarios from your executive's perspective
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-purple-400">3</span>
              </div>
              <div>
                <p className="font-semibold mb-1">See Results</p>
                <p className="text-gray-400">
                  Get scored on your leadership skills and learn about different career paths
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExecutiveDecisionIntegration;
