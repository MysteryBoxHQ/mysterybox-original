# RollingDrop Platform - Multi-Developer Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Development Environment](#development-environment)
4. [Team Workflow](#team-workflow)
5. [Code Standards](#code-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Deployment Process](#deployment-process)

## Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **PostgreSQL** (v14 or higher)
- **Git**
- **Visual Studio Code** (recommended IDE)

### VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "ms-vscode-remote.remote-containers"
  ]
}
```

## Repository Setup

### 1. Initialize Git Repository
```bash
git init
git remote add origin <your-repository-url>
git branch -M main
```

### 2. Branch Structure
```
main/production     # Stable production releases
develop            # Integration branch for features
feature/*          # Feature development branches
hotfix/*           # Critical bug fixes
release/*          # Release preparation branches
```

### 3. Git Hooks Setup
Create `.githooks/pre-commit`:
```bash
#!/bin/sh
npm run lint
npm run type-check
npm run test:unit
```

Enable hooks:
```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

## Development Environment

### Docker Setup (Recommended for Teams)

#### 1. Create `docker-compose.dev.yml`
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: rollingdrop_dev
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "5000:5000"
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://dev_user:dev_password@postgres:5432/rollingdrop_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

#### 2. Create `Dockerfile.dev`
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Install development dependencies
RUN npm install -g tsx nodemon

EXPOSE 5000 5173

CMD ["npm", "run", "dev"]
```

#### 3. Environment Configuration
Create `.env.example`:
```env
# Database
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/rollingdrop_dev

# Session
SESSION_SECRET=your_session_secret_here

# Replit Auth (if using)
REPL_ID=your_repl_id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.replit.app

# External APIs
STRIPE_SECRET_KEY=sk_test_your_stripe_key
SENDGRID_API_KEY=your_sendgrid_key

# CDN Configuration
CDN_PROVIDER=local
# For MinIO: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY
# For ImageKit: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT
# For Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

# Development
NODE_ENV=development
LOG_LEVEL=debug
```

### Local Development Setup

#### 1. Clone and Install
```bash
git clone <repository-url>
cd rollingdrop-platform
npm install
```

#### 2. Database Setup
```bash
# Create local database
createdb rollingdrop_dev

# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

#### 3. Start Development Server
```bash
# Using Docker
docker-compose -f docker-compose.dev.yml up

# Or locally
npm run dev
```

## Team Workflow

### Feature Development Process

#### 1. Start New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/analytics-enhancement
```

#### 2. Development Cycle
```bash
# Make changes
git add .
git commit -m "feat(analytics): add real-time revenue tracking"

# Push regularly
git push origin feature/analytics-enhancement
```

#### 3. Create Pull Request
- **Title:** Clear, descriptive summary
- **Description:** What changed, why, and how to test
- **Screenshots:** For UI changes
- **Breaking Changes:** Document any API changes

#### 4. Code Review Checklist
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No console.log statements in production code
- [ ] TypeScript errors resolved
- [ ] Performance impact considered
- [ ] Security implications reviewed

### Parallel Development Strategy

#### Frontend Team Tasks
- Component development in `client/src/components/`
- Page implementation in `client/src/pages/`
- State management and API integration
- UI/UX improvements and responsive design

#### Backend Team Tasks
- API endpoints in `server/routes.ts`
- Database operations in `server/storage.ts`
- Schema updates in `shared/schema.ts`
- External integrations and webhooks

#### Full-Stack Features
- End-to-end feature implementation
- Integration testing
- Performance optimization
- Documentation updates

## Code Standards

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  }
}
```

### ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

### Naming Conventions
```typescript
// Components: PascalCase
export function AnalyticsDashboard() {}

// Files: kebab-case
analytics-dashboard.tsx
webhook-manager.tsx

// Functions: camelCase
function getUserAnalytics() {}

// Constants: SCREAMING_SNAKE_CASE
const API_BASE_URL = '/api/v1';

// Interfaces: PascalCase with 'I' prefix
interface IUserAnalytics {}

// Types: PascalCase
type UserRole = 'admin' | 'partner' | 'user';
```

### API Design Standards
```typescript
// RESTful endpoints
GET    /api/admin/analytics          # Get analytics
POST   /api/admin/webhooks           # Create webhook
PUT    /api/admin/webhooks/:id       # Update webhook
DELETE /api/admin/webhooks/:id       # Delete webhook

// Response format
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error format
{
  "success": false,
  "error": "Invalid request parameters",
  "code": "VALIDATION_ERROR"
}
```

## Testing Guidelines

### Unit Testing Setup
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Test Structure
```
tests/
├── unit/
│   ├── components/
│   └── utils/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    ├── admin-flow.test.ts
    └── partner-integration.test.ts
```

### Testing Commands
```bash
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Coverage report
```

### Example Test
```typescript
// tests/unit/components/AnalyticsDashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';

describe('AnalyticsDashboard', () => {
  it('renders analytics cards correctly', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
  });
});
```

## Database Management

### Migration Workflow
```bash
# Generate migration
npm run db:generate "add_webhook_table"

# Apply migrations
npm run db:migrate

# Rollback migration
npm run db:rollback
```

### Schema Changes Process
1. Update `shared/schema.ts`
2. Generate migration with Drizzle
3. Test migration on development database
4. Create pull request with schema changes
5. Apply to staging environment
6. Deploy to production with migration

## Deployment Process

### Environment Setup
- **Development:** Local/Docker environment
- **Staging:** Production-like environment for testing
- **Production:** Live platform

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
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
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: echo "Deploy to production server"
```

### Deployment Checklist
- [ ] All tests passing
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Monitoring and logging enabled
- [ ] Backup procedures in place
- [ ] Rollback plan prepared

## Team Communication

### Daily Standups
- **What did you work on yesterday?**
- **What are you working on today?**
- **Any blockers or dependencies?**

### Code Review Guidelines
- Review within 24 hours
- Focus on logic, security, and maintainability
- Provide constructive feedback
- Approve when ready, request changes when needed

### Documentation Requirements
- API changes must include updated documentation
- New features require usage examples
- Complex algorithms need inline comments
- README updates for setup changes

## Getting Started Checklist

### For New Team Members
- [ ] Clone repository and set up local environment
- [ ] Install required VS Code extensions
- [ ] Configure Git hooks and commit message template
- [ ] Run through local development setup
- [ ] Create and deploy a small test feature
- [ ] Review codebase structure and conventions
- [ ] Join team communication channels

### First Week Tasks
- [ ] Familiarize with admin panel functionality
- [ ] Understand partner integration system
- [ ] Review analytics and webhook implementations
- [ ] Set up development database with seed data
- [ ] Complete onboarding documentation review

## Support and Resources

### Documentation Links
- [API Documentation](/api/docs)
- [Component Library](/docs/components)
- [Database Schema](/docs/database)
- [Deployment Guide](/docs/deployment)

### Team Contacts
- **Tech Lead:** [Contact information]
- **DevOps:** [Contact information]
- **Product Owner:** [Contact information]

### Emergency Procedures
- Production issues: Contact tech lead immediately
- Security concerns: Follow security incident protocol
- Data issues: Create immediate backup before investigating

---

This guide should be updated as the project evolves and new team members join. Keep it as a living document that reflects current best practices and team decisions.