# Dashboard Setup Instructions

**Purpose**: Step-by-step guide to set up and verify the dashboard integration  
**Time Required**: 30-45 minutes  
**Prerequisites**: Node.js 16+, PostgreSQL running, Git

---

## Table of Contents

1. [Backend Verification](#backend-verification)
2. [Frontend Setup](#frontend-setup)
3. [Type Checking](#type-checking)
4. [API Testing](#api-testing)
5. [Integration Testing](#integration-testing)
6. [Troubleshooting](#troubleshooting)

---

## Backend Verification

### Step 1: Verify Backend is Running

```bash
# Check if backend server is running
curl http://localhost:3000/api/health

# Expected response:
# {
#   "success": true,
#   "data": {
#     "status": "healthy",
#     "timestamp": "2024-03-14T10:30:00Z"
#   }
# }
```

### Step 2: Verify Database Connection

```bash
# Check database status
curl http://localhost:3000/api/health/database

# Expected response:
# {
#   "success": true,
#   "data": {
#     "status": "connected",
#     "tables": {
#       "users": 5,
#       "exams": 12,
#       "student_exams": 45
#     }
#   }
# }
```

### Step 3: Verify Routes are Registered

```bash
# Check if dashboard routes are registered
# Look for these routes in server logs:
# GET /api/student/dashboard
# GET /api/student/analytics/subject/:subject
# GET /api/student/analytics/predicted-score
# GET /api/student/recommendations

# Or check the routes file
cat utme-master-backend/src/routes/dashboard.routes.ts
```

### Step 4: Verify Authentication Middleware

```bash
# Test without token (should fail)
curl http://localhost:3000/api/student/dashboard

# Expected response:
# {
#   "success": false,
#   "message": "Authentication required"
# }
```

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd utme-master-frontend

# Install all dependencies
npm install

# Verify installation
npm list react react-dom typescript
```

### Step 2: Create Type Definitions File

Create `src/types/dashboard.ts` with all interfaces from the integration guide:

```bash
# Verify file exists
ls -la src/types/dashboard.ts

# Check file size (should be > 1KB)
wc -l src/types/dashboard.ts
```

### Step 3: Create Enhanced API Client

Create `src/api/dashboardClient.ts` with error handling and retry logic:

```bash
# Verify file exists
ls -la src/api/dashboardClient.ts

# Check imports are correct
grep "import.*dashboard" src/api/dashboardClient.ts
```

### Step 4: Update Dashboard Component

Update `src/pages/student/Dashboard.tsx`:

```bash
# Verify imports
grep "import.*dashboardClient" src/pages/student/Dashboard.tsx

# Verify data destructuring
grep "const {" src/pages/student/Dashboard.tsx | head -5
```

### Step 5: Verify Component Imports

```bash
# Check all child components are imported
grep "import.*from.*dashboard" src/pages/student/Dashboard.tsx

# Should see imports for:
# - ProgressChart
# - SubjectPerformanceChart
# - RecentActivity
# - StatCard
# - StrengthsWeaknesses
# - PremiumUpgrade
```

---

## Type Checking

### Step 1: Run TypeScript Compiler

```bash
cd utme-master-frontend

# Check for type errors
npx tsc --noEmit

# Expected output:
# (no errors if successful)
```

### Step 2: Check Specific Files

```bash
# Check dashboard types
npx tsc --noEmit src/types/dashboard.ts

# Check API client
npx tsc --noEmit src/api/dashboardClient.ts

# Check Dashboard component
npx tsc --noEmit src/pages/student/Dashboard.tsx
```

### Step 3: Verify Type Exports

```bash
# Check types are exported correctly
grep "export interface" src/types/dashboard.ts

# Should see:
# export interface DashboardData
# export interface DashboardStats
# export interface SubjectPerformance
# export interface ProgressPoint
# export interface RecentActivity
# export interface StatCardProps
```

---

## API Testing

### Step 1: Get Authentication Token

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@test.com",
    "password": "Student@123"
  }'

# Save the token from response
# TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### Step 2: Test Main Dashboard Endpoint

```bash
# Set token variable
TOKEN="your_token_here"

# Test dashboard endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/student/dashboard

# Expected response structure:
# {
#   "success": true,
#   "data": {
#     "student": { "name": "...", "streak_days": 0, "license_tier": "TRIAL" },
#     "stats": { "total_tests": 0, "average_score": 0, ... },
#     "subject_performance": [...],
#     "progress": [...],
#     "recent_activity": [...],
#     "strengths": [...],
#     "weaknesses": [...],
#     "quote_of_day": "..."
#   }
# }
```

### Step 3: Test Subject Analytics (Premium Feature)

```bash
# Test subject analytics
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/student/analytics/subject/Mathematics"

# Expected response:
# {
#   "success": true,
#   "data": {
#     "subject": "Mathematics",
#     "total_exams": 5,
#     "recent_scores": [...]
#   }
# }
```

### Step 4: Test Predicted Score (Premium Feature)

```bash
# Test predicted score
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/student/analytics/predicted-score

# Expected response:
# {
#   "success": true,
#   "data": {
#     "predicted_score": 285,
#     "confidence": 85,
#     "based_on_exams": 10
#   }
# }
```

### Step 5: Test Recommendations

```bash
# Test recommendations
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/student/recommendations

# Expected response:
# {
#   "success": true,
#   "data": {
#     "recommendations": [
#       "Focus on Mathematics...",
#       "Your Physics performance..."
#     ]
#   }
# }
```

### Step 6: Test Authorization (FREE User)

```bash
# Login as FREE user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "free@test.com",
    "password": "Free@123"
  }'

# Try to access premium feature
curl -H "Authorization: Bearer $FREE_TOKEN" \
  http://localhost:3000/api/student/analytics/subject/Mathematics

# Expected response (403 Forbidden):
# {
#   "success": false,
#   "message": "Premium feature - upgrade to access..."
# }
```

---

## Integration Testing

### Step 1: Start Frontend Development Server

```bash
cd utme-master-frontend

# Start development server
npm run dev

# Expected output:
# VITE v4.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

### Step 2: Open Dashboard in Browser

```bash
# Open browser to dashboard
# http://localhost:5173/student/dashboard

# Check browser console for errors
# Press F12 to open DevTools
# Go to Console tab
# Should see no red errors
```

### Step 3: Verify Data Loading

```javascript
// In browser console, check if data loaded:
// 1. Check Network tab (F12 → Network)
// 2. Look for GET /api/student/dashboard request
// 3. Response should have status 200
// 4. Response body should match DashboardData interface
```

### Step 4: Verify Components Render

```javascript
// In browser console:
// 1. Check if charts are visible
// 2. Check if recent activity shows
// 3. Check if stat cards display
// 4. Check if strengths/weaknesses show

// If not visible, check console for errors
console.log('Dashboard data:', window.__dashboardData)
```

### Step 5: Test Error Handling

```javascript
// Simulate network error:
// 1. Open DevTools Network tab
// 2. Set throttling to "Offline"
// 3. Refresh page
// 4. Should show error message
// 5. Should show retry button

// Restore network:
// 1. Set throttling back to "No throttling"
// 2. Click retry button
// 3. Data should load
```

---

## Postman Collection

### Import Collection

```json
{
  "info": {
    "name": "UTME Dashboard API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"student1@test.com\",\"password\":\"Student@123\"}"
        }
      }
    },
    {
      "name": "Get Dashboard",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/student/dashboard",
        "header": {
          "Authorization": "Bearer {{token}}"
        }
      }
    },
    {
      "name": "Get Subject Analytics",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/student/analytics/subject/Mathematics",
        "header": {
          "Authorization": "Bearer {{token}}"
        }
      }
    },
    {
      "name": "Get Predicted Score",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/student/analytics/predicted-score",
        "header": {
          "Authorization": "Bearer {{token}}"
        }
      }
    },
    {
      "name": "Get Recommendations",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/student/recommendations",
        "header": {
          "Authorization": "Bearer {{token}}"
        }
      }
    }
  ]
}
```

---

## Troubleshooting

### Issue: "Cannot find module 'dashboardClient'"

**Solution**:
```bash
# Verify file exists
ls -la src/api/dashboardClient.ts

# Check import path
grep "import.*dashboardClient" src/pages/student/Dashboard.tsx

# Should be:
# import dashboardClient from '../api/dashboardClient'
```

### Issue: TypeScript compilation errors

**Solution**:
```bash
# Run type checker
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/pages/student/Dashboard.tsx

# Fix errors one by one
# Common issues:
# - Missing type imports
# - Incorrect interface names
# - Missing optional markers (?)
```

### Issue: API returns 401 Unauthorized

**Solution**:
```bash
# Verify token is valid
# 1. Check token expiration
# 2. Check token format (Bearer <token>)
# 3. Get new token if expired

# Test with curl:
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/student/dashboard
```

### Issue: API returns 403 Forbidden

**Solution**:
```bash
# Check user license tier
# 1. Login as TRIAL or PREMIUM user
# 2. FREE users cannot access premium features
# 3. Check user's license_tier in database

# Test with different user:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trial@test.com","password":"Trial@123"}'
```

### Issue: Dashboard shows blank page

**Solution**:
```bash
# Check browser console for errors
# 1. Press F12
# 2. Go to Console tab
# 3. Look for red error messages

# Check Network tab
# 1. Go to Network tab
# 2. Look for failed requests
# 3. Check response status and body

# Common causes:
# - API not running
# - Wrong API endpoint
# - Missing authentication token
# - Data transformation error
```

### Issue: Charts not rendering

**Solution**:
```bash
# Verify data structure
// In browser console:
console.log('Dashboard data:', dashboardData)

// Check if arrays are empty
console.log('Progress data:', dashboardData?.progress)
console.log('Subject data:', dashboardData?.subject_performance)

// If empty, check API response
// Go to Network tab and inspect API response
```

---

## Verification Checklist

- [ ] Backend server running on port 3000
- [ ] Database connected and populated
- [ ] Frontend server running on port 5173
- [ ] TypeScript compilation successful
- [ ] All API endpoints return 200 status
- [ ] Dashboard loads without errors
- [ ] Charts render with data
- [ ] Recent activity displays
- [ ] Stat cards show correct values
- [ ] Error handling works (try offline mode)
- [ ] Premium features show for TRIAL users
- [ ] Premium features blocked for FREE users

---

**Next Steps**: See [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md) for common issues
