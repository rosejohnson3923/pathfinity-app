# Azure PDF Batch Generation - Implementation Checklist

This checklist provides a detailed task breakdown for implementing the batch PDF generation system. Use this to track progress and ensure nothing is missed.

---

## Pre-Implementation Phase

### Business Validation
- [ ] Confirm target deployment size (must be 1,000+ students for ROI)
- [ ] Identify 3-5 pilot districts/schools
- [ ] Survey parents/teachers about dual PDF feature value
- [ ] Secure budget approval ($36K-$48K development + $804/year Azure)
- [ ] Get executive sign-off on timeline (10 weeks)
- [ ] Assign project lead and technical team
- [ ] Set up bi-weekly stakeholder meetings

### Technical Prerequisites
- [ ] Azure subscription with OpenAI access approved
- [ ] Azure DevOps or GitHub project created
- [ ] Development team trained on Azure Functions
- [ ] Review FERPA/COPPA compliance requirements
- [ ] Identify staging/production environments
- [ ] Set up access to Azure Portal for team

---

## Phase 1: Infrastructure Setup (Week 1-2)

### Azure Resource Group
- [ ] Create resource group: `rg-pathfinity-pdf-batch-prod`
- [ ] Create resource group: `rg-pathfinity-pdf-batch-dev`
- [ ] Configure RBAC permissions for development team
- [ ] Document resource naming conventions

### Azure Service Bus
- [ ] Create Service Bus namespace: `sb-pathfinity-prod`
- [ ] Create queue: `pdf-generation-queue`
- [ ] Configure queue settings:
  - [ ] Max delivery count: 3
  - [ ] Lock duration: 5 minutes
  - [ ] Message TTL: 1 day
  - [ ] Dead letter on expiration: true
- [ ] Create dead letter queue monitoring alert
- [ ] Test queue connectivity

### Azure Blob Storage
- [ ] Create storage account: `stpathfinitypdfprod`
- [ ] Create containers:
  - [ ] `demonstrative`
  - [ ] `actual`
  - [ ] `archive`
- [ ] Configure lifecycle management:
  - [ ] Move to Cool tier after 30 days
  - [ ] Move to Archive tier after 90 days
  - [ ] Delete after 7 years (compliance retention)
- [ ] Enable soft delete (30 days retention)
- [ ] Configure CORS for parent portal access
- [ ] Test blob upload/download

### Azure Functions
- [ ] Create Function App: `func-pathfinity-pdf-prod`
- [ ] Configure runtime: Node.js 18 LTS
- [ ] Choose hosting plan: Consumption (start) or Premium (scale)
- [ ] Configure application settings (environment variables)
- [ ] Enable Application Insights
- [ ] Configure deployment slots (staging/production)
- [ ] Test function deployment

### Azure Key Vault
- [ ] Create Key Vault: `kv-pathfinity-prod`
- [ ] Add secrets:
  - [ ] Azure OpenAI API key
  - [ ] Service Bus connection string
  - [ ] Blob Storage connection string
  - [ ] Database connection string
  - [ ] SendGrid API key (notifications)
  - [ ] Twilio credentials (SMS)
- [ ] Configure access policies for Function App
- [ ] Test secret retrieval

### Application Insights
- [ ] Create Application Insights: `appi-pathfinity-pdf-prod`
- [ ] Configure instrumentation key in Function App
- [ ] Set up custom metrics:
  - [ ] `pdf_generation_duration`
  - [ ] `batch_job_completion_time`
  - [ ] `queue_depth`
  - [ ] `failed_generations`
- [ ] Create custom dashboard
- [ ] Configure alerts (see Monitoring section below)

### Infrastructure as Code
- [ ] Create Bicep/Terraform templates for all resources
- [ ] Version control IaC in repository
- [ ] Document deployment steps
- [ ] Test IaC deployment in dev environment
- [ ] Create CI/CD pipeline for infrastructure updates

