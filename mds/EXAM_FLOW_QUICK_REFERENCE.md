# Exam Flow - Quick Reference Guide

**For**: Developers integrating or debugging exam flow  
**Updated**: 2026-03-14

---

## Route Parameters (STANDARDIZED)

```
✅ /student/exam/:studentExamId
✅ /student/results/:studentExamId
✅ /student/exam-review/:studentExamId
```

**Usage**:
```typescript
const { studentExamId } = useParams<{ studentExamId: string }>()
navigate(`/student/exam/${studentExamId}`)
```

---

## API Functions (All in `src/api/exams.ts`)

### Start Exam
```typescript
// Practice exam with custom parameters
const response = await startPracticeExam({
  subject: 'Mathematics',
  examType: 'JAMB',
  difficulty: 'MEDIUM',
  questionCount: 40,
  duration: 60
})
const studentExamId = response.data.studentExamId
```

### Resume/Start Exam
```typescript
// Try to resume existing exam
try {
  const data = await resumeExam(studentExamId)
} catch (error) {
  if (error.response?.status === 400) {
    // Exam already submitted - redirect to results
    navigate(`/student/results/${studentExamId}`)
  } else {
    // Start new exam
    const data = await startExam(studentExamId)
  }
}
```

### Save Answer
```typescript
// Called during exam when student selects answer
await submitAnswer(studentExamId, questionId, answer, timeSpent)
// Doesn't throw on error - exam continues
```

### Submit Exam
```typescript
// Manual submission
const results = await submitExam(studentExamId)

// Auto-submission (time ran out)
const results = await submitExam(studentExamId, true)

// Navigate to results
navigate(`/student/results/${studentExamId}`)
```

### Get Results
```typescript
// In Results.tsx
const results = await getExamResults(studentExamId)
// Returns: { exam, score, subjects, questions, analytics, canRetake, ... }
```

### Get Review Questions
```typescript
// In ExamReview.tsx
const reviewData = await getReviewQuestions(studentExamId)
// Returns: { questions: [...] }
```

---

## Results API (All in `src/api/results.ts`)

```typescript
// Get results
const results = await getExamResults(studentExamId)

// Retake exam
const { studentExamId: newId } = await retakeExam(examId)

// Download PDF
const blob = await downloadResultsPDF(studentExamId)
```

---

## Type Definitions

### ExamData (from API)
```typescript
interface ExamData {
  studentExamId: string
  examTitle: string
  duration: number
  totalQuestions: number
  totalMarks: number
  startedAt: string
  timeRemaining: number
  questions: ExamQuestion[]
  currentQuestionIndex: number
  savedAnswers?: Record<string, any>
}
```

### ExamResults (from API)
```typescript
interface ExamResults {
  exam: {
    id: string
    title: string
    duration: number
    totalQuestions: number
    description: string
  }
  score: {
    total: number
    max: number
    percentage: number
    grade: string
    passed: boolean
    timeTaken: number
  }
  subjects: Array<{
    name: string
    score: number
    max: number
    correct: number
    total: number
    percentage: number
  }>
  questions: Array<{
    id: string
    questionNumber: number
    questionText: string
    options: any[]
    selectedAnswer: string | null
    correctAnswer: string
    isCorrect: boolean
    explanation: string
    subject: string
    difficulty: string
    pointsEarned: number
    timeSpent: number
  }>
  analytics?: {
    improvement: number
    predictedScore: number
    rankingPercentile: number
    strengthsChart: Array<{subject: string, accuracy: number}>
    weaknessesChart: Array<{subject: string, accuracy: number}>
    topicBreakdown: any[]
  }
  canRetake: boolean
  attemptNumber: number
  submittedAt: string
}
```

---

## Timer Implementation (FIXED)

```typescript
// ✅ CORRECT: Timer runs once, no race condition
useEffect(() => {
  if (timeRemaining <= 0) return

  timerRef.current = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        handleAutoSubmit()  // Called exactly once
        return 0
      }
      return prev - 1
    })
  }, 1000)

  return () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }
}, []) // Empty dependency array - only run once
```

---

## Common Patterns

### Load Exam
```typescript
async function loadExam() {
  if (!studentExamId || !token) {
    navigate('/student/dashboard')
    return
  }

  try {
    let data
    try {
      data = await resumeExam(studentExamId)
    } catch (error: any) {
      if (error.response?.status === 400) {
        navigate(`/student/results/${studentExamId}`)
        return
      }
      data = await startExam(studentExamId)
    }
    
    setExamData(data.data)
    setTimeRemaining(data.data.timeRemaining || 0)
  } catch (error: any) {
    showToast.error(error.message)
    navigate('/student/dashboard')
  }
}
```

