import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  TrendingUp,
  Target,
  Award,
  ChevronRight,
  RotateCcw,
  Home,
  Users,
  Heart,
  MessageSquare,
  Zap,
  Shield,
  Brain,
  CheckCircle,
  XCircle,
  Info,
  Sparkles,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { ExecutiveDecisionResult } from '../../types/CareerChallengeTypes';

interface ExecutiveResultsScreenProps {
  results: ExecutiveDecisionResult;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

interface SixCDisplay {
  name: string;
  icon: React.ReactNode;
  color: string;
  value: number;
  description: string;
}

const ExecutiveResultsScreen: React.FC<ExecutiveResultsScreenProps> = ({
  results,
  onPlayAgain,
  onBackToLobby
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'solutions' | 'leadership'>('overview');
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Trigger animations
    setTimeout(() => setAnimationComplete(true), 2000);
  }, []);

  const sixCsData: SixCDisplay[] = [
    {
      name: 'Character',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      value: results.sixCs.character,
      description: 'Ethical decision-making and integrity'
    },
    {
      name: 'Competence',
      icon: <Brain className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      value: results.sixCs.competence,
      description: 'Technical skill and knowledge application'
    },
    {
      name: 'Communication',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'from-green-500 to-green-600',
      value: results.sixCs.communication,
      description: 'Clear and effective messaging'
    },
    {
      name: 'Compassion',
      icon: <Heart className="w-5 h-5" />,
      color: 'from-pink-500 to-pink-600',
      value: results.sixCs.compassion,
      description: 'Empathy and people consideration'
    },
    {
      name: 'Commitment',
      icon: <Target className="w-5 h-5" />,
      color: 'from-orange-500 to-orange-600',
      value: results.sixCs.commitment,
      description: 'Dedication and follow-through'
    },
    {
      name: 'Confidence',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-yellow-500 to-yellow-600',
      value: results.sixCs.confidence,
      description: 'Decisive leadership and conviction'
    }
  ];

  const getScoreGrade = (score: number) => {
    const percentage = (score / 500) * 100; // Assuming max score of 500
    if (percentage >= 90) return { grade: 'GOAT', color: 'text-yellow-400' }; // Greatest Of All Time
    if (percentage >= 75) return { grade: 'OG', color: 'text-green-400' }; // Original Gangster (veteran/legend)
    if (percentage >= 50) return { grade: 'Pro', color: 'text-blue-400' }; // Professional
    if (percentage >= 25) return { grade: 'GitGud', color: 'text-orange-400' }; // Get Good (improving)
    return { grade: 'Noob', color: 'text-red-400' }; // Newbie
  };

  const scoreGrade = getScoreGrade(results.totalScore);
  const avgSixC = Object.values(results.sixCs).reduce((a, b) => a + b, 0) / 6;

