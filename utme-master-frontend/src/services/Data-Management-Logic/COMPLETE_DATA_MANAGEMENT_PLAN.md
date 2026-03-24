# 📚 UTME MASTER - DATA MANAGEMENT & WORKFLOW PLAN

## Your Question:
> "How do I manage questions, students, question IDs, student IDs, and more? When questions are created, how can students start exams? How do I manage student info (who took what exam/test)?"

## ✅ MY ANSWER: Complete Data Management System

I'll create a **thorough plan** covering:
1. Database schema (relationships)
2. Question management workflow
3. Student management workflow
4. Exam/Test creation workflow
5. Student-Exam assignment workflow
6. Exam taking & result tracking
7. API endpoints needed
8. Frontend integration points

---

## 🗄️ PART 1: DATABASE SCHEMA & RELATIONSHIPS

### **Core Tables/Models You Need:**

```typescript
// ==========================================
// 1. QUESTION MODEL
// ==========================================
model Question {
  id                String      @id @default(cuid())
  
  // Question Content
  questionText      String      @db.Text      // "If x² - 5x + 6 = 0, find..."
  explanation       String?     @db.Text      // Why answer is correct
  
  // Question Classification
  subject           Subject     @relation(fields: [subjectId], references: [id])
  subjectId         String
  topic             String?                   // "Algebra", "Photosynthesis"
  difficulty        String      // EASY, MEDIUM, HARD
  examType          String      // JAMB, WAEC, NECO
  
  // Answer Options (4, 6, 7, or 8 options)
  optionA           String
  optionB           String
  optionC           String
  optionD           String
  optionE           String?
  optionF           String?
  optionG           String?
  optionH           String?
  correctAnswer     String      // A, B, C, D, E, F, G, or H
  
  // Metadata
  year              Int?        // 2023, 2024
  points            Int         @default(1)
  timeLimitSeconds  Int         @default(60)
  createdBy         String      // Admin/Teacher ID
  
  // Relationships
  examQuestions     ExamQuestion[]
  studentAnswers    StudentAnswer[]
  
  // Tracking
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  isActive          Boolean     @default(true)
}

// ==========================================
// 2. SUBJECT MODEL
// ==========================================
model Subject {
  id                String      @id @default(cuid())
  code              String      @unique  // MTH, ENG, PHY, CHM
  name              String      // Mathematics, English
  description       String?
  
  questions         Question[]
  examSubjects      ExamSubject[]
  
  createdAt         DateTime    @default(now())
}

// ==========================================
// 3. EXAM MODEL
// ==========================================
model Exam {
  id                String      @id @default(cuid())
  
  // Exam Details
  title             String      // "JAMB 2024 Mock Exam 1"
  description       String?
  type              String      // OFFICIAL, PRACTICE
  examType          String      // JAMB, WAEC, NECO
  
  // Composition
  subjects          ExamSubject[]           // Which subjects in this exam
  examQuestions     ExamQuestion[]          // Which questions in this exam
  totalQuestions    Int         @computed   // Count of examQuestions
  
  // Rules
  duration          Int                     // 180 minutes
  passingScore      Int         @default(40)
  maxAttempts       Int         @default(3)
  randomizeQuestions Boolean    @default(false)
  
  // Status
  status            String      // DRAFT, PUBLISHED, ARCHIVED
  visibility        String      // EVERYONE, STUDENTS_ONLY
  
  // Relationships
  studentExams      StudentExam[]
  createdBy         String      // Admin/Teacher ID
  
  // Tracking
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  publishedAt       DateTime?
}

// ==========================================
// 4. EXAM_QUESTION JUNCTION TABLE
// ==========================================
// Links which questions belong to which exam
model ExamQuestion {
  id                String      @id @default(cuid())
  
  exam              Exam        @relation(fields: [examId], references: [id])
  examId            String
  question          Question    @relation(fields: [questionId], references: [id])
  questionId        String
  
  // Position in exam
  sequenceNumber    Int         // 1, 2, 3... for ordering
  
  @@unique([examId, questionId])
}

// ==========================================
// 5. EXAM_SUBJECT JUNCTION TABLE
// ==========================================
// Which subjects are in this exam and how many questions per subject
model ExamSubject {
  id                String      @id @default(cuid())
  
  exam              Exam        @relation(fields: [examId], references: [id])
  examId            String
  subject           Subject     @relation(fields: [subjectId], references: [id])
  subjectId         String
  
  numberOfQuestions Int         // 20 chemistry questions, 30 maths questions
  
  @@unique([examId, subjectId])
}

// ==========================================
// 6. STUDENT MODEL
// ==========================================
model Student {
  id                String      @id @default(cuid())
  
  // Auth (linked to User)
  user              User        @relation(fields: [userId], references: [id])
  userId            String      @unique
  
  // Personal Info
  firstName         String
  lastName          String
  email             String      @unique
  phoneNumber       String?
  
  // Academic Info
  jamb_registration String?     // JAMB registration number
  school            String?     // School name
  state             String?     // State
  
  // Performance Tracking
  totalExamsTaken   Int         @default(0)
  totalTestsTaken   Int         @default(0)
  averageScore      Float       @default(0)
  
  // Relationships
  studentExams      StudentExam[]           // Exams taken
  studentAnswers    StudentAnswer[]         // Answers submitted
  
  // Tracking
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  lastLoginAt       DateTime?
  isActive          Boolean     @default(true)
}

// ==========================================
// 7. STUDENT_EXAM MODEL (Exam Session)
// ==========================================
// Represents ONE student taking ONE exam
// The core of exam management!
model StudentExam {
  id                String      @id @default(cuid())
  
  // Who took what
  student           Student     @relation(fields: [studentId], references: [id])
  studentId         String
  exam              Exam        @relation(fields: [examId], references: [id])
  examId            String
  
  // Session Info
  status            String      // NOT_STARTED, IN_PROGRESS, SUBMITTED, GRADED
  attemptNumber     Int         // 1st attempt, 2nd attempt, 3rd attempt
  
  // Timing
  startedAt         DateTime?   // When student clicked "Start Exam"
  submittedAt       DateTime?   // When student clicked "Submit"
  duration          Int?        // Actual time spent (in seconds)
  
  // Scoring
  totalQuestions    Int
  correctAnswers    Int?        // 0 until submitted
  score             Int?        // Points earned (0 until graded)
  percentage        Float?      // 78.5% (0 until graded)
  passed            Boolean?    // true/false (null until graded)
  
  // Answers & Responses
  studentAnswers    StudentAnswer[]         // All answers in this session
  
  // Admin Notes
  notes             String?     // Teacher notes after grading
  
  // Tracking
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@unique([studentId, examId, attemptNumber])  // Can't take same exam twice at same time
}

// ==========================================
// 8. STUDENT_ANSWER MODEL
// ==========================================
// Represents ONE student's answer to ONE question
model StudentAnswer {
  id                String      @id @default(cuid())
  
  // Who answered
  student           Student     @relation(fields: [studentId], references: [id])
  studentId         String
  
  // What they answered
  question          Question    @relation(fields: [questionId], references: [id])
  questionId        String
  
  // The exam session
  studentExam       StudentExam @relation(fields: [studentExamId], references: [id])
  studentExamId     String
  
  // The answer
  selectedOption    String      // A, B, C, D, E, F, G, or H
  isCorrect         Boolean?    // true/false (null until submitted & graded)
  
  // Metadata
  timeSpentSeconds  Int?        // How long student spent on this question
  flagged           Boolean     @default(false)  // Student marked for review
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@unique([studentExamId, questionId])  // Can't answer same question twice in same exam
}
```

