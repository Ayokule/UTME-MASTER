// ==========================================
// EXAM SERVICE - Phase 3
// ==========================================
// This handles all business logic for exams:
// - Creating exams
// - Starting exams
// - Submitting answers
// - Auto-grading
// - Calculating results
//
// All with beginner-friendly comments!

import { prisma } from '../config/database'
import { Prisma } from '@prisma/client'
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors'
import { logger } from '../utils/logger'

// ==========================================
// CREATE EXAM
// ==========================================
// Admin/Teacher creates a new exam template
//
// Steps:
// 1. Validate input
// 2. Create exam record
// 3. Select questions from question bank
// 4. Save selected questions to exam_questions
// 5. Return exam details

export async function createExam(data: any, userId: string) {
  logger.info(`Creating exam: ${data.title}`)
  
  // ==========================================
  // STEP 1: Validate subjects exist
  // ==========================================
  const subjects = await prisma.subject.findMany({
    where: {
      id: { in: data.subjectIds }
    }
  })
  
  if (subjects.length !== data.subjectIds.length) {
    throw new BadRequestError('One or more subjects not found')
  }
  
  // ==========================================
  // STEP 2: Create exam record
  // ==========================================
  const exam = await prisma.exam.create({
    data: {
      title: data.title,
      description: data.description,
      duration: data.duration,
      totalMarks: data.totalMarks,
      passMarks: data.passMarks,
      totalQuestions: data.totalQuestions,
      subjectIds: data.subjectIds,
      questionsPerSubject: data.questionsPerSubject || {},
      randomizeQuestions: data.randomizeQuestions || false,
      randomizeOptions: data.randomizeOptions || false,
      showResults: data.showResults ?? true,
      allowReview: data.allowReview ?? true,
      allowRetake: data.allowRetake || false,
      difficulties: data.difficulties || null,
      yearFrom: data.yearFrom || null,
      yearTo: data.yearTo || null,
      isActive: true,
      isPublished: data.isPublished || false,
      startsAt: data.startsAt || null,
      endsAt: data.endsAt || null,
      createdBy: userId
    }
  })
  
  // ==========================================
  // STEP 3: Select questions from question bank
  // ==========================================
  const selectedQuestions = await selectQuestionsForExam(
    data.subjectIds,
    data.questionsPerSubject,
    data.totalQuestions,
    data.difficulties,
    data.yearFrom,
    data.yearTo
  )
  
  if (selectedQuestions.length < data.totalQuestions) {
    // Not enough questions available
    throw new BadRequestError(
      `Only ${selectedQuestions.length} questions available, need ${data.totalQuestions}`
    )
  }
  
  // ==========================================
  // STEP 4: Create exam_question records
  // ==========================================
  const examQuestions = selectedQuestions.map((question, index) => ({
    examId: exam.id,
    questionId: question.id,
    orderNumber: index + 1,
    points: calculateQuestionPoints(data.totalMarks, data.totalQuestions),
    questionData: question  // Cache question data
  }))
  
  await prisma.examQuestion.createMany({
    data: examQuestions
  })
  
  logger.info(`Exam created: ${exam.id} with ${selectedQuestions.length} questions`)
  
  return {
    id: exam.id,
    title: exam.title,
    totalQuestions: exam.totalQuestions,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    isPublished: exam.isPublished,
    questionCount: selectedQuestions.length
  }
}

// ==========================================
// SELECT QUESTIONS FOR EXAM
// ==========================================
// Smart question selection algorithm
//
// Rules:
// 1. Select from specified subjects
// 2. Distribute questions per subject
// 3. Filter by difficulty (if specified)
// 4. Filter by year range (if specified)
// 5. Randomize selection

