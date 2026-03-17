# Question Management System - Quick Reference Guide

## Key Changes Made

### 1. Difficulty Enum Standardization
All difficulty values now use UPPERCASE:
- `EASY` (was "Easy")
- `MEDIUM` (was "Medium")
- `HARD` (was "Hard")

**Files Updated**:
- `src/types/question.ts`
- `src/schemas/question.ts`
- `src/components/questions/QuestionForm.tsx`
- `src/components/questions/QuestionFilters.tsx`

### 2. SubjectAutocomplete Fixed
Changed from hardcoded fetch to using apiClient:
```typescript
// BEFORE
const response = await fetch('http://localhost:3000/api/subjects')

// AFTER
import { getSubjects } from '../../api/questions'
const subjectNames = await getSubjects()
```

---

## Component Architecture

### Question Management Pages
```
/admin/questions
├── QuestionList.tsx (main page)
│   ├── QuestionFilters (search & filters)
│   ├── QuestionTable (list with bulk actions)
│   └── Modal (delete confirmation)
├── /create
│   └── QuestionCreate.tsx
│       └── QuestionForm.tsx
└── /edit/:id
    └── QuestionEdit.tsx
        └── QuestionForm.tsx
```

### QuestionForm Component
```
QuestionForm
├── Basic Information
│   ├── Subject (dropdown with custom input)
│   ├── Topic (dynamic based on subject)
│   ├── Difficulty (EASY, MEDIUM, HARD)
│   ├── Exam Type (JAMB, WAEC, NECO)
│   └── Year (optional)
├── Question Content
│   ├── Question Text (RichTextEditor)
│   └── Image Upload (ImageUpload)
├── Answer Options
│   ├── Option A (RichTextEditor + radio)
│   ├── Option B (RichTextEditor + radio)
│   ├── Option C (RichTextEditor + radio)
│   └── Option D (RichTextEditor + radio)
├── Explanation (RichTextEditor, optional)
└── Form Actions (Cancel, Submit)
```

### QuestionTable Component
```
QuestionTable
├── Header (select all checkbox)
├── Desktop View (full table)
│   ├── Checkbox column
│   ├── ID column
│   ├── Subject column (sortable)
│   ├── Question column
│   ├── Difficulty column (sortable)
│   ├── Year column (sortable)
│   ├── Created column (sortable)
│   └── Actions column (view, edit, delete)
└── Mobile View (card layout)
    ├── Badges (subject, difficulty, exam type)
    ├── Question preview
    ├── Metadata (year, created date)
    └── Actions (view, edit, delete)
```

---

## API Integration

### Available Functions
```typescript
import * as questionAPI from '../api/questions'

// Get questions with filters
const response = await questionAPI.getQuestions({
  page: 1,
  limit: 20,
  subjects: ['Mathematics'],
  difficulty: 'EASY',
  examType: 'JAMB'
})

// CRUD operations
const question = await questionAPI.createQuestion(data)
const updated = await questionAPI.updateQuestion(id, data)
await questionAPI.deleteQuestion(id)
await questionAPI.bulkDeleteQuestions([id1, id2])

// Subjects and topics
const subjects = await questionAPI.getSubjects()
const topics = await questionAPI.getTopicsBySubject('Mathematics')

// Image upload
const result = await questionAPI.uploadQuestionImage(file)
// Returns: { url: 'https://...' }

// Statistics
const stats = await questionAPI.getQuestionStats()
// Returns: { total, bySubject, byDifficulty, byExamType }
```

---

## Store Usage

### Zustand Store
```typescript
import { useQuestionStore, useQuestionSelectors } from '../store/question'

// Get store state and actions
const {
  questions,
  total,
  page,
  limit,
  totalPages,
  loading,
  error,
  filters,
  selectedQuestions,
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  deleteSelectedQuestions,
  setFilters,
  setPage,
  setLimit,
  toggleQuestionSelection,
  selectAllQuestions,
  clearSelection,
  clearError
} = useQuestionSelectors()

// Usage examples
await fetchQuestions() // Load questions
setFilters({ subjects: ['Math'], difficulty: 'EASY' })
setPage(2) // Go to page 2
toggleQuestionSelection(questionId) // Toggle selection
await deleteSelectedQuestions() // Delete all selected
```

---

## Form Validation

### Zod Schema
```typescript
import { questionSchema } from '../schemas/question'

// Validates:
// - subject: required, non-empty string
// - topic: optional string
// - questionText: required, min 10 chars
// - optionA, B, C, D: required, non-empty
// - correctAnswer: required, must be A|B|C|D
// - explanation: optional
// - difficulty: required, must be EASY|MEDIUM|HARD
// - year: optional, 2000-2030
// - examType: required, must be JAMB|WAEC|NECO
// - imageUrl: optional, must be valid URL
// - All options must be unique
```

---

## Common Tasks

### Create a Question
```typescript
const handleCreateQuestion = async (data: CreateQuestionData) => {
  try {
    const question = await createQuestion(data)
    showToast.success('Question created')
    navigate('/admin/questions')
  } catch (error) {
    showToast.error(error.message)
  }
}
```

### Edit a Question
```typescript
const handleEditQuestion = async (id: string, data: UpdateQuestionData) => {
  try {
    const question = await updateQuestion(id, data)
    showToast.success('Question updated')
  } catch (error) {
    showToast.error(error.message)
  }
}
```

