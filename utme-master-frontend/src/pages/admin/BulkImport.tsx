import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  Info
} from 'lucide-react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { showToast } from '../../components/ui/Toast'
import apiClient from '../../api/client'

interface ImportResult {
  row: number
  success: boolean
  questionText?: string
  error?: string
  warnings?: string[]
}

interface ImportStatistics {
  totalRows: number
  successCount: number
  errorCount: number
  warningCount: number
  duplicatesSkipped: number
  subjectsProcessed: string[]
  topicsCreated: string[]
  results: ImportResult[]
  summary: {
    totalProcessed: number
    successful: number
    failed: number
    warnings: number
    duplicatesSkipped: number
    subjectsProcessed: number
    topicsCreated: number
  }
}

export default function BulkImport() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<ImportStatistics | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv', // .csv
        'application/csv'
      ]
      
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop()
      const allowedExtensions = ['xlsx', 'xls', 'csv']
      
      if (!allowedExtensions.includes(fileExtension || '')) {
        showToast.error('Invalid file type. Please select an Excel (.xlsx, .xls) or CSV (.csv) file.')
        return
      }
      
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        showToast.error('File too large. Maximum size is 10MB.')
        return
      }
      
      setFile(selectedFile)
      setResults(null) // Clear previous results
    }
  }

  const handleUpload = async () => {
    if (!file) {
      showToast.error('Please select a file first')
      return
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/import/questions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setResults(response.data.data)
      
      if (response.data.data.successCount > 0) {
        showToast.success(`Successfully imported ${response.data.data.successCount} questions!`)
      }
      
      if (response.data.data.errorCount > 0) {
        showToast.error(`${response.data.data.errorCount} questions failed to import. Check details below.`)
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed'
      showToast.error(errorMessage)
      
      // If there's partial data in the error response, show it
      if (error.response?.data?.data) {
        setResults(error.response.data.data)
      }
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      const response = await apiClient.get('/import/template', {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'question_import_template.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      showToast.success('Template downloaded successfully!')
    } catch (error: any) {
      showToast.error('Failed to download template')
    }
  }

  const resetUpload = () => {
    setFile(null)
    setResults(null)
    setShowDetails(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStatusIcon = (result: ImportResult) => {
    if (result.success) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    } else {
      return <XCircle className="w-4 h-4 text-red-600" />
    }
  }

  const getStatusColor = (result: ImportResult) => {
    if (result.success) {
      return result.warnings && result.warnings.length > 0 
        ? 'border-l-yellow-500 bg-yellow-50' 
        : 'border-l-green-500 bg-green-50'
    } else {
      return 'border-l-red-500 bg-red-50'
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="p-3 bg-primary-100 rounded-lg">
            <Upload className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Question Import</h1>
            <p className="text-gray-600">Import questions from Excel or CSV files</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="w-5 h-5 text-blue-600 mr-2" />
                How to Import Questions
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-sm font-semibold text-primary-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Download Template</p>
                    <p className="text-sm text-gray-600">Get the Excel template with the correct format and example data</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-sm font-semibold text-primary-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Fill Your Data</p>
                    <p className="text-sm text-gray-600">Add your questions following the template format</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-sm font-semibold text-primary-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Upload & Import</p>
                    <p className="text-sm text-gray-600">Select your file and click import to process</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Required Columns:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  <span>• subjectCode (MTH, ENG, PHY, etc.)</span>
                  <span>• questionText</span>
                  <span>• optionA, optionB, optionC, optionD</span>
                  <span>• correctAnswer (A, B, C, or D)</span>
                  <span>• difficulty (EASY, MEDIUM, HARD)</span>
                  <span>• examType (JAMB, WAEC, NECO)</span>
                </div>
              </div>
            </Card>

            {/* Upload Area */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload File</h2>
              
              <div className="space-y-4">
                {/* File Input */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  
                  {file ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto" />
                      <p className="text-lg font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2"
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-lg font-medium text-gray-900">Choose a file to upload</p>
                      <p className="text-sm text-gray-600">Excel (.xlsx, .xls) or CSV files up to 10MB</p>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2"
                      >
                        Select File
                      </Button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="flex-1"
                  >
                    {uploading ? 'Importing...' : 'Import Questions'}
                  </Button>
                  
                  {(file || results) && (
                    <Button
                      variant="outline"
                      onClick={resetUpload}
                      disabled={uploading}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Template */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Template</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download the Excel template with example questions and correct formatting.
              </p>
              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </Card>

            {/* File Requirements */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Excel (.xlsx, .xls) or CSV files</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Maximum file size: 10MB</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Maximum 1000 questions per file</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Duplicate detection included</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Summary Statistics */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 text-primary-600 mr-2" />
                  Import Results
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{results.summary.totalProcessed}</p>
                  <p className="text-sm text-blue-800">Total Processed</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{results.summary.successful}</p>
                  <p className="text-sm text-green-800">Successful</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{results.summary.failed}</p>
                  <p className="text-sm text-red-800">Failed</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{results.summary.warnings}</p>
                  <p className="text-sm text-yellow-800">Warnings</p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Duplicates Skipped:</span>
                  <span className="font-semibold">{results.summary.duplicatesSkipped}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Subjects Processed:</span>
                  <span className="font-semibold">{results.summary.subjectsProcessed}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Topics Created:</span>
                  <span className="font-semibold">{results.summary.topicsCreated}</span>
                </div>
              </div>
            </Card>

            {/* Detailed Results */}
            {showDetails && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Results</h3>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 border-l-4 rounded-r-lg ${getStatusColor(result)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getStatusIcon(result)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                Row {result.row}
                              </span>
                              {result.success && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Success
                                </span>
                              )}
                            </div>
                            
                            {result.questionText && (
                              <p className="text-sm text-gray-600 mt-1">
                                {result.questionText}
                              </p>
                            )}
                            
                            {result.error && (
                              <p className="text-sm text-red-600 mt-1">
                                {result.error}
                              </p>
                            )}
                            
                            {result.warnings && result.warnings.length > 0 && (
                              <div className="mt-2">
                                {result.warnings.map((warning, wIndex) => (
                                  <div key={wIndex} className="flex items-center space-x-1 text-xs text-yellow-700">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>{warning}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  )
}