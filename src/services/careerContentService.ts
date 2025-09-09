/**
 * Career Content Service
 * Generates meaningful, grade-appropriate career content using the CareerAIRulesEngine
 */

import { careerAIRulesEngine, CareerType } from '../rules-engine/career/CareerAIRulesEngine';

export interface EnrichedCareerData {
  id: string;
  name: string;
  category: string;
  description: string;
  dailyActivities: string[];
  skills: string[];
  tools: string[];
  funFact: string;
  realWorldConnection: string;
  roleModel?: {
    name: string;
    achievement: string;
    quote: string;
  };
  challenges: string[];
  rewards: string[];
  icon: string;
  color: string;
}

class CareerContentService {
  private static instance: CareerContentService;
  private careerEngine: typeof careerAIRulesEngine;

  private constructor() {
    this.careerEngine = careerAIRulesEngine;
  }

  public static getInstance(): CareerContentService {
    if (!CareerContentService.instance) {
      CareerContentService.instance = new CareerContentService();
    }
    return CareerContentService.instance;
  }

  /**
   * Get enriched career data with grade-appropriate content
   */
  public getEnrichedCareerData(
    careerName: string,
    grade: string
  ): EnrichedCareerData | null {
    // Get the career profile from the engine
    const profile = this.careerEngine.getCareerProfile(careerName as CareerType);
    
    if (!profile) {
      // Silently use fallback content for careers not yet fully implemented in the engine
      // This is expected behavior as we have 80 careers but only 15 have full profiles
      return this.generateFallbackContent(careerName, grade);
    }

    // Select a random role model
    const roleModel = profile.roleModels[Math.floor(Math.random() * profile.roleModels.length)];

    // Create grade-appropriate fun fact
    const funFact = this.generateGradeAppropriateFunFact(profile, grade);

    // Create real-world connection
    const realWorldConnection = this.generateRealWorldConnection(profile, grade);

    // Get grade-appropriate daily activities (limit to 3-4 for younger grades)
    const dailyActivities = this.getGradeAppropriateDailyActivities(profile, grade);

    return {
      id: profile.id,
      name: profile.name,
      category: profile.category,
      description: this.getGradeAppropriateDescription(profile, grade),
      dailyActivities,
      skills: profile.skills.slice(0, 4), // Top 4 skills
      tools: profile.tools.slice(0, 4), // Top 4 tools
      funFact,
      realWorldConnection,
      roleModel,
      challenges: profile.challenges.slice(0, 3), // Top 3 challenges
      rewards: profile.rewards.slice(0, 4), // Top 4 rewards
      icon: profile.visualTheme.icon,
      color: profile.visualTheme.primaryColor
    };
  }

  /**
   * Generate grade-appropriate career description
   */
  private getGradeAppropriateDescription(profile: any, grade: string): string {
    const gradeLevel = this.parseGradeLevel(grade);
    
    if (gradeLevel === 0) {
      // Kindergarten: Very simple, what they do in one sentence
      const simpleActions = {
        'Doctor': 'Doctors help sick people feel better',
        'Teacher': 'Teachers help kids learn new things',
        'Scientist': 'Scientists discover amazing things',
        'Engineer': 'Engineers build cool things',
        'Artist': 'Artists make beautiful pictures',
        'Chef': 'Chefs cook yummy food',
        'Athlete': 'Athletes play sports and stay healthy',
        'Musician': 'Musicians make beautiful music',
        'Writer': 'Writers tell wonderful stories',
        'Veterinarian': 'Vets take care of animals',
        'Pilot': 'Pilots fly airplanes in the sky',
        'Farmer': 'Farmers grow food for everyone',
        'Police Officer': 'Police officers keep people safe',
        'Firefighter': 'Firefighters put out fires and help people',
        'Astronaut': 'Astronauts explore space'
      };
      return simpleActions[profile.name] || profile.description;
    } else if (gradeLevel <= 2) {
      // Grades 1-2: Add a tool or place they work
      return `${profile.description}. They work in a ${profile.environments[0]} and use special tools.`;
    } else if (gradeLevel === 3) {
      // Grade 3: Add what tools they use
      return `${profile.description}. They use ${profile.tools[0]} and ${profile.tools[1]} to do their job.`;
    } else if (gradeLevel <= 5) {
      // Grades 4-5: Add skills needed
      return `${profile.description}. They need to be good at ${profile.skills[0]} and ${profile.skills[1]}. They work in ${profile.environments.slice(0, 2).join(' or ')}.`;
    } else if (gradeLevel <= 6) {
      // Grade 6: Add education path hint
      return `${profile.description}. To become a ${profile.name.toLowerCase()}, you need to study ${profile.pathways.education[0]}. They use ${profile.tools.slice(0, 2).join(' and ')} in their work.`;
    } else if (gradeLevel <= 8) {
      // Grades 7-8: Include challenges and rewards
      return `${profile.description}. ${profile.name}s face challenges like ${profile.challenges[0]}, but enjoy rewards such as ${profile.rewards[0]} and ${profile.rewards[1]}. Key skills include ${profile.skills.slice(0, 2).join(' and ')}.`;
    } else if (gradeLevel === 9) {
      // Grade 9: Career path and education requirements
      return `${profile.name}s ${profile.description.toLowerCase()}. This career requires studying ${profile.pathways.education.slice(0, 2).join(' and ')}, developing skills in ${profile.skills.slice(0, 3).join(', ')}, and often includes ${profile.pathways.experience[0]}.`;
    } else {
      // Grade 10+: Full career overview with impact
      return `As a ${profile.name.toLowerCase()}, you'll ${profile.description.toLowerCase()}. This career path requires ${profile.pathways.education.join(', ')}, and offers opportunities to ${profile.rewards.slice(0, 2).join(' and ')}. Daily responsibilities include ${profile.dailyActivities.slice(0, 2).join(' and ')}, requiring expertise in ${profile.skills.slice(0, 3).join(', ')}.`;
    }
  }

