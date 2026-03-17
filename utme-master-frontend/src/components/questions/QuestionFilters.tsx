import { useState, useEffect } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuestionStore } from '../../store/question'
import { getSubjects, getTopicsBySubject } from '../../api/questions'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'

export default function QuestionFilters() {
  const { filters, setFilters } = useQuestionStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState(filters.search || '')
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>()

  // Load subjects on mount
  useEffect(() => {
    loadSubjects()
  }, [])

  // Load topics when subjects change
  useEffect(() => {
    if (filters.subjects.length === 1) {
      loadTopics(filters.subjects[0])
    } else {
      setTopics([])
    }
  }, [filters.subjects])

  const loadSubjects = async () => {
    try {
      const subjectList = await getSubjects()
      setSubjects(subjectList)
    } catch (error) {
      console.error('Failed to load subjects:', error)
    }
  }

  const loadTopics = async (subject: string) => {
    try {
      const topicList = await getTopicsBySubject(subject)
      setTopics(topicList)
    } catch (error) {
      console.error('Failed to load topics:', error)
      setTopics([])
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      setFilters({ search: value || undefined })
    }, 300)
    
    setSearchTimeout(timeout)
  }

  const handleSubjectChange = (subject: string, checked: boolean) => {
    const newSubjects = checked
      ? [...filters.subjects, subject]
      : filters.subjects.filter(s => s !== subject)
    
    setFilters({ 
      subjects: newSubjects,
      topics: [] // Clear topics when subjects change
    })
  }

  const handleTopicChange = (topic: string, checked: boolean) => {
    const newTopics = checked
      ? [...filters.topics, topic]
      : filters.topics.filter(t => t !== topic)
    
    setFilters({ topics: newTopics })
  }

  const clearFilters = () => {
    setFilters({
      subjects: [],
      topics: [],
      difficulty: undefined,
      yearFrom: undefined,
      yearTo: undefined,
      examType: undefined,
      search: undefined
    })
    setSearchValue('')
  }

  const hasActiveFilters = 
    filters.subjects.length > 0 ||
    filters.topics.length > 0 ||
    filters.difficulty ||
    filters.yearFrom ||
    filters.yearTo ||
    filters.examType ||
    filters.search

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search questions..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-gray-200 space-y-6">
                {/* Subjects */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Subjects
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {subjects.map(subject => (
                      <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.subjects.includes(subject)}
                          onChange={(e) => handleSubjectChange(subject, e.target.checked)}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Topics (only show if one subject is selected) */}
                {filters.subjects.length === 1 && topics.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Topics for {filters.subjects[0]}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {topics.map(topic => (
                        <label key={topic} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.topics.includes(topic)}
                            onChange={(e) => handleTopicChange(topic, e.target.checked)}
                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700">{topic}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={filters.difficulty || ''}
                      onChange={(e) => setFilters({ difficulty: e.target.value as any || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Difficulties</option>
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  {/* Exam Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Type
                    </label>
                    <select
                      value={filters.examType || ''}
                      onChange={(e) => setFilters({ examType: e.target.value as any || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Exam Types</option>
                      <option value="JAMB">JAMB</option>
                      <option value="WAEC">WAEC</option>
                      <option value="NECO">NECO</option>
                    </select>
                  </div>

                  {/* Year From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year From
                    </label>
                    <input
                      type="number"
                      min="2000"
                      max="2030"
                      value={filters.yearFrom || ''}
                      onChange={(e) => setFilters({ yearFrom: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="2000"
                    />
                  </div>

                  {/* Year To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year To
                    </label>
                    <input
                      type="number"
                      min="2000"
                      max="2030"
                      value={filters.yearTo || ''}
                      onChange={(e) => setFilters({ yearTo: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="2030"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {filters.subjects.map(subject => (
              <span
                key={subject}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {subject}
                <button
                  onClick={() => handleSubjectChange(subject, false)}
                  className="ml-1 hover:text-primary-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {filters.topics.map(topic => (
              <span
                key={topic}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
              >
                {topic}
                <button
                  onClick={() => handleTopicChange(topic, false)}
                  className="ml-1 hover:text-secondary-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {filters.difficulty && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                {filters.difficulty}
                <button
                  onClick={() => setFilters({ difficulty: undefined })}
                  className="ml-1 hover:text-warning-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.examType && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-info-100 text-info-800">
                {filters.examType}
                <button
                  onClick={() => setFilters({ examType: undefined })}
                  className="ml-1 hover:text-info-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}