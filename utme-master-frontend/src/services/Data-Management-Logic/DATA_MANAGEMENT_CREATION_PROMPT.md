# 🔧 AI PROMPT: Create Data Management System - Check Existing & No Duplicates

## CRITICAL INSTRUCTION: CREATE WITH INTELLIGENCE & SAFETY

I need you to create a **complete, error-free Data Management System** for UTME Master that:

1. ✅ **CHECKS existing project files FIRST** (don't duplicate what's already there)
2. ✅ **PREVENTS duplicate code** (reuse existing components/models)
3. ✅ **AVOIDS conflicts** (no naming collisions)
4. ✅ **Maintains consistency** (follows existing patterns)
5. ✅ **No errors** (validates all relationships, foreign keys, etc.)
6. ✅ **Production-ready** (type-safe, error-handled, commented)

---

## 🗂️ EXISTING PROJECT STRUCTURE

Before you create anything, **review these existing files** in the UTME Master project:

### **Currently Available Files (CHECK THESE FIRST!):**

```
Backend Structure (src/):
├── config/
│   └── database.ts (Prisma config)
├── models/ or schema/ or prisma/
│   └── *.prisma files (EXISTING SCHEMAS!)
├── controllers/
│   ├── auth.controller.ts
│   ├── dashboard_controller.ts
│   ├── exam_controller.ts
│   ├── results_controller.ts
│   ├── question_service.ts
│   └── admin_routes.ts
├── routes/
│   ├── auth_routes.ts
│   ├── dashboard_routes.ts
│   ├── exam.controller.ts
│   └── ...
├── services/
│   ├── exam.service.ts
│   ├── question.service.ts
│   └── ...
├── types/ or interfaces/
│   └── *.ts files (EXISTING TYPES!)
└── store/ (Frontend)
    ├── auth.ts (useAuthStore)
    ├── question.ts
    └── ...

Frontend Structure (src/):
├── components/
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   └── dashboard/
│       └── StatCard.tsx, etc.
├── pages/
│   ├── auth/
│   ├── student/
│   │   └── Dashboard.tsx (NEW - already created)
│   ├── teacher/
│   └── admin/
├── api/
│   ├── client.ts (API client)
│   ├── admin.ts
│   ├── dashboard.ts
│   └── ...
├── store/
│   └── auth.ts (Zustand store)
└── types/
    └── *.ts (EXISTING TYPES!)
```

---

## ⚠️ BEFORE CREATING - CHECKLIST

**DO NOT create new files if they already exist!** Instead:

```
1. CHECK: Does Question model exist in schema.prisma?
   ✅ YES → Use existing, add missing fields only
   ❌ NO → Create new

2. CHECK: Does StudentExam model exist?
   ✅ YES → Use existing, extend if needed
   ❌ NO → Create new

3. CHECK: Does useAuthStore exist in src/store/auth.ts?
   ✅ YES → Use existing
   ❌ NO → Create new

4. CHECK: Does Question API exist (src/api/questions.ts)?
   ✅ YES → Add missing endpoints
   ❌ NO → Create new

5. CHECK: Are there existing TypeScript types?
   ✅ YES → Extend/reuse them
   ❌ NO → Create new

6. CHECK: Does Layout component exist?
   ✅ YES → Use it
   ❌ NO → Error! (stop and ask)
```

---

## 📋 EXACT CREATION SEQUENCE

### **STEP 1: ANALYZE EXISTING SCHEMA** (Before creating anything!)

```
READ these files (if they exist):
  1. schema.prisma (or schema-*.prisma files)
  2. schema-exam.prisma
  3. schema-license.prisma
  
FOR EACH FILE:
  • List ALL existing models
  • Note field names and types
  • Note relationships (@relation)
  • Note constraints (@unique, @db.*)
  • Identify if any match what we need

DECISION TREE:
  If Question model exists:
    ✅ Use it as-is
    ✅ Add missing fields (optionE, optionF, optionG, optionH)
    ✅ Don't change field names
    ✅ Keep existing relationships
    
  If StudentExam model exists:
    ✅ Use it as-is
    ✅ Don't rename fields
    ✅ Extend if needed
    
  If ExamQuestion exists:
    ✅ Use it
    ✅ Don't duplicate
    
  If NOT found:
    ✅ Create new models
    ✅ Follow existing naming conventions
    ✅ Match existing field types
```

