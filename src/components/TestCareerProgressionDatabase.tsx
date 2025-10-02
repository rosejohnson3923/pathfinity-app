/**
 * Test Career Progression Database Dashboard
 * This component demonstrates the career progression system using actual database data
 * NOT hardcoded test data - pulls from Supabase tables
 */

import React, { useState, useEffect } from 'react';
import { careerProgressionService, Career, CareerWithProgressions, BoosterType } from '../services/CareerPathProgressionService';
import './TestCareerProgressionDatabase.css';

interface SubscriptionTier {
  id: 'select' | 'premium';
  name: string;
  description: string;
}

export const TestCareerProgressionDatabase: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<'select' | 'premium'>('premium');
  const [selectedGrade, setSelectedGrade] = useState<string>('K');
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<CareerWithProgressions | null>(null);
  const [boosterTypes, setBoosterTypes] = useState<BoosterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [careersByField, setCareersByField] = useState<Record<string, Career[]>>({});
  const [tierCounts, setTierCounts] = useState<{ select: number; premium: number }>({ select: 0, premium: 0 });

  // Load careers and booster types on mount
  useEffect(() => {
    loadData();
  }, [selectedTier, selectedGrade]);

  // Calculate tier counts for the selected grade
  const calculateTierCounts = async () => {
    try {
      const selectCareers = await careerProgressionService.getCareersByGradeLevel(selectedGrade, 'select');
      const premiumCareers = await careerProgressionService.getCareersByGradeLevel(selectedGrade, 'premium');

      setTierCounts({
        select: selectCareers.length,
        premium: premiumCareers.length
      });
    } catch (error) {
      console.error('Error calculating tier counts:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load careers for selected grade and tier
      const tierCareers = await careerProgressionService.getCareersByGradeLevel(
        selectedGrade,
        selectedTier
      );
      setCareers(tierCareers);

      // Load careers grouped by field with grade and tier filtering
      const fieldGroups = await careerProgressionService.getCareersByField(selectedGrade, selectedTier);
      setCareersByField(fieldGroups);

      // Load booster types
      const boosters = await careerProgressionService.getBoosterTypes();
      setBoosterTypes(boosters);

      // Calculate tier counts for current grade
      await calculateTierCounts();

      console.log(`Loaded ${tierCareers.length} careers for ${selectedTier} tier`);
      console.log(`Loaded ${boosters.length} booster types`);
      console.log(`Career fields:`, Object.keys(fieldGroups));
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load career data from database');
    } finally {
      setLoading(false);
    }
  };

  const handleCareerSelect = async (careerId: string) => {
    try {
      const careerWithProgressions = await careerProgressionService.getCareerWithProgressions(careerId);
      setSelectedCareer(careerWithProgressions);
      console.log('Selected career with progressions:', careerWithProgressions);
    } catch (err) {
      console.error('Error loading career progressions:', err);
      setError('Failed to load career progressions');
    }
  };

  const handleSearch = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      // Reset to full list if search is cleared
      loadData();
      return;
    }

    try {
      const searchResults = await careerProgressionService.searchCareers(searchTerm);
      setCareers(searchResults);
      console.log(`Found ${searchResults.length} careers matching "${searchTerm}"`);
    } catch (err) {
      console.error('Error searching careers:', err);
    }
  };

  if (loading) {
    return (
      <div className="test-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading career data from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-dashboard">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-dashboard">
      <div className="dashboard-header">
        <h1>Career Path Progression System</h1>
        <p className="subtitle">Database-Driven Career Selection with Booster Progressions</p>
      </div>

      {/* Grade Level Selector */}
      <div className="grade-selector">
        <h2>Select Grade Level</h2>
        <div className="grade-options">
          {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(grade => (
            <button
              key={grade}
              className={`grade-button ${selectedGrade === grade ? 'selected' : ''}`}
              onClick={() => setSelectedGrade(grade)}
            >
              {grade === 'K' ? 'K' : `Grade ${grade}`}
            </button>
          ))}
        </div>
      </div>

      {/* Subscription Tier Selector */}
      <div className="tier-selector">
        <h2>Select Subscription Tier</h2>
        <div className="tier-options">
          <div
            className={`tier-card ${selectedTier === 'select' ? 'selected' : ''}`}
            onClick={() => setSelectedTier('select')}
          >
            <h3>Select</h3>
            <p>Foundation careers to get started</p>
            <span className="career-count">{tierCounts.select} careers</span>
          </div>
          <div
            className={`tier-card ${selectedTier === 'premium' ? 'selected' : ''}`}
            onClick={() => setSelectedTier('premium')}
          >
            <h3>Premium</h3>
            <p>Complete career library</p>
            <span className="career-count">{tierCounts.premium} careers</span>
          </div>
        </div>
      </div>

      {/* Career Statistics */}
      <div className="statistics">
        <div className="stat-card">
          <span className="stat-value">{careers.length}</span>
          <span className="stat-label">Available for {selectedGrade === 'K' ? 'Kindergarten' : `Grade ${selectedGrade}`}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{careers.filter(c => c.min_grade_level === selectedGrade).length}</span>
          <span className="stat-label">New at This Grade</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{Object.keys(careersByField).length}</span>
          <span className="stat-label">Career Fields</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{boosterTypes.length}</span>
          <span className="stat-label">Booster Types</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search careers..."
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Career Selection by Field */}
      <div className="career-selection">
        <h2>Available Careers by Field</h2>
        {Object.entries(careersByField).map(([fieldName, fieldCareers]) => (
          <div key={fieldName} className="field-group">
            <h3>{fieldName}</h3>
            <div className="career-grid">
              {fieldCareers.map(career => (
                <button
                    key={career.id}
                    className={`career-button ${selectedCareer?.id === career.id ? 'selected' : ''}`}
                    onClick={() => handleCareerSelect(career.id)}
                  >
                    {career.min_grade_level === selectedGrade && (
                      <span className="new-badge">NEW!</span>
                    )}
                    <span className="career-emoji">{career.emoji || '💼'}</span>
                    <span className="career-name">{career.career_name}</span>
                    {career.access_tier === 'premium' && (
                      <span className="premium-badge">Premium</span>
                    )}
                    <span className="grade-info">
                      {career.min_grade_level === 'K' ? 'K' : career.min_grade_level}+
                    </span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Career Details */}
      {selectedCareer && (
        <div className="career-details">
          <div className="career-header">
            <h2>
              <span className="emoji">{selectedCareer.emoji}</span>
              {selectedCareer.career_name}
            </h2>
            <span className={`tier-badge ${selectedCareer.access_tier}`}>
              {selectedCareer.access_tier}
            </span>
          </div>

          <p className="career-description">{selectedCareer.description}</p>

          {/* Booster Progressions */}
          <div className="progressions">
            <h3>Career Enhancement Options</h3>
            <p className="progression-info">
              Every career can be enhanced with specialized booster packages
            </p>

            <div className="progression-grid">
              {boosterTypes.map(booster => {
                const progression = selectedCareer.progressions.find(
                  p => p.progression_type === `boost_${booster.booster_code.replace('boost_', '')}`
                );

                return (
                  <div key={booster.id} className="progression-card">
                    <div className="booster-header">
                      <span className="booster-icon">{booster.icon}</span>
                      <h4>{booster.booster_name}</h4>
                    </div>

                    {progression ? (
                      <>
                        <h5 className="enhanced-name">{progression.enhanced_career_name}</h5>
                        <p className="enhanced-description">{progression.enhanced_description}</p>

                        {progression.additional_skills && progression.additional_skills.length > 0 && (
                          <div className="additional-skills">
                            <h6>Additional Skills:</h6>
                            <ul>
                              {progression.additional_skills.map((skill, idx) => (
                                <li key={idx}>{skill}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="no-progression">
                        Progression data being generated...
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Database Connection Status */}
      <div className="connection-status">
        <div className="status-indicator online"></div>
        <span>Connected to Supabase Database</span>
      </div>
    </div>
  );
};