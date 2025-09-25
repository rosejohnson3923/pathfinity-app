# Journey Persistence Implementation Plan

## Overview
This document provides a detailed, step-by-step implementation plan for the Journey Persistence Architecture, with specific attention to using our design system, tokens, and theme support.

## Design System Integration Requirements

### Color Tokens to Use
```css
/* Primary Actions */
--color-primary: var(--purple-600)
--color-primary-hover: var(--purple-700)

/* Container-Specific Colors */
--color-learn: var(--purple-500)
--color-experience: var(--teal-500)
--color-discover: var(--magenta-500)

/* Status Colors */
--color-success: var(--green-500)
--color-warning: var(--yellow-500)
--color-error: var(--red-500)

/* Light/Dark Theme Support */
--color-bg-primary: light(--gray-50) / dark(--gray-900)
--color-bg-secondary: light(--white) / dark(--gray-800)
--color-text-primary: light(--gray-900) / dark(--gray-50)
```

### Component Classes
```css
/* From design-system/components/base.css */
.btn-primary
.btn-secondary
.btn-ghost
.card
.card-interactive
.modal-overlay
.modal-content
```

---

## Phase 1: Database Infrastructure (Week 1)

### 1.1 Create Database Schema
**File:** `/src/database/migrations/005_learning_sessions.sql`

```sql
-- Learning Sessions Table
CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tenant_id TEXT,

  -- Session Identity
  career_id TEXT NOT NULL,
  career_name TEXT NOT NULL,
  companion_id TEXT NOT NULL,
  companion_name TEXT NOT NULL,

  -- Session Lifecycle
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,

  -- Progress Tracking
  current_container TEXT CHECK (current_container IN ('learn', 'experience', 'discover')),
  current_subject TEXT CHECK (current_subject IN ('math', 'ela', 'science', 'social_studies')),

  -- Container Progress JSON Structure:
  -- {
  --   "learn": {
  --     "math": { "completed": true, "score": 95, "time_spent": 1200 },
  --     "ela": { "completed": true, "score": 88, "time_spent": 1100 },
  --     "science": { "completed": false, "score": 0, "time_spent": 600 },
  --     "social_studies": { "completed": false, "score": 0, "time_spent": 0 }
  --   },
  --   "experience": { ... },
  --   "discover": { ... }
  -- }
  container_progress JSONB DEFAULT '{}',

  -- Narrative Caching
  master_narrative_cache TEXT,
  narrative_generated_at TIMESTAMP WITH TIME ZONE,

  -- Analytics Flags
  is_demo BOOLEAN DEFAULT false,
  session_source TEXT CHECK (session_source IN ('web', 'mobile', 'tablet')),

  -- Metadata
  session_metadata JSONB DEFAULT '{}',

  -- Indexes
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX idx_sessions_user_active ON learning_sessions(user_id, is_active);
CREATE INDEX idx_sessions_last_activity ON learning_sessions(last_activity) WHERE is_active = true;
CREATE INDEX idx_sessions_demo ON learning_sessions(is_demo) WHERE is_demo = true;
CREATE INDEX idx_sessions_container ON learning_sessions(current_container, current_subject);

-- Session Analytics Table
CREATE TABLE IF NOT EXISTS session_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_session ON session_analytics(session_id);
CREATE INDEX idx_analytics_event ON session_analytics(event_type);
```

### 1.2 Create Session API Endpoints
**File:** `/src/api/sessions/sessionEndpoints.ts`

