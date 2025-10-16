/**
 * Sound Settings Component
 * Allows users to control game audio preferences
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Music,
  Zap,
  Settings,
  X
} from 'lucide-react';
import { soundManager } from '../../services/CareerChallengeSoundManager';

interface SoundSettingsProps {
  isOpen?: boolean;
  onClose?: () => void;
  compact?: boolean;
}

export const SoundSettings: React.FC<SoundSettingsProps> = ({
  isOpen = false,
  onClose,
  compact = false
}) => {
  const [settings, setSettings] = useState(soundManager.getVolumeSettings());
  const [showPanel, setShowPanel] = useState(isOpen);

  useEffect(() => {
    setShowPanel(isOpen);
  }, [isOpen]);

  const handleMasterVolumeChange = (value: number) => {
    soundManager.setMasterVolume(value);
    setSettings(soundManager.getVolumeSettings());
  };

  const handleMusicVolumeChange = (value: number) => {
    soundManager.setMusicVolume(value);
    setSettings(soundManager.getVolumeSettings());
  };

  const handleSFXVolumeChange = (value: number) => {
    soundManager.setSFXVolume(value);
    setSettings(soundManager.getVolumeSettings());
  };

  const handleToggleMute = () => {
    soundManager.toggleMute();
    setSettings(soundManager.getVolumeSettings());
  };

  const handleClose = () => {
    setShowPanel(false);
    onClose?.();
  };

  // Compact mode - just a mute toggle button
  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleMute}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        title={settings.isMuted ? 'Unmute' : 'Mute'}
      >
        {settings.isMuted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </motion.button>
    );
  }

  return (
    <>
      {/* Settings Button */}
      {!showPanel && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPanel(true)}
          className="fixed bottom-20 right-8 p-3 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition-colors z-40"
        >
          <Settings className="w-6 h-6 text-white" />
        </motion.button>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-4 top-1/2 -translate-y-1/2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Sound Settings
                </h3>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Mute Toggle */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Mute All Sounds
                </span>
                <button
                  onClick={handleToggleMute}
                  className={`
                    relative w-14 h-8 rounded-full transition-colors
                    ${settings.isMuted ? 'bg-gray-400' : 'bg-purple-600'}
                  `}
                >
                  <motion.div
                    animate={{ x: settings.isMuted ? 2 : 26 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              {/* Master Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Master Volume
                  </label>
                  <span className="text-sm text-gray-500">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.masterVolume * 100}
                    onChange={(e) => handleMasterVolumeChange(Number(e.target.value) / 100)}
                    disabled={settings.isMuted}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    style={{
                      background: `linear-gradient(to right, #9333ea 0%, #9333ea ${
                        settings.masterVolume * 100
                      }%, #e5e7eb ${settings.masterVolume * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>

              {/* Music Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Music Volume
                  </label>
                  <span className="text-sm text-gray-500">
                    {Math.round(settings.musicVolume * 100)}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.musicVolume * 100}
                    onChange={(e) => handleMusicVolumeChange(Number(e.target.value) / 100)}
                    disabled={settings.isMuted}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                        settings.musicVolume * 100
                      }%, #e5e7eb ${settings.musicVolume * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>

              {/* SFX Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Effects Volume
                  </label>
                  <span className="text-sm text-gray-500">
                    {Math.round(settings.sfxVolume * 100)}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sfxVolume * 100}
                    onChange={(e) => handleSFXVolumeChange(Number(e.target.value) / 100)}
                    disabled={settings.isMuted}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                        settings.sfxVolume * 100
                      }%, #e5e7eb ${settings.sfxVolume * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>

              {/* Test Sounds */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Test Sound Effects
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => soundManager.playSFX('buttonClick')}
                    disabled={settings.isMuted}
                    className="py-2 px-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Click
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => soundManager.playSFX('cardSelect')}
                    disabled={settings.isMuted}
                    className="py-2 px-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Card
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => soundManager.playSFX('achievement')}
                    disabled={settings.isMuted}
                    className="py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Win
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SoundSettings;