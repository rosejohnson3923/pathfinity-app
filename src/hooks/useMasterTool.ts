// ================================================================
// USE MASTER TOOL HOOK
// React hook for integrating 6-Agent Finn Architecture with applications
// ================================================================

import { useState, useEffect, useCallback } from 'react';
import { AgentSystem, AgentType } from '../agents/AgentSystem';
import { agentCoordination } from '../services/AgentCoordination';
import { SkillCategoryMappingService } from '../config/SkillCategoryMappings';
import { 
  AssignmentContext, 
  ToolConfiguration, 
  ToolType 
} from '../components/tools/MasterToolInterface';

interface UseMasterToolOptions {
  autoAnalyze?: boolean;
  enableFinnGuidance?: boolean;
  persistToolState?: boolean;
  onToolComplete?: (results: any) => void;
  onToolProgress?: (progress: any) => void;
  agentSystem?: AgentSystem;
  enableMultiAgentWorkflows?: boolean;
  preferredAgents?: AgentType[];
}

interface MasterToolState {
  isToolVisible: boolean;
  currentTool: ToolConfiguration | null;
  assignment: AssignmentContext | null;
  isLoading: boolean;
  error: string | null;
  toolResults: any | null;
  finnGuidance: {
    message: string;
    hint?: string;
    encouragement?: string;
  } | null;
  agentStatus: {
    activeAgents: AgentType[];
    coordination: string | null;
    safetyValidation: boolean;
  };
  discoveredTools: any[];
  safetyReport: any | null;
}

