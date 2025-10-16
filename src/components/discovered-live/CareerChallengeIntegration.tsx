/**
 * DLCC (Discovered Live! Career Challenge) Integration
 * Manages the flow from arcade selection to game room
 * Part of the Discovered Live! arcade system
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CareerChallengeHub } from '../career-challenge/CareerChallengeHub';
import { EnhancedGameRoom } from '../career-challenge/EnhancedGameRoom';
import { Shield } from 'lucide-react';

type GameState = 'menu' | 'hub' | 'room';

interface CareerChallengeIntegrationProps {
  studentId: string;
  studentName: string;
  gradeCategory?: 'elementary' | 'middle' | 'high';
  onExit: () => void;
}

export const CareerChallengeIntegration: React.FC<CareerChallengeIntegrationProps> = ({
  studentId,
  studentName,
  gradeCategory,
  onExit
}) => {
  const [gameState, setGameState] = useState<GameState>('hub');
  const [currentRoom, setCurrentRoom] = useState<{
    roomCode: string;
    industryId: string;
    industryName: string;
  } | null>(null);

  // Handle starting a game from the hub
  const handleStartGame = (roomCode: string, industryId: string) => {
    // Would need to fetch industry name from service
    setCurrentRoom({
      roomCode,
      industryId,
      industryName: 'Loading...' // This would be fetched
    });
    setGameState('room');
  };

  // Handle leaving a game room
  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setGameState('hub');
  };

  // Handle going back to arcade
  const handleBackToArcade = () => {
    onExit();
  };

  return (
    <AnimatePresence mode="wait">
      {gameState === 'hub' && (
        <motion.div
          key="hub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <CareerChallengeHub
            playerId={studentId}
            playerName={studentName}
            gradeCategory={gradeCategory}
            onBack={handleBackToArcade}
            onStartGame={handleStartGame}
          />
        </motion.div>
      )}

      {gameState === 'room' && currentRoom && (
        <motion.div
          key="room"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <EnhancedGameRoom
            roomCode={currentRoom.roomCode}
            playerId={studentId}
            playerName={studentName}
            industryId={currentRoom.industryId}
            industryName={currentRoom.industryName}
            gradeCategory={gradeCategory}
            onLeave={handleLeaveRoom}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CareerChallengeIntegration;