---

## 🔄 PART 2: THE COMPLETE WORKFLOW

### **WORKFLOW 1: Admin/Teacher Creates Exam**

```
Step 1: Create Exam
  Admin/Teacher → POST /api/exams
  Creates exam with:
    - Title: "JAMB 2024 Mock 1"
    - Type: OFFICIAL
    - Duration: 180 minutes
    - Status: DRAFT
  Result: exam.id = "exam_123abc"

Step 2: Add Questions to Exam
  Admin/Teacher → POST /api/exams/exam_123abc/add-questions
  Sends:
    {
      questions: [
        { questionId: "q_001", sequenceNumber: 1 },
        { questionId: "q_002", sequenceNumber: 2 },
        { questionId: "q_003", sequenceNumber: 3 },
        ... (120 total questions)
      ]
    }
  Result: ExamQuestion records created linking exam to questions

Step 3: Define Subjects in Exam
  Admin/Teacher → POST /api/exams/exam_123abc/add-subjects
  Sends:
    {
      subjects: [
        { subjectId: "subj_math", numberOfQuestions: 30 },
        { subjectId: "subj_eng", numberOfQuestions: 30 },
        { subjectId: "subj_phy", numberOfQuestions: 30 },
        { subjectId: "subj_chem", numberOfQuestions: 30 }
      ]
    }
  Result: ExamSubject records created

Step 4: Publish Exam
  Admin/Teacher → PUT /api/exams/exam_123abc/publish
  Changes:
    - status: DRAFT → PUBLISHED
    - visibility: STUDENTS_ONLY
  Result: Exam now visible to students
```

