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
import '../../../design-system/tokens/colors.css';
import '../../../design-system/tokens/spacing.css';
import '../../../design-system/tokens/borders.css';
import '../../../design-system/tokens/typography.css';
import '../../../design-system/tokens/shadows.css';
import '../../../design-system/tokens/dashboard.css';

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
          <div
            key={index}
            className="animate-pulse"
            style={{
              background: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--border-radius-lg)',
              boxShadow: 'var(--dashboard-shadow-card)',
              padding: 'var(--spacing-6)'
            }}
          >
            <div
              className="mb-4"
              style={{
                height: '16px',
                background: 'var(--dashboard-bg-secondary)',
                borderRadius: 'var(--border-radius-md)',
                width: '75%'
              }}
            ></div>
            <div
              className="mb-2"
              style={{
                height: '12px',
                background: 'var(--dashboard-bg-secondary)',
                borderRadius: 'var(--border-radius-md)',
                width: '100%'
              }}
            ></div>
            <div
              className="mb-4"
              style={{
                height: '12px',
                background: 'var(--dashboard-bg-secondary)',
                borderRadius: 'var(--border-radius-md)',
                width: '66.67%'
              }}
            ></div>
            <div className="flex space-x-2 mb-4">
              <div
                style={{
                  height: '24px',
                  background: 'var(--dashboard-bg-secondary)',
                  borderRadius: 'var(--border-radius-full)',
                  width: '64px'
                }}
              ></div>
              <div
                style={{
                  height: '24px',
                  background: 'var(--dashboard-bg-secondary)',
                  borderRadius: 'var(--border-radius-full)',
                  width: '80px'
                }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <div
                style={{
                  height: '16px',
                  background: 'var(--dashboard-bg-secondary)',
                  borderRadius: 'var(--border-radius-md)',
                  width: '96px'
                }}
              ></div>
              <div className="flex space-x-2">
                <div
                  style={{
                    height: '32px',
                    width: '32px',
                    background: 'var(--dashboard-bg-secondary)',
                    borderRadius: 'var(--border-radius-md)'
                  }}
                ></div>
                <div
                  style={{
                    height: '32px',
                    width: '32px',
                    background: 'var(--dashboard-bg-secondary)',
                    borderRadius: 'var(--border-radius-md)'
                  }}
                ></div>
                <div
                  style={{
                    height: '32px',
                    width: '32px',
                    background: 'var(--dashboard-bg-secondary)',
                    borderRadius: 'var(--border-radius-md)'
                  }}
                ></div>
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
        <BookOpen
          className="h-16 w-16 mx-auto mb-4"
          style={{ color: 'var(--dashboard-text-tertiary)' }}
        />
        <h3
          className="mb-2"
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--dashboard-text-primary)'
          }}
        >
          No content found
        </h3>
        <p style={{ color: 'var(--dashboard-text-secondary)' }}>
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.map((item) => {
        const [isHovered, setIsHovered] = useState(false);
        const [isMoreButtonHovered, setIsMoreButtonHovered] = useState(false);

        return (
          <div
            key={item.id}
            style={{
              background: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--border-radius-xl)',
              boxShadow: isHovered ? 'var(--shadow-lg)' : 'var(--shadow-md)',
              transition: 'box-shadow 200ms'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Content Header */}
            <div style={{ padding: 'var(--spacing-6)' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div
                    className="flex-shrink-0"
                    style={{
                      padding: 'var(--spacing-2)',
                      background: 'var(--dashboard-bg-secondary)',
                      borderRadius: 'var(--border-radius-lg)'
                    }}
                  >
                    {getContentTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="truncate"
                      style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--dashboard-text-primary)'
                      }}
                      title={item.title}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="truncate"
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--dashboard-text-secondary)'
                      }}
                    >
                      {item.subject}
                    </p>
                  </div>
                </div>
                <div className="relative flex-shrink-0">
                  <button
                    style={{
                      padding: 'var(--spacing-1)',
                      borderRadius: 'var(--border-radius-lg)',
                      background: isMoreButtonHovered ? 'var(--dashboard-bg-hover)' : 'transparent',
                      transition: 'background 150ms',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onClick={() => setExpandedTitle(expandedTitle === item.id ? null : item.id)}
                    onMouseEnter={() => setIsMoreButtonHovered(true)}
                    onMouseLeave={() => setIsMoreButtonHovered(false)}
                    title="Show full title"
                  >
                    <MoreVertical
                      className="h-4 w-4"
                      style={{ color: 'var(--dashboard-text-tertiary)' }}
                    />
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
                      <div
                        className="absolute right-0 top-8 z-20 w-80 max-w-sm"
                        style={{
                          background: 'var(--dashboard-bg-elevated)',
                          borderRadius: 'var(--border-radius-lg)',
                          boxShadow: 'var(--shadow-lg)',
                          border: '1px solid var(--dashboard-border-primary)',
                          padding: 'var(--spacing-3)'
                        }}
                      >
                        <div className="flex items-start space-x-2">
                          <div
                            className="flex-shrink-0"
                            style={{
                              padding: 'var(--spacing-1)',
                              background: 'var(--dashboard-bg-secondary)',
                              borderRadius: 'var(--border-radius-md)'
                            }}
                          >
                            {getContentTypeIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              style={{
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-semibold)',
                                color: 'var(--dashboard-text-primary)',
                                wordBreak: 'break-word'
                              }}
                            >
                              {item.title}
                            </h4>
                            <p
                              className="mt-1"
                              style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--dashboard-text-secondary)'
                              }}
                            >
                              {item.subject}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <p
                className="mb-4 line-clamp-2"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--dashboard-text-secondary)'
                }}
              >
                {item.description}
              </p>

              {/* Status, Difficulty, and Grade Levels */}
              <div className="flex flex-wrap gap-2" style={{ marginBottom: 'var(--space-4)' }}>
                <span
                  className="inline-flex"
                  style={{
                    padding: 'var(--space-1) var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: item.status === 'published' ? '#d1fae5' : '#f3f4f6',
                    color: item.status === 'published' ? '#065f46' : '#4b5563'
                  }}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
                <span
                  className="inline-flex"
                  style={{
                    padding: 'var(--space-1) var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor:
                      item.difficulty === 'beginner' ? '#dbeafe' :
                      item.difficulty === 'intermediate' ? '#fed7aa' :
                      '#fee2e2',
                    color:
                      item.difficulty === 'beginner' ? '#1e40af' :
                      item.difficulty === 'intermediate' ? '#9a3412' :
                      '#991b1b'
                  }}
                >
                  {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                </span>
                {item.gradeLevel.length > 0 && (
                  <span
                    className="inline-flex"
                    style={{
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-semibold)',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: '#f3e8ff',
                      color: '#6b21a8'
                    }}
                  >
                    {item.gradeLevel[0]}
                  </span>
                )}
                {item.gradeLevel.length > 1 && (
                  <span
                    className="inline-flex"
                    style={{
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-semibold)',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: '#f3e8ff',
                      color: '#6b21a8'
                    }}
                  >
                    +{item.gradeLevel.length - 1} more
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-3)',
                  paddingBottom: 'var(--space-4)',
                  marginBottom: 'var(--space-4)',
                  borderBottom: '1px solid var(--dashboard-border-primary)'
                }}
              >
                <div className="flex items-center space-x-1">
                  <Eye
                    className="h-3 w-3"
                    style={{ color: 'var(--dashboard-text-tertiary)' }}
                  />
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--dashboard-text-tertiary)'
                    }}
                  >
                    {item.viewCount} views
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star
                    className="h-3 w-3"
                    style={{ color: 'var(--dashboard-text-tertiary)' }}
                  />
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--dashboard-text-tertiary)'
                    }}
                  >
                    {item.favoriteCount} favorites
                  </span>
                </div>
                {item.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock
                      className="h-3 w-3"
                      style={{ color: 'var(--dashboard-text-tertiary)' }}
                    />
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--dashboard-text-tertiary)'
                      }}
                    >
                      {item.duration} min
                    </span>
                  </div>
                )}
                {item.fileSize && (
                  <div className="flex items-center space-x-1">
                    <Download
                      className="h-3 w-3"
                      style={{ color: 'var(--dashboard-text-tertiary)' }}
                    />
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--dashboard-text-tertiary)'
                      }}
                    >
                      {formatFileSize(item.fileSize)}
                    </span>
                  </div>
                )}
              </div>

              {/* Author and Date */}
              <div
                className="flex items-center justify-between"
                style={{
                  marginBottom: 'var(--space-4)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--dashboard-text-tertiary)'
                }}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '24px',
                      height: '24px',
                      background: 'var(--dashboard-bg-secondary)',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-weight-medium)'
                      }}
                    >
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
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex"
                      style={{
                        padding: 'var(--space-1) var(--space-2)',
                        fontSize: 'var(--text-xs)',
                        background: 'var(--dashboard-bg-secondary)',
                        color: 'var(--dashboard-text-secondary)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span
                      className="inline-flex"
                      style={{
                        padding: 'var(--space-1) var(--space-2)',
                        fontSize: 'var(--text-xs)',
                        background: 'var(--dashboard-bg-secondary)',
                        color: 'var(--dashboard-text-secondary)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                padding: 'var(--spacing-3) var(--spacing-6)',
                background: 'var(--dashboard-bg-secondary)',
                borderBottomLeftRadius: 'var(--border-radius-xl)',
                borderBottomRightRadius: 'var(--border-radius-xl)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {item.isShared && (
                    <div
                      className="flex items-center space-x-1"
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-success-600)'
                      }}
                    >
                      <Share2 className="h-3 w-3" />
                      <span>Shared</span>
                    </div>
                  )}
                </div>

                <ActionButtons
                  item={item}
                  onViewContent={onViewContent}
                  onEditContent={onEditContent}
                  onToggleStatus={onToggleStatus}
                  onDeleteContent={onDeleteContent}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Action Buttons Component with hover states