### Delete a Question
```typescript
const handleDeleteQuestion = async (id: string) => {
  try {
    await deleteQuestion(id)
    showToast.success('Question deleted')
  } catch (error) {
    showToast.error(error.message)
  }
}
```

### Filter Questions
```typescript
const handleFilterChange = (newFilters: Partial<QuestionFilters>) => {
  setFilters(newFilters)
  // Automatically fetches questions with new filters
}

// Example filters
setFilters({
  subjects: ['Mathematics', 'Physics'],
  difficulty: 'HARD',
  examType: 'JAMB',
  yearFrom: 2020,
  yearTo: 2023
})
```

### Upload Image
```typescript
const handleImageUpload = async (file: File) => {
  try {
    const result = await uploadQuestionImage(file)
    setImageUrl(result.url)
    showToast.success('Image uploaded')
  } catch (error) {
    showToast.error(error.message)
  }
}
```

---

## Difficulty Enum Reference

### Valid Values
```typescript
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

// Display mapping
const difficultyDisplay = {
  'EASY': '🟢 Easy',
  'MEDIUM': '🟡 Medium',
  'HARD': '🔴 Hard'
}
```

### DifficultyBadge Component
```typescript
import DifficultyBadge from '../components/questions/DifficultyBadge'

// Usage
<DifficultyBadge difficulty="EASY" size="sm" />
<DifficultyBadge difficulty="MEDIUM" size="md" />
<DifficultyBadge difficulty="HARD" size="lg" />
```

---

## Nigerian Exam Systems

### Supported Exam Types
- **JAMB**: Joint Admissions and Matriculation Board
- **WAEC**: West African Examinations Council
- **NECO**: National Examination Council

### Supported Subjects
1. English Language
2. Mathematics
3. Physics
4. Chemistry
5. Biology
6. Economics
7. Government
8. Commerce
9. Literature in English
10. CRK/IRK (Christian/Islamic Religious Knowledge)

### Year Range
- Minimum: 2000
- Maximum: 2030
- Covers all past papers and future exams

---

## Error Handling

### API Errors
```typescript
try {
  await createQuestion(data)
} catch (error: any) {
  // error.message contains user-friendly message
  // error.response?.data contains backend error details
  showToast.error(error.message || 'Failed to create question')
}
```

### Validation Errors
```typescript
// Zod validation errors are caught by react-hook-form
// Displayed inline on form fields
// Example: "Difficulty must be EASY, MEDIUM, or HARD"
```

### Image Upload Errors
```typescript
// File size > 2MB
// File type not image/*
// Network error
// Server error
// All show user-friendly toast messages
```

---

## Performance Tips

### Debounced Search
Search is debounced by 300ms to reduce API calls:
```typescript
const handleSearchChange = (value: string) => {
  // Automatically debounced in QuestionFilters
  setFilters({ search: value })
}
```

### Pagination
Always use pagination to avoid loading too many questions:
```typescript
const { page, limit, totalPages } = useQuestionSelectors()

// Load next page
setPage(page + 1)

// Change page size
setLimit(50) // Load 50 per page
```

### Memoization
Components use React.memo and useMemo for optimization:
- QuestionTable rows are memoized
- Selectors are memoized in store
- Filters are debounced

---

## Testing Checklist

- [ ] Create question with all fields
- [ ] Create question with minimal fields
- [ ] Edit question and verify changes
- [ ] Delete single question with confirmation
- [ ] Select multiple questions and bulk delete
- [ ] Filter by subject
- [ ] Filter by difficulty (EASY, MEDIUM, HARD)
- [ ] Filter by exam type
- [ ] Filter by year range
- [ ] Search by question text
- [ ] Sort by each column
- [ ] Upload image and verify preview
- [ ] Upload invalid file (should show error)
- [ ] Upload file > 2MB (should show error)
- [ ] Pagination works correctly
- [ ] Mobile responsive layout
- [ ] Error messages display properly
- [ ] Success toasts display properly
- [ ] Loading states show correctly
- [ ] Empty state displays when no questions

---

## Troubleshooting

### Questions not loading
1. Check network tab for API errors
2. Verify backend is running
3. Check browser console for errors
4. Verify API URL in environment variables

### Difficulty enum errors
1. Ensure using UPPERCASE: EASY, MEDIUM, HARD
2. Check database has correct values
3. Verify schema validation

### Image upload fails
1. Check file size < 2MB
2. Verify file is image type
3. Check backend upload endpoint
4. Verify storage configuration

### Filters not working
1. Check subjects are loaded
2. Verify topic loading for selected subject
3. Check API response structure
4. Verify filter values are correct type

### Selection not persisting
1. Selection clears on new fetch (by design)
2. Use store to persist if needed
3. Check selectedQuestions array in store

---

## Resources

- **Zod Validation**: https://zod.dev
- **React Hook Form**: https://react-hook-form.com
- **React Quill**: https://quilljs.com
- **Zustand**: https://github.com/pmndrs/zustand
- **Framer Motion**: https://www.framer.com/motion

---

## Support

For issues or questions:
1. Check this quick reference
2. Review QUESTION_MANAGEMENT_FIXES_COMPLETE.md
3. Check component JSDoc comments
4. Review API function documentation
5. Check browser console for errors
