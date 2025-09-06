// ================================================================
// EXPANDABLE READING PANEL
// Provides an elegant reading experience for long text content
// ================================================================

import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, X, ZoomIn, ZoomOut, BookOpen, Volume2 } from 'lucide-react';

interface ExpandableReadingPanelProps {
  title: string;
  content: string;
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
  compactHeight?: string;
  children?: React.ReactNode; // For custom content rendering
}

export const ExpandableReadingPanel: React.FC<ExpandableReadingPanelProps> = ({
  title,
  content,
  icon = <BookOpen className="w-4 h-4" />,
  iconColor = "text-blue-600",
  className = "",
  compactHeight = "max-h-32",
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isReading, setIsReading] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    
    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when expanded
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  // Load voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('🔊 ExpandablePanel voices loaded:', voices.length);
        if (voices.length > 0) {
          setVoicesLoaded(true);
        }
      };

      // Try to load voices immediately
      loadVoices();

      // Some browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      // Fallback: try again after a delay
      setTimeout(loadVoices, 100);
    }
  }, []);

  // Clean up speech synthesis when component unmounts or content changes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsReading(false);
      }
    };
  }, [content]);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large': return 'text-base leading-relaxed';
      case 'xlarge': return 'text-lg leading-relaxed';
      default: return 'text-sm leading-relaxed';
    }
  };

  const getExpandedFontSizeClass = () => {
    switch (fontSize) {
      case 'large': return 'text-lg leading-loose';
      case 'xlarge': return 'text-xl leading-loose';
      default: return 'text-base leading-relaxed';
    }
  };

  const handleAudioClick = () => {
    try {
      // Check if speechSynthesis is available
      if (!('speechSynthesis' in window)) {
        console.error('🔊 Speech synthesis not supported in this browser');
        alert('Text-to-speech is not supported in your browser. Please try a different browser.');
        return;
      }
      
      if (!content) {
        console.error('🔊 No content to read');
        return;
      }
      
      // Check if we're in a secure context (required for some browsers)
      if (window.isSecureContext === false) {
        console.warn('🔊 Not in a secure context, speech synthesis may not work');
      }
      
      if (isReading) {
        // Stop reading
        window.speechSynthesis.cancel();
        setIsReading(false);
      } else {
        // Start reading
        window.speechSynthesis.cancel();
        
        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        console.log('🔊 Available voices:', voices.length);
        
        const utterance = new SpeechSynthesisUtterance(content);
        utterance.rate = 0.9; // Slightly slower for better comprehension
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';
        
        // Try to use a US English voice if available
        const usVoice = voices.find(voice => voice.lang === 'en-US');
        if (usVoice) {
          utterance.voice = usVoice;
        }
        
        // Add event handlers
        utterance.onstart = () => {
          console.log('🔊 Reading content aloud...');
          setIsReading(true);
        };
        utterance.onend = () => {
          console.log('🔊 Finished reading content');
          setIsReading(false);
        };
        utterance.onerror = (event) => {
          console.error('🔊 Error reading content:', event);
          setIsReading(false);
          alert('An error occurred while trying to read the content. Please try again.');
        };
        
        // Add utterance to queue
        window.speechSynthesis.speak(utterance);
        
        // Check if speech started
        setTimeout(() => {
          if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
            console.error('🔊 Speech synthesis failed to start');
            setIsReading(false);
          }
        }, 100);
      }
    } catch (error) {
      console.error('🔊 Error in audio button:', error);
      alert('An error occurred with the audio feature. Please try again.');
      setIsReading(false);
    }
  };

  return (
    <>
      {/* Compact View - Simplified */}
      <div className={`relative ${className}`}>
        <div className="p-3 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-600 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={iconColor}>{icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Audio Button */}
              <button
                onClick={handleAudioClick}
                className={`p-1 ${isReading ? 'bg-red-100 hover:bg-red-200' : 'bg-blue-100 hover:bg-blue-200'} dark:${isReading ? 'bg-red-900 hover:bg-red-800' : 'bg-blue-900 hover:bg-blue-800'} rounded transition-colors group`}
                title={isReading ? "Stop reading" : "Listen to content"}
              >
                <Volume2 className={`w-4 h-4 ${isReading ? 'text-red-600 animate-pulse' : 'text-blue-600'} dark:${isReading ? 'text-red-400' : 'text-blue-400'} group-hover:scale-110 transition-transform`} />
              </button>
              {/* Expand Button */}
              <button
                onClick={() => setIsExpanded(true)}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors group"
                title="Click to read full content"
              >
                <Maximize2 className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Expanded Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-slideIn">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className={`${iconColor} transform scale-125`}>{icon}</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Audio Button */}
                <button
                  onClick={handleAudioClick}
                  className={`p-2 ${isReading ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition-colors flex items-center gap-1`}
                  title={isReading ? "Stop reading" : "Listen to content"}
                >
                  <Volume2 className={`w-4 h-4 ${isReading ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-medium">{isReading ? 'Stop' : 'Listen'}</span>
                </button>
                
                {/* Font Size Controls */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setFontSize('normal')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      fontSize === 'normal' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                      fontSize === 'large' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('xlarge')}
                    className={`px-2 py-1 rounded text-base font-medium transition-colors ${
                      fontSize === 'xlarge' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    A
                  </button>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {children || (
                  <p className={`text-gray-900 dark:text-white ${getExpandedFontSizeClass()}`}>
                    {content}
                  </p>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd> or click outside to close
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ExpandableReadingPanel;