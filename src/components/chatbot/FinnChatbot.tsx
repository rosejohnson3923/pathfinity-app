// ================================================================
// FINN CHATBOT - Hovering Owl Assistant
// Provides contextual feedback and tutoring guidance
// ================================================================

import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface FinnChatbotProps {
  isVisible: boolean;
  message: string;
  feedbackType: 'neutral' | 'correct' | 'incorrect' | 'hint';
  onClose?: () => void;
}

export const FinnChatbot: React.FC<FinnChatbotProps> = ({
  isVisible,
  message,
  feedbackType,
  onClose
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isVisible && message) {
      setIsAnimating(true);
      // Delay showing message for entrance animation
      setTimeout(() => setShowMessage(true), 300);
    } else {
      setShowMessage(false);
      setIsAnimating(false);
    }
  }, [isVisible, message]);

  if (!isVisible) return null;


  const getBubbleColor = () => {
    // Use darker translucent background for better white text visibility
    return 'bg-gray-800/90 dark:bg-gray-900/90 border-gray-600 dark:border-gray-700 backdrop-blur-sm';
  };

  const getTextColor = () => {
    // Use white text for better visibility on translucent background
    return 'text-white';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end space-x-3">
      {/* Speech Bubble */}
      {showMessage && (
        <div
          className={`
            relative max-w-xs p-4 rounded-2xl border-2 shadow-xl
            ${getBubbleColor()}
            animate-in slide-in-from-right-5 duration-300
          `}
        >
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          
          {/* Message Content */}
          <div className={`text-sm font-medium ${getTextColor()} pr-6`}>
            <div className="flex items-center space-x-2 mb-1">
              <MessageCircle className="w-4 h-4" />
              <span className="font-semibold">Finn says:</span>
            </div>
            <p className="leading-relaxed">{message}</p>
          </div>
          
          {/* Speech Bubble Tail */}
          <div className="absolute bottom-4 right-[-8px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-current opacity-20"></div>
        </div>
      )}

      {/* Finn Avatar */}
      <div
        className={`
          relative w-16 h-16 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm
          shadow-lg cursor-pointer transition-all duration-300 border-2 border-gray-200 dark:border-gray-600
          ${isAnimating ? 'animate-bounce' : 'hover:scale-110'}
        `}
        onClick={() => setShowMessage(!showMessage)}
      >
        {/* Finn Image */}
        <img 
          src="/finn-enhanced.jpeg" 
          alt="Finn the Owl" 
          className="absolute inset-1 w-14 h-14 rounded-full object-cover"
        />
        {/* Feedback Type Indicator */}
        <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center text-xs">
          {feedbackType === 'correct' && '✨'}
          {feedbackType === 'incorrect' && '💭'}
          {feedbackType === 'hint' && '💡'}
        </div>
        
        {/* Notification Dot */}
        {isVisible && !showMessage && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        )}
        
        {/* Hover Effect Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};