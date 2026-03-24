import { useState } from 'react'
import { Eye, Edit, Trash2, Calendar, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Question } from '../../types/question'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import SubjectBadge from './SubjectBadge'
import DifficultyBadge from './DifficultyBadge'
import DisplayQuestion from './DisplayQuestion'

interface QuestionCardProps {
  question: Question
  onEdit?: (question: Question) => void
  onDelete?: (question: Question) => void
  showActions?: boolean
}

export default function QuestionCard({ 
  question, 
  onEdit, 
  onDelete, 
  showActions = true 
}: QuestionCardProps) {
  const [showPreview, setShowPreview] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateText = (text: string | undefined, maxLength: number = 100) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const getCorrectAnswerText = () => {
    switch (question.correctAnswer) {
      case 'A': return question.optionA || ''
      case 'B': return question.optionB || ''
      case 'C': return question.optionC || ''
      case 'D': return question.optionD || ''
      default: return ''
    }
  }

  return (
    <>
      <Card hover className="group">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <SubjectBadge subject={question.subject} size="sm" />
              <DifficultyBadge difficulty={question.difficulty} size="sm" />
              <Badge variant="info" size="sm">
                {question.examType}
              </Badge>
            </div>
            
            {showActions && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                  className="!p-2"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(question)}
                    className="!p-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(question)}
                    className="!p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Question Text */}
          <div>
            <p className="text-gray-900 font-medium leading-relaxed">
              {truncateText(question.questionText)}
            </p>
            {question.topic && (
              <p className="text-sm text-gray-500 mt-1">
                Topic: {question.topic}
              </p>
            )}
          </div>

          {/* Options Preview */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={`p-2 rounded-lg ${question.correctAnswer === 'A' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <span className="font-medium">A:</span> {truncateText(question.optionA, 30)}
            </div>
            <div className={`p-2 rounded-lg ${question.correctAnswer === 'B' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <span className="font-medium">B:</span> {truncateText(question.optionB, 30)}
            </div>
            <div className={`p-2 rounded-lg ${question.correctAnswer === 'C' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <span className="font-medium">C:</span> {truncateText(question.optionC, 30)}
            </div>
            <div className={`p-2 rounded-lg ${question.correctAnswer === 'D' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <span className="font-medium">D:</span> {truncateText(question.optionD, 30)}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              {question.year && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{question.year}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(question.createdAt)}</span>
              </div>
            </div>
            
            <div className="text-gray-400">
              ID: {question?.id?.slice(-8) || 'N/A'}
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Question Preview"
        size="lg"
      >
        <div className="space-y-6">
          {/* Question Header */}
          <div className="flex flex-wrap items-center gap-2">
            <SubjectBadge subject={question.subject} />
            <DifficultyBadge difficulty={question.difficulty} />
            <Badge variant="info">{question.examType}</Badge>
            {question.year && (
              <Badge variant="secondary">{question.year}</Badge>
            )}
          </div>

          {/* Topic */}
          {question.topic && (
            <div>
              <span className="text-sm font-medium text-gray-600">Topic: </span>
              <span className="text-sm text-gray-900">{question.topic}</span>
            </div>
          )}

          {/* Display Question with Rich Text Support */}
          <DisplayQuestion question={question} showExplanation={true} />

          {/* Image */}
          {question.imageUrl && (
            <div>
              <img
                src={question.imageUrl}
                alt="Question illustration"
                className="w-full max-w-md mx-auto rounded-lg shadow-soft"
              />
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <span className="ml-2 text-gray-900">{formatDate(question.createdAt)}</span>
              </div>
              {question.updatedAt && (
                <div>
                  <span className="font-medium text-gray-600">Updated:</span>
                  <span className="ml-2 text-gray-900">{formatDate(question.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}