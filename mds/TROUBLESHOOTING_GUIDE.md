# Dashboard Troubleshooting Guide

**Purpose**: Solve common dashboard integration issues  
**Last Updated**: 2026-03-14  
**Status**: Production Ready

---

## Quick Diagnosis

### Step 1: Check Backend Status

```bash
# Is backend running?
curl http://localhost:3000/api/health

# If fails: Start backend
cd utme-master-backend
npm run dev
```

### Step 2: Check Frontend Status

```bash
# Is frontend running?
curl http://localhost:5173

# If fails: Start frontend
cd utme-master-frontend
npm run dev
```

### Step 3: Check Browser Console

```javascript
// Open DevTools (F12)
// Go to Console tab
// Look for red error messages
// Copy error message and search below
```

### Step 4: Check Network Tab

```javascript
// Open DevTools (F12)
// Go to Network tab
// Refresh page
// Look for failed requests (red)
// Click on failed request to see details
```

---

## Common Errors & Solutions

### Error 1: "Cannot read property 'subject_performance' of undefined"

**Cause**: Dashboard data not loaded yet or API failed

**Solution**:
```typescript
// ❌ WRONG - No null check
<SubjectPerformanceChart data={dashboardData.subject_performance} />

// ✅ CORRECT - With null check
const { subject_performance = [] } = dashboardData || {}
<SubjectPerformanceChart data={subject_performance} />

// ✅ ALSO CORRECT - Conditional rendering
{dashboardData && (
  <SubjectPerformanceChart data={dashboardData.subject_performance} />
)}
```

**Verification**:
```javascript
// In browser console:
console.log('Dashboard data:', dashboardData)
console.log('Is null?', dashboardData === null)
console.log('Is undefined?', dashboardData === undefined)
```

---

### Error 2: "API returned 401 Unauthorized"

**Cause**: Missing or invalid authentication token

**Solution**:
```bash
# 1. Check if logged in
# Go to Application tab → Cookies
# Look for auth token or session cookie

# 2. If missing, login again
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@test.com",
    "password": "Student@123"
  }'

# 3. Check token expiration
# Decode JWT at jwt.io
# Check 'exp' field

# 4. If expired, get new token
```

**Verification**:
```javascript
// In browser console:
// Check if token exists
const token = localStorage.getItem('token')
console.log('Token exists?', !!token)

// Check token format
console.log('Token:', token?.substring(0, 20) + '...')

// Check if it's being sent
// Go to Network tab
// Click on API request
// Go to Headers tab
// Look for Authorization header
```

---

### Error 3: "API returned 403 Forbidden"

**Cause**: User doesn't have permission for premium feature

**Solution**:
```typescript
// Check user license tier
const { student = { license_tier: 'TRIAL' } } = dashboardData || {}

// Premium features only for TRIAL/PREMIUM
if (student.license_tier === 'FREE') {
  // Show upgrade prompt
  return <PremiumUpgrade />
}

// Allow access for TRIAL/PREMIUM
return <PremiumFeature />
```

**Verification**:
```javascript
// In browser console:
console.log('User license tier:', dashboardData?.student?.license_tier)

// Check if it's FREE
if (dashboardData?.student?.license_tier === 'FREE') {
  console.log('User is FREE - cannot access premium features')
}
```

---

### Error 4: "API returned 404 Not Found"

**Cause**: Wrong endpoint path or resource doesn't exist

**Solution**:
```typescript
// ❌ WRONG - Inconsistent paths
const response1 = await apiClient.get('/analytics/student/dashboard')
const response2 = await apiClient.get('/student/analytics/subject/:subject')

// ✅ CORRECT - Consistent paths
const response1 = await apiClient.get('/api/student/dashboard')
const response2 = await apiClient.get('/api/student/analytics/subject/:subject')

// Verify endpoint in backend
// Check src/routes/dashboard.routes.ts
```

**Verification**:
```bash
# Check backend routes
grep "router.get" utme-master-backend/src/routes/dashboard.routes.ts

# Should see:
# router.get('/dashboard', ...)
# router.get('/analytics/subject/:subject', ...)
# router.get('/analytics/predicted-score', ...)
# router.get('/recommendations', ...)
```

---

### Error 5: "Cannot read property 'map' of undefined"

**Cause**: Array prop is undefined instead of empty array

**Solution**:
```typescript
// ❌ WRONG - No default value
<ProgressChart data={dashboardData.progress} />

// ✅ CORRECT - With default empty array
const { progress = [] } = dashboardData || {}
<ProgressChart data={progress} />

// ✅ ALSO CORRECT - Conditional rendering
{dashboardData?.progress && (
  <ProgressChart data={dashboardData.progress} />
)}
```

**Verification**:
```javascript
// In browser console:
console.log('Progress data:', dashboardData?.progress)
console.log('Is array?', Array.isArray(dashboardData?.progress))
console.log('Length:', dashboardData?.progress?.length)
```

---

### Error 6: "Chart not rendering despite data"

**Cause**: Data structure doesn't match component expectations

**Solution**:
```typescript
// Verify data structure matches interface
interface ProgressPoint {
  date: string      // ISO date (YYYY-MM-DD)
  score: number     // 0-100
  exam_title?: string
}

// ❌ WRONG - Wrong date format
const data = [{ date: '14/03/2024', score: 75 }]

// ✅ CORRECT - ISO date format
const data = [{ date: '2024-03-14', score: 75 }]

// ❌ WRONG - Score out of range
const data = [{ date: '2024-03-14', score: 150 }]

// ✅ CORRECT - Score 0-100
const data = [{ date: '2024-03-14', score: 75 }]
```

