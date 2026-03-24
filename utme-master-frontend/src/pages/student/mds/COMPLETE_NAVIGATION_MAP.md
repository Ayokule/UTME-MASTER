# UTME MASTER - COMPLETE NAVIGATION MAP & USER JOURNEYS 🗺️

## 📱 User Interface Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                     LOGIN PAGE                                  │
│              (Login.tsx / LoginSimple.tsx)                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│              STUDENT MAIN DASHBOARD ⭐                           │
│          (Dashboard-Reorganized.tsx)                             │
│                                                                  │
│  [Welcome Hero] → [Quick Stats] → [Action Buttons] ↓           │
│  [Performance Tabs] → [Dashboards] → [Study Tools]             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬─────────────────┐
        ↓              ↓              ↓                 ↓
   ┌─────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐
   │  Exams  │ │   Practice   │ │ Study Tools  │ │Analytics │
   │  Button │ │   Tests Btn  │ │   Button     │ │  Tabs    │
   └────┬────┘ └──────┬───────┘ └──────────────┘ └──────────┘
        │             │
        ↓             ↓
   ┌──────────────────────────┐   ┌──────────────────────────┐
   │ OFFICIAL EXAMS DASHBOARD │   │ PRACTICE TESTS DASHBOARD │
   │ (OfficialExamsDashboard) │   │ (PracticeTestsDashboard) │
   │                          │   │                          │
   │ ┌────────────────────┐   │   │ ┌────────────────────┐   │
   │ │ 📊 Analytics Tab   │   │   │ │ 📊 Analytics Tab   │   │
   │ │ - Subject charts   │   │   │ │ - Subject charts   │   │
   │ │ - Progress graph   │   │   │ │ - Streak tracker   │   │
   │ │ - Strengths/Weak   │   │   │ │ - Performance Summ │   │
   │ └────────────────────┘   │   │ └────────────────────┘   │
   │                          │   │                          │
   │ ┌────────────────────┐   │   │ ┌────────────────────┐   │
   │ │ 📝 Available Exams │   │   │ │ 📝 Available Tests │   │
   │ │ [JAMB 2024 Mock 1] │   │   │ │ [Math - Algebra]   │   │
   │ │ [Start Exam] [Res] │   │   │ │ [Start] [Results]  │   │
   │ │ [JAMB 2024 Mock 2] │   │   │ │ [English - Vocab]  │   │
   │ │ [Start Exam]       │   │   │ │ [Start] [Results]  │   │
   │ │ [WAEC 2024 Mock]   │   │   │ │ [Physics - Mech]   │   │
   │ │ [Start Exam]       │   │   │ │ [Start] [Results]  │   │
   │ └────────┬───────────┘   │   │ └────────┬───────────┘   │
   │          │                │   │         │                │
   │          ↓                │   │         ↓                │
   │    ┌──────────────┐       │   │    ┌──────────────┐     │
   │    │ START EXAM   │       │   │    │ START TEST   │     │
   │    │ navigate to  │       │   │    │ navigate to  │     │
   │    │ /exam/{id}   │       │   │    │ /test/{id}   │     │
   │    └──────┬───────┘       │   │    └──────┬───────┘     │
   │           │               │   │           │              │
   │           ↓               │   │           ↓              │
   │    ExamInterface.tsx      │   │   TestInterface.tsx      │
   │    (exam taking) ❓❓❓      │   │   (test taking) ❓❓     │
   │           │               │   │           │              │
   │           ↓ [Submit]       │   │           ↓ [Submit]    │
   │    ┌──────────────┐       │   │    ┌──────────────┐     │
   │    │  Results.tsx │       │   │    │ TestResults  │     │
   │    │ Score %, etc │       │   │    │ Score %, etc │     │
   │    │ [Review]     │       │   │    │ [Review]     │     │
   │    │ [Retake]     │       │   │    │ [Retake]     │     │
   │    └──────┬───────┘       │   │    └──────┬───────┘     │
   │           │               │   │           │              │
   │           ↓               │   │           ↓              │
   │  ExamReview.tsx       │   │   TestReview.tsx       │
   │  (Q&A breakdown)      │   │   (Q&A breakdown)      │
   │                          │   │                          │
   │ ┌────────────────────┐   │   │ ┌────────────────────┐   │
   │ │ 📋 History Tab     │   │   │ │ 📋 History Tab     │   │
   │ │ [Attempt 1] 82%    │   │   │ │ [Attempt 1] 88%    │   │
   │ │ [View Results]     │   │   │ │ [View Results]     │   │
   │ │ [Attempt 2] 78%    │   │   │ │ [Attempt 2] 82%    │   │
   │ │ [View Results]     │   │   │ │ [View Results]     │   │
   │ └────────────────────┘   │   │ └────────────────────┘   │
   │           │              │   │           │               │
   │           ↓              │   │           ↓               │
   │    Results.tsx       │   │     TestResults.tsx    │
   │                          │   │                          │
   └──────────────────────────┘   └──────────────────────────┘
        ↑                              ↑
        │ [Back]                       │ [Back]
        └──────────────┬───────────────┘
                       ↑
        Returns to Main Dashboard
