import { NextApiRequest, NextApiResponse } from 'next';
import { getJustInTimeContentService } from '../services/content/JustInTimeContentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, containerType, skill, student, career, companion } = req.body;
    
    console.log('Test API: Generating JIT content', {
      containerType,
      skill: skill?.skill_name,
      student: student?.grade_level,
      career: career?.name
    });

    const jitService = getJustInTimeContentService();
    
    // Create JIT request with proper context
    const jitRequest = {
      userId,
      container: `${containerType}-container-test`,
      containerType: containerType as 'learn' | 'experience' | 'discover',
      subject: skill.subject || 'Math',
      context: {
        skill: {
          skill_number: skill.skill_number,
          skill_name: skill.skill_name,
          name: skill.name || skill.skill_name
        },
        student: {
          id: student.id,
          name: student.name || student.display_name,
          display_name: student.display_name || student.name,
          grade_level: student.grade_level,
          interests: student.interests || [career?.name],
          learning_style: student.learning_style || 'visual'
        },
        career: career?.name,
        careerDescription: career?.description
      },
      timeConstraint: 15,
      forceRegenerate: true // Force regeneration for testing
    };

    console.log('Test API: JIT Request built', jitRequest);

    const content = await jitService.generateContainerContent(jitRequest);
    
    console.log('Test API: Content generated successfully', {
      hasQuestions: !!content.questions,
      questionCount: content.questions?.length,
      metadata: content.metadata
    });

    return res.status(200).json(content);
  } catch (error) {
    console.error('Test API: Error generating content', error);
    return res.status(500).json({ 
      error: 'Failed to generate content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}