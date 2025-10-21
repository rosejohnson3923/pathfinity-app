/**
 * CCM API: Game Leaderboard
 * GET /api/ccm/game/[sessionId]/leaderboard
 *
 * Get current leaderboard standings for a game session
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query;

  // Validate request
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid session ID'
    });
  }

  try {
    const client = await supabase();

    // Get game session
    const { data: session, error: sessionError } = await client
      .from('ccm_game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    // Get all participants with their scores
    const { data: participants, error: participantsError } = await client
      .from('ccm_session_participants')
      .select('id, student_id, display_name, participant_type, total_score, c_suite_choice, bingos_achieved, connection_status')
      .eq('game_session_id', sessionId)
      .order('total_score', { ascending: false });

    if (participantsError) {
      throw participantsError;
    }

    if (!participants || participants.length === 0) {
      return res.status(200).json({
        success: true,
        leaderboard: [],
        sessionStatus: session.status,
        currentRound: session.current_round
      });
    }

    // Calculate ranks (handle ties)
    let currentRank = 1;
    let previousScore = participants[0]?.total_score;
    let sameRankCount = 0;

    const leaderboard = participants.map((participant, index) => {
      if (participant.total_score < previousScore) {
        currentRank = currentRank + sameRankCount;
        sameRankCount = 1;
      } else {
        sameRankCount++;
      }

      previousScore = participant.total_score;

      return {
        rank: currentRank,
        participantId: participant.id,
        studentId: participant.student_id,
        displayName: participant.display_name,
        participantType: participant.participant_type,
        totalScore: participant.total_score,
        cSuiteChoice: participant.c_suite_choice,
        bingosAchieved: participant.bingos_achieved || 0,
        connectionStatus: participant.connection_status,
        isAI: participant.participant_type === 'ai'
      };
    });

    // Get round plays for the current round (to see who has locked in)
    const { data: roundPlays } = await client
      .from('ccm_round_plays')
      .select('participant_id, final_score')
      .eq('game_session_id', sessionId)
      .eq('round_number', session.current_round);

    const lockedInParticipants = new Set(
      roundPlays?.map(play => play.participant_id) || []
    );

    // Add lock-in status to leaderboard
    const leaderboardWithLockStatus = leaderboard.map(entry => ({
      ...entry,
      hasLockedIn: lockedInParticipants.has(entry.participantId)
    }));

    return res.status(200).json({
      success: true,
      leaderboard: leaderboardWithLockStatus,
      sessionStatus: session.status,
      currentRound: session.current_round,
      totalRounds: 5,
      totalParticipants: participants.length
    });

  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
      details: error.message,
    });
  }
}
