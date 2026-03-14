// Simple exam API that works directly with the database
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
const prisma = new PrismaClient()
const PORT = 3001

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Simple Exam API is running' })
})

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body
    
    // Check if user exists
    const existingUser = await prisma.$queryRaw`
      SELECT id FROM users WHERE email = ${email}
    `
    
    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const userId = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO users (id, email, password, first_name, last_name, role, license_tier, is_active, created_at, updated_at)
      VALUES (${userId}, ${email}, ${hashedPassword}, ${firstName}, ${lastName}, 'STUDENT', 'TRIAL', true, NOW(), NOW())
    `
    
    // Generate token
    const token = jwt.sign({ userId, email, role: 'STUDENT' }, JWT_SECRET, { expiresIn: '24h' })
    
    return res.json({
      success: true,
      user: { id: userId, email, firstName, lastName, role: 'STUDENT' },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: 'Registration failed' })
  }
})

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Find user
    const users = await prisma.$queryRaw`
      SELECT id, email, password, first_name, last_name, role, is_active 
      FROM users WHERE email = ${email}
    ` as any[]
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const user = users[0]
    
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account deactivated' })
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' })
    
    return res.json({
      success: true,
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role 
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Login failed' })
  }
})

// Get subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await prisma.$queryRaw`
      SELECT id, name, code, description FROM subjects WHERE is_active = true ORDER BY name
    `
    res.json({ success: true, data: subjects })
  } catch (error) {
    console.error('Get subjects error:', error)
    res.status(500).json({ error: 'Failed to get subjects' })
  }
})

// Get questions for a subject
app.get('/api/subjects/:subjectId/questions', async (req, res) => {
  try {
    const { subjectId } = req.params
    const limit = parseInt(req.query.limit as string) || 20
    
    const questions = await prisma.$queryRaw`
      SELECT 
        id, question_text, option_a, option_b, option_c, option_d, 
        correct_answer, explanation, difficulty, year, exam_type
      FROM questions 
      WHERE subject_id = ${subjectId} AND is_active = true 
      ORDER BY RANDOM() 
      LIMIT ${limit}
    `
    
    res.json({ success: true, data: questions })
  } catch (error) {
    console.error('Get questions error:', error)
    res.status(500).json({ error: 'Failed to get questions' })
  }
})

// Create practice exam
app.post('/api/exams/practice', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const { subjectId, questionCount = 20 } = req.body
    const userId = req.user.id
    
    // Get subject name
    const subjects = await prisma.$queryRaw`
      SELECT name FROM subjects WHERE id = ${subjectId}
    ` as any[]
    
    if (subjects.length === 0) {
      return res.status(404).json({ error: 'Subject not found' })
    }
    
    const subjectName = subjects[0].name
    
    // Get random questions
    const questions = await prisma.$queryRaw`
      SELECT 
        id, question_text, option_a, option_b, option_c, option_d, 
        correct_answer, explanation, difficulty
      FROM questions 
      WHERE subject_id = ${subjectId} AND is_active = true 
      ORDER BY RANDOM() 
      LIMIT ${questionCount}
    ` as any[]
    
    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions found for this subject' })
    }
    
    // Create exam
    const examId = crypto.randomUUID()
    const title = `Practice Exam - ${subjectName}`
    
    await prisma.$executeRaw`
      INSERT INTO exams (
        id, title, description, duration, total_marks, pass_marks, 
        total_questions, subject_ids, is_active, is_published, 
        allow_retake, created_by, created_at, updated_at
      ) VALUES (
        ${examId}, ${title}, 'Practice exam', 60, ${questions.length}, 
        ${Math.ceil(questions.length * 0.4)}, ${questions.length}, 
        ${JSON.stringify([subjectId])}, true, true, true, ${userId}, NOW(), NOW()
      )
    `
    
    // Create student exam
    const studentExamId = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO student_exams (
        id, exam_id, student_id, status, started_at, created_at, updated_at
      ) VALUES (
        ${studentExamId}, ${examId}, ${userId}, 'IN_PROGRESS', NOW(), NOW(), NOW()
      )
    `
    
    // Format questions for frontend (remove correct answers)
    const examQuestions = questions.map((q: any, index: number) => ({
      id: q.id,
      questionNumber: index + 1,
      questionText: q.questionText,
      options: [
        { label: 'A', text: q.option_a },
        { label: 'B', text: q.option_b },
        { label: 'C', text: q.option_c },
        { label: 'D', text: q.option_d }
      ],
      difficulty: q.difficulty
    }))
    
    return res.json({
      success: true,
      data: {
        examId,
        studentExamId,
        title,
        duration: 60,
        totalQuestions: questions.length,
        questions: examQuestions
      }
    })
  } catch (error) {
    console.error('Practice exam creation error:', error)
    return res.status(500).json({ error: 'Failed to create practice exam' })
  }
})

