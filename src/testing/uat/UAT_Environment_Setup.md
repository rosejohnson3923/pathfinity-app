# PATHFINITY UAT ENVIRONMENT SETUP
**User Acceptance Testing Environment Configuration**

## 1. ENVIRONMENT SPECIFICATIONS

### 1.1 Infrastructure
- **Environment**: Azure Cloud UAT
- **URL**: https://uat.pathfinity.ai
- **Database**: PostgreSQL 14 (dedicated UAT instance)
- **Redis Cache**: Dedicated UAT cache cluster
- **AI Service**: Azure OpenAI UAT endpoint (GPT-4o)
- **CDN**: Azure CDN for static assets
- **SSL**: Wildcard certificate for *.pathfinity.ai

### 1.2 Resource Allocation
- **Web Servers**: 3x Standard D4s v3 (4 vCPU, 16GB RAM)
- **Database**: Standard D8s v3 (8 vCPU, 32GB RAM)
- **Cache**: Standard C2 (2.5GB)
- **Storage**: Premium SSD with backup replication
- **Auto-scaling**: 3-10 instances based on load

### 1.3 Security Configuration
- **Network**: VPN access for stakeholders
- **Authentication**: Azure AD integration + local accounts
- **Encryption**: TLS 1.3 for all communications
- **Monitoring**: Azure Monitor + custom logging
- **Backup**: 4-hour automated backups with 30-day retention

## 2. TEST DATA CONFIGURATION

### 2.1 Student Test Accounts

#### Kindergarten Students (Ages 5-6)
```
Username: k.emma@uat.pathfinity.ai    | Password: KinderTest123! | Grade: K | Age: 5
Username: k.noah@uat.pathfinity.ai    | Password: KinderTest123! | Grade: K | Age: 6
Username: k.sophia@uat.pathfinity.ai  | Password: KinderTest123! | Grade: K | Age: 5
```

#### Elementary Students (Ages 8-11)
```
Username: e.liam@uat.pathfinity.ai     | Password: ElemTest123! | Grade: 3 | Age: 8
Username: e.olivia@uat.pathfinity.ai   | Password: ElemTest123! | Grade: 3 | Age: 9
Username: e.ethan@uat.pathfinity.ai    | Password: ElemTest123! | Grade: 5 | Age: 10
Username: e.ava@uat.pathfinity.ai      | Password: ElemTest123! | Grade: 5 | Age: 11
```

#### Middle School Students (Ages 11-14)
```
Username: m.mason@uat.pathfinity.ai    | Password: MiddleTest123! | Grade: 7 | Age: 12
Username: m.isabella@uat.pathfinity.ai | Password: MiddleTest123! | Grade: 7 | Age: 13
Username: m.lucas@uat.pathfinity.ai    | Password: MiddleTest123! | Grade: 8 | Age: 13
Username: m.charlotte@uat.pathfinity.ai| Password: MiddleTest123! | Grade: 8 | Age: 14
```

#### High School Students (Ages 14-18)
```
Username: h.alexander@uat.pathfinity.ai | Password: HighTest123! | Grade: 10 | Age: 15
Username: h.amelia@uat.pathfinity.ai    | Password: HighTest123! | Grade: 11 | Age: 16
Username: h.benjamin@uat.pathfinity.ai  | Password: HighTest123! | Grade: 11 | Age: 17
Username: h.mia@uat.pathfinity.ai       | Password: HighTest123! | Grade: 12 | Age: 18
```

### 2.2 Educator Test Accounts

#### Teachers
```
Username: teacher.johnson@uat.pathfinity.ai  | Password: TeachTest123! | Role: K-2 Teacher
Username: teacher.williams@uat.pathfinity.ai | Password: TeachTest123! | Role: 3-5 Teacher
Username: teacher.brown@uat.pathfinity.ai    | Password: TeachTest123! | Role: 6-8 Teacher
Username: teacher.davis@uat.pathfinity.ai    | Password: TeachTest123! | Role: 9-12 Teacher
Username: teacher.miller@uat.pathfinity.ai   | Password: TeachTest123! | Role: Special Ed
```