### **WORKFLOW 2: Student Starts Exam**

```
Step 1: Student Browses Exams
  Student → GET /api/exams?status=PUBLISHED&visibility=STUDENTS_ONLY
  Response:
    [
      {
        id: "exam_123abc",
        title: "JAMB 2024 Mock 1",
        totalQuestions: 120,
        duration: 180,
        userAttempts: 0,  // Student hasn't taken it yet
        userBestScore: null
      }
    ]

Step 2: Student Clicks "Start Exam"
  Student → POST /api/exams/exam_123abc/start
  Backend checks:
    ✓ Is exam published?
    ✓ Has student exceeded max attempts (3)?
    ✓ Is exam still available?
  Creates StudentExam:
    {
      studentId: "student_456def",
      examId: "exam_123abc",
      attemptNumber: 1,  // First attempt
      status: "IN_PROGRESS",
      startedAt: "2024-03-20T14:30:00Z"
    }
  Response:
    {
      studentExamId: "stexam_789ghi",
      questions: [
        {
          id: "q_001",
          questionText: "If x² - 5x + 6 = 0...",
          optionA: "5",
          optionB: "6",
          optionC: "11",
          optionD: "-5"
          // NOTE: Do NOT return correctAnswer here!
        },
        { ... }, // more questions
      ],
      totalQuestions: 120,
      duration: 180
    }

Step 3: Student Takes Exam
  While exam is in progress (student sees questions, clicks answers):
  
  For each question:
    Student → POST /api/student-exams/stexam_789ghi/answer
    Body:
      {
        questionId: "q_001",
        selectedOption: "A",
        timeSpentSeconds: 45
      }
    Backend saves StudentAnswer:
      - Does NOT check if correct yet
      - Just stores: question_001 → selected "A"
      - Stores time spent
    Response: { success: true }

Step 4: Student Submits Exam
  Student → POST /api/student-exams/stexam_789ghi/submit
  Backend:
    1. Mark StudentExam.status = "SUBMITTED"
    2. Mark StudentExam.submittedAt = now()
    3. Grade all StudentAnswers:
       - For each answer, compare selectedOption with correctAnswer
       - Set isCorrect = true/false
    4. Calculate score:
       - Count correct answers
       - Calculate percentage: (correct / total) * 100
       - Check if passed: percentage >= passingScore
    5. Update StudentExam:
       - score = correctAnswers
       - percentage = 78.5
       - passed = true
    6. Update Student stats:
       - totalExamsTaken += 1
       - averageScore = recalculate
  Response:
    {
      score: 94,
      totalQuestions: 120,
      correctAnswers: 94,
      percentage: 78.3,
      passed: true,
      resultId: "result_xyz123"  // For viewing results
    }

Step 5: Student Views Results
  Student → GET /api/student-exams/stexam_789ghi/results
  Response:
    {
      examTitle: "JAMB 2024 Mock 1",
      score: 94,
      percentage: 78.3,
      totalQuestions: 120,
      correctAnswers: 94,
      duration: "2h 45m",
      submittedAt: "2024-03-20T17:15:00Z",
      subjectPerformance: [
        {
          subject: "Mathematics",
          correct: 24,
          total: 30,
          percentage: 80
        },
        ... // other subjects
      ]
    }

Step 6: Student Reviews Answers
  Student → GET /api/student-exams/stexam_789ghi/review
  Response:
    [
      {
        questionId: "q_001",
        questionText: "If x² - 5x + 6 = 0...",
        optionA: "5",
        optionB: "6",
        optionC: "11",
        optionD: "-5",
        correctAnswer: "A",           // NOW shown
        studentAnswer: "A",           // What student picked
        isCorrect: true,              // Right/wrong
        explanation: "By Vieta's formulas...",
        subject: "Mathematics"
      },
      { ... } // more questions
    ]
```