### Monitoring & Alerts
- [ ] Configure Application Insights dashboard
- [ ] Create alerts:
  - [ ] High queue depth (> 500 messages)
  - [ ] Slow PDF generation (> 2 minutes)
  - [ ] Batch job failure
  - [ ] Demonstrative PDFs not ready by 6 AM
  - [ ] High error rate (> 1%)
- [ ] Set up PagerDuty/On-call rotation
- [ ] Test alert delivery

**Phase 1 Sign-Off:**
- [ ] All Azure resources provisioned
- [ ] IaC validated and version controlled
- [ ] Monitoring dashboards operational
- [ ] Team trained on Azure Portal
- [ ] Costs tracking within budget ($67/month)

---

## Phase 2: Batch API Integration (Week 3-4)

### Batch Request Service
- [ ] Create `src/services/batch/BatchRequestService.ts`
- [ ] Implement batch request builder:
  - [ ] Format requests per Azure OpenAI spec (JSONL)
  - [ ] Support multiple subjects per student
  - [ ] Include custom_id for tracking
- [ ] Implement batch file upload to Azure OpenAI
- [ ] Implement batch job submission
- [ ] Add error handling for API failures
- [ ] Write unit tests (80% coverage)

### Batch Monitor Service
- [ ] Create `src/services/batch/BatchMonitorService.ts`
- [ ] Implement polling mechanism (check every hour)
- [ ] Implement webhook endpoint for status updates
- [ ] Parse batch completion results
- [ ] Handle partial failures (some requests succeed, others fail)
- [ ] Write integration tests

### Batch Result Processor
- [ ] Create `src/services/batch/BatchResultProcessor.ts`
- [ ] Download output file from Azure OpenAI
- [ ] Parse JSONL results
- [ ] Map results back to lesson_plans records
- [ ] Queue successful results for PDF generation
- [ ] Fallback failed requests to real-time API
- [ ] Log metrics to Application Insights

### Database Schema
- [ ] Create migration: `20260401_create_batch_jobs_table.sql`
- [ ] Create migration: `20260401_create_pdf_generations_table.sql`
- [ ] Create migration: `20260401_create_pdf_notifications_table.sql`
- [ ] Add indexes for performance
- [ ] Run migrations in dev environment
- [ ] Validate schema with DBA

### Batch Scheduler (Azure Function - Timer Trigger)
- [ ] Create function: `scheduleDemonstrativeBatch`
- [ ] Trigger: Daily at 7:00 PM (cron: `0 0 19 * * *`)
- [ ] Logic:
  - [ ] Query tomorrow's scheduled lessons
  - [ ] Group by student
  - [ ] Build batch requests (4 subjects × N students)
  - [ ] Submit to Azure OpenAI Batch API
  - [ ] Record batch_job in database
- [ ] Test with 10 lessons
- [ ] Test with 100 lessons
- [ ] Test error handling (no lessons scheduled)

### Batch Completion Handler (Azure Function - Timer Trigger)
- [ ] Create function: `processBatchResults`
- [ ] Trigger: Every hour (cron: `0 0 * * * *`)
- [ ] Logic:
  - [ ] Query pending batches (status = 'submitted')
  - [ ] Check status for each batch
  - [ ] Download results if completed
  - [ ] Process results and queue PDFs
  - [ ] Update batch_job status
- [ ] Test with completed batch
- [ ] Test with failed batch

### Fallback to Real-time API
- [ ] Implement real-time fallback service
- [ ] Detect batch failures per request
- [ ] Call real-time API as backup
- [ ] Log fallback events for analysis
- [ ] Test fallback trigger scenarios

### Admin Dashboard
- [ ] Create admin page: `/admin/batch-jobs`
- [ ] Display batch job list with status
- [ ] Show batch details (request count, failures)
- [ ] Add manual retry button
- [ ] Add logs viewer
- [ ] Test with QA team

**Phase 2 Sign-Off:**
- [ ] Batch API integration working end-to-end
- [ ] 100 lessons successfully processed overnight
- [ ] < 1% failure rate on batch requests
- [ ] Fallback to real-time working
- [ ] Cost savings validated (50% vs baseline)

