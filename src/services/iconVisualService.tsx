/**
 * Icon Visual Service
 * 
 * Uses React Icons to generate professional-looking counting visuals
 * for educational content. Much better quality than GPT-generated SVGs
 * and completely free/open-source.
 */

import React from 'react';
import { 
  // Sports icons for Athlete
  FaBasketballBall,
  FaFootballBall,
  FaBaseballBall,
  FaTableTennis,
  FaVolleyballBall,
  FaRunning,
  FaTrophy,
  FaMedal,
  FaDumbbell,
  
  // Medical icons for Doctor
  FaStethoscope,
  FaThermometerHalf,
  FaBandAid,
  FaPills,
  FaSyringe,
  FaHeartbeat,
  FaHospital,
  FaAmbulance,
  FaNotesMedical,
  
  // Education icons for Teacher  
  FaBook,
  FaPencilAlt,
  FaAppleAlt,
  FaRuler,
  FaGlobe,
  FaCalculator,
  FaChalkboard,
  FaGraduationCap,
  FaSchool,
  
  // Culinary icons for Chef
  FaUtensils,
  FaHamburger,
  FaPizzaSlice,
  FaCookie,
  FaIceCream,
  FaCarrot,
  FaEgg,
  FaBreadSlice,
  FaCheese
} from 'react-icons/fa';

import {
  // Additional sports icons
  BiWater, // for water bottle
  BiTennisBall,
  BiFootball,
  
  // Additional medical icons
  BiClinic,
  BiFirstAid,
  BiHealth,
  
  // Additional education icons
  BiBookOpen,
  BiPencil,
  BiEraser,
  
  // Additional chef icons
  BiDish,
  BiCoffeeTogo,
  BiRestaurant
} from 'react-icons/bi';

import {
  // More specific icons
  GiWaterBottle,
  GiSoccerBall,
  GiBasketballJersey,
  GiRunningShoe,
  GiWhistle,
  
  // Medical specific
  GiMedicines,
  GiMedicalPack,
  GiHealthNormal,
  
  // Chef specific  
  GiChefToque,
  GiCookingPot,
  GiKnifeFork,
  GiCupcake,
  
  // Teacher specific
  GiNotebook,
  GiBookshelf,
  GiTeacher
} from 'react-icons/gi';

import {
  MdSportsSoccer,
  MdSportsBasketball,
  MdSportsTennis,
  MdSportsFootball,
  MdSportsBaseball,
  MdPool,
  MdDirectionsRun
} from 'react-icons/md';

interface CareerIconConfig {
  items: Record<string, {
    icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
    label: string;
    defaultColor: string;
  }>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

class IconVisualService {
  private static instance: IconVisualService;
  
