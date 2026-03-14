import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Loader } from 'lucide-react'

interface Subject {
  id: string
  name: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  onSelect: (subject: Subject) => void
  placeholder?: string
  error?: string
}

export default function SubjectAutocomplete({ 
  value, 
  onChange, 
  onSelect,
  placeholder = 'Type or select a subject...',
  error
}: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filtered, setFiltered] = useState<Subject[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSubjects()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadSubjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/subjects')
      const data = await response.json()
      
      if (data.success) {
        setSubjects(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    onChange(query)
    setSelectedIndex(-1)
    
    if (query.length > 0) {
      const results = subjects.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase())
      )
      setFiltered(results)
      setIsOpen(true)
    } else {
      setFiltered([])
      setIsOpen(false)
    }
  }

  const handleSelectSubject = (subject: Subject) => {
    onChange(subject.name)
    onSelect(subject)
    setIsOpen(false)
    setFiltered([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filtered.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && filtered[selectedIndex]) {
          handleSelectSubject(filtered[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value && setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-primary-500'
          }`}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      <AnimatePresence>
        {isOpen && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {filtered.map((subject, index) => (
              <motion.button
                key={subject.id}
                onClick={() => handleSelectSubject(subject)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  index === selectedIndex
                    ? 'bg-primary-100 text-primary-900'
                    : 'hover:bg-gray-50 text-gray-900'
                }`}
                whileHover={{ backgroundColor: '#f3f4f6' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{subject.name}</span>
                  {index === selectedIndex && (
                    <span className="text-primary-600">✓</span>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && value && filtered.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500"
        >
          No subjects found matching "{value}"
        </motion.div>
      )}
    </div>
  )
}
