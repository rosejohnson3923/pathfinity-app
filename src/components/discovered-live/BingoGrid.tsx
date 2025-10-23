/**
 * Bingo Grid Component (Real Database Version)
 *
 * 5×5 grid of career squares for Career Bingo
 * Center square is usually pre-unlocked (FREE space)
 *
 * Features:
 * - Glass styling for squares
 * - Locked/unlocked states
 * - Click to answer (sends to GameOrchestrator)
 * - Career icons and names
 * - Text truncation with tooltips
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { GridPosition } from '../../types/DiscoveredLiveMultiplayerTypes';

interface BingoGridProps {
  grid: string[][]; // 5×5 array of career codes
  unlocked: GridPosition[]; // Array of {row, col} positions
  onSquareClick: (row: number, col: number) => void;
  disabled?: boolean;
  careerDetails?: Map<string, { careerName: string; icon: string; }>; // Optional career details from database
}

const careerIcons: Record<string, string> = {
  'Chef': '👨‍🍳', 'Teacher': '👩‍🏫', 'Doctor': '👨‍⚕️', 'Nurse': '👩‍⚕️',
  'Firefighter': '👨‍🚒', 'Programmer': '👨‍💻', 'Artist': '👨‍🎨', 'Musician': '👨‍🎤',
  'Scientist': '👨‍🔬', 'Engineer': '👨‍🔧', 'Pilot': '👨‍✈️', 'Lawyer': '⚖️',
  'Architect': '📐', 'Writer': '✍️', 'Mechanic': '🔧', 'Electrician': '⚡',
  'Farmer': '👨‍🌾', 'Librarian': '📚', 'Dentist': '🦷', 'Veterinarian': '👨‍⚕️',
  'Photographer': '📷', 'Police Officer': '👮', 'Athlete': '⛹️', 'Plumber': '🔧',
  'Accountant': '💰'
};

export const BingoGrid: React.FC<BingoGridProps> = ({
  grid,
  unlocked,
  onSquareClick,
  disabled = false,
  careerDetails
}) => {
  // Helper to check if a position is unlocked
  const isPositionUnlocked = (row: number, col: number): boolean => {
    return unlocked.some(pos => pos.row === row && pos.col === col);
  };

  // Helper to get career name from code or database
  const getCareerName = (careerCode: string): string => {
    // Try to get from database first
    if (careerDetails && careerDetails.has(careerCode)) {
      return careerDetails.get(careerCode)!.careerName;
    }

    // Fallback: Convert kebab-case to Title Case
    return careerCode
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper to get career icon from database or fallback
  const getCareerIcon = (careerCode: string, careerName: string): string => {
    // Try to get from database first
    if (careerDetails && careerDetails.has(careerCode)) {
      return careerDetails.get(careerCode)!.icon || '💼';
    }

    // Fallback: Use hardcoded lookup by name
    return careerIcons[careerName] || '💼';
  };

  // Helper to format career name with word wrap for long names
  const formatCareerName = (careerName: string): string => {
    // If total chars (including space) > 14 AND has 2+ words, wrap to 2 lines
    if (careerName.length > 14 && careerName.includes(' ')) {
      const words = careerName.split(' ');
      if (words.length >= 2) {
        // Move second word (and any remaining) to next line
        return `${words[0]}\n${words.slice(1).join(' ')}`;
      }
    }
    return careerName;
  };

  return (
    <div className="glass-bingo-container w-full">
      <div className="grid gap-1.5 w-full" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {grid.map((rowCareers, row) =>
          rowCareers.map((careerCode, col) => {
            const idx = row * 5 + col;
            const isCenter = row === 2 && col === 2;
            const isUnlocked = isPositionUnlocked(row, col);
            const careerName = getCareerName(careerCode);
            const formattedName = formatCareerName(careerName);
            const icon = getCareerIcon(careerCode, careerName);

            return (
              <motion.button
                key={`${row}-${col}`}
                onClick={() => !disabled && !isUnlocked && onSquareClick(row, col)}
                disabled={disabled || isUnlocked}
                className={`
                  glass-bingo-square
                  aspect-square
                  w-full
                  flex flex-col items-center justify-center
                  text-center
                  ${isCenter ? 'glass-bingo-square-center' : ''}
                  ${isUnlocked ? 'glass-bingo-square-unlocked' : ''}
                  ${!isUnlocked && !disabled ? 'cursor-pointer' : 'cursor-default'}
                `}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                whileHover={!isUnlocked && !disabled ? { scale: 1.05 } : {}}
                title={careerName}
              >
                {/* Content wrapper - positioned above background and overlay */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  {/* Career Icon - EXTRA LARGE */}
                  <div className={`text-6xl ${!isUnlocked && !isCenter ? 'opacity-90' : ''}`}>
                    {icon}
                  </div>

                  {/* Career Name - LARGER */}
                  <div
                    className={`text-base font-bold leading-tight mt-1 ${
                      isUnlocked || isCenter
                        ? 'text-white drop-shadow-md'
                        : 'text-white/90 drop-shadow-md'
                    }`}
                    style={{
                      maxWidth: '100%',
                      whiteSpace: 'pre-line', // Respect newline characters for word wrap
                      textAlign: 'center'
                    }}
                  >
                    {formattedName}
                  </div>

                  {/* Center Star Badge */}
                  {isCenter && (
                    <motion.div
                      className="text-base mt-1 text-yellow-300 font-black drop-shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                    >
                      ⭐ FREE
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 text-center">
        <div className="text-white/90 font-semibold">
          {unlocked.length} / 25 Squares Unlocked
        </div>
      </div>
    </div>
  );
};

export default BingoGrid;
