/**
 * Browser-compatible unified daily lesson plan download component
 */

import React, { useState } from 'react';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { UnifiedLessonPlanPDF } from '../services/pdf/UnifiedLessonPlanPDFGenerator';

interface UnifiedLessonDownloadProps {
  lessonPlan: any; // Unified lesson plan structure
  className?: string;
}

export const UnifiedLessonDownload: React.FC<UnifiedLessonDownloadProps> = ({
  lessonPlan,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDirectDownload = async () => {
    setIsGenerating(true);

    try {
      // Generate PDF blob
      const doc = <UnifiedLessonPlanPDF lessonPlan={lessonPlan} />;
      const blob = await pdf(doc).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${lessonPlan.student.name}_Daily_Plan_${lessonPlan.career.careerName}_${new Date(lessonPlan.generatedAt).toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 100);

      console.log('✅ Unified PDF downloaded successfully');
    } catch (error) {
      console.error('❌ Error generating unified PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={className}>
      {/* Direct download button */}
      <button
        onClick={handleDirectDownload}
        disabled={isGenerating}
        style={{
          padding: '10px 20px',
          backgroundColor: isGenerating ? '#9CA3AF' : '#8B5CF6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '16px',
          fontWeight: '600',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {isGenerating ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            Generating Daily Plan...
          </>
        ) : (
          <>
            📋 Download Plan
          </>
        )}
      </button>

      {/* Alternative PDFDownloadLink approach */}
      {!isGenerating && (
        <PDFDownloadLink
          document={<UnifiedLessonPlanPDF lessonPlan={lessonPlan} />}
          fileName={`${lessonPlan.student.name}_Daily_Plan_${lessonPlan.career.careerName}_${new Date(lessonPlan.generatedAt).toISOString().split('T')[0]}.pdf`}
          style={{
            marginLeft: '10px',
            padding: '10px 20px',
            backgroundColor: '#3B82F6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          {({ loading }) =>
            loading ? 'Preparing...' : '📄 Download (Alternative)'
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
export const UnifiedPDFButton: React.FC<UnifiedLessonDownloadProps> = ({ lessonPlan }) => {
  const fileName = `${lessonPlan.student.name}_Daily_Plan_${lessonPlan.career.careerName}_${new Date(lessonPlan.generatedAt).toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<UnifiedLessonPlanPDF lessonPlan={lessonPlan} />}
      fileName={fileName}
    >
      {({ loading, error }) => (
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#9CA3AF' : error ? '#EF4444' : '#8B5CF6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
          disabled={loading}
        >
          {loading ? '⏳ Generating...' : error ? '❌ Error' : '📋 Download Plan'}
        </button>
      )}
    </PDFDownloadLink>
  );
};