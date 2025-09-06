# Development Standards and Best Practices
## Pathfinity Revolutionary Learning Platform

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Enforced Standards  
**Owner:** Engineering Team Lead  
**Reviewed By:** DevOps Director, CTO, Senior Engineers

---

## Executive Summary

This document defines the development standards that ensure Pathfinity's codebase remains maintainable, scalable, and revolutionary. These standards are not suggestions - they are requirements. Every line of code must support our value hierarchy (Career-First → PathIQ → Finn) while maintaining the quality needed to serve millions of students at <$0.05 per day.

---

## 1. Code Organization Standards

### 1.1 Project Structure

```
pathfinity-revolutionary/
├── src/
│   ├── components/          # React components
│   │   ├── career/          # Career-First components
│   │   ├── containers/      # Three-container system
│   │   ├── finn/           # Finn agent components
│   │   ├── pathiq/         # PathIQ intelligence components
│   │   └── shared/         # Shared/common components
│   ├── services/           # Business logic services
│   │   ├── ai/            # AI/ML services
│   │   ├── career/        # Career transformation
│   │   ├── content/       # Content generation
│   │   └── analytics/     # Analytics services
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript definitions
│   ├── constants/         # Application constants
│   └── styles/           # Global styles
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/            # End-to-end tests
├── docs/               # Documentation
└── config/            # Configuration files
```

### 1.2 File Naming Conventions

```typescript
// Components: PascalCase
CareerSelector.tsx
ThreeContainerOrchestrator.tsx
FinnAgentManager.tsx

// Services: camelCase with 'Service' suffix
careerTransformationService.ts
pathIQAnalysisService.ts
contentGenerationService.ts

// Hooks: camelCase with 'use' prefix
useCareerSelection.ts
useFlowState.ts
usePathIQPersonalization.ts

// Utils: camelCase descriptive names
formatCareerData.ts
calculateEngagementScore.ts
validateStudentProgress.ts

// Types: PascalCase with context
CareerTypes.ts
StudentProfile.ts
FinnAgentConfig.ts

// Constants: SCREAMING_SNAKE_CASE in files
CAREER_CONSTANTS.ts
PATHIQ_THRESHOLDS.ts
```

### 1.3 Module Organization

```typescript
// Each module follows consistent structure
// Example: Career Selection Module

// career/index.ts - Public API
export { CareerSelector } from './CareerSelector';
export { useCareerSelection } from './hooks/useCareerSelection';
export type { CareerSelectionProps } from './types';

// career/CareerSelector.tsx - Main component
import { useCareerSelection } from './hooks/useCareerSelection';
import { CareerWheel } from './components/CareerWheel';
import type { CareerSelectionProps } from './types';

// career/hooks/useCareerSelection.ts - Business logic
export const useCareerSelection = () => {
  // Hook implementation
};

// career/types.ts - Type definitions
export interface CareerSelectionProps {
  studentId: string;
  gradeLevel: number;
  previousCareers: Career[];
}
```

---

## 2. TypeScript Standards

### 2.1 Type Safety Requirements

```typescript
// REQUIRED: Strict TypeScript configuration
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2.2 Type Definition Standards

```typescript
// GOOD: Explicit, meaningful types
interface StudentCareerSession {
  sessionId: string;
  studentId: string;
  career: Career;
  startTime: Date;
  containers: {
    learn: ContainerProgress;
    experience: ContainerProgress;
    discover: ContainerProgress;
  };
  pathIQMetrics: PathIQSessionMetrics;
  finnAgents: FinnAgentActivity[];
}

// BAD: Using 'any' or weak types
interface Session {
  data: any; // NEVER use any
  info: object; // Too generic
  items: Array<unknown>; // Avoid unknown when possible
}

// GOOD: Discriminated unions for state
type CareerSelectionState = 
  | { status: 'idle' }
  | { status: 'selecting'; options: Career[] }
  | { status: 'selected'; career: Career }
  | { status: 'error'; error: Error };

// GOOD: Branded types for IDs
type StudentId = string & { readonly brand: unique symbol };
type CareerId = string & { readonly brand: unique symbol };
type SessionId = string & { readonly brand: unique symbol };

// GOOD: Const assertions for configuration
const CAREER_CONFIG = {
  minSelectionsPerDay: 1,
  maxSelectionsPerDay: 3,
  selectionTimeoutMs: 30000,
} as const;

