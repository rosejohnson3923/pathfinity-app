/**
 * Career Challenge Database Schema Test
 *
 * Run this test to validate the Career Challenge database is properly set up
 * and can be accessed from the application
 */

import { supabase } from '../lib/supabase';
import type {
  Industry,
  Challenge,
  RoleCard,
  Synergy,
  dbIndustryToIndustry,
  dbChallengeToChallenge,
  dbRoleCardToRoleCard
} from '../types/CareerChallengeTypes';

/**
 * Color codes for console output
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Test result interface
 */
interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

class CareerChallengeDBTest {
  private results: TestResult[] = [];
  private client: any;

  async initialize() {
    this.client = await supabase();
    console.log(`${colors.cyan}${colors.bold}Starting Career Challenge Database Validation...${colors.reset}\n`);
  }

  /**
   * Test 1: Check if all tables exist
   */
  async testTablesExist(): Promise<void> {
    console.log(`${colors.blue}Testing: Table Creation${colors.reset}`);

    const expectedTables = [
      'cc_industries',
      'cc_challenges',
      'cc_role_cards',
      'cc_synergy_definitions',
      'cc_player_collections',
      'cc_challenge_sessions',
      'cc_player_progress',
      'cc_trading_post',
      'cc_daily_challenges'
    ];

    let foundTables = 0;
    for (const table of expectedTables) {
      const { error } = await this.client
        .from(table)
        .select('id')
        .limit(1);

      if (!error || error.code === 'PGRST116') { // PGRST116 = no rows, but table exists
        foundTables++;
        console.log(`  ✓ Table ${table} exists`);
      } else {
        console.log(`  ✗ Table ${table} missing or inaccessible: ${error.message}`);
      }
    }

    this.results.push({
      testName: 'Tables Exist',
      passed: foundTables === expectedTables.length,
      message: `Found ${foundTables}/${expectedTables.length} tables`,
      details: { foundTables, expectedTables: expectedTables.length }
    });
  }

  /**
   * Test 2: Check Industries
   */
  async testIndustries(): Promise<void> {
    console.log(`\n${colors.blue}Testing: Industries${colors.reset}`);

    const { data: industries, error } = await this.client
      .from('dd_industries')
      .select('*')
      .eq('is_active', true);

    if (error) {
      this.results.push({
        testName: 'Industries',
        passed: false,
        message: `Error fetching industries: ${error.message}`,
        details: error
      });
      return;
    }

    console.log(`  Found ${industries?.length || 0} active industries:`);
    industries?.forEach((ind: any) => {
      console.log(`    • ${ind.icon} ${ind.name} (${ind.code})`);
      console.log(`      Categories: ${ind.challenge_categories?.join(', ') || 'none'}`);
    });

    this.results.push({
      testName: 'Industries',
      passed: (industries?.length || 0) >= 3,
      message: `Found ${industries?.length || 0} industries (expected at least 3)`,
      details: industries?.map((i: any) => ({ code: i.code, name: i.name }))
    });
  }

  /**
   * Test 3: Check Challenges
   */
  async testChallenges(): Promise<void> {
    console.log(`\n${colors.blue}Testing: Challenges${colors.reset}`);

    const { data: challenges, error } = await this.client
      .from('dd_challenges')
      .select(`
        *,
        cc_industries (
          name,
          icon
        )
      `)
      .eq('is_active', true);

    if (error) {
      this.results.push({
        testName: 'Challenges',
        passed: false,
        message: `Error fetching challenges: ${error.message}`,
        details: error
      });
      return;
    }

    console.log(`  Found ${challenges?.length || 0} active challenges:`);
    challenges?.forEach((ch: any) => {
      console.log(`    • [${ch.difficulty.toUpperCase()}] ${ch.title}`);
      console.log(`      Industry: ${ch.cc_industries?.name || 'Unknown'}`);
      console.log(`      Score Required: ${ch.base_difficulty_score} (Perfect: ${ch.perfect_score})`);
    });

    this.results.push({
      testName: 'Challenges',
      passed: (challenges?.length || 0) >= 3,
      message: `Found ${challenges?.length || 0} challenges (expected at least 3)`,
      details: challenges?.map((c: any) => ({
        title: c.title,
        difficulty: c.difficulty,
        industry: c.cc_industries?.name
      }))
    });
  }

