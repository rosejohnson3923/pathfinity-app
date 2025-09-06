export type ContentType = 'lesson' | 'assignment' | 'quiz' | 'resource' | 'project' | 'assessment';
export type ContentStatus = 'draft' | 'published' | 'archived' | 'review';
export type ContentVisibility = 'public' | 'private' | 'school' | 'grade';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  status: ContentStatus;
  visibility: ContentVisibility;
  subject: string;
  gradeLevel: string[];
  tags: string[];
  author: {
    id: string;
    name: string;
    email: string;
  };
  thumbnail?: string;
  fileUrl?: string;
  fileSize?: number;
  duration?: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[];
  prerequisites: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  viewCount: number;
  favoriteCount: number;
  isShared: boolean;
}

export interface ContentFormData {
  title: string;
  description: string;
  type: ContentType;
  subject: string;
  gradeLevel: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[];
  prerequisites: string[];
  visibility: ContentVisibility;
  file?: File;
}

export interface ContentFilters {
  type?: ContentType;
  status?: ContentStatus;
  subject?: string;
  gradeLevel?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  author?: string;
}

export interface ContentSearchParams {
  query?: string;
  filters?: ContentFilters;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'viewCount' | 'favoriteCount';
  sortOrder?: 'asc' | 'desc';
}

export interface ContentStats {
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  archivedContent: number;
  sharedContent: number;
  totalViews: number;
  totalDownloads: number;
  averageRating: number;
}

export const CONTENT_TYPE_OPTIONS = [
  { value: 'lesson' as ContentType, label: 'Lesson', description: 'Interactive learning content' },
  { value: 'assignment' as ContentType, label: 'Assignment', description: 'Student homework and tasks' },
  { value: 'quiz' as ContentType, label: 'Quiz', description: 'Assessment and evaluation' },
  { value: 'resource' as ContentType, label: 'Resource', description: 'Reference materials and tools' },
  { value: 'project' as ContentType, label: 'Project', description: 'Long-term collaborative work' },
  { value: 'assessment' as ContentType, label: 'Assessment', description: 'Formal evaluation tools' }
];

export const SUBJECT_OPTIONS = [
  'Mathematics', 'Science', 'English Language Arts', 'Social Studies', 'Art', 'Music', 
  'Physical Education', 'Computer Science', 'Foreign Language', 'Special Education',
  'History', 'Geography', 'Biology', 'Chemistry', 'Physics', 'Literature'
];

export const GRADE_LEVEL_OPTIONS = [
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'
];

export const DIFFICULTY_OPTIONS = [
  { value: 'beginner' as const, label: 'Beginner', description: 'Basic level content' },
  { value: 'intermediate' as const, label: 'Intermediate', description: 'Moderate complexity' },
  { value: 'advanced' as const, label: 'Advanced', description: 'Complex and challenging' }
];

export const VISIBILITY_OPTIONS = [
  { value: 'public' as ContentVisibility, label: 'Public', description: 'Visible to everyone' },
  { value: 'school' as ContentVisibility, label: 'School Only', description: 'Visible to school members' },
  { value: 'grade' as ContentVisibility, label: 'Grade Level', description: 'Visible to specific grades' },
  { value: 'private' as ContentVisibility, label: 'Private', description: 'Only visible to you' }
];