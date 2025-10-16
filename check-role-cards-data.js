/**
 * Check cc_role_cards for data inconsistencies
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRoleCardsData() {
    console.log('🔍 Checking cc_role_cards Data Consistency\n');
    console.log('=' .repeat(70));

    // Get all role cards
    const { data: roleCards, error } = await supabase
        .from('cc_role_cards')
        .select('*')
        .order('created_at');

    if (error) {
        console.error('Error fetching role cards:', error);
        return;
    }

    console.log(`\nTotal Role Cards: ${roleCards.length}\n`);

    // Check each role card for missing fields
    const missingData = {
        special_abilities: [],
        flavor_text: [],
        backstory: [],
        key_skills: [],
        education_requirements: [],
        salary_range: [],
        category_bonuses: []
    };

    roleCards.forEach(card => {
        console.log(`\n📋 ${card.role_name} (${card.rarity})`);
        console.log(`   Industry ID: ${card.industry_id}`);
        console.log(`   Power: ${card.base_power}`);

        // Check for missing/null fields
        const issues = [];

        if (!card.special_abilities || card.special_abilities.length === 0) {
            issues.push('❌ Missing: special_abilities');
            missingData.special_abilities.push(card.role_name);
        } else {
            console.log(`   ✅ Special Abilities: ${card.special_abilities.length} abilities`);
        }

        if (!card.flavor_text) {
            issues.push('❌ Missing: flavor_text');
            missingData.flavor_text.push(card.role_name);
        } else {
            console.log(`   ✅ Flavor Text: "${card.flavor_text.substring(0, 50)}..."`);
        }

        if (!card.backstory) {
            issues.push('❌ Missing: backstory');
            missingData.backstory.push(card.role_name);
        } else {
            console.log(`   ✅ Backstory: "${card.backstory.substring(0, 50)}..."`);
        }

        if (!card.key_skills || card.key_skills.length === 0) {
            issues.push('❌ Missing: key_skills');
            missingData.key_skills.push(card.role_name);
        } else {
            console.log(`   ✅ Key Skills: ${card.key_skills.join(', ')}`);
        }

        if (!card.education_requirements || card.education_requirements.length === 0) {
            issues.push('❌ Missing: education_requirements');
            missingData.education_requirements.push(card.role_name);
        } else {
            console.log(`   ✅ Education: ${card.education_requirements.length} requirements`);
        }

        if (!card.salary_range) {
            issues.push('❌ Missing: salary_range');
            missingData.salary_range.push(card.role_name);
        } else {
            console.log(`   ✅ Salary Range: ${card.salary_range}`);
        }

        if (!card.category_bonuses || Object.keys(card.category_bonuses).length === 0) {
            issues.push('❌ Missing: category_bonuses');
            missingData.category_bonuses.push(card.role_name);
        } else {
            console.log(`   ✅ Category Bonuses: ${JSON.stringify(card.category_bonuses)}`);
        }

        if (issues.length > 0) {
            console.log('\n   Issues Found:');
            issues.forEach(issue => console.log(`   ${issue}`));
        }
    });

    // Summary Report
    console.log('\n' + '=' .repeat(70));
    console.log('\n📊 MISSING DATA SUMMARY:\n');

    Object.entries(missingData).forEach(([field, cards]) => {
        if (cards.length > 0) {
            console.log(`\n❌ Missing ${field} (${cards.length} cards):`);
            cards.forEach(card => console.log(`   - ${card}`));
        }
    });

    // Identify which cards are complete vs incomplete
    const completeCards = roleCards.filter(card =>
        card.special_abilities && card.special_abilities.length > 0 &&
        card.flavor_text &&
        card.backstory &&
        card.key_skills && card.key_skills.length > 0 &&
        card.education_requirements && card.education_requirements.length > 0 &&
        card.salary_range &&
        card.category_bonuses && Object.keys(card.category_bonuses).length > 0
    );

    const incompleteCards = roleCards.filter(card =>
        !card.special_abilities || card.special_abilities.length === 0 ||
        !card.flavor_text ||
        !card.backstory ||
        !card.key_skills || card.key_skills.length === 0 ||
        !card.education_requirements || card.education_requirements.length === 0 ||
        !card.salary_range ||
        !card.category_bonuses || Object.keys(card.category_bonuses).length === 0
    );

    console.log('\n' + '=' .repeat(70));
    console.log(`\n✅ Complete Cards (${completeCards.length}):`);
    completeCards.forEach(card => console.log(`   - ${card.role_name}`));

    console.log(`\n⚠️  Incomplete Cards (${incompleteCards.length}):`);
    incompleteCards.forEach(card => console.log(`   - ${card.role_name}`));

    console.log('\n' + '=' .repeat(70));
    console.log('\n🔧 Next Steps:');
    console.log('1. The incomplete cards need to have their missing fields populated');
    console.log('2. Most incomplete cards are from the original non-AI generated content');
    console.log('3. We should update these cards with the missing data to ensure consistency');
}

checkRoleCardsData();