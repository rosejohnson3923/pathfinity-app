/**
 * Generate Healthcare Content using Azure OpenAI
 * This will create the missing Healthcare roles and synergies
 */

async function generateHealthcareContent() {
    console.log('🏥 Generating Healthcare Content...\n');

    const API_URL = 'http://localhost:3000/api/career-challenge/generate';

    // 1. Generate Emergency Physician (needed for synergy)
    console.log('1️⃣ Generating Emergency Physician...');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'role_card',
                data: {
                    industry: 'healthcare',
                    industryName: 'Healthcare Startup',
                    rarity: 'rare',
                    powerRange: { min: 6, max: 8 },
                    existingRoles: []
                }
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Generated:', result.data.roleName);
            console.log('   Power:', result.data.basePower);
            console.log('   Rarity:', result.data.rarity);
        } else {
            console.log('❌ Failed:', await response.text());
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    // 2. Generate Trauma Nurse (needed for synergy)
    console.log('\n2️⃣ Generating Trauma Nurse...');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'role_card',
                data: {
                    industry: 'healthcare',
                    industryName: 'Healthcare Startup',
                    rarity: 'uncommon',
                    powerRange: { min: 4, max: 6 },
                    existingRoles: ['Emergency Physician']
                }
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Generated:', result.data.roleName);
            console.log('   Power:', result.data.basePower);
            console.log('   Rarity:', result.data.rarity);
        } else {
            console.log('❌ Failed:', await response.text());
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    // 3. Generate additional Healthcare roles
    console.log('\n3️⃣ Generating Medical Researcher...');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'role_card',
                data: {
                    industry: 'healthcare',
                    industryName: 'Healthcare Startup',
                    rarity: 'epic',
                    powerRange: { min: 7, max: 9 },
                    existingRoles: ['Emergency Physician', 'Trauma Nurse']
                }
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Generated:', result.data.roleName);
            console.log('   Power:', result.data.basePower);
            console.log('   Rarity:', result.data.rarity);
        } else {
            console.log('❌ Failed:', await response.text());
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    // 4. Generate a Healthcare challenge
    console.log('\n4️⃣ Generating Healthcare Challenge...');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'challenge',
                data: {
                    industry: 'healthcare',
                    industryName: 'Healthcare Startup',
                    difficulty: 'medium',
                    category: 'Patient Care',
                    theme: 'Emergency Response',
                    educationalFocus: 'Medical careers and teamwork'
                }
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Generated Challenge:', result.data.title);
            console.log('   Scenario:', result.data.scenarioText.substring(0, 100) + '...');
            console.log('   Difficulty:', result.data.difficulty);
            console.log('   Min Roles:', result.data.minRolesRequired);
        } else {
            console.log('❌ Failed:', await response.text());
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    // 5. Generate the Emergency Response Team synergy
    console.log('\n5️⃣ Generating Emergency Response Synergy...');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'synergy',
                data: {
                    industry: 'healthcare',
                    industryName: 'Healthcare Startup',
                    roleCards: ['Emergency Physician', 'Trauma Nurse'],
                    synergyType: 'special'
                }
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Generated Synergy:', result.data.synergyName);
            console.log('   Description:', result.data.description);
            console.log('   Power Bonus:', result.data.powerBonus);
            console.log('   Required Roles:', result.data.requiredRoles);
        } else {
            console.log('❌ Failed:', await response.text());
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n✨ Healthcare content generation complete!');
    console.log('Run your tests again to see the Emergency Response Team synergy working!');
}

// Alternative: Generate a complete Healthcare pack
async function generateHealthcarePack() {
    console.log('📦 Generating Complete Healthcare Industry Pack...\n');

    const API_URL = 'http://localhost:3000/api/career-challenge/generate';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'industry_pack',
                data: {
                    industryCode: 'healthcare',
                    industryName: 'Healthcare Startup'
                }
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Industry Pack Generated!');
            console.log(`   Challenges: ${result.data.challenges.length}`);
            console.log(`   Role Cards: ${result.data.roleCards.length}`);
            console.log(`   Synergies: ${result.data.synergies.length}`);

            console.log('\nRole Cards Generated:');
            result.data.roleCards.forEach(card => {
                console.log(`   - ${card.roleName} (${card.rarity}, Power: ${card.basePower})`);
            });

            console.log('\nChallenges Generated:');
            result.data.challenges.forEach(challenge => {
                console.log(`   - ${challenge.title} (${challenge.difficulty})`);
            });

            console.log('\nSynergies Generated:');
            result.data.synergies.forEach(synergy => {
                console.log(`   - ${synergy.synergyName} (+${synergy.powerBonus})`);
            });

        } else {
            console.log('❌ Failed:', await response.text());
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Run based on command line argument
const args = process.argv.slice(2);

if (args[0] === '--pack') {
    console.log('🚀 Generating full Healthcare pack...\n');
    generateHealthcarePack();
} else {
    console.log('🚀 Generating individual Healthcare content...\n');
    generateHealthcareContent();
}