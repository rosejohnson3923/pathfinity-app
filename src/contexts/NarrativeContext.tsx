/**
 * Narrative Context
 * Manages Master Narrative generation and persistence across the entire user session
 * Generates narrative once at login and provides it to all components
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { contentOrchestratorWithCache } from '../services/ContentOrchestratorWithCache';
import { azureAudioService } from '../services/azureAudioService';

interface NarrativeContextType {
  masterNarrative: any | null;
  narrativeLoading: boolean;
  narrativeError: string | null;
  companionId: string;
  selectedCareer: string | null;
  gradeLevel: string;
  generateNarrative: (params: {
    career: string;
    companion: string;
    gradeLevel: string;
    userId: string;
    userName?: string;
  }) => Promise<void>;
  playNarrativeSection: (section: 'greeting' | 'introduction' | 'mission') => void;
  stopAudio: () => void;
}

const NarrativeContext = createContext<NarrativeContextType | undefined>(undefined);

export const useNarrative = () => {
  const context = useContext(NarrativeContext);
  if (!context) {
    throw new Error('useNarrative must be used within a NarrativeProvider');
  }
  return context;
};

interface NarrativeProviderProps {
  children: React.ReactNode;
}

export const NarrativeProvider: React.FC<NarrativeProviderProps> = ({ children }) => {
  const [masterNarrative, setMasterNarrative] = useState<any | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);
  const [companionId, setCompanionId] = useState<string>('finn');
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [gradeLevel, setGradeLevel] = useState<string>('K');

  const generateNarrative = useCallback(async (params: {
    career: string | { id: string; name: string };
    companion: string;
    gradeLevel: string;
    userId: string;
    userName?: string;
  }) => {
    console.warn('🎭 NARRATIVE CONTEXT: Generating Master Narrative', params);

    // Extract career name and id
    const careerName = typeof params.career === 'string' ? params.career : params.career.name;
    const careerId = typeof params.career === 'string' ? params.career.toLowerCase() : params.career.id;

    setNarrativeLoading(true);
    setNarrativeError(null);
    setCompanionId(params.companion.toLowerCase());
    setSelectedCareer(careerName);
    setGradeLevel(params.gradeLevel);

    try {
      // Check cache first - use careerId for more specific caching
      const cacheKey = `narrative_${params.userId}_${careerId}_${params.companion}_${params.gradeLevel}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        console.warn('🎭 NARRATIVE CONTEXT: Using cached narrative');
        const parsedNarrative = JSON.parse(cached);
        setMasterNarrative(parsedNarrative);
        setNarrativeLoading(false);

        // Don't play audio here - let each screen control when to play
        console.log('🎭 NARRATIVE CONTEXT: Using cached narrative, ready for playback');
        return;
      }

      // Generate learning journey which includes the master narrative
      const journeyContent = await contentOrchestratorWithCache.generateLearningJourney({
        studentName: params.userName || 'Student',
        studentId: params.userId,
        gradeLevel: params.gradeLevel,
        career: careerName,
        careerId: careerId,
        selectedCharacter: params.companion,
        subjects: ['math', 'ela', 'science', 'socialStudies'],
        useCache: true,
        forceRegenerate: false
      });

      const narrative = journeyContent.narrative;

      console.warn('🎭 NARRATIVE CONTEXT: Narrative generated successfully', {
        hasNarrative: !!narrative,
        keys: narrative ? Object.keys(narrative) : []
      });

      // Cache the narrative
      sessionStorage.setItem(cacheKey, JSON.stringify(narrative));

      setMasterNarrative(narrative);
      setNarrativeLoading(false);

      // Don't play greeting here - let each screen control when to play audio
      // The CareerIncLobby will play introduction when it mounts
      console.log('🎭 NARRATIVE CONTEXT: Narrative ready for audio playback');

    } catch (error) {
      console.error('🎭 NARRATIVE CONTEXT: Failed to generate narrative', error);
      setNarrativeError('Failed to generate narrative');
      setNarrativeLoading(false);
    }
  }, []);

  const playNarrativeSection = useCallback((section: 'greeting' | 'introduction' | 'mission') => {
    if (masterNarrative) {
      console.warn('🎭 NARRATIVE CONTEXT: Playing section', section);
      azureAudioService.playNarrativeSection(masterNarrative, section, companionId);
    } else {
      console.warn('🎭 NARRATIVE CONTEXT: No narrative available to play');
    }
  }, [masterNarrative, companionId]);

  const stopAudio = useCallback(() => {
    azureAudioService.stop();
  }, []);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      azureAudioService.stop();
    };
  }, []);

  const value: NarrativeContextType = {
    masterNarrative,
    narrativeLoading,
    narrativeError,
    companionId,
    selectedCareer,
    gradeLevel,
    generateNarrative,
    playNarrativeSection,
    stopAudio
  };

  return (
    <NarrativeContext.Provider value={value}>
      {children}
    </NarrativeContext.Provider>
  );
};