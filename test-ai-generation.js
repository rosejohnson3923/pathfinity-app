/**
 * Test Azure OpenAI Content Generation
 * This tests the actual AI generation through our service
 */

import { createClient } from '@supabase/supabase-js';
import { CareerChallengeAzureAIService } from './src/services/CareerChallengeAzureAIService.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAIGeneration() {
    console.log('🤖 Testing Azure OpenAI Content Generation...\n');

    // Initialize AI Service
    const aiService = new CareerChallengeAzureAIService(supabase);

    try {
        // Test 1: Generate a Technology Role Card
        console.log('1️⃣ Generating Technology Role Card...');
        console.log('   Requesting: Software Engineer (common rarity)');

        const roleCard = await aiService.generateRoleCard({
            industry: 'technology',
            industryName: 'Technology Startup',
            rarity: 'common',
            powerRange: { min: 3, max: 5 },
            existingRoles: []
        });

        console.log('✅ Generated Role Card:');
        console.log(`   Name: ${roleCard.roleName}`);
        console.log(`   Power: ${roleCard.basePower}`);
        console.log(`   Description: ${roleCard.description.substring(0, 100)}...`);
        console.log(`   Skills: ${roleCard.keySkills.join(', ')}`);

        // Test 2: Generate a Technology Challenge
        console.log('\n2️⃣ Generating Technology Challenge...');
        console.log('   Requesting: Medium difficulty Technical challenge');

        const challenge = await aiService.generateChallenge({
            industry: 'technology',
            industryName: 'Technology Startup',
            difficulty: 'medium',
            category: 'Technical',
            theme: 'Software Development',
            educationalFocus: 'Programming and problem-solving skills'
        });

        console.log('✅ Generated Challenge:');
        console.log(`   Title: ${challenge.title}`);
        console.log(`   Difficulty: ${challenge.difficulty}`);
        console.log(`   Scenario: ${challenge.scenarioText.substring(0, 100)}...`);
        console.log(`   Min Roles: ${challenge.minRolesRequired}`);

        // Test 3: Generate a Synergy
        console.log('\n3️⃣ Generating Technology Synergy...');
        console.log('   Requesting: Synergy for Software Engineer + UX Designer');

        const synergy = await aiService.generateSynergy({
            industry: 'technology',
            industryName: 'Technology Startup',
            roleCards: ['Software Engineer', 'UX Designer'],
            synergyType: 'additive'
        });

        console.log('✅ Generated Synergy:');
        console.log(`   Name: ${synergy.synergyName}`);
        console.log(`   Power Bonus: +${synergy.powerBonus}`);
        console.log(`   Description: ${synergy.description}`);
        console.log(`   Real-World Example: ${synergy.realWorldExample}`);

        // Test 4: Check if content was cached
        console.log('\n4️⃣ Checking AI Content Cache...');
        const { data: cacheEntries, error } = await supabase
            .from('cc_ai_content_cache')
            .select('content_type, content_key, ai_model, created_at')
            .eq('industry_code', 'technology')
            .order('created_at', { ascending: false })
            .limit(3);

        if (cacheEntries && cacheEntries.length > 0) {
            console.log('✅ Content cached successfully:');
            cacheEntries.forEach(entry => {
                console.log(`   - ${entry.content_type}: ${entry.content_key}`);
            });
        } else {
            console.log('⚠️  No cache entries found');
        }

        console.log('\n✨ Azure OpenAI integration is working correctly!');
        console.log('   The system can generate:');
        console.log('   - Role cards with realistic career information');
        console.log('   - Educational challenges for gameplay');
        console.log('   - Team synergies that reflect real-world dynamics');
        console.log('   - All content is cached for performance');

    } catch (error) {
        console.error('\n❌ Error during AI generation:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Check Azure Key Vault secrets are set:');
        console.log('   - azure-openai-endpoint');
        console.log('   - azure-openai-key');
        console.log('   - azure-openai-deployment');
        console.log('2. Verify Azure OpenAI service is active');
        console.log('3. Check network connectivity');
        console.log('4. Ensure proper Azure credentials');
    }
}

// Run the test
testAIGeneration();