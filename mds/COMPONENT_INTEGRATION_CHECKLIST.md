# Component Integration Checklist

**Purpose**: Verify each dashboard component receives correct data and handles edge cases  
**Status**: Production Ready  
**Last Updated**: 2026-03-14

---

## Overview

This checklist documents all 8 child components, their required props, expected data structures, and null-safety requirements.

---

## Component 1: ProgressChart

### Location
`src/components/dashboard/ProgressChart.tsx`

### Purpose
Displays score progression over time using a line chart

### Required Props
```typescript
interface Props {
  data: ProgressPoint[]  // Array of progress data points
}

// ProgressPoint structure:
{
  date: string          // ISO date (YYYY-MM-DD)
  score: number         // Score 0-100
  exam_title?: string   // Optional exam name
}
```

### Data Source
```typescript
// From Dashboard.tsx
const { progress = [] } = dashboardData

// Pass to component
<ProgressChart data={progress} />
```

### Null-Safety Checklist
- [x] Handles empty array (shows "No progress data yet")
- [x] Handles missing exam_title (optional field)
- [x] Validates date format
- [x] Validates score range (0-100)
- [x] Calculates average score safely
- [x] Determines trend with minimum 2 data points

### Error Scenarios
```typescript
// ✅ SAFE: Empty array
<ProgressChart data={[]} />

// ✅ SAFE: Missing optional field
<ProgressChart data={[
  { date: '2024-03-01', score: 75 }
]} />

// ❌ UNSAFE: Invalid date
<ProgressChart data={[
  { date: 'invalid', score: 75 }
]} />

// ❌ UNSAFE: Score out of range
<ProgressChart data={[
  { date: '2024-03-01', score: 150 }
]} />
```

### Implementation Notes
- Uses Recharts LineChart component
- Formats dates as "Mar 01"
- Shows trend indicator (improving/declining/stable)
- Displays average score in header
- Custom tooltip shows exam title on hover

---

## Component 2: SubjectPerformanceChart

### Location
`src/components/dashboard/SubjectPerformanceChart.tsx`

### Purpose
Displays average scores across different JAMB subjects

### Required Props
```typescript
interface Props {
  data: SubjectPerformance[]  // Array of subject scores
}

// SubjectPerformance structure:
{
  subject: string    // Subject name (e.g., "Mathematics")
  score: number      // Average score 0-100
  tests: number      // Number of tests taken
  color?: string     // Optional hex color
}
```

### Data Source
```typescript
// From Dashboard.tsx
const { subject_performance = [] } = dashboardData

// Pass to component
<SubjectPerformanceChart data={subject_performance} />
```

### Supported Subjects
```typescript
const SUBJECT_COLORS = {
  'Mathematics': '#ef4444',
  'English': '#3b82f6',
  'Physics': '#8b5cf6',
  'Chemistry': '#10b981',
  'Biology': '#f59e0b',
  'Literature': '#ec4899',
  'Government': '#6366f1',
  'Economics': '#14b8a6',
  'Geography': '#f97316',
  'History': '#84cc16'
}
```

### Null-Safety Checklist
- [x] Handles empty array (shows "No performance data yet")
- [x] Validates score range (0-100)
- [x] Validates tests count (positive number)
- [x] Handles unknown subjects (uses default color)
- [x] Sorts subjects alphabetically
- [x] Handles special characters in subject names

### Error Scenarios
```typescript
// ✅ SAFE: Empty array
<SubjectPerformanceChart data={[]} />

// ✅ SAFE: Unknown subject (uses default color)
<SubjectPerformanceChart data={[
  { subject: 'Unknown Subject', score: 75, tests: 5 }
]} />

// ✅ SAFE: Missing color (uses default)
<SubjectPerformanceChart data={[
  { subject: 'Mathematics', score: 75, tests: 5 }
]} />

// ❌ UNSAFE: Score out of range
<SubjectPerformanceChart data={[
  { subject: 'Mathematics', score: 150, tests: 5 }
]} />

// ❌ UNSAFE: Negative tests
<SubjectPerformanceChart data={[
  { subject: 'Mathematics', score: 75, tests: -1 }
]} />
```

### Implementation Notes
- Uses Recharts BarChart component
- Color-coded by subject
- Rotates x-axis labels for readability
- Shows tests count in tooltip
- Responsive to container width

---

## Component 3: RecentActivity

### Location
`src/components/dashboard/RecentActivity.tsx`

### Purpose
Displays list of recently completed exams

### Required Props
```typescript
interface Props {
  activities: RecentActivity[]  // Array of recent activities
}

// RecentActivity structure:
{
  id: string                    // Unique identifier
  exam_title: string            // Exam name
  score: number                 // Raw score
  percentage: number            // Score as percentage (0-100)
  date: string                  // ISO timestamp
  subjects: string[]            // Array of subject names
  status: 'COMPLETED' | 'IN_PROGRESS' | 'ABANDONED'
}
```

### Data Source
```typescript
// From Dashboard.tsx
const { recent_activity = [] } = dashboardData

// Pass to component
<RecentActivity activities={recent_activity} />
```