### **STEP 2: CHECK EXISTING TYPES** (If TypeScript files exist)

```
READ: src/types/ directory (or types folder)

LOOK FOR:
  • type Question { }
  • type Exam { }
  • type Student { }
  • interface IQuestion
  • enum QuestionDifficulty
  
FOR EACH MATCH:
  ✅ Use existing type
  ✅ Extend if needed (add E, F, G, H options)
  ❌ Don't rename
  ❌ Don't change field types
```

### **STEP 3: CHECK EXISTING MODELS/SERVICES** (If they exist)

```
READ: src/models/, src/services/, src/controllers/

LOOK FOR:
  • QuestionService or question_service.ts
  • ExamService or exam_service.ts
  • StudentService or student_service.ts
  
FOR EACH MATCH:
  ✅ Add missing methods to existing service
  ✅ Don't duplicate method names
  ✅ Keep existing method signatures
  ✅ Extend with new functionality
```

### **STEP 4: CHECK API CLIENTS** (If they exist)

```
READ: src/api/ directory

LOOK FOR:
  • questions.ts or questions.api.ts
  • exams.ts or exam.api.ts
  • admin.ts (already shown in uploads)
  
FOR EACH MATCH:
  ✅ Add missing API functions
  ✅ Keep existing function names
  ✅ Add new endpoints without breaking old ones
  ✅ Maintain same response format
```

---

## 🛑 CRITICAL: CONFLICT PREVENTION

### **Rule 1: NO Duplicate Model Names**

```typescript
// ❌ WRONG: Creating new Question model if one exists
model Question {
  id String @id
  questionText String
  // ... this duplicates existing!
}

// ✅ CORRECT: Extend existing
// ADD to existing Question model:
model Question {
  // ... existing fields ...
  optionE String?      // Add missing
  optionF String?      // Add missing
  optionG String?      // Add missing
  optionH String?      // Add missing
  // Keep all existing fields!
}
```

### **Rule 2: NO Duplicate Field Names**

```typescript
// ❌ WRONG: Renaming field that already exists
model Exam {
  totalTime Int       // If duration already exists, don't add this!
}

// ✅ CORRECT: Use existing field
model Exam {
  duration Int        // Use this if it exists
  // Not totalTime!
}
```

### **Rule 3: NO Duplicate Relationships**

```typescript
// ❌ WRONG: Creating two question[] arrays
model StudentExam {
  questions Question[]     // If this exists
  examQuestions Question[]  // Don't add this!
}

// ✅ CORRECT: Use junction table
model StudentExam {
  examQuestions ExamQuestion[]  // Through ExamQuestion model
}
```

### **Rule 4: NO Conflicting Type Names**

```typescript
// ❌ WRONG: Using same name for different types
type ExamStatus = 'ACTIVE' | 'INACTIVE'  // If exists
type ExamStatus = 'DRAFT' | 'PUBLISHED'  // Don't redefine!

// ✅ CORRECT: Extend or rename
type ExamStatusAdmin = 'DRAFT' | 'PUBLISHED'
type ExamStatusStudent = 'NOT_STARTED' | 'IN_PROGRESS'
```

---

## 📝 CREATION PLAN: STEP BY STEP

### **Phase 1: Review & Audit (BEFORE WRITING CODE)**

