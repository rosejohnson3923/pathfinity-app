/**
 * Browser-compatible lesson plan download component
 */

import React, { useState } from 'react';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { LessonPlanPDF } from '../services/pdf/LessonPlanPDFGenerator';
import { StandardizedLessonPlan } from '../templates/StandardizedLessonPlan';

interface LessonPlanDownloadProps {
  lessonPlan: StandardizedLessonPlan;
  className?: string;
}

export const LessonPlanDownload: React.FC<LessonPlanDownloadProps> = ({
  lessonPlan,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDirectDownload = async () => {
    setIsGenerating(true);

    try {
      // Generate PDF blob
      const doc = <LessonPlanPDF lessonPlan={lessonPlan} />;
      const blob = await pdf(doc).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${lessonPlan.student.name}_${lessonPlan.career.careerName}_${lessonPlan.curriculum.subject}_lesson.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 100);

      console.log('✅ PDF downloaded successfully');
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={className}>
      {/* Option 1: Direct download button */}
      <button
        onClick={handleDirectDownload}
        disabled={isGenerating}
        style={{
          padding: '8px 16px',
          backgroundColor: isGenerating ? '#9CA3AF' : '#10B981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        {isGenerating ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            Generating PDF...
          </>
        ) : (
          <>
            📥 Download PDF
          </>
        )}
      </button>

      {/* Option 2: PDFDownloadLink (alternative approach) */}
      {!isGenerating && (
        <PDFDownloadLink
          document={<LessonPlanPDF lessonPlan={lessonPlan} />}
          fileName={`${lessonPlan.student.name}_${lessonPlan.career.careerName}_${lessonPlan.curriculum.subject}_lesson.pdf`}
          style={{
            marginLeft: '10px',
            padding: '8px 16px',
            backgroundColor: '#3B82F6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {({ loading }) =>
            loading ? 'Preparing...' : '📄 Download (Link)'
          }
        </PDFDownloadLink>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

// Export a simpler button component for use in lists
export const LessonPDFButton: React.FC<LessonPlanDownloadProps> = ({ lessonPlan }) => {
  return (
    <PDFDownloadLink
      document={<LessonPlanPDF lessonPlan={lessonPlan} />}
      fileName={`${lessonPlan.student.name}_${lessonPlan.career.careerName}_${lessonPlan.curriculum.subject}_lesson.pdf`}
    >
      {({ loading, error }) => (
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#9CA3AF' : error ? '#EF4444' : '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
          disabled={loading}
        >
          {loading ? '⏳ Generating...' : error ? '❌ Error' : '📥 Download PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
};