### Null-Safety Checklist
- [x] Handles empty array (shows "No recent activity")
- [x] Validates percentage range (0-100)
- [x] Handles missing subjects array
- [x] Formats dates correctly
- [x] Handles long exam titles (truncates with ellipsis)
- [x] Validates status enum values
- [x] Handles special characters in titles

### Error Scenarios
```typescript
// ✅ SAFE: Empty array
<RecentActivity activities={[]} />

// ✅ SAFE: Missing subjects
<RecentActivity activities={[
  {
    id: '1',
    exam_title: 'Math Test',
    score: 75,
    percentage: 75,
    date: '2024-03-14T10:30:00Z',
    subjects: [],
    status: 'COMPLETED'
  }
]} />

// ❌ UNSAFE: Invalid percentage
<RecentActivity activities={[
  {
    id: '1',
    exam_title: 'Math Test',
    score: 75,
    percentage: 150,  // Invalid!
    date: '2024-03-14T10:30:00Z',
    subjects: ['Mathematics'],
    status: 'COMPLETED'
  }
]} />

// ❌ UNSAFE: Invalid status
<RecentActivity activities={[
  {
    id: '1',
    exam_title: 'Math Test',
    score: 75,
    percentage: 75,
    date: '2024-03-14T10:30:00Z',
    subjects: ['Mathematics'],
    status: 'INVALID_STATUS'  // Invalid!
  }
]} />
```

### Implementation Notes
- Shows most recent activities first
- Color-codes by status (green=completed, yellow=in-progress, red=abandoned)
- Displays time ago (e.g., "2 hours ago")
- Shows subject badges
- Clickable to view exam review

---

## Component 4: StatCard

### Location
`src/components/dashboard/StatCard.tsx`

### Purpose
Displays individual statistics (tests taken, average score, etc.)

### Required Props
```typescript
interface Props {
  icon: React.ReactNode      // Icon component
  label: string              // Label text
  value: string | number     // The statistic value
  change?: string            // Optional change indicator
  trend?: 'up' | 'down' | 'neutral'  // Trend direction
}
```

### Data Source
```typescript
// From Dashboard.tsx
const { stats = { total_tests: 0, average_score: 0, best_score: 0, hours_studied: 0 } } = dashboardData

// Pass to component
<StatCard
  icon={<BookOpen className="w-6 h-6" />}
  label="Tests Taken"
  value={stats.total_tests}
  change="+5"
  trend="up"
/>
```

### Null-Safety Checklist
- [x] Handles undefined icon (shows placeholder)
- [x] Handles empty label (shows default)
- [x] Handles zero value (displays "0")
- [x] Handles missing change (optional)
- [x] Handles missing trend (defaults to 'neutral')
- [x] Validates trend enum values
- [x] Handles very large numbers (formats with commas)

### Error Scenarios
```typescript
// ✅ SAFE: Minimal props
<StatCard
  icon={<Icon />}
  label="Tests"
  value={0}
/>

// ✅ SAFE: All props
<StatCard
  icon={<Icon />}
  label="Average Score"
  value={75.5}
  change="+2.3%"
  trend="up"
/>

// ✅ SAFE: Large number
<StatCard
  icon={<Icon />}
  label="Total Questions"
  value={10000}
/>

// ❌ UNSAFE: Invalid trend
<StatCard
  icon={<Icon />}
  label="Tests"
  value={5}
  trend="invalid"  // Invalid!
/>
```

### Implementation Notes
- Displays icon, label, and value
- Shows trend indicator with color coding
- Animates on mount
- Responsive to container width
- Formats numbers with thousand separators

---

## Component 5: StrengthsWeaknesses

### Location
`src/components/dashboard/StrengthsWeaknesses.tsx`

### Purpose
Displays subjects where student excels and needs improvement

### Required Props
```typescript
interface Props {
  strengths: string[]        // Array of strong subjects
  weaknesses: string[]       // Array of weak subjects
  onSubjectClick?: (subject: string) => void  // Click handler
}
```

### Data Source
```typescript
// From Dashboard.tsx
const { strengths = [], weaknesses = [] } = dashboardData

// Pass to component
<StrengthsWeaknesses
  strengths={strengths}
  weaknesses={weaknesses}
  onSubjectClick={handleSubjectClick}
/>
```

### Null-Safety Checklist
- [x] Handles empty strengths array
- [x] Handles empty weaknesses array
- [x] Handles both empty (shows encouragement message)
- [x] Validates subject names (non-empty strings)
- [x] Handles duplicate subjects
- [x] Handles special characters in names
- [x] Handles missing click handler (optional)

