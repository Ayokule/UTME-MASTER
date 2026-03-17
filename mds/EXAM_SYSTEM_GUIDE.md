# UTME Master - Exam System Guide

## System Overview

The exam system has two main flows:

1. **Admin Flow**: Create questions → Create exams → Publish exams
2. **Student Flow**: Select subject → Configure exam → Take exam → View results

---

## Admin Workflow

### Step 1: Create Questions
1. Login as admin (admin@utmemaster.com / Admin@123)
2. Go to **Admin Dashboard** → **Questions**
3. Click **Create Question**
4. Fill in:
   - **Question Text**: Use rich text editor for formatting
   - **Subject**: Select from dropdown (Biology, Chemistry, etc.)
   - **Exam Type**: JAMB, WAEC, or NECO
   - **Difficulty**: EASY, MEDIUM, or HARD
   - **Options A-D**: Use rich text editor for each option
   - **Correct Answer**: Select which option is correct
   - **Explanation**: Detailed explanation for the answer
5. Click **Save Question**

### Step 2: Create Exams (Optional)
1. Go to **Admin Dashboard** → **Exams**
2. Click **Create Exam**
3. Fill in exam details
4. Add questions to the exam
5. Publish the exam

### Step 3: Monitor Results
1. Go to **Admin Dashboard** → **Results**
2. View student performance
3. See analytics and statistics

---

## Student Workflow

### Step 1: Login
- Email: student1@test.com (or student2/student3)
- Password: Student@123

### Step 2: Select Subject
1. Go to **Student Dashboard**
2. Click on a subject (e.g., Biology, Chemistry)
3. You'll be taken to exam configuration page

### Step 3: Configure Exam
On the **Exam Start** page, configure:
- **Exam Type**: JAMB, WAEC, or NECO
- **Difficulty Level**: EASY, MEDIUM, or HARD
- **Number of Questions**: 5-100 (use slider)
- **Duration**: 15-180 minutes (use slider)

### Step 4: Take Exam
1. Click **Start Exam**
2. Read each question carefully
3. Select your answer (A, B, C, or D)
4. Click **Next** to go to next question
5. Use **Previous** to review previous answers
6. Click **Submit Exam** when done

### Step 5: View Results
1. After submission, see your score
2. View breakdown:
   - Total questions
   - Correct answers
   - Wrong answers
   - Score percentage
   - Pass/Fail status
3. Click **Review** to see explanations

---

## API Endpoints

### Practice Exam Flow

#### 1. Start Practice Exam
```
POST /api/exams/practice/start
Authorization: Bearer <token>

Body:
{
  "subject": "Biology",
  "examType": "JAMB",
  "difficulty": "EASY",
  "questionCount": 40,
  "duration": 60
}

Response:
{
  "success": true,
  "data": {
    "studentExamId": "uuid",
    "examTitle": "Biology Practice Exam",
    "duration": 60,
    "totalQuestions": 40,
    "totalMarks": 40,
    "startedAt": "2026-03-14T10:00:00Z",
    "timeRemaining": 3600,
    "questions": [...],
    "currentQuestionIndex": 0,
    "savedAnswers": {}
  }
}
```

#### 2. Submit Answer
```
POST /api/exams/{studentExamId}/answers
Authorization: Bearer <token>

Body:
{
  "questionId": "uuid",
  "answer": "A",
  "timeSpent": 45
}

Response:
{
  "success": true,
  "data": {
    "questionId": "uuid",
    "isCorrect": true,
    "nextQuestionIndex": 1
  }
}
```

#### 3. Submit Exam
```
POST /api/exams/{studentExamId}/submit
Authorization: Bearer <token>

Body:
{
  "autoSubmit": false
}

Response:
{
  "success": true,
  "data": {
    "studentExamId": "uuid",
    "examTitle": "Biology Practice Exam",
    "totalQuestions": 40,
    "answeredQuestions": 40,
    "correctAnswers": 32,
    "wrongAnswers": 8,
    "score": 32,
    "totalMarks": 40,
    "scorePercentage": "80.00",
    "passed": true,
    "grade": "A",
    "passMarks": 20,
    "autoSubmitted": false,
    "submittedAt": "2026-03-14T11:00:00Z"
  }
}
```

