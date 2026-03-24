# 🎓 AI PROMPT: Create Teacher Dashboard - Single File

## CRITICAL INSTRUCTION: CREATE A SINGLE FILE COMPONENT

I need you to create a **complete, production-ready Teacher Dashboard component** as a **SINGLE FILE** (TeacherDashboard.tsx) that follows the new navigation bar implementation and architecture we've established.

---

## 🏗️ ARCHITECTURE CONTEXT

### **Folder Structure:**
```
src/pages/teacher/
└── Dashboard.tsx ← CREATE THIS SINGLE FILE
```

### **New Navigation Bar Implementation:**
Your system now uses a **modern, reorganized navigation structure** with:
- ✅ Role-based routing (/student, /teacher, /admin)
- ✅ ProtectedRoute component checking roles
- ✅ Clean separation of concerns
- ✅ Secure by design

### **Reference Dashboards Already Created:**
- `StudentDashboard.tsx` (20KB, reorganized layout)
- `AdminDashboard.tsx` (planned - will be similar structure)
- These use the same patterns you should follow

---

## 🎨 DESIGN REQUIREMENTS

### **Layout Structure (7-Section Architecture):**

```
┌─────────────────────────────────────────┐
│   1. HEADER                             │
│   Welcome + Date + Greeting             │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│   2. QUICK STATS BAR (4 metrics)        │
│  ├─ Classes Active                      │
│  ├─ Total Students                      │
│  ├─ Exams Created                       │
│  └─ Avg Class Performance                │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│   3. IMMEDIATE ACTIONS (4 buttons)      │
│  ├─ [Create Exam]                       │
│  ├─ [View Classes]                      │
│  ├─ [Student Progress]                  │
│  └─ [Analytics]                         │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│   4. TABBED PERFORMANCE SECTION         │
│   ├─ Overview Tab                       │
│   │  └─ Class performance overview      │
│   ├─ Classes Tab                        │
│   │  └─ List of all classes             │
│   └─ Reports Tab                        │
│      └─ Performance reports             │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│   5. RECENT ACTIVITY SECTION            │
│   ├─ Student submissions                │
│   ├─ Exam completions                   │
│   └─ Performance updates                │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│   6. QUICK ACTIONS GRID (2x2)           │
│   ├─ Class Management                   │
│   ├─ Question Bank                      │
│   ├─ Exam Creation                      │
│   └─ Performance Analytics              │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│   7. UPGRADE/FEATURES CARD (if trial)   │
│   Conditional: Show only if tier=TRIAL  │
└─────────────────────────────────────────┘
```

---

## 📊 DASHBOARD SECTIONS - DETAILED SPECS

### **Section 1: Header**
```typescript
Components:
  • Welcome message: "Welcome back, [Teacher Name]"
  • Current date/time
  • Inspirational quote for teachers
  • Teacher's school/institution name
  
Colors:
  • Gradient background (primary to secondary)
  • White text
  • Uses framer-motion for fade-in animation
  
Size: Full width, ~120px height
```

### **Section 2: Quick Stats Bar**
```typescript
4 StatCards showing:

Card 1 - Classes Active
  Icon: Users icon
  Label: "Active Classes"
  Value: "5"
  Trend: If applicable
  
Card 2 - Total Students
  Icon: UsersIcon
  Label: "Total Students"
  Value: "142"
  
Card 3 - Exams Created
  Icon: FileText icon
  Label: "Exams Created"
  Value: "23"
  
Card 4 - Avg Performance
  Icon: TrendingUp icon
  Label: "Class Avg Score"
  Value: "75%"
  Trend: "+5% this month"

Layout: 4 columns on desktop, 2 on tablet, 1 on mobile
Use motion animations on each card
```

### **Section 3: Immediate Actions**
```typescript
4 Action Buttons in a row:

Button 1: Create New Exam
  Icon: Plus icon
  Color: Primary (blue)
  Action: navigate('/teacher/exam-creation')
  
Button 2: View All Classes
  Icon: Users icon
  Color: Secondary (purple)
  Action: navigate('/teacher/classes')
  
Button 3: Student Progress
  Icon: TrendingUp icon
  Color: Success (green)
  Action: navigate('/teacher/students')
  
Button 4: Analytics
  Icon: BarChart icon
  Color: Info (cyan)
  Action: navigate('/teacher/analytics')

Layout: Full width row with 4 equal-width buttons
Hover effect: Scale up + shadow
Mobile: Stack vertically
```

