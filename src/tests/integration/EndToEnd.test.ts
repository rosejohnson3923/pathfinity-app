/**
 * End-to-End Integration Tests
 * Tests complete student journeys through the narrative-first system
 */

import { contentOrchestrator } from '../../services/orchestration/ContentOrchestrator';
import { narrativeCache } from '../../services/narrative/NarrativeCache';
import { youTubeService } from '../../services/content-providers/YouTubeService';
import { StudentRequest } from '../../services/orchestration/ContentOrchestrator';

describe('Full Student Journey', () => {
  beforeAll(async () => {
    // Warm up the system
    await narrativeCache.pregeneratePopularPaths();
  });

  test('Sam (K) gets seamless Marine Biologist counting experience', async () => {
    const request: StudentRequest = {
      studentId: 'sam-001',
      studentName: 'Sam',
      grade: 'K',
      career: 'Marine Biologist',
      subject: 'Math',
      skill: 'Counting to 10',
      preferences: {
        learningMode: 'dual',
        difficulty: 'easy'
      }
    };

    const startTime = Date.now();
    const response = await contentOrchestrator.generateFullExperience(request);
    const latency = Date.now() - startTime;

    // Verify all containers generated
    expect(response.experience).toBeDefined();
    expect(response.discover).toBeDefined();
    expect(response.learn).toBeDefined();
    expect(response.assessment).toBeDefined();

    // Check narrative content
    expect(response.experience.hook).toContain('Sam');
    expect(response.experience.worldBuilding).toContain('Coral Bay');

    // Verify learn container has career context
    expect(response.learn.narrativeIntro).toContain('Marine Biologist');
    expect(response.learn.instruction).toBeDefined();

    // Check assessment is career-themed
    expect(response.assessment.scenario).toContain('Sam');
    expect(response.assessment.questions.length).toBeGreaterThanOrEqual(3);

    // Performance requirements
    expect(latency).toBeLessThan(2000); // Under 2 seconds
    expect(response.metadata.totalCost).toBeLessThan(0.01); // Under 1 cent

    console.log(`Sam's journey completed in ${latency}ms, cost: $${response.metadata.totalCost.toFixed(5)}`);
  });

  test('Multiple students in same classroom get varied content', async () => {
    const classroom = [
      { name: 'Emma', career: 'Doctor' },
      { name: 'Liam', career: 'Astronaut' },
      { name: 'Olivia', career: 'Teacher' },
      { name: 'Noah', career: 'Veterinarian' }
    ];

    const responses = await Promise.all(
      classroom.map(student =>
        contentOrchestrator.generateFullExperience({
          studentId: `${student.name.toLowerCase()}-001`,
          studentName: student.name,
          grade: 'K',
          career: student.career,
          subject: 'Math',
          skill: 'Counting to 10'
        })
      )
    );

    // Each student gets unique narrative
    const narratives = responses.map(r => r.experience.characterIntro);
    const uniqueNarratives = new Set(narratives);
    expect(uniqueNarratives.size).toBe(4); // All unique

    // All use same YouTube video (efficient)
    const videoUrls = responses
      .map(r => r.learn.instruction?.videoUrl)
      .filter(url => url);

    if (videoUrls.length > 1) {
      // If YouTube available, should reuse same video
      expect(new Set(videoUrls).size).toBeLessThanOrEqual(2);
    }

    // Cost should be minimal due to caching
    const totalCost = responses.reduce((sum, r) => sum + r.metadata.totalCost, 0);
    const avgCost = totalCost / responses.length;

    console.log(`Classroom of ${classroom.length} students:`);
    console.log(`Average cost per student: $${avgCost.toFixed(5)}`);
    console.log(`Total classroom cost: $${totalCost.toFixed(4)}`);

    expect(avgCost).toBeLessThan(0.002); // Less than 0.2 cents per student
  });

  test('Progressive difficulty across grade levels', async () => {
    const grades = ['K', '1', '2', '3', '4', '5'];
    const skills = [
      'Counting to 10',
      'Addition to 20',
      'Subtraction',
      'Multiplication',
      'Division',
      'Fractions'
    ];

    const responses = await Promise.all(
      grades.map((grade, index) =>
        contentOrchestrator.generateFullExperience({
          studentId: `test-${grade}`,
          grade,
          career: 'Scientist',
          subject: 'Math',
          skill: skills[index]
        })
      )
    );

    // Verify appropriate complexity
    grades.forEach((grade, index) => {
      const assessment = responses[index].assessment;
      const questions = assessment.questions;

      if (grade === 'K' || grade === '1') {
        // Early grades: simpler questions
        expect(questions.filter((q: any) => q.difficulty === 'easy').length)
          .toBeGreaterThan(questions.filter((q: any) => q.difficulty === 'hard').length);
      } else if (parseInt(grade) >= 4) {
        // Later grades: more complex
        expect(questions.filter((q: any) => q.difficulty === 'hard').length)
          .toBeGreaterThan(0);
      }
    });

    console.log('Grade progression verified across K-5');
  });

  test('Fallback handling when YouTube unavailable', async () => {
    // Mock YouTube failure
    const originalSearch = youTubeService.searchEducationalVideos;
    youTubeService.searchEducationalVideos = jest.fn()
      .mockRejectedValue(new Error('YouTube API unavailable'));

    const request: StudentRequest = {
      studentId: 'fallback-test',
      grade: '2',
      career: 'Engineer',
      subject: 'Math',
      skill: 'Addition'
    };

    const response = await contentOrchestrator.generateFullExperience(request);

    // Should still generate all content
    expect(response).toBeDefined();
    expect(response.experience).toBeDefined();
    expect(response.learn).toBeDefined();
    expect(response.learn.narrativeIntro).toContain('Engineer');

    // Should indicate no YouTube
    expect(response.metadata.youtubeUsed).toBe(false);

    // Restore original function
    youTubeService.searchEducationalVideos = originalSearch;

    console.log('Fallback successful when YouTube unavailable');
  });

  test('Cache warming improves subsequent requests', async () => {
    const request: StudentRequest = {
      studentId: 'cache-test',
      grade: '1',
      career: 'Firefighter',
      subject: 'Math',
      skill: 'Addition to 20'
    };

    // First request - cache miss
    const start1 = Date.now();
    const response1 = await contentOrchestrator.generateFullExperience(request);
    const latency1 = Date.now() - start1;

    // Second request - cache hit
    const start2 = Date.now();
    const response2 = await contentOrchestrator.generateFullExperience(request);
    const latency2 = Date.now() - start2;

    // Cache hit should be much faster
    expect(latency2).toBeLessThan(latency1 * 0.5);

    // Cache hit should be cheaper
    expect(response2.metadata.cacheHit).toBe(true);
    expect(response2.metadata.totalCost).toBeLessThan(response1.metadata.totalCost);

    console.log(`Cache miss: ${latency1}ms, $${response1.metadata.totalCost.toFixed(5)}`);
    console.log(`Cache hit: ${latency2}ms, $${response2.metadata.totalCost.toFixed(5)}`);
    console.log(`Speed improvement: ${((1 - latency2/latency1) * 100).toFixed(1)}%`);
  });

  test('Different learning modes provide appropriate content', async () => {
    const modes: Array<'video' | 'text' | 'dual'> = ['video', 'text', 'dual'];

    const responses = await Promise.all(
      modes.map(mode =>
        contentOrchestrator.generateFullExperience({
          studentId: `mode-test-${mode}`,
          grade: '3',
          career: 'Artist',
          subject: 'Math',
          skill: 'Geometry',
          preferences: { learningMode: mode }
        })
      )
    );

    // Video mode should prioritize video
    expect(responses[0].learn.instruction.mode).toBe('video');

    // Text mode should not have video
    expect(responses[1].learn.instruction.mode).toBe('text');

    // Dual mode should offer both
    expect(responses[2].learn.instruction.mode).toBe('dual');

    console.log('Learning modes verified: video, text, dual');
  });

  test('Career narrative consistency across containers', async () => {
    const request: StudentRequest = {
      studentId: 'consistency-test',
      studentName: 'Alex',
      grade: '4',
      career: 'Game Developer',
      subject: 'Math',
      skill: 'Problem Solving'
    };

    const response = await contentOrchestrator.generateFullExperience(request);

    // Extract career mentions
    const experienceText = JSON.stringify(response.experience);
    const discoverText = JSON.stringify(response.discover);
    const learnText = JSON.stringify(response.learn);
    const assessmentText = JSON.stringify(response.assessment);

    // All should mention the career
    expect(experienceText).toContain('Game Developer');
    expect(discoverText).toContain('Game Developer');
    expect(learnText).toContain('Game Developer');
    expect(assessmentText).toContain('Game Developer');

    // Character name should be consistent
    const alexMentions = [
      experienceText.match(/Alex/g)?.length || 0,
      discoverText.match(/Alex/g)?.length || 0,
      learnText.match(/Alex/g)?.length || 0,
      assessmentText.match(/Alex/g)?.length || 0
    ];

    expect(alexMentions.every(count => count > 0)).toBe(true);

    console.log('Career narrative consistency verified across all containers');
  });

  test('Assessment questions align with video content', async () => {
    const request: StudentRequest = {
      studentId: 'alignment-test',
      grade: '2',
      career: 'Chef',
      subject: 'Math',
      skill: 'Fractions'
    };

    const response = await contentOrchestrator.generateFullExperience(request);

    if (response.metadata.youtubeUsed) {
      // Questions should reference the skill
      const questions = response.assessment.questions;
      const skillRelatedQuestions = questions.filter((q: any) =>
        q.question.toLowerCase().includes('fraction') ||
        q.skillTested.toLowerCase().includes('fraction')
      );

      expect(skillRelatedQuestions.length).toBeGreaterThan(0);

      // Questions should have career context
      const careerRelatedQuestions = questions.filter((q: any) =>
        q.scenario.toLowerCase().includes('chef') ||
        q.scenario.toLowerCase().includes('cooking') ||
        q.scenario.toLowerCase().includes('recipe')
      );

      expect(careerRelatedQuestions.length).toBeGreaterThan(0);
    }

    console.log('Assessment alignment with content verified');
  });
});

