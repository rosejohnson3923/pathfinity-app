// ================================================================
// CONVERSATION MANAGER - MCP-Based Conversation Saving
// Saves development conversations, user sessions, and agent interactions
// ================================================================

export interface ConversationEntry {
  id: string;
  timestamp: Date;
  type: 'development' | 'user_session' | 'agent_interaction' | 'debug_session';
  participants: string[];
  content: {
    messages: ConversationMessage[];
    context: {
      project: string;
      version: string;
      branch: string;
      session_type: string;
    };
    metadata: {
      duration: number;
      message_count: number;
      key_topics: string[];
      outcomes: string[];
    };
  };
  status: 'active' | 'completed' | 'archived';
}

export interface ConversationMessage {
  timestamp: Date;
  sender: string;
  content: string;
  type: 'text' | 'code' | 'file_reference' | 'system_message';
  metadata?: {
    file_paths?: string[];
    todo_updates?: any[];
    code_changes?: any[];
  };
}

export interface ConversationSummary {
  id: string;
  title: string;
  summary: string;
  key_decisions: string[];
  technical_outcomes: string[];
  next_steps: string[];
  files_modified: string[];
  duration: number;
  participant_count: number;
}

export class ConversationManager {
  private conversations: Map<string, ConversationEntry> = new Map();
  private activeSession: string | null = null;

  // ================================================================
  // SESSION MANAGEMENT
  // ================================================================

  async startDevelopmentSession(context: {
    project: string;
    session_type: 'bug_fix' | 'feature_development' | 'architecture_review' | 'todo_management';
    participants: string[];
  }): Promise<string> {
    const sessionId = this.generateSessionId();
    
    const conversation: ConversationEntry = {
      id: sessionId,
      timestamp: new Date(),
      type: 'development',
      participants: context.participants,
      content: {
        messages: [],
        context: {
          project: context.project,
          version: await this.getCurrentVersion(),
          branch: await this.getCurrentBranch(),
          session_type: context.session_type
        },
        metadata: {
          duration: 0,
          message_count: 0,
          key_topics: [],
          outcomes: []
        }
      },
      status: 'active'
    };

    this.conversations.set(sessionId, conversation);
    this.activeSession = sessionId;

    console.log(`🎙️ Started development session: ${sessionId} (${context.session_type})`);
    return sessionId;
  }

  async addMessage(content: string, sender: string = 'user', type: 'text' | 'code' | 'file_reference' | 'system_message' = 'text', metadata?: any): Promise<void> {
    if (!this.activeSession) {
      console.warn('No active session - creating default session');
      await this.startDevelopmentSession({
        project: 'pathfinity-revolutionary',
        session_type: 'feature_development',
        participants: ['developer', 'claude']
      });
    }

    const conversation = this.conversations.get(this.activeSession!);
    if (!conversation) return;

    const message: ConversationMessage = {
      timestamp: new Date(),
      sender,
      content,
      type,
      metadata
    };

    conversation.content.messages.push(message);
    conversation.content.metadata.message_count++;
    
    // Extract topics from content
    await this.extractTopics(content, conversation);

    console.log(`💬 Added message to session ${this.activeSession}: ${content.substring(0, 50)}...`);
  }

  async endSession(summary?: string): Promise<ConversationSummary> {
    if (!this.activeSession) {
      throw new Error('No active session to end');
    }

    const conversation = this.conversations.get(this.activeSession);
    if (!conversation) {
      throw new Error('Active session not found');
    }

    // Calculate duration
    const startTime = conversation.timestamp.getTime();
    const endTime = Date.now();
    conversation.content.metadata.duration = endTime - startTime;
    conversation.status = 'completed';

    // Generate summary
    const conversationSummary = await this.generateSummary(conversation, summary);

    // Save to file system (MCP-style)
    await this.saveConversation(conversation);

    console.log(`✅ Ended session ${this.activeSession}: ${conversationSummary.title}`);
    
    this.activeSession = null;
    return conversationSummary;
  }

  // ================================================================
  // CONVERSATION SAVING & LOADING
  // ================================================================

  async saveConversation(conversation: ConversationEntry): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `conversation_${conversation.id}_${timestamp}.json`;
    const filepath = `/mnt/c/Users/rosej/Documents/Projects/pathfinity-revolutionary/conversations/${filename}`;

