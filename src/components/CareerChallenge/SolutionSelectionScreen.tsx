import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  Target,
  Zap,
  Shield,
  DollarSign,
  Users,
  Settings,
  Cpu
} from 'lucide-react';
import {
  ExecutiveDecisionSession,
  CSuiteRole,
  SolutionCard,
  LensedSolution
} from '../../types/CareerChallengeTypes';
import { careerChallengeService } from '../../services/CareerChallengeService';

interface SolutionSelectionScreenProps {
  session: ExecutiveDecisionSession;
  executive: CSuiteRole;
  onSubmit: (solutions: SolutionCard[], timeSpent: number) => void;
}

const SolutionSelectionScreen: React.FC<SolutionSelectionScreenProps> = ({
  session,
  executive,
  onSubmit
}) => {
  const [selectedSolutions, setSelectedSolutions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(session.scenario.timeLimitSeconds);
  const [showLensEffects, setShowLensEffects] = useState(true);
  const [hoveredSolution, setHoveredSolution] = useState<string | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // Apply lens effects to solutions
  const lensedSolutions = useMemo(() => {
    return careerChallengeService.getLensedSolutions(
      session.solutionCards,
      session.lensEffects,
      executive
    );
  }, [session.solutionCards, session.lensEffects, executive]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSolutions]);

  const getExecutiveIcon = () => {
    switch (executive) {
      case 'CMO':
        return <TrendingUp className="w-5 h-5" />;
      case 'CFO':
        return <DollarSign className="w-5 h-5" />;
      case 'CHRO':
        return <Users className="w-5 h-5" />;
      case 'COO':
        return <Settings className="w-5 h-5" />;
      case 'CTO':
        return <Cpu className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getExecutiveColor = () => {
    switch (executive) {
      case 'CMO':
        return 'from-purple-600 to-pink-600';
      case 'CFO':
        return 'from-green-600 to-emerald-600';
      case 'CHRO':
        return 'from-blue-600 to-cyan-600';
      case 'COO':
        return 'from-orange-600 to-red-600';
      case 'CTO':
        return 'from-cyan-600 to-blue-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getValueColor = (value: number) => {
    if (value >= 4) return 'text-green-400';
    if (value >= 3) return 'text-yellow-400';
    if (value >= 2) return 'text-orange-400';
    return 'text-red-400';
  };

  const getEmphasisStyle = (emphasis: string) => {
    switch (emphasis) {
      case 'high':
        return 'ring-2 ring-yellow-400 bg-yellow-900/20';
      case 'medium':
        return 'bg-gray-800/30';
      case 'low':
        return 'opacity-75';
      default:
        return '';
    }
  };

  const toggleSolution = (solutionId: string) => {
    setSelectedSolutions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(solutionId)) {
        newSet.delete(solutionId);
      } else if (newSet.size < 5) {
        newSet.add(solutionId);
      }
      return newSet;
    });
  };

  const handleSubmit = (autoSubmit = false) => {
    if (selectedSolutions.size !== 5 && !autoSubmit) {
      setConfirmSubmit(true);
      return;
    }

    const selected = session.solutionCards.filter(s => selectedSolutions.has(s.id));
    const timeSpent = session.scenario.timeLimitSeconds - timeRemaining;

    // If auto-submit and not enough solutions, randomly select remaining
    if (autoSubmit && selected.length < 5) {
      const remaining = session.solutionCards
        .filter(s => !selectedSolutions.has(s.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 5 - selected.length);
      selected.push(...remaining);
    }

    onSubmit(selected, timeSpent);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Shuffle solutions for display
  const displaySolutions = useMemo(() => {
    return [...lensedSolutions].sort(() => Math.random() - 0.5);
  }, [lensedSolutions]);

  return (
    <div className="w-full max-w-[1300px] mx-auto p-6">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 mb-6 border-2 border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getExecutiveColor()}
              flex items-center justify-center mr-3`}>
              {getExecutiveIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Viewing through {executive} Lens
              </h2>
              <p className="text-sm text-gray-400">
                Select exactly 5 solutions for the {session.scenario.scenarioType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Lens Toggle */}
            <button
              onClick={() => setShowLensEffects(!showLensEffects)}
              className={`flex items-center px-3 py-1 rounded-lg transition-all ${
                showLensEffects
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {showLensEffects ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
              Lens Effects
            </button>

            {/* Timer */}
            <div className={`flex items-center text-2xl font-bold ${
              timeRemaining <= 30 ? 'text-red-400 animate-pulse' : 'text-white'
            }`}>
              <Clock className="w-6 h-6 mr-2" />
              {formatTime(timeRemaining)}
            </div>

            {/* Selection Count */}
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              selectedSolutions.size === 5
                ? 'bg-green-600'
                : 'bg-gray-700'
            }`}>
              {selectedSolutions.size}/5 Selected
            </div>
          </div>
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {displaySolutions.map((solution, index) => {
          const isSelected = selectedSolutions.has(solution.id);
          const isHovered = hoveredSolution === solution.id;

          return (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onMouseEnter={() => setHoveredSolution(solution.id)}
              onMouseLeave={() => setHoveredSolution(null)}
              onClick={() => toggleSolution(solution.id)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              } ${showLensEffects ? getEmphasisStyle(solution.visualEmphasis) : ''}`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
              )}

              {/* Value Display */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`text-2xl font-bold mr-2 ${
                    getValueColor(showLensEffects ? solution.displayValue : solution.baseValue)
                  }`}>
                    {showLensEffects ? solution.displayValue : solution.baseValue}
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (showLensEffects ? solution.displayValue : solution.baseValue)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Perfect/Imperfect Hidden Indicator */}
                {solution.isPerfectHidden && showLensEffects && (
                  <div className="flex items-center text-xs text-yellow-400">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Perception Distorted
                  </div>
                )}
              </div>

              {/* Solution Content */}
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                {showLensEffects ? solution.displayDescription : solution.content}
              </p>

              {/* Badges and Warnings */}
              {showLensEffects && (
                <div className="space-y-2">
                  {solution.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {solution.badges.map((badge, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-green-900/30 border border-green-500/30 rounded text-xs text-green-400"
                        >
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  {solution.warnings.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {solution.warnings.map((warning, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-red-900/30 border border-red-500/30 rounded text-xs text-red-400"
                        >
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          {warning}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Keywords */}
              <div className="mt-3 flex flex-wrap gap-1">
                {solution.keywords.slice(0, 3).map((keyword, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 bg-purple-900/20 border border-purple-500/20 rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSubmit()}
          disabled={selectedSolutions.size === 0}
          className={`px-8 py-3 rounded-lg font-bold text-lg flex items-center transition-all ${
            selectedSolutions.size === 5
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
              : selectedSolutions.size > 0
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
              : 'bg-gray-700 cursor-not-allowed opacity-50'
          }`}
        >
          {selectedSolutions.size === 5
            ? 'Submit Solutions'
            : selectedSolutions.size === 0
            ? 'Select Solutions'
            : `Select ${5 - selectedSolutions.size} More`}
          <Target className="w-5 h-5 ml-2" />
        </motion.button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmSubmit && selectedSolutions.size !== 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setConfirmSubmit(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-xl p-6 max-w-md border-2 border-yellow-500"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-center mb-2">
                Incomplete Selection
              </h3>
              <p className="text-gray-300 text-center mb-6">
                You've selected {selectedSolutions.size} out of 5 required solutions.
                Are you sure you want to submit?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmSubmit(false)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
                >
                  Keep Selecting
                </button>
                <button
                  onClick={() => {
                    setConfirmSubmit(false);
                    handleSubmit(true);
                  }}
                  className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold"
                >
                  Submit Anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SolutionSelectionScreen;