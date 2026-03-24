# 🎓 AI PROMPT: Generate 40 Real JAMB/WAEC Questions for UTME Master

## CRITICAL INSTRUCTION: YOU MUST FOLLOW THIS TEMPLATE EXACTLY

I need you to generate **40 real, authentic Nigerian exam questions** that follow the UTME Master import system. These questions will be used in a real exam preparation platform for Nigerian secondary school students.

---

## ⚠️ IMPORTANT: FLEXIBLE ANSWER OPTIONS SYSTEM

**My system now supports creating questions with MULTIPLE answer formats:**

### **Option Type 1: Traditional 4 Options (A, B, C, D)** ✅
```
Subject: Mathematics
Option Type: ABCD
Options: A, B, C, D
Example:
  A) 15
  B) 20
  C) 25
  D) 30
Correct Answer: C
```

### **Option Type 2: Extended Options (A, B, C, D, E, F)** ✅
```
Subject: Chemistry
Option Type: ABCDEF
Options: A, B, C, D, E, F
Example:
  A) H₂O
  B) H₂O₂
  C) H₂O₃
  D) H₂O₄
  E) H₂O₅
  F) H₂O₆
Correct Answer: C
```

### **Option Type 3: Extended Options (A, B, C, D, E, F, G)** ✅
```
Subject: English
Option Type: ABCDEFG
Options: A, B, C, D, E, F, G
Example:
  A) Option 1
  B) Option 2
  C) Option 3
  D) Option 4
  E) Option 5
  F) Option 6
  G) Option 7
Correct Answer: E
```

### **Option Type 4: Extended Options (A, B, C, D, E, F, G, H)** ✅
```
Subject: Physics
Option Type: ABCDEFGH
Options: A, B, C, D, E, F, G, H
Example:
  A) Option 1
  B) Option 2
  C) Option 3
  D) Option 4
  E) Option 5
  F) Option 6
  G) Option 7
  H) Option 8
Correct Answer: G
```

---

## 📋 REQUIRED DATA STRUCTURE

For EACH question, provide the following information in this EXACT format:

```
QUESTION [NUMBER]
Subject: [SUBJECT NAME]
Subject Code: [CODE - MTH, ENG, PHY, CHM, BIO, ECO, GOV, COM, LIT, CRK]
Topic: [SPECIFIC TOPIC]
Question Text: [THE ACTUAL QUESTION]
Option A: [TEXT OF OPTION A]
Option B: [TEXT OF OPTION B]
Option C: [TEXT OF OPTION C]
Option D: [TEXT OF OPTION D]
[ONLY IF 6+ OPTIONS]
Option E: [TEXT OF OPTION E]
[ONLY IF 7+ OPTIONS]
Option F: [TEXT OF OPTION F]
[ONLY IF 7+ OPTIONS]
Option G: [TEXT OF OPTION G]
[ONLY IF 8 OPTIONS]
Option H: [TEXT OF OPTION H]
Correct Answer: [A, B, C, D, E, F, G, or H]
Explanation: [WHY THIS IS CORRECT AND WHY OTHERS ARE WRONG]
Difficulty: [EASY, MEDIUM, or HARD]
Exam Type: [JAMB, WAEC, or NECO]
Year: [2024, 2023, 2022, etc.]
```

---

## 🎯 QUESTION DISTRIBUTION (40 TOTAL)

Generate questions distributed across these subjects:

```
📊 DISTRIBUTION:
1. Mathematics (8 questions) - Mix of ABCD (4) and ABCDEF (4)
2. English Language (7 questions) - All ABCD format
3. Physics (6 questions) - Mix of ABCD (3) and ABCDEFGH (3)
4. Chemistry (6 questions) - Mix of ABCD (3) and ABCDEF (3)
5. Biology (5 questions) - All ABCD format
6. Economics (4 questions) - All ABCD format
7. Government/Civics (2 questions) - All ABCD format
8. Literature in English (2 questions) - All ABCD format

TOTAL: 40 questions
```

---

## 🔧 IMPORT SERVICE COMPATIBILITY

**These questions MUST be compatible with my import service that supports:**

✅ **Column Names** (exactly as shown):
- `subjectCode` - MTH, ENG, PHY, CHM, BIO, ECO, GOV, COM, LIT, CRK
- `topicName` - Specific topic within subject
- `questionText` - Full question text
- `optionA` through `optionH` - Answer options (only include if question has that option)
- `correctAnswer` - A, B, C, D, E, F, G, or H
- `explanation` - Why this answer is correct
- `difficulty` - EASY, MEDIUM, HARD
- `examType` - JAMB, WAEC, or NECO
- `year` - 2024, 2023, 2022, etc.

✅ **Validation Rules**:
- Question text: 10-1000 characters
- Each option: 1-200 characters
- Correct answer: Must match an available option letter
- No duplicate options (all options must be different)
- Explanations: Max 500 characters
- Year: Between 1990 and 2024

---

## 🌟 QUALITY REQUIREMENTS

For EACH question, ensure:

