/**
 * Content Mode Manager
 * Admin UI for controlling content generation modes and settings
 */

import React, { useState, useEffect } from 'react';
import {
  ContentMode,
  ContentVolume,
  contentVolumeCalculator,
  VolumeConstraints
} from '../../services/content/ContentVolumeManager';
import {
  ContentRequest,
  StudentContext,
  CareerContext,
  SkillContext,
  contentRequestBuilder
} from '../../services/content/ContentRequestBuilder';
import { Grade, Subject } from '../../types/questions';
import './ContentModeManager.css';

// ============================================================================
// INTERFACES
// ============================================================================

interface ContentModeManagerProps {
  onModeChange?: (mode: ContentMode) => void;
  onSettingsUpdate?: (settings: ContentSettings) => void;
  currentMode?: ContentMode;
  isDemo?: boolean;
  allowOverrides?: boolean;
}

export interface ContentSettings {
  mode: ContentMode;
  timeLimit: number;
  subjects: Subject[];
  grades: Grade[];
  constraints: VolumeConstraints;
  features: {
    hintsEnabled: boolean;
    adaptiveEnabled: boolean;
    visualsRequired: boolean;
    audioEnabled: boolean;
  };
  overrides: {
    questionCount?: number;
    difficultyLevel?: 'easy' | 'medium' | 'hard' | 'mixed';
    skipAssessment?: boolean;
  };
}

interface ModeStats {
  totalQuestions: number;
  estimatedTime: number;
  questionsPerSubject: number;
  questionsPerContainer: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ContentModeManager: React.FC<ContentModeManagerProps> = ({
  onModeChange,
  onSettingsUpdate,
  currentMode = ContentMode.STANDARD,
  isDemo = false,
  allowOverrides = false
}) => {
  // State
  const [selectedMode, setSelectedMode] = useState<ContentMode>(currentMode);
  const [settings, setSettings] = useState<ContentSettings>({
    mode: currentMode,
    timeLimit: 15,
    subjects: ['Math', 'ELA', 'Science'],
    grades: ['3', '4', '5'],
    constraints: {
      minQuestions: 5,
      maxQuestions: 30,
      minMinutes: 2,
      maxMinutes: 60
    },
    features: {
      hintsEnabled: true,
      adaptiveEnabled: true,
      visualsRequired: false,
      audioEnabled: false
    },
    overrides: {}
  });

  const [modeStats, setModeStats] = useState<ModeStats | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewVolume, setPreviewVolume] = useState<ContentVolume | null>(null);

