/**
 * Discovered Live! - Test Page
 * Standalone test page to preview and test the Discovered Live! game
 *
 * Access: /discovered-live-test
 *
 * Features:
 * - Launch game with current user or mock data
 * - Configure test parameters (grade, career)
 * - View game stats after completion
 * - Reset and replay
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DiscoveredLiveContainer } from '../components/discovered-live';
import { Play, Settings, RotateCcw, User, GraduationCap, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const DiscoveredLiveTestPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [studentProfileId, setStudentProfileId] = useState<string | null>(null);

  // Test configuration
  const [showGame, setShowGame] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [testConfig, setTestConfig] = useState({
    studentName: 'Test Student',
    gradeCategory: 'elementary' as 'elementary' | 'middle' | 'high',
    userCareerCode: 'chef',
    useMockData: false
  });

  // Game stats tracking
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [lastGameStats, setLastGameStats] = useState<string | null>(null);

  // Fetch student profile ID when user logs in
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!user || testConfig.useMockData) {
        setStudentProfileId(null);
        return;
      }

      try {
        const client = await supabase();
        const { data, error } = await client
          .from('student_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching student profile:', error);
          setStudentProfileId(null);
        } else {
          setStudentProfileId(data?.id || null);
        }
      } catch (err) {
        console.error('Failed to fetch student profile:', err);
        setStudentProfileId(null);
      }
    };

    fetchStudentProfile();
  }, [user, testConfig.useMockData]);

  const handleStartGame = () => {
    // Use actual user if logged in, otherwise use test config
    if (user && !testConfig.useMockData) {
      setTestConfig(prev => ({
        ...prev,
        studentName: user.email?.split('@')[0] || 'Student',
      }));
    }
    setShowGame(true);
  };

  const handleGameComplete = () => {
    setShowGame(false);
    setGamesPlayed(prev => prev + 1);
    setLastGameStats(`Game completed at ${new Date().toLocaleTimeString()}`);
  };

  const handleReset = () => {
    setShowGame(false);
    setGamesPlayed(0);
    setLastGameStats(null);
  };

  // Get actual user info or use test config
  // TEMPORARY: Hardcoded student ID for Sam(K) while we debug RLS
  const studentId = testConfig.useMockData ? 'test-student-id' : (studentProfileId || '7b2e3b48-5fc0-4ed1-8d84-ec906289dc23');
  const studentName = testConfig.useMockData ? testConfig.studentName : (user?.email?.split('@')[0] || testConfig.studentName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <img
                  src="/images/DiscoveredLive/DL Logo.png"
                  alt="Discovered Live!"
                  className="h-10 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                Discovered Live! Test Page
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Test and preview the Discovered Live! bingo game
              </p>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5" />
              {showConfig ? 'Hide Config' : 'Show Config'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {authLoading ? 'Loading...' : user ? 'Logged In' : 'Test Mode'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {authLoading ? 'Checking authentication...' : user ? `Playing as: ${studentName}` : 'Using mock data'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {gamesPlayed}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Games Played</div>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {testConfig.gradeCategory}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Grade Level</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {testConfig.userCareerCode}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">User Career</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-sm font-bold text-green-600 dark:text-green-400">
                  {lastGameStats || 'No games yet'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Last Game</div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <div className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Test Configuration
              </h3>

              <div className="space-y-4">
                {/* Use Mock Data Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <label className="font-semibold text-gray-900 dark:text-white">Use Mock Data</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Test without being logged in
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={testConfig.useMockData}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, useMockData: e.target.checked }))}
                    className="w-6 h-6 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Student Name */}
                {testConfig.useMockData && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Student Name
                    </label>
                    <input
                      type="text"
                      value={testConfig.studentName}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, studentName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter student name"
                    />
                  </div>
                )}

                {/* Grade Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Grade Category
                  </label>
                  <select
                    value={testConfig.gradeCategory}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, gradeCategory: e.target.value as 'elementary' | 'middle' | 'high' }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="elementary">Elementary (K-5)</option>
                    <option value="middle">Middle School (6-8)</option>
                    <option value="high">High School (9-12)</option>
                  </select>
                </div>

                {/* User Career */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    User Career (appears on bingo grid)
                  </label>
                  <input
                    type="text"
                    value={testConfig.userCareerCode}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, userCareerCode: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="chef, teacher, doctor, etc."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Must match a valid career_code in the database
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              {/* Start Game Button */}
              <button
                onClick={handleStartGame}
                disabled={showGame || (user && !testConfig.useMockData && !studentProfileId)}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all
                  ${showGame || (user && !testConfig.useMockData && !studentProfileId)
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105'
                  }
                `}
              >
                <Play className="w-6 h-6" fill={showGame ? 'none' : 'currentColor'} />
                {showGame ? 'Game In Progress...' : (user && !testConfig.useMockData && !studentProfileId) ? 'Loading Profile...' : 'Start New Game'}
              </button>

              {/* Reset Button */}
              {gamesPlayed > 0 && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-lg transition-all hover:scale-105"
                >
                  <RotateCcw className="w-6 h-6" />
                  Reset Stats
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Testing Instructions
            </h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <p>
                  <strong>Database Setup:</strong> Make sure you've run the migration (<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">039_discovered_live_game_tables.sql</code>)
                  and optionally the seed data (<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">039b_career_clues_seed.sql</code>) in Supabase.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <p>
                  <strong>User Career:</strong> The career code you enter must exist in the <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">career_paths</code> table. Common examples: chef, teacher, doctor, nurse, firefighter.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <p>
                  <strong>Game Flow:</strong> The game will show an intro screen, then present 12 career clues. Answer correctly to unlock bingo squares. Complete rows, columns, or diagonals for bonus XP!
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <p>
                  <strong>Testing Tips:</strong> Try different grade categories to see varying difficulty. Use the config panel to test different scenarios. Game progress is saved to the database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Container (shows when game is active) */}
      {showGame && (
        <DiscoveredLiveContainer
          studentId={studentId}
          studentName={studentName}
          gradeCategory={testConfig.gradeCategory}
          userCareerCode={testConfig.userCareerCode}
          onComplete={handleGameComplete}
        />
      )}
    </div>
  );
};

export default DiscoveredLiveTestPage;
