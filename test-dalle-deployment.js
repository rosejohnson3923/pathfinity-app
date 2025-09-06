import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

async function testDalleDeployments() {
  const endpoint = 'https://pathfinity-ai-foundry.openai.azure.com';
  const apiKey = process.env.VITE_AZURE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No API key found');
    return;
  }
  
  // Test different possible deployment names
  const deploymentNames = [
    'dall-e-3',
    'dalle3',
    'dalle-3',
    'dall-e',
    'dalle',
    'Dalle3'
  ];
  
  console.log('🔍 Testing DALL-E deployment names...\n');
  
  for (const deployment of deploymentNames) {
    try {
      const url = `${endpoint}/openai/deployments/${deployment}/images/generations?api-version=2024-02-01`;
      console.log(`Testing: ${deployment}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'A simple test image',
          n: 1,
          size: '1024x1024'
        })
      });
      
      if (response.status === 404) {
        console.log(`  ❌ Not found (404)`);
      } else if (response.status === 401) {
        console.log(`  ⚠️ Auth issue but deployment might exist`);
      } else if (response.ok) {
        console.log(`  ✅ SUCCESS! Deployment "${deployment}" works!`);
        const data = await response.json();
        console.log(`     Generated image URL:`, data.data?.[0]?.url?.substring(0, 50) + '...');
        return deployment;
      } else {
        console.log(`  ❓ Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n💡 None of the standard deployment names worked.');
  console.log('   You may need to check your Azure Portal for the actual deployment name.');
}

testDalleDeployments();
