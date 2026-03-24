# UTME Master API Documentation

## Overview

This directory contains the API documentation for the UTME Master backend.

## Documentation Files

- `api-spec.yaml` - OpenAPI 3.0 specification (Swagger)
- `ENDPOINTS.md` - Detailed endpoint documentation
- `REQUEST_EXAMPLES.md` - Request/response examples
- `ERROR_CODES.md` - Error code reference

## API Specification

The API follows the OpenAPI 3.0 specification. You can view the interactive documentation using:

### Using Swagger UI

1. Install swagger-ui globally:
```bash
npm install -g swagger-ui
```

2. Start Swagger UI:
```bash
swagger-ui -u docs/api-spec.yaml
```

### Using Online Tools

1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Click "File" → "Import URL"
3. Enter the path to `api-spec.yaml`

## Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://api.utmemaster.com/api`

## Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user profile
- `POST /auth/reset-password` - Request password reset

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/progress` - Get user progress

### Exams
- `GET /exams/available` - Get available exams
- `GET /exams/{examId}` - Get exam details
- `POST /exams/{examId}/start` - Start exam
- `POST /exams/{studentExamId}/submit` - Submit exam
- `POST /exams/{examId}/retake` - Retake exam

### Questions
- `GET /questions` - Get questions
- `GET /questions/{questionId}` - Get question details

### Results
- `GET /student/results/{studentExamId}` - Get exam results
- `GET /student/results/{studentExamId}/pdf` - Download results PDF
- `POST /student/results/{studentExamId}/share` - Share results

### Analytics
- `GET /student/analytics/dashboard` - Get student dashboard analytics
- `GET /student/analytics/official-exams` - Get official exams analytics
- `GET /student/analytics/practice-tests` - Get practice tests analytics
- `GET /exams/{examId}/statistics` - Get exam statistics (Admin)

## Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource doesn't exist |
| `BAD_REQUEST` | Invalid input |
| `INTERNAL_ERROR` | Server error |

## Rate Limiting

The API implements rate limiting:
- 100 requests per minute per user
- 1000 requests per hour per user

## Versioning

API version is included in the response headers:
```
X-API-Version: 1.0.0
```

## Changelog

### Version 1.0.0
- Initial release
- Authentication endpoints
- User management endpoints
- Exam management endpoints
- Question bank endpoints
- Student exam taking endpoints
- Results endpoints
- Analytics endpoints
