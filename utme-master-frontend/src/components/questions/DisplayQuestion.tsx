import { lazy, Suspense } from 'react'
import { Question } from '../../types/question'

// Lazy load RichTextEditor to reduce bundle size
const RichTextEditor = lazy(() => import('../RichTextEditor'))

interface DisplayQuestionProps {
  question: Question
  showExplanation?: boolean
}

export default function DisplayQuestion({ question, showExplanation = true }: DisplayQuestionProps) {
  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <h2 className="text-xl font-bold mb-4">Question:</h2>
        <Suspense fallback={<div className="bg-gray-100 rounded-lg animate-pulse h-32" />}>
          <RichTextEditor
            value={question.questionText}
            onChange={() => {}} // No-op for read-only
            readOnly={true}
            height="auto"
          />
        </Suspense>
      </div>

      {/* Answer Options */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Options:</h3>
        <div className="space-y-3">
          {['A', 'B', 'C', 'D'].map((option) => {
            const optionKey = `option${option}` as keyof Question
            const optionValue = question[optionKey]
            
            if (!optionValue) return null
            
            return (
              <div key={option} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-700 font-semibold">
                    {option}
                  </span>
                </div>
                <div className="flex-1">
                  <Suspense fallback={<div className="bg-gray-100 rounded-lg animate-pulse h-16" />}>
                    <RichTextEditor
                      value={optionValue as string}
                      onChange={() => {}}
                      readOnly={true}
                      height="auto"
                    />
                  </Suspense>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && question.explanation && (
        <div>
          <h3 className="text-lg font-semibold mt-6 mb-2">Explanation:</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Suspense fallback={<div className="bg-gray-100 rounded-lg animate-pulse h-24" />}>
              <RichTextEditor
                value={question.explanation}
                onChange={() => {}}
                readOnly={true}
                height="auto"
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}