async function selectQuestionsForExam(
  subjectIds: string[],
  questionsPerSubject: any,
  totalQuestions: number,
  difficulties?: string[],
  yearFrom?: number,
  yearTo?: number
) {
  const selectedQuestions: any[] = []
  
  // For each subject
  for (const subjectId of subjectIds) {
    // How many questions from this subject?
    const count = questionsPerSubject[subjectId] || 
                  Math.floor(totalQuestions / subjectIds.length)
    
    // Build query filters
    const where: any = {
      subjectId: subjectId,
      isActive: true
    }
    
    // Add difficulty filter
    if (difficulties && difficulties.length > 0) {
      where.difficulty = { in: difficulties }
    }
    
    // Add year filter
    if (yearFrom && yearTo) {
      where.year = {
        gte: yearFrom,
        lte: yearTo
      }
    } else if (yearFrom) {
      where.year = { gte: yearFrom }
    } else if (yearTo) {
      where.year = { lte: yearTo }
    }
    
    // Fetch questions
    const questions = await prisma.question.findMany({
      where,
      take: count * 2,  // Get extra in case of duplicates
      include: {
        subject: { select: { name: true, code: true } },
        topic: { select: { name: true } }
      }
    })
    
    // Randomize and take required count
    const shuffled = shuffleArray(questions)
    const selected = shuffled.slice(0, count)
    
    selectedQuestions.push(...selected)
  }
  
  return selectedQuestions
}

// ==========================================
// START EXAM (STUDENT)
// ==========================================
// Student starts taking an exam
//
// Steps:
// 1. Verify exam is available
// 2. Check if student already attempted
// 3. Create StudentExam record
// 4. Get questions in random order (if randomization enabled)
// 5. Return exam details + first question

