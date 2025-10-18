/**
 * CCM API: Game Status
 * GET /api/ccm/game/[sessionId]/status
 *
 * Get current status of a game session (rounds, scores, participants)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid session ID'
    });
  }

  try {
    // Get game session with participants and plays
    const { data: session, error: sessionError } = await supabase
      .from('ccm_game_sessions')
      .select(`
        *,
        ccm_session_participants (*),
        ccm_round_plays (*)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found',
      });
    }

    // Calculate leaderboard
    const leaderboard = (session.ccm_session_participants || [])
      .map((p: any) => ({
        participantId: p.id,
        participantType: p.participant_type,
        displayName: p.display_name,
        totalScore: p.total_score || 0,
        hasGoldenCard: p.has_golden_card,
        cSuiteChoice: p.c_suite_choice,
        isActive: p.is_active,
      }))
      .sort((a: any, b: any) => b.totalScore - a.totalScore);

    // Get round plays by round
    const roundPlays = session.ccm_round_plays || [];
    const roundSummaries = [];

    for (let round = 1; round <= session.current_round; round++) {
      const roundData = roundPlays.filter((p: any) => p.round_number === round);
      roundSummaries.push({
        roundNumber: round,
        playsSubmitted: roundData.length,
        totalParticipants: session.total_participants,
        isComplete: roundData.length === session.total_participants,
      });
    }

    // Check if all players have submitted for current round
    const currentRoundPlays = roundPlays.filter(
      (p: any) => p.round_number === session.current_round
    );
    const allSubmitted = currentRoundPlays.length === session.total_participants;

    return res.status(200).json({
      success: true,
      session: {
        id: session.id,
        roomId: session.perpetual_room_id,
        gameNumber: session.game_number,
        status: session.status,
        currentRound: session.current_round,
        totalRounds: session.total_rounds,
        roundsCompleted: session.rounds_completed,
        totalParticipants: session.total_participants,
        humanParticipants: session.human_participants,
        aiParticipants: session.ai_participants,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        winnerParticipantId: session.winner_participant_id,
      },
      leaderboard,
      roundSummaries,
      currentRoundStatus: {
        roundNumber: session.current_round,
        playsSubmitted: currentRoundPlays.length,
        allSubmitted,
        awaitingPlayers: session.ccm_session_participants
          .filter((p: any) =>
            !currentRoundPlays.some((play: any) => play.participant_id === p.id)
          )
          .map((p: any) => ({
            participantId: p.id,
            displayName: p.display_name,
          })),
      },
    });

  } catch (error: any) {
    console.error('Error fetching game status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch game status',
      details: error.message,
    });
  }
}