  const renderOverviewTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Score Breakdown */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
          Score Breakdown
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Base Score:</span>
                <span className="font-semibold">{results.baseScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lens Multiplier:</span>
                <span className={`font-semibold ${
                  results.lensMultiplier >= 1.3 ? 'text-green-400' :
                  results.lensMultiplier >= 1.0 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  x{results.lensMultiplier.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Speed Bonus:</span>
                <span className="font-semibold text-blue-400">+{results.speedBonus}</span>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total Score:</span>
                  <span className="font-bold text-yellow-400">{results.totalScore}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${scoreGrade.color}`}>
                {scoreGrade.grade}
              </div>
              <p className="text-sm text-gray-400 mt-2">Skill Rank</p>
              <div className="mt-4">
                <p className="text-sm text-gray-400">Leaderboard Position</p>
                <p className="text-2xl font-bold text-purple-400">
                  #{results.leaderboardRank || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solution Analysis */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-400" />
          Solution Analysis
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-green-400">Perfect Solutions</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold">{results.perfectSelected}/5</div>
            <p className="text-xs text-gray-400 mt-1">Correctly identified</p>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-red-400">Imperfect Solutions</span>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-bold">{results.imperfectSelected}/5</div>
            <p className="text-xs text-gray-400 mt-1">Mistakenly chosen</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-400">
            <Info className="w-4 h-4 inline mr-1" />
            Executive lens {results.selectedExecutive} {
              results.lensMultiplier >= 1.3 ? 'perfectly matched' :
              results.lensMultiplier >= 1.0 ? 'reasonably matched' :
              'poorly matched'
            } this {results.scenario.scenarioType} scenario
          </p>
        </div>
      </div>

      {/* Rewards */}
      {(results.xpEarned > 0 || results.coinsEarned > 0 || results.newAchievements.length > 0) && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
            Rewards Earned
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p className="text-2xl font-bold">{results.xpEarned}</p>
              <p className="text-sm text-gray-400">XP Earned</p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold">{results.coinsEarned}</p>
              <p className="text-sm text-gray-400">Coins Earned</p>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="text-2xl font-bold">{results.newAchievements.length}</p>
              <p className="text-sm text-gray-400">Achievements</p>
            </div>
          </div>

          {results.newAchievements.length > 0 && (
            <div className="mt-4 space-y-2">
              {results.newAchievements.map((achievement, i) => (
                <div
                  key={i}
                  className="flex items-center p-2 bg-yellow-900/20 border border-yellow-500/30 rounded-lg"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                  <span className="text-sm font-semibold">{achievement}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );

  const renderLeadershipTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 6 C's Radar Chart */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-400" />
          6 C's of Leadership Analysis
        </h3>

        {/* Hexagon Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {sixCsData.map((c, index) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-purple-500 transition-all">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${c.color}
                  flex items-center justify-center mx-auto mb-3`}>
                  {c.icon}
                </div>
                <h4 className="font-semibold text-center mb-2">{c.name}</h4>

                {/* Score Bar */}
                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className={`absolute left-0 top-0 h-full bg-gradient-to-r ${c.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.value / 5) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  />
                </div>

                <p className="text-center text-2xl font-bold">{c.value.toFixed(1)}/5</p>
                <p className="text-xs text-gray-400 text-center mt-1">{c.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Average Score */}
        <div className="text-center p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Overall Leadership Score</p>
          <p className="text-3xl font-bold text-purple-400">{avgSixC.toFixed(1)}/5</p>
          <p className="text-xs text-gray-400 mt-1">
            {avgSixC >= 4.5 ? 'Exceptional Leadership' :
             avgSixC >= 3.5 ? 'Strong Leadership' :
             avgSixC >= 2.5 ? 'Developing Leadership' :
             'Needs Improvement'}
          </p>
        </div>
      </div>

      {/* Leadership Insights */}
      {results.leadershipInsights && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-400" />
            Leadership Insights
          </h3>
          <div className="space-y-4">
            {results.leadershipInsights?.strengths?.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-400 mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {results.leadershipInsights.strengths.map((strength, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start">
                      <ArrowUp className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.leadershipInsights?.improvements?.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">Areas for Improvement</h4>
                <ul className="space-y-1">
                  {results.leadershipInsights.improvements.map((improvement, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start">
                      <ArrowDown className="w-4 h-4 text-yellow-400 mr-2 mt-0.5" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.leadershipInsights.businessImpact && (
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="font-semibold text-blue-400 mb-1">Business Impact</h4>
                <p className="text-sm text-gray-300">{results.leadershipInsights.businessImpact}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );


  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Main Results Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-8 mb-6 border-2 border-purple-500/50"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Challenge Complete!</h1>
          <p className="text-xl text-gray-300">
            {results.scenario.title}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">{results.totalScore}</p>
            <p className="text-sm text-gray-400">Total Score</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">
              {results.perfectSelected}/{results.perfectSelected + results.imperfectSelected}
            </p>
            <p className="text-sm text-gray-400">Perfect Picks</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">
              {avgSixC.toFixed(1)}
            </p>
            <p className="text-sm text-gray-400">Leadership Score</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">
              #{results.leaderboardRank || 'N/A'}
            </p>
            <p className="text-sm text-gray-400">Room Rank</p>
          </div>
        </div>

        {/* Executive Decision Summary */}
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <p className="text-center text-gray-300">
            You chose <span className="font-bold text-purple-400">{results.selectedExecutive}</span> to handle this{' '}
            <span className="font-bold">
              {results.scenario.scenarioType}
            </span> scenario.{' '}
            {results.scenario.optimalExecutive === results.selectedExecutive ? (
              <span className="text-green-400">Perfect executive match!</span>
            ) : (
              <span className="text-yellow-400">
                The optimal choice was {results.scenario.optimalExecutive}.
              </span>
            )}
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'leadership'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              selectedTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'leadership' && renderLeadershipTab()}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBackToLobby}
          className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all flex items-center justify-center"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Rooms
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPlayAgain}
          className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-semibold transition-all flex items-center justify-center"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Play Again
        </motion.button>
      </div>
    </div>
  );
};

export default ExecutiveResultsScreen;