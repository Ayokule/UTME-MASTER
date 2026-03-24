# Contributing to UTME Master

Thank you for your interest in contributing to UTME Master!

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+

### Local Development

```bash
# Clone repository
git clone https://github.com/utme-master/utme-master.git
cd utme-master-backend

# Install dependencies
npm install

# Start development environment
docker-compose -f docker-compose.local.yml up -d

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Code Style

- Follow existing code style
- Run `npm run lint` before committing
- Run `npm run typecheck` to verify types
- Write tests for new features

## Commit Messages

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance

Example: `feat: add user authentication`

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Get approval from at least one maintainer
5. Squash commits if needed

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test src/controllers/user.controller.test.ts

# Run with coverage
npm run coverage

# Run E2E tests
npm run test:e2e
```

## Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update API documentation in `docs/`

## Security

- Never commit secrets or API keys
- Run `npm audit` before committing
- Report security issues privately

## Questions?

Open an issue or contact the maintainers.