export const useMasterTool = (options: UseMasterToolOptions = {}) => {
  const {
    autoAnalyze = true,
    enableFinnGuidance = true,
    persistToolState = true,
    onToolComplete,
    onToolProgress,
    agentSystem,
    enableMultiAgentWorkflows = true,
    preferredAgents = ['tool', 'see', 'think', 'safe']
  } = options;

  const [state, setState] = useState<MasterToolState>({
    isToolVisible: false,
    currentTool: null,
    assignment: null,
    isLoading: false,
    error: null,
    toolResults: null,
    finnGuidance: null,
    agentStatus: {
      activeAgents: [],
      coordination: null,
      safetyValidation: false
    },
    discoveredTools: [],
    safetyReport: null
  });

  // ================================================================
  // TOOL MANIFESTATION WITH 6-AGENT ARCHITECTURE
  // ================================================================

  const manifestTool = useCallback(async (assignment: AssignmentContext) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      assignment,
      agentStatus: {
        activeAgents: [],
        coordination: 'initializing',
        safetyValidation: false
      }
    }));

    try {
      console.log('🎯 Manifesting tool using 6-agent architecture for:', assignment.skillName);
      
      // Extract skill category from assignment
      const skillCategory = extractSkillCategory(assignment);
      
      if (enableMultiAgentWorkflows && agentSystem) {
        // Use direct agent calls instead of broken coordination workflow
        console.log('🎯 Using direct agent system for tool manifestation');
        
        try {
          // Step 1: Use FinnTool agent for MCP-based tool discovery
          const toolDiscoveryResult = await agentSystem.requestAgentAction(
            'tool',
            'discover_tools',
            {
              skillCategory: skillCategory,
              subject: assignment.subject,
              gradeLevel: assignment.gradeLevel,
              requirements: assignment.skillName
            }
          );
          
          console.log('🔧 Tool discovery result:', toolDiscoveryResult);
          console.log('🔧 Tool discovery data:', toolDiscoveryResult?.data);
          
          // Step 2: Use FinnSafe agent for safety validation (skip if no tools found)
          const discoveredTools = toolDiscoveryResult?.data?.discoveredTools || [];
          console.log('🔧 Discovered tools for safety check:', discoveredTools);
          
          let safetyResult = { success: true, safetyReport: null };
          if (discoveredTools.length > 0) {
            safetyResult = await agentSystem.requestAgentAction(
              'safe',
              'validate_content_safety',
              {
                gradeLevel: assignment.gradeLevel,
                subject: assignment.subject,
                tools: discoveredTools
              }
            );
          }
          
          console.log('🛡️ Safety validation result:', safetyResult);
          
          // Step 3: Prioritize template tool type over MCP-discovered tools
          if (assignment.practiceContent?.templateConfig?.toolType) {
            console.log('✅ Template tool type specified, using template-based configuration:', assignment.practiceContent.templateConfig.toolType);
            
            const templateToolConfig: ToolConfiguration = {
              toolType: assignment.practiceContent.templateConfig.toolType,
              toolName: `${assignment.subject} Interactive Tool`,
              description: assignment.practiceContent.templateConfig.instructions || `Practice ${assignment.skillName}`,
              instructions: assignment.practiceContent.templateConfig.instructions || 'Complete the activities to practice your skills.',
              parameters: {
                ...assignment.practiceContent.templateConfig,
                skillCode: assignment.skillCode,
                subject: assignment.subject,
                gradeLevel: assignment.gradeLevel
              },
              appearance: {
                width: 800,
                height: 600,
                position: 'center',
                theme: 'auto'
              },
              interactions: {
                allowMinimize: true,
                allowFullscreen: true,
                allowSettings: true,
                allowSound: true
              },
              accessibility: {
                highContrast: false,
                screenReader: true,
                keyboardNavigation: true
              }
            };
            
            setState(prev => ({
              ...prev,
              currentTool: templateToolConfig,
              assignment: assignment,
              isToolVisible: true,
              agentStatus: {
                activeAgents: ['template-priority'],
                coordination: 'template-override',
                safetyValidation: true
              },
              discoveredTools: discoveredTools,
              safetyReport: safetyResult?.safetyReport || null,
              isLoading: false
            }));
            
            if (enableFinnGuidance) {
              setState(prev => ({
                ...prev,
                finnGuidance: {
                  message: "I've prepared the perfect tool for this activity!",
                  encouragement: "Let's practice together!",
                  hint: `This ${assignment.subject} tool will help you apply your skills`
                }
              }));
            }
            
            console.log('✅ Template-priority tool manifested:', templateToolConfig.toolName);
            return;
          }
          
          // Step 4: Use discovered tools as fallback if no template specified
          if (discoveredTools.length > 0) {
            console.log('✅ No template tool specified, using MCP-discovered tools:', discoveredTools);
            
            // Try to map discovered tools to existing tool configurations
            const primaryTool = discoveredTools[0];
            const toolConfig = createToolConfigFromMCP(primaryTool, assignment);
            
            if (toolConfig) {
              setState(prev => ({
                ...prev,
                currentTool: toolConfig,
                assignment: assignment,
                isToolVisible: true,
                agentStatus: {
                  activeAgents: ['tool', 'safe'],
                  coordination: 'direct',
                  safetyValidation: safetyResult?.success || false
                },
                discoveredTools: discoveredTools,
                safetyReport: safetyResult?.safetyReport || null
              }));
              
              if (enableFinnGuidance) {
                setState(prev => ({
                  ...prev,
                  finnGuidance: {
                    message: "I've found a great tool for this activity using MCP!",
                    encouragement: "Let's explore this concept together!",
                    hint: `This ${toolConfig.toolName} will help you practice ${assignment.skillName}`
                  }
                }));
              }
              
              console.log('✅ MCP tool manifested via direct agent calls:', toolConfig.toolName);
              return;
            }
          }
          
          console.log('🔄 No MCP tools found, using template-based fallback tool selection');
          
          // Use template-based fallback when no MCP tools are found
          if (assignment.practiceContent?.templateConfig?.toolType) {
            console.log('✅ Using template-specified tool type:', assignment.practiceContent.templateConfig.toolType);
            
            const templateToolConfig: ToolConfiguration = {
              toolType: assignment.practiceContent.templateConfig.toolType,
              toolName: `${assignment.subject} Interactive Tool`,
              description: assignment.practiceContent.templateConfig.instructions || `Practice ${assignment.skillName}`,
              instructions: assignment.practiceContent.templateConfig.instructions || 'Complete the activities to practice your skills.',
              parameters: {
                ...assignment.practiceContent.templateConfig,
                skillCode: assignment.skillCode,
                subject: assignment.subject,
                gradeLevel: assignment.gradeLevel
              },
              appearance: {
                width: 800,
                height: 600,
                position: 'center',
                theme: 'auto'
              },
              interactions: {
                allowMinimize: true,
                allowFullscreen: true,
                allowSettings: true,
                allowSound: true
              },
              accessibility: {
                highContrast: false,
                screenReader: true,
                keyboardNavigation: true
              }
            };
            
            setState(prev => ({
              ...prev,
              currentTool: templateToolConfig,
              assignment: assignment,
              isToolVisible: true,
              agentStatus: {
                activeAgents: ['template-fallback'],
                coordination: 'template-based',
                safetyValidation: true
              },
              isLoading: false
            }));
            
            if (enableFinnGuidance) {
              setState(prev => ({
                ...prev,
                finnGuidance: {
                  message: "I've prepared the perfect tool for this activity!",
                  encouragement: "Let's practice together!",
                  hint: `This ${assignment.subject} tool will help you apply your skills`
                }
              }));
            }
            
            console.log('✅ Template-based tool manifested:', templateToolConfig.toolName);
            return;
          }
          
        } catch (error) {
          console.warn('⚠️ Direct agent calls failed, using fallback:', error);
        }
      } else {
        // Use single-agent approach (FinnTool)
        const toolDiscoveryResult = await agentSystem?.requestAgentAction(
          'tool',
          'discover_tools',
          {
            skillCategory: skillCategory,
            subject: assignment.subject,
            gradeLevel: assignment.gradeLevel,
            learningObjective: assignment.skillName,
            student: {
              id: assignment.studentId,
              preferences: extractStudentPreferences(assignment)
            },
            parameters: {
              maxTools: 3,
              safetyLevel: 'strict',
              preferredSource: 'verified'
            }
          }
        );

        if (toolDiscoveryResult?.success) {
          const recommendedTool = toolDiscoveryResult.data.recommendedTool;
          const toolConfig = await createToolConfigFromDiscovery(recommendedTool, assignment);
          
          // Validate with FinnSafe
          const safetyResult = await agentSystem?.requestAgentAction(
            'safe',
            'validate_content_safety',
            {
              type: 'content_safety',
              target: {
                type: 'tool',
                id: recommendedTool.id,
                url: recommendedTool.configuration.launchUrl
              },
              context: {
                gradeLevel: assignment.gradeLevel,
                subject: assignment.subject,
                useCase: 'educational_tool',
                studentCount: 1
              },
              parameters: {
                strictnessLevel: 'strict',
                complianceStandards: ['COPPA', 'FERPA', 'WCAG-AA'],
                accessibilityLevel: 'enhanced'
              }
            }
          );

          setState(prev => ({
            ...prev,
            currentTool: toolConfig,
            isToolVisible: true,
            isLoading: false,
            agentStatus: {
              activeAgents: ['tool', 'safe'],
              coordination: 'completed',
              safetyValidation: safetyResult?.success && 
                safetyResult.data.validationResults.safetyStatus === 'safe'
            },
            discoveredTools: toolDiscoveryResult.data.discoveredTools,
            safetyReport: safetyResult?.data
          }));

          if (enableFinnGuidance) {
            setState(prev => ({
              ...prev,
              finnGuidance: {
                message: `Perfect! I found a great tool for ${assignment.skillName}`,
                encouragement: "Let's explore this concept together!",
                hint: recommendedTool.description
              }
            }));
          }

          console.log('✅ Tool manifested via single-agent approach:', toolConfig.toolName);
        } else {
          throw new Error('Tool discovery failed');
        }
      }
      
    } catch (error) {
      console.error('❌ Tool manifestation failed:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to manifest tool. Please try again.',
        isLoading: false,
        agentStatus: {
          activeAgents: [],
          coordination: 'failed',
          safetyValidation: false
        }
      }));
    }
  }, [autoAnalyze, enableFinnGuidance, enableMultiAgentWorkflows, agentSystem]);

  // ================================================================
  // HELPER FUNCTIONS
  // ================================================================

  const extractSkillCategory = (assignment: AssignmentContext): string => {
    // Extract skill category from assignment
    // This could be enhanced to use more sophisticated mapping
    if (assignment.skillCode) {
      // Extract A.0, B.0, etc. from skill codes like "A.1.2" -> "A.0"
      const match = assignment.skillCode.match(/^([A-Z])\.0/) || assignment.skillCode.match(/^([A-Z])/);
      if (match) {
        return `${match[1]}.0`;
      }
    }
    
    // Fallback based on subject
    const subjectMappings = {
      'Math': 'A.0',
      'Mathematics': 'A.0',
      'ELA': 'C.0',
      'English': 'C.0',
      'Science': 'D.0',
      'Social Studies': 'E.0',
      'SocialStudies': 'E.0'
    };
    
    return subjectMappings[assignment.subject] || 'A.0';
  };

  const extractStudentPreferences = (assignment: AssignmentContext): any => {
    return {
      interactionStyle: 'visual',
      difficultyPreference: 'moderate',
      timePreference: 'medium'
    };
  };

  const createToolConfigFromWorkflow = async (workflowResult: any, assignment: AssignmentContext): Promise<ToolConfiguration> => {
    const tools = workflowResult.results['find-tools']?.discoveredTools || [];
    const recommendedTool = tools.length > 0 ? tools[0] : null;
    
    if (!recommendedTool) {
      throw new Error('No tools found in workflow result');
    }

    return {
      toolName: recommendedTool.name,
      toolType: 'MasterToolInterface' as ToolType,
      configuration: {
        skillCode: assignment.skillCode,
        subject: assignment.subject,
        gradeLevel: assignment.gradeLevel,
        toolId: recommendedTool.id,
        launchUrl: recommendedTool.configuration.launchUrl,
        ...recommendedTool.configuration.configurationOptions
      }
    };
  };

  const createToolConfigFromDiscovery = async (tool: any, assignment: AssignmentContext): Promise<ToolConfiguration> => {
    return {
      toolName: tool.name,
      toolType: 'MasterToolInterface' as ToolType,
      configuration: {
        skillCode: assignment.skillCode,
        subject: assignment.subject,
        gradeLevel: assignment.gradeLevel,
        toolId: tool.id,
        launchUrl: tool.configuration.launchUrl,
        ...tool.configuration.configurationOptions
      }
    };
  };

  // ================================================================
  // TOOL INTERACTION HANDLERS
  // ================================================================

  const handleToolProgress = useCallback(async (progress: any) => {
    console.log('📊 Tool progress:', progress);
    
    // Get Finn guidance for student action using agent system
    if (enableFinnGuidance && state.assignment && agentSystem) {
      try {
        const guidance = await agentSystem.requestAgentAction(
          'speak',
          'provide_guidance',
          {
            type: 'progress_feedback',
            assignment: state.assignment,
            progress: {
              action: progress.action,
              toolState: progress.toolState,
              completionPercent: progress.completionPercent || 0
            },
            student: {
              id: state.assignment.studentId,
              gradeLevel: state.assignment.gradeLevel
            },
            parameters: {
              encouragementLevel: 'moderate',
              hintLevel: 'subtle',
              personalizedResponse: true
            }
          }
        );
        
        if (guidance?.success) {
          setState(prev => ({
            ...prev,
            finnGuidance: {
              message: guidance.data.message || 'Great progress!',
              hint: guidance.data.hint,
              encouragement: guidance.data.encouragement || 'Keep going!'
            }
          }));
        }
      } catch (error) {
        console.warn('⚠️ Failed to get Finn guidance:', error);
      }
    }
    
    // Call external progress handler
    if (onToolProgress) {
      onToolProgress(progress);
    }
  }, [enableFinnGuidance, state.assignment, onToolProgress, agentSystem]);

  const handleToolComplete = useCallback(async (results: any) => {
    console.log('🎉 Tool completed:', results);
    
    setState(prev => ({
      ...prev,
      toolResults: results,
      isToolVisible: false
    }));

    // Get completion guidance from multiple agents
    if (enableFinnGuidance && state.assignment && agentSystem) {
      try {
        // Use multi-agent coordination for comprehensive completion feedback
        const completionWorkflow = await agentCoordination.executeWorkflow(
          'completion-feedback',
          {
            assignment: state.assignment,
            results: results,
            isCorrect: results.isCorrect,
            studentProgress: results.progress || {},
            toolUsed: state.currentTool?.toolName
          },
          {
            priority: 'medium',
            timeout: 15000
          }
        );

        if (completionWorkflow.status === 'completed') {
          setState(prev => ({
            ...prev,
            finnGuidance: {
              message: completionWorkflow.results['feedback-message']?.message || 
                      (results.isCorrect ? 'Excellent work!' : 'Good effort! Let\'s try again.'),
              encouragement: completionWorkflow.results['encouragement']?.text || 
                           'You\'re making great progress!',
              hint: completionWorkflow.results['next-steps']?.hint
            }
          }));
        }
      } catch (error) {
        console.warn('⚠️ Failed to get completion guidance:', error);
        
        // Fallback to simple FinnSpeak guidance
        try {
          const guidance = await agentSystem.requestAgentAction(
            'speak',
            'provide_guidance',
            {
              type: 'completion_feedback',
              assignment: state.assignment,
              results: results,
              parameters: {
                encouragementLevel: results.isCorrect ? 'high' : 'supportive',
                nextSteps: !results.isCorrect
              }
            }
          );
          
          if (guidance?.success) {
            setState(prev => ({
              ...prev,
              finnGuidance: {
                message: guidance.data.message || 'Great job!',
                encouragement: guidance.data.encouragement,
                hint: guidance.data.hint
              }
            }));
          }
        } catch (fallbackError) {
          console.warn('⚠️ Fallback guidance also failed:', fallbackError);
        }
      }
    }
    
    // Call external completion handler
    if (onToolComplete) {
      onToolComplete(results);
    }
  }, [enableFinnGuidance, state.assignment, onToolComplete, agentSystem]);

  const handleToolClose = useCallback(() => {
    setState(prev => ({
      ...prev,
      isToolVisible: false,
      currentTool: null,
      finnGuidance: null
    }));
  }, []);

  // ================================================================
  // TOOL CONTROL METHODS
  // ================================================================

  const openTool = useCallback((assignment: AssignmentContext, toolContext?: any) => {
    // Enhanced assignment with tool context for template scenarios
    const enhancedAssignment = toolContext ? {
      ...assignment,
      practiceContent: toolContext
    } : assignment;
    console.log('🔧 Opening tool with context:', { assignment: assignment.skillCode, hasContext: !!toolContext });
    console.log('🔧 Tool Context details:', toolContext);
    console.log('🔧 Enhanced Assignment:', enhancedAssignment);
    manifestTool(enhancedAssignment);
  }, [manifestTool]);

  const closeTool = useCallback(() => {
    handleToolClose();
  }, [handleToolClose]);

  const resetTool = useCallback(() => {
    setState(prev => ({
      ...prev,
      toolResults: null,
      error: null,
      finnGuidance: null
    }));
  }, []);

  const reopenTool = useCallback(() => {
    if (state.assignment) {
      manifestTool(state.assignment);
    }
  }, [state.assignment, manifestTool]);

  // ================================================================
  // HELPER FUNCTIONS
  // ================================================================

  const createToolConfigFromMCP = (mcpTool: any, assignment: AssignmentContext): ToolConfiguration | null => {
    console.log('🔧 Creating tool config from MCP tool:', mcpTool);
    console.log('🔧 Assignment practiceContent:', assignment.practiceContent);
    
    try {
      // Check if the assignment has a template-specified tool type
      const templateToolType = assignment.practiceContent?.templateConfig?.toolType;
      const toolType = templateToolType || mcpTool.type || 'generic';
      
      console.log('🔧 Tool type selection:', { templateToolType, mcpToolType: mcpTool.type, finalToolType: toolType });
      
      return {
        toolType: toolType,
        toolName: mcpTool.name || 'Interactive Learning Tool',
        description: mcpTool.description || `Practice ${assignment.skillName}`,
        instructions: mcpTool.instructions || 'Use this tool to practice the skill.',
        parameters: {
          ...mcpTool.parameters,
          // Include MCP-specific properties needed for iframe rendering
          launchUrl: mcpTool.configuration?.launchUrl || mcpTool.launchUrl,
          integrationMethod: mcpTool.configuration?.integrationMethod || mcpTool.integrationMethod,
          id: mcpTool.id,
          name: mcpTool.name,
          description: mcpTool.description,
          capabilities: mcpTool.capabilities,
          metrics: mcpTool.metrics,
          safety: mcpTool.safety
        },
        appearance: {
          width: 800,
          height: 600,
          position: 'center',
          theme: 'auto'
        },
        interactions: {
          allowMinimize: true,
          allowFullscreen: true,
          allowSettings: true,
          allowSound: true
        },
        accessibility: {
          highContrast: false,
          screenReader: true,
          keyboardNavigation: true
        }
      };
    } catch (error) {
      console.error('❌ Failed to create tool config from MCP:', error);
      return null;
    }
  };


  // ================================================================
  // UTILITY METHODS
  // ================================================================

  const getAvailableTools = useCallback(async (): Promise<string[]> => {
    if (!agentSystem) return [];
    
    try {
      const toolsResponse = await agentSystem.requestAgentAction(
        'tool',
        'get_available_tools',
        {
          includeAll: true,
          filterByGrade: null,
          filterBySubject: null
        }
      );
      
      return toolsResponse?.success ? toolsResponse.data.tools : [];
    } catch (error) {
      console.error('❌ Failed to get available tools:', error);
      return [];
    }
  }, [agentSystem]);

  const getToolConfiguration = useCallback(async (toolKey: string): Promise<ToolConfiguration | null> => {
    if (!agentSystem) return null;
    
    try {
      const configResponse = await agentSystem.requestAgentAction(
        'tool',
        'get_tool_configuration',
        {
          toolId: toolKey,
          includeMetadata: true
        }
      );
      
      if (configResponse?.success) {
        return {
          toolName: configResponse.data.name,
          toolType: 'MasterToolInterface' as ToolType,
          configuration: configResponse.data.configuration || {}
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get tool configuration:', error);
      return null;
    }
  }, [agentSystem]);

  const analyzeAssignment = useCallback(async (assignment: AssignmentContext): Promise<any> => {
    if (!agentSystem) return null;
    
    try {
      const analysisResponse = await agentSystem.requestAgentAction(
        'think',
        'analyze_critically',
        {
          subject: assignment.subject,
          content: assignment.skillName,
          gradeLevel: assignment.gradeLevel,
          analysisType: 'assignment_analysis',
          context: {
            learningObjective: assignment.learningObjective,
            skillCode: assignment.skillCode,
            studentId: assignment.studentId
          }
        }
      );
      
      if (analysisResponse?.success) {
        return {
          skillCategory: extractSkillCategory(assignment),
          cognitiveLoad: analysisResponse.data.cognitiveLoad,
          recommendedApproach: analysisResponse.data.recommendedApproach,
          estimatedDuration: analysisResponse.data.estimatedDuration,
          prerequisites: analysisResponse.data.prerequisites,
          learningObjectives: analysisResponse.data.learningObjectives
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to analyze assignment:', error);
      return null;
    }
  }, [agentSystem]);

  // ================================================================
  // PERSISTENCE (Future Enhancement)
  // ================================================================

  useEffect(() => {
    if (persistToolState && state.toolResults) {
      // Save tool results to localStorage or database
      const key = `tool-results-${state.assignment?.skillCode}`;
      localStorage.setItem(key, JSON.stringify(state.toolResults));
    }
  }, [persistToolState, state.toolResults, state.assignment]);

  // ================================================================
  // RETURN INTERFACE
  // ================================================================

  return {
    // State
    isToolVisible: state.isToolVisible,
    currentTool: state.currentTool,
    assignment: state.assignment,
    isLoading: state.isLoading,
    error: state.error,
    toolResults: state.toolResults,
    finnGuidance: state.finnGuidance,

    // Actions
    openTool,
    closeTool,
    resetTool,
    reopenTool,

    // Handlers
    handleToolProgress,
    handleToolComplete,
    handleToolClose,

    // Utilities
    getAvailableTools,
    getToolConfiguration,
    analyzeAssignment,

    // Advanced
    manifestTool,
    agentSystem,
    
    // Agent Status
    agentStatus: state.agentStatus,
    discoveredTools: state.discoveredTools,
    safetyReport: state.safetyReport,
    
    // Additional Methods
    getAgentStatus: useCallback((agentType: AgentType) => {
      return agentSystem?.getAgent(agentType)?.getStatus();
    }, [agentSystem]),
    
    getSystemHealth: useCallback(() => {
      return agentSystem?.getSystemStatus();
    }, [agentSystem]),
    
    requestAgentAction: useCallback(async (agentType: AgentType, action: string, data: any) => {
      return agentSystem?.requestAgentAction(agentType, action, data);
    }, [agentSystem])
  };
};

export default useMasterTool;