# UTME Master Frontend Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd utme-master-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Vite Configuration
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME="UTME Master"
VITE_APP_URL=http://localhost:5173

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PDF_EXPORT=true
```

### 4. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`

---

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### 2. Preview Production Build

```bash
npm run preview
```

### 3. Deploy to Static Hosting

The `dist` directory contains static files that can be deployed to:

- **Vercel** (Recommended)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**
- **Firebase Hosting**

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 5. Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |
| `VITE_APP_NAME` | No | Application name |
| `VITE_APP_URL` | No | Application URL |
| `VITE_ENABLE_ANALYTICS` | No | Enable analytics |
| `VITE_ENABLE_PDF_EXPORT` | No | Enable PDF export |

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest |
| Firefox | Latest |
| Safari | Latest |
| Edge | Latest |

---

## Performance Optimization

### Code Splitting

The application uses code splitting for:

- React vendor libraries
- Chart libraries
- Form libraries
- UI libraries
- API libraries
- Utility libraries

### Lazy Loading

Components are lazy loaded:

- `RichTextEditor`
- `DisplayQuestion`
- Exam pages
- Results pages

### Image Optimization

Use WebP format for images:

```tsx
<picture>
  <source srcSet="/image.webp" type="image/webp" />
  <img src="/image.png" alt="Description" />
</picture>
```

---

## Troubleshooting

### Common Issues

#### 1. Module Not Found

**Error:**
```
Cannot find module 'react'
```

**Solution:**
```bash
npm install
```

#### 2. Build Failed

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

#### 3. Dev Server Not Starting

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

#### 4. API Connection Failed

**Error:**
```
Network Error
```

**Solution:**
- Verify backend is running
- Check `VITE_API_URL` in `.env`
- Ensure CORS is enabled on backend

#### 5. TypeScript Errors

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

## Testing

### Run Unit Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Run E2E Tests with UI

```bash
npm run test:e2e:ui
```

---

## Linting and Formatting

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

---

## Development Tools

### React DevTools

Install the React DevTools browser extension for debugging.

### Redux DevTools

Install the Redux DevTools browser extension for state inspection.

### TypeScript Plugin

Install TypeScript plugin for your IDE:

- **VS Code:** TypeScript and JavaScript Language Features
- **WebStorm:** Built-in TypeScript support

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: vercel/actions@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use HTTPS** in production
3. **Set Content Security Policy**
4. **Sanitize user inputs**
5. **Validate API responses**
6. **Keep dependencies updated**

---

## Monitoring

### Error Tracking

Integrate Sentry for error tracking:

```bash
npm install @sentry/react
```

### Analytics

Integrate Google Analytics:

```bash
npm install react-ga4
```

---

## Deployment Checklist

- [ ] Build succeeds without errors
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] API URL points to production backend
- [ ] SSL/HTTPS enabled
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] Backup strategy in place