#### 4. Get Results
```
GET /api/exams/results/{studentExamId}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "studentExamId": "uuid",
    "examTitle": "Biology Practice Exam",
    "totalQuestions": 40,
    "answeredQuestions": 40,
    "correctAnswers": 32,
    "wrongAnswers": 8,
    "score": 32,
    "totalMarks": 40,
    "scorePercentage": "80.00",
    "passed": true,
    "grade": "A",
    "passMarks": 20,
    "autoSubmitted": false,
    "submittedAt": "2026-03-14T11:00:00Z"
  }
}
```

#### 5. Get Review Questions
```
GET /api/exams/results/{studentExamId}/review
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "uuid",
        "questionText": "What is photosynthesis?",
        "subject": "Biology",
        "options": ["A", "B", "C", "D"],
        "studentAnswer": "A",
        "isCorrect": true,
        "explanation": "Photosynthesis is the process..."
      }
    ]
  }
}
```

---

## Frontend Components

### Student Pages
- **Dashboard** (`/student/dashboard`): Main student hub
- **Subject Selection** (`/student/subjects-simple`): Choose subject
- **Exam Start** (`/student/exam-start`): Configure exam parameters
- **Exam Interface** (`/student/exam`): Take the exam
- **Results** (`/student/results`): View exam results
- **Analytics** (`/student/analytics`): View performance statistics

### Admin Pages
- **Admin Dashboard** (`/admin/dashboard`): Admin hub
- **Questions** (`/admin/questions`): Manage questions
- **Create Question** (`/admin/questions/create`): Create new question
- **Edit Question** (`/admin/questions/:id/edit`): Edit existing question
- **Exams** (`/admin/exams`): Manage exams
- **Results** (`/admin/results`): View all student results

---

## Database Schema

### Key Tables

#### Users
- id, email, password, firstName, lastName, role, licenseTier, isActive

#### Subjects
- id, name, code, description

#### Questions
- id, questionText, optionA, optionB, optionC, optionD, correctAnswer
- difficulty, examType, subject, explanation

#### StudentExams
- id, studentId, examId, startedAt, submittedAt, score, passed, grade

#### StudentAnswers
- id, studentExamId, questionId, answer, isCorrect, timeSpent

---

## Grading System

### Score Calculation
- Each correct answer = 1 mark
- Total marks = number of questions
- Score percentage = (correct answers / total questions) × 100

### Grade Assignment
- A: 80-100%
- B: 70-79%
- C: 60-69%
- D: 50-59%
- F: Below 50%

### Pass/Fail
- Pass mark: 50% of total marks
- Passed: score >= pass mark
- Failed: score < pass mark

---

## Troubleshooting

### Issue: "No questions available"
**Cause**: No questions created for the selected subject/difficulty
**Solution**: 
1. Login as admin
2. Create questions for the subject
3. Make sure difficulty level matches

### Issue: "Exam not starting"
**Cause**: Backend not running or API error
**Solution**:
1. Check backend is running: `npm run dev` in backend folder
2. Check browser console for error messages
3. Verify PostgreSQL is running

### Issue: "Answers not saving"
**Cause**: Network issue or backend error
**Solution**:
1. Check network tab in DevTools
2. Verify backend is responding
3. Try refreshing the page

### Issue: "Results not showing"
**Cause**: Exam not submitted properly
**Solution**:
1. Make sure you clicked "Submit Exam"
2. Wait for response (may take a few seconds)
3. Check browser console for errors

---

## Performance Optimization

1. **Question Creation**: Use rich text editor for better formatting
2. **Exam Duration**: Set realistic time limits (1 minute per question minimum)
3. **Question Count**: Start with 40 questions (JAMB standard)
4. **Difficulty Mix**: Create questions across all difficulty levels

---

## Best Practices

1. **Create diverse questions**: Mix easy, medium, and hard questions
2. **Clear explanations**: Provide detailed explanations for all answers
3. **Realistic exams**: Follow JAMB/WAEC/NECO standards
4. **Regular updates**: Keep question bank updated with new questions
5. **Monitor results**: Review student performance regularly

