/**
 * Adaptive Content Visualization Utilities
 *
 * Helper functions for visualizing and debugging adaptive content strategies.
 * Useful for understanding how performance affects content adaptation.
 *
 * Phase 5 Implementation
 */

import type { AdaptationStrategy, PerformanceProfile } from '../services/adaptive/AdaptiveContentService';

/**
 * Format adaptation strategy as readable summary
 */
export function formatAdaptationStrategy(strategy: AdaptationStrategy): string {
  const lines = [
    `📊 Adaptation Strategy Summary`,
    `─────────────────────────────────`,
    ``,
    `Content Difficulty:`,
    `  • Complexity: ${strategy.scenarioComplexity}`,
    `  • Vocabulary: ${strategy.vocabularyLevel}`,
    `  • Concept Density: ${strategy.conceptDensity}`,
    ``,
    `Support & Scaffolding:`,
    `  • Support Level: ${strategy.supportLevel}`,
    `  • Hints: ${strategy.hintAvailability}`,
    `  • Feedback: ${strategy.feedbackFrequency}`,
    `  • Encouragement: ${strategy.encouragementTone}`,
    ``,
    `Skill Application:`,
    `  • Focus: ${strategy.skillApplicationFocus}`,
    `  • Practice: ${strategy.practiceQuantity}`,
    ``,
    `Pacing:`,
    `  • Time Limit: ${strategy.recommendedTimeLimit ? `${strategy.recommendedTimeLimit}s` : 'None'}`,
    `  • Break Suggestions: ${strategy.breakSuggestions ? 'Yes' : 'No'}`,
    ``,
    `Reasoning:`,
    `  ${strategy.reasoning}`,
  ];

  return lines.join('\n');
}

/**
 * Format performance profile as readable summary
 */
