import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, CheckCircle, AlertCircle, Save, ArrowLeft } from 'lucide-react'
import { Question, CreateQuestionData, UpdateQuestionData } from '../../types/question'
import { getSubjects } from '../../api/questions'
import Button from '../ui/Button'
import Card from '../ui/Card'
import MinimalRichEditor from '../form/MinimalRichEditor'

// ── Schema ──────────────────────────────────────────────────────────────────
const optionSchema = z.object({
  label: z.string(),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean()
})

const formSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().optional(),
  questionText: z.string().min(10, 'Question must be at least 10 characters'),
  options: z.array(optionSchema).min(2, 'At least 2 options required').max(10),
  explanation: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  year: z.number().min(2000).max(2030).optional(),
  examType: z.enum(['JAMB', 'WAEC', 'NECO']),
  imageUrl: z.string().url().optional().or(z.literal(''))
}).refine(d => d.options.some(o => o.isCorrect), {
  message: 'Select at least one correct answer',
  path: ['options']
})

type FormData = z.infer<typeof formSchema>

// ── Option labels ────────────────────────────────────────────────────────────
const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  question?: Question
  onSubmit: (data: CreateQuestionData | UpdateQuestionData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const FALLBACK_SUBJECTS = [
  'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Government', 'Literature in English', 'Geography', 'History',
  'Agricultural Science', 'Commerce', 'Accounting', 'Further Mathematics', 'CRS/IRS'
]

function buildDefaultOptions(q?: Question) {
  // Already a proper array
  if (Array.isArray(q?.options) && q!.options.length > 0) {
    return q!.options.map(o => ({
      label: o.label,
      text: o.text || '',
      isCorrect: o.isCorrect ?? (o.label === q!.correctAnswer)
    }))
  }
  // Backend returns options as object { A: { text: '...' }, B: { text: '...' } }
  if (q?.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
    const obj = q.options as Record<string, { text: string }>
    return Object.entries(obj).map(([label, val]) => ({
      label,
      text: val?.text || '',
      isCorrect: label === q.correctAnswer
    }))
  }
  // Flat optionA/B/C/D fields
  return [
    { label: 'A', text: q?.optionA || '', isCorrect: q?.correctAnswer === 'A' },
    { label: 'B', text: q?.optionB || '', isCorrect: q?.correctAnswer === 'B' },
    { label: 'C', text: q?.optionC || '', isCorrect: q?.correctAnswer === 'C' },
    { label: 'D', text: q?.optionD || '', isCorrect: q?.correctAnswer === 'D' },
  ]
}

// ── Component ────────────────────────────────────────────────────────────────
export default function QuestionForm({ question, onSubmit, onCancel, loading }: Props) {
  const [subjects, setSubjects] = useState<string[]>(FALLBACK_SUBJECTS)
  const [customSubject, setCustomSubject] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isDirty }
  } = useForm<FormData, any, FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: 'onChange',
    defaultValues: {
      subject: '',
      topic: '',
      questionText: '',
      options: [
        { label: 'A', text: '', isCorrect: false },
        { label: 'B', text: '', isCorrect: false },
        { label: 'C', text: '', isCorrect: false },
        { label: 'D', text: '', isCorrect: false },
      ],
      explanation: '',
      difficulty: 'MEDIUM',
      examType: 'JAMB',
      imageUrl: ''
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'options' })
  const watchedOptions = watch('options')

  // When question data arrives (edit mode), reset the form with its values
  useEffect(() => {
    if (question) {
      reset({
        subject: question.subject || '',
        topic: question.topic || '',
        questionText: question.questionText || '',
        options: buildDefaultOptions(question),
        explanation: question.explanation || '',
        difficulty: question.difficulty || 'MEDIUM',
        year: question.year,
        examType: question.examType || 'JAMB',
        imageUrl: question.imageUrl || ''
      })
    }
  }, [question, reset])

  useEffect(() => {
    getSubjects()
      .then(list => { if (list?.length) setSubjects(list) })
      .catch(() => {})
  }, [])

  const setCorrect = (index: number) => {
    watchedOptions.forEach((_, i) => setValue(`options.${i}.isCorrect`, i === index))
  }

  const addOption = () => {
    const nextLabel = LABELS[fields.length] || String.fromCharCode(65 + fields.length)
    append({ label: nextLabel, text: '', isCorrect: false })
  }

  const removeOption = (index: number) => {
    if (fields.length <= 2) return
    // If removing the correct one, reset to first
    if (watchedOptions[index]?.isCorrect) {
      setValue('options.0.isCorrect', true)
    }
    remove(index)
  }

  const onFormSubmit = async (data: FormData) => {
    const correctOpt = data.options.find(o => o.isCorrect)
    const payload = {
      ...data,
      correctAnswer: correctOpt?.label || data.options[0].label,
      imageUrl: data.imageUrl || undefined,
      topic: data.topic || undefined,
      year: data.year || undefined
    }
    if (question) {
      await onSubmit({ id: question.id, ...payload } as UpdateQuestionData)
    } else {
      await onSubmit(payload as CreateQuestionData)
    }
  }

  const difficultyColors = { EASY: 'bg-green-100 text-green-700 border-green-300', MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300', HARD: 'bg-red-100 text-red-700 border-red-300' }
  const watchedDifficulty = watch('difficulty')
  const watchedSubject = watch('subject')

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-3xl mx-auto">

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">
            {question ? 'Edit Question' : 'New Question'}
          </span>
          {isDirty && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Unsaved</span>}
        </div>
        <div className="flex items-center gap-2">
          {isValid && <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3.5 h-3.5" />Ready</span>}
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyColors[watchedDifficulty]}`}>
            {watchedDifficulty}
          </span>
        </div>
      </div>

      {/* ── Metadata ── */}
      <Card className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Question Info</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Subject */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
            {!customSubject ? (
              <div className="flex gap-2">
                <select
                  {...register('subject')}
                  className={`flex-1 px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subject ? 'border-red-400' : 'border-gray-300'}`}
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="button" onClick={() => setCustomSubject(true)} className="px-3 py-2 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 whitespace-nowrap">
                  + Custom
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type subject name..."
                  value={watchedSubject}
                  onChange={e => setValue('subject', e.target.value, { shouldValidate: true })}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setCustomSubject(false)} className="px-3 py-2 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                  List
                </button>
              </div>
            )}
            {errors.subject && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.subject.message}</p>}
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              {...register('topic')}
              placeholder="e.g. Quadratic Equations"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Exam Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam Type <span className="text-red-500">*</span></label>
            <select
              {...register('examType')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="JAMB">JAMB</option>
              <option value="WAEC">WAEC</option>
              <option value="NECO">NECO</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {(['EASY', 'MEDIUM', 'HARD'] as const).map(d => (
                <label key={d} className="flex-1 cursor-pointer">
                  <input type="radio" value={d} {...register('difficulty')} className="sr-only" />
                  <div className={`text-center py-2 rounded-lg border text-xs font-semibold transition-all ${watchedDifficulty === d ? difficultyColors[d] + ' ring-2 ring-offset-1 ring-current' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {d}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Year <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="number"
              min={2000}
              max={2030}
              placeholder="e.g. 2023"
              {...register('year', { valueAsNumber: true })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* ── Question Text ── */}
      <Card className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Question Text</h3>
        <Controller
          name="questionText"
          control={control}
          render={({ field: f }) => (
            <MinimalRichEditor
              value={f.value}
              onChange={f.onChange}
              placeholder="Type the question here..."
              rows={4}
              error={errors.questionText?.message}
            />
          )}
        />
      </Card>

      {/* ── Options ── */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Answer Options</h3>
          <span className="text-xs text-gray-400">{fields.length} / 10 options</span>
        </div>

        <p className="text-xs text-gray-500">Click the circle on the left to mark the correct answer.</p>

        <div className="space-y-3">
          {fields.map((field, index) => {
            const isCorrect = watchedOptions?.[index]?.isCorrect
            return (
              <div
                key={field.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${isCorrect ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
              >
                {/* Correct toggle */}
                <button
                  type="button"
                  onClick={() => setCorrect(index)}
                  className={`mt-2.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'}`}
                  title="Mark as correct answer"
                >
                  {isCorrect && <span className="block w-full h-full rounded-full bg-white scale-[0.4]" />}
                </button>

                {/* Label badge */}
                <span className={`mt-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {field.label}
                </span>

                {/* Rich text editor for option */}
                <div className="flex-1">
                  <Controller
                    name={`options.${index}.text`}
                    control={control}
                    render={({ field: f }) => (
                      <MinimalRichEditor
                        value={f.value}
                        onChange={f.onChange}
                        placeholder={`Option ${field.label}...`}
                        rows={1}
                        error={errors.options?.[index]?.text?.message}
                      />
                    )}
                  />
                </div>

                {/* Remove button */}
                {fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="mt-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Remove option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Add option button */}
        {fields.length < 10 && (
          <button
            type="button"
            onClick={addOption}
            className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Option {LABELS[fields.length] || ''}
          </button>
        )}

        {(errors.options as any)?.message && (
          <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{(errors.options as any).message}</p>
        )}
      </Card>

      {/* ── Explanation ── */}
      <Card className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Explanation <span className="text-gray-400 font-normal normal-case">(optional)</span>
        </h3>
        <Controller
          name="explanation"
          control={control}
          render={({ field: f }) => (
            <MinimalRichEditor
              value={f.value || ''}
              onChange={f.onChange}
              placeholder="Explain why the correct answer is right (shown to students after answering)..."
              rows={3}
            />
          )}
        />
      </Card>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!isValid || loading}
          className="flex items-center gap-2 min-w-[160px] justify-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {question ? 'Update Question' : 'Create Question'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
