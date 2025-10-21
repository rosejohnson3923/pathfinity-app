/**
 * CCM API: MVP Selection
 * POST /api/ccm/game/[sessionId]/mvp-select
 *
 * Select MVP card to carry over to next round
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query;
  const { participantId, mvpCardId, afterRound } = req.body;

  // Validate request
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid session ID'
    });
  }

  if (!participantId || !mvpCardId || !afterRound) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields (participantId, mvpCardId, afterRound)'
    });
  }

  // Validate round number (MVP selection happens after rounds 1-4)
  if (afterRound < 1 || afterRound > 4) {
    return res.status(400).json({
      success: false,
      error: 'MVP selection is only allowed after rounds 1-4'
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

    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Game session is not active'
      });
    }

    // Get participant
    const { data: participant, error: participantError } = await client
      .from('ccm_session_participants')
      .select('*')
      .eq('id', participantId)
      .eq('game_session_id', sessionId)
      .single();

    if (participantError || !participant) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found'
      });
    }

    // Validate MVP card selection (must be from role or synergy hand)
    const isValidCard =
      participant.role_hand.includes(mvpCardId) ||
      participant.synergy_hand.includes(mvpCardId);

    if (!isValidCard) {
      return res.status(400).json({
        success: false,
        error: 'Selected card not in your hand'
      });
    }

    // Check if participant already selected MVP for this round
    const { data: existingMVP } = await client
      .from('ccm_mvp_selections')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('participant_id', participantId)
      .eq('selected_after_round', afterRound)
      .single();

    if (existingMVP) {
      // Update existing MVP selection
      const { error: updateError } = await client
        .from('ccm_mvp_selections')
        .update({
          mvp_card_id: mvpCardId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMVP.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new MVP selection
      const { error: insertError } = await client
        .from('ccm_mvp_selections')
        .insert({
          game_session_id: sessionId,
          participant_id: participantId,
          selected_after_round: afterRound,
          mvp_card_id: mvpCardId,
          used_in_round: null // Will be set when used
        });

      if (insertError) {
        throw insertError;
      }
    }

    // Broadcast the MVP selection (let other players know you're ready for next round)
    const { data: room } = await client
      .from('ccm_game_sessions')
      .select('perpetual_room_id')
      .eq('id', sessionId)
      .single();

    if (room) {
      await client.channel(`ccm:room:${room.perpetual_room_id}`)
        .send({
          type: 'broadcast',
          event: 'mvp_selected',
          payload: {
            sessionId,
            participantId,
            displayName: participant.display_name,
            afterRound
          }
        });
    }

    return res.status(200).json({
      success: true,
      message: 'MVP card selected',
      mvpCardId,
      afterRound
    });

  } catch (error: any) {
    console.error('Error saving MVP selection:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save MVP selection',
      details: error.message,
    });
  }
}
