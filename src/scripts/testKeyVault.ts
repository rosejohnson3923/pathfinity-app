/**
 * Test Key Vault Connection for Multi-Model System
 */

import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load multi-model configuration
if (fs.existsSync('.env.multimodel')) {
  dotenv.config({ path: '.env.multimodel' });
}

async function testKeyVault() {
  console.log('🔑 Testing Azure Key Vault Connection\n');
  console.log('Key Vault URL:', process.env.AZURE_KEY_VAULT_URL);
  console.log('\n' + '='.repeat(60) + '\n');

  const requiredSecrets = [
    'azure-sweden-api-key',
    'azure-eastus-api-key',
    'azure-eastus2-9894-api-key',
    'azure-eastus2-8781-api-key'
  ];

  try {
    const keyVaultUrl = process.env.AZURE_KEY_VAULT_URL || 'https://pathfinity-kv-2823.vault.azure.net/';

    // Create credential
    const credential = new DefaultAzureCredential();

    // Create secret client
    const client = new SecretClient(keyVaultUrl, credential);

    console.log('📡 Attempting to connect to Key Vault...\n');

    // Test each required secret
    for (const secretName of requiredSecrets) {
      try {
        const secret = await client.getSecret(secretName);

        if (secret.value) {
          // Don't log the actual value, just confirm it exists
          const maskedValue = secret.value.substring(0, 4) + '****' + secret.value.slice(-4);
          console.log(`✅ ${secretName}: Found (${maskedValue})`);
        } else {
          console.log(`❌ ${secretName}: Empty value`);
        }
      } catch (error: any) {
        if (error.statusCode === 404) {
          console.log(`❌ ${secretName}: Not found in Key Vault`);
        } else {
          console.log(`❌ ${secretName}: Error - ${error.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Summary:');
    console.log('If all secrets show ✅, the Key Vault is properly configured.');
    console.log('If any show ❌, you need to add or fix those secrets in Key Vault.');

    // Test model endpoints
    console.log('\n' + '='.repeat(60));
    console.log('\n🌐 Model Endpoints:');
    console.log('Phi-4: https://e4a-mdd7qx3v-swedencentral.cognitiveservices.azure.com/');
    console.log('Llama-3.3-70B: https://e4a-9894-resource.cognitiveservices.azure.com/');
    console.log('GPT-4o: https://pathfinity-ai.openai.azure.com/');
    console.log('GPT-35-turbo: https://e4a-8781-resource.cognitiveservices.azure.com/');

  } catch (error) {
    console.error('\n❌ Failed to connect to Key Vault:', error);
    console.log('\nPossible issues:');
    console.log('1. Check AZURE_KEY_VAULT_URL is correct');
    console.log('2. Ensure you have proper Azure credentials');
    console.log('3. Verify network connectivity');
  }
}

// Run the test
testKeyVault()
  .then(() => {
    console.log('\n✅ Key Vault test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });