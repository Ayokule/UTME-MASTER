// ==========================================
// PDF TEMPLATES SERVICE
// ==========================================
// Pre-built PDF templates for different document types

import jsPDF from 'jspdf'

export interface ExamResultsData {
  studentName: string
  examTitle: string
  score: number
  totalMarks: number
  percentage: number
  grade: string
  passed: boolean
  submittedAt: string
  timeSpent: number
  subjectBreakdown: Array<{
    subject: string
    correct: number
    total: number
    percentage: number
  }>
  questions: Array<{
    questionText: string
    selectedAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanation: string
  }>
}

export interface AnalyticsData {
  studentName: string
  overallProgress: number
  subjects: Array<{
    name: string
    progress: number
    target: number
  }>
  achievements: Array<{
    title: string
    description: string
    unlocked: boolean
  }>
  performanceData: Array<{
    date: string
    score: number
    percentage: number
  }>
}

class PDFTemplates {
  private addTitle(pdf: jsPDF, title: string, y: number = 30): number {
    pdf.setFontSize(20)
    pdf.setTextColor(0, 0, 0)
    pdf.text(title, 20, y)
    return y + 15
  }

  private addSubtitle(pdf: jsPDF, subtitle: string, y: number): number {
    pdf.setFontSize(14)
    pdf.setTextColor(100, 100, 100)
    pdf.text(subtitle, 20, y)
    return y + 10
  }

  private addSection(pdf: jsPDF, title: string, y: number): number {
    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    pdf.text(title, 20, y)
    
    // Add underline
    const textWidth = pdf.getTextWidth(title)
    pdf.setDrawColor(200, 200, 200)
    pdf.line(20, y + 2, 20 + textWidth, y + 2)
    
    return y + 15
  }

  private addText(pdf: jsPDF, text: string, y: number, fontSize: number = 12): number {
    pdf.setFontSize(fontSize)
    pdf.setTextColor(0, 0, 0)
    
    // Handle text wrapping
    const lines = pdf.splitTextToSize(text, 170)
    pdf.text(lines, 20, y)
    
    return y + (lines.length * 6)
  }

  private addTable(pdf: jsPDF, headers: string[], rows: string[][], y: number): number {
    const startY = y
    const cellHeight = 8
    const cellPadding = 2
    const colWidth = 170 / headers.length

    // Draw headers
    pdf.setFillColor(240, 240, 240)
    pdf.rect(20, y, 170, cellHeight, 'F')
    
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    
    headers.forEach((header, index) => {
      pdf.text(header, 20 + (index * colWidth) + cellPadding, y + 5)
    })
    
    y += cellHeight

    // Draw rows
    rows.forEach((row, rowIndex) => {
      if (rowIndex % 2 === 0) {
        pdf.setFillColor(250, 250, 250)
        pdf.rect(20, y, 170, cellHeight, 'F')
      }
      
      row.forEach((cell, cellIndex) => {
        pdf.text(cell, 20 + (cellIndex * colWidth) + cellPadding, y + 5)
      })
      
      y += cellHeight
    })

    // Draw table border
    pdf.setDrawColor(200, 200, 200)
    pdf.rect(20, startY, 170, y - startY)
    
    // Draw column separators
    for (let i = 1; i < headers.length; i++) {
      pdf.line(20 + (i * colWidth), startY, 20 + (i * colWidth), y)
    }

    return y + 10
  }

  private addProgressBar(pdf: jsPDF, label: string, value: number, y: number): number {
    const barWidth = 100
    const barHeight = 6
    
    // Label
    pdf.setFontSize(10)
    pdf.text(label, 20, y)
    
    // Background bar
    pdf.setFillColor(240, 240, 240)
    pdf.rect(20, y + 2, barWidth, barHeight, 'F')
    
    // Progress bar
    const progressWidth = (value / 100) * barWidth
    pdf.setFillColor(59, 130, 246) // Blue color
    pdf.rect(20, y + 2, progressWidth, barHeight, 'F')
    
    // Percentage text
    pdf.text(`${value.toFixed(1)}%`, 130, y + 6)
    
    return y + 15
  }