export async function startExam(examId: string, studentId: string) {
  logger.info(`Student ${studentId} starting exam ${examId}`)
  
  // ==========================================
  // STEP 1: Get exam details
  // ==========================================
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      examQuestions: {
        include: {
          question: {
            include: {
              subject: { select: { name: true } },
              topic: { select: { name: true } }
            }
          }
        },
        orderBy: { orderNumber: 'asc' }
      }
    }
  })
  
  if (!exam) {
    throw new NotFoundError('Exam not found')
  }
  
  if (!exam.isPublished || !exam.isActive) {
    throw new BadRequestError('Exam is not available')
  }
  
  // Check scheduling
  const now = new Date()
  if (exam.startsAt && exam.startsAt > now) {
    throw new BadRequestError('Exam has not started yet')
  }
  if (exam.endsAt && exam.endsAt < now) {
    throw new BadRequestError('Exam has ended')
  }
  
  // ==========================================
  // STEP 2: Check previous attempts
  // ==========================================
  const previousAttempt = await prisma.studentExam.findUnique({
    where: {
      examId_studentId: {
        examId: examId,
        studentId: studentId
      }
    }
  })
  
  if (previousAttempt) {
    if (previousAttempt.status === 'IN_PROGRESS') {
      // Resume existing attempt
      return resumeExam(previousAttempt.id, studentId)
    }
    
    if (previousAttempt.status === 'SUBMITTED' && !exam.allowRetake) {
      throw new BadRequestError('You have already completed this exam')
    }
    
    if (previousAttempt.status === 'SUBMITTED' && exam.allowRetake) {
      // Delete previous attempt to start fresh
      await prisma.studentExam.delete({
        where: { id: previousAttempt.id }
      })
    }
  }
  
  // ==========================================
  // STEP 3: Prepare questions
  // ==========================================
  let questions = exam.examQuestions.map(eq => eq.question)
  
  // Randomize question order if enabled
  if (exam.randomizeQuestions) {
    questions = shuffleArray(questions)
  }
  
  const questionOrder = questions.map(q => q.id)
  
  // ==========================================
  // STEP 4: Create StudentExam record
  // ==========================================
  const studentExam = await prisma.studentExam.create({
    data: {
      examId: examId,
      studentId: studentId,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      timeRemaining: exam.duration,
      totalQuestions: exam.totalQuestions,
      questionOrder: questionOrder
    }
  })
  
  // ==========================================
  // STEP 5: Create empty answer records
  // ==========================================
  const answerRecords = questions.map(question => ({
    studentExamId: studentExam.id,
    questionId: question.id,
    answer: Prisma.JsonNull,
    isCorrect: null
  }))
  
  await prisma.studentAnswer.createMany({
    data: answerRecords
  })
  
  logger.info(`Exam started: StudentExam ${studentExam.id}`)
  
  // ==========================================
  // STEP 6: Format and return exam data
  // ==========================================
  // Randomize options if enabled
  const formattedQuestions = questions.map(q => {
    const questionData = { ...q }
    
    if (exam.randomizeOptions && questionData.options) {
      questionData.options = shuffleArray(questionData.options as any[])
    }
    
    return {
      id: questionData.id,
      questionText: questionData.questionText,
      options: questionData.options,
      images: questionData.images || [],
      audioUrl: questionData.audioUrl,
      videoUrl: questionData.videoUrl,
      questionType: questionData.questionType,
      allowMultiple: questionData.allowMultiple || false,
      subject: questionData.subject.name,
      topic: questionData.topic?.name
    }
  })
  
  return {
    studentExamId: studentExam.id,
    examTitle: exam.title,
    duration: exam.duration,
    totalQuestions: exam.totalQuestions,
    totalMarks: exam.totalMarks,
    startedAt: studentExam.startedAt,
    timeRemaining: studentExam.timeRemaining,
    questions: formattedQuestions,
    currentQuestionIndex: 0
  }
}
// ==========================================
// START PRACTICE EXAM
// ==========================================
// Generate and start a practice exam based on subject and type
export async function startPracticeExam(params: {
  studentId: string
  subject: string
  examType: string
  difficulty?: string
  questionCount: number
  duration: number
}) {
  const { studentId, subject, examType, difficulty, questionCount, duration } = params

  logger.info(`Starting practice exam for student ${studentId}: ${subject} - ${examType}`)

  // Create exam title
  const examTitle = `${examType.charAt(0).toUpperCase() + examType.slice(1)} Test - ${subject}`

  // Find the subject (try exact match first, then fuzzy match)
  let subjectRecord = await prisma.subject.findFirst({
    where: {
      name: {
        equals: subject,
        mode: 'insensitive'
      },
      isActive: true
    }
  })

  // If exact match fails, try partial match
  if (!subjectRecord) {
    subjectRecord = await prisma.subject.findFirst({
      where: {
        OR: [
          {
            name: {
              contains: subject,
              mode: 'insensitive'
            }
          },
          {
            code: {
              equals: subject.toUpperCase()
            }
          }
        ],
        isActive: true
      }
    })
  }

  // If subject doesn't exist, create it on-the-fly
  if (!subjectRecord) {
    logger.info(`Subject "${subject}" not found, creating it...`)
    
    // Generate a code from the subject name
    const code = subject.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3) || 'SUB'
    
    try {
      subjectRecord = await prisma.subject.create({
        data: {
          name: subject,
          code: code,
          description: `Auto-generated subject for ${subject}`,
          isActive: true
        }
      })
      logger.info(`Created new subject: ${subject} (${code})`)
    } catch (error) {
      // If creation fails (e.g., duplicate code), try to find by name again
      subjectRecord = await prisma.subject.findFirst({
        where: {
          name: {
            contains: subject,
            mode: 'insensitive'
          },
          isActive: true
        }
      })
      
      if (!subjectRecord) {
        // Log available subjects for debugging
        const availableSubjects = await prisma.subject.findMany({
          where: { isActive: true },
          select: { name: true, code: true }
        })
        logger.error(`Subject "${subject}" not found and could not be created. Available subjects:`, availableSubjects.map(s => s.name))
        throw new NotFoundError(`Subject "${subject}" not found. Available subjects: ${availableSubjects.map(s => s.name).join(', ')}`)
      }
    }
  }

  // Build question filters
  const questionFilters: any = {
    subjectId: subjectRecord.id,
    isActive: true
  }

  // Add difficulty filter if specified
  if (difficulty && difficulty !== 'all') {
    questionFilters.difficulty = difficulty.toUpperCase()
  }

  // Add exam type filter if it's a specific exam type
  if (examType !== 'practice' && examType !== 'speed' && examType !== 'adaptive') {
    questionFilters.examType = examType.toUpperCase()
  }

  // Get available questions
  const availableQuestions = await prisma.question.findMany({
    where: questionFilters,
    include: {
      subject: true,
      topic: true
    }
  })

  console.log('Practice exam questions query:', {
    subjectId: subjectRecord.id,
    subjectName: subjectRecord.name,
    filters: questionFilters,
    availableQuestionsCount: availableQuestions.length
  })

  if (availableQuestions.length === 0) {
    logger.info(`No questions found for ${subject}, creating sample questions...`)
    
    // Create 5 sample questions for this subject
    const sampleQuestions = []
    for (let i = 1; i <= 5; i++) {
      const correctAnswer = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
      
      const question = await prisma.question.create({
        data: {
          subjectId: subjectRecord.id,
          questionText: `Sample ${subject} question ${i}. This is a practice question for testing purposes. What is the correct answer?`,
          options: [
            { label: 'A', text: `Option A for ${subject} question ${i}`, isCorrect: correctAnswer === 'A' },
            { label: 'B', text: `Option B for ${subject} question ${i}`, isCorrect: correctAnswer === 'B' },
            { label: 'C', text: `Option C for ${subject} question ${i}`, isCorrect: correctAnswer === 'C' },
            { label: 'D', text: `Option D for ${subject} question ${i}`, isCorrect: correctAnswer === 'D' }
          ],
          optionA: `Option A for ${subject} question ${i}`,
          optionB: `Option B for ${subject} question ${i}`,
          optionC: `Option C for ${subject} question ${i}`,
          optionD: `Option D for ${subject} question ${i}`,
          correctAnswer: correctAnswer,
          explanation: `This is the explanation for ${subject} question ${i}. The correct answer is ${correctAnswer}.`,
          difficulty: 'MEDIUM',
          year: 2024,
          examType: 'JAMB',
          questionType: 'MCQ',
          createdBy: studentId,
          isActive: true,
          points: 1,
          allowMultiple: false
        },
        include: {
          subject: true,
          topic: true
        }
      })
      
      sampleQuestions.push(question)
    }
    
    logger.info(`Created ${sampleQuestions.length} sample questions for ${subject}`)
    
    // Use the created questions
    const selectedQuestions = sampleQuestions.slice(0, Math.min(questionCount, sampleQuestions.length))
    
    if (selectedQuestions.length < questionCount) {
      logger.warn(`Only ${selectedQuestions.length} questions available, requested ${questionCount}`)
    }
    
    return await createExamFromQuestions(selectedQuestions, examTitle, duration, studentId, subjectRecord)
  }

  // Select random questions
  const shuffledQuestions = shuffleArray(availableQuestions)
  const selectedQuestions = shuffledQuestions.slice(0, Math.min(questionCount, shuffledQuestions.length))

  console.log('Practice exam questions selected:', {
    selectedCount: selectedQuestions.length,
    requestedCount: questionCount,
    availableCount: availableQuestions.length
  })

  if (selectedQuestions.length < questionCount) {
    logger.warn(`Only ${selectedQuestions.length} questions available, requested ${questionCount}`)
  }

  return await createExamFromQuestions(selectedQuestions, examTitle, duration, studentId, subjectRecord)
}

