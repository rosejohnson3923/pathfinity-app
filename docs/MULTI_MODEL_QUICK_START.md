# Multi-Model AI System - Quick Start Guide

## 🚀 Getting Started in 5 Steps

### Step 1: Deploy Models in Azure
```bash
# Check available regions for each model
az cognitiveservices account list-skus --kind OpenAI --location eastus

# Deploy phi-4 for K-2
# Deploy gpt-35-turbo for 3-5
# Deploy gpt-4o-mini for 6-8
# Keep existing gpt-4o for 9-12
# Deploy deepseek-v3 for validation
```

### Step 2: Update Environment Variables
```env
# Add to .env.local
ENABLE_MULTI_MODEL=true
PHI4_DEPLOYMENT_NAME=phi-4-deployment
PHI4_API_KEY=your-key
# ... add other models
```

### Step 3: Install Dependencies
```bash
npm install
npm run build
```

### Step 4: Run Tests
```bash
# Test with personas
npm run test:multimodel
```

### Step 5: Monitor Results
```bash
# Check cost savings
npm run metrics:cost

# Check quality scores
npm run metrics:quality
```

---

## 📋 Pre-Flight Checklist

### ✅ Azure Setup
- [ ] All models deployed
- [ ] API keys configured
- [ ] Endpoints verified
- [ ] Rate limits set

### ✅ Code Ready
- [ ] Feature flag enabled
- [ ] Monitoring active
- [ ] Rollback ready
- [ ] Tests passing

### ✅ Team Ready
- [ ] Documentation reviewed
- [ ] Support team briefed
- [ ] Escalation path clear
- [ ] Metrics dashboard accessible

---

## 🎯 What Happens Next?

### Day 1: K-2 Grades
1. System automatically routes K-2 to phi-4
2. Cost drops from $0.03 to $0.0003 per request
3. DeepSeek validates responses
4. Fallback to gpt-35-turbo if needed

### Day 2-3: Expand Coverage
1. Enable for grades 3-5 (gpt-35-turbo)
2. Enable for grades 6-8 (gpt-4o-mini)
3. Monitor quality metrics

### Day 4+: Full Production
1. All grades using optimized models
2. 60-80% cost reduction achieved
3. Quality maintained at 95%+

---

## 🔥 Common Issues & Quick Fixes

### Issue: Model returns invalid JSON
```typescript
// Quick fix: Add to prompt
prompt += '\nReturn ONLY valid JSON starting with {'
```

### Issue: Validation keeps failing
```typescript
// Quick fix: Force fallback
if (retryCount > 2) return useGPT4O();
```

### Issue: Costs higher than expected
```bash
# Check routing decisions
grep "model_selected" logs/app.log | tail -100
```

---

## 📞 Need Help?

1. Check `/docs/MULTI_MODEL_IMPLEMENTATION.md`
2. Review `/docs/MULTI_MODEL_TECHNICAL_SPEC.md`
3. Run diagnostics: `npm run diagnose:multimodel`
4. Contact tech lead

---

## 🎉 Success Metrics

You'll know it's working when:
- ✅ K-2 costs drop 80%+
- ✅ Quality scores stay >95%
- ✅ No increase in errors
- ✅ Users don't notice change
- ✅ Validation pass rate >90%

---

*Ready to save 60-80% on AI costs? Let's go! 🚀*