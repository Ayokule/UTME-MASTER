import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle,
  X,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from './Card'
import { Button } from './Button'
import { Progress } from './Progress'
import { PDFProgress } from '../../services/pdfService'

interface Props {
  isOpen: boolean
  onClose: () => void
  progress: PDFProgress | null
  error: string | null
  onRetry?: () => void
  onDownload?: () => void
}

export default function PDFProgressModal({
  isOpen,
  onClose,
  progress,
  error,
  onRetry,
  onDownload
}: Props) {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'preparing':
        return <FileText className="h-6 w-6 text-blue-500" />
      case 'capturing':
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
      case 'generating':
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
      case 'saving':
        return <Download className="h-6 w-6 text-green-500" />
      case 'complete':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      default:
        return <FileText className="h-6 w-6 text-gray-500" />
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'complete':
        return 'text-green-600'
      case 'saving':
        return 'text-green-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            <Card>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {error ? 'PDF Generation Failed' : 'Generating PDF'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="p-1 h-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Error State */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    {onRetry && (
                      <Button onClick={onRetry} variant="outline">
                        Try Again
                      </Button>
                    )}
                  </motion.div>
                )}

                {/* Progress State */}
                {!error && progress && (
                  <div className="space-y-6">
                    {/* Progress Icon and Message */}
                    <div className="text-center">
                      <motion.div
                        key={progress.stage}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4"
                      >
                        {getStageIcon(progress.stage)}
                      </motion.div>
                      
                      <h4 className={`text-lg font-medium mb-2 ${getStageColor(progress.stage)}`}>
                        {progress.stage === 'preparing' && 'Preparing Document'}
                        {progress.stage === 'capturing' && 'Capturing Content'}
                        {progress.stage === 'generating' && 'Generating PDF'}
                        {progress.stage === 'saving' && 'Finalizing'}
                        {progress.stage === 'complete' && 'Complete!'}
                      </h4>
                      
                      <p className="text-gray-600 text-sm">
                        {progress.message}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{progress.progress}%</span>
                      </div>
                      <Progress 
                        value={progress.progress} 
                        className="h-2"
                      />
                    </div>

                    {/* Stage Indicators */}
                    <div className="flex justify-between text-xs">
                      {['preparing', 'capturing', 'generating', 'saving', 'complete'].map((stage, index) => (
                        <div
                          key={stage}
                          className={`flex flex-col items-center space-y-1 ${
                            progress.stage === stage 
                              ? 'text-blue-600' 
                              : index < ['preparing', 'capturing', 'generating', 'saving', 'complete'].indexOf(progress.stage)
                                ? 'text-green-600'
                                : 'text-gray-400'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            progress.stage === stage 
                              ? 'bg-blue-600' 
                              : index < ['preparing', 'capturing', 'generating', 'saving', 'complete'].indexOf(progress.stage)
                                ? 'bg-green-600'
                                : 'bg-gray-300'
                          }`} />
                          <span className="capitalize">{stage}</span>
                        </div>
                      ))}
                    </div>

                    {/* Complete State Actions */}
                    {progress.stage === 'complete' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 pt-4"
                      >
                        {onDownload && (
                          <Button onClick={onDownload} className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                        <Button onClick={onClose} variant="outline" className="flex-1">
                          Close
                        </Button>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Loading State (no progress yet) */}
                {!error && !progress && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Initializing PDF generation...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}