  // ==========================================
  // EXAM RESULTS TEMPLATE
  // ==========================================
  generateExamResultsPDF(data: ExamResultsData): jsPDF {
    const pdf = new jsPDF()
    let y = 20

    // Header
    y = this.addTitle(pdf, 'Exam Results Report', y)
    y = this.addSubtitle(pdf, `${data.examTitle} - ${data.studentName}`, y)
    y += 10

    // Summary Section
    y = this.addSection(pdf, 'Summary', y)
    y = this.addText(pdf, `Score: ${data.score}/${data.totalMarks} (${data.percentage.toFixed(1)}%)`, y)
    y = this.addText(pdf, `Grade: ${data.grade}`, y)
    y = this.addText(pdf, `Status: ${data.passed ? 'PASSED' : 'FAILED'}`, y)
    y = this.addText(pdf, `Submitted: ${new Date(data.submittedAt).toLocaleString()}`, y)
    y = this.addText(pdf, `Time Spent: ${Math.floor(data.timeSpent / 60)}:${(data.timeSpent % 60).toString().padStart(2, '0')}`, y)
    y += 10

    // Subject Breakdown
    if (data.subjectBreakdown.length > 0) {
      y = this.addSection(pdf, 'Subject Breakdown', y)
      
      const headers = ['Subject', 'Correct', 'Total', 'Percentage']
      const rows = data.subjectBreakdown.map(subject => [
        subject.subject,
        subject.correct.toString(),
        subject.total.toString(),
        `${subject.percentage.toFixed(1)}%`
      ])
      
      y = this.addTable(pdf, headers, rows, y)
    }

    // Performance Analysis
    y = this.addSection(pdf, 'Performance Analysis', y)
    data.subjectBreakdown.forEach(subject => {
      y = this.addProgressBar(pdf, subject.subject, subject.percentage, y)
    })

    // Add new page if needed for questions
    if (y > 250) {
      pdf.addPage()
      y = 20
    }

    // Questions Review (first 5 questions)
    if (data.questions.length > 0) {
      y = this.addSection(pdf, 'Question Review (Sample)', y)
      
      data.questions.slice(0, 5).forEach((question, index) => {
        if (y > 250) {
          pdf.addPage()
          y = 20
        }
        
        y = this.addText(pdf, `Q${index + 1}: ${question.questionText}`, y, 11)
        y = this.addText(pdf, `Your Answer: ${question.selectedAnswer || 'Not answered'}`, y, 10)
        y = this.addText(pdf, `Correct Answer: ${question.correctAnswer}`, y, 10)
        y = this.addText(pdf, `Status: ${question.isCorrect ? 'Correct' : 'Incorrect'}`, y, 10)
        
        if (question.explanation) {
          y = this.addText(pdf, `Explanation: ${question.explanation}`, y, 9)
        }
        
        y += 5
      })
    }

    return pdf
  }

  // ==========================================
  // ANALYTICS REPORT TEMPLATE
  // ==========================================
  generateAnalyticsReportPDF(data: AnalyticsData): jsPDF {
    const pdf = new jsPDF()
    let y = 20

    // Header
    y = this.addTitle(pdf, 'Learning Analytics Report', y)
    y = this.addSubtitle(pdf, `${data.studentName} - ${new Date().toLocaleDateString()}`, y)
    y += 10

    // Overall Progress
    y = this.addSection(pdf, 'Overall Progress', y)
    y = this.addProgressBar(pdf, 'Overall Completion', data.overallProgress, y)
    y += 10

    // Subject Progress
    y = this.addSection(pdf, 'Subject Progress', y)
    data.subjects.forEach(subject => {
      y = this.addProgressBar(pdf, `${subject.name} (Target: ${subject.target}%)`, subject.progress, y)
    })
    y += 10

    // Performance Trends
    if (data.performanceData.length > 0) {
      y = this.addSection(pdf, 'Performance Trends', y)
      
      const headers = ['Date', 'Score', 'Percentage']
      const rows = data.performanceData.slice(-10).map(item => [
        new Date(item.date).toLocaleDateString(),
        item.score.toString(),
        `${item.percentage.toFixed(1)}%`
      ])
      
      y = this.addTable(pdf, headers, rows, y)
    }

    // Achievements
    const unlockedAchievements = data.achievements.filter(a => a.unlocked)
    if (unlockedAchievements.length > 0) {
      y = this.addSection(pdf, 'Achievements Unlocked', y)
      
      unlockedAchievements.forEach(achievement => {
        if (y > 270) {
          pdf.addPage()
          y = 20
        }
        
        y = this.addText(pdf, `✓ ${achievement.title}`, y, 11)
        y = this.addText(pdf, `   ${achievement.description}`, y, 9)
        y += 3
      })
    }

    return pdf
  }

  // ==========================================
  // PROGRESS REPORT TEMPLATE
  // ==========================================
  generateProgressReportPDF(data: any): jsPDF {
    const pdf = new jsPDF()
    let y = 20

    // Header
    y = this.addTitle(pdf, 'Progress Report', y)
    y = this.addSubtitle(pdf, `${data.studentName} - ${data.period}`, y)
    y += 10

    // Add progress report content here
    // This would be customized based on the specific progress data structure

    return pdf
  }
}

export const pdfTemplates = new PDFTemplates()
export default pdfTemplates