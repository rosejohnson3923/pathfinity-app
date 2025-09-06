// ================================================================
// CAREER, INC. LOBBY CONFIGURATIONS
// Grade-adaptive lobby designs for the EXPERIENCE Container
// ================================================================

export interface Department {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface LobbyConfig {
  styleClass: string;
  title: string;
  description: string;
  departments: Department[];
  cardStyle: 'large-icons' | 'detailed-descriptions' | 'professional-layout';
  navigation: 'simple-grid' | 'hover-details' | 'dashboard-style';
  finnTone: 'friendly-simple' | 'encouraging-guide' | 'executive-mentor';
}

export const lobbyConfigs: { [key: string]: LobbyConfig } = {
  'prek-5': {
    styleClass: 'lobby-elementary',
    title: 'Welcome to Career Town! 🏘️',
    description: 'Choose your helper job for today!',
    departments: [
      { id: 'school', name: 'School Helpers', icon: '🏫', color: '#4CAF50' },
      { id: 'safety', name: 'Safety Heroes', icon: '🚒', color: '#F44336' },
      { id: 'health', name: 'Health Helpers', icon: '🏥', color: '#2196F3' },
      { id: 'community', name: 'Community Workers', icon: '🏪', color: '#FF9800' },
      { id: 'creative', name: 'Creative Corner', icon: '🎨', color: '#9C27B0' }
    ],
    cardStyle: 'large-icons',
    navigation: 'simple-grid',
    finnTone: 'friendly-simple'
  },
  
  '6-8': {
    styleClass: 'lobby-middle',
    title: 'Career Exploration Hub 🚀',
    description: 'Discover your path through hands-on experience',
    departments: [
      { id: 'business', name: 'Business & Leadership', icon: '💼', color: '#1976D2' },
      { id: 'technology', name: 'Technology & Innovation', icon: '💻', color: '#388E3C' },
      { id: 'marketing', name: 'Marketing & Communications', icon: '🎯', color: '#F57C00' },
      { id: 'science', name: 'Science & Research', icon: '🔬', color: '#7B1FA2' },
      { id: 'government', name: 'Law & Government', icon: '⚖️', color: '#5D4037' }
    ],
    cardStyle: 'detailed-descriptions',
    navigation: 'hover-details',
    finnTone: 'encouraging-guide'
  },
  
  '9-12': {
    styleClass: 'lobby-high',
    title: 'Professional Development Center 🏢',
    description: 'Build expertise in your field of interest',
    departments: [
      { id: 'c-suite', name: 'Executive Leadership', icon: '👔', color: '#263238' },
      { id: 'operations', name: 'Operations & Management', icon: '⚙️', color: '#37474F' },
      { id: 'technology', name: 'Technology & Engineering', icon: '🖥️', color: '#455A64' },
      { id: 'finance', name: 'Finance & Strategy', icon: '📊', color: '#546E7A' },
      { id: 'marketing', name: 'Marketing & Business Dev', icon: '📈', color: '#607D8B' }
    ],
    cardStyle: 'professional-layout',
    navigation: 'dashboard-style',
    finnTone: 'executive-mentor'
  }
};

// Helper function to get lobby config by grade
export const getLobbyConfigByGrade = (gradeLevel: string): LobbyConfig => {
  const grade = parseInt(gradeLevel);
  
  if (gradeLevel.toLowerCase() === 'k' || gradeLevel.toLowerCase() === 'kindergarten' || grade <= 5) {
    return lobbyConfigs['prek-5'];
  } else if (grade >= 6 && grade <= 8) {
    return lobbyConfigs['6-8'];
  } else {
    return lobbyConfigs['9-12'];
  }
};

// Helper function to get grade range key
export const getGradeRangeKey = (gradeLevel: string): string => {
  const grade = parseInt(gradeLevel);
  
  if (gradeLevel.toLowerCase() === 'k' || gradeLevel.toLowerCase() === 'kindergarten' || grade <= 5) {
    return 'prek-5';
  } else if (grade >= 6 && grade <= 8) {
    return '6-8';
  } else {
    return '9-12';
  }
};