```typescript
import { Request, Response } from 'express';
import { supabase } from '../../lib/supabase';

// GET /api/sessions/active
export const getActiveSession = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('learning_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error) return res.status(404).json({ session: null });

  // Check if session is still valid (8 hour timeout)
  const lastActivity = new Date(data.last_activity);
  const now = new Date();
  const hoursInactive = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

  if (hoursInactive > 8) {
    // Expire the session
    await supabase
      .from('learning_sessions')
      .update({ is_active: false, ended_at: now })
      .eq('id', data.id);

    return res.json({ session: null });
  }

  return res.json({ session: data });
};

// POST /api/sessions/create
export const createSession = async (req: Request, res: Response) => {
  const { userId, careerId, careerName, companionId, companionName, isDemo } = req.body;

  // Deactivate any existing sessions
  await supabase
    .from('learning_sessions')
    .update({ is_active: false, ended_at: new Date() })
    .eq('user_id', userId)
    .eq('is_active', true);

  // Create new session
  const { data, error } = await supabase
    .from('learning_sessions')
    .insert({
      user_id: userId,
      career_id: careerId,
      career_name: careerName,
      companion_id: companionId,
      companion_name: companionName,
      is_demo: isDemo,
      current_container: 'learn',
      current_subject: 'math',
      container_progress: {
        learn: {
          math: { completed: false, score: 0, time_spent: 0 },
          ela: { completed: false, score: 0, time_spent: 0 },
          science: { completed: false, score: 0, time_spent: 0 },
          social_studies: { completed: false, score: 0, time_spent: 0 }
        }
      }
    })
    .select()
    .single();

  return res.json({ session: data, error });
};

// PUT /api/sessions/:sessionId/progress
export const updateProgress = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { container, subject, completed, score, timeSpent } = req.body;

  // Get current progress
  const { data: session } = await supabase
    .from('learning_sessions')
    .select('container_progress')
    .eq('id', sessionId)
    .single();

  // Update progress
  const progress = session.container_progress;
  if (!progress[container]) progress[container] = {};

  progress[container][subject] = {
    completed,
    score,
    time_spent: timeSpent
  };

  // Check if container is complete
  const containerComplete = ['math', 'ela', 'science', 'social_studies']
    .every(subj => progress[container][subj]?.completed);

  let nextContainer = container;
  if (containerComplete) {
    nextContainer = container === 'learn' ? 'experience' :
                    container === 'experience' ? 'discover' : 'discover';
  }

  // Update session
  const { data, error } = await supabase
    .from('learning_sessions')
    .update({
      container_progress: progress,
      current_container: nextContainer,
      current_subject: containerComplete ? 'math' : subject,
      last_activity: new Date()
    })
    .eq('id', sessionId)
    .select()
    .single();

  return res.json({ session: data, error });
};
```

---

## Phase 2: SessionLearningContextManager (Week 1)

### 2.1 Create SessionLearningContextManager
**File:** `/src/services/content/SessionLearningContextManager.ts`

```typescript
import { supabase } from '../../lib/supabase';
import { Skill, Career, Subject, StudentProfile, Grade } from '../../types';

export interface SessionLearningContext {
  readonly sessionId: string;
  readonly userId: string;
  readonly career: Career;
  readonly companion: {
    id: string;
    name: string;
    personality: string;
  };
  readonly currentContainer: 'learn' | 'experience' | 'discover';
  readonly currentSubject: Subject;
  readonly startedAt: Date;
  readonly lastActivity: Date;
  readonly isDemo: boolean;
  readonly masterNarrativeCache?: string;
}

export class SessionLearningContextManager {
  private static instance: SessionLearningContextManager;
  private currentContext: SessionLearningContext | null = null;

  private constructor() {}

  public static getInstance(): SessionLearningContextManager {
    if (!SessionLearningContextManager.instance) {
      SessionLearningContextManager.instance = new SessionLearningContextManager();
    }
    return SessionLearningContextManager.instance;
  }

  /**
   * Load or create session context from database
   */
  public async loadOrCreateSession(userId: string): Promise<SessionLearningContext | null> {
    try {
      // Check for active session
      const response = await fetch(`/api/sessions/active/${userId}`);
      const { session } = await response.json();

      if (session) {
        this.currentContext = this.mapSessionToContext(session);
        return this.currentContext;
      }

      return null; // No active session, user needs to choose career/companion
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  /**
   * Create new session with career/companion choice
   */
  public async createSession(
    userId: string,
    career: Career,
    companion: any,
    isDemo: boolean = false
  ): Promise<SessionLearningContext> {
    const response = await fetch('/api/sessions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        careerId: career.id,
        careerName: career.name,
        companionId: companion.id,
        companionName: companion.name,
        isDemo
      })
    });

    const { session } = await response.json();
    this.currentContext = this.mapSessionToContext(session);
    return this.currentContext!;
  }

  /**
   * Update session progress
   */
  public async updateProgress(
    subject: Subject,
    completed: boolean,
    score: number,
    timeSpent: number
  ): Promise<void> {
    if (!this.currentContext) return;

    await fetch(`/api/sessions/${this.currentContext.sessionId}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        container: this.currentContext.currentContainer,
        subject,
        completed,
        score,
        timeSpent
      })
    });

    // Update local context
    await this.loadOrCreateSession(this.currentContext.userId);
  }

  /**
   * Cache Master Narrative for Learn container
   */
  public async cacheMasterNarrative(narrative: string): Promise<void> {
    if (!this.currentContext) return;

    await supabase
      .from('learning_sessions')
      .update({
        master_narrative_cache: narrative,
        narrative_generated_at: new Date()
      })
      .eq('id', this.currentContext.sessionId);

    this.currentContext = {
      ...this.currentContext,
      masterNarrativeCache: narrative
    };
  }

  /**
   * Get current session context
   */
  public getContext(): SessionLearningContext | null {
    return this.currentContext;
  }

  /**
   * Clear session (logout)
   */
  public async clearSession(): Promise<void> {
    if (this.currentContext) {
      await supabase
        .from('learning_sessions')
        .update({
          is_active: false,
          ended_at: new Date()
        })
        .eq('id', this.currentContext.sessionId);
    }

    this.currentContext = null;
  }

  private mapSessionToContext(session: any): SessionLearningContext {
    return {
      sessionId: session.id,
      userId: session.user_id,
      career: {
        id: session.career_id,
        name: session.career_name,
        // ... other career fields
      },
      companion: {
        id: session.companion_id,
        name: session.companion_name,
        personality: session.companion_personality || 'encouraging'
      },
      currentContainer: session.current_container,
      currentSubject: session.current_subject,
      startedAt: new Date(session.started_at),
      lastActivity: new Date(session.last_activity),
      isDemo: session.is_demo,
      masterNarrativeCache: session.master_narrative_cache
    };
  }
}

