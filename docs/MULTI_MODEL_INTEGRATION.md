# Multi-Model System Integration Guide

## 🚀 Quick Integration (5 Minutes)

### Step 1: Copy Environment Variables
```bash
cp .env.multimodel.example .env.local
```

### Step 2: Update Your .env.local
```env
# Start with multi-model OFF for safety
ENABLE_MULTI_MODEL=false
ENABLE_VALIDATION=false
ENABLE_COST_TRACKING=true

# Azure Key Vault (already configured)
AZURE_KEY_VAULT_URL=https://pathfinity-kv-2823.vault.azure.net/
```

### Step 3: Replace Azure OpenAI Service Calls

**OLD CODE:**
```typescript
import { azureOpenAIService } from './azureOpenAIService';

const response = await azureOpenAIService.generateWithModel(
  'gpt4o',
  prompt,
  systemPrompt
);
```

**NEW CODE:**
```typescript
import { aiServiceAdapter } from './ai-models/AIServiceAdapter';

const response = await aiServiceAdapter.generateWithModel(
  'gpt4o',
  prompt,
  systemPrompt
);
```

That's it! The adapter is a drop-in replacement.

---

## 📋 Testing the System

### 1. Test Without Enabling (Safe Mode)
```bash
# With ENABLE_MULTI_MODEL=false
npm run dev

# Everything should work exactly as before
# Check console - should show: "🤖 Multi-Model Route: gpt-4o (was gpt4o)"
```

### 2. Test Specific Models
```env
ENABLE_MULTI_MODEL=false
FORCE_MODEL=phi-4  # Force K-2 model for testing
```

### 3. Run Persona Tests
```bash
npx ts-node test/multi-model/test-personas.ts
```

### 4. Enable for K-2 Only
```env
ENABLE_MULTI_MODEL=true
MULTI_MODEL_TARGET_GRADES=K,1,2
MULTI_MODEL_ROLLOUT_PERCENTAGE=10  # Start with 10%
```

---

## 🎯 Integration Points

### AILearningJourneyService.ts

**Line 272** - generateLearnContent
```typescript
// OLD
const response = await azureOpenAIService.generateWithModel('gpt4o', enhancedPrompt);

// NEW
const response = await aiServiceAdapter.generateWithModel('gpt4o', enhancedPrompt);
```

**Line 683** - generateLearnContentAdaptive
```typescript
// Same replacement pattern
```

**Line 1066** - generateExperienceContent
```typescript
// Same replacement pattern
```

**Line 1246** - generateDiscoverContent
```typescript
// Same replacement pattern
```

---

## 📊 Monitoring

### Check Metrics Endpoint
```typescript
// Add to your API routes
app.get('/api/metrics/multimodel', async (req, res) => {
  const metrics = await aiServiceAdapter.getMetrics();
  res.json(metrics);
});
```

### Console Logs (Development)
```
🤖 Multi-Model Route: phi-4 (was gpt4o)
💰 Cost: $0.0003
⚡ Latency: 1250ms
```

### Check Model Health
```typescript
import { ModelRouter } from './ai-models/ModelRouter';

const health = ModelRouter.getModelHealth();
// Returns: { 'phi-4': { healthy: true, recentFailures: 0 }, ... }
```

---

## 🔄 Rollout Strategy

### Phase 1: Shadow Mode (Week 1)
```env
ENABLE_MULTI_MODEL=false
ENABLE_COST_TRACKING=true
LOG_MODEL_DECISIONS=true
```
- System logs what it WOULD do
- No actual routing changes
- Verify model selection logic

### Phase 2: K-2 Testing (Week 2)
```env
ENABLE_MULTI_MODEL=true
MULTI_MODEL_ROLLOUT_PERCENTAGE=10
MULTI_MODEL_TARGET_GRADES=K,1,2
```
- 10% of K-2 traffic uses phi-4
- Monitor for 24 hours
- Check error rates and quality

### Phase 3: Expand Coverage (Week 3)
```env
MULTI_MODEL_ROLLOUT_PERCENTAGE=50
MULTI_MODEL_TARGET_GRADES=K,1,2,3,4,5
```
- Add grades 3-5 with Llama-3.3-70B
- Increase percentage gradually

### Phase 4: Full Production (Week 4)
```env
MULTI_MODEL_ROLLOUT_PERCENTAGE=100
MULTI_MODEL_TARGET_GRADES=  # Empty = all grades
ENABLE_VALIDATION=true
```
- All traffic uses smart routing
- Enable DeepSeek validation
- Remove feature flags

---

## 🚨 Emergency Rollback

### Instant Rollback
```env
ENABLE_MULTI_MODEL=false
```
Restart the application. Everything returns to GPT-4o.

### Force Specific Model
```env
FORCE_MODEL=gpt-4o
```
All requests use GPT-4o regardless of grade.

### Disable Fallbacks (Testing)
```env
DISABLE_FALLBACK=true
```
Fail fast instead of trying fallback models.

---

## ✅ Integration Checklist

- [ ] Environment variables configured
- [ ] Azure Key Vault secrets verified
- [ ] Replace azureOpenAIService imports
- [ ] Test in development (multi-model OFF)
- [ ] Run persona tests
- [ ] Add metrics endpoint
- [ ] Test with FORCE_MODEL
- [ ] Enable for 10% K-2 traffic
- [ ] Monitor for 24 hours
- [ ] Expand gradually
- [ ] Document any issues

---

## 🎯 Expected Results

### Cost Savings by Grade
| Grade | Model | Old Cost | New Cost | Savings |
|-------|-------|----------|----------|---------|
| K-2 | phi-4 | $0.0370 | $0.0003 | 99% |
| 3-5 | Llama-3.3 | $0.0370 | $0.0008 | 98% |
| 6-8 | gpt-4o-mini | $0.0370 | $0.0030 | 92% |
| 9-12 | gpt-4o | $0.0370 | $0.0370 | 0% |

### Overall Savings
- K-5: **80% cost reduction**
- K-8: **65% cost reduction**
- K-12: **45% cost reduction**

---

## 🔧 Troubleshooting

### Issue: Models not routing correctly
```typescript
// Check routing decision
console.log(JSON.stringify(result.routingDecision, null, 2));
```

### Issue: API key errors
```bash
# Verify keys in vault
az keyvault secret list --vault-name pathfinity-kv-2823 --query "[?contains(name, 'azure')].name" -o tsv
```

### Issue: High latency
- Check MODEL_TIMEOUT_MS setting
- Verify region proximity
- Check model health status

### Issue: Validation failures
```env
VALIDATION_STRICTNESS=low  # Start low, increase gradually
```

---

*Ready to save 60-80% on AI costs? Follow this guide and deploy with confidence!*