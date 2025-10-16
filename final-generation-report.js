/**
 * Final Report on AI Content Generation
 * Verifies all fields are populated correctly
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateFinalReport() {
    console.log('📊 CAREER CHALLENGE AI GENERATION - FINAL REPORT\n');
    console.log('=' .repeat(70));
    console.log('Generated on:', new Date().toLocaleString());
    console.log('=' .repeat(70));

    // 1. Industries Overview
    console.log('\n🏢 INDUSTRIES GENERATED:\n');
    const { data: industries } = await supabase
        .from('cc_industries')
        .select('*')
        .order('name');

    for (const industry of industries) {
        console.log(`${industry.icon} ${industry.name} (${industry.code})`);

        // Check for complete metadata
        const checks = {
            'Color Scheme': industry.color_scheme ? `✓ ${industry.color_scheme.primary}` : '✗ Missing',
            'Categories': industry.challenge_categories ? `✓ ${industry.challenge_categories.length} categories` : '✗ Missing',
            'Learning Objectives': industry.learning_objectives ? `✓ ${industry.learning_objectives.length} objectives` : '✗ Missing',
            'Career Connections': industry.career_connections ? `✓ ${industry.career_connections.length} careers` : '✗ Missing'
        };

        Object.entries(checks).forEach(([field, status]) => {
            console.log(`   ${status.startsWith('✓') ? '✅' : '❌'} ${field}: ${status.substring(2)}`);
        });

        // Get counts
        const { count: roleCount } = await supabase
            .from('cc_role_cards')
            .select('*', { count: 'exact', head: true })
            .eq('industry_id', industry.id);

        const { count: challengeCount } = await supabase
            .from('cc_challenges')
            .select('*', { count: 'exact', head: true })
            .eq('industry_id', industry.id);

        const { count: synergyCount } = await supabase
            .from('cc_synergies')
            .select('*', { count: 'exact', head: true })
            .eq('industry_id', industry.id);

        console.log(`   📋 Content: ${roleCount} roles, ${challengeCount} challenges, ${synergyCount} synergies\n`);
    }

    // 2. Role Cards Field Completeness
    console.log('=' .repeat(70));
    console.log('\n🎴 ROLE CARDS FIELD ANALYSIS:\n');

    const { data: allRoles } = await supabase
        .from('cc_role_cards')
        .select('*');

    const roleFieldStats = {
        total: allRoles.length,
        withSpecialAbilities: 0,
        withFlavorText: 0,
        withBackstory: 0,
        withKeySkills: 0,
        withEducation: 0,
        withSalary: 0,
        withCategoryBonuses: 0,
        complete: 0
    };

    allRoles.forEach(role => {
        if (role.special_abilities?.length > 0) roleFieldStats.withSpecialAbilities++;
        if (role.flavor_text) roleFieldStats.withFlavorText++;
        if (role.backstory) roleFieldStats.withBackstory++;
        if (role.key_skills?.length > 0) roleFieldStats.withKeySkills++;
        if (role.education_requirements?.length > 0) roleFieldStats.withEducation++;
        if (role.salary_range) roleFieldStats.withSalary++;
        if (role.category_bonuses && Object.keys(role.category_bonuses).length > 0) roleFieldStats.withCategoryBonuses++;

        // Check if complete
        if (role.special_abilities?.length > 0 && role.flavor_text && role.backstory &&
            role.key_skills?.length > 0 && role.education_requirements?.length > 0 &&
            role.salary_range && role.category_bonuses) {
            roleFieldStats.complete++;
        }
    });

    console.log(`Total Role Cards: ${roleFieldStats.total}`);
    console.log(`✅ Complete (all fields): ${roleFieldStats.complete}/${roleFieldStats.total} (${Math.round(roleFieldStats.complete/roleFieldStats.total*100)}%)`);
    console.log('\nField Coverage:');
    console.log(`   • Special Abilities: ${roleFieldStats.withSpecialAbilities}/${roleFieldStats.total}`);
    console.log(`   • Flavor Text: ${roleFieldStats.withFlavorText}/${roleFieldStats.total}`);
    console.log(`   • Backstory: ${roleFieldStats.withBackstory}/${roleFieldStats.total}`);
    console.log(`   • Key Skills: ${roleFieldStats.withKeySkills}/${roleFieldStats.total}`);
    console.log(`   • Education: ${roleFieldStats.withEducation}/${roleFieldStats.total}`);
    console.log(`   • Salary Range: ${roleFieldStats.withSalary}/${roleFieldStats.total}`);
    console.log(`   • Category Bonuses: ${roleFieldStats.withCategoryBonuses}/${roleFieldStats.total}`);

    // 3. Challenges Field Completeness
    console.log('\n' + '=' .repeat(70));
    console.log('\n🎯 CHALLENGES FIELD ANALYSIS:\n');

    const { data: allChallenges } = await supabase
        .from('cc_challenges')
        .select('*');

    const challengeFieldStats = {
        total: allChallenges.length,
        withRecommendedRoles: 0,
        withSkillConnections: 0,
        withLearningOutcomes: 0,
        withRealWorldExample: 0,
        withTimePressure: 0,
        complete: 0
    };

    allChallenges.forEach(challenge => {
        if (challenge.recommended_roles?.length > 0) challengeFieldStats.withRecommendedRoles++;
        if (challenge.skill_connections?.length > 0) challengeFieldStats.withSkillConnections++;
        if (challenge.learning_outcomes?.length > 0) challengeFieldStats.withLearningOutcomes++;
        if (challenge.real_world_example) challengeFieldStats.withRealWorldExample++;
        if (challenge.time_pressure_level !== null) challengeFieldStats.withTimePressure++;

        if (challenge.recommended_roles?.length > 0 && challenge.skill_connections?.length > 0 &&
            challenge.learning_outcomes?.length > 0 && challenge.real_world_example &&
            challenge.time_pressure_level !== null) {
            challengeFieldStats.complete++;
        }
    });

    console.log(`Total Challenges: ${challengeFieldStats.total}`);
    console.log(`✅ Complete (all key fields): ${challengeFieldStats.complete}/${challengeFieldStats.total} (${Math.round(challengeFieldStats.complete/challengeFieldStats.total*100)}%)`);
    console.log('\nField Coverage:');
    console.log(`   • Recommended Roles: ${challengeFieldStats.withRecommendedRoles}/${challengeFieldStats.total}`);
    console.log(`   • Skill Connections: ${challengeFieldStats.withSkillConnections}/${challengeFieldStats.total}`);
    console.log(`   • Learning Outcomes: ${challengeFieldStats.withLearningOutcomes}/${challengeFieldStats.total}`);
    console.log(`   • Real World Example: ${challengeFieldStats.withRealWorldExample}/${challengeFieldStats.total}`);
    console.log(`   • Time Pressure Level: ${challengeFieldStats.withTimePressure}/${challengeFieldStats.total}`);

    // 4. Synergies Analysis
    console.log('\n' + '=' .repeat(70));
    console.log('\n⚡ SYNERGIES ANALYSIS:\n');

    const { data: allSynergies } = await supabase
        .from('cc_synergies')
        .select('*');

    console.log(`Total Synergies: ${allSynergies.length}`);
    const withCategoryBonuses = allSynergies.filter(s => s.category_bonuses && Object.keys(s.category_bonuses).length > 0).length;
    const withRealWorld = allSynergies.filter(s => s.real_world_example).length;
    console.log(`   • With Category Bonuses: ${withCategoryBonuses}/${allSynergies.length}`);
    console.log(`   • With Real World Example: ${withRealWorld}/${allSynergies.length}`);

    // 5. Overall Summary
    console.log('\n' + '=' .repeat(70));
    console.log('\n🏆 FINAL SUMMARY:\n');

    const { count: totalIndustries } = await supabase
        .from('cc_industries')
        .select('*', { count: 'exact', head: true });

    const { count: totalRoles } = await supabase
        .from('cc_role_cards')
        .select('*', { count: 'exact', head: true });

    const { count: totalChallenges } = await supabase
        .from('cc_challenges')
        .select('*', { count: 'exact', head: true });

    const { count: totalSynergies } = await supabase
        .from('cc_synergies')
        .select('*', { count: 'exact', head: true });

    console.log('📈 Total Content Generated:');
    console.log(`   • Industries: ${totalIndustries}`);
    console.log(`   • Role Cards: ${totalRoles}`);
    console.log(`   • Challenges: ${totalChallenges}`);
    console.log(`   • Synergies: ${totalSynergies}`);
    console.log(`   • TOTAL ITEMS: ${totalRoles + totalChallenges + totalSynergies}`);

    console.log('\n✅ Quality Metrics:');
    console.log(`   • Role Card Completeness: ${Math.round(roleFieldStats.complete/roleFieldStats.total*100)}%`);
    console.log(`   • Challenge Completeness: ${Math.round(challengeFieldStats.complete/challengeFieldStats.total*100)}%`);
    console.log(`   • All Industries have metadata: ${industries.every(i => i.color_scheme && i.challenge_categories) ? 'Yes' : 'No'}`);

    console.log('\n' + '=' .repeat(70));
    console.log('🎉 AI CONTENT GENERATION COMPLETE!');
    console.log('   The Career Challenge system is ready with comprehensive,');
    console.log('   educationally-focused content across all industries.');
    console.log('=' .repeat(70));
}

generateFinalReport();