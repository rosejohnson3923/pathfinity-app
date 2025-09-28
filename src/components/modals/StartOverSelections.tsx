/**
 * StartOverSelections Component
 *
 * Dual-selection modal for changing career and/or companion
 * Features:
 * - Pre-selected current choices
 * - Career category filtering
 * - Companion grid selection
 * - Smart navigation based on changes
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Sparkles, Briefcase, Users } from 'lucide-react';
import { CAREER_CATEGORIES, CAREER_BASICS } from '../../data/careerBasicsData';
import { useAuthContext } from '../../contexts/AuthContext';
import { useThemeContext } from '../../contexts/ThemeContext';
import { azureAudioService } from '../../services/azureAudioService';
import { getCompanionImageUrl } from '../../services/aiCompanionImages';
import styles from './StartOverSelections.module.css';

interface StartOverSelectionsProps {
  currentCareer: string;
  currentCompanion: string;
  onConfirm: (selections: { career: string; companion: string; changed: 'career' | 'companion' | 'both' | 'none' }) => void;
  onCancel: () => void;
}

interface CompanionOption {
  id: string;
  name: string;
  personality: string;
  color: string;
  emoji: string;
}

const COMPANIONS: CompanionOption[] = [
  {
    id: 'finn',
    name: 'Finn',
    personality: 'Friendly & Encouraging',
    color: '#3B82F6',
    emoji: '🎨'
  },
  {
    id: 'sage',
    name: 'Sage',
    personality: 'Wise & Patient',
    color: '#8B5CF6',
    emoji: '🦉'
  },
  {
    id: 'harmony',
    name: 'Harmony',
    personality: 'Calm & Supportive',
    color: '#EC4899',
    emoji: '🌸'
  },
  {
    id: 'spark',
    name: 'Spark',
    personality: 'Creative & Energetic',
    color: '#F59E0B',
    emoji: '⚡'
  }
];

export const StartOverSelections: React.FC<StartOverSelectionsProps> = ({
  currentCareer,
  currentCompanion,
  onConfirm,
  onCancel
}) => {
  const { user } = useAuthContext();
  const { theme } = useThemeContext();

  // State for selections
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCareer, setSelectedCareer] = useState<string>(currentCareer);
  const [selectedCompanion, setSelectedCompanion] = useState<string>(currentCompanion);
  const [isConfirming, setIsConfirming] = useState(false);

  // Get grade level for filtering careers
  const gradeLevel = user?.grade_level || 'K';
  const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);

  // Initialize category based on current career
  useEffect(() => {
    const currentCareerData = CAREER_BASICS[currentCareer.toLowerCase().replace(/\s+/g, '-')];
    if (currentCareerData) {
      setSelectedCategory(currentCareerData.category);
    }
  }, [currentCareer]);

  // Filter careers by grade and category
  const getAvailableCareers = () => {
    return Object.values(CAREER_BASICS).filter(career => {
      const gradeMatch = career.gradeRange.min <= gradeNum && career.gradeRange.max >= gradeNum;
      const categoryMatch = !selectedCategory || career.category === selectedCategory;
      return gradeMatch && categoryMatch;
    });
  };

  // Get unique categories for current grade
  const getAvailableCategories = () => {
    const categories = new Set<string>();
    Object.values(CAREER_BASICS).forEach(career => {
      if (career.gradeRange.min <= gradeNum && career.gradeRange.max >= gradeNum) {
        categories.add(career.category);
      }
    });
    return Array.from(categories);
  };

  // Determine what changed
  const getChangedItems = () => {
    const careerChanged = selectedCareer !== currentCareer;
    const companionChanged = selectedCompanion !== currentCompanion;

    if (careerChanged && companionChanged) return 'both';
    if (careerChanged) return 'career';
    if (companionChanged) return 'companion';
    return 'none';
  };

  const handleConfirm = async () => {
    setIsConfirming(true);

    // Play confirmation sound
    const changedItems = getChangedItems();
    let confirmText = '';

    switch (changedItems) {
      case 'both':
        confirmText = `Great choices! Your new career as a ${selectedCareer} with ${selectedCompanion} starts now!`;
        break;
      case 'career':
        confirmText = `Excellent! Let's explore your new career as a ${selectedCareer}!`;
        break;
      case 'companion':
        confirmText = `Wonderful! Get ready to meet ${selectedCompanion}!`;
        break;
      default:
        confirmText = `Let's continue your journey!`;
    }

    // Use Pat's voice for the confirmation
    await azureAudioService.playText(confirmText, 'pat', {
      scriptId: 'selections.confirmed',
      variables: {
        career: selectedCareer,
        companion: selectedCompanion
      }
    });

    setTimeout(() => {
      onConfirm({
        career: selectedCareer,
        companion: selectedCompanion,
        changed: changedItems as 'career' | 'companion' | 'both' | 'none'
      });
    }, 500);
  };

  const availableCategories = getAvailableCategories();
  const availableCareers = getAvailableCareers();

  return (
    <div className={styles.modalOverlay}>
      <motion.div
        className={styles.modalContent}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2>Choose Your Adventure</h2>
          <p>Select your career and learning companion</p>
        </div>

        {/* Main Content - Split View */}
        <div className={styles.splitView}>
          {/* Left Panel - Career Selection */}
          <div className={styles.careerPanel}>
            <div className={styles.panelHeader}>
              <Briefcase className={styles.panelIcon} />
              <h3>Select Career</h3>
            </div>

            {/* Category Filter */}
            <div className={styles.categoryFilter}>
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.categorySelect}
              >
                <option value="">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Career Grid */}
            <div className={styles.careerGrid}>
              {availableCareers.map(career => (
                <motion.div
                  key={career.id}
                  className={`${styles.careerCard} ${
                    selectedCareer === career.name ? styles.selected : ''
                  } ${career.name === currentCareer ? styles.current : ''}`}
                  onClick={() => setSelectedCareer(career.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={styles.careerIcon}>{career.icon}</div>
                  <div className={styles.careerName}>{career.name}</div>
                  {career.name === currentCareer && (
                    <div className={styles.currentBadge}>Current</div>
                  )}
                  {selectedCareer === career.name && (
                    <Check className={styles.checkIcon} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Right Panel - Companion Selection */}
          <div className={styles.companionPanel}>
            <div className={styles.panelHeader}>
              <Users className={styles.panelIcon} />
              <h3>Select Companion</h3>
            </div>

            {/* Companion Grid */}
            <div className={styles.companionGrid}>
              {COMPANIONS.map(companion => (
                <motion.div
                  key={companion.id}
                  className={`${styles.companionCard} ${
                    selectedCompanion === companion.id ? styles.selected : ''
                  } ${companion.id === currentCompanion ? styles.current : ''}`}
                  onClick={() => setSelectedCompanion(companion.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ borderColor: companion.color }}
                >
                  <div className={styles.companionEmoji}>
                    <img
                      src={getCompanionImageUrl(companion.id, theme || 'dark')}
                      alt={companion.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                  <div className={styles.companionName}>{companion.name}</div>
                  <div className={styles.companionPersonality}>{companion.personality}</div>
                  {companion.id === currentCompanion && (
                    <div className={styles.currentBadge}>Current</div>
                  )}
                  {selectedCompanion === companion.id && (
                    <Check className={styles.checkIcon} style={{ color: companion.color }} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Current vs New Summary */}
        <div className={styles.changeSummary}>
          <div className={styles.changeItem}>
            <span className={styles.changeLabel}>Career:</span>
            {selectedCareer !== currentCareer ? (
              <>
                <span className={styles.oldValue}>{currentCareer}</span>
                <ChevronRight className={styles.arrow} />
                <span className={styles.newValue}>{selectedCareer}</span>
              </>
            ) : (
              <span className={styles.unchangedValue}>{currentCareer} (unchanged)</span>
            )}
          </div>
          <div className={styles.changeItem}>
            <span className={styles.changeLabel}>Companion:</span>
            {selectedCompanion !== currentCompanion ? (
              <>
                <span className={styles.oldValue}>{currentCompanion}</span>
                <ChevronRight className={styles.arrow} />
                <span className={styles.newValue}>{selectedCompanion}</span>
              </>
            ) : (
              <span className={styles.unchangedValue}>{currentCompanion} (unchanged)</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isConfirming}
          >
            Cancel
          </button>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <>Processing...</>
            ) : (
              <>
                <Sparkles className={styles.buttonIcon} />
                Confirm Selections
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};