// Helper function to create exam from selected questions
async function createExamFromQuestions(
  selectedQuestions: any[],
  examTitle: string,
  duration: number,
  studentId: string,
  subjectRecord: any
) {
  const totalMarks = selectedQuestions.length // 1 mark per question for practice

  const exam = await prisma.exam.create({
    data: {
      title: examTitle,
      description: `Practice exam for ${subjectRecord.name}`,
      duration: duration,
      totalQuestions: selectedQuestions.length,
      totalMarks: totalMarks,
      passMarks: Math.ceil(totalMarks * 0.5), // 50% pass mark
      isPublished: true,
      allowReview: true,
      allowRetake: true,
      createdBy: studentId, // Student creates their own practice exam
      isActive: true,
      subjectIds: [subjectRecord.id], // Required field
      randomizeQuestions: true,
      randomizeOptions: false,
      showResults: true
    }
  })

  // Create exam questions
  const examQuestions = selectedQuestions.map((question, index) => ({
    examId: exam.id,
    questionId: question.id,
    orderNumber: index + 1,
    points: 1, // 1 point per question for practice
    questionData: {
      questionText: question.questionText,
      options: question.options || [
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD
      ].filter(Boolean),
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      subject: question.subject.name,
      topic: question.topic?.name
    }
  }))

  await prisma.examQuestion.createMany({
    data: examQuestions
  })

  // Create student exam record
  const questionOrder = selectedQuestions.map(q => q.id)
  
  const studentExam = await prisma.studentExam.create({
    data: {
      examId: exam.id,
      studentId: studentId,
      startedAt: new Date(),
      timeRemaining: duration * 60, // Convert minutes to seconds
      totalQuestions: selectedQuestions.length,
      status: 'IN_PROGRESS',
      questionOrder: questionOrder // Required field
    }
  })

  // Format questions for frontend
  const formattedQuestions = selectedQuestions.map((question, index) => ({
    id: question.id,
    questionText: question.questionText,
    questionType: question.questionType,
    options: question.options || [
      question.optionA,
      question.optionB,
      question.optionC,
      question.optionD
    ].filter(Boolean),
    images: question.images || [],
    audioUrl: question.audioUrl,
    videoUrl: question.videoUrl,
    allowMultiple: question.allowMultiple,
    subject: question.subject.name,
    topic: question.topic?.name,
    orderNumber: index + 1
  }))

  logger.info(`Practice exam started: ${studentExam.id} with ${selectedQuestions.length} questions`)

  return {
    studentExamId: studentExam.id,
    examTitle: exam.title,
    duration: exam.duration,
    totalQuestions: exam.totalQuestions,
    totalMarks: exam.totalMarks,
    startedAt: studentExam.startedAt?.toISOString() || new Date().toISOString(),
    timeRemaining: studentExam.timeRemaining,
    questions: formattedQuestions,
    currentQuestionIndex: 0,
    savedAnswers: {}
  }
}