### Handle Answer Change
```typescript
function handleAnswerChange(questionId: string, answer: any) {
  setAnswers(prev => ({
    ...prev,
    [questionId]: answer
  }))
  // Save answer (doesn't throw on error)
  submitAnswer(examData.studentExamId, questionId, answer, timeSpent)
}
```

### Submit Exam
```typescript
async function handleSubmitExam() {
  const unanswered = examData.totalQuestions - Object.keys(answers).length
  if (unanswered > 0) {
    const confirm = window.confirm(`${unanswered} unanswered. Submit anyway?`)
    if (!confirm) return
  }

  try {
    const data = await submitExam(examData.studentExamId)
    navigate(`/student/results/${examData.studentExamId}`)
  } catch (error: any) {
    showToast.error(error.message)
  }
}
```

---

## Error Handling

### API Errors
```typescript
// All API functions throw meaningful errors
try {
  const data = await startPracticeExam(params)
} catch (error: any) {
  // error.message is user-friendly
  showToast.error(error.message)
}
```

### Answer Save Errors
```typescript
// Answer saves don't throw - exam continues
const result = await submitAnswer(...)
if (!result.success) {
  console.warn('Answer save failed, but exam continues')
}
```

### Exam Already Submitted
```typescript
try {
  const data = await resumeExam(studentExamId)
} catch (error: any) {
  if (error.response?.status === 400 && 
      error.response?.data?.message?.includes('submitted')) {
    // Redirect to results
    navigate(`/student/results/${studentExamId}`)
  }
}
```

---

## Debugging

### Console Logs
```
🔄 [EXAMS API] Starting practice exam with params: {...}
✅ [EXAMS API] Practice exam started successfully: exam-123
❌ [EXAMS API] Failed to start practice exam: {...}

🔄 [EXAM INTERFACE] Attempting to resume exam: exam-123
✅ [EXAM INTERFACE] Exam loaded successfully: {...}
❌ [EXAM INTERFACE] Error loading exam: {...}

🔄 [EXAM SUBMIT] Submitting exam: exam-123
✅ [EXAM SUBMIT] Exam submitted successfully: {...}
❌ [EXAM SUBMIT] Failed to submit exam: {...}
```

### Check Network Tab
- Look for `/api/student/exam/start` POST request
- Look for `/api/student/exam/:id/resume` GET request
- Look for `/api/student/exam/:id/submit` POST request
- Look for `/api/student/results/:id` GET request

### Check Browser Console
- Look for 🔄, ✅, ❌ logs
- Check for error messages
- Verify API responses match expected structure

---

## Common Issues & Solutions

### Issue: "Cannot read property of undefined"
**Cause**: Component rendering before data loads  
**Solution**: Add null checks
```typescript
if (!examData) return <LoadingState />
```

### Issue: Timer counts down twice
**Cause**: Timer effect depends on timeRemaining  
**Solution**: Use empty dependency array
```typescript
}, []) // Not [timeRemaining]
```

### Issue: Exam submits twice
**Cause**: handleAutoSubmit called multiple times  
**Solution**: Check submitting flag
```typescript
if (submitting) return
setSubmitting(true)
```

### Issue: Route parameter undefined
**Cause**: Using wrong parameter name  
**Solution**: Use :studentExamId consistently
```typescript
const { studentExamId } = useParams<{ studentExamId: string }>()
```

### Issue: Results not loading
**Cause**: Wrong API endpoint  
**Solution**: Use /api/student/results/:studentExamId
```typescript
const response = await apiClient.get(`/api/student/results/${studentExamId}`)
```

---

## Testing Commands

```bash
# Start backend
cd utme-master-backend
npm run dev

# Start frontend
cd utme-master-frontend
npm run dev

# Type check
npm run type-check

# Run tests
npm run test
```

---

## API Endpoints

```
POST /api/student/exam/start
GET /api/student/exam/:studentExamId/resume
POST /api/student/exam/:studentExamId/start
POST /api/student/exam/:studentExamId/answer
POST /api/student/exam/:studentExamId/submit
GET /api/student/results/:studentExamId
GET /api/student/results/:studentExamId/pdf
POST /api/exams/:examId/retake
GET /api/student/exam-review/:studentExamId/questions
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/api/exams.ts` | Exam API functions |
| `src/api/results.ts` | Results API functions |
| `src/types/results.ts` | Results type definitions |
| `src/pages/student/ExamStart.tsx` | Start exam page |
| `src/pages/student/ExamInterface.tsx` | Exam taking interface |
| `src/pages/student/Results.tsx` | Results page |
| `src/pages/student/ExamReview.tsx` | Review page |
| `src/App.tsx` | Route definitions |

---

**Last Updated**: 2026-03-14  
**Status**: ✅ Production Ready