  /**
   * Generate grade-appropriate fun fact
   */
  private generateGradeAppropriateFunFact(profile: any, grade: string): string {
    const gradeLevel = this.parseGradeLevel(grade);
    
    if (gradeLevel === 0) {
      // Kindergarten: Super simple amazing fact
      const kFacts = {
        'Doctor': 'Doctors use a special tool called a stethoscope to hear your heartbeat!',
        'Teacher': 'Teachers help millions of kids learn to read every year!',
        'Scientist': 'Scientists have discovered dinosaur bones that are millions of years old!',
        'Engineer': 'Engineers built the tallest buildings in the world!',
        'Artist': 'Artists can make sculptures out of ice!',
        'Chef': 'Some chefs can flip pancakes super high in the air!',
        'Athlete': 'Athletes can run faster than a bicycle!',
        'Musician': 'Musicians can play instruments with their eyes closed!',
        'Writer': 'Some writers have written over 100 books!',
        'Veterinarian': 'Vets help all kinds of animals, even elephants!',
        'Pilot': 'Pilots fly higher than birds!',
        'Farmer': 'Farmers can grow giant pumpkins that weigh more than a car!',
        'Police Officer': 'Police officers have special dogs that help them!',
        'Firefighter': 'Firefighters slide down poles to get to their trucks faster!',
        'Astronaut': 'Astronauts can float in space!'
      };
      return kFacts[profile.name] || `${profile.name}s do amazing things every day!`;
    } else if (gradeLevel <= 2) {
      // Grades 1-2: Cool tool or ability
      return `Cool fact: ${profile.name}s use ${profile.tools[0]} to ${this.simplifyActivity(profile.dailyActivities[0])}! They can ${this.simplifyActivity(profile.dailyActivities[1])} too!`;
    } else if (gradeLevel === 3) {
      // Grade 3: Number fact or comparison
      return `Amazing! A ${profile.name.toLowerCase()} might ${this.simplifyActivity(profile.dailyActivities[0])} over 100 times a week! They work in ${profile.environments.length} different places.`;
    } else if (gradeLevel <= 5) {
      // Grades 4-5: Historical fact or achievement
      const roleModel = profile.roleModels[0];
      return `Did you know ${roleModel.name} was a ${profile.name.toLowerCase()} who ${roleModel.achievement}? That's incredible!`;
    } else if (gradeLevel === 6) {
      // Grade 6: Technology or modern advancement
      return `Modern ${profile.name.toLowerCase()}s use advanced ${profile.tools[1]} and can ${profile.dailyActivities[1]}, which wasn't possible 50 years ago!`;
    } else if (gradeLevel <= 8) {
      // Grades 7-8: Career impact with numbers
      const roleModel = profile.roleModels[0];
      return `${roleModel.name} changed the field by ${roleModel.achievement}. Today's ${profile.name.toLowerCase()}s continue this legacy by ${profile.rewards[0]}.`;
    } else if (gradeLevel === 9) {
      // Grade 9: Education and career path insight
      return `It takes ${profile.pathways.education.length} major steps of education to become a ${profile.name.toLowerCase()}, including ${profile.pathways.education[0]} and specialized training in ${profile.skills[0]}.`;
    } else {
      // Grade 10+: Inspirational quote and future outlook
      const roleModel = profile.roleModels[0];
      return `"${roleModel.quote}" - ${roleModel.name}, who ${roleModel.achievement}. The future of this field includes emerging areas like ${profile.skills[profile.skills.length - 1]}.`;
    }
  }

  /**
   * Generate real-world connection
   */
  private generateRealWorldConnection(profile: any, grade: string): string {
    const gradeLevel = this.parseGradeLevel(grade);
    
    if (gradeLevel === 0) {
      // Kindergarten: Where they see them
      const kConnections = {
        'Doctor': 'You see doctors when you visit the hospital or clinic for checkups!',
        'Teacher': 'You see teachers every day at school!',
        'Scientist': 'Scientists work in labs and make discoveries you learn about!',
        'Engineer': 'Engineers made the bridges and buildings you see every day!',
        'Artist': 'You see artists\' work in museums and on book covers!',
        'Chef': 'Chefs make food at restaurants you visit!',
        'Athlete': 'You can watch athletes play on TV or at games!',
        'Musician': 'Musicians make the songs you hear on the radio!',
        'Writer': 'Writers create your favorite books and stories!',
        'Veterinarian': 'Vets help your pets stay healthy!',
        'Pilot': 'Pilots fly the planes you see in the sky!',
        'Farmer': 'Farmers grow the fruits and vegetables you eat!',
        'Police Officer': 'Police officers help keep your neighborhood safe!',
        'Firefighter': 'Firefighters come quickly when there\'s an emergency!',
        'Astronaut': 'Astronauts explore space and send back pictures!'
      };
      return kConnections[profile.name] || `You can see ${profile.name.toLowerCase()}s in your community!`;
    } else if (gradeLevel <= 2) {
      // Grades 1-2: How they help your family
      return `${profile.name}s help your family by ${this.simplifyActivity(profile.dailyActivities[0])}. You might visit them at ${profile.environments[0]}.`;
    } else if (gradeLevel === 3) {
      // Grade 3: Community impact
      return `In your community, ${profile.name.toLowerCase()}s work at ${profile.environments.slice(0, 2).join(' and ')} to ${profile.rewards[0]}. They help hundreds of people!`;
    } else if (gradeLevel <= 5) {
      // Grades 4-5: City/state level impact
      return `${profile.name}s across your state ${profile.dailyActivities[0]} and ${profile.dailyActivities[1]}, helping thousands of people by ${profile.rewards[0]}.`;
    } else if (gradeLevel === 6) {
      // Grade 6: National impact and career exploration
      return `There are thousands of ${profile.name.toLowerCase()}s in America who ${profile.dailyActivities[0]}. You could explore this career by ${profile.pathways.experience[0]}.`;
    } else if (gradeLevel <= 8) {
      // Grades 7-8: Personal career connection
      return `If you enjoy ${profile.skills[0]} and ${profile.skills[1]}, you might love being a ${profile.name.toLowerCase()}. Start by ${profile.pathways.experience[0]} or learning ${profile.pathways.education[0]}.`;
    } else if (gradeLevel === 9) {
      // Grade 9: High school preparation
      return `In high school, prepare for this career by taking courses in ${profile.pathways.education[0]}, joining related clubs, and ${profile.pathways.experience[0]}. Many ${profile.name.toLowerCase()}s started their journey in high school!`;
    } else {
      // Grade 10+: Career pathway and college prep
      return `This career connects to college majors in ${profile.pathways.education.slice(0, 2).join(' and ')}. You can gain experience through ${profile.pathways.experience.join(', ')}, and work toward certifications like ${profile.pathways.certifications[0] || 'professional licensing'}.`;
    }
  }

  /**
   * Get grade-appropriate daily activities
   */
  private getGradeAppropriateDailyActivities(profile: any, grade: string): string[] {
    const gradeLevel = this.parseGradeLevel(grade);
    
    if (gradeLevel === 0) {
      // Kindergarten: 2-3 very simple activities
      return profile.dailyActivities.slice(0, 2).map((activity: string) => 
        this.simplifyActivity(activity)
      );
    } else if (gradeLevel <= 2) {
      // Grades 1-2: 3 simple activities
      return profile.dailyActivities.slice(0, 3).map((activity: string) => 
        this.simplifyActivity(activity)
      );
    } else if (gradeLevel === 3) {
      // Grade 3: 3 activities with simple tools mentioned
      return profile.dailyActivities.slice(0, 3).map((activity: string, index: number) => {
        if (index === 0) {
          return `${this.simplifyActivity(activity)} using ${profile.tools[0]}`;
        }
        return this.simplifyActivity(activity);
      });
    } else if (gradeLevel <= 5) {
      // Grades 4-5: 4 regular activities
      return profile.dailyActivities.slice(0, 4);
    } else if (gradeLevel === 6) {
      // Grade 6: 4 activities with time context
      const timeContexts = ['Every morning:', 'During the day:', 'In meetings:', 'To finish:'];
      return profile.dailyActivities.slice(0, 4).map((activity: string, index: number) => 
        `${timeContexts[index]} ${activity}`
      );
    } else if (gradeLevel <= 8) {
      // Grades 7-8: All activities with skill connections
      return profile.dailyActivities.map((activity: string, index: number) => {
        if (index < profile.skills.length) {
          return `${activity} (uses ${profile.skills[index]})`;
        }
        return activity;
      });
    } else if (gradeLevel === 9) {
      // Grade 9: Activities with education requirements
      return profile.dailyActivities.map((activity: string, index: number) => {
        if (index === 0) {
          return `Core responsibility: ${activity}`;
        } else if (index === 1) {
          return `Requires ${profile.pathways.education[0]}: ${activity}`;
        }
        return activity;
      });
    } else {
      // Grade 10+: Full professional context
      return profile.dailyActivities.map((activity: string, index: number) => {
        const contexts = ['Primary:', 'Advanced:', 'Leadership:', 'Specialized:'];
        return `${contexts[index] || ''} ${activity}`.trim();
      });
    }
  }

  /**
   * Simplify activity for younger grades
   */
  private simplifyActivity(activity: string): string {
    // Remove complex words and simplify
    return activity
      .replace(/examining/gi, 'checking')
      .replace(/analyzing/gi, 'looking at')
      .replace(/conducting/gi, 'doing')
      .replace(/prescribing/gi, 'giving')
      .replace(/presenting/gi, 'showing')
      .replace(/reviewing/gi, 'reading');
  }