```typescript
// SCRIPT: Audit existing project
/*
TASK 1: List all existing Prisma models
  File: schema.prisma (or schema-*.prisma)
  Output: Array of model names
  
TASK 2: List all existing TypeScript types
  Files: src/types/*.ts
  Output: Array of type names
  
TASK 3: List all existing API functions
  Files: src/api/*.ts
  Output: Array of function names
  
TASK 4: List all existing services
  Files: src/services/*.ts
  Output: Array of service classes
  
TASK 5: Check for conflicts
  IF model Question exists:
    ✅ Mark as "USE_EXISTING"
    ✅ Identify missing fields
  IF model StudentExam exists:
    ✅ Mark as "USE_EXISTING"
  etc.
*/
```

### **Phase 2: Create/Extend Database Schema**

```typescript
// RULE: Never duplicate a model!

// Check existing schema.prisma:
// IF Question model exists → ADD these fields to it:

model Question {
  // ... KEEP all existing fields ...
  
  // ADD IF MISSING:
  optionE           String?           // Support 6+ options
  optionF           String?
  optionG           String?
  optionH           String?
  explanation       String?   @db.Text
  
  // Relationships
  // IF exam questions not linked yet, ADD:
  examQuestions     ExamQuestion[]
  studentAnswers    StudentAnswer[]
}

// IF StudentExam model does NOT exist → CREATE:

model StudentExam {
  id                String      @id @default(cuid())
  student           Student     @relation(fields: [studentId], references: [id])
  studentId         String
  exam              Exam        @relation(fields: [examId], references: [id])
  examId            String
  
  // ... rest of definition ...
  
  @@unique([studentId, examId, attemptNumber])
}

// CHECK for ExamQuestion junction table:
// IF exists → use it
// IF not → CREATE:

model ExamQuestion {
  id          String @id @default(cuid())
  exam        Exam   @relation(fields: [examId], references: [id])
  examId      String
  question    Question @relation(fields: [questionId], references: [id])
  questionId  String
  sequenceNumber Int
  
  @@unique([examId, questionId])
}

// CHECK for StudentAnswer model:
// IF exists → extend if needed
// IF not → CREATE

model StudentAnswer {
  id              String      @id @default(cuid())
  student         Student     @relation(fields: [studentId], references: [id])
  studentId       String
  question        Question    @relation(fields: [questionId], references: [id])
  questionId      String
  studentExam     StudentExam @relation(fields: [studentExamId], references: [id])
  studentExamId   String
  
  selectedOption  String      // A, B, C, D, E, F, G, H
  isCorrect       Boolean?
  timeSpentSeconds Int?
  
  @@unique([studentExamId, questionId])
}
```

### **Phase 3: Create/Extend TypeScript Types**

```typescript
// FILE: src/types/exam.ts (CREATE OR EXTEND)

// CHECK: Do these types already exist?
// IF YES → extend them with new fields
// IF NO → create them

// ✅ EXTEND OR CREATE:
export interface Question {
  id: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  optionE?: string      // NEW
  optionF?: string      // NEW
  optionG?: string      // NEW
  optionH?: string      // NEW
  correctAnswer: string
  explanation?: string
  // ... keep all existing fields ...
}

export interface StudentExam {
  id: string
  studentId: string
  examId: string
  attemptNumber: number
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED'
  startedAt?: Date
  submittedAt?: Date
  score?: number
  percentage?: number
  // ... more fields ...
}

export interface StudentAnswer {
  id: string
  studentExamId: string
  questionId: string
  selectedOption: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'
  isCorrect?: boolean
  timeSpentSeconds?: number
}
```

### **Phase 4: Create/Extend Database Services**

