import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Brain,
  Target,
  Lightbulb,
  Info
} from 'lucide-react';
import { executiveDecisionAIService } from '../../services/ExecutiveDecisionAIService';
import { scenarioManager } from '../../services/ScenarioManager';
import {
  ScenarioType,
  BusinessScenario,
  SolutionCard,
  IndustryContext
} from '../../types/CareerChallengeTypes';

const TestAIGeneration: React.FC = () => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'complete' | 'error'>('idle');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentTest, setCurrentTest] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [gradeCategory, setGradeCategory] = useState('elementary'); // Default to elementary
  const [generatedContent, setGeneratedContent] = useState<{
    scenario?: BusinessScenario;
    solutions?: { perfect: SolutionCard[], imperfect: SolutionCard[] };
    analysis?: any;
  }>({});

  const industryContext: IndustryContext = {
    industryId: 'test-industry',
    industryName: 'Technology',
    industryCode: 'TECH',
    companySize: 'large',
    companyAge: 15,
    companyValues: ['Innovation', 'Customer Focus', 'Excellence'],
  };

  const addTestResult = (test: string, success: boolean, details: any) => {
    setTestResults(prev => [...prev, { test, success, details, timestamp: new Date() }]);
  };

  const testScenarioGeneration = async () => {
    setCurrentTest('Generating Business Scenario...');
    try {
      let scenario: BusinessScenario;

      if (useAI) {
        // Test AI generation with grade level
        scenario = await executiveDecisionAIService.generateScenario({
          scenarioType: 'crisis',
          businessDriver: 'people',
          industryContext,
          difficultyLevel: 3,
          currentEvents: true,
          gradeCategory // Pass the selected grade category
        });
      } else {
        // Use template generation
        scenario = scenarioManager.generateScenario(
          'crisis',
          'people',
          3,
          industryContext
        );
      }

      setGeneratedContent(prev => ({ ...prev, scenario }));
      addTestResult('Scenario Generation', true, {
        title: scenario.title,
        type: scenario.scenarioType,
        optimalExecutive: scenario.optimalExecutive,
        wordCount: scenario.description.split(' ').length
      });

      return scenario;
    } catch (error: any) {
      addTestResult('Scenario Generation', false, { error: error.message });
      throw error;
    }
  };

  const testSolutionGeneration = async (scenario: BusinessScenario) => {
    setCurrentTest('Generating Solutions...');
    try {
      let solutions: { perfect: SolutionCard[], imperfect: SolutionCard[] };

      if (useAI) {
        // Test AI generation
        solutions = await executiveDecisionAIService.generateSolutions({
          scenario,
          count: 10,
          perfectCount: 5,
          imperfectCount: 5,
          industryContext
        });
      } else {
        // Use template generation
        solutions = scenarioManager.generateSolutions(scenario, 10);
      }

      setGeneratedContent(prev => ({ ...prev, solutions }));
      addTestResult('Solution Generation', true, {
        perfectCount: solutions.perfect.length,
        imperfectCount: solutions.imperfect.length,
        totalSolutions: solutions.perfect.length + solutions.imperfect.length
      });

      return solutions;
    } catch (error: any) {
      addTestResult('Solution Generation', false, { error: error.message });
      throw error;
    }
  };

  const testLeadershipAnalysis = async (
    scenario: BusinessScenario,
    solutions: { perfect: SolutionCard[], imperfect: SolutionCard[] }
  ) => {
    setCurrentTest('Analyzing Leadership...');
    try {
      if (!useAI) {
        addTestResult('Leadership Analysis', true, {
          note: 'Skipped - Only available with AI'
        });
        return;
      }

      // Select some solutions for analysis
      const selectedSolutions = [
        ...solutions.perfect.slice(0, 3),
        ...solutions.imperfect.slice(0, 2)
      ];

      const analysis = await executiveDecisionAIService.analyzeLeadership({
        selectedSolutions,
        perfectSolutions: solutions.perfect,
        selectedExecutive: 'CMO',
        optimalExecutive: scenario.optimalExecutive,
        scenario,
        timeSpentSeconds: 45,
        timeLimitSeconds: 60
      });

      setGeneratedContent(prev => ({ ...prev, analysis }));
      addTestResult('Leadership Analysis', true, {
        sixCsAverage: Object.values(analysis.sixCs).reduce((a, b) => a + b, 0) / 6,
        insightsCount: analysis.insights.strengths.length + analysis.insights.improvements.length,
        careerRecommendations: analysis.careerRecommendations.length
      });

      return analysis;
    } catch (error: any) {
      addTestResult('Leadership Analysis', false, { error: error.message });
      throw error;
    }
  };

  const runTests = async () => {
    setTestStatus('testing');
    setTestResults([]);
    setGeneratedContent({});

    try {
      // Test 1: Scenario Generation
      const scenario = await testScenarioGeneration();

      // Test 2: Solution Generation
      const solutions = await testSolutionGeneration(scenario);

      // Test 3: Leadership Analysis (AI only)
      await testLeadershipAnalysis(scenario, solutions);

      setTestStatus('complete');
      setCurrentTest('All tests complete!');
    } catch (error) {
      setTestStatus('error');
      setCurrentTest('Test failed - check results');
      console.error('Test error:', error);
    }
  };

  const resetTests = () => {
    setTestStatus('idle');
    setTestResults([]);
    setGeneratedContent({});
    setCurrentTest('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-purple-400" />
            Executive Decision AI Content Generation Test
          </h1>
          <p className="text-gray-300">
            Test the AI-powered content generation for scenarios, solutions, and leadership analysis
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-purple-500/30">
          <div className="flex flex-col gap-4">
            {/* AI Toggle and Grade Level Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setUseAI(!useAI)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    useAI
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  {useAI ? 'Using Azure OpenAI' : 'Using Templates'}
                </button>

                <span className="text-sm text-gray-400">
                  {useAI
                    ? 'Dynamic content via Azure OpenAI'
                    : 'Static content from templates'}
                </span>
              </div>

              <div className="flex gap-2">
                {testStatus === 'idle' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={runTests}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Tests
                  </motion.button>
                )}

                {testStatus !== 'idle' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetTests}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </motion.button>
                )}
              </div>
            </div>

            {/* Grade Category Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-300">
                Grade Category:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGradeCategory('elementary')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    gradeCategory === 'elementary'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  Elementary (K-5)
                </button>
                <button
                  onClick={() => setGradeCategory('middle')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    gradeCategory === 'middle'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  Middle School (6-8)
                </button>
                <button
                  onClick={() => setGradeCategory('high')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    gradeCategory === 'high'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  High School (9-12)
                </button>
              </div>
              <span className="text-sm text-gray-400">
                {gradeCategory === 'elementary' && 'Ages 5-11: Simple business concepts, teamwork, and community helpers'}
                {gradeCategory === 'middle' && 'Ages 11-14: Market analysis, brand reputation, and basic strategy'}
                {gradeCategory === 'high' && 'Ages 14-18: Strategic planning, global markets, and complex decisions'}
              </span>
            </div>

            {/* Current Test Status */}
            {testStatus === 'testing' && (
              <div className="flex items-center text-blue-400">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {currentTest}
              </div>
            )}

            {testStatus === 'complete' && (
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-5 h-5 mr-2" />
                All tests completed successfully!
              </div>
            )}

            {testStatus === 'error' && (
              <div className="flex items-center text-red-400">
                <XCircle className="w-5 h-5 mr-2" />
                Tests failed - check console for details
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-purple-500/30">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-yellow-400" />
              Test Results
            </h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-red-900/20 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{result.test}</span>
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    <pre>{JSON.stringify(result.details, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Content Preview */}
        {Object.keys(generatedContent).length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenario Preview */}
            {generatedContent.scenario && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                  Generated Scenario
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">Title:</span> {generatedContent.scenario.title}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Type:</span> {generatedContent.scenario.scenarioType}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Optimal Executive:</span> {generatedContent.scenario.optimalExecutive}
                  </p>
                  <div className="mt-3 p-3 bg-gray-900/50 rounded text-sm text-gray-300">
                    {generatedContent.scenario.description}
                  </div>
                </div>
              </div>
            )}

            {/* Solutions Preview */}
            {generatedContent.solutions && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                  Generated Solutions
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded">
                    <p className="font-semibold text-green-400 mb-2">
                      Perfect Solutions ({generatedContent.solutions.perfect.length})
                    </p>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {generatedContent.solutions.perfect[0]?.content}
                    </p>
                  </div>
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                    <p className="font-semibold text-red-400 mb-2">
                      Imperfect Solutions ({generatedContent.solutions.imperfect.length})
                    </p>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {generatedContent.solutions.imperfect[0]?.content}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Key Check */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-400">
            <Info className="w-4 h-4 inline mr-1" />
            Make sure OPENAI_API_KEY is set in your .env file for AI generation to work.
            Template fallbacks will be used if the API is unavailable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestAIGeneration;