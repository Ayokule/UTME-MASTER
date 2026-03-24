import { Request, Response } from 'express'
import { prisma } from '../config/database'
import * as resultsService from '../services/results.service'
import PDFDocument from 'pdfkit'
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors'
import { asyncHandler } from '../middleware/error.middleware'
import { logger } from '../utils/logger'

// ==========================================
// RESULTS CONTROLLER
// ==========================================
// This controller handles exam results and analytics

// GET EXAM RESULTS
// GET /api/student/results/:studentExamId
export const getExamResults = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { studentExamId } = req.params
  const userId = req.user?.id

  if (!userId) {
    throw new UnauthorizedError('User not authenticated')
  }

  const results = await resultsService.compileResultsData(studentExamId, userId)

  if (!results) {
    throw new NotFoundError('Exam results not found')
  }

  res.json({ success: true, data: results })
})

// DOWNLOAD RESULTS PDF
// GET /api/student/results/:studentExamId/pdf
export const downloadResultsPDF = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { studentExamId } = req.params
  const userId = req.user?.id

  if (!userId) {
    throw new UnauthorizedError('User not authenticated')
  }

  const results = await resultsService.compileResultsData(studentExamId, userId)

  if (!results) {
    throw new NotFoundError('Exam results not found')
  }

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="results-${studentExamId}.pdf"`);

  doc.pipe(res);

  // Header
  doc.fontSize(20).font('Helvetica-Bold').text(results.exam.title, { align: 'center' });
  doc.fontSize(14).font('Helvetica').text('Official Score Report', { align: 'center' });
  doc.moveDown(2);

  // Student Info
  doc.fontSize(12).font('Helvetica-Bold').text('Student:', { continued: true }).font('Helvetica').text(` ${results.student.firstName} ${results.student.lastName}`);
  doc.font('Helvetica-Bold').text('Date:', { continued: true }).font('Helvetica').text(` ${new Date(results.submittedAt).toLocaleDateString()}`);
  doc.moveDown();

  // Overall Score
  doc.fontSize(16).font('Helvetica-Bold').text('Overall Score');
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();
  
  doc.fontSize(40).font('Helvetica-Bold').fillColor(results.score.passed ? '#22c55e' : '#ef4444').text(`${results.score.percentage}%`, { align: 'center' });
  doc.fontSize(20).fillColor(results.score.passed ? '#22c55e' : '#ef4444').text(results.score.passed ? 'PASS' : 'FAIL', { align: 'center' });
  doc.moveDown();

  doc.fillColor('#000').fontSize(12).font('Helvetica').text(`Grade: ${results.score.grade}`, { align: 'center' });
  doc.text(`Score: ${results.score.total} / ${results.score.max}`, { align: 'center' });
  doc.moveDown(2);
  
  // Subject Breakdown
  doc.fontSize(16).font('Helvetica-Bold').text('Subject Breakdown');
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();
  
  // Table Header
  const tableTop = doc.y;
  const itemX = 50;
  const scoreX = 250;
  const percentageX = 400;

  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Subject', itemX, tableTop);
  doc.text('Score', scoreX, tableTop, { width: 100, align: 'right' });
  doc.text('Percentage', percentageX, tableTop, { width: 100, align: 'right' });
  doc.moveDown();

  // Table Body
  doc.font('Helvetica');
  results.subjects.forEach(subject => {
      const y = doc.y;
      doc.text(subject.name, itemX, y);
      doc.text(`${subject.score} / ${subject.max}`, scoreX, y, { width: 100, align: 'right' });
      doc.text(`${subject.percentage}%`, percentageX, y, { width: 100, align: 'right' });
      doc.moveDown();
  });

  doc.end();
})


// RETAKE EXAM
// POST /api/exams/:examId/retake
export const retakeExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId } = req.params
    const userId = (req as any).user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
      return
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, allowRetake: true, isActive: true, isPublished: true }
    })

    if (!exam || !exam.allowRetake || !exam.isActive || !exam.isPublished) {
      res.status(404).json({ success: false, message: 'Exam not available for retake' })
      return
    }

    const newStudentExam = await prisma.studentExam.create({
      data: {
        examId: examId,
        studentId: userId,
        status: 'NOT_STARTED',
        totalQuestions: 0,
        questionOrder: []
      }
    })

    res.json({
      success: true,
      data: {
        studentExamId: newStudentExam.id,
        message: 'New exam attempt created successfully'
      }
    })

  } catch (error: any) {
    console.error('Retake exam error:', error)
    res.status(500).json({ success: false, message: 'Failed to create retake attempt', error: error.message })
  }
}

// SHARE RESULTS
// POST /api/student/results/:studentExamId/share
export const shareResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentExamId } = req.params
    const { platform } = req.body
    const userId = (req as any).user?.id

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' })
      return
    }

    const studentExam = await prisma.studentExam.findUnique({
      where: { id: studentExamId, studentId: userId },
    })

    if (!studentExam) {
      res.status(404).json({ success: false, message: 'Exam results not found' })
      return
    }

    console.log(`User ${userId} shared results for exam ${studentExam.examId} on ${platform}`)

    res.json({
      success: true,
      data: {
        message: 'Results shared successfully',
        shareUrl: `${process.env.FRONTEND_URL}/student/results/${studentExamId}`
      }
    })

  } catch (error: any) {
    console.error('Share results error:', error)
    res.status(500).json({ success: false, message: 'Failed to share results', error: error.message })
  }
}