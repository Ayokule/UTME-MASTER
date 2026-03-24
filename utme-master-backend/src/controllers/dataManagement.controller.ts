// ==========================================
// DATA MANAGEMENT CONTROLLER
// ==========================================

import { Request, Response } from 'express'
import * as dmService from '../services/dataManagement.service'
import { logger } from '../utils/logger'

// GET /api/data-management/health
export async function getHealthReport(req: Request, res: Response): Promise<void> {
  try {
    const report = await dmService.getDataHealthReport()
    res.json({ success: true, data: report })
  } catch (error: any) {
    logger.error('Health report failed:', error)
    res.status(500).json({ success: false, error: { message: error.message } })
  }
}

// GET /api/data-management/duplicates
export async function getDuplicates(req: Request, res: Response): Promise<void> {
  try {
    const result = await dmService.findDuplicateQuestions()
    res.json({ success: true, data: result })
  } catch (error: any) {
    logger.error('Duplicate detection failed:', error)
    res.status(500).json({ success: false, error: { message: error.message } })
  }
}

// POST /api/data-management/duplicates/remove
export async function removeDuplicates(req: Request, res: Response): Promise<void> {
  try {
    const { keepIds = [], deleteIds = [] } = req.body
    if (!Array.isArray(deleteIds) || deleteIds.length === 0) {
      res.status(400).json({ success: false, error: { message: 'deleteIds array required' } })
      return
    }
    const result = await dmService.removeDuplicateQuestions(keepIds, deleteIds)
    res.json({ success: true, data: result })
  } catch (error: any) {
    logger.error('Remove duplicates failed:', error)
    res.status(400).json({ success: false, error: { message: error.message } })
  }
}

// GET /api/data-management/exams/:examId/questions
export async function getExamQuestions(req: Request, res: Response): Promise<void> {
  try {
    const { examId } = req.params
    const questions = await dmService.getExamQuestions(examId)
    res.json({ success: true, data: { questions } })
  } catch (error: any) {
    logger.error('Get exam questions failed:', error)
    const status = error.code === 'NOT_FOUND' ? 404 : 400
    res.status(status).json({ success: false, error: { message: error.message } })
  }
}

// POST /api/data-management/exams/:examId/questions/assign
export async function assignQuestionsToExam(req: Request, res: Response): Promise<void> {
  try {
    const { examId } = req.params
    const { questionIds } = req.body
    const userId = (req as any).user?.id

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      res.status(400).json({ success: false, error: { message: 'questionIds array required' } })
      return
    }

    const result = await dmService.bulkAssignQuestionsToExam(examId, questionIds, userId)
    res.json({ success: true, data: result })
  } catch (error: any) {
    logger.error('Assign questions failed:', error)
    const status = error.code === 'NOT_FOUND' ? 404 : 400
    res.status(status).json({ success: false, error: { message: error.message } })
  }
}

// DELETE /api/data-management/exams/:examId/questions/remove
export async function removeQuestionsFromExam(req: Request, res: Response): Promise<void> {
  try {
    const { examId } = req.params
    const { questionIds } = req.body
    const userId = (req as any).user?.id

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      res.status(400).json({ success: false, error: { message: 'questionIds array required' } })
      return
    }

    const result = await dmService.removeQuestionsFromExam(examId, questionIds, userId)
    res.json({ success: true, data: result })
  } catch (error: any) {
    logger.error('Remove questions failed:', error)
    const status = error.code === 'NOT_FOUND' ? 404 : 400
    res.status(status).json({ success: false, error: { message: error.message } })
  }
}

// GET /api/data-management/audit-logs
export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit, userId, action, entityType } = req.query
    const result = await dmService.getAuditLogs({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      userId: userId as string,
      action: action as string,
      entityType: entityType as string
    })
    res.json({ success: true, data: result })
  } catch (error: any) {
    logger.error('Get audit logs failed:', error)
    res.status(500).json({ success: false, error: { message: error.message } })
  }
}

// GET /api/data-management/imports
export async function getImportHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.role === 'ADMIN' ? undefined : (req as any).user?.id
    const history = await dmService.getImportHistory(userId)
    res.json({ success: true, data: { imports: history } })
  } catch (error: any) {
    logger.error('Get import history failed:', error)
    res.status(500).json({ success: false, error: { message: error.message } })
  }
}
