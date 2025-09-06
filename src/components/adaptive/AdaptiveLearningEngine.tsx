/**
 * ADAPTIVE LEARNING ENGINE
 * Real-time personalization component that wraps learning content
 * Automatically adapts content, difficulty, and support based on student needs
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Lightbulb, 
  Heart, 
  Zap, 
  TrendingUp,
  Clock,
  User,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { personalizationEngine, StudentLearningProfile, PersonalizedContent } from '../../services/personalizationEngine';
import { useAuthContext } from '../../contexts/AuthContext';
import { FinnAvatar } from '../finn/FinnAvatar';

interface AdaptiveLearningEngineProps {
  content: any;
  contentType: 'instruction' | 'practice' | 'assessment' | 'story' | 'game';
  subject: string;
  skill: string;
  onContentUpdate?: (personalizedContent: PersonalizedContent) => void;
  onDifficultyChange?: (newDifficulty: number, reasoning: string) => void;
  onHintRequest?: () => void;
  showPersonalizationInfo?: boolean;
}

export const AdaptiveLearningEngine: React.FC<AdaptiveLearningEngineProps> = ({
  content,
  contentType,
  subject,
  skill,
  onContentUpdate,
  onDifficultyChange,
  onHintRequest,
  showPersonalizationInfo = true
}) => {
  const { user } = useAuthContext();
  const [personalizedContent, setPersonalizedContent] = useState<PersonalizedContent | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentLearningProfile | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(5);
  const [sessionData, setSessionData] = useState({
    accuracy: 0,
    time_spent: 0,
    attempts: 0,
    help_requests: 0,
    emotional_state: 'neutral'
  });
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [adaptationHistory, setAdaptationHistory] = useState<string[]>([]);
  
  const sessionStartTime = useRef(Date.now());
  const performanceHistory = useRef<number[]>([]);

  useEffect(() => {
    if (user?.id && user.role === 'student') {
      initializePersonalization();
    }
  }, [user?.id, content]);

  useEffect(() => {
    // Update session time every 10 seconds
    const timer = setInterval(() => {
      setSessionData(prev => ({
        ...prev,
        time_spent: (Date.now() - sessionStartTime.current) / 1000 / 60 // minutes
      }));
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const initializePersonalization = async () => {
    if (!user?.id) return;

    setIsPersonalizing(true);
    try {
      // Get student learning profile
      const profile = await personalizationEngine.getStudentProfile(user.id);
      setStudentProfile(profile);

      // Personalize the content
      const personalizedResult = await personalizationEngine.personalizeContent({
        student_id: user.id,
        content_type: contentType,
        subject,
        skill,
        current_difficulty: currentDifficulty,
        session_context: sessionData,
        base_content: content
      });

      setPersonalizedContent(personalizedResult);
      onContentUpdate?.(personalizedResult);

      // Track adaptation
      addAdaptationHistory('Content personalized for learning style and interests');
      
    } catch (error) {
      console.error('Personalization initialization error:', error);
    } finally {
      setIsPersonalizing(false);
    }
  };

  const handlePerformanceUpdate = async (accuracy: number, timeSpent: number, attempts: number) => {
    performanceHistory.current.push(accuracy);
    
    const updatedSessionData = {
      accuracy,
      time_spent: timeSpent,
      attempts,
      help_requests: sessionData.help_requests,
      emotional_state: determineEmotionalState(accuracy, attempts)
    };
    
    setSessionData(updatedSessionData);

    // Check if difficulty needs adjustment
    if (shouldAdaptDifficulty()) {
      await adaptDifficulty(updatedSessionData);
    }

    // Check for emotional support needs
    await checkEmotionalState(updatedSessionData);
  };

  const shouldAdaptDifficulty = (): boolean => {
    if (performanceHistory.current.length < 3) return false;
    
    const recentPerformance = performanceHistory.current.slice(-3);
    const avgAccuracy = recentPerformance.reduce((sum, acc) => sum + acc, 0) / recentPerformance.length;
    
    // Adapt if consistently too easy (>90%) or too hard (<60%)
    return avgAccuracy > 0.9 || avgAccuracy < 0.6;
  };

  const adaptDifficulty = async (updatedSessionData: any) => {
    if (!user?.id) return;

    try {
      const adaptationResult = await personalizationEngine.adaptDifficulty(
        user.id,
        currentDifficulty,
        updatedSessionData
      );

      if (adaptationResult.new_difficulty !== currentDifficulty) {
        setCurrentDifficulty(adaptationResult.new_difficulty);
        onDifficultyChange?.(adaptationResult.new_difficulty, adaptationResult.reasoning);
        
        addAdaptationHistory(`Difficulty adjusted to ${adaptationResult.new_difficulty}/10: ${adaptationResult.reasoning}`);
      }
    } catch (error) {
      console.error('Difficulty adaptation error:', error);
    }
  };

  const checkEmotionalState = async (updatedSessionData: any) => {
    if (!user?.id) return;

    const behaviorIndicators = [];
    
    // Detect behavioral patterns
    if (updatedSessionData.time_spent > (studentProfile?.optimal_session_length || 25)) {
      behaviorIndicators.push('extended_session');
    }
    if (updatedSessionData.help_requests > 3) {
      behaviorIndicators.push('frequent_help_seeking');
    }
    if (updatedSessionData.accuracy < 0.5) {
      behaviorIndicators.push('low_accuracy');
    }

    if (behaviorIndicators.length > 0) {
      try {
        const emotionalResponse = await personalizationEngine.recognizeEmotionalState(
          user.id,
          updatedSessionData,
          behaviorIndicators
        );

        if (emotionalResponse.finn_response) {
          showFinnSupport(emotionalResponse.finn_response);
        }
      } catch (error) {
        console.error('Emotional state recognition error:', error);
      }
    }
  };

  const requestHint = async () => {
    if (!user?.id || !content) return;

    try {
      const hint = await personalizationEngine.generateAdaptiveHint(
        user.id,
        content,
        performanceHistory.current
      );

      setSessionData(prev => ({
        ...prev,
        help_requests: prev.help_requests + 1
      }));

      onHintRequest?.();
      showFinnSupport(`💡 ${hint.content}`);
      addAdaptationHistory('Personalized hint provided');
      
    } catch (error) {
      console.error('Hint generation error:', error);
    }
  };

  const determineEmotionalState = (accuracy: number, attempts: number): string => {
    if (accuracy > 0.8 && attempts < 3) return 'confident';
    if (accuracy < 0.5 && attempts > 3) return 'frustrated';
    if (accuracy > 0.9) return 'excited';
    if (attempts > 5) return 'tired';
    return 'neutral';
  };

  const showFinnSupport = (message: string) => {
    // This would trigger Finn animation and speech
    console.log('Finn says:', message);
    // TODO: Integrate with actual Finn component
  };

  const addAdaptationHistory = (adaptation: string) => {
    setAdaptationHistory(prev => [...prev.slice(-4), adaptation]); // Keep last 5
  };

  const getPersonalizationInsights = () => {
    if (!personalizedContent || !studentProfile) return null;

    return (
      <Card className="mb-4 border-purple-200 bg-purple-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-purple-800">
            <Sparkles className="h-5 w-5 mr-2" />
            AI Personalization Active
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm">
                <span className="font-medium">Style:</span> {studentProfile.learning_style}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm">
                <span className="font-medium">Difficulty:</span> {currentDifficulty}/10
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-600" />
              <span className="text-sm">
                <span className="font-medium">Mood:</span> {sessionData.emotional_state}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                <span className="font-medium">Accuracy:</span> {(sessionData.accuracy * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {personalizedContent.personalization_applied && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-purple-700">Active Adaptations:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(personalizedContent.personalization_applied).map(([key, value]) => (
                  value && (
                    <Badge key={key} variant="secondary" className="bg-purple-100 text-purple-800">
                      {key.replace('_', ' ')}: {value}
                    </Badge>
                  )
                ))}
              </div>
            </div>
          )}

          {adaptationHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-purple-700">Recent Adaptations:</h4>
              <div className="space-y-1">
                {adaptationHistory.slice(-3).map((adaptation, index) => (
                  <div key={index} className="text-xs text-purple-600 flex items-center">
                    <div className="w-1 h-1 bg-purple-400 rounded-full mr-2"></div>
                    {adaptation}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (user?.role !== 'student') {
    // For non-students, show regular content without personalization
    return <div>{content}</div>;
  }

  if (isPersonalizing) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-48">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 animate-pulse text-purple-600" />
            <div>
              <h3 className="font-semibold text-purple-800">Personalizing Content...</h3>
              <p className="text-sm text-purple-600">AI is adapting this lesson just for you!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showPersonalizationInfo && getPersonalizationInsights()}
      
      {/* Finn Interaction Panel */}
      {personalizedContent?.finn_interaction && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <FinnAvatar size="sm" mood={sessionData.emotional_state} />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 mb-2">
                  {personalizedContent.finn_interaction.greeting}
                </p>
                {personalizedContent.finn_interaction.encouragement && (
                  <p className="text-xs text-yellow-700">
                    💪 {personalizedContent.finn_interaction.encouragement}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adaptive Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            onClick={requestHint}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Smart Hint</span>
          </Button>
          
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{Math.round(sessionData.time_spent)}m</span>
          </Badge>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Zap className="h-4 w-4 text-purple-600" />
          <span>AI Enhanced</span>
        </div>
      </div>

      {/* Personalized Content */}
      <div className="relative">
        {personalizedContent?.content ? (
          <div>{personalizedContent.content}</div>
        ) : (
          <div>{content}</div>
        )}
        
        {/* Engagement Indicator */}
        {personalizedContent?.estimated_engagement && (
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className={`${
                personalizedContent.estimated_engagement > 0.8 
                  ? 'bg-green-100 text-green-800' 
                  : personalizedContent.estimated_engagement > 0.6 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {(personalizedContent.estimated_engagement * 100).toFixed(0)}% Match
            </Badge>
          </div>
        )}
      </div>

      {/* Performance Tracking */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Session Progress</span>
          <span className="text-sm text-gray-600">
            {sessionData.attempts} attempts • {sessionData.help_requests} hints
          </span>
        </div>
        <Progress 
          value={sessionData.accuracy * 100} 
          className="h-2"
        />
      </div>
    </div>
  );
};

export default AdaptiveLearningEngine;