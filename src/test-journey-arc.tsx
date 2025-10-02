/**
 * Test to verify narrative context is properly included in demonstrative narratives
 * Note: Journey Arc concept has been removed - using settingProgression instead
 */

import React, { useEffect, useState } from 'react';
import { demonstrativeNarrativeGenerator } from './services/narrative/DemonstrativeMasterNarrativeGenerator';
import { EnhancedMasterNarrative } from './services/narrative/DemonstrativeMasterNarrativeGenerator';

export const TestJourneyArc: React.FC = () => {
  const [narrative, setNarrative] = useState<EnhancedMasterNarrative | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateNarrative = async () => {
      try {
        const result = await demonstrativeNarrativeGenerator.generateDemonstrativeNarrative({
          studentName: 'Alex',
          gradeLevel: '3',
          career: 'Marine Biologist',
          companion: { name: 'Finn', personality: 'Adventurous' },
          subjects: ['math', 'ela', 'science', 'socialStudies'],
          showcaseMode: true,
          sampleCareer: 'Marine Biologist',
          sampleCompanion: 'Finn'
        });

        setNarrative(result);
        setLoading(false);

        // Log the journeyArc to console
        console.log('Journey Arc Structure:', result.journeyArc);
      } catch (error) {
        console.error('Failed to generate narrative:', error);
        setLoading(false);
      }
    };

    generateNarrative();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Generating narrative...</div>;
  }

  if (!narrative) {
    return <div style={{ padding: '20px' }}>Failed to generate narrative</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Journey Arc Test</h1>

      <div style={{ marginTop: '20px', background: '#f0f9ff', padding: '15px', borderRadius: '8px' }}>
        <h2>Mission Briefing</h2>
        {narrative.missionBriefing && (
          <div>
            <p><strong>Greeting:</strong> {narrative.missionBriefing.greeting}</p>
            <p><strong>Situation:</strong> {narrative.missionBriefing.situation}</p>
            <p><strong>Challenge:</strong> {narrative.missionBriefing.challenge}</p>
            <p><strong>Skills Needed:</strong> {narrative.missionBriefing.skillsNeeded}</p>
            <p><strong>Companion Support:</strong> {narrative.missionBriefing.companionSupport}</p>
            <p><strong>Call to Action:</strong> {narrative.missionBriefing.closingMotivation}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', background: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
        <h2>Container Setting Progression</h2>
        {narrative.settingProgression && (
          <div>
            <div style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '3px solid #10b981' }}>
              <h3>Learn Container (Instruction/Video/Practice/Assessment)</h3>
              <p><strong>Location:</strong> {narrative.settingProgression.learn?.location}</p>
              <p><strong>Context:</strong> {narrative.settingProgression.learn?.context}</p>
              <p><strong>Narrative:</strong> {narrative.settingProgression.learn?.narrative}</p>
            </div>

            <div style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '3px solid #3b82f6' }}>
              <h3>Experience Container (Scenario/Practice/Assessment)</h3>
              <p><strong>Location:</strong> {narrative.settingProgression.experience?.location}</p>
              <p><strong>Context:</strong> {narrative.settingProgression.experience?.context}</p>
              <p><strong>Narrative:</strong> {narrative.settingProgression.experience?.narrative}</p>
            </div>

            <div style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '3px solid #8b5cf6' }}>
              <h3>Discover Container (Challenge/Practice/Assessment)</h3>
              <p><strong>Location:</strong> {narrative.settingProgression.discover?.location}</p>
              <p><strong>Context:</strong> {narrative.settingProgression.discover?.context}</p>
              <p><strong>Narrative:</strong> {narrative.settingProgression.discover?.narrative}</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', background: '#fef3c7', padding: '15px', borderRadius: '8px' }}>
        <h2>Progress Milestones (No Time References)</h2>
        {narrative.milestones && (
          <div>
            <p>✅ <strong>First Achievement:</strong> {narrative.milestones.firstAchievement}</p>
            <p>⭐ <strong>Midway Mastery:</strong> {narrative.milestones.midwayMastery}</p>
            <p>🏆 <strong>Final Victory:</strong> {narrative.milestones.finalVictory}</p>
            {narrative.milestones.bonusChallenge && (
              <p>🎯 <strong>Bonus Challenge:</strong> {narrative.milestones.bonusChallenge}</p>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', background: '#fce7f3', padding: '15px', borderRadius: '8px' }}>
        <h2>Companion Integration</h2>
        {narrative.companionIntegration && (
          <div>
            <p><strong>Companion:</strong> {narrative.companionIntegration.name}</p>
            <p><strong>Personality:</strong> {narrative.companionIntegration.personality}</p>
            <p><strong>Catchphrase:</strong> {narrative.companionIntegration.catchphrase}</p>
            <p><strong>Teaching Style:</strong> {narrative.companionIntegration.teachingStyle}</p>
          </div>
        )}
      </div>
    </div>
  );
};