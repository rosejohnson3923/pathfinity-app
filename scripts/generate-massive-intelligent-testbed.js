#!/usr/bin/env node

/**
 * MASSIVE INTELLIGENT TESTBED GENERATOR
 * Leverages complete Azure AI arsenal for unlimited educational content generation
 * Uses GPT-3.5 for bulk generation + GPT-4o/4 for premium content
 */

import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

class MassiveIntelligentTestbedGenerator {
  constructor() {
    this.models = {
      gpt4o: {
        name: 'GPT-4o',
        deployment: process.env.VITE_AZURE_GPT4O_DEPLOYMENT,
        apiKey: process.env.VITE_AZURE_GPT4O_API_KEY,
        endpoint: process.env.VITE_AZURE_OPENAI_ENDPOINT,
        role: 'Premium Creative Content',
        color: chalk.blue
      },
      gpt4: {
        name: 'GPT-4',
        deployment: process.env.VITE_AZURE_GPT4_DEPLOYMENT,
        apiKey: process.env.VITE_AZURE_GPT4_API_KEY,
        endpoint: process.env.VITE_AZURE_OPENAI_ENDPOINT,
        role: 'Analytical & Comprehensive',
        color: chalk.magenta
      },
      gpt35: {
        name: 'GPT-3.5 Turbo',
        deployment: process.env.VITE_AZURE_GPT35_DEPLOYMENT,
        apiKey: process.env.VITE_AZURE_GPT35_API_KEY,
        endpoint: process.env.VITE_AZURE_GPT35_ENDPOINT,
        role: 'Bulk Generation Beast',
        color: chalk.green
      }
    };

    this.grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    this.subjects = [
      'Mathematics', 'English Language Arts', 'Science', 'Social Studies',
      'Reading', 'Writing', 'Geography', 'History', 'Biology', 'Chemistry',
      'Physics', 'Algebra', 'Geometry', 'Pre-Calculus', 'Calculus'
    ];
    this.containers = ['learn', 'experience', 'discover'];
    
    this.contentTypes = {
      learn: ['instruction', 'practice', 'assessment'],
      experience: ['career_scenario', 'real_world_application', 'project'],
      discover: ['narrative', 'exploration', 'creative_challenge']
    };

    this.generatedContent = [];
    this.stats = {
      total: 0,
      successful: 0,
      failed: 0,
      byModel: { gpt4o: 0, gpt4: 0, gpt35: 0 },
      byContainer: { learn: 0, experience: 0, discover: 0 },
      startTime: Date.now()
    };
  }

  async generateMassiveTestbed() {
    console.log(chalk.blue('🚀 MASSIVE INTELLIGENT TESTBED GENERATOR\n'));
    console.log(chalk.yellow('🎯 Leveraging Complete Azure AI Arsenal for Unlimited Educational Content\n'));

    await this.showGenerationPlan();
    await this.generateBulkContent();
    await this.generatePremiumContent();
    await this.generateComprehensiveAssessments();
    await this.saveGeneratedContent();
    await this.showFinalStats();
  }

  async showGenerationPlan() {
    console.log(chalk.yellow('📋 GENERATION PLAN\n'));
    
    const totalCombinations = this.grades.length * this.subjects.length * this.containers.length;
    const totalPieces = totalCombinations * 3; // 3 pieces per combination
    
    console.log(chalk.white('Target Content Generation:'));
    console.log(chalk.gray(`  Grades: ${this.grades.length} (K-12)`));
    console.log(chalk.gray(`  Subjects: ${this.subjects.length} (Core + Advanced)`));
    console.log(chalk.gray(`  Containers: ${this.containers.length} (Learn, Experience, Discover)`));
    console.log(chalk.gray(`  Combinations: ${totalCombinations}`));
    console.log(chalk.gray(`  Total Content Pieces: ${totalPieces}`));
    
    console.log(chalk.cyan('\nModel Strategy:'));
    console.log(chalk.green('  🟢 GPT-3.5 Turbo: 70% (Bulk standard content)'));
    console.log(chalk.blue('  🔵 GPT-4o: 20% (Creative & premium content)'));
    console.log(chalk.magenta('  🟣 GPT-4: 10% (Complex analytical content)'));
    
    console.log(chalk.white(`\nEstimated Generation Time: ${Math.ceil(totalPieces / 20)} minutes`));
    console.log(chalk.white('Cost with Microsoft Sponsorship: $0 (UNLIMITED!)\n'));
  }