---

## 💾 PART 3: WHAT GETS STORED AND WHERE

### **When Question is Created:**
```
DATABASE:

Question table gets NEW ROW:
┌─────────────────────────────────────────┐
│ id: "q_001"                             │
│ questionText: "If x² - 5x + 6 = 0..."   │
│ optionA: "5"                            │
│ optionB: "6"                            │
│ optionC: "11"                           │
│ optionD: "-5"                           │
│ correctAnswer: "A"                      │
│ subject: "Mathematics"                  │
│ difficulty: "MEDIUM"                    │
│ examType: "JAMB"                        │
│ explanation: "By Vieta's..."            │
│ createdAt: 2024-03-20T10:00:00Z         │
└─────────────────────────────────────────┘

Status: Question ready to be added to exams
```

### **When Exam is Created:**
```
DATABASE:

Exam table gets NEW ROW:
┌─────────────────────────────────────────┐
│ id: "exam_123abc"                       │
│ title: "JAMB 2024 Mock 1"               │
│ type: "OFFICIAL"                        │
│ duration: 180                           │
│ status: "DRAFT"  ← Can add/remove Qs    │
│ totalQuestions: 0  ← Will update        │
│ createdAt: 2024-03-20T10:00:00Z         │
└─────────────────────────────────────────┘

Status: Exam created but not yet published
```

### **When Questions Added to Exam:**
```
DATABASE:

ExamQuestion junction table gets NEW ROWS (for each question):
┌─────────────────────────────────────────┐
│ id: "eq_001"                            │
│ examId: "exam_123abc"                   │
│ questionId: "q_001"                     │
│ sequenceNumber: 1                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ id: "eq_002"                            │
│ examId: "exam_123abc"                   │
│ questionId: "q_002"                     │
│ sequenceNumber: 2                       │
└─────────────────────────────────────────┘

... (120 total for 120-question exam)

Exam.totalQuestions updated to 120

Status: Exam now has 120 questions linked
```

### **When Student Registers:**
```
DATABASE:

User table gets NEW ROW:
┌─────────────────────────────────────────┐
│ id: "user_789def"                       │
│ email: "john@example.com"               │
│ role: "STUDENT"                         │
│ createdAt: 2024-03-20T10:00:00Z         │
└─────────────────────────────────────────┘

Student table gets NEW ROW:
┌─────────────────────────────────────────┐
│ id: "student_456def"                    │
│ userId: "user_789def"                   │
│ firstName: "John"                       │
│ lastName: "Doe"                         │
│ email: "john@example.com"               │
│ school: "Royal Academy"                 │
│ totalExamsTaken: 0                      │
│ totalTestsTaken: 0                      │
│ averageScore: 0                         │
│ createdAt: 2024-03-20T10:00:00Z         │
└─────────────────────────────────────────┘

Status: Student ready to take exams
```

### **When Student Starts Exam:**
```
DATABASE:

StudentExam table gets NEW ROW:
┌─────────────────────────────────────────┐
│ id: "stexam_789ghi"                     │
│ studentId: "student_456def"             │
│ examId: "exam_123abc"                   │
│ attemptNumber: 1                        │
│ status: "IN_PROGRESS"                   │
│ startedAt: 2024-03-20T14:30:00Z         │
│ submittedAt: null  ← Not yet submitted  │
│ score: null  ← Not graded yet           │
│ percentage: null                        │
│ correctAnswers: null                    │
└─────────────────────────────────────────┘

Status: Exam session created, student taking exam
```

### **When Student Answers Question:**
```
DATABASE:

StudentAnswer table gets NEW ROW (for each question):
┌─────────────────────────────────────────┐
│ id: "sa_001"                            │
│ studentExamId: "stexam_789ghi"          │
│ studentId: "student_456def"             │
│ questionId: "q_001"                     │
│ selectedOption: "A"  ← Student picked A │
│ isCorrect: null  ← Not graded yet       │
│ timeSpentSeconds: 45                    │
│ createdAt: 2024-03-20T14:32:00Z         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ id: "sa_002"                            │
│ studentExamId: "stexam_789ghi"          │
│ studentId: "student_456def"             │
│ questionId: "q_002"                     │
│ selectedOption: "C"  ← Student picked C │
│ isCorrect: null  ← Not graded yet       │
│ timeSpentSeconds: 60                    │
│ createdAt: 2024-03-20T14:33:00Z         │
└─────────────────────────────────────────┘

... (120 total for 120-question exam)

Status: All answers saved, waiting for submission
```