### **Section 4: Tabbed Performance Section**
```typescript
3 Tabs with Tab Switcher:

TAB 1: OVERVIEW
  Shows:
    • Classes performance summary
    • Top performing class
    • Class needing attention
    • Class statistics cards
    
TAB 2: CLASSES
  Shows:
    • List of all classes (name, students, avg score)
    • Quick action buttons per class (view, edit, delete)
    • Class status badge (active, archived, draft)
    • Search/filter by class name
    
TAB 3: REPORTS
  Shows:
    • Monthly performance trend chart
    • Performance by subject
    • Student progress distribution
    • Export report button

Features:
  • Smooth tab switching animation
  • Active tab highlighted (blue bottom border)
  • Each tab has relevant mock data
```

### **Section 5: Recent Activity**
```typescript
Shows last 5-10 activities:

Activity Item:
  • Timestamp (e.g., "2 hours ago")
  • Activity type icon
  • Description (e.g., "Student John submitted exam")
  • Related info (e.g., "Biology Test - 85%")
  • Status badge (completed, pending, graded)

Colors:
  • Completed: Green
  • Pending: Yellow
  • Failed: Red
  
Layout: Vertical list, each item in a card
No pagination (just show recent 10)
```

### **Section 6: Quick Actions Grid (2x2)**
```typescript
4 Feature Cards in 2x2 grid:

Card 1: Class Management
  Icon: Users icon
  Title: "Manage Classes"
  Description: "Create, edit, or delete classes"
  Button: "Go to Classes"
  
Card 2: Question Bank
  Icon: BookOpen icon
  Title: "Question Bank"
  Description: "Create and manage questions"
  Button: "Browse Questions"
  
Card 3: Exam Creation
  Icon: FileText icon
  Title: "Create Exams"
  Description: "Design new exams from questions"
  Button: "Create Exam"
  
Card 4: Student Analytics
  Icon: BarChart icon
  Title: "Analytics"
  Description: "View detailed performance reports"
  Button: "View Analytics"

Layout:
  • 2x2 grid on desktop
  • 2x1 on tablet
  • 1x1 (stacked) on mobile
  
Each card:
  • Hover effect (scale + shadow)
  • Icon in colored circle
  • Smooth animations
```

### **Section 7: Features/Upgrade Card (Conditional)**
```typescript
Only show if: user.licenseTier === 'TRIAL'

Content:
  Title: "Upgrade Your Plan"
  Description: "Get more classes, students, and advanced features"
  Features list:
    • Unlimited classes
    • Advanced analytics
    • Video integration
    • API access
  Button: "Upgrade Now"
  Pricing: "Starting at ₦50,000/month"

Colors:
  • Gradient background (gold/premium colors)
  • Border: 2px dashed gold
  • Text: Dark with highlights
```

---

## 🎨 STYLING REQUIREMENTS

### **Color Scheme:**
```typescript
Primary:     #2563eb (Blue)
Secondary:   #7c3aed (Purple)
Success:     #10b981 (Green)
Warning:     #f59e0b (Orange)
Danger:      #ef4444 (Red)
Background:  #f9fafb (Light gray)
Text:        #1f2937 (Dark gray)
Border:      #e5e7eb (Border gray)
```

### **Typography:**
```typescript
Headers (h1): Bold, 32px, color: primary
Titles (h2):  Bold, 24px, color: gray-900
Subtitles:    Medium, 18px, color: gray-600
Body:         Regular, 16px, color: gray-700
Labels:       Medium, 14px, color: gray-600
Small:        Regular, 12px, color: gray-500
```

### **Spacing (8px grid):**
```typescript
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px

Sections: 32px gaps
Cards: 24px padding
Buttons: 16px padding
```

### **Animations:**
```typescript
Page load:        Fade in + scale from 0.95 (0.6s)
Section stagger:  Each section staggers 0.1s
Card hover:       Scale 1.02 + shadow increase (0.2s)
Tab switch:       Fade 0.3s
Button click:     Scale 0.98 feedback
Transitions:      Smooth, not jarring
```

---

## 💻 TECHNICAL REQUIREMENTS

### **Imports You'll Need:**
```typescript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, Users, TrendingUp, BarChart3, 
  FileText, BookOpen, AlertCircle, CheckCircle,
  Clock, Zap, Settings, LogOut
} from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/dashboard/StatCard'
import { useAuthStore } from '../../store/auth'
import { showToast } from '../../components/ui/Toast'
```

