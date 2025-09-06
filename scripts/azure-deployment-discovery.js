#!/usr/bin/env node

/**
 * AZURE AI DEPLOYMENT DISCOVERY
 * Discover available model deployments and correct configurations
 * Tests multiple API keys and endpoint combinations
 */

import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

class AzureDeploymentDiscovery {
  constructor() {
    this.apiKeys = [
      { name: 'OpenAI Key', key: process.env.VITE_AZURE_OPENAI_API_KEY },
      { name: 'Cognitive Key', key: process.env.VITE_AZURE_COGNITIVE_SERVICES_KEY },
      { name: 'Speech Key', key: process.env.VITE_AZURE_SPEECH_KEY },
      { name: 'Translator Key', key: process.env.VITE_AZURE_TRANSLATOR_KEY },
      { name: 'Additional Key', key: process.env.VITE_AZURE_ADDITIONAL_KEY }
    ].filter(item => item.key); // Only include keys that exist

    this.endpoints = [
      'https://pathfinity-ai-foundry.openai.azure.com/',
      'https://pathfinity-ai-foundry.services.ai.azure.com/'
    ];

    this.commonDeployments = [
      'gpt-4o', 'gpt-4', 'gpt-35-turbo', 'gpt-3.5-turbo',
      'text-davinci-003', 'text-embedding-ada-002',
      'dall-e-3', 'dall-e-2', 'whisper-1'
    ];
  }

  async discoverAll() {
    console.log(chalk.blue('🔍 AZURE AI DEPLOYMENT DISCOVERY\n'));
    console.log(chalk.green(`Found ${this.apiKeys.length} API keys to test\n`));

    await this.testAPIKeyAccess();
    await this.discoverDeployments();
    await this.testAlternativeConfigurations();
    
    this.showRecommendations();
  }

  async testAPIKeyAccess() {
    console.log(chalk.yellow('🔑 Testing API Key Access...\n'));
    
    for (const apiKey of this.apiKeys) {
      console.log(chalk.white(`Testing ${apiKey.name}...`));
      
      // Test with different endpoints
      for (const endpoint of this.endpoints) {
        await this.testKeyWithEndpoint(apiKey, endpoint);
      }
      console.log('');
    }
  }

  async testKeyWithEndpoint(apiKey, endpoint) {
    try {
      // Try a simple list models call (if available)
      const response = await fetch(`${endpoint}openai/models?api-version=2024-02-01`, {
        headers: {
          'api-key': apiKey.key,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(chalk.green(`  ✅ ${apiKey.name} works with ${endpoint}`));
        if (data.data && data.data.length > 0) {
          console.log(chalk.gray(`     Available models: ${data.data.slice(0, 3).map(m => m.id).join(', ')}...`));
        }
      } else {
        console.log(chalk.yellow(`  ⚠️  ${apiKey.name} + ${endpoint}: ${response.status} ${response.statusText}`));
      }
    } catch (error) {
      console.log(chalk.red(`  ❌ ${apiKey.name} + ${endpoint}: ${error.message}`));
    }
  }

  async discoverDeployments() {
    console.log(chalk.yellow('🎯 Discovering Model Deployments...\n'));
    
    const primaryKey = this.apiKeys[0]; // Use first key (OpenAI key)
    const endpoint = this.endpoints[0]; // Use primary endpoint
    
    for (const deployment of this.commonDeployments) {
      await this.testDeployment(primaryKey.key, endpoint, deployment);
    }
  }

  async testDeployment(apiKey, endpoint, deploymentName) {
    try {
      const client = new OpenAI({
        apiKey: apiKey,
        baseURL: `${endpoint}openai/deployments/${deploymentName}`,
        defaultQuery: { 'api-version': '2024-02-01' },
        defaultHeaders: { 'api-key': apiKey }
      });

      // Try a minimal request
      const response = await client.chat.completions.create({
        model: deploymentName,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1
      });

      if (response.choices && response.choices.length > 0) {
        console.log(chalk.green(`✅ Deployment '${deploymentName}' is AVAILABLE`));
        return true;
      }
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(chalk.gray(`   '${deploymentName}' - not deployed`));
      } else if (error.message.includes('429')) {
        console.log(chalk.yellow(`⚠️  '${deploymentName}' - rate limited (but exists!)`));
        return true;
      } else {
        console.log(chalk.red(`❌ '${deploymentName}' - ${error.message.substring(0, 50)}...`));
      }
    }
    return false;
  }

  async testAlternativeConfigurations() {
    console.log(chalk.yellow('\n🔧 Testing Alternative Configurations...\n'));

    // Test different API versions
    const apiVersions = ['2024-02-01', '2023-12-01-preview', '2023-09-01-preview'];
    
    for (const version of apiVersions) {
      console.log(chalk.white(`Testing API version: ${version}`));
      await this.testWithAPIVersion(version);
    }

    // Test with different key assignments
    console.log(chalk.white('\nTesting different key assignments...'));
    await this.testKeySwapping();
  }

  async testWithAPIVersion(apiVersion) {
    try {
      const client = new OpenAI({
        apiKey: this.apiKeys[0].key,
        baseURL: `${this.endpoints[0]}openai/deployments/gpt-35-turbo`,
        defaultQuery: { 'api-version': apiVersion },
        defaultHeaders: { 'api-key': this.apiKeys[0].key }
      });

      const response = await client.chat.completions.create({
        model: 'gpt-35-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 1
      });

      console.log(chalk.green(`  ✅ API version ${apiVersion} works`));
    } catch (error) {
      console.log(chalk.gray(`     ${apiVersion}: ${error.message.substring(0, 30)}...`));
    }
  }

  async testKeySwapping() {
    // Try using different keys for OpenAI endpoint
    for (let i = 0; i < this.apiKeys.length; i++) {
      const key = this.apiKeys[i];
      try {
        const client = new OpenAI({
          apiKey: key.key,
          baseURL: `${this.endpoints[0]}openai/deployments/gpt-35-turbo`,
          defaultQuery: { 'api-version': '2024-02-01' },
          defaultHeaders: { 'api-key': key.key }
        });

        const response = await client.chat.completions.create({
          model: 'gpt-35-turbo',
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 1
        });

        console.log(chalk.green(`  ✅ ${key.name} works for OpenAI endpoint`));
      } catch (error) {
        console.log(chalk.gray(`     ${key.name}: Failed`));
      }
    }
  }

  showRecommendations() {
    console.log(chalk.blue('\n📋 CONFIGURATION RECOMMENDATIONS\n'));
    console.log(chalk.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

    console.log(chalk.green('🎯 NEXT STEPS TO TRY:'));
    console.log(chalk.white('1. Check Azure AI Foundry Portal for actual deployment names'));
    console.log(chalk.white('2. Create model deployments if they don\'t exist'));
    console.log(chalk.white('3. Verify which services are enabled in your subscription'));
    console.log(chalk.white('4. Check regional availability of services'));

    console.log(chalk.yellow('\n💡 COMMON SOLUTIONS:'));
    console.log(chalk.white('• Model deployments may need different names (check Azure portal)'));
    console.log(chalk.white('• Some services may need to be enabled/configured first'));
    console.log(chalk.white('• Regional endpoints might be different'));
    console.log(chalk.white('• API versions may need adjustment'));

    console.log(chalk.magenta('\n🔧 MANUAL CHECKS:'));
    console.log(chalk.white('1. Azure AI Foundry → Model Deployments'));
    console.log(chalk.white('2. Azure AI Services → Resource Configuration'));
    console.log(chalk.white('3. Azure OpenAI → Deployment Names'));
    console.log(chalk.white('4. Check subscription limits and quotas'));

    console.log(chalk.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    console.log(chalk.blue('💬 If you can check your Azure portal and provide the actual deployment names,'));
    console.log(chalk.blue('I can immediately fix the configuration and get everything working! 🚀'));
  }
}

// Run the discovery
async function runDiscovery() {
  const discovery = new AzureDeploymentDiscovery();
  await discovery.discoverAll();
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDiscovery().catch(console.error);
}

export { AzureDeploymentDiscovery };