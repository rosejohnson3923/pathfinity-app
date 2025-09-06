#!/usr/bin/env node

/**
 * Performance Benchmark Tests
 * Measures cache performance, database query times, and pre-generation system
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import chalk from 'chalk';

// Load environment
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Performance utilities
function measureTime() {
  const start = Date.now();
  return () => Date.now() - start;
}

async function runBenchmark(name, fn, iterations = 10) {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const getTime = measureTime();
    await fn();
    times.push(getTime());
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  return { name, avg, min, max, iterations };
}

console.log(chalk.bold.blue('\n⚡ Performance Benchmark Suite\n'));

async function benchmarkDatabaseQueries() {
  console.log(chalk.yellow('1. Database Query Performance:'));
  
  // Benchmark: Fetch question types for grade
  const qtResult = await runBenchmark(
    'Fetch question types for Grade 10',
    async () => {
      await supabase
        .from('question_type_definitions')
        .select('*')
        .gte('min_grade', 0)
        .lte('max_grade', 12);
    }
  );
  
  console.log(`   ${qtResult.name}:`);
  console.log(`     Avg: ${qtResult.avg}ms | Min: ${qtResult.min}ms | Max: ${qtResult.max}ms`);
  
  // Benchmark: Fetch detection rules
  const drResult = await runBenchmark(
    'Fetch detection rules',
    async () => {
      await supabase
        .from('detection_rules')
        .select('*')
        .eq('is_active', true)
        .order('priority');
    }
  );
  
  console.log(`   ${drResult.name}:`);
  console.log(`     Avg: ${drResult.avg}ms | Min: ${drResult.min}ms | Max: ${drResult.max}ms`);
  
  // Benchmark: Fetch skills for subject
  const skillsResult = await runBenchmark(
    'Fetch Grade 10 Math skills',
    async () => {
      await supabase
        .from('skills_master_v2')
        .select('*')
        .eq('grade_level', '10')
        .eq('subject', 'Math')
        .limit(50);
    }
  );
  
  console.log(`   ${skillsResult.name}:`);
  console.log(`     Avg: ${skillsResult.avg}ms | Min: ${skillsResult.min}ms | Max: ${skillsResult.max}ms`);
  
  // Benchmark: Complex join query
  const complexResult = await runBenchmark(
    'Complex query (skills with counts)',
    async () => {
      await supabase
        .from('skills_master_v2')
        .select('skill_id, subject, grade_level')
        .eq('grade_level', '10')
        .order('subject')
        .limit(100);
    }
  );
  
  console.log(`   ${complexResult.name}:`);
  console.log(`     Avg: ${complexResult.avg}ms | Min: ${complexResult.min}ms | Max: ${complexResult.max}ms`);
  
  return [qtResult, drResult, skillsResult, complexResult];
}

async function benchmarkCacheOperations() {
  console.log(chalk.yellow('\n2. Cache Operation Performance:'));
  
  // Generate test cache key
  const testCacheKey = `test_cache_${Date.now()}`;
  const testContent = {
    question: 'Test question',
    answer: 'Test answer',
    metadata: { timestamp: Date.now() }
  };
  
  // Benchmark: Cache write
  const writeResult = await runBenchmark(
    'Cache write operation',
    async () => {
      await supabase
        .from('content_cache_v2')
        .insert({
          cache_key: `${testCacheKey}_${Math.random()}`,
          student_id: 'test',
          grade_level: '10',
          subject: 'Math',
          container_type: 'learn',
          content: testContent
        });
    },
    5
  );
  
  console.log(`   ${writeResult.name}:`);
  console.log(`     Avg: ${writeResult.avg}ms | Min: ${writeResult.min}ms | Max: ${writeResult.max}ms`);
  
  // Create a cache entry for read testing
  await supabase.from('content_cache_v2').insert({
    cache_key: testCacheKey,
    student_id: 'test',
    grade_level: '10',
    subject: 'Math',
    container_type: 'learn',
    content: testContent
  });
  
  // Benchmark: Cache read
  const readResult = await runBenchmark(
    'Cache read operation',
    async () => {
      await supabase
        .from('content_cache_v2')
        .select('content')
        .eq('cache_key', testCacheKey)
        .single();
    }
  );
  
  console.log(`   ${readResult.name}:`);
  console.log(`     Avg: ${readResult.avg}ms | Min: ${readResult.min}ms | Max: ${readResult.max}ms`);
  
  // Benchmark: Cache hit check
  const hitResult = await runBenchmark(
    'Cache hit check',
    async () => {
      await supabase
        .from('content_cache_v2')
        .select('cache_id')
        .eq('cache_key', testCacheKey)
        .eq('is_valid', true)
        .gt('expires_at', new Date().toISOString())
        .single();
    }
  );
  
  console.log(`   ${hitResult.name}:`);
  console.log(`     Avg: ${hitResult.avg}ms | Min: ${hitResult.min}ms | Max: ${hitResult.max}ms`);
  
  // Cleanup test cache entries
  await supabase
    .from('content_cache_v2')
    .delete()
    .like('cache_key', `test_cache_%`);
  
  return [writeResult, readResult, hitResult];
}

async function benchmarkQueueOperations() {
  console.log(chalk.yellow('\n3. Pre-Generation Queue Performance:'));
  
  // Benchmark: Add to queue
  const addResult = await runBenchmark(
    'Add item to generation queue',
    async () => {
      await supabase
        .from('generation_queue')
        .insert({
          student_id: 'test',
          grade_level: '10',
          subject: 'Math',
          skill_id: 'test_skill',
          container_type: 'learn',
          priority: 50
        });
    },
    5
  );
  
  console.log(`   ${addResult.name}:`);
  console.log(`     Avg: ${addResult.avg}ms | Min: ${addResult.min}ms | Max: ${addResult.max}ms`);
  
  // Benchmark: Fetch next queue item
  const fetchResult = await runBenchmark(
    'Fetch next queue item',
    async () => {
      await supabase
        .from('generation_queue')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('scheduled_for')
        .limit(1);
    }
  );
  
  console.log(`   ${fetchResult.name}:`);
  console.log(`     Avg: ${fetchResult.avg}ms | Min: ${fetchResult.min}ms | Max: ${fetchResult.max}ms`);
  
  // Cleanup test queue entries
  await supabase
    .from('generation_queue')
    .delete()
    .eq('student_id', 'test');
  
  return [addResult, fetchResult];
}

async function benchmarkDetection() {
  console.log(chalk.yellow('\n4. Question Type Detection Performance:'));
  
  const testQuestions = [
    'True or False: The Earth is round.',
    'How many apples are in the basket?',
    'What is 5 + 3?',
    'Fill in the blank: The capital of France is _____.',
    'Which of the following is correct?'
  ];
  
  // Get all detection rules once
  const { data: rules } = await supabase
    .from('detection_rules')
    .select('*')
    .eq('is_active', true)
    .order('priority');
  
  const detectResult = await runBenchmark(
    'Detect question type (5 questions)',
    async () => {
      for (const question of testQuestions) {
        // Simulate detection logic
        const textLower = question.toLowerCase();
        for (const rule of rules || []) {
          if (rule.pattern_regex) {
            try {
              const regex = new RegExp(rule.pattern_regex, 'i');
              if (regex.test(textLower)) {
                break; // Found match
              }
            } catch (e) {
              // Invalid regex
            }
          }
        }
      }
    }
  );
  
  console.log(`   ${detectResult.name}:`);
  console.log(`     Avg: ${detectResult.avg}ms | Min: ${detectResult.min}ms | Max: ${detectResult.max}ms`);
  console.log(`     Per question: ${(detectResult.avg / 5).toFixed(2)}ms`);
  
  return [detectResult];
}

async function generateReport(results) {
  console.log(chalk.bold.blue('\n📊 Performance Benchmark Report'));
  console.log(chalk.yellow('─'.repeat(50)));
  
  // Flatten all results
  const allResults = results.flat();
  
  // Calculate statistics
  const totalAvg = allResults.reduce((sum, r) => sum + r.avg, 0);
  const fastOps = allResults.filter(r => r.avg < 50);
  const slowOps = allResults.filter(r => r.avg > 200);
  
  console.log(chalk.cyan('\n✅ Performance Targets:'));
  console.log('   Cache operations: < 100ms');
  console.log('   Database queries: < 50ms');
  console.log('   Detection: < 10ms per question');
  console.log('   Queue operations: < 100ms');
  
  console.log(chalk.cyan('\n📈 Summary:'));
  console.log(`   Total operations tested: ${allResults.length}`);
  console.log(`   Fast operations (< 50ms): ${fastOps.length}`);
  console.log(`   Slow operations (> 200ms): ${slowOps.length}`);
  console.log(`   Average response time: ${(totalAvg / allResults.length).toFixed(2)}ms`);
  
  // Check against targets
  const cacheOps = allResults.filter(r => r.name.includes('Cache'));
  const dbOps = allResults.filter(r => r.name.includes('Fetch') || r.name.includes('Complex'));
  const queueOps = allResults.filter(r => r.name.includes('queue'));
  
  const cacheAvg = cacheOps.reduce((sum, r) => sum + r.avg, 0) / cacheOps.length;
  const dbAvg = dbOps.reduce((sum, r) => sum + r.avg, 0) / dbOps.length;
  const queueAvg = queueOps.reduce((sum, r) => sum + r.avg, 0) / queueOps.length;
  
  console.log(chalk.cyan('\n🎯 Target Compliance:'));
  console.log(`   Cache ops avg: ${cacheAvg.toFixed(2)}ms ${cacheAvg < 100 ? chalk.green('✅') : chalk.red('❌')} (target < 100ms)`);
  console.log(`   Database ops avg: ${dbAvg.toFixed(2)}ms ${dbAvg < 50 ? chalk.green('✅') : chalk.red('❌')} (target < 50ms)`);
  console.log(`   Queue ops avg: ${queueAvg.toFixed(2)}ms ${queueAvg < 100 ? chalk.green('✅') : chalk.red('❌')} (target < 100ms)`);
  
  // Recommendations
  console.log(chalk.cyan('\n💡 Recommendations:'));
  if (slowOps.length > 0) {
    console.log(chalk.yellow('   ⚠️ Some operations are slow:'));
    slowOps.forEach(op => {
      console.log(`      - ${op.name}: ${op.avg}ms`);
    });
  } else {
    console.log(chalk.green('   ✅ All operations are within acceptable limits'));
  }
  
  if (cacheAvg < 50) {
    console.log(chalk.green('   ✅ Cache performance is excellent'));
  }
  
  if (dbAvg < 30) {
    console.log(chalk.green('   ✅ Database queries are well optimized'));
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalOperations: allResults.length,
      averageResponseTime: (totalAvg / allResults.length).toFixed(2),
      fastOperations: fastOps.length,
      slowOperations: slowOps.length
    },
    targets: {
      cache: { target: 100, actual: cacheAvg.toFixed(2), passed: cacheAvg < 100 },
      database: { target: 50, actual: dbAvg.toFixed(2), passed: dbAvg < 50 },
      queue: { target: 100, actual: queueAvg.toFixed(2), passed: queueAvg < 100 }
    },
    details: allResults
  };
  
  const fs = await import('fs');
  fs.writeFileSync(
    'performance-benchmark-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log(chalk.gray('\n📄 Detailed report saved to performance-benchmark-report.json'));
}

async function runAllBenchmarks() {
  try {
    const dbResults = await benchmarkDatabaseQueries();
    const cacheResults = await benchmarkCacheOperations();
    const queueResults = await benchmarkQueueOperations();
    const detectionResults = await benchmarkDetection();
    
    await generateReport([dbResults, cacheResults, queueResults, detectionResults]);
    
    console.log(chalk.bold.green('\n✨ Performance benchmarking complete!'));
  } catch (error) {
    console.error(chalk.red('Benchmark failed:'), error);
    process.exit(1);
  }
}

runAllBenchmarks();