### **When Student Submits Exam:**
```
DATABASE:

StudentExam record UPDATED:
┌─────────────────────────────────────────┐
│ id: "stexam_789ghi"                     │
│ status: "SUBMITTED" ← Changed           │
│ submittedAt: 2024-03-20T17:15:00Z ← Set│
│ score: 94 ← Calculated                  │
│ percentage: 78.3 ← Calculated           │
│ correctAnswers: 94 ← Calculated         │
│ passed: true ← Calculated               │
└─────────────────────────────────────────┘

StudentAnswer records UPDATED (each one):
┌─────────────────────────────────────────┐
│ id: "sa_001"                            │
│ selectedOption: "A"                     │
│ isCorrect: true ← Calculated (A = A)    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ id: "sa_002"                            │
│ selectedOption: "C"                     │
│ isCorrect: false ← Calculated (C ≠ A)   │
└─────────────────────────────────────────┘

... (120 total, each marked correct/incorrect)

Student record UPDATED:
┌─────────────────────────────────────────┐
│ id: "student_456def"                    │
│ totalExamsTaken: 1 ← Incremented        │
│ averageScore: 78.3 ← Updated            │
└─────────────────────────────────────────┘

Status: Exam graded, results available
```

---

## 📊 PART 4: API ENDPOINTS STRUCTURE

### **Question Management Endpoints**

```typescript
// CREATE QUESTIONS
POST /api/questions
  Create a single question
  
POST /api/questions/bulk-import
  Import 40+ questions from Excel
  
// GET QUESTIONS
GET /api/questions
  List all questions (admin/teacher only)
  
GET /api/questions?subject=MTH&difficulty=MEDIUM
  Filter questions
  
GET /api/questions/:questionId
  Get single question details (admin/teacher only)
  
// UPDATE QUESTIONS
PUT /api/questions/:questionId
  Update question (admin/teacher only)
  
// DELETE QUESTIONS
DELETE /api/questions/:questionId
  Delete question (admin/teacher only)
```

### **Exam Management Endpoints**

```typescript
// CREATE EXAM
POST /api/exams
  Create new exam (status: DRAFT)
  
// ADD QUESTIONS TO EXAM
POST /api/exams/:examId/add-questions
  Add questions to exam
  
POST /api/exams/:examId/remove-questions
  Remove questions from exam
  
// PUBLISH EXAM
PUT /api/exams/:examId/publish
  Publish exam (status: DRAFT → PUBLISHED)
  
// GET EXAMS
GET /api/exams
  List all exams (all users, shows published)
  
GET /api/exams?status=PUBLISHED
  Filter by status
  
GET /api/exams/:examId
  Get exam details (with all questions)
  
GET /api/exams/:examId/stats
  Get exam statistics (how many took it, avg score)
```

### **Student Exam Endpoints**

```typescript
// START EXAM
POST /api/exams/:examId/start
  Create StudentExam session
  Response: { studentExamId, questions }
  
// SUBMIT ANSWER
POST /api/student-exams/:studentExamId/answer
  Save one answer
  Body: { questionId, selectedOption, timeSpentSeconds }
  
// SUBMIT EXAM
POST /api/student-exams/:studentExamId/submit
  Grade exam, calculate score
  Response: { score, percentage, passed }
  
// GET RESULTS
GET /api/student-exams/:studentExamId/results
  Get score breakdown
  
// GET REVIEW
GET /api/student-exams/:studentExamId/review
  Get all Q&A with correct answers + explanation
  
// GET HISTORY
GET /api/student/exams/history
  Get all exams student took (with scores)
  
// RETAKE EXAM
POST /api/exams/:examId/retake
  Start new attempt (if allowed)
```

### **Student Progress Endpoints**

