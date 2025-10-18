/**
 * CCM API: Submit Cards
 * POST /api/ccm/game/[sessionId]/submit-cards
 *
 * Submit card selection for the current round
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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query;
  const {
    participantId,
    roleCardId,
    synergyCardId,
    useGoldenCard = false,
    useMvpBonus = false
  } = req.body;

  // Validate request
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid session ID'
    });
  }

  if (!participantId || !roleCardId || !synergyCardId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  try {
    // Get current game session
    const { data: session, error: sessionError } = await supabase
      .from('ccm_game_sessions')
      .select('*, ccm_session_participants(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found',
      });
    }

    // Verify participant exists
    const participant = session.ccm_session_participants?.find(
      (p: any) => p.id === participantId
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        error: 'Participant not found in this game',
      });
    }

    // Check if already submitted for this round
    const { data: existingPlay } = await supabase
      .from('ccm_round_plays')
      .select('id')
      .eq('game_session_id', sessionId)
      .eq('participant_id', participantId)
      .eq('round_number', session.current_round)
      .single();

    if (existingPlay) {
      return res.status(409).json({
        success: false,
        error: 'Cards already submitted for this round',
      });
    }

    // Validate card ownership
    if (!participant.role_hand?.includes(roleCardId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role card selection',
      });
    }

    if (!participant.synergy_hand?.includes(synergyCardId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid synergy card selection',
      });
    }

    if (useGoldenCard && !participant.has_golden_card) {
      return res.status(400).json({
        success: false,
        error: 'Golden card not available',
      });
    }

    // Get challenge card for this round (would be determined by game logic)
    // For now, pick a random active challenge
    const { data: challengeCards } = await supabase
      .from('ccm_challenge_cards')
      .select('id')
      .eq('is_active', true)
      .limit(1);

    const challengeCardId = challengeCards?.[0]?.id;

    // Create round play record
    const { data: play, error: playError } = await supabase
      .from('ccm_round_plays')
      .insert({
        game_session_id: sessionId,
        participant_id: participantId,
        round_number: session.current_round,
        challenge_card_id: challengeCardId,
        slot_1_role_card_id: roleCardId,
        slot_2_synergy_card_id: synergyCardId,
        slot_3_card_type: useGoldenCard ? 'golden' : (useMvpBonus ? 'mvp' : null),
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (playError) {
      console.error('Error creating round play:', playError);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit cards',
        details: playError.message,
      });
    }

    // TODO: Calculate score using soft skills matrix
    // For now, use placeholder scoring
    const baseScore = 60; // Would come from matrix calculation
    const softSkillsMultiplier = 1.05; // Would come from matrix
    let finalScore = Math.round(baseScore * softSkillsMultiplier);

    // Apply golden card multiplier
    if (useGoldenCard) {
      finalScore *= 2;

      // Update participant to consume golden card
      await supabase
        .from('ccm_session_participants')
        .update({ has_golden_card: false })
        .eq('id', participantId);
    }

    // Apply MVP bonus
    if (useMvpBonus) {
      finalScore += 10;
    }

    // Update round play with scores
    await supabase
      .from('ccm_round_plays')
      .update({
        base_score: baseScore,
        soft_skills_multiplier: softSkillsMultiplier,
        final_score: finalScore,
      })
      .eq('id', play.id);

    // Update participant total score
    const newTotalScore = (participant.total_score || 0) + finalScore;
    await supabase
      .from('ccm_session_participants')
      .update({ total_score: newTotalScore })
      .eq('id', participantId);

    return res.status(200).json({
      success: true,
      play: {
        id: play.id,
        roundNumber: session.current_round,
        baseScore,
        finalScore,
        totalScore: newTotalScore,
      },
    });

  } catch (error: any) {
    console.error('Error submitting cards:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit cards',
      details: error.message,
    });
  }
}
