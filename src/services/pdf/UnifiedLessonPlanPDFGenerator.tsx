/**
 * Unified Daily Lesson Plan PDF Generator
 * Creates a single PDF showing all subjects for the day
 * Uses 2 examples per subject (8 total across the day)
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
  pdf
} from '@react-pdf/renderer';

// Use built-in fonts for reliable PDF generation
// Font registration removed to prevent 404 errors

// Professional Design System
const colors = {
  primary: '#2563EB',      // Blue
  secondary: '#7C3AED',    // Purple
  success: '#059669',      // Green
  warning: '#D97706',      // Orange
  error: '#DC2626',        // Red
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A'
  },
  subjects: {
    math: '#3B82F6',       // Blue
    ela: '#10B981',        // Emerald
    science: '#F59E0B',    // Amber
    social: '#8B5CF6'      // Violet
  }
};

const typography = {
  display: { fontSize: 32, fontWeight: 'bold', lineHeight: 1.2 },
  h1: { fontSize: 28, fontWeight: 'bold', lineHeight: 1.3 },
  h2: { fontSize: 24, fontWeight: 'bold', lineHeight: 1.3 },
  h3: { fontSize: 20, fontWeight: 'bold', lineHeight: 1.4 },
  h4: { fontSize: 18, fontWeight: 'medium', lineHeight: 1.4 },
  h5: { fontSize: 16, fontWeight: 'medium', lineHeight: 1.5 },
  body: { fontSize: 14, fontWeight: 'normal', lineHeight: 1.6 },
  small: { fontSize: 12, fontWeight: 'normal', lineHeight: 1.5 },
  tiny: { fontSize: 10, fontWeight: 'normal', lineHeight: 1.4 }
};

// Create professional styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.gray[50],
    padding: 40,
    fontFamily: 'Helvetica'
  },

  // Header styles with modern design
  header: {
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: `3px solid ${colors.primary}`,
    position: 'relative'
  },
  headerAccent: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    width: 60,
    height: 3,
    backgroundColor: colors.secondary
  },
  title: {
    ...typography.display,
    color: colors.gray[900],
    marginBottom: 8
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
    fontWeight: 'medium'
  },

  // Modern career badge with gradient effect
  careerBadge: {
    backgroundColor: colors.primary,
    padding: 24,
    borderRadius: 16,
    marginVertical: 20,
    position: 'relative',
    overflow: 'hidden',
    wrap: false  // Keep career badge together
  },
  careerBadgeAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: '100%',
    backgroundColor: colors.secondary,
    opacity: 0.1
  },
  careerName: {
    ...typography.h2,
    color: '#FFFFFF',
    marginBottom: 4
  },
  careerSubtitle: {
    ...typography.small,
    color: colors.gray[200],
    fontWeight: 'medium'
  },

  // Section styles with professional design
  section: {
    marginBottom: 24,
    position: 'relative'
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.gray[900],
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: `2px solid ${colors.gray[200]}`,
    textAlign: 'left'
  },
  sectionContent: {
    ...typography.body,
    color: colors.gray[700],
    lineHeight: 1.6
  },

  // Professional subject cards with modern design
  subjectCard: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 5,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    wrap: false  // Prevent breaking across pages
  },
  mathCard: {
    borderLeftColor: colors.subjects.math,
    backgroundColor: '#F0F9FF'
  },
  elaCard: {
    borderLeftColor: colors.subjects.ela,
    backgroundColor: '#F0FDF4'
  },
  scienceCard: {
    borderLeftColor: colors.subjects.science,
    backgroundColor: '#FFFBEB'
  },
  socialCard: {
    borderLeftColor: colors.subjects.social,
    backgroundColor: '#FAF5FF'
  },

  // Professional challenge/activity cards
  challengeBox: {
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    marginLeft: 0,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    position: 'relative',
    wrap: false  // Prevent breaking across pages
  },
  challengeTitle: {
    ...typography.small,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 6
  },
  challengeContent: {
    ...typography.tiny,
    color: colors.gray[700],
    lineHeight: 1.5,
    marginBottom: 4
  },

  // Professional parent guide section
  parentGuide: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    marginTop: 24,
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    position: 'relative',
    wrap: false  // Keep parent guide together
  },
  parentTitle: {
    ...typography.h4,
    color: '#0C4A6E',
    marginBottom: 8
  },

  // Professional footer
  footer: {
    marginTop: 'auto',
    marginBottom: 30,
    marginLeft: 30,
    marginRight: 30,
    ...typography.tiny,
    color: colors.gray[500],
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: 16
  },

  // Professional overview box
  overviewBox: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderLeftWidth: 5,
    borderLeftColor: colors.primary
  },

  // Professional grid layout
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 20
  },
  infoItem: {
    flex: 1,
    alignItems: 'flex-start'
  },
  infoLabel: {
    ...typography.tiny,
    color: colors.gray[600],
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'medium'
  },
  infoValue: {
    ...typography.small,
    fontWeight: 'bold',
    color: colors.gray[900]
  }
});

// Subject emoji mapping - removed for PDF compatibility
// const subjectEmojis = {
//   Math: '🔢',
//   ELA: '📚',
//   Science: '🧪',
//   'Social Studies': '🌎'
// };

// Subject color mapping for border
const getSubjectCardStyle = (subject: string) => {
  switch(subject) {
    case 'Math': return styles.mathCard;
    case 'ELA': return styles.elaCard;
    case 'Science': return styles.scienceCard;
    case 'Social Studies': return styles.socialCard;
    default: return {};
  }
};

// PDF Document Component for Unified Daily Plan
export const UnifiedLessonPlanPDF = ({ lessonPlan }: { lessonPlan: any }) => {
  // Debug: Log what we're receiving
  if (lessonPlan.content?.subjectContents?.Math?.challenges?.[0]) {
    console.log('📋 PDF Generator - First Math challenge:', {
      fullChallenge: lessonPlan.content.subjectContents.Math.challenges[0],
      hasDescription: !!lessonPlan.content.subjectContents.Math.challenges[0].description,
      description: lessonPlan.content.subjectContents.Math.challenges[0].description,
      hasQuestion: !!lessonPlan.content.subjectContents.Math.challenges[0].question,
      question: lessonPlan.content.subjectContents.Math.challenges[0].question,
      hasOptions: !!lessonPlan.content.subjectContents.Math.challenges[0].options,
      hasHint: !!lessonPlan.content.subjectContents.Math.challenges[0].hint
    });
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Strip emojis from text for PDF rendering (Helvetica font doesn't support emojis)
  const stripEmojis = (text: string) => {
    if (!text) return text;
    // Comprehensive emoji removal including compound emojis with ZWJ (Zero Width Joiner)
    // This covers all emoji ranges, symbols, and special characters Helvetica can't render
    return text
      .replace(/[\u{1F000}-\u{1F9FF}]/gu, '') // All emojis
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Miscellaneous symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation selectors
      .replace(/[\u{200D}]/gu, '')            // Zero width joiner
      .replace(/[\u{20E3}]/gu, '')            // Combining enclosing keycap
      .replace(/[\u{E0020}-\u{E007F}]/gu, '') // Tags
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Regional indicators (flags)
      .trim();
  };

  // Convert shape emoji symbols to text descriptions for PDF rendering
  // For non-shape emojis, strip them entirely
  const convertShapeEmojiToText = (option: string) => {
    if (!option) return option;

    // Map common shape emojis to text descriptions
    const shapeMap: { [key: string]: string } = {
      '⭕': 'Circle',
      '🔴': 'Circle',
      '🟠': 'Circle',
      '🟢': 'Circle',
      '🔵': 'Circle',
      '⬜': 'Square',
      '◻️': 'Square',
      '◼️': 'Square',
      '🟦': 'Square',
      '🔺': 'Triangle',
      '🔻': 'Triangle',
      '▲': 'Triangle',
      '▼': 'Triangle',
      '▬': 'Rectangle',
      '▭': 'Rectangle',
      '🟩': 'Rectangle',
      '🟨': 'Rectangle'
    };

    // If it's a recognized shape emoji, convert to text
    if (shapeMap[option]) {
      return shapeMap[option];
    }

    // Otherwise, strip all emojis (for scenario emojis like cooking, firefighter, etc.)
    return stripEmojis(option);
  };

  return (
    <Document>
      {/* Page 1: Daily Overview & Career Introduction */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {lessonPlan.student.name}'s Daily Learning Adventure
          </Text>
          <Text style={styles.subtitle}>
            {formatDate(lessonPlan.generatedAt)}
          </Text>
        </View>

        {/* Career Badge - No Emoji */}
        <View style={styles.careerBadge}>
          <View>
            <Text style={styles.careerName}>{lessonPlan.career.careerName}</Text>
            <Text style={styles.careerSubtitle}>
              Today's Career Adventure
            </Text>
          </View>
        </View>

        {/* Daily Overview */}
        <View style={styles.overviewBox}>
          <Text style={{...typography.h4, color: '#1E40AF', marginBottom: 10 }}>
            Complete Daily Learning Plan
          </Text>
          <Text style={{...typography.body, color: '#1E40AF', marginBottom: 8 }}>
            {lessonPlan.student.name} explores being a {lessonPlan.career.careerName} while learning:
          </Text>
          <View style={{ marginLeft: 16 }}>
            {Object.keys(lessonPlan.content.subjectContents).map((subject, index) => (
              <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
                <Text style={{...typography.small, color: '#1E40AF' }}>
                  {subject}: {lessonPlan.content.subjectContents[subject].skill.objective}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Master Narrative Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Story</Text>
          <Text style={styles.sectionContent}>
            {lessonPlan.content.masterNarrative?.intro ||
             `${lessonPlan.student.name} becomes a ${lessonPlan.career.careerName} Helper! They'll use all their skills - math, reading, science, and social studies - to help in the ${lessonPlan.career.careerName}'s workplace.`}
          </Text>
        </View>

        {/* ENRICHMENT: Milestones Section */}
        {lessonPlan.content?.enrichment?.milestones && (
          <View style={{
            backgroundColor: '#FEF3C7',
            padding: 16,
            borderRadius: 12,
            marginTop: 16,
            borderLeftWidth: 5,
            borderLeftColor: '#F59E0B',
            borderWidth: 1,
            borderColor: '#FDE68A'
          }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#78350F', marginBottom: 10 }}>
              Learning Milestones
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 10, color: '#92400E', fontWeight: 'bold', marginRight: 6 }}>
                  First Achievement:
                </Text>
                <Text style={{ fontSize: 10, color: '#92400E', flex: 1 }}>
                  {lessonPlan.content.enrichment.milestones.firstAchievement}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 10, color: '#92400E', fontWeight: 'bold', marginRight: 6 }}>
                  Midway Mastery:
                </Text>
                <Text style={{ fontSize: 10, color: '#92400E', flex: 1 }}>
                  {lessonPlan.content.enrichment.milestones.midwayMastery}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 10, color: '#92400E', fontWeight: 'bold', marginRight: 6 }}>
                  Final Victory:
                </Text>
                <Text style={{ fontSize: 10, color: '#92400E', flex: 1 }}>
                  {lessonPlan.content.enrichment.milestones.finalVictory}
                </Text>
              </View>
              {lessonPlan.content.enrichment.milestones.bonusChallenge && (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 10, color: '#92400E', fontWeight: 'bold', marginRight: 6 }}>
                    Bonus Challenge:
                  </Text>
                  <Text style={{ fontSize: 10, color: '#92400E', flex: 1 }}>
                    {lessonPlan.content.enrichment.milestones.bonusChallenge}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ENRICHMENT: Parent Value Section */}
        {lessonPlan.content?.enrichment?.parentValue && (
          <View style={{
            backgroundColor: '#F3E8FF',
            padding: 16,
            borderRadius: 12,
            marginTop: 16,
            borderLeftWidth: 5,
            borderLeftColor: '#A855F7',
            borderWidth: 1,
            borderColor: '#E9D5FF'
          }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#581C87', marginBottom: 10 }}>
              Why This Matters
            </Text>
            <View style={{ gap: 8 }}>
              <View>
                <Text style={{ fontSize: 9, color: '#6B21A8', fontWeight: 'bold', marginBottom: 2 }}>
                  Real-World Connection:
                </Text>
                <Text style={{ fontSize: 9, color: '#6B21A8' }}>
                  {lessonPlan.content.enrichment.parentValue.realWorldConnection}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 9, color: '#6B21A8', fontWeight: 'bold', marginBottom: 2 }}>
                  Future Readiness:
                </Text>
                <Text style={{ fontSize: 9, color: '#6B21A8' }}>
                  {lessonPlan.content.enrichment.parentValue.futureReadiness}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 9, color: '#6B21A8', fontWeight: 'bold', marginBottom: 2 }}>
                  Engagement Promise:
                </Text>
                <Text style={{ fontSize: 9, color: '#6B21A8' }}>
                  {lessonPlan.content.enrichment.parentValue.engagementPromise}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 9, color: '#6B21A8', fontWeight: 'bold', marginBottom: 2 }}>
                  What Makes Us Different:
                </Text>
                <Text style={{ fontSize: 9, color: '#6B21A8' }}>
                  {lessonPlan.content.enrichment.parentValue.differentiator}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Learning Goals Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Grade Level</Text>
            <Text style={styles.infoValue}>{lessonPlan.student.grade || lessonPlan.student.gradeLevel || 'K'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Subjects</Text>
            <Text style={styles.infoValue}>4 Core</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Activities</Text>
            <Text style={styles.infoValue}>8 Challenges</Text>
          </View>
        </View>

        {/* Parent Guide */}
        <View style={styles.parentGuide}>
          <Text style={styles.parentTitle}>Parent Quick Guide</Text>
          <Text style={styles.sectionContent}>
            This unified daily plan shows all subjects your child will learn through the lens of being
            a {lessonPlan.career.careerName}. Each subject includes example challenges that demonstrate our
            career-based learning approach. Students can choose different careers
            while learning the same curriculum skills.
          </Text>
        </View>

        {/* How It Works */}
        <View style={{ backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginTop: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#78350F', marginBottom: 5 }}>
            How Career-Based Learning Works
          </Text>
          <Text style={{ fontSize: 10, color: '#78350F', marginBottom: 3 }}>
            1. Choose your career adventure for the day
          </Text>
          <Text style={{ fontSize: 10, color: '#78350F', marginBottom: 3 }}>
            2. Complete all learning subjects as a Chef
          </Text>
          <Text style={{ fontSize: 10, color: '#78350F', marginBottom: 3 }}>
            3. Apply skills in real career contexts
          </Text>
          <Text style={{ fontSize: 10, color: '#78350F' }}>
            4. Each day brings a new career choice with the same curriculum
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Pathfinity • Unified Daily Plan • Page 1 of 3
        </Text>
      </Page>

      {/* Page 2: Math & ELA Examples */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Math & Language Arts</Text>

        {/* Math Section */}
        {lessonPlan.content.subjectContents.Math && (
          <View style={[styles.subjectCard, getSubjectCardStyle('Math')]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{...typography.h4, color: colors.gray[900] }}>
                  Mathematics
                </Text>
                <Text style={{...typography.small, color: colors.gray[600] }}>
                  {lessonPlan.content.subjectContents.Math.skill.objective}
                </Text>
              </View>
            </View>

            {/* Show setup/scenario if available */}
            {lessonPlan.content.subjectContents.Math.setup && (
              <View style={{ backgroundColor: '#F0F9FF', padding: 8, borderRadius: 4, marginBottom: 8 }}>
                <Text style={{ fontSize: 9, color: '#0369A1', fontStyle: 'italic' }}>
                  Setup: {lessonPlan.content.subjectContents.Math.setup}
                </Text>
              </View>
            )}

            {/* Instructional Video */}
            {lessonPlan.content.subjectContents.Math.video && (
              <View style={{
                marginBottom: 12,
                backgroundColor: '#FEF3C7',
                padding: 12,
                borderRadius: 8,
                borderLeft: '4px solid #F59E0B',
                wrap: false
              }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#92400E', marginBottom: 6 }}>
                  Instructional Video
                </Text>
                {lessonPlan.content.subjectContents.Math.video.videoUrl ? (
                  <>
                    <Text style={{ fontSize: 9, color: '#78350F', marginBottom: 3 }}>
                      <Text style={{ fontWeight: 'bold' }}>Title:</Text> {stripEmojis(lessonPlan.content.subjectContents.Math.video.title)}
                    </Text>
                    {lessonPlan.content.subjectContents.Math.video.channelTitle && (
                      <Text style={{ fontSize: 8, color: '#92400E', marginBottom: 3 }}>
                        <Text style={{ fontWeight: 'bold' }}>Channel:</Text> {lessonPlan.content.subjectContents.Math.video.channelTitle}
                      </Text>
                    )}
                    {lessonPlan.content.subjectContents.Math.video.duration && (
                      <Text style={{ fontSize: 8, color: '#92400E', marginBottom: 3 }}>
                        <Text style={{ fontWeight: 'bold' }}>Duration:</Text> {Math.floor(lessonPlan.content.subjectContents.Math.video.duration / 60)}min {lessonPlan.content.subjectContents.Math.video.duration % 60}sec
                      </Text>
                    )}
                    <Text style={{ fontSize: 8, color: '#78350F', marginTop: 4, fontStyle: 'italic' }}>
                      Your child will watch this educational video to learn the concept before practicing.
                    </Text>
                  </>
                ) : (
                  <Text style={{ fontSize: 9, color: '#92400E', fontStyle: 'italic' }}>
                    {lessonPlan.content.subjectContents.Math.video.fallbackMessage || 'Video content will be provided during the lesson'}
                  </Text>
                )}
              </View>
            )}

            {/* Practice Questions (QuestionTypes) */}
            {lessonPlan.content.subjectContents.Math.practiceQuestions && lessonPlan.content.subjectContents.Math.practiceQuestions.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.gray[800], marginBottom: 8 }}>
                  Practice Questions
                </Text>
                {lessonPlan.content.subjectContents.Math.practiceQuestions.map((question, idx) => (
                  <View key={idx} style={[styles.challengeBox, { marginBottom: 8 }]}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.gray[900], marginBottom: 4 }}>
                      Question {idx + 1} ({question.type})
                    </Text>
                    <Text style={{ fontSize: 9, color: colors.gray[700], marginBottom: 4 }}>
                      {stripEmojis(question.question)}
                    </Text>
                    {(() => {
                      // For counting questions without options, generate numeric options dynamically
                      if (question.type === 'counting' && (!question.options || question.options.length === 0)) {
                        const correctAnswer = typeof question.correct_answer === 'number' ? question.correct_answer : parseInt(question.correct_answer) || 3;
                        // Generate 4 sequential options starting from correct_answer - 1 (or 1 if that's too low)
                        const startNum = Math.max(1, correctAnswer - 1);
                        const generatedOptions = [startNum, startNum + 1, startNum + 2, startNum + 3];

                        return (
                          <View style={{ marginLeft: 8, marginTop: 4 }}>
                            {generatedOptions.map((num, optIdx) => (
                              <Text key={optIdx} style={{ fontSize: 8, color: colors.gray[600], marginBottom: 2 }}>
                                {String.fromCharCode(65 + optIdx)}) {num}
                              </Text>
                            ))}
                          </View>
                        );
                      }

                      // For regular questions with options array
                      if (question.options && question.options.length > 0) {
                        return (
                          <View style={{ marginLeft: 8, marginTop: 4 }}>
                            {question.options.map((option, optIdx) => (
                              <Text key={optIdx} style={{ fontSize: 8, color: colors.gray[600], marginBottom: 2 }}>
                                {String.fromCharCode(65 + optIdx)}) {convertShapeEmojiToText(option)}
                              </Text>
                            ))}
                          </View>
                        );
                      }

                      return null;
                    })()}
                    {question.hint && (
                      <Text style={{ fontSize: 8, color: '#6B7280', fontStyle: 'italic', marginTop: 3 }}>
                        Hint: {stripEmojis(question.hint)}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Assessment Question */}
            {lessonPlan.content.subjectContents.Math.assessmentQuestion && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.gray[800], marginBottom: 8 }}>
                  Assessment
                </Text>
                <View style={[styles.challengeBox, { borderLeftColor: colors.warning, borderLeftWidth: 4 }]}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.gray[900], marginBottom: 4 }}>
                    Assessment Question ({lessonPlan.content.subjectContents.Math.assessmentQuestion.type})
                  </Text>
                  <Text style={{ fontSize: 9, color: colors.gray[700], marginBottom: 4 }}>
                    {stripEmojis(lessonPlan.content.subjectContents.Math.assessmentQuestion.question)}
                  </Text>
                  {lessonPlan.content.subjectContents.Math.assessmentQuestion.options && lessonPlan.content.subjectContents.Math.assessmentQuestion.options.length > 0 && (
                    <View style={{ marginLeft: 8, marginTop: 4 }}>
                      {lessonPlan.content.subjectContents.Math.assessmentQuestion.options.map((option, optIdx) => (
                        <Text key={optIdx} style={{ fontSize: 8, color: colors.gray[600], marginBottom: 2 }}>
                          {String.fromCharCode(65 + optIdx)}) {convertShapeEmojiToText(option)}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ENRICHMENT: Real-World Applications for Math */}
            {lessonPlan.content?.enrichment?.realWorldApplications?.math && (
              <View style={{
                backgroundColor: '#ECFDF5',
                padding: 12,
                borderRadius: 8,
                marginTop: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#10B981',
                borderWidth: 1,
                borderColor: '#A7F3D0'
              }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#065F46', marginBottom: 6 }}>
                  How {lessonPlan.career.careerName}s Use Math Skills
                </Text>
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 9, color: '#047857' }}>
                    <Text style={{ fontWeight: 'bold' }}>Now: </Text>
                    {lessonPlan.content.enrichment.realWorldApplications.math.immediate}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#047857' }}>
                    <Text style={{ fontWeight: 'bold' }}>Soon: </Text>
                    {lessonPlan.content.enrichment.realWorldApplications.math.nearFuture}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#047857' }}>
                    <Text style={{ fontWeight: 'bold' }}>Future: </Text>
                    {lessonPlan.content.enrichment.realWorldApplications.math.longTerm}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#047857', fontStyle: 'italic', marginTop: 3, paddingTop: 3, borderTopWidth: 1, borderTopColor: '#A7F3D0' }}>
                    {lessonPlan.content.enrichment.realWorldApplications.math.careerConnection}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ELA Section */}
        {lessonPlan.content.subjectContents.ELA && (
          <View style={[styles.subjectCard, getSubjectCardStyle('ELA')]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{...typography.h4, color: colors.gray[900] }}>
                  English Language Arts
                </Text>
                <Text style={{...typography.small, color: colors.gray[600] }}>
                  {lessonPlan.content.subjectContents.ELA.skill.objective}
                </Text>
              </View>
            </View>

            {/* Show setup/scenario if available */}
            {lessonPlan.content.subjectContents.ELA.setup && (
              <View style={{ backgroundColor: '#F0F9FF', padding: 8, borderRadius: 4, marginBottom: 8 }}>
                <Text style={{ fontSize: 9, color: '#0369A1', fontStyle: 'italic' }}>
                  Setup: {lessonPlan.content.subjectContents.ELA.setup}
                </Text>
              </View>
            )}

            {/* Instructional Video */}
            {lessonPlan.content.subjectContents.ELA.video && (
              <View style={{
                marginBottom: 12,
                backgroundColor: '#FEF3C7',
                padding: 12,
                borderRadius: 8,
                borderLeft: '4px solid #F59E0B',
                wrap: false
              }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#92400E', marginBottom: 6 }}>
                  Instructional Video
                </Text>
                {lessonPlan.content.subjectContents.ELA.video.videoUrl ? (
                  <>
                    <Text style={{ fontSize: 9, color: '#78350F', marginBottom: 3 }}>
                      <Text style={{ fontWeight: 'bold' }}>Title:</Text> {stripEmojis(lessonPlan.content.subjectContents.ELA.video.title)}
                    </Text>
                    {lessonPlan.content.subjectContents.ELA.video.channelTitle && (
                      <Text style={{ fontSize: 8, color: '#92400E', marginBottom: 3 }}>
                        <Text style={{ fontWeight: 'bold' }}>Channel:</Text> {lessonPlan.content.subjectContents.ELA.video.channelTitle}
                      </Text>
                    )}
                    {lessonPlan.content.subjectContents.ELA.video.duration && (
                      <Text style={{ fontSize: 8, color: '#92400E', marginBottom: 3 }}>
                        <Text style={{ fontWeight: 'bold' }}>Duration:</Text> {Math.floor(lessonPlan.content.subjectContents.ELA.video.duration / 60)}min {lessonPlan.content.subjectContents.ELA.video.duration % 60}sec
                      </Text>
                    )}
                    <Text style={{ fontSize: 8, color: '#78350F', marginTop: 4, fontStyle: 'italic' }}>
                      Your child will watch this educational video to learn the concept before practicing.
                    </Text>
                  </>
                ) : (
                  <Text style={{ fontSize: 9, color: '#92400E', fontStyle: 'italic' }}>
                    {lessonPlan.content.subjectContents.ELA.video.fallbackMessage || 'Video content will be provided during the lesson'}
                  </Text>
                )}
              </View>
            )}

            {/* Practice Questions (QuestionTypes) */}
            {lessonPlan.content.subjectContents.ELA.practiceQuestions && lessonPlan.content.subjectContents.ELA.practiceQuestions.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.gray[800], marginBottom: 8 }}>
                  Practice Questions
                </Text>
                {lessonPlan.content.subjectContents.ELA.practiceQuestions.map((question, idx) => (
                  <View key={idx} style={[styles.challengeBox, { marginBottom: 8 }]}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.gray[900], marginBottom: 4 }}>
                      Question {idx + 1} ({question.type})
                    </Text>
                    <Text style={{ fontSize: 9, color: colors.gray[700], marginBottom: 4 }}>
                      {stripEmojis(question.question)}
                    </Text>
                    {(() => {
                      // For counting questions without options, generate numeric options dynamically
                      if (question.type === 'counting' && (!question.options || question.options.length === 0)) {
                        const correctAnswer = typeof question.correct_answer === 'number' ? question.correct_answer : parseInt(question.correct_answer) || 3;
                        // Generate 4 sequential options starting from correct_answer - 1 (or 1 if that's too low)
                        const startNum = Math.max(1, correctAnswer - 1);
                        const generatedOptions = [startNum, startNum + 1, startNum + 2, startNum + 3];

                        return (
                          <View style={{ marginLeft: 8, marginTop: 4 }}>
                            {generatedOptions.map((num, optIdx) => (
                              <Text key={optIdx} style={{ fontSize: 8, color: colors.gray[600], marginBottom: 2 }}>
                                {String.fromCharCode(65 + optIdx)}) {num}
                              </Text>
                            ))}
                          </View>
                        );
                      }

                      // For regular questions with options array
                      if (question.options && question.options.length > 0) {
                        return (
                          <View style={{ marginLeft: 8, marginTop: 4 }}>
                            {question.options.map((option, optIdx) => (
                              <Text key={optIdx} style={{ fontSize: 8, color: colors.gray[600], marginBottom: 2 }}>
                                {String.fromCharCode(65 + optIdx)}) {convertShapeEmojiToText(option)}
                              </Text>
                            ))}
                          </View>
                        );
                      }

                      return null;
                    })()}
                    {question.hint && (
                      <Text style={{ fontSize: 8, color: '#6B7280', fontStyle: 'italic', marginTop: 3 }}>
                        Hint: {stripEmojis(question.hint)}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Assessment Question */}
            {lessonPlan.content.subjectContents.ELA.assessmentQuestion && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.gray[800], marginBottom: 8 }}>
                  Assessment
                </Text>
                <View style={[styles.challengeBox, { borderLeftColor: colors.warning, borderLeftWidth: 4 }]}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.gray[900], marginBottom: 4 }}>
                    Assessment Question ({lessonPlan.content.subjectContents.ELA.assessmentQuestion.type})
                  </Text>
                  <Text style={{ fontSize: 9, color: colors.gray[700], marginBottom: 4 }}>
                    {stripEmojis(lessonPlan.content.subjectContents.ELA.assessmentQuestion.question)}
                  </Text>
                  {lessonPlan.content.subjectContents.ELA.assessmentQuestion.options && lessonPlan.content.subjectContents.ELA.assessmentQuestion.options.length > 0 && (
                    <View style={{ marginLeft: 8, marginTop: 4 }}>
                      {lessonPlan.content.subjectContents.ELA.assessmentQuestion.options.map((option, optIdx) => (
                        <Text key={optIdx} style={{ fontSize: 8, color: colors.gray[600], marginBottom: 2 }}>
                          {String.fromCharCode(65 + optIdx)}) {convertShapeEmojiToText(option)}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ENRICHMENT: Real-World Applications for ELA */}
            {lessonPlan.content?.enrichment?.realWorldApplications?.ela && (
              <View style={{
                backgroundColor: '#ECFDF5',
                padding: 12,
                borderRadius: 8,
                marginTop: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#10B981',
                borderWidth: 1,
                borderColor: '#A7F3D0'
              }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#065F46', marginBottom: 6 }}>
                  How {lessonPlan.career.careerName}s Use Reading & Writing Skills
                </Text>
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 9, color: '#047857' }}>
                    <Text style={{ fontWeight: 'bold' }}>Now: </Text>
                    {lessonPlan.content.enrichment.realWorldApplications.ela.immediate}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#047857' }}>
                    <Text style={{ fontWeight: 'bold' }}>Soon: </Text>
                    {lessonPlan.content.enrichment.realWorldApplications.ela.nearFuture}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#047857' }}>
                    <Text style={{ fontWeight: 'bold' }}>Future: </Text>
                    {lessonPlan.content.enrichment.realWorldApplications.ela.longTerm}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#047857', fontStyle: 'italic', marginTop: 3, paddingTop: 3, borderTopWidth: 1, borderTopColor: '#A7F3D0' }}>
                    {lessonPlan.content.enrichment.realWorldApplications.ela.careerConnection}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Learning Tip Box */}
        <View style={{ backgroundColor: '#DCFCE7', padding: 10, borderRadius: 6, marginTop: 10 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#14532D' }}>
            Learning Approach
          </Text>
          <Text style={{ fontSize: 9, color: '#14532D', marginTop: 3 }}>
            Each skill is practiced through the {lessonPlan.career.careerName} career context,
            making learning engaging and relevant to real-world applications.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Pathfinity • Math & Language Arts • Page 2 of 3
        </Text>
      </Page>

      {/* Page 3: Science & Social Studies Examples + Alternative Careers */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Science & Social Studies</Text>

        {/* Science Section */}
        {lessonPlan.content.subjectContents.Science && (
          <View style={[styles.subjectCard, getSubjectCardStyle('Science')]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{...typography.h4, color: colors.gray[900] }}>
                  Science
                </Text>
                <Text style={{...typography.small, color: colors.gray[600] }}>
                  {lessonPlan.content.subjectContents.Science.skill.objective}
                </Text>
              </View>
            </View>

            {/* Show setup/scenario if available */}
            {lessonPlan.content.subjectContents.Science.setup && (
              <View style={{ backgroundColor: '#F0F9FF', padding: 8, borderRadius: 4, marginBottom: 8 }}>
                <Text style={{ fontSize: 9, color: '#0369A1', fontStyle: 'italic' }}>
                  Setup: {lessonPlan.content.subjectContents.Science.setup}
                </Text>
              </View>
            )}

            {/* Instructional Video */}
            {lessonPlan.content.subjectContents.Science.video && (
              <View style={{
                marginBottom: 12,
                backgroundColor: '#FEF3C7',
                padding: 12,
                borderRadius: 8,
                borderLeft: '4px solid #F59E0B',
                wrap: false
              }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#92400E', marginBottom: 6 }}>
                  Instructional Video
                </Text>
                {lessonPlan.content.subjectContents.Science.video.videoUrl ? (
                  <>
                    <Text style={{ fontSize: 9, color: '#78350F', marginBottom: 3 }}>
                      <Text style={{ fontWeight: 'bold' }}>Title:</Text> {stripEmojis(lessonPlan.content.subjectContents.Science.video.title)}
                    </Text>
                    {lessonPlan.content.subjectContents.Science.video.channelTitle && (
                      <Text style={{ fontSize: 8, color: '#92400E', marginBottom: 3 }}>
                        <Text style={{ fontWeight: 'bold' }}>Channel:</Text> {lessonPlan.content.subjectContents.Science.video.channelTitle}
                      </Text>
                    )}
                    {lessonPlan.content.subjectContents.Science.video.duration && (
                      <Text style={{ fontSize: 8, color: '#92400E', marginBottom: 3 }}>
                        <Text style={{ fontWeight: 'bold' }}>Duration:</Text> {Math.floor(lessonPlan.content.subjectContents.Science.video.duration / 60)}min {lessonPlan.content.subjectContents.Science.video.duration % 60}sec
                      </Text>
                    )}
                    <Text style={{ fontSize: 8, color: '#78350F', marginTop: 4, fontStyle: 'italic' }}>
                      Your child will watch this educational video to learn the concept before practicing.
                    </Text>
                  </>
                ) : (
                  <Text style={{ fontSize: 9, color: '#92400E', fontStyle: 'italic' }}>
                    {lessonPlan.content.subjectContents.Science.video.fallbackMessage || 'Video content will be provided during the lesson'}
                  </Text>
                )}
              </View>
            )}

            {/* Practice Questions (QuestionTypes) */}
            {lessonPlan.content.subjectContents.Science.practiceQuestions && lessonPlan.content.subjectContents.Science.practiceQuestions.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.gray[800], marginBottom: 8 }}>
                  Practice Questions
                </Text>
                {lessonPlan.content.subjectContents.Science.practiceQuestions.map((question, idx) => (
                  <View key={idx} style={[styles.challengeBox, { marginBottom: 8 }]}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.gray[900], marginBottom: 4 }}>
                      Question {idx + 1} ({question.type})
                    </Text>
                    <Text style={{ fontSize: 9, color: colors.gray[700], marginBottom: 4 }}>
                      {stripEmojis(question.question)}
                    </Text>
                    {(() => {
                      // For counting questions without options, generate numeric options dynamically
                      if (question.type === 'counting' && (!question.options || question.options.length === 0)) {
                        const correctAnswer = typeof question.correct_answer === 'number' ? question.correct_answer : parseInt(question.correct_answer) || 3;
                        // Generate 4 sequential options starting from correct_answer - 1 (or 1 if that's too low)
                        const startNum = Math.max(1, correctAnswer - 1);
                        const generatedOptions = [startNum, startNum + 1, startNum + 2, startNum + 3];

                        return (
                          <View style={{ marginLeft: 8, marginTop: 4 }}>
                            {generatedOptions.map((num, optIdx) => (
                              <Text key={optIdx} style={{ fontSize: 8, color: colors.gray[600], marginBottom: 2 }}>
                                {String.fromCharCode(65 + optIdx)}) {num}
                              </Text>
                            ))}
                          </View>
                        );
                      }

                      // For regular questions with options array
                      if (question.options && question.options.length > 0) {
                        return (
                          <View style={{ marginLeft: 8, marginTop: 4 }}>
                            {question.options.map((option, optIdx) => (
                              <Text key={optIdx} style={{ fontSize: 8, color: colors.gray[600], marginBottom: 2 }}>
                                {String.fromCharCode(65 + optIdx)}) {convertShapeEmojiToText(option)}
                              </Text>
                            ))}
                          </View>
                        );
                      }

                      return null;
                    })()}
                    {question.hint && (
                      <Text style={{ fontSize: 8, color: '#6B7280', fontStyle: 'italic', marginTop: 3 }}>
                        Hint: {stripEmojis(question.hint)}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Assessment Question */}
            {lessonPlan.content.subjectContents.Science.assessmentQuestion && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.gray[800], marginBottom: 8 }}>
                  Assessment
                </Text>
                <View style={[styles.challengeBox, { borderLeftColor: colors.warning, borderLeftWidth: 4 }]}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.gray[900], marginBottom: 4 }}>
                    Assessment Question ({lessonPlan.content.subjectContents.Science.assessmentQuestion.type})
                  </Text>
                  <Text style={{ fontSize: 9, color: colors.gray[700], marginBottom: 4 }}>
                    {stripEmojis(lessonPlan.content.subjectContents.Science.assessmentQuestion.question)}
                  </Text>
                  {lessonPlan.content.subjectContents.Science.assessmentQuestion.options && lessonPlan.content.subjectContents.Science.assessmentQuestion.options.length > 0 && (
                    <View style={{ marginLeft: 8, marginTop: 4 }}>
                      {lessonPlan.content.subjectContents.Science.assessmentQuestion.options.map((option, optIdx) => (
                        <Text key={optIdx} style={{ fontSize: 8, color: colors.gray[600], marginBottom: 2 }}>
                          {String.fromCharCode(65 + optIdx)}) {convertShapeEmojiToText(option)}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ENRICHMENT: Real-World Applications for Science */}
            {lessonPlan.content?.enrichment?.realWorldApplications?.science && (
              <View style={{
                backgroundColor: '#ECFDF5',
                padding: 12,
                borderRadius: 8,
                marginTop: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#10B981',
                borderWidth: 1,
                borderColor: '#A7F3D0'
              }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#065F46', marginBottom: 6 }}>
                  How {lessonPlan.career.careerName}s Use Science Skills
                </Text>
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 9, color: '#047857' }}>
                    <Text style={{ fontWeight: 'bold' }}>Now: </Text>
                    {lessonPlan.content.enrichment.realWorldApplications.science.immediate}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#047857' }}>
                    <Text style={{ fontWeight: 'bold' }}>Soon: </Text>
                    {lessonPlan.content.enrichment.realWorldApplications.science.nearFuture}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#047857' }}>
                    <Text style={{ fontWeight: 'bold' }}>Future: </Text>
                    {lessonPlan.content.enrichment.realWorldApplications.science.longTerm}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#047857', fontStyle: 'italic', marginTop: 3, paddingTop: 3, borderTopWidth: 1, borderTopColor: '#A7F3D0' }}>
                    {lessonPlan.content.enrichment.realWorldApplications.science.careerConnection}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Social Studies Section */}
        {lessonPlan.content.subjectContents['Social Studies'] && (
          <View style={[styles.subjectCard, getSubjectCardStyle('Social Studies')]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{...typography.h4, color: colors.gray[900] }}>
                  Social Studies
                </Text>
                <Text style={{...typography.small, color: colors.gray[600] }}>
                  {lessonPlan.content.subjectContents['Social Studies'].skill.objective}
                </Text>
              </View>
            </View>

            {/* Show setup/scenario if available */}
            {lessonPlan.content.subjectContents['Social Studies'].setup && (
              <View style={{ backgroundColor: '#F0F9FF', padding: 8, borderRadius: 4, marginBottom: 8 }}>
                <Text style={{ fontSize: 9, color: '#0369A1', fontStyle: 'italic' }}>
                  Setup: {lessonPlan.content.subjectContents['Social Studies'].setup}
                </Text>
              </View>
            )}

            {/* Instructional Video */}
            {lessonPlan.content.subjectContents['Social Studies'].video && (
              <View style={{
                marginBottom: 12,
                backgroundColor: '#FEF3C7',
                padding: 12,
                borderRadius: 8,
                borderLeft: '4px solid #F59E0B',
                wrap: false
              }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#92400E', marginBottom: 6 }}>
                  Instructional Video
                </Text>
                {lessonPlan.content.subjectContents['Social Studies'].video.videoUrl ? (
                  <>
                    <Text style={{ fontSize: 9, color: '#78350F', marginBottom: 3 }}>
                      <Text style={{ fontWeight: 'bold' }}>Title:</Text> {stripEmojis(lessonPlan.content.subjectContents['Social Studies'].video.title)}
                    </Text>
                    {lessonPlan.content.subjectContents['Social Studies'].video.channelTitle && (
                      <Text style={{ fontSize: 8, color: '#92400E', marginBottom: 3 }}>
                        <Text style={{ fontWeight: 'bold' }}>Channel:</Text> {lessonPlan.content.subjectContents['Social Studies'].video.channelTitle}
                      </Text>
                    )}
                    {lessonPlan.content.subjectContents['Social Studies'].video.duration && (
                      <Text style={{ fontSize: 8, color: '#92400E', marginBottom: 3 }}>
                        <Text style={{ fontWeight: 'bold' }}>Duration:</Text> {Math.floor(lessonPlan.content.subjectContents['Social Studies'].video.duration / 60)}min {lessonPlan.content.subjectContents['Social Studies'].video.duration % 60}sec
                      </Text>
                    )}
                    <Text style={{ fontSize: 8, color: '#78350F', marginTop: 4, fontStyle: 'italic' }}>
                      Your child will watch this educational video to learn the concept before practicing.
                    </Text>
                  </>
                ) : (
                  <Text style={{ fontSize: 9, color: '#92400E', fontStyle: 'italic' }}>
                    {lessonPlan.content.subjectContents['Social Studies'].video.fallbackMessage || 'Video content will be provided during the lesson'}
                  </Text>
                )}
              </View>
            )}

            {/* Practice Questions (QuestionTypes) */}
            {lessonPlan.content.subjectContents['Social Studies'].practiceQuestions && lessonPlan.content.subjectContents['Social Studies'].practiceQuestions.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.gray[800], marginBottom: 8 }}>
                  Practice Questions
                </Text>
                {lessonPlan.content.subjectContents['Social Studies'].practiceQuestions.map((question, idx) => (
                  <View key={idx} style={[styles.challengeBox, { marginBottom: 8 }]}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.gray[900], marginBottom: 4 }}>
                      Question {idx + 1} ({question.type})
                    </Text>
                    <Text style={{ fontSize: 9, color: colors.gray[700], marginBottom: 4 }}>
                      {stripEmojis(question.question)}
                    </Text>
                    {(() => {
                      // For counting questions without options, generate numeric options dynamically
                      if (question.type === 'counting' && (!question.options || question.options.length === 0)) {
                        const correctAnswer = typeof question.correct_answer === 'number' ? question.correct_answer : parseInt(question.correct_answer) || 3;
                        // Generate 4 sequential options starting from correct_answer - 1 (or 1 if that's too low)
                        const startNum = Math.max(1, correctAnswer - 1);
                        const generatedOptions = [startNum, startNum + 1, startNum + 2, startNum + 3];

                        return (
                          <View style={{ marginLeft: 8, marginTop: 4 }}>
                            {generatedOptions.map((num, optIdx) => (
                              <Text key={optIdx} style={{ fontSize: 8, color: colors.gray[600], marginBottom: 2 }}>
                                {String.fromCharCode(65 + optIdx)}) {num}
                              </Text>
                            ))}
                          </View>
                        );
                      }

                      // For regular questions with options array
                      if (question.options && question.options.length > 0) {
                        return (
                          <View style={{ marginLeft: 8, marginTop: 4 }}>
                            {question.options.map((option, optIdx) => (
                              <Text key={optIdx} style={{ fontSize: 8, color: colors.gray[600], marginBottom: 2 }}>
                                {String.fromCharCode(65 + optIdx)}) {convertShapeEmojiToText(option)}
                              </Text>
                            ))}
                          </View>
                        );
                      }

                      return null;
                    })()}
                    {question.hint && (
                      <Text style={{ fontSize: 8, color: '#6B7280', fontStyle: 'italic', marginTop: 3 }}>
                        Hint: {stripEmojis(question.hint)}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Assessment Question */}
            {lessonPlan.content.subjectContents['Social Studies'].assessmentQuestion && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.gray[800], marginBottom: 8 }}>
                  Assessment
                </Text>
                <View style={[styles.challengeBox, { borderLeftColor: colors.warning, borderLeftWidth: 4 }]}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.gray[900], marginBottom: 4 }}>
                    Assessment Question ({lessonPlan.content.subjectContents['Social Studies'].assessmentQuestion.type})
                  </Text>
                  <Text style={{ fontSize: 9, color: colors.gray[700], marginBottom: 4 }}>
                    {stripEmojis(lessonPlan.content.subjectContents['Social Studies'].assessmentQuestion.question)}
                  </Text>
                  {lessonPlan.content.subjectContents['Social Studies'].assessmentQuestion.options && lessonPlan.content.subjectContents['Social Studies'].assessmentQuestion.options.length > 0 && (
                    <View style={{ marginLeft: 8, marginTop: 4 }}>
                      {lessonPlan.content.subjectContents['Social Studies'].assessmentQuestion.options.map((option, optIdx) => (
                        <Text key={optIdx} style={{ fontSize: 8, color: colors.gray[600], marginBottom: 2 }}>
                          {String.fromCharCode(65 + optIdx)}) {convertShapeEmojiToText(option)}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ENRICHMENT: Real-World Applications for Social Studies */}
            {lessonPlan.content?.enrichment?.realWorldApplications?.socialstudies && (
              <View style={{
                backgroundColor: '#ECFDF5',
                padding: 12,
                borderRadius: 8,
                marginTop: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#10B981',
                borderWidth: 1,
                borderColor: '#A7F3D0'
              }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#065F46', marginBottom: 6 }}>
                  How {lessonPlan.career.careerName}s Use Social Studies Skills
                </Text>
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 9, color: '#047857' }}>
                    <Text style={{ fontWeight: 'bold' }}>Now: </Text>
                    {lessonPlan.content.enrichment.realWorldApplications.socialstudies.immediate}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#047857' }}>
                    <Text style={{ fontWeight: 'bold' }}>Soon: </Text>
                    {lessonPlan.content.enrichment.realWorldApplications.socialstudies.nearFuture}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#047857' }}>
                    <Text style={{ fontWeight: 'bold' }}>Future: </Text>
                    {lessonPlan.content.enrichment.realWorldApplications.socialstudies.longTerm}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#047857', fontStyle: 'italic', marginTop: 3, paddingTop: 3, borderTopWidth: 1, borderTopColor: '#A7F3D0' }}>
                    {lessonPlan.content.enrichment.realWorldApplications.socialstudies.careerConnection}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Alternative Career Options */}
        <View style={{ backgroundColor: '#F0F9FF', padding: 12, borderRadius: 8, marginTop: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0369A1', marginBottom: 8 }}>
            Other Career Adventures Available
          </Text>
          <Text style={{ fontSize: 9, color: '#075985', marginBottom: 5 }}>
            The same skills can be learned through any of these career adventures:
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
            {['Doctor', 'Artist', 'Athlete', 'Teacher', 'Firefighter', 'Scientist'].map((career, idx) => (
              <View key={idx} style={{
                backgroundColor: '#FFFFFF',
                padding: 4,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#BFDBFE'
              }}>
                <Text style={{ fontSize: 9, color: '#1E40AF' }}>{career}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Success Metrics */}
        <View style={{ backgroundColor: '#FEF3C7', padding: 10, borderRadius: 6, marginTop: 10 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#78350F' }}>
            Daily Learning Goals
          </Text>
          <Text style={{ fontSize: 9, color: '#78350F', marginTop: 3 }}>
            ✓ Complete all 4 subjects (Math, ELA, Science, Social Studies)
          </Text>
          <Text style={{ fontSize: 9, color: '#78350F' }}>
            ✓ Explore career of {lessonPlan.career.careerName}
          </Text>
          <Text style={{ fontSize: 9, color: '#78350F' }}>
            ✓ Apply curriculum skills in real-world contexts
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Pathfinity • Science • Page 3 of 5
        </Text>
      </Page>

      {/* Page 4: Experience Scenarios & Discover Challenges */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Extension Activities & Resources</Text>

        {/* Experience Scenarios Section - PREMIUM DESIGN */}
        <View style={styles.section}>
          {/* Premium Section Header */}
          <View style={{
            backgroundColor: '#6366F1',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
            wrap: false  // Keep section header together
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 3 }}>
              EXPERIENCE: Real-World Roleplay
            </Text>
            <Text style={{ fontSize: 9, color: '#E0E7FF' }}>
              Use newly learned skills in narrative workplace scenarios • Make workday decisions
            </Text>
          </View>

          {/* Story Title & Context */}
          {lessonPlan.content.subjectContents.Math?.interactive_simulation?.experience?.aiSourceContent?.title && (
            <View style={{
              backgroundColor: '#EEF2FF',
              padding: 10,
              borderRadius: 6,
              marginBottom: 8,
              borderLeft: '4px solid #818CF8',
              wrap: false  // Keep story context together
            }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3730A3', marginBottom: 3 }}>
                {lessonPlan.content.subjectContents.Math.interactive_simulation.experience.aiSourceContent.title}
              </Text>
              {lessonPlan.content.subjectContents.Math?.interactive_simulation?.experience?.aiSourceContent?.scenario && (
                <Text style={{ fontSize: 9, color: '#4C1D95', lineHeight: 1.4 }}>
                  {lessonPlan.content.subjectContents.Math.interactive_simulation.experience.aiSourceContent.scenario}
                </Text>
              )}
            </View>
          )}

          {/* Setting the Scene */}
          {lessonPlan.content.subjectContents.Math?.interactive_simulation?.experience?.instructions && (
            <View style={{
              backgroundColor: '#F5F3FF',
              padding: 10,
              borderRadius: 6,
              marginBottom: 12,
              borderLeft: '3px solid #A78BFA',
              wrap: false  // Keep mission together
            }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#5B21B6', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                YOUR MISSION
              </Text>
              <Text style={{ fontSize: 9, color: '#6B21A8', lineHeight: 1.3 }}>
                {lessonPlan.content.subjectContents.Math.interactive_simulation.experience.instructions}
              </Text>
            </View>
          )}

          {/* Interactive Challenges - Premium Cards */}
          {lessonPlan.content.subjectContents.Math?.experienceScenarios?.map((scenario: any, idx: number) => (
            <View key={idx} style={{
              backgroundColor: '#FFFFFF',
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
              border: '2px solid #C7D2FE',
              boxShadow: '0 2px 4px rgba(99, 102, 241, 0.1)',
              wrap: false  // Keep challenge card together
            }}>
              {/* Challenge Header */}
              <View style={{
                backgroundColor: '#E0E7FF',
                padding: 8,
                borderRadius: 6,
                marginBottom: 8
              }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#312E81' }}>
                  Challenge {idx + 1}: {scenario.challenge_summary || 'Make Your Decision'}
                </Text>
              </View>

              {/* Scenario Question */}
              <Text style={{ fontSize: 10, color: '#1E1B4B', marginBottom: 8, lineHeight: 1.4 }}>
                {stripEmojis(scenario.description || scenario.question)}
              </Text>

              {/* Decision Options */}
              {scenario.options && scenario.options.length > 0 && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#4338CA', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    Choose Your Action:
                  </Text>
                  {scenario.options.map((option: string, optIdx: number) => (
                    <View key={optIdx} style={{
                      backgroundColor: optIdx === scenario.correct_choice ? '#DBEAFE' : '#F3F4F6',
                      padding: 6,
                      borderRadius: 4,
                      marginBottom: 3,
                      borderLeft: optIdx === scenario.correct_choice ? '3px solid #3B82F6' : '3px solid #D1D5DB'
                    }}>
                      <Text style={{ fontSize: 9, color: '#374151' }}>
                        {String.fromCharCode(65 + optIdx)}) {convertShapeEmojiToText(option)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Hint */}
              {scenario.hint && (
                <View style={{ backgroundColor: '#FEF3C7', padding: 6, borderRadius: 4, marginBottom: 6 }}>
                  <Text style={{ fontSize: 8, color: '#92400E' }}>
                    <Text style={{ fontWeight: 'bold' }}>Hint:</Text> {stripEmojis(scenario.hint)}
                  </Text>
                </View>
              )}

              {/* Outcome & Learning */}
              <View style={{ borderTop: '1px solid #E5E7EB', paddingTop: 6, marginTop: 4 }}>
                {scenario.outcome && (
                  <Text style={{ fontSize: 8, color: '#059669', marginBottom: 3, lineHeight: 1.3 }}>
                    <Text style={{ fontWeight: 'bold' }}>Outcome:</Text> {stripEmojis(scenario.outcome)}
                  </Text>
                )}
                {scenario.learning_point && (
                  <Text style={{ fontSize: 8, color: '#7C3AED', fontWeight: 'bold', lineHeight: 1.3 }}>
                    <Text style={{ fontWeight: 'normal' }}>Key Learning:</Text> {stripEmojis(scenario.learning_point)}
                  </Text>
                )}
              </View>
            </View>
          ))}

          {/* Fallback if no scenarios generated */}
          {(!lessonPlan.content.subjectContents.Math?.experienceScenarios || lessonPlan.content.subjectContents.Math.experienceScenarios.length === 0) && (
            <>
              <View style={{ backgroundColor: '#E0E7FF', padding: 10, borderRadius: 6, marginBottom: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#312E81', marginBottom: 4 }}>
                  A Day as a {lessonPlan.career.careerName}
                </Text>
                <Text style={{ fontSize: 9, color: '#4C1D95' }}>
                  Imagine you're a {lessonPlan.career.careerName} today! You need to use all the skills you learned
                  to help your customers. Let's practice by organizing your workspace and helping
                  three customers with their needs.
                </Text>
              </View>

              <View style={{ backgroundColor: '#E0E7FF', padding: 10, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#312E81', marginBottom: 4 }}>
                  {lessonPlan.career.careerName}'s Problem Solving
                </Text>
                <Text style={{ fontSize: 9, color: '#4C1D95' }}>
                  Oh no! A {lessonPlan.career.careerName} has a challenge that needs your help. Can you solve it?
                  Work through the problem step by step using what you've learned.
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Discover Challenges Section - PREMIUM DESIGN */}
        <View style={styles.section}>
          {/* Premium Section Header */}
          <View style={{
            backgroundColor: '#F59E0B',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
            wrap: false  // Keep section header together
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 3 }}>
              DISCOVER: Curiosity-Driven Exploration
            </Text>
            <Text style={{ fontSize: 9, color: '#FEF3C7' }}>
              Discover surprising ways careers use newly learned skills • Spark wonder and curiosity
            </Text>
          </View>

          {/* Field Trip Title & Theme */}
          {lessonPlan.content.subjectContents.Math?.interactive_simulation?.discover?.aiSourceContent?.title && (
            <View style={{
              backgroundColor: '#FFFBEB',
              padding: 10,
              borderRadius: 6,
              marginBottom: 8,
              borderLeft: '4px solid #FBBF24',
              wrap: false  // Keep field trip title together
            }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#92400E', marginBottom: 3 }}>
                {lessonPlan.content.subjectContents.Math.interactive_simulation.discover.aiSourceContent.title}
              </Text>
              {lessonPlan.content.subjectContents.Math?.interactive_simulation?.discover?.aiSourceContent?.exploration_theme && (
                <Text style={{ fontSize: 9, color: '#B45309', lineHeight: 1.4, fontStyle: 'italic' }}>
                  {lessonPlan.content.subjectContents.Math.interactive_simulation.discover.aiSourceContent.exploration_theme}
                </Text>
              )}
            </View>
          )}

          {/* Welcome Message */}
          {lessonPlan.content.subjectContents.Math?.interactive_simulation?.discover?.aiSourceContent?.greeting && (
            <View style={{
              backgroundColor: '#FEF3C7',
              padding: 10,
              borderRadius: 6,
              marginBottom: 12,
              borderLeft: '3px solid #F59E0B',
              wrap: false  // Keep welcome message together
            }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#78350F', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                WELCOME EXPLORER
              </Text>
              <Text style={{ fontSize: 9, color: '#92400E', lineHeight: 1.3 }}>
                {lessonPlan.content.subjectContents.Math.interactive_simulation.discover.aiSourceContent.greeting}
              </Text>
            </View>
          )}

          {/* Discovery Stations - 4 Subject-Specific Hands-On Activities */}
          {lessonPlan.content.subjectContents.Math?.interactive_simulation?.discover?.aiSourceContent?.discovery_paths &&
           lessonPlan.content.subjectContents.Math.interactive_simulation.discover.aiSourceContent.discovery_paths.map((station: any, idx: number) => (
            <View key={idx} style={{
              backgroundColor: '#FFFFFF',
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
              border: '2px solid #FCD34D',
              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.1)',
              wrap: false  // Keep discovery station together
            }}>
              {/* Station Header with Subject Badge */}
              <View style={{
                backgroundColor: '#FEF3C7',
                padding: 8,
                borderRadius: 6,
                marginBottom: 8
              }}>
                {station.subject && (
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#92400E', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {station.subject} Discovery Station
                  </Text>
                )}
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#78350F' }}>
                  {stripEmojis(station.title)}
                </Text>
              </View>

              {/* Station Description */}
              <Text style={{ fontSize: 9, color: '#92400E', marginBottom: 8, lineHeight: 1.4 }}>
                {stripEmojis(station.description)}
              </Text>

              {/* Activity with Question */}
              {station.activities && station.activities.length > 0 && station.activities.map((activity: any, actIdx: number) => (
                <View key={actIdx}>
                  {/* Activity Description */}
                  <View style={{
                    backgroundColor: '#FFFBEB',
                    padding: 8,
                    borderRadius: 4,
                    borderLeft: '3px solid #F59E0B',
                    marginBottom: 8
                  }}>
                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#B45309', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      Activity:
                    </Text>
                    <Text style={{ fontSize: 8, color: '#92400E', lineHeight: 1.3 }}>
                      {stripEmojis(activity.description || activity.title)}
                    </Text>
                  </View>

                  {/* Question */}
                  {activity.question && (
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#78350F', marginBottom: 8, lineHeight: 1.4 }}>
                      {stripEmojis(activity.question)}
                    </Text>
                  )}

                  {/* Answer Options */}
                  {activity.options && activity.options.length > 0 && (
                    <View style={{ marginBottom: 8 }}>
                      <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#B45309', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        Choose Your Answer:
                      </Text>
                      {activity.options.map((option: string, optIdx: number) => (
                        <View key={optIdx} style={{
                          backgroundColor: '#FEF3C7',
                          padding: 6,
                          borderRadius: 4,
                          marginBottom: 3,
                          borderLeft: '3px solid #FBBF24'
                        }}>
                          <Text style={{ fontSize: 9, color: '#92400E' }}>
                            {String.fromCharCode(65 + optIdx)}) {convertShapeEmojiToText(option)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Hint & Explanation */}
                  <View style={{ borderTop: '1px solid #FEF3C7', paddingTop: 6, marginTop: 4 }}>
                    {activity.hint && (
                      <Text style={{ fontSize: 8, color: '#D97706', marginBottom: 4, lineHeight: 1.3 }}>
                        <Text style={{ fontWeight: 'bold' }}>Hint:</Text> {stripEmojis(activity.hint)}
                      </Text>
                    )}
                    {activity.explanation && (
                      <View style={{ backgroundColor: '#ECFDF5', padding: 8, borderRadius: 6, borderLeft: '4px solid #10B981' }}>
                        <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#065F46', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                          How {lessonPlan.career.careerName}s Use This Skill
                        </Text>
                        <Text style={{ fontSize: 8, color: '#047857', lineHeight: 1.4 }}>
                          {stripEmojis(activity.explanation)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Alternative Career Options */}
        <View style={{ backgroundColor: '#F0F9FF', padding: 12, borderRadius: 8, marginTop: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0369A1', marginBottom: 8 }}>
            Other Career Adventures Available
          </Text>
          <Text style={{ fontSize: 9, color: '#075985', marginBottom: 5 }}>
            The same skills can be learned through any of these career adventures:
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
            {['Doctor', 'Artist', 'Athlete', 'Teacher', 'Firefighter', 'Scientist'].map((career, idx) => (
              <View key={idx} style={{
                backgroundColor: '#FFFFFF',
                padding: 4,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#BFDBFE'
              }}>
                <Text style={{ fontSize: 9, color: '#1E40AF' }}>{career}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Pathfinity • Extension Activities • Page 4 of 5
        </Text>
      </Page>

      {/* Page 5: Parent Resources & Success Celebration */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Parent Resources & Success</Text>

        {/* Continue Learning at Home */}
        <View style={styles.parentGuide}>
          <Text style={styles.parentTitle}>Continue Learning at Home</Text>
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 10, color: '#075985', marginBottom: 4 }}>
              • Ask {lessonPlan.student.name} to show you what a {lessonPlan.career.careerName} does
            </Text>
            <Text style={{ fontSize: 10, color: '#075985', marginBottom: 4 }}>
              • Practice today's skills during daily activities
            </Text>
            <Text style={{ fontSize: 10, color: '#075985', marginBottom: 4 }}>
              • Look for {lessonPlan.career.careerName}s in your community
            </Text>
            <Text style={{ fontSize: 10, color: '#075985', marginBottom: 4 }}>
              • Read books about {lessonPlan.career.careerName}s together
            </Text>
            <Text style={{ fontSize: 10, color: '#075985', marginBottom: 4 }}>
              • Discuss how different careers use the same skills
            </Text>
          </View>
        </View>

        {/* Success Celebration */}
        <View style={{ backgroundColor: '#DCFCE7', padding: 15, borderRadius: 8, marginTop: 15 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#14532D', marginBottom: 10 }}>
            Celebrate Success!
          </Text>
          <Text style={{ fontSize: 10, color: '#166534', marginBottom: 8 }}>
            When Sam completes this lesson, they will have:
          </Text>
          <Text style={{ fontSize: 10, color: '#166534', marginBottom: 3 }}>
            ✓ Learned how {lessonPlan.career.careerName}s use all 4 core subjects
          </Text>
          <Text style={{ fontSize: 10, color: '#166534', marginBottom: 3 }}>
            ✓ Practiced real-world applications of curriculum skills
          </Text>
          <Text style={{ fontSize: 10, color: '#166534', marginBottom: 3 }}>
            ✓ Explored a potential career path
          </Text>
          <Text style={{ fontSize: 10, color: '#166534', marginBottom: 3 }}>
            ✓ Built confidence through hands-on learning
          </Text>
          <Text style={{ fontSize: 10, color: '#166534' }}>
            ✓ Connected academic concepts to real careers
          </Text>
        </View>

        {/* Daily Learning Goals */}
        <View style={{ backgroundColor: '#FEF3C7', padding: 10, borderRadius: 6, marginTop: 10 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#78350F' }}>
            Daily Learning Summary
          </Text>
          <Text style={{ fontSize: 9, color: '#78350F', marginTop: 3 }}>
            ✓ Complete all 4 subjects (Math, ELA, Science, Social Studies)
          </Text>
          <Text style={{ fontSize: 9, color: '#78350F' }}>
            ✓ Explore career of {lessonPlan.career.careerName}
          </Text>
          <Text style={{ fontSize: 9, color: '#78350F' }}>
            ✓ Apply curriculum skills in real-world contexts
          </Text>
        </View>

        {/* ENRICHMENT: Quality Markers Section */}
        {lessonPlan.content?.enrichment?.qualityMarkers && (
          <View style={{
            backgroundColor: '#EFF6FF',
            padding: 15,
            borderRadius: 8,
            marginTop: 15,
            borderLeftWidth: 5,
            borderLeftColor: '#3B82F6',
            borderWidth: 1,
            borderColor: '#BFDBFE'
          }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 10 }}>
              Quality Assurance & Standards
            </Text>
            <View style={{ gap: 5 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#1E40AF', marginRight: 3 }}>✓</Text>
                <Text style={{ fontSize: 9, color: '#1E40AF' }}>Common Core Aligned</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#1E40AF', marginRight: 3 }}>✓</Text>
                <Text style={{ fontSize: 9, color: '#1E40AF' }}>State Standards Met</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#1E40AF', marginRight: 3 }}>✓</Text>
                <Text style={{ fontSize: 9, color: '#1E40AF' }}>STEM Integrated</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#1E40AF', marginRight: 3 }}>✓</Text>
                <Text style={{ fontSize: 9, color: '#1E40AF' }}>Social-Emotional Learning</Text>
              </View>
            </View>
            <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#BFDBFE' }}>
              <Text style={{ fontSize: 9, color: '#1E40AF', marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>Assessment: </Text>
                {lessonPlan.content.enrichment.qualityMarkers.assessmentRigor}
              </Text>
              <Text style={{ fontSize: 9, color: '#1E40AF' }}>
                <Text style={{ fontWeight: 'bold' }}>Progress: </Text>
                {lessonPlan.content.enrichment.qualityMarkers.progressTracking}
              </Text>
            </View>
          </View>
        )}

        {/* Subscription Info */}
        <View style={{ marginTop: 15, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
          <Text style={{ fontSize: 9, color: '#6B7280', textAlign: 'center' }}>
            Subscription: {lessonPlan.subscription?.tier || lessonPlan.career?.tier || 'Select'} tier •
            {' '}{lessonPlan.subscription?.applicationPath?.replace(/_/g, ' ') || 'demonstration'} path •
            {' '}{lessonPlan.subscription?.knowledgeMode?.replace(/_/g, ' ') || 'interactive'} mode
          </Text>
        </View>

        {/* Footer */}
        <View style={{ marginTop: 'auto', paddingTop: 20 }}>
          <Text style={styles.footer}>
            Generated by Pathfinity • Thank you for learning with us! • Page 5 of 5
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Export function to generate unified PDF
export const generateUnifiedLessonPDF = async (
  lessonPlan: any
): Promise<Blob | Buffer> => {
  const pdfDocument = <UnifiedLessonPlanPDF lessonPlan={lessonPlan} />;

  // Check if we're in a browser or Node.js environment
  if (typeof window !== 'undefined') {
    // Browser environment - return Blob
    const blob = await pdf(pdfDocument).toBlob();
    return blob;
  } else {
    // Node.js environment - return Buffer
    const buffer = await pdf(pdfDocument).toBuffer();
    return buffer;
  }
};

// Export component for direct download link
export const UnifiedLessonDownloadLink = ({
  lessonPlan,
  children
}: {
  lessonPlan: any;
  children: React.ReactNode;
}) => {
  const fileName = `${lessonPlan.student.name}_Daily_Plan_${lessonPlan.career.careerName}_${new Date(lessonPlan.generatedAt).toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<UnifiedLessonPlanPDF lessonPlan={lessonPlan} />}
      fileName={fileName}
    >
      {({ blob, url, loading, error }) =>
        loading ? 'Generating Daily Plan PDF...' : children
      }
    </PDFDownloadLink>
  );
};

export default UnifiedLessonPlanPDF;