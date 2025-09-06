// ================================================================
// IN-APP BADGE COMPONENT
// Simple emoji + gradient badge display (replaces DALL-E)
// ================================================================

import React, { useState, useEffect } from 'react';
import { careerBadgeService } from '../services/careerBadgeService';
import { CareerBadge } from '../types/CareerTypes';

interface InAppBadgeProps {
  careerId: string;
  careerName: string;
  department: string;
  gradeLevel: string;
  studentName: string;
  className?: string;
  preview?: boolean;
}

export const InAppBadge: React.FC<InAppBadgeProps> = ({
  careerId,
  careerName,
  department,
  gradeLevel,
  studentName,
  className = '',
  preview = false
}) => {
  const [badge, setBadge] = useState<CareerBadge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateBadge = async () => {
      try {
        setLoading(true);
        const generatedBadge = await careerBadgeService.generateCareerBadge({
          careerId,
          careerName,
          department,
          gradeLevel,
          studentName,
          description: `${careerName} Badge for ${studentName}`
        });
        setBadge(generatedBadge);
      } catch (error) {
        console.error('Failed to generate badge:', error);
      } finally {
        setLoading(false);
      }
    };

    generateBadge();
  }, [careerId, careerName, department, gradeLevel, studentName]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!badge) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-gray-400">Failed to load badge</div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div 
        className="rounded-lg p-4 text-center"
        style={{
          background: `linear-gradient(135deg, ${badge.colors[0]}, ${badge.colors[1]})`
        }}
      >
        <div className="text-4xl mb-2">{badge.emoji}</div>
        <div className="text-white font-bold text-sm">{badge.title}</div>
        {!preview && (
          <div className="text-white text-xs mt-1">{badge.description}</div>
        )}
      </div>
    </div>
  );
};

export default InAppBadge;