1. **Authenticity** ✅
   - Real questions from past Nigerian exams
   - OR realistic questions that match exam difficulty
   - NOT made-up or overly simplified

2. **Clarity** ✅
   - Question is clear and unambiguous
   - No grammatical errors
   - Proper English/technical terminology

3. **Correctness** ✅
   - Correct answer is definitely correct
   - Other options are plausible distractors
   - Explanation clearly states why answer is correct

4. **Difficulty Distribution** ✅
   - EASY (30%): ~12 questions - straightforward recall/application
   - MEDIUM (50%): ~20 questions - requires more thinking
   - HARD (20%): ~8 questions - complex/multi-step reasoning

5. **Variety** ✅
   - Don't repeat question patterns
   - Mix of different question types
   - Realistic distractors (common misconceptions)

---

## 📊 SAMPLE QUESTIONS (AS REFERENCE)

### **Sample 1: Mathematics (4 options)**
```
Subject: Mathematics
Subject Code: MTH
Topic: Algebra - Quadratic Equations
Question Text: If x² - 5x + 6 = 0, find the sum of the roots.
Option A: 5
Option B: 6
Option C: 11
Option D: -5
Correct Answer: A
Explanation: By Vieta's formulas, for ax² + bx + c = 0, the sum of roots = -b/a. Here, sum = -(-5)/1 = 5. Students might choose B (the product) or C (sum of coefficients) as common errors.
Difficulty: MEDIUM
Exam Type: JAMB
Year: 2023
```

### **Sample 2: Chemistry (6 options)**
```
Subject: Chemistry
Subject Code: CHM
Topic: Organic Chemistry - Alkanes
Question Text: Which of the following is a structural isomer of butane (C₄H₁₀)?
Option A: Propane
Option B: 2-methylpropane
Option C: Pentane
Option D: 1-methylcyclopropane
Option E: Ethane
Option F: Benzene
Correct Answer: B
Explanation: Structural isomers have the same molecular formula but different structural arrangements. 2-methylpropane (isobutane) is C₄H₁₀ like butane. A (C₃H₈), C (C₅H₁₂), and E (C₂H₆) have different formulas. D and F are also wrong.
Difficulty: HARD
Exam Type: WAEC
Year: 2024
```

### **Sample 3: English Language (4 options)**
```
Subject: English Language
Subject Code: ENG
Topic: Grammar - Tenses
Question Text: "By the time you arrive, I _____ the dishes."
Option A: will finish
Option B: will have finished
Option C: am finishing
Option D: have finished
Correct Answer: B
Explanation: The future perfect tense ("will have finished") is used for an action that will be completed before another future action. Students often choose A (simple future) instead.
Difficulty: MEDIUM
Exam Type: JAMB
Year: 2023
```

### **Sample 4: Physics (8 options - Extended)**
```
Subject: Physics
Subject Code: PHY
Topic: Mechanics - Newton's Laws
Question Text: A 2 kg object experiences a net force of 10 N. What is its acceleration?
Option A: 2 m/s²
Option B: 5 m/s²
Option C: 10 m/s²
Option D: 20 m/s²
Option E: 0.2 m/s²
Option F: 0.5 m/s²
Option G: 50 m/s²
Option H: 100 m/s²
Correct Answer: B
Explanation: Using F = ma, we have a = F/m = 10/2 = 5 m/s². Common errors: A (mass), C (just force), D (F×m), E (m/F), F (sqrt(F/m)).
Difficulty: EASY
Exam Type: JAMB
Year: 2024
```

---

## 📝 FINAL FORMAT CHECKLIST

Before generating each question, verify:

- [ ] Subject is one of: MTH, ENG, PHY, CHM, BIO, ECO, GOV, COM, LIT, CRK
- [ ] Topic is specific (not just "Mathematics")
- [ ] Question text is 10-1000 characters
- [ ] Each option is 1-200 characters
- [ ] Options are unique (no duplicates)
- [ ] Correct answer matches an option letter
- [ ] Explanation is clear and 1-500 characters
- [ ] Difficulty is EASY, MEDIUM, or HARD
- [ ] Exam type is JAMB, WAEC, or NECO
- [ ] Year is realistic (1990-2024)
- [ ] Question would actually appear in Nigerian exams
- [ ] No grammatical errors
- [ ] Correct answer is definitely correct

---

## 🚀 GENERATION REQUEST

**Generate 40 questions NOW following:**
1. The distribution above (8 Math, 7 English, 6 Physics, 6 Chemistry, 5 Biology, 4 Economics, 2 Gov, 2 Literature)
2. The data structure exactly as specified
3. Mix of 4, 6, and 8 option formats as indicated
4. All validation rules must pass
5. All quality requirements must be met
6. Format each question so I can copy-paste into Excel directly

**IMPORTANT:** Make the questions realistic, authentic, and at the level of actual JAMB/WAEC exams. These will be used by real Nigerian students preparing for their exams.

**START GENERATING NOW:**

---

**Note:** After you provide the 40 questions, I will format them into an Excel file and upload them to UTME Master using the import service.

