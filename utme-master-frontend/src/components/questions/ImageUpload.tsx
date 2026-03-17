import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button'
import { showToast } from '../ui/Toast'
import { uploadQuestionImage } from '../../api/questions'

interface ImageUploadProps {
  value?: string
  onChange: (url: string | undefined) => void
  disabled?: boolean
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast.error('Image must be less than 2MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload an image file')
      return
    }

    setUploading(true)
    
    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Upload to server
      const result = await uploadQuestionImage(file)
      onChange(result.url)
      
      // Clean up preview URL and set server URL
      URL.revokeObjectURL(previewUrl)
      setPreview(result.url)
      
      showToast.success('Image uploaded successfully')
    } catch (error: any) {
      showToast.error(error.message || 'Failed to upload image')
      setPreview(null)
      onChange(undefined)
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: disabled || uploading
  })

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    onChange(undefined)
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Question Image (Optional)
      </label>
      
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
              <img
                src={preview}
                alt="Question preview"
                className="w-full h-48 object-cover"
              />
              
              {/* Overlay with remove button */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={removeImage}
                  disabled={uploading}
                  className="shadow-lg"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
              
              {/* Upload indicator */}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-primary-600">
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
              ${isDragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            {...(getRootProps() as any)}
          >
            <input {...getInputProps()} id="question-image-upload" name="question-image" />
            
            <div className="space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                isDragActive ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                {uploading ? (
                  <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary-600' : 'text-gray-400'}`} />
                )}
              </div>
              
              <div>
                <p className={`text-lg font-medium ${isDragActive ? 'text-primary-700' : 'text-gray-700'}`}>
                  {isDragActive ? 'Drop image here' : 'Upload question image'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag & drop or click to browse
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>JPG, PNG, GIF</span>
                </div>
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Max 2MB</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {preview && (
        <p className="text-xs text-gray-500 text-center">
          Image uploaded successfully. Students will see this image with the question.
        </p>
      )}
    </div>
  )
}