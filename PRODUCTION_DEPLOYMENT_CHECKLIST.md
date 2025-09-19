# Production Deployment Checklist for app.pathfinity.ai

## Pre-Deployment Verification

### Environment Variables Protection
- [x] `.env` is in `.gitignore` (local development only)
- [x] `.env.multimodel` is in `.gitignore` (local multi-model config)
- [x] `.env.local` and `.env.*.local` are in `.gitignore`
- [ ] Never commit API keys or sensitive data

### Required Netlify Environment Variables

#### Core Azure OpenAI (Currently Active in Production)
```
VITE_AZURE_OPENAI_API_KEY=<from Azure Key Vault>
VITE_AZURE_OPENAI_ENDPOINT=https://pathfinity-ai.openai.azure.com/
VITE_AZURE_GPT4_DEPLOYMENT=gpt-4o
VITE_AZURE_GPT4O_DEPLOYMENT=gpt-4o
```

#### Multi-Model System (Toggle On/Off as Needed)
```
# Feature Toggle (set to false to disable multi-model in production)
VITE_ENABLE_MULTI_MODEL=false

# Rollout Configuration (when enabled)
VITE_MULTI_MODEL_TARGET_GRADES=K,1
VITE_MULTI_MODEL_ROLLOUT_PERCENTAGE=0
VITE_MULTI_MODEL_DEBUG=false

# Azure Key Vault (for API keys)
AZURE_KEY_VAULT_URL=https://pathfinity-kv-2823.vault.azure.net/
```

#### Supabase Configuration
```
VITE_SUPABASE_URL=https://zohdmprtfyijneqnwjsu.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

## Multi-Model System Rollout Strategy

### Phase 1: Testing (Current)
- Local development: `VITE_ENABLE_MULTI_MODEL=true`
- Production: `VITE_ENABLE_MULTI_MODEL=false`

### Phase 2: Limited Rollout
- Set `VITE_ENABLE_MULTI_MODEL=true`
- Set `VITE_MULTI_MODEL_TARGET_GRADES=K,1`
- Set `VITE_MULTI_MODEL_ROLLOUT_PERCENTAGE=10`
- Monitor logs and costs

### Phase 3: Gradual Expansion
- Increase `VITE_MULTI_MODEL_ROLLOUT_PERCENTAGE` to 25, 50, 75, 100
- Add more grades: `VITE_MULTI_MODEL_TARGET_GRADES=K,1,2,3,4,5`

### Phase 4: Full Production
- All grades enabled
- 100% rollout
- Disable debug logging: `VITE_MULTI_MODEL_DEBUG=false`

## Deployment Steps

1. **Verify Git Status**
   ```bash
   git status
   # Ensure no .env or .env.multimodel files are staged
   ```

2. **Test Locally**
   ```bash
   npm run build
   npm run preview
   ```

3. **Push to Repository**
   ```bash
   git push origin main
   ```

4. **Netlify Deployment**
   - Auto-deploys on push to main branch
   - Monitor at: https://app.netlify.com

5. **Post-Deployment Verification**
   - Check https://app.pathfinity.ai loads
   - Test login with demo users
   - Verify AI content generation works
   - Check browser console for errors

## Rollback Plan

If issues occur:
1. Set `VITE_ENABLE_MULTI_MODEL=false` in Netlify
2. Trigger redeploy in Netlify
3. System will fall back to standard GPT-4o

## Cost Monitoring

When multi-model is enabled:
- K-2: Uses Phi-4 ($0.00045/request vs $0.0125 for GPT-4o)
- 3-5: Uses Llama-3.3-70B ($0.00122/request vs $0.0125)
- 6-8: Uses GPT-4o-mini ($0.00075/request vs $0.0125)
- 9-12: Uses GPT-4o ($0.0125/request)

Expected savings: **81.6%** for grades K-8

## Important Files Not to Modify in Production

- `.env` - Local development only
- `.env.multimodel` - Local multi-model config
- API keys in code - Use environment variables only
- Model endpoints - Configured via environment variables

## Support Contacts

- Azure Issues: Check Azure Portal for service health
- Netlify Issues: support@netlify.com
- Domain/DNS: IONOS control panel
