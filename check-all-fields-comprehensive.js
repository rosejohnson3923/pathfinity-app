/**
 * Comprehensive check of ALL fields in ALL Career Challenge tables
 * This will ensure we don't miss anything
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllFieldsComprehensive() {
    console.log('🔬 COMPREHENSIVE FIELD ANALYSIS OF ALL TABLES\n');
    console.log('=' .repeat(80));

    // ALL Career Challenge tables
    const tables = [
        'cc_industries',
        'cc_role_cards',
        'cc_challenges',
        'cc_synergies',
        'cc_game_sessions',
        'cc_game_session_players',
        'cc_challenge_progress',
        'cc_trading_market',
        'cc_ai_content_cache'
    ];

    const fieldAnalysis = {};

    for (const tableName of tables) {
        console.log(`\n📋 TABLE: ${tableName}`);
        console.log('-'.repeat(60));

        // Get ALL rows to see which fields are used
        const { data, error } = await supabase
            .from(tableName)
            .select('*');

        if (error) {
            console.log(`❌ Error: ${error.message}`);
            continue;
        }

        if (!data || data.length === 0) {
            console.log('   ⚪ No data in table');
            continue;
        }

        // Analyze all fields across all rows
        const allFields = new Set();
        const fieldsWithData = {};
        const fieldTypes = {};
        const fieldExamples = {};

        // Collect all fields from all rows
        data.forEach(row => {
            Object.keys(row).forEach(field => {
                allFields.add(field);

                // Track which fields have data
                if (!fieldsWithData[field]) {
                    fieldsWithData[field] = 0;
                }

                if (row[field] !== null && row[field] !== undefined &&
                    !(Array.isArray(row[field]) && row[field].length === 0) &&
                    !(typeof row[field] === 'object' && row[field] !== null && Object.keys(row[field]).length === 0)) {
                    fieldsWithData[field]++;

                    // Store an example value
                    if (!fieldExamples[field]) {
                        fieldExamples[field] = row[field];
                    }
                }

                // Track field type
                if (!fieldTypes[field] && row[field] !== null) {
                    if (Array.isArray(row[field])) {
                        fieldTypes[field] = 'array';
                    } else if (typeof row[field] === 'object') {
                        fieldTypes[field] = 'object';
                    } else {
                        fieldTypes[field] = typeof row[field];
                    }
                }
            });
        });

        console.log(`\nTotal rows: ${data.length}`);
        console.log(`Total fields: ${allFields.size}`);

        console.log('\n📊 Field Usage Analysis:');
        const sortedFields = Array.from(allFields).sort();

        sortedFields.forEach(field => {
            const usage = fieldsWithData[field] || 0;
            const percentage = ((usage / data.length) * 100).toFixed(1);
            const type = fieldTypes[field] || 'null';

            let status = '❌'; // Never used
            if (usage === data.length) status = '✅'; // Always used
            else if (usage > 0) status = '⚠️'; // Sometimes used

            console.log(`   ${status} ${field} (${type}): ${usage}/${data.length} rows (${percentage}%)`);

            if (fieldExamples[field] && type !== 'string' && type !== 'number' && type !== 'boolean') {
                const example = JSON.stringify(fieldExamples[field]).substring(0, 60);
                console.log(`      Example: ${example}`);
            }
        });

        // Store for summary
        fieldAnalysis[tableName] = {
            totalRows: data.length,
            totalFields: allFields.size,
            fields: sortedFields,
            fieldsWithData,
            fieldTypes,
            fieldExamples
        };
    }

    // Summary of important fields we might be missing
    console.log('\n\n' + '=' .repeat(80));
    console.log('🎯 CRITICAL FIELDS TO INCLUDE IN AI GENERATION');
    console.log('=' .repeat(80));

    // Check cc_challenges specifically
    if (fieldAnalysis['cc_challenges']) {
        console.log('\n📋 cc_challenges - Fields to ensure in AI generation:');
        const challengeFields = fieldAnalysis['cc_challenges'];
        const importantFields = [
            'recommended_roles',
            'required_roles',
            'restricted_roles',
            'skill_connections',
            'learning_outcomes',
            'real_world_example',
            'time_pressure_level',
            'base_difficulty_score',
            'perfect_score',
            'failure_threshold'
        ];

        importantFields.forEach(field => {
            const usage = challengeFields.fieldsWithData[field] || 0;
            const total = challengeFields.totalRows;
            const type = challengeFields.fieldTypes[field] || 'null';
            console.log(`   • ${field} (${type}): ${usage}/${total} rows have data`);
            if (challengeFields.fieldExamples[field]) {
                const example = JSON.stringify(challengeFields.fieldExamples[field]).substring(0, 50);
                console.log(`     Example: ${example}`);
            }
        });
    }

    // Check cc_role_cards
    if (fieldAnalysis['cc_role_cards']) {
        console.log('\n📋 cc_role_cards - Fields to ensure in AI generation:');
        const roleFields = fieldAnalysis['cc_role_cards'];
        const importantFields = [
            'special_abilities',
            'flavor_text',
            'backstory',
            'key_skills',
            'education_requirements',
            'salary_range',
            'category_bonuses',
            'related_career_code',
            'synergy_partners',
            'anti_synergy_partners'
        ];

        importantFields.forEach(field => {
            const usage = roleFields.fieldsWithData[field] || 0;
            const total = roleFields.totalRows;
            const type = roleFields.fieldTypes[field] || 'null';
            console.log(`   • ${field} (${type}): ${usage}/${total} rows have data`);
        });
    }

    // Check cc_synergies
    if (fieldAnalysis['cc_synergies']) {
        console.log('\n📋 cc_synergies - Fields to ensure in AI generation:');
        const synergyFields = fieldAnalysis['cc_synergies'];
        const importantFields = [
            'optional_roles',
            'category_bonuses',
            'special_effect',
            'min_challenge_difficulty',
            'required_challenge_category',
            'activation_chance',
            'real_world_example'
        ];

        importantFields.forEach(field => {
            const usage = synergyFields.fieldsWithData[field] || 0;
            const total = synergyFields.totalRows;
            const type = synergyFields.fieldTypes[field] || 'null';
            console.log(`   • ${field} (${type}): ${usage}/${total} rows have data`);
            if (usage > 0 && synergyFields.fieldExamples[field]) {
                const example = JSON.stringify(synergyFields.fieldExamples[field]).substring(0, 50);
                console.log(`     Example: ${example}`);
            }
        });
    }

    // Check cc_industries
    if (fieldAnalysis['cc_industries']) {
        console.log('\n📋 cc_industries - Fields to ensure in AI generation:');
        const industryFields = fieldAnalysis['cc_industries'];
        const importantFields = [
            'color_scheme',
            'challenge_categories',
            'difficulty_levels',
            'grade_level_min',
            'grade_level_max',
            'learning_objectives',
            'career_connections'
        ];

        importantFields.forEach(field => {
            const usage = industryFields.fieldsWithData[field] || 0;
            const total = industryFields.totalRows;
            const type = industryFields.fieldTypes[field] || 'null';
            console.log(`   • ${field} (${type}): ${usage}/${total} rows have data`);
            if (usage > 0 && industryFields.fieldExamples[field]) {
                const example = JSON.stringify(industryFields.fieldExamples[field]).substring(0, 50);
                console.log(`     Example: ${example}`);
            }
        });
    }

    console.log('\n' + '=' .repeat(80));
    console.log('💡 RECOMMENDATIONS');
    console.log('=' .repeat(80));
    console.log('\n1. Fields that MUST be included in AI generation:');
    console.log('   cc_challenges: recommended_roles, required_roles, skill_connections');
    console.log('   cc_role_cards: all current fields are good');
    console.log('   cc_synergies: category_bonuses (some have it)');
    console.log('   cc_industries: color_scheme, challenge_categories');

    console.log('\n2. Fields that are OPTIONAL but useful:');
    console.log('   cc_challenges: restricted_roles, time_pressure_level');
    console.log('   cc_synergies: optional_roles, special_effect');
}

checkAllFieldsComprehensive();