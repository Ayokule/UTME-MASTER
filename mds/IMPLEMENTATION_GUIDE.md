# UTME Master - Implementation Guide for Enhancements

## Phase 1: Critical Fixes (Week 1)

### 1. Complete Exam Service Implementation

**File**: `utme-master-backend/src/services/exam.service.ts`

**What needs to be done:**

```typescript
// 1. Complete resumeExam function
export async function resumeExam(studentExamId: string, studentId: string) {
  // Currently incomplete - needs full implementation
  // Should:
  // - Load student exam with all questions
  // - Calculate time remaining
  // - Load saved answers
  // - Return formatted exam data
}

// 2. Implement submitExam function
export async function submitExam(studentExamId: string, autoSubmit: boolean) {
  // Should:
  // - Mark exam as submitted
  // - Calculate score
  // - Determine pass/fail
  // - Generate results
  // - Return results data
}

// 3. Implement calculateScore function
function calculateScore(answers: any[], questions: any[]) {
  // Should:
  // - Compare student answers with correct answers
  // - Calculate total score
  // - Calculate percentage
  // - Determine grade
}

// 4. Implement getExamStatistics function
export async function getExamStatistics(examId: string) {
  // Should:
  // - Get all student attempts
  // - Calculate average score
  // - Calculate pass rate
  // - Get question-wise statistics
}
```

**Estimated Time**: 3-4 hours

---

### 2. Add Comprehensive Error Handling

**Frontend**: `utme-master-frontend/src/components/ErrorBoundary.tsx`

```typescript
// Create new file: ErrorBoundary.tsx
import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo)
    // Log to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-red-700 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Add to App.tsx:**
```typescript
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* existing routes */}
      </BrowserRouter>
    </ErrorBoundary>
  )
}
```

**Add retry logic to API client:**
```typescript
// utme-master-frontend/src/api/client.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

// Add retry interceptor
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config
    
    // Retry on network errors or 5xx errors
    if (!config.retryCount) {
      config.retryCount = 0
    }
    
    if (config.retryCount < 3 && (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
      config.retryCount++
      await new Promise(resolve => setTimeout(resolve, 1000 * config.retryCount))
      return apiClient(config)
    }
    
    return Promise.reject(error)
  }
)
```

**Estimated Time**: 2-3 hours

---

## Phase 2: Core Features (Week 2-3)

### 3. Implement Missing CRUD Endpoints

**Backend**: `utme-master-backend/src/routes/exam.routes.ts`

```typescript
// Add these routes:

// GET single exam
router.get(
  '/:id',
  authenticate,
  examController.getExam
)

// UPDATE exam
router.put(
  '/:id',
  authenticate,
  authorizeRole(['ADMIN', 'TEACHER']),
  validateBody(updateExamSchema),
  examController.updateExam
)

// DELETE exam
router.delete(
  '/:id',
  authenticate,
  authorizeRole(['ADMIN']),
  examController.deleteExam
)

// DUPLICATE exam
router.post(
  '/:id/duplicate',
  authenticate,
  authorizeRole(['ADMIN', 'TEACHER']),
  examController.duplicateExam
)

// GET exam statistics
router.get(
  '/:id/statistics',
  authenticate,
  examController.getExamStatistics
)
```

**Backend**: `utme-master-backend/src/controllers/exam.controller.ts`

```typescript
export const getExam = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const exam = await examService.getExam(id)
  res.json({ success: true, data: exam })
})

export const updateExam = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).user.id
  const exam = await examService.updateExam(id, req.body, userId)
  res.json({ success: true, data: exam })
})

export const deleteExam = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  await examService.deleteExam(id)
  res.json({ success: true, message: 'Exam deleted' })
})

export const duplicateExam = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).user.id
  const exam = await examService.duplicateExam(id, userId)
  res.json({ success: true, data: exam })
})

