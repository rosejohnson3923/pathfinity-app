/**
 * Companion Audio Controls Component
 * Provides playback controls for companion voice narration
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react';
import { companionAudioService } from '../../services/CompanionAudioService';
import styles from './CompanionAudioControls.module.css';

interface CompanionAudioControlsProps {
  companion?: string;
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
  showLabel?: boolean;
  theme?: 'light' | 'dark';
}

export const CompanionAudioControls: React.FC<CompanionAudioControlsProps> = ({
  companion = 'Finn',
  className = '',
  position = 'bottom-right',
  showLabel = false,
  theme = 'light'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);

  // Monitor audio playback state
  useEffect(() => {
    const checkPlaybackState = setInterval(() => {
      // This would need to be enhanced with actual state from CompanionAudioService
      // For now, it's a placeholder
    }, 500);

    return () => clearInterval(checkPlaybackState);
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      companionAudioService.stopCurrent();
      setIsPlaying(false);
    } else {
      companionAudioService.togglePlayback();
      setIsPlaying(true);
    }
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    // Would need to implement volume control in CompanionAudioService
  };

  const handleSkip = () => {
    companionAudioService.stopCurrent();
    setIsPlaying(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    // Would need to implement volume control in CompanionAudioService
  };

  const containerClass = `
    ${styles.audioControls}
    ${styles[`position-${position}`]}
    ${styles[`theme-${theme}`]}
    ${className}
  `;

  return (
    <div className={containerClass}>
      {showLabel && (
        <div className={styles.label}>
          <span className={styles.companionName}>{companion}</span>
          <span className={styles.status}>{isPlaying ? 'Speaking' : 'Ready'}</span>
        </div>
      )}

      <div className={styles.controls}>
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className={styles.controlButton}
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className={styles.controlButton}
          title="Skip"
          aria-label="Skip narration"
          disabled={!isPlaying}
        >
          <SkipForward size={20} />
        </button>

        {/* Volume Controls */}
        <div className={styles.volumeControl}>
          <button
            onClick={handleMute}
            className={styles.controlButton}
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute narration' : 'Mute narration'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Volume Slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
            aria-label="Volume control"
          />
        </div>
      </div>

      {/* Visual indicator when speaking */}
      {isPlaying && (
        <div className={styles.speakingIndicator}>
          <span className={styles.pulse}></span>
          <span className={styles.pulse}></span>
          <span className={styles.pulse}></span>
        </div>
      )}
    </div>
  );
};