```typescript
// FILE: src/services/exam.service.ts (EXTEND existing OR CREATE)

// RULE: Don't duplicate methods!
// CHECK existing file for these methods first:

class ExamService {
  
  // ===== QUESTIONS =====
  
  // CHECK: Does createQuestion() exist?
  // IF YES → don't create it
  // IF NO → add it:
  
  async createQuestion(data: CreateQuestionDTO): Promise<Question> {
    // Validate: No duplicate questions
    const existing = await prisma.question.findFirst({
      where: {
        questionText: data.questionText,
        subjectId: data.subjectId
      }
    })
    
    if (existing) {
      throw new Error('Duplicate question detected')
    }
    
    // Validate: Options must be unique
    const options = [data.optionA, data.optionB, data.optionC, data.optionD]
    if (data.optionE) options.push(data.optionE)
    if (data.optionF) options.push(data.optionF)
    if (data.optionG) options.push(data.optionG)
    if (data.optionH) options.push(data.optionH)
    
    const uniqueOptions = new Set(options.map(o => o.toLowerCase()))
    if (uniqueOptions.size !== options.length) {
      throw new Error('Duplicate options not allowed')
    }
    
    // Validate: Correct answer must match an option
    const optionLetters = ['A', 'B', 'C', 'D']
    if (data.optionE) optionLetters.push('E')
    if (data.optionF) optionLetters.push('F')
    if (data.optionG) optionLetters.push('G')
    if (data.optionH) optionLetters.push('H')
    
    if (!optionLetters.includes(data.correctAnswer)) {
      throw new Error('Correct answer must match available options')
    }
    
    return prisma.question.create({ data })
  }
  
  // ===== EXAMS =====
  
  async createExam(data: CreateExamDTO): Promise<Exam> {
    // Validate: No duplicate exam titles (if required)
    // Create exam in DRAFT status
    return prisma.exam.create({
      data: {
        ...data,
        status: 'DRAFT'
      }
    })
  }
  
  async addQuestionsToExam(
    examId: string,
    questionIds: string[]
  ): Promise<ExamQuestion[]> {
    // Validate: Exam exists
    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) throw new Error('Exam not found')
    
    // Validate: No duplicate questions in exam
    const existing = await prisma.examQuestion.findMany({
      where: { examId, questionId: { in: questionIds } }
    })
    
    if (existing.length > 0) {
      throw new Error('Some questions already in exam')
    }
    
    // Validate: All questions exist
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } }
    })
    
    if (questions.length !== questionIds.length) {
      throw new Error('Some questions not found')
    }
    
    // Add questions to exam
    const examQuestions = await Promise.all(
      questionIds.map((qid, idx) =>
        prisma.examQuestion.create({
          data: {
            examId,
            questionId: qid,
            sequenceNumber: idx + 1
          }
        })
      )
    )
    
    // Update exam totalQuestions
    await prisma.exam.update({
      where: { id: examId },
      data: { totalQuestions: questionIds.length }
    })
    
    return examQuestions
  }
  
  // ===== STUDENT EXAMS =====
  
  async startExam(
    studentId: string,
    examId: string
  ): Promise<{ studentExamId: string; questions: Question[] }> {
    // Validate: Student exists
    const student = await prisma.student.findUnique({ where: { id: studentId } })
    if (!student) throw new Error('Student not found')
    
    // Validate: Exam exists and is published
    const exam = await prisma.exam.findUnique({ 
      where: { id: examId },
      include: { examQuestions: { include: { question: true } } }
    })
    if (!exam) throw new Error('Exam not found')
    if (exam.status !== 'PUBLISHED') throw new Error('Exam not published')
    
    // Validate: Student hasn't exceeded max attempts
    const attempts = await prisma.studentExam.count({
      where: { studentId, examId }
    })
    if (attempts >= exam.maxAttempts) {
      throw new Error('Maximum attempts exceeded')
    }
    
    // Validate: Student isn't already taking this exam
    const inProgress = await prisma.studentExam.findFirst({
      where: { studentId, examId, status: 'IN_PROGRESS' }
    })
    if (inProgress) {
      throw new Error('Student already taking this exam')
    }
    
    // Create StudentExam session
    const studentExam = await prisma.studentExam.create({
      data: {
        studentId,
        examId,
        attemptNumber: attempts + 1,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        totalQuestions: exam.examQuestions.length
      }
    })
    
    // Return questions (WITHOUT correct answers!)
    const questions = exam.examQuestions.map(eq => {
      const q = eq.question
      // Remove correctAnswer from response
      const { correctAnswer, ...questionWithoutAnswer } = q
      return questionWithoutAnswer
    })
    
    return {
      studentExamId: studentExam.id,
      questions
    }
  }
  
  async saveAnswer(
    studentExamId: string,
    questionId: string,
    selectedOption: string,
    timeSpentSeconds: number
  ): Promise<StudentAnswer> {
    // Validate: StudentExam exists and is IN_PROGRESS
    const studentExam = await prisma.studentExam.findUnique({
      where: { id: studentExamId }
    })
    if (!studentExam) throw new Error('Exam session not found')
    if (studentExam.status !== 'IN_PROGRESS') {
      throw new Error('Exam not in progress')
    }
    
    // Validate: Question exists in this exam
    const examQuestion = await prisma.examQuestion.findFirst({
      where: { examId: studentExam.examId, questionId }
    })
    if (!examQuestion) throw new Error('Question not in exam')
    
    // Validate: Selected option is valid
    const question = await prisma.question.findUnique({ where: { id: questionId } })
    const validOptions = ['A', 'B', 'C', 'D']
    if (question.optionE) validOptions.push('E')
    if (question.optionF) validOptions.push('F')
    if (question.optionG) validOptions.push('G')
    if (question.optionH) validOptions.push('H')
    
    if (!validOptions.includes(selectedOption)) {
      throw new Error('Invalid selected option')
    }
    
    // Save or update answer
    return prisma.studentAnswer.upsert({
      where: {
        studentExamId_questionId: {
          studentExamId,
          questionId
        }
      },
      create: {
        studentExamId,
        studentId: studentExam.studentId,
        questionId,
        selectedOption,
        timeSpentSeconds
      },
      update: {
        selectedOption,
        timeSpentSeconds
      }
    })
  }
  
  async submitExam(studentExamId: string): Promise<ExamResult> {
    // CRITICAL: Database transaction
    return prisma.$transaction(async (tx) => {
      // 1. Get StudentExam
      const studentExam = await tx.studentExam.findUnique({
        where: { id: studentExamId },
        include: {
          student: true,
          exam: true,
          studentAnswers: { include: { question: true } }
        }
      })
      
      if (!studentExam) throw new Error('Exam not found')
      if (studentExam.status !== 'IN_PROGRESS') throw new Error('Exam not in progress')
      
      // 2. Grade all answers
      let correctCount = 0
      
      for (const answer of studentExam.studentAnswers) {
        const isCorrect = answer.selectedOption === answer.question.correctAnswer
        
        await tx.studentAnswer.update({
          where: { id: answer.id },
          data: { isCorrect }
        })
        
        if (isCorrect) correctCount++
      }
      
      // 3. Calculate score
      const totalQuestions = studentExam.totalQuestions
      const percentage = (correctCount / totalQuestions) * 100
      const passed = percentage >= studentExam.exam.passingScore
      
      // 4. Update StudentExam
      const result = await tx.studentExam.update({
        where: { id: studentExamId },
        data: {
          status: 'GRADED',
          submittedAt: new Date(),
          correctAnswers: correctCount,
          score: correctCount,
          percentage,
          passed
        }
      })
      
      // 5. Update Student stats
      const studentStats = await tx.student.findUnique({
        where: { id: studentExam.studentId }
      })
      
      const newTotalExams = studentStats.totalExamsTaken + 1
      const newAverageScore = 
        (studentStats.averageScore * studentStats.totalExamsTaken + percentage) / newTotalExams
      
      await tx.student.update({
        where: { id: studentExam.studentId },
        data: {
          totalExamsTaken: newTotalExams,
          averageScore: newAverageScore
        }
      })
      
      return {
        studentExamId,
        score: correctCount,
        totalQuestions,
        percentage: Math.round(percentage * 100) / 100,
        passed,
        submittedAt: new Date()
      }
    })
  }
}
```

