/**
 * Finn Agents Modal System
 * Central export for all Finn agent modal adapters
 */

// Import all Finn agent modal adapters
export { explorerFinn } from './explorer-finn/modalAdapter';
export { creatorFinn } from './creator-finn/modalAdapter';
export { mentorFinn } from './mentor-finn/modalAdapter';
export { researcherFinn } from './researcher-finn/modalAdapter';
export { guideFinn } from './guide-finn/modalAdapter';
export { companionFinn } from './companion-finn/modalAdapter';

// Import base adapter for extensions
export { BaseFinnModalAdapter } from './base-modal-adapter';
export type { FinnAgentConfig } from './base-modal-adapter';

// Agent registry for dynamic agent selection
export const FINN_AGENTS = {
  'explorer-finn': () => import('./explorer-finn/modalAdapter').then(m => m.explorerFinn),
  'creator-finn': () => import('./creator-finn/modalAdapter').then(m => m.creatorFinn),
  'mentor-finn': () => import('./mentor-finn/modalAdapter').then(m => m.mentorFinn),
  'researcher-finn': () => import('./researcher-finn/modalAdapter').then(m => m.researcherFinn),
  'guide-finn': () => import('./guide-finn/modalAdapter').then(m => m.guideFinn),
  'companion-finn': () => import('./companion-finn/modalAdapter').then(m => m.companionFinn)
} as const;

export type FinnAgentId = keyof typeof FINN_AGENTS;

/**
 * Get a Finn agent by ID
 */
export async function getFinnAgent(agentId: FinnAgentId) {
  const loader = FINN_AGENTS[agentId];
  if (!loader) {
    throw new Error(`Unknown Finn agent: ${agentId}`);
  }
  return loader();
}

/**
 * Get the best Finn agent for a given intent
 */
export async function selectFinnAgent(intent: string): Promise<BaseFinnModalAdapter> {
  const lowerIntent = intent.toLowerCase();
  
  // Keywords for each agent
  const agentKeywords = {
    'explorer-finn': ['explore', 'discover', 'adventure', 'simulation', 'scenario', 'timeline'],
    'creator-finn': ['create', 'draw', 'write', 'code', 'build', 'design', 'make'],
    'mentor-finn': ['help', 'learn', 'understand', 'practice', 'study', 'teach'],
    'researcher-finn': ['research', 'investigate', 'analyze', 'data', 'sources', 'citation'],
    'guide-finn': ['navigate', 'guide', 'path', 'progress', 'roadmap', 'where'],
    'companion-finn': ['feel', 'mood', 'journal', 'goal', 'celebrate', 'mindful', 'emotion']
  };
  
  // Score each agent based on keyword matches
  let bestAgent: FinnAgentId = 'mentor-finn'; // default
  let bestScore = 0;
  
  for (const [agentId, keywords] of Object.entries(agentKeywords)) {
    const score = keywords.filter(kw => lowerIntent.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestAgent = agentId as FinnAgentId;
    }
  }
  
  return getFinnAgent(bestAgent);
}

/**
 * Initialize all Finn agents
 */
export async function initializeFinnAgents(): Promise<void> {
  console.log('🤖 Initializing Finn Agent Modal System...');
  
  // Preload all agents for better performance
  const agents = await Promise.all(
    Object.values(FINN_AGENTS).map(loader => loader())
  );
  
  console.log(`✅ Loaded ${agents.length} Finn agents with modal support`);
  
  // Log agent capabilities
  agents.forEach(agent => {
    const config = (agent as any).config;
    console.log(`  - ${config.agentName}: ${config.supportedModalTypes.length} modal types`);
  });
}

/**
 * Agent metadata for UI
 */
export const FINN_AGENT_METADATA = {
  'explorer-finn': {
    name: 'Explorer Finn',
    description: 'Discover and explore through interactive scenarios',
    icon: '🗺️',
    color: '#10B981',
    container: 'DISCOVER'
  },
  'creator-finn': {
    name: 'Creator Finn',
    description: 'Create amazing projects through drawing, coding, and writing',
    icon: '🎨',
    color: '#6366F1',
    container: 'EXPERIENCE'
  },
  'mentor-finn': {
    name: 'Mentor Finn',
    description: 'Get personalized guidance and tutoring support',
    icon: '🎯',
    color: '#8B5CF6',
    container: 'LEARN'
  },
  'researcher-finn': {
    name: 'Researcher Finn',
    description: 'Research and investigate with academic tools',
    icon: '🔬',
    color: '#3B82F6',
    container: 'LEARN'
  },
  'guide-finn': {
    name: 'Guide Finn',
    description: 'Navigate your learning journey with clear paths',
    icon: '🧭',
    color: '#14B8A6',
    container: 'LEARN'
  },
  'companion-finn': {
    name: 'Companion Finn',
    description: 'Support your social and emotional wellbeing',
    icon: '💖',
    color: '#EC4899',
    container: 'EXPERIENCE'
  }
} as const;

/**
 * Get agent recommendations based on context
 */
export function recommendFinnAgents(context: {
  subject?: string;
  mood?: string;
  goal?: string;
  gradeLevel?: string;
}): FinnAgentId[] {
  const recommendations: FinnAgentId[] = [];
  
  // Subject-based recommendations
  if (context.subject) {
    switch (context.subject.toLowerCase()) {
      case 'science':
        recommendations.push('explorer-finn', 'researcher-finn');
        break;
      case 'art':
      case 'creative':
        recommendations.push('creator-finn');
        break;
      case 'math':
        recommendations.push('mentor-finn');
        break;
      case 'history':
      case 'social studies':
        recommendations.push('explorer-finn', 'researcher-finn');
        break;
    }
  }
  
  // Mood-based recommendations
  if (context.mood) {
    switch (context.mood.toLowerCase()) {
      case 'stressed':
      case 'anxious':
        recommendations.push('companion-finn');
        break;
      case 'curious':
        recommendations.push('explorer-finn', 'researcher-finn');
        break;
      case 'creative':
        recommendations.push('creator-finn');
        break;
      case 'stuck':
      case 'confused':
        recommendations.push('mentor-finn', 'guide-finn');
        break;
    }
  }
  
  // Goal-based recommendations
  if (context.goal) {
    if (context.goal.includes('learn')) {
      recommendations.push('mentor-finn');
    }
    if (context.goal.includes('create') || context.goal.includes('build')) {
      recommendations.push('creator-finn');
    }
    if (context.goal.includes('explore') || context.goal.includes('discover')) {
      recommendations.push('explorer-finn');
    }
  }
  
  // Remove duplicates and ensure at least one recommendation
  const unique = Array.from(new Set(recommendations));
  if (unique.length === 0) {
    unique.push('guide-finn'); // Default to guide
  }
  
  return unique;
}