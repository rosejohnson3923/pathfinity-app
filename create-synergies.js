/**
 * Create missing synergies for Technology and Finance
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSynergies() {
    console.log('🤝 Creating Missing Synergies...\n');

    // Technology Synergies
    const { data: techIndustry } = await supabase
        .from('cc_industries')
        .select('id')
        .eq('code', 'technology')
        .single();

    if (techIndustry) {
        console.log('💻 Creating Technology Synergies...\n');

        // Agile Dev Team: Junior Developer + Full-Stack Developer
        const { error: tech1Error } = await supabase
            .from('cc_synergies')
            .insert({
                industry_id: techIndustry.id,
                synergy_name: 'Agile Development Team',
                synergy_type: 'additive',
                required_roles: ['Junior Developer', 'Full-Stack Developer'],
                power_bonus: 6,
                power_multiplier: 1.0,
                description: 'Junior and senior developers collaborate for rapid feature delivery',
                explanation: 'The junior developer learns from the full-stack developer while contributing fresh perspectives and enthusiasm',
                real_world_example: 'Successful tech companies pair junior and senior developers for mentorship and knowledge transfer',
                activation_message: '💻 Agile Development Team Activated! Rapid iteration mode engaged!',
                visual_effect: 'tech_synergy'
            });

        if (!tech1Error) {
            console.log('✅ Created: Agile Development Team (+6)');
        }

        // DevOps Excellence: DevOps Engineer + Tech Lead
        const { error: tech2Error } = await supabase
            .from('cc_synergies')
            .insert({
                industry_id: techIndustry.id,
                synergy_name: 'DevOps Excellence',
                synergy_type: 'additive',
                required_roles: ['DevOps Engineer', 'Tech Lead'],
                power_bonus: 9,
                power_multiplier: 1.0,
                description: 'Infrastructure and leadership combine for seamless deployments',
                explanation: 'The DevOps engineer ensures smooth operations while the tech lead drives technical strategy',
                real_world_example: 'Leading tech companies rely on strong DevOps practices guided by experienced technical leadership',
                activation_message: '🚀 DevOps Excellence Activated! Zero-downtime deployment ready!',
                visual_effect: 'tech_synergy'
            });

        if (!tech2Error) {
            console.log('✅ Created: DevOps Excellence (+9)');
        }
    }

    // Finance Synergies
    const { data: finIndustry } = await supabase
        .from('cc_industries')
        .select('id')
        .eq('code', 'finance')
        .single();

    if (finIndustry) {
        console.log('\n💰 Creating Finance Synergies...\n');

        // Investment Strategy Team: Financial Analyst + Investment Banker
        const { error: fin1Error } = await supabase
            .from('cc_synergies')
            .insert({
                industry_id: finIndustry.id,
                synergy_name: 'Investment Strategy Team',
                synergy_type: 'additive',
                required_roles: ['Financial Analyst', 'Investment Banker'],
                power_bonus: 7,
                power_multiplier: 1.0,
                description: 'Analysis and execution combine for superior investment returns',
                explanation: 'The analyst provides deep market insights while the banker executes sophisticated deals',
                real_world_example: 'Wall Street firms pair analysts with bankers to identify and close lucrative opportunities',
                activation_message: '💰 Investment Strategy Team Activated! Markets favor the prepared!',
                visual_effect: 'finance_synergy'
            });

        if (!fin1Error) {
            console.log('✅ Created: Investment Strategy Team (+7)');
        }

        // Executive Finance Team: Investment Banker + CFO
        const { error: fin2Error } = await supabase
            .from('cc_synergies')
            .insert({
                industry_id: finIndustry.id,
                synergy_name: 'Executive Finance Team',
                synergy_type: 'additive',
                required_roles: ['Investment Banker', 'CFO'],
                power_bonus: 10,
                power_multiplier: 1.0,
                description: 'C-suite leadership and investment expertise drive company growth',
                explanation: 'The CFO provides strategic financial oversight while the banker brings deal-making expertise',
                real_world_example: 'Fortune 500 companies leverage this partnership for mergers, acquisitions, and IPOs',
                activation_message: '📈 Executive Finance Team Activated! Billion-dollar decisions ahead!',
                visual_effect: 'finance_synergy'
            });

        if (!fin2Error) {
            console.log('✅ Created: Executive Finance Team (+10)');
        }
    }

    console.log('\n✨ Synergy creation complete!');
}

createSynergies();