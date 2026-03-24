# UTME Master API Error Codes

## Authentication Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `TOKEN_EXPIRED` | 401 | Authentication token has expired |
| `INVALID_TOKEN` | 401 | Token format is invalid |
| `ACCOUNT_INACTIVE` | 401 | User account is deactivated |
| `INVALID_CREDENTIALS` | 401 | Email or password is incorrect |

**Example:**
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

## Authorization Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `FORBIDDEN` | 403 | Insufficient permissions for this action |
| `ACCESS_DENIED` | 403 | User doesn't have required role |
| `NOT_ELIGIBLE` | 403 | User doesn't meet requirements |

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied. Required role: ADMIN"
  }
}
```

---

## Not Found Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `EXAM_NOT_FOUND` | 404 | Exam with specified ID doesn't exist |
| `QUESTION_NOT_FOUND` | 404 | Question with specified ID doesn't exist |
| `RESULTS_NOT_FOUND` | 404 | Results for specified exam don't exist |
| `ROUTE_NOT_FOUND` | 404 | Requested route doesn't exist |

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "EXAM_NOT_FOUND",
    "message": "Exam not found"
  }
}
```

---

## Bad Request Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BAD_REQUEST` | 400 | Invalid request data |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_REQUEST` | 400 | Request parameters are invalid |
| `START_EXAM_FAILED` | 400 | Failed to start exam |
| `EXAM_ALREADY_SUBMITTED` | 400 | Exam has already been submitted |
| `NO_QUESTIONS` | 400 | Exam has no questions assigned |
| `DUPLICATE_ERROR` | 400 | Record already exists |
| `INVALID_JSON` | 400 | Invalid JSON in request body |

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## Database Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `DATABASE_ERROR` | 400 | Database operation failed |
| `UNIQUE_CONSTRAINT_VIOLATION` | 409 | Unique constraint violation |
| `RECORD_NOT_FOUND` | 404 | Record not found in database |
| `DATABASE_CONNECTION_ERROR` | 503 | Database connection failed |

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "UNIQUE_CONSTRAINT_VIOLATION",
    "message": "This record already exists"
  }
}
```

---

## Internal Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SAVE_ANSWER_FAILED` | 500 | Failed to save answer |
| `GET_RESULTS_FAILED` | 500 | Failed to get results |
| `PDF_GENERATION_FAILED` | 500 | Failed to generate PDF |
| `PROCESS_SCHEDULING_FAILED` | 500 | Failed to process scheduling |

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## Validation Error Details

When validation fails, the error response includes detailed field information:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

---

## Error Handling in Client Code

### JavaScript/TypeScript

```typescript
import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:5000/api';

const handleApiError = (error: AxiosError) => {
  if (error.response) {
    const { code, message } = error.response.data.error;
    
    switch (code) {
      case 'UNAUTHORIZED':
        // Redirect to login
        window.location.href = '/login';
        break;
      case 'FORBIDDEN':
        // Show permission denied message
        console.error('Permission denied:', message);
        break;
      case 'NOT_FOUND':
        // Show not found message
        console.error('Resource not found:', message);
        break;
      case 'VALIDATION_ERROR':
        // Handle validation errors
        console.error('Validation errors:', error.response.data.error.details);
        break;
      default:
        // Show generic error
        console.error('Error:', message);
    }
  } else if (error.request) {
    // Network error
    console.error('Network error:', error.message);
  } else {
    // Other error
    console.error('Error:', error.message);
  }
};

// Usage
try {
  const response = await axios.get(`${API_URL}/auth/me`);
} catch (error) {
  handleApiError(error as AxiosError);
}
```

### React Example

```typescript
import { useState } from 'react';
import axios from 'axios';

const useExam = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startExam = async (examId: string) => {
    setLoading(true);
    setError(null);
    
    try {
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
      
      return response.data.data;
    } catch (error: any) {
      const errorCode = error.response?.data?.error?.code;
      
      switch (errorCode) {
        case 'EXAM_NOT_FOUND':
          setError('Exam not found');
          break;
        case 'NOT_ELIGIBLE':
          setError('You are not eligible to start this exam');
          break;
        case 'START_EXAM_FAILED':
          setError('Failed to start exam');
          break;
        default:
          setError('An error occurred while starting the exam');
      }
    } finally {
      setLoading(false);
    }
  };

  return { startExam, loading, error };
};
```

---

## HTTP Status Code Summary

| Status | Code | Description |
|--------|------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |
