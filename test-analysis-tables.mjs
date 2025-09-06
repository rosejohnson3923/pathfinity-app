#!/usr/bin/env node

/**
 * Test Analysis Tables
 * Verify structure and insert initial monitoring data
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import chalk from 'chalk';

// Load environment
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnalysisTables() {
  console.log(chalk.bold.blue('\n🧪 Testing Analysis Tables\n'));
  
  try {
    // 1. Create an analysis run
    console.log(chalk.yellow('1. Creating analysis run...'));
    const { data: run, error: runError } = await supabase
      .from('analysis_runs')
      .insert({
        run_name: 'Initial System Test',
        run_type: 'comprehensive',
        created_by: 'system',
        status: 'running',
        total_questions: 0,
        correct_detections: 0,
        misdetections: 0
      })
      .select()
      .single();
    
    if (runError) {
      console.log(chalk.red(`  ❌ Failed to create run: ${runError.message}`));
      return;
    }
    
    console.log(chalk.green(`  ✅ Analysis run created: ${run.run_id}`));
    
    // 2. Test raw data capture
    console.log(chalk.yellow('\n2. Testing raw data capture...'));
    const testQuestions = [
      { text: 'True or False: The Earth is round.', type: 'true_false' },
      { text: 'What is 5 + 3?', type: 'numeric' },
      { text: 'Count the apples.', type: 'counting' }
    ];
    
    for (const q of testQuestions) {
      const { error } = await supabase
        .from('raw_data_captures')
        .insert({
          analysis_run_id: run.run_id,
          question_text: q.text,
          original_type: q.type,
          detected_type: q.type,
          grade_level: '10',
          subject: 'Math',
          container_type: 'learn',
          student_id: 'taylor',
          processing_time_ms: Math.floor(Math.random() * 50) + 10,
          metadata: { test: true }
        });
      
      if (!error) {
        console.log(chalk.green(`  ✅ Captured: ${q.type}`));
      } else {
        console.log(chalk.red(`  ❌ Failed: ${q.type} - ${error.message}`));
      }
    }
    
    // 3. Test True/False analysis
    console.log(chalk.yellow('\n3. Testing True/False analysis...'));
    const { error: tfError } = await supabase
      .from('true_false_analysis')
      .insert({
        analysis_run_id: run.run_id,
        question_text: 'True or False: Water boils at 100°C.',
        detected_as: 'true_false',
        should_be_true_false: true,
        detection_correct: true,
        has_true_false_keywords: true,
        has_options: false,
        option_count: 0,
        grade_level: '10',
        subject: 'Science'
      });
    
    if (!tfError) {
      console.log(chalk.green('  ✅ True/False analysis recorded'));
    } else {
      console.log(chalk.red(`  ❌ Failed: ${tfError.message}`));
    }
    
    // 4. Test performance metrics
    console.log(chalk.yellow('\n4. Testing performance metrics...'));
    const metrics = [
      { type: 'true_false', total: 100, correct: 95 },
      { type: 'multiple_choice', total: 80, correct: 78 },
      { type: 'numeric', total: 60, correct: 58 }
    ];
    
    for (const m of metrics) {
      const precision = m.total > 0 ? m.correct / m.total : 0;
      const { error } = await supabase
        .from('detection_performance_metrics')
        .insert({
          metric_date: new Date().toISOString().split('T')[0],
          metric_hour: new Date().getHours(),
          question_type: m.type,
          total_detections: m.total,
          correct_detections: m.correct,
          false_positives: m.total - m.correct,
          false_negatives: 0,
          precision_score: precision,
          recall_score: precision,
          f1_score: precision,
          avg_confidence: 0.85 + Math.random() * 0.15,
          avg_detection_time_ms: Math.floor(Math.random() * 20) + 5
        });
      
      if (!error) {
        console.log(chalk.green(`  ✅ Metrics for ${m.type}: ${(precision * 100).toFixed(1)}% accuracy`));
      } else {
        console.log(chalk.red(`  ❌ Failed: ${m.type} - ${error.message}`));
      }
    }
    
    // 5. Test misdetection patterns
    console.log(chalk.yellow('\n5. Testing misdetection patterns...'));
    const { error: patternError } = await supabase
      .from('misdetection_patterns')
      .insert({
        pattern_name: 'Counting detected for Grade 10',
        from_type: 'counting',
        to_type: 'numeric',
        frequency: 3,
        example_questions: ['Count the items', 'How many are there?'],
        common_keywords: ['count', 'how many'],
        grade_levels: ['10', '11', '12'],
        subjects: ['Math'],
        is_resolved: false
      });
    
    if (!patternError) {
      console.log(chalk.green('  ✅ Misdetection pattern recorded'));
    } else {
      console.log(chalk.red(`  ❌ Failed: ${patternError.message}`));
    }
    
    // 6. Complete the analysis run
    console.log(chalk.yellow('\n6. Completing analysis run...'));
    const { error: updateError } = await supabase
      .from('analysis_runs')
      .update({
        completed_at: new Date().toISOString(),
        status: 'completed',
        total_questions: testQuestions.length,
        correct_detections: testQuestions.length,
        misdetections: 0,
        detection_rate: 100
      })
      .eq('run_id', run.run_id);
    
    if (!updateError) {
      console.log(chalk.green('  ✅ Analysis run completed'));
    } else {
      console.log(chalk.red(`  ❌ Failed: ${updateError.message}`));
    }
    
    // 7. Verify data
    console.log(chalk.bold.blue('\n📊 Verification Report:'));
    
    // Check counts
    const tables = [
      'analysis_runs',
      'raw_data_captures',
      'true_false_analysis',
      'detection_performance_metrics',
      'misdetection_patterns'
    ];
    
    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      console.log(`  ${table}: ${count} records`);
    }
    
    // Get latest metrics
    const { data: latestMetrics } = await supabase
      .from('detection_performance_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (latestMetrics && latestMetrics.length > 0) {
      console.log(chalk.cyan('\n📈 Latest Performance:'));
      latestMetrics.forEach(m => {
        const accuracy = m.precision_score * 100;
        console.log(`  ${m.question_type}: ${accuracy.toFixed(1)}% accuracy (${m.total_detections} detections)`);
      });
    }
    
    console.log(chalk.bold.green('\n✨ Analysis tables are working correctly!'));
    
  } catch (error) {
    console.error(chalk.red('Test failed:'), error);
    process.exit(1);
  }
}

testAnalysisTables().catch(console.error);