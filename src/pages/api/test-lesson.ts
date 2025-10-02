/**
 * API endpoint to test lesson generation
 * Access at: http://localhost:3000/api/test-lesson
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { lessonOrchestrator } from '../../services/orchestration/LessonPlanOrchestrator';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🚀 Starting lesson generation test...\n');

  try {
    // Generate lessons for test student "Sam"
    const result = await lessonOrchestrator.generateDailyLessons('student_sam_id');

    console.log('✅ Successfully generated lessons:');
    console.log(`- Total lessons: ${result.lessons.length}`);
    console.log(`- Archives created: ${result.archives.length}\n`);

    // Build response
    const response = {
      success: true,
      summary: {
        totalLessons: result.lessons.length,
        totalArchives: result.archives.length,
        student: 'Sam',
        career: 'Chef',
        date: new Date().toISOString()
      },
      lessons: result.lessons.map((lesson) => ({
        lessonId: lesson.lessonId,
        subject: lesson.curriculum.subject,
        career: `${lesson.career.careerName} ${lesson.career.icon}`,
        skill: lesson.curriculum.skillObjective,
        templateType: lesson.templateType,
        pdfFilename: lesson.pdfData.filename
      })),
      archives: result.archives.map((archive) => ({
        lessonId: archive.lessonId,
        pdfUrl: archive.pdfUrl,
        jsonUrl: archive.jsonUrl
      }))
    };

    // Display in console
    result.lessons.forEach((lesson, index) => {
      console.log(`📚 Lesson ${index + 1}:`);
      console.log(`   Subject: ${lesson.curriculum.subject}`);
      console.log(`   Career: ${lesson.career.careerName} ${lesson.career.icon}`);
      console.log(`   Skill: ${lesson.curriculum.skillObjective}`);
      console.log(`   PDF: ${lesson.pdfData.filename}\n`);
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('❌ Test failed:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  }
}