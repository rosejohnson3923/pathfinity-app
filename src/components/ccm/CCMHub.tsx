/**
 * CCM (Career Challenge Multiplayer) Hub
 * Company lobby browser and join interface
 *
 * Features:
 * - 30 company lobbies across 3 grade levels
 * - Grade level filtering (Elementary, Middle, High)
 * - Company branding with logos and colors
 * - 6 P-category challenges per company
 * - Real business scenarios with C-Suite lens system
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ccmService } from '../../services/CCMService';
import {
  Users,
  Clock,
  Play,
  Trophy,
  ArrowLeft,
  Zap,
  Globe,
  Star,
  TrendingUp,
  AlertCircle,
  Building2,
  Briefcase,
  GraduationCap
} from 'lucide-react';

interface CompanyLobby {
  id: string;
  code: string;
  name: string;
  description: string;
  logoIcon: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  companySize: string;
  gradeCategory: 'elementary' | 'middle' | 'high';
  industry: {
    id: string;
    name: string;
    code: string;
    icon?: string;
    color_scheme?: {
      primary: string;
      secondary: string;
    };
  };
  challengeCount: number;
}

interface CCMHubProps {
  playerId: string;
  playerName: string;
  onBack: () => void;
  onJoinRoom: (roomId: string, roomCode: string) => void;
}

export const CCMHub: React.FC<CCMHubProps> = ({
  playerId,
  playerName,
  onBack,
  onJoinRoom
}) => {
  const [companies, setCompanies] = useState<CompanyLobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyLobby | null>(null);
  const [joining, setJoining] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<'all' | 'elementary' | 'middle' | 'high'>('all');

  // Load company lobbies
  useEffect(() => {
    loadCompanies();
  }, [gradeFilter]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      await ccmService.initialize();
      const filter = gradeFilter === 'all' ? undefined : gradeFilter;
      const companyLobbies = await ccmService.getCompanyLobbies(filter);

      setCompanies(companyLobbies.map((company: any) => ({
        id: company.id,
        code: company.code,
        name: company.name,
        description: company.description || 'Real business challenges',
        logoIcon: company.logo_icon || '🏢',
        colorScheme: company.color_scheme || {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#60A5FA'
        },
        companySize: company.company_size || 'Unknown',
        gradeCategory: company.grade_category,
        industry: {
          id: company.industry?.id || '',
          name: company.industry?.name || 'General',
          code: company.industry?.code || 'general',
          icon: company.industry?.icon,
          color_scheme: company.industry?.color_scheme
        },
        challengeCount: company.challengeCount || 6,
      })));

      setLoading(false);
    } catch (err) {
      console.error('Failed to load company lobbies:', err);
      setError('Failed to load company lobbies');
      setLoading(false);
    }
  };

  const handleJoinCompany = async (company: CompanyLobby) => {
    setJoining(true);
    setError(null);

    try {
      // For now, directly navigate to the game room
      // TODO: Implement proper lobby joining logic
      onJoinRoom(company.id, company.code);
    } catch (err: any) {
      console.error('Error joining company:', err);
      setError(err.message || 'Failed to join company');
    } finally {
      setJoining(false);
    }
  };

  // Get grade level badge color
  const getGradeBadgeColor = (grade: string) => {
    const colors: Record<string, string> = {
      elementary: 'bg-green-500',
      middle: 'bg-blue-500',
      high: 'bg-purple-500',
    };
    return colors[grade] || 'bg-gray-500';
  };

  // Get grade level display name
  const getGradeDisplayName = (grade: string) => {
    const names: Record<string, string> = {
      elementary: 'Elementary',
      middle: 'Middle School',
      high: 'High School',
    };
    return names[grade] || grade;
  };

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
                <Zap className="w-8 h-8 text-yellow-400" />
                CEO Takeover
                <span className="px-3 py-1 bg-green-500/20 rounded-lg border border-green-500/50 text-green-300 text-sm font-medium">
                  24/7 LIVE
                </span>
              </h1>
              <p className="text-purple-200">Join perpetual rooms • Drop-in anytime</p>
            </div>
          </div>

          <div className="text-white/80 text-right">
            <p className="text-sm">Playing as</p>
            <p className="font-semibold">{playerName}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-white text-xl">Loading company lobbies...</div>
          </div>
        ) : (
          <>
            {/* Info Banner */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Choose Your Company Challenge</p>
                  <p className="text-white/70 text-sm mt-1">
                    Select from 30 companies across 14 cutting-edge industries. Each company has 6 business challenges impacting the 6 P's of business growth: Product, Price, Place, Promotion, People, and Process. Choose your C-Suite lens and solve real-world scenarios!
                  </p>
                </div>
              </div>
            </div>

            {/* Grade Level Filter Tabs */}
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setGradeFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    gradeFilter === 'all'
                      ? 'bg-white text-purple-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    All Companies
                  </span>
                </button>
                <button
                  onClick={() => setGradeFilter('elementary')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    gradeFilter === 'elementary'
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Elementary
                  </span>
                </button>
                <button
                  onClick={() => setGradeFilter('middle')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    gradeFilter === 'middle'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Middle School
                  </span>
                </button>
                <button
                  onClick={() => setGradeFilter('high')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    gradeFilter === 'high'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    High School
                  </span>
                </button>
              </div>
            </div>

            {/* Company List - Grouped by Industry */}
            <div className="space-y-8">
              {/* Total Count Header */}
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-yellow-400" />
                {gradeFilter === 'all' ? 'All Companies' : `${getGradeDisplayName(gradeFilter)} Companies`} ({companies.length})
              </h2>

              {/* Group companies by industry */}
              {Object.entries(
                companies.reduce((acc, company) => {
                  const industryName = company.industry.name || 'Other';
                  if (!acc[industryName]) {
                    acc[industryName] = [];
                  }
                  acc[industryName].push(company);
                  return acc;
                }, {} as Record<string, CompanyLobby[]>)
              )
              .sort(([nameA], [nameB]) => nameA.localeCompare(nameB)) // Sort industries alphabetically
              .map(([industryName, industryCompanies], industryIndex) => (
                <div key={industryName} className="space-y-4">
                  {/* Industry Section Header */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: industryIndex * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <span className="text-2xl">{industryCompanies[0].industry.icon || '🏢'}</span>
                      <h3 className="text-xl font-bold text-white">{industryName}</h3>
                      <span className="text-sm text-white/70">({industryCompanies.length})</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
                  </motion.div>

                  {/* Companies Grid for this Industry */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {industryCompanies
                      .sort((a, b) => a.name.localeCompare(b.name)) // Sort companies alphabetically within industry
                      .map((company, index) => {
                  return (
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:scale-[1.02] transition-all duration-200 relative max-w-md mx-auto w-full"
                      style={{
                        borderTop: `4px solid ${company.colorScheme.primary}`
                      }}
                    >
                      {/* Grade Badge - Top Right */}
                      <div className="absolute top-4 right-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getGradeBadgeColor(company.gradeCategory)} text-white`}>
                          {company.gradeCategory.toUpperCase()}
                        </span>
                      </div>

                      {/* Company Logo */}
                      <div className="flex items-center justify-center mb-4">
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg text-4xl"
                          style={{
                            background: `linear-gradient(135deg, ${company.colorScheme.primary}, ${company.colorScheme.secondary})`
                          }}
                        >
                          {company.logoIcon}
                        </div>
                      </div>

                      {/* Company Name */}
                      <h4 className="text-2xl font-bold text-center mb-2">
                        {company.name}
                      </h4>

                      {/* Industry Badge */}
                      <div className="flex justify-center mb-2">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {company.industry.name}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 min-h-[3rem]">
                        {company.description}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-gray-100 dark:bg-gray-700 text-center py-2 px-1 rounded-lg">
                          <Trophy className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                          <div className="text-gray-600 dark:text-gray-400 font-semibold text-xs">
                            {company.challengeCount} challenges
                          </div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 text-center py-2 px-1 rounded-lg border border-green-500/30">
                          <Zap className="w-4 h-4 text-green-500 mx-auto mb-1" />
                          <div className="text-green-700 dark:text-green-400 font-bold text-xs">
                            Join Anytime
                          </div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 text-center py-2 px-1 rounded-lg">
                          <Building2 className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                          <div className="text-gray-600 dark:text-gray-400 font-semibold text-xs">
                            {company.companySize}
                          </div>
                        </div>
                      </div>

                      {/* Join Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleJoinCompany(company)}
                        disabled={joining}
                        className="w-full font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 text-white"
                        style={{
                          background: `linear-gradient(135deg, ${company.colorScheme.primary}, ${company.colorScheme.secondary})`
                        }}
                      >
                        <Play className="w-5 h-5" fill="currentColor" />
                        Join Company
                      </motion.button>
                    </motion.div>
                  );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
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
    </div>
  );
};

export default CCMHub;