### Error Scenarios
```typescript
// ✅ SAFE: Empty arrays
<StrengthsWeaknesses
  strengths={[]}
  weaknesses={[]}
/>

// ✅ SAFE: Only strengths
<StrengthsWeaknesses
  strengths={['Mathematics', 'Physics']}
  weaknesses={[]}
/>

// ✅ SAFE: Only weaknesses
<StrengthsWeaknesses
  strengths={[]}
  weaknesses={['Chemistry', 'Biology']}
/>

// ✅ SAFE: With click handler
<StrengthsWeaknesses
  strengths={['Mathematics']}
  weaknesses={['Chemistry']}
  onSubjectClick={(subject) => console.log(subject)}
/>

// ❌ UNSAFE: Duplicate subjects
<StrengthsWeaknesses
  strengths={['Mathematics', 'Mathematics']}
  weaknesses={['Chemistry']}
/>
```

### Implementation Notes
- Shows top 3 strengths and weaknesses
- Color-coded (green for strengths, red for weaknesses)
- Shows encouragement message if no data
- Clickable subjects for detailed analytics
- Animated cards on mount

---

## Component 6: PremiumUpgrade

### Location
`src/components/dashboard/PremiumUpgrade.tsx`

### Purpose
Prompts FREE users to upgrade for premium features

### Required Props
```typescript
interface Props {
  onUpgrade?: () => void  // Callback when upgrade clicked
}
```

### Data Source
```typescript
// From Dashboard.tsx
const { student = { license_tier: 'TRIAL' } } = dashboardData

// Show only for FREE users
{student.license_tier === 'FREE' && (
  <PremiumUpgrade onUpgrade={handleUpgrade} />
)}
```

### Null-Safety Checklist
- [x] Handles missing onUpgrade callback
- [x] Validates license tier before showing
- [x] Handles missing student data
- [x] Gracefully handles upgrade errors

### Error Scenarios
```typescript
// ✅ SAFE: No callback
<PremiumUpgrade />

// ✅ SAFE: With callback
<PremiumUpgrade onUpgrade={() => navigate('/upgrade')} />

// ✅ SAFE: Conditional rendering
{student?.license_tier === 'FREE' && <PremiumUpgrade />}
```

### Implementation Notes
- Shows only for FREE users
- Highlights premium features
- Displays pricing information
- Upgrade button redirects to payment page
- Animated entrance

---

## Component 7: RealTimeAnalytics

### Location
`src/components/dashboard/RealTimeAnalytics.tsx`

### Purpose
Displays real-time performance metrics and insights

### Required Props
```typescript
interface Props {
  data?: any  // Optional analytics data
}
```

### Data Source
```typescript
// From Dashboard.tsx
<RealTimeAnalytics data={dashboardData} />
```

### Null-Safety Checklist
- [x] Handles missing data prop
- [x] Handles undefined analytics
- [x] Shows placeholder while loading
- [x] Gracefully handles errors

### Implementation Notes
- Optional component
- Can be hidden for FREE users
- Updates in real-time if WebSocket connected
- Shows performance trends

---

## Component 8: Additional Components

### StatCard Variants
- **Tests Taken**: `stats.total_tests`
- **Average Score**: `stats.average_score`
- **Best Score**: `stats.best_score`
- **Study Hours**: `stats.hours_studied`

---

## Integration Checklist Template

Use this template when integrating each component:

```typescript
// ✅ Step 1: Import component and types
import ProgressChart from '../components/dashboard/ProgressChart'
import { ProgressPoint } from '../types/dashboard'

// ✅ Step 2: Destructure data with defaults
const { progress = [] } = dashboardData || {}

// ✅ Step 3: Validate data
if (!Array.isArray(progress)) {
  console.warn('Invalid progress data')
  return null
}

// ✅ Step 4: Pass to component
<ProgressChart data={progress} />

// ✅ Step 5: Add error boundary
<ErrorBoundary fallback={<ErrorState />}>
  <ProgressChart data={progress} />
</ErrorBoundary>
```

---

## Error Boundary Setup

Wrap all components with error boundary:

```typescript
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({error}: {error: Error}) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <p className="text-red-800">Component error: {error.message}</p>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ProgressChart data={progress} />
      <SubjectPerformanceChart data={subject_performance} />
      <RecentActivity activities={recent_activity} />
    </ErrorBoundary>
  )
}
```

---

## Testing Checklist

For each component, verify:

- [ ] Renders with valid data
- [ ] Renders with empty array
- [ ] Renders with missing optional fields
- [ ] Handles null/undefined gracefully
- [ ] Shows error message on invalid data
- [ ] Responsive on mobile
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Performance acceptable (< 100ms render)

---

## Common Issues & Solutions

### Issue: "Cannot read property of undefined"
**Cause**: Component receiving undefined instead of array  
**Solution**: Use default value in destructuring
```typescript
const { progress = [] } = dashboardData || {}
```

### Issue: Chart not rendering
**Cause**: Empty or invalid data array  
**Solution**: Add null check before rendering
```typescript
{progress.length > 0 ? (
  <ProgressChart data={progress} />
) : (
  <EmptyState />
)}
```

### Issue: Wrong data type
**Cause**: API response shape mismatch  
**Solution**: Verify API response matches type definition
```typescript
// Check API response
console.log(dashboardData)
// Should match DashboardData interface
```

---

**Last Updated**: 2026-03-14  
**Status**: Production Ready  
**Next**: See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