```typescript
// GET STUDENT INFO
GET /api/students/:studentId
  Get student profile and stats
  
GET /api/students/me
  Get current logged-in student's info
  
// GET EXAM HISTORY
GET /api/students/:studentId/exam-history
  List all exams student took
  Response:
    [
      {
        studentExamId: "stexam_1",
        examTitle: "JAMB 2024 Mock 1",
        attemptNumber: 1,
        score: 94,
        percentage: 78.3,
        submittedAt: "2024-03-20T17:15:00Z",
        duration: "2h 45m"
      },
      { ... }
    ]
    
// GET DETAILED STATS
GET /api/students/:studentId/stats
  Get comprehensive stats
  Response:
    {
      totalExamsTaken: 5,
      averageScore: 75.2,
      bestScore: 85,
      improvementTrend: +5,
      subjectPerformance: [
        { subject: "Math", avg: 78, exams: 2 },
        { subject: "English", avg: 82, exams: 2 },
        { subject: "Physics", avg: 71, exams: 1 }
      ]
    }
```

### **Teacher Endpoints** (Managing students, viewing results)

```typescript
// GET STUDENT LIST
GET /api/teacher/students
  Get all students in teacher's classes
  
// GET EXAM RESULTS
GET /api/teacher/exams/:examId/results
  See how many students took exam, avg score
  Response:
    {
      examTitle: "JAMB 2024 Mock 1",
      totalStudentsTook: 45,
      averageScore: 72.5,
      passRate: 85,
      resultsByStudent: [
        {
          studentId: "student_456def",
          studentName: "John Doe",
          score: 94,
          percentage: 78.3,
          passed: true,
          submittedAt: "2024-03-20T17:15:00Z"
        },
        { ... }
      ]
    }
    
// GET STUDENT PROGRESS
GET /api/teacher/students/:studentId/progress
  See one student's performance across exams
```

---

## 📱 PART 5: FRONTEND INTEGRATION POINTS

### **For Admin/Teacher Dashboard**

```typescript
// When creating exam:
1. Select questions from database
2. System automatically links questions to exam
3. Show: "Added 120 questions"
4. Save exam.id for later

// When managing students:
1. View student list (GET /api/teacher/students)
2. See student performance (GET /api/students/:studentId/stats)
3. View exam results by student (GET /api/teacher/exams/:examId/results)
```

### **For Student Dashboard**

```typescript
// When browsing exams:
1. GET /api/exams (show available exams)
2. Show: "You haven't taken this exam"
3. Or: "Your best: 85% (Attempt 2 of 3)"

// When taking exam:
1. POST /api/exams/:examId/start (get studentExamId)
2. Show questions from response
3. For each answer: POST /api/student-exams/:studentExamId/answer
4. On submit: POST /api/student-exams/:studentExamId/submit

// When viewing results:
1. GET /api/student-exams/:studentExamId/results
2. Show score breakdown
3. Show subject performance
4. GET /api/student-exams/:studentExamId/review to see answers
```

---

## 🎯 PART 6: STEP-BY-STEP IMPLEMENTATION ORDER

### **Phase 1: Week 1 - Core Database Setup** (Priority: 🔴 CRITICAL)
```
✅ Create all models (Question, Exam, Student, StudentExam, StudentAnswer)
✅ Create relationships (ExamQuestion, ExamSubject)
✅ Run migrations
✅ Create seed data (test questions, sample exam, test students)
✅ Verify foreign keys work
✅ Test cascade deletes (if exam deleted, StudentExams deleted too)
```

### **Phase 2: Week 1 - Question Management APIs** (Priority: 🔴 CRITICAL)
```
✅ POST /api/questions (create single)
✅ POST /api/questions/bulk-import (import 40+ from Excel)
✅ GET /api/questions (list)
✅ GET /api/questions/:id (detail)
✅ PUT /api/questions/:id (update)
✅ DELETE /api/questions/:id (delete)
```

### **Phase 3: Week 1-2 - Exam Management APIs** (Priority: 🔴 CRITICAL)
```
✅ POST /api/exams (create exam - DRAFT status)
✅ POST /api/exams/:examId/add-questions (link questions)
✅ GET /api/exams (list)
✅ GET /api/exams/:examId (detail with all questions)
✅ PUT /api/exams/:examId/publish (change status)
✅ DELETE /api/exams/:examId (delete)
```

