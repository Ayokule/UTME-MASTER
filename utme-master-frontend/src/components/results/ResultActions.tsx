import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  RotateCcw, 
  Share2, 
  Download, 
  Eye, 
  Facebook, 
  Twitter, 
  MessageCircle,
  Copy,
  Check
} from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { showToast } from '../ui/Toast'

interface Props {
  studentExamId: string
  examId: string
  canRetake: boolean
  examTitle: string
  score: number
  percentage: number
  onRetake: () => void
  onDownloadPDF: () => void
}

export default function ResultActions({ 
  studentExamId, 
  canRetake, 
  examTitle, 
  score, 
  percentage,
  onRetake,
  onDownloadPDF
}: Props) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/student/results/${studentExamId}`
  const shareText = `I just scored ${score} (${Math.round(percentage)}%) on "${examTitle}" on UTME Master! 🎯`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      showToast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      showToast.error('Failed to copy link')
    }
  }

  const handleSocialShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(shareUrl)
    
    let shareLink = ''
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
        break
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`
        break
      default:
        return
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400')
    setShareModalOpen(false)
  }

  const handleReviewAnswers = () => {
    // Scroll to question review section
    const questionReviewElement = document.getElementById('question-review')
    if (questionReviewElement) {
      questionReviewElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Actions</h3>
            <p className="text-gray-600">What would you like to do next?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Retake Exam */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onRetake}
                disabled={!canRetake}
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:from-gray-400 disabled:to-gray-500"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {canRetake ? 'Retake Exam' : 'Retake Not Allowed'}
                </span>
              </Button>
            </motion.div>

            {/* Share Results */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={() => setShareModalOpen(true)}
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <Share2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Share Results</span>
              </Button>
            </motion.div>

            {/* Download PDF */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={onDownloadPDF}
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-300"
              >
                <Download className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Download PDF</span>
              </Button>
            </motion.div>

            {/* Review Answers */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={handleReviewAnswers}
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-300"
              >
                <Eye className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Review Answers</span>
              </Button>
            </motion.div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">Performance Level</p>
                <p className={`${
                  percentage >= 80 ? 'text-green-600' :
                  percentage >= 60 ? 'text-blue-600' :
                  percentage >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {percentage >= 80 ? 'Excellent' :
                   percentage >= 60 ? 'Good' :
                   percentage >= 40 ? 'Fair' : 'Needs Improvement'}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Recommendation</p>
                <p>
                  {percentage >= 80 ? 'Ready for JAMB!' :
                   percentage >= 60 ? 'Keep practicing' :
                   'Focus on weak areas'}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Next Step</p>
                <p>
                  {canRetake ? 'Retake for better score' : 'Try other exams'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Your Results"
      >
        <div className="space-y-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">{examTitle}</h4>
            <p className="text-2xl font-bold text-primary-600 mb-1">
              {score} ({Math.round(percentage)}%)
            </p>
            <p className="text-sm text-gray-600">Your amazing score!</p>
          </div>

          {/* Social Media Buttons */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900">Share on social media:</h5>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center justify-center space-x-3 p-3 hover:bg-blue-50 hover:border-blue-300"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Share on Facebook</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center justify-center space-x-3 p-3 hover:bg-sky-50 hover:border-sky-300"
              >
                <Twitter className="w-5 h-5 text-sky-600" />
                <span>Share on Twitter</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center justify-center space-x-3 p-3 hover:bg-green-50 hover:border-green-300"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span>Share on WhatsApp</span>
              </Button>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900">Or copy link:</h5>
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShareModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}