  /**
   * Test 4: Check Role Cards
   */
  async testRoleCards(): Promise<void> {
    console.log(`\n${colors.blue}Testing: Role Cards${colors.reset}`);

    const { data: roleCards, error } = await this.client
      .from('dd_role_cards')
      .select(`
        *,
        cc_industries (
          name,
          code
        )
      `)
      .eq('is_active', true)
      .order('rarity', { ascending: false });

    if (error) {
      this.results.push({
        testName: 'Role Cards',
        passed: false,
        message: `Error fetching role cards: ${error.message}`,
        details: error
      });
      return;
    }

    console.log(`  Found ${roleCards?.length || 0} active role cards:`);

    // Group by industry
    const byIndustry = roleCards?.reduce((acc: any, card: any) => {
      const industry = card.cc_industries?.name || 'Unknown';
      if (!acc[industry]) acc[industry] = [];
      acc[industry].push(card);
      return acc;
    }, {});

    Object.entries(byIndustry || {}).forEach(([industry, cards]: [string, any]) => {
      console.log(`    ${industry}:`);
      cards.forEach((card: any) => {
        const rarityEmoji = {
          mythic: '🌟',
          legendary: '⭐',
          epic: '💎',
          rare: '💜',
          uncommon: '🔵',
          common: '⚪'
        }[card.rarity] || '❓';
        console.log(`      ${rarityEmoji} ${card.role_name} (Power: ${card.base_power})`);
      });
    });

    this.results.push({
      testName: 'Role Cards',
      passed: (roleCards?.length || 0) >= 7,
      message: `Found ${roleCards?.length || 0} role cards (expected at least 7)`,
      details: byIndustry
    });
  }

  /**
   * Test 5: Check Synergies
   */
  async testSynergies(): Promise<void> {
    console.log(`\n${colors.blue}Testing: Synergies${colors.reset}`);

    const { data: synergies, error } = await this.client
      .from('dd_synergy_definitions')
      .select(`
        *,
        cc_industries (
          name
        )
      `)
      .eq('is_active', true);

    if (error) {
      this.results.push({
        testName: 'Synergies',
        passed: false,
        message: `Error fetching synergies: ${error.message}`,
        details: error
      });
      return;
    }

    console.log(`  Found ${synergies?.length || 0} active synergies:`);
    synergies?.forEach((syn: any) => {
      console.log(`    • ${syn.synergy_name} (+${syn.power_bonus} power)`);
      console.log(`      Industry: ${syn.cc_industries?.name}`);
      console.log(`      Requires: ${syn.required_roles?.join(' + ')}`);
    });

    this.results.push({
      testName: 'Synergies',
      passed: (synergies?.length || 0) >= 4,
      message: `Found ${synergies?.length || 0} synergies (expected at least 4)`,
      details: synergies?.map((s: any) => ({
        name: s.synergy_name,
        bonus: s.power_bonus,
        requires: s.required_roles
      }))
    });
  }