export function formatPerformanceProfile(profile: PerformanceProfile): string {
  const lines = [
    `👤 Performance Profile`,
    `─────────────────────────────────`,
    ``,
    `Overall Metrics:`,
    `  • Average Score: ${profile.averageScore.toFixed(1)}%`,
    `  • Containers Completed: ${profile.containersCompleted}`,
    `  • Total Time: ${Math.floor(profile.totalTimeSpent / 60)} min`,
    `  • Total Attempts: ${profile.totalAttempts}`,
    ``,
    `Learning Patterns:`,
    `  • Velocity: ${profile.learningVelocity}`,
    `  • Consistency: ${profile.consistencyPattern}`,
    ``,
    `Subject Performance:`,
  ];

  // Add subject performance
  for (const subject of Object.keys(profile.subjectPerformance)) {
    const perf = profile.subjectPerformance[subject as any];
    if (perf.containersCompleted > 0) {
      lines.push(`  • ${subject}: ${perf.averageScore.toFixed(1)}% (${perf.containersCompleted} completed)`);
    }
  }

  // Add strength/challenge areas
  if (profile.strengthAreas.length > 0) {
    lines.push('');
    lines.push(`Strength Areas: ${profile.strengthAreas.join(', ')}`);
  }

  if (profile.challengeAreas.length > 0) {
    lines.push(`Challenge Areas: ${profile.challengeAreas.join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Visualize adaptation progression across containers
 */
export function visualizeAdaptationProgression(
  strategies: Array<{ container: string; subject: string; strategy: AdaptationStrategy }>
): string {
  const lines = [
    `📈 Adaptation Progression`,
    `─────────────────────────────────`,
    ``
  ];

  for (const { container, subject, strategy } of strategies) {
    lines.push(`${container}-${subject}:`);
    lines.push(`  Complexity: ${strategy.scenarioComplexity}`);
    lines.push(`  Support: ${strategy.supportLevel}`);
    lines.push(`  Focus: ${strategy.skillApplicationFocus}`);
    lines.push(``);
  }

  return lines.join('\n');
}

/**
 * Compare two strategies to show adaptation changes
 */
export function compareStrategies(
  previous: AdaptationStrategy,
  current: AdaptationStrategy
): string {
  const changes: string[] = [];

  if (previous.scenarioComplexity !== current.scenarioComplexity) {
    changes.push(`Complexity: ${previous.scenarioComplexity} → ${current.scenarioComplexity}`);
  }

  if (previous.supportLevel !== current.supportLevel) {
    changes.push(`Support: ${previous.supportLevel} → ${current.supportLevel}`);
  }

  if (previous.skillApplicationFocus !== current.skillApplicationFocus) {
    changes.push(`Focus: ${previous.skillApplicationFocus} → ${current.skillApplicationFocus}`);
  }

  if (previous.hintAvailability !== current.hintAvailability) {
    changes.push(`Hints: ${previous.hintAvailability} → ${current.hintAvailability}`);
  }

  if (previous.practiceQuantity !== current.practiceQuantity) {
    changes.push(`Practice: ${previous.practiceQuantity} → ${current.practiceQuantity}`);
  }

  if (changes.length === 0) {
    return '✓ No changes - strategy maintained';
  }

  return `🔄 Strategy Changes:\n${changes.map(c => `  • ${c}`).join('\n')}`;
}

/**
 * Get difficulty emoji for complexity level
 */
export function getComplexityEmoji(complexity: string): string {
  switch (complexity) {
    case 'simplified': return '🟢';
    case 'standard': return '🟡';
    case 'advanced': return '🟠';
    case 'expert': return '🔴';
    default: return '⚪';
  }
}

/**
 * Get support level emoji
 */
export function getSupportEmoji(support: string): string {
  switch (support) {
    case 'high-guidance': return '👨‍🏫';
    case 'moderate-guidance': return '🤝';
    case 'minimal-guidance': return '👌';
    case 'independent': return '🚀';
    default: return '❓';
  }
}

/**
 * Create visual progress bar
 */
export function createProgressBar(score: number, width: number = 20): string {
  const filled = Math.floor((score / 100) * width);
  const empty = width - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  let color = '';
  if (score >= 90) color = '🟢';
  else if (score >= 75) color = '🟡';
  else if (score >= 60) color = '🟠';
  else color = '🔴';

  return `${color} [${bar}] ${score.toFixed(1)}%`;
}

/**
 * Format learning velocity as visual indicator
 */
export function formatVelocity(velocity: 'slow' | 'moderate' | 'fast'): string {
  switch (velocity) {
    case 'slow': return '🐢 Slow (thorough learner)';
    case 'moderate': return '🚶 Moderate';
    case 'fast': return '🏃 Fast (quick learner)';
  }
}

/**
 * Format consistency pattern as visual indicator
 */
export function formatConsistency(pattern: 'consistent' | 'variable' | 'improving' | 'declining'): string {
  switch (pattern) {
    case 'consistent': return '📊 Consistent';
    case 'variable': return '📈📉 Variable';
    case 'improving': return '📈 Improving';
    case 'declining': return '📉 Declining';
  }
}

/**
 * Create dashboard summary for student
 */
export function createStudentDashboard(
  profile: PerformanceProfile,
  currentStrategy: AdaptationStrategy
): string {
  const lines = [
    ``,
    `╔═══════════════════════════════════════════════════════════╗`,
    `║              📚 Student Learning Dashboard                ║`,
    `╚═══════════════════════════════════════════════════════════╝`,
    ``,
    `Overall Progress:`,
    `  ${createProgressBar(profile.averageScore)}`,
    `  ${profile.containersCompleted} containers completed`,
    ``,
    `Learning Style:`,
    `  ${formatVelocity(profile.learningVelocity)}`,
    `  ${formatConsistency(profile.consistencyPattern)}`,
    ``,
    `Current Adaptation:`,
    `  ${getComplexityEmoji(currentStrategy.scenarioComplexity)} ${currentStrategy.scenarioComplexity.toUpperCase()} difficulty`,
    `  ${getSupportEmoji(currentStrategy.supportLevel)} ${currentStrategy.supportLevel}`,
    ``,
  ];

  if (profile.strengthAreas.length > 0) {
    lines.push(`💪 Strengths: ${profile.strengthAreas.join(', ')}`);
  }

  if (profile.challengeAreas.length > 0) {
    lines.push(`🎯 Focus Areas: ${profile.challengeAreas.join(', ')}`);
  }

  lines.push('');

  return lines.join('\n');
}