### **Phase 5: Create/Extend API Endpoints**

```typescript
// FILE: src/routes/exam.routes.ts (CREATE OR EXTEND)

// RULE: Don't duplicate route paths!

router.post('/exams', async (req, res) => {
  // CREATE EXAM
  try {
    const exam = await examService.createExam(req.body)
    res.json({ success: true, data: exam })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.post('/exams/:examId/add-questions', async (req, res) => {
  // ADD QUESTIONS TO EXAM
  try {
    const questions = await examService.addQuestionsToExam(
      req.params.examId,
      req.body.questionIds
    )
    res.json({ success: true, data: questions })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.post('/exams/:examId/start', async (req, res) => {
  // START EXAM
  try {
    const result = await examService.startExam(
      req.user.id,  // From middleware
      req.params.examId
    )
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.post('/student-exams/:studentExamId/answer', async (req, res) => {
  // SAVE ANSWER
  try {
    const answer = await examService.saveAnswer(
      req.params.studentExamId,
      req.body.questionId,
      req.body.selectedOption,
      req.body.timeSpentSeconds
    )
    res.json({ success: true, data: answer })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.post('/student-exams/:studentExamId/submit', async (req, res) => {
  // SUBMIT EXAM
  try {
    const result = await examService.submitExam(req.params.studentExamId)
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})
```