  // Career-specific icon configurations
  private careerConfigs: Record<string, CareerIconConfig> = {
    'Athlete': {
      items: {
        'basketball': { icon: MdSportsBasketball, label: 'basketball', defaultColor: '#FF6B35' },
        'soccer_ball': { icon: MdSportsSoccer, label: 'soccer ball', defaultColor: '#10B981' },
        'tennis_ball': { icon: MdSportsTennis, label: 'tennis ball', defaultColor: '#CCFF00' },
        'football': { icon: MdSportsFootball, label: 'football', defaultColor: '#8B4513' },
        'baseball': { icon: MdSportsBaseball, label: 'baseball', defaultColor: '#FFFFFF' },
        'water_bottle': { icon: GiWaterBottle, label: 'water bottle', defaultColor: '#3B82F6' },
        'trophy': { icon: FaTrophy, label: 'trophy', defaultColor: '#FFD700' },
        'medal': { icon: FaMedal, label: 'medal', defaultColor: '#FFD700' },
        'running_shoe': { icon: GiRunningShoe, label: 'running shoe', defaultColor: '#DC2626' },
        'whistle': { icon: GiWhistle, label: 'whistle', defaultColor: '#6B7280' }
      },
      theme: { primaryColor: '#FF6B35', secondaryColor: '#3B82F6' }
    },
    'Doctor': {
      items: {
        'stethoscope': { icon: FaStethoscope, label: 'stethoscope', defaultColor: '#6B7280' },
        'thermometer': { icon: FaThermometerHalf, label: 'thermometer', defaultColor: '#EF4444' },
        'bandage': { icon: FaBandAid, label: 'bandage', defaultColor: '#FEF3C7' },
        'medicine': { icon: FaPills, label: 'medicine', defaultColor: '#10B981' },
        'syringe': { icon: FaSyringe, label: 'syringe', defaultColor: '#6B7280' },
        'heart': { icon: FaHeartbeat, label: 'heart monitor', defaultColor: '#EF4444' },
        'hospital': { icon: FaHospital, label: 'hospital', defaultColor: '#3B82F6' },
        'ambulance': { icon: FaAmbulance, label: 'ambulance', defaultColor: '#EF4444' },
        'medical_kit': { icon: GiMedicalPack, label: 'medical kit', defaultColor: '#DC2626' },
        'clipboard': { icon: FaNotesMedical, label: 'medical chart', defaultColor: '#8B5CF6' }
      },
      theme: { primaryColor: '#3B82F6', secondaryColor: '#10B981' }
    },
    'Teacher': {
      items: {
        'book': { icon: FaBook, label: 'book', defaultColor: '#8B5CF6' },
        'pencil': { icon: FaPencilAlt, label: 'pencil', defaultColor: '#FCD34D' },
        'apple': { icon: FaAppleAlt, label: 'apple', defaultColor: '#EF4444' },
        'ruler': { icon: FaRuler, label: 'ruler', defaultColor: '#92400E' },
        'globe': { icon: FaGlobe, label: 'globe', defaultColor: '#3B82F6' },
        'calculator': { icon: FaCalculator, label: 'calculator', defaultColor: '#6B7280' },
        'chalkboard': { icon: FaChalkboard, label: 'chalkboard', defaultColor: '#10B981' },
        'notebook': { icon: GiNotebook, label: 'notebook', defaultColor: '#EC4899' },
        'eraser': { icon: BiEraser, label: 'eraser', defaultColor: '#F472B6' },
        'school': { icon: FaSchool, label: 'school', defaultColor: '#DC2626' }
      },
      theme: { primaryColor: '#8B5CF6', secondaryColor: '#FCD34D' }
    },
    'Chef': {
      items: {
        'utensils': { icon: FaUtensils, label: 'utensils', defaultColor: '#6B7280' },
        'hamburger': { icon: FaHamburger, label: 'hamburger', defaultColor: '#F59E0B' },
        'pizza': { icon: FaPizzaSlice, label: 'pizza slice', defaultColor: '#EF4444' },
        'cookie': { icon: FaCookie, label: 'cookie', defaultColor: '#92400E' },
        'cupcake': { icon: GiCupcake, label: 'cupcake', defaultColor: '#EC4899' },
        'carrot': { icon: FaCarrot, label: 'carrot', defaultColor: '#FB923C' },
        'egg': { icon: FaEgg, label: 'egg', defaultColor: '#FEF3C7' },
        'pot': { icon: GiCookingPot, label: 'cooking pot', defaultColor: '#9CA3AF' },
        'chef_hat': { icon: GiChefToque, label: 'chef hat', defaultColor: '#FFFFFF' },
        'plate': { icon: BiDish, label: 'plate', defaultColor: '#E5E7EB' }
      },
      theme: { primaryColor: '#EC4899', secondaryColor: '#FB923C' }
    }
  };

  private constructor() {}

  static getInstance(): IconVisualService {
    if (!IconVisualService.instance) {
      IconVisualService.instance = new IconVisualService();
    }
    return IconVisualService.instance;
  }

