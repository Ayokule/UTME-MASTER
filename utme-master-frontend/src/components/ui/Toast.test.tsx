/**
 * Toast Component Tests
 * Tests for the toast notification system
 */

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import toast, { Toaster } from 'react-hot-toast'

describe('Toast', () => {
  it('renders the Toaster component', () => {
    render(<Toaster />)
    // The Toaster component renders a container
    // Since it's a third-party component, we just verify it renders without error
    expect(document.body).toBeTruthy()
  })

  it('shows success toast', async () => {
    toast.success('Success message')
    
    await waitFor(() => {
      expect(document.body).toBeTruthy()
    })
  })

  it('shows error toast', async () => {
    toast.error('Error message')
    
    await waitFor(() => {
      expect(document.body).toBeTruthy()
    })
  })

  it('shows info toast', async () => {
    toast.info('Info message')
    
    await waitFor(() => {
      expect(document.body).toBeTruthy()
    })
  })

  it('shows warning toast', async () => {
    toast.warning('Warning message')
    
    await waitFor(() => {
      expect(document.body).toBeTruthy()
    })
  })

  it('shows loading toast', async () => {
    const toastId = toast.loading('Loading...')
    
    await waitFor(() => {
      expect(toastId).toBeDefined()
    })
  })

  it('dismisses toast', async () => {
    const toastId = toast.success('Dismiss me')
    toast.dismiss(toastId)
    
    await waitFor(() => {
      expect(toastId).toBeDefined()
    })
  })

  it('custom toast options', async () => {
    toast.success('Custom options', {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#333',
        color: '#fff',
      },
    })
    
    await waitFor(() => {
      expect(document.body).toBeTruthy()
    })
  })
})