### **Phase 6: Create/Extend Frontend API Client**

```typescript
// FILE: src/api/exam.ts (CREATE OR EXTEND)

export const getAvailableExams = async () => {
  const response = await apiClient.get('/exams?status=PUBLISHED')
  return response.data.data
}

export const startExam = async (examId: string) => {
  const response = await apiClient.post(`/exams/${examId}/start`)
  return response.data.data
}

export const saveAnswer = async (
  studentExamId: string,
  questionId: string,
  selectedOption: string,
  timeSpentSeconds: number
) => {
  const response = await apiClient.post(
    `/student-exams/${studentExamId}/answer`,
    { questionId, selectedOption, timeSpentSeconds }
  )
  return response.data.data
}

export const submitExam = async (studentExamId: string) => {
  const response = await apiClient.post(
    `/student-exams/${studentExamId}/submit`
  )
  return response.data.data
}

export const getExamResults = async (studentExamId: string) => {
  const response = await apiClient.get(
    `/student-exams/${studentExamId}/results`
  )
  return response.data.data
}

export const getExamReview = async (studentExamId: string) => {
  const response = await apiClient.get(
    `/student-exams/${studentExamId}/review`
  )
  return response.data.data
}
```

---

## ✅ VALIDATION CHECKLIST

Before returning the code, verify:

```
DATABASE SCHEMA:
  ☐ No duplicate model names
  ☐ No duplicate field names
  ☐ All relationships correct (@relation)
  ☐ All foreign keys valid
  ☐ Unique constraints set (@@unique)
  ☐ No circular dependencies
  ☐ All types match Prisma spec
  ☐ Comments on complex fields

BUSINESS LOGIC:
  ☐ No question duplicates allowed
  ☐ No duplicate options in question
  ☐ Student can't answer same Q twice in same exam
  ☐ Student can't take same exam twice simultaneously
  ☐ Max attempts enforced
  ☐ Only published exams can be started
  ☐ Can't start exam that's in progress
  ☐ Grading uses transaction (all-or-nothing)
  ☐ Correct answer never sent during exam
  ☐ Correct answer only shown in review

ERROR HANDLING:
  ☐ All inputs validated
  ☐ All responses have error handling
  ☐ All database operations try-catch wrapped
  ☐ All errors have meaningful messages
  ☐ No SQL injection possible
  ☐ No N+1 queries
  ☐ Status codes correct (400, 403, 404, 500)

SECURITY:
  ☐ Only authenticated users access endpoints
  ☐ Students can only see their own results
  ☐ Teachers can only see their classes
  ☐ Admins can see everything
  ☐ Questions never leaked in responses
  ☐ Correct answers never leaked during exam
  ☐ Student answers validated before saving
  ☐ Database transactions prevent corruption

TYPE SAFETY:
  ☐ All TypeScript types defined
  ☐ No 'any' types (unless absolutely necessary)
  ☐ All database operations type-safe
  ☐ All API responses typed
  ☐ Optional fields marked with ?
  ☐ All enums defined properly

PERFORMANCE:
  ☐ All queries use include/select (no N+1)
  ☐ Indexes on foreign keys
  ☐ Indexes on frequently queried fields
  ☐ No missing database indexes
  ☐ Transaction properly scoped

COMMENTS:
  ☐ Every service method documented
  ☐ Complex logic explained
  ☐ Relationships explained
  ☐ Validation rules documented
  ☐ Error cases documented
```