type CareerConfig = typeof CAREER_CONFIG;
```

### 2.3 Generic Type Patterns

```typescript
// GOOD: Meaningful generic constraints
interface CareerTransformer<T extends BaseContent> {
  transform(content: T, career: Career): TransformedContent<T>;
  validate(content: T): ValidationResult;
}

// GOOD: Utility types for common patterns
type AsyncResult<T> = Promise<Result<T, Error>>;
type Nullable<T> = T | null;
type Optional<T> = T | undefined;

// Result type for error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// GOOD: Type guards
function isCareerContent(content: unknown): content is CareerContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'careerId' in content &&
    'transformedAt' in content
  );
}
```

---

## 3. React Standards

### 3.1 Component Patterns

```typescript
// GOOD: Functional components with proper typing
interface CareerDashboardProps {
  studentId: StudentId;
  currentCareer: Career;
  onCareerChange: (career: Career) => void;
  pathIQEnabled?: boolean;
}

export const CareerDashboard: React.FC<CareerDashboardProps> = ({
  studentId,
  currentCareer,
  onCareerChange,
  pathIQEnabled = true,
}) => {
  // Component implementation
  return (
    <div className="career-dashboard">
      {/* JSX */}
    </div>
  );
};

// GOOD: Custom hooks for logic separation
const useCareerProgression = (studentId: StudentId) => {
  const [progress, setProgress] = useState<CareerProgress>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    // Effect logic
  }, [studentId]);

  return { progress, loading, error };
};

