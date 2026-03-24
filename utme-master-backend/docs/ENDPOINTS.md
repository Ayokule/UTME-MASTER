# UTME Master API Endpoints

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "licenseTier": "TRIAL",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400 Bad Request` - Email already exists

---

### POST /auth/login

Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "licenseTier": "TRIAL"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

---

### POST /auth/logout

Logout current user and invalidate session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /auth/me

Get current user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "licenseTier": "TRIAL",
    "isActive": true
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid token

---

### POST /auth/reset-password

Request password reset email.

**Request Body:**
```json
{
  "email": "student@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

## User Endpoints

### GET /users/profile

Get user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "licenseTier": "TRIAL",
    "totalExams": 5,
    "passedExams": 3
  }
}
```

---

### PUT /users/profile

Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+2348012345678"
  }
}
```

---

### GET /users/progress

Get user's exam progress and statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalExams": 5,
    "passedExams": 3,
    "failedExams": 2,
    "inProgressExams": 1,
    "averageScore": 75.5,
    "bestScore": 90,
    "worstScore": 60
  }
}
```

---

## Exam Endpoints

### GET /exams/available

Get list of available exams for the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "exam-123",
        "title": "JAMB Mock Exam - Mathematics",
        "description": "Mock exam for JAMB Mathematics",
        "duration": 3600,
        "totalQuestions": 40,
        "totalMarks": 100,
        "passMarks": 50,
        "status": "available",
        "canStart": true,
        "attempts": 0
      }
    ]
  }
}
```

---

### GET /exams/{examId}

Get detailed information about a specific exam.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "exam-123",
    "title": "JAMB Mock Exam - Mathematics",
    "description": "Mock exam for JAMB Mathematics",
    "duration": 3600,
    "totalQuestions": 40,
    "totalMarks": 100,
    "passMarks": 50,
    "allowReview": true,
    "allowRetake": false,
    "isPublished": true,
    "isActive": true
  }
}
```

---

### POST /exams/{examId}/start

Start a new exam session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentExamId": "student-exam-123",
    "examId": "exam-123",
    "examTitle": "JAMB Mock Exam - Mathematics",
    "duration": 60,
    "totalQuestions": 40,
    "totalMarks": 100,
    "startedAt": "2026-03-18T10:00:00Z",
    "timeRemaining": 3600,
    "questions": [
      {
        "id": "question-1",
        "questionText": "What is the capital of Nigeria?",
        "questionType": "MCQ",
        "options": [
          {"label": "A", "text": "Lagos"},
          {"label": "B", "text": "Abuja"},
          {"label": "C", "text": "Kano"},
          {"label": "D", "text": "Port Harcourt"}
        ],
        "subject": "Mathematics",
        "difficulty": "EASY"
      }
    ],
    "allowReview": true,
    "allowRetake": false
  }
}
```

**Errors:**
- `400 Bad Request` - Exam already started or has no questions
- `403 Forbidden` - Exam not published or not active

---

### POST /exams/{studentExamId}/submit

Submit the current exam session.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "autoSubmit": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentExamId": "student-exam-123",
    "examTitle": "JAMB Mock Exam - Mathematics",
    "totalQuestions": 40,
    "answeredQuestions": 40,
    "correctAnswers": 32,
    "wrongAnswers": 8,
    "score": 80,
    "totalMarks": 100,
    "scorePercentage": "80.0",
    "passed": true,
    "grade": "A",
    "passMarks": 50,
    "autoSubmitted": false
  }
}
```

---

### POST /exams/{examId}/retake

Start a new attempt for a previously completed exam.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentExamId": "student-exam-456",
    "examId": "exam-123"
  }
}
```

---

## Question Endpoints

### GET /questions

Get questions with optional filters.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `subject` - Filter by subject name
- `difficulty` - Filter by difficulty (EASY, MEDIUM, HARD)
- `examType` - Filter by exam type (JAMB, WAEC, NECO, MOCK, PRACTICE)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "question-123",
        "questionText": "What is the capital of Nigeria?",
        "questionType": "MCQ",
        "difficulty": "EASY",
        "subject": "Mathematics",
        "isActive": true
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET /questions/{questionId}

Get detailed information about a specific question.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "question-123",
    "questionText": "What is the capital of Nigeria?",
    "questionType": "MCQ",
    "options": {
      "A": {"text": "Lagos"},
      "B": {"text": "Abuja"},
      "C": {"text": "Kano"},
      "D": {"text": "Port Harcourt"}
    },
    "correctAnswer": "B",
    "explanation": "Abuja is the capital of Nigeria",
    "difficulty": "EASY",
    "subject": "Mathematics"
  }
}
```

---

## Results Endpoints

### GET /student/results/{studentExamId}

Get results for a completed exam.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentExamId": "student-exam-123",
    "examTitle": "JAMB Mock Exam - Mathematics",
    "totalQuestions": 40,
    "answeredQuestions": 40,
    "correctAnswers": 32,
    "wrongAnswers": 8,
    "score": 80,
    "totalMarks": 100,
    "scorePercentage": "80.0",
    "passed": true,
    "grade": "A",
    "passMarks": 50,
    "submittedAt": "2026-03-18T11:00:00Z",
    "timeSpent": 1800
  }
}
```

---

### GET /student/results/{studentExamId}/pdf

Download exam results as PDF.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
- Content-Type: `application/pdf`
- Body: PDF file

---

### POST /student/results/{studentExamId}/share

Share exam results to social media or copy link.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "platform": "facebook"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Results shared successfully",
    "shareUrl": "https://utmemaster.com/results/student-exam-123"
  }
}
```

---

## Analytics Endpoints

### GET /student/analytics/dashboard

Get comprehensive analytics for student dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_exams": 5,
      "average_score": 75.5,
      "best_score": 90,
      "improvement_trend": 15,
      "strong_areas": ["Algebra", "Geometry"],
      "weak_areas": ["Calculus", "Statistics"]
    }
  }
}
```

---

### GET /student/analytics/official-exams

Get analytics for official exams (JAMB, WAEC, NECO).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_exams": 3,
      "average_score": 78.5,
      "best_score": 85,
      "worst_score": 65,
      "pass_rate": 66.7,
      "passed_exams": 2
    }
  }
}
```

---

### GET /student/analytics/practice-tests

Get analytics for practice tests.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_tests": 10,
      "average_score": 72.3,
      "best_score": 88,
      "improvement_trend": 25,
      "strong_areas": ["Geometry"],
      "weak_areas": ["Trigonometry"]
    }
  }
}
```

---

### GET /exams/{examId}/statistics

Get comprehensive statistics for an exam (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "examId": "exam-123",
    "examTitle": "JAMB Mock Exam - Mathematics",
    "totalQuestions": 40,
    "totalMarks": 100,
    "passMarks": 50,
    "statistics": {
      "totalAttempts": 50,
      "passedAttempts": 35,
      "failedAttempts": 15,
      "passRate": "70.0",
      "averageScore": "75.5",
      "highestScore": 95,
      "lowestScore": 45,
      "averageTime": 1800,
      "gradeDistribution": {
        "A": 10,
        "B": 15,
        "C": 12,
        "D": 8,
        "F": 5
      }
    }
  }
}
```
