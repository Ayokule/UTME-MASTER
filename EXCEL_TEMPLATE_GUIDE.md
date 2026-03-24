# 📊 EXCEL TEMPLATE GUIDE - FLEXIBLE ANSWER OPTIONS

## How to Format Your Questions in Excel

Your import service supports **4 different answer option formats**. This guide shows how to structure them in Excel.

---

## 🎯 Format 1: Traditional 4 Options (ABCD)

This is the standard format used by most questions. Include columns: **A through D only**.

### Excel Columns:
```
| subjectCode | topicName | questionText | optionA | optionB | optionC | optionD | correctAnswer | difficulty | examType | year | explanation |
|-------------|-----------|--------------|---------|---------|---------|---------|---------------|-----------|----------|------|-------------|
| MTH | Algebra | If x² - 5x + 6 = 0... | 5 | 6 | 11 | -5 | A | MEDIUM | JAMB | 2023 | By Vieta's formulas... |
```

### When to Use:
- ✅ Most English questions
- ✅ Most Biology questions
- ✅ Some Mathematics questions
- ✅ Some Physics questions

---

## 🎯 Format 2: 6 Options (ABCDEF)

Extended format with 6 answer choices. Include columns: **A through F**.

### Excel Columns:
```
| subjectCode | topicName | questionText | optionA | optionB | optionC | optionD | optionE | optionF | correctAnswer | difficulty | examType | year | explanation |
|-------------|-----------|--------------|---------|---------|---------|---------|---------|---------|---------------|-----------|----------|------|-------------|
| CHM | Alkanes | Which is a structural isomer... | Propane | 2-methylpropane | Pentane | 1-methylcyclopropane | Ethane | Benzene | B | HARD | WAEC | 2024 | Structural isomers... |
```

### When to Use:
- ✅ Chemistry questions (complex options)
- ✅ Some Mathematics questions (multiple formulas)
- ✅ Advanced Physics questions

---

## 🎯 Format 3: 7 Options (ABCDEFG)

Extended format with 7 answer choices. Include columns: **A through G**.

### Excel Columns:
```
| subjectCode | topicName | questionText | optionA | optionB | optionC | optionD | optionE | optionF | optionG | correctAnswer | difficulty | examType | year | explanation |
|-------------|-----------|--------------|---------|---------|---------|---------|---------|---------|---------|---------------|-----------|----------|------|-------------|
| PHY | ... | ... | Option1 | Option2 | Option3 | Option4 | Option5 | Option6 | Option7 | F | MEDIUM | JAMB | 2024 | ... |
```

### When to Use:
- ✅ Complex Physics/Chemistry questions
- ✅ Questions with many similar options
- ✅ Advanced difficulty questions

---

## 🎯 Format 4: 8 Options (ABCDEFGH)

Maximum extended format with 8 answer choices. Include columns: **A through H**.

### Excel Columns:
```
| subjectCode | topicName | questionText | optionA | optionB | optionC | optionD | optionE | optionF | optionG | optionH | correctAnswer | difficulty | examType | year | explanation |
|-------------|-----------|--------------|---------|---------|---------|---------|---------|---------|---------|---------|---------------|-----------|----------|------|-------------|
| PHY | Mechanics | A 2 kg object experiences... | 2 m/s² | 5 m/s² | 10 m/s² | 20 m/s² | 0.2 m/s² | 0.5 m/s² | 50 m/s² | 100 m/s² | B | EASY | JAMB | 2024 | Using F = ma... |
```

### When to Use:
- ✅ Physics questions with many answer choices
- ✅ Chemistry molecular questions
- ✅ Multiple-choice elimination style

---

## 📋 COMPLETE COLUMN REFERENCE

### Required Columns (always include):
1. **subjectCode** - MTH, ENG, PHY, CHM, BIO, ECO, GOV, COM, LIT, CRK
2. **topicName** - Specific topic (e.g., "Quadratic Equations", "Photosynthesis")
3. **questionText** - Full question text
4. **optionA** - Answer option A (always required)
5. **optionB** - Answer option B (always required)
6. **optionC** - Answer option C (always required)
7. **optionD** - Answer option D (always required)
8. **correctAnswer** - Which is correct: A, B, C, D, E, F, G, or H
9. **difficulty** - EASY, MEDIUM, or HARD
10. **examType** - JAMB, WAEC, or NECO

### Conditional Columns (include based on option count):
- **optionE** - Only if 6+ options
- **optionF** - Only if 6+ options
- **optionG** - Only if 7+ options
- **optionH** - Only if 8 options

### Optional Columns (can be empty):
- **explanation** - Why the answer is correct (recommended)
- **year** - When question appeared (2023, 2024, etc.)
- **points** - Points for question (default: 1)
- **timeLimitSeconds** - Time allowed (default: 60)

---

## ✅ VALIDATION RULES

Each cell must follow these rules:

### subjectCode
- ✅ Must be one of: MTH, ENG, PHY, CHM, BIO, ECO, GOV, COM, LIT, CRK
- ✅ Case insensitive (MTH = mth)
- ❌ Cannot be empty

