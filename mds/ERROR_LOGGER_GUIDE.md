# Error Logger System - Complete Guide

## Overview

A comprehensive error logging system for the UTME Master frontend that captures, displays, and exports all API, page, exam, and authentication errors.

---

## Features

✅ **Automatic API Error Logging** - All API calls are automatically logged
✅ **Error Type Classification** - Different error types (API, Page, Exam, Auth, Validation)
✅ **Console Output** - Formatted error messages in browser console
✅ **Debug Panel** - Floating UI panel to view errors in real-time (dev only)
✅ **Error Storage** - Logs stored in localStorage for persistence
✅ **Export Functionality** - Download error logs as JSON
✅ **Error Summary** - View statistics and summaries of all errors

---

## Components

### 1. Error Logger (`src/utils/errorLogger.ts`)

Core logging utility with methods for different error types:

```typescript
import { errorLogger } from '@/utils/errorLogger'

// Log API errors
errorLogger.logApiError(error, endpoint, method)

// Log page errors
errorLogger.logPageError(error, pagePath)

// Log exam errors
errorLogger.logExamError(error, examId, action)

// Log auth errors
errorLogger.logAuthError(error, action)

// Log validation errors
errorLogger.logValidationError(error, formName)

// Generic error logging
errorLogger.logError(error, 'UNKNOWN_ERROR', context)
```

### 2. API Interceptor (`src/api/client.ts`)

Automatically logs all API errors via axios interceptor:

```typescript
// Automatically logs:
// - 404 errors (Not Found)
// - 401/403 errors (Auth errors)
// - 400 errors (Validation errors)
// - 5xx errors (Server errors)
// - All other API errors
```

### 3. Debug Panel (`src/components/debug/ErrorDebugPanel.tsx`)

Floating UI panel showing error logs in real-time:

- **Development Only** - Hidden in production
- **Expandable Logs** - Click to see full error details
- **Refresh Button** - Manually refresh logs
- **Download Button** - Export logs as JSON
- **Clear Button** - Clear all logs
- **Color Coded** - Different colors for different error types

---

## Usage Examples

### Example 1: Automatic API Error Logging

```typescript
// In any component
import { examAPI } from '@/api/exams'

try {
  const exam = await examAPI.getExam(examId)
} catch (error) {
  // Error is automatically logged by the interceptor
  // Shows in console and debug panel
}
```

### Example 2: Manual Error Logging

```typescript
import { errorLogger } from '@/utils/errorLogger'

try {
  // Some operation
} catch (error) {
  errorLogger.logExamError(error, examId, 'startExam')
}
```

### Example 3: View Logs Programmatically

```typescript
import { errorLogger } from '@/utils/errorLogger'

// Get all logs
const allLogs = errorLogger.getLogs()

// Get logs by type
const apiErrors = errorLogger.getLogsByType('API_ERROR')

// Print summary
errorLogger.printSummary()

// Export logs
const jsonLogs = errorLogger.exportLogs()
```

### Example 4: Access from Browser Console

```javascript
// In browser console (development only)
errorLogger.getLogs()
errorLogger.printSummary()
errorLogger.exportLogs()
errorLogger.clearLogs()
```

---

## Error Types

| Type | Color | When Used |
|------|-------|-----------|
| `API_ERROR` | Red | API request failures |
| `PAGE_ERROR` | Orange | Page/route errors |
| `EXAM_ERROR` | Red | Exam-related errors |
| `AUTH_ERROR` | Pink | Authentication failures |
| `VALIDATION_ERROR` | Yellow | Form validation errors |
| `UNKNOWN_ERROR` | Gray | Unclassified errors |

---

## Console Output Example

```
[API_ERROR] Failed to load exam
Timestamp: 2024-03-14T10:30:45.123Z
Endpoint: GET /api/exams/123
Status Code: 404
URL: http://localhost:3000/api/exams/123
Details: {
  message: "Exam not found",
  code: "EXAM_NOT_FOUND"
}
```

---

## Debug Panel UI

**Development Mode Only**

- **Floating Button** (bottom-right)
  - 🐛 icon when closed
  - Shows error count
  - Pulses red if errors exist
  - ✕ icon when open

- **Panel Contents**
  - Error list with timestamps
  - Color-coded error types
  - Expandable details for each error
  - Refresh, Download, Clear buttons

---

## API Error Handling

### Automatic Logging

All API calls through `apiClient` are automatically logged:

```typescript
// These are automatically logged:
GET /api/exams/123 → 404 Not Found
POST /api/exams → 401 Unauthorized
PUT /api/questions/456 → 400 Bad Request
DELETE /api/subjects/789 → 500 Server Error
```

### Status Code Handling

| Status | Type | Action |
|--------|------|--------|
| 404 | API_ERROR | Logged as not found |
| 401/403 | AUTH_ERROR | Logged + redirect to login |
| 400 | VALIDATION_ERROR | Logged as validation error |
| 5xx | API_ERROR | Logged as server error |

---

## LocalStorage

Logs are automatically saved to localStorage:

```javascript
// Access from console
JSON.parse(localStorage.getItem('errorLogs'))

// Clear from console
localStorage.removeItem('errorLogs')
```

---

## Production Behavior

- **Debug Panel**: Hidden (only in development)
- **Console Logging**: Still active (can be disabled)
- **Error Storage**: Still saves to localStorage
- **API Interceptor**: Still logs all errors

---

## Debugging Tips

### 1. View All Errors in Console

```javascript
errorLogger.printSummary()
```

### 2. Filter Errors by Type

```javascript
errorLogger.getLogsByType('API_ERROR')
errorLogger.getLogsByType('EXAM_ERROR')
```

### 3. Export Logs for Analysis

```javascript
const logs = errorLogger.exportLogs()
console.log(logs)
// Copy and save to file
```

### 4. Monitor Specific Endpoint

```javascript
const logs = errorLogger.getLogs()
const examErrors = logs.filter(l => l.endpoint?.includes('/exams'))
console.table(examErrors)
```

---

## Integration Points

### ExamInterface.tsx
- Logs exam loading errors
- Logs answer submission errors
- Logs exam submission errors

### EditProfile.tsx
- Logs profile update errors

### QuestionForm.tsx
- Logs question creation/update errors

### Analytics.tsx
- Logs data loading errors

### All API Calls
- Automatically logged via interceptor

---

## Troubleshooting

### Logs Not Appearing

1. Check if in development mode (not production)
2. Open browser DevTools (F12)
3. Check Console tab for error messages
4. Click debug panel button (🐛) in bottom-right

### Debug Panel Not Showing

1. Ensure `import.meta.env.PROD` is false
2. Check if ErrorDebugPanel is imported in App.tsx
3. Refresh page

### Logs Not Persisting

1. Check localStorage is enabled
2. Check browser storage quota
3. Clear localStorage and try again

---

## Best Practices

1. **Use Specific Error Types** - Use appropriate logging method for context
2. **Include Context** - Pass relevant IDs and actions
3. **Check Console First** - Always check browser console for detailed errors
4. **Export for Analysis** - Download logs for debugging complex issues
5. **Clear Regularly** - Clear old logs to prevent storage issues

---

## Files Modified

- `src/utils/errorLogger.ts` - Core logging utility
- `src/api/client.ts` - API interceptor
- `src/components/debug/ErrorDebugPanel.tsx` - Debug UI
- `src/App.tsx` - Added debug panel

---

## Future Enhancements

- [ ] Send logs to backend for analysis
- [ ] Error analytics dashboard
- [ ] Automatic error reporting
- [ ] Error replay functionality
- [ ] Performance monitoring
- [ ] User session tracking
