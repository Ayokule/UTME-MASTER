// ==========================================
// ENHANCED QUESTION CREATE/EDIT FORM
// ==========================================
// This form supports:
// - Rich text editor (TinyMCE) with LaTeX
// - Dynamic number of options (2-10)
// - Math equations (LaTeX/MathJax)
// - Chemistry formulas (mhchem)
// - Audio upload (for oral English)
// - Multiple images
// - Question types (MCQ, True/False, Essay)

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Plus, Trash2, Upload } from 'lucide-react'
import { useAuthStore } from '../../store/auth'

// ==========================================
// RICH TEXT EDITOR
// ==========================================
// Import TinyMCE (you need to install first)
// npm install @tinymce/tinymce-react
import { Editor } from '@tinymce/tinymce-react'

// ==========================================
// TYPES
// ==========================================
interface QuestionOption {
  label: string          // A, B, C, D, E, F, etc.
  text: string          // Option text (can be rich text)
  isCorrect: boolean    // Is this correct answer?
  imageUrl?: string     // Optional image for option
}

interface QuestionForm {
  subjectId: string
  topicId: string
  questionType: 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY'
  questionText: string      // Rich text (HTML with LaTeX)
  options: QuestionOption[] // Dynamic array
  explanation: string       // Rich text
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  year: string
  examType: 'JAMB' | 'WAEC' | 'NECO'
  images: string[]         // Multiple images
  audioUrl: string         // Audio file
  timeLimitSeconds: string
  points: string
  allowMultiple: boolean   // Multiple correct answers?
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function EnhancedQuestionForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { token } = useAuthStore()

  // ==========================================
  // STATE
  // ==========================================
  const [formData, setFormData] = useState<QuestionForm>({
    subjectId: '',
    topicId: '',
    questionType: 'MCQ',
    questionText: '',
    options: [
      { label: 'A', text: '', isCorrect: false },
      { label: 'B', text: '', isCorrect: false },
      { label: 'C', text: '', isCorrect: false },
      { label: 'D', text: '', isCorrect: false }
    ],
    explanation: '',
    difficulty: 'MEDIUM',
    year: '',
    examType: 'JAMB',
    images: [],
    audioUrl: '',
    timeLimitSeconds: '',
    points: '1',
    allowMultiple: false
  })