### **State Management:**
```typescript
const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'reports'>('overview')
const [loading, setLoading] = useState(false)
const [classes, setClasses] = useState([]) // Mock data for now
const [recentActivity, setRecentActivity] = useState([])
const [stats, setStats] = useState({ ... })
```

### **Mock Data (for now - will be replaced with API):**
```typescript
const mockStats = {
  activeClasses: 5,
  totalStudents: 142,
  examsCreated: 23,
  avgClassScore: 75,
  improvementTrend: '+5%'
}

const mockClasses = [
  { id: 1, name: 'SS3A', students: 45, avgScore: 78, status: 'ACTIVE' },
  { id: 2, name: 'SS3B', students: 38, avgScore: 72, status: 'ACTIVE' },
  // ... more classes
]

const mockActivity = [
  { 
    id: 1, 
    timestamp: '2 hours ago',
    type: 'SUBMISSION',
    description: 'John Doe submitted Biology Test',
    score: 85,
    status: 'COMPLETED'
  },
  // ... more activities
]
```

### **Component Structure:**
```typescript
export default function TeacherDashboard() {
  // Hooks
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  // State
  const [activeTab, setActiveTab] = useState('overview')
  
  // Effects
  useEffect(() => {
    loadData()
  }, [])
  
  // Handlers
  const handleNavigate = (path: string) => {
    navigate(path)
  }
  
  // Render helper functions
  const renderOverviewTab = () => { ... }
  const renderClassesTab = () => { ... }
  const renderReportsTab = () => { ... }
  
  // Main return
  return (
    <SafePageWrapper pageName="Teacher Dashboard">
      <Layout>
        {/* Full dashboard layout here */}
      </Layout>
    </SafePageWrapper>
  )
}
```

---

## 🔧 FUNCTIONALITY REQUIREMENTS

### **Navigation Buttons Should:**
```typescript
✅ Use useNavigate() from react-router-dom
✅ Navigate to correct paths:
   - /teacher/exam-creation (Create Exam)
   - /teacher/classes (View Classes)
   - /teacher/students (Student Progress)
   - /teacher/analytics (Analytics)

✅ Show loading state while navigating
✅ Use showToast() for feedback
✅ Handle errors gracefully
```

### **Tabs Should:**
```typescript
✅ Switch smoothly with animation
✅ Highlight active tab (blue bottom border)
✅ Store activeTab in state
✅ Re-render content when tab changes
✅ Each tab has different content
```

### **Cards Should:**
```typescript
✅ Have hover effects (scale + shadow)
✅ Be clickable where appropriate
✅ Show loading skeleton if data is loading
✅ Handle empty states
✅ Responsive on all screen sizes
```

### **Animations Should:**
```typescript
✅ Use framer-motion
✅ Fade in on page load
✅ Stagger children for cascade effect
✅ Smooth transitions (200-600ms)
✅ Scale on hover (1.02x typical)
✅ Not too aggressive (professional feel)
```

---

## 📱 RESPONSIVE DESIGN

### **Desktop (1024px+):**
```
Stats:        4 columns in 1 row
Buttons:      4 columns in 1 row
Grid:         2x2
Tabs:         Side by side
Activity:     Full width, 2 columns of info
```

### **Tablet (768px - 1023px):**
```
Stats:        2 columns in 2 rows
Buttons:      2 columns in 2 rows
Grid:         2x1 or 1x2 depending on space
Tabs:         Stacked but still readable
Activity:     Full width, 1 column
```

### **Mobile (< 768px):**
```
Stats:        1 column (scroll vertically)
Buttons:      1 column (full width, stacked)
Grid:         1 column (full width)
Tabs:         Horizontal scroll if needed
Activity:     Full width, compact view
Text:         Slightly smaller but readable
Padding:      Reduced to 16px
```

---

## 🎯 SPECIFIC FEATURES TO INCLUDE

### **Feature 1: Welcome Section**
```typescript
✅ Greeting with teacher's name
✅ Current date/time
✅ School/institution name
✅ Inspirational quote for educators
✅ Gradient background
✅ Fade-in animation on load
```

### **Feature 2: Stats Cards**
```typescript
✅ 4 metrics (classes, students, exams, avg score)
✅ Icon for each metric
✅ Trend indicator if applicable (↑ or ↓)
✅ Hover animation (scale up)
✅ Color-coded by metric type
```

### **Feature 3: Quick Actions**
```typescript
✅ 4 main action buttons
✅ Descriptive labels
✅ Icons from lucide-react
✅ Different colors for each
✅ Full width on all screens
✅ Loading feedback
```

### **Feature 4: Tabbed Section**
```typescript
✅ 3 tabs: Overview, Classes, Reports
✅ Smooth tab switching
✅ Different content per tab
✅ Active tab indicator
✅ Mock data for each tab
```

### **Feature 5: Recent Activity**
```typescript
✅ Last 5-10 activities
✅ Timestamp for each
✅ Activity type icon
✅ Status badge
✅ Relevant details
✅ Vertically scrollable if many
```

### **Feature 6: Quick Tools Grid**
```typescript
✅ 4 tool cards (2x2)
✅ Icon, title, description
✅ Actionable (navigate or call function)
✅ Hover effects
✅ Responsive grid
```

### **Feature 7: Conditional Upgrade Card**
```typescript
✅ Only show if tier === 'TRIAL'
✅ Premium styling
✅ Feature list
✅ Pricing info
✅ CTA button
```

---

## 🚀 DELIVERABLE CHECKLIST

The single file (Dashboard.tsx) must include:

```
✅ All 7 sections with full content
✅ Header with welcome + date
✅ Stats cards (4 metrics)
✅ Action buttons (4 buttons)
✅ Tabbed section (3 tabs with content)
✅ Recent activity list
✅ Quick tools grid (2x2)
✅ Conditional upgrade card

✅ Framer-motion animations
✅ Responsive design (desktop/tablet/mobile)
✅ Mock data (ready for API integration)
✅ Navigation functionality
✅ Tab switching
✅ Error handling
✅ Loading states
✅ Professional styling

✅ Uses existing components:
   - Layout
   - SafePageWrapper
   - Card
   - Button
   - Badge
   - StatCard
   
✅ Follows naming conventions
✅ Beginner-friendly comments throughout
✅ Ready for production
✅ No console errors
✅ Accessible markup
```

---

## 📋 CODE STYLE & COMMENTS

### **Comment Every Section:**
```typescript
// ==========================================
// SECTION 1: HEADER
// ==========================================
// Displays welcome message, date, and greeting

// ==========================================
// STATE MANAGEMENT
// ==========================================
// activeTab: Which tab is currently shown (overview, classes, reports)
// loading: Is data currently loading?
// classes: Array of teacher's classes
// recentActivity: Array of recent activities
```

### **Explain Complex Logic:**
```typescript
// Check if user has trial tier to show upgrade card
const shouldShowUpgrade = user?.licenseTier === 'TRIAL'

// Format date to readable format (e.g., "Tuesday, March 20, 2024")
const formattedDate = new Date().toLocaleDateString('en-NG', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
```

### **Use Descriptive Variable Names:**
```typescript
✅ const handleCreateExamClick = () => { }
✅ const renderOverviewTabContent = () => { }
✅ const mockTeacherClasses = [ ]

❌ const onClick = () => { }
❌ const render = () => { }
❌ const data = [ ]
```

---

## 🎓 FINAL REQUIREMENTS

Create a **SINGLE FILE** (Dashboard.tsx) that is:

1. **Complete** - All 7 sections with full functionality
2. **Professional** - Production-ready quality
3. **Well-commented** - Easy for beginners to understand
4. **Responsive** - Works on all screen sizes
5. **Animated** - Smooth, professional animations
6. **Modular** - Organized with helper functions
7. **Scalable** - Ready for API integration
8. **Accessible** - Proper semantic HTML
9. **Error-handled** - Graceful error states
10. **Beautiful** - Follows design system exactly

---

## 🚀 GENERATION REQUEST

**CREATE NOW:**

A complete, production-ready TeacherDashboard.tsx file that:

- ✅ Includes all 7 dashboard sections
- ✅ Uses provided color scheme & typography
- ✅ Implements responsive design
- ✅ Adds framer-motion animations
- ✅ Includes mock data
- ✅ Has proper navigation
- ✅ Follows component structure
- ✅ Uses existing UI components
- ✅ Has comprehensive comments
- ✅ Is ready to copy-paste into your project

**START GENERATING THE SINGLE FILE NOW:**

---

## 📁 After Creation:

Save as: `src/pages/teacher/Dashboard.tsx`

Then in your routes, add:
```typescript
<Route path="/teacher/dashboard" element={
  <ProtectedRoute requiredRole={["TEACHER", "ADMIN"]}>
    <TeacherDashboard />
  </ProtectedRoute>
} />
```

**Ready to build the Teacher Dashboard! 🎓🚀**

