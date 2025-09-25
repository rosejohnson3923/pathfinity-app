/**
 * Learning Sessions API Routes
 * Handles session-based journey persistence with career/companion tracking
 * Supports PathIQ analytics and demo user isolation
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ WARNING: Supabase credentials not found');
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Middleware to check Supabase connection
const requireSupabase = (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({
      error: 'Database not configured',
      message: 'Session service is temporarily unavailable'
    });
  }
  next();
};

// ================================================================
// GET /api/sessions/active/:userId
// Get active session for a user
// ================================================================
router.get('/active/:userId', requireSupabase, async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`📊 Fetching active session for user: ${userId}`);

    // Get active session
    const { data: session, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching session:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!session) {
      console.log(`No active session found for user: ${userId}`);
      return res.json({ session: null });
    }

    // Check if session is still valid (8 hour timeout)
    const lastActivity = new Date(session.last_activity);
    const now = new Date();
    const hoursInactive = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    const sessionTimeout = session.session_timeout_hours || 8;

    if (hoursInactive > sessionTimeout) {
      console.log(`Session expired for user: ${userId} (inactive for ${hoursInactive.toFixed(1)} hours)`);

      // Expire the session
      await supabase
        .from('learning_sessions')
        .update({
          is_active: false,
          ended_at: now.toISOString(),
          session_abandoned: true,
          abandon_reason: 'timeout'
        })
        .eq('id', session.id);

      // Track abandonment event
      await trackAnalyticsEvent(session.id, userId, 'session_abandoned', {
        reason: 'timeout',
        hours_inactive: hoursInactive,
        last_container: session.current_container,
        last_subject: session.current_subject
      });

      return res.json({ session: null });
    }

    console.log(`✅ Active session found for user: ${userId}`);
    return res.json({ session });

  } catch (error) {
    console.error('Session fetch error:', error);
    return res.status(500).json({
      error: 'Failed to fetch session',
      message: error.message
    });
  }
});

// ================================================================
// POST /api/sessions/create
// Create a new learning session
// ================================================================
router.post('/create', requireSupabase, async (req, res) => {
  try {
    const {
      userId,
      tenantId,
      careerId,
      careerName,
      companionId,
      companionName,
      isDemo,
      sessionSource
    } = req.body;

    console.log(`🎯 Creating new session for user: ${userId}`);
    console.log(`   Career: ${careerName}, Companion: ${companionName}`);

    // Deactivate any existing active sessions
    const { error: deactivateError } = await supabase
      .from('learning_sessions')
      .update({
        is_active: false,
        ended_at: new Date().toISOString(),
        session_abandoned: true,
        abandon_reason: 'switched_career'
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (deactivateError) {
      console.error('Error deactivating old sessions:', deactivateError);
    }

    // Get the previous session ID for chaining
    const { data: previousSession } = await supabase
      .from('learning_sessions')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Create new session with default progress structure
    const newSession = {
      user_id: userId,
      tenant_id: tenantId || null,
      career_id: careerId,
      career_name: careerName,
      companion_id: companionId,
      companion_name: companionName,
      is_demo: isDemo || false,
      session_source: sessionSource || 'web',
      current_container: 'learn',
      current_subject: 'math',
      previous_session_id: previousSession?.id || null,
      container_progress: {
        learn: {
          math: { completed: false, score: 0, time_spent: 0, completed_at: null },
          ela: { completed: false, score: 0, time_spent: 0, completed_at: null },
          science: { completed: false, score: 0, time_spent: 0, completed_at: null },
          social_studies: { completed: false, score: 0, time_spent: 0, completed_at: null }
        },
        experience: {
          math: { completed: false, score: 0, time_spent: 0, completed_at: null },
          ela: { completed: false, score: 0, time_spent: 0, completed_at: null },
          science: { completed: false, score: 0, time_spent: 0, completed_at: null },
          social_studies: { completed: false, score: 0, time_spent: 0, completed_at: null }
        },
        discover: {
          math: { completed: false, score: 0, time_spent: 0, completed_at: null },
          ela: { completed: false, score: 0, time_spent: 0, completed_at: null },
          science: { completed: false, score: 0, time_spent: 0, completed_at: null },
          social_studies: { completed: false, score: 0, time_spent: 0, completed_at: null }
        }
      }
    };

    const { data: session, error: createError } = await supabase
      .from('learning_sessions')
      .insert(newSession)
      .select()
      .single();

    if (createError) {
      console.error('Error creating session:', createError);
      return res.status(500).json({
        error: 'Failed to create session',
        message: createError.message
      });
    }

    // Track session creation event
    await trackAnalyticsEvent(session.id, userId, 'session_started', {
      career_id: careerId,
      career_name: careerName,
      companion_id: companionId,
      companion_name: companionName,
      is_demo: isDemo,
      source: sessionSource
    });

    // Track career selection
    await trackAnalyticsEvent(session.id, userId, 'career_selected', {
      career_id: careerId,
      career_name: careerName,
      context: previousSession ? 'switch' : 'new'
    });

    // Track companion selection
    await trackAnalyticsEvent(session.id, userId, 'companion_selected', {
      companion_id: companionId,
      companion_name: companionName
    });

    console.log(`✅ Session created successfully: ${session.id}`);
    return res.json({ session });

  } catch (error) {
    console.error('Session creation error:', error);
    return res.status(500).json({
      error: 'Failed to create session',
      message: error.message
    });
  }
});

// ================================================================
// PUT /api/sessions/:sessionId/progress
// Update session progress for a subject
// ================================================================
router.put('/:sessionId/progress', requireSupabase, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      container,
      subject,
      completed,
      score,
      timeSpent
    } = req.body;

    console.log(`📈 Updating progress for session: ${sessionId}`);
    console.log(`   Container: ${container}, Subject: ${subject}`);

    // Get current session
    const { data: currentSession, error: fetchError } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError || !currentSession) {
      console.error('Session not found:', fetchError);
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update progress for the specific subject
    const progress = currentSession.container_progress;
    if (!progress[container]) {
      progress[container] = {};
    }

    progress[container][subject] = {
      completed,
      score,
      time_spent: timeSpent,
      completed_at: completed ? new Date().toISOString() : null
    };

    // Check if container is complete
    const subjects = ['math', 'ela', 'science', 'social_studies'];
    const containerComplete = subjects.every(subj =>
      progress[container][subj]?.completed === true
    );

    // Determine next container and subject
    let nextContainer = container;
    let nextSubject = subject;

    if (completed) {
      // Find next subject in current container
      const currentSubjectIndex = subjects.indexOf(subject);
      if (currentSubjectIndex < subjects.length - 1) {
        nextSubject = subjects[currentSubjectIndex + 1];
      } else if (containerComplete) {
        // Move to next container
        if (container === 'learn') {
          nextContainer = 'experience';
          nextSubject = 'math';
        } else if (container === 'experience') {
          nextContainer = 'discover';
          nextSubject = 'math';
        }
      }
    }

    // Update session
    const { data: updatedSession, error: updateError } = await supabase
      .from('learning_sessions')
      .update({
        container_progress: progress,
        current_container: nextContainer,
        current_subject: nextSubject,
        last_activity: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating progress:', updateError);
      return res.status(500).json({
        error: 'Failed to update progress',
        message: updateError.message
      });
    }

    // Track progress event
    await trackAnalyticsEvent(sessionId, currentSession.user_id, 'subject_completed', {
      container,
      subject,
      score,
      time_spent: timeSpent,
      perfect_score: score === 100
    });

    // Check for achievements
    if (completed) {
      await checkAndAwardAchievements(
        sessionId,
        currentSession.user_id,
        container,
        subject,
        score,
        timeSpent,
        containerComplete
      );
    }

    // Track container completion
    if (containerComplete) {
      await trackAnalyticsEvent(sessionId, currentSession.user_id, 'container_completed', {
        container,
        total_score: Object.values(progress[container])
          .reduce((sum, subj) => sum + (subj.score || 0), 0) / 4,
        total_time: Object.values(progress[container])
          .reduce((sum, subj) => sum + (subj.time_spent || 0), 0)
      });
    }

    console.log(`✅ Progress updated successfully`);
    return res.json({ session: updatedSession });

  } catch (error) {
    console.error('Progress update error:', error);
    return res.status(500).json({
      error: 'Failed to update progress',
      message: error.message
    });
  }
});

// ================================================================
// POST /api/sessions/:sessionId/cache-narrative
// Cache the Master Narrative for a session
// ================================================================
router.post('/:sessionId/cache-narrative', requireSupabase, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { narrative, cacheKey } = req.body;

    console.log(`💾 Caching narrative for session: ${sessionId}`);

    const { data, error } = await supabase
      .from('learning_sessions')
      .update({
        master_narrative_cache: narrative,
        narrative_generated_at: new Date().toISOString(),
        narrative_cache_key: cacheKey
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error caching narrative:', error);
      return res.status(500).json({
        error: 'Failed to cache narrative',
        message: error.message
      });
    }

    // Track narrative caching
    await trackAnalyticsEvent(sessionId, data.user_id, 'narrative_cached', {
      cache_key: cacheKey,
      narrative_length: narrative.length
    });

    console.log(`✅ Narrative cached successfully`);
    return res.json({ success: true });

  } catch (error) {
    console.error('Narrative caching error:', error);
    return res.status(500).json({
      error: 'Failed to cache narrative',
      message: error.message
    });
  }
});

// ================================================================
// POST /api/sessions/:sessionId/restart
// Handle session restart (with progress loss)
// ================================================================
router.post('/:sessionId/restart', requireSupabase, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { newCareerId, newCareerName, newCompanionId, newCompanionName } = req.body;

    console.log(`🔄 Restarting session: ${sessionId}`);

    // Get current session
    const { data: oldSession, error: fetchError } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError || !oldSession) {
      console.error('Session not found:', fetchError);
      return res.status(404).json({ error: 'Session not found' });
    }

    // Calculate what was lost
    const progressLost = calculateProgressLost(oldSession.container_progress);

    // Archive the old session
    await supabase
      .from('learning_sessions')
      .update({
        is_active: false,
        ended_at: new Date().toISOString(),
        session_abandoned: true,
        abandon_reason: 'user_restart'
      })
      .eq('id', sessionId);

    // Track abandonment
    await trackAnalyticsEvent(sessionId, oldSession.user_id, 'session_abandoned', {
      reason: 'user_restart',
      progress_lost: progressLost,
      old_career: oldSession.career_name,
      new_career: newCareerName
    });

    // Create new session
    const newSession = {
      user_id: oldSession.user_id,
      tenant_id: oldSession.tenant_id,
      career_id: newCareerId,
      career_name: newCareerName,
      companion_id: newCompanionId,
      companion_name: newCompanionName,
      is_demo: oldSession.is_demo,
      session_source: oldSession.session_source,
      current_container: 'learn',
      current_subject: 'math',
      previous_session_id: sessionId,
      container_progress: {
        learn: {
          math: { completed: false, score: 0, time_spent: 0, completed_at: null },
          ela: { completed: false, score: 0, time_spent: 0, completed_at: null },
          science: { completed: false, score: 0, time_spent: 0, completed_at: null },
          social_studies: { completed: false, score: 0, time_spent: 0, completed_at: null }
        },
        experience: {
          math: { completed: false, score: 0, time_spent: 0, completed_at: null },
          ela: { completed: false, score: 0, time_spent: 0, completed_at: null },
          science: { completed: false, score: 0, time_spent: 0, completed_at: null },
          social_studies: { completed: false, score: 0, time_spent: 0, completed_at: null }
        },
        discover: {
          math: { completed: false, score: 0, time_spent: 0, completed_at: null },
          ela: { completed: false, score: 0, time_spent: 0, completed_at: null },
          science: { completed: false, score: 0, time_spent: 0, completed_at: null },
          social_studies: { completed: false, score: 0, time_spent: 0, completed_at: null }
        }
      }
    };

    const { data: session, error: createError } = await supabase
      .from('learning_sessions')
      .insert(newSession)
      .select()
      .single();

    if (createError) {
      console.error('Error creating new session:', createError);
      return res.status(500).json({
        error: 'Failed to restart session',
        message: createError.message
      });
    }

    // Track restart confirmation
    await trackAnalyticsEvent(session.id, oldSession.user_id, 'restart_confirmed', {
      old_session_id: sessionId,
      progress_lost: progressLost,
      new_career: newCareerName,
      new_companion: newCompanionName
    });

    console.log(`✅ Session restarted successfully`);
    return res.json({ session });

  } catch (error) {
    console.error('Session restart error:', error);
    return res.status(500).json({
      error: 'Failed to restart session',
      message: error.message
    });
  }
});

// ================================================================
// GET /api/sessions/:userId/stats
// Get user session statistics for PathIQ
// ================================================================
router.get('/:userId/stats', requireSupabase, async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`📊 Fetching session stats for user: ${userId}`);

    // Get all sessions for user
    const { data: sessions, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return res.status(500).json({ error: error.message });
    }

    // Calculate statistics
    const stats = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => !s.session_abandoned).length,
      favoriteCareer: getMostFrequent(sessions.map(s => s.career_name)),
      favoriteCompanion: getMostFrequent(sessions.map(s => s.companion_name)),
      totalSubjectsCompleted: calculateTotalSubjectsCompleted(sessions),
      averageSessionMinutes: calculateAverageSessionTime(sessions),
      currentStreak: calculateCurrentStreak(sessions),
      careerSwitchRate: calculateCareerSwitchRate(sessions),
      achievements: await getUserAchievements(userId)
    };

    console.log(`✅ Stats calculated for user: ${userId}`);
    return res.json({ stats });

  } catch (error) {
    console.error('Stats fetch error:', error);
    return res.status(500).json({
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

// ================================================================
// Helper Functions
// ================================================================

async function trackAnalyticsEvent(sessionId, userId, eventType, eventData) {
  if (!supabase) return;

  try {
    await supabase
      .from('session_analytics')
      .insert({
        session_id: sessionId,
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        client_timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

async function checkAndAwardAchievements(sessionId, userId, container, subject, score, timeSpent, containerComplete) {
  const achievements = [];

  // Perfect score achievement
  if (score === 100) {
    achievements.push({
      session_id: sessionId,
      user_id: userId,
      achievement_type: 'perfect_score',
      achievement_name: 'Perfect Score!',
      achievement_description: `Scored 100% in ${subject}`,
      points_earned: 50,
      container,
      subject
    });
  }

  // Speed demon achievement (completed in under 10 minutes)
  if (timeSpent < 600) {
    achievements.push({
      session_id: sessionId,
      user_id: userId,
      achievement_type: 'speed_demon',
      achievement_name: 'Speed Demon',
      achievement_description: `Completed ${subject} in under 10 minutes`,
      points_earned: 25,
      container,
      subject
    });
  }

  // Container complete achievement
  if (containerComplete) {
    achievements.push({
      session_id: sessionId,
      user_id: userId,
      achievement_type: 'container_complete',
      achievement_name: `${container.charAt(0).toUpperCase() + container.slice(1)} Master`,
      achievement_description: `Completed all subjects in ${container}`,
      points_earned: 100,
      container,
      subject: null
    });
  }

  if (achievements.length > 0 && supabase) {
    await supabase
      .from('session_achievements')
      .insert(achievements);
  }
}

function calculateProgressLost(containerProgress) {
  let subjectsCompleted = 0;
  let totalTimeSpent = 0;

  ['learn', 'experience', 'discover'].forEach(container => {
    if (containerProgress[container]) {
      ['math', 'ela', 'science', 'social_studies'].forEach(subject => {
        if (containerProgress[container][subject]) {
          if (containerProgress[container][subject].completed) {
            subjectsCompleted++;
          }
          totalTimeSpent += containerProgress[container][subject].time_spent || 0;
        }
      });
    }
  });

  return {
    subjects_completed: subjectsCompleted,
    time_spent_minutes: Math.round(totalTimeSpent / 60),
    percentage_complete: Math.round((subjectsCompleted / 12) * 100)
  };
}

function getMostFrequent(arr) {
  if (!arr.length) return null;
  const frequency = {};
  let maxFreq = 0;
  let mostFrequent = arr[0];

  arr.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
    if (frequency[item] > maxFreq) {
      maxFreq = frequency[item];
      mostFrequent = item;
    }
  });

  return mostFrequent;
}

function calculateTotalSubjectsCompleted(sessions) {
  let total = 0;
  sessions.forEach(session => {
    ['learn', 'experience', 'discover'].forEach(container => {
      if (session.container_progress?.[container]) {
        ['math', 'ela', 'science', 'social_studies'].forEach(subject => {
          if (session.container_progress[container][subject]?.completed) {
            total++;
          }
        });
      }
    });
  });
  return total;
}

function calculateAverageSessionTime(sessions) {
  const completedSessions = sessions.filter(s => s.ended_at);
  if (!completedSessions.length) return 0;

  const totalMinutes = completedSessions.reduce((sum, session) => {
    const start = new Date(session.started_at);
    const end = new Date(session.ended_at);
    return sum + ((end - start) / 1000 / 60);
  }, 0);

  return Math.round(totalMinutes / completedSessions.length);
}

function calculateCurrentStreak(sessions) {
  // Sort sessions by date
  const sessionDates = [...new Set(sessions.map(s =>
    new Date(s.started_at).toDateString()
  ))].sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Check if there's a session today or yesterday to start the streak
  if (sessionDates[0] !== today && sessionDates[0] !== yesterday) {
    return 0;
  }

  // Count consecutive days
  let expectedDate = new Date(sessionDates[0]);
  for (const dateStr of sessionDates) {
    if (dateStr === expectedDate.toDateString()) {
      streak++;
      expectedDate = new Date(expectedDate.getTime() - 86400000); // Previous day
    } else {
      break;
    }
  }

  return streak;
}

function calculateCareerSwitchRate(sessions) {
  if (sessions.length < 2) return 0;

  let switches = 0;
  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i].career_id !== sessions[i - 1].career_id) {
      switches++;
    }
  }

  return Math.round((switches / (sessions.length - 1)) * 100);
}

async function getUserAchievements(userId) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('session_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
    .limit(10);

  return data || [];
}

module.exports = router;