---

## 🚀 GENERATION INSTRUCTIONS

Create now with INTELLIGENCE:

```
STEP 1: READ all existing project files
  • schema.prisma (or schema-*.prisma files)
  • All TypeScript types (src/types/*.ts)
  • All existing models/services
  • All existing API routes
  
STEP 2: IDENTIFY overlaps
  • What models exist already?
  • What types need extending?
  • What services need updates?
  • What endpoints already exist?
  
STEP 3: CREATE with intelligence
  • Extend existing, don't duplicate
  • Use existing naming conventions
  • Keep field type consistency
  • Maintain relationship patterns
  
STEP 4: ADD validation
  • Check for duplicates
  • Validate foreign keys
  • Enforce constraints
  • Handle all errors
  
STEP 5: VERIFY safety
  • No security holes
  • No data corruption risk
  • No lost functionality
  • All backwards compatible
  
STEP 6: DELIVER code
  • One file at a time
  • With full comments
  • With validation examples
  • With error handling
  • With testing instructions
```

---

## 📋 DELIVERABLE ORDER

Create and provide in this order:

```
1️⃣  PRISMA SCHEMA (schema.prisma updates/new)
    └─ Exact models to create or extend
    └─ Exact fields to add
    └─ All relationships
    
2️⃣  TYPESCRIPT TYPES (src/types/exam.ts)
    └─ All interfaces/types needed
    └─ Type safety
    
3️⃣  SERVICE CLASS (src/services/exam.service.ts)
    └─ All business logic
    └─ Validation
    └─ Error handling
    └─ Database transactions
    
4️⃣  API ROUTES (src/routes/exam.routes.ts)
    └─ All endpoints
    └─ Request validation
    └─ Error responses
    
5️⃣  FRONTEND CLIENT (src/api/exam.ts)
    └─ API functions
    └─ Type safe responses
    
6️⃣  IMPLEMENTATION CHECKLIST
    └─ Step-by-step setup
    └─ Migration commands
    └─ Testing steps
```

---

## ⚠️ CRITICAL REMINDERS

```
🔴 MUST CHECK EXISTING FILES FIRST
   Don't assume they don't exist!
   
🔴 MUST PREVENT DUPLICATES
   No duplicate models, fields, or endpoints!
   
🔴 MUST USE TRANSACTIONS
   For exam submission (all-or-nothing grading)
   
🔴 MUST HIDE CORRECT ANSWERS
   Never send during exam, only in review!
   
🔴 MUST VALIDATE ALL INPUT
   No SQL injection, no bad data in DB!
   
🔴 MUST MAINTAIN BACKWARD COMPATIBILITY
   Don't break existing functionality!
   
🔴 MUST INCLUDE FULL COMMENTS
   For beginners to understand!
```

---

## START CREATING NOW:

Create a **production-ready, error-free, duplicate-free Data Management System** that:

✅ Checks existing project files FIRST  
✅ Extends existing models (doesn't duplicate)  
✅ Prevents duplicate data  
✅ Validates all relationships  
✅ Handles all errors  
✅ Uses transactions for critical operations  
✅ Hides correct answers during exam  
✅ Includes full validation  
✅ Is fully commented  
✅ Is ready to copy-paste into project  

**BEGIN GENERATION:**