```

---

## 🎯 Complete User Journeys

### **JOURNEY 1: Student Takes Official JAMB Mock Exam**

```
1. Student logs in
   └─ LoginSimple.tsx / Login.tsx
      └─ setAuth(token, user)

2. Redirected to Dashboard
   └─ Dashboard-Reorganized.tsx
      └─ Sees welcome + stats + tabs + action buttons

3. Clicks "Official Exams" Card (OR via links)
   └─ navigate('/student/exam-dashboard')
      └─ OfficialExamsDashboard-Enhanced.tsx loads

4. Lands on Official Exams Dashboard
   └─ Sees:
      • Analytics tab (charts, performance)
      • Available Exams tab (list of exams)
      • History tab (past attempts)

5. Clicks "Start Exam" on JAMB 2024 Mock 1
   └─ handleStartExam('jamb-2024-01')
      └─ navigate('/student/exam-start/jamb-2024-01')
         └─ ExamStart.tsx
            • Shows exam details
            • Confirms student ready
            • Sets duration timer

6. Student clicks "Start Exam Now"
   └─ navigate('/student/exam/jamb-2024-01')
      └─ ExamInterface.tsx
         • Question 1/120
         • 180 min timer
         • Navigation buttons
         • Save answer functionality

7. Student answers all 120 questions
   └─ Progress: 120/120

8. Student clicks "Submit Exam"
   └─ POST /api/exams/jamb-2024-01/submit
      └─ Backend calculates score
         └─ Returns: { score: 82, percentage: 68, ... }

9. Redirected to Results Page
   └─ Results-Reorganized.tsx
      • Score: 82/120 (68%)
      • Overall performance
      • Subject breakdown
      • 3 tabs: Overview | Review | Analytics

10. Student clicks "Review Answers"
    └─ ExamReview.tsx
       • All 120 questions displayed
       • Show correct/incorrect status
       • Explanations visible
       • Subject filtering available

11. Student returns to Dashboard
    └─ Back button or menu
       └─ Dashboard-Reorganized.tsx
          └─ Stats updated! Shows latest score

12. Student sees exam in "History"
    └─ Official Exams Dashboard
       └─ History tab
          └─ Shows "JAMB 2024 Mock 1 - Attempt #2: 82%"
             └─ [View Results] button available

JOURNEY COMPLETE ✅
```

---

### **JOURNEY 2: Student Practices Mathematics Topics**

```
1. Student on Main Dashboard
   └─ Dashboard-Reorganized.tsx

2. Clicks "Practice Tests" Card
   └─ navigate('/student/test-dashboard')
      └─ PracticeTestsDashboard-Enhanced.tsx

3. Lands on Practice Tests Dashboard
   └─ Sees:
      • 5-day streak! 🔥
      • Analytics (subject performance, progress)
      • Available Tests (6 tests listed)
      • History (past attempts)

4. Searches for "Algebra"
   └─ searchQuery = "Algebra"
      └─ Filters to:
         • Mathematics - Algebra Basics (25Q, 45min)

5. Clicks "Start" on Algebra Basics test
   └─ handleStartTest('test-math-001')
      └─ navigate('/student/test/test-math-001')
         └─ TestInterface.tsx
            • Question 1/25
            • 45 min timer
            • Save & continue

6. Student completes 25 questions
   └─ Clicks "Submit Test"
      └─ POST /api/tests/test-math-001/submit
         └─ Score: 22/25 (88%)

7. Sees Test Results
   └─ TestResults.tsx
      • 22/25 correct (88%)
      • Time: 38 minutes
      • Subject: Mathematics
      • Mastery progress updated

8. Returns to Dashboard
   └─ PracticeTestsDashboard-Enhanced.tsx
      └─ History tab now shows:
         "Math - Algebra Basics: 88% (Attempt #4)"

9. Clicks on another test "Trigonometry Advanced"
   └─ Repeats process

10. After several tests, student sees:
    └─ Dashboard analytics updated
       • Mathematics: 79% average
       • 5 topics completed
       • Progress trending up

JOURNEY COMPLETE ✅
```

---

### **JOURNEY 3: Student Reviews Past Exam & Improves**

```
1. Student on Official Exams Dashboard
   └─ OfficialExamsDashboard-Enhanced.tsx

2. Clicks on "History" tab
   └─ Sees past exam attempts:
      • Attempt 1: JAMB 2024 Mock 1 - 78%
      • Attempt 2: JAMB 2024 Mock 1 - 82% ⬆️
      • Attempt 3: JAMB 2024 Mock 2 - 75%

3. Clicks "View Results" on Attempt 1 (78%)
   └─ Results-Reorganized.tsx
      • Overall: 78/120 (65%)
      • Subject breakdown visible
      • Saw weakness in Physics

4. Goes to "Review Answers" tab
   └─ ExamReview.tsx
      • Scrolls through all 120 questions
      • Sees Physics questions - most incorrect
      • Reads explanations

5. Decides to practice Physics
   └─ navigate('/student/test-dashboard')
      └─ PracticeTestsDashboard-Enhanced.tsx
         └─ Filters by subject: Physics
            • Physics - Mechanics (28Q, 55min)
            • Physics - Electricity (TBD)

6. Takes "Physics - Mechanics" test
   └─ Scores 72%
      └─ Better than before! 📈

7. Takes exam again (JAMB Mock 1 - Retake)
   └─ Official Exams Dashboard
      └─ "Retake" button
         └─ Starting new attempt
            └─ ExamInterface.tsx (fresh session)

8. Submits retake
   └─ Score: 85% (improved from 82%)

9. Checks analytics
   └─ Dashboard Analytics tab
      • Physics: improved from 68% to 75% 🎯
      • Overall improvement: +5%

JOURNEY COMPLETE - IMPROVED! ✅
```

---

## 🔗 Complete Route Map

```
/login
  ↓ [Student Login]
/student/dashboard
  ├─ [Official Exams]
  │  └─ /student/exam-dashboard
  │     ├─ [Start Exam]
  │     │  └─ /student/exam-start/{examId}
  │     │     └─ [Confirm Start]
  │     │        └─ /student/exam/{examId}
  │     │           └─ [Submit]
  │     │              └─ /student/results/{studentExamId}
  │     │                 ├─ [Review]
  │     │                 │  └─ /student/exam/{examId}/review
  │     │                 └─ [Retake]
  │     │                    └─ /student/exam-start/{examId}
  │     │
  │     └─ [History]
  │        └─ [View Results]
  │           └─ /student/results/{studentExamId}
  │
  ├─ [Practice Tests]
  │  └─ /student/test-dashboard
  │     ├─ [Filter by Subject/Difficulty]
  │     │  └─ [Start Test]
  │     │     └─ /student/test/{testId}
  │     │        └─ [Submit]
  │     │           └─ /student/test-results/{studentTestId}
  │     │
  │     └─ [History]
  │        └─ [View Results]
  │           └─ /student/test-results/{studentTestId}
  │
  ├─ [Tabs: Overview | Progress | Goals]
  │  └─ Shows analytics from all exams/tests
  │
  └─ [Study Tools]
     └─ Flashcards, Notes, Timer, etc.
```

---

## 📊 Data Flow

### **Starting an Exam**

```
OfficialExamsDashboard.tsx
  │
  ├─ handleStartExam(examId)
  │  └─ navigate(`/student/exam-start/${examId}`)
  │
  └─ ExamStart.tsx
     │
     ├─ GET /api/exams/{examId}
     │  └─ Fetch exam details (title, subjects, duration, etc.)
     │
     ├─ Display exam info to student
     │
     └─ Student clicks "Start Now"
        │
        └─ POST /api/exams/{examId}/start
           └─ Response: { studentExamId: 'uuid', token: '...' }
              │
              └─ navigate(`/student/exam/${studentExamId}`)
                 │
                 └─ ExamInterface.tsx
                    │
                    ├─ GET /api/exams/{studentExamId}/questions
                    │  └─ Load questions, answers, etc.
                    │
                    ├─ User answers questions
                    │
                    ├─ POST /api/exams/{studentExamId}/answer
                    │  └─ Save each answer
                    │
                    └─ User clicks "Submit"
                       │
                       └─ POST /api/exams/{studentExamId}/submit
                          └─ Backend calculates score
                             │
                             └─ Response: { score, percentage, ... }
                                │
                                └─ Results.tsx
```

---

## 🎨 Component Interaction Matrix

| Action | Component | Event | Next Component | Route |
|--------|-----------|-------|-----------------|-------|
| View Main | Login | Success | Dashboard | /student/dashboard |
| Click Exams | Dashboard | onClick | OffExamDash | /student/exam-dashboard |
| Click Tests | Dashboard | onClick | PractTestDash | /student/test-dashboard |
| Start Exam | OffExamDash | onClick | ExamStart | /student/exam-start/{id} |
| Start Test | PractTestDash | onClick | TestInterface | /student/test/{id} |
| Submit Exam | ExamInterface | onClick | Results | /student/results/{id} |
| Review | Results | onClick | ExamReview | /student/exam/{id}/review |
| Retake | Results | onClick | ExamStart | /student/exam-start/{id} |
| Back | Any | onClick | Previous | (history) |

---

## 📱 Responsive Behavior

### **Desktop (1024px+)**
```
┌─────────────────────────────────────────┐
│ Official Exams Dashboard                │
├─────────────────────────────────────────┤
│ [📊 Analytics] [📝 Exams] [📋 History] │
├─────────────────────────────────────────┤
│ Stats: [4 cards in 1 row]                │
│                                         │
│ Content Area:                           │
│ ┌──────────────────┬──────────────────┐ │
│ │ Exam 1           │ Exam 2           │ │
│ │ [Start] [Review] │ [Start] [Review] │ │
│ └──────────────────┴──────────────────┘ │
│ ┌──────────────────┬──────────────────┐ │
│ │ Exam 3           │ Exam 4           │ │
│ │ [Start]          │ [Start]          │ │
│ └──────────────────┴──────────────────┘ │
└─────────────────────────────────────────┘
```

### **Tablet (768px - 1023px)**
```
┌─────────────────────────┐
│ Official Exams          │
├─────────────────────────┤
│ [📊] [📝] [📋]         │
├─────────────────────────┤
│ Stats: [2 cards/row]     │
│                         │
│ Content:                │
│ ┌──────────────────┐   │
│ │ Exam 1           │   │
│ │ [Start] [Review] │   │
│ └──────────────────┘   │
│ ┌──────────────────┐   │
│ │ Exam 2           │   │
│ │ [Start] [Review] │   │
│ └──────────────────┘   │
└─────────────────────────┘
```

### **Mobile (< 768px)**
```
┌───────────────┐
│ Official Exams│
├───────────────┤
│ [📊][📝][📋] │
├───────────────┤
│ Stats: scroll │
├───────────────┤
│ ┌───────────┐ │
│ │ Exam 1    │ │
│ │ [Start]   │ │
│ │ [Review]  │ │
│ └───────────┘ │
│ ┌───────────┐ │
│ │ Exam 2    │ │
│ │ [Start]   │ │
│ └───────────┘ │
└───────────────┘
(Single column, full width)
```

---

## 🎯 Key Navigation Points

| From | To | Trigger | Method |
|------|----|---------| -------|
| Dashboard | Official Exams | Link/Button | navigate() |
| Dashboard | Practice Tests | Link/Button | navigate() |
| Dashboard | Study Tools | Button | showToast() |
| Exam Dashboard | Start Exam | Button | navigate() + API call |
| Exam Dashboard | View History | Tab | State change |
| Start Page | Exam Interface | Confirm | navigate() + API call |
| Exam Interface | Results | Submit | API call + navigate() |
| Results | Review | Tab | State change |
| Results | Exam Dashboard | Back | navigate() |
| Test Dashboard | Start Test | Button | navigate() + API call |
| Practice Dashboard | History | Tab | State change |

---

## ✅ Validation Checklist

- [ ] All routes configured in App.tsx
- [ ] All navigation functions working
- [ ] Back button functionality on all pages
- [ ] Search/filter working on dashboards
- [ ] Tabs switching smoothly
- [ ] Mock data displaying correctly
- [ ] API calls ready (when integrated)
- [ ] Mobile layout responsive
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Toast notifications working
- [ ] Analytics charts rendering
- [ ] Progress bars animating