  // Calculate stats when mode changes
  useEffect(() => {
    const volume = contentVolumeCalculator.getVolumeForMode(selectedMode);
    setModeStats({
      totalQuestions: volume.totalQuestions,
      estimatedTime: volume.estimatedCompletionTime,
      questionsPerSubject: Math.round(volume.totalQuestions / settings.subjects.length),
      questionsPerContainer: Math.round(volume.totalQuestions / 4)
    });
    setPreviewVolume(volume);
  }, [selectedMode, settings.subjects]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleModeSelect = (mode: ContentMode) => {
    setSelectedMode(mode);
    const timeLimit = contentVolumeCalculator.getTimeByMode(mode);
    
    const newSettings = {
      ...settings,
      mode,
      timeLimit
    };
    
    setSettings(newSettings);
    
    if (onModeChange) {
      onModeChange(mode);
    }
    
    if (onSettingsUpdate) {
      onSettingsUpdate(newSettings);
    }
  };

  const handleSubjectToggle = (subject: Subject) => {
    const newSubjects = settings.subjects.includes(subject)
      ? settings.subjects.filter(s => s !== subject)
      : [...settings.subjects, subject];
    
    if (newSubjects.length === 0) return; // Must have at least one subject
    
    updateSettings({ subjects: newSubjects });
  };

  const handleGradeSelect = (grade: Grade) => {
    const newGrades = settings.grades.includes(grade)
      ? settings.grades.filter(g => g !== grade)
      : [...settings.grades, grade];
    
    if (newGrades.length === 0) return; // Must have at least one grade
    
    updateSettings({ grades: newGrades });
  };

  const handleFeatureToggle = (feature: keyof ContentSettings['features']) => {
    updateSettings({
      features: {
        ...settings.features,
        [feature]: !settings.features[feature]
      }
    });
  };

  const handleConstraintChange = (
    constraint: keyof VolumeConstraints,
    value: number
  ) => {
    updateSettings({
      constraints: {
        ...settings.constraints,
        [constraint]: value
      }
    });
  };

  const handleOverrideChange = (
    override: keyof ContentSettings['overrides'],
    value: any
  ) => {
    updateSettings({
      overrides: {
        ...settings.overrides,
        [override]: value
      }
    });
  };

  const updateSettings = (updates: Partial<ContentSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    
    if (onSettingsUpdate) {
      onSettingsUpdate(newSettings);
    }
  };

  const handleApplySettings = () => {
    // Validate settings
    const validation = contentVolumeCalculator.validateVolume(
      previewVolume!,
      settings.constraints
    );

    if (!validation.valid) {
      alert(`Invalid settings: ${validation.errors.join(', ')}`);
      return;
    }

    // Apply settings
    if (onSettingsUpdate) {
      onSettingsUpdate(settings);
    }

    // Show success message
    showNotification('Settings applied successfully!');
  };

  const handleResetToDefaults = () => {
    const defaultSettings: ContentSettings = {
      mode: ContentMode.STANDARD,
      timeLimit: 15,
      subjects: ['Math', 'ELA', 'Science'],
      grades: ['3', '4', '5'],
      constraints: {
        minQuestions: 5,
        maxQuestions: 30,
        minMinutes: 2,
        maxMinutes: 60
      },
      features: {
        hintsEnabled: true,
        adaptiveEnabled: true,
        visualsRequired: false,
        audioEnabled: false
      },
      overrides: {}
    };

    setSettings(defaultSettings);
    setSelectedMode(ContentMode.STANDARD);
    
    if (onSettingsUpdate) {
      onSettingsUpdate(defaultSettings);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderModeCard = (mode: ContentMode) => {
    const isSelected = selectedMode === mode;
    const modeName = contentVolumeCalculator.getModeName(mode);
    const time = contentVolumeCalculator.getTimeByMode(mode);
    
    const modeDescriptions = {
      [ContentMode.DEMO]: 'Quick demonstration with easy questions',
      [ContentMode.TESTING]: 'Short testing session for evaluation',
      [ContentMode.STANDARD]: 'Regular learning session',
      [ContentMode.FULL]: 'Complete curriculum coverage'
    };

    const modeIcons = {
      [ContentMode.DEMO]: '🎯',
      [ContentMode.TESTING]: '🧪',
      [ContentMode.STANDARD]: '📚',
      [ContentMode.FULL]: '🎓'
    };

    return (
      <div
        key={mode}
        className={`mode-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleModeSelect(mode)}
       tabIndex={0} role="button" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); () => handleModeSelect(mode) } }}>
        <div className="mode-icon">{modeIcons[mode]}</div>
        <div className="mode-info">
          <h3>{mode.toUpperCase()}</h3>
          <p className="mode-time">{time} minutes</p>
          <p className="mode-description">{modeDescriptions[mode]}</p>
        </div>
        {isSelected && (
          <div className="mode-selected-badge">✓</div>
        )}
      </div>
    );
  };

  const renderVolumePreview = () => {
    if (!previewVolume) return null;

    return (
      <div className="volume-preview">
        <h3>Volume Preview</h3>
        <div className="preview-stats">
          <div className="stat">
            <span className="stat-label">Total Questions:</span>
            <span className="stat-value">{previewVolume.totalQuestions}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time Required:</span>
            <span className="stat-value">{previewVolume.estimatedCompletionTime} min</span>
          </div>
          <div className="stat">
            <span className="stat-label">Per Container:</span>
            <span className="stat-value">
              D:{previewVolume.questionsPerContainer.discover} | 
              L:{previewVolume.questionsPerContainer.learn} | 
              E:{previewVolume.questionsPerContainer.experience} | 
              3J:{previewVolume.questionsPerContainer.threeJourney}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const showNotification = (message: string) => {
    // Simple notification - in production, use a proper notification system
    const notification = document.createElement('div');
    notification.className = 'admin-notification success';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="content-mode-manager">
      {/* Header */}
      <div className="manager-header">
        <h2>Content Generation Settings</h2>
        {isDemo && (
          <span className="demo-badge">DEMO MODE</span>
        )}
      </div>

      {/* Mode Selection */}
      <div className="mode-selection">
        <h3>Select Content Mode</h3>
        <div className="mode-cards">
          {contentVolumeCalculator.getAllModes().map(renderModeCard)}
        </div>
      </div>

      {/* Current Stats */}
      {modeStats && (
        <div className="current-stats">
          <h3>Current Configuration</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <label>Total Questions</label>
              <value>{modeStats.totalQuestions}</value>
            </div>
            <div className="stat-item">
              <label>Estimated Time</label>
              <value>{modeStats.estimatedTime} minutes</value>
            </div>
            <div className="stat-item">
              <label>Per Subject</label>
              <value>{modeStats.questionsPerSubject} questions</value>
            </div>
            <div className="stat-item">
              <label>Per Container</label>
              <value>{modeStats.questionsPerContainer} questions</value>
            </div>
          </div>
        </div>
      )}

      {/* Subject Selection */}
      <div className="subject-selection">
        <h3>Active Subjects</h3>
        <div className="subject-toggles">
          {(['Math', 'ELA', 'Science', 'Social Studies'] as Subject[]).map(subject => (
            <label key={subject} className="toggle-item">
              <input
                type="checkbox"
                checked={settings.subjects.includes(subject)}
                onChange={() => handleSubjectToggle(subject)}
              />
              <span>{subject}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Grade Selection */}
      <div className="grade-selection">
        <h3>Grade Levels</h3>
        <div className="grade-buttons">
          {(['PreK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as Grade[])
            .map(grade => (
              <button
                key={grade}
                className={`grade-button ${settings.grades.includes(grade) ? 'selected' : ''}`}
                onClick={() => handleGradeSelect(grade)}
              >
                {grade}
              </button>
            ))}
        </div>
      </div>

      {/* Features */}
      <div className="features-section">
        <h3>Features</h3>
        <div className="feature-toggles">
          <label className="feature-toggle">
            <input
              type="checkbox"
              checked={settings.features.hintsEnabled}
              onChange={() => handleFeatureToggle('hintsEnabled')}
            />
            <span>Enable Hints</span>
          </label>
          <label className="feature-toggle">
            <input
              type="checkbox"
              checked={settings.features.adaptiveEnabled}
              onChange={() => handleFeatureToggle('adaptiveEnabled')}
            />
            <span>Adaptive Difficulty</span>
          </label>
          <label className="feature-toggle">
            <input
              type="checkbox"
              checked={settings.features.visualsRequired}
              onChange={() => handleFeatureToggle('visualsRequired')}
            />
            <span>Require Visuals</span>
          </label>
          <label className="feature-toggle">
            <input
              type="checkbox"
              checked={settings.features.audioEnabled}
              onChange={() => handleFeatureToggle('audioEnabled')}
            />
            <span>Audio Support</span>
          </label>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="advanced-section">
        <button
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▼' : '▶'} Advanced Settings
        </button>
        
        {showAdvanced && (
          <div className="advanced-settings">
            {/* Constraints */}
            <div className="constraints-section">
              <h4>Volume Constraints</h4>
              <div className="constraint-inputs">
                <label>
                  <span>Min Questions:</span>
                  <input
                    type="number"
                    value={settings.constraints.minQuestions}
                    onChange={(e) => handleConstraintChange('minQuestions', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </label>
                <label>
                  <span>Max Questions:</span>
                  <input
                    type="number"
                    value={settings.constraints.maxQuestions}
                    onChange={(e) => handleConstraintChange('maxQuestions', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </label>
                <label>
                  <span>Min Minutes:</span>
                  <input
                    type="number"
                    value={settings.constraints.minMinutes}
                    onChange={(e) => handleConstraintChange('minMinutes', parseInt(e.target.value))}
                    min="1"
                    max="240"
                  />
                </label>
                <label>
                  <span>Max Minutes:</span>
                  <input
                    type="number"
                    value={settings.constraints.maxMinutes}
                    onChange={(e) => handleConstraintChange('maxMinutes', parseInt(e.target.value))}
                    min="1"
                    max="240"
                  />
                </label>
              </div>
            </div>

            {/* Overrides */}
            {allowOverrides && (
              <div className="overrides-section">
                <h4>Manual Overrides</h4>
                <div className="override-inputs">
                  <label>
                    <span>Override Question Count:</span>
                    <input
                      type="number"
                      value={settings.overrides.questionCount || ''}
                      onChange={(e) => handleOverrideChange(
                        'questionCount',
                        e.target.value ? parseInt(e.target.value) : undefined
                      )}
                      placeholder="Auto"
                      min="1"
                      max="50"
                    />
                  </label>
                  <label>
                    <span>Difficulty Level:</span>
                    <select
                      value={settings.overrides.difficultyLevel || 'mixed'}
                      onChange={(e) => handleOverrideChange('difficultyLevel', e.target.value)}
                    >
                      <option value="mixed">Mixed</option>
                      <option value="easy">Easy Only</option>
                      <option value="medium">Medium Only</option>
                      <option value="hard">Hard Only</option>
                    </select>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.overrides.skipAssessment || false}
                      onChange={(e) => handleOverrideChange('skipAssessment', e.target.checked)}
                    />
                    <span>Skip Assessment Questions</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Volume Preview */}
      {renderVolumePreview()}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="btn-secondary"
          onClick={handleResetToDefaults}
        >
          Reset to Defaults
        </button>
        <button
          className="btn-primary"
          onClick={handleApplySettings}
        >
          Apply Settings
        </button>
      </div>

      {/* Quick Actions */}
      {isDemo && (
        <div className="quick-actions">
          <h3>Quick Demo Actions</h3>
          <div className="quick-action-buttons">
            <button onClick={() => handleModeSelect(ContentMode.DEMO)}>
              2-Minute Demo
            </button>
            <button onClick={() => handleModeSelect(ContentMode.TESTING)}>
              5-Minute Test
            </button>
            <button onClick={() => {
              handleModeSelect(ContentMode.STANDARD);
              updateSettings({ subjects: ['Math'] });
            }}>
              Single Subject (15 min)
            </button>
            <button onClick={() => {
              handleModeSelect(ContentMode.FULL);
              updateSettings({ subjects: ['Math', 'ELA', 'Science', 'Social Studies'] });
            }}>
              Full Experience (80 min)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ADMIN PANEL COMPONENT
// ============================================================================

export const AdminContentPanel: React.FC = () => {
  const [settings, setSettings] = useState<ContentSettings | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLog, setGenerationLog] = useState<string[]>([]);

  const handleGenerateContent = async () => {
    if (!settings) {
      alert('Please configure settings first');
      return;
    }

    setIsGenerating(true);
    setGenerationLog(['Starting content generation...']);

    try {
      // Create mock student context
      const student: StudentContext = {
        id: 'demo_student',
        name: 'Demo Student',
        grade: settings.grades[0],
        performanceLevel: 'on-track',
        preferences: {
          visualLearner: settings.features.visualsRequired,
          needsAudioSupport: settings.features.audioEnabled,
          requiresSimplifiedLanguage: false
        }
      };

      // Create mock skill and career
      const skill: SkillContext = {
        id: 'demo_skill',
        name: 'Problem Solving',
        description: 'Core problem solving skills',
        learningObjectives: ['Understand problems', 'Apply solutions']
      };

      const career: CareerContext = {
        id: 'demo_career',
        name: 'Engineer',
        description: 'Engineering career path',
        relevantSkills: ['Problem Solving', 'Math', 'Science'],
        realWorldApplications: ['Building', 'Design', 'Innovation']
      };

      // Generate requests for each subject
      const requests: ContentRequest[] = [];
      
      for (const subject of settings.subjects) {
        addLog(`Generating request for ${subject}...`);
        
        const request = contentRequestBuilder.buildRequest(
          skill,
          student,
          career,
          settings.mode,
          'learn'
        );
        
        requests.push(request);
        addLog(`✓ ${subject} request created`);
      }

      addLog(`Generated ${requests.length} content requests`);
      addLog('Content generation complete!');
      
    } catch (error) {
      addLog(`Error: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const addLog = (message: string) => {
    setGenerationLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  return (
    <div className="admin-content-panel">
      <ContentModeManager
        onSettingsUpdate={setSettings}
        allowOverrides={true}
        isDemo={true}
      />
      
      <div className="generation-section">
        <h3>Content Generation</h3>
        <button
          className="btn-generate"
          onClick={handleGenerateContent}
          disabled={isGenerating || !settings}
        >
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </button>
        
        {generationLog.length > 0 && (
          <div className="generation-log">
            <h4>Generation Log</h4>
            <pre>
              {generationLog.join('\n')}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ContentModeManager;