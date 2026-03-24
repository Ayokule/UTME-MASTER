/**
 * Vitest Setup for UTME Master Frontend
 * Global test configuration and utilities
 */

import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
})

// Mock IntersectionObserver for lazy loading
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb: FrameRequestCallback) => {
  setTimeout(cb, 0)
}

// Mock cancelAnimationFrame
global.cancelAnimationFrame = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Cleanup after each test
afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

// Custom expect matchers
expect.extend({
  toBeAccessible(received: HTMLElement) {
    const issues: string[] = []
    
    // Check for alt text on images
    const images = received.querySelectorAll ? received.querySelectorAll('img') : []
    images.forEach((img, i) => {
      if (!img.getAttribute('alt')) {
        issues.push(`Image ${i + 1} is missing alt text`)
      }
    })
    
    // Check for button labels
    const buttons = received.querySelectorAll ? received.querySelectorAll('button') : []
    buttons.forEach((btn, i) => {
      if (!btn.textContent && !btn.getAttribute('aria-label')) {
        issues.push(`Button ${i + 1} is missing accessible label`)
      }
    })
    
    const pass = issues.length === 0
    
    return {
      pass,
      message: () => `Expected element to be accessible${issues.length ? ': ' + issues.join(', ') : ''}`,
    }
  },
  
  toHaveTextContent(received: HTMLElement, text: string) {
    const content = received.textContent || ''
    const pass = content.includes(text)
    
    return {
      pass,
      message: () => `Expected element to contain text "${text}", but got "${content}"`,
    }
  },
})

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
    statusText: 'OK',
  } as Response)
) as any
