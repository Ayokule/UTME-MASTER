# UTME Master Backend Testing Guide

## Overview

This document describes the testing setup and guidelines for the UTME Master backend API.

## Test Structure

```
utme-master-backend/
├── src/
│   ├── controllers/
│   │   └── exam.controller.test.ts      # Controller integration tests
│   ├── services/
│   │   ├── exam.service.test.ts         # Service unit tests
│   │   ├── auth.service.test.ts         # Auth service tests
│   │   └── user.service.test.ts         # User service tests
│   ├── middleware/
│   │   └── auth.middleware.test.ts      # Middleware tests
│   └── utils/
│       └── responseHelper.test.ts       # Utility function tests
├── jest.config.js                        # Jest configuration
└── jest.setup.js                         # Jest setup and mocks
```

## Test Types

### 1. Unit Tests
- Test individual functions in isolation
- Mock external dependencies (database, APIs)
- Fast execution (milliseconds)
- Located in `src/services/*.test.ts`

### 2. Integration Tests
- Test API endpoints with real database
- Test middleware behavior
- Test request/response flow
- Located in `src/controllers/*.test.ts` and `src/middleware/*.test.ts`

## Running Tests

### Install Dependencies
```bash
cd utme-master-backend
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

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

## Writing Tests

### Unit Test Example
```typescript
import * as service from './service';

describe('Service Function', () => {
  it('should do something', async () => {
    // Arrange
    jest.mock('../config/database', () => ({ prisma: { ... } }));
    
    // Act
    const result = await service.functionName();
    
    // Assert
    expect(result).toBeDefined();
    expect(result.property).toBe('expected value');
  });
});
```

### Integration Test Example
```typescript
import request from 'supertest';
import { app } from '../server';

describe('API Endpoint', () => {
  it('should return data', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Mocking

### Mock Prisma
```typescript
jest.mock('../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));
```

### Mock Email Service
```typescript
jest.mock('./email.service', () => ({
  sendExamCompletionEmail: jest.fn(),
}));
```

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

## Best Practices

1. **Test One Thing**: Each test should verify one behavior
2. **Use Descriptive Names**: Test names should describe what's being tested
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock External Dependencies**: Keep tests fast and isolated
5. **Test Edge Cases**: Cover error conditions and edge cases
6. **Keep Tests Independent**: Tests should not depend on each other

## Troubleshooting

### Tests Hanging
- Check for unmocked external dependencies
- Verify database connections are closed
- Increase test timeout in `jest.config.js`

### Coverage Too Low
- Add tests for uncovered functions
- Test error paths and edge cases
- Use `npm run test:coverage` to see coverage report

### Mock Issues
- Ensure mocks are set up before imports
- Use `jest.clearAllMocks()` in `afterEach`
- Check mock return values match expected types
