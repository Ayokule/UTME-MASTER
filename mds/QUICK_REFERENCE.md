# Dashboard Integration - Quick Reference Card

**Print this page for quick access during development**

---

## 🎯 Key Interfaces

```typescript
// Main dashboard data
interface DashboardData {
  student: { name, streak_days, license_tier }
  stats: { total_tests, average_score, best_score, hours_studied }
  subject_performance: SubjectPerformance[]
  progress: ProgressPoint[]
  recent_activity: RecentActivity[]
  strengths: string[]
  weaknesses: string[]
  quote_of_day?: string
}

// Subject performance
interface SubjectPerformance {
  subject: string
  score: number (0-100)
  tests: number
  color?: string
}

// Progress point
interface ProgressPoint {
  date: string (ISO: YYYY-MM-DD)
  score: number (0-100)
  exam_title?: string
}

// Recent activity
interface RecentActivity {
  id: string
  exam_title: string
  score: number
  percentage: number (0-100)
  date: string (ISO timestamp)
  subjects: string[]
  status: 'COMPLETED' | 'IN_PROGRESS' | 'ABANDONED'
}
```

---

## 🔌 API Endpoints

```bash
# Main dashboard
GET /api/student/dashboard
Authorization: Bearer <token>

# Subject analytics (TRIAL/PREMIUM only)
GET /api/student/analytics/subject/:subject
Authorization: Bearer <token>

# Predicted JAMB score (TRIAL/PREMIUM only)
GET /api/student/analytics/predicted-score
Authorization: Bearer <token>

# Study recommendations (all users)
GET /api/student/recommendations
Authorization: Bearer <token>
```

---

## 📦 Component Props

```typescript
// ProgressChart
<ProgressChart data={ProgressPoint[]} />

// SubjectPerformanceChart
<SubjectPerformanceChart data={SubjectPerformance[]} />

// RecentActivity
<RecentActivity activities={RecentActivity[]} />

// StatCard
<StatCard
  icon={ReactNode}
  label={string}
  value={string | number}
  change={string}
  trend={'up' | 'down' | 'neutral'}
/>

// StrengthsWeaknesses
<StrengthsWeaknesses
  strengths={string[]}
  weaknesses={string[]}
  onSubjectClick={(subject: string) => void}
/>

// PremiumUpgrade
<PremiumUpgrade onUpgrade={() => void} />
```

---

## ✅ Safe Data Destructuring

```typescript
// ✅ CORRECT - With defaults
const {
  student = { name: 'Student', streak_days: 0, license_tier: 'TRIAL' },
  stats = { total_tests: 0, average_score: 0, best_score: 0, hours_studied: 0 },
  subject_performance = [],
  progress = [],
  recent_activity = [],
  strengths = [],
  weaknesses = [],
  quote_of_day = ''
} = dashboardData || {}

// ✅ CORRECT - Conditional rendering
{dashboardData && (
  <ProgressChart data={dashboardData.progress} />
)}

// ❌ WRONG - No null check
<ProgressChart data={dashboardData.progress} />
```

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Cannot read property of undefined" | No null check | Add default value in destructuring |
| "Cannot read property 'map' of undefined" | Array is undefined | Use `= []` default |
| "API returned 401" | Missing/invalid token | Check localStorage for token |
| "API returned 403" | User lacks permission | Check license_tier |
| "API returned 404" | Wrong endpoint | Verify endpoint path |
| "Chart not rendering" | Empty/invalid data | Check data structure |
| "TypeScript error" | Type mismatch | Check interface names |

---

## 🔍 Debugging Commands

```bash
# Check backend health
curl http://localhost:3000/api/health

# Get auth token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@test.com","password":"Student@123"}'

# Test dashboard endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/student/dashboard

# Check TypeScript errors
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/pages/student/Dashboard.tsx
```

---

## 📋 Integration Checklist

- [ ] Type definitions created
- [ ] API client created
- [ ] Dashboard component updated
- [ ] All child components updated
- [ ] Null checks added
- [ ] Error handling added
- [ ] TypeScript compiles
- [ ] Tests pass
- [ ] Dashboard loads
- [ ] Charts render
- [ ] Error states work

---

## 🎓 Nigerian Context

| Term | Meaning | Relevance |
|------|---------|-----------|
| JAMB | Joint Admissions & Matriculation Board | Main exam, score 0-400 |
| WAEC | West African Examinations Council | Alternative exam |
| NECO | National Examination Council | Alternative exam |
| Subjects | Math, English, Physics, Chemistry, Biology, etc. | Dashboard tracks by subject |
| License Tier | FREE, TRIAL, PREMIUM, ENTERPRISE | Controls feature access |

---

## 🚀 Quick Start

1. **Create types**: `src/types/dashboard.ts`
2. **Create API client**: `src/api/dashboardClient.ts`
3. **Update Dashboard**: `src/pages/student/Dashboard.tsx`
4. **Update components**: Add null checks to all 8 children
5. **Test**: Run `npx tsc --noEmit`
6. **Verify**: Open dashboard in browser

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| DASHBOARD_INTEGRATION_GUIDE.md | Main guide |
| COMPONENT_INTEGRATION_CHECKLIST.md | Component details |
| SETUP_INSTRUCTIONS.md | Setup steps |
| TROUBLESHOOTING_GUIDE.md | Issue solutions |
| FILES_TO_CREATE_MODIFY.md | File list |
| QUICK_REFERENCE.md | This file |

---

## 🔐 Security Checklist

- [ ] JWT token in Authorization header
- [ ] Token stored securely (localStorage)
- [ ] HTTPS in production
- [ ] CORS configured
- [ ] Sensitive data not logged
- [ ] Error messages don't leak details
- [ ] License tier checked on backend
- [ ] Premium features blocked for FREE users

---

## 📊 Performance Targets

- Dashboard load: < 2 seconds
- API response: < 500ms
- Chart render: < 100ms
- Memory: < 50MB
- Bundle: < 500KB

---

## 🆘 Need Help?

1. **Check**: TROUBLESHOOTING_GUIDE.md
2. **Search**: Error message in documentation
3. **Debug**: Use debugging commands above
4. **Contact**: Team lead or relevant team

---

## 📞 Key Contacts

- **Frontend Issues**: Frontend team
- **Backend Issues**: Backend team
- **Database Issues**: DevOps team
- **General Questions**: Tech lead

---

**Print Date**: 2026-03-14  
**Status**: Production Ready  
**Version**: 1.0
