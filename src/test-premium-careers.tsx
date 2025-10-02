/**
 * Test Page for Premium Career System
 * Verifies database integration and premium flow
 */

import React, { useState, useEffect } from 'react';
import { careerAccessService } from './services/CareerAccessService';
import { subscriptionService } from './services/subscriptionService';
import { getCareerPopularityBadge } from './types/CareerTypes';
import CareerChoiceModalV2Premium from './screens/modal-first/sub-modals/CareerChoiceModalV2Premium';

const TestPremiumCareers: React.FC = () => {
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPremium, setHasPremium] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [testGrade, setTestGrade] = useState('6'); // Middle school by default
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'basic' | 'premium'>('all');

  useEffect(() => {
    loadCareers();
    checkPremiumStatus();
  }, [testGrade, subscriptionFilter]);

  const loadCareers = async () => {
    setLoading(true);
    try {
      console.log(`Loading careers for grade ${testGrade} with filter: ${subscriptionFilter}...`);

      // Use the new CareerAccessService
      const result = await careerAccessService.getAvailableCareers({
        gradeLevel: testGrade,
        subscriptionTier: subscriptionFilter,
        includeAttributes: true  // Get engagement ratings and badges
      });

      // Transform for display
      const displayCareers = result.careers.map(career => ({
        careerId: career.career_code,
        name: career.career_name,
        icon: career.icon,
        color: career.color,
        categoryName: career.grade_category,
        isPremium: career.access_tier === 'premium',
        studentEngagement: career.attributes?.ers_student_engagement,
        badge: getCareerPopularityBadge(career.attributes),
        frequency: career.attributes?.interaction_frequency
      }));

      setCareers(displayCareers);
      console.log('📊 Career Stats:', result.stats);
      console.log(`Loaded ${result.stats.total} careers (${result.stats.basic} basic, ${result.stats.premium} premium)`);
    } catch (error) {
      console.error('Failed to load careers:', error);
    }
    setLoading(false);
  };

  const checkPremiumStatus = async () => {
    const premium = await subscriptionService.hasPremiumAccess();
    setHasPremium(premium);
  };

  const togglePremium = () => {
    // Mock toggle for testing
    localStorage.setItem('mock_premium', (!hasPremium).toString());
    setHasPremium(!hasPremium);
    setTimeout(loadCareers, 100);
  };

  const testCareerAccess = async (careerId: string) => {
    const result = await pathIQServiceV2.checkCareerAccess(careerId);
    console.log('Access check result:', result);
    alert(`Career: ${result.career?.name}\nAllowed: ${result.allowed}\nPremium: ${result.isPremium}\nMessage: ${result.message || 'Access granted'}`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', color: 'black', background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'black' }}>🎯 Premium Career System Test</h1>

      {/* Controls */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f3f4f6', borderRadius: '8px', color: 'black' }}>
        <h3 style={{ color: 'black' }}>Test Controls</h3>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ color: 'black', marginRight: '10px' }}>Grade Level: </label>
          <select
            value={testGrade}
            onChange={(e) => setTestGrade(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              color: 'black',
              background: 'white',
              fontSize: '14px'
            }}
          >
            <option value="K">Kindergarten</option>
            <option value="3">Grade 3</option>
            <option value="6">Grade 6</option>
            <option value="9">Grade 9</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ color: 'black', marginRight: '10px' }}>Subscription Filter: </label>
          <select
            value={subscriptionFilter}
            onChange={(e) => setSubscriptionFilter(e.target.value as 'all' | 'basic' | 'premium')}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              color: 'black',
              background: 'white',
              fontSize: '14px',
              marginRight: '20px'
            }}
          >
            <option value="all">All Careers</option>
            <option value="basic">Basic Only</option>
            <option value="premium">Premium Only</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ color: 'black', marginRight: '10px' }}>Mock Access Level: </label>
          <button
            onClick={togglePremium}
            style={{
              padding: '5px 15px',
              background: hasPremium ? '#10b981' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {hasPremium ? '✅ Premium Access' : '❌ Basic Access'}
          </button>
          <span style={{ color: '#6b7280', marginLeft: '10px', fontSize: '12px' }}>
            (This affects what happens when you click a career)
          </span>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '8px 20px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          🚀 Open Career Selection Modal
        </button>
      </div>

      {/* Career Stats */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e5e7eb', borderRadius: '8px', color: 'black' }}>
        <h3 style={{ color: 'black' }}>Database Stats</h3>
        <p style={{ color: 'black', margin: '8px 0' }}>
          <strong>Grade Level:</strong> {testGrade === 'K' ? 'Kindergarten' : `Grade ${testGrade}`} |
          <strong> Filter:</strong> {subscriptionFilter === 'all' ? 'All Careers' : subscriptionFilter === 'basic' ? 'Basic Only' : 'Premium Only'}
        </p>
        <p style={{ color: 'black', margin: '8px 0' }}>
          <strong>Careers Shown:</strong> {careers.length} total ({careers.filter(c => !c.isPremium).length} Basic, {careers.filter(c => c.isPremium).length} Premium)
        </p>
      </div>

      {/* Career Grid */}
      {loading ? (
        <p style={{ color: 'black' }}>Loading careers...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {careers.map(career => (
            <div
              key={career.careerId}
              style={{
                padding: '15px',
                border: `2px solid ${career.isPremium ? '#9333ea' : '#d1d5db'}`,
                borderRadius: '8px',
                background: career.isPremium ? '#faf5ff' : 'white',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => testCareerAccess(career.careerId)}
            >
              {career.isPremium && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  background: '#9333ea',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  PREMIUM
                </div>
              )}

              {career.badge && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  left: '5px',
                  background: 'white',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  border: '1px solid #e5e7eb'
                }}>
                  {career.badge}
                </div>
              )}

              <div style={{ fontSize: '2em', marginBottom: '5px' }}>{career.icon}</div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#1f2937' }}>{career.name}</div>
              <div style={{ fontSize: '0.85em', color: '#4b5563' }}>{career.categoryName}</div>
              <div style={{ fontSize: '0.85em', color: '#4b5563' }}>
                {career.studentEngagement ? `${career.studentEngagement}% Student Interest` : 'Click to explore'}
              </div>
              {career.frequency && (
                <div style={{ fontSize: '0.75em', color: '#9ca3af', marginTop: '4px' }}>
                  {career.frequency === 'HIF' ? '👥 High Interaction' :
                   career.frequency === 'MIF' ? '👤 Medium Interaction' :
                   '👁️ Low Interaction'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CareerChoiceModalV2Premium
          theme="light"
          onClose={(result) => {
            console.log('Modal closed with result:', result);
            setShowModal(false);
            if (result?.careerChoice) {
              alert(`Selected: ${result.careerChoice.careerName}`);
            }
          }}
          user={{ id: 'test-user', grade: testGrade }}
          profile={{ grade: testGrade }}
        />
      )}
    </div>
  );
};

export default TestPremiumCareers;