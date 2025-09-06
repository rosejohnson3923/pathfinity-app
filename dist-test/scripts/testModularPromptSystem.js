"use strict";
/**
 * Test Modular Prompt System
 * ===========================
 * Tests the new modular prompt architecture
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const PerfectPipelineIntegration_1 = require("../services/PerfectPipelineIntegration");
const fs = __importStar(require("fs"));
// Critical test scenarios
const TEST_SCENARIOS = [
    // Test 1: "Which" questions should NEVER be true/false
    {
        user: { gradeLevel: '5', career: 'Engineer' },
        system: {
            subject: 'Math',
            skillName: 'Comparing positive and negative numbers',
            skillId: 'MATH.5.NBT.3'
        },
        expectedType: 'multiple_choice',
        notType: 'true_false',
        testName: 'Which number comparison'
    },
    // Test 2: Counting should only be for visual K-2
    {
        user: { gradeLevel: 'K', career: 'Doctor' },
        system: {
            subject: 'Math',
            skillName: 'Counting to 10',
            skillId: 'MATH.K.CC.1'
        },
        expectedType: 'counting',
        notType: 'numeric',
        testName: 'Kindergarten counting'
    },
    // Test 3: Letter recognition should be ELA-appropriate
    {
        user: { gradeLevel: '1', career: 'Teacher' },
        system: {
            subject: 'ELA',
            skillName: 'Letter Recognition',
            skillId: 'ELA.1.RF.1'
        },
        expectedType: 'multiple_choice',
        shouldInclude: ['letter', 'alphabet'],
        testName: 'Letter recognition'
    },
    // Test 4: Career context should be natural
    {
        user: { gradeLevel: '3', career: 'Chef' },
        system: {
            subject: 'Math',
            skillName: 'Multiplication Facts',
            skillId: 'MATH.3.OA.7'
        },
        shouldInclude: ['recipe', 'ingredient', 'serving'],
        testName: 'Chef context multiplication'
    },
    // Test 5: Grade-appropriate language
    {
        user: { gradeLevel: 'K', career: 'Artist' },
        system: {
            subject: 'Math',
            skillName: 'Shapes Recognition',
            skillId: 'MATH.K.G.1'
        },
        shouldNotInclude: ['calculate', 'analyze', 'determine'],
        testName: 'Kindergarten language simplicity'
    },
    // Test 6: Advanced grade complexity
    {
        user: { gradeLevel: '10', career: 'Scientist' },
        system: {
            subject: 'Science',
            skillName: 'Chemical Reactions',
            skillId: 'SCI.10.PS.1'
        },
        shouldInclude: ['analyze', 'hypothesis', 'experiment'],
        testName: 'High school complexity'
    },
    // Test 7: Fraction comparison
    {
        user: { gradeLevel: '4', career: 'Builder' },
        system: {
            subject: 'Math',
            skillName: 'Comparing Fractions',
            skillId: 'MATH.4.NF.2'
        },
        expectedType: 'multiple_choice',
        shouldInclude: ['fraction', 'numerator', 'denominator'],
        testName: 'Fraction comparison'
    },
    // Test 8: True/False appropriate use
    {
        user: { gradeLevel: '2', career: 'Police Officer' },
        system: {
            subject: 'Math',
            skillName: 'Even and Odd Numbers',
            skillId: 'MATH.2.OA.3'
        },
        couldBeType: ['true_false', 'multiple_choice'],
        testName: 'Even/Odd statement'
    }
];
async function testModularSystem() {
    console.log('🧪 TESTING MODULAR PROMPT SYSTEM');
    console.log('='.repeat(60));
    console.log(`Running ${TEST_SCENARIOS.length} critical test scenarios\n`);
    const results = [];
    let passCount = 0;
    let failCount = 0;
    for (let i = 0; i < TEST_SCENARIOS.length; i++) {
        const scenario = TEST_SCENARIOS[i];
        console.log(`\n[${i + 1}/${TEST_SCENARIOS.length}] ${scenario.testName}`);
        console.log(`  Grade: ${scenario.user.gradeLevel}, Career: ${scenario.user.career}`);
        console.log(`  Subject: ${scenario.system.subject}, Skill: ${scenario.system.skillName}`);
        try {
            // Run the pipeline with modular prompts
            const result = await PerfectPipelineIntegration_1.perfectPipeline.runCompletePipeline(scenario.user, scenario.system);
            let passed = true;
            const issues = [];
            // Check question type
            if (scenario.expectedType && result.question?.type !== scenario.expectedType) {
                issues.push(`Expected type ${scenario.expectedType}, got ${result.question?.type}`);
                passed = false;
            }
            if (scenario.notType && result.question?.type === scenario.notType) {
                issues.push(`Should NOT be type ${scenario.notType}`);
                passed = false;
            }
            if (scenario.couldBeType && !scenario.couldBeType.includes(result.question?.type)) {
                issues.push(`Should be one of: ${scenario.couldBeType.join(', ')}`);
                passed = false;
            }
            // Check content inclusion
            const questionText = (result.question?.content || '').toLowerCase();
            if (scenario.shouldInclude) {
                const missing = scenario.shouldInclude.filter(term => !questionText.includes(term.toLowerCase()));
                if (missing.length > 0) {
                    issues.push(`Missing expected terms: ${missing.join(', ')}`);
                    passed = false;
                }
            }
            if (scenario.shouldNotInclude) {
                const found = scenario.shouldNotInclude.filter(term => questionText.includes(term.toLowerCase()));
                if (found.length > 0) {
                    issues.push(`Contains inappropriate terms: ${found.join(', ')}`);
                    passed = false;
                }
            }
            // Check skill relevance
            const skillWords = scenario.system.skillName.toLowerCase().split(' ');
            const hasSkillRelevance = skillWords.some(word => questionText.includes(word) ||
                (result.question?.topic && result.question.topic.toLowerCase().includes(word)));
            if (!hasSkillRelevance) {
                issues.push('Question not relevant to skill');
                passed = false;
            }
            if (passed) {
                console.log(`  ✅ PASSED`);
                console.log(`     Type: ${result.question?.type}`);
                console.log(`     Question: ${questionText.substring(0, 60)}...`);
                passCount++;
            }
            else {
                console.log(`  ❌ FAILED`);
                issues.forEach(issue => console.log(`     - ${issue}`));
                console.log(`     Question: ${questionText.substring(0, 60)}...`);
                failCount++;
            }
            results.push({
                scenario: scenario.testName,
                passed,
                issues,
                questionType: result.question?.type,
                question: result.question?.content
            });
        }
        catch (error) {
            console.log(`  ❌ ERROR: ${error}`);
            failCount++;
            results.push({
                scenario: scenario.testName,
                passed: false,
                error: String(error)
            });
        }
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    // Test consistency - run same scenario 3 times
    console.log('\n\n📊 CONSISTENCY TEST');
    console.log('='.repeat(60));
    const consistencyScenario = {
        user: { gradeLevel: '5', career: 'Engineer' },
        system: {
            subject: 'Math',
            skillName: 'Which number is smaller',
            skillId: 'MATH.5.COMP.1'
        }
    };
    const consistencyResults = [];
    console.log('Running "Which number is smaller" 3 times...\n');
    for (let i = 0; i < 3; i++) {
        const result = await PerfectPipelineIntegration_1.perfectPipeline.runCompletePipeline(consistencyScenario.user, consistencyScenario.system);
        console.log(`Run ${i + 1}: Type=${result.question?.type}, Q="${result.question?.content?.substring(0, 50)}..."`);
        consistencyResults.push({
            type: result.question?.type,
            question: result.question?.content
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const types = consistencyResults.map(r => r.type);
    const allMultipleChoice = types.every(t => t === 'multiple_choice');
    const noTrueFalse = !types.includes('true_false');
    console.log(`\n✅ All multiple_choice: ${allMultipleChoice ? 'YES' : 'NO'}`);
    console.log(`✅ No true_false: ${noTrueFalse ? 'YES' : 'NO'}`);
    // Final Report
    console.log('\n\n' + '='.repeat(60));
    console.log('📈 MODULAR SYSTEM TEST REPORT');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${TEST_SCENARIOS.length}`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`Success Rate: ${((passCount / TEST_SCENARIOS.length) * 100).toFixed(1)}%`);
    const consistencyPassed = allMultipleChoice && noTrueFalse;
    console.log(`\nConsistency Test: ${consistencyPassed ? '✅ PASSED' : '❌ FAILED'}`);
    // Save report
    const report = {
        timestamp: new Date().toISOString(),
        modularSystemTest: true,
        summary: {
            totalTests: TEST_SCENARIOS.length,
            passed: passCount,
            failed: failCount,
            successRate: ((passCount / TEST_SCENARIOS.length) * 100).toFixed(1) + '%'
        },
        results,
        consistencyTest: {
            passed: consistencyPassed,
            results: consistencyResults
        }
    };
    fs.writeFileSync('modular-system-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved to: modular-system-test-report.json');
    // Overall assessment
    const overallSuccess = (passCount / TEST_SCENARIOS.length) * 100 >= 80 && consistencyPassed;
    if (overallSuccess) {
        console.log('\n✅ MODULAR SYSTEM SHOWS SIGNIFICANT IMPROVEMENT');
    }
    else {
        console.log('\n⚠️  MODULAR SYSTEM NEEDS FURTHER REFINEMENT');
    }
}
// Run the test
testModularSystem().catch(console.error);