---

## Phase 3: PDF Generation Workers (Week 5-6)

### PDF Generator Function (Service Bus Trigger)
- [ ] Create function: `generatePDF`
- [ ] Trigger: Service Bus Queue message
- [ ] Migrate existing PDF generator code:
  - [ ] `UnifiedLessonPlanPDFGenerator.tsx` → serverless
  - [ ] Handle demonstrative template
  - [ ] Handle actual template
  - [ ] Strip emojis (existing logic)
  - [ ] Generate numeric answer options (existing logic)
- [ ] Implement blob storage upload
- [ ] Update database with PDF URL
- [ ] Handle errors and retries
- [ ] Test locally with Azure Storage Emulator

### Message Queue Integration
- [ ] Implement queue message sender (from batch processor)
- [ ] Implement queue message receiver (in PDF function)
- [ ] Handle message deserialization
- [ ] Implement idempotency (prevent duplicate PDFs)
- [ ] Test message flow end-to-end

### Demonstrative PDF Template
- [ ] Design demonstrative layout (preview version)
- [ ] Remove student-specific results
- [ ] Add "Preview" watermark
- [ ] Highlight learning objectives
- [ ] Show sample questions
- [ ] Test with sample data

### Actual PDF Template
- [ ] Enhance actual layout (results version)
- [ ] Add performance metrics section
- [ ] Add correct/incorrect indicators
- [ ] Add time spent per activity
- [ ] Add personalized feedback
- [ ] Show areas of strength/growth
- [ ] Test with sample results

### Notification Service
- [ ] Create `src/services/NotificationService.ts`
- [ ] Implement email notifications (SendGrid)
- [ ] Implement SMS notifications (Twilio) [optional]
- [ ] Implement push notifications (Firebase) [optional]
- [ ] Support notification preferences
- [ ] Template: "Sam's lesson plan is ready!"
- [ ] Include PDF download link
- [ ] Test email delivery
- [ ] Test notification logging

### Performance Optimization
- [ ] Profile PDF generation time
- [ ] Optimize for < 60 second target (p95)
- [ ] Implement streaming for large PDFs
- [ ] Reduce memory usage
- [ ] Test with 100 concurrent generations

### Error Handling
- [ ] Dead letter queue monitoring
- [ ] Manual retry mechanism for failed PDFs
- [ ] Alert on high failure rate (> 1%)
- [ ] Log detailed errors to Application Insights

**Phase 3 Sign-Off:**
- [ ] Queue message triggers PDF generation
- [ ] PDF uploaded to blob storage successfully
- [ ] p95 generation time < 60 seconds
- [ ] 100 concurrent PDFs generated successfully
- [ ] Notifications delivered reliably

---

## Phase 4: Demonstrative PDF Pipeline (Week 7)

### End-to-End Flow
- [ ] Test full demonstrative pipeline:
  1. [ ] Teacher schedules lesson (via admin panel)
  2. [ ] 7 PM: Batch job submits to OpenAI
  3. [ ] Overnight: Batch processes
  4. [ ] 6 AM: Results downloaded
  5. [ ] PDF queued and generated
  6. [ ] PDF uploaded to blob storage
  7. [ ] Database updated with URL
- [ ] Validate with 10 lessons
- [ ] Validate with 100 lessons

### Parent Portal Integration
- [ ] Create parent portal page: `/portal/lesson-plans`
- [ ] List upcoming lessons with "Preview" links
- [ ] Download demonstrative PDF from blob storage
- [ ] Handle PDF not ready yet (show "Generating...")
- [ ] Test UX with real parents (pilot)

### Teacher Dashboard
- [ ] Add "Preview PDFs" section to teacher dashboard
- [ ] Show generation status per lesson
- [ ] Allow manual re-generation if needed
- [ ] Test with pilot teachers

### Timing Optimization
- [ ] Analyze batch completion times
- [ ] Adjust batch submission time (7 PM vs 9 PM)
- [ ] Target 95% availability by 6 AM
- [ ] Monitor overnight queue processing