  /**
   * Test 6: Test team power calculation function
   */
  async testTeamPowerCalculation(): Promise<void> {
    console.log(`\n${colors.blue}Testing: Team Power Calculation${colors.reset}`);

    const testTeam = ['esports_coach_01', 'esports_analyst_01'];

    const { data, error } = await this.client
      .rpc('cc_calculate_team_power', {
        p_role_cards: testTeam,
        p_challenge_id: null
      });

    if (error) {
      this.results.push({
        testName: 'Team Power Calculation',
        passed: false,
        message: `Error calling function: ${error.message}`,
        details: error
      });
      return;
    }

    console.log(`  Test team: ${testTeam.join(' + ')}`);
    console.log(`  Result:`);
    console.log(`    • Total Power: ${data?.total_power || 0}`);
    console.log(`    • Synergies: ${data?.synergies_activated?.join(', ') || 'none'}`);
    console.log(`    • Synergy Bonus: ${data?.synergy_bonus || 0}`);

    this.results.push({
      testName: 'Team Power Calculation',
      passed: (data?.total_power || 0) > 0,
      message: `Calculated power: ${data?.total_power || 0}`,
      details: data
    });
  }

  /**
   * Test 7: Simulate a challenge evaluation
   */
  async testChallengeEvaluation(): Promise<void> {
    console.log(`\n${colors.blue}Testing: Challenge Evaluation${colors.reset}`);

    // Get a random challenge
    const { data: challenges } = await this.client
      .from('dd_challenges')
      .select('id, title, base_difficulty_score, perfect_score')
      .limit(1);

    if (!challenges || challenges.length === 0) {
      this.results.push({
        testName: 'Challenge Evaluation',
        passed: false,
        message: 'No challenges found to test',
        details: null
      });
      return;
    }

    const challenge = challenges[0];
    const testScores = [
      { power: challenge.perfect_score + 10, expected: 'perfect' },
      { power: challenge.base_difficulty_score + 5, expected: 'success' },
      { power: 20, expected: 'failure' }
    ];

    console.log(`  Testing challenge: ${challenge.title}`);
    console.log(`  Required score: ${challenge.base_difficulty_score}, Perfect: ${challenge.perfect_score}`);

    let allPassed = true;
    for (const test of testScores) {
      const { data, error } = await this.client
        .rpc('cc_evaluate_challenge', {
          p_team_power: test.power,
          p_challenge_id: challenge.id
        });

      const result = data || 'error';
      const passed = result === test.expected;
      allPassed = allPassed && passed;

      console.log(`    Power ${test.power}: ${result} ${passed ? '✓' : '✗'} (expected: ${test.expected})`);
    }

    this.results.push({
      testName: 'Challenge Evaluation',
      passed: allPassed,
      message: allPassed ? 'All evaluations correct' : 'Some evaluations failed',
      details: { challenge: challenge.title, tests: testScores }
    });
  }

  /**
   * Print summary of all tests
   */
  printSummary(): void {
    console.log(`\n${colors.cyan}${colors.bold}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}         TEST SUMMARY${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}═══════════════════════════════════════${colors.reset}\n`);

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    this.results.forEach(result => {
      const icon = result.passed ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
      const color = result.passed ? colors.green : colors.red;
      console.log(`${icon} ${color}${result.testName}${colors.reset}: ${result.message}`);
    });

    console.log(`\n${colors.bold}Results: ${colors.green}${passed} passed${colors.reset}, ${colors.red}${failed} failed${colors.reset} (${total} total)`);

    if (failed === 0) {
      console.log(`\n${colors.green}${colors.bold}🎉 All tests passed! Career Challenge is ready to play!${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  Some tests failed. Please check the errors above.${colors.reset}`);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    try {
      await this.initialize();
      await this.testTablesExist();
      await this.testIndustries();
      await this.testChallenges();
      await this.testRoleCards();
      await this.testSynergies();
      await this.testTeamPowerCalculation();
      await this.testChallengeEvaluation();
      this.printSummary();
    } catch (error) {
      console.error(`${colors.red}${colors.bold}Fatal error during testing:${colors.reset}`, error);
    }
  }
}

// Export test runner
export const validateCareerChallengeDB = async () => {
  const tester = new CareerChallengeDBTest();
  await tester.runAllTests();
};

// Run if executed directly
if (require.main === module) {
  validateCareerChallengeDB();
}