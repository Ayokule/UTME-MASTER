# UTME Master Environment Configuration Guide

## Overview

This document explains the environment configuration system for UTME Master.

## Environment Files

### File Structure

```
utme-master-backend/
├── .env.example              # Template for all environments
├── .env.development         # Development configuration
├── .env.staging             # Staging configuration
├── .env.production          # Production configuration
├── .env                     # Local environment (gitignored)
└── scripts/
    ├── env-check.sh         # Environment validation script
    ├── setup-env.sh         # Environment setup script
    └── deploy.sh            # Deployment script
```

### File Purposes

| File | Purpose | Commit to Git? |
|------|---------|----------------|
| `.env.example` | Template with all variables | Yes |
| `.env.development` | Development settings | No |
| `.env.staging` | Staging settings | No |
| `.env.production` | Production settings | No |
| `.env` | Local overrides | No |

---

## Environment Setup

### Development Environment

The development environment is configured for local development with:

- **Debug logging** - Detailed logs for debugging
- **Development database** - Separate database for development
- **Mock email** - Mailtrap for email testing
- **High rate limits** - 1000 requests per minute
- **Large uploads** - 50MB upload limit
- **No analytics** - Analytics disabled for development

#### Setup

```bash
# Linux/Mac
./scripts/setup-env.sh development

# Windows
scripts\setup-env.bat development
```

### Staging Environment

The staging environment mirrors production with:

- **Info logging** - Balanced logging level
- **Staging database** - Separate database for staging
- **Real email** - Email notifications enabled
- **Moderate rate limits** - 500 requests per minute
- **Standard uploads** - 10MB upload limit
- **Analytics enabled** - Track staging usage

#### Setup

```bash
# Linux/Mac
./scripts/setup-env.sh staging

# Windows
scripts\setup-env.bat staging
```

### Production Environment

The production environment is optimized for live usage:

- **Warn logging** - Only warnings and errors
- **Production database** - Live database
- **Real email** - Email notifications enabled
- **Strict rate limits** - 100 requests per minute
- **Small uploads** - 5MB upload limit
- **Analytics enabled** - Production analytics
- **Security hardened** - Strict security settings

#### Setup

```bash
# Linux/Mac
./scripts/setup-env.sh production

# Windows
scripts\setup-env.bat production
```

---

## Environment Variables

### Server Configuration

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | development | staging | production |
| `PORT` | 5000 | 5000 | 5000 |
| `BACKEND_URL` | http://localhost:5000 | https://staging-api.utmemaster.com | https://api.utmemaster.com |

### Database Configuration

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `DATABASE_URL` | postgresql://..._dev | postgresql://..._staging | postgresql://..._prod |

### JWT Configuration

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `JWT_SECRET` | dev-jwt-secret-key | staging-jwt-secret-key | production-jwt-secret-key |
| `JWT_EXPIRES_IN` | 7d | 7d | 7d |

### Email Configuration

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `SMTP_HOST` | sandbox.smtp.mailtrap.io | smtp.gmail.com | smtp.gmail.com |
| `SMTP_PORT` | 2525 | 587 | 587 |
| `FROM_EMAIL` | noreply@utmemaster-dev.test | noreply@staging.utmemaster.com | noreply@utmemaster.com |

### Security Configuration

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `CORS_ORIGINS` | localhost:5173,3000,8080 | staging.utmemaster.com | utmemaster.com |
| `ENABLE_RATE_LIMIT` | true | true | true |
| `RATE_LIMIT_MAX` | 1000 | 500 | 100 |

### Feature Flags

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `ENABLE_ANALYTICS` | false | true | true |
| `ENABLE_PDF_EXPORT` | true | true | true |
| `ENABLE_EMAIL_NOTIFICATIONS` | false | true | true |

---

## Deployment Scripts

### Environment Check Script

Validates environment configuration before starting:

```bash
# Linux/Mac
./scripts/env-check.sh

# Windows
scripts\env-check.bat
```

### Setup Script

Sets up the environment:

```bash
# Linux/Mac
./scripts/setup-env.sh [environment]

# Windows
scripts\setup-env.bat [environment]
```

### Deployment Script

Deploys to production:

```bash
# Linux/Mac
./scripts/deploy.sh

# Windows
scripts\deploy.bat
```

---

## Best Practices

### 1. Never Commit Sensitive Files

The `.gitignore` file ensures `.env` files are not committed:

```
.env
.env.*
!.env.example
```

### 2. Use Environment-Specific Variables

Always use the appropriate environment file:

- **Development**: `.env.development`
- **Staging**: `.env.staging`
- **Production**: `.env.production`

### 3. Validate Before Deploy

Run the environment check script before deploying:

```bash
./scripts/env-check.sh
```

### 4. Use Strong Secrets in Production

Generate strong secrets for production:

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Rotate Secrets Regularly

Rotate JWT secrets and database passwords regularly.

### 6. Use Different Databases

Each environment should use a separate database:

- Development: `utme_master_dev`
- Staging: `utme_master_staging`
- Production: `utme_master_prod`

---

## Troubleshooting

### 1. Environment File Not Found

**Error:**
```
Error: Cannot find module './config/env'
```

**Solution:**
```bash
# Create .env file from example
cp .env.example .env

# Or use setup script
./scripts/setup-env.sh development
```

### 2. Database Connection Failed

**Error:**
```
Error: P1000: Database connection failed
```

**Solution:**
- Verify `DATABASE_URL` in `.env`
- Check database is running
- Verify credentials

### 3. JWT Token Errors

**Error:**
```
JsonWebTokenError: invalid token
```

**Solution:**
- Verify `JWT_SECRET` matches between token creation and verification
- Check token expiration
- Ensure token is sent in Authorization header

### 4. CORS Errors

**Error:**
```
Access to fetch at 'http://localhost:5000/api' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
- Verify `CORS_ORIGINS` in `.env`
- Include frontend URL in CORS list

---

## Security Checklist

- [ ] `.env` files are gitignored
- [ ] Production secrets are strong
- [ ] Different databases for each environment
- [ ] Environment check runs before deploy
- [ ] Secrets are rotated regularly
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Email credentials are secure

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npx prisma generate
      - run: npm run build
      - run: ./scripts/env-check.sh
      - run: ./scripts/deploy.sh
        env:
          NODE_ENV: production
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

---

## Support

For environment configuration questions:
- Email: dev-support@utmemaster.com
- Documentation: docs.utmemaster.com
