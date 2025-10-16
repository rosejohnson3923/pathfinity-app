/**
 * Check progress of AI content generation
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProgress() {
    console.log('📊 Checking AI Content Generation Progress\n');
    console.log('=' .repeat(60));

    // Check industries
    const { data: industries } = await supabase
        .from('cc_industries')
        .select('code, name, icon')
        .order('created_at');

    console.log(`\n✅ Industries Created: ${industries?.length || 0}`);
    if (industries && industries.length > 0) {
        industries.forEach(ind => {
            console.log(`   • ${ind.name} ${ind.icon} (${ind.code})`);
        });
    }

    // Check content per industry
    for (const industry of (industries || [])) {
        const { data: ind } = await supabase
            .from('cc_industries')
            .select('*')
            .eq('code', industry.code)
            .single();

        console.log(`\n📋 ${industry.name} Industry:`);

        // Count content
        const { count: roleCount } = await supabase
            .from('cc_role_cards')
            .select('*', { count: 'exact', head: true })
            .eq('industry_id', ind.id);

        const { count: challengeCount } = await supabase
            .from('cc_challenges')
            .select('*', { count: 'exact', head: true })
            .eq('industry_id', ind.id);

        const { count: synergyCount } = await supabase
            .from('cc_synergies')
            .select('*', { count: 'exact', head: true })
            .eq('industry_id', ind.id);

        console.log(`   Role Cards: ${roleCount || 0}`);
        console.log(`   Challenges: ${challengeCount || 0}`);
        console.log(`   Synergies: ${synergyCount || 0}`);

        // Check if has complete metadata
        if (ind.color_scheme) {
            console.log(`   ✓ Has color scheme: ${ind.color_scheme.primary}`);
        }
        if (ind.challenge_categories && ind.challenge_categories.length > 0) {
            console.log(`   ✓ Has ${ind.challenge_categories.length} categories`);
        }
        if (ind.learning_objectives && ind.learning_objectives.length > 0) {
            console.log(`   ✓ Has ${ind.learning_objectives.length} learning objectives`);
        }
    }

    // Overall totals
    const { count: totalRoles } = await supabase
        .from('cc_role_cards')
        .select('*', { count: 'exact', head: true });

    const { count: totalChallenges } = await supabase
        .from('cc_challenges')
        .select('*', { count: 'exact', head: true });

    const { count: totalSynergies } = await supabase
        .from('cc_synergies')
        .select('*', { count: 'exact', head: true });

    console.log('\n' + '=' .repeat(60));
    console.log('📈 TOTAL CONTENT GENERATED:');
    console.log(`   Industries: ${industries?.length || 0}`);
    console.log(`   Role Cards: ${totalRoles || 0}`);
    console.log(`   Challenges: ${totalChallenges || 0}`);
    console.log(`   Synergies: ${totalSynergies || 0}`);
    console.log('=' .repeat(60));

    // Check sample role card for field completeness
    const { data: sampleRole } = await supabase
        .from('cc_role_cards')
        .select('*')
        .limit(1)
        .single();

    if (sampleRole) {
        console.log('\n🔍 Sample Role Card Field Check:');
        const fields = [
            'special_abilities',
            'flavor_text',
            'backstory',
            'key_skills',
            'education_requirements',
            'salary_range',
            'category_bonuses'
        ];

        fields.forEach(field => {
            const hasField = sampleRole[field] !== null &&
                           (Array.isArray(sampleRole[field]) ? sampleRole[field].length > 0 : true);
            console.log(`   ${hasField ? '✓' : '✗'} ${field}`);
        });
    }

    // Check sample challenge for field completeness
    const { data: sampleChallenge } = await supabase
        .from('cc_challenges')
        .select('*')
        .limit(1)
        .single();

    if (sampleChallenge) {
        console.log('\n🔍 Sample Challenge Field Check:');
        const fields = [
            'recommended_roles',
            'required_roles',
            'skill_connections',
            'learning_outcomes',
            'real_world_example',
            'time_pressure_level'
        ];

        fields.forEach(field => {
            const hasField = sampleChallenge[field] !== null &&
                           (Array.isArray(sampleChallenge[field]) ? sampleChallenge[field].length > 0 : true);
            console.log(`   ${hasField ? '✓' : '✗'} ${field}`);
        });
    }
}

checkProgress();