    try {
      // Create conversations directory if it doesn't exist
      await this.ensureDirectoryExists('/mnt/c/Users/rosej/Documents/Projects/pathfinity-revolutionary/conversations/');
      
      // Save conversation as JSON
      const conversationData = {
        ...conversation,
        saved_at: new Date().toISOString(),
        format_version: '1.0'
      };

      // In a real implementation, this would use actual file writing
      console.log(`💾 Would save conversation to: ${filepath}`);
      console.log('📊 Conversation data prepared:', {
        id: conversation.id,
        message_count: conversation.content.messages.length,
        duration_minutes: Math.round(conversation.content.metadata.duration / 60000),
        key_topics: conversation.content.metadata.key_topics.slice(0, 5)
      });

    } catch (error) {
      console.error('❌ Failed to save conversation:', error);
    }
  }

  async loadConversation(conversationId: string): Promise<ConversationEntry | null> {
    // In a real implementation, this would load from file system
    return this.conversations.get(conversationId) || null;
  }

  async listConversations(filter?: { type?: string; date_range?: [Date, Date] }): Promise<ConversationSummary[]> {
    const summaries: ConversationSummary[] = [];
    
    for (const conversation of this.conversations.values()) {
      if (filter?.type && conversation.type !== filter.type) continue;
      
      const summary = await this.generateSummary(conversation);
      summaries.push(summary);
    }

    return summaries.sort((a, b) => b.duration - a.duration);
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  private async generateSummary(conversation: ConversationEntry, userSummary?: string): Promise<ConversationSummary> {
    const messages = conversation.content.messages;
    const keyDecisions = this.extractKeyDecisions(messages);
    const technicalOutcomes = this.extractTechnicalOutcomes(messages);
    const filesModified = this.extractFilesModified(messages);

    return {
      id: conversation.id,
      title: userSummary || this.generateTitle(conversation),
      summary: userSummary || this.generateAutoSummary(conversation),
      key_decisions: keyDecisions,
      technical_outcomes: technicalOutcomes,
      next_steps: this.extractNextSteps(messages),
      files_modified: filesModified,
      duration: conversation.content.metadata.duration,
      participant_count: conversation.participants.length
    };
  }

  private generateTitle(conversation: ConversationEntry): string {
    const topics = conversation.content.metadata.key_topics.slice(0, 3);
    if (topics.length > 0) {
      return `${conversation.content.context.session_type}: ${topics.join(', ')}`;
    }
    return `${conversation.content.context.session_type} Session ${conversation.id.substring(0, 8)}`;
  }

  private generateAutoSummary(conversation: ConversationEntry): string {
    const messageCount = conversation.content.metadata.message_count;
    const duration = Math.round(conversation.content.metadata.duration / 60000);
    const topics = conversation.content.metadata.key_topics.slice(0, 5);
    
    return `${conversation.content.context.session_type} session with ${messageCount} messages over ${duration} minutes. Key topics: ${topics.join(', ')}.`;
  }

  private async extractTopics(content: string, conversation: ConversationEntry): Promise<void> {
    // Simple keyword extraction - in real implementation, could use NLP
    const keywords = [
      'MCP', 'agent', 'tool', 'calculator', 'number line', 'grade', 'skill',
      'bug', 'fix', 'feature', 'implementation', 'component', 'useEffect',
      'Jordan', 'Sam', 'kindergarten', 'integer', 'practice', 'question'
    ];

    const topics = conversation.content.metadata.key_topics;
    keywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword.toLowerCase()) && !topics.includes(keyword)) {
        topics.push(keyword);
      }
    });
  }

  private extractKeyDecisions(messages: ConversationMessage[]): string[] {
    const decisions: string[] = [];
    
    messages.forEach(msg => {
      if (msg.content.includes('decided') || msg.content.includes('solution:') || msg.content.includes('fix:')) {
        // Extract decision context
        const sentences = msg.content.split('.').filter(s => 
          s.includes('decided') || s.includes('solution') || s.includes('fix')
        );
        decisions.push(...sentences.map(s => s.trim()));
      }
    });

    return decisions.slice(0, 10); // Limit to most recent decisions
  }

  private extractTechnicalOutcomes(messages: ConversationMessage[]): string[] {
    const outcomes: string[] = [];
    
    messages.forEach(msg => {
      if (msg.type === 'code' || msg.metadata?.code_changes) {
        outcomes.push(`Code changes in ${msg.metadata?.file_paths?.join(', ') || 'multiple files'}`);
      }
      if (msg.content.includes('✅') || msg.content.includes('completed')) {
        outcomes.push(msg.content.substring(0, 100));
      }
    });

    return outcomes.slice(0, 10);
  }

  private extractFilesModified(messages: ConversationMessage[]): string[] {
    const files = new Set<string>();
    
    messages.forEach(msg => {
      if (msg.metadata?.file_paths) {
        msg.metadata.file_paths.forEach(path => files.add(path));
      }
      // Extract file paths from content
      const fileMatches = msg.content.match(/src\/[A-Za-z0-9\/\.]+\.(ts|tsx|js|jsx|md)/g);
      if (fileMatches) {
        fileMatches.forEach(path => files.add(path));
      }
    });

    return Array.from(files);
  }

  private extractNextSteps(messages: ConversationMessage[]): string[] {
    const steps: string[] = [];
    
    messages.forEach(msg => {
      if (msg.content.includes('next step') || msg.content.includes('TODO') || msg.content.includes('pending')) {
        const nextStepSentences = msg.content.split('.').filter(s => 
          s.includes('next') || s.includes('TODO') || s.includes('pending')
        );
        steps.push(...nextStepSentences.map(s => s.trim()));
      }
    });

    return steps.slice(0, 5);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private async getCurrentVersion(): Promise<string> {
    // In real implementation, would read from package.json or git tags
    return '1.0.0-mcp';
  }

  private async getCurrentBranch(): Promise<string> {
    // In real implementation, would run git branch command
    return 'main';
  }

  private async ensureDirectoryExists(path: string): Promise<void> {
    // In real implementation, would create directory if needed
    console.log(`📁 Ensuring directory exists: ${path}`);
  }
}

// Export singleton instance
export const conversationManager = new ConversationManager();

// Helper function to quickly save current conversation
export async function saveCurrentConversation(summary: string): Promise<ConversationSummary> {
  return await conversationManager.endSession(summary);
}

// Helper function to start a new development session
export async function startNewDevelopmentSession(sessionType: 'bug_fix' | 'feature_development' | 'architecture_review' | 'todo_management'): Promise<string> {
  return await conversationManager.startDevelopmentSession({
    project: 'pathfinity-revolutionary',
    session_type: sessionType,
    participants: ['developer', 'claude']
  });
}