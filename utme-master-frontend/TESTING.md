# UTME Master Frontend Testing Guide

## Overview

This document describes the testing setup and guidelines for the UTME Master frontend application.

## Test Structure

```
utme-master-frontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── Button.test.tsx      # Button component tests
│   │       ├── Card.test.tsx        # Card component tests
│   │       └── Toast.test.tsx       # Toast notification tests
│   ├── hooks/
│   │   ├── useAuth.test.ts          # Auth hook tests
│   │   └── useExam.test.ts          # Exam hook tests
│   ├── api/
│   │   ├── exams.test.ts            # Exams API tests
│   │   └── auth.test.ts             # Auth API tests
│   └── test/
│       ├── setup.ts                 # Vitest setup
│       └── mocks.ts                 # Test mocks and utilities
├── vite.config.ts                   # Vite + Vitest config
└── TESTING.md                       # This file
```

## Test Types

### 1. Component Tests
- Test React components in isolation
- Test props, state, and user interactions
- Located in `src/components/**/*.test.tsx`

### 2. Hook Tests
- Test custom React hooks
- Test state management and side effects
- Located in `src/hooks/**/*.test.ts`

### 3. API Tests
- Test API functions
- Test request/response handling
- Located in `src/api/**/*.test.ts`

## Running Tests

### Install Dependencies
```bash
cd utme-master-frontend
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests with UI
```bash
npm run test:ui
```

## Writing Tests

### Component Test Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Hook Test Example
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useAuthStore } from '../store/auth'

describe('useAuth', () => {
  it('returns user when authenticated', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    
    vi.mock('../store/auth', () => ({
      useAuthStore: vi.fn().mockImplementation(selector => selector({ user: mockUser }))
    }))

    const { result } = renderHook(() => useAuthStore(s => s.user))
    expect(result.current).toEqual(mockUser)
  })
})
```

### API Test Example
```typescript
import { describe, it, expect, vi } from 'vitest'
import * as authAPI from './auth'

vi.mock('axios')

describe('Auth API', () => {
  it('should login successfully', async () => {
    const mockResponse = { success: true, data: { user: {}, token: 'token' } }
    vi.mocked(axios.post).mockResolvedValue({ data: mockResponse })

    const result = await authAPI.login('test@example.com', 'password')
    expect(result).toEqual(mockResponse)
  })
})
```

## Mocking

### Mocking React Query
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

render(
  <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
)
```

### Mocking React Router
```typescript
import { MemoryRouter } from 'react-router-dom'

render(
  <MemoryRouter initialEntries={['/test']}>
    <MyComponent />
  </MemoryRouter>
)
```

### Mocking Zustand Store
```typescript
vi.mock('../store/auth', () => ({
  useAuthStore: vi.fn().mockImplementation(selector =>
    selector({
      user: mockUser,
      token: 'token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })
  ),
}))
```

## Best Practices

1. **Test One Thing**: Each test should verify one behavior
2. **Use Descriptive Names**: Test names should describe what's being tested
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock External Dependencies**: Keep tests fast and isolated
5. **Test Edge Cases**: Cover error conditions and edge cases
6. **Keep Tests Independent**: Tests should not depend on each other
7. **Use Testing Library**: Prefer `@testing-library/react` over shallow rendering
8. **Test User Interactions**: Focus on how users interact with components

## Coverage Requirements

- **Branches**: 70% minimum
- **Functions**: 70% minimum
- **Lines**: 70% minimum
- **Statements**: 70% minimum

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Merge to main branch
- Daily scheduled runs

## Troubleshooting

### Tests Hanging
- Check for unmocked external dependencies
- Verify timers are mocked
- Increase test timeout in `vite.config.ts`

### Coverage Too Low
- Add tests for uncovered components
- Test error paths and edge cases
- Use `npm run test:coverage` to see coverage report

### Mock Issues
- Ensure mocks are set up before imports
- Use `vi.clearAllMocks()` in `afterEach`
- Check mock return values match expected types
