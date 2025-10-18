/**
 * CCM API: List Featured Rooms
 * GET /api/ccm/rooms
 *
 * Returns all active featured perpetual rooms
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ccmService } from '../../../../services/CCMService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ccmService.initialize();

    // Get all featured rooms
    const rooms = await ccmService.getFeaturedRooms();

    return res.status(200).json({
      success: true,
      rooms: rooms.map(room => ({
        id: room.id,
        roomCode: room.room_code,
        roomName: room.room_name,
        description: room.description,
        status: room.status,
        currentPlayerCount: room.current_player_count,
        maxPlayersPerGame: room.max_players_per_game,
        currentGameNumber: room.current_game_number,
        nextGameStartsAt: room.next_game_starts_at,
        themeColor: room.theme_color,
        difficultyRange: room.difficulty_range,
        totalGamesPlayed: room.total_games_played,
      })),
    });

  } catch (error: any) {
    console.error('Error fetching CCM rooms:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch rooms',
      details: error.message,
    });
  }
}