#### Administrators
```
Username: principal.smith@uat.pathfinity.ai    | Password: AdminTest123! | Role: Principal
Username: superintendent.jones@uat.pathfinity.ai | Password: AdminTest123! | Role: Superintendent
Username: it.admin@uat.pathfinity.ai           | Password: AdminTest123! | Role: IT Administrator
```

### 2.3 Parent/Guardian Test Accounts
```
Username: parent.emma@uat.pathfinity.ai      | Password: ParentTest123! | Children: k.emma
Username: parent.noah@uat.pathfinity.ai      | Password: ParentTest123! | Children: k.noah
Username: parent.liam@uat.pathfinity.ai      | Password: ParentTest123! | Children: e.liam
Username: parent.olivia@uat.pathfinity.ai    | Password: ParentTest123! | Children: e.olivia
Username: parent.mason@uat.pathfinity.ai     | Password: ParentTest123! | Children: m.mason, h.alexander
```

### 2.4 Classroom and School Setup

#### Schools
```
School ID: UAT_ELEM_001
Name: Pathfinity Elementary UAT
Type: Elementary (K-5)
Students: 8 test students
Teachers: 2 test teachers

School ID: UAT_MIDDLE_001  
Name: Pathfinity Middle UAT
Type: Middle School (6-8)
Students: 4 test students
Teachers: 1 test teacher

School ID: UAT_HIGH_001
Name: Pathfinity High UAT
Type: High School (9-12)
Students: 4 test students
Teachers: 2 test teachers
```

#### Classrooms
```
Classroom: Mrs. Johnson's Kindergarten
Teacher: teacher.johnson@uat.pathfinity.ai
Students: k.emma, k.noah, k.sophia
Subject: All Subjects (K)

Classroom: Mr. Williams' 3rd Grade
Teacher: teacher.williams@uat.pathfinity.ai
Students: e.liam, e.olivia
Subject: All Subjects (3)

Classroom: Mrs. Brown's 7th Grade Science
Teacher: teacher.brown@uat.pathfinity.ai
Students: m.mason, m.isabella, m.lucas, m.charlotte
Subject: Science

Classroom: Mr. Davis' 11th Grade Math
Teacher: teacher.davis@uat.pathfinity.ai
Students: h.alexander, h.amelia, h.benjamin, h.mia
Subject: Mathematics
```

## 3. CURRICULUM TEST DATA

### 3.1 Learning Standards Alignment
- **K-2**: Common Core State Standards for Mathematics and ELA
- **3-5**: CCSS + Next Generation Science Standards (NGSS)
- **6-8**: CCSS + NGSS + Social Studies Standards
- **9-12**: Advanced standards + AP/SAT prep content

### 3.2 Assessment Content
```
Kindergarten Math Assessment:
- Number recognition (1-20)
- Basic counting
- Shape identification
- Simple addition (visual)

3rd Grade Math Assessment:
- Multiplication tables (1-10)
- Fractions (basic)
- Word problems
- Measurement units

7th Grade Science Assessment:
- Scientific method
- Basic chemistry
- Life cycles
- Earth science concepts

11th Grade Math Assessment:
- Algebra II concepts
- Trigonometry basics
- Statistics
- SAT-style problems
```

### 3.3 AI Character Interaction Scripts

#### Sample Conversations for Testing
```
Finn (K-2 Focus):
- "Hello! I'm Finn! Want to count some fun animals with me?"
- "Let's practice our ABCs! Can you tell me what comes after B?"
- "I see you're working on shapes. Circles are my favorite! What's yours?"

Sage (3-5 Focus):
- "Greetings, young scientist! Ready to explore the amazing world around us?"
- "I heard you're studying fractions. Pizza is perfect for learning about parts and wholes!"
- "Let's discover how plants grow from tiny seeds into mighty trees!"

Spark (6-8 Focus):
- "Hey there, future innovator! Ready to solve some mind-bending problems?"
- "Science is everywhere! Want to see how chemistry works in your kitchen?"
- "Math isn't just numbers - it's the language of patterns and possibilities!"

Harmony (9-12 Focus):
- "Welcome, aspiring scholar! Let's explore ideas that shape our world."
- "Literature reveals the human experience. What stories speak to you?"
- "Critical thinking is your superpower. Let's analyze this complex topic together."
```