export const getExamStatistics = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const stats = await examService.getExamStatistics(id)
  res.json({ success: true, data: stats })
})
```

**Estimated Time**: 4-5 hours

---

### 4. Implement Progress Tracking

**Backend**: `utme-master-backend/src/services/analytics.service.ts`

```typescript
export async function getStudentProgress(studentId: string) {
  // Get all completed exams
  const exams = await prisma.studentExam.findMany({
    where: { studentId, status: 'SUBMITTED' },
    include: { exam: true }
  })

  // Calculate statistics
  const totalExams = exams.length
  const passedExams = exams.filter(e => e.passed).length
  const averageScore = exams.reduce((sum, e) => sum + e.score, 0) / totalExams

  // Get subject-wise progress
  const subjectProgress = await getSubjectProgress(studentId)

  // Get weak areas
  const weakAreas = await getWeakAreas(studentId)

  return {
    totalExams,
    passedExams,
    passRate: (passedExams / totalExams) * 100,
    averageScore,
    subjectProgress,
    weakAreas
  }
}

export async function getSubjectProgress(studentId: string) {
  // Get progress per subject
  const subjects = await prisma.subject.findMany()
  
  return Promise.all(subjects.map(async subject => {
    const exams = await prisma.studentExam.findMany({
      where: {
        studentId,
        status: 'SUBMITTED',
        exam: { subjectIds: { has: subject.id } }
      }
    })

    return {
      subject: subject.name,
      totalExams: exams.length,
      averageScore: exams.reduce((sum, e) => sum + e.score, 0) / exams.length,
      passRate: (exams.filter(e => e.passed).length / exams.length) * 100
    }
  }))
}

