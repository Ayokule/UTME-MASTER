import { useState, useEffect } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

/**
 * Custom hook for API calls with loading and error states
 */
export function useApi<T>(
  apiCall: () => Promise<{ success: boolean; data: T }>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await apiCall()
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null
        })
        
        if (onSuccess) {
          onSuccess(response.data)
        }
      } else {
        throw new Error('API call failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      
      setState({
        data: null,
        loading: false,
        error: errorMessage
      })
      
      if (onError) {
        onError(errorMessage)
      }
    }
  }

  const reset = () => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

/**
 * Hook for API calls that don't need immediate execution
 */
export function useLazyApi<T>(
  apiCall: () => Promise<{ success: boolean; data: T }>,
  options: UseApiOptions = {}
) {
  return useApi(apiCall, { ...options, immediate: false })
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export function useMutation<T, P = any>(
  apiCall: (params: P) => Promise<{ success: boolean; data: T }>,
  options: UseApiOptions = {}
) {
  const { onSuccess, onError } = options
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const mutate = async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await apiCall(params)
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null
        })
        
        if (onSuccess) {
          onSuccess(response.data)
        }
        
        return response.data
      } else {
        throw new Error('Mutation failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      
      setState({
        data: null,
        loading: false,
        error: errorMessage
      })
      
      if (onError) {
        onError(errorMessage)
      }
      
      throw error
    }
  }

  const reset = () => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }

  return {
    ...state,
    mutate,
    reset
  }
}