# Contributor Guide

## Project Overview

BrainBuildAI is a React Router v7 framework mode application that helps Product Managers create clear and detailed Product Requirement Documents (PRDs) quickly and efficiently. The project uses TypeScript, Drizzle ORM with PostgreSQL, and comprehensive testing with Vitest and Playwright.

## Key Files and Folders to Work With

- **`/app`** - Main application code (React Router v7)
  - `/app/routes` - Application routes and pages
  - `/app/components` - Reusable React components
  - `/app/utils` - Utility functions and helpers
  - `/app/models` - Data models and schemas
  - `/app/styles` - CSS and Tailwind styles
- **`/db`** - Database schemas and migrations (Drizzle ORM)
- **`/tests`** - Test files and test setup
- **`/other`** - Utility files and miscellaneous items (preferred over root clutter)
- **`/.github/workflows`** - CI/CD pipeline configuration

## Dev Environment Setup

### Prerequisites
1. **Node.js v22** - Use `nvm install v22` if using nvm
2. **PostgreSQL** - Install locally for development
3. **VS Code** - Install recommended extensions from `.vscode/extensions.json`

### Getting Started
```bash
# Clone and setup
npm install
npm run db:reseed    # Sets up and seeds the database
npm run dev          # Start development server

# Before committing
npm run validate     # Runs all checks (tests, lint, typecheck, e2e)
```

### Database Management
- **Create migration**: `npx drizzle-kit generate`
- **Apply migration**: `npm run db:migrate`
- **Reset database**: `npm run db:reset` (dev) or see README for prod
- **Seed database**: `npm run db:seed`
- **Database studio**: `npm run db:studio`

## Testing Instructions

### Unit Tests (Vitest)
```bash
npm run test          # Run all unit tests
npm run test -- --ui  # Run with UI
npm run coverage      # Generate coverage report
```

### End-to-End Tests (Playwright)
```bash
npm run test:e2e:install  # Install Playwright browsers
npm run test:e2e:run      # Run E2E tests (requires build)
npm run test:e2e:dev      # Run E2E tests with UI
```

### Full Validation Pipeline
```bash
npm run validate  # Runs: test, lint, typecheck, test:e2e:run, db:seed
```

The CI pipeline runs these same checks on every pull request.

## Linting and Code Quality

- **Biome**: Primary linter and formatter (`npm run lint:fix`)
- **TypeScript**: Type checking (`npm run typecheck`)
- **Markdown**: `npm run lint:md` - validates all markdown files
- **Spelling**: `npm run lint:spelling` - spell checks all files

## Building and Deployment

```bash
npm run build        # Build for production
npm run start        # Start production server
npm run start:mocks  # Start production server with mocks
```

Deployment is automated via GitHub Actions to Fly.io for `main` branch

## Adding Components

### UI Components (shadcn/ui)
- Components in `/app/components/ui` are from shadcn/ui registry
- Feel free to customize them as needed
- They're not installed as a library but downloaded and
- 
### Icons
```bash
npx sly add  # Add icons from Lucide or Radix UI
```

## Contribution Guidelines

### Code Style
- Follow existing patterns in the codebase
- Use TypeScript for all new code
- Prefer composition over inheritance
- Keep components small and focused
- Use existing utilities before creating new ones

### File Organization
- Keep root directory clean - move files to `/other` when possible
- Use meaningful file names and directory structure
- Co-locate related files (components, tests, styles)

### Database Changes
- Always create migrations for schema changes
- Test migrations both up and down
- Seed data should be idempotent
- Never break existing data structures without migration path

## PR Instructions

### Title Format
Use descriptive titles that clearly explain the change:
- `feat: add user authentication system`
- `fix: resolve database connection timeout`
- `docs: update API documentation`
- `refactor: simplify user model structure`

### Description Requirements
- Describe what changed and why
- Include any breaking changes
- Link to related issues
- Add screenshots for UI changes
- Note any database migrations required

### Before Submitting
1. Run `npm run validate` - must pass all checks
2. Ensure all tests are passing
3. Update documentation if needed
4. Test your changes locally
5. Keep changes focused and atomic

### Review Process
- All PRs require review before merging
- CI must pass (lint, test, typecheck, e2e)
- Database migrations are reviewed carefully
- Breaking changes require additional approval

## Environment Configuration

- **Development**: Uses local PostgreSQL and `.env` file
- **Production**: Deployed on Fly.io with remote PostgreSQL
- **Testing**: Uses test database configuration

Copy `.env.example` to `.env` and configure for your local setup.

## Getting Help

- Check existing issues and PRs first
- Review this guide and README.md
- Ask questions in PR comments
- Reference the React Router v7 documentation for framework questions
- Check Drizzle ORM docs for database questions
