# UTME Master Frontend Troubleshooting Guide

## Common Issues and Solutions

---

## Development Issues

### 1. Module Not Found

**Error:**
```
Cannot find module 'react'
```

**Solution:**
```bash
npm install
```

---

### 2. Build Failed

**Error:**
```
Error: Cannot resolve module
```

**Solution:**
```bash
# Clear cache
rm -rf node_modules/.vite
npm run build
```

---

### 3. Dev Server Not Starting

**Error:**
```
Port 5173 is already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :5173

# Kill the process
kill -9 <PID>
```

---

### 4. API Connection Failed

**Error:**
```
Network Error
```

**Solution:**
- Verify backend is running on `http://localhost:5000`
- Check `VITE_API_URL` in `.env`
- Ensure CORS is enabled on backend

---

### 5. TypeScript Errors

**Error:**
```
TS2307: Cannot find module
```

**Solution:**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run dev
```

---

## Build Issues

### 1. Build Takes Too Long

**Symptoms:**
- Build process is slow

**Solution:**
- Check for large dependencies
- Enable code splitting (already configured)
- Use production build for development

---

### 2. Build Output Too Large

**Symptoms:**
- Bundle size exceeds 1MB

**Solution:**
- Check manual chunks in `vite.config.ts`
- Remove unused dependencies
- Enable compression

---

### 3. Build Failed with TypeScript Errors

**Error:**
```
TS2344: Type '...' is not assignable
```

**Solution:**
- Fix TypeScript errors in code
- Check type definitions
- Update dependencies

---

## Runtime Issues

### 1. White Screen on Load

**Symptoms:**
- Page shows blank/white screen

**Solution:**
- Check browser console for errors
- Verify API is accessible
- Check authentication token

---

### 2. API Requests Failing

**Symptoms:**
- Network tab shows failed requests

**Solution:**
- Verify backend is running
- Check CORS configuration
- Verify API URL in `.env`

---

### 3. Authentication Loop

**Symptoms:**
- User keeps getting logged out

**Solution:**
- Check token expiration
- Verify JWT_SECRET matches backend
- Clear browser cache and cookies

---

### 4. Slow Page Load

**Symptoms:**
- Pages take too long to load

**Solution:**
- Check network tab for slow requests
- Enable lazy loading (already configured)
- Optimize images

---

## Component Issues

### 1. Component Not Rendering

**Symptoms:**
- Component doesn't appear on page

**Solution:**
- Check component imports
- Verify props are passed correctly
- Check for conditional rendering

---

### 2. State Not Updating

**Symptoms:**
- UI doesn't reflect state changes

**Solution:**
- Use `useState` correctly
- Check for immutable state updates
- Verify event handlers are bound

---

### 3. Form Not Submitting

**Symptoms:**
- Form doesn't submit on button click

**Solution:**
- Check `onSubmit` handler
- Verify form validation passes
- Check for `preventDefault()`

---

## Testing Issues

### 1. Tests Not Running

**Error:**
```
No tests found
```

**Solution:**
- Check test file naming: `*.test.tsx`
- Verify test directory structure
- Check vitest config

---

### 2. Tests Hanging

**Symptoms:**
- Tests never complete

**Solution:**
- Check for unmocked external dependencies
- Verify timers are mocked
- Increase test timeout

---

### 3. Coverage Too Low

**Symptoms:**
- Coverage below 70%

**Solution:**
- Add tests for uncovered components
- Test error paths
- Test edge cases

---

## E2E Testing Issues

### 1. Playwright Tests Failing

**Symptoms:**
- E2E tests fail randomly

**Solution:**
- Add explicit waits
- Use `waitForSelector`
- Check for race conditions

---

### 2. Browser Not Launching

**Error:**
```
Error: Failed to launch browser
```

**Solution:**
```bash
# Install Playwright browsers
npx playwright install

# Or force reinstall
npx playwright install --force
```

---

### 3. Mobile Viewport Issues

**Symptoms:**
- Mobile tests fail

**Solution:**
- Verify viewport size in test
- Check responsive CSS
- Test on real device

---

## Performance Issues

### 1. High Memory Usage

**Symptoms:**
- Browser becomes unresponsive

**Solution:**
- Check for memory leaks
- Use React DevTools Profiler
- Optimize re-renders

---

### 2. Slow Animations

**Symptoms:**
- Animations are choppy

**Solution:**
- Use CSS transforms instead of position
- Reduce animation duration
- Use `will-change` sparingly

---

### 3. Large Bundle Size

**Symptoms:**
- Initial load takes too long

**Solution:**
- Check bundle analysis:
```bash
npm run build -- --report
```
- Remove unused dependencies
- Enable gzip compression

---

## Browser Compatibility Issues

### 1. Feature Not Working in Firefox

**Symptoms:**
- Feature works in Chrome but not Firefox

**Solution:**
- Check for browser-specific APIs
- Add polyfills if needed
- Test in multiple browsers

---

### 2. CSS Not Applying

**Symptoms:**
- Styles don't match design

**Solution:**
- Check CSS specificity
- Verify Tailwind configuration
- Clear browser cache

---

## Deployment Issues

### 1. 404 on Refresh

**Symptoms:**
- Refreshing page shows 404

**Solution:**
- Configure server to serve index.html
- For Vercel: Already handled
- For Netlify: Add `_redirects` file

---

### 2. Environment Variables Not Working

**Symptoms:**
- `.env` variables not loaded

**Solution:**
- Vite uses `VITE_` prefix
- Restart dev server after changes
- Check `.env` file location

---

### 3. Build Failed on CI/CD

**Symptoms:**
- Build succeeds locally but fails on CI

**Solution:**
- Check Node.js version
- Verify dependencies installed
- Check environment variables

---

## Debugging Tips

### 1. Enable React DevTools

Install React DevTools browser extension for debugging.

### 2. Use React Query DevTools

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<ReactQueryDevtools initialIsOpen={false} />
```

### 3. Check Network Tab

Use browser DevTools Network tab to:
- Verify API requests
- Check response times
- Debug errors

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Network Error` | Backend not accessible | Start backend server |
| `401 Unauthorized` | Invalid token | Log in again |
| `403 Forbidden` | Insufficient permissions | Check user role |
| `404 Not Found` | Wrong URL | Check API endpoint |
| `500 Internal Error` | Server error | Check backend logs |

---

## Maintenance Tasks

### 1. Clear Cache

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear build output
rm -rf dist

# Reinstall
npm install
```

### 2. Update Dependencies

```bash
npm outdated
npm update
```

### 3. Check for Security Vulnerabilities

```bash
npm audit
npm audit fix
```

---

## Getting Help

### 1. Check Browser Console

Open DevTools Console to see errors.

### 2. Check Network Tab

Open DevTools Network tab to see API requests.

### 3. Review Logs

Check browser console for errors.

---

## Performance Monitoring

### 1. Check Page Load Time

Use Lighthouse in Chrome DevTools.

### 2. Monitor Bundle Size

```bash
npm run build -- --report
```

### 3. Track User Actions

Integrate analytics for user behavior tracking.

---

## Security Checklist

- [ ] All environment variables are set
- [ ] No sensitive data in code
- [ ] API requests are authenticated
- [ ] CORS is properly configured
- [ ] HTTPS is enabled in production
- [ ] Dependencies are up to date
- [ ] No console.log statements in production
