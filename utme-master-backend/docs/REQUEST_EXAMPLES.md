# UTME Master API Request/Response Examples

## Authentication Examples

### Register User

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  }'
```

**Response (201):**
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyJ9.abc123"
  }
}
```

---

### Login User

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

**Response (200):**
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyJ9.abc123"
  }
}
```

---

### Get Current User

**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyJ9.abc123"
```

**Response (200):**
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

---

## Exam Examples

### Get Available Exams

**Request:**
```bash
curl -X GET http://localhost:5000/api/exams/available \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
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

### Start Exam

**Request:**
```bash
curl -X POST http://localhost:5000/api/exams/exam-123/start \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
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

---

### Submit Exam

**Request:**
```bash
curl -X POST http://localhost:5000/api/exams/student-exam-123/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (200):**
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

## Results Examples

### Get Exam Results

**Request:**
```bash
curl -X GET http://localhost:5000/api/student/results/student-exam-123 \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
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

### Download Results PDF

**Request:**
```bash
curl -X GET http://localhost:5000/api/student/results/student-exam-123/pdf \
  -H "Authorization: Bearer <token>" \
  -o results.pdf
```

**Response (200):**
- Content-Type: `application/pdf`
- Body: PDF file (binary)

---

## Analytics Examples

### Get Student Dashboard Analytics

**Request:**
```bash
curl -X GET http://localhost:5000/api/student/analytics/dashboard \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
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

### Get Official Exams Analytics

**Request:**
```bash
curl -X GET http://localhost:5000/api/student/analytics/official-exams \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
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

## Error Examples

### Unauthorized Error

**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me
```

**Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No authorization header provided"
  }
}
```

---

### Not Found Error

**Request:**
```bash
curl -X GET http://localhost:5000/api/exams/non-existent-id \
  -H "Authorization: Bearer <token>"
```

**Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Exam not found"
  }
}
```

---

### Bad Request Error

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "short"
  }'
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed"
  }
}
```

---

## JavaScript/TypeScript Examples

### Login with Axios

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Login
const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
  
  // Store token
  localStorage.setItem('token', response.data.data.token);
  
  return response.data;
};

// Get user profile
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data;
};

// Start exam
const startExam = async (examId: string) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.post(
    `${API_URL}/exams/${examId}/start`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};

// Submit exam
const submitExam = async (studentExamId: string) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.post(
    `${API_URL}/exams/${studentExamId}/submit`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};
```

### React Query Example

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get available exams
const useAvailableExams = () => {
  const token = localStorage.getItem('token');
  
  return useQuery(['exams'], async () => {
    const response = await axios.get(`${API_URL}/exams/available`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data.exams;
  });
};

// Start exam mutation
const useStartExam = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  
  return useMutation(
    (examId: string) => 
      axios.post(`${API_URL}/exams/${examId}/start`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['exams']);
      },
    }
  );
};

// Submit exam mutation
const useSubmitExam = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  
  return useMutation(
    (studentExamId: string) => 
      axios.post(`${API_URL}/exams/${studentExamId}/submit`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['exams']);
        queryClient.invalidateQueries(['results']);
      },
    }
  );
};
```