  /**
   * Parse grade level from grade string
   */
  private parseGradeLevel(grade: string): number {
    if (grade.toLowerCase() === 'kindergarten' || grade.toLowerCase() === 'k') {
      return 0;
    }
    const match = grade.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  /**
   * Check if career profile exists
   */
  public hasCareerProfile(careerName: string): boolean {
    return !!this.careerEngine.getCareerProfile(careerName as CareerType);
  }

  /**
   * Get all available careers
   */
  public getAllCareers(): string[] {
    return this.careerEngine.getAllCareers();
  }

  /**
   * Generate fallback content for careers not in the engine
   */
  private generateFallbackContent(careerName: string, grade: string): EnrichedCareerData {
    const gradeLevel = this.parseGradeLevel(grade);
    
    // Map of fallback content for all careers (including those in engine for consistency)
    const fallbackCareers: Record<string, any> = {
      // Careers that exist in engine but need consistent progressive content
      'Chef': {
        icon: '👨‍🍳',
        color: '#EC4899',
        category: 'Culinary Arts',
        baseDescription: 'create delicious meals',
        simpleTasks: ['Cook food', 'Try recipes', 'Make yummy meals', 'Help hungry people'],
        mediumTasks: ['Plan menus', 'Prepare diverse cuisines', 'Manage kitchen operations', 'Create new recipes'],
        advancedTasks: ['Design culinary experiences', 'Lead restaurant teams', 'Innovate food concepts', 'Master international cuisines'],
        funFactSimple: 'Chefs make the yummy food you love to eat!',
        funFactMedium: 'Some chefs train for years in France to learn special cooking!',
        funFactAdvanced: 'Michelin star chefs are like the Olympic champions of cooking!',
        realWorldSimple: 'Chefs make your favorite foods!',
        realWorldMedium: 'Chefs create memorable dining experiences and cultural connections.',
        realWorldAdvanced: 'Chefs influence food culture and sustainable dining practices globally.'
      },
      'Doctor': {
        icon: '👩‍⚕️',
        color: '#10B981',
        category: 'Healthcare',
        baseDescription: 'help people stay healthy',
        simpleTasks: ['Help sick people', 'Give medicine', 'Check health', 'Make people better'],
        mediumTasks: ['Diagnose illnesses', 'Prescribe treatments', 'Perform check-ups', 'Educate patients'],
        advancedTasks: ['Perform complex procedures', 'Lead medical teams', 'Research new treatments', 'Specialize in fields'],
        funFactSimple: 'Doctors help make your boo-boos feel better!',
        funFactMedium: 'Doctors go to school for 8 years to learn how to help people!',
        funFactAdvanced: 'Modern doctors can perform surgery with robots and 3D-printed organs!',
        realWorldSimple: 'Doctors keep families healthy!',
        realWorldMedium: 'Doctors save lives and improve quality of life for millions.',
        realWorldAdvanced: 'Doctors advance medical science and combat global health challenges.'
      },
      'Teacher': {
        icon: '📚',
        color: '#3B82F6',
        category: 'Education',
        baseDescription: 'help students learn',
        simpleTasks: ['Teach kids', 'Read stories', 'Help learn', 'Be kind'],
        mediumTasks: ['Create lesson plans', 'Guide student learning', 'Assess progress', 'Inspire curiosity'],
        advancedTasks: ['Develop curricula', 'Mentor future leaders', 'Innovate teaching methods', 'Shape educational policy'],
        funFactSimple: 'Teachers help you learn new things every day!',
        funFactMedium: 'Great teachers can change a student\'s entire life!',
        funFactAdvanced: 'Teachers shape the future by educating today\'s youth!',
        realWorldSimple: 'Teachers help you learn to read!',
        realWorldMedium: 'Teachers prepare students for success in life and careers.',
        realWorldAdvanced: 'Teachers cultivate critical thinking and shape society\'s future.'
      },
      'Artist': {
        icon: '🎨',
        color: '#F59E0B',
        category: 'Creative Arts',
        baseDescription: 'create beautiful art',
        simpleTasks: ['Draw pictures', 'Paint colors', 'Make art', 'Be creative'],
        mediumTasks: ['Develop artistic style', 'Create exhibitions', 'Explore mediums', 'Express emotions'],
        advancedTasks: ['Pioneer art movements', 'Curate galleries', 'Influence culture', 'Master techniques'],
        funFactSimple: 'Artists make the world more colorful and fun!',
        funFactMedium: 'Some famous paintings are worth more than entire buildings!',
        funFactAdvanced: 'Artists have sparked social movements and changed history!',
        realWorldSimple: 'Artists make pretty pictures!',
        realWorldMedium: 'Artists express ideas and emotions that words cannot capture.',
        realWorldAdvanced: 'Artists challenge perspectives and document human experience.'
      },
      'Scientist': {
        icon: '🔬',
        color: '#10B981',
        category: 'STEM',
        baseDescription: 'discover new things',
        simpleTasks: ['Do experiments', 'Ask questions', 'Find answers', 'Learn facts'],
        mediumTasks: ['Conduct research', 'Test hypotheses', 'Analyze data', 'Write reports'],
        advancedTasks: ['Lead research teams', 'Publish findings', 'Secure funding', 'Pioneer discoveries'],
        funFactSimple: 'Scientists help us understand how everything works!',
        funFactMedium: 'Scientists have discovered planets, cured diseases, and invented computers!',
        funFactAdvanced: 'Scientists are solving climate change and exploring the universe!',
        realWorldSimple: 'Scientists discover cool things!',
        realWorldMedium: 'Scientists expand human knowledge and solve global problems.',
        realWorldAdvanced: 'Scientists drive innovation that transforms civilization.'
      },
      'Firefighter': {
        icon: '🚒',
        color: '#EF4444',
        category: 'Public Safety',
        baseDescription: 'save lives and property',
        simpleTasks: ['Put out fires', 'Help people', 'Drive trucks', 'Be brave'],
        mediumTasks: ['Respond to emergencies', 'Operate equipment', 'Perform rescues', 'Educate community'],
        advancedTasks: ['Lead emergency operations', 'Train recruits', 'Investigate fires', 'Coordinate disasters'],
        funFactSimple: 'Firefighters are real-life heroes who save people!',
        funFactMedium: 'Firefighters rescue people from fires, floods, and accidents!',
        funFactAdvanced: 'Firefighters use advanced technology and specialized training!',
        realWorldSimple: 'Firefighters keep you safe!',
        realWorldMedium: 'Firefighters protect communities and save countless lives.',
        realWorldAdvanced: 'Firefighters are first responders in natural disasters and crises.'
      },
      'Athlete': {
        icon: '⚽',
        color: '#EF4444',
        category: 'Sports',
        baseDescription: 'play sports professionally',
        simpleTasks: ['Play sports', 'Exercise daily', 'Have fun', 'Be healthy'],
        mediumTasks: ['Train intensively', 'Compete in events', 'Follow nutrition plans', 'Work with coaches'],
        advancedTasks: ['Compete internationally', 'Break records', 'Inspire fans', 'Mentor youth'],
        funFactSimple: 'Athletes play games and sports for their job!',
        funFactMedium: 'Olympic athletes train 6-8 hours every single day!',
        funFactAdvanced: 'Elite athletes inspire millions and represent their countries!',
        realWorldSimple: 'Athletes play your favorite sports!',
        realWorldMedium: 'Athletes demonstrate dedication and inspire healthy lifestyles.',
        realWorldAdvanced: 'Athletes unite nations and exemplify human potential.'
      },
      'Veterinarian': {
        icon: '🐾',
        color: '#84CC16',
        category: 'Animal Care',
        baseDescription: 'care for animals',
        simpleTasks: ['Help pets', 'Give medicine', 'Be gentle', 'Love animals'],
        mediumTasks: ['Diagnose animal illnesses', 'Perform surgeries', 'Vaccinate pets', 'Advise owners'],
        advancedTasks: ['Specialize in species', 'Research diseases', 'Lead clinics', 'Wildlife conservation'],
        funFactSimple: 'Vets help keep your pets happy and healthy!',
        funFactMedium: 'Vets can work with tiny hamsters or huge elephants!',
        funFactAdvanced: 'Veterinarians protect public health by preventing animal diseases!',
        realWorldSimple: 'Vets help sick puppies and kittens!',
        realWorldMedium: 'Vets ensure animal welfare and protect endangered species.',
        realWorldAdvanced: 'Vets safeguard ecosystems and prevent zoonotic diseases.'
      },
      'Police Officer': {
        icon: '👮',
        color: '#1E40AF',
        category: 'Law Enforcement',
        baseDescription: 'protect and serve',
        simpleTasks: ['Keep safe', 'Help people', 'Stop bad guys', 'Be brave'],
        mediumTasks: ['Patrol communities', 'Investigate crimes', 'Write reports', 'Testify in court'],
        advancedTasks: ['Lead investigations', 'Develop strategies', 'Train officers', 'Community relations'],
        funFactSimple: 'Police officers keep your neighborhood safe!',
        funFactMedium: 'Police officers solve mysteries and catch criminals!',
        funFactAdvanced: 'Modern policing uses DNA, computers, and forensic science!',
        realWorldSimple: 'Police keep communities safe!',
        realWorldMedium: 'Police officers maintain law and order in society.',
        realWorldAdvanced: 'Police protect civil rights and ensure justice.'
      },
      'Programmer': {
        icon: '💻',
        color: '#7C3AED',
        category: 'Technology',
        baseDescription: 'create software and apps',
        simpleTasks: ['Write code', 'Fix bugs', 'Make apps', 'Test programs'],
        mediumTasks: ['Design software solutions', 'Debug complex code', 'Build user interfaces', 'Collaborate with teams'],
        advancedTasks: ['Architect software systems', 'Optimize algorithms', 'Lead development teams', 'Implement AI solutions'],
        funFactSimple: 'Programmers make all the games and apps you love!',
        funFactMedium: 'The first computer programmer was Ada Lovelace in the 1840s!',
        funFactAdvanced: 'Programming languages are like human languages - there are over 700 of them!',
        realWorldSimple: 'Programmers make the games you play!',
        realWorldMedium: 'Everything digital was created by programmers.',
        realWorldAdvanced: 'Programmers power the digital revolution that shapes our world.'
      },
      'YouTuber/Content Creator': {
        icon: '📹',
        color: '#EF4444',
        category: 'Media',
        baseDescription: 'make videos and content',
        simpleTasks: ['Make videos', 'Tell stories', 'Share ideas', 'Be creative'],
        mediumTasks: ['Plan content calendars', 'Edit videos professionally', 'Engage with audience', 'Analyze trends'],
        advancedTasks: ['Build content strategies', 'Monetize channels', 'Collaborate with brands', 'Manage production teams'],
        funFactSimple: 'YouTubers can share their talents with the whole world!',
        funFactMedium: 'The most watched YouTube video has over 13 billion views!',
        funFactAdvanced: 'Content creation is now a multi-billion dollar industry worldwide!',
        realWorldSimple: 'YouTubers teach and entertain millions!',
        realWorldMedium: 'Content creators influence trends and culture.',
        realWorldAdvanced: 'Digital content shapes public opinion and drives social change.'
      },
      'Lawyer': {
        icon: '⚖️',
        color: '#1E40AF',
        category: 'Law',
        baseDescription: 'help people with laws and justice',
        simpleTasks: ['Help people', 'Solve problems', 'Read rules', 'Be fair'],
        mediumTasks: ['Research legal cases', 'Represent clients', 'Write legal documents', 'Argue in court'],
        advancedTasks: ['Develop legal strategies', 'Negotiate settlements', 'Shape legal precedents', 'Advocate for justice'],
        funFactSimple: 'Lawyers help make sure everyone is treated fairly!',
        funFactMedium: 'The first woman lawyer in the US was Arabella Mansfield in 1869!',
        funFactAdvanced: 'There are over 1.3 million lawyers in the United States alone!',
        realWorldSimple: 'Lawyers help people solve problems!',
        realWorldMedium: 'Lawyers protect rights and ensure justice.',
        realWorldAdvanced: 'Lawyers shape the laws that govern our society.'
      },
      'Park Ranger': {
        icon: '🌲',
        color: '#10B981',
        category: 'Environment',
        baseDescription: 'protect nature and parks',
        simpleTasks: ['Protect animals', 'Keep parks clean', 'Help visitors', 'Love nature'],
        mediumTasks: ['Monitor wildlife', 'Lead nature tours', 'Maintain trails', 'Educate visitors'],
        advancedTasks: ['Manage conservation programs', 'Research ecosystems', 'Develop park policies', 'Coordinate emergency responses'],
        funFactSimple: 'Park Rangers get to see wild animals every day!',
        funFactMedium: 'The US has over 400 national park sites protected by rangers!',
        funFactAdvanced: 'Park Rangers protect 84 million acres of American wilderness!',
        realWorldSimple: 'Rangers keep our parks beautiful!',
        realWorldMedium: 'Rangers protect endangered species and habitats.',
        realWorldAdvanced: 'Rangers preserve natural heritage for future generations.'
      },
      'Social Worker': {
        icon: '🤝',
        color: '#7C3AED',
        category: 'Social Services',
        baseDescription: 'help families and communities',
        simpleTasks: ['Help families', 'Listen to people', 'Solve problems', 'Be kind'],
        mediumTasks: ['Support families in need', 'Connect people to resources', 'Advocate for children', 'Counsel individuals'],
        advancedTasks: ['Develop community programs', 'Influence social policy', 'Lead intervention teams', 'Research social issues'],
        funFactSimple: 'Social Workers are helpers who make communities better!',
        funFactMedium: 'Social Workers help over 60 million Americans each year!',
        funFactAdvanced: 'Social Work is one of the fastest-growing professions in healthcare!',
        realWorldSimple: 'Social Workers help families stay together!',
        realWorldMedium: 'Social Workers strengthen communities and support vulnerable populations.',
        realWorldAdvanced: 'Social Workers address systemic inequalities and promote social justice.'
      },
      'Dancer': {
        icon: '💃',
        color: '#BE185D',
        category: 'Performing Arts',
        baseDescription: 'express through movement and dance',
        simpleTasks: ['Dance to music', 'Learn moves', 'Perform for others', 'Stay active'],
        mediumTasks: ['Master dance techniques', 'Choreograph routines', 'Perform in shows', 'Train daily'],
        advancedTasks: ['Create original choreography', 'Lead dance companies', 'Teach masterclasses', 'Innovate dance styles'],
        funFactSimple: 'Dancers can tell stories without using any words!',
        funFactMedium: 'Professional dancers train as hard as Olympic athletes!',
        funFactAdvanced: 'Dance is a $2 billion industry employing thousands worldwide!',
        realWorldSimple: 'Dancers make people happy with their performances!',
        realWorldMedium: 'Dancers preserve cultural traditions and create new art forms.',
        realWorldAdvanced: 'Dance bridges cultures and communicates universal human experiences.'
      },
      'Mail Carrier': {
        icon: '📬',
        color: '#8B5CF6',
        category: 'Public Service',
        baseDescription: 'deliver mail and packages',
        simpleTasks: ['Deliver mail', 'Walk routes', 'Help neighbors', 'Stay organized'],
        mediumTasks: ['Manage delivery routes', 'Handle packages safely', 'Interact with customers', 'Navigate efficiently'],
        advancedTasks: ['Optimize delivery systems', 'Train new carriers', 'Manage postal operations', 'Ensure service standards'],
        funFactSimple: 'Mail carriers walk about 10 miles every day!',
        funFactMedium: 'The US Postal Service delivers to 160 million addresses!',
        funFactAdvanced: 'Mail carriers have been essential workers for over 200 years!',
        realWorldSimple: 'Mail carriers bring packages and letters to your home!',
        realWorldMedium: 'Mail carriers connect communities and enable commerce.',
        realWorldAdvanced: 'Mail carriers are vital links in global communication and trade.'
      },
      'Engineer': {
        icon: '⚙️',
        color: '#6366F1',
        category: 'STEM',
        baseDescription: 'design and build things',
        simpleTasks: ['Build things', 'Solve problems', 'Use math', 'Be creative'],
        mediumTasks: ['Design solutions', 'Test prototypes', 'Use CAD software', 'Calculate specifications'],
        advancedTasks: ['Lead engineering projects', 'Innovate technologies', 'Optimize systems', 'Manage teams'],
        funFactSimple: 'Engineers build bridges, robots, and rockets!',
        funFactMedium: 'Engineers designed everything from smartphones to skyscrapers!',
        funFactAdvanced: 'Engineers are developing renewable energy and exploring Mars!',
        realWorldSimple: 'Engineers make cool inventions!',
        realWorldMedium: 'Engineers solve problems that improve daily life.',
        realWorldAdvanced: 'Engineers shape the future through innovation and design.'
      },
      'Musician': {
        icon: '🎵',
        color: '#6366F1',
        category: 'Performing Arts',
        baseDescription: 'create and perform music',
        simpleTasks: ['Play music', 'Sing songs', 'Practice daily', 'Perform shows'],
        mediumTasks: ['Compose music', 'Record albums', 'Tour venues', 'Collaborate with artists'],
        advancedTasks: ['Produce albums', 'Conduct orchestras', 'Write film scores', 'Headline concerts'],
        funFactSimple: 'Musicians make the songs you love to sing!',
        funFactMedium: 'Some musicians can play 10 different instruments!',
        funFactAdvanced: 'Music is a universal language understood by all cultures!',
        realWorldSimple: 'Musicians make beautiful music!',
        realWorldMedium: 'Musicians bring joy and emotional connection through art.',
        realWorldAdvanced: 'Musicians influence culture and unite people across boundaries.'
      },
      'Writer': {
        icon: '✍️',
        color: '#8B5CF6',
        category: 'Creative Arts',
        baseDescription: 'create stories and content',
        simpleTasks: ['Write stories', 'Use imagination', 'Read books', 'Share ideas'],
        mediumTasks: ['Draft manuscripts', 'Edit content', 'Research topics', 'Develop characters'],
        advancedTasks: ['Publish bestsellers', 'Write screenplays', 'Create series', 'Win literary awards'],
        funFactSimple: 'Writers create all your favorite books and stories!',
        funFactMedium: 'J.K. Rowling wrote Harry Potter in a coffee shop!',
        funFactAdvanced: 'Writers have changed the world through powerful words!',
        realWorldSimple: 'Writers tell amazing stories!',
        realWorldMedium: 'Writers inform, entertain, and inspire through words.',
        realWorldAdvanced: 'Writers preserve culture and challenge societal norms.'
      },
      'Pilot': {
        icon: '✈️',
        color: '#3B82F6',
        category: 'Aviation',
        baseDescription: 'fly airplanes',
        simpleTasks: ['Fly planes', 'Travel world', 'Be careful', 'Help passengers'],
        mediumTasks: ['Navigate routes', 'Monitor instruments', 'Communicate with control', 'Ensure safety'],
        advancedTasks: ['Captain aircraft', 'Train pilots', 'Handle emergencies', 'Fly international'],
        funFactSimple: 'Pilots fly high above the clouds!',
        funFactMedium: 'Pilots can fly to over 190 countries around the world!',
        funFactAdvanced: 'Pilots undergo 1,500+ hours of training before flying commercially!',
        realWorldSimple: 'Pilots take you on vacations!',
        realWorldMedium: 'Pilots connect the world through safe air travel.',
        realWorldAdvanced: 'Pilots enable global commerce and cultural exchange.'
      },
      'Farmer': {
        icon: '🌾',
        color: '#65A30D',
        category: 'Agriculture',
        baseDescription: 'grow food and raise animals',
        simpleTasks: ['Grow food', 'Feed animals', 'Plant seeds', 'Water crops'],
        mediumTasks: ['Manage crops', 'Operate machinery', 'Monitor weather', 'Market produce'],
        advancedTasks: ['Run farm operations', 'Implement technology', 'Sustainable farming', 'Supply chains'],
        funFactSimple: 'Farmers grow all the food we eat!',
        funFactMedium: 'One farmer feeds about 165 people every year!',
        funFactAdvanced: 'Modern farms use GPS, drones, and AI to grow food!',
        realWorldSimple: 'Farmers feed everyone!',
        realWorldMedium: 'Farmers sustain communities and preserve land.',
        realWorldAdvanced: 'Farmers ensure food security and environmental stewardship.'
      },
      'Astronaut': {
        icon: '🚀',
        color: '#4C1D95',
        category: 'Space Exploration',
        baseDescription: 'explore space',
        simpleTasks: ['Go to space', 'Float in air', 'See Earth', 'Be brave'],
        mediumTasks: ['Train for missions', 'Conduct experiments', 'Spacewalk', 'Operate spacecraft'],
        advancedTasks: ['Command missions', 'Research in space', 'Test technologies', 'Explore planets'],
        funFactSimple: 'Astronauts can jump really high on the moon!',
        funFactMedium: 'Astronauts see 16 sunrises and sunsets every day in space!',
        funFactAdvanced: 'Only about 600 people have ever been to space!',
        realWorldSimple: 'Astronauts explore space!',
        realWorldMedium: 'Astronauts advance scientific knowledge beyond Earth.',
        realWorldAdvanced: 'Astronauts pioneer humanity\'s future among the stars.'
      },
      'Builder': {
        icon: '🏗️',
        color: '#8B5CF6',
        category: 'Construction',
        baseDescription: 'construct buildings',
        simpleTasks: ['Build things', 'Use tools', 'Work hard', 'Create homes'],
        mediumTasks: ['Read blueprints', 'Frame structures', 'Install systems', 'Ensure safety'],
        advancedTasks: ['Manage projects', 'Lead crews', 'Estimate costs', 'Green building'],
        funFactSimple: 'Builders make all the houses and schools!',
        funFactMedium: 'The tallest building took 6 years to build!',
        funFactAdvanced: 'Modern builders use 3D printing and sustainable materials!',
        realWorldSimple: 'Builders create homes!',
        realWorldMedium: 'Builders shape communities and infrastructure.',
        realWorldAdvanced: 'Builders construct the foundations of civilization.'
      },
      'Professional Athlete': {
        icon: '🏆',
        color: '#F59E0B',
        category: 'Sports',
        baseDescription: 'compete in sports',
        simpleTasks: ['Play games', 'Practice hard', 'Stay healthy', 'Have fun'],
        mediumTasks: ['Train professionally', 'Compete nationally', 'Follow regimens', 'Media interviews'],
        advancedTasks: ['Win championships', 'Set records', 'Endorse brands', 'Inspire youth'],
        funFactSimple: 'Pro athletes get to play sports every day!',
        funFactMedium: 'Some athletes can run faster than cars in the city!',
        funFactAdvanced: 'Top athletes earn millions and become global icons!',
        realWorldSimple: 'Athletes play exciting games!',
        realWorldMedium: 'Athletes inspire fitness and teamwork.',
        realWorldAdvanced: 'Athletes represent nations and inspire generations.'
      },
      
      // Community Helpers
      'Cafeteria Worker': {
        icon: '🍽️',
        color: '#EA580C',
        category: 'Community Helpers',
        baseDescription: 'serve nutritious meals',
        simpleTasks: ['Serve lunch', 'Help students', 'Keep clean', 'Be friendly'],
        mediumTasks: ['Prepare balanced meals', 'Follow nutrition guidelines', 'Manage food service', 'Ensure food safety'],
        advancedTasks: ['Plan menus', 'Manage dietary needs', 'Lead food teams', 'Implement nutrition programs'],
        funFactSimple: 'Cafeteria workers make sure you have yummy lunch!',
        funFactMedium: 'School cafeterias serve millions of meals every day!',
        funFactAdvanced: 'Nutrition services are vital for student learning and health!',
        realWorldSimple: 'They make your school lunch!',
        realWorldMedium: 'They provide essential nutrition for student success.',
        realWorldAdvanced: 'They support public health through nutrition programs.'
      }
    };

    // Use the career name to find fallback content, handle variations
    const normalizedName = careerName.replace('/', ' ').replace('Content Creator', 'YouTuber/Content Creator');
    const fallback = fallbackCareers[normalizedName] || fallbackCareers[careerName] || {
      icon: '💼',
      color: '#6B7280',
      category: 'Professional',
      baseDescription: 'work in their field',
      simpleTasks: ['Help people', 'Do important work', 'Learn new things', 'Work hard'],
      mediumTasks: ['Develop skills', 'Work on projects', 'Collaborate with others', 'Solve problems'],
      advancedTasks: ['Lead initiatives', 'Innovate solutions', 'Mentor others', 'Drive change'],
      funFactSimple: `${careerName}s do important work every day!`,
      funFactMedium: `${careerName} is an exciting career with many opportunities!`,
      funFactAdvanced: `${careerName}s are shaping the future of their industry!`,
      realWorldSimple: `${careerName}s help make the world better!`,
      realWorldMedium: `${careerName}s contribute to society in meaningful ways.`,
      realWorldAdvanced: `${careerName}s drive innovation and progress in their field.`
    };

    // Select appropriate content based on grade level
    let description, dailyTasks, funFact, realWorldConnection;
    
    if (gradeLevel === 0) {
      // Kindergarten
      description = `${careerName}s ${fallback.baseDescription}`;
      dailyTasks = fallback.simpleTasks;
      funFact = fallback.funFactSimple;
      realWorldConnection = fallback.realWorldSimple;
    } else if (gradeLevel <= 5) {
      // Elementary
      description = `${careerName}s ${fallback.baseDescription} and make a difference`;
      dailyTasks = fallback.mediumTasks;
      funFact = fallback.funFactMedium;
      realWorldConnection = fallback.realWorldMedium;
    } else {
      // Middle/High School
      description = `${careerName}s ${fallback.baseDescription} while developing expertise and leadership`;
      dailyTasks = fallback.advancedTasks;
      funFact = fallback.funFactAdvanced;
      realWorldConnection = fallback.realWorldAdvanced;
    }

    return {
      id: careerName.toLowerCase().replace(/\s+/g, '-'),
      name: careerName,
      category: fallback.category,
      description,
      dailyActivities: dailyTasks,
      skills: ['problem-solving', 'communication', 'creativity', 'teamwork'],
      tools: ['technology', 'equipment', 'resources', 'knowledge'],
      funFact,
      realWorldConnection,
      challenges: ['learning new skills', 'solving problems', 'working with others'],
      rewards: ['helping others', 'personal growth', 'making a difference', 'career satisfaction'],
      icon: fallback.icon,
      color: fallback.color
    };
  }
}

export const careerContentService = CareerContentService.getInstance();