**Verification**:
```javascript
// In browser console:
const data = dashboardData?.progress
console.log('First item:', data?.[0])
console.log('Date format:', data?.[0]?.date)
console.log('Score value:', data?.[0]?.score)
console.log('Score in range?', data?.[0]?.score >= 0 && data?.[0]?.score <= 100)
```

---

### Error 7: "TypeScript compilation error"

**Cause**: Type mismatch or missing type definition

**Solution**:
```bash
# Run type checker
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/pages/student/Dashboard.tsx

# Common issues:
# 1. Missing type import
# ❌ WRONG
const data: DashboardData = ...

# ✅ CORRECT
import { DashboardData } from '../types/dashboard'
const data: DashboardData = ...

# 2. Wrong property name
# ❌ WRONG
data.student_name

# ✅ CORRECT
data.student.name

# 3. Missing optional marker
# ❌ WRONG
interface Props {
  data: ProgressPoint[]
}

# ✅ CORRECT
interface Props {
  data?: ProgressPoint[]
}
```

---

### Error 8: "Dashboard shows blank page"

**Cause**: Multiple possible causes - use diagnosis steps

**Solution**:

```javascript
// Step 1: Check if component mounted
console.log('Component mounted')

// Step 2: Check if data loading
console.log('Loading state:', loading)

// Step 3: Check if error occurred
console.log('Error:', error)

// Step 4: Check if data received
console.log('Dashboard data:', dashboardData)

// Step 5: Check if children rendering
console.log('Progress data:', dashboardData?.progress)
console.log('Subject data:', dashboardData?.subject_performance)
```

**Common Causes**:
1. **API not running**: Start backend with `npm run dev`
2. **Wrong API endpoint**: Check endpoint path in dashboardClient.ts
3. **Authentication failed**: Check token in localStorage
4. **Data transformation error**: Check console for errors
5. **Component error**: Check error boundary is working

---

### Error 9: "Network request timeout"

**Cause**: Backend slow or not responding

**Solution**:
```bash
# Check backend is running
curl http://localhost:3000/api/health

# Check database connection
curl http://localhost:3000/api/health/database

# Check database performance
# Look for slow queries in logs

# Increase timeout in API client
const TIMEOUT = 30000 // 30 seconds
apiClient.defaults.timeout = TIMEOUT
```

---

### Error 10: "Data shape mismatch"

**Cause**: API response doesn't match type definition

**Solution**:
```javascript
// Step 1: Log API response
console.log('API Response:', response)

// Step 2: Compare with type definition
// Expected:
// {
//   student: { name, streak_days, license_tier },
//   stats: { total_tests, average_score, best_score, hours_studied },
//   subject_performance: [...],
//   progress: [...],
//   recent_activity: [...],
//   strengths: [...],
//   weaknesses: [...],
//   quote_of_day: "..."
// }

// Step 3: Check for missing fields
const expected = ['student', 'stats', 'subject_performance', 'progress', 'recent_activity', 'strengths', 'weaknesses']
expected.forEach(field => {
  if (!(field in response.data)) {
    console.warn(`Missing field: ${field}`)
  }
})

// Step 4: Update type definition if needed
// Or update API response to match type
```

---

## Performance Issues

### Issue: Dashboard loads slowly

**Diagnosis**:
```javascript
// Measure load time
console.time('Dashboard Load')
// ... component loads ...
console.timeEnd('Dashboard Load')

// Check API response time
// Go to Network tab
// Look at "Time" column for API requests
```

**Solutions**:
```typescript
// 1. Add caching
const cache = new Map()
export const getDashboardData = async () => {
  if (cache.has('dashboard')) {
    return cache.get('dashboard')
  }
  const data = await apiClient.get('/api/student/dashboard')
  cache.set('dashboard', data)
  return data
}

// 2. Lazy load components
const ProgressChart = lazy(() => import('./ProgressChart'))
const SubjectPerformanceChart = lazy(() => import('./SubjectPerformanceChart'))

// 3. Memoize components
const MemoProgressChart = memo(ProgressChart)

// 4. Optimize re-renders
useCallback(() => {
  // Only recreate function if dependencies change
}, [dependency])
```

---

## Browser Compatibility

### Issue: Dashboard doesn't work in older browsers

**Solution**:
```bash
# Check browser support
# Required: ES2020+
# Required: Fetch API
# Required: LocalStorage

# Test in different browsers
# Chrome: Latest
# Firefox: Latest
# Safari: Latest
# Edge: Latest

# Add polyfills if needed
npm install core-js
import 'core-js/stable'
```

---

## Mobile Issues

### Issue: Dashboard not responsive on mobile

**Solution**:
```typescript
// Add mobile-specific styles
const isMobile = window.innerWidth < 768

// Adjust chart height for mobile
const chartHeight = isMobile ? 300 : 400

// Stack components vertically on mobile
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <ProgressChart />
  <SubjectPerformanceChart />
</div>
```

---

## Debugging Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Database connected
- [ ] User authenticated (token in localStorage)
- [ ] API endpoint correct
- [ ] Data structure matches type definition
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Network requests successful (200 status)
- [ ] Components rendering
- [ ] Charts displaying data

---

## Getting Help

### If issue persists:

1. **Check logs**:
   ```bash
   # Backend logs
   tail -f utme-master-backend/logs/app.log
   
   # Browser console
   # F12 → Console tab
   ```

2. **Check documentation**:
   - [DASHBOARD_INTEGRATION_GUIDE.md](./DASHBOARD_INTEGRATION_GUIDE.md)
   - [COMPONENT_INTEGRATION_CHECKLIST.md](./COMPONENT_INTEGRATION_CHECKLIST.md)
   - [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)

3. **Contact team**:
   - Backend issues: Backend team
   - Frontend issues: Frontend team
   - Database issues: DevOps team

---

**Last Updated**: 2026-03-14  
**Status**: Production Ready
