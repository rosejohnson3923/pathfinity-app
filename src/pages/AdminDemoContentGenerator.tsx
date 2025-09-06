/**
 * Admin Demo Content Generator
 * 
 * Generates and manages premium DALL-E content for all demo users
 * Showcases P-SaaS (Private School as a Service) quality
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { premiumDemoContentV2 as premiumDemoContent } from '../services/PremiumDemoContentServiceV2';
import { AlertCircle, CheckCircle, DollarSign, Image, Loader, RefreshCw, Trash2, Users } from 'lucide-react';

interface GenerationStatus {
  userId: string;
  userName: string;
  subject: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  message?: string;
  cost?: number;
  images?: number;
}

export const AdminDemoContentGenerator: React.FC = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Demo users and subjects
  const demoUsers = [
    { id: 'sam-k', name: 'Sam Brown', grade: 'Kindergarten' },
    { id: 'alex-1', name: 'Alex Davis', grade: 'Grade 1' },
    { id: 'jordan-7', name: 'Jordan Smith', grade: 'Grade 7' },
    { id: 'taylor-10', name: 'Taylor Johnson', grade: 'Grade 10' }
  ];

  const subjects = ['Math', 'ELA', 'Science', 'SocialStudies'];

  // Only allow admins
  const isAuthorized = user?.role === 'product_admin' || 
                      user?.role === 'district_admin' ||
                      user?.email?.includes('@pathfinity.com') ||
                      process.env.NODE_ENV === 'development';

  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = () => {
    const stats = premiumDemoContent.getCacheStats();
    setCacheStats(stats);
  };

  const generateAllContent = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    // Initialize status for all combinations
    const statusList: GenerationStatus[] = [];
    for (const demoUser of demoUsers) {
      for (const subject of subjects) {
        statusList.push({
          userId: demoUser.id,
          userName: demoUser.name,
          subject,
          status: 'pending'
        });
      }
    }
    setGenerationStatus(statusList);

    try {
      let totalGenerated = 0;
      let totalCost = 0;

      for (let i = 0; i < statusList.length; i++) {
        const item = statusList[i];
        
        // Update status to generating
        statusList[i].status = 'generating';
        setGenerationStatus([...statusList]);

        try {
          // Generate content
          const lesson = await premiumDemoContent.getFullLesson(item.userId, item.subject);
          
          if (lesson) {
            statusList[i].status = 'completed';
            statusList[i].cost = lesson.estimatedCost;
            statusList[i].images = lesson.totalImages;
            statusList[i].message = `Generated ${lesson.totalImages} images`;
            totalGenerated++;
            totalCost += lesson.estimatedCost;
          } else {
            statusList[i].status = 'error';
            statusList[i].message = 'Failed to generate';
          }
        } catch (err) {
          statusList[i].status = 'error';
          statusList[i].message = err instanceof Error ? err.message : 'Unknown error';
        }

        setGenerationStatus([...statusList]);

        // Add delay between generations to avoid rate limiting
        if (i < statusList.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      setSuccess(`✅ Generated ${totalGenerated} lessons with premium DALL-E content. Total cost: $${totalCost.toFixed(2)}`);
      loadCacheStats();
    } catch (err) {
      setError(`Failed to generate content: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearCache = () => {
    if (window.confirm('Are you sure you want to clear all cached demo content? This will require regeneration.')) {
      premiumDemoContent.clearCache();
      setCacheStats(null);
      setSuccess('Cache cleared successfully');
      setGenerationStatus([]);
      loadCacheStats();
    }
  };

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Image className="w-8 h-8 text-purple-600" />
                Premium Demo Content Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Generate 100% DALL-E enhanced content for P-SaaS demo experience
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">P-SaaS Value</div>
              <div className="text-2xl font-bold text-purple-600">$50,000 → $5,000</div>
              <div className="text-xs text-gray-500">Private school quality at 1/10th cost</div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">100%</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">DALL-E Visuals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">K-12</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">All Grades Premium</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">$1.44</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">One-time Investment</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cache Statistics */}
        {cacheStats && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Cache Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Lessons</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{cacheStats.totalLessons}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Images</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{cacheStats.totalImages}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Cost</div>
                <div className="text-xl font-bold text-green-600">${cacheStats.totalCost.toFixed(2)}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">Cost/Demo</div>
                <div className="text-xl font-bold text-blue-600">${cacheStats.costPerDemo.toFixed(2)}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">Break-even</div>
                <div className="text-xl font-bold text-purple-600">{cacheStats.breakevenCustomers} customer</div>
              </div>
            </div>

            {/* By User Stats */}
            {cacheStats.byUser && Object.keys(cacheStats.byUser).length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">By User:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(cacheStats.byUser).map(([userId, stats]: [string, any]) => (
                    <div key={userId} className="bg-gray-50 dark:bg-gray-700 rounded px-3 py-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">{userId}</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {stats.lessons} lessons • ${stats.cost.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={generateAllContent}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating Premium Content...
                </>
              ) : (
                <>
                  <Image className="w-5 h-5" />
                  Generate All Premium Content
                </>
              )}
            </button>

            <button
              onClick={loadCacheStats}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Stats
            </button>

            <button
              onClick={clearCache}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              Clear Cache
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}
        </div>

        {/* Generation Progress */}
        {generationStatus.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Generation Progress</h2>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {generationStatus.map((item, index) => (
                <div 
                  key={`${item.userId}-${item.subject}`}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20' :
                    item.status === 'generating' ? 'bg-blue-50 dark:bg-blue-900/20' :
                    item.status === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                    'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {item.userName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.subject}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {item.images && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.images} images
                      </div>
                    )}
                    {item.cost && (
                      <div className="text-sm font-semibold text-green-600">
                        ${item.cost.toFixed(2)}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {item.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {item.status === 'generating' && <Loader className="w-5 h-5 text-blue-600 animate-spin" />}
                      {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                      {item.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                      <span className={`text-sm font-medium ${
                        item.status === 'completed' ? 'text-green-600' :
                        item.status === 'generating' ? 'text-blue-600' :
                        item.status === 'error' ? 'text-red-600' :
                        'text-gray-500'
                      }`}>
                        {item.status === 'completed' ? 'Completed' :
                         item.status === 'generating' ? 'Generating...' :
                         item.status === 'error' ? 'Error' :
                         'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Progress: {generationStatus.filter(s => s.status === 'completed').length} / {generationStatus.length}
                </div>
                <div className="text-sm font-semibold text-purple-600">
                  Total Cost: ${generationStatus.reduce((sum, s) => sum + (s.cost || 0), 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-400">
            <li>Click "Generate All Premium Content" to create DALL-E visuals for all demo users</li>
            <li>Generation includes automatic rate limiting protection (3-30s delays)</li>
            <li>Content uses URL caching (90% smaller than base64)</li>
            <li>Total cost: ~$1.44 for all users (one-time)</li>
            <li>Break-even: Just 1 P-SaaS customer ($5,000/year)</li>
          </ol>
          <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <div className="text-sm font-semibold text-purple-900 dark:text-purple-300">💎 Premium Quality Promise:</div>
            <div className="text-sm text-purple-800 dark:text-purple-400 mt-1">
              Every grade level gets professional DALL-E visuals - from Kindergarten counting with Pixar-quality renders 
              to Grade 10 quadratic functions with corporate presentations. This is Private School as a Service.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};