// GOOD: Memo for expensive components
export const ExpensiveCareerVisualization = React.memo<VisualizationProps>(
  ({ data, options }) => {
    // Expensive rendering logic
    return <canvas />;
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### 3.2 State Management Standards

```typescript
// Using Zustand for global state
interface PathfinityStore {
  // Student state
  currentStudent: Student | null;
  currentCareer: Career | null;
  careerHistory: Career[];
  
  // PathIQ state
  flowState: FlowState;
  personalizationProfile: PersonalizationProfile;
  
  // Actions
  selectCareer: (career: Career) => void;
  updateFlowState: (state: FlowState) => void;
  resetSession: () => void;
}

const usePathfinityStore = create<PathfinityStore>((set, get) => ({
  currentStudent: null,
  currentCareer: null,
  careerHistory: [],
  flowState: 'idle',
  personalizationProfile: DEFAULT_PROFILE,
  
  selectCareer: (career) => set((state) => ({
    currentCareer: career,
    careerHistory: [...state.careerHistory, career],
  })),
  
  updateFlowState: (flowState) => set({ flowState }),
  
  resetSession: () => set({
    currentCareer: null,
    flowState: 'idle',
  }),
}));

// React Query for server state
const useCareerContent = (careerId: CareerId, studentId: StudentId) => {
  return useQuery({
    queryKey: ['careerContent', careerId, studentId],
    queryFn: () => fetchCareerContent(careerId, studentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

### 3.3 Performance Standards

```typescript
// REQUIRED: Lazy loading for routes
const CareerExplorer = lazy(() => import('./pages/CareerExplorer'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const TeacherPortal = lazy(() => import('./pages/TeacherPortal'));

// REQUIRED: Code splitting for large features
const PathIQAnalytics = lazy(() => 
  import(/* webpackChunkName: "pathiq-analytics" */ './features/PathIQAnalytics')
);

// GOOD: Virtualization for large lists
import { FixedSizeList } from 'react-window';

const CareerList: React.FC<{ careers: Career[] }> = ({ careers }) => (
  <FixedSizeList
    height={600}
    itemCount={careers.length}
    itemSize={80}
    width="100%"
  >
    {({ index, style }) => (
      <CareerItem career={careers[index]} style={style} />
    )}
  </FixedSizeList>
);

// GOOD: Debouncing expensive operations
const useCareerSearch = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  const searchResults = useQuery({
    queryKey: ['careerSearch', debouncedQuery],
    queryFn: () => searchCareers(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });
  
  return { query, setQuery, searchResults };
};
```

---

## 4. API Design Standards

### 4.1 RESTful API Conventions

```typescript
// API Route Structure
/api/v1/students/{studentId}/careers                    // GET: List careers
/api/v1/students/{studentId}/careers/current           // GET: Current career
/api/v1/students/{studentId}/careers/select            // POST: Select career
/api/v1/students/{studentId}/sessions                  // GET: List sessions
/api/v1/students/{studentId}/sessions/{sessionId}      // GET: Session details

// Response Format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Pagination
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Codes
enum ApiErrorCode {
  // Client errors (4xx)
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  
  // Business logic errors
  CAREER_NOT_AVAILABLE = 'CAREER_NOT_AVAILABLE',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  CONTENT_GENERATION_FAILED = 'CONTENT_GENERATION_FAILED',
}
```

### 4.2 GraphQL Standards

```graphql
# Schema organization
type Query {
  # Student queries
  student(id: ID!): Student
  studentCareerHistory(studentId: ID!, limit: Int = 10): [CareerSession!]!
  
  # Career queries
  availableCareers(studentId: ID!, date: Date!): CareerSelection!
  careerDetails(id: ID!): Career
  
  # PathIQ queries
  studentFlowState(studentId: ID!): FlowState
  personalizationProfile(studentId: ID!): PersonalizationProfile
}

type Mutation {
  # Career mutations
  selectCareer(input: SelectCareerInput!): SelectCareerPayload!
  completeContainer(input: CompleteContainerInput!): CompleteContainerPayload!
  
  # Session mutations
  startSession(studentId: ID!): Session!
  endSession(sessionId: ID!): Session!
}

type Subscription {
  # Real-time updates
  studentProgress(studentId: ID!): ProgressUpdate!
  classroomActivity(classId: ID!): ClassroomUpdate!
}

# Input types
input SelectCareerInput {
  studentId: ID!
  careerId: ID!
  reason: SelectionReason
}

# Payload types
type SelectCareerPayload {
  success: Boolean!
  career: Career
  session: Session
  errors: [Error!]
}
```

---

## 5. Testing Standards

### 5.1 Test Structure

```typescript
// Unit Test Example
describe('CareerTransformationService', () => {
  describe('transformContent', () => {
    it('should transform math content for Software Engineer career', () => {
      // Arrange
      const content = createMockMathContent();
      const career = createMockCareer('software-engineer');
      const service = new CareerTransformationService();
      
      // Act
      const transformed = service.transformContent(content, career);
      
      // Assert
      expect(transformed.context).toContain('algorithm');
      expect(transformed.problems).toHaveLength(content.problems.length);
      expect(transformed.career).toEqual(career);
    });
    
    it('should handle null content gracefully', () => {
      // Test error cases
    });
  });
});

// Integration Test Example
describe('Career Selection Flow', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleRef.createNestApplication();
    await app.init();
  });
  
  it('should complete full career selection flow', async () => {
    // Create student
    const student = await createTestStudent();
    
    // Get available careers
    const response = await request(app.getHttpServer())
      .get(`/api/v1/students/${student.id}/careers/available`)
      .expect(200);
    
    expect(response.body.data).toHaveLength(4);
    
    // Select career
    const career = response.body.data[0];
    const selection = await request(app.getHttpServer())
      .post(`/api/v1/students/${student.id}/careers/select`)
      .send({ careerId: career.id })
      .expect(201);
    
    expect(selection.body.data.career).toEqual(career);
  });
});
```

### 5.2 Test Coverage Requirements

```yaml
Coverage Thresholds:
  statements: 80%
  branches: 75%
  functions: 80%
  lines: 80%

Critical Path Coverage:
  Career Selection: 100%
  Content Generation: 100%
  PathIQ Analysis: 95%
  Payment Processing: 100%
  User Authentication: 100%

Test Distribution:
  Unit Tests: 70%
  Integration Tests: 20%
  E2E Tests: 10%
```

### 5.3 Testing Best Practices

```typescript
// GOOD: Descriptive test names
it('should maintain flow state above 70% when difficulty matches skill level', () => {});

// GOOD: Test data builders
const createTestStudent = (overrides?: Partial<Student>): Student => ({
  id: generateId(),
  name: 'Test Student',
  gradeLevel: 5,
  ...overrides,
});

// GOOD: Custom matchers
expect.extend({
  toBeInFlowState(received: FlowState) {
    const pass = received.engagement > 70 && received.frustration < 30;
    return {
      pass,
      message: () => 
        `Expected flow state, got engagement: ${received.engagement}, frustration: ${received.frustration}`,
    };
  },
});

// GOOD: Snapshot testing for UI
it('should render career dashboard correctly', () => {
  const component = render(
    <CareerDashboard 
      studentId="123" 
      currentCareer={mockCareer} 
    />
  );
  expect(component).toMatchSnapshot();
});
```

---

## 6. Performance Standards

### 6.1 Bundle Size Limits

```javascript
// webpack.config.js
module.exports = {
  performance: {
    maxEntrypointSize: 250000, // 250kb
    maxAssetSize: 200000, // 200kb
    hints: 'error', // Fail build if exceeded
  },
};

// Bundle analysis requirements
Main bundle: < 200kb gzipped
Vendor bundle: < 300kb gzipped
Per-route chunks: < 50kb gzipped
Total initial load: < 500kb gzipped
```

### 6.2 Performance Monitoring

```typescript
// Required performance marks
performance.mark('career-selection-start');
// ... selection logic
performance.mark('career-selection-end');
performance.measure(
  'career-selection',
  'career-selection-start',
  'career-selection-end'
);

// Performance observer
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 1000) {
      console.warn(`Slow operation: ${entry.name} took ${entry.duration}ms`);
      // Send to analytics
      analytics.track('performance.slow_operation', {
        operation: entry.name,
        duration: entry.duration,
      });
    }
  }
});
observer.observe({ entryTypes: ['measure'] });
```

### 6.3 Optimization Requirements

```typescript
// REQUIRED: Image optimization
// All images must be:
// - WebP format with fallbacks
// - Responsive sizes
// - Lazy loaded
// - < 100kb per image