### **Phase 4: Week 2 - Student Exam Flow APIs** (Priority: 🔴 CRITICAL)
```
✅ POST /api/exams/:examId/start
   └─ Creates StudentExam record
   └─ Returns studentExamId
   └─ Returns all exam questions (WITHOUT answers)
   
✅ POST /api/student-exams/:studentExamId/answer
   └─ Save single answer
   └─ Store selectedOption
   └─ Store timeSpentSeconds
   
✅ POST /api/student-exams/:studentExamId/submit
   └─ Mark as SUBMITTED
   └─ Calculate correctAnswers
   └─ Calculate percentage
   └─ Determine passed/failed
   └─ Update Student.totalExamsTaken, averageScore
   
✅ GET /api/student-exams/:studentExamId/results
   └─ Return score breakdown
   └─ Don't show correct answers yet
   
✅ GET /api/student-exams/:studentExamId/review
   └─ Return all Q&A with answers + explanations
```

### **Phase 5: Week 2-3 - Student Progress APIs** (Priority: 🟠 IMPORTANT)
```
✅ GET /api/students/:studentId (profile)
✅ GET /api/students/me (current user)
✅ GET /api/students/:studentId/exam-history (all exams taken)
✅ GET /api/students/:studentId/stats (comprehensive stats)
```

### **Phase 6: Week 3 - Teacher Reporting APIs** (Priority: 🟡 NICE-TO-HAVE)
```
✅ GET /api/teacher/students (student list)
✅ GET /api/teacher/exams/:examId/results (exam results)
✅ GET /api/teacher/students/:studentId/progress (student progress)
```

### **Phase 7: Week 3-4 - Frontend Integration** (Priority: 🔴 CRITICAL)
```
✅ Update Admin Dashboard to use APIs
✅ Update Student Dashboard to show available exams
✅ Create Exam Taking interface using APIs
✅ Create Results page using APIs
✅ Create Student Progress page using APIs
```

---

## 🔐 PART 7: IMPORTANT SECURITY CONSIDERATIONS

### **Never Send Correct Answers While Taking Exam**
```typescript
// ❌ WRONG - Sends correct answer to frontend
GET /api/exams/:examId/questions
Response:
  {
    questionId: "q_001",
    questionText: "If x² - 5x + 6 = 0...",
    optionA: "5",
    optionB: "6",
    optionC: "11",
    optionD: "-5",
    correctAnswer: "A"  ← ❌ NEVER SEND THIS
  }

// ✅ CORRECT - Don't send correct answer
GET /api/exams/:examId/questions
Response:
  {
    questionId: "q_001",
    questionText: "If x² - 5x + 6 = 0...",
    optionA: "5",
    optionB: "6",
    optionC: "11",
    optionD: "-5"
    // correctAnswer NOT included
  }

// Only send correct answer in review (after submission)
GET /api/student-exams/:studentExamId/review
Response includes: correctAnswer ✅
```

### **Verify Student Can't Retake Beyond Max Attempts**
```typescript
// Before POST /api/exams/:examId/start, check:
const maxAttempts = exam.maxAttempts  // Usually 3
const studentAttempts = await StudentExam.count({
  where: { studentId, examId }
})

if (studentAttempts >= maxAttempts) {
  throw new Error('Maximum attempts exceeded')
}
```

### **Prevent Answer Cheating**
```typescript
// When POST /api/student-exams/:studentExamId/answer
// Check:
1. studentExamId exists
2. It belongs to current student
3. It's still IN_PROGRESS (not submitted yet)
4. questionId belongs to that exam
5. selectedOption is valid (A, B, C, D, E, F, G, or H)

If ANY check fails → 403 Forbidden
```

### **Enforce Time Limits**
```typescript
// In StudentExam model:
startedAt: "2024-03-20T14:30:00Z"
duration: 180  // minutes

// On submit, calculate elapsed time:
elapsedMinutes = (submittedAt - startedAt) / 60

// If student took too long, still accept but flag
```

---

## 📋 PART 8: DATA CONSISTENCY PATTERNS

### **Pattern 1: Creating Exam with Questions**
```typescript
// Database transaction (all-or-nothing):

BEGIN TRANSACTION
  1. INSERT Exam (status: DRAFT)
  2. INSERT ExamQuestion (for each question)
  3. UPDATE Exam.totalQuestions
COMMIT TRANSACTION

// If ANY step fails, ROLLBACK everything
// Prevents orphaned records
```