// Export singleton instance
export const sessionManager = SessionLearningContextManager.getInstance();
```

---

## Phase 3: Welcome Back UI Components (Week 2)

### 3.1 Create WelcomeBackModal Component
**File:** `/src/components/modals/WelcomeBackModal.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionManager } from '../../services/content/SessionLearningContextManager';
import { useAuthContext } from '../../contexts/AuthContext';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import '../../design-system/index.css';

interface WelcomeBackModalProps {
  onContinue: () => void;
  onChooseNew: () => void;
  session: any;
}

export const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  onContinue,
  onChooseNew,
  session
}) => {
  const { user } = useAuthContext();
  const [showModal, setShowModal] = useState(true);

  // Calculate progress
  const calculateProgress = () => {
    const progress = session.container_progress;
    const containers = ['learn', 'experience', 'discover'];
    let totalSubjects = 0;
    let completedSubjects = 0;

    containers.forEach(container => {
      if (progress[container]) {
        ['math', 'ela', 'science', 'social_studies'].forEach(subject => {
          totalSubjects++;
          if (progress[container][subject]?.completed) {
            completedSubjects++;
          }
        });
      }
    });

    return {
      percentage: Math.round((completedSubjects / 12) * 100),
      currentContainer: session.current_container,
      currentSubject: session.current_subject
    };
  };

  const { percentage, currentContainer, currentSubject } = calculateProgress();

  // Determine if we're in Learn container
  const isInLearnContainer = currentContainer === 'learn';
  const hasLearnProgress = session.container_progress?.learn &&
    Object.values(session.container_progress.learn).some((s: any) => s.completed);

  return (
    <AnimatePresence>
      {showModal && (
        <div className="modal-overlay">
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Header with Avatar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={`/images/companions/${session.companion_id}.png`}
                    alt={session.companion_name}
                    className="w-16 h-16 rounded-full border-3 border-purple-500"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user?.full_name || 'Student'}!
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    with {session.companion_name} as a {session.career_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Journey Progress
                </span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  currentContainer === 'learn' ? 'bg-purple-500' :
                  currentContainer === 'experience' ? 'bg-teal-500' :
                  'bg-magenta-500'
                }`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Currently in:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                  {currentContainer} → {currentSubject.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Continue Button */}
              <button
                onClick={onContinue}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <span>Continue as {session.career_name}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Choose New Button - disabled if in Learn with progress */}
              {!isInLearnContainer || !hasLearnProgress ? (
                <button
                  onClick={onChooseNew}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Choose New Adventure</span>
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Complete Learn to unlock new career choices
                  </p>
                </div>
              )}
            </div>

            {/* Info Text */}
            {isInLearnContainer && hasLearnProgress && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  💡 Tip: Complete your Learn journey to switch careers for Experience & Discover!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
```

### 3.2 Create Start Over Confirmation Component
**File:** `/src/components/modals/StartOverConfirmation.tsx`

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Target } from 'lucide-react';
import '../../design-system/index.css';

interface StartOverConfirmationProps {
  session: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export const StartOverConfirmation: React.FC<StartOverConfirmationProps> = ({
  session,
  onConfirm,
  onCancel
}) => {
  // Calculate what will be lost
  const calculateLostProgress = () => {
    const progress = session.container_progress?.learn || {};
    const completed = Object.values(progress).filter((s: any) => s.completed).length;
    const totalTime = Object.values(progress).reduce((acc: number, s: any) =>
      acc + (s.time_spent || 0), 0);

    return {
      subjectsCompleted: completed,
      timeSpent: Math.round(totalTime / 60), // Convert to minutes
      percentComplete: Math.round((completed / 4) * 100)
    };
  };

  const { subjectsCompleted, timeSpent, percentComplete } = calculateLostProgress();
  const remainingSubjects = 4 - subjectsCompleted;
  const estimatedTimeToComplete = remainingSubjects * 30; // 30 mins per subject

  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-content max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Warning Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Starting Over - Are You Sure?
          </h2>
        </div>

        {/* Current Progress */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            You've completed <span className="font-bold text-purple-600">
            {subjectsCompleted} of 4 subjects ({percentComplete}%)</span> as a{' '}
            <span className="font-semibold">{session.career_name}</span> with{' '}
            <span className="font-semibold">{session.companion_name}</span>
          </p>

          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {timeSpent} minutes invested
            </span>
          </div>
        </div>

        {/* Smart Suggestion */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                💡 Did you know?
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Once you complete Learn (just {remainingSubjects} subject{remainingSubjects !== 1 ? 's' : ''} left!),
                you can switch to ANY career for Experience and Discover.
                Many students learn fundamentals with one career then explore applications with different careers!
              </p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Your Options:
          </h3>

          <div className="space-y-3">
            {/* Option 1: Finish */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Finish Learn as {session.career_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ~{estimatedTimeToComplete} minutes remaining → Then choose NEW career for Experience & Discover
                </p>
              </div>
            </div>

            {/* Option 2: Start Over */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Start Over with new career
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lose all progress ({timeSpent} minutes of work) → Begin Learn from scratch
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="btn-primary flex-1"
          >
            Finish as {session.career_name} - Then Switch
          </button>
          <button
            onClick={onConfirm}
            className="btn-ghost text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 flex-1"
          >
            Start Over - I Understand
          </button>
        </div>
      </motion.div>
    </div>
  );
};
```

---

## Phase 4: Update Student Dashboard (Week 2)

### 4.1 Update StudentDashboard with Session Management
**File:** `/src/screens/modal-migration/StudentDashboard.tsx` (modifications)

```tsx
// Add to imports
import { sessionManager } from '../../services/content/SessionLearningContextManager';
import { WelcomeBackModal } from '../../components/modals/WelcomeBackModal';
import { StartOverConfirmation } from '../../components/modals/StartOverConfirmation';

// Inside StudentDashboard component
const [session, setSession] = useState(null);
const [showWelcomeBack, setShowWelcomeBack] = useState(false);
const [showStartOver, setShowStartOver] = useState(false);

useEffect(() => {
  const loadSession = async () => {
    if (user?.id) {
      const activeSession = await sessionManager.loadOrCreateSession(user.id);

      if (activeSession) {
        setSession(activeSession);
        setShowWelcomeBack(true);
      } else {
        // No active session, show career/companion selection
        setCurrentView('welcome');
      }
    }
  };

  loadSession();
}, [user]);

// Handle Welcome Back Decision
const handleContinueSession = () => {
  setShowWelcomeBack(false);

  // Load cached Master Narrative if in Learn
  if (session.currentContainer === 'learn' && session.masterNarrativeCache) {
    // Use cached narrative
    setMasterNarrative(JSON.parse(session.masterNarrativeCache));
  }

  // Navigate to current position
  navigateToCurrentPosition(session);
};

const handleChooseNewAdventure = () => {
  if (session.currentContainer === 'learn' && hasLearnProgress(session)) {
    // Show start over confirmation
    setShowStartOver(true);
  } else {
    // Can freely choose new career
    setShowWelcomeBack(false);
    setCurrentView('career-selection');
  }
};

const handleStartOverConfirm = async () => {
  // Archive current session
  await sessionManager.clearSession();

  // Reset to career selection
  setShowStartOver(false);
  setShowWelcomeBack(false);
  setCurrentView('welcome');
};

// Update progress tracking
const handleSubjectComplete = async (subject: string, score: number, timeSpent: number) => {
  await sessionManager.updateProgress(subject, true, score, timeSpent);

  // Check if container is complete
  const updatedSession = await sessionManager.getContext();
  if (isContainerComplete(updatedSession)) {
    // Show container completion celebration
    showContainerCompletion(updatedSession.currentContainer);
  }
};
```

---

## Phase 5: Theme-Aware Styling (Throughout)

### 5.1 Create Theme-Aware Components
**File:** `/src/components/ui/ThemeAwareCard.tsx`

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import '../../design-system/index.css';

interface ThemeAwareCardProps {
  container: 'learn' | 'experience' | 'discover';
  children: React.ReactNode;
  interactive?: boolean;
  progress?: number;
}

export const ThemeAwareCard: React.FC<ThemeAwareCardProps> = ({
  container,
  children,
  interactive = false,
  progress = 0
}) => {
  const getContainerStyles = () => {
    const baseClasses = 'rounded-xl shadow-lg transition-all duration-300';

    const containerColors = {
      learn: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
      experience: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700',
      discover: 'bg-magenta-50 dark:bg-magenta-900/20 border-magenta-200 dark:border-magenta-700'
    };

    const interactiveClasses = interactive ?
      'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : '';

    return `${baseClasses} ${containerColors[container]} ${interactiveClasses} border-2`;
  };

  return (
    <motion.div
      className={getContainerStyles()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={interactive ? { y: -4 } : {}}
    >
      {/* Progress Indicator */}
      {progress > 0 && (
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden">
          <motion.div
            className={`h-full ${
              container === 'learn' ? 'bg-purple-500' :
              container === 'experience' ? 'bg-teal-500' :
              'bg-magenta-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
};
```

### 5.2 Update CSS Variables for Theme Support
**File:** `/src/design-system/themes/session-persistence.css`

```css
/* Session Persistence Theme Variables */
:root {
  /* Welcome Back Modal */
  --welcome-back-bg: var(--gray-50);
  --welcome-back-text: var(--gray-900);
  --welcome-back-accent: var(--purple-600);

  /* Progress Indicators */
  --progress-bar-bg: var(--gray-200);
  --progress-bar-fill: linear-gradient(to right, var(--purple-500), var(--teal-500));

  /* Container States */
  --container-active-border: 3px solid var(--purple-500);
  --container-complete-bg: var(--green-50);
  --container-locked-opacity: 0.5;
}

/* Dark Theme Overrides */
[data-theme="dark"] {
  --welcome-back-bg: var(--gray-800);
  --welcome-back-text: var(--gray-50);
  --welcome-back-accent: var(--purple-400);

  --progress-bar-bg: var(--gray-700);

  --container-complete-bg: var(--green-900);
}

/* Container-specific animations */
@keyframes pulse-learn {
  0%, 100% { border-color: var(--purple-400); }
  50% { border-color: var(--purple-600); }
}

@keyframes pulse-experience {
  0%, 100% { border-color: var(--teal-400); }
  50% { border-color: var(--teal-600); }
}

@keyframes pulse-discover {
  0%, 100% { border-color: var(--magenta-400); }
  50% { border-color: var(--magenta-600); }
}

.container-active-learn {
  animation: pulse-learn 2s ease-in-out infinite;
}

.container-active-experience {
  animation: pulse-experience 2s ease-in-out infinite;
}

.container-active-discover {
  animation: pulse-discover 2s ease-in-out infinite;
}
```

---

## Phase 6: Analytics Integration (Week 3)

### 6.1 Create PathIQ Analytics Service
**File:** `/src/services/analytics/PathIQAnalytics.ts`

```typescript
import { supabase } from '../../lib/supabase';

export class PathIQAnalytics {
  /**
   * Track session events for analytics
   */
  static async trackEvent(
    sessionId: string,
    eventType: string,
    eventData: any
  ): Promise<void> {
    await supabase
      .from('session_analytics')
      .insert({
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData
      });
  }

  /**
   * Track career/companion selection patterns
   */
  static async trackCareerSelection(
    userId: string,
    sessionId: string,
    career: string,
    companion: string,
    context: 'new' | 'continue' | 'switch'
  ): Promise<void> {
    await this.trackEvent(sessionId, 'career_selection', {
      user_id: userId,
      career,
      companion,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track learning progress
   */
  static async trackProgress(
    sessionId: string,
    container: string,
    subject: string,
    completed: boolean,
    score: number,
    timeSpent: number
  ): Promise<void> {
    await this.trackEvent(sessionId, 'progress_update', {
      container,
      subject,
      completed,
      score,
      time_spent: timeSpent,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track session abandonment
   */
  static async trackAbandonment(
    sessionId: string,
    reason: 'timeout' | 'user_restart' | 'logout',
    progressLost: any
  ): Promise<void> {
    await this.trackEvent(sessionId, 'session_abandoned', {
      reason,
      progress_lost: progressLost,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get analytics insights
   */
  static async getInsights(userId: string): Promise<any> {
    // Career persistence patterns
    const { data: sessions } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    // Calculate insights
    const insights = {
      totalSessions: sessions?.length || 0,
      favoriteCareer: this.getMostUsedCareer(sessions),
      averageSessionDuration: this.getAverageSessionDuration(sessions),
      completionRate: this.getCompletionRate(sessions),
      careerSwitchRate: this.getCareerSwitchRate(sessions)
    };

    return insights;
  }

  private static getMostUsedCareer(sessions: any[]): string {
    if (!sessions?.length) return 'None';

    const careerCounts = sessions.reduce((acc, session) => {
      acc[session.career_name] = (acc[session.career_name] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(careerCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'None';
  }

  private static getAverageSessionDuration(sessions: any[]): number {
    if (!sessions?.length) return 0;

    const durations = sessions
      .filter(s => s.ended_at)
      .map(s => new Date(s.ended_at).getTime() - new Date(s.started_at).getTime());

    return durations.length ?
      Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60000) : 0;
  }

  private static getCompletionRate(sessions: any[]): number {
    if (!sessions?.length) return 0;

    const completed = sessions.filter(s => {
      const progress = s.container_progress;
      return progress?.discover?.social_studies?.completed;
    });

    return Math.round((completed.length / sessions.length) * 100);
  }

  private static getCareerSwitchRate(sessions: any[]): number {
    if (sessions?.length < 2) return 0;

    let switches = 0;
    for (let i = 1; i < sessions.length; i++) {
      if (sessions[i].career_id !== sessions[i-1].career_id) {
        switches++;
      }
    }

    return Math.round((switches / (sessions.length - 1)) * 100);
  }
}
```

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Day 1-2: Database schema and migrations
- [ ] Day 3-4: Session API endpoints
- [ ] Day 5: SessionLearningContextManager

### Week 2: UI Components
- [ ] Day 1-2: WelcomeBackModal component
- [ ] Day 3: StartOverConfirmation component
- [ ] Day 4-5: StudentDashboard integration

### Week 3: Polish & Analytics
- [ ] Day 1-2: Theme-aware styling
- [ ] Day 3-4: PathIQ Analytics integration
- [ ] Day 5: Testing and bug fixes

## Testing Checklist

### Session Management
- [ ] New user creates first session
- [ ] Returning user sees welcome back modal
- [ ] Session expires after 8 hours
- [ ] Session persists across devices
- [ ] Demo users tracked separately

### Journey Progression
- [ ] Can't skip containers
- [ ] Learn container locks career/companion
- [ ] Can switch careers after Learn completion
- [ ] Start over shows proper warnings
- [ ] Progress tracked accurately

### UI/UX
- [ ] Light/dark theme consistency
- [ ] Mobile responsive design
- [ ] Animations smooth
- [ ] Loading states handled
- [ ] Error states graceful

### Analytics
- [ ] Events tracked correctly
- [ ] Demo data isolated
- [ ] Insights calculated accurately
- [ ] Performance acceptable

## Success Metrics

1. **User Engagement**
   - Session continuation rate > 70%
   - Career exploration rate (switching) ~30%
   - Completion rate improvement > 20%

2. **Technical Performance**
   - Session load time < 500ms
   - Master Narrative cache hit rate > 60%
   - Zero data loss on session timeout

3. **Cost Optimization**
   - AI generation costs reduced by 40%
   - Master Narrative reuse rate > 50%
   - JIT generation time < 500ms

## Notes

- All components use design system tokens
- Theme support is mandatory
- Mobile-first responsive design
- Accessibility standards (WCAG 2.1 AA)
- Demo data must never affect production analytics