// REQUIRED: API response caching
const cacheStrategy = {
  'career-list': '24 hours',
  'student-profile': '1 hour',
  'content-static': '7 days',
  'analytics': 'no-cache',
  'real-time': 'no-cache',
};

// REQUIRED: Database query optimization
// - All queries must use indexes
// - No N+1 queries
// - Batch operations when possible
// - Connection pooling configured
```

---

## 7. Security Standards

### 7.1 Input Validation

```typescript
// REQUIRED: Validate all inputs
import { z } from 'zod';

const CareerSelectionSchema = z.object({
  studentId: z.string().uuid(),
  careerId: z.string().uuid(),
  timestamp: z.date(),
  reason: z.enum(['daily', 'passion', 'retry']).optional(),
});

// Usage
const validateCareerSelection = (data: unknown) => {
  try {
    return CareerSelectionSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid career selection data', error);
  }
};

// REQUIRED: Sanitize user content
import DOMPurify from 'isomorphic-dompurify';

const sanitizeUserInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
  });
};
```

### 7.2 Authentication & Authorization

```typescript
// REQUIRED: Implement proper auth checks
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// REQUIRED: Role-based access control
const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// REQUIRED: Data access control
const canAccessStudentData = (userId: string, studentId: string): boolean => {
  // Check if user is student themselves
  if (userId === studentId) return true;
  
  // Check if user is student's teacher
  if (isTeacherOfStudent(userId, studentId)) return true;
  
  // Check if user is student's parent
  if (isParentOfStudent(userId, studentId)) return true;
  
  // Check if user is admin
  if (isAdmin(userId)) return true;
  
  return false;
};
```

### 7.3 Sensitive Data Handling

```typescript
// NEVER log sensitive data
const sanitizeForLogging = (data: any): any => {
  const sensitive = ['password', 'ssn', 'email', 'phone', 'address'];
  const sanitized = { ...data };
  
  sensitive.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

// REQUIRED: Encrypt sensitive data at rest
import { encrypt, decrypt } from './crypto';

const storeStudentData = async (data: StudentData) => {
  const encrypted = {
    ...data,
    ssn: encrypt(data.ssn),
    parentEmail: encrypt(data.parentEmail),
  };
  
  await database.students.create(encrypted);
};
```

---

## 8. Documentation Standards

### 8.1 Code Documentation

```typescript
/**
 * Transforms academic content to align with selected career context.
 * This is the core of our Career-First philosophy implementation.
 * 
 * @param content - Original academic content to transform
 * @param career - Selected career for contextualization
 * @param studentProfile - Student's learning profile for personalization
 * @returns Transformed content with career context applied
 * 
 * @example
 * const transformed = transformContent(
 *   mathContent,
 *   { id: 'software-engineer', name: 'Software Engineer' },
 *   studentProfile
 * );
 * 
 * @throws {ContentTransformationError} If transformation fails
 * @since 1.0.0
 */
export const transformContent = (
  content: AcademicContent,
  career: Career,
  studentProfile: StudentProfile
): TransformedContent => {
  // Implementation
};

// REQUIRED: Document complex algorithms
/**
 * PathIQ Flow State Algorithm
 * 
 * Maintains optimal challenge-skill balance to achieve flow state.
 * Based on Csikszentmihalyi's Flow Theory with proprietary adaptations.
 * 
 * Algorithm:
 * 1. Measure current performance (accuracy, speed, engagement)
 * 2. Calculate optimal challenge level (skill * 1.1)
 * 3. Adjust content difficulty incrementally
 * 4. Monitor emotional indicators
 * 5. Fine-tune in real-time
 * 
 * Target: 70-85% time in flow state
 */
const calculateFlowAdjustment = (metrics: PerformanceMetrics): DifficultyAdjustment => {
  // Implementation
};
```

### 8.2 API Documentation

```typescript
/**
 * @api {post} /api/v1/students/:studentId/careers/select Select Career
 * @apiName SelectCareer
 * @apiGroup Careers
 * @apiVersion 1.0.0
 * 
 * @apiDescription Allows student to select their daily career.
 * Implements Career-First value proposition.
 * 
 * @apiParam {UUID} studentId Student's unique identifier
 * @apiBody {UUID} careerId Selected career ID
 * @apiBody {String} [reason] Selection reason (daily|passion|retry)
 * 
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} career Selected career details
 * @apiSuccess {Object} session New learning session
 * 
 * @apiError {401} Unauthorized Student not authenticated
 * @apiError {403} Forbidden Career not available for student
 * @apiError {429} TooManyRequests Daily selection limit exceeded
 * 
 * @apiExample {curl} Example usage:
 * curl -X POST https://api.pathfinity.com/api/v1/students/123/careers/select \
 *   -H "Authorization: Bearer token" \
 *   -H "Content-Type: application/json" \
 *   -d '{"careerId": "456", "reason": "passion"}'
 */
```

---

## 9. Git Standards

### 9.1 Branch Strategy

```bash
# Branch naming convention
feature/JIRA-123-career-selection
bugfix/JIRA-456-flow-state-calculation
hotfix/JIRA-789-payment-processing
release/v1.2.0
chore/update-dependencies

# Protected branches
main          # Production code
develop       # Integration branch
staging       # Staging environment

# Branch protection rules
- Require PR reviews (minimum 2)
- Require status checks to pass
- Require branches to be up to date
- Include administrators in restrictions
```

### 9.2 Commit Standards

```bash
# Conventional commits format
<type>(<scope>): <subject>

<body>

<footer>

# Types
feat: New feature
fix: Bug fix
docs: Documentation
style: Code style (no logic change)
refactor: Code refactoring
perf: Performance improvement
test: Test additions/changes
chore: Build/tooling changes

# Examples
feat(career): implement daily career selection wheel
fix(pathiq): correct flow state calculation for edge cases
docs(api): add GraphQL schema documentation
perf(cache): implement predictive content caching
test(e2e): add career selection flow tests

# Commit message rules
- Subject line max 50 characters
- Use imperative mood
- No period at end of subject
- Body wraps at 72 characters
- Reference JIRA tickets in footer
```

### 9.3 Pull Request Standards

```markdown
## PR Template

### Description
Brief description of changes

### Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

### How Has This Been Tested?
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

### Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing

### Screenshots (if applicable)

### Related Issues
Closes #123
```

---

## 10. Development Environment

### 10.1 Required Tools

```yaml
Required Tools:
  Node.js: v18.x LTS
  npm: v9.x
  TypeScript: v5.x
  Git: v2.x
  
IDE Configuration:
  VSCode Extensions:
    - ESLint
    - Prettier
    - TypeScript Hero
    - GitLens
    - Jest Runner
    - React Developer Tools
    
  Settings:
    editor.formatOnSave: true
    editor.codeActionsOnSave:
      source.fixAll.eslint: true
    typescript.updateImportsOnFileMove.enabled: always
```

### 10.2 Environment Variables

```bash
# .env.example
# API Configuration
API_URL=http://localhost:3000
API_VERSION=v1

# Authentication
AUTH0_DOMAIN=pathfinity.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_AUDIENCE=https://api.pathfinity.com

# AI Services
OPENAI_API_KEY=sk-...
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_KEY=...

# Analytics
MIXPANEL_TOKEN=...
SENTRY_DSN=...

# Feature Flags
ENABLE_PATHIQ=true
ENABLE_FINN_AGENTS=true
ENABLE_VR_MODE=false

# Performance
CACHE_TTL=3600
MAX_CONCURRENT_USERS=10000
```

---

## 11. Code Review Checklist

### Required Reviews

- [ ] **Value Hierarchy**: Does code support Career-First → PathIQ → Finn?
- [ ] **Performance**: Will this scale to millions of users?
- [ ] **Cost**: Does this maintain <$0.05 per student per day?
- [ ] **Security**: Are all inputs validated and sanitized?
- [ ] **Testing**: Is coverage adequate (>80%)?
- [ ] **Documentation**: Is code self-documenting with comments where needed?
- [ ] **Accessibility**: Does UI meet WCAG 2.1 AA standards?
- [ ] **Error Handling**: Are all errors handled gracefully?
- [ ] **Logging**: Is logging appropriate (not too much/little)?
- [ ] **Cache**: Are caching strategies implemented?

---

## 12. Performance Optimization Patterns

### 12.1 Caching Strategies

```typescript
// Multi-tier caching implementation
class CacheManager {
  private edgeCache: EdgeCache;
  private applicationCache: ApplicationCache;
  private databaseCache: DatabaseCache;
  
  async get<T>(key: string): Promise<T | null> {
    // L1: Edge cache (CDN)
    let value = await this.edgeCache.get(key);
    if (value) return value;
    
    // L2: Application cache (Redis)
    value = await this.applicationCache.get(key);
    if (value) {
      // Promote to edge cache
      await this.edgeCache.set(key, value, { ttl: 3600 });
      return value;
    }
    
    // L3: Database cache
    value = await this.databaseCache.get(key);
    if (value) {
      // Promote to higher caches
      await this.applicationCache.set(key, value, { ttl: 900 });
      await this.edgeCache.set(key, value, { ttl: 3600 });
      return value;
    }
    
    return null;
  }
}

// Predictive caching for career content
const predictiveCache = async (studentId: string) => {
  const profile = await getStudentProfile(studentId);
  const likelyCareers = await predictNextCareers(profile);
  
  // Pre-generate and cache content for likely selections
  for (const career of likelyCareers) {
    const content = await generateCareerContent(career, profile);
    await cacheManager.set(
      `content:${studentId}:${career.id}`,
      content,
      { ttl: 86400 } // 24 hours
    );
  }
};
```

---

## 13. Monitoring and Observability

### 13.1 Required Metrics

```typescript
// Performance metrics
metrics.histogram('api.response_time', responseTime, {
  endpoint: '/api/v1/careers/select',
  method: 'POST',
  status: 200,
});

// Business metrics
metrics.increment('career.selections', {
  career: career.name,
  grade: student.gradeLevel,
  time_of_day: getTimeOfDay(),
});

// PathIQ metrics
metrics.gauge('pathiq.flow_state', flowStatePercentage, {
  studentId: student.id,
  subject: content.subject,
});

// Cost metrics
metrics.gauge('infrastructure.cost_per_student', costPerStudent, {
  service: 'ai_generation',
  date: new Date(),
});
```

### 13.2 Logging Standards

```typescript
// Structured logging
logger.info('Career selected', {
  studentId: student.id,
  careerId: career.id,
  careerName: career.name,
  sessionId: session.id,
  timestamp: new Date().toISOString(),
  metadata: {
    gradeLevel: student.gradeLevel,
    selectionMethod: 'wheel',
    timeToSelect: 15230, // ms
  },
});

// Error logging with context
logger.error('Content generation failed', {
  error: error.message,
  stack: error.stack,
  context: {
    studentId: student.id,
    careerId: career.id,
    attemptNumber: 3,
    fallbackUsed: true,
  },
});
```

---

## Enforcement and Compliance

### Automated Enforcement

1. **Pre-commit hooks** validate standards
2. **CI/CD pipeline** enforces all checks
3. **Code coverage** gates prevent regression
4. **Performance budgets** block slow code
5. **Security scans** prevent vulnerabilities

### Consequences

- **Warning**: First violation - coaching provided
- **Block**: Second violation - PR blocked
- **Review**: Third violation - performance review impact

---

## Appendices

### Appendix A: Approved Libraries

```json
{
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "zustand": "^4.0.0",
  "react-query": "^3.0.0",
  "tailwindcss": "^3.0.0",
  "framer-motion": "^10.0.0",
  "zod": "^3.0.0",
  "date-fns": "^2.0.0"
}
```

### Appendix B: Performance Benchmarks

- API Response: < 200ms (p95)
- Page Load: < 2s
- Time to Interactive: < 3s
- Flow State Achievement: > 70%
- Cache Hit Rate: > 80%

### Appendix C: Security Requirements

- OWASP Top 10 compliance
- COPPA compliance for K-12
- FERPA compliance for records
- SOC 2 Type II certification
- Annual penetration testing

---

*End of Development Standards Document*

**Next Document:** Component Library Documentation

---