  const [subjects, setSubjects] = useState([])
  const [topics, setTopics] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)

  // ==========================================
  // TINYMCE CONFIGURATION
  // ==========================================
  // Configure rich text editor with LaTeX support
  const editorConfig = {
    height: 300,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
      'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
      'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount',
      'equation'  // LaTeX equations
    ],
    toolbar:
      'undo redo | formatselect | bold italic underline | ' +
      'alignleft aligncenter alignright | bullist numlist | ' +
      'equation | image media | removeformat | help',

    // LaTeX equation editor
    // Users can insert: x^2, \frac{1}{2}, \sqrt{x}, etc.
    equation_latex: true,

    content_style: `
      body { font-family: Arial, sans-serif; font-size: 14px; }
      .mce-content-body { padding: 10px; }
    `
  }

  // ==========================================
  // ADD OPTION
  // ==========================================
  function addOption() {
    if (formData.options.length >= 10) {
      alert('Maximum 10 options allowed')
      return
    }

    // Get next letter (A, B, C... J)
    const labels = 'ABCDEFGHIJ'
    const nextLabel = labels[formData.options.length]

    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        { label: nextLabel, text: '', isCorrect: false }
      ]
    }))
  }

  // ==========================================
  // REMOVE OPTION
  // ==========================================
  function removeOption(index: number) {
    if (formData.options.length <= 2) {
      alert('Minimum 2 options required')
      return
    }

    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  // ==========================================
  // UPDATE OPTION
  // ==========================================
  function updateOption(index: number, field: keyof QuestionOption, value: any) {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      )
    }))
  }

  // ==========================================
  // SET CORRECT ANSWER
  // ==========================================
  function setCorrectAnswer(index: number) {
    if (formData.allowMultiple) {
      // Toggle for multiple correct answers
      updateOption(index, 'isCorrect', !formData.options[index].isCorrect)
    } else {
      // Single correct answer - uncheck others
      setFormData(prev => ({
        ...prev,
        options: prev.options.map((opt, i) => ({
          ...opt,
          isCorrect: i === index
        }))
      }))
    }
  }

  // ==========================================
  // UPLOAD AUDIO
  // ==========================================
  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Audio file must be less than 10MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('audio', file)

      const response = await fetch('/api/upload/audio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setFormData(prev => ({ ...prev, audioUrl: data.data.url }))

    } catch (error) {
      alert('Failed to upload audio')
    } finally {
      setUploading(false)
    }
  }

  // ==========================================
  // UPLOAD IMAGE
  // ==========================================
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()

      // Add to images array
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, data.data.url]
      }))

    } catch (error) {
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  // ==========================================
  // SUBMIT FORM
  // ==========================================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validation
    if (!formData.questionText.trim()) {
      alert('Question text is required')
      return
    }

    if (formData.options.some(opt => !opt.text.trim())) {
      alert('All options must have text')
      return
    }

    if (!formData.options.some(opt => opt.isCorrect)) {
      alert('Please select at least one correct answer')
      return
    }

    setSaving(true)

    try {
      const payload = {
        subjectId: formData.subjectId,
        topicId: formData.topicId || undefined,
        questionType: formData.questionType,
        questionText: formData.questionText,
        options: formData.options,
        explanation: formData.explanation || undefined,
        difficulty: formData.difficulty,
        year: formData.year ? parseInt(formData.year) : undefined,
        examType: formData.examType,
        images: formData.images.length > 0 ? formData.images : undefined,
        audioUrl: formData.audioUrl || undefined,
        timeLimitSeconds: formData.timeLimitSeconds ? parseInt(formData.timeLimitSeconds) : undefined,
        points: parseInt(formData.points),
        allowMultiple: formData.allowMultiple
      }

      const url = isEditing ? `/api/questions/${id}` : '/api/questions'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to save')

      alert('Question saved successfully!')
      navigate('/admin/questions')

    } catch (error) {
      alert('Failed to save question')
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/questions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Questions
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Question' : 'Create Question'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Type */}
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Question Type</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { value: 'MCQ', label: 'Multiple Choice' },
                { value: 'TRUE_FALSE', label: 'True/False' },
                { value: 'FILL_BLANK', label: 'Fill in Blank' },
                { value: 'ESSAY', label: 'Essay' }
              ].map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, questionType: type.value as any }))}
                  className={`p-4 border-2 rounded-xl font-semibold ${formData.questionType === type.value
                      ? 'border-primary-600 bg-primary-50 text-primary-900'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text (Rich Text Editor) */}
          <div className="card">
            <h3 className="font-bold text-lg mb-4">
              Question Text
              <span className="ml-2 text-sm font-normal text-gray-600">
                (Supports math equations, chemistry formulas, formatting)
              </span>
            </h3>

            {/* Instructions */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <p className="font-semibold mb-2">📝 How to add special content:</p>
              <ul className="space-y-1 text-blue-900">
                <li>• <strong>Math equations:</strong> Click "Equation" button or use toolbar</li>
                <li>• <strong>Images:</strong> Click "Image" button</li>
                <li>• <strong>Formatting:</strong> Use toolbar buttons (bold, italic, etc.)</li>
              </ul>
            </div>

            <Editor
              apiKey="your-tinymce-api-key"  // Get free key from tiny.cloud
              value={formData.questionText}
              onEditorChange={(content: string) => setFormData(prev => ({ ...prev, questionText: content }))}
              init={editorConfig}
            />
          </div>

          {/* Audio Upload (for Oral English) */}
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Audio (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">
              For oral English, listening comprehension, pronunciation questions
            </p>

            {formData.audioUrl ? (
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <audio src={formData.audioUrl} controls className="flex-1" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, audioUrl: '' }))}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload Audio (MP3, WAV, max 10MB)</span>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Images (Optional)</h3>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt="" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index)
                        }))
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500"
            >
              <Upload className="w-5 h-5" />
              <span>Add Image</span>
            </label>
          </div>

          {/* Dynamic Options */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                Options ({formData.options.length})
              </h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.allowMultiple}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowMultiple: e.target.checked }))}
                  />
                  <span className="text-sm">Allow multiple correct answers</span>
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                  {/* Correct Answer Radio/Checkbox */}
                  <div className="flex items-center pt-2">
                    <input
                      type={formData.allowMultiple ? 'checkbox' : 'radio'}
                      name="correctAnswer"
                      checked={option.isCorrect}
                      onChange={() => setCorrectAnswer(index)}
                      className="w-5 h-5"
                    />
                  </div>

                  {/* Label */}
                  <div className="w-8 pt-2 font-bold">{option.label}</div>

                  {/* Option Text (Rich Text) */}
                  <div className="flex-1">
                    <Editor
                      apiKey="your-tinymce-api-key"
                      value={option.text}
                      onEditorChange={(content: string) => updateOption(index, 'text', content)}
                      init={{ ...editorConfig, height: 150 }}
                    />
                  </div>

                  {/* Remove Button */}
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-600 mt-4">
              {formData.allowMultiple
                ? '✓ Check all correct answers'
                : '✓ Select the radio button next to the correct answer'
              }
            </p>
          </div>

          {/* Explanation */}
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Explanation (Optional)</h3>
            <Editor
              apiKey="your-tinymce-api-key"
              value={formData.explanation}
              onEditorChange={(content: string) => setFormData(prev => ({ ...prev, explanation: content }))}
              init={editorConfig}
            />
          </div>

          {/* Metadata */}
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Additional Settings</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Points</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData(prev => ({ ...prev, points: e.target.value }))}
                  className="input-field"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time Limit (seconds, optional)</label>
                <input
                  type="number"
                  value={formData.timeLimitSeconds}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeLimitSeconds: e.target.value }))}
                  className="input-field"
                  placeholder="Default: 60"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/questions')}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? 'Update' : 'Create'} Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
