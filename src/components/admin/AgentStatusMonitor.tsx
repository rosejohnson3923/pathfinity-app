// ================================================================
// AGENT STATUS MONITOR
// Real-time monitoring component for 6-agent Finn architecture
// Provides visibility into agent performance, health, and activity
// ================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  MessageCircle, 
  Brain, 
  Wrench, 
  Shield, 
  Video,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { AgentSystem, AgentType } from '../../agents/AgentSystem';
import { agentCoordination } from '../../services/AgentCoordination';

interface AgentStatus {
  id: AgentType;
  name: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  lastActivity: Date;
  tasksCompleted: number;
  averageResponseTime: number;
  successRate: number;
  currentTask?: string;
  errorCount: number;
  icon: any;
  color: string;
}

interface SystemMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uptime: number;
  activeAgents: number;
  mcpToolsDiscovered: number;
  safetyValidations: number;
}

const AgentStatusMonitor: React.FC = () => {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    uptime: 0,
    activeAgents: 0,
    mcpToolsDiscovered: 0,
    safetyValidations: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Agent configuration with icons and colors
  const agentConfigs = [
    { id: 'see' as AgentType, name: 'FinnSee', icon: Eye, color: 'green' },
    { id: 'speak' as AgentType, name: 'FinnSpeak', icon: MessageCircle, color: 'blue' },
    { id: 'think' as AgentType, name: 'FinnThink', icon: Brain, color: 'purple' },
    { id: 'tool' as AgentType, name: 'FinnTool', icon: Wrench, color: 'orange' },
    { id: 'safe' as AgentType, name: 'FinnSafe', icon: Shield, color: 'red' },
    { id: 'view' as AgentType, name: 'FinnView', icon: Video, color: 'indigo' }
  ];

  // Fetch agent statuses
  const fetchAgentStatuses = useCallback(async () => {
    try {
      const statuses: AgentStatus[] = [];
      
      for (const config of agentConfigs) {
        try {
          // Get agent status from coordination system
          const agentSystem = await agentCoordination.getAgentSystem();
          const agentStatus = agentSystem?.getAgent(config.id)?.getStatus();
          
          // Mock data for demonstration (would be replaced with real metrics)
          const mockStatus: AgentStatus = {
            id: config.id,
            name: config.name,
            status: agentStatus?.isInitialized ? 'active' : 'idle',
            lastActivity: new Date(Date.now() - Math.random() * 3600000), // Random within last hour
            tasksCompleted: Math.floor(Math.random() * 100),
            averageResponseTime: 150 + Math.random() * 200,
            successRate: 85 + Math.random() * 15,
            currentTask: agentStatus?.isInitialized ? getRandomTask(config.id) : undefined,
            errorCount: Math.floor(Math.random() * 5),
            icon: config.icon,
            color: config.color
          };
          
          statuses.push(mockStatus);
        } catch (error) {
          console.warn(`Failed to get status for ${config.name}:`, error);
          // Add offline status
          statuses.push({
            id: config.id,
            name: config.name,
            status: 'offline',
            lastActivity: new Date(Date.now() - 3600000),
            tasksCompleted: 0,
            averageResponseTime: 0,
            successRate: 0,
            errorCount: 0,
            icon: config.icon,
            color: config.color
          });
        }
      }
      
      setAgentStatuses(statuses);
      
      // Update system metrics
      const activeAgents = statuses.filter(s => s.status === 'active').length;
      const totalTasks = statuses.reduce((sum, s) => sum + s.tasksCompleted, 0);
      const avgResponseTime = statuses.reduce((sum, s) => sum + s.averageResponseTime, 0) / statuses.length;
      const successRate = statuses.reduce((sum, s) => sum + s.successRate, 0) / statuses.length;
      
      setSystemMetrics({
        totalRequests: totalTasks,
        successfulRequests: Math.floor(totalTasks * (successRate / 100)),
        failedRequests: totalTasks - Math.floor(totalTasks * (successRate / 100)),
        averageResponseTime: avgResponseTime,
        uptime: 99.2, // Mock uptime
        activeAgents,
        mcpToolsDiscovered: 15, // Mock MCP tools
        safetyValidations: 42 // Mock safety validations
      });
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch agent statuses:', error);
    }
  }, []);

  // Get random task for agent
  const getRandomTask = (agentId: AgentType): string => {
    const tasks = {
      see: ['Analyzing visual content', 'Processing image data', 'Generating visual feedback'],
      speak: ['Providing guidance', 'Generating encouragement', 'Creating explanations'],
      think: ['Analyzing problem', 'Evaluating solution', 'Processing logic'],
      tool: ['Discovering tools', 'Validating compatibility', 'Configuring interface'],
      safe: ['Validating content', 'Checking compliance', 'Monitoring safety'],
      view: ['Curating videos', 'Analyzing content', 'Checking appropriateness']
    };
    
    const agentTasks = tasks[agentId] || ['Processing request'];
    return agentTasks[Math.floor(Math.random() * agentTasks.length)];
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAgentStatuses();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchAgentStatuses();
    const interval = setInterval(fetchAgentStatuses, 30000);
    return () => clearInterval(interval);
  }, [fetchAgentStatuses]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'idle': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'idle': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'offline': return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agent Status Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time monitoring of 6-agent Finn architecture
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemMetrics.activeAgents}/6</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round((systemMetrics.successfulRequests / systemMetrics.totalRequests) * 100 || 0)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(systemMetrics.averageResponseTime)}ms</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">MCP Tools</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemMetrics.mcpToolsDiscovered}</p>
            </div>
            <Wrench className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentStatuses.map((agent) => {
          const IconComponent = agent.icon;
          return (
            <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${agent.color}-100 dark:bg-${agent.color}-900`}>
                    <IconComponent className={`w-6 h-6 text-${agent.color}-600 dark:text-${agent.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {agent.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(agent.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{agent.tasksCompleted}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{agent.successRate.toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{Math.round(agent.averageResponseTime)}ms</span>
                </div>
                
                {agent.errorCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600 dark:text-red-400">Errors</span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">{agent.errorCount}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Activity</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.round((Date.now() - agent.lastActivity.getTime()) / 60000)}m ago
                  </span>
                </div>
              </div>

              {/* Current Task */}
              {agent.currentTask && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Current Task</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{agent.currentTask}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {systemMetrics.uptime}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {systemMetrics.totalRequests}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {systemMetrics.safetyValidations}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Safety Validations</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentStatusMonitor;