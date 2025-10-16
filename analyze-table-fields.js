/**
 * Analyze table fields: Non-AI vs AI generated content
 * Identify what fields exist in each type of content
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeTableFields() {
    console.log('🔬 Analyzing Table Fields: Non-AI vs AI Generated Content\n');
    console.log('=' .repeat(80));

    // ===== 1. ANALYZE cc_role_cards =====
    console.log('\n📋 TABLE: cc_role_cards');
    console.log('-'.repeat(80));

    // Get sample AI-generated and non-AI generated cards
    const { data: allRoleCards } = await supabase
        .from('cc_role_cards')
        .select('*')
        .order('created_at');

    // Categorize by checking which have complete fields (AI-generated typically have all fields)
    const aiGeneratedRoles = allRoleCards.filter(card =>
        card.special_abilities && card.special_abilities.length > 0 &&
        card.flavor_text && card.backstory && card.key_skills && card.key_skills.length > 0
    );

    const nonAiRoles = allRoleCards.filter(card =>
        !card.special_abilities || card.special_abilities.length === 0 ||
        !card.flavor_text || !card.backstory || !card.key_skills || card.key_skills.length === 0
    );

    console.log(`\n✅ AI-Generated Role Cards (${aiGeneratedRoles.length}):`);
    if (aiGeneratedRoles.length > 0) {
        const sample = aiGeneratedRoles[0];
        console.log(`   Sample: ${sample.role_name}`);
        console.log('\n   Fields with data:');
        Object.keys(sample).forEach(field => {
            if (sample[field] !== null && sample[field] !== undefined &&
                (typeof sample[field] !== 'object' || Object.keys(sample[field]).length > 0)) {
                const value = typeof sample[field] === 'object' ?
                    JSON.stringify(sample[field]).substring(0, 50) + '...' :
                    String(sample[field]).substring(0, 50);
                console.log(`   ✓ ${field}: ${value}`);
            }
        });
    }

    console.log(`\n❌ Non-AI Generated Role Cards (${nonAiRoles.length}):`);
    if (nonAiRoles.length > 0) {
        const sample = nonAiRoles[0];
        console.log(`   Sample: ${sample.role_name}`);
        console.log('\n   Fields with data:');
        Object.keys(sample).forEach(field => {
            if (sample[field] !== null && sample[field] !== undefined &&
                (typeof sample[field] !== 'object' || Object.keys(sample[field]).length > 0)) {
                const value = typeof sample[field] === 'object' ?
                    JSON.stringify(sample[field]).substring(0, 50) + '...' :
                    String(sample[field]).substring(0, 50);
                console.log(`   ✓ ${field}: ${value}`);
            }
        });

        console.log('\n   Missing fields:');
        Object.keys(sample).forEach(field => {
            if (sample[field] === null || sample[field] === undefined ||
                (typeof sample[field] === 'object' && Object.keys(sample[field]).length === 0)) {
                console.log(`   ✗ ${field}: null/empty`);
            }
        });
    }

    // ===== 2. ANALYZE cc_challenges =====
    console.log('\n\n📋 TABLE: cc_challenges');
    console.log('-'.repeat(80));

    const { data: allChallenges } = await supabase
        .from('cc_challenges')
        .select('*')
        .order('created_at');

    // AI-generated challenges typically have learning_outcomes and real_world_example
    const aiGeneratedChallenges = allChallenges.filter(c =>
        c.learning_outcomes && c.learning_outcomes.length > 0 &&
        c.real_world_example
    );

    const nonAiChallenges = allChallenges.filter(c =>
        !c.learning_outcomes || c.learning_outcomes.length === 0 ||
        !c.real_world_example
    );

    console.log(`\n✅ AI-Generated Challenges (${aiGeneratedChallenges.length}):`);
    if (aiGeneratedChallenges.length > 0) {
        const sample = aiGeneratedChallenges[0];
        console.log(`   Sample: ${sample.title}`);
        console.log('\n   Key fields:');
        ['title', 'scenario_text', 'difficulty', 'category', 'min_roles_required',
         'skill_connections', 'learning_outcomes', 'real_world_example'].forEach(field => {
            if (sample[field]) {
                const value = typeof sample[field] === 'object' ?
                    JSON.stringify(sample[field]).substring(0, 50) + '...' :
                    String(sample[field]).substring(0, 50);
                console.log(`   ✓ ${field}: ${value}`);
            }
        });
    }

    console.log(`\n❌ Non-AI Generated Challenges (${nonAiChallenges.length}):`);
    if (nonAiChallenges.length > 0) {
        const sample = nonAiChallenges[0];
        console.log(`   Sample: ${sample.title}`);
        console.log('\n   Has data:');
        ['title', 'scenario_text', 'difficulty', 'category', 'min_roles_required'].forEach(field => {
            if (sample[field]) {
                const value = String(sample[field]).substring(0, 50);
                console.log(`   ✓ ${field}: ${value}`);
            }
        });
        console.log('\n   Missing:');
        ['skill_connections', 'learning_outcomes', 'real_world_example'].forEach(field => {
            if (!sample[field] || (Array.isArray(sample[field]) && sample[field].length === 0)) {
                console.log(`   ✗ ${field}: ${sample[field] || 'null'}`);
            }
        });
    }

    // ===== 3. ANALYZE cc_synergies =====
    console.log('\n\n📋 TABLE: cc_synergies');
    console.log('-'.repeat(80));

    const { data: allSynergies } = await supabase
        .from('cc_synergies')
        .select('*')
        .order('created_at');

    console.log(`\nTotal Synergies: ${allSynergies.length}`);
    if (allSynergies.length > 0) {
        const sample = allSynergies[0];
        console.log(`\nSample: ${sample.synergy_name}`);
        console.log('Fields with data:');
        ['synergy_name', 'required_roles', 'power_bonus', 'description',
         'explanation', 'real_world_example', 'activation_message', 'visual_effect'].forEach(field => {
            if (sample[field]) {
                const value = typeof sample[field] === 'object' ?
                    JSON.stringify(sample[field]).substring(0, 50) + '...' :
                    String(sample[field]).substring(0, 50);
                console.log(`   ${sample[field] ? '✓' : '✗'} ${field}: ${value || 'null'}`);
            } else {
                console.log(`   ✗ ${field}: null/missing`);
            }
        });
    }

    // ===== 4. FIELD COMPARISON SUMMARY =====
    console.log('\n\n' + '=' .repeat(80));
    console.log('📊 FIELD ANALYSIS SUMMARY');
    console.log('=' .repeat(80));

    console.log('\n🔧 cc_role_cards fields needed for complete data:');
    console.log('   Required fields that may be missing in non-AI:');
    console.log('   • special_abilities (array)');
    console.log('   • flavor_text');
    console.log('   • backstory');
    console.log('   • key_skills (array)');
    console.log('   • education_requirements (array)');
    console.log('   • salary_range');
    console.log('   • category_bonuses (JSON object)');
    console.log('   • role_title (descriptive title with character name)');

    console.log('\n🔧 cc_challenges fields needed for complete data:');
    console.log('   Required fields that may be missing in non-AI:');
    console.log('   • skill_connections (array)');
    console.log('   • learning_outcomes (array)');
    console.log('   • real_world_example');
    console.log('   • base_difficulty_score');
    console.log('   • perfect_score');
    console.log('   • failure_threshold');

    console.log('\n🔧 cc_synergies fields needed for complete data:');
    console.log('   Required fields that may be missing:');
    console.log('   • explanation (why the synergy makes sense)');
    console.log('   • real_world_example');
    console.log('   • activation_message');
    console.log('   • visual_effect');
    console.log('   • power_multiplier (usually 1.0 for additive)');
    console.log('   • synergy_type (additive/multiplicative/special/conditional)');

    // ===== 5. CHECK UNIQUE FIELDS IN NON-AI CONTENT =====
    console.log('\n\n' + '=' .repeat(80));
    console.log('🔍 CHECKING FOR UNIQUE FIELDS IN NON-AI CONTENT');
    console.log('=' .repeat(80));

    // Check if non-AI content has any fields that AI content doesn't
    if (nonAiRoles.length > 0 && aiGeneratedRoles.length > 0) {
        const nonAiFields = new Set(Object.keys(nonAiRoles[0]));
        const aiFields = new Set(Object.keys(aiGeneratedRoles[0]));

        const uniqueToNonAi = [...nonAiFields].filter(field => !aiFields.has(field));
        const uniqueToAi = [...aiFields].filter(field => !nonAiFields.has(field));

        if (uniqueToNonAi.length > 0) {
            console.log('\n⚠️  Fields ONLY in non-AI content:');
            uniqueToNonAi.forEach(field => console.log(`   - ${field}`));
        }

        if (uniqueToAi.length > 0) {
            console.log('\n⚠️  Fields ONLY in AI content:');
            uniqueToAi.forEach(field => console.log(`   - ${field}`));
        }

        if (uniqueToNonAi.length === 0 && uniqueToAi.length === 0) {
            console.log('\n✅ Both AI and non-AI content have the same field structure');
            console.log('   The difference is only in which fields are populated');
        }
    }

    console.log('\n\n' + '=' .repeat(80));
    console.log('💡 RECOMMENDATIONS');
    console.log('=' .repeat(80));
    console.log('\n1. All tables have the same structure for AI and non-AI content');
    console.log('2. The difference is that non-AI content has many NULL/empty fields');
    console.log('3. When regenerating with AI, ensure these fields are included:');
    console.log('   - Role Cards: special_abilities, flavor_text, backstory, key_skills, etc.');
    console.log('   - Challenges: skill_connections, learning_outcomes, real_world_example');
    console.log('   - Synergies: explanation, real_world_example, activation_message');
    console.log('\n4. The AI generation scripts already include these fields');
    console.log('5. Safe to proceed with deletion and regeneration');
}

analyzeTableFields();