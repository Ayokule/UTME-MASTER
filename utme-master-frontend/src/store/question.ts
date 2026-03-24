import { create } from 'zustand'
import { Question, QuestionFilters, CreateQuestionData, UpdateQuestionData } from '../types/question'
import * as questionAPI from '../api/questions.js'

interface QuestionStore {
  // State
  questions: Question[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  filters: QuestionFilters
  selectedQuestions: string[]
  
  // Actions
  fetchQuestions: () => Promise<void>
  createQuestion: (data: CreateQuestionData) => Promise<Question>
  updateQuestion: (id: string, data: UpdateQuestionData) => Promise<Question>
  deleteQuestion: (id: string) => Promise<void>
  deleteSelectedQuestions: () => Promise<void>
  setFilters: (filters: Partial<QuestionFilters>) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  toggleQuestionSelection: (id: string) => void
  selectAllQuestions: () => void
  clearSelection: () => void
  clearError: () => void
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  // Initial state
  questions: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  loading: false,
  error: null,
  filters: {
    subjects: [],
    topics: [],
    difficulty: undefined,
    yearFrom: undefined,
    yearTo: undefined,
    examType: undefined,
    search: undefined
  },
  selectedQuestions: [],

  // Actions
  fetchQuestions: async () => {
    set({ loading: true, error: null })
    try {
      const { page, limit, filters } = get()
      const response = await questionAPI.getQuestions({
        page,
        limit,
        ...filters
      })
      
      set({
        questions: response.questions || [],
        total: response.total || 0,
        totalPages: response.totalPages || 0,
        loading: false,
        selectedQuestions: []
      })
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch questions',
        questions: [], // Ensure questions is always an array
        total: 0,
        totalPages: 0
      })
    }
  },

  createQuestion: async (data: CreateQuestionData) => {
    set({ loading: true, error: null })
    try {
      const question = await questionAPI.createQuestion(data)
      
      // Refresh the list after creating
      await get().fetchQuestions()
      
      set({ loading: false })
      return question
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Failed to create question'
      })
      throw error
    }
  },

  updateQuestion: async (id: string, data: UpdateQuestionData) => {
    set({ loading: true, error: null })
    try {
      const question = await questionAPI.updateQuestion(id, data)
      
      // Update the question in the local state
      set(state => ({
        questions: state.questions.map(q => q.id === id ? question : q),
        loading: false
      }))
      
      return question
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Failed to update question'
      })
      throw error
    }
  },

  deleteQuestion: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await questionAPI.deleteQuestion(id)
      
      // Remove the question from local state
      set(state => ({
        questions: state.questions.filter(q => q.id !== id),
        total: state.total - 1,
        loading: false,
        selectedQuestions: state.selectedQuestions.filter(qId => qId !== id)
      }))
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Failed to delete question'
      })
      throw error
    }
  },

  deleteSelectedQuestions: async () => {
    const { selectedQuestions } = get()
    if (selectedQuestions.length === 0) return

    set({ loading: true, error: null })
    try {
      await questionAPI.bulkDeleteQuestions(selectedQuestions)
      
      // Remove deleted questions from local state
      set(state => ({
        questions: state.questions.filter(q => !selectedQuestions.includes(q.id)),
        total: state.total - selectedQuestions.length,
        selectedQuestions: [],
        loading: false
      }))
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Failed to delete selected questions'
      })
      throw error
    }
  },

  setFilters: (newFilters: Partial<QuestionFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
      page: 1 // Reset to first page when filters change
    }))
    
    // Fetch questions with new filters
    get().fetchQuestions()
  },

  setPage: (page: number) => {
    set({ page })
    get().fetchQuestions()
  },

  setLimit: (limit: number) => {
    set({ limit, page: 1 })
    get().fetchQuestions()
  },

  toggleQuestionSelection: (id: string) => {
    set(state => ({
      selectedQuestions: state.selectedQuestions.includes(id)
        ? state.selectedQuestions.filter(qId => qId !== id)
        : [...state.selectedQuestions, id]
    }))
  },

  selectAllQuestions: () => {
    const { questions } = get()
    set({ selectedQuestions: questions.map(q => q.id) })
  },

  clearSelection: () => {
    set({ selectedQuestions: [] })
  },

  clearError: () => {
    set({ error: null })
  }
}))

// Selectors for computed values
export const useQuestionSelectors = () => {
  const store = useQuestionStore()
  
  return {
    ...store,
    questions: store.questions || [], // Ensure questions is always an array
    selectedQuestions: store.selectedQuestions || [], // Ensure selectedQuestions is always an array
    hasSelection: (store.selectedQuestions || []).length > 0,
    isAllSelected: (store.selectedQuestions || []).length === (store.questions || []).length && (store.questions || []).length > 0,
    selectedCount: (store.selectedQuestions || []).length
  }
}