// Create practice exam (alternative endpoint for frontend compatibility)
app.post('/api/exams/practice/start', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const { subjectId, questionCount = 20 } = req.body
    const userId = req.user.id
    
    // Get subject name
    const subjects = await prisma.$queryRaw`
      SELECT name FROM subjects WHERE id = ${subjectId}
    ` as any[]
    
    if (subjects.length === 0) {
      return res.status(404).json({ error: 'Subject not found' })
    }
    
    const subjectName = subjects[0].name
    
    // Get random questions
    const questions = await prisma.$queryRaw`
      SELECT 
        id, question_text, option_a, option_b, option_c, option_d, 
        correct_answer, explanation, difficulty
      FROM questions 
      WHERE subject_id = ${subjectId} AND is_active = true 
      ORDER BY RANDOM() 
      LIMIT ${questionCount}
    ` as any[]
    
    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions found for this subject' })
    }
    
    // Create exam
    const examId = crypto.randomUUID()
    const title = `Practice Exam - ${subjectName}`
    
    await prisma.$executeRaw`
      INSERT INTO exams (
        id, title, description, duration, total_marks, pass_marks, 
        total_questions, subject_ids, is_active, is_published, 
        allow_retake, created_by, created_at, updated_at
      ) VALUES (
        ${examId}, ${title}, 'Practice exam', 60, ${questions.length}, 
        ${Math.ceil(questions.length * 0.4)}, ${questions.length}, 
        ${JSON.stringify([subjectId])}, true, true, true, ${userId}, NOW(), NOW()
      )
    `
    
    // Create student exam
    const studentExamId = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO student_exams (
        id, exam_id, student_id, status, started_at, total_questions, created_at, updated_at
      ) VALUES (
        ${studentExamId}, ${examId}, ${userId}, 'IN_PROGRESS', NOW(), ${questions.length}, NOW(), NOW()
      )
    `
    
    // Format questions for frontend (remove correct answers)
    const examQuestions = questions.map((q: any, index: number) => ({
      id: q.id,
      questionNumber: index + 1,
      questionText: q.question_text,
      options: [
        { label: 'A', text: q.option_a },
        { label: 'B', text: q.option_b },
        { label: 'C', text: q.option_c },
        { label: 'D', text: q.option_d }
      ],
      difficulty: q.difficulty
    }))
    
    return res.json({
      success: true,
      data: {
        examId,
        studentExamId,
        title,
        duration: 60,
        totalQuestions: questions.length,
        questions: examQuestions
      }
    })
  } catch (error) {
    console.error('Practice exam start error:', error)
    return res.status(500).json({ error: 'Failed to start practice exam' })
  }
})

// Submit answer
app.post('/api/exams/:studentExamId/answer', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const { studentExamId } = req.params
    const { questionId, answer } = req.body
    const userId = req.user.id
    
    // Verify student exam belongs to user
    const studentExams = await prisma.$queryRaw`
      SELECT id FROM student_exams 
      WHERE id = ${studentExamId} AND student_id = ${userId} AND status = 'IN_PROGRESS'
    ` as any[]
    
    if (studentExams.length === 0) {
      return res.status(404).json({ error: 'Exam not found or not in progress' })
    }
    
    // Get correct answer
    const questions = await prisma.$queryRaw`
      SELECT correct_answer FROM questions WHERE id = ${questionId}
    ` as any[]
    
    if (questions.length === 0) {
      return res.status(404).json({ error: 'Question not found' })
    }
    
    const correctAnswer = questions[0].correctAnswer
    const isCorrect = answer === correctAnswer
    const points = isCorrect ? 1 : 0
    
    // Save answer (upsert)
    const answerId = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO student_answers (
        id, student_exam_id, question_id, answer, is_correct, points_earned, created_at, updated_at
      ) VALUES (
        ${answerId}, ${studentExamId}, ${questionId}, ${answer}, ${isCorrect}, ${points}, NOW(), NOW()
      )
      ON CONFLICT (student_exam_id, question_id) 
      DO UPDATE SET 
        answer = ${answer}, 
        is_correct = ${isCorrect}, 
        points_earned = ${points}, 
        updated_at = NOW()
    `
    
    return res.json({
      success: true,
      data: { isCorrect, points }
    })
  } catch (error) {
    console.error('Submit answer error:', error)
    return res.status(500).json({ error: 'Failed to submit answer' })
  }
})