// ==========================================
// SUBMIT ANSWER
// ==========================================
// Student submits answer to a question
//
// Steps:
// 1. Validate student exam
// 2. Save answer
// 3. Calculate if correct (for auto-grading)
// 4. Update statistics

export async function submitAnswer(
  studentExamId: string,
  questionId: string,
  answer: any,
  timeSpent: number
) {
  // ==========================================
  // STEP 1: Get student exam
  // ==========================================
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    include: { exam: true }
  })
  
  if (!studentExam) {
    throw new NotFoundError('Exam attempt not found')
  }
  
  if (studentExam.status !== 'IN_PROGRESS') {
    throw new BadRequestError('Exam is not in progress')
  }
  
  // ==========================================
  // STEP 2: Get question details
  // ==========================================
  const question = await prisma.question.findUnique({
    where: { id: questionId }
  })
  
  if (!question) {
    throw new NotFoundError('Question not found')
  }
  
  // ==========================================
  // STEP 3: Calculate if answer is correct
  // ==========================================
  const { isCorrect, pointsEarned } = gradeAnswer(question, answer)
  
  // ==========================================
  // STEP 4: Save answer
  // ==========================================
  await prisma.studentAnswer.update({
    where: {
      studentExamId_questionId: {
        studentExamId: studentExamId,
        questionId: questionId
      }
    },
    data: {
      answer: answer,
      isCorrect: isCorrect,
      pointsEarned: pointsEarned,
      timeSpent: timeSpent,
      answeredAt: new Date()
    }
  })
  
  // ==========================================
  // STEP 5: Update student exam statistics
  // ==========================================
  const stats = await calculateExamStats(studentExamId)
  
  await prisma.studentExam.update({
    where: { id: studentExamId },
    data: {
      answeredQuestions: stats.answeredQuestions,
      correctAnswers: stats.correctAnswers,
      wrongAnswers: stats.wrongAnswers,
      timeSpent: studentExam.timeSpent + timeSpent
    }
  })
  
  logger.debug(`Answer submitted for question ${questionId}: ${isCorrect ? 'Correct' : 'Wrong'}`)
  
  return {
    isCorrect,
    pointsEarned,
    answeredQuestions: stats.answeredQuestions,
    totalQuestions: studentExam.totalQuestions
  }
}