  /**
   * Generate a counting visual using React Icons
   */
  generateCountingVisual(
    career: string,
    itemType: string,
    count: number,
    options?: {
      size?: number;
      spacing?: number;
      arrangement?: 'horizontal' | 'grid';
      theme?: 'light' | 'dark';
    }
  ): React.ReactElement {
    const size = options?.size || 60;
    const spacing = options?.spacing || 16;
    const arrangement = options?.arrangement || 'horizontal';
    const theme = options?.theme || 'light';
    
    // Get career configuration
    const careerConfig = this.careerConfigs[career] || this.careerConfigs['Teacher'];
    const itemConfig = careerConfig.items[itemType] || careerConfig.items[Object.keys(careerConfig.items)[0]];
    
    const IconComponent = itemConfig.icon;
    const color = theme === 'dark' ? itemConfig.defaultColor : itemConfig.defaultColor;
    
    // Calculate layout
    const itemsPerRow = arrangement === 'grid' ? 3 : count;
    const rows = Math.ceil(count / itemsPerRow);
    
    // Calculate dynamic padding based on item count
    // More items = more padding to keep visual balance
    const horizontalPadding = Math.max(40, 20 + (5 - count) * 20); // More padding for fewer items
    const verticalPadding = 30;
    
    return (
      <div 
        className={`counting-visual-container ${theme === 'dark' ? 'dark' : ''}`}
        style={{
          display: 'flex',
          flexDirection: arrangement === 'grid' ? 'column' : 'row',
          gap: `${spacing}px`,
          padding: `${verticalPadding}px ${horizontalPadding}px`,
          backgroundColor: theme === 'dark' ? '#1f2937' : '#fafafa',
          borderRadius: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '150px',
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto'
        }}
      >
        {arrangement === 'grid' ? (
          // Grid layout
          Array.from({ length: rows }, (_, rowIndex) => (
            <div 
              key={rowIndex}
              style={{
                display: 'flex',
                gap: `${spacing}px`,
                justifyContent: 'center'
              }}
            >
              {Array.from({ length: Math.min(itemsPerRow, count - rowIndex * itemsPerRow) }, (_, colIndex) => {
                const index = rowIndex * itemsPerRow + colIndex;
                return (
                  <div
                    key={index}
                    className="counting-item"
                    style={{
                      animation: `fadeInScale 0.3s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <IconComponent 
                      size={size} 
                      color={color}
                      className="counting-icon"
                    />
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          // Horizontal layout
          Array.from({ length: count }, (_, index) => (
            <div
              key={index}
              className="counting-item"
              style={{
                animation: `fadeInScale 0.3s ease-out ${index * 0.1}s both`
              }}
            >
              <IconComponent 
                size={size} 
                color={color}
                className="counting-icon"
              />
            </div>
          ))
        )}
      </div>
    );
  }

  /**
   * Get a random item type for a career
   */
  getRandomItemForCareer(career: string): string {
    const config = this.careerConfigs[career];
    if (!config) return 'book'; // Default fallback
    
    const items = Object.keys(config.items);
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Get appropriate items for counting based on career
   */
  getCountingItemsForCareer(career: string, maxCount: number = 10): string[] {
    const config = this.careerConfigs[career];
    if (!config) return ['book', 'pencil', 'apple']; // Default fallback
    
    // Return first few items that work well for counting
    const countingItems = Object.keys(config.items).slice(0, Math.min(5, maxCount));
    return countingItems;
  }

  /**
   * Get icon component directly
   */
  getIconForItem(career: string, itemType: string): React.ComponentType<any> | null {
    const config = this.careerConfigs[career];
    if (!config || !config.items[itemType]) return null;
    
    return config.items[itemType].icon;
  }

  /**
   * Get item label
   */
  getItemLabel(career: string, itemType: string): string {
    const config = this.careerConfigs[career];
    if (!config || !config.items[itemType]) return itemType;
    
    return config.items[itemType].label;
  }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .counting-visual-container {
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .counting-visual-container.dark {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
  
  .counting-item {
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .counting-item:hover {
    transform: scale(1.1);
  }
  
  .counting-icon {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    transition: all 0.2s ease;
  }
  
  .counting-icon:hover {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }
  
  .dark .counting-icon {
    filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1));
  }
  
  .dark .counting-icon:hover {
    filter: drop-shadow(0 4px 8px rgba(255, 255, 255, 0.2));
  }
`;
document.head.appendChild(style);

export const iconVisualService = IconVisualService.getInstance();