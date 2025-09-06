/**
 * Container Progress Indicator Component
 * =======================================
 * Visual progress tracking for all learning containers
 * Adapts style and complexity based on grade level
 * 
 * Created: 2025-08-30
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import GradeContentAdapter from '../../services/GradeContentAdapter';
import './ContainerProgressIndicator.css';

interface ProgressSegment {
  label: string;
  value: number;
  color: string;
  icon?: string;
}

interface ContainerProgressIndicatorProps {
  containerType: 'learn' | 'experience' | 'discover';
  grade: string;
  segments: ProgressSegment[];
  totalProgress: number;
  currentPhase?: string;
  showMilestones?: boolean;
  animated?: boolean;
}

const ContainerProgressIndicator: React.FC<ContainerProgressIndicatorProps> = ({
  containerType,
  grade,
  segments,
  totalProgress,
  currentPhase,
  showMilestones = true,
  animated = true
}) => {
  const gradeRange = GradeContentAdapter.getGradeRange(grade);
  
  // Container color schemes
  const containerColors = {
    learn: {
      primary: '#14b8a6',
      secondary: '#06b6d4',
      light: 'rgba(20, 184, 166, 0.2)'
    },
    experience: {
      primary: '#f97316',
      secondary: '#ea580c',
      light: 'rgba(249, 115, 22, 0.2)'
    },
    discover: {
      primary: '#ec4899',
      secondary: '#a855f7',
      light: 'rgba(236, 72, 153, 0.2)'
    }
  };

  const colors = containerColors[containerType];

  // Grade-specific milestone icons
  const getMilestoneIcons = () => {
    switch (gradeRange) {
      case 'K-2':
        return ['🌟', '🎈', '🚀', '🏆'];
      case '3-5':
        return ['✓', '★', '◆', '🏅'];
      case '6-8':
        return ['▸', '◼', '◆', '✓'];
      case '9-12':
        return []; // No icons for professional look
      default:
        return ['•', '•', '•', '•'];
    }
  };

  const milestoneIcons = getMilestoneIcons();
  const milestones = [25, 50, 75, 100];

  // Calculate segment positions
  const segmentPositions = useMemo(() => {
    let cumulativeProgress = 0;
    return segments.map(segment => {
      const position = cumulativeProgress;
      cumulativeProgress += segment.value;
      return {
        ...segment,
        start: position,
        end: cumulativeProgress
      };
    });
  }, [segments]);

  // Render progress bar style based on grade
  const renderProgressBar = () => {
    switch (gradeRange) {
      case 'K-2':
        return renderPlayfulProgress();
      case '3-5':
        return renderEngagingProgress();
      case '6-8':
        return renderSophisticatedProgress();
      case '9-12':
        return renderProfessionalProgress();
      default:
        return renderEngagingProgress();
    }
  };

  // K-2: Playful, colorful progress with large visuals
  const renderPlayfulProgress = () => (
    <div className="progress-container playful">
      <div className="progress-track-playful">
        {segments.map((segment, index) => (
          <motion.div
            key={index}
            className="progress-segment-playful"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: animated ? 1 : 0 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            style={{
              width: `${segment.value}%`,
              background: segment.color || colors.primary
            }}
          >
            {segment.icon && (
              <span className="segment-icon">{segment.icon}</span>
            )}
          </motion.div>
        ))}
      </div>
      
      {showMilestones && (
        <div className="milestones-playful">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone}
              className={`milestone-playful ${totalProgress >= milestone ? 'achieved' : ''}`}
              initial={{ scale: 0 }}
              animate={{ scale: totalProgress >= milestone ? 1.2 : 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              style={{ left: `${milestone}%` }}
            >
              <span className="milestone-icon-playful">
                {milestoneIcons[index]}
              </span>
              <span className="milestone-label-playful">
                {milestone}%
              </span>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="progress-character">
        <motion.div
          className="character-icon"
          animate={{ x: `${totalProgress * 3}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        >
          🚗
        </motion.div>
      </div>
    </div>
  );

  // 3-5: Engaging progress with achievements
  const renderEngagingProgress = () => (
    <div className="progress-container engaging">
      <div className="progress-header">
        <span className="progress-title">Your Journey Progress</span>
        <span className="progress-percentage">{Math.round(totalProgress)}%</span>
      </div>
      
      <div className="progress-track-engaging">
        <motion.div
          className="progress-fill-engaging"
          initial={{ width: 0 }}
          animate={{ width: `${totalProgress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
          }}
        />
        
        {segments.map((segment, index) => (
          <div
            key={index}
            className="segment-marker"
            style={{ left: `${segment.value}%` }}
            title={segment.label}
          />
        ))}
      </div>
      
      {showMilestones && (
        <div className="milestones-engaging">
          {milestones.map((milestone, index) => (
            <div
              key={milestone}
              className={`milestone-engaging ${totalProgress >= milestone ? 'achieved' : ''}`}
              style={{ left: `${milestone}%` }}
            >
              <div className="milestone-dot" />
              <span className="milestone-label">
                {milestoneIcons[index]} {milestone}%
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className="progress-details">
        {segments.map((segment, index) => (
          <div key={index} className="segment-detail">
            <span className="segment-color" style={{ background: segment.color }} />
            <span className="segment-label">{segment.label}</span>
            <span className="segment-value">{segment.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  // 6-8: Sophisticated progress with data visualization
  const renderSophisticatedProgress = () => (
    <div className="progress-container sophisticated">
      <div className="progress-stats">
        <div className="stat-item">
          <span className="stat-label">Overall Progress</span>
          <span className="stat-value">{Math.round(totalProgress)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Current Phase</span>
          <span className="stat-value">{currentPhase || 'Active'}</span>
        </div>
      </div>
      
      <div className="progress-track-sophisticated">
        {segmentPositions.map((segment, index) => (
          <motion.div
            key={index}
            className="progress-segment-sophisticated"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: index * 0.1 }}
            style={{
              left: `${segment.start}%`,
              width: `${segment.value}%`,
              background: segment.color || colors.primary
            }}
          >
            <div className="segment-info">
              <span className="segment-name">{segment.label}</span>
            </div>
          </motion.div>
        ))}
        
        <div className="progress-line" style={{ width: `${totalProgress}%` }} />
      </div>
      
      {showMilestones && (
        <div className="milestones-sophisticated">
          {milestones.map((milestone) => (
            <div
              key={milestone}
              className={`milestone-sophisticated ${totalProgress >= milestone ? 'achieved' : ''}`}
              style={{ left: `${milestone}%` }}
            >
              <div className="milestone-marker" />
              <span className="milestone-value">{milestone}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="progress-graph">
        <svg width="100%" height="60">
          <polyline
            points={segments.map((seg, i) => 
              `${(i + 1) * (100 / segments.length)},${60 - (seg.value * 0.6)}`
            ).join(' ')}
            fill="none"
            stroke={colors.primary}
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );

  // 9-12: Professional, minimalist progress
  const renderProfessionalProgress = () => (
    <div className="progress-container professional">
      <div className="progress-metrics">
        <span className="metric-label">PROGRESS</span>
        <span className="metric-value">{totalProgress.toFixed(1)}%</span>
      </div>
      
      <div className="progress-track-professional">
        <div
          className="progress-fill-professional"
          style={{
            width: `${totalProgress}%`,
            background: colors.primary
          }}
        />
        
        {showMilestones && milestones.map((milestone) => (
          <div
            key={milestone}
            className="milestone-professional"
            style={{ left: `${milestone}%` }}
          >
            <div className={`milestone-tick ${totalProgress >= milestone ? 'passed' : ''}`} />
          </div>
        ))}
      </div>
      
      <div className="progress-breakdown">
        {segments.map((segment, index) => (
          <div key={index} className="breakdown-item">
            <span className="breakdown-label">{segment.label}</span>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill"
                style={{
                  width: `${(segment.value / 100) * totalProgress}%`,
                  background: segment.color || colors.primary,
                  opacity: 0.8
                }}
              />
            </div>
            <span className="breakdown-value">{segment.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`container-progress-indicator ${containerType} grade-${gradeRange}`}>
      {renderProgressBar()}
    </div>
  );
};

export default ContainerProgressIndicator;