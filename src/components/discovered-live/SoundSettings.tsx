/**
 * Sound Settings Component
 * UI for controlling game sounds
 *
 * Features:
 * - Master volume slider
 * - Music volume slider
 * - SFX volume slider
 * - Mute/unmute button
 * - Visual feedback
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Music, Zap } from 'lucide-react';
import { useSoundEffects } from '../../hooks/useSoundEffects';

export interface SoundSettingsProps {
  compact?: boolean;
  showLabels?: boolean;
  className?: string;
}

/**
 * SoundSettings Component
 */
export const SoundSettings: React.FC<SoundSettingsProps> = ({
  compact = false,
  showLabels = true,
  className = '',
}) => {
  const {
    isMuted,
    volumes,
    toggleMute,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    playClick,
  } = useSoundEffects(false);

  const handleMuteToggle = () => {
    toggleMute();
    if (!isMuted) {
      playClick();
    }
  };

  const handleMasterVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setMasterVolume(volume);
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setMusicVolume(volume);
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setSfxVolume(volume);
    playClick();
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Mute Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMuteToggle}
          className={`
            p-2 rounded-lg transition-colors
            ${isMuted
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }
          `}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </motion.button>

        {/* Master Volume */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-gray-500" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volumes.master}
            onChange={handleMasterVolumeChange}
            disabled={isMuted}
            className="w-20 accent-purple-600"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
            {Math.round(volumes.master * 100)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Sound Settings
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMuteToggle}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
            ${isMuted
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            }
          `}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-5 h-5" />
              <span>Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              <span>Unmute</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Volume Controls */}
      <div className="space-y-6">
        {/* Master Volume */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {showLabels && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Master Volume
                </label>
              )}
            </div>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {Math.round(volumes.master * 100)}%
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumes.master}
              onChange={handleMasterVolumeChange}
              disabled={isMuted}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600 bg-gray-200 dark:bg-gray-700"
            />
            {/* Visual fill indicator */}
            <div
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg pointer-events-none"
              style={{ width: `${volumes.master * 100}%` }}
            />
          </div>
        </div>

        {/* Music Volume */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {showLabels && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Music Volume
                </label>
              )}
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {Math.round(volumes.music * 100)}%
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumes.music}
              onChange={handleMusicVolumeChange}
              disabled={isMuted}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-gray-200 dark:bg-gray-700"
            />
            <div
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg pointer-events-none"
              style={{ width: `${volumes.music * 100}%` }}
            />
          </div>
        </div>

        {/* SFX Volume */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              {showLabels && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sound Effects
                </label>
              )}
            </div>
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
              {Math.round(volumes.sfx * 100)}%
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumes.sfx}
              onChange={handleSfxVolumeChange}
              disabled={isMuted}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-orange-600 bg-gray-200 dark:bg-gray-700"
            />
            <div
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg pointer-events-none"
              style={{ width: `${volumes.sfx * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Info Text */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Sound settings are saved automatically
        </p>
      </div>
    </div>
  );
};

export default SoundSettings;
