/**
 * CCM API: Room Status
 * GET /api/ccm/rooms/[roomId]/status
 *
 * Get current status of a perpetual room
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ccmService } from '../../../../../services/CCMService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId } = req.query;

  if (!roomId || typeof roomId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid room ID'
    });
  }

  try {
    await ccmService.initialize();

    // Get room status
    const room = await ccmService.getRoomStatus(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
      });
    }

    return res.status(200).json({
      success: true,
      room: {
        id: room.id,
        roomCode: room.room_code,
        roomName: room.room_name,
        status: room.status,
        currentPlayerCount: room.current_player_count,
        maxPlayersPerGame: room.max_players_per_game,
        currentGameId: room.current_game_id,
        currentGameNumber: room.current_game_number,
        nextGameStartsAt: room.next_game_starts_at,
        lastGameStartedAt: room.last_game_started_at,
        gameSessions: room.ccm_game_sessions || [],
      },
    });

  } catch (error: any) {
    console.error('Error fetching CCM room status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch room status',
      details: error.message,
    });
  }
}
