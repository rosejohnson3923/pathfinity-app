/**
 * CCM API: Leave Room
 * POST /api/ccm/rooms/[roomId]/leave
 *
 * Leave a perpetual room (removes participant, may trigger room dormancy)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ccmService } from '../../../../../services/CCMService';
import { supabase } from '../../../../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId } = req.query;
  const { playerId } = req.body;

  // Validate request
  if (!roomId || typeof roomId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid room ID'
    });
  }

  if (!playerId) {
    return res.status(400).json({
      success: false,
      error: 'Missing playerId'
    });
  }

  try {
    const client = await supabase();

    // Get the room
    const { data: room, error: roomError } = await client
      .from('ccm_perpetual_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    // Find participant in current game (if any)
    const { data: participant } = await client
      .from('ccm_session_participants')
      .select('*, ccm_game_sessions(*)')
      .eq('perpetual_room_id', roomId)
      .eq('student_id', playerId)
      .eq('participant_type', 'human')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!participant) {
      return res.status(404).json({
        success: false,
        error: 'Player not found in this room'
      });
    }

    const sessionId = participant.game_session_id;
    const isGameActive = participant.ccm_game_sessions.status === 'active';

    // If game is active, mark participant as disconnected (keep record for game completion)
    if (isGameActive) {
      const { error: updateError } = await client
        .from('ccm_session_participants')
        .update({
          connection_status: 'disconnected',
          disconnected_at: new Date().toISOString()
        })
        .eq('id', participant.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // If game is not active, completely remove participant
      const { error: deleteError } = await client
        .from('ccm_session_participants')
        .delete()
        .eq('id', participant.id);

      if (deleteError) {
        throw deleteError;
      }
    }

    // Check how many human players remain in the room
    const { data: remainingHumans, error: countError } = await client
      .from('ccm_session_participants')
      .select('id')
      .eq('perpetual_room_id', roomId)
      .eq('participant_type', 'human')
      .eq('connection_status', 'connected');

    if (countError) {
      throw countError;
    }

    const humanCount = remainingHumans?.length || 0;

    // Update room player count
    await client
      .from('ccm_perpetual_rooms')
      .update({
        current_player_count: humanCount
      })
      .eq('id', roomId);

    // If no humans left, set room to dormant
    if (humanCount === 0) {
      await client
        .from('ccm_perpetual_rooms')
        .update({
          status: 'dormant',
          current_game_id: null
        })
        .eq('id', roomId);

      console.log(`Room ${roomId} set to dormant (no human players)`);
    }

    // Broadcast player left event
    await client.channel(`ccm:room:${roomId}`)
      .send({
        type: 'broadcast',
        event: 'player_left',
        payload: {
          playerId,
          displayName: participant.display_name,
          remainingPlayers: humanCount
        }
      });

    return res.status(200).json({
      success: true,
      message: isGameActive ? 'Disconnected from game' : 'Left room',
      roomStatus: humanCount === 0 ? 'dormant' : room.status,
      remainingPlayers: humanCount
    });

  } catch (error: any) {
    console.error('Error leaving CCM room:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to leave room',
      details: error.message,
    });
  }
}
