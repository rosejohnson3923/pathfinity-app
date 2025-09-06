import React from 'react';
import { X, BookOpen, FileText, Users, Clock, Star, User, ChevronRight } from 'lucide-react';
import { SearchResultItem } from '../types';
import { useNavigate } from 'react-router-dom';

interface SearchResultsOverlayProps {
  results: SearchResultItem[];
  loading: boolean;
  searchTerm: string;
  onClose: () => void;
  onResultClick: (result: SearchResultItem) => void;
}

export function SearchResultsOverlay({ 
  results, 
  loading, 
  searchTerm, 
  onClose, 
  onResultClick 
}: SearchResultsOverlayProps) {
  const navigate = useNavigate();
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return BookOpen;
      case 'content': return FileText;
      case 'project': return Users;
      case 'user': return User;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'content': return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'project': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'user': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyStars = (level?: number) => {
    if (!level) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleResultClick = (result: SearchResultItem) => {
    // Close the search overlay
    onClose();
    
    // Navigate to the result's link
    navigate(result.link);
    
    // Call the parent's onResultClick handler if provided
    if (onResultClick) {
      onResultClick(result);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Search Results
              </h2>
              {searchTerm && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {loading ? 'Searching...' : `${results.length} results for "${searchTerm}"`}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close search results"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 dark:text-gray-400">Searching...</span>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? `No results found for "${searchTerm}"` : 'Try searching for lessons, content, or projects'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {results.map((result) => {
                  const TypeIcon = getTypeIcon(result.type);
                  const typeColor = getTypeColor(result.type);
                  
                  return (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColor} flex-shrink-0`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                {result.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {result.description}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors ml-2 flex-shrink-0" />
                          </div>
                          
                          {/* Metadata */}
                          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${typeColor} capitalize`}>
                              {result.type}
                            </span>
                            
                            {result.metadata?.subject && (
                              <span className="flex items-center">
                                <span>{result.metadata.subject}</span>
                              </span>
                            )}
                            
                            {result.metadata?.duration && (
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDuration(result.metadata.duration)}</span>
                              </span>
                            )}
                            
                            {result.metadata?.difficulty && (
                              <div className="flex items-center space-x-1">
                                {getDifficultyStars(result.metadata.difficulty)}
                              </div>
                            )}
                            
                            {result.metadata?.author && (
                              <span className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{result.metadata.author}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}