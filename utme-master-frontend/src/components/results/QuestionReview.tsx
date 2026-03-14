import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  Clock,
  Award
} from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Pagination from '../ui/Pagination'
import { QuestionResult } from '../../types/results'

interface Props {
  questions: QuestionResult[]
}

type FilterType = 'all' | 'correct' | 'wrong'

export default function QuestionReview({ questions }: Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<FilterType>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  
  const questionsPerPage = 10

  // Get unique subjects
  const subjects = Array.from(new Set(questions.map(q => q.subject)))

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    const matchesFilter = filter === 'all' || 
      (filter === 'correct' && question.isCorrect) ||
      (filter === 'wrong' && !question.isCorrect)
    
    const matchesSubject = subjectFilter === 'all' || question.subject === subjectFilter
    
    return matchesFilter && matchesSubject
  })

  // Paginate questions
  const totalPages = Math.ceil((filteredQuestions || []).length / questionsPerPage)
  const startIndex = (currentPage - 1) * questionsPerPage
  const paginatedQuestions = (filteredQuestions || []).slice(startIndex, startIndex + questionsPerPage)

  const toggleExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'success'
      case 'Medium': return 'warning'
      case 'Hard': return 'error'
      default: return 'secondary'
    }
  }

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Question Review</h3>
          <p className="text-gray-600">Detailed analysis of your answers</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          {/* Answer Filter */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Questions' },
              { key: 'correct', label: 'Correct Only' },
              { key: 'wrong', label: 'Wrong Only' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={filter === key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilter(key as FilterType)
                  setCurrentPage(1)
                }}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredQuestions.length} of {questions.length} questions
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          <AnimatePresence>
            {paginatedQuestions.map((question, index) => {
              const isExpanded = expandedQuestions.has(question.id)
              const globalIndex = startIndex + index + 1

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border rounded-xl p-4 ${
                    question.isCorrect 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        question.isCorrect 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {question.isCorrect ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Question {globalIndex}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" size="sm">
                            {question.subject}
                          </Badge>
                          <Badge variant={getDifficultyColor(question.difficulty)} size="sm">
                            {question.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Award className="w-3 h-3" />
                          <span>{question.pointsEarned} pts</span>
                        </div>
                        {question.timeSpent && (
                          <div className="flex items-center space-x-1 text-gray-600 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(question.timeSpent)}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(question.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Question Text (Always Visible) */}
                  <div className="mb-3">
                    <p className="text-gray-800 font-medium">
                      {question.questionText}
                    </p>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t border-gray-200">
                          {/* Options */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {question.options.map((option) => {
                              const isSelected = question.selectedAnswer === option.label
                              const isCorrect = question.correctAnswer === option.label
                              
                              let optionClass = 'p-3 rounded-lg border '
                              if (isCorrect) {
                                optionClass += 'border-green-300 bg-green-100 text-green-800'
                              } else if (isSelected && !isCorrect) {
                                optionClass += 'border-red-300 bg-red-100 text-red-800'
                              } else {
                                optionClass += 'border-gray-200 bg-white text-gray-700'
                              }

                              return (
                                <div key={option.label} className={optionClass}>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold">{option.label}.</span>
                                    <span>{option.text}</span>
                                    {isCorrect && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
                                    {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600 ml-auto" />}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Answer Summary */}
                          <div className="bg-white rounded-lg p-3 mb-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Your Answer: </span>
                                <span className={`font-semibold ${
                                  question.isCorrect ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {question.selectedAnswer || 'Not answered'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Correct Answer: </span>
                                <span className="font-semibold text-green-600">
                                  {question.correctAnswer}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Explanation */}
                          {question.explanation && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h5 className="font-semibold text-blue-900 mb-2">Explanation:</h5>
                              <p className="text-blue-800 text-sm leading-relaxed">
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredQuestions.length}
              pageSize={questionsPerPage}
            />
          </div>
        )}

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Filter className="w-12 h-12 mx-auto" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h4>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}