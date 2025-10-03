/**
 * TEACHER ANALYTICS DASHBOARD
 * AI-Powered insights using Azure GPT-4 for comprehensive teacher analytics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Brain, 
  Clock, 
  Award,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { teacherAnalyticsService, ClassInsights } from '../../services/teacherAnalyticsService';
import { useAuthContext } from '../../contexts/AuthContext';

interface TeacherAnalyticsDashboardProps {
  teacherId?: string;
  subject?: string;
  timeRange?: '1w' | '1m' | '3m';
}

export const TeacherAnalyticsDashboard: React.FC<TeacherAnalyticsDashboardProps> = ({
  teacherId,
  subject,
  timeRange = '1m'
}) => {
  const { user } = useAuthContext();
  const [analytics, setAnalytics] = useState<ClassInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [refreshing, setRefreshing] = useState(false);

  const currentTeacherId = teacherId || user?.id;

  useEffect(() => {
    if (currentTeacherId) {
      loadAnalytics();
    }
  }, [currentTeacherId, subject, selectedTimeRange]);

  const loadAnalytics = async () => {
    if (!currentTeacherId) return;

    setLoading(true);
    setError(null);

    try {
      // Use getClassInsights method which exists in the service
      const insights = await teacherAnalyticsService.getClassInsights(currentTeacherId);
      setAnalytics(insights);
    } catch (err) {
      console.error('Analytics loading error:', err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teacher-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
            <span>Generating AI-powered insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadAnalytics} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">AI-powered insights powered by Azure GPT-4</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value as '1w' | '1m' | '3m')}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="1w">Last Week</option>
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
          </select>
          <Button 
            onClick={refreshAnalytics} 
            disabled={refreshing} 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={exportAnalytics} 
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Class Performance - Blue gradient */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Class Performance</CardTitle>
            <Target className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(analytics.progress_trends?.weekly_progress || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-blue-100">
              Weekly progress rate
            </p>
          </CardContent>
        </Card>

        {/* Top Performers - Purple gradient */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-yellow-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics.student_spotlights?.top_performers?.length || 0}
            </div>
            <p className="text-xs text-purple-100">
              Students excelling
            </p>
          </CardContent>
        </Card>

        {/* Need Attention - Orange gradient */}
        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Need Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics.student_spotlights?.needs_attention?.length || 0}
            </div>
            <p className="text-xs text-orange-100">
              Students needing support
            </p>
          </CardContent>
        </Card>

        {/* Learning Velocity - Green gradient */}
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">Learning Velocity</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(analytics.progress_trends?.learning_velocity || 0).toFixed(1)}x
            </div>
            <p className="text-xs text-emerald-100">
              Pace of skill acquisition
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student Spotlights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Summary */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Brain className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  AI Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {analytics.summary}
                </p>
              </CardContent>
            </Card>

            {/* Key Findings */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                  Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.key_findings?.map((finding, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full mt-2 mr-3"></span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Skill Development Progress */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Skill Development Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.progress_trends?.skill_development && 
                  Object.entries(analytics.progress_trends.skill_development).map(([skill, progress]) => (
                    <div key={skill}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{skill}</span>
                        <span className="text-gray-700 dark:text-gray-300">{(progress * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={progress * 100} className="h-2" />
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performers */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700 dark:text-green-400">
                  <Award className="h-5 w-5 mr-2" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.student_spotlights?.top_performers?.map((student, index) => (
                    <div key={student.student_id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{student.student_name}</span>
                      <Badge variant="secondary" className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                        {(student.avg_accuracy * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Needs Attention */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.student_spotlights?.needs_attention?.map((student, index) => (
                    <div key={student.student_id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{student.student_name}</span>
                      <Badge className="bg-red-500 hover:bg-red-600 text-white">
                        {(student.avg_accuracy * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Improving Students */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Improving Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.student_spotlights?.improving_students?.map((student, index) => (
                    <div key={student.student_id} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{student.student_name}</span>
                      <Badge variant="secondary" className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                        +{student.learning_streak} days
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Immediate Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">Immediate Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.teaching_recommendations?.immediate_actions?.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-sm text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Curriculum Adjustments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">Curriculum Adjustments</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.teaching_recommendations?.curriculum_adjustments?.map((adjustment, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-sm text-gray-700">{adjustment}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Differentiation Strategies */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-purple-700">Differentiation Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.teaching_recommendations?.differentiation_strategies?.map((strategy, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-sm text-gray-700">{strategy}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {analytics.next_steps?.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-800 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimal Session Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Optimal Learning Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.engagement_insights?.optimal_session_times?.map((time, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                      {time}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Preferred Content Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Preferred Content Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.engagement_insights?.preferred_content_types?.map((type, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      {type}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Challenge Areas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Challenge Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.engagement_insights?.challenge_areas?.map((area, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
                      {area}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Attribution */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Brain className="h-4 w-4 mr-2 text-purple-600" />
            <span>Analytics powered by Azure GPT-4 • Real-time insights • Unlimited free usage</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAnalyticsDashboard;