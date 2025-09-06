import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minimize2 } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  quickActions?: Array<{
    id: string;
    text: string;
    action: string;
  }>;
}

interface AIAssistantProps {
  todaysLessons?: any[];
  lessonsLoading?: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  totalRemainingTime: number;
}

export function AIAssistant({ todaysLessons = [], lessonsLoading = false, isOpen, setIsOpen, totalRemainingTime = 0 }: AIAssistantProps) {
  const { user } = useAuthContext();
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Finn's daily onboarding effect
  useEffect(() => {
    if (isOpen && !lessonsLoading && !hasOnboarded && todaysLessons.length > 0) {
      const userName = user?.full_name?.split(' ')[0] || 'there';
      
      // Small delay to make it feel natural
      const timer = setTimeout(() => {
        const onboardingMessage = createOnboardingMessage(todaysLessons, totalRemainingTime, userName);
        setMessages([onboardingMessage]);
        setHasOnboarded(true);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isOpen, lessonsLoading, todaysLessons, hasOnboarded, totalRemainingTime, user]);

  const formatMinutesToHoursAndMinutes = (minutes: number): string => {
    if (minutes <= 0) return '0m';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const createOnboardingMessage = (lessons: any[], totalTime: number, userName: string): Message => {
    const toolsNeeded = getRequiredTools(lessons);
    const toolCount = toolsNeeded.length;

    // More friendly, encouraging greeting
    let greeting = `Hey ${userName}! 👋 I'm Finn, your learning buddy! `;
    
    if (lessons.length === 0) {
      greeting += "Looks like you don't have any lessons scheduled for today. Take some time to explore or catch up on previous work!";
    } else {
      // Summarize time commitment instead of listing individual lessons
      greeting += `I've got your personalized plan ready for today! `;
      
      // Time commitment section
      greeting += `\n\n⏱️ **Time Commitment:**\n`;
      greeting += `You've got about ${formatMinutesToHoursAndMinutes(totalTime)} of learning activities today. Don't worry, we'll tackle them together at your pace!`;
      
      // Tools section - simplified
      if (toolCount > 0) {
        greeting += `\n\n🛠️ **Helpful Tools:**\n`;
        toolsNeeded.forEach((tool, index) => {
          greeting += `${index + 1}. **${tool.name}** - Ready when you need it!\n`;
        });
      }

      // Add encouraging message
      greeting += `\n\nYou've got this! I'm here to help every step of the way. What would you like to start with today?`;
    }

    const quickActions = [];
    
    if (lessons.length > 0) {
      quickActions.push({
        id: 'start-first-lesson',
        text: 'Start First Lesson',
        action: 'start_lesson'
      });
    }

    if (toolCount > 0) {
      toolsNeeded.forEach(tool => {
        quickActions.push({
          id: `launch-${tool.id}`,
          text: `Launch ${tool.name}`,
          action: 'launch_tool'
        });
      });
    }

    return {
      id: 'onboarding-' + Date.now(),
      text: greeting,
      isBot: true,
      timestamp: new Date(),
      quickActions: quickActions.length > 0 ? quickActions : undefined
    };
  };

  const getRequiredTools = (lessons: any[]) => {
    const allTools = [
      {
        id: 'brand',
        name: 'BRAND Studio',
        description: 'Create presentations and designs',
        keywords: ['presentation', 'design', 'visual', 'poster', 'infographic', 'creative', 'art', 'brand']
      },
      {
        id: 'collab',
        name: 'COLLAB Space',
        description: 'Project marketplace & teams',
        keywords: ['project', 'collaborate', 'group', 'team', 'partnership', 'work together', 'joint']
      },
      {
        id: 'stream',
        name: 'STREAM Live',
        description: 'Live streaming & recordings',
        keywords: ['live', 'stream', 'broadcast', 'webinar', 'session', 'recording', 'video']
      },
      {
        id: 'meet',
        name: 'MEET Hub',
        description: 'Community & discussions',
        keywords: ['discussion', 'community', 'forum', 'chat', 'talk', 'communicate', 'share']
      }
    ];

    const lessonContent = lessons.map(lesson => {
      const content = {
        title: lesson.skills_topics?.name || '',
        description: lesson.skills_topics?.description || '',
        objectives: lesson.skills_topics?.learning_objectives?.join(' ') || '',
        lessonType: lesson.lesson_type || '',
        content: JSON.stringify(lesson.content || {}),
        subject: lesson.skills_topics?.mastery_groups?.subjects?.name || ''
      };
      
      return Object.values(content).join(' ').toLowerCase();
    }).join(' ');

    return allTools.filter(tool => {
      return tool.keywords.some(keyword => 
        lessonContent.includes(keyword.toLowerCase())
      );
    });
  };

  const getTimeOfDay = () => {
    try {
      const hour = new Date().getHours();
      if (hour < 12) return 'morning';
      if (hour < 18) return 'afternoon';
      return 'evening';
    } catch (error) {
      return 'day';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(trimmedMessage),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleQuickAction = (action: string, actionId: string) => {
    let responseText = '';
    
    switch (action) {
      case 'start_lesson':
        responseText = "You've got this! Let's get started with your first lesson. I'll be right here if you need any help or have questions along the way. Remember, it's okay to take breaks if you need them!";
        break;
      case 'launch_tool':
        responseText = "Great choice! I'm launching the perfect tool to help with your assignments. These creative tools will make your work stand out and the process more enjoyable. Don't hesitate to ask if you need tips on using them!";
        break;
      case 'view_progress':
        responseText = "You're making awesome progress! 🌟 Your learning streak is strong, and you're consistently improving. I'm really impressed with how you're tackling challenges. Keep up the fantastic work!";
        break;
      default:
        responseText = "I'm here to support your learning journey today! What can I help you with?";
    }

    const botResponse: Message = {
      id: Date.now().toString(),
      text: responseText,
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botResponse]);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('help')) {
      return "I'm here to help! 😊 I can assist with your lessons, answer questions about your progress, or help you find the right learning resources. Just let me know what you need!";
    } else if (lowerMessage.includes('lesson') || lowerMessage.includes('assignment')) {
      return "You're doing great with your lessons! Need me to explain any concepts, provide study tips, or help you get started with your assignments? I'm here to make learning easier for you!";
    } else if (lowerMessage.includes('tool') || lowerMessage.includes('brand') || lowerMessage.includes('collab')) {
      return "The creative tools are super helpful for your assignments! Each one is specially picked to make your work easier and more fun. Want me to show you how to use any of them?";
    } else if (lowerMessage.includes('progress')) {
      return "You're making amazing progress! 🚀 I'm really impressed with how you're advancing in your subjects. Keep up the great work - you're definitely on the right track!";
    } else if (lowerMessage.includes('difficult') || lowerMessage.includes('hard') || lowerMessage.includes('stuck')) {
      return "It's totally normal to find some concepts challenging! Everyone learns at their own pace. Let's break it down together - what specific part are you finding difficult? You've got this!";
    } else if (lowerMessage.includes('thank')) {
      return "You're very welcome! 😊 I'm always happy to help. That's what I'm here for!";
    } else {
      return "That's interesting! I'm always learning too. Is there anything specific about your studies I can help with today? Remember, I'm here to support you every step of the way!";
    }
  };

  const formatTime = (date: Date) => {
    try {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center z-50"
          aria-label="Open AI Assistant"
        >
          <img 
            src="/finn-enhanced.jpeg" 
            alt="Finn AI Assistant" 
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              // Fallback to Bot icon
              const fallback = document.createElement('div');
              fallback.innerHTML = '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V15C3 16.1 3.9 17 5 17H8V21C8 22.1 8.9 23 10 23H14C15.1 23 16 22.1 16 21V17H19C20.1 17 21 16.1 21 15V9H23V7H21M19 15H5V3H15V9H19V15Z"/></svg>';
              target.parentNode?.appendChild(fallback);
            }}
          />
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-96'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <img 
                src="/finn-enhanced.jpeg" 
                alt="Finn AI Assistant" 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // Fallback to gradient background with Bot icon
                  const fallback = document.createElement('div');
                  fallback.className = 'w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center';
                  fallback.innerHTML = '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V15C3 16.1 3.9 17 5 17H8V21C8 22.1 8.9 23 10 23H14C15.1 23 16 22.1 16 21V17H19C20.1 17 21 16.1 21 15V9H23V7H21M19 15H5V3H15V9H19V15Z"/></svg>';
                  target.parentNode?.insertBefore(fallback, target);
                }}
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Finn</h3>
                <p className="text-xs text-green-500">Your Learning Guide</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex space-x-3 ${msg.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                    {msg.isBot && (
                      <img 
                        src="/finn-enhanced.jpeg" 
                        alt="Finn AI Assistant" 
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Fallback to gradient background with Bot icon
                          const fallback = document.createElement('div');
                          fallback.className = 'w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0';
                          fallback.innerHTML = '<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V15C3 16.1 3.9 17 5 17H8V21C8 22.1 8.9 23 10 23H14C15.1 23 16 22.1 16 21V17H19C20.1 17 21 16.1 21 15V9H23V7H21M19 15H5V3H15V9H19V15Z"/></svg>';
                          target.parentNode?.insertBefore(fallback, target);
                        }}
                      />
                    )}
                    <div className={`rounded-lg p-3 max-w-xs ${
                      msg.isBot 
                        ? 'bg-gray-100 dark:bg-gray-800' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      <p className={`text-sm whitespace-pre-line ${msg.isBot ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                        {msg.text}
                      </p>
                      
                      {/* Quick Action Buttons */}
                      {msg.quickActions && (
                        <div className="mt-3 space-y-2">
                          {msg.quickActions.map((action) => (
                            <button
                              key={action.id}
                              onClick={() => handleQuickAction(action.action, action.id)}
                              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              {action.text}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <p className={`text-xs mt-1 ${
                        msg.isBot 
                          ? 'text-gray-500 dark:text-gray-400' 
                          : 'text-blue-100'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex space-x-3">
                    <img 
                      src="/finn-enhanced.jpeg" 
                      alt="Finn AI Assistant" 
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Fallback to gradient background with Bot icon
                        const fallback = document.createElement('div');
                        fallback.className = 'w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0';
                        fallback.innerHTML = '<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V15C3 16.1 3.9 17 5 17H8V21C8 22.1 8.9 23 10 23H14C15.1 23 16 22.1 16 21V17H19C20.1 17 21 16.1 21 15V9H23V7H21M19 15H5V3H15V9H19V15Z"/></svg>';
                        target.parentNode?.insertBefore(fallback, target);
                      }}
                    />
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-xs">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ask Finn anything..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    aria-label="Ask Finn AI assistant a question"
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    maxLength={500}
                    disabled={isTyping}
                  />
                  <button 
                    type="submit"
                    disabled={!message.trim() || isTyping}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}