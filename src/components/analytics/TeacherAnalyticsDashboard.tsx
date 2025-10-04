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
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

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
      <Card className="w-full" style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" style={{ color: '#9333ea' }} />
            <span style={{ color: 'var(--dashboard-text-primary)' }}>Generating AI-powered insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full" style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" style={{ color: '#ef4444' }} />
            <p className="mb-4" style={{ color: '#ef4444' }}>{error}</p>
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
      <Card className="w-full" style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--dashboard-text-tertiary)' }} />
            <p style={{ color: 'var(--dashboard-text-secondary)' }}>No analytics data available</p>
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--dashboard-text-primary)' }}>Teacher Analytics Dashboard</h1>
          <p className="mt-1" style={{ color: 'var(--dashboard-text-secondary)' }}>AI-powered insights powered by Azure GPT-4</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as '1w' | '1m' | '3m')}
            className="rounded px-3 py-2"
            style={{
              border: '1px solid var(--dashboard-border-primary)',
              background: 'var(--dashboard-bg-elevated)',
              color: 'var(--dashboard-text-primary)'
            }}
          >
            <option value="1w">Last Week</option>
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
          </select>
          <Button
            onClick={refreshAnalytics}
            disabled={refreshing}
            style={{ background: '#2563eb', color: '#ffffff', border: '0' }}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={exportAnalytics}
            style={{ background: '#10b981', color: '#ffffff', border: '0' }}
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
        <Card style={{ background: '#2563eb', color: '#ffffff', border: '0', boxShadow: 'var(--shadow-lg)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: '#dbeafe' }}>Class Performance</CardTitle>
            <Target className="h-4 w-4" style={{ color: '#dbeafe' }} />
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#ffffff' }}>
              {(analytics.progress_trends?.weekly_progress || 0).toFixed(1)}%
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: '#dbeafe' }}>
              Weekly progress rate
            </p>
          </CardContent>
        </Card>

        {/* Top Performers - Purple gradient */}
        <Card style={{ background: '#9333ea', color: '#ffffff', border: '0', boxShadow: 'var(--shadow-lg)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: '#f3e8ff' }}>Top Performers</CardTitle>
            <Award className="h-4 w-4" style={{ color: '#fef3c7' }} />
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#ffffff' }}>
              {analytics.student_spotlights?.top_performers?.length || 0}
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: '#f3e8ff' }}>
              Students excelling
            </p>
          </CardContent>
        </Card>

        {/* Need Attention - Orange gradient */}
        <Card style={{ background: '#f97316', color: '#ffffff', border: '0', boxShadow: 'var(--shadow-lg)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: '#fed7aa' }}>Need Attention</CardTitle>
            <AlertTriangle className="h-4 w-4" style={{ color: '#fed7aa' }} />
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#ffffff' }}>
              {analytics.student_spotlights?.needs_attention?.length || 0}
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: '#fed7aa' }}>
              Students needing support
            </p>
          </CardContent>
        </Card>

        {/* Learning Velocity - Green gradient */}
        <Card style={{ background: '#10b981', color: '#ffffff', border: '0', boxShadow: 'var(--shadow-lg)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: '#d1fae5' }}>Learning Velocity</CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: '#d1fae5' }} />
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#ffffff' }}>
              {(analytics.progress_trends?.learning_velocity || 0).toFixed(1)}x
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: '#d1fae5' }}>
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
            <Card style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: 'var(--dashboard-text-primary)' }}>
                  <Brain className="h-5 w-5 mr-2" style={{ color: '#9333ea' }} />
                  AI Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed" style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
                  {analytics.summary}
                </p>
              </CardContent>
            </Card>

            {/* Key Findings */}
            <Card style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: 'var(--dashboard-text-primary)' }}>
                  <Lightbulb className="h-5 w-5 mr-2" style={{ color: '#eab308' }} />
                  Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.key_findings?.map((finding, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3" style={{ background: '#9333ea' }}></span>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Skill Development Progress */}
          <Card style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--dashboard-text-primary)' }}>Skill Development Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.progress_trends?.skill_development &&
                  Object.entries(analytics.progress_trends.skill_development).map(([skill, progress]) => (
                    <div key={skill}>
                      <div className="flex justify-between mb-1" style={{ fontSize: 'var(--text-sm)' }}>
                        <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{skill}</span>
                        <span style={{ color: 'var(--dashboard-text-secondary)' }}>{(progress * 100).toFixed(1)}%</span>
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
            <Card style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#16a34a' }}>
                  <Award className="h-5 w-5 mr-2" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.student_spotlights?.top_performers?.map((student, index) => (
                    <div key={student.student_id} className="flex items-center justify-between p-2 rounded" style={{ background: '#dcfce7' }}>
                      <span style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>{student.student_name}</span>
                      <Badge variant="secondary" style={{ background: '#d1fae5', color: '#065f46' }}>
                        {(student.avg_accuracy * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Needs Attention */}
            <Card style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#ef4444' }}>
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.student_spotlights?.needs_attention?.map((student, index) => (
                    <div key={student.student_id} className="flex items-center justify-between p-2 rounded" style={{ background: '#fee2e2' }}>
                      <span style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>{student.student_name}</span>
                      <Badge style={{ background: '#ef4444', color: '#ffffff' }}>
                        {(student.avg_accuracy * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Improving Students */}
            <Card style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#1d4ed8' }}>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Improving Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.student_spotlights?.improving_students?.map((student, index) => (
                    <div key={student.student_id} className="flex items-center justify-between p-2 rounded" style={{ background: '#dbeafe' }}>
                      <span style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>{student.student_name}</span>
                      <Badge variant="secondary" style={{ background: '#dbeafe', color: '#1e40af' }}>
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
            <Card style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
              <CardHeader>
                <CardTitle style={{ color: '#991b1b' }}>Immediate Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.teaching_recommendations?.immediate_actions?.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3" style={{ background: '#ef4444' }}></span>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Curriculum Adjustments */}
            <Card style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
              <CardHeader>
                <CardTitle style={{ color: '#1d4ed8' }}>Curriculum Adjustments</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.teaching_recommendations?.curriculum_adjustments?.map((adjustment, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3" style={{ background: '#2563eb' }}></span>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>{adjustment}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Differentiation Strategies */}
            <Card className="lg:col-span-2" style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
              <CardHeader>
                <CardTitle style={{ color: '#6b21a8' }}>Differentiation Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.teaching_recommendations?.differentiation_strategies?.map((strategy, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3" style={{ background: '#9333ea' }}></span>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>{strategy}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--dashboard-text-primary)' }}>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {analytics.next_steps?.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 mr-3" style={{ background: '#f3e8ff', color: '#6b21a8', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)' }}>
                      {index + 1}
                    </span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimal Session Times */}
            <Card style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: 'var(--dashboard-text-primary)' }}>
                  <Clock className="h-5 w-5 mr-2" style={{ color: '#22c55e' }} />
                  Optimal Learning Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.engagement_insights?.optimal_session_times?.map((time, index) => (
                    <li key={index} className="flex items-center" style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
                      <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#22c55e' }}></span>
                      {time}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Preferred Content Types */}
            <Card style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: 'var(--dashboard-text-primary)' }}>
                  <Users className="h-5 w-5 mr-2" style={{ color: '#2563eb' }} />
                  Preferred Content Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.engagement_insights?.preferred_content_types?.map((type, index) => (
                    <li key={index} className="flex items-center" style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
                      <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#2563eb' }}></span>
                      {type}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Challenge Areas */}
            <Card className="lg:col-span-2" style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: 'var(--dashboard-text-primary)' }}>
                  <AlertTriangle className="h-5 w-5 mr-2" style={{ color: '#f97316' }} />
                  Challenge Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.engagement_insights?.challenge_areas?.map((area, index) => (
                    <li key={index} className="flex items-center" style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
                      <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#f97316' }}></span>
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
      <Card style={{ background: 'var(--dashboard-bg-elevated)', border: '1px solid var(--dashboard-border-primary)' }}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center" style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>
            <Brain className="h-4 w-4 mr-2" style={{ color: '#9333ea' }} />
            <span>Analytics powered by Azure GPT-4 • Real-time insights • Unlimited free usage</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAnalyticsDashboard;