/**
 * PATHFINITY UAT TEST DATA GENERATOR
 * Populates UAT environment with comprehensive test data
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN';
  gradeLevel?: string;
  age?: number;
}

interface TestSchool {
  id: string;
  name: string;
  type: 'ELEMENTARY' | 'MIDDLE' | 'HIGH';
  grades: string[];
}

interface TestClassroom {
  name: string;
  subject: string;
  gradeLevel: string;
  teacherEmail: string;
  studentEmails: string[];
  schoolId: string;
}

export class UATDataGenerator {
  private readonly testUsers: TestUser[] = [
    // Kindergarten Students
    { email: 'k.emma@uat.pathfinity.ai', password: 'KinderTest123!', firstName: 'Emma', lastName: 'Wilson', role: 'STUDENT', gradeLevel: 'K', age: 5 },
    { email: 'k.noah@uat.pathfinity.ai', password: 'KinderTest123!', firstName: 'Noah', lastName: 'Thompson', role: 'STUDENT', gradeLevel: 'K', age: 6 },
    { email: 'k.sophia@uat.pathfinity.ai', password: 'KinderTest123!', firstName: 'Sophia', lastName: 'Garcia', role: 'STUDENT', gradeLevel: 'K', age: 5 },

    // Elementary Students
    { email: 'e.liam@uat.pathfinity.ai', password: 'ElemTest123!', firstName: 'Liam', lastName: 'Martinez', role: 'STUDENT', gradeLevel: '3', age: 8 },
    { email: 'e.olivia@uat.pathfinity.ai', password: 'ElemTest123!', firstName: 'Olivia', lastName: 'Anderson', role: 'STUDENT', gradeLevel: '3', age: 9 },
    { email: 'e.ethan@uat.pathfinity.ai', password: 'ElemTest123!', firstName: 'Ethan', lastName: 'Taylor', role: 'STUDENT', gradeLevel: '5', age: 10 },
    { email: 'e.ava@uat.pathfinity.ai', password: 'ElemTest123!', firstName: 'Ava', lastName: 'Thomas', role: 'STUDENT', gradeLevel: '5', age: 11 },

    // Middle School Students
    { email: 'm.mason@uat.pathfinity.ai', password: 'MiddleTest123!', firstName: 'Mason', lastName: 'Jackson', role: 'STUDENT', gradeLevel: '7', age: 12 },
    { email: 'm.isabella@uat.pathfinity.ai', password: 'MiddleTest123!', firstName: 'Isabella', lastName: 'White', role: 'STUDENT', gradeLevel: '7', age: 13 },
    { email: 'm.lucas@uat.pathfinity.ai', password: 'MiddleTest123!', firstName: 'Lucas', lastName: 'Harris', role: 'STUDENT', gradeLevel: '8', age: 13 },
    { email: 'm.charlotte@uat.pathfinity.ai', password: 'MiddleTest123!', firstName: 'Charlotte', lastName: 'Clark', role: 'STUDENT', gradeLevel: '8', age: 14 },

    // High School Students
    { email: 'h.alexander@uat.pathfinity.ai', password: 'HighTest123!', firstName: 'Alexander', lastName: 'Lewis', role: 'STUDENT', gradeLevel: '10', age: 15 },
    { email: 'h.amelia@uat.pathfinity.ai', password: 'HighTest123!', firstName: 'Amelia', lastName: 'Robinson', role: 'STUDENT', gradeLevel: '11', age: 16 },
    { email: 'h.benjamin@uat.pathfinity.ai', password: 'HighTest123!', firstName: 'Benjamin', lastName: 'Walker', role: 'STUDENT', gradeLevel: '11', age: 17 },
    { email: 'h.mia@uat.pathfinity.ai', password: 'HighTest123!', firstName: 'Mia', lastName: 'Young', role: 'STUDENT', gradeLevel: '12', age: 18 },

    // Teachers
    { email: 'teacher.johnson@uat.pathfinity.ai', password: 'TeachTest123!', firstName: 'Sarah', lastName: 'Johnson', role: 'TEACHER' },
    { email: 'teacher.williams@uat.pathfinity.ai', password: 'TeachTest123!', firstName: 'Michael', lastName: 'Williams', role: 'TEACHER' },
    { email: 'teacher.brown@uat.pathfinity.ai', password: 'TeachTest123!', firstName: 'Jennifer', lastName: 'Brown', role: 'TEACHER' },
    { email: 'teacher.davis@uat.pathfinity.ai', password: 'TeachTest123!', firstName: 'David', lastName: 'Davis', role: 'TEACHER' },
    { email: 'teacher.miller@uat.pathfinity.ai', password: 'TeachTest123!', firstName: 'Lisa', lastName: 'Miller', role: 'TEACHER' },

    // Administrators
    { email: 'principal.smith@uat.pathfinity.ai', password: 'AdminTest123!', firstName: 'Robert', lastName: 'Smith', role: 'ADMIN' },
    { email: 'superintendent.jones@uat.pathfinity.ai', password: 'AdminTest123!', firstName: 'Mary', lastName: 'Jones', role: 'ADMIN' },
    { email: 'it.admin@uat.pathfinity.ai', password: 'AdminTest123!', firstName: 'Kevin', lastName: 'Tech', role: 'ADMIN' },

    // Parents
    { email: 'parent.emma@uat.pathfinity.ai', password: 'ParentTest123!', firstName: 'James', lastName: 'Wilson', role: 'PARENT' },
    { email: 'parent.noah@uat.pathfinity.ai', password: 'ParentTest123!', firstName: 'Linda', lastName: 'Thompson', role: 'PARENT' },
    { email: 'parent.liam@uat.pathfinity.ai', password: 'ParentTest123!', firstName: 'Patricia', lastName: 'Martinez', role: 'PARENT' },
    { email: 'parent.olivia@uat.pathfinity.ai', password: 'ParentTest123!', firstName: 'Christopher', lastName: 'Anderson', role: 'PARENT' },
    { email: 'parent.mason@uat.pathfinity.ai', password: 'ParentTest123!', firstName: 'Barbara', lastName: 'Jackson', role: 'PARENT' }
  ];

  private readonly testSchools: TestSchool[] = [
    {
      id: 'UAT_ELEM_001',
      name: 'Pathfinity Elementary UAT',
      type: 'ELEMENTARY',
      grades: ['K', '1', '2', '3', '4', '5']
    },
    {
      id: 'UAT_MIDDLE_001',
      name: 'Pathfinity Middle UAT',
      type: 'MIDDLE',
      grades: ['6', '7', '8']
    },
    {
      id: 'UAT_HIGH_001',
      name: 'Pathfinity High UAT',
      type: 'HIGH',
      grades: ['9', '10', '11', '12']
    }
  ];

  private readonly testClassrooms: TestClassroom[] = [
    {
      name: "Mrs. Johnson's Kindergarten",
      subject: 'All Subjects',
      gradeLevel: 'K',
      teacherEmail: 'teacher.johnson@uat.pathfinity.ai',
      studentEmails: ['k.emma@uat.pathfinity.ai', 'k.noah@uat.pathfinity.ai', 'k.sophia@uat.pathfinity.ai'],
      schoolId: 'UAT_ELEM_001'
    },
    {
      name: "Mr. Williams' 3rd Grade",
      subject: 'All Subjects',
      gradeLevel: '3',
      teacherEmail: 'teacher.williams@uat.pathfinity.ai',
      studentEmails: ['e.liam@uat.pathfinity.ai', 'e.olivia@uat.pathfinity.ai'],
      schoolId: 'UAT_ELEM_001'
    },
    {
      name: "Mrs. Brown's 7th Grade Science",
      subject: 'Science',
      gradeLevel: '7',
      teacherEmail: 'teacher.brown@uat.pathfinity.ai',
      studentEmails: ['m.mason@uat.pathfinity.ai', 'm.isabella@uat.pathfinity.ai', 'm.lucas@uat.pathfinity.ai', 'm.charlotte@uat.pathfinity.ai'],
      schoolId: 'UAT_MIDDLE_001'
    },
    {
      name: "Mr. Davis' 11th Grade Math",
      subject: 'Mathematics',
      gradeLevel: '11',
      teacherEmail: 'teacher.davis@uat.pathfinity.ai',
      studentEmails: ['h.alexander@uat.pathfinity.ai', 'h.amelia@uat.pathfinity.ai', 'h.benjamin@uat.pathfinity.ai', 'h.mia@uat.pathfinity.ai'],
      schoolId: 'UAT_HIGH_001'
    }
  ];

  async generateAllTestData(): Promise<void> {
    console.log('🚀 Starting UAT test data generation...');

    try {
      // Clear existing UAT data
      await this.clearUATData();

      // Generate core data
      await this.createUsers();
      await this.createSchools();
      await this.createClassrooms();
      await this.createParentChildRelationships();
      
      // Generate learning content
      await this.createCurriculumContent();
      await this.createAssessments();
      await this.createLearningPaths();
      
      // Generate sample interactions
      await this.createSampleAIInteractions();
      await this.createSampleAnalytics();

      console.log('✅ UAT test data generation completed successfully!');
    } catch (error) {
      console.error('❌ Error generating UAT test data:', error);
      throw error;
    }
  }

  private async clearUATData(): Promise<void> {
    console.log('🧹 Clearing existing UAT data...');

    // Delete in correct order to avoid foreign key constraints
    await prisma.learningAnalyticsEvent.deleteMany({
      where: { userId: { endsWith: '@uat.pathfinity.ai' } }
    });
    
    await prisma.aiChatLog.deleteMany({
      where: { userEmail: { endsWith: '@uat.pathfinity.ai' } }
    });
    
    await prisma.assessmentResponse.deleteMany({
      where: { user: { email: { endsWith: '@uat.pathfinity.ai' } } }
    });
    
    await prisma.classroomMembership.deleteMany({
      where: { user: { email: { endsWith: '@uat.pathfinity.ai' } } }
    });
    
    await prisma.parentChildRelationship.deleteMany({
      where: { 
        OR: [
          { parent: { email: { endsWith: '@uat.pathfinity.ai' } } },
          { child: { email: { endsWith: '@uat.pathfinity.ai' } } }
        ]
      }
    });
    
    await prisma.classroom.deleteMany({
      where: { school: { id: { startsWith: 'UAT_' } } }
    });
    
    await prisma.user.deleteMany({
      where: { email: { endsWith: '@uat.pathfinity.ai' } }
    });
    
    await prisma.school.deleteMany({
      where: { id: { startsWith: 'UAT_' } }
    });

    console.log('✅ UAT data cleared');
  }

  private async createUsers(): Promise<void> {
    console.log('👥 Creating test users...');

    for (const user of this.testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      await prisma.user.create({
        data: {
          email: user.email,
          passwordHash: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          gradeLevel: user.gradeLevel,
          age: user.age,
          isActive: true,
          emailVerified: true,
          createdAt: new Date(),
          preferences: {
            language: 'en',
            timezone: 'America/New_York',
            notifications: {
              email: true,
              push: false,
              sms: false
            },
            accessibility: {
              fontSize: 'medium',
              highContrast: false,
              screenReader: false
            }
          }
        }
      });
    }

    console.log(`✅ Created ${this.testUsers.length} test users`);
  }

  private async createSchools(): Promise<void> {
    console.log('🏫 Creating test schools...');

    for (const school of this.testSchools) {
      await prisma.school.create({
        data: {
          id: school.id,
          name: school.name,
          type: school.type,
          grades: school.grades,
          address: '123 UAT Test Lane, Test City, TC 12345',
          district: 'UAT Test District',
          settings: {
            timezone: 'America/New_York',
            academicYearStart: '2024-09-01',
            academicYearEnd: '2025-06-15',
            aiCharactersEnabled: true,
            parentPortalEnabled: true,
            analyticsEnabled: true
          }
        }
      });
    }

    console.log(`✅ Created ${this.testSchools.length} test schools`);
  }

  private async createClassrooms(): Promise<void> {
    console.log('🎓 Creating test classrooms...');

    for (const classroom of this.testClassrooms) {
      const teacher = await prisma.user.findUnique({
        where: { email: classroom.teacherEmail }
      });

      if (!teacher) {
        throw new Error(`Teacher not found: ${classroom.teacherEmail}`);
      }

      const createdClassroom = await prisma.classroom.create({
        data: {
          name: classroom.name,
          subject: classroom.subject,
          gradeLevel: classroom.gradeLevel,
          teacherId: teacher.id,
          schoolId: classroom.schoolId,
          settings: {
            maxStudents: 30,
            aiCharactersEnabled: true,
            assessmentsEnabled: true,
            analyticsEnabled: true,
            parentVisibility: true
          }
        }
      });

      // Add students to classroom
      for (const studentEmail of classroom.studentEmails) {
        const student = await prisma.user.findUnique({
          where: { email: studentEmail }
        });

        if (student) {
          await prisma.classroomMembership.create({
            data: {
              classroomId: createdClassroom.id,
              userId: student.id,
              role: 'STUDENT',
              joinedAt: new Date()
            }
          });
        }
      }
    }

    console.log(`✅ Created ${this.testClassrooms.length} test classrooms`);
  }

  private async createParentChildRelationships(): Promise<void> {
    console.log('👨‍👩‍👧‍👦 Creating parent-child relationships...');

    const relationships = [
      { parentEmail: 'parent.emma@uat.pathfinity.ai', childEmail: 'k.emma@uat.pathfinity.ai' },
      { parentEmail: 'parent.noah@uat.pathfinity.ai', childEmail: 'k.noah@uat.pathfinity.ai' },
      { parentEmail: 'parent.liam@uat.pathfinity.ai', childEmail: 'e.liam@uat.pathfinity.ai' },
      { parentEmail: 'parent.olivia@uat.pathfinity.ai', childEmail: 'e.olivia@uat.pathfinity.ai' },
      { parentEmail: 'parent.mason@uat.pathfinity.ai', childEmail: 'm.mason@uat.pathfinity.ai' },
      { parentEmail: 'parent.mason@uat.pathfinity.ai', childEmail: 'h.alexander@uat.pathfinity.ai' }
    ];

    for (const rel of relationships) {
      const parent = await prisma.user.findUnique({ where: { email: rel.parentEmail } });
      const child = await prisma.user.findUnique({ where: { email: rel.childEmail } });

      if (parent && child) {
        await prisma.parentChildRelationship.create({
          data: {
            parentId: parent.id,
            childId: child.id,
            relationship: 'PARENT',
            verified: true,
            permissions: {
              viewProgress: true,
              viewAIInteractions: true,
              setTimeLimits: true,
              manageSettings: true
            }
          }
        });
      }
    }

    console.log(`✅ Created ${relationships.length} parent-child relationships`);
  }

  private async createCurriculumContent(): Promise<void> {
    console.log('📚 Creating curriculum content...');

    const curriculumTopics = [
      { grade: 'K', subject: 'Math', title: 'Counting to 20', description: 'Learn to count from 1 to 20 with fun activities' },
      { grade: 'K', subject: 'ELA', title: 'Letter Recognition', description: 'Identify uppercase and lowercase letters' },
      { grade: '3', subject: 'Math', title: 'Multiplication Tables', description: 'Master multiplication facts 1-10' },
      { grade: '3', subject: 'Science', title: 'Plant Life Cycles', description: 'Understanding how plants grow and reproduce' },
      { grade: '7', subject: 'Science', title: 'Scientific Method', description: 'Learn the steps of scientific inquiry' },
      { grade: '11', subject: 'Math', title: 'Trigonometry Basics', description: 'Introduction to sine, cosine, and tangent' }
    ];

    for (const topic of curriculumTopics) {
      await prisma.curriculumContent.create({
        data: {
          title: topic.title,
          description: topic.description,
          subject: topic.subject,
          gradeLevel: topic.grade,
          difficulty: topic.grade === 'K' ? 'BEGINNER' : topic.grade === '3' ? 'INTERMEDIATE' : 'ADVANCED',
          estimatedDuration: 30,
          standards: [`CCSS.${topic.subject}.${topic.grade}.${Math.random().toString(36).substr(2, 5)}`],
          content: {
            type: 'lesson',
            objectives: [`Master ${topic.title.toLowerCase()}`],
            materials: ['Interactive whiteboard', 'Student worksheets'],
            activities: ['Introduction', 'Guided practice', 'Independent work', 'Assessment']
          }
        }
      });
    }

    console.log(`✅ Created ${curriculumTopics.length} curriculum topics`);
  }

  private async createAssessments(): Promise<void> {
    console.log('📝 Creating sample assessments...');

    const assessments = [
      {
        title: 'Kindergarten Math Check',
        gradeLevel: 'K',
        subject: 'Math',
        questions: [
          { question: 'Count the apples: 🍎🍎🍎', answer: '3', type: 'multiple_choice', options: ['2', '3', '4'] },
          { question: 'What number comes after 5?', answer: '6', type: 'multiple_choice', options: ['4', '6', '7'] }
        ]
      },
      {
        title: '3rd Grade Multiplication Quiz',
        gradeLevel: '3',
        subject: 'Math',
        questions: [
          { question: '7 × 8 = ?', answer: '56', type: 'multiple_choice', options: ['54', '56', '58'] },
          { question: '9 × 6 = ?', answer: '54', type: 'multiple_choice', options: ['52', '54', '56'] }
        ]
      },
      {
        title: '7th Grade Science Assessment',
        gradeLevel: '7',
        subject: 'Science',
        questions: [
          { question: 'What is the first step of the scientific method?', answer: 'Observation', type: 'multiple_choice', options: ['Hypothesis', 'Observation', 'Experiment'] },
          { question: 'What do plants need for photosynthesis?', answer: 'Sunlight, water, carbon dioxide', type: 'short_answer' }
        ]
      }
    ];

    for (const assessment of assessments) {
      await prisma.assessment.create({
        data: {
          title: assessment.title,
          gradeLevel: assessment.gradeLevel,
          subject: assessment.subject,
          timeLimit: 30,
          totalPoints: assessment.questions.length * 10,
          instructions: 'Read each question carefully and select the best answer.',
          questions: assessment.questions,
          settings: {
            allowRetakes: true,
            showCorrectAnswers: true,
            randomizeQuestions: false,
            randomizeOptions: true
          }
        }
      });
    }

    console.log(`✅ Created ${assessments.length} assessments`);
  }

  private async createLearningPaths(): Promise<void> {
    console.log('🛤️ Creating learning paths...');

    const learningPaths = [
      {
        name: 'Kindergarten Math Foundation',
        gradeLevel: 'K',
        subject: 'Math',
        description: 'Essential math skills for kindergarten students',
        milestones: ['Number Recognition', 'Counting to 20', 'Basic Shapes', 'Simple Addition']
      },
      {
        name: 'Elementary Science Explorer',
        gradeLevel: '3',
        subject: 'Science',
        description: 'Introduction to scientific thinking and discovery',
        milestones: ['Scientific Observation', 'Plant Life Cycles', 'Animal Habitats', 'Weather Patterns']
      },
      {
        name: 'Middle School Math Mastery',
        gradeLevel: '7',
        subject: 'Math',
        description: 'Building strong algebraic foundations',
        milestones: ['Pre-Algebra Concepts', 'Equation Solving', 'Graphing', 'Data Analysis']
      }
    ];

    for (const path of learningPaths) {
      await prisma.learningPath.create({
        data: {
          name: path.name,
          description: path.description,
          subject: path.subject,
          gradeLevel: path.gradeLevel,
          estimatedDuration: 90,
          difficulty: 'INTERMEDIATE',
          milestones: path.milestones.map((milestone, index) => ({
            id: `milestone_${index + 1}`,
            title: milestone,
            description: `Complete ${milestone.toLowerCase()} activities`,
            order: index + 1,
            required: true
          }))
        }
      });
    }

    console.log(`✅ Created ${learningPaths.length} learning paths`);
  }

  private async createSampleAIInteractions(): Promise<void> {
    console.log('🤖 Creating sample AI interactions...');

    const sampleInteractions = [
      {
        userEmail: 'k.emma@uat.pathfinity.ai',
        character: 'Finn',
        userMessage: 'Hi Finn! Can you help me count to 10?',
        aiResponse: 'Hi Emma! I\'d love to help you count! Let\'s count together: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10! Great job! 🎉'
      },
      {
        userEmail: 'e.liam@uat.pathfinity.ai',
        character: 'Sage',
        userMessage: 'What do plants need to grow?',
        aiResponse: 'Great question, Liam! Plants need four main things to grow: sunlight for energy, water to drink, air (carbon dioxide), and nutrients from soil. It\'s like a recipe for life! 🌱'
      },
      {
        userEmail: 'm.mason@uat.pathfinity.ai',
        character: 'Spark',
        userMessage: 'Can you explain how photosynthesis works?',
        aiResponse: 'Absolutely, Mason! Photosynthesis is like a plant\'s kitchen! Plants use sunlight as energy to mix water and carbon dioxide, creating sugar for food and releasing oxygen as a bonus. It\'s the reason we can breathe! 🍃'
      },
      {
        userEmail: 'h.amelia@uat.pathfinity.ai',
        character: 'Harmony',
        userMessage: 'I need help with trigonometry',
        aiResponse: 'I\'m here to help, Amelia! Trigonometry studies the relationships between angles and sides in triangles. Let\'s start with the basic functions: sine, cosine, and tangent. What specific concept would you like to explore? 📐'
      }
    ];

    for (const interaction of sampleInteractions) {
      const user = await prisma.user.findUnique({
        where: { email: interaction.userEmail }
      });

      if (user) {
        await prisma.aiChatLog.create({
          data: {
            userId: user.id,
            userEmail: user.email,
            character: interaction.character,
            userMessage: interaction.userMessage,
            aiResponse: interaction.aiResponse,
            responseTime: Math.floor(Math.random() * 3000) + 1000, // 1-4 seconds
            tokensUsed: Math.floor(Math.random() * 100) + 50,
            cost: Math.random() * 0.01,
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24 hours
          }
        });
      }
    }

    console.log(`✅ Created ${sampleInteractions.length} AI interactions`);
  }

  private async createSampleAnalytics(): Promise<void> {
    console.log('📊 Creating sample analytics data...');

    const students = await prisma.user.findMany({
      where: { 
        role: 'STUDENT',
        email: { endsWith: '@uat.pathfinity.ai' }
      }
    });

    const eventTypes = [
      'lesson_start',
      'lesson_complete',
      'assessment_start', 
      'assessment_complete',
      'ai_interaction',
      'skill_mastery',
      'login',
      'logout'
    ];

    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];

    for (const student of students) {
      // Generate 5-15 events per student
      const eventCount = Math.floor(Math.random() * 10) + 5;
      
      for (let i = 0; i < eventCount; i++) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        
        await prisma.learningAnalyticsEvent.create({
          data: {
            userId: student.id,
            eventType,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
            metadata: {
              subject,
              gradeLevel: student.gradeLevel,
              duration: eventType.includes('complete') ? Math.floor(Math.random() * 30) + 10 : undefined,
              score: eventType.includes('assessment') ? Math.floor(Math.random() * 100) + 60 : undefined,
              masteryLevel: eventType === 'skill_mastery' ? Math.random() : undefined
            }
          }
        });
      }
    }

    console.log(`✅ Created analytics data for ${students.length} students`);
  }

  async validateTestData(): Promise<boolean> {
    console.log('🔍 Validating test data...');

    try {
      const userCount = await prisma.user.count({
        where: { email: { endsWith: '@uat.pathfinity.ai' } }
      });

      const schoolCount = await prisma.school.count({
        where: { id: { startsWith: 'UAT_' } }
      });

      const classroomCount = await prisma.classroom.count({
        where: { school: { id: { startsWith: 'UAT_' } } }
      });

      const interactionCount = await prisma.aiChatLog.count({
        where: { userEmail: { endsWith: '@uat.pathfinity.ai' } }
      });

      console.log('📊 Test Data Summary:');
      console.log(`   Users: ${userCount}`);
      console.log(`   Schools: ${schoolCount}`);
      console.log(`   Classrooms: ${classroomCount}`);
      console.log(`   AI Interactions: ${interactionCount}`);

      const isValid = userCount >= 25 && schoolCount >= 3 && classroomCount >= 4 && interactionCount >= 4;
      
      if (isValid) {
        console.log('✅ Test data validation passed!');
      } else {
        console.log('❌ Test data validation failed!');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Error validating test data:', error);
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const generator = new UATDataGenerator();
  
  generator.generateAllTestData()
    .then(() => generator.validateTestData())
    .then((isValid) => {
      if (isValid) {
        console.log('🎉 UAT environment is ready for testing!');
        process.exit(0);
      } else {
        console.log('💥 UAT setup failed validation');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 UAT setup failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export default UATDataGenerator;