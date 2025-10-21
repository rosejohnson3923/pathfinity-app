import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  TrendingUp,
  DollarSign,
  Users as UsersIcon,
  Settings,
  Cpu,
  AlertTriangle,
  Target,
  Lightbulb,
  Clock,
  ChevronRight,
  Info
} from 'lucide-react';
import { BusinessScenario, CSuiteRole } from '../../types/CareerChallengeTypes';

interface ExecutiveSelectionModalProps {
  scenario: BusinessScenario;
  onSelectExecutive: (executive: CSuiteRole) => void;
}

interface ExecutiveOption {
  role: CSuiteRole;
  title: string;
  department: string;
  icon: React.ReactNode;
  color: string;
  pitch: string;
  strengths: string[];
  biases: string[];
  focusArea: string;
}

const ExecutiveSelectionModal: React.FC<ExecutiveSelectionModalProps> = ({
  scenario,
  onSelectExecutive
}) => {
  const [selectedExecutive, setSelectedExecutive] = useState<CSuiteRole | null>(null);
  const [hoveredExecutive, setHoveredExecutive] = useState<CSuiteRole | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30); // 30 seconds to decide
  const [showDetails, setShowDetails] = useState(false);

  const executives: ExecutiveOption[] = [
    {
      role: 'CMO',
      title: 'Chief Marketing Officer',
      department: 'Marketing & Brand',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'purple',
      pitch: scenario.executivePitches?.CMO ||
        "This is a brand reputation issue. Let me handle the messaging and stakeholder communication to protect our market position.",
      strengths: ['Brand Management', 'Customer Relations', 'PR & Communications'],
      biases: ['Overvalues marketing solutions', 'May ignore operational costs', 'Brand-focused tunnel vision'],
      focusArea: 'Market Perception & Brand Value'
    },
    {
      role: 'CFO',
      title: 'Chief Financial Officer',
      department: 'Finance & Accounting',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'green',
      pitch: scenario.executivePitches?.CFO ||
        "I'll focus on the financial implications and ensure we maintain fiscal responsibility while addressing this situation.",
      strengths: ['Cost Analysis', 'ROI Focus', 'Risk Assessment'],
      biases: ['Undervalues people initiatives', 'Short-term profit focus', 'May miss innovation opportunities'],
      focusArea: 'Financial Impact & ROI'
    },
    {
      role: 'CHRO',
      title: 'Chief Human Resources Officer',
      department: 'People & Culture',
      icon: <UsersIcon className="w-6 h-6" />,
      color: 'blue',
      pitch: scenario.executivePitches?.CHRO ||
        "This directly impacts our people. I'll ensure we handle this with empathy while maintaining organizational stability.",
      strengths: ['Employee Wellbeing', 'Culture Building', 'Talent Management'],
      biases: ['May overlook financial constraints', 'People-first can delay decisions', 'Underestimates technical solutions'],
      focusArea: 'Employee Impact & Culture'
    },
    {
      role: 'COO',
      title: 'Chief Operating Officer',
      department: 'Operations',
      icon: <Settings className="w-6 h-6" />,
      color: 'orange',
      pitch: scenario.executivePitches?.COO ||
        "I'll streamline our operations to address this efficiently and ensure minimal disruption to our core business.",
      strengths: ['Process Optimization', 'Execution Excellence', 'Cross-functional Coordination'],
      biases: ['Process over people', 'May resist untested approaches', 'Efficiency at all costs'],
      focusArea: 'Operational Efficiency & Execution'
    },
    {
      role: 'CTO',
      title: 'Chief Technology Officer',
      department: 'Technology & Innovation',
      icon: <Cpu className="w-6 h-6" />,
      color: 'cyan',
      pitch: scenario.executivePitches?.CTO ||
        "Technology can provide innovative solutions here. Let me leverage our technical capabilities to address this challenge.",
      strengths: ['Innovation', 'Digital Solutions', 'Scalability'],
      biases: ['Tech solutionism', 'May overcomplicate simple problems', 'Undervalues human elements'],
      focusArea: 'Technology & Digital Innovation'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Separate effect to handle timeout auto-selection
  useEffect(() => {
    if (timeRemaining === 0 && !selectedExecutive) {
      // Auto-select a random executive if time runs out
      const randomExec = executives[Math.floor(Math.random() * executives.length)];
      handleConfirmSelection(randomExec.role);
    }
  }, [timeRemaining, selectedExecutive]);

  const getScenarioIcon = () => {
    switch (scenario.scenarioType) {
      case 'crisis':
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case 'risk':
        return <Target className="w-6 h-6 text-yellow-400" />;
      case 'opportunity':
        return <Lightbulb className="w-6 h-6 text-green-400" />;
      default:
        return <Info className="w-6 h-6 text-blue-400" />;
    }
  };

  const getScenarioTypeColor = () => {
    switch (scenario.scenarioType) {
      case 'crisis':
        return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'risk':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'opportunity':
        return 'text-green-400 bg-green-900/20 border-green-500/30';
      default:
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
    }
  };

  const getScenarioTypeLabel = () => {
    // Display "challenge" instead of "crisis" in UI
    return scenario.scenarioType === 'crisis' ? 'challenge' : scenario.scenarioType;
  };

  const getExecutiveColor = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'from-purple-600 to-pink-600',
      green: 'from-green-600 to-emerald-600',
      blue: 'from-blue-600 to-cyan-600',
      orange: 'from-orange-600 to-red-600',
      cyan: 'from-cyan-600 to-blue-600'
    };
    return colors[color] || 'from-gray-600 to-gray-700';
  };

  const getExecutiveBorderColor = (color: string, selected: boolean, hovered: boolean) => {
    if (selected) return 'border-white';
    if (hovered) return 'border-gray-300';

    const colors: Record<string, string> = {
      purple: 'border-purple-500/50',
      green: 'border-green-500/50',
      blue: 'border-blue-500/50',
      orange: 'border-orange-500/50',
      cyan: 'border-cyan-500/50'
    };
    return colors[color] || 'border-gray-500/50';
  };

  const handleConfirmSelection = (executive: CSuiteRole) => {
    onSelectExecutive(executive);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-[1300px] mx-auto p-6"
    >
      {/* Scenario Display */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-purple-500/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {getScenarioIcon()}
            <div className="ml-3">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{scenario.title}</h2>
                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getScenarioTypeColor()}`}>
                  {getScenarioTypeLabel().toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Business Driver: <span className="text-purple-400 font-semibold">
                  {scenario.businessDriver.charAt(0).toUpperCase() + scenario.businessDriver.slice(1)}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-2xl font-bold">
              <Clock className="w-6 h-6 mr-2 text-yellow-400" />
              <span className={timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}>
                {timeRemaining}s
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Time to decide</p>
          </div>
        </div>

        <p className="text-gray-300 leading-relaxed">{scenario.description}</p>

        {scenario.keywords && scenario.keywords.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {scenario.keywords.map((keyword, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-purple-900/30 border border-purple-500/30 rounded text-xs"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Instruction */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Choose Your Executive Delegate</h3>
        <p className="text-gray-400">
          Select which C-Suite executive will handle this {getScenarioTypeLabel()}.
          Their perspective will influence how solutions are perceived and evaluated.
        </p>
      </div>

      {/* Executive Options Grid */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {executives.map((exec) => (
          <motion.div
            key={exec.role}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setHoveredExecutive(exec.role)}
            onMouseLeave={() => setHoveredExecutive(null)}
            onClick={() => setSelectedExecutive(exec.role)}
            className={`relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border-2 cursor-pointer transition-all ${
              getExecutiveBorderColor(exec.color, selectedExecutive === exec.role, hoveredExecutive === exec.role)
            }`}
          >
            {selectedExecutive === exec.role && (
              <motion.div
                layoutId="selection"
                className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-xl"
              />
            )}

            <div className="relative">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getExecutiveColor(exec.color)}
                flex items-center justify-center mx-auto mb-3`}>
                {exec.icon}
              </div>
              <h4 className="font-bold text-center mb-1">{exec.role}</h4>
              <p className="text-xs text-gray-400 text-center mb-2">{exec.department}</p>
              <p className="text-xs text-gray-300 italic line-clamp-3">"{exec.pitch}"</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Executive Details */}
      <AnimatePresence>
        {selectedExecutive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/30 mb-6"
          >
            {(() => {
              const exec = executives.find(e => e.role === selectedExecutive);
              if (!exec) return null;

              return (
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-green-400">Strengths</h4>
                    <ul className="space-y-1">
                      {exec.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start">
                          <span className="text-green-400 mr-2">+</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-yellow-400">Cognitive Biases</h4>
                    <ul className="space-y-1">
                      {exec.biases.map((bias, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start">
                          <span className="text-yellow-400 mr-2">!</span>
                          {bias}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-400">Primary Focus</h4>
                    <p className="text-sm text-gray-300">{exec.focusArea}</p>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => selectedExecutive && handleConfirmSelection(selectedExecutive)}
          disabled={!selectedExecutive}
          className={`px-8 py-3 rounded-lg font-bold text-lg flex items-center transition-all ${
            selectedExecutive
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              : 'bg-gray-700 cursor-not-allowed opacity-50'
          }`}
        >
          Delegate to {selectedExecutive || 'Executive'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </motion.button>
      </div>

      {/* Hint */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          <Info className="w-3 h-3 inline mr-1" />
          Remember: You won't see the solutions until after choosing your executive!
        </p>
      </div>
    </motion.div>
  );
};

export default ExecutiveSelectionModal;