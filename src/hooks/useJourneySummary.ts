/**
 * useJourneySummary Hook
 *
 * Fetches and transforms journey summary data from Supabase
 * for display in the JourneySummaryScreen component.
 *
 * Features:
 * - Real-time data loading from journey_summaries table
 * - Automatic data transformation to match UI interface
 * - Loading and error states
 * - Caching via service layer
 */

import { useState, useEffect } from 'react';
import {
  journeySummaryService,
  type DetailedJourneySummary
} from '../services/persistence/JourneySummaryService';

// ================================================================
// TYPES
// ================================================================

export interface ContainerSummary {
  container: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
  subject: string;
  skillName: string;
  skillId: string;
  completed: boolean;
  score: number;
  questionsAttempted: number;
  questionsCorrect: number;
  timeSpent: number; // seconds
  xpEarned: number;
  attempts: number;
}

export interface JourneySummaryData {
  studentName: string;
  gradeLevel: string;
  career: {
    id: string;
    name: string;
    icon: string;
  };
  companion: {
    id: string;
    name: string;
  };
  sessionId: string;
  startTime: string;
  endTime: string;
  totalTimeSpent: number; // seconds
  totalXPEarned: number;
  containerProgress: {
    LEARN: ContainerSummary[];
    EXPERIENCE: ContainerSummary[];
    DISCOVER: ContainerSummary[];
  };
  overallScore: number; // percentage
  skillsMastered: number;
  totalSkillsAttempted: number;
}

export interface UseJourneySummaryResult {
  data: JourneySummaryData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ================================================================
// HOOK
// ================================================================

/**
 * Fetch and transform journey summary data
 */
export function useJourneySummary(sessionId: string): UseJourneySummaryResult {
  const [data, setData] = useState<JourneySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching journey summary:', sessionId);

      // Fetch detailed summary from database
      const { summary, error: fetchError } = await journeySummaryService.getDetailedJourneySummary(
        sessionId
      );

      if (fetchError) {
        throw new Error(fetchError);
      }

      if (!summary) {
        throw new Error('Journey summary not found');
      }

      // Transform to UI format
      const transformed = transformToUIFormat(summary);
      setData(transformed);

      console.log('✅ Journey summary loaded successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load journey summary';
      console.error('❌ Error loading journey summary:', errorMessage);
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// ================================================================
// DATA TRANSFORMATION
// ================================================================

/**
 * Transform database format to UI format
 */
function transformToUIFormat(summary: DetailedJourneySummary): JourneySummaryData {
  // Transform LEARN subjects
  const learnProgress: ContainerSummary[] = summary.learnSubjects.map(subject => ({
    container: 'LEARN' as const,
    subject: subject.subject,
    skillName: subject.skillName,
    skillId: subject.skillId,
    completed: subject.completed,
    score: subject.score,
    questionsAttempted: subject.questionsAttempted,
    questionsCorrect: subject.questionsCorrect,
    timeSpent: subject.timeSpent,
    xpEarned: subject.xpEarned,
    attempts: 1 // Not tracked in DB, default to 1
  }));

  // Transform EXPERIENCE subjects
  const experienceProgress: ContainerSummary[] = summary.experienceSubjects.map(subject => ({
    container: 'EXPERIENCE' as const,
    subject: subject.subject,
    skillName: subject.skillName,
    skillId: subject.skillId,
    completed: subject.completed,
    score: subject.score,
    questionsAttempted: subject.questionsAttempted,
    questionsCorrect: subject.questionsCorrect,
    timeSpent: subject.timeSpent,
    xpEarned: subject.xpEarned,
    attempts: 1
  }));

  // Transform DISCOVER subjects
  const discoverProgress: ContainerSummary[] = summary.discoverSubjects.map(subject => ({
    container: 'DISCOVER' as const,
    subject: subject.subject,
    skillName: subject.skillName,
    skillId: subject.skillId,
    completed: subject.completed,
    score: subject.score,
    questionsAttempted: subject.questionsAttempted,
    questionsCorrect: subject.questionsCorrect,
    timeSpent: subject.timeSpent,
    xpEarned: subject.xpEarned,
    attempts: 1
  }));

  // Calculate metrics
  const allSubjects = [...learnProgress, ...experienceProgress, ...discoverProgress];
  const skillsMastered = allSubjects.filter(s => s.completed && s.score >= 80).length;
  const totalSkillsAttempted = allSubjects.length;

  return {
    studentName: summary.studentName,
    gradeLevel: summary.gradeLevel,
    career: {
      id: summary.careerId || 'unknown',
      name: summary.careerName,
      icon: summary.careerIcon || '👨‍💼'
    },
    companion: {
      id: summary.companionId || 'unknown',
      name: summary.companionName
    },
    sessionId: summary.sessionId,
    startTime: summary.startTime,
    endTime: summary.endTime || new Date().toISOString(),
    totalTimeSpent: summary.totalTimeSpent,
    totalXPEarned: summary.totalXpEarned,
    containerProgress: {
      LEARN: learnProgress,
      EXPERIENCE: experienceProgress,
      DISCOVER: discoverProgress
    },
    overallScore: Math.round(summary.overallScore),
    skillsMastered,
    totalSkillsAttempted
  };
}

/**
 * Build journey summary data from session ID
 * (Alternative approach - builds from container_sessions directly)
 */
export async function buildJourneySummaryData(sessionId: string): Promise<JourneySummaryData | null> {
  try {
    console.log('🔨 Building journey summary from session:', sessionId);

    // This would query container_sessions and build the summary
    // For now, we'll use the getDetailedJourneySummary approach
    const { summary, error } = await journeySummaryService.getDetailedJourneySummary(sessionId);

    if (error || !summary) {
      console.error('Error building summary:', error);
      return null;
    }

    return transformToUIFormat(summary);

  } catch (error) {
    console.error('Error building journey summary:', error);
    return null;
  }
}
