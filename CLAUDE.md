# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a tech recruitment platform built with Next.js 15, featuring AI-powered CV analysis, role matching, and content generation. The application serves both developers looking for opportunities and companies seeking talent.

## Key Architecture

### Technology Stack
- **Next.js 15.2.4** with App Router architecture
- **TypeScript** for type safety
- **MongoDB** with Prisma ORM (6.6.0)
- **Redis** for caching (ioredis)
- **AWS S3** for file storage
- **Redux Toolkit** for state management
- **TailwindCSS 4** with DaisyUI components

### AI Integration
The project uses a flexible AI provider system that can switch between:
- **OpenAI** (GPT models)
- **Google Gemini**

AI provider selection is handled via `utils/aiProviderSelector.ts`. Both providers are used for:
- CV analysis and parsing
- Cover letter generation
- Outreach message generation
- Content optimization

### Authentication & Security
- **NextAuth.js** with Google and GitHub OAuth providers
- JWT-based session management
- Middleware-based route protection
- Role-based access (Developer/Company user types)

## Common Development Commands

```bash
# Development
npm run dev                    # Start development server (port 3000)
npm run build                  # Build production bundle
npm run start                  # Start production server

# Code Quality
npm run lint                   # Run ESLint
npm run test                   # Run Jest tests
npm run test:watch            # Run tests in watch mode

# Database
npx prisma migrate dev         # Run database migrations
npx prisma generate           # Generate Prisma client
npx prisma db push           # Push schema changes
npx prisma studio            # Open Prisma Studio GUI

# Seeding & Data Management
npm run seed                  # Run database seeding
npm run seed:roles           # Seed roles data
npm run seed:companies       # Seed companies and roles
```

## Project Structure

### API Routes (`/app/api/`)
RESTful API endpoints following the pattern `/api/[resource]/[id]/[action]`:
- `/api/cv/` - CV upload, parsing, and management
- `/api/cv-analysis/` - AI-powered CV analysis with retry and versioning
- `/api/roles/` - Job role management and searching
- `/api/developers/` - Developer profiles and applications
- `/api/companies/` - Company management
- `/api/generate-*` - AI content generation endpoints

### Key Services & Utilities
- **CV Parser** (`utils/cv-parser/`) - Handles PDF/DOCX parsing with multiple fallback strategies
- **CV Analyzer** (`utils/cv-analyzer/`) - Multi-stage analysis including ATS scoring, content quality, and impact assessment
- **S3 Storage** (`utils/s3Storage.ts`) - File upload/download with proper error handling
- **Analysis Service** (`utils/analysisService.ts`) - Orchestrates CV analysis workflow with caching

### State Management
Redux store with feature slices:
- `userSlice` - User authentication state
- `analysisSlice` - CV analysis results
- `selectedRolesSlice` - Role selection for applications
- `uiSlice` - UI state management
- `analyticsSlice` - Analytics data

### UI Component System
The project is migrating from custom components to DaisyUI:
- Custom shadcn/ui components in `/components/ui/`
- DaisyUI components in `/components/ui-daisy/`
- Shared components use Radix UI primitives
- Theme support with dark/light modes via next-themes

## Development Workflow

### CV Analysis Flow
1. User uploads CV (PDF/DOCX) → S3 storage
2. File parsed using LangChain or custom parsers
3. Structured data analyzed across multiple dimensions:
   - ATS compatibility
   - Content quality
   - Formatting assessment
   - Impact measurement
4. Results cached in Redis (24-hour TTL)
5. Analysis can be retried or versioned

### Task Management (Task Master)
The project uses Task Master for structured development:
```bash
task-master list              # View all tasks
task-master next             # Show next task to work on
task-master show <id>        # View task details
task-master set-status --id=<id> --status=done  # Mark task complete
```

See `/scripts/README-task-master.md` for comprehensive Task Master documentation.

### Testing Approach
- Jest for unit tests
- React Testing Library for component tests
- AWS SDK mocking for S3 operations
- Test files alongside source files (`.test.ts` or `.test.tsx`)

## Environment Variables

Required in `.env.local`:
```bash
# Database
MONGODB_URI=             # MongoDB connection string

# Authentication
NEXTAUTH_URL=           # Your app URL
NEXTAUTH_SECRET=        # Random secret for JWT

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=

# AI Providers
OPENAI_API_KEY=         # For GPT models
GOOGLE_AI_API_KEY=      # For Gemini models

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=

# Redis
REDIS_URL=              # Redis connection URL

# External APIs (optional)
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
RAPIDAPI_KEY=
```

## Key Architectural Decisions

1. **Dual AI Provider System**: Abstraction layer allows switching between OpenAI and Gemini based on availability or specific use cases.

2. **Multi-Stage CV Analysis**: Comprehensive analysis beyond simple parsing, including ATS scoring and impact assessment.

3. **Redis Caching Strategy**: 24-hour TTL with graceful fallbacks ensures performance while handling analysis updates.

4. **File Processing Pipeline**: S3 upload → Parse → Analyze → Cache pattern provides reliability and scalability.

5. **Component Migration**: Gradual migration from custom components to DaisyUI for faster development while maintaining existing functionality.

6. **Worker Pattern**: Background job processing for expensive operations like cover letter generation.

## Code Conventions

- Use TypeScript strict mode
- Prefer async/await over promises
- Use Prisma for all database operations
- Cache expensive operations in Redis
- Handle errors gracefully with proper logging
- Follow Next.js App Router patterns
- Use server components by default, client components only when needed

## Git Workflow

- **ALWAYS commit when making bigger changes**: Any substantial feature additions, refactoring, or multi-file modifications should be committed with descriptive commit messages
- Use conventional commit format: `feat:`, `fix:`, `refactor:`, `chore:`, etc.
- Run lint and type checks before committing