import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Download, Filter, Search, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { showToast } from '../../components/ui/Toast'
import { useAuthStore } from '../../store/auth'

interface ImportResult {
  totalRows: number
  successCount: number
  errorCount: number
  results: Array<{
    row: number
    success: boolean
    questionText?: string
    error?: string
  }>
}

interface ExportFilters {
  subjects: string[]
  difficulty: string[]
  examType: string[]
  year: string
  searchTerm: string
}

export default function BulkImport() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'export' ? 'export' : 'import'
  const [activeTab, setActiveTab] = useState<'import' | 'export'>(initialTab)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [exportFilters, setExportFilters] = useState<ExportFilters>({
    subjects: [],
    difficulty: [],
    examType: [],
    year: '',
    searchTerm: ''
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const files = e.dataTransfer.files
      if (files && files[0]) {
        const droppedFile = files[0]
        const isValidType = droppedFile.type === 'text/csv' ||
          droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          droppedFile.name.endsWith('.csv') ||
          droppedFile.name.endsWith('.xlsx') ||
          droppedFile.name.endsWith('.xls')
      
        if (isValidType) {
          setFile(droppedFile)
          showToast.success('File selected: ' + droppedFile.name)
        } else {
          showToast.error('Please upload a CSV or Excel file')
        }
      }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0]
        const isValidType = selectedFile.type === 'text/csv' ||
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          selectedFile.name.endsWith('.csv') ||
          selectedFile.name.endsWith('.xlsx') ||
          selectedFile.name.endsWith('.xls')
      
        if (isValidType) {
          setFile(selectedFile)
          showToast.success('File selected: ' + selectedFile.name)
        } else {
          showToast.error('Please upload a CSV or Excel file')
        }
      }
    }

    const handleUpload = async () => {
      if (!file) {
        showToast.error('Please select a file')
        return
      }

      try {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        const token = useAuthStore.getState().token
        const response = await fetch('http://localhost:3000/api/import/questions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        const data = await response.json()

        if (data.success) {
          setResult({
            totalRows: data.data.totalRows,
            successCount: data.data.successCount,
            errorCount: data.data.errorCount,
            results: data.data.results
          })
          showToast.success(data.message)
        } else {
          showToast.error(data.message || 'Import failed')
        }
      } catch (error: any) {
        showToast.error(error.message || 'Failed to upload file')
      } finally {
        setUploading(false)
      }
    }

    const downloadTemplate = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/import/template')
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'question_import_template.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showToast.success('Template downloaded')
      } catch (error: any) {
        showToast.error('Failed to download template')
      }
    }

    const handleExport = async (format: 'csv' | 'excel') => {
      try {
        setExporting(true)
      
        const queryParams = new URLSearchParams()
        if (exportFilters.subjects.length > 0) {
          queryParams.append('subjects', exportFilters.subjects.join(','))
        }
        if (exportFilters.difficulty.length > 0) {
          queryParams.append('difficulty', exportFilters.difficulty.join(','))
        }
        if (exportFilters.examType.length > 0) {
          queryParams.append('examType', exportFilters.examType.join(','))
        }
        if (exportFilters.year) {
          queryParams.append('year', exportFilters.year)
        }
        if (exportFilters.searchTerm) {
          queryParams.append('search', exportFilters.searchTerm)
        }
        queryParams.append('format', format)

        const token = useAuthStore.getState().token
        const response = await fetch(`http://localhost:3000/api/export/questions?${queryParams}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Export failed')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `questions_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showToast.success(`Questions exported as ${format.toUpperCase()}`)
      } catch (error: any) {
        showToast.error('Failed to export questions')
      } finally {
        setExporting(false)
      }
    }

    const handleFilterChange = (key: keyof ExportFilters, value: any) => {
      setExportFilters(prev => ({
        ...prev,
        [key]: value
      }))
    }

    const toggleArrayFilter = (key: 'subjects' | 'difficulty' | 'examType', value: string) => {
      setExportFilters(prev => ({
        ...prev,
        [key]: prev[key].includes(value)
          ? prev[key].filter(item => item !== value)
          : [...prev[key], value]
      }))
    }

    return (
      <Layout>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/admin/questions">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Questions</span>
                  </Button>
                </Link>
              
                <div className="w-px h-6 bg-gray-300"></div>
              
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    Question Import & Export
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Bulk import questions from files or export existing questions
                  </p>
                </div>
              </div>
            
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-200">
                <Upload className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  Bulk Operations
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('import')}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'import'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Upload className="w-4 h-4" />
                <span>Import Questions</span>
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'export'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Download className="w-4 h-4" />
                <span>Export Questions</span>
              </button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'import' ? (
              <motion.div
                key="import"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {!result ? (
                  <>
                    {/* Upload Area */}
                    <motion.div variants={itemVariants}>
                      <Card className="p-8 mb-6 shadow-lg">
                        <div
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${dragActive
                              ? 'border-primary-500 bg-primary-50 scale-105'
                              : 'border-gray-300 bg-gray-50'
                            }`}
                        >
                          <motion.div
                            animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          </motion.div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Drag and drop your file here
                          </h3>
                          <p className="text-gray-600 mb-4">Supports CSV, Excel (.xlsx, .xls) files</p>
                          <label className="inline-block">
                            <input
                              type="file"
                              accept=".csv,.xlsx,.xls"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200 font-medium"
                            >
                              Browse Files
                            </motion.span>
                          </label>
                        </div>

                        <AnimatePresence>
                          {file && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl"
                            >
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                  <p className="font-medium text-green-900">{file.name}</p>
                                  <p className="text-sm text-green-700">
                                    {(file.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>

                    {/* Instructions */}
                    <motion.div variants={itemVariants}>
                      <Card className="p-6 mb-6 bg-blue-50 border-blue-200 shadow-lg">
                        <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          File Format Requirements
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-blue-800 mb-2">Supported Formats</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• CSV (.csv)</li>
                              <li>• Excel (.xlsx, .xls)</li>
                              <li>• Maximum file size: 5MB</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-800 mb-2">Required Columns</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• subjectCode (MTH, ENG, PHY, etc.)</li>
                              <li>• questionText</li>
                              <li>• optionA, optionB, optionC, optionD</li>
                              <li>• correctAnswer (A, B, C, or D)</li>
                              <li>• difficulty (EASY, MEDIUM, HARD)</li>
                              <li>• examType (JAMB, WAEC, NECO)</li>
                            </ul>
                          </div>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div variants={itemVariants} className="flex gap-4">
                      <Button
                        onClick={downloadTemplate}
                        variant="outline"
                        className="flex-1 border-2 hover:shadow-lg transition-all duration-200"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-lg transition-all duration-200"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Import Questions'}
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Results */}
                    <Card className="p-8 mb-6 shadow-lg">
                      <div className="text-center mb-8">
                        {result.errorCount === 0 ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          >
                            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          >
                            <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                          </motion.div>
                        )}
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Import Complete
                        </h2>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="p-6 bg-green-50 border border-green-200 rounded-xl text-center"
                        >
                          <p className="text-3xl font-bold text-green-600">{result.successCount}</p>
                          <p className="text-sm text-green-700 font-medium">Questions Imported</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className={`p-6 rounded-xl text-center ${result.errorCount > 0
                              ? 'bg-red-50 border border-red-200'
                              : 'bg-gray-50 border border-gray-200'
                            }`}
                        >
                          <p className={`text-3xl font-bold ${result.errorCount > 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                            {result.errorCount}
                          </p>
                          <p className={`text-sm font-medium ${result.errorCount > 0 ? 'text-red-700' : 'text-gray-700'
                            }`}>
                            Failed
                          </p>
                        </motion.div>
                      </div>

                      {result.errorCount > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl"
                        >
                          <h3 className="font-semibold text-red-900 mb-3">Errors</h3>
                          <ul className="text-sm text-red-800 space-y-1 max-h-48 overflow-y-auto">
                            {(result.results || [])
                              .filter(r => !r.success)
                              .slice(0, 10)
                              .map((error, i) => (
                                <li key={i}>• Row {error.row}: {error.error}</li>
                              ))}
                            {result.results.filter(r => !r.success).length > 10 && (
                              <li>• ... and {result.results.filter(r => !r.success).length - 10} more errors</li>
                            )}
                          </ul>
                        </motion.div>
                      )}

                      <div className="flex gap-4">
                        <Button
                          onClick={() => {
                            setResult(null)
                            setFile(null)
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Import Another File
                        </Button>
                        <Link to="/admin/questions" className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600">
                            View Questions
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="export"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Export Filters */}
                <motion.div variants={itemVariants}>
                  <Card className="p-6 mb-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Filter className="w-5 h-5 text-primary-600" />
                      Export Filters
                    </h3>
                  
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Search */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search Questions
                        </label>
                        <Input
                          type="text"
                          placeholder="Search by question text..."
                          value={exportFilters.searchTerm}
                          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                          icon={<Search className="w-4 h-4" />}
                        />
                      </div>

                      {/* Year */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 2024"
                          value={exportFilters.year}
                          onChange={(e) => handleFilterChange('year', e.target.value)}
                        />
                      </div>

                      {/* Subjects */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subjects
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['MTH', 'ENG', 'PHY', 'CHM', 'BIO'].map(subject => (
                            <button
                              key={subject}
                              onClick={() => toggleArrayFilter('subjects', subject)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${exportFilters.subjects.includes(subject)
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Difficulty
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['EASY', 'MEDIUM', 'HARD'].map(difficulty => (
                            <button
                              key={difficulty}
                              onClick={() => toggleArrayFilter('difficulty', difficulty)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${exportFilters.difficulty.includes(difficulty)
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {difficulty}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Exam Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['JAMB', 'WAEC', 'NECO'].map(examType => (
                            <button
                              key={examType}
                              onClick={() => toggleArrayFilter('examType', examType)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${exportFilters.examType.includes(examType)
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {examType}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Export Actions */}
                <motion.div variants={itemVariants}>
                  <Card className="p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Download className="w-5 h-5 text-primary-600" />
                      Export Options
                    </h3>
                  
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => handleExport('csv')}
                        disabled={exporting}
                        variant="outline"
                        className="h-20 flex-col space-y-2 border-2 hover:shadow-lg transition-all duration-200"
                      >
                        <FileText className="w-6 h-6" />
                        <div className="text-center">
                          <div className="font-medium">Export as CSV</div>
                          <div className="text-xs text-gray-500">Comma-separated values</div>
                        </div>
                      </Button>
                    
                      <Button
                        onClick={() => handleExport('excel')}
                        disabled={exporting}
                        className="h-20 flex-col space-y-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg transition-all duration-200"
                      >
                        <FileText className="w-6 h-6" />
                        <div className="text-center">
                          <div className="font-medium">Export as Excel</div>
                          <div className="text-xs text-green-100">Microsoft Excel format</div>
                        </div>
                      </Button>
                    </div>
                  
                    {exporting && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-blue-700 font-medium">Preparing export...</span>
                        </div>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Layout>
    )
  }