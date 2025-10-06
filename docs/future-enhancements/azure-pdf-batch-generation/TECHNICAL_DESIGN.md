# Azure OpenAI Batch + Queue-Based PDF Generation System

**Status:** Future Enhancement - Not Yet Implemented
**Priority:** High
**Estimated Effort:** 6-8 weeks
**Dependencies:** Azure OpenAI API, Azure Service Bus, Azure Blob Storage
**Target Release:** Q2 2026

## Executive Summary

This document outlines a future enhancement to migrate PDF generation from synchronous, client-side processing to an asynchronous, cloud-based batch processing architecture using Azure services. This will enable:

- **50% cost reduction** on AI content generation via Azure OpenAI Batch API
- **Dual PDF delivery** - Demonstrative (pre-generated) and Actual (post-completion) lesson plans
- **Scalability** to support 10,000+ students per district
- **Non-blocking UX** - Real-time student experience with background PDF generation
- **MS365 integration pathway** - Foundation for Word/OneDrive/SharePoint integration

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Proposed Architecture](#proposed-architecture)
3. [Two-PDF System Design](#two-pdf-system-design)
4. [Azure OpenAI Batch Processing](#azure-openai-batch-processing)
5. [Queue-Based PDF Generation](#queue-based-pdf-generation)
6. [Cost Analysis](#cost-analysis)
7. [Implementation Phases](#implementation-phases)
8. [Technical Specifications](#technical-specifications)
9. [Monitoring & SLA](#monitoring--sla)
10. [Risk Assessment](#risk-assessment)
11. [Success Metrics](#success-metrics)
12. [Future Considerations](#future-considerations)

---

## Current State Analysis

### Existing Architecture (as of October 2025)

**PDF Generation:**
- Library: `react-pdf`
- Trigger: On-demand when parent/teacher requests download
- Processing: Client-side rendering
- Storage: None (generated per request)
- Emoji Support: No (stripped via `stripEmojis()` helper)

**AI Content Generation:**
- Service: Azure OpenAI (real-time API)
- Models: GPT-4o
- Timing: Just-In-Time when student starts lesson
- Cost: Standard real-time pricing (~$0.01 per request)

### Limitations

1. **Cost Inefficiency:**
   - Real-time AI calls cost 2x batch API pricing
   - PDF regenerated every time parent downloads

2. **Scalability Concerns:**
   - Client-side PDF rendering doesn't scale for districts (1000+ students)
   - No caching or pre-generation

3. **User Experience:**
   - Parents must wait for PDF generation on download
   - No preview capability before student starts lesson

4. **Infrastructure:**
   - No centralized storage for historical lesson plans
   - No parent portal for accessing past PDFs

---

## Proposed Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DUAL PDF SYSTEM                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  DEMONSTRATIVE PDF                    ACTUAL PDF                   │
│  (Pre-Generated)                      (Post-Completion)            │
│                                                                     │
│  ┌──────────────┐                     ┌──────────────┐            │
│  │  Generated:  │                     │  Generated:  │            │
│  │  Overnight   │                     │  After       │            │
│  │  (Batch AI)  │                     │  Completion  │            │
│  └──────────────┘                     └──────────────┘            │
│         │                                     │                    │
│         ▼                                     ▼                    │
│  ┌──────────────┐                     ┌──────────────┐            │
│  │  Available:  │                     │  Available:  │            │
│  │  Before      │                     │  Within 60s  │            │
│  │  School      │                     │  of Finish   │            │
│  └──────────────┘                     └──────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AZURE CLOUD INFRASTRUCTURE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────┐      ┌────────────────┐      ┌──────────────┐ │
│  │  Azure OpenAI  │─────▶│  Azure Service │─────▶│   Azure      │ │
│  │  Batch API     │      │  Bus Queue     │      │   Functions  │ │
│  │  (50% savings) │      │  (Reliable)    │      │   (Workers)  │ │
│  └────────────────┘      └────────────────┘      └──────────────┘ │
│         │                        │                       │         │
│         │                        │                       │         │
│         ▼                        ▼                       ▼         │
│  ┌────────────────┐      ┌────────────────┐      ┌──────────────┐ │
│  │  Batch Status  │      │  PDF Generator │      │  Azure Blob  │ │
│  │  Monitor       │      │  Queue         │      │  Storage     │ │
│  │  (Webhook)     │      │  (Messages)    │      │  (PDFs)      │ │
│  └────────────────┘      └────────────────┘      └──────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Two-PDF System Design

### 1. Demonstrative Lesson Plan (Pre-Generated)

**Purpose:**
Provide parents and teachers with a preview of the planned lesson structure before the student begins.

**Contents:**
- ✅ Planned learning objectives
- ✅ Sample questions (generic examples)
- ✅ Activity descriptions
- ✅ Expected outcomes
- ✅ "What [Student Name] will learn today" preview
- ❌ NO actual student responses (hasn't started yet)
- ❌ NO performance metrics (not available yet)

**Generation Timing:**
- **Trigger:** Teacher schedules lesson for tomorrow
- **Processing:** Overnight batch job (7 PM - 6 AM)
- **Available:** 6 AM - Before school starts
- **Cost:** 50% savings via Azure OpenAI Batch API

**Use Cases:**
- Parents preview tomorrow's lesson over breakfast
- Teachers review planned content before class
- Administrative approval workflows
- Curriculum planning and alignment

### 2. Actual Lesson Plan (Post-Completion)

**Purpose:**
Document the student's actual performance and personalized results.

**Contents:**
- ✅ Questions student actually answered
- ✅ Student's responses (correct/incorrect markers)
- ✅ Time spent per activity
- ✅ Performance metrics (% correct, areas of strength/struggle)
- ✅ Personalized feedback based on results
- ✅ Recommendations for next steps

**Generation Timing:**
- **Trigger:** Student clicks "Complete Lesson"
- **Processing:** Queued immediately, processed within 60 seconds
- **Available:** 1 minute after completion
- **Notification:** Email/SMS/Push to parent

**Use Cases:**
- Parents review child's actual work after school
- Progress tracking over time
- Parent-teacher conferences (show historical PDFs)
- IEP/504 plan documentation

### Side-by-Side Comparison

| Feature | Demonstrative PDF | Actual PDF |
|---------|------------------|------------|
| **When Generated** | Overnight (scheduled) | Post-completion (queued) |
| **AI Processing** | Batch API (50% savings) | Standard API (if needed) |
| **Content Type** | Generic/Planned | Personalized/Actual |
| **Available By** | 6 AM morning of lesson | 1 min after completion |
| **Storage Path** | `/demonstrative/{student}/{date}/` | `/actual/{student}/{date}/` |
| **Retention** | 30 days | 1 year (compliance) |
| **Parent Value** | Preview & Preparation | Results & Progress |

---

## Azure OpenAI Batch Processing

### Why Batch API?

**Cost Savings:**
```
Real-time API:  $0.01 per 1K tokens = $10.00 per 1M tokens
Batch API:      $0.005 per 1K tokens = $5.00 per 1M tokens
Savings:        50% reduction
```

**For 10,000 students/day:**
- Real-time cost: $100/day = $36,500/year
- Batch cost: $50/day = $18,250/year
- **Annual savings: $18,250**

**Trade-off:**
- ✅ 50% cost savings
- ⚠️ Up to 24-hour processing window (we target 6-8 hours overnight)
- ✅ Perfect for demonstrative PDFs (generated overnight)

### Batch API Workflow

```typescript
// 1. CREATE BATCH REQUEST FILE
const batchRequests = scheduledLessons.map(lesson => ({
  custom_id: `demo-${lesson.student_id}-${lesson.lesson_date}`,
  method: "POST",
  url: "/chat/completions",
  body: {
    model: "gpt-4o",
    messages: [{
      role: "system",
      content: promptBuilder.buildPrompt({
        container: 'LEARN',
        student: lesson.student,
        skill: lesson.skill,
        career: lesson.career
      })
    }],
    temperature: 0.7,
    max_tokens: 4000
  }
}));

// 2. UPLOAD TO AZURE OPENAI
const fileContent = batchRequests.map(r => JSON.stringify(r)).join('\n');
const file = await openai.files.create({
  file: new Blob([fileContent], { type: 'application/jsonl' }),
  purpose: 'batch'
});

// 3. CREATE BATCH JOB
const batch = await openai.batches.create({
  input_file_id: file.id,
  endpoint: "/v1/chat/completions",
  completion_window: "24h",
  metadata: {
    description: "Demonstrative lesson plans for 2025-10-06",
    lesson_count: scheduledLessons.length
  }
});

console.log(`Batch job submitted: ${batch.id}`);
// Expected completion: 6-8 hours (overnight)
```

### Batch Status Monitoring

```typescript
// OPTION 1: Polling (Check every hour)
setInterval(async () => {
  const batch = await openai.batches.retrieve(batchId);

  if (batch.status === 'completed') {
    // Download results
    const results = await downloadBatchResults(batch.output_file_id);
    await processBatchResults(results);
  } else if (batch.status === 'failed') {
    await handleBatchFailure(batch);
  }
}, 3600000); // Every hour

// OPTION 2: Webhook (Azure OpenAI notifies us)
app.post('/webhooks/batch-completed', async (req, res) => {
  const { batch_id, status, output_file_id } = req.body;

  if (status === 'completed') {
    const results = await downloadBatchResults(output_file_id);
    await processBatchResults(results);
  }

  res.sendStatus(200);
});
```

### Error Handling & Retries

```typescript
// Process batch results with error handling
async function processBatchResults(results: BatchResult[]) {
  for (const result of results) {
    try {
      if (result.error) {
        // Log error and fallback to real-time generation
        console.error(`Batch request ${result.custom_id} failed:`, result.error);
        await generateDemonstrativeRealtime(result.custom_id);
      } else {
        // Queue PDF generation
        await serviceBus.sendMessage({
          body: {
            type: 'demonstrative',
            lessonId: result.custom_id,
            aiContent: result.response.body.choices[0].message.content
          }
        });
      }
    } catch (error) {
      console.error(`Failed to process batch result ${result.custom_id}:`, error);
      // Dead letter queue for manual review
      await deadLetterQueue.send(result);
    }
  }
}
```

---

## Queue-Based PDF Generation

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   PDF GENERATION FLOW                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Trigger    │────────▶│  Azure       │                 │
│  │   Event      │         │  Service Bus │                 │
│  │              │         │  Queue       │                 │
│  └──────────────┘         └──────────────┘                 │
│                                  │                          │
│                                  │ Message                  │
│                                  ▼                          │
│                           ┌──────────────┐                 │
│                           │   Azure      │                 │
│                           │   Function   │                 │
│                           │   (Worker)   │                 │
│                           └──────────────┘                 │
│                                  │                          │
│                                  │ Generate                 │
│                                  ▼                          │
│                           ┌──────────────┐                 │
│                           │   Azure      │                 │
│                           │   Blob       │                 │
│                           │   Storage    │                 │
│                           └──────────────┘                 │
│                                  │                          │
│                                  │ Notify                   │
│                                  ▼                          │
│                           ┌──────────────┐                 │
│                           │   Parent     │                 │
│                           │   Portal     │                 │
│                           └──────────────┘                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Azure Service Bus Queue Configuration

```typescript
// Queue Settings
{
  "queueName": "pdf-generation-queue",
  "maxDeliveryCount": 3,              // Retry up to 3 times
  "lockDuration": "PT5M",              // 5 minute lock
  "defaultMessageTimeToLive": "P1D",   // Messages expire in 1 day
  "deadLetteringOnMessageExpiration": true,
  "enableBatchedOperations": true,
  "maxSizeInMegabytes": 5120,         // 5 GB queue size
  "requiresDuplicateDetection": true,
  "duplicateDetectionHistoryTimeWindow": "PT10M"
}
```

### Message Schema

```typescript
interface PDFGenerationMessage {
  type: 'demonstrative' | 'actual';
  lessonId: string;
  studentId: string;
  lessonDate: string;

  // For demonstrative PDFs
  aiContent?: {
    learn: AILearnContent;
    experience: AIExperienceContent;
    discover: AIDiscoverContent;
  };

  // For actual PDFs
  studentResults?: {
    responses: QuestionResponse[];
    timeSpent: number;
    performanceMetrics: {
      totalQuestions: number;
      correctAnswers: number;
      percentCorrect: number;
      areasOfStrength: string[];
      areasForGrowth: string[];
    };
  };

  metadata: {
    scheduledBy: string;        // Teacher ID
    priority: 'high' | 'normal'; // Actual PDFs = high priority
    attemptCount: number;
    createdAt: Date;
  };
}
```

### Azure Function - PDF Worker

```typescript
import { AzureFunction, Context } from "@azure/functions";
import { ServiceBusMessage } from "@azure/service-bus";

const serviceBusQueueTrigger: AzureFunction = async function (
  context: Context,
  message: PDFGenerationMessage
): Promise<void> {
  const startTime = Date.now();

  try {
    context.log(`Processing ${message.type} PDF for lesson ${message.lessonId}`);

    // 1. Generate PDF
    const pdfBuffer = await generatePDF(message);

    // 2. Upload to Blob Storage
    const blobPath = getBlobPath(message);
    const blobUrl = await uploadToBlobStorage(blobPath, pdfBuffer);

    // 3. Update database
    await updateLessonPlanRecord(message.lessonId, {
      [`${message.type}PdfUrl`]: blobUrl,
      [`${message.type}GeneratedAt`]: new Date()
    });

    // 4. Send notification (actual PDFs only)
    if (message.type === 'actual') {
      await sendParentNotification(message.studentId, message.lessonId, blobUrl);
    }

    const duration = Date.now() - startTime;
    context.log(`✅ PDF generated in ${duration}ms: ${blobUrl}`);

    // Telemetry
    await trackMetric('pdf_generation_duration', duration, {
      type: message.type,
      success: true
    });

  } catch (error) {
    context.log.error(`❌ PDF generation failed for ${message.lessonId}:`, error);

    // Telemetry
    await trackMetric('pdf_generation_errors', 1, {
      type: message.type,
      error: error.message
    });

    // Retry will be automatic (maxDeliveryCount: 3)
    // If all retries fail, message goes to dead letter queue
    throw error;
  }
};

export default serviceBusQueueTrigger;
```

### Blob Storage Structure

```
azure-blob-storage/
├── demonstrative/
│   ├── sam/
│   │   ├── 2025-10-05/
│   │   │   └── lesson-plan.pdf
│   │   ├── 2025-10-06/
│   │   │   └── lesson-plan.pdf
│   │   └── ...
│   ├── emma/
│   └── ...
├── actual/
│   ├── sam/
│   │   ├── 2025-10-05/
│   │   │   └── lesson-plan.pdf
│   │   ├── 2025-10-06/
│   │   │   └── lesson-plan.pdf
│   │   └── ...
│   ├── emma/
│   └── ...
└── archive/
    └── {year}/
        └── {month}/
            └── ...
```

### Performance Optimization

**Parallel Processing:**
```typescript
// Azure Functions scale out automatically based on queue depth
// Configure scaling rules:
{
  "scaleOutRules": {
    "queueLength": 100,      // Scale out when queue > 100 messages
    "maxInstances": 20,       // Max 20 concurrent workers
    "cooldownPeriod": 60      // Wait 60s before scaling in
  }
}

// Result: 100 PDFs can be generated in parallel
// Processing time: ~30-60 seconds regardless of volume
```

---

## Cost Analysis

### Azure OpenAI Costs

| Scenario | Students/Day | Requests/Day | Real-Time Cost | Batch Cost | Daily Savings | Annual Savings |
|----------|-------------|--------------|----------------|------------|---------------|----------------|
| Small School | 100 | 400 | $4.00 | $2.00 | $2.00 | $730 |
| Medium School | 500 | 2,000 | $20.00 | $10.00 | $10.00 | $3,650 |
| Large School | 1,000 | 4,000 | $40.00 | $20.00 | $20.00 | $7,300 |
| District | 10,000 | 40,000 | $400.00 | $200.00 | $200.00 | $73,000 |

*Assumptions: 4 requests per student (Math, ELA, Science, Social Studies)*

### Azure Infrastructure Costs (Monthly)

| Component | Configuration | Cost/Month (10K students) |
|-----------|--------------|---------------------------|
| **Azure Service Bus** | Standard tier | $10 |
| **Azure Functions** | Consumption plan (1M executions) | $20 |
| **Azure Blob Storage** | Hot tier (500 GB) | $10 |
| **Bandwidth** | Outbound transfers (100 GB) | $9 |
| **Application Insights** | Monitoring & telemetry | $15 |
| **Azure Key Vault** | Secrets management | $3 |
| **TOTAL** | | **~$67/month** |
| **ANNUAL** | | **~$804/year** |

### Total Cost Comparison

**10,000 students, 180 school days:**

| Approach | AI Costs | Infrastructure | Total Annual | Savings |
|----------|----------|----------------|--------------|---------|
| **Current (Real-time)** | $72,000 | $0 | $72,000 | - |
| **Proposed (Batch)** | $36,000 | $804 | $36,804 | **$35,196** |
| **Savings %** | 50% | - | **49%** | - |

### ROI Analysis

**Development Investment:** 6-8 weeks @ $150/hour = $36,000 - $48,000

**Payback Period:**
- Small School (100 students): 49 years ❌ Not worth it
- Medium School (500 students): 10 years ⚠️ Marginal
- Large School (1,000 students): 5 years ✅ Good investment
- District (10,000 students): **1 year** ✅ Excellent ROI

**Recommendation:** Implement when targeting districts or large schools (1,000+ students).

---

## Implementation Phases

### Phase 1: Infrastructure Setup (Week 1-2)

**Objectives:**
- Provision Azure resources
- Set up CI/CD pipelines
- Configure monitoring

**Tasks:**
- [ ] Create Azure Resource Group
- [ ] Provision Service Bus Queue
- [ ] Create Blob Storage account with containers
- [ ] Set up Azure Functions app
- [ ] Configure Application Insights
- [ ] Set up Azure Key Vault for secrets
- [ ] Create service principals and RBAC permissions
- [ ] Configure GitHub Actions for automated deployment

**Deliverables:**
- Azure resources provisioned
- IaC scripts (Bicep/Terraform)
- Deployment pipeline functional

**Success Criteria:**
- All Azure resources accessible
- Can manually send message to queue
- Can trigger Azure Function manually

---

### Phase 2: Batch API Integration (Week 3-4)

**Objectives:**
- Implement Azure OpenAI Batch API
- Create batch job scheduler
- Build result processing pipeline

**Tasks:**
- [ ] Create batch request builder service
- [ ] Implement batch job submission
- [ ] Build batch status monitor (polling)
- [ ] Create batch result processor
- [ ] Implement error handling and retries
- [ ] Add fallback to real-time API for failures
- [ ] Create database schema for batch tracking
- [ ] Build admin UI for batch job monitoring

**Deliverables:**
- `BatchRequestService.ts`
- `BatchMonitorService.ts`
- `BatchResultProcessor.ts`
- Database migrations
- Admin dashboard

**Success Criteria:**
- Successfully submit batch job with 10 requests
- Retrieve and process results
- Failed requests fallback to real-time

---

### Phase 3: PDF Generation Workers (Week 5-6)

**Objectives:**
- Build queue-based PDF generation
- Implement blob storage integration
- Create notification system

**Tasks:**
- [ ] Migrate PDF generator to Azure Function
- [ ] Implement Service Bus queue trigger
- [ ] Add blob storage upload logic
- [ ] Create demonstrative PDF template
- [ ] Create actual PDF template
- [ ] Build notification service (email/SMS/push)
- [ ] Implement retry and dead letter queue handling
- [ ] Add performance monitoring

**Deliverables:**
- `generatePDF` Azure Function
- `NotificationService.ts`
- PDF templates
- Error handling flow

**Success Criteria:**
- Queue message triggers PDF generation
- PDF uploaded to blob storage within 60s
- Parent receives notification

---

### Phase 4: Demonstrative PDF Pipeline (Week 7)

**Objectives:**
- Build end-to-end demonstrative PDF flow
- Implement overnight scheduling
- Test with sample data

**Tasks:**
- [ ] Create nightly batch job scheduler (Timer Trigger)
- [ ] Implement lesson plan discovery (tomorrow's lessons)
- [ ] Build batch request creation
- [ ] Connect batch results to PDF queue
- [ ] Test full pipeline with 100 lessons
- [ ] Optimize batch timing (target 6 AM availability)
- [ ] Create parent portal "Preview" section

**Deliverables:**
- `scheduleDemonstrativeBatch` Azure Function (Timer)
- E2E demonstrative pipeline
- Parent portal integration

**Success Criteria:**
- 100 demonstrative PDFs generated overnight
- All available by 6 AM
- Parents can access via portal

---

### Phase 5: Actual PDF Pipeline (Week 8)

**Objectives:**
- Build post-completion PDF flow
- Integrate with lesson completion
- Test performance SLA (60s)

**Tasks:**
- [ ] Add "Complete Lesson" event handler
- [ ] Queue actual PDF generation
- [ ] Implement student results extraction
- [ ] Build actual PDF with performance metrics
- [ ] Test notification delivery (email/SMS/push)
- [ ] Optimize for 60-second SLA
- [ ] Load test with 100 concurrent completions

**Deliverables:**
- Lesson completion integration
- Actual PDF template
- Performance metrics dashboard

**Success Criteria:**
- PDF generated within 60s of completion
- Parent notified immediately
- Load test: 100 concurrent completions successful

---

### Phase 6: Production Rollout (Week 9-10)

**Objectives:**
- Gradual rollout to production
- Monitor and optimize
- Document for operations team

**Tasks:**
- [ ] Deploy to production environment
- [ ] Rollout to 1% of users (beta)
- [ ] Monitor costs, performance, errors
- [ ] Gradual increase to 10%, 25%, 50%, 100%
- [ ] Create runbooks for operations
- [ ] Train support team
- [ ] Create parent/teacher documentation

**Deliverables:**
- Production deployment
- Monitoring dashboards
- Runbooks and documentation
- Training materials

**Success Criteria:**
- Zero critical issues during rollout
- Cost projections validated
- SLA targets met (6 AM demonstrative, 60s actual)

---

## Technical Specifications

### Database Schema

```sql
-- Batch Job Tracking
CREATE TABLE batch_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id VARCHAR(255) UNIQUE NOT NULL,
  batch_type VARCHAR(50) NOT NULL, -- 'demonstrative'
  lesson_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'submitted', 'processing', 'completed', 'failed'
  request_count INTEGER NOT NULL,
  completed_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  output_file_id VARCHAR(255),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- PDF Generation Records
CREATE TABLE pdf_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lesson_plans(id),
  pdf_type VARCHAR(50) NOT NULL, -- 'demonstrative' or 'actual'
  status VARCHAR(50) NOT NULL, -- 'queued', 'processing', 'completed', 'failed'
  blob_url VARCHAR(500),
  generation_started_at TIMESTAMP,
  generation_completed_at TIMESTAMP,
  generation_duration_ms INTEGER,
  attempt_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_lesson_pdf UNIQUE(lesson_id, pdf_type)
);

-- Notification Log
CREATE TABLE pdf_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pdf_generation_id UUID NOT NULL REFERENCES pdf_generations(id),
  recipient_type VARCHAR(50) NOT NULL, -- 'parent', 'teacher'
  recipient_id UUID NOT NULL,
  notification_channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push'
  status VARCHAR(50) NOT NULL, -- 'sent', 'failed', 'bounced'
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX idx_batch_jobs_lesson_date ON batch_jobs(lesson_date);
CREATE INDEX idx_pdf_generations_lesson ON pdf_generations(lesson_id);
CREATE INDEX idx_pdf_generations_status ON pdf_generations(status);
```

### Environment Variables

```env
# Azure OpenAI
AZURE_OPENAI_API_KEY=sk-***
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-08-01-preview

# Azure Service Bus
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://***
AZURE_SERVICE_BUS_QUEUE_NAME=pdf-generation-queue

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;***
AZURE_STORAGE_CONTAINER_DEMONSTRATIVE=demonstrative
AZURE_STORAGE_CONTAINER_ACTUAL=actual

# Database
DATABASE_URL=postgresql://***

# Notifications
SENDGRID_API_KEY=SG.***
TWILIO_ACCOUNT_SID=AC***
TWILIO_AUTH_TOKEN=***
TWILIO_PHONE_NUMBER=+1234567890

# Application Insights
APPINSIGHTS_INSTRUMENTATIONKEY=***
```

### API Endpoints

```typescript
// Parent Portal API
GET    /api/lesson-plans/:lessonId/demonstrative/pdf
GET    /api/lesson-plans/:lessonId/actual/pdf
GET    /api/students/:studentId/pdfs?type=demonstrative&startDate=2025-10-01

// Admin API
GET    /api/admin/batch-jobs
GET    /api/admin/batch-jobs/:batchId
POST   /api/admin/batch-jobs/:batchId/retry
GET    /api/admin/pdf-generations?status=failed
POST   /api/admin/pdf-generations/:id/regenerate

// Webhooks
POST   /webhooks/openai/batch-completed
POST   /webhooks/notifications/delivery-status
```

---

## Monitoring & SLA

### Service Level Objectives

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Demonstrative PDF Availability** | 95% by 6 AM | Batch completion time |
| **Actual PDF Generation Time** | < 60 seconds (p95) | Queue processing duration |
| **PDF Generation Success Rate** | > 99% | Successful generations / Total |
| **Notification Delivery** | < 5 seconds | Time from PDF ready to notification sent |
| **Queue Processing Lag** | < 5 minutes | Queue depth vs. processing rate |
| **Blob Storage Availability** | 99.9% | Azure SLA |

### Monitoring Dashboards

**Application Insights Dashboard:**

```typescript
// Key metrics to track
{
  customMetrics: [
    'pdf_generation_duration',
    'batch_job_completion_time',
    'queue_depth',
    'failed_generations',
    'notification_delivery_time'
  ],

  customEvents: [
    'batch_job_submitted',
    'batch_job_completed',
    'pdf_generated',
    'notification_sent'
  ],

  alerts: [
    {
      name: 'High Queue Depth',
      condition: 'queue_depth > 500',
      action: 'scale_out_workers'
    },
    {
      name: 'Slow PDF Generation',
      condition: 'avg(pdf_generation_duration) > 120000', // 2 minutes
      action: 'alert_on_call_engineer'
    },
    {
      name: 'Batch Job Failure',
      condition: 'batch_job_status == "failed"',
      action: 'alert_ops_team'
    }
  ]
}
```

### Alert Configuration

```yaml
alerts:
  - name: demonstrative-pdfs-not-ready
    description: Demonstrative PDFs not available by 6 AM
    condition: |
      batch_jobs.status != 'completed'
      AND CURRENT_TIME > '06:00:00'
      AND batch_jobs.lesson_date = CURRENT_DATE
    severity: high
    action: page_on_call_engineer

  - name: actual-pdf-sla-breach
    description: Actual PDF took longer than 60 seconds
    condition: |
      pdf_generations.generation_duration_ms > 60000
      AND pdf_generations.pdf_type = 'actual'
    severity: medium
    action: log_and_investigate

  - name: high-failure-rate
    description: PDF generation failure rate exceeds 1%
    condition: |
      (failed_count / total_count) > 0.01
      IN LAST 1 HOUR
    severity: critical
    action: page_leadership
```

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Batch API delays exceed 24 hrs** | Low | High | Monitor completion times; fallback to real-time for urgent requests |
| **Azure Functions cold start delays** | Medium | Medium | Use Premium plan with pre-warmed instances |
| **Blob storage outage** | Very Low | High | Implement Azure redundancy (GRS); cache recent PDFs locally |
| **Queue message loss** | Very Low | Critical | Use Service Bus (at-least-once delivery guarantee); implement idempotency |
| **PDF generation memory limits** | Medium | Medium | Optimize PDF library usage; implement streaming for large PDFs |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Insufficient ROI for small schools** | High | Low | Market to districts only (1,000+ students) |
| **Parent confusion (two PDFs)** | Medium | Medium | Clear labeling: "Preview" vs. "Results"; parent onboarding |
| **Teacher resistance to new workflow** | Medium | Medium | Gradual rollout; training; gather feedback |
| **Regulatory compliance (FERPA)** | Low | High | Ensure Azure compliance certifications; encrypt PDFs at rest |

### Compliance & Security

**Data Protection:**
- ✅ FERPA compliant (Azure Government Cloud available)
- ✅ COPPA compliant (no data from children under 13 without consent)
- ✅ GDPR compliant (data residency, right to erasure)
- ✅ Encryption at rest (Azure Blob Storage SSE)
- ✅ Encryption in transit (HTTPS only)
- ✅ Access control (Azure AD + RBAC)

**Retention Policy:**
- Demonstrative PDFs: 30 days (automatically deleted)
- Actual PDFs: 1 year (for progress tracking)
- Archived PDFs: 7 years (compliance, moved to cool storage)

---

## Success Metrics

### Phase 1 Success (Infrastructure)
- [ ] All Azure resources provisioned
- [ ] CI/CD pipeline deploys successfully
- [ ] Monitoring dashboards operational
- [ ] Costs within projected budget ($67/month)

### Phase 2 Success (Batch API)
- [ ] 100% of batch jobs complete within 8 hours
- [ ] < 1% failure rate on batch requests
- [ ] Fallback to real-time working for failures
- [ ] Cost savings validated (50% vs real-time)

### Phase 3 Success (PDF Workers)
- [ ] p95 PDF generation time < 60 seconds
- [ ] 100 concurrent PDFs generated successfully
- [ ] Zero message loss in queue
- [ ] Dead letter queue processed correctly

### Phase 4 Success (Demonstrative Pipeline)
- [ ] 95% of demonstrative PDFs ready by 6 AM
- [ ] Parents can preview via portal
- [ ] Teacher satisfaction > 80% (survey)

### Phase 5 Success (Actual Pipeline)
- [ ] 99% of actual PDFs ready within 60s
- [ ] Notification delivery < 5 seconds
- [ ] Parent engagement increase > 20%

### Phase 6 Success (Production Rollout)
- [ ] Zero critical incidents during rollout
- [ ] Cost projections accurate within 10%
- [ ] User satisfaction > 85% (parent + teacher surveys)
- [ ] Support ticket volume < 1% of users

---

## Future Considerations

### MS365 Integration Pathway

This batch architecture creates the foundation for deeper MS365 integration:

**Phase 7 (Future): Word Document Generation**
- Replace react-pdf with Microsoft Graph API
- Generate `.docx` files with full emoji support
- Store in SharePoint/OneDrive
- Enable parent comments and annotations

**Phase 8 (Future): Parent Portal via SharePoint**
- SharePoint site per family
- Document library with all lesson plans
- Version history and retention policies
- Teams integration for parent-teacher chat

**Phase 9 (Future): Power BI Analytics**
- Aggregate lesson plan data
- Student progress dashboards
- District-wide reporting
- Predictive analytics (at-risk students)

### Additional Enhancements

1. **Multi-language Support:**
   - Generate PDFs in parent's preferred language
   - Azure Translator API integration
   - Cost: +10% per translation

2. **Accessibility:**
   - Screen reader optimized PDFs (PDF/UA)
   - High-contrast themes
   - Text-to-speech audio versions

3. **Custom Branding:**
   - District logo and colors
   - School-specific templates
   - White-label for resellers

4. **Advanced Analytics:**
   - PDF open rates (tracking pixels)
   - Time spent reading
   - Section engagement heatmaps

5. **Parent Engagement Features:**
   - "Ask a question" button in PDF
   - Share to social media (privacy-safe excerpts)
   - Print-friendly layouts

---

## Appendix

### Glossary

- **Demonstrative PDF:** Pre-generated lesson plan showing planned content
- **Actual PDF:** Post-completion lesson plan showing student results
- **Batch API:** Azure OpenAI API mode for async processing with 50% cost savings
- **Service Bus:** Azure message queue service with guaranteed delivery
- **Blob Storage:** Azure object storage for PDFs
- **SLA:** Service Level Agreement - performance targets

### References

- [Azure OpenAI Batch API Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/batch)
- [Azure Service Bus Queues](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions)
- [Azure Functions Best Practices](https://learn.microsoft.com/en-us/azure/azure-functions/functions-best-practices)
- [Azure Blob Storage Documentation](https://learn.microsoft.com/en-us/azure/storage/blobs/)

### Contact

**Project Lead:** TBD
**Architecture Review:** TBD
**Budget Approval:** TBD
**Target Start Date:** Q2 2026

---

**Document Version:** 1.0
**Last Updated:** October 5, 2025
**Status:** Approved for Future Consideration