// Submit exam
app.post('/api/exams/:studentExamId/submit', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const { studentExamId } = req.params
    const userId = req.user.id
    
    // Calculate score
    const results = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_questions,
        SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) as correct_answers,
        SUM(points_earned) as total_score
      FROM student_answers 
      WHERE student_exam_id = ${studentExamId}
    ` as any[]
    
    const result = results[0]
    const percentage = result.total_questions > 0 ? 
      (result.correctAnswers / result.total_questions) * 100 : 0
    
    // Update student exam
    await prisma.$executeRaw`
      UPDATE student_exams 
      SET 
        status = 'SUBMITTED',
        submitted_at = NOW(),
        score = ${percentage},
        total_score = ${result.total_score || 0},
        updated_at = NOW()
      WHERE id = ${studentExamId} AND student_id = ${userId}
    `
    
    return res.json({
      success: true,
      data: {
        score: percentage,
        totalQuestions: result.total_questions || 0,
        correctAnswers: result.correctAnswers || 0,
        totalScore: result.total_score || 0
      }
    })
  } catch (error) {
    console.error('Submit exam error:', error)
    return res.status(500).json({ error: 'Failed to submit exam' })
  }
})

// Get exam results
app.get('/api/exams/:studentExamId/results', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const { studentExamId } = req.params
    const userId = req.user.id
    
    // Get exam details
    const examDetails = await prisma.$queryRaw`
      SELECT 
        se.score, se.total_score, se.submitted_at,
        e.title, e.total_questions
      FROM student_exams se
      JOIN exams e ON se.examId = e.id
      WHERE se.id = ${studentExamId} AND se.studentId = ${userId} AND se.status = 'SUBMITTED'
    ` as any[]
    
    if (examDetails.length === 0) {
      return res.status(404).json({ error: 'Exam results not found' })
    }
    
    // Get detailed answers
    const answers = await prisma.$queryRaw`
      SELECT 
        q.questionText, q.option_a, q.option_b, q.option_c, q.option_d,
        q.correctAnswer, q.explanation,
        sa.answer, sa.is_correct, sa.points_earned
      FROM student_answers sa
      JOIN questions q ON sa.questionId = q.id
      WHERE sa.studentExamId = ${studentExamId}
      ORDER BY q.questionText
    ` as any[]
    
    const examDetail = examDetails[0]
    
    return res.json({
      success: true,
      data: {
        examTitle: examDetail.title,
        score: examDetail.score,
        totalScore: examDetail.total_score,
        totalQuestions: examDetail.total_questions,
        submittedAt: examDetail.submitted_at,
        answers: answers.map((a: any) => ({
          questionText: a.questionText,
          options: [
            { label: 'A', text: a.option_a },
            { label: 'B', text: a.option_b },
            { label: 'C', text: a.option_c },
            { label: 'D', text: a.option_d }
          ],
          correctAnswer: a.correctAnswer,
          userAnswer: a.answer,
          isCorrect: a.is_correct,
          explanation: a.explanation,
          points: a.points_earned
        }))
      }
    })
  } catch (error) {
    console.error('Get results error:', error)
    return res.status(500).json({ error: 'Failed to get results' })
  }
})

// Start server
async function startServer() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')
    
    app.listen(PORT, () => {
      console.log(`🚀 Simple Exam API running on http://localhost:${PORT}`)
      console.log(`📍 Health check: http://localhost:${PORT}/health`)
      console.log(`🔐 Auth: POST /api/auth/register, POST /api/auth/login`)
      console.log(`📚 Subjects: GET /api/subjects`)
      console.log(`❓ Questions: GET /api/subjects/:id/questions`)
      console.log(`📝 Practice Exam: POST /api/exams/practice`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app