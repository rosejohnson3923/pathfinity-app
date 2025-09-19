# Model Configuration Guide

## Azure OpenAI Deployment Configuration

This guide provides the exact configuration needed for each model in the multi-model system.

---

## 📋 Model Deployment Requirements

### phi-4 (K-2 Primary Model)
```json
{
  "deploymentName": "phi-4-deployment",
  "modelName": "microsoft/phi-4",
  "version": "latest",
  "sku": {
    "name": "Standard",
    "capacity": 10
  },
  "configuration": {
    "temperature": 0.7,
    "max_tokens": 1000,
    "top_p": 0.95,
    "frequency_penalty": 0,
    "presence_penalty": 0
  }
}
```

### gpt-35-turbo (3-5 Primary, K-2 Fallback)
```json
{
  "deploymentName": "gpt-35-turbo-deployment",
  "modelName": "gpt-35-turbo",
  "version": "0613",
  "sku": {
    "name": "Standard",
    "capacity": 20
  },
  "configuration": {
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 0.95,
    "frequency_penalty": 0,
    "presence_penalty": 0
  }
}
```

### gpt-4o-mini (6-8 Primary)
```json
{
  "deploymentName": "gpt-4o-mini-deployment",
  "modelName": "gpt-4o-mini",
  "version": "latest",
  "sku": {
    "name": "Standard",
    "capacity": 15
  },
  "configuration": {
    "temperature": 0.7,
    "max_tokens": 3000,
    "top_p": 0.95,
    "frequency_penalty": 0,
    "presence_penalty": 0
  }
}
```

### gpt-4o (9-12 Primary, Experience/Discover)
```json
{
  "deploymentName": "gpt-4o-deployment",
  "modelName": "gpt-4o",
  "version": "latest",
  "sku": {
    "name": "Standard",
    "capacity": 10
  },
  "configuration": {
    "temperature": 0.8,
    "max_tokens": 4000,
    "top_p": 0.95,
    "frequency_penalty": 0,
    "presence_penalty": 0
  }
}
```

### deepseek-v3 (Validation Layer)
```json
{
  "deploymentName": "deepseek-v3-deployment",
  "modelName": "deepseek-v3",
  "version": "latest",
  "sku": {
    "name": "Standard",
    "capacity": 5
  },
  "configuration": {
    "temperature": 0.3,
    "max_tokens": 1000,
    "top_p": 0.95,
    "frequency_penalty": 0,
    "presence_penalty": 0
  }
}
```

---

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-08-01-preview

# Model Deployments
PHI4_DEPLOYMENT_NAME=phi-4-deployment
PHI4_API_KEY=your-phi4-key-here

GPT35_DEPLOYMENT_NAME=gpt-35-turbo-deployment
GPT35_API_KEY=your-gpt35-key-here

GPT4OMINI_DEPLOYMENT_NAME=gpt-4o-mini-deployment
GPT4OMINI_API_KEY=your-gpt4o-mini-key-here

GPT4O_DEPLOYMENT_NAME=gpt-4o-deployment
GPT4O_API_KEY=your-gpt4o-key-here

DEEPSEEK_DEPLOYMENT_NAME=deepseek-v3-deployment
DEEPSEEK_API_KEY=your-deepseek-key-here

# Feature Flags
ENABLE_MULTI_MODEL=false
MULTI_MODEL_ROLLOUT_PERCENTAGE=0
ENABLE_VALIDATION_LAYER=false
ENABLE_COST_TRACKING=true
ENABLE_MODEL_METRICS=true

# Model Selection Overrides (for testing)
FORCE_MODEL=none
DISABLE_FALLBACK=false
VALIDATION_STRICTNESS=medium