describe('Concurrent Request Handling', () => {
  test('System handles 100 concurrent requests', async () => {
    const requests: StudentRequest[] = Array.from({ length: 100 }, (_, i) => ({
      studentId: `concurrent-${i}`,
      grade: ['K', '1', '2'][i % 3],
      career: ['Doctor', 'Teacher', 'Engineer'][i % 3],
      subject: 'Math',
      skill: ['Counting', 'Addition', 'Subtraction'][i % 3]
    }));

    const startTime = Date.now();
    const responses = await Promise.all(
      requests.map(req => contentOrchestrator.generateFullExperience(req))
    );
    const totalTime = Date.now() - startTime;

    // All should complete
    expect(responses.length).toBe(100);
    expect(responses.every(r => r.experience && r.learn)).toBe(true);

    // Should complete in reasonable time (under 10 seconds for 100)
    expect(totalTime).toBeLessThan(10000);

    // Calculate metrics
    const totalCost = responses.reduce((sum, r) => sum + r.metadata.totalCost, 0);
    const avgLatency = totalTime / 100;
    const cacheHits = responses.filter(r => r.metadata.cacheHit).length;

    console.log('\nConcurrent Request Performance:');
    console.log(`100 requests completed in ${totalTime}ms`);
    console.log(`Average latency: ${avgLatency.toFixed(0)}ms`);
    console.log(`Total cost: $${totalCost.toFixed(2)}`);
    console.log(`Cache hits: ${cacheHits}/100`);
  });
});