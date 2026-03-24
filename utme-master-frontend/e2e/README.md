# End-to-End Testing with Playwright

## Overview

This directory contains end-to-end tests for the UTME Master frontend application using Playwright.

## Test Coverage

### Authentication Tests (`auth.test.ts`)
- Login page display
- Registration page display
- Successful login with valid credentials
- Error handling for invalid credentials
- User registration
- Logout functionality
- Route protection
- Password reset flow

### Exam Flow Tests (`exam-flow.test.ts`)
- Display available exams
- Start exam successfully
- Display exam questions
- Save and submit answers
- Show exam results after submission
- Show exam progress
- Show timer during exam
- Allow retake exam if enabled

### Dashboard Tests (`dashboard.test.ts`)
- Student dashboard display
- Exam statistics display
- Recent exams display
- Navigation to exam selection
- Navigation to results
- Practice tests section
- Admin dashboard display
- Exam management section
- Question management section
- Analytics section
- User management section

### Results Tests (`results.test.ts`)
- Results page display
- Overall score display
- Subject breakdown
- Performance analytics
- Question review
- PDF download
- Sharing results
- Exam history
- Improvement trends
- Subject performance

### Admin Exam Tests (`admin-exam.test.ts`)
- Exam management page display
- Create exam button
- Exam list display
- Exam filters
- Exam statistics
- Exam details display
- Exam actions (view, edit, delete)
- Exam status badge
- Create exam modal
- Exam form validation
- Create exam successfully
- Publish exam
- Delete exam

### Admin Question Tests (`admin-question.test.ts`)
- Question management page display
- Create question button
- Question list display
- Question filters
- Question details display
- Question actions
- Question status
- Create question modal
- Question form validation
- Create MCQ question successfully
- Edit existing question
- Delete question

### User Journey Tests (`user-journey.test.ts`)
- Complete student journey (register → login → dashboard → exam → results → logout)
- Complete admin journey (login → question management → create question → exam management → create exam → analytics → logout)
- Cross-browser consistency
- Mobile responsiveness
- Performance metrics

## Running Tests

### Install Dependencies
```bash
cd utme-master-frontend
npm install
```

### Install Playwright Browsers
```bash
npx playwright install
```

### Run All Tests
```bash
npm run test:e2e
```

### Run Tests in Headless Mode
```bash
npm run test:e2e:headless
```

### Run Tests with UI
```bash
npm run test:e2e:ui
```

### Run Specific Test File
```bash
npx playwright test e2e/auth.test.ts
```

### Run Tests in a Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Tests on Mobile Viewport
```bash
npx playwright test --project=Mobile\ Chrome
npx playwright test --project=Mobile\ Safari
```

### Generate Test Report
```bash
npm run test:e2e:report
```

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/path')
    
    // Act
    await page.getByRole('button', { name: 'Click me' }).click()
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible()
  })
})
```

### Using Fixtures
```typescript
import { test, expect } from '@playwright/test'

test('should work with authenticated user', async ({ page, authenticatedUser }) => {
  // User is already logged in
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})
```

### Test Mobile Viewports
```typescript
import { test, expect, devices } from '@playwright/test'

test('should work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  // Test mobile-specific behavior
})
```

## Best Practices

1. **Use Descriptive Names**: Test names should clearly describe what's being tested
2. **Test User Journeys**: Focus on complete user workflows
3. **Use Playwright Selectors**: Prefer `getByRole`, `getByText`, `getByPlaceholder` over CSS selectors
4. **Wait for Elements**: Use `waitForURL`, `waitForSelector`, etc. instead of `setTimeout`
5. **Test Edge Cases**: Cover error conditions and edge cases
6. **Use Fixtures**: Reuse common setup/teardown logic with fixtures
7. **Test Multiple Browsers**: Run tests in Chromium, Firefox, and WebKit
8. **Test Mobile Viewports**: Ensure mobile responsiveness

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Merge to main branch
- Daily scheduled runs

## Troubleshooting

### Tests Hanging
- Increase timeout: `npx playwright test --timeout=60000`
- Check for unhandled promises
- Verify server is running

### Tests Failing Randomly
- Add explicit waits
- Use `waitForSelector` instead of `click`
- Check for race conditions

### Browser Issues
- Update Playwright: `npx playwright install --force`
- Check browser version compatibility

## Debugging

### Open DevTools
```bash
npx playwright test --debug
```

### Slow Motion Mode
```bash
npx playwright test --slowmo=1000
```

### View Test Results
```bash
npx playwright show-report
```
