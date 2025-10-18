/**
 * Career Challenge Multiplayer Page
 * Main entry point for CCM - routes between Hub and Game Room
 */

import React, { useState } from 'react';
import { CCMHub } from '../components/ccm/CCMHub';
import { CCMGameRoom } from '../components/ccm/CCMGameRoom';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export const CCMPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [view, setView] = useState<'hub' | 'game'>('hub');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);

  const playerId = user?.id || 'guest-' + Math.random().toString(36).slice(2);
  const playerName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Player';

  const handleBack = () => {
    navigate('/discovered-live');
  };

  const handleJoinRoom = (roomId: string, roomCode: string) => {
    setCurrentRoomId(roomId);
    setCurrentRoomCode(roomCode);
    setView('game');
  };

  const handleLeaveRoom = () => {
    setCurrentRoomId(null);
    setCurrentRoomCode(null);
    setView('hub');
  };

  return (
    <div className="min-h-screen">
      {view === 'hub' && (
        <CCMHub
          playerId={playerId}
          playerName={playerName}
          onBack={handleBack}
          onJoinRoom={handleJoinRoom}
        />
      )}

      {view === 'game' && currentRoomId && currentRoomCode && (
        <CCMGameRoom
          roomId={currentRoomId}
          roomCode={currentRoomCode}
          playerId={playerId}
          playerName={playerName}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  );
};

export default CCMPage;
