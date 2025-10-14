/**
 * Sound Effects Hook
 * React hook for using sound effects in components
 *
 * Features:
 * - Easy access to sound playback
 * - Volume controls
 * - Mute/unmute
 * - Loading status
 */

import { useEffect, useState, useCallback } from 'react';
import { soundEffectsService } from '../services/SoundEffectsService';

interface SoundEffectsHook {
  // Playback
  playTimerSound: (timeRemaining: number) => void;
  playAnswerFeedback: (isCorrect: boolean, isFast?: boolean) => void;
  playBingoCelebration: (bingoNumber: number) => void;
  playGameStart: () => void;
  playGameComplete: () => void;
  playQuestionStart: () => void;
  playCountdown: () => void;
  playClick: () => void;
  playJoinRoom: () => void;
  playLeaveRoom: () => void;
  playSpectatorMode: () => void;

  // Music
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;

  // Controls
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;

  // State
  isMuted: boolean;
  volumes: { master: number; music: number; sfx: number };
  isInitialized: boolean;
  loadingProgress: number;
}

/**
 * Hook for using sound effects
 */
export function useSoundEffects(initializeOnMount: boolean = true): SoundEffectsHook {
  const [isMuted, setIsMuted] = useState(soundEffectsService.isSoundMuted());
  const [volumes, setVolumes] = useState(soundEffectsService.getVolumes());
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Initialize on mount
  useEffect(() => {
    if (initializeOnMount) {
      soundEffectsService.initialize().then(() => {
        setIsInitialized(true);
        const status = soundEffectsService.getLoadingStatus();
        setLoadingProgress(status.percentage);
      });
    }

    // Check loading progress
    const interval = setInterval(() => {
      const status = soundEffectsService.getLoadingStatus();
      setLoadingProgress(status.percentage);
      if (status.percentage === 100) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [initializeOnMount]);

  // Playback functions
  const playTimerSound = useCallback((timeRemaining: number) => {
    soundEffectsService.playTimerSound(timeRemaining);
  }, []);

  const playAnswerFeedback = useCallback((isCorrect: boolean, isFast?: boolean) => {
    soundEffectsService.playAnswerFeedback(isCorrect, isFast);
  }, []);

  const playBingoCelebration = useCallback((bingoNumber: number) => {
    soundEffectsService.playBingoCelebration(bingoNumber);
  }, []);

  const playGameStart = useCallback(() => {
    soundEffectsService.playGameStart();
  }, []);

  const playGameComplete = useCallback(() => {
    soundEffectsService.playGameComplete();
  }, []);

  const playQuestionStart = useCallback(() => {
    soundEffectsService.playQuestionStart();
  }, []);

  const playCountdown = useCallback(() => {
    soundEffectsService.playCountdown();
  }, []);

  const playClick = useCallback(() => {
    soundEffectsService.playClick();
  }, []);

  const playJoinRoom = useCallback(() => {
    soundEffectsService.playJoinRoom();
  }, []);

  const playLeaveRoom = useCallback(() => {
    soundEffectsService.playLeaveRoom();
  }, []);

  const playSpectatorMode = useCallback(() => {
    soundEffectsService.playSpectatorMode();
  }, []);

  // Music functions
  const startBackgroundMusic = useCallback(() => {
    soundEffectsService.startBackgroundMusic();
  }, []);

  const stopBackgroundMusic = useCallback(() => {
    soundEffectsService.stopBackgroundMusic();
  }, []);

  // Control functions
  const mute = useCallback(() => {
    soundEffectsService.mute();
    setIsMuted(true);
  }, []);

  const unmute = useCallback(() => {
    soundEffectsService.unmute();
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    soundEffectsService.toggleMute();
    setIsMuted(soundEffectsService.isSoundMuted());
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    soundEffectsService.setMasterVolume(volume);
    setVolumes(soundEffectsService.getVolumes());
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    soundEffectsService.setMusicVolume(volume);
    setVolumes(soundEffectsService.getVolumes());
  }, []);

  const setSfxVolume = useCallback((volume: number) => {
    soundEffectsService.setSfxVolume(volume);
    setVolumes(soundEffectsService.getVolumes());
  }, []);

  return {
    // Playback
    playTimerSound,
    playAnswerFeedback,
    playBingoCelebration,
    playGameStart,
    playGameComplete,
    playQuestionStart,
    playCountdown,
    playClick,
    playJoinRoom,
    playLeaveRoom,
    playSpectatorMode,

    // Music
    startBackgroundMusic,
    stopBackgroundMusic,

    // Controls
    mute,
    unmute,
    toggleMute,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,

    // State
    isMuted,
    volumes,
    isInitialized,
    loadingProgress,
  };
}

/**
 * Hook for timer sounds (automatically plays based on time remaining)
 */
export function useTimerSounds(timeRemaining: number, isActive: boolean) {
  const { playTimerSound } = useSoundEffects(false);

  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    // Play sound at specific time thresholds
    if (timeRemaining === 10 || timeRemaining === 5 || timeRemaining === 3 || timeRemaining === 2 || timeRemaining === 1) {
      playTimerSound(timeRemaining);
    }
  }, [timeRemaining, isActive, playTimerSound]);
}
