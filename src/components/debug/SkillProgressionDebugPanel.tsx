/**
 * Skill Progression Debug Panel
 * Testing controls for skill progression system
 * Only visible in development mode
 */

import React, { useState, useEffect } from 'react';
import { 
  getProgress, 
  resetProgress, 
  checkForGroupCompletion,
  getProgressSummary
} from '../../services/skillProgressionService';
import { skillsData } from '../../data/skillsDataComplete';

interface SkillProgressionDebugPanelProps {
  userId: string;
  grade: string;
  onProgressChange?: () => void;
}

export const SkillProgressionDebugPanel: React.FC<SkillProgressionDebugPanelProps> = ({
  userId,
  grade,
  onProgressChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<any>(null);
  const [availableClusters, setAvailableClusters] = useState<string[]>([]);
  const [selectedCluster, setSelectedCluster] = useState('A');
  const [selectedNumber, setSelectedNumber] = useState(1);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Load current progress
  useEffect(() => {
    const progress = getProgress(userId, grade);
    setCurrentProgress(progress);
    setSelectedCluster(progress.currentSkillGroup);
    setSelectedNumber(progress.currentSkillNumber);
  }, [userId, grade]);

  // Get available clusters from actual data
  useEffect(() => {
    const gradeData = skillsData[grade] || skillsData['Kindergarten'];
    const mathSkills = gradeData?.['Math'] || [];
    
    const clusters = new Set<string>();
    mathSkills.forEach(skill => {
      if (skill.skillCluster) {
        clusters.add(skill.skillCluster.replace('.', ''));
      }
    });
    
    setAvailableClusters(Array.from(clusters).sort());
  }, [grade]);

  const handleReset = () => {
    resetProgress(userId, grade);
    const newProgress = getProgress(userId, grade);
    setCurrentProgress(newProgress);
    setSelectedCluster('A');
    setSelectedNumber(1);
    if (onProgressChange) onProgressChange();
    console.log('✅ Progress reset to A.1');
  };

  const handleJumpToSkill = () => {
    // Directly update localStorage
    const key = `pathfinity-skill-progression-${userId}-${grade}`;
    const progress = getProgress(userId, grade);
    
    progress.currentSkillGroup = selectedCluster;
    progress.currentSkillNumber = selectedNumber;
    progress.lastUpdated = new Date().toISOString();
    
    localStorage.setItem(key, JSON.stringify(progress));
    setCurrentProgress(progress);
    
    if (onProgressChange) onProgressChange();
    console.log(`✅ Jumped to ${selectedCluster}.${selectedNumber}`);
  };

  const handleAdvanceOne = () => {
    const progress = getProgress(userId, grade);
    const gradeData = skillsData[grade] || skillsData['Kindergarten'];
    const mathSkills = gradeData?.['Math'] || [];
    
    // Find next skill
    const currentCluster = progress.currentSkillGroup + '.';
    const nextSkillNumber = progress.currentSkillNumber + 1;
    const nextSkillId = `${currentCluster}${nextSkillNumber}`;
    
    const nextSkillExists = mathSkills.some(skill => 
      skill.skillNumber === nextSkillId
    );
    
    if (nextSkillExists) {
      progress.currentSkillNumber = nextSkillNumber;
    } else {
      // Jump to next cluster
      const nextClusterIndex = availableClusters.indexOf(progress.currentSkillGroup) + 1;
      if (nextClusterIndex < availableClusters.length) {
        progress.currentSkillGroup = availableClusters[nextClusterIndex];
        progress.currentSkillNumber = 1;
      }
    }
    
    const key = `pathfinity-skill-progression-${userId}-${grade}`;
    localStorage.setItem(key, JSON.stringify(progress));
    setCurrentProgress(progress);
    setSelectedCluster(progress.currentSkillGroup);
    setSelectedNumber(progress.currentSkillNumber);
    
    if (onProgressChange) onProgressChange();
    console.log(`✅ Advanced to ${progress.currentSkillGroup}.${progress.currentSkillNumber}`);
  };

  const handleMarkAllSubjectsComplete = () => {
    const progress = getProgress(userId, grade);
    const currentSkillId = `${progress.currentSkillGroup}.${progress.currentSkillNumber}`;
    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
    
    // Mark current skill as complete for all subjects
    subjects.forEach(subject => {
      if (!progress.completedSkills[subject]) {
        progress.completedSkills[subject] = [];
      }
      if (!progress.completedSkills[subject].includes(currentSkillId)) {
        progress.completedSkills[subject].push(currentSkillId);
      }
    });
    
    const key = `pathfinity-skill-progression-${userId}-${grade}`;
    localStorage.setItem(key, JSON.stringify(progress));
    
    // Check for automatic progression
    const advanced = checkForGroupCompletion(userId, grade);
    
    // Reload progress
    const newProgress = getProgress(userId, grade);
    setCurrentProgress(newProgress);
    setSelectedCluster(newProgress.currentSkillGroup);
    setSelectedNumber(newProgress.currentSkillNumber);
    
    if (onProgressChange) onProgressChange();
    console.log(`✅ Marked all subjects complete for ${currentSkillId}. Advanced: ${advanced}`);
  };

  if (!currentProgress) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#8B5CF6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        🛠️ Debug Skills ({currentProgress.currentSkillGroup}.{currentProgress.currentSkillNumber})
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '40px',
          right: '0',
          background: 'white',
          border: '2px solid #8B5CF6',
          borderRadius: '8px',
          padding: '16px',
          minWidth: '350px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#8B5CF6' }}>
            Skill Progression Debug
          </h3>
          
          {/* Current Status */}
          <div style={{
            background: '#F3F4F6',
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '12px',
            fontSize: '12px'
          }}>
            <div><strong>User:</strong> {userId.substring(0, 8)}...</div>
            <div><strong>Grade:</strong> {grade}</div>
            <div><strong>Current:</strong> {currentProgress.currentSkillGroup}.{currentProgress.currentSkillNumber}</div>
            <div><strong>Completed:</strong></div>
            {Object.entries(currentProgress.completedSkills).map(([subject, skills]: [string, any]) => (
              <div key={subject} style={{ marginLeft: '12px', fontSize: '11px' }}>
                {subject}: {skills.length} skills
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '12px' }}>
            <h4 style={{ margin: '8px 0 4px 0', fontSize: '12px' }}>Quick Actions</h4>
            
            <button
              onClick={handleReset}
              style={{
                background: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                margin: '2px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              🔄 Reset to A.1
            </button>
            
            <button
              onClick={handleAdvanceOne}
              style={{
                background: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                margin: '2px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              ⏭️ Next Skill
            </button>
            
            <button
              onClick={handleMarkAllSubjectsComplete}
              style={{
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                margin: '2px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              ✅ Complete All Subjects
            </button>
          </div>

          {/* Jump to Specific Skill */}
          <div style={{ marginBottom: '12px' }}>
            <h4 style={{ margin: '8px 0 4px 0', fontSize: '12px' }}>Jump to Skill</h4>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
                style={{
                  padding: '4px',
                  borderRadius: '4px',
                  border: '1px solid #D1D5DB',
                  fontSize: '12px'
                }}
              >
                {availableClusters.map(cluster => (
                  <option key={cluster} value={cluster}>
                    Cluster {cluster}
                  </option>
                ))}
                {/* Add some future clusters for testing */}
                <option value="X">Cluster X (Test)</option>
                <option value="Y">Cluster Y (Test)</option>
                <option value="Z">Cluster Z (Test)</option>
              </select>
              
              <span>.</span>
              
              <input
                type="number"
                value={selectedNumber}
                onChange={(e) => setSelectedNumber(parseInt(e.target.value) || 0)}
                min="0"
                max="99"
                style={{
                  width: '50px',
                  padding: '4px',
                  borderRadius: '4px',
                  border: '1px solid #D1D5DB',
                  fontSize: '12px'
                }}
              />
              
              <button
                onClick={handleJumpToSkill}
                style={{
                  background: '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Jump
              </button>
            </div>
          </div>

          {/* Preset Jumps */}
          <div>
            <h4 style={{ margin: '8px 0 4px 0', fontSize: '12px' }}>Preset Jumps</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {['A.0', 'A.1', 'A.2', 'B.0', 'B.1', 'C.0', 'C.1', 'Z.0', 'Z.99'].map(preset => {
                const [cluster, num] = preset.split('.');
                return (
                  <button
                    key={preset}
                    onClick={() => {
                      setSelectedCluster(cluster);
                      setSelectedNumber(parseInt(num));
                      setTimeout(() => handleJumpToSkill(), 100);
                    }}
                    style={{
                      background: '#F3F4F6',
                      color: '#374151',
                      border: '1px solid #D1D5DB',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontSize: '10px'
                    }}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};