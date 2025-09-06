#!/usr/bin/env node

/**
 * FOCUSED INTELLIGENT TESTBED GENERATOR
 * Creates a comprehensive but manageable testbed sample using Azure AI arsenal
 * Demonstrates all three models working together effectively
 */

import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

class FocusedTestbedGenerator {
  constructor() {
    this.models = {
      gpt4o: {
        name: 'GPT-4o',
        deployment: process.env.VITE_AZURE_GPT4O_DEPLOYMENT,
        apiKey: process.env.VITE_AZURE_GPT4O_API_KEY,
        endpoint: process.env.VITE_AZURE_OPENAI_ENDPOINT,
        color: chalk.blue
      },
      gpt4: {
        name: 'GPT-4',
        deployment: process.env.VITE_AZURE_GPT4_DEPLOYMENT,
        apiKey: process.env.VITE_AZURE_GPT4_API_KEY,
        endpoint: process.env.VITE_AZURE_OPENAI_ENDPOINT,
        color: chalk.magenta
      },
      gpt35: {
        name: 'GPT-3.5 Turbo',
        deployment: process.env.VITE_AZURE_GPT35_DEPLOYMENT,
        apiKey: process.env.VITE_AZURE_GPT35_API_KEY,
        endpoint: process.env.VITE_AZURE_GPT35_ENDPOINT,
        color: chalk.green
      }
    };

    this.generatedContent = [];
    this.stats = {
      total: 0,
      successful: 0,
      failed: 0,
      byModel: { gpt4o: 0, gpt4: 0, gpt35: 0 },
      startTime: Date.now()
    };
  }

  async generateFocusedTestbed() {
    console.log(chalk.blue('🎯 FOCUSED INTELLIGENT TESTBED GENERATOR\n'));
    console.log(chalk.yellow('Generating comprehensive educational content samples with Azure AI arsenal\n'));

    await this.generateBulkSamples();
    await this.generateCreativeSamples();
    await this.generateAnalyticalSamples();
    await this.saveContent();
    await this.showResults();
  }

  async generateBulkSamples() {
    console.log(chalk.green('🏭 BULK CONTENT SAMPLES (GPT-3.5 Turbo)\n'));
    
    const bulkTasks = [
      { grade: '3', subject: 'Mathematics', container: 'learn', contentType: 'instruction' },
      { grade: '5', subject: 'Science', container: 'learn', contentType: 'practice' },
      { grade: '2', subject: 'Reading', container: 'learn', contentType: 'assessment' },
      { grade: '4', subject: 'Mathematics', container: 'experience', contentType: 'real_world_application' },
      { grade: '1', subject: 'Science', container: 'discover', contentType: 'exploration' }
    ];

    for (const task of bulkTasks) {
      const result = await this.generateContent({ ...task, model: 'gpt35' });
      if (result.success) {
        this.stats.successful++;
        this.stats.byModel.gpt35++;
        this.generatedContent.push(result.content);
        console.log(chalk.green(`  ✅ Generated: ${task.grade} ${task.subject} ${task.contentType}`));
      } else {
        this.stats.failed++;
        console.log(chalk.red(`  ❌ Failed: ${task.grade} ${task.subject} ${task.contentType}`));
      }
    }
    
    console.log(chalk.green(`\n✅ Bulk samples complete: ${this.stats.byModel.gpt35} pieces\n`));
  }

  async generateCreativeSamples() {
    console.log(chalk.blue('🎨 CREATIVE CONTENT SAMPLES (GPT-4o)\n'));
    
    const creativeTasks = [
      { grade: 'K', subject: 'English Language Arts', container: 'discover', contentType: 'narrative' },
      { grade: '6', subject: 'Social Studies', container: 'experience', contentType: 'career_scenario' },
      { grade: '9', subject: 'Biology', container: 'discover', contentType: 'creative_challenge' },
      { grade: '11', subject: 'History', container: 'experience', contentType: 'real_world_application' }
    ];

    for (const task of creativeTasks) {
      const result = await this.generateContent({ ...task, model: 'gpt4o' });
      if (result.success) {
        this.stats.successful++;
        this.stats.byModel.gpt4o++;
        this.generatedContent.push(result.content);
        console.log(chalk.blue(`  ✅ Generated: ${task.grade} ${task.subject} ${task.contentType}`));
      } else {
        this.stats.failed++;
        console.log(chalk.red(`  ❌ Failed: ${task.grade} ${task.subject} ${task.contentType}`));
      }
    }
    
    console.log(chalk.blue(`\n✅ Creative samples complete: ${this.stats.byModel.gpt4o} pieces\n`));
  }

  async generateAnalyticalSamples() {
    console.log(chalk.magenta('📊 ANALYTICAL CONTENT SAMPLES (GPT-4)\n'));
    
    const analyticalTasks = [
      { grade: '8', subject: 'Mathematics', container: 'learn', contentType: 'assessment' },
      { grade: '10', subject: 'Chemistry', container: 'learn', contentType: 'instruction' },
      { grade: '12', subject: 'Physics', container: 'experience', contentType: 'project' }
    ];

    for (const task of analyticalTasks) {
      const result = await this.generateContent({ ...task, model: 'gpt4' });
      if (result.success) {
        this.stats.successful++;
        this.stats.byModel.gpt4++;
        this.generatedContent.push(result.content);
        console.log(chalk.magenta(`  ✅ Generated: ${task.grade} ${task.subject} ${task.contentType}`));
      } else {
        this.stats.failed++;
        console.log(chalk.red(`  ❌ Failed: ${task.grade} ${task.subject} ${task.contentType}`));
      }
    }
    
    console.log(chalk.magenta(`\n✅ Analytical samples complete: ${this.stats.byModel.gpt4} pieces\n`));
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
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const content = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        success: true,
        content: {
          id: `${model}-${grade}-${subject.replace(/\s+/g, '-').toLowerCase()}-${contentType}`,
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
      gpt35: 'Focus on clear, efficient, standards-aligned content.',
      gpt4o: 'Create engaging, creative, personalized content that sparks curiosity.',
      gpt4: 'Generate comprehensive, analytical content with deep pedagogical structure.'
    };
    
    return `${basePrompt} ${modelSpecific[model]} Always return valid JSON with complete educational content structure.`;
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

CONTENT STRUCTURE:
{
  "title": "Engaging title for the content",
  "learning_objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "content": "Main instructional content or scenario (3-4 paragraphs)",
  "activities": ["Interactive activity 1", "Hands-on activity 2", "Assessment activity 3"],
  "materials_needed": ["Material 1", "Material 2"],
  "differentiation": "How to adapt for different learners",
  "estimated_time": "20 minutes",
  "difficulty_level": "${gradeLevel}",
  "skills_practiced": ["Skill 1", "Skill 2", "Skill 3"],
  "success_criteria": "How students demonstrate mastery"
}

Return only valid JSON with complete educational content.`;
  }

  async saveContent() {
    console.log(chalk.yellow('💾 SAVING CONTENT SAMPLES\n'));
    
    const outputDir = './generated-testbed-samples';
    await fs.mkdir(outputDir, { recursive: true });
    
    // Save complete sample dataset
    const completeFilePath = path.join(outputDir, 'intelligent-testbed-samples.json');
    await fs.writeFile(completeFilePath, JSON.stringify(this.generatedContent, null, 2));
    
    // Save individual samples by model
    for (const modelKey of ['gpt35', 'gpt4o', 'gpt4']) {
      const modelContent = this.generatedContent.filter(c => c.model === modelKey);
      const filePath = path.join(outputDir, `${modelKey}-samples.json`);
      await fs.writeFile(filePath, JSON.stringify(modelContent, null, 2));
    }
    
    console.log(chalk.green(`✅ Content saved to ${outputDir}/`));
    console.log(chalk.green(`📄 Complete samples: ${completeFilePath}\n`));
  }

  async showResults() {
    const duration = (Date.now() - this.stats.startTime) / 1000;
    this.stats.total = this.stats.successful + this.stats.failed;
    
    console.log(chalk.blue('🎉 FOCUSED TESTBED GENERATION COMPLETE!\n'));
    console.log(chalk.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    
    console.log(chalk.yellow('📊 GENERATION RESULTS:'));
    console.log(chalk.white(`   Total Samples: ${this.stats.total}`));
    console.log(chalk.white(`   Successful: ${this.stats.successful}`));
    console.log(chalk.white(`   Failed: ${this.stats.failed}`));
    console.log(chalk.white(`   Success Rate: ${((this.stats.successful / this.stats.total) * 100).toFixed(1)}%`));
    console.log(chalk.white(`   Generation Time: ${duration.toFixed(1)} seconds`));
    
    console.log(chalk.cyan('\n🤖 MODEL PERFORMANCE:'));
    console.log(chalk.green(`   GPT-3.5 Turbo: ${this.stats.byModel.gpt35} samples (bulk efficiency)`));
    console.log(chalk.blue(`   GPT-4o: ${this.stats.byModel.gpt4o} samples (creative excellence)`));
    console.log(chalk.magenta(`   GPT-4: ${this.stats.byModel.gpt4} samples (analytical depth)`));
    
    console.log(chalk.green('\n💰 COST ANALYSIS:'));
    console.log(chalk.white(`   Estimated Normal Cost: $${(this.stats.total * 0.05).toFixed(2)}`));
    console.log(chalk.white(`   Azure Partnership Cost: $0.00`));
    console.log(chalk.white(`   Savings: 100%`));
    
    console.log(chalk.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.blue('🚀 AZURE AI ARSENAL SUCCESSFULLY DEMONSTRATED! 🚀'));
    console.log(chalk.yellow('Ready to scale to unlimited educational content generation! ⚡\n'));
    
    // Show sample titles
    console.log(chalk.cyan('📚 SAMPLE CONTENT GENERATED:'));
    this.generatedContent.forEach(content => {
      const modelColor = content.model === 'gpt35' ? chalk.green : 
                        content.model === 'gpt4o' ? chalk.blue : chalk.magenta;
      console.log(modelColor(`   ${content.model.toUpperCase()}: "${content.title}"`));
    });
    console.log('');
  }
}

// Run the focused generation
async function runGeneration() {
  const generator = new FocusedTestbedGenerator();
  await generator.generateFocusedTestbed();
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runGeneration().catch(console.error);
}

export { FocusedTestbedGenerator };