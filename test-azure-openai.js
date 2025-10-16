/**
 * Test Azure OpenAI Configuration
 * Run: node test-azure-openai.js
 */

const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

async function testAzureOpenAI() {
    console.log('🔍 Testing Azure OpenAI Configuration...\n');

    try {
        // Initialize Key Vault client
        const vaultName = 'pathfinity-kv-2823';
        const vaultUrl = `https://${vaultName}.vault.azure.net`;

        console.log(`📦 Connecting to Key Vault: ${vaultName}`);

        const credential = new DefaultAzureCredential();
        const secretClient = new SecretClient(vaultUrl, credential);

        // Test 1: Fetch endpoint
        console.log('\n1️⃣ Fetching Azure OpenAI Endpoint...');
        try {
            const endpointSecret = await secretClient.getSecret('azure-openai-endpoint');
            console.log(`✅ Endpoint found: ${endpointSecret.value.substring(0, 30)}...`);
        } catch (error) {
            console.log('❌ Endpoint not found. Set it with:');
            console.log('   az keyvault secret set --vault-name pathfinity-kv-2823 --name "azure-openai-endpoint" --value "YOUR-ENDPOINT"');
        }

        // Test 2: Fetch API key
        console.log('\n2️⃣ Fetching Azure OpenAI Key...');
        try {
            const keySecret = await secretClient.getSecret('azure-openai-key');
            console.log(`✅ API Key found: ${keySecret.value.substring(0, 5)}...${keySecret.value.slice(-5)}`);
        } catch (error) {
            console.log('❌ API Key not found. Set it with:');
            console.log('   az keyvault secret set --vault-name pathfinity-kv-2823 --name "azure-openai-key" --value "YOUR-KEY"');
        }

        // Test 3: Fetch deployment name
        console.log('\n3️⃣ Fetching Deployment Name...');
        try {
            const deploymentSecret = await secretClient.getSecret('azure-openai-deployment');
            console.log(`✅ Deployment found: ${deploymentSecret.value}`);
        } catch (error) {
            console.log('❌ Deployment not found. Set it with:');
            console.log('   az keyvault secret set --vault-name pathfinity-kv-2823 --name "azure-openai-deployment" --value "YOUR-DEPLOYMENT"');
        }

        // Test 4: Test OpenAI API call (if all secrets exist)
        console.log('\n4️⃣ Testing OpenAI API Call...');
        try {
            const endpointSecret = await secretClient.getSecret('azure-openai-endpoint');
            const keySecret = await secretClient.getSecret('azure-openai-key');
            const deploymentSecret = await secretClient.getSecret('azure-openai-deployment');

            const url = `${endpointSecret.value}openai/deployments/${deploymentSecret.value}/chat/completions?api-version=2024-02-01`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': keySecret.value,
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a test assistant. Reply with exactly: "Azure OpenAI is configured correctly!"'
                        },
                        {
                            role: 'user',
                            content: 'Test message'
                        }
                    ],
                    max_tokens: 50,
                    temperature: 0
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ API Call Success!');
                console.log(`   Response: ${data.choices[0].message.content}`);
            } else {
                console.log(`❌ API Call Failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.log('⚠️  Could not test API - ensure all secrets are set first');
        }

        console.log('\n✨ Configuration test complete!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Ensure you are logged into Azure CLI: az login');
        console.log('2. Check you have access to the Key Vault: az keyvault secret list --vault-name pathfinity-kv-2823');
        console.log('3. Verify your Azure credentials are set up correctly');
    }
}

// Run the test
testAzureOpenAI();