# Performance Settings
MAX_RETRY_ATTEMPTS=3
VALIDATION_TIMEOUT_MS=5000
MODEL_TIMEOUT_MS=30000
```

---

## 📊 Model Configuration by Grade

### Kindergarten (K)
```typescript
{
  grade: 'K',
  primaryModel: 'phi-4',
  fallbackModel: 'gpt-35-turbo',
  validator: 'deepseek-v3',
  config: {
    maxWordCount: 5,
    simplifyRules: true,
    includeVisuals: true,
    temperature: 0.7
  }
}
```

### Grade 1-2
```typescript
{
  grade: '1-2',
  primaryModel: 'phi-4',
  fallbackModel: 'gpt-35-turbo',
  validator: 'deepseek-v3',
  config: {
    maxWordCount: 10,
    simplifyRules: true,
    includeVisuals: true,
    temperature: 0.7
  }
}
```

### Grade 3-5
```typescript
{
  grade: '3-5',
  primaryModel: 'gpt-35-turbo',
  fallbackModel: 'gpt-4o-mini',
  validator: 'deepseek-v3',
  config: {
    maxWordCount: 25,
    simplifyRules: false,
    includeVisuals: false,
    temperature: 0.7
  }
}
```

### Grade 6-8
```typescript
{
  grade: '6-8',
  primaryModel: 'gpt-4o-mini',
  fallbackModel: 'gpt-4o',
  validator: 'deepseek-v3',
  config: {
    maxWordCount: 50,
    simplifyRules: false,
    includeVisuals: false,
    temperature: 0.75
  }
}
```

### Grade 9-12
```typescript
{
  grade: '9-12',
  primaryModel: 'gpt-4o',
  fallbackModel: 'gpt-4o',
  validator: 'deepseek-v3',
  config: {
    maxWordCount: 100,
    simplifyRules: false,
    includeVisuals: false,
    temperature: 0.8
  }
}
```

---

## 🎯 Container-Specific Overrides

### Experience Container
```typescript
{
  container: 'EXPERIENCE',
  forceModel: 'gpt-4o',
  config: {
    temperature: 0.85,
    maxTokens: 4000,
    creativeMode: true
  }
}
```

### Discover Container
```typescript
{
  container: 'DISCOVER',
  forceModel: 'gpt-4o',
  config: {
    temperature: 0.85,
    maxTokens: 4000,
    explorationMode: true
  }
}
```

### Learn Container
```typescript
{
  container: 'LEARN',
  useGradeModel: true,
  config: {
    temperature: 0.7,
    maxTokens: 2000,
    structuredOutput: true
  }
}
```

### Assessment Container
```typescript
{
  container: 'ASSESSMENT',
  useGradeModel: true,
  config: {
    temperature: 0.65,
    maxTokens: 2000,
    strictValidation: true
  }
}
```

---

## 📈 Cost Configuration

### Token Pricing (per 1K tokens)

| Model | Input Cost | Output Cost | Avg Request Cost |
|-------|------------|-------------|------------------|
| phi-4 | $0.00015 | $0.0006 | $0.0003 |
| gpt-35-turbo | $0.0005 | $0.0015 | $0.002 |
| gpt-4o-mini | $0.00015 | $0.0006 | $0.003 |
| gpt-4o | $0.003 | $0.012 | $0.015 |
| deepseek-v3 | $0.0001 | $0.0002 | $0.0002 |

### Budget Alerts
```typescript
{
  dailyBudget: 100,
  alertThresholds: [50, 75, 90],
  notifications: {
    email: ['tech-lead@company.com'],
    slack: '#ai-alerts'
  }
}
```

---

## 🔒 Security Configuration

### API Key Management
```typescript
// Use Azure Key Vault for production
{
  keyVault: {
    url: 'https://your-keyvault.vault.azure.net/',
    secrets: {
      'phi4-api-key': 'PHI4_API_KEY',
      'gpt35-api-key': 'GPT35_API_KEY',
      'gpt4o-mini-api-key': 'GPT4OMINI_API_KEY',
      'gpt4o-api-key': 'GPT4O_API_KEY',
      'deepseek-api-key': 'DEEPSEEK_API_KEY'
    }
  }
}
```

### Rate Limiting
```typescript
{
  rateLimit: {
    'phi-4': { rpm: 1000, tpm: 100000 },
    'gpt-35-turbo': { rpm: 3000, tpm: 180000 },
    'gpt-4o-mini': { rpm: 500, tpm: 150000 },
    'gpt-4o': { rpm: 100, tpm: 100000 },
    'deepseek-v3': { rpm: 500, tpm: 50000 }
  }
}
```

---

## 🚀 Deployment Steps

### 1. Azure Portal Setup
```bash
# Create resource group
az group create --name pathfinity-ai --location eastus

