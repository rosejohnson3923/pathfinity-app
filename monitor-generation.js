/**
 * Monitor AI generation progress in real-time
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function monitorProgress() {
    console.clear();
    console.log('🔄 AI CONTENT GENERATION MONITOR');
    console.log('=' .repeat(60));
    console.log(new Date().toLocaleTimeString());
    console.log('=' .repeat(60));

    // Get all industries
    const { data: industries } = await supabase
        .from('cc_industries')
        .select('code, name, icon, id')
        .order('created_at');

    const totals = {
        industries: 0,
        roles: 0,
        challenges: 0,
        synergies: 0
    };

    for (const industry of (industries || [])) {
        totals.industries++;

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

        totals.roles += roleCount || 0;
        totals.challenges += challengeCount || 0;
        totals.synergies += synergyCount || 0;

        // Progress bar for each industry
        const roleProgress = Math.min(10, roleCount || 0);
        const challengeProgress = Math.min(6, challengeCount || 0);
        const synergyProgress = Math.min(4, synergyCount || 0);

        console.log(`\n${industry.icon} ${industry.name}`);
        console.log(`   Roles:      [${'█'.repeat(roleProgress)}${'.'.repeat(10 - roleProgress)}] ${roleCount}/10`);
        console.log(`   Challenges: [${'█'.repeat(challengeProgress)}${'.'.repeat(6 - challengeProgress)}] ${challengeCount}/6`);
        console.log(`   Synergies:  [${'█'.repeat(synergyProgress)}${'.'.repeat(4 - synergyProgress)}] ${synergyCount}/4`);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('📊 TOTALS:');
    console.log(`   Industries: ${totals.industries}/5`);
    console.log(`   Role Cards: ${totals.roles}/50 (target)`);
    console.log(`   Challenges: ${totals.challenges}/30 (target)`);
    console.log(`   Synergies: ${totals.synergies}/20 (target)`);

    // Estimate completion
    const totalItems = totals.roles + totals.challenges + totals.synergies;
    const targetItems = 100; // 50 roles + 30 challenges + 20 synergies
    const percentComplete = Math.round((totalItems / targetItems) * 100);

    console.log('\n📈 Overall Progress:');
    const progressBar = Math.round(percentComplete / 5);
    console.log(`   [${'█'.repeat(progressBar)}${'.'.repeat(20 - progressBar)}] ${percentComplete}%`);

    if (percentComplete < 100) {
        console.log('\n⏳ Generation in progress...');
        console.log('   Refresh to see updates');
    } else {
        console.log('\n✅ Generation complete!');
    }
}

// Run once
monitorProgress();