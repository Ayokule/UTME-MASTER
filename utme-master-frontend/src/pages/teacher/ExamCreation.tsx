import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Layout from '../../components/Layout'
import SafePageWrapper from '../../components/SafePageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { showToast } from '../../components/ui/Toast'

const makeVariants = (reduced: boolean) => ({
  container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: reduced ? { duration: 0 } : { staggerChildren: 0.08 } } },
  item: { hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.4 } } }
})

const SUBJECTS = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature']
const CLASSES = ['SS1A', 'SS1B', 'SS2A', 'SS2B', 'SS3A', 'SS3B']

interface Question {
  id: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correct: 'A' | 'B' | 'C' | 'D'
}

const emptyQuestion = (): Question => ({
  id: Date.now().toString(),
  text: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A'
})

export default function ExamCreation() {
  const navigate = useNavigate()
  const reduced = useReducedMotion() ?? false
  const { container, item } = makeVariants(reduced)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState({
    title: '', subject: '', targetClass: '', duration: '60',
    passMarks: '50', instructions: '', allowRetake: true, showResults: true
  })
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()])

  const updateForm = (key: string, value: string | boolean) => setForm(p => ({ ...p, [key]: value }))

  const addQuestion = () => setQuestions(p => [...p, emptyQuestion()])
  const removeQuestion = (id: string) => {
    if (questions.length === 1) { showToast.error('At least one question required'); return }
    setQuestions(p => p.filter(q => q.id !== id))
  }
  const updateQuestion = (id: string, key: keyof Question, value: string) =>
    setQuestions(p => p.map(q => q.id === id ? { ...q, [key]: value } : q))

  const validateStep1 = () => {
    if (!form.title || !form.subject || !form.targetClass || !form.duration) {
      showToast.error('Please fill in all required fields')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    const incomplete = questions.find(q => !q.text || !q.optionA || !q.optionB || !q.optionC || !q.optionD)
    if (incomplete) { showToast.error('Please complete all question fields'); return false }
    return true
  }

  const handleSubmit = () => {
    showToast.success(`Exam "${form.title}" created with ${questions.length} questions!`)
    navigate('/teacher/dashboard')
  }

  return (
    <SafePageWrapper pageName="Exam Creation">
      <Layout>
        <motion.div variants={container} initial="hidden" animate="visible"
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <motion.div variants={item} className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/teacher/dashboard')}
              className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Exam</h1>
              <p className="text-gray-500 text-sm">Build a new exam for your students</p>
            </div>
          </motion.div>

          {/* Step Indicator */}
          <motion.div variants={item}>
            <div className="flex items-center gap-2">
              {[
                { n: 1, label: 'Exam Details' },
                { n: 2, label: 'Questions' },
                { n: 3, label: 'Review & Publish' }
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
                  </div>
                  <span className={`text-sm font-medium ${step === s.n ? 'text-primary-600' : 'text-gray-500'}`}>{s.label}</span>
                  {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-2" />}
                </div>
              ))}
            </div>
          </motion.div>

          {/* STEP 1: Exam Details */}
          {step === 1 && (
            <motion.div variants={container} className="space-y-4">
              <motion.div variants={item}>
                <Card className="p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Exam Information</h3>
                  <Input label="Exam Title *" placeholder="e.g. SS3 Mathematics Mock Exam"
                    value={form.title} onChange={e => updateForm('title', e.target.value)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <select value={form.subject} onChange={e => updateForm('subject', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Select subject</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Class *</label>
                      <select value={form.targetClass} onChange={e => updateForm('targetClass', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Select class</option>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <Input label="Duration (minutes) *" type="number" value={form.duration}
                      onChange={e => updateForm('duration', e.target.value)} icon={<Clock className="w-4 h-4" />} />
                    <Input label="Pass Mark (%)" type="number" value={form.passMarks}
                      onChange={e => updateForm('passMarks', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <textarea value={form.instructions} onChange={e => updateForm('instructions', e.target.value)}
                      rows={3} placeholder="Instructions for students..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.allowRetake} onChange={e => updateForm('allowRetake', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded" />
                      <span className="text-sm text-gray-700">Allow retake</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.showResults} onChange={e => updateForm('showResults', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded" />
                      <span className="text-sm text-gray-700">Show results immediately</span>
                    </label>
                  </div>
                </Card>
              </motion.div>
              <motion.div variants={item} className="flex justify-end">
                <Button variant="primary" onClick={() => validateStep1() && setStep(2)}>
                  Next: Add Questions →
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 2: Questions */}
          {step === 2 && (
            <motion.div variants={container} className="space-y-4">
              <motion.div variants={item} className="flex items-center justify-between">
                <p className="text-sm text-gray-600">{questions.length} question{questions.length !== 1 ? 's' : ''} added</p>
                <Button variant="outline" size="sm" onClick={addQuestion} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Question
                </Button>
              </motion.div>

              {questions.map((q, idx) => (
                <motion.div key={q.id} variants={item}>
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">Question {idx + 1}</Badge>
                      <Button variant="outline" size="sm" onClick={() => removeQuestion(q.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <textarea value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                        rows={2} placeholder="Enter question text..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(['A', 'B', 'C', 'D'] as const).map(opt => (
                          <div key={opt} className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              q.correct === opt ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>{opt}</span>
                            <input value={q[`option${opt}` as keyof Question] as string}
                              onChange={e => updateQuestion(q.id, `option${opt}` as keyof Question, e.target.value)}
                              placeholder={`Option ${opt}`}
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Correct answer:</span>
                        {(['A', 'B', 'C', 'D'] as const).map(opt => (
                          <button key={opt} onClick={() => updateQuestion(q.id, 'correct', opt)}
                            className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${
                              q.correct === opt ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              <motion.div variants={item} className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                <Button variant="primary" onClick={() => validateStep2() && setStep(3)}>
                  Next: Review →
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <motion.div variants={container} className="space-y-4">
              <motion.div variants={item}>
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary-600" /> Exam Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {[
                      { label: 'Title', value: form.title },
                      { label: 'Subject', value: form.subject },
                      { label: 'Class', value: form.targetClass },
                      { label: 'Duration', value: `${form.duration} min` },
                      { label: 'Pass Mark', value: `${form.passMarks}%` },
                      { label: 'Questions', value: questions.length },
                    ].map(d => (
                      <div key={d.label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">{d.label}</p>
                        <p className="font-semibold text-gray-900">{d.value}</p>
                      </div>
                    ))}
                  </div>
                  {form.instructions && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-blue-600 font-medium mb-1">Instructions</p>
                      <p className="text-sm text-blue-800">{form.instructions}</p>
                    </div>
                  )}
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {form.allowRetake ? 'Retake allowed' : 'No retake'}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {form.showResults ? 'Results shown immediately' : 'Results hidden'}
                    </span>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    Once published, students in <strong>{form.targetClass}</strong> will be able to take this exam.
                    You can still edit it before any student starts.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={item} className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { showToast.success('Saved as draft'); navigate('/teacher/dashboard') }}>
                    Save as Draft
                  </Button>
                  <Button variant="primary" onClick={handleSubmit}>
                    Publish Exam
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

        </motion.div>
      </Layout>
    </SafePageWrapper>
  )
}
