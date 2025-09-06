import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Share2, 
  Download, 
  Clock, 
  Users, 
  Star,
  MoreVertical,
  Calendar,
  FileText,
  BookOpen,
  Target,
  Play,
  Archive
} from 'lucide-react';
import { ContentItem, ContentSearchParams } from '../../../types/content';

interface ContentGridProps {
  content: ContentItem[];
  searchParams: ContentSearchParams;
  onSearchParamsChange: (params: ContentSearchParams) => void;
  onEditContent: (content: ContentItem) => void;
  onDeleteContent: (contentId: string) => void;
  onToggleStatus: (contentId: string, status: 'published' | 'draft' | 'archived') => void;
  onViewContent: (content: ContentItem) => void;
  loading?: boolean;
}

export function ContentGrid({ 
  content, 
  searchParams,
  onSearchParamsChange,
  onEditContent, 
  onDeleteContent, 
  onToggleStatus,
  onViewContent,
  loading = false 
}: ContentGridProps) {
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="h-5 w-5" />;
      case 'assignment': return <FileText className="h-5 w-5" />;
      case 'quiz': return <Target className="h-5 w-5" />;
      case 'resource': return <Archive className="h-5 w-5" />;
      case 'project': return <Users className="h-5 w-5" />;
      case 'assessment': return <Star className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'intermediate':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="flex space-x-2 mb-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No content found</h3>
        <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.map((item) => (
        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow duration-200">
          {/* Content Header */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                  {getContentTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={item.title}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {item.subject}
                  </p>
                </div>
              </div>
              <div className="relative flex-shrink-0">
                <button 
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setExpandedTitle(expandedTitle === item.id ? null : item.id)}
                  title="Show full title"
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
                
                {/* Full Title Dropdown */}
                {expandedTitle === item.id && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setExpandedTitle(null)}
                    />
                    {/* Dropdown */}
                    <div className="absolute right-0 top-8 z-20 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
                      <div className="flex items-start space-x-2">
                        <div className="p-1 bg-blue-50 dark:bg-blue-900/20 rounded flex-shrink-0">
                          {getContentTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.subject}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {item.description}
            </p>

            {/* Tags and Status */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(item.difficulty)}`}>
                {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
              </span>
              {item.gradeLevel.slice(0, 2).map((grade) => (
                <span key={grade} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                  {grade}
                </span>
              ))}
              {item.gradeLevel.length > 2 && (
                <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full">
                  +{item.gradeLevel.length - 2} more
                </span>
              )}
            </div>

            {/* Content Info */}
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{item.viewCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>{item.favoriteCount}</span>
              </div>
              {item.duration && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{item.duration}min</span>
                </div>
              )}
              {item.fileSize && (
                <div className="flex items-center space-x-1">
                  <Download className="h-3 w-3" />
                  <span>{formatFileSize(item.fileSize)}</span>
                </div>
              )}
            </div>

            {/* Author and Date */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {item.author.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span>{item.author.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(item.updatedAt)}</span>
              </div>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded">
                    #{tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded">
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {item.isShared && (
                  <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                    <Share2 className="h-3 w-3" />
                    <span>Shared</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onViewContent(item)}
                  className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title="View content"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEditContent(item)}
                  className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title="Edit content"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onToggleStatus(item.id, item.status === 'published' ? 'draft' : 'published')}
                  className={`p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors ${
                    item.status === 'published' 
                      ? 'text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400'
                      : 'text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400'
                  }`}
                  title={item.status === 'published' ? 'Unpublish' : 'Publish'}
                >
                  {item.status === 'published' ? <Archive className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => onDeleteContent(item.id)}
                  className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title="Delete content"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}