function ActionButtons({
  item,
  onViewContent,
  onEditContent,
  onToggleStatus,
  onDeleteContent
}: {
  item: ContentItem;
  onViewContent: (item: ContentItem) => void;
  onEditContent: (item: ContentItem) => void;
  onToggleStatus: (id: string, status: 'published' | 'draft' | 'archived') => void;
  onDeleteContent: (id: string) => void;
}) {
  const [viewHovered, setViewHovered] = useState(false);
  const [editHovered, setEditHovered] = useState(false);
  const [toggleHovered, setToggleHovered] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => onViewContent(item)}
        onMouseEnter={() => setViewHovered(true)}
        onMouseLeave={() => setViewHovered(false)}
        style={{
          padding: 'var(--spacing-2)',
          color: viewHovered ? 'var(--color-primary-600)' : 'var(--dashboard-text-secondary)',
          background: viewHovered ? 'var(--dashboard-bg-elevated)' : 'transparent',
          borderRadius: 'var(--border-radius-lg)',
          transition: 'all 150ms',
          border: 'none',
          cursor: 'pointer'
        }}
        title="View content"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => onEditContent(item)}
        onMouseEnter={() => setEditHovered(true)}
        onMouseLeave={() => setEditHovered(false)}
        style={{
          padding: 'var(--spacing-2)',
          color: editHovered ? 'var(--color-primary-600)' : 'var(--dashboard-text-secondary)',
          background: editHovered ? 'var(--dashboard-bg-elevated)' : 'transparent',
          borderRadius: 'var(--border-radius-lg)',
          transition: 'all 150ms',
          border: 'none',
          cursor: 'pointer'
        }}
        title="Edit content"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => onToggleStatus(item.id, item.status === 'published' ? 'draft' : 'published')}
        onMouseEnter={() => setToggleHovered(true)}
        onMouseLeave={() => setToggleHovered(false)}
        style={{
          padding: 'var(--spacing-2)',
          color: toggleHovered
            ? item.status === 'published'
              ? 'var(--color-warning-600)'
              : 'var(--color-success-600)'
            : 'var(--dashboard-text-secondary)',
          background: toggleHovered ? 'var(--dashboard-bg-elevated)' : 'transparent',
          borderRadius: 'var(--border-radius-lg)',
          transition: 'all 150ms',
          border: 'none',
          cursor: 'pointer'
        }}
        title={item.status === 'published' ? 'Unpublish' : 'Publish'}
      >
        {item.status === 'published' ? <Archive className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <button
        onClick={() => onDeleteContent(item.id)}
        onMouseEnter={() => setDeleteHovered(true)}
        onMouseLeave={() => setDeleteHovered(false)}
        style={{
          padding: 'var(--spacing-2)',
          color: deleteHovered ? 'var(--color-error-600)' : 'var(--dashboard-text-secondary)',
          background: deleteHovered ? 'var(--dashboard-bg-elevated)' : 'transparent',
          borderRadius: 'var(--border-radius-lg)',
          transition: 'all 150ms',
          border: 'none',
          cursor: 'pointer'
        }}
        title="Delete content"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}