import { useState, useEffect, useCallback } from 'react';
import { ContentItem, ContentFormData, ContentSearchParams, ContentFilters, ContentStats } from '../types/content';

// Mock data for development
const MOCK_CONTENT: ContentItem[] = [
  {
    id: '1',
    title: '7th Grade Science: Photosynthesis',
    description: 'Complete lesson on photosynthesis including interactive diagrams, lab experiments, and assessment materials.',
    type: 'lesson',
    status: 'published',
    visibility: 'school',
    subject: 'Science',
    gradeLevel: ['7th Grade'],
    tags: ['biology', 'plants', 'energy', 'interactive'],
    author: {
      id: 'teacher1',
      name: 'Ms. Brenda Sea',
      email: 'brenda.sea@oceanview.plainviewisd.edu'
    },
    thumbnail: 'https://images.pexels.com/photos/1214161/pexels-photo-1214161.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
    fileUrl: '/content/photosynthesis-lesson.pdf',
    fileSize: 2500000, // 2.5MB
    duration: 45,
    difficulty: 'intermediate',
    objectives: [
      'Understand the process of photosynthesis',
      'Identify the reactants and products',
      'Explain the importance of photosynthesis in ecosystems'
    ],
    prerequisites: ['Basic plant biology', 'Chemical reactions'],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    publishedAt: '2024-01-20T14:30:00Z',
    viewCount: 145,
    favoriteCount: 23,
    isShared: true
  },
  {
    id: '2',
    title: 'Math Problem Set: Algebra Basics',
    description: 'Comprehensive assignment covering linear equations, variables, and problem-solving strategies.',
    type: 'assignment',
    status: 'published',
    visibility: 'grade',
    subject: 'Mathematics',
    gradeLevel: ['8th Grade', '9th Grade'],
    tags: ['algebra', 'equations', 'homework'],
    author: {
      id: 'teacher2',
      name: 'Mr. David Johnson',
      email: 'david.johnson@oceanview.plainviewisd.edu'
    },
    fileUrl: '/content/algebra-basics-assignment.pdf',
    fileSize: 1200000, // 1.2MB
    difficulty: 'beginner',
    objectives: [
      'Solve basic linear equations',
      'Identify variables and constants',
      'Apply algebraic thinking to word problems'
    ],
    prerequisites: ['Basic arithmetic', 'Order of operations'],
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    publishedAt: '2024-01-18T16:45:00Z',
    viewCount: 89,
    favoriteCount: 12,
    isShared: false
  },
  {
    id: '3',
    title: 'Creative Writing Workshop',
    description: 'Interactive project for developing narrative writing skills through collaborative storytelling.',
    type: 'project',
    status: 'draft',
    visibility: 'private',
    subject: 'English Language Arts',
    gradeLevel: ['7th Grade', '8th Grade'],
    tags: ['writing', 'creativity', 'collaboration', 'storytelling'],
    author: {
      id: 'teacher3',
      name: 'Ms. Sarah Wilson',
      email: 'sarah.wilson@oceanview.plainviewisd.edu'
    },
    duration: 120,
    difficulty: 'intermediate',
    objectives: [
      'Develop narrative writing skills',
      'Practice collaborative writing techniques',
      'Understand story structure and character development'
    ],
    prerequisites: ['Basic writing skills', 'Reading comprehension'],
    createdAt: '2024-01-22T08:30:00Z',
    updatedAt: '2024-01-25T12:15:00Z',
    viewCount: 34,
    favoriteCount: 5,
    isShared: false
  },
  {
    id: '4',
    title: 'Geography Quiz: World Capitals',
    description: 'Interactive quiz testing knowledge of world capitals with immediate feedback and scoring.',
    type: 'quiz',
    status: 'published',
    visibility: 'public',
    subject: 'Social Studies',
    gradeLevel: ['6th Grade', '7th Grade', '8th Grade'],
    tags: ['geography', 'capitals', 'world', 'assessment'],
    author: {
      id: 'teacher4',
      name: 'Mr. Robert Martinez',
      email: 'robert.martinez@oceanview.plainviewisd.edu'
    },
    duration: 20,
    difficulty: 'beginner',
    objectives: [
      'Identify world capitals',
      'Improve geographical knowledge',
      'Practice quick recall skills'
    ],
    prerequisites: ['Basic world geography'],
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-15T10:20:00Z',
    publishedAt: '2024-01-15T10:20:00Z',
    viewCount: 267,
    favoriteCount: 45,
    isShared: true
  },
  {
    id: '5',
    title: 'Physics Lab: Motion and Forces',
    description: 'Hands-on laboratory experiments exploring Newton\'s laws of motion with data collection sheets.',
    type: 'resource',
    status: 'review',
    visibility: 'school',
    subject: 'Science',
    gradeLevel: ['9th Grade', '10th Grade'],
    tags: ['physics', 'lab', 'motion', 'forces', 'newton'],
    author: {
      id: 'teacher5',
      name: 'Dr. Emily Chen',
      email: 'emily.chen@oceanview.plainviewisd.edu'
    },
    fileUrl: '/content/physics-motion-lab.pdf',
    fileSize: 3200000, // 3.2MB
    duration: 90,
    difficulty: 'advanced',
    objectives: [
      'Understand Newton\'s laws of motion',
      'Collect and analyze experimental data',
      'Apply physics concepts to real-world scenarios'
    ],
    prerequisites: ['Basic physics concepts', 'Mathematical calculations'],
    createdAt: '2024-01-12T13:45:00Z',
    updatedAt: '2024-01-24T09:30:00Z',
    viewCount: 78,
    favoriteCount: 18,
    isShared: false
  },
  {
    id: '6',
    title: 'Mid-Term Assessment: Literature Analysis',
    description: 'Comprehensive assessment covering literary devices, character analysis, and thematic interpretation.',
    type: 'assessment',
    status: 'archived',
    visibility: 'grade',
    subject: 'English Language Arts',
    gradeLevel: ['8th Grade'],
    tags: ['literature', 'assessment', 'analysis', 'exam'],
    author: {
      id: 'teacher6',
      name: 'Ms. Lisa Thompson',
      email: 'lisa.thompson@oceanview.plainviewisd.edu'
    },
    duration: 60,
    difficulty: 'intermediate',
    objectives: [
      'Analyze literary devices and techniques',
      'Demonstrate understanding of character development',
      'Interpret themes and symbolism'
    ],
    prerequisites: ['Reading assigned texts', 'Literary terms knowledge'],
    createdAt: '2023-12-15T16:00:00Z',
    updatedAt: '2024-01-05T11:15:00Z',
    publishedAt: '2023-12-20T09:00:00Z',
    viewCount: 156,
    favoriteCount: 28,
    isShared: false
  }
];