### topicName
- ✅ Specific topic (e.g., "Quadratic Equations", not "Math")
- ✅ Optional but recommended
- ✅ Max 100 characters

### questionText
- ✅ Minimum 10 characters
- ✅ Maximum 1000 characters
- ✅ Can include numbers, symbols, mathematical notation
- ✅ Should be grammatically correct
- ❌ Cannot be empty

### Option A, B, C, D, E, F, G, H
- ✅ Minimum 1 character
- ✅ Maximum 200 characters
- ✅ Must all be different (no duplicates)
- ✅ Can be numbers, text, or mixed
- ❌ Cannot be empty (if column exists)

### correctAnswer
- ✅ Must be: A, B, C, D, E, F, G, or H
- ✅ Case insensitive (a = A)
- ✅ Must match an available option
- ❌ Cannot be empty
- ❌ If question has only 4 options (A-D), correct answer must be A, B, C, or D

### difficulty
- ✅ Must be: EASY, MEDIUM, or HARD
- ✅ Case insensitive
- ❌ Cannot be empty

### examType
- ✅ Must be: JAMB, WAEC, or NECO
- ✅ Case insensitive
- ❌ Cannot be empty

### explanation
- ✅ Optional (can be empty)
- ✅ Maximum 500 characters
- ✅ Should explain why answer is correct

### year
- ✅ Must be between 1990 and 2024
- ✅ Optional (can be empty)
- ✅ Should be realistic

---

## 📊 EXAMPLE: Complete 40-Question Excel Structure

### Row 1 (Headers):
```
subjectCode | topicName | questionText | optionA | optionB | optionC | optionD | optionE | optionF | optionG | optionH | correctAnswer | difficulty | examType | year | explanation
```

### Row 2 (4-option question):
```
MTH | Algebra | If x² - 5x + 6 = 0, find the sum of the roots. | 5 | 6 | 11 | -5 |  |  |  |  | A | MEDIUM | JAMB | 2023 | By Vieta's formulas, sum = -b/a = 5
```

### Row 3 (6-option question):
```
CHM | Alkanes | Which is a structural isomer of butane? | Propane | 2-methylpropane | Pentane | 1-methylcyclopropane | Ethane | Benzene |  |  | B | HARD | WAEC | 2024 | 2-methylpropane has same formula C₄H₁₀
```

### Row 4 (8-option question):
```
PHY | Mechanics | A 2 kg object experiences 10 N force. Acceleration? | 2 m/s² | 5 m/s² | 10 m/s² | 20 m/s² | 0.2 m/s² | 0.5 m/s² | 50 m/s² | 100 m/s² | B | EASY | JAMB | 2024 | F = ma, so a = F/m = 10/2 = 5 m/s²
```

---

## 🎓 Distribution Recommendation for Your 40 Questions

```
Mathematics (8 questions)
├─ 4 questions with 4 options (ABCD)
├─ 4 questions with 6 options (ABCDEF)
└─ Difficulty: 2 EASY, 4 MEDIUM, 2 HARD

English Language (7 questions)
├─ 7 questions with 4 options (ABCD)
└─ Difficulty: 2 EASY, 4 MEDIUM, 1 HARD

Physics (6 questions)
├─ 3 questions with 4 options (ABCD)
├─ 3 questions with 8 options (ABCDEFGH)
└─ Difficulty: 1 EASY, 3 MEDIUM, 2 HARD

Chemistry (6 questions)
├─ 3 questions with 4 options (ABCD)
├─ 3 questions with 6 options (ABCDEF)
└─ Difficulty: 1 EASY, 3 MEDIUM, 2 HARD

Biology (5 questions)
├─ 5 questions with 4 options (ABCD)
└─ Difficulty: 2 EASY, 2 MEDIUM, 1 HARD

Economics (4 questions)
├─ 4 questions with 4 options (ABCD)
└─ Difficulty: 1 EASY, 2 MEDIUM, 1 HARD

Government (2 questions)
├─ 2 questions with 4 options (ABCD)
└─ Difficulty: 1 EASY, 1 MEDIUM

Literature in English (2 questions)
├─ 2 questions with 4 options (ABCD)
└─ Difficulty: 1 EASY, 1 MEDIUM
```

---

## 💾 How to Save Your Excel File

1. **Create in Excel/Google Sheets**
   - Copy headers to Row 1
   - Paste/enter questions starting Row 2
   - Leave empty cells where options don't apply (E, F, G, H for 4-option questions)

2. **Save as Excel Format**
   - File → Save As → Format: Excel (.xlsx)
   - Filename: `questions-batch-1.xlsx` (or similar)

3. **Upload to UTME Master**
   - Go to Admin → Question Management → Bulk Import
   - Select your Excel file
   - System will validate and import automatically
   - Get detailed report showing success/errors

---

## 🚀 Ready to Import?

1. ✅ Get your 40 questions generated (use the AI prompt)
2. ✅ Format them in Excel following this guide
3. ✅ Validate all columns and data
4. ✅ Save as .xlsx file
5. ✅ Upload to UTME Master
6. ✅ Review import report
7. ✅ Your questions are live!

Good luck! 🎓

