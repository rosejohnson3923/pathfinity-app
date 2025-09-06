# Azure AI Foundry Production Setup Validation & Recommendations

## Current Architecture Analysis

Based on your diagram, you have:

### 1. **Multiple AI Foundry Instances**
- `e4a-mdd7qx3v-swedencentral` - Azure AI Foundry (Sweden Central)
- `e4a-mdm5fxkw-australiaeast` - Azure AI Foundry (Australia East)
- `Pathfinity-AI` - Azure AI Foundry
- `Pathfinity-AI-Foundry` - Azure AI Foundry
- `Pathfinity-Comms-Svcs` - Communication Service

### 2. **Deployed Projects**
- `e4a-mdm5fxkw-australiaeast/e4a-mdm5fxkw-australiaeast_project` - Azure AI Foundry project
- `Pathfinity-AI-Foundry/Pathfinity-AI-Foundry` - Azure AI Foundry project

## ⚠️ Critical Issues for Production

### 1. **API Keys Exposed in .env**
**CRITICAL**: Your API keys are exposed in the repository. These need to be:
- Removed from version control immediately
- Regenerated in Azure portal
- Stored securely (Azure Key Vault recommended)

### 2. **Multiple Redundant Resources**
You have 4 AI Foundry instances which appears excessive and costly. For production:
- Consolidate to 1-2 instances maximum
- Use one primary region (e.g., East US for North American users)
- Consider a secondary region only for disaster recovery

### 3. **Region Selection**
Current regions (Sweden Central, Australia East) may not be optimal for your users:
- **Recommendation**: Use regions closer to your user base
  - For US schools: East US, West US 2, or Central US
  - For global: Consider East US as primary with CDN

## 📋 Production Setup Recommendations

### 1. **Consolidated Architecture**
```
Production Setup:
├── Primary Region (East US)
│   ├── Pathfinity-AI-Foundry (Main)
│   │   ├── GPT-4o deployment
│   │   ├── GPT-4 deployment
│   │   ├── GPT-3.5 Turbo deployment
│   │   └── DALL-E 3 deployment
│   └── Pathfinity-Comms-Svcs
│       └── Email service
└── Secondary Region (West US 2) - Optional
    └── Pathfinity-AI-Foundry-DR (Disaster Recovery)
```

### 2. **Security Best Practices**

#### a. **Azure Key Vault Setup**
```bash
# Create Key Vault
az keyvault create \
  --name pathfinity-kv \
  --resource-group pathfinity-rg \
  --location eastus

# Store API keys
az keyvault secret set \
  --vault-name pathfinity-kv \
  --name "azure-openai-key" \
  --value "your-api-key"
```

#### b. **Managed Identity**
- Enable Managed Identity for your App Service/Container
- Grant Key Vault access to Managed Identity
- No API keys in code or environment variables

#### c. **Network Security**
- Enable Private Endpoints for AI Foundry
- Use Virtual Network integration
- Implement IP whitelisting

### 3. **Cost Optimization**

#### a. **Consolidate Resources**
```bash
# Delete unused resources
- e4a-mdd7qx3v-swedencentral (if not in use)
- e4a-mdm5fxkw-australiaeast (if not in use)
- Duplicate AI Foundry instances
```

#### b. **Model Deployment Strategy**
- Use single deployment per model type
- Implement proper rate limiting
- Monitor usage with Azure Monitor

### 4. **Environment Configuration**

#### Development (.env.development)
```env
# Use Azure Key Vault references
VITE_AZURE_KEY_VAULT_NAME=pathfinity-kv-dev
VITE_AZURE_CLIENT_ID=your-app-client-id
```

#### Production (.env.production)
```env
# No secrets in production env files
VITE_AZURE_KEY_VAULT_NAME=pathfinity-kv-prod
VITE_AZURE_CLIENT_ID=your-app-client-id
VITE_AZURE_OPENAI_ENDPOINT=https://pathfinity-ai-foundry.openai.azure.com/
```

