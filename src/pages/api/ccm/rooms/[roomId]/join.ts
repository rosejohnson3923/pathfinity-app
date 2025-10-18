/**
 * CCM API: Join Room
 * POST /api/ccm/rooms/[roomId]/join
 *
 * Join a perpetual room (queues for next game if active)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ccmService } from '../../../../../services/CCMService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId } = req.query;
  const { playerId, displayName } = req.body;

  // Validate request
  if (!roomId || typeof roomId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid room ID'
    });
  }

  if (!playerId || !displayName) {
    return res.status(400).json({
      success: false,
      error: 'Missing playerId or displayName'
    });
  }

  try {
    await ccmService.initialize();

    // Join the room
    const result = await ccmService.joinRoom(roomId, playerId, displayName);

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Error joining CCM room:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to join room',
      details: error.message,
    });
  }
}
