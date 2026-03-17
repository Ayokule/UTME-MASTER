// ==========================================
// PDF SERVICE
// ==========================================
// Comprehensive PDF generation and handling service

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

export interface PDFOptions {
  filename?: string
  format?: 'a4' | 'letter' | 'legal'
  orientation?: 'portrait' | 'landscape'
  quality?: number
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  includeHeader?: boolean
  includeFooter?: boolean
  watermark?: string
}

export interface PDFProgress {
  stage: 'preparing' | 'capturing' | 'generating' | 'saving' | 'complete'
  progress: number
  message: string
}

export type PDFProgressCallback = (progress: PDFProgress) => void

class PDFService {
  private defaultOptions: PDFOptions = {
    filename: 'document.pdf',
    format: 'a4',
    orientation: 'portrait',
    quality: 1.0,
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    includeHeader: true,
    includeFooter: true
  }

  // ==========================================
  // GENERATE PDF FROM HTML ELEMENT
  // ==========================================
  async generateFromElement(
    element: HTMLElement,
    options: Partial<PDFOptions> = {},
    onProgress?: PDFProgressCallback
  ): Promise<Blob> {
    const opts = { ...this.defaultOptions, ...options }
    
    try {
      // Stage 1: Preparing
      onProgress?.({
        stage: 'preparing',
        progress: 10,
        message: 'Preparing document for PDF generation...'
      })

      // Prepare element for capture
      const originalStyle = this.prepareElementForCapture(element)
      
      // Stage 2: Capturing
      onProgress?.({
        stage: 'capturing',
        progress: 30,
        message: 'Capturing document content...'
      })

      const canvas = await html2canvas(element, {
        scale: opts.quality,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      })

      // Restore original styles
      this.restoreElementStyles(element, originalStyle)

      // Stage 3: Generating PDF
      onProgress?.({
        stage: 'generating',
        progress: 60,
        message: 'Generating PDF document...'
      })

      const pdf = new jsPDF({
        orientation: opts.orientation,
        unit: 'mm',
        format: opts.format
      })

      const imgData = canvas.toDataURL('image/png')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Calculate dimensions
      const imgWidth = pdfWidth - opts.margins!.left - opts.margins!.right
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = opts.margins!.top

      // Add header if enabled
      if (opts.includeHeader) {
        this.addHeader(pdf, opts)
        position += 15
      }

      // Add content
      pdf.addImage(
        imgData,
        'PNG',
        opts.margins!.left,
        position,
        imgWidth,
        imgHeight
      )

      heightLeft -= (pdfHeight - position - opts.margins!.bottom)

      // Handle multiple pages
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + opts.margins!.top
        pdf.addPage()
        
        if (opts.includeHeader) {
          this.addHeader(pdf, opts)
        }
        
        pdf.addImage(
          imgData,
          'PNG',
          opts.margins!.left,
          opts.margins!.top + (opts.includeHeader ? 15 : 0),
          imgWidth,
          imgHeight,
          '',
          'FAST',
          0,
          position
        )
        
        heightLeft -= (pdfHeight - opts.margins!.top - opts.margins!.bottom)
      }

      // Add footer if enabled
      if (opts.includeFooter) {
        this.addFooter(pdf, opts)
      }

      // Add watermark if specified
      if (opts.watermark) {
        this.addWatermark(pdf, opts.watermark)
      }

      // Stage 4: Saving
      onProgress?.({
        stage: 'saving',
        progress: 90,
        message: 'Finalizing PDF...'
      })

      const pdfBlob = pdf.output('blob')

      // Stage 5: Complete
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'PDF generated successfully!'
      })

      return pdfBlob
    } catch (error) {
      console.error('PDF generation failed:', error)
      throw new Error('Failed to generate PDF: ' + (error as Error).message)
    }
  }

  // ==========================================
  // GENERATE PDF FROM DATA
  // ==========================================
  async generateFromData(
    data: any,
    template: 'exam-results' | 'analytics-report' | 'progress-report',
    options: Partial<PDFOptions> = {},
    onProgress?: PDFProgressCallback
  ): Promise<Blob> {
    const opts = { ...this.defaultOptions, ...options }
    
    try {
      onProgress?.({
        stage: 'preparing',
        progress: 10,
        message: 'Preparing data for PDF generation...'
      })

      const pdf = new jsPDF({
        orientation: opts.orientation,
        unit: 'mm',
        format: opts.format
      })

      onProgress?.({
        stage: 'generating',
        progress: 30,
        message: 'Generating PDF content...'
      })

      switch (template) {
        case 'exam-results':
          await this.generateExamResultsPDF(pdf, data, opts, onProgress)
          break
        case 'analytics-report':
          await this.generateAnalyticsReportPDF(pdf, data, opts, onProgress)
          break
        case 'progress-report':
          await this.generateProgressReportPDF(pdf, data, opts, onProgress)
          break
        default:
          throw new Error('Unknown PDF template: ' + template)
      }

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'PDF generated successfully!'
      })

      return pdf.output('blob')
    } catch (error) {
      console.error('PDF generation from data failed:', error)
      throw new Error('Failed to generate PDF: ' + (error as Error).message)
    }
  }

  // ==========================================
  // DOWNLOAD PDF
  // ==========================================
  async downloadPDF(
    blob: Blob,
    filename: string,
    onProgress?: PDFProgressCallback
  ): Promise<void> {
    try {
      onProgress?.({
        stage: 'saving',
        progress: 95,
        message: 'Downloading PDF...'
      })

      saveAs(blob, filename)

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'PDF downloaded successfully!'
      })
    } catch (error) {
      console.error('PDF download failed:', error)
      throw new Error('Failed to download PDF: ' + (error as Error).message)
    }
  }

  // ==========================================
  // PRINT PDF
  // ==========================================
  async printPDF(blob: Blob): Promise<void> {
    try {
      const url = URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
          URL.revokeObjectURL(url)
        }
      } else {
        throw new Error('Failed to open print window')
      }
    } catch (error) {
      console.error('PDF print failed:', error)
      throw new Error('Failed to print PDF: ' + (error as Error).message)
    }
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================
  private prepareElementForCapture(element: HTMLElement): string {
    const originalStyle = element.style.cssText
    
    // Apply print-friendly styles
    element.style.cssText += `
      background: white !important;
      color: black !important;
      font-family: Arial, sans-serif !important;
      line-height: 1.4 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    `
    
    // Hide non-printable elements
    const nonPrintableElements = element.querySelectorAll(
      '.no-print, .hide-print, button:not(.print-button), .sidebar, .navigation'
    )
    
    nonPrintableElements.forEach(el => {
      (el as HTMLElement).style.display = 'none'
    })
    
    return originalStyle
  }

  private restoreElementStyles(element: HTMLElement, originalStyle: string): void {
    element.style.cssText = originalStyle
    
    // Restore hidden elements
    const hiddenElements = element.querySelectorAll('[style*="display: none"]')
    hiddenElements.forEach(el => {
      (el as HTMLElement).style.display = ''
    })
  }

  private addHeader(pdf: jsPDF, options: PDFOptions): void {
    const pageWidth = pdf.internal.pageSize.getWidth()
    
    pdf.setFontSize(12)
    pdf.setTextColor(100, 100, 100)
    pdf.text('UTME Master Platform', options.margins!.left, 15)
    pdf.text(new Date().toLocaleDateString(), pageWidth - options.margins!.right - 30, 15)
    
    // Add line under header
    pdf.setDrawColor(200, 200, 200)
    pdf.line(options.margins!.left, 18, pageWidth - options.margins!.right, 18)
  }

  private addFooter(pdf: jsPDF, options: PDFOptions): void {
    const pageHeight = pdf.internal.pageSize.getHeight()
    const pageWidth = pdf.internal.pageSize.getWidth()
    
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    
    // Add line above footer
    pdf.setDrawColor(200, 200, 200)
    pdf.line(options.margins!.left, pageHeight - 15, pageWidth - options.margins!.right, pageHeight - 15)
    
    pdf.text('Generated by UTME Master', options.margins!.left, pageHeight - 8)
    pdf.text(`Page ${pdf.getCurrentPageInfo().pageNumber}`, pageWidth - options.margins!.right - 20, pageHeight - 8)
  }

  private addWatermark(pdf: jsPDF, watermarkText: string): void {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    pdf.setFontSize(50)
    pdf.setTextColor(200, 200, 200)
    pdf.text(watermarkText, pageWidth / 2, pageHeight / 2, {
      angle: 45,
      align: 'center'
    })
  }

  private async generateExamResultsPDF(
    pdf: jsPDF,
    data: any,
    options: PDFOptions,
    onProgress?: PDFProgressCallback
  ): Promise<void> {
    // Implementation for exam results PDF template
    onProgress?.({
      stage: 'generating',
      progress: 50,
      message: 'Generating exam results PDF...'
    })
    
    // Add content specific to exam results
    // This would include score, subject breakdown, etc.
  }

  private async generateAnalyticsReportPDF(
    pdf: jsPDF,
    data: any,
    options: PDFOptions,
    onProgress?: PDFProgressCallback
  ): Promise<void> {
    // Implementation for analytics report PDF template
    onProgress?.({
      stage: 'generating',
      progress: 50,
      message: 'Generating analytics report PDF...'
    })
  }

  private async generateProgressReportPDF(
    pdf: jsPDF,
    data: any,
    options: PDFOptions,
    onProgress?: PDFProgressCallback
  ): Promise<void> {
    // Implementation for progress report PDF template
    onProgress?.({
      stage: 'generating',
      progress: 50,
      message: 'Generating progress report PDF...'
    })
  }
}

export const pdfService = new PDFService()
export default pdfService