## 4. MONITORING AND LOGGING

### 4.1 UAT-Specific Monitoring
```yaml
Metrics Tracked:
- User session duration by age group
- AI character interaction frequency
- Assessment completion rates
- Error rates by user type
- Performance metrics during peak usage
- Content filtering effectiveness
- COPPA compliance violations (should be 0)
```

### 4.2 Stakeholder Access
```
Real-time Dashboard: https://uat-monitor.pathfinity.ai
- Product Owner: Full access to all metrics
- Education Team: Learning analytics and engagement
- Security Team: Compliance and safety metrics
- QA Team: Technical performance and errors
```

## 5. DATA PRIVACY AND CLEANUP

### 5.1 FERPA/COPPA Compliance in UAT
- All test student data is synthetic
- Parental consent documented for any real minor participants
- Data retention limited to UAT period + 30 days
- Audit logging of all data access during UAT

### 5.2 Post-UAT Cleanup
```sql
-- Automated cleanup script (runs after UAT completion)
DELETE FROM learning_analytics_events WHERE created_at >= 'UAT_START_DATE';
DELETE FROM ai_chat_logs WHERE created_at >= 'UAT_START_DATE';
DELETE FROM user_sessions WHERE created_at >= 'UAT_START_DATE';
DELETE FROM assessment_responses WHERE created_at >= 'UAT_START_DATE';

-- Anonymize any remaining test data
UPDATE users SET 
  email = CONCAT('deleted_', id, '@example.com'),
  first_name = 'Deleted',
  last_name = 'User'
WHERE email LIKE '%@uat.pathfinity.ai';
```

## 6. DISASTER RECOVERY

### 6.1 Backup Strategy
- **Database**: Automated backups every 4 hours
- **File Storage**: Real-time replication to secondary region
- **Configuration**: Infrastructure as Code (Terraform)
- **Recovery Time**: <30 minutes for complete environment

### 6.2 Rollback Procedures
```bash
# Emergency rollback to previous stable version
kubectl rollout undo deployment/pathfinity-web -n uat
kubectl rollout undo deployment/pathfinity-api -n uat

# Database rollback (if necessary)
pg_restore --clean --if-exists -d pathfinity_uat backup_before_uat.sql
```

## 7. NETWORK AND SECURITY

### 7.1 Access Controls
```
VPN Access Required:
- IP Whitelist: Stakeholder organization ranges
- MFA Required: All administrator accounts
- Session Timeout: 8 hours for stakeholders, 2 hours for students

Firewall Rules:
- Allow: HTTPS (443) from whitelisted IPs
- Allow: SSH (22) from admin VPN only
- Block: All other inbound traffic
```

### 7.2 Compliance Monitoring
```yaml
Real-time Alerts:
- Attempted access to student data without authorization
- AI character responses flagged by content filter
- Failed login attempts exceeding threshold
- Database access outside normal parameters
- Unusual data export activities
```

## 8. SUPPORT AND ESCALATION

### 8.1 UAT Support Team
```
Primary: qa.lead@pathfinity.ai        | Response: <1 hour
Secondary: dev.support@pathfinity.ai  | Response: <2 hours  
Emergency: cto@pathfinity.ai          | Response: <30 minutes
```

### 8.2 Issue Classification
```
P0 - Critical: System down, data breach, safety violation
P1 - High: Core functionality broken, compliance issue
P2 - Medium: Feature not working as expected
P3 - Low: UI/UX improvements, nice-to-have features
```

---

**Environment Status**: ✅ Ready for UAT
**Last Updated**: Phase 05 Testing
**Next Review**: Post-UAT Cleanup