# Azure PDF Batch Generation - Cost Calculator

Use this document to estimate costs for your specific deployment size.

---

## Input Your Parameters

```yaml
# YOUR DEPLOYMENT
students_per_day: 10000        # Number of students completing lessons daily
school_days_per_year: 180      # Typical school year
requests_per_student: 4        # Math, ELA, Science, Social Studies
tokens_per_request: 1000       # Average AI request size

# OPTIONAL OVERRIDES (use defaults if unsure)
realtime_cost_per_1m_tokens: 10.00    # Azure OpenAI GPT-4o pricing
batch_cost_per_1m_tokens: 5.00        # 50% discount for batch
```

---

## Cost Calculations

### 1. Azure OpenAI Costs

**Daily AI Requests:**
```
students_per_day × requests_per_student
= 10,000 × 4
= 40,000 requests/day
```

**Daily Tokens:**
```
daily_requests × tokens_per_request
= 40,000 × 1,000
= 40,000,000 tokens/day
= 40M tokens/day
```

**Annual Tokens:**
```
daily_tokens × school_days_per_year
= 40M × 180
= 7,200M tokens/year
= 7.2B tokens/year
```

#### Real-Time API (Current Approach)
```
annual_tokens × (realtime_cost_per_1m_tokens / 1,000,000)
= 7,200,000,000 × ($10.00 / 1,000,000)
= $72,000/year
```

#### Batch API (Proposed Approach)
```
annual_tokens × (batch_cost_per_1m_tokens / 1,000,000)
= 7,200,000,000 × ($5.00 / 1,000,000)
= $36,000/year
```

**Annual AI Savings:**
```
$72,000 - $36,000 = $36,000/year (50% reduction)
```

---

### 2. Azure Infrastructure Costs

**Monthly Infrastructure (10,000 students):**

| Component | Monthly Cost | Annual Cost |
|-----------|--------------|-------------|
| Azure Service Bus (Standard) | $10 | $120 |
| Azure Functions (Consumption, 1M exec) | $20 | $240 |
| Azure Blob Storage (Hot, 500 GB) | $10 | $120 |
| Bandwidth (Outbound, 100 GB) | $9 | $108 |
| Application Insights | $15 | $180 |
| Azure Key Vault | $3 | $36 |
| **TOTAL** | **$67** | **$804** |

**Scaling Adjustments:**

```python
# For different student counts
def calculate_infrastructure_cost(students):
    base_cost = 67  # $67/month baseline

    if students < 1000:
        return base_cost * 0.5  # Small deployment, minimal resources
    elif students < 5000:
        return base_cost * 0.75  # Medium deployment
    elif students < 10000:
        return base_cost  # Baseline (10K students)
    else:
        # Scale linearly beyond 10K
        scale_factor = students / 10000
        return base_cost * scale_factor
```

| Students | Monthly Infra Cost | Annual Infra Cost |
|----------|-------------------|-------------------|
| 500 | $34 | $408 |
| 1,000 | $50 | $600 |
| 5,000 | $50 | $600 |
| 10,000 | $67 | $804 |
| 25,000 | $168 | $2,010 |
| 50,000 | $335 | $4,020 |

---

### 3. Total Cost Comparison

**Current Approach (Real-time API only):**
```
Total = AI costs + Infrastructure costs
= $72,000 + $0
= $72,000/year
```

**Proposed Approach (Batch API + Infrastructure):**
```
Total = AI costs + Infrastructure costs
= $36,000 + $804
= $36,804/year
```

**Annual Savings:**
```
$72,000 - $36,804 = $35,196/year (48.9% reduction)
```

---

## ROI Analysis

### Development Investment

```
Estimated development: 6-8 weeks
Developer rate: $150/hour
Hours: 240-320 hours

Total investment: $36,000 - $48,000
```

### Payback Period

```
Payback Period = Development Cost / Annual Savings

Best Case (8 weeks):
= $36,000 / $35,196
= 1.02 years (~13 months)

Worst Case (10 weeks):
= $48,000 / $35,196
= 1.36 years (~16 months)
```

---

## Cost Projections by Deployment Size

### Small School (100 students)

**AI Costs:**
- Real-time: $720/year
- Batch: $360/year
- Savings: $360/year

**Infrastructure:**
- Monthly: $34
- Annual: $408

**Total:**
- Current: $720/year
- Proposed: $768/year
- **Net Loss: -$48/year** ❌

**ROI:** Negative - Not recommended

---

### Medium School (500 students)

**AI Costs:**
- Real-time: $3,600/year
- Batch: $1,800/year
- Savings: $1,800/year

**Infrastructure:**
- Annual: $408

**Total:**
- Current: $3,600/year
- Proposed: $2,208/year
- **Net Savings: $1,392/year** ⚠️