  async generateBulkContent() {
    console.log(chalk.green('🏭 BULK CONTENT GENERATION (GPT-3.5 Turbo)\n'));
    
    const bulkTasks = [];
    let taskCount = 0;
    
    // Generate 70% of content with GPT-3.5 for efficiency
    for (const grade of this.grades.slice(0, 8)) { // K-7 for bulk
      for (const subject of this.subjects.slice(0, 6)) { // Core subjects
        for (const container of this.containers) {
          const contentType = this.contentTypes[container][0]; // Primary type per container
          
          bulkTasks.push({
            id: `bulk-${++taskCount}`,
            grade,
            subject,
            container,
            contentType,
            model: 'gpt35'
          });
        }
      }
    }

    console.log(chalk.white(`Generating ${bulkTasks.length} bulk content pieces...`));
    
    // Process in batches of 20 for optimal performance
    const batchSize = 20;
    for (let i = 0; i < bulkTasks.length; i += batchSize) {
      const batch = bulkTasks.slice(i, i + batchSize);
      await this.processBatch(batch, 'BULK');
      
      // Progress indicator
      const progress = Math.min(i + batchSize, bulkTasks.length);
      process.stdout.write(`\r${chalk.green(`Progress: ${progress}/${bulkTasks.length}`)} `);
      
      await this.delay(1000); // Rate limiting
    }
    
    console.log(chalk.green(`\n✅ Bulk generation complete: ${this.stats.byModel.gpt35} pieces\n`));
  }

  async generatePremiumContent() {
    console.log(chalk.blue('🎨 PREMIUM CONTENT GENERATION (GPT-4o)\n'));
    
    const premiumTasks = [];
    let taskCount = 0;
    
    // Generate creative, engaging content with GPT-4o
    for (const grade of ['K', '1', '2', '3', '9', '10', '11', '12']) { // Early grades + high school
      for (const subject of ['English Language Arts', 'Science', 'Social Studies']) {
        for (const container of this.containers) {
          const contentType = container === 'discover' ? 'narrative' : 
                            container === 'experience' ? 'career_scenario' : 'instruction';
          
          premiumTasks.push({
            id: `premium-${++taskCount}`,
            grade,
            subject,
            container,
            contentType,
            model: 'gpt4o'
          });
        }
      }
    }

    console.log(chalk.white(`Generating ${premiumTasks.length} premium content pieces...`));
    
    // Process in smaller batches for premium content
    const batchSize = 10;
    for (let i = 0; i < premiumTasks.length; i += batchSize) {
      const batch = premiumTasks.slice(i, i + batchSize);
      await this.processBatch(batch, 'PREMIUM');
      
      const progress = Math.min(i + batchSize, premiumTasks.length);
      process.stdout.write(`\r${chalk.blue(`Progress: ${progress}/${premiumTasks.length}`)} `);
      
      await this.delay(1500); // Slightly slower for premium quality
    }
    
    console.log(chalk.blue(`\n✅ Premium generation complete: ${this.stats.byModel.gpt4o} pieces\n`));
  }

  async generateComprehensiveAssessments() {
    console.log(chalk.magenta('📊 COMPREHENSIVE ASSESSMENTS (GPT-4)\n'));
    
    const assessmentTasks = [];
    let taskCount = 0;
    
    // Generate analytical assessment content with GPT-4
    for (const grade of ['3', '5', '8', '10', '12']) { // Key testing grades
      for (const subject of ['Mathematics', 'English Language Arts', 'Science']) {
        assessmentTasks.push({
          id: `assessment-${++taskCount}`,
          grade,
          subject,
          container: 'learn',
          contentType: 'assessment',
          model: 'gpt4'
        });
      }
    }

    console.log(chalk.white(`Generating ${assessmentTasks.length} comprehensive assessments...`));
    
    for (let i = 0; i < assessmentTasks.length; i += 5) {
      const batch = assessmentTasks.slice(i, i + 5);
      await this.processBatch(batch, 'ASSESSMENT');
      
      const progress = Math.min(i + 5, assessmentTasks.length);
      process.stdout.write(`\r${chalk.magenta(`Progress: ${progress}/${assessmentTasks.length}`)} `);
      
      await this.delay(2000); // Slower for comprehensive assessments
    }
    
    console.log(chalk.magenta(`\n✅ Assessment generation complete: ${this.stats.byModel.gpt4} pieces\n`));
  }

