/**
 * Career Challenge Multiplayer Page
 * Main entry point for CCM - routes between Hub and Game Room
 */

import React, { useState } from 'react';
import { CCMHub } from '../components/ccm/CCMHub';
import { CCMGameRoom } from '../components/ccm/CCMGameRoom';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { AICharacterProvider } from '../components/ai-characters/AICharacterProvider';

export const CCMPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [view, setView] = useState<'hub' | 'game'>('hub');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);

  const playerId = user?.id || 'guest-' + Math.random().toString(36).slice(2);

  // Format player name as "First Name Last Initial" to match AI players
  const getFormattedPlayerName = (): string => {
    if (user?.full_name) {
      const nameParts = user.full_name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        // Has first and last name: "John Doe" -> "John D."
        const firstName = nameParts[0];
        const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();
        return `${firstName} ${lastInitial}.`;
      } else if (nameParts.length === 1) {
        // Only one name: "John" -> "John P." (P for Player)
        return `${nameParts[0]} P.`;
      }
    }

    if (user?.email) {
      // Use email username: "john@example.com" -> "John P."
      const emailName = user.email.split('@')[0];
      const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      return `${capitalizedName} P.`;
    }

    // Fallback
    return 'Player P.';
  };

  const playerName = getFormattedPlayerName();

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
        <AICharacterProvider>
          <CCMGameRoom
            roomId={currentRoomId}
            roomCode={currentRoomCode}
            playerId={playerId}
            playerName={playerName}
            onLeave={handleLeaveRoom}
          />
        </AICharacterProvider>
      )}
    </div>
  );
};

export default CCMPage;
