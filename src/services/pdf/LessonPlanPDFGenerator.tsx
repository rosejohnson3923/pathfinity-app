/**
 * Lesson Plan PDF Generator
 * Creates downloadable PDFs for lesson plans using React PDF
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
  Font,
  pdf
} from '@react-pdf/renderer';
import { StandardizedLessonPlan } from '../../templates/StandardizedLessonPlan';

// Register fonts if needed (optional)
// Font.register({
//   family: 'Inter',
//   src: '/fonts/Inter-Regular.ttf'
// });

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica'
  },

  // Header styles
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #3B82F6',
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280'
  },

  // Career badge
  careerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',  // Dark background for better contrast
    padding: 10,
    borderRadius: 8,
    marginVertical: 10
  },
  careerIcon: {
    fontSize: 24,
    marginRight: 10
  },
  careerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF'  // White text on dark background
  },

  // Section styles
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4
  },
  sectionContent: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    paddingLeft: 10
  },

  // Learning objectives
  objectivesList: {
    marginLeft: 10
  },
  objective: {
    fontSize: 11,
    marginBottom: 4,
    flexDirection: 'row'
  },
  bullet: {
    marginRight: 5
  },

  // Activity box
  activityBox: {
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    borderWidth: 1,
    borderColor: '#D97706'
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#451A03',  // Very dark brown for excellent contrast
    marginBottom: 5
  },
  activityContent: {
    fontSize: 11,
    color: '#451A03'  // Very dark brown for readability
  },

  // Assessment section
  assessmentBox: {
    backgroundColor: '#DCFCE7',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
    borderWidth: 1,
    borderColor: '#16A34A'
  },

  // Parent guide
  parentGuide: {
    backgroundColor: '#F0F9FF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  parentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0C4A6E',
    marginBottom: 5
  },

  // Footer
  footer: {
    marginTop: 'auto',
    marginBottom: 30,
    marginLeft: 30,
    marginRight: 30,
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10
  },

  // Spark dialogue
  sparkBox: {
    backgroundColor: '#FDF4FF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#A855F7',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  sparkIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#7E22CE'
  },
  sparkText: {
    fontSize: 11,
    color: '#581C87',
    fontStyle: 'italic',
    flex: 1
  },

  // Grid layout for info
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  infoItem: {
    flex: 1
  },
  infoLabel: {
    fontSize: 9,
    color: '#4B5563',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1F2937'
  }
});

// PDF Document Component
export const LessonPlanPDF = ({ lessonPlan }: { lessonPlan: StandardizedLessonPlan }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Document>
      {/* Page 1: Cover & Overview */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {lessonPlan.student.name}'s Learning Adventure
          </Text>
          <Text style={styles.subtitle}>
            {formatDate(lessonPlan.generatedAt)}
          </Text>
        </View>

        {/* Career Badge */}
        <View style={styles.careerBadge}>
          <Text style={[styles.careerIcon, { color: '#FFFFFF' }]}>{lessonPlan.career.icon}</Text>
          <View>
            <Text style={styles.careerName}>{lessonPlan.career.careerName}</Text>
            <Text style={{ fontSize: 10, color: '#D1D5DB' }}>
              Career Focus for Today
            </Text>
          </View>
        </View>

        {/* Lesson Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Subject</Text>
            <Text style={styles.infoValue}>{lessonPlan.curriculum.subject}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Grade Level</Text>
            <Text style={styles.infoValue}>{lessonPlan.student.gradeLevel}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>30 minutes</Text>
          </View>
        </View>

        {/* Today's Skill */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📎 Today's Learning Goal</Text>
          <View style={{ backgroundColor: '#FFFFFF', padding: 10, borderRadius: 4, marginTop: 5 }}>
            <Text style={[styles.sectionContent, { fontSize: 12, fontWeight: 'medium' }]}>
              {lessonPlan.curriculum.skillObjective}
            </Text>
          </View>
        </View>

        {/* Learning Objectives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We'll Learn</Text>
          <View style={styles.objectivesList}>
            {[
              `Understand how ${lessonPlan.career.careerName}s use ${lessonPlan.curriculum.subject.toLowerCase()} skills`,
              `Practice ${lessonPlan.curriculum.skillObjective} in career context`,
              `Complete fun activities as a Junior ${lessonPlan.career.careerName} Helper`
            ].map((objective, index) => (
              <View key={index} style={styles.objective}>
                <Text style={[styles.bullet, { color: '#10B981' }]}>✓</Text>
                <Text style={{ flex: 1, fontSize: 11, color: '#1F2937' }}>
                  {objective}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Spark Introduction */}
        <View style={styles.sparkBox}>
          <Text style={styles.sparkIcon}>✨</Text>
          <Text style={styles.sparkText}>
            "Hi {lessonPlan.student.name}! I'm Spark, and today we're going to be
            {' '}{lessonPlan.career.careerName}s together! We'll learn {lessonPlan.curriculum.skillObjective}
            {' '}in a super fun way!"
          </Text>
        </View>

        {/* Parent Guide */}
        <View style={styles.parentGuide}>
          <Text style={styles.parentTitle}>Parent Guide</Text>
          <Text style={styles.sectionContent}>
            Today, {lessonPlan.student.name} is exploring the career of {lessonPlan.career.careerName}
            {' '}while learning {lessonPlan.curriculum.skillObjective}. This lesson combines career
            exploration with curriculum standards. You can support by asking about what they learned
            and helping with the practice activities below.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Pathfinity • {lessonPlan.templateType.replace(/_/g, ' ')} • Page 1
        </Text>
      </Page>

      {/* Page 2: Activities & Practice */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Activities & Practice</Text>

        {/* Learn Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Learn: {lessonPlan.content.narrativeContext.title}</Text>
          <Text style={styles.sectionContent}>
            {lessonPlan.content.narrativeContext.introduction}
          </Text>
          <Text style={styles.sectionContent}>
            Career Connection: {lessonPlan.content.narrativeContext.careerConnection}
          </Text>
        </View>

        {/* Practice Activity */}
        <View style={styles.activityBox}>
          <Text style={styles.activityTitle}>
            🎯 Practice: {lessonPlan.content.practice.instructions}
          </Text>
          <Text style={styles.activityContent}>
            Activity Type: {lessonPlan.content.practice.activityType}
          </Text>
          {lessonPlan.content.practice.materials?.map((material, index) => (
            <Text key={index} style={{ fontSize: 10, marginTop: 2 }}>
              • {material}
            </Text>
          ))}
        </View>

        {/* Assessment - Show ALL 4 challenges */}
        <View style={styles.assessmentBox}>
          <Text style={[styles.activityTitle, { color: '#14532D' }]}>✅ Complete Learning Journey (All 4 Challenges)</Text>
          {lessonPlan.content.assessment.questions.map((question, index) => (
            <View key={index} style={{ marginBottom: 12, backgroundColor: '#FFFFFF', padding: 10, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#10B981' }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#14532D', marginBottom: 4 }}>
                Challenge {index + 1}: {question.question || `Question about ${lessonPlan.curriculum.skillObjective}`}
              </Text>
              {question.options && question.options.map((option, optIndex) => (
                <Text key={optIndex} style={{ fontSize: 10, marginLeft: 15, color: '#1F2937', marginTop: 2 }}>
                  {String.fromCharCode(65 + optIndex)}. {option}
                </Text>
              ))}
              {/* Add hint if available */}
              {question.hint && (
                <View style={{ marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                  <Text style={{ fontSize: 9, color: '#6B7280', fontStyle: 'italic' }}>💡 Hint: {question.hint}</Text>
                </View>
              )}
              {/* Add learning outcome */}
              {question.explanation && (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 9, color: '#059669', fontWeight: 'medium' }}>✓ Learning: {question.explanation}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Template-specific enhancements */}
        {lessonPlan.enhancements?.aiElements && (
          <View style={styles.sparkBox}>
            <Text style={styles.sparkIcon}>🤖</Text>
            <Text style={styles.sparkText}>
              AI Enhancement: This lesson includes AI assistance from Spark!
              Safe, pre-approved prompts help guide learning.
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Pathfinity • {formatDate(lessonPlan.generatedAt)} • Page 2
        </Text>
      </Page>

      {/* Page 3: Alternative Career Examples */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Same Skills, Different Adventures</Text>

        <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#F0F9FF', borderRadius: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#0369A1', marginBottom: 5 }}>
            Your child can choose ANY career tomorrow!
          </Text>
          <Text style={{ fontSize: 10, color: '#075985' }}>
            The same curriculum ({lessonPlan.curriculum.skillObjective}) will be taught through their chosen adventure.
            Here are examples of how other careers would teach the same skills:
          </Text>
        </View>

        {/* Alternative Career Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍⚕️ If {lessonPlan.student.name} chooses Doctor:</Text>
          <View style={{ marginLeft: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 10, color: '#374151', marginBottom: 3 }}>
              • Math: Count medical supplies (1-3 bandages, syringes, pills)
            </Text>
            <Text style={{ fontSize: 10, color: '#374151', marginBottom: 3 }}>
              • ELA: Find uppercase letters on medicine labels
            </Text>
            <Text style={{ fontSize: 10, color: '#374151', marginBottom: 3 }}>
              • Science: Sort medical tools by shape
            </Text>
            <Text style={{ fontSize: 10, color: '#374151' }}>
              • Social: Help patients in the community clinic
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 If {lessonPlan.student.name} chooses Artist:</Text>
          <View style={{ marginLeft: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 10, color: '#374151', marginBottom: 3 }}>
              • Math: Count paintbrushes and colors (1-3)
            </Text>
            <Text style={{ fontSize: 10, color: '#374151', marginBottom: 3 }}>
              • ELA: Find uppercase letters in art supply labels
            </Text>
            <Text style={{ fontSize: 10, color: '#374151', marginBottom: 3 }}>
              • Science: Identify shapes in artwork
            </Text>
            <Text style={{ fontSize: 10, color: '#374151' }}>
              • Social: Create art for community events
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚽ If {lessonPlan.student.name} chooses Athlete:</Text>
          <View style={{ marginLeft: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 10, color: '#374151', marginBottom: 3 }}>
              • Math: Count sports equipment (1-3 balls, cones, goals)
            </Text>
            <Text style={{ fontSize: 10, color: '#374151', marginBottom: 3 }}>
              • ELA: Find uppercase letters on team jerseys
            </Text>
            <Text style={{ fontSize: 10, color: '#374151', marginBottom: 3 }}>
              • Science: Identify shapes on the field/court
            </Text>
            <Text style={{ fontSize: 10, color: '#374151' }}>
              • Social: Team up with community members
            </Text>
          </View>
        </View>

        {/* Home Practice */}
        <View style={styles.parentGuide}>
          <Text style={styles.parentTitle}>Continue Learning at Home</Text>
          <Text style={styles.sectionContent}>
            • Ask {lessonPlan.student.name} to show you what a {lessonPlan.career.careerName} does
          </Text>
          <Text style={styles.sectionContent}>
            • Practice {lessonPlan.curriculum.skillObjective} during daily activities
          </Text>
          <Text style={styles.sectionContent}>
            • Look for {lessonPlan.career.careerName}s in your community
          </Text>
          <Text style={styles.sectionContent}>
            • Read books about {lessonPlan.career.careerName}s together
          </Text>
        </View>

        {/* Success Celebration */}
        <View style={styles.assessmentBox}>
          <Text style={styles.activityTitle}>🎉 Celebrate Success!</Text>
          <Text style={styles.activityContent}>
            When {lessonPlan.student.name} completes this lesson, they will have:
          </Text>
          <Text style={{ fontSize: 10, marginTop: 5 }}>
            ✓ Learned how {lessonPlan.career.careerName}s use {lessonPlan.curriculum.skillObjective}
          </Text>
          <Text style={{ fontSize: 10 }}>
            ✓ Practiced real-world applications
          </Text>
          <Text style={{ fontSize: 10 }}>
            ✓ Explored a potential career path
          </Text>
        </View>

        {/* Subscription info */}
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
          <Text style={{ fontSize: 9, color: '#6B7280', textAlign: 'center' }}>
            Subscription: {lessonPlan.subscription.tier} tier •
            {' '}{lessonPlan.subscription.applicationPath.replace(/_/g, ' ')} path •
            {' '}{lessonPlan.subscription.knowledgeMode.replace(/_/g, ' ')} mode
          </Text>
        </View>

        {/* Footer */}
        <View style={{ marginTop: 'auto', paddingTop: 20 }}>
          <Text style={styles.footer}>
            Generated by Pathfinity • Thank you for learning with us! • Page 3
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Export function to generate PDF (browser-compatible)
export const generateLessonPlanPDF = async (
  lessonPlan: StandardizedLessonPlan
): Promise<Blob | Buffer> => {
  const pdfDocument = <LessonPlanPDF lessonPlan={lessonPlan} />;

  // Check if we're in a browser or Node.js environment
  if (typeof window !== 'undefined') {
    // Browser environment - return Blob
    const blob = await pdf(pdfDocument).toBlob();
    return blob;
  } else {
    // Node.js environment - return Buffer (for server-side generation)
    const buffer = await pdf(pdfDocument).toBuffer();
    return buffer;
  }
};

// Export component for direct download link
export const LessonPlanDownloadLink = ({
  lessonPlan,
  children
}: {
  lessonPlan: StandardizedLessonPlan;
  children: React.ReactNode;
}) => {
  const fileName = `${lessonPlan.student.name}_${lessonPlan.career.careerName}_${lessonPlan.curriculum.subject}_lesson.pdf`;

  return (
    <PDFDownloadLink
      document={<LessonPlanPDF lessonPlan={lessonPlan} />}
      fileName={fileName}
    >
      {({ blob, url, loading, error }) =>
        loading ? 'Generating PDF...' : children
      }
    </PDFDownloadLink>
  );
};

export default LessonPlanPDF;