**Phase 4 Sign-Off:**
- [ ] 95% of demonstrative PDFs ready by 6 AM
- [ ] Parents can preview via portal
- [ ] Teachers can review before class
- [ ] No critical bugs reported
- [ ] Teacher satisfaction > 80% (survey)

---

## Phase 5: Actual PDF Pipeline (Week 8)

### Lesson Completion Integration
- [ ] Add "Complete Lesson" event handler
- [ ] Extract student results:
  - [ ] Question responses (correct/incorrect)
  - [ ] Time spent per activity
  - [ ] Performance metrics calculation
- [ ] Queue actual PDF generation message
- [ ] Non-blocking (student sees success immediately)
- [ ] Test with sample lesson completion

### Actual PDF Generation
- [ ] Implement actual PDF template rendering
- [ ] Include student's actual responses
- [ ] Calculate and display metrics:
  - [ ] Total questions
  - [ ] Correct answers
  - [ ] Percent correct
  - [ ] Time spent
  - [ ] Areas of strength
  - [ ] Areas for growth
- [ ] Test with various performance levels (high/medium/low)

### Notification Delivery
- [ ] Trigger notification on PDF ready
- [ ] Email parent with download link
- [ ] SMS notification (if opted in)
- [ ] Push notification (if app installed)
- [ ] Test notification delivery speed (< 5 seconds)

### Performance SLA
- [ ] Measure end-to-end time (completion → PDF ready)
- [ ] Target: < 60 seconds (p95)
- [ ] Optimize if needed:
  - [ ] Pre-warm function instances
  - [ ] Optimize PDF rendering
  - [ ] Parallelize where possible
- [ ] Load test: 100 concurrent completions

### Parent Portal - Results
- [ ] Update portal to show actual PDFs
- [ ] Display "Ready" indicator when complete
- [ ] Show notification history
- [ ] Allow re-download
- [ ] Test UX with parents

**Phase 5 Sign-Off:**
- [ ] 99% of actual PDFs ready within 60 seconds
- [ ] Notifications delivered < 5 seconds
- [ ] Load test passed (100 concurrent completions)
- [ ] Parent satisfaction > 85% (survey)

---

## Phase 6: Production Rollout (Week 9-10)

### Pre-Production Checklist
- [ ] All unit tests passing (> 80% coverage)
- [ ] All integration tests passing
- [ ] Load testing completed successfully
- [ ] Security review completed
- [ ] FERPA compliance validated
- [ ] Monitoring dashboards finalized
- [ ] Runbooks created for operations team
- [ ] Support team trained

### Gradual Rollout Plan
- [ ] **Day 1-3: 1% rollout**
  - [ ] Enable for 1 pilot school
  - [ ] Monitor closely for errors
  - [ ] Daily check-ins with pilot users
  - [ ] Fix any critical issues
- [ ] **Day 4-7: 10% rollout**
  - [ ] Expand to 3-5 schools
  - [ ] Validate cost projections
  - [ ] Monitor performance metrics
- [ ] **Day 8-10: 25% rollout**
  - [ ] Expand to district-wide (if pilot is district)
  - [ ] Gather user feedback
  - [ ] Optimize based on feedback
- [ ] **Day 11-14: 50% rollout**
  - [ ] Monitor costs vs projections
  - [ ] Check SLA compliance
  - [ ] Address any bugs
- [ ] **Day 15+: 100% rollout**
  - [ ] Full production launch
  - [ ] Announce to all users
  - [ ] Monitor for 7 days continuously

### Monitoring During Rollout
- [ ] Daily cost tracking (actual vs projected)
- [ ] Daily error rate monitoring (target < 1%)
- [ ] Daily SLA compliance check:
  - [ ] Demonstrative PDFs ready by 6 AM: > 95%
  - [ ] Actual PDFs ready < 60s: > 99%
- [ ] Weekly user satisfaction survey
- [ ] Weekly stakeholder update meeting

