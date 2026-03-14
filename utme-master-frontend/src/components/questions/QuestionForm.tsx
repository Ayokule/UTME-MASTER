import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { questionSchema, QuestionFormData } from '../../schemas/question'
import { Question, CreateQuestionData, UpdateQuestionData } from '../../types/question'
import { getSubjects, getTopicsBySubject } from '../../api/questions'
import { showToast } from '../ui/Toast'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import ImageUpload from './ImageUpload'
import RichTextEditor from '../RichTextEditor'

interface QuestionFormProps {
  question?: Question
  onSubmit: (data: CreateQuestionData | UpdateQuestionData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function QuestionForm({ question, onSubmit, onCancel, loading }: QuestionFormProps) {
  const [subjects, setSubjects] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState(question?.subject || '')
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [loadingTopics, setLoadingTopics] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid, isDirty }
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: question ? {
      subject: question.subject,
      topic: question.topic || '',
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      difficulty: question.difficulty,
      year: question.year,
      examType: question.examType,
      imageUrl: question.imageUrl || ''
    } : {
      subject: '',
      topic: '',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
      difficulty: 'Medium',
      year: undefined,
      examType: 'JAMB',
      imageUrl: ''
    }
  })

  const watchedSubject = watch('subject')
  const watchedCorrectAnswer = watch('correctAnswer')

  // Load subjects on mount
  useEffect(() => {
    loadSubjects()
  }, [])

  // Load topics when subject changes
  useEffect(() => {
    if (watchedSubject && watchedSubject !== selectedSubject) {
      setSelectedSubject(watchedSubject)
      loadTopics(watchedSubject)
      setValue('topic', '') // Clear topic when subject changes
    }
  }, [watchedSubject, selectedSubject, setValue])

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true)
      const subjectList = await getSubjects()
      setSubjects(subjectList)
      
      // If we have a question with a subject that's not in the list, add it
      if (question?.subject && !subjectList.includes(question.subject)) {
        setSubjects(prev => [...prev, question.subject!])
      }
    } catch (error) {
      console.error('Failed to load subjects:', error)
      showToast.error('Failed to load subjects')
      
      // Fallback to common subjects if API fails
      const fallbackSubjects = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature', 'Geography', 'History']
      setSubjects(fallbackSubjects)
      
      // If we have a question subject, make sure it's included
      if (question?.subject && !fallbackSubjects.includes(question.subject)) {
        setSubjects(prev => [...prev, question.subject!])
      }
    } finally {
      setLoadingSubjects(false)
    }
  }

  const loadTopics = async (subject: string) => {
    try {
      setLoadingTopics(true)
      const topicList = await getTopicsBySubject(subject)
      setTopics(topicList)
      
      // If we have a question with a topic that's not in the list, add it
      if (question?.topic && !topicList.includes(question.topic)) {
        setTopics(prev => [...prev, question.topic!])
      }
    } catch (error) {
      console.error('Failed to load topics:', error)
      setTopics([])
    } finally {
      setLoadingTopics(false)
    }
  }

  const onFormSubmit = async (data: QuestionFormData) => {
    try {
      // Remove empty imageUrl
      const submitData = {
        ...data,
        imageUrl: data.imageUrl || undefined,
        topic: data.topic || undefined,
        year: data.year || undefined
      }

      if (question) {
        await onSubmit({ id: question.id, ...submitData } as UpdateQuestionData)
      } else {
        await onSubmit(submitData as CreateQuestionData)
      }
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {question ? 'Edit Question' : 'Create New Question'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {question ? 'Update the question details below' : 'Fill in the details to create a new question'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {isDirty && (
                  <Badge variant="warning" size="sm">
                    Unsaved Changes
                  </Badge>
                )}
                {isValid && (
                  <Badge variant="success" size="sm">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Valid
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Basic Information */}
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                {loadingSubjects ? (
                  <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                    Loading subjects...
                  </div>
                ) : (
                  <>
                    <select
                      {...register('subject')}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                        errors.subject 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                      }`}
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                      <option value="__custom__">Other (type custom subject)</option>
                    </select>
                    
                    {/* Custom subject input */}
                    {watchedSubject === '__custom__' && (
                      <div className="mt-2">
                        <Input
                          placeholder="Enter custom subject name"
                          onChange={(e) => {
                            setValue('subject', e.target.value)
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic (Optional)
                </label>
                {loadingTopics ? (
                  <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                    Loading topics...
                  </div>
                ) : topics.length > 0 ? (
                  <>
                    <select
                      {...register('topic')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 focus:outline-none"
                    >
                      <option value="">Select a topic</option>
                      {topics.map(topic => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                      <option value="__custom__">Other (type custom topic)</option>
                    </select>
                    
                    {/* Custom topic input */}
                    {watch('topic') === '__custom__' && (
                      <div className="mt-2">
                        <Input
                          placeholder="Enter custom topic name"
                          onChange={(e) => {
                            setValue('topic', e.target.value)
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <Input
                    {...register('topic')}
                    placeholder="Enter topic (optional)"
                    disabled={!watchedSubject || watchedSubject === '__custom__'}
                  />
                )}
                {!watchedSubject && (
                  <p className="mt-1 text-sm text-gray-500">
                    Select a subject first to see available topics
                  </p>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty *
                </label>
                <select
                  {...register('difficulty')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Exam Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Type *
                </label>
                <select
                  {...register('examType')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 focus:outline-none"
                >
                  <option value="JAMB">JAMB</option>
                  <option value="WAEC">WAEC</option>
                  <option value="NECO">NECO</option>
                </select>
              </div>

              {/* Year */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year (Optional)
                </label>
                <Input
                  type="number"
                  min="2000"
                  max="2030"
                  {...register('year', { valueAsNumber: true })}
                  placeholder="e.g., 2023"
                  error={errors.year?.message}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Question Content */}
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Question Content</h3>
            
            {/* Question Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <Controller
                name="questionText"
                control={control}
                render={({ field }) => (
                  <>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter the question text here..."
                      height="300px"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {field.value.length} / 5000 characters
                    </p>
                  </>
                )}
              />
              {errors.questionText && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.questionText.message}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    disabled={loading}
                  />
                )}
              />
            </div>
          </Card>
        </motion.div>

        {/* Answer Options */}
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Answer Options</h3>
            
            <div className="space-y-6">
              {(['A', 'B', 'C', 'D'] as const).map((option) => (
                <div key={option} className="flex items-start space-x-4">
                  {/* Radio Button */}
                  <div className="flex items-center pt-3">
                    <input
                      type="radio"
                      {...register('correctAnswer')}
                      value={option}
                      className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 focus:ring-2"
                    />
                  </div>
                  
                  {/* Option Input with Rich Text Editor */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option {option} *
                      {watchedCorrectAnswer === option && (
                        <Badge variant="success" size="sm" className="ml-2">
                          Correct Answer
                        </Badge>
                      )}
                    </label>
                    <Controller
                      name={`option${option}`}
                      control={control}
                      render={({ field }) => (
                        <>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={`Enter option ${option}`}
                            height="120px"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {field.value.length} / 1000 characters
                          </p>
                        </>
                      )}
                    />
                    {errors[`option${option}`] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors[`option${option}`]?.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {errors.correctAnswer && (
              <p className="mt-4 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.correctAnswer.message}
              </p>
            )}
          </Card>
        </motion.div>

        {/* Explanation */}
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Explanation (Optional)</h3>
            
            <Controller
              name="explanation"
              control={control}
              render={({ field }) => (
                <>
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Provide an explanation for the correct answer (optional)"
                    height="200px"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {(field.value || '').length} / 3000 characters
                  </p>
                </>
              )}
            />
            <p className="mt-2 text-sm text-gray-500">
              This explanation will be shown to students after they answer the question.
            </p>
          </Card>
        </motion.div>

        {/* Form Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                {isDirty && (
                  <p className="text-sm text-gray-500">
                    You have unsaved changes
                  </p>
                )}
                
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!isValid}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{question ? 'Update Question' : 'Create Question'}</span>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </form>
    </motion.div>
  )
}