// ==========================================
// SUBMIT EXAM
// ==========================================
// Student completes and submits exam
//
// Steps:
// 1. Verify all questions answered (or time expired)
// 2. Calculate final score
// 3. Determine pass/fail
// 4. Update status
// 5. Return results

export async function submitExam(studentExamId: string, autoSubmit: boolean = false) {
  logger.info(`Submitting exam: ${studentExamId}, auto: ${autoSubmit}`)
  
  // ==========================================
  // STEP 1: Get student exam
  // ==========================================
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    include: {
      exam: true,
      answers: true
    }
  })
  
  if (!studentExam) {
    throw new NotFoundError('Exam attempt not found')
  }
  
  if (studentExam.status === 'SUBMITTED') {
    throw new BadRequestError('Exam already submitted')
  }
  
  // ==========================================
  // STEP 2: Calculate statistics
  // ==========================================
  const stats = await calculateExamStats(studentExamId)
  
  // ==========================================
  // STEP 3: Calculate final score
  // ==========================================
  const totalPoints = studentExam.answers.reduce(
    (sum, answer) => sum + (answer.pointsEarned || 0),
    0
  )
  
  const scorePercentage = (totalPoints / studentExam.exam.totalMarks) * 100
  const passed = totalPoints >= studentExam.exam.passMarks
  const grade = calculateGrade(scorePercentage)
  
  // ==========================================
  // STEP 4: Update student exam record
  // ==========================================
  const updatedExam = await prisma.studentExam.update({
    where: { id: studentExamId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      answeredQuestions: stats.answeredQuestions,
      correctAnswers: stats.correctAnswers,
      wrongAnswers: stats.wrongAnswers,
      score: totalPoints,
      passed: passed,
      grade: grade,
      autoSubmitted: autoSubmit
    }
  })
  
  logger.info(`Exam submitted: Score ${totalPoints}/${studentExam.exam.totalMarks}, Passed: ${passed}`)
  
  // ==========================================
  // STEP 5: Return results
  // ==========================================
  return {
    studentExamId: updatedExam.id,
    status: 'SUBMITTED',
    submittedAt: updatedExam.submittedAt,
    totalQuestions: updatedExam.totalQuestions,
    answeredQuestions: updatedExam.answeredQuestions,
    correctAnswers: updatedExam.correctAnswers,
    wrongAnswers: updatedExam.wrongAnswers,
    score: totalPoints,
    totalMarks: studentExam.exam.totalMarks,
    scorePercentage: scorePercentage.toFixed(2),
    passed: passed,
    grade: grade,
    passMarks: studentExam.exam.passMarks,
    autoSubmitted: autoSubmit
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Calculate points per question
function calculateQuestionPoints(totalMarks: number, totalQuestions: number): number {
  return Math.round((totalMarks / totalQuestions) * 100) / 100
}

// Grade a single answer
function gradeAnswer(question: any, answer: any): { isCorrect: boolean; pointsEarned: number } {
  if (!answer) {
    return { isCorrect: false, pointsEarned: 0 }
  }
  
  const questionPoints = question.points || 1
  
  // For MCQ questions
  if (question.questionType === 'MCQ') {
    const correctOptions = question.options.filter((opt: any) => opt.isCorrect)
    
    if (question.allowMultiple) {
      // Multiple correct answers
      const selectedLabels = answer.selected || []
      const correctLabels = correctOptions.map((opt: any) => opt.label)
      
      const isCorrect = 
        selectedLabels.length === correctLabels.length &&
        selectedLabels.every((label: string) => correctLabels.includes(label))
      
      return {
        isCorrect,
        pointsEarned: isCorrect ? questionPoints : 0
      }
    } else {
      // Single correct answer
      const selectedLabel = answer.selected
      const correctLabel = correctOptions[0]?.label
      
      return {
        isCorrect: selectedLabel === correctLabel,
        pointsEarned: selectedLabel === correctLabel ? questionPoints : 0
      }
    }
  }
  
  // For True/False
  if (question.questionType === 'TRUE_FALSE') {
    const correctOption = question.options.find((opt: any) => opt.isCorrect)
    return {
      isCorrect: answer.selected === correctOption.label,
      pointsEarned: answer.selected === correctOption.label ? questionPoints : 0
    }
  }
  
  // Essay/Fill questions need manual grading
  return { isCorrect: false, pointsEarned: 0 }
}

// Calculate exam statistics
async function calculateExamStats(studentExamId: string) {
  const answers = await prisma.studentAnswer.findMany({
    where: { studentExamId }
  })
  
  const answeredQuestions = answers.filter(a => a.answer !== null).length
  const correctAnswers = answers.filter(a => a.isCorrect === true).length
  const wrongAnswers = answers.filter(a => a.isCorrect === false).length
  
  return {
    answeredQuestions,
    correctAnswers,
    wrongAnswers
  }
}

// Calculate letter grade
function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  if (percentage >= 50) return 'E'
  return 'F'
}

