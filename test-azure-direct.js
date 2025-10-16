/**
 * Direct Azure OpenAI API Test
 * Tests the raw Azure OpenAI connection without TypeScript
 */

import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import dotenv from 'dotenv';

dotenv.config();

async function testAzureOpenAIDirect() {
    console.log('🔍 Testing Direct Azure OpenAI Connection...\n');

    try {
        // Initialize Key Vault client
        const vaultName = 'pathfinity-kv-2823';
        const vaultUrl = `https://${vaultName}.vault.azure.net`;
        console.log(`📦 Connecting to Key Vault: ${vaultName}`);

        const credential = new DefaultAzureCredential();
        const secretClient = new SecretClient(vaultUrl, credential);

        // Fetch secrets
        console.log('\n1️⃣ Fetching Azure OpenAI credentials...');
        const endpointSecret = await secretClient.getSecret('azure-openai-endpoint');
        const keySecret = await secretClient.getSecret('azure-openai-key');
        const deploymentSecret = await secretClient.getSecret('azure-openai-deployment');

        console.log('✅ Credentials retrieved from Key Vault');

        const endpoint = endpointSecret.value;
        const apiKey = keySecret.value;
        const deployment = deploymentSecret.value;

        // Test OpenAI API call
        console.log('\n2️⃣ Testing OpenAI API with content generation...');
        const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-01`;

        const testPrompt = {
            messages: [
                {
                    role: 'system',
                    content: 'You are a creative game designer creating educational content for Career Challenge, a career exploration game for students. Always respond with valid JSON only.'
                },
                {
                    role: 'user',
                    content: `Create a Technology industry role card for a Software Engineer. Generate a JSON object with:
{
  "roleName": "Software Engineer",
  "roleTitle": "Full-Stack Developer",
  "description": "Brief description",
  "rarity": "common",
  "basePower": 4,
  "keySkills": ["skill1", "skill2", "skill3"],
  "flavorText": "Inspirational quote"
}`
                }
            ],
            max_tokens: 300,
            temperature: 0.8,
            response_format: { type: 'json_object' }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
            },
            body: JSON.stringify(testPrompt),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Call Successful!');

            const content = JSON.parse(data.choices[0].message.content);
            console.log('\n📋 Generated Content:');
            console.log(`   Role: ${content.roleName}`);
            console.log(`   Title: ${content.roleTitle}`);
            console.log(`   Power: ${content.basePower}`);
            console.log(`   Skills: ${content.keySkills.join(', ')}`);

            console.log('\n📊 Usage Statistics:');
            console.log(`   Prompt Tokens: ${data.usage.prompt_tokens}`);
            console.log(`   Completion Tokens: ${data.usage.completion_tokens}`);
            console.log(`   Total Tokens: ${data.usage.total_tokens}`);

            console.log('\n✨ Azure OpenAI is fully configured and working!');
            console.log('   You can now generate content for all industries.');

        } else {
            const errorText = await response.text();
            console.log(`❌ API Call Failed: ${response.status} ${response.statusText}`);
            console.log(`   Error: ${errorText}`);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Ensure you are logged into Azure CLI: az login');
        console.log('2. Check Key Vault access: az keyvault secret list --vault-name pathfinity-kv-2823');
        console.log('3. Verify all three secrets exist:');
        console.log('   - azure-openai-endpoint');
        console.log('   - azure-openai-key');
        console.log('   - azure-openai-deployment');
    }
}

// Run the test
testAzureOpenAIDirect();