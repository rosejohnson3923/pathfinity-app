/**
 * Script Registry for TTS Analytics
 * Maps script IDs to their templates for consistent tracking
 */

export const SCRIPT_IDS = {
  // Introduction Flow
  'intro.welcome': 'Hi {firstName}! Welcome to Pathfinity!',
  'intro.career_prompt': 'What exciting career would you like to learn today? I\'ve picked three perfect matches just for you!',
  'intro.career_selected': 'Excellent choice! Let\'s have some fun as a {careerName}, {firstName}!',

  // Career Selection
  'career.selection_prompt': 'Let\'s have some fun with friends and choose the Top Match for your grade level or click More Options to choose your personal favorite.',
  'career.preview': '{description}. Skills: {skills}.', // Direct card narration

  // Dashboard/Companion Selection
  'companion.selection_prompt': 'You have an important decision to make, {firstName}. Choose your AI companion to guide you through today\'s learning adventure.',
  'companion.selected': 'Hi {firstName}! I\'m {companionName}, and I\'m so excited to be your learning companion today! Let\'s have an amazing adventure together!',
  'companion.start_instruction': 'Click the Continue button when you are ready to continue your adventure.',

  // CareerIncLobby
  'lobby.welcome': 'Welcome to Career Inc, {firstName}! I\'m {companionName}, and I\'m thrilled to be your guide today. Let\'s explore the amazing world of being a {careerName} together! Click the purple Learn button to get started.',
  'career.lobby.introduction': '{introduction}',

  // NarrativeIntroduction (Learn Container)
  'learn.intro': 'Alright {firstName}, let\'s start with the Learn Foundations container! This is where we\'ll master the core {careerName} concepts together. Click the Begin Your Adventure button when you\'re ready!',
  'experience.intro': 'Great job completing Learn Foundations, {firstName}! Now it\'s time for hands-on practice in the Experience container.',
  'discover.intro': 'Wow {firstName}, you\'re doing amazing! Welcome to the Discover container, where we\'ll explore advanced {careerName} concepts.',

  // Practice Questions (Kindergarten)
  'question.multiple_choice': '{questionText} ... Your choices are: {options}',
  'question.true_false': '{questionText} ... Is this true or false?',
  'question.replay': 'Let me repeat the question: {questionText}',
  'question.option_hover': 'Option {letter}: {optionText}',

  // Feedback
  'feedback.correct': 'Great job, {firstName}! That\'s correct!',
  'feedback.incorrect': 'Not quite, {firstName}. Let\'s try again!',
  'feedback.completion': 'Amazing work, {firstName}! You\'ve completed this activity!',

  // Navigation
  'nav.container_locked': 'The {containerName} container is locked. Complete {requiredContainer} first to unlock it.',
  'nav.continue_learning': 'Ready to continue your {careerName} journey, {firstName}?',

  // Welcome Back Modal scripts - first person with self-identification
  'welcomeback.greeting.K': 'Welcome back {firstName}! It\'s {companionName}! Want to keep playing {careerName} with me?',
  'welcomeback.greeting.1-2': 'Welcome back {firstName}! It\'s {companionName}! Ready to continue being a {careerName} with me?',
  'welcomeback.greeting.3-5': 'Welcome back {firstName}! {companionName} here! Should we continue your {careerName} journey together, or would you like to explore something new?',
  'welcomeback.greeting.6-8': 'Welcome back {firstName}! It\'s {companionName}. Would you like to continue your {careerName} journey with me, or explore a different path?',
  'welcomeback.greeting.9-12': 'Welcome back {firstName}! {companionName} here. Ready to continue your {careerName} learning path with me, or would you prefer to explore a new career?',

  // Start Over Confirmation scripts - age appropriate with decision guidance
  'startover.warning.K': 'Wait! Your stars will go away if you start over. Click green to keep playing, or red for a new game.',
  'startover.warning.1-2': 'Wait, {firstName}! Starting over means losing all your stars and progress. Click the green button to keep going, or the red button if you really want to start fresh.',
  'startover.warning.3-5': 'Hold on, {firstName}! If you start over, you\'ll lose all your progress and achievements. Choose the green button to continue your adventure, or the red button to start completely fresh.',
  'startover.warning.6-8': 'Important decision, {firstName}! Starting over will erase all your progress and achievements. Select the green button to continue your current path, or the red button to begin a new journey.',
  'startover.warning.9-12': 'Critical decision point: Starting over will permanently delete all progress and achievements. Choose the green button to maintain your current learning trajectory, or the red button to reset and explore a new career path.',

  // Generic/Fallback
  'generic.greeting': 'Hello, {firstName}!',
  'generic.encouragement': 'You\'re doing great, {firstName}!',
  'generic.farewell': 'Great learning session today, {firstName}! See you next time!',

  // Loading Screen Fun Facts
  'loading.fact.math': '{factText}',
  'loading.fact.ela': '{factText}',
  'loading.fact.science': '{factText}',
  'loading.fact.social_studies': '{factText}',

  // Loading Screen Transitions
  'loading.container.intro': 'Loading {containerName}... {factText}',
  'loading.subject.transition': 'Preparing {subject} lesson... {factText}',
  'loading.phase.practice': 'Getting practice questions ready... {factText}',
  'loading.phase.instruction': 'Loading your lesson... {factText}',
  'loading.phase.assessment': 'Preparing assessment... {factText}',

  // Loading Screen Career Connections
  'loading.career.mission': 'Remember, {firstName}, your mission as a {careerRole} is to {mission}!',
  'loading.career.workplace': 'Welcome back to {workplace}! {factText}',
  'loading.career.equipment': 'Did you know {careerRole}s use {equipment} in their work?'
} as const;

export type ScriptId = keyof typeof SCRIPT_IDS;

/**
 * Get script template by ID
 */
export function getScriptTemplate(scriptId: ScriptId): string {
  return SCRIPT_IDS[scriptId];
}

/**
 * Extract variables from a filled script by comparing with template
 */
export function extractVariables(scriptId: ScriptId, filledText: string): Record<string, string> {
  const template = SCRIPT_IDS[scriptId];
  const variables: Record<string, string> = {};

  // Create regex pattern from template
  // Replace {varName} with capture groups
  const pattern = template
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
    .replace(/\\{(\w+)\\}/g, '(.+?)'); // Replace {var} with capture group

  const regex = new RegExp(pattern);
  const match = filledText.match(regex);

  if (match) {
    // Extract variable names from template
    const varNames = [...template.matchAll(/\{(\w+)\}/g)].map(m => m[1]);

    // Map captured values to variable names
    varNames.forEach((varName, index) => {
      variables[varName] = match[index + 1];
    });
  }

  return variables;
}

/**
 * Format a script with variables
 */
export function formatScript(scriptId: ScriptId, variables: Record<string, string>): string {
  let text = SCRIPT_IDS[scriptId];

  Object.entries(variables).forEach(([key, value]) => {
    text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });

  return text;
}