// Resume existing exam (if student refreshed page)
export async function resumeExam(studentExamId: string, studentId: string) {
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    include: {
      exam: {
        include: {
          examQuestions: {
            include: {
              question: true
            }
          }
        }
      },
      answers: true
    }
  })
  
  if (!studentExam || studentExam.studentId !== studentId) {
    throw new ForbiddenError('Access denied')
  }
  
  // Calculate time remaining
  const startTime = studentExam.startedAt?.getTime() || Date.now()
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  const timeRemaining = Math.max(0, studentExam.exam.duration - elapsed)
  
  if (timeRemaining === 0) {
    // Time expired, auto-submit
    return await submitExam(studentExamId, true)
  }
  
  // Update time remaining
  await prisma.studentExam.update({
    where: { id: studentExamId },
    data: { timeRemaining }
  })
  
  // Get questions in saved order
  const questionOrder = studentExam.questionOrder as string[]
  const questions = questionOrder.map(qId => {
    const examQuestion = studentExam.exam.examQuestions.find(eq => eq.question.id === qId)
    return examQuestion?.question
  }).filter(Boolean)
  
  // Validate that questions exist
  if (questions.length === 0) {
    logger.error(`No questions found for exam ${studentExamId}`, {
      studentExamId,
      questionOrder,
      examQuestionsCount: studentExam.exam.examQuestions.length
    })
    throw new NotFoundError('No questions available for this exam')
  }
  
  // Debug logging
  console.log('Returning exam data:', {
    studentExamId: studentExam.id,
    totalQuestions: studentExam.totalQuestions,
    questionsCount: questions.length,
    questionOrder: questionOrder.length,
    examQuestionsCount: studentExam.exam.examQuestions.length
  })
  
  return {
    studentExamId: studentExam.id,
    examTitle: studentExam.exam.title,
    duration: studentExam.exam.duration,
    totalQuestions: studentExam.totalQuestions,
    totalMarks: studentExam.exam.totalMarks,
    startedAt: studentExam.startedAt,
    timeRemaining: timeRemaining,
    answeredQuestions: studentExam.answeredQuestions,
    currentQuestionIndex: 0,
    questions: questions,
    savedAnswers: studentExam.answers.reduce((acc: any, answer) => {
      acc[answer.questionId] = answer.answer
      return acc
    }, {})
  }
}