  async processBatch(tasks, batchType) {
    const promises = tasks.map(task => this.generateContent(task));
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        this.stats.successful++;
        this.stats.byModel[tasks[index].model]++;
        this.stats.byContainer[tasks[index].container]++;
        this.generatedContent.push(result.value.content);
      } else {
        this.stats.failed++;
      }
    });
    
    this.stats.total = this.stats.successful + this.stats.failed;
  }

  async generateContent(task) {
    const { grade, subject, container, contentType, model } = task;
    
    try {
      const client = this.createModelClient(model);
      const prompt = this.buildPrompt(grade, subject, container, contentType);
      
      const response = await client.chat.completions.create({
        model: this.models[model].deployment,
        messages: [
          { role: 'system', content: this.getSystemPrompt(contentType, model) },
          { role: 'user', content: prompt }
        ],
        temperature: model === 'gpt4o' ? 0.8 : model === 'gpt4' ? 0.6 : 0.7,
        max_tokens: model === 'gpt35' ? 800 : 1200,
        response_format: { type: 'json_object' }
      });

      const content = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        success: true,
        content: {
          id: task.id,
          grade,
          subject,
          container,
          contentType,
          model,
          generatedAt: new Date().toISOString(),
          tokens: response.usage?.total_tokens,
          ...content
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  createModelClient(modelKey) {
    const model = this.models[modelKey];
    const baseURL = modelKey === 'gpt35' 
      ? `${model.endpoint}openai/deployments/${model.deployment}`
      : `${model.endpoint}openai/deployments/${model.deployment}`;
    
    return new OpenAI({
      apiKey: model.apiKey,
      baseURL,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: { 'api-key': model.apiKey }
    });
  }

  getSystemPrompt(contentType, model) {
    const basePrompt = `You are an expert educational content creator for Pathfinity's intelligent learning platform.`;
    
    const modelSpecific = {
      gpt35: 'Focus on clear, efficient, standards-aligned content. Optimize for bulk generation.',
      gpt4o: 'Create engaging, creative, personalized content that sparks curiosity and imagination.',
      gpt4: 'Generate comprehensive, analytical content with deep pedagogical structure.'
    };
    
    const contentSpecific = {
      instruction: 'Create clear, step-by-step instructional content with learning objectives.',
      practice: 'Design interactive practice exercises with immediate feedback.',
      assessment: 'Build comprehensive assessments with varied question types and rubrics.',
      career_scenario: 'Develop real-world career scenarios that connect learning to professional applications.',
      narrative: 'Craft engaging stories that embed learning concepts naturally.',
      exploration: 'Create open-ended exploratory activities that encourage discovery.'
    };
    
    return `${basePrompt} ${modelSpecific[model]} ${contentSpecific[contentType]} Always return valid JSON with complete educational content structure.`;
  }

  buildPrompt(grade, subject, container, contentType) {
    const gradeLevel = grade === 'K' ? 'Kindergarten' : `Grade ${grade}`;
    
    return `Generate ${contentType} content for ${gradeLevel} ${subject} in the ${container} container.

REQUIREMENTS:
- Age-appropriate for ${gradeLevel}
- Aligned with educational standards
- Engaging and interactive
- Clear learning objectives
- Estimated time: 15-30 minutes
- Supports multiple learning styles

CONTENT STRUCTURE:
{
  "title": "Engaging title for the content",
  "learning_objectives": ["Objective 1", "Objective 2"],
  "content": "Main instructional content or scenario",
  "activities": ["Activity 1", "Activity 2"],
  "assessment": "How progress is measured",
  "materials_needed": ["Material 1", "Material 2"],
  "differentiation": "How to adapt for different learners",
  "estimated_time": "20 minutes",
  "difficulty_level": "grade-appropriate",
  "skills_practiced": ["Skill 1", "Skill 2"]
}

Return only valid JSON with educational content that inspires learning and engagement.`;
  }

  async saveGeneratedContent() {
    console.log(chalk.yellow('💾 SAVING GENERATED CONTENT\n'));
    
    const outputDir = './generated-testbed';
    await fs.mkdir(outputDir, { recursive: true });
    
    // Save by container type
    for (const container of this.containers) {
      const containerContent = this.generatedContent.filter(c => c.container === container);
      const filePath = path.join(outputDir, `${container}-content.json`);
      
      await fs.writeFile(filePath, JSON.stringify(containerContent, null, 2));
      console.log(chalk.gray(`  Saved ${containerContent.length} ${container} pieces to ${filePath}`));
    }
    
    // Save complete dataset
    const completeFilePath = path.join(outputDir, 'complete-intelligent-testbed.json');
    await fs.writeFile(completeFilePath, JSON.stringify(this.generatedContent, null, 2));
    
    // Save generation metadata
    const metadata = {
      generationStats: this.stats,
      totalContent: this.generatedContent.length,
      generatedAt: new Date().toISOString(),
      azureModelsUsed: ['GPT-4o', 'GPT-4', 'GPT-3.5 Turbo'],
      costSavings: `$${(this.stats.total * 0.01).toFixed(2)} saved with free Azure partnership`
    };
    
    const metadataPath = path.join(outputDir, 'generation-metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    console.log(chalk.green(`\n✅ All content saved to ${outputDir}/`));
    console.log(chalk.green(`📄 Complete dataset: ${completeFilePath}`));
    console.log(chalk.green(`📊 Metadata: ${metadataPath}\n`));
  }

  async showFinalStats() {
    const duration = (Date.now() - this.stats.startTime) / 1000;
    const rate = (this.stats.total / duration).toFixed(1);
    
    console.log(chalk.blue('🎉 MASSIVE TESTBED GENERATION COMPLETE!\n'));
    console.log(chalk.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    
    console.log(chalk.yellow('📊 GENERATION STATISTICS:'));
    console.log(chalk.white(`   Total Content Pieces: ${this.stats.total}`));
    console.log(chalk.white(`   Successful: ${this.stats.successful}`));
    console.log(chalk.white(`   Failed: ${this.stats.failed}`));
    console.log(chalk.white(`   Success Rate: ${((this.stats.successful / this.stats.total) * 100).toFixed(1)}%`));
    console.log(chalk.white(`   Generation Time: ${duration.toFixed(1)} seconds`));
    console.log(chalk.white(`   Generation Rate: ${rate} pieces/second`));
    
    console.log(chalk.cyan('\n🤖 MODEL DISTRIBUTION:'));
    console.log(chalk.green(`   GPT-3.5 Turbo: ${this.stats.byModel.gpt35} pieces (bulk generation)`));
    console.log(chalk.blue(`   GPT-4o: ${this.stats.byModel.gpt4o} pieces (creative content)`));
    console.log(chalk.magenta(`   GPT-4: ${this.stats.byModel.gpt4} pieces (comprehensive analysis)`));
    
    console.log(chalk.magenta('\n📚 CONTAINER DISTRIBUTION:'));
    console.log(chalk.white(`   Learn: ${this.stats.byContainer.learn} pieces`));
    console.log(chalk.white(`   Experience: ${this.stats.byContainer.experience} pieces`));
    console.log(chalk.white(`   Discover: ${this.stats.byContainer.discover} pieces`));
    
    console.log(chalk.green('\n💰 ECONOMIC IMPACT:'));
    console.log(chalk.white(`   Estimated API Cost (normal): $${(this.stats.total * 0.01).toFixed(2)}`));
    console.log(chalk.white(`   Actual Cost (Azure Partnership): $0.00`));
    console.log(chalk.white(`   Cost Savings: 100%`));
    
    console.log(chalk.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.blue('🚀 PATHFINITY NOW HAS A MASSIVE INTELLIGENT TESTBED! 🚀'));
    console.log(chalk.yellow('Ready for comprehensive teacher analytics and student testing! ⚡\n'));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the massive generation
async function runGeneration() {
  const generator = new MassiveIntelligentTestbedGenerator();
  await generator.generateMassiveTestbed();
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runGeneration().catch(console.error);
}

export { MassiveIntelligentTestbedGenerator };