# Create OpenAI resource
az cognitiveservices account create \
  --name pathfinity-openai \
  --resource-group pathfinity-ai \
  --kind OpenAI \
  --sku S0 \
  --location eastus
```

### 2. Deploy Models
```bash
# Deploy each model using Azure Portal or CLI
az cognitiveservices account deployment create \
  --name pathfinity-openai \
  --resource-group pathfinity-ai \
  --deployment-name phi-4-deployment \
  --model-name microsoft/phi-4 \
  --model-version latest \
  --sku-capacity 10
```

### 3. Configure Application
```typescript
// src/config/models.config.ts
export const modelConfig = {
  azure: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION
  },
  models: {
    'phi-4': {
      deployment: process.env.PHI4_DEPLOYMENT_NAME,
      apiKey: process.env.PHI4_API_KEY
    },
    // ... other models
  }
};
```

### 4. Verify Deployments
```typescript
// scripts/verify-models.ts
async function verifyModel(modelName: string) {
  const response = await fetch(
    `${endpoint}/openai/deployments/${deployment}/completions?api-version=${apiVersion}`,
    {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Test',
        max_tokens: 5
      })
    }
  );
  return response.ok;
}
```

---

## 📊 Monitoring Configuration

### Application Insights
```json
{
  "instrumentationKey": "your-key-here",
  "telemetry": {
    "trackModelUsage": true,
    "trackCosts": true,
    "trackLatency": true,
    "trackErrors": true
  },
  "customEvents": {
    "modelSelection": true,
    "fallbackTriggered": true,
    "validationFailed": true
  }
}
```

### Custom Metrics
```typescript
// Track these metrics for each model
{
  metrics: {
    'requests_per_minute': number,
    'average_latency_ms': number,
    'success_rate': number,
    'fallback_rate': number,
    'validation_pass_rate': number,
    'average_cost_per_request': number,
    'total_daily_cost': number
  }
}
```

---

## 🔄 Rollback Configuration

### Feature Flags
```typescript
{
  flags: {
    'multi-model-enabled': {
      default: false,
      gradualRollout: {
        enabled: true,
        percentage: 10,
        targetGrades: ['K', '1', '2']
      }
    },
    'validation-enabled': {
      default: false,
      enabled: ['production']
    }
  }
}
```

### Emergency Rollback
```bash
# Quick rollback script
#!/bin/bash
echo "Rolling back to single model..."
export ENABLE_MULTI_MODEL=false
export FORCE_MODEL=gpt-4o
kubectl rollout undo deployment/pathfinity-api
echo "Rollback complete"
```

---

## 📝 Testing Configuration

### Test Profiles
```typescript
// test/config/personas.ts
export const testPersonas = {
  sam: {
    grade: 'K',
    expectedModel: 'phi-4',
    subjects: ['MATH', 'ELA', 'SCIENCE', 'SOCIAL_STUDIES']
  },
  alex: {
    grade: '1',
    expectedModel: 'phi-4',
    subjects: ['MATH', 'ELA', 'SCIENCE', 'SOCIAL_STUDIES']
  },
  jordan: {
    grade: '7',
    expectedModel: 'gpt-4o-mini',
    subjects: ['MATH', 'ELA', 'SCIENCE', 'SOCIAL_STUDIES']
  },
  taylor: {
    grade: '10',
    expectedModel: 'gpt-4o',
    subjects: ['MATH', 'ELA', 'SCIENCE', 'SOCIAL_STUDIES']
  }
};
```

---

*Last Updated: September 2024*
*Version: 1.0.0*