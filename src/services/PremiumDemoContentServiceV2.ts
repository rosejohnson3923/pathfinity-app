/**
 * Premium Demo Content Service V2
 * Manages premium demo content for the application
 */

export interface DemoContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'interactive' | 'assessment';
  subject: string;
  grade: string;
  isPremium: boolean;
  duration?: number;
  thumbnailUrl?: string;
}

class PremiumDemoContentServiceV2 {
  private demoContent: DemoContent[] = [
    {
      id: 'demo-1',
      title: 'Counting to 3 - Interactive',
      description: 'Learn to count with visual aids',
      type: 'interactive',
      subject: 'Math',
      grade: 'Kindergarten',
      isPremium: false,
      duration: 5
    },
    {
      id: 'demo-2',
      title: 'Advanced Counting to 10',
      description: 'Premium counting exercises',
      type: 'interactive',
      subject: 'Math',
      grade: 'Kindergarten',
      isPremium: true,
      duration: 10
    },
    {
      id: 'demo-3',
      title: 'Letter Recognition',
      description: 'Learn your ABCs',
      type: 'video',
      subject: 'ELA',
      grade: 'Kindergarten',
      isPremium: false,
      duration: 8
    }
  ];
  
  /**
   * Get all demo content
   */
  async getAllDemoContent(): Promise<DemoContent[]> {
    return this.demoContent;
  }
  
  /**
   * Get demo content by grade
   */
  async getDemoContentByGrade(grade: string): Promise<DemoContent[]> {
    return this.demoContent.filter(content => content.grade === grade);
  }
  
  /**
   * Get premium content only
   */
  async getPremiumContent(): Promise<DemoContent[]> {
    return this.demoContent.filter(content => content.isPremium);
  }
  
  /**
   * Get free content only
   */
  async getFreeContent(): Promise<DemoContent[]> {
    return this.demoContent.filter(content => !content.isPremium);
  }
  
  /**
   * Check if user has access to content
   */
  async hasAccess(contentId: string, isPremiumUser: boolean): Promise<boolean> {
    const content = this.demoContent.find(c => c.id === contentId);
    if (!content) return false;
    
    return !content.isPremium || isPremiumUser;
  }
  
  /**
   * Generate demo content
   */
  async generateDemoContent(params: {
    subject: string;
    grade: string;
    count?: number;
  }): Promise<DemoContent[]> {
    const generated: DemoContent[] = [];
    const count = params.count || 3;
    
    for (let i = 0; i < count; i++) {
      generated.push({
        id: `generated-${Date.now()}-${i}`,
        title: `${params.subject} Demo ${i + 1}`,
        description: `Demo content for ${params.grade} ${params.subject}`,
        type: i % 2 === 0 ? 'interactive' : 'video',
        subject: params.subject,
        grade: params.grade,
        isPremium: i > 1,
        duration: 5 + Math.floor(Math.random() * 10)
      });
    }
    
    this.demoContent.push(...generated);
    return generated;
  }
  
  /**
   * Delete demo content
   */
  async deleteDemoContent(contentId: string): Promise<boolean> {
    const index = this.demoContent.findIndex(c => c.id === contentId);
    if (index === -1) return false;
    
    this.demoContent.splice(index, 1);
    return true;
  }
}

// Export singleton instance
export const premiumDemoContentV2 = new PremiumDemoContentServiceV2();