interface UseContentManagementResult {
  content: ContentItem[];
  searchParams: ContentSearchParams;
  totalContent: number;
  totalPages: number;
  stats: ContentStats;
  loading: boolean;
  error: string | null;
  setSearchParams: (params: ContentSearchParams) => void;
  createContent: (contentData: ContentFormData) => Promise<ContentItem>;
  updateContent: (contentId: string, contentData: Partial<ContentFormData>) => Promise<ContentItem>;
  deleteContent: (contentId: string) => Promise<void>;
  toggleContentStatus: (contentId: string, newStatus: 'published' | 'draft' | 'archived') => Promise<void>;
  searchContent: (query: string) => void;
  applyFilters: (filters: ContentFilters) => void;
  clearFilters: () => void;
}

export function useContentManagement(): UseContentManagementResult {
  const [allContent, setAllContent] = useState<ContentItem[]>(MOCK_CONTENT);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>(MOCK_CONTENT);
  const [searchParams, setSearchParamsState] = useState<ContentSearchParams>({
    query: '',
    filters: {},
    page: 1,
    limit: 12,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort content based on search parameters
  const filterAndSortContent = useCallback((content: ContentItem[], params: ContentSearchParams) => {
    let filtered = [...content];

    // Apply text search
    if (params.query) {
      const query = params.query.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.author.name.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        item.gradeLevel.some(grade => grade.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (params.filters) {
      const { type, status, subject, gradeLevel, difficulty, author } = params.filters;
      
      if (type) {
        filtered = filtered.filter(item => item.type === type);
      }
      
      if (status) {
        filtered = filtered.filter(item => item.status === status);
      }
      
      if (subject) {
        filtered = filtered.filter(item => item.subject === subject);
      }
      
      if (gradeLevel) {
        filtered = filtered.filter(item => item.gradeLevel.includes(gradeLevel));
      }
      
      if (difficulty) {
        filtered = filtered.filter(item => item.difficulty === difficulty);
      }
      
      if (author) {
        filtered = filtered.filter(item => 
          item.author.name.toLowerCase().includes(author.toLowerCase())
        );
      }
    }

    // Apply sorting
    if (params.sortBy) {
      filtered.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (params.sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'updatedAt':
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
            break;
          case 'viewCount':
            aValue = a.viewCount;
            bValue = b.viewCount;
            break;
          case 'favoriteCount':
            aValue = a.favoriteCount;
            bValue = b.favoriteCount;
            break;
          default:
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
        }

        if (aValue < bValue) return params.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return params.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, []);

  // Update filtered content when search parameters or all content change
  useEffect(() => {
    const filtered = filterAndSortContent(allContent, searchParams);
    setFilteredContent(filtered);
  }, [allContent, searchParams, filterAndSortContent]);

  // Paginate filtered content
  const paginatedContent = filteredContent.slice(
    ((searchParams.page || 1) - 1) * (searchParams.limit || 12),
    (searchParams.page || 1) * (searchParams.limit || 12)
  );

  const totalPages = Math.ceil(filteredContent.length / (searchParams.limit || 12));

  // Calculate stats
  const stats: ContentStats = {
    totalContent: allContent.length,
    publishedContent: allContent.filter(item => item.status === 'published').length,
    draftContent: allContent.filter(item => item.status === 'draft').length,
    archivedContent: allContent.filter(item => item.status === 'archived').length,
    sharedContent: allContent.filter(item => item.isShared).length,
    totalViews: allContent.reduce((sum, item) => sum + item.viewCount, 0),
    totalDownloads: allContent.filter(item => item.fileUrl).length,
    averageRating: 4.2 // Mock average rating
  };

  const setSearchParams = useCallback((params: ContentSearchParams) => {
    setSearchParamsState(params);
  }, []);

  const createContent = useCallback(async (contentData: ContentFormData): Promise<ContentItem> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newContent: ContentItem = {
        id: Date.now().toString(),
        ...contentData,
        status: 'draft',
        author: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@oceanview.plainviewisd.edu'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 0,
        favoriteCount: 0,
        isShared: false
      };

      setAllContent(prev => [newContent, ...prev]);
      return newContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create content';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContent = useCallback(async (contentId: string, contentData: Partial<ContentFormData>): Promise<ContentItem> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const existingContent = allContent.find(item => item.id === contentId);
      if (!existingContent) {
        throw new Error('Content not found');
      }

      const updatedContent: ContentItem = {
        ...existingContent,
        ...contentData,
        updatedAt: new Date().toISOString()
      };

      setAllContent(prev => prev.map(item => item.id === contentId ? updatedContent : item));
      return updatedContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update content';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [allContent]);

  const deleteContent = useCallback(async (contentId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAllContent(prev => prev.filter(item => item.id !== contentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete content';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleContentStatus = useCallback(async (contentId: string, newStatus: 'published' | 'draft' | 'archived'): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setAllContent(prev => prev.map(item => 
        item.id === contentId 
          ? { 
              ...item, 
              status: newStatus, 
              updatedAt: new Date().toISOString(),
              publishedAt: newStatus === 'published' ? new Date().toISOString() : item.publishedAt
            }
          : item
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update content status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchContent = useCallback((query: string) => {
    setSearchParams({
      ...searchParams,
      query,
      page: 1 // Reset to first page when searching
    });
  }, [searchParams, setSearchParams]);

  const applyFilters = useCallback((filters: ContentFilters) => {
    setSearchParams({
      ...searchParams,
      filters,
      page: 1 // Reset to first page when filtering
    });
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams({
      ...searchParams,
      query: '',
      filters: {},
      page: 1
    });
  }, [searchParams, setSearchParams]);

  return {
    content: paginatedContent,
    searchParams,
    totalContent: filteredContent.length,
    totalPages,
    stats,
    loading,
    error,
    setSearchParams,
    createContent,
    updateContent,
    deleteContent,
    toggleContentStatus,
    searchContent,
    applyFilters,
    clearFilters
  };
}