#!/usr/bin/env tsx
// ================================================================
// RUN MCP DIFF ANALYSIS - SKILL CODE FORMAT STANDARDIZATION
// Executes the MCP Diff validation for the skill code format change
// ================================================================

import { mcpDiffService } from '../mcp/diff-validator/MCPDiffService';

async function main() {
  console.log('🚀 Starting MCP Diff Analysis for Skill Code Format Standardization...\n');

  try {
    // Run the comprehensive analysis
    const result = await mcpDiffService.analyzeSkillCodeFormatChange();
    
    // Display executive summary
    console.log('\n📋 EXECUTIVE SUMMARY');
    console.log('='.repeat(60));
    console.log(`🎯 Change ID: ${result.changeId}`);
    console.log(`⚠️  Overall Risk: ${result.overallRisk.toUpperCase()}`);
    console.log(`✅ Recommendation: ${result.recommendation.replace(/_/g, ' ').toUpperCase()}`);
    console.log(`🗓️  Analysis Date: ${new Date(result.timestamp).toLocaleDateString()}`);
    
    // Key metrics
    const criticalImpacts = result.componentImpacts.filter(i => i.impactLevel === 'critical').length;
    const highImpacts = result.componentImpacts.filter(i => i.impactLevel === 'high').length;
    const mediumImpacts = result.componentImpacts.filter(i => i.impactLevel === 'medium').length;
    const lowImpacts = result.componentImpacts.filter(i => i.impactLevel === 'low').length;

    console.log('\n📊 IMPACT BREAKDOWN');
    console.log('-'.repeat(40));
    console.log(`🚨 Critical: ${criticalImpacts} component(s)`);
    console.log(`⚠️  High: ${highImpacts} component(s)`);
    console.log(`🟡 Medium: ${mediumImpacts} component(s)`);
    console.log(`🟢 Low: ${lowImpacts} component(s)`);

    console.log('\n🎯 KEY RECOMMENDATIONS');
    console.log('-'.repeat(40));
    
    if (result.recommendation === 'proceed_with_caution') {
      console.log('✅ PROCEED WITH CAUTION');
      console.log('   • This change fixes existing architecture inconsistencies');
      console.log('   • Follow the migration plan carefully');
      console.log('   • Complete all testing requirements');
      console.log('   • Monitor for issues during implementation');
    }
    
    console.log('\n💾 PERSISTENCE');
    console.log('-'.repeat(40));
    console.log('✅ Analysis results saved for future conversations');
    console.log(`📁 Location: mcp/diff-validator/results/${result.changeId}-result.json`);
    console.log('🔄 Use MCPDiffService.loadPreviousAnalysis() to retrieve');

    console.log('\n🔍 NEXT STEPS');
    console.log('-'.repeat(40));
    console.log('1. Review the detailed migration plan');
    console.log('2. Execute migration steps in order');
    console.log('3. Run comprehensive testing');
    console.log('4. Monitor cross-container data flow');
    console.log('5. Keep rollback plan available');

    return result;

  } catch (error) {
    console.error('❌ MCP Diff Analysis failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as runMCPDiffAnalysis };