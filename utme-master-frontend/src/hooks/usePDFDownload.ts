import { useState, useCallback } from 'react'
import { pdfService, PDFOptions, PDFProgress } from '../services/pdfService'
import { showToast } from '../components/ui/Toast'

interface UsePDFDownloadOptions {
  onSuccess?: (blob: Blob) => void
  onError?: (error: Error) => void
  onProgress?: (progress: PDFProgress) => void
}

export function usePDFDownload(options: UsePDFDownloadOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<PDFProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null)

  const handleProgress = useCallback((progress: PDFProgress) => {
    setProgress(progress)
    options.onProgress?.(progress)
  }, [options])

  const generateFromElement = useCallback(async (
    element: HTMLElement,
    pdfOptions: Partial<PDFOptions> = {}
  ) => {
    try {
      setIsGenerating(true)
      setError(null)
      setProgress(null)
      setGeneratedBlob(null)

      const blob = await pdfService.generateFromElement(
        element,
        pdfOptions,
        handleProgress
      )

      setGeneratedBlob(blob)
      options.onSuccess?.(blob)
      showToast.success('PDF generated successfully!')
      
      return blob
    } catch (err) {
      const error = err as Error
      setError(error.message)
      options.onError?.(error)
      showToast.error('Failed to generate PDF: ' + error.message)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }, [handleProgress, options])

  const generateFromData = useCallback(async (
    data: any,
    template: 'exam-results' | 'analytics-report' | 'progress-report',
    pdfOptions: Partial<PDFOptions> = {}
  ) => {
    try {
      setIsGenerating(true)
      setError(null)
      setProgress(null)
      setGeneratedBlob(null)

      const blob = await pdfService.generateFromData(
        data,
        template,
        pdfOptions,
        handleProgress
      )

      setGeneratedBlob(blob)
      options.onSuccess?.(blob)
      showToast.success('PDF generated successfully!')
      
      return blob
    } catch (err) {
      const error = err as Error
      setError(error.message)
      options.onError?.(error)
      showToast.error('Failed to generate PDF: ' + error.message)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }, [handleProgress, options])

  const downloadPDF = useCallback(async (
    blob?: Blob,
    filename?: string
  ) => {
    try {
      const pdfBlob = blob || generatedBlob
      if (!pdfBlob) {
        throw new Error('No PDF available to download')
      }

      await pdfService.downloadPDF(
        pdfBlob,
        filename || 'document.pdf',
        handleProgress
      )

      showToast.success('PDF downloaded successfully!')
    } catch (err) {
      const error = err as Error
      setError(error.message)
      showToast.error('Failed to download PDF: ' + error.message)
      throw error
    }
  }, [generatedBlob, handleProgress])

  const printPDF = useCallback(async (blob?: Blob) => {
    try {
      const pdfBlob = blob || generatedBlob
      if (!pdfBlob) {
        throw new Error('No PDF available to print')
      }

      await pdfService.printPDF(pdfBlob)
      showToast.success('PDF sent to printer!')
    } catch (err) {
      const error = err as Error
      setError(error.message)
      showToast.error('Failed to print PDF: ' + error.message)
      throw error
    }
  }, [generatedBlob])

  const reset = useCallback(() => {
    setIsGenerating(false)
    setProgress(null)
    setError(null)
    setGeneratedBlob(null)
  }, [])

  return {
    // State
    isGenerating,
    progress,
    error,
    generatedBlob,
    
    // Actions
    generateFromElement,
    generateFromData,
    downloadPDF,
    printPDF,
    reset
  }
}

export default usePDFDownload