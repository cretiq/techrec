# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a tech recruitment platform built with Next.js 15, featuring AI-powered CV analysis, role matching, and content generation. The application serves both developers looking for opportunities and companies seeking talent.

### Key Features
- **AI-Powered CV Analysis**: Multi-stage analysis with ATS scoring, content quality assessment, and actionable feedback
- **Multi-Role Applications**: Apply to multiple positions simultaneously with batch cover letter generation
- **Smart Content Generation**: AI-generated cover letters, outreach messages, and CV optimizations
- **Visual Design System**: Modern UI with glass morphism, gradient animations, and responsive components
- **Real-time Updates**: Live progress tracking for analysis and generation tasks
- **Persistent State**: User preferences and generated content preserved across sessions

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
Redux store with feature slices and persistence:
- `userSlice` - User authentication state (persisted)
- `analysisSlice` - CV analysis results (persisted)
- `selectedRolesSlice` - Role selection for multi-role applications (persisted)
- `coverLettersSlice` - Generated cover letters cache (persisted)
- `uiSlice` - UI state management (persisted)
- `analyticsSlice` - Analytics data

**Redux Persistence Configuration**
- User preferences and data persist across sessions
- Analysis results cached with 24-hour expiry
- Selected roles maintained for batch operations
- Generated content preserved during navigation

### UI Component System
The project is migrating from custom components to DaisyUI:
- Custom shadcn/ui components in `/components/ui/`
- DaisyUI components in `/components/ui-daisy/`
- Shared components use Radix UI primitives
- Theme support with dark/light modes via next-themes
- Glass morphism effects and gradient animations throughout

**Key UI Components**
- **AnimatedBackground** - Parallax blob animations with glass morphism
- **HeroSection** - Gradient hero sections with optional animations
- **FeatureCard** - Cards with gradient glows and hover effects
- **TrustIndicator** - Trust badges for social proof
- **Enhanced Badge** - Gradient variants with pulse animations
- **Enhanced Button** - Gradient variants and elevation effects

**Component Migration Patterns**
```tsx
// ❌ Radix UI pattern (shadcn/ui)
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>

// ✅ DaisyUI pattern (native HTML)
<Select value={value} onChange={(e) => setValue(e.target.value)}>
  <option value="option1">Option 1</option>
</Select>

// ✅ DaisyUI Tabs pattern (with URL state)
<Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content</TabsContent>
</Tabs>
```

**CSS Classes & Animations**
- `magical-glow`, `sparkle-loader`, `pulse-ring` - Loading and emphasis effects
- `hero-gradient`, `hero-gradient-dark` - Gradient backgrounds
- `glass`, `glass-dark` - Glass morphism effects
- `animate-blob`, `animate-fade-in-up` - Animation utilities

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
6. Results persisted in Redux for seamless navigation

### Multi-Role Application Flow
1. Users search and filter available roles
2. Select multiple roles for batch operations
3. Generate cover letters for all selected roles
4. Track generation progress with real-time updates
5. Access generated content from writing assistant
6. Export or apply to roles with personalized content

### Role Search Features
- Integration with RapidAPI for expanded job listings
- Advanced filtering with result limits
- Bulk selection capabilities
- URL state management for shareable searches
- Animated loading states and transitions

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

### Debugging & Troubleshooting

**Common React Issues**
- **Infinite API calls**: Check useEffect dependencies for unstable references
- **Form control errors**: "You provided a `value` prop without an `onChange` handler" - ensure controlled components have both `value` and `onChange`
- **Component library mismatch**: Verify you're using the correct API for DaisyUI vs Radix UI components

**Redux Persistence Issues**
- **"Loading..." stuck after refresh**: Check if all necessary Redux state fields are in the persist whitelist
- **Status field not persisted**: Add 'status' to the whitelist in store.ts to maintain state across refreshes
- **REHYDRATE handling**: Ensure analysisSlice handles rehydration properly when data exists but status is 'idle'

**ID Mismatch Issues (CV Analysis)**
- **Problem**: CVManagementPage shows "Loading..." when analysisIdFromStore !== analysisIdFromUrl
- **Root Cause**: The URL might contain a CV ID while the store has the analysis ID from the API response
- **Solution**: Updated the conditional logic to check for data existence rather than strict ID matching
- **Key Files**: 
  - `/app/developer/cv-management/page.tsx` (line 340) - Conditional rendering logic
  - `/components/cv/CVList.tsx` - Ensure it passes the correct analysisId
  - `/lib/features/analysisSlice.ts` - Handles ID mapping from API response
- **API Response Structure**: 
  ```javascript
  {
    id: "analysis-id",        // This is what goes in Redux store
    cvId: "cv-id",           // This might be in the URL
    analysisResult: {...},   // The actual analysis data
  }
  ```
- **Debugging Tips**:
  - Check console logs for ID values: `URL ID: xxx, Store ID: yyy`
  - Verify which ID is being passed in the URL (CV vs Analysis)
  - Ensure CVList passes `cv.analysisId` not `cv.id` to the Improve button

**Performance Issues**
- Multiple rapid API calls often indicate useEffect dependency issues
- Use browser dev tools Network tab to identify API call patterns
- Look for console warnings about controlled vs uncontrolled components

**Development Tools**
- Use `console.log` strategically in useEffect to trace dependency changes
- Browser React DevTools to inspect component state and props
- Next.js development server provides detailed error logging

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

### React Best Practices & Anti-Patterns

**CRITICAL: Avoid Infinite Loops in useEffect**
- Never include unstable dependencies in useEffect arrays (like `toast` from useToast)
- Remove callback functions from useEffect dependencies if they cause re-renders
- Use empty dependency arrays `[]` for useCallback when the function doesn't need to change
- Example fix: Remove `toast` and `fetchFunction` from dependency arrays to prevent infinite loops
- Always wrap functions passed to useEffect with useCallback

**Form Controls & DaisyUI Components**
- DaisyUI Select components use native HTML `<select>` with `onChange`, not `onValueChange`
- Always provide `onChange` handlers for controlled form inputs with `value` props
- Use `<option>` elements directly inside DaisyUI Select, not SelectItem/SelectContent wrappers
- When migrating from Radix UI to DaisyUI, replace `onValueChange` with `onChange={(e) => handler(e.target.value)}`
- Ensure value/onChange pairs are always present together for controlled components

**Component API Consistency**
- Be aware of component library differences: Radix UI vs DaisyUI have different APIs
- DaisyUI components are wrappers around native HTML elements
- Shadcn/ui components (in `/components/ui/`) use Radix UI patterns
- DaisyUI components (in `/components/ui-daisy/`) use native HTML patterns

**URL State Management**
- Use URL parameters for shareable state (tabs, filters, search queries)
- Sync Redux state with URL parameters for better UX
- Handle browser navigation (back/forward) properly
- Example: `?tab=analysis&filter=pending`

## Git Workflow

- **ALWAYS commit when making bigger changes**: Any substantial feature additions, refactoring, or multi-file modifications should be committed with descriptive commit messages
- Use conventional commit format: `feat:`, `fix:`, `refactor:`, `chore:`, etc.
- Run lint and type checks before committing