### Documentation
- [ ] Create operations runbook:
  - [ ] How to monitor batch jobs
  - [ ] How to retry failed PDFs
  - [ ] How to check queue health
  - [ ] How to respond to alerts
- [ ] Create user documentation:
  - [ ] Parent guide: "Understanding Your PDFs"
  - [ ] Teacher guide: "Scheduling & Previewing Lessons"
- [ ] Create developer documentation:
  - [ ] Architecture overview
  - [ ] Code walkthrough
  - [ ] Deployment process
  - [ ] Troubleshooting guide

### Training
- [ ] Train support team (2-hour session)
- [ ] Train teachers (1-hour webinar)
- [ ] Train parents (optional 30-min video)
- [ ] Create FAQ document

### Post-Launch Review
- [ ] Week 1: Daily stand-ups to address issues
- [ ] Week 2: Bi-weekly check-ins
- [ ] Week 4: Monthly review meeting
- [ ] Month 3: Retrospective and lessons learned

**Phase 6 Sign-Off:**
- [ ] 100% of users migrated
- [ ] Zero critical incidents during rollout
- [ ] Cost tracking within 10% of projections
- [ ] SLA targets consistently met
- [ ] User satisfaction > 85% (parents + teachers)
- [ ] Support ticket volume < 1% of users

---

## Post-Implementation

### Performance Optimization
- [ ] Analyze batch completion times (target 6-8 hours)
- [ ] Optimize queue processing throughput
- [ ] Review and optimize Azure function cold starts
- [ ] Implement caching where beneficial

### Cost Optimization
- [ ] Review actual costs vs projections
- [ ] Identify cost reduction opportunities:
  - [ ] Blob storage lifecycle optimization
  - [ ] Function app right-sizing
  - [ ] Batch API prompt optimization
- [ ] Quarterly cost review meetings

### Feature Enhancements
- [ ] Gather user feedback for V2 features
- [ ] Prioritize enhancements:
  - [ ] Multi-language PDF support
  - [ ] Custom branding per district
  - [ ] Advanced analytics in PDFs
- [ ] Plan Phase 7-9: MS365 Integration

### Compliance & Security
- [ ] Quarterly security audits
- [ ] Annual FERPA compliance review
- [ ] Review data retention policies
- [ ] Update privacy policy if needed

---

## Success Criteria Summary

### Technical Success
- [x] Demonstrative PDFs: 95% ready by 6 AM
- [x] Actual PDFs: 99% ready within 60 seconds
- [x] Error rate: < 1%
- [x] Zero data loss in queue
- [x] Cost within 10% of projections

### Business Success
- [x] 50% AI cost reduction achieved
- [x] Payback period < 18 months
- [x] Parent engagement increase > 20%
- [x] Teacher satisfaction > 85%
- [x] Support ticket volume < 1%

### User Success
- [x] Parents find dual PDFs valuable (survey)
- [x] Teachers use previews for planning
- [x] No complaints about PDF quality
- [x] Download rates > 80%

---

## Risks & Mitigation

| Risk | Mitigation | Owner |
|------|------------|-------|
| Batch API delays exceed 24 hours | Monitor daily; fallback to real-time | Tech Lead |
| Azure Functions cold start issues | Use Premium plan with pre-warmed instances | DevOps |
| Blob storage outage | Implement geo-redundancy (GRS) | DevOps |
| High error rate on rollout | Gradual rollout with quick rollback plan | PM |
| User confusion (two PDFs) | Clear labeling and parent onboarding | UX/Support |

---

## Contact & Escalation

**Project Lead:** [TBD]
**Technical Lead:** [TBD]
**Product Manager:** [TBD]
**On-Call Engineer:** [PagerDuty rotation]

**Escalation Path:**
1. Development Team → Technical Lead
2. Technical Lead → Project Lead
3. Project Lead → VP Engineering
4. Critical Issues → Page On-Call immediately

---

**Last Updated:** October 5, 2025
**Checklist Version:** 1.0
**Next Review:** Upon project kickoff
