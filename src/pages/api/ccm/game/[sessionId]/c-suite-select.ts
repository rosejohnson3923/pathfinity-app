/**
 * CCM API: C-Suite Selection
 * POST /api/ccm/game/[sessionId]/c-suite-select
 *
 * Submit C-Suite executive choice (Round 1 only)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ccmGameEngine } from '../../../../../services/CCMGameEngine';
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
  const { participantId, cSuiteChoice } = req.body;

  // Validate request
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid session ID'
    });
  }

  if (!participantId || !cSuiteChoice) {
    return res.status(400).json({
      success: false,
      error: 'Missing participantId or cSuiteChoice'
    });
  }

  // Validate C-Suite choice
  const validChoices = ['ceo', 'cfo', 'cmo', 'cto', 'chro'];
  if (!validChoices.includes(cSuiteChoice)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid C-Suite choice. Must be one of: CEO, CFO, CMO, CTO, CHRO'
    });
  }

  try {
    const client = await supabase();

    // Check if game session exists and is active
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

    // Check if we're in Round 1
    if (session.current_round !== 1) {
      return res.status(400).json({
        success: false,
        error: 'C-Suite selection is only allowed in Round 1'
      });
    }

    // Update participant's C-Suite choice
    const { error: updateError } = await client
      .from('ccm_session_participants')
      .update({
        c_suite_choice: cSuiteChoice,
        updated_at: new Date().toISOString()
      })
      .eq('id', participantId)
      .eq('game_session_id', sessionId);

    if (updateError) {
      throw updateError;
    }

    // Broadcast the selection to other players
    const { data: room } = await client
      .from('ccm_game_sessions')
      .select('perpetual_room_id')
      .eq('id', sessionId)
      .single();

    if (room) {
      await client.channel(`ccm:room:${room.perpetual_room_id}`)
        .send({
          type: 'broadcast',
          event: 'c_suite_selected',
          payload: {
            sessionId,
            participantId,
            cSuiteChoice
          }
        });
    }

    return res.status(200).json({
      success: true,
      message: 'C-Suite selection saved',
      cSuiteChoice
    });

  } catch (error: any) {
    console.error('Error saving C-Suite selection:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save C-Suite selection',
      details: error.message,
    });
  }
}
