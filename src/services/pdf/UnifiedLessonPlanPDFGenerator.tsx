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
    overflow: 'hidden'
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
    overflow: 'hidden'
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
    position: 'relative'
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
    position: 'relative'
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
             `${lessonPlan.student.name} becomes a Junior ${lessonPlan.career.careerName} Helper!
             They'll use all their skills - math, reading, science, and social studies - to help in the
             ${lessonPlan.career.careerName}'s workplace.`}
          </Text>
        </View>

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

            {/* Show Math activities grouped by role */}
            {lessonPlan.content.subjectContents.Math.challenges.map((roleGroup, roleIdx) => {
              console.log('🔍 PDF Math Role Debug:', { roleIdx, roleGroup, activities: roleGroup.activities });
              return roleGroup.isRoleGroup ? (
                <View key={roleIdx} style={{ marginBottom: 12 }}>
                  {/* Role Header */}
                  <View style={{ backgroundColor: colors.gray[100], padding: 12, borderRadius: 8, marginBottom: 8 }}>
                    <Text style={{...typography.small, fontWeight: 'bold', color: colors.gray[900] }}>
                      {roleGroup.roleName}
                    </Text>
                  </View>

                  {/* Role Activities */}
                  {roleGroup.activities && roleGroup.activities.map((activity, actIdx) => {
                    console.log('🔍 PDF Math Activity Debug:', { actIdx, activity, type: typeof activity });
                    return (
                      <View key={actIdx} style={[styles.challengeBox, { marginLeft: 16, marginBottom: 8 }]}>
                        <Text style={styles.challengeContent}>
                          {activity}
                        </Text>

                        {roleGroup.hint && actIdx === 0 && (
                          <Text style={{ fontSize: 8, color: '#6B7280', fontStyle: 'italic', marginTop: 3 }}>
                            Hint: {roleGroup.hint}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ) : (
                // Fallback for non-role-grouped challenges
                <View key={roleIdx} style={styles.challengeBox}>
                  <Text style={styles.challengeTitle}>
                    {roleGroup.challenge_summary || `Activity ${roleIdx + 1}`}
                  </Text>
                  <Text style={styles.challengeContent}>
                    {roleGroup.description || roleGroup.question || 'Math challenge involving counting and numbers'}
                  </Text>
                </View>
              );
            })}
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

            {/* Show ELA activities grouped by role */}
            {lessonPlan.content.subjectContents.ELA.challenges.map((roleGroup, roleIdx) => (
              roleGroup.isRoleGroup ? (
                <View key={roleIdx} style={{ marginBottom: 12 }}>
                  {/* Role Header */}
                  <View style={{ backgroundColor: colors.gray[100], padding: 12, borderRadius: 8, marginBottom: 8 }}>
                    <Text style={{...typography.small, fontWeight: 'bold', color: colors.gray[900] }}>
                      {roleGroup.roleName}
                    </Text>
                  </View>

                  {/* Role Activities */}
                  {roleGroup.activities && roleGroup.activities.map((activity, actIdx) => (
                    <View key={actIdx} style={[styles.challengeBox, { marginLeft: 16, marginBottom: 8 }]}>
                      <Text style={styles.challengeContent}>
                        {activity}
                      </Text>

                      {roleGroup.hint && actIdx === 0 && (
                        <Text style={{ fontSize: 8, color: '#6B7280', fontStyle: 'italic', marginTop: 3 }}>
                          Hint: {roleGroup.hint}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                // Fallback for non-role-grouped challenges
                <View key={roleIdx} style={styles.challengeBox}>
                  <Text style={styles.challengeTitle}>
                    {roleGroup.challenge_summary || `Activity ${roleIdx + 1}`}
                  </Text>
                  <Text style={styles.challengeContent}>
                    {roleGroup.description || roleGroup.question || 'Language arts challenge with letters and words'}
                  </Text>
                </View>
              )
            ))}
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

            {/* Show Science activities grouped by role */}
            {lessonPlan.content.subjectContents.Science.challenges.map((roleGroup, roleIdx) => (
              roleGroup.isRoleGroup ? (
                <View key={roleIdx} style={{ marginBottom: 12 }}>
                  {/* Role Header */}
                  <View style={{ backgroundColor: colors.gray[100], padding: 12, borderRadius: 8, marginBottom: 8 }}>
                    <Text style={{...typography.small, fontWeight: 'bold', color: colors.gray[900] }}>
                      {roleGroup.roleName}
                    </Text>
                  </View>

                  {/* Role Activities */}
                  {roleGroup.activities && roleGroup.activities.map((activity, actIdx) => (
                    <View key={actIdx} style={[styles.challengeBox, { marginLeft: 16, marginBottom: 8 }]}>
                      <Text style={styles.challengeContent}>
                        {activity}
                      </Text>

                      {roleGroup.hint && actIdx === 0 && (
                        <Text style={{ fontSize: 8, color: '#6B7280', fontStyle: 'italic', marginTop: 3 }}>
                          Hint: {roleGroup.hint}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                // Fallback for non-role-grouped challenges
                <View key={roleIdx} style={styles.challengeBox}>
                  <Text style={styles.challengeTitle}>
                    {roleGroup.challenge_summary || `Activity ${roleIdx + 1}`}
                  </Text>
                  <Text style={styles.challengeContent}>
                    {roleGroup.description || roleGroup.question || 'Science exploration with shapes and patterns'}
                  </Text>
                </View>
              )
            ))}
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

            {/* Show Social Studies activities grouped by role */}
            {lessonPlan.content.subjectContents['Social Studies'].challenges.map((roleGroup, roleIdx) => (
              roleGroup.isRoleGroup ? (
                <View key={roleIdx} style={{ marginBottom: 12 }}>
                  {/* Role Header */}
                  <View style={{ backgroundColor: colors.gray[100], padding: 12, borderRadius: 8, marginBottom: 8 }}>
                    <Text style={{...typography.small, fontWeight: 'bold', color: colors.gray[900] }}>
                      {roleGroup.roleName}
                    </Text>
                  </View>

                  {/* Role Activities */}
                  {roleGroup.activities && roleGroup.activities.map((activity, actIdx) => (
                    <View key={actIdx} style={[styles.challengeBox, { marginLeft: 16, marginBottom: 8 }]}>
                      <Text style={styles.challengeContent}>
                        {activity}
                      </Text>

                      {roleGroup.hint && actIdx === 0 && (
                        <Text style={{ fontSize: 8, color: '#6B7280', fontStyle: 'italic', marginTop: 3 }}>
                          Hint: {roleGroup.hint}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                // Fallback for non-role-grouped challenges
                <View key={roleIdx} style={styles.challengeBox}>
                  <Text style={styles.challengeTitle}>
                    {roleGroup.challenge_summary || `Activity ${roleIdx + 1}`}
                  </Text>
                  <Text style={styles.challengeContent}>
                    {roleGroup.description || roleGroup.question || 'Community and social skills practice'}
                  </Text>
                </View>
              )
            ))}
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

        {/* Discover Challenges Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1F2937' }}>Discover Challenges</Text>
          </View>

          <View style={{ backgroundColor: '#FEF3C7', padding: 10, borderRadius: 6, marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#78350F', marginBottom: 4 }}>
              {lessonPlan.career.careerName} Explorer
            </Text>
            <Text style={{ fontSize: 9, color: '#92400E' }}>
              Visit a virtual {lessonPlan.career.careerName} location and find 3 ways that {lessonPlan.career.careerName}s use
              the skills you learned today. Draw or write about what you discovered!
            </Text>
          </View>

          <View style={{ backgroundColor: '#FEF3C7', padding: 10, borderRadius: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#78350F', marginBottom: 4 }}>
              Community Helper Hunt
            </Text>
            <Text style={{ fontSize: 9, color: '#92400E' }}>
              Look for {lessonPlan.career.careerName}s in your community this week. When you see one,
              think about how they might be using today's skills in their work.
            </Text>
          </View>
        </View>

        {/* Experience Scenarios Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1F2937' }}>Experience Scenarios</Text>
          </View>

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