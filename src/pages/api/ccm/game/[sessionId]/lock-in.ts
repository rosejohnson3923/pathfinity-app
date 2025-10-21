/**
 * CCM API: Lock In Selection
 * POST /api/ccm/game/[sessionId]/lock-in
 *
 * Lock in the player's card selection for the current round
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
  const {
    participantId,
    roleCardId,
    synergyCardId,
    specialCardType // 'golden' or 'mvp'
  } = req.body;

  // Validate request
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid session ID'
    });
  }

  if (!participantId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: participantId'
    });
  }

  // Golden Card doesn't require role card (automatic 120 points)
  // Regular cards and MVP cards require role card
  if (specialCardType !== 'golden' && !roleCardId) {
    return res.status(400).json({
      success: false,
      error: 'Role card required (unless using Golden Card)'
    });
  }

  try {
    const client = await supabase();

    // Get game session
    const { data: session, error: sessionError } = await client
      .from('ccm_game_sessions')
      .select('*, ccm_perpetual_rooms(*)')
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

    // Validate role card is in participant's hand (skip for Golden Card)
    if (specialCardType !== 'golden' && roleCardId && !participant.role_hand.includes(roleCardId)) {
      return res.status(400).json({
        success: false,
        error: 'Selected role card not in your hand'
      });
    }

    // Validate synergy card if provided (not needed for Golden Card)
    if (specialCardType !== 'golden' && synergyCardId && !participant.synergy_hand.includes(synergyCardId)) {
      return res.status(400).json({
        success: false,
        error: 'Selected synergy card not in your hand'
      });
    }

    // Get challenge card for current round
    const { data: challenge } = await client
      .from('ccm_challenge_cards')
      .select('*')
      .limit(1)
      .single();

    // Calculate score using game engine
    const scoreResult = await ccmGameEngine.calculateRoundScore({
      participantId,
      roleCardId,
      synergyCardId,
      specialCardType,
      cSuiteChoice: participant.c_suite_choice,
      challengeCardId: challenge?.id || '',
      currentRound: session.current_round
    });

    // Record the round play
    const { error: playError } = await client
      .from('ccm_round_plays')
      .insert({
        game_session_id: sessionId,
        participant_id: participantId,
        round_number: session.current_round,
        challenge_card_id: challenge?.id,
        slot_1_role_card_id: roleCardId,
        slot_2_synergy_card_id: synergyCardId,
        slot_3_card_type: specialCardType,
        base_score: scoreResult.baseScore,
        synergy_multiplier: scoreResult.synergyMultiplier,
        c_suite_multiplier: scoreResult.cSuiteMultiplier,
        soft_skills_multiplier: scoreResult.softSkillsMultiplier,
        final_score: scoreResult.finalScore,
        locked_in_at: new Date().toISOString()
      });

    if (playError) {
      throw playError;
    }

    // Update participant's total score
    const { error: updateError } = await client
      .from('ccm_session_participants')
      .update({
        total_score: participant.total_score + scoreResult.finalScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', participantId);

    if (updateError) {
      throw updateError;
    }

    // Broadcast the lock-in to other players
    await client.channel(`ccm:room:${session.ccm_perpetual_rooms.id}`)
      .send({
        type: 'broadcast',
        event: 'player_locked_in',
        payload: {
          sessionId,
          participantId,
          displayName: participant.display_name,
          roundNumber: session.current_round
        }
      });

    return res.status(200).json({
      success: true,
      message: 'Selection locked in',
      score: {
        baseScore: scoreResult.baseScore,
        finalScore: scoreResult.finalScore,
        totalScore: participant.total_score + scoreResult.finalScore
      }
    });

  } catch (error: any) {
    console.error('Error locking in selection:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to lock in selection',
      details: error.message,
    });
  }
}