export async function getWeakAreas(studentId: string) {
  // Find questions where student got wrong answers
  const wrongAnswers = await prisma.studentAnswer.findMany({
    where: {
      studentExam: { studentId },
      isCorrect: false
    },
    include: {
      question: { include: { subject: true } }
    }
  })

  // Group by subject and topic
  const weakAreas = new Map()
  wrongAnswers.forEach(answer => {
    const key = answer.question.subject.name
    if (!weakAreas.has(key)) {
      weakAreas.set(key, 0)
    }
    weakAreas.set(key, weakAreas.get(key) + 1)
  })

  return Array.from(weakAreas.entries()).map(([subject, count]) => ({
    subject,
    wrongAnswers: count
  }))
}
```

**Frontend**: `utme-master-frontend/src/pages/student/ProgressDashboard.tsx`

```typescript
import { useEffect, useState } from 'react'
import { getStudentProgress } from '../../api/analytics'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function ProgressDashboard() {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [])

  async function loadProgress() {
    try {
      const data = await getStudentProgress()
      setProgress(data)
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!progress) return <div>No data</div>

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Exams" value={progress.totalExams} />
        <StatCard label="Passed" value={progress.passedExams} />
        <StatCard label="Pass Rate" value={`${progress.passRate.toFixed(1)}%`} />
        <StatCard label="Average Score" value={progress.averageScore.toFixed(1)} />
      </div>

      {/* Subject Progress */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Subject-wise Progress</h2>
        <div className="space-y-4">
          {progress.subjectProgress.map(subject => (
            <div key={subject.subject}>
              <div className="flex justify-between mb-2">
                <span>{subject.subject}</span>
                <span>{subject.averageScore.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${subject.averageScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Areas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Areas to Improve</h2>
        <div className="space-y-2">
          {progress.weakAreas.map(area => (
            <div key={area.subject} className="flex justify-between p-2 bg-red-50 rounded">
              <span>{area.subject}</span>
              <span className="text-red-600">{area.wrongAnswers} wrong answers</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
```

**Estimated Time**: 5-6 hours

---

### 5. Add License Tier Enforcement

**Backend**: `utme-master-backend/src/middleware/license.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import { ForbiddenError } from '../utils/errors'
import { prisma } from '../config/database'

export async function checkLicenseTier(requiredTier: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id
      
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new ForbiddenError('User not found')
      }

      const tierHierarchy = {
        'TRIAL': 0,
        'BASIC': 1,
        'PREMIUM': 2,
        'ENTERPRISE': 3
      }

      if (tierHierarchy[user.licenseTier] < tierHierarchy[requiredTier]) {
        throw new ForbiddenError(
          `This feature requires ${requiredTier} license. You have ${user.licenseTier}`
        )
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

export async function checkUsageLimit(feature: string, limit: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id

      const usage = await prisma.licenseUsage.findUnique({
        where: { userId }
      })

      if (usage && usage[feature] >= limit) {
        throw new ForbiddenError(
          `You have reached the limit for ${feature} (${limit})`
        )
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
```

**Usage in routes:**
```typescript
router.post(
  '/questions',
  authenticate,
  checkLicenseTier('BASIC'),
  checkUsageLimit('questions', 100),
  validateBody(createQuestionSchema),
  createQuestion
)
```

**Estimated Time**: 3-4 hours

---

## Phase 3: Enhancements (Week 4-5)

### 6. Add Database Schema Enhancements

**File**: `utme-master-backend/prisma/schema.prisma`

```prisma
// Add audit logs table
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // CREATE, UPDATE, DELETE
  entityType String  // Question, Exam, User
  entityId  String
  changes   Json?    // What changed
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([entityType])
  @@map("audit_logs")
}

// Add question tags
model QuestionTag {
  id         String @id @default(cuid())
  questionId String
  tag        String

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([questionId, tag])
  @@map("question_tags")
}

// Add notifications
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // EXAM_RESULT, REMINDER, ACHIEVEMENT
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("notifications")
}

// Add license usage tracking
model LicenseUsage {
  id              String @id @default(cuid())
  userId          String @unique
  questionsCreated Int   @default(0)
  examsCreated    Int   @default(0)
  studentsAdded   Int   @default(0)
  lastResetAt     DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@map("license_usage")
}
```

**Create migration:**
```bash
cd utme-master-backend
npx prisma migrate dev --name add_audit_and_tracking
```

**Estimated Time**: 2-3 hours

---

### 7. Add Pagination & Caching

**Backend**: `utme-master-backend/src/utils/pagination.ts`

```typescript
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function getPaginationParams(query: any): PaginationParams {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, parseInt(query.limit) || 10)
  return { page, limit }
}

export function getPaginationSkip(page: number, limit: number): number {
  return (page - 1) * limit
}

export async function paginate<T>(
  query: any,
  findMany: (skip: number, take: number) => Promise<T[]>,
  count: () => Promise<number>
): Promise<PaginatedResponse<T>> {
  const { page, limit } = getPaginationParams(query)
  const skip = getPaginationSkip(page, limit)

  const [data, total] = await Promise.all([
    findMany(skip, limit),
    count()
  ])

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}
```

**Usage in controller:**
```typescript
export const getQuestions = asyncHandler(async (req: Request, res: Response) => {
  const result = await paginate(
    req.query,
    (skip, take) => prisma.question.findMany({ skip, take }),
    () => prisma.question.count()
  )
  res.json({ success: true, data: result })
})
```

**Estimated Time**: 2-3 hours

---

## 📋 Implementation Checklist

### Phase 1 (Week 1)
- [ ] Complete exam service implementation
- [ ] Add error boundary to frontend
- [ ] Add retry logic to API client
- [ ] Test all error scenarios

### Phase 2 (Week 2-3)
- [ ] Implement CRUD endpoints
- [ ] Add progress tracking
- [ ] Add license tier enforcement
- [ ] Test all new endpoints

### Phase 3 (Week 4-5)
- [ ] Add database schema enhancements
- [ ] Implement pagination
- [ ] Add caching layer
- [ ] Add security middleware

### Phase 4 (Week 6+)
- [ ] Add API documentation
- [ ] Add test suite
- [ ] Performance optimization
- [ ] UI/UX improvements

---

## 🚀 Getting Started

1. **Pick one enhancement** from Phase 1
2. **Create a feature branch**: `git checkout -b feature/enhancement-name`
3. **Implement the feature** following the guide above
4. **Test thoroughly** before merging
5. **Move to next enhancement**

---

## 📞 Questions?

Refer to:
- `ENHANCEMENT_ROADMAP.md` - Full roadmap
- `SYSTEM_STATUS.md` - System overview
- `DEVELOPMENT_COMMANDS.md` - Development commands