### **Pattern 2: Submitting Exam (Critical!)**
```typescript
// Database transaction:

BEGIN TRANSACTION
  1. UPDATE StudentExam (status: SUBMITTED, submittedAt)
  2. For each StudentAnswer:
     a. Compare selectedOption with correctAnswer
     b. UPDATE StudentAnswer (isCorrect)
  3. Count correctAnswers
  4. Calculate percentage
  5. UPDATE StudentExam (score, percentage, passed)
  6. UPDATE Student (totalExamsTaken, averageScore)
COMMIT TRANSACTION

// If ANY step fails, ROLLBACK
// Prevents partial grading
```

### **Pattern 3: Preventing Duplicate Answers**
```typescript
// Use UNIQUE constraint:
@@unique([studentExamId, questionId])

// Prevents student submitting answer twice for same Q
// Second attempt updates instead of inserts
```

---

## 🎯 PART 9: WHAT TO IMPLEMENT FIRST

### **Week 1 Priority (Most Critical):**
```
1. ✅ Database schema (all tables)
2. ✅ Seed with sample data
3. ✅ Question bulk import API
4. ✅ Exam creation API
5. ✅ Add questions to exam API
6. ✅ Student exam start API
7. ✅ Save answer API
8. ✅ Submit exam API (with grading)
```

### **Why This Order?**
- Student taking exam is the CORE feature
- Everything else builds on this
- Must work perfectly before moving on
- Test thoroughly with manual exams

### **Testing Strategy:**
```
1. Manually create 5 test questions
2. Create 1 test exam with all 5 Qs
3. Have test student take exam
4. Verify: answers saved correctly
5. Verify: grading works
6. Verify: results show correctly
7. Verify: can't retake beyond limit
8. Then move to next feature
```

---

## 🚀 COMPLETE IMPLEMENTATION CHECKLIST

```
DATABASE:
  ☐ Question model created
  ☐ Exam model created
  ☐ Student model created
  ☐ StudentExam model created
  ☐ StudentAnswer model created
  ☐ ExamQuestion model created
  ☐ ExamSubject model created
  ☐ Migrations run
  ☐ Seed data created
  ☐ All relationships working

APIS:
  ☐ POST /api/questions (create)
  ☐ POST /api/questions/bulk-import
  ☐ GET /api/questions
  ☐ POST /api/exams (create)
  ☐ POST /api/exams/:examId/add-questions
  ☐ GET /api/exams
  ☐ GET /api/exams/:examId
  ☐ PUT /api/exams/:examId/publish
  
  ☐ POST /api/exams/:examId/start
  ☐ POST /api/student-exams/:studentExamId/answer
  ☐ POST /api/student-exams/:studentExamId/submit
  ☐ GET /api/student-exams/:studentExamId/results
  ☐ GET /api/student-exams/:studentExamId/review
  
  ☐ GET /api/students/:studentId
  ☐ GET /api/students/me
  ☐ GET /api/students/:studentId/exam-history
  ☐ GET /api/students/:studentId/stats

FRONTEND:
  ☐ Admin question creation UI
  ☐ Admin bulk import UI
  ☐ Admin exam creation UI
  ☐ Add questions to exam UI
  ☐ Student exam list UI
  ☐ Exam taking UI
  ☐ Results page
  ☐ Review answers page
  ☐ Student progress page
  ☐ Teacher results dashboard

SECURITY:
  ☐ Verify correct answers not sent during exam
  ☐ Verify only student can see their own results
  ☐ Verify only teacher can see class results
  ☐ Verify only admin can delete questions
  ☐ Verify max attempts enforced
  ☐ Verify time limits enforced

TESTING:
  ☐ Manually test question creation
  ☐ Manually test exam creation
  ☐ Manually test student taking exam
  ☐ Manually test grading
  ☐ Manually test results viewing
  ☐ Manual test role-based access
  ☐ Load test with 100+ questions
  ☐ Load test with 10+ students
```

---

This is your **complete data management and workflow plan**! 

Would you like me to now create:
1. **Prisma schema file** (actual code for database)
2. **API endpoints guide** (detailed API implementation)
3. **Frontend integration guide** (how to connect frontend to APIs)
4. **Database query examples** (how to fetch/save data)

Which would be most helpful right now?

