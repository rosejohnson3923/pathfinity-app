import { User, LearningProgress, Achievement, Activity, QuickAction } from '../types';
import { getCurrentUser, getSelectedTenant } from '../services/authService';

// Validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Safe user data with validation
export const mockUser: User = {
  id: getCurrentUser()?.id || '550e8400-e29b-41d4-a716-446655440000',
  name: getCurrentUser()?.full_name || 'Alex Johnson',
  role: getCurrentUser()?.role || 'student',
  avatar: getCurrentUser()?.avatar_url || 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
  tenant: getSelectedTenant()?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  grade_level: getCurrentUser()?.grade_level || null,
  subjects: getCurrentUser()?.subjects || null,
  school: getCurrentUser()?.school || null
};

// Validate mock user data
if (!isValidUUID(mockUser.id) || !isValidUUID(mockUser.tenant)) {
  console.warn('Invalid UUID format in mockUser data');
}

export const mockProgress: LearningProgress[] = [
  { 
    subject: 'Mathematics', 
    progress: Math.max(0, Math.min(100, 87)), 
    mastery: 'masters', 
    streak: Math.max(0, 12) 
  },
  { 
    subject: 'English Language Arts', 
    progress: Math.max(0, Math.min(100, 76)), 
    mastery: 'meets', 
    streak: Math.max(0, 8) 
  },
  { 
    subject: 'Science', 
    progress: Math.max(0, Math.min(100, 92)), 
    mastery: 'masters', 
    streak: Math.max(0, 15) 
  },
  { 
    subject: 'Social Studies', 
    progress: Math.max(0, Math.min(100, 68)), 
    mastery: 'approaches', 
    streak: Math.max(0, 5) 
  },
  { 
    subject: 'Spanish', 
    progress: Math.max(0, Math.min(100, 94)), 
    mastery: 'masters', 
    streak: Math.max(0, 18) 
  }
];

export const mockAchievements: Achievement[] = [
  { 
    id: '550e8400-e29b-41d4-a716-446655440001', 
    title: 'Math Master', 
    description: 'Completed 100 math problems', 
    icon: 'calculator', 
    earned: true, 
    earnedDate: '2024-01-15', 
    rarity: 'epic' 
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440002', 
    title: 'Team Player', 
    description: 'Collaborated on 5 projects', 
    icon: 'users', 
    earned: true, 
    earnedDate: '2024-01-10', 
    rarity: 'rare' 
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440003', 
    title: 'Creative Genius', 
    description: 'Created 10 presentations', 
    icon: 'palette', 
    earned: false, 
    rarity: 'legendary' 
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440004', 
    title: 'Streak Champion', 
    description: 'Maintained 14-day learning streak', 
    icon: 'flame', 
    earned: true, 
    earnedDate: '2024-01-12', 
    rarity: 'rare' 
  }
];

// Validate achievement IDs
mockAchievements.forEach(achievement => {
  if (!isValidUUID(achievement.id)) {
    console.warn(`Invalid UUID format in achievement: ${achievement.id}`);
  }
});

export const mockActivities: Activity[] = [
  { 
    id: '550e8400-e29b-41d4-a716-446655440005', 
    type: 'lesson', 
    title: 'Algebra Fundamentals', 
    description: 'Completed lesson on linear equations', 
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    completed: true 
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440006', 
    type: 'project', 
    title: 'Solar System Model', 
    description: 'Collaborative project with Sarah and Mike', 
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    completed: false 
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440007', 
    type: 'assessment', 
    title: 'Spanish Quiz Chapter 3', 
    description: 'Vocabulary and grammar assessment', 
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    completed: true 
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440008', 
    type: 'collaboration', 
    title: 'Study Group: Chemistry', 
    description: 'Group session on molecular structures', 
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago
    completed: true 
  }
];

// Validate activity IDs
mockActivities.forEach(activity => {
  if (!isValidUUID(activity.id)) {
    console.warn(`Invalid UUID format in activity: ${activity.id}`);
  }
  
  // Validate activity type
  const validTypes = ['lesson', 'project', 'assessment', 'collaboration'];
  if (!validTypes.includes(activity.type)) {
    console.warn(`Invalid activity type: ${activity.type}`);
  }
});

export const quickActions: QuickAction[] = [
  { 
    id: '550e8400-e29b-41d4-a716-446655440009', 
    title: 'Continue Learning', 
    description: 'Resume your current lesson', 
    icon: 'play', 
    color: 'bg-blue-500', 
    href: '/learn', 
    mode: 'learn' 
  },
  { 
    id: 'quick-action-experience-001', 
    title: 'Start Project', 
    description: 'Begin a new creative project', 
    icon: 'plus', 
    color: 'bg-purple-500', 
    href: '/experience', 
    mode: 'experience' 
  },
  { 
    id: 'quick-action-discover-001', 
    title: 'Take Assessment', 
    description: 'Discover your talents', 
    icon: 'brain', 
    color: 'bg-green-500', 
    href: '/discover', 
    mode: 'discover' 
  }
];

// Validate quick action IDs
quickActions.forEach(action => {
  if (!isValidUUID(action.id)) {
    console.warn(`Invalid UUID format in quick action: ${action.id}`);
  }
});

// Export validation function for external use
export { isValidUUID };