### 5. **API Configuration Service**

Create a secure configuration service:

```typescript
// src/services/azureConfig.ts
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

class AzureConfigService {
  private secretClient: SecretClient;
  private cache: Map<string, string> = new Map();

  constructor() {
    const keyVaultName = process.env.VITE_AZURE_KEY_VAULT_NAME;
    const kvUri = `https://${keyVaultName}.vault.azure.net`;
    
    const credential = new DefaultAzureCredential();
    this.secretClient = new SecretClient(kvUri, credential);
  }

  async getSecret(secretName: string): Promise<string> {
    // Check cache first
    if (this.cache.has(secretName)) {
      return this.cache.get(secretName)!;
    }

    try {
      const secret = await this.secretClient.getSecret(secretName);
      this.cache.set(secretName, secret.value!);
      return secret.value!;
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretName}:`, error);
      throw error;
    }
  }

  async getOpenAIKey(): Promise<string> {
    return this.getSecret("azure-openai-key");
  }

  async getCognitiveServicesKey(): Promise<string> {
    return this.getSecret("azure-cognitive-services-key");
  }
}

export const azureConfig = new AzureConfigService();
```

### 6. **Monitoring & Alerts**

#### a. **Application Insights**
```typescript
// src/services/monitoring.ts
import { ApplicationInsights } from '@applicationinsights/web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: process.env.VITE_APP_INSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true
  }
});

appInsights.loadAppInsights();
appInsights.trackPageView();

export { appInsights };
```

#### b. **Cost Alerts**
- Set up budget alerts in Azure
- Monitor API usage per deployment
- Set up anomaly detection

### 7. **Deployment Pipeline**

#### GitHub Actions Workflow
```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Build and Deploy
        run: |
          npm ci
          npm run build
          az webapp deploy --name pathfinity-app --resource-group pathfinity-rg --src-path dist
```

## 🚀 Migration Steps

### Phase 1: Security (Immediate)
1. **Remove all API keys from .env file**
2. **Regenerate all exposed API keys in Azure Portal**
3. **Set up Azure Key Vault**
4. **Update application to use Key Vault**

### Phase 2: Consolidation (Week 1)
1. **Audit all AI Foundry resources**
2. **Identify primary region based on user location**
3. **Migrate deployments to single AI Foundry instance**
4. **Delete unused resources**

### Phase 3: Production Setup (Week 2)
1. **Configure Virtual Network**
2. **Enable Private Endpoints**
3. **Set up Application Insights**
4. **Configure auto-scaling**

### Phase 4: Testing & Validation (Week 3)
1. **Load testing with realistic scenarios**
2. **Security penetration testing**
3. **Disaster recovery testing**
4. **Performance optimization**

## 📊 Estimated Cost Savings

By consolidating from 4 AI Foundry instances to 1:
- **Current estimated cost**: ~$400-600/month
- **Optimized cost**: ~$100-150/month
- **Savings**: 70-75% reduction

## 🔒 Security Checklist

- [ ] Remove all API keys from source control
- [ ] Regenerate all exposed keys
- [ ] Implement Azure Key Vault
- [ ] Enable Managed Identity
- [ ] Configure Private Endpoints
- [ ] Set up IP whitelisting
- [ ] Enable audit logging
- [ ] Implement rate limiting
- [ ] Configure CORS properly
- [ ] Enable Azure Defender

## 📞 Support Resources

- **Azure AI Foundry Documentation**: https://learn.microsoft.com/azure/ai-services/
- **Security Best Practices**: https://learn.microsoft.com/azure/security/
- **Cost Management**: https://learn.microsoft.com/azure/cost-management-billing/

## Next Steps

1. **Immediate Action Required**: Secure your API keys
2. **Schedule**: Plan consolidation during low-usage period
3. **Testing**: Comprehensive testing before production launch
4. **Monitoring**: Set up dashboards and alerts

Would you like me to help you with any specific step in this migration process?