**Payback Period:**
- $36,000 / $1,392 = **25.9 years** ⚠️ Too long

---

### Large School (1,000 students)

**AI Costs:**
- Real-time: $7,200/year
- Batch: $3,600/year
- Savings: $3,600/year

**Infrastructure:**
- Annual: $600

**Total:**
- Current: $7,200/year
- Proposed: $4,200/year
- **Net Savings: $3,000/year** ✅

**Payback Period:**
- $36,000 / $3,000 = **12 years** ⚠️ Marginal

---

### District (10,000 students)

**AI Costs:**
- Real-time: $72,000/year
- Batch: $36,000/year
- Savings: $36,000/year

**Infrastructure:**
- Annual: $804

**Total:**
- Current: $72,000/year
- Proposed: $36,804/year
- **Net Savings: $35,196/year** ✅✅

**Payback Period:**
- $36,000 / $35,196 = **1.02 years (13 months)** ✅ Excellent ROI

---

### Large District (25,000 students)

**AI Costs:**
- Real-time: $180,000/year
- Batch: $90,000/year
- Savings: $90,000/year

**Infrastructure:**
- Annual: $2,010

**Total:**
- Current: $180,000/year
- Proposed: $92,010/year
- **Net Savings: $87,990/year** ✅✅✅

**Payback Period:**
- $36,000 / $87,990 = **0.41 years (5 months)** ✅✅✅ Outstanding ROI

---

## Decision Matrix

| Deployment Size | Annual Savings | Payback Period | Recommendation |
|----------------|----------------|----------------|----------------|
| 100 students | -$48 (loss) | N/A | ❌ Do not build |
| 500 students | $1,392 | 26 years | ❌ Do not build |
| 1,000 students | $3,000 | 12 years | ⚠️ Consider alternatives |
| 5,000 students | $17,196 | 2.1 years | ⚠️ Marginal case |
| 10,000 students | $35,196 | 1 year | ✅ Build |
| 25,000 students | $87,990 | 5 months | ✅✅ Strongly build |
| 50,000 students | $175,980 | 2.5 months | ✅✅✅ Must build |

---

## Cost Optimization Tips

### Reduce AI Costs Further

1. **Optimize Prompts:**
   - Shorter prompts = fewer tokens
   - Reuse common sections across students
   - Target: 500 tokens/request (vs 1,000)
   - Savings: Additional 50%

2. **Caching:**
   - Cache common lesson structures
   - Only generate variable content via AI
   - Savings: 60-80% reduction

3. **Tiered Processing:**
   - Premium students: GPT-4o (high quality)
   - Standard students: GPT-3.5 (70% cheaper)
   - Savings: 40-70% depending on mix

### Reduce Infrastructure Costs

1. **Blob Storage Lifecycle:**
   - Move PDFs > 30 days to Cool tier (50% cheaper)
   - Move PDFs > 90 days to Archive tier (90% cheaper)
   - Savings: ~$5/month at 10K students

2. **Function App Optimization:**
   - Use Azure Functions Premium plan for high volume
   - Pre-warmed instances reduce cold start
   - Cost: +$200/month, but faster processing

3. **Service Bus Optimization:**
   - Use Basic tier for dev/test ($0.05/month)
   - Use Standard tier for production ($10/month)
   - Savings: ~$10/month in non-prod environments

---

## Custom Calculator Spreadsheet

**Download:** [Azure PDF Cost Calculator.xlsx](./calculator.xlsx) *(Create this separately)*

**Inputs:**
- Number of students
- School days per year
- Requests per student
- Developer hourly rate
- Custom Azure pricing (if negotiated discount)

**Outputs:**
- Total annual costs (current vs proposed)
- Annual savings
- Payback period
- 5-year TCO comparison

---

## Frequently Asked Questions

### Q: What if Azure OpenAI changes pricing?

**A:** Our calculations are based on October 2025 pricing. Monitor [Azure OpenAI Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/) quarterly. If batch discount drops below 30%, re-evaluate ROI.

### Q: Can we use cheaper AI models?

**A:** Yes! GPT-3.5 Turbo is 70% cheaper than GPT-4o. Trade-off: Lower quality content. Consider A/B testing quality before switching.

### Q: What if we only have 2,000 students?

**A:**
- Annual savings: ~$6,000
- Payback period: 6 years
- **Recommendation:** Wait until you reach 5,000+ students, OR build if planning rapid growth to 10K+.

### Q: Does this include MS365 integration costs?

**A:** No, this is only for the batch PDF system. MS365 integration (Word/SharePoint) is Phase 7-9 (see Technical Design Doc) and adds ~$2,000-5,000 development cost.

---

**Last Updated:** October 5, 2025
**Pricing Source:** Azure OpenAI Pricing (October 2025)
**Next Review:** January 2026
