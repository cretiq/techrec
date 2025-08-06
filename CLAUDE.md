# CLAUDE.md - Project Guidelines & Context

This file provides comprehensive guidance for Claude Code when working with the TechRec repository.

---

## 🎯 PROJECT OVERVIEW

### Core Platform
**TechRec** is a comprehensive AI-powered tech recruitment platform with sophisticated gamification, built with:
- **Frontend**: Next.js 15+ with TypeScript, TailwindCSS 4, DaisyUI components
- **Backend**: Next.js API routes with Prisma ORM, MongoDB, Redis caching
- **AI Integration**: Dual provider system (OpenAI + Google Gemini)
- **Payments**: Stripe integration for subscription management
- **Gamification**: XP progression + subscription-based points economy

### Key Features
- Multi-stage CV analysis with ATS scoring and actionable feedback
- AI-powered cover letter and outreach message generation
- Batch application workflows with progress tracking
- Comprehensive gamification system with achievements and streaks
- Subscription tiers with points-based premium features
- Real-time state management with Redux persistence

---

## 🚨 CRITICAL WORKFLOWS & NON-NEGOTIABLES

### ⚠️ CRITICAL TAILWIND CSS CONFIGURATION
**🚫 NEVER REMOVE**: The safelist configuration in `tailwind.config.ts` is MANDATORY:

```typescript
safelist: [
  // Force include utilities that content scanning misses
  'bg-green-200', 'border-4', 'border-8', 'border-opacity-50',
  // Pattern matching for all variations
  { pattern: /bg-green-\d+/ },
  { pattern: /bg-red-\d+/ }, 
  { pattern: /bg-blue-\d+/ },
  { pattern: /border-\d+/ },
  { pattern: /\/\d+/ }, // opacity modifiers
],
```

**Root Cause**: Tailwind's content scanning fails to detect certain utilities, causing selective generation where some work (border-2) but others fail (border-4). This affects both v3 and v4.

**Critical Symptoms**: 
- Only some utility variations work (bg-green-100 ✅, bg-green-200 ❌)
- Arbitrary values fail entirely
- CDN works but local build doesn't
- Border/opacity utilities randomly missing

### Git Commit Policy
**🚫 ABSOLUTE PROHIBITION**: 
- **NEVER COMMIT CHANGES WITHOUT EXPLICIT USER PERMISSION**
- User must test changes and explicitly say "commit this" or "create a commit"
- Even if changes are complete and working, ALWAYS wait for user approval
- Breaking this rule destroys user trust and workflow control

### Gamification System Management
**⚠️ MANDATORY PROCESS**: For ANY gamification-related work:
1. **ALWAYS read** `@GAMIFICATION_STRATEGY.md` first
2. **IMMEDIATELY update** the documentation after any gamification changes
3. Follow the dual-progression architecture (XP levels + subscription tiers)
4. Maintain consistency with existing point costs and XP rewards

### Testing Requirements
**⚠️ MANDATORY**: Comprehensive testing coverage following established patterns:
```tsx
// ✅ UI Testing - Every interactive element requires data-testid
<Button data-testid="profile-experience-add-button">Add Experience</Button>
<Input data-testid="profile-info-input-name" />

// ✅ Schema Validation Testing - Use Zod for all API validation
export const RequestSchema = z.object({
  field: z.string().min(1, "Field is required"),
}).strict();
```

### API Development Standards
**⚠️ MANDATORY**: All API routes must follow established patterns:
1. **Zod Schema Validation**: Runtime validation for all inputs
2. **Semantic Caching**: Cache keys that capture business logic meaning
3. **Structured Error Handling**: Custom error classes with metadata
4. **Graceful Degradation**: External service failures don't break core functionality

---

## 📋 GIT COMMIT STRATEGY

### Core Principles
- **Commit frequently**: Small, focused commits over large ones
- **Self-contained changes**: Each commit = complete, logical unit of work
- **Clear messaging**: Conventional commit format always
- **Atomic commits**: One concern per commit (never mix features with fixes)
- **Maximum 1-2 hours of work per commit**

### Commit Message Format
```
<type>(<scope>): <description>

[optional body explaining why, not what]
```

#### Commit Types & Scopes
**Types**: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `chore`
**Scopes**: `gamification`, `subscription`, `cv-analysis`, `auth`, `ui`, `api`, `db`

### When to Commit
✅ **DO commit when:** Function/method complete, bug fixed, component working, tests pass
❌ **DON'T commit when:** Code doesn't compile, tests failing, mixing changes, **USER HAS NOT EXPLICITLY APPROVED**

---

## 🏗️ ARCHITECTURE & DEVELOPMENT PATTERNS

### Technology Stack
- **Frontend**: Next.js 15.2+ with App Router, TypeScript (strict mode)
- **Styling**: TailwindCSS 4 + DaisyUI components
- **Database**: MongoDB with Prisma ORM (6.6.0)
- **Caching**: Redis (ioredis) for configuration and performance
- **State Management**: Redux Toolkit with persistence
- **Payments**: Stripe with webhook security
- **Authentication**: NextAuth.js with OAuth providers

### Database Architecture (Single Source of Truth)
**✅ CRITICAL UPDATE (January 2025)**: Complete migration from redundant CvAnalysis table to proper single source of truth.

**Core Profile Tables**:
- `Developer`: User profiles with gamification fields, contact info, basic profile data
- `ContactInfo`: 1:1 with Developer - phone, address, social links
- `Experience`: 1:Many with Developer - work history with responsibilities and achievements
- `Education`: 1:Many with Developer - educational background with dates and details
- `Achievement`: 1:Many with Developer - certifications, awards, accomplishments
- `DeveloperSkill`: Many:Many junction table with Skill - skill levels and categories
- `Skill`: Master skill list with categories for consistent skill management

**File Management**:
- `CV`: File metadata only (S3 keys, upload status, improvement scores)
- **DEPRECATED**: ~~`CvAnalysis`~~ - No longer used, data migrated to proper profile tables

**Gamification Tables**:
- `XPTransaction`, `PointsTransaction`, `UserBadge`, `DailyChallenge`, `SubscriptionTier`

### State Management Patterns
**Redux Slices with Persistence**:
- `userSlice`: Authentication state (persisted)
- `analysisSlice`: CV analysis results (persisted, 24h expiry)
- `gamificationSlice`: XP, points, achievements (persisted)
- `selectedRolesSlice`: Multi-role application state (persisted)
- `coverLettersSlice`: Generated content cache (persisted)

### AI Integration
**Dual Provider System** (`utils/aiProviderSelector.ts`):
- **OpenAI**: GPT models for analysis and generation
- **Google Gemini**: Alternative provider with automatic fallback
- **Usage**: CV analysis, cover letter generation, content optimization

**Essential AI Patterns**:
```typescript
// ✅ Semantic Caching - Business logic-based cache keys
const generateCacheKey = (data: RequestData): string => {
  return [
    data.type, data.profile.id, data.role.title, data.company.name,
    data.tone || 'formal', data.requestType || 'coverLetter'
  ].join(':').replace(/[^a-zA-Z0-9:-]/g, '_');
};
```

---

## 🎨 UI/UX DEVELOPMENT GUIDELINES

### Component Architecture
**Migration Pattern**: Custom components → DaisyUI
- **Legacy**: Custom shadcn/ui components in `/components/ui/`
- **Current**: DaisyUI components in `/components/ui-daisy/`

### Component Reusability & Styling Approach
**🚨 CRITICAL PRINCIPLE**: **Build Reusable, Scalable, Standardized Components Always**

**Core Philosophy**: Every UI element should be a composable, predictable component with consistent APIs and behavior patterns. This is non-negotiable for maintainable, scalable applications.

**✅ MANDATORY Approach**: Component-First Architecture
```tsx
// ✅ Standardized component with variants (CVA pattern)
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { gradient: "...", glass: "...", outline: "..." },
    size: { sm: "...", md: "...", lg: "..." },
    animation: { none: "!transition-none", default: "transition-all" }
  }
})

// ✅ Clean, reusable usage
<Button variant="gradient" size="xl" animation="none" />
<Card variant="glass" />
<SectionBadge variant="outline" icon={<HelpCircle />} />
```

**❌ FORBIDDEN Approaches**: 
```tsx
// ❌ NEVER override styles in consuming components
<Button className="bg-gradient-to-r from-yellow-500..." />

// ❌ NEVER create one-off inline styles
<div className="bg-base-100/80 border border-base-300/20 rounded-xl" />

// ❌ NEVER duplicate styling logic
// Creating multiple similar components instead of variants
```

**Why This Approach is Mandatory**:
- **Single Source of Truth**: Change once, updates everywhere
- **Predictable APIs**: Developers know what to expect (`variant`, `size`, `className`)
- **Design Consistency**: No more one-off styling or visual inconsistencies
- **Developer Velocity**: Build faster with existing, tested components
- **Maintainability**: Fix bugs once, fixes everywhere
- **Scalability**: New features use existing components, extending with variants

**Standardized Component Patterns**:
1. **Variant-Based Architecture**: Use `class-variance-authority` (CVA) for all variants
2. **Consistent Prop APIs**: `variant`, `size`, `className`, `children` patterns
3. **Animation Controls**: `animated`, `hoverable`, `interactive` boolean props
4. **Icon Integration**: Standardized `icon`, `leftIcon`, `rightIcon` props
5. **Accessibility First**: Built-in ARIA labels, focus management, keyboard navigation

**Implementation Workflow**:
1. **Before Creating**: Check if existing component can be extended with variants
2. **Component Design**: Define all variants upfront using CVA
3. **API Design**: Follow established prop patterns (`variant`, `size`, etc.)
4. **Documentation**: Add to design system with usage examples
5. **Refactoring**: Replace any one-off implementations with new component

**Component Architecture (4-Layer System)**:
```
📁 /components/ui-daisy/           ← 🎯 LAYER 1: UI PRIMITIVES (40+ components)
├── button.tsx                     // Base Button with 15+ variants (gradient, glass, etc.)
├── card.tsx                       // Base Card with 8 variants (transparent, solid, etc.)
├── accordion.tsx                  // Base Accordion with variant system
├── input.tsx, textarea.tsx        // Form primitives with professional styling
├── badge.tsx, alert.tsx           // Display components with variants
├── dialog.tsx, popover.tsx        // Overlay components with animations
├── suggestion-card.tsx            // Specialized but reusable components
└── index.ts                       // Central exports for all UI primitives

📁 /components/                    ← 🏗️ LAYER 2: BUSINESS COMPONENTS
├── buttons.tsx                    // Business-specific button wrappers
├── analysis/                      // CV analysis feature components
│   ├── AnalysisResultDisplay.tsx  // Complex feature using ui-daisy primitives
│   └── display/                   // Analysis sub-components
├── cv/                           // CV management components  
├── roles/                        // Job roles components
├── landing/                      // Landing page components
└── [feature]/                    // Other domain-specific components

📁 /app/components/                ← 📄 LAYER 3: PAGE-SPECIFIC (minimal)
└── question-template-selector.tsx // App-specific component (rare)

📁 /app/[route]/                   ← 🌐 LAYER 4: PAGES (consume all layers)
└── page.tsx                       // Pages import from any layer as needed
```

**Import Patterns & Usage Examples**:

**🎯 LAYER 1 - UI Primitives (98% of imports)**:
```tsx
// ✅ PRIMARY PATTERN: Import ui-daisy components directly
import { Button, Card, Accordion, Badge } from '@/components/ui-daisy'

// Usage with professional variants
<Card variant="gradient" hoverable animated>
  <Button variant="glass" size="lg" leftIcon={<Play />}>
    Start Analysis
  </Button>
</Card>

<Accordion type="multiple" value={openSections}>
  <AccordionItem variant="glass" value="contact">
    <AccordionTrigger>Contact Information</AccordionTrigger>
    <AccordionContent>...</AccordionContent>
  </AccordionItem>
</Accordion>
```

**🏗️ LAYER 2 - Business Components (targeted usage)**:
```tsx
// ✅ BUSINESS WRAPPERS: When you need domain-specific behavior
import { StartAssessmentButton, WarningButton } from '@/components/buttons'
import { ContactInfoDisplay } from '@/components/analysis/display'

// Business components use ui-daisy internally
<StartAssessmentButton onClick={handleStart} loading={isLoading} />
<ContactInfoDisplay data={contactData} onChange={handleUpdate} />
```

**📄 LAYER 3 - Page-Specific (rare)**:
```tsx
// ✅ PAGE-SPECIFIC: Only when component is truly unique to one page
import { QuestionTemplateSelector } from '@/app/components'

// Used only in specific app routes
<QuestionTemplateSelector templates={templates} />
```

**🌐 LAYER 4 - Pages (composition)**:
```tsx
// ✅ PAGES: Compose all layers together
import { Card, Button } from '@/components/ui-daisy'
import { AnalysisResultDisplay } from '@/components/analysis'
import { StartAssessmentButton } from '@/components/buttons'

// Pages orchestrate the full user experience
export default function CVManagementPage() {
  return (
    <Card variant="transparent">
      <AnalysisResultDisplay />
      <StartAssessmentButton onClick={handleStart} />
    </Card>
  )
}
```

**📋 Component Decision Matrix**:

| **When to Create** | **Where to Put It** | **Example** |
|-------------------|---------------------|-------------|
| Reusable UI primitive | `/components/ui-daisy/` | Base Button, Card, Input |
| Business logic wrapper | `/components/buttons.tsx` | StartAssessmentButton |
| Feature-specific component | `/components/[feature]/` | AnalysisResultDisplay |
| Page-unique component | `/app/components/` | QuestionTemplateSelector |
| One-off page element | Inline in page | Simple divs, text |

**🚨 COMPONENT CREATION RULES**:

```tsx
// ✅ DO: Extend existing ui-daisy components with variants
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { newStyle: "custom-classes" }
  }
})

// ✅ DO: Create business wrappers for domain logic
export function CVUploadButton({ onUpload, acceptedTypes }) {
  return <Button variant="gradient" onClick={onUpload}>Upload CV</Button>
}

// ❌ DON'T: Create duplicate UI primitives
// Instead of new Button component, add variant to existing

// ❌ DON'T: Mix business logic in ui-daisy
// Keep ui-daisy components pure and reusable
```

**🔍 Before Creating New Component Checklist**:
1. **Can I use existing ui-daisy component with different variant?** 
2. **Can I compose existing components together?**
3. **Does this contain business logic?** → `/components/[feature]/`
4. **Is this truly reusable?** → `/components/ui-daisy/`
5. **Is this page-specific?** → `/app/components/` (rare)

### Design System
**Glass Morphism Theme**:
```tsx
// ✅ Standard glass morphism pattern
<Card className="bg-base-100/60 backdrop-blur-sm border border-base-300/50">
```

**Animation Standards**:
- **Loading**: Sophisticated orbital loaders over simple spinners
- **Hover Effects**: Include movement, shadow, and background changes
- **Transitions**: Use `transition-all duration-100` for smooth multi-property changes

**Standardized Text Sizing System**:
```tsx
// ✅ NEVER use text-xs - use standardized minimum sizes
.text-xs-min     // 14px - absolute minimum for accessibility
.text-sm-min     // 15px - comfortable minimum for body text  
.text-base-comfortable // 16px - ideal for body text

// ✅ Usage examples
<div className="text-xs-min">Minimum accessible text</div>
<p className="text-sm-min">Small but comfortable text</p>
<p className="text-base-comfortable">Ideal reading text</p>
```

**Essential Patterns**:
```tsx
// ✅ Fixed table layouts prevent width flickering
<Table className="table-fixed w-full">
// ✅ Cross-component communication
window.dispatchEvent(new CustomEvent('expandAllSections'));
// ✅ Comprehensive test coverage
<Button data-testid={`action-button-${action}-${id}`}>
// ✅ Standardized minimum text sizes
<span className="text-sm-min">Never too small to read</span>
```

---

## 🔧 API & BACKEND PATTERNS

### API Route Structure
**✅ RESTful Patterns (Single Source of Truth)**:
```
/api/[resource]/[id]/[action]
- /api/cv/ - CV file upload and metadata management
- /api/developer/me/profile - Complete profile CRUD (single source of truth)
- /api/developer/me/experience - Experience CRUD operations
- /api/developer/me/education - Education CRUD operations  
- /api/developer/me/skills - Skills CRUD operations
- /api/developer/me/achievements - Achievements CRUD operations
- /api/gamification/ - XP, points, achievements, challenges
- /api/subscription/ - Stripe integration and webhooks
- /api/generate-* - AI content generation endpoints
```

### Security & Performance
**Gamification Protection**: Atomic transactions, server-side validation, rate limiting, audit trails
**Stripe Integration**: Webhook signature verification, replay attack protection, idempotency keys
**Advanced Caching**: Configuration caching (24h TTL), semantic cache keys, Redis connection resilience
**Graceful Degradation**: Cache failures don't break functionality

---

## 🎨 PROFESSIONAL DESIGN SYSTEM

### Core Design Philosophy
**TechRec** implements a **sophisticated, professional design system** built on **DaisyUI + Tailwind CSS 4** with **glass morphism aesthetics**, **smooth animations**, and **accessibility-first principles**.

### Design Tokens & Color System
```typescript
// Enhanced Professional Color Palette
colors: {
  // Brand Colors - Professional Blue Gradient
  brand: {
    50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 
    600: '#0284c7', 900: '#0c4a6e'
  },
  // Semantic Status Colors
  success: { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a' },
  warning: { 50: '#fffbeb', 500: '#f59e0b', 600: '#d97706' },
  error: { 50: '#fef2f2', 500: '#ef4444', 600: '#dc2626' },
  // Professional Surface Colors
  surface: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
    800: '#1e293b', 900: '#0f172a'
  }
}

// Professional Shadow System
boxShadow: {
  'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
  'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
  'large': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
  'brand': '0 4px 16px 0 rgba(14, 165, 233, 0.15)',
  'colored': '0 4px 16px 0 rgba(139, 92, 246, 0.15)',
  'glow': '0 0 24px rgba(139, 92, 246, 0.15)'
}
```

### Component Architecture
**Modern DaisyUI-First Approach**: All new components use enhanced DaisyUI patterns with professional variants.

#### Enhanced Button System
```tsx
import { Button } from "@/components/ui-daisy/button"

// Professional Variants Available
<Button variant="gradient-brand" size="lg" elevation="lg">
  Primary Action
</Button>
<Button variant="glass" rounded="full" interactive>
  Glass Morphism
</Button>
<Button variant="linkedin" leftIcon={<LinkedInIcon />}>
  LinkedIn Integration
</Button>
```

**Available Button Variants**:
- `default`, `primary`, `secondary`, `accent`, `ghost`, `outline`
- `gradient-brand`, `gradient`, `gradient-blue`, `gradient-emerald`
- `glass`, `glass-outline`, `glass-primary`
- `linkedin` (brand-specific styling)

#### Enhanced Form Components
```tsx
import { Input, Textarea, Select, RadioGroup } from "@/components/ui-daisy"

// Professional Form Fields with Built-in Validation
<Input
  variant="glass"
  label="Email Address"
  error="Invalid email format"
  helperText="We'll never share your email"
/>

<Textarea
  variant="default"
  resize="vertical"
  label="Cover Letter"
  rows={8}
/>

<Select
  variant="bordered"
  label="Experience Level"
  error={formErrors.experience}
>
  <option value="junior">Junior (0-2 years)</option>
  <option value="mid">Mid-level (3-5 years)</option>
  <option value="senior">Senior (5+ years)</option>
</Select>
```

#### Enhanced Card System
```tsx
import { Card, CardHeader, CardContent } from "@/components/ui-daisy/card"

// Multiple Professional Card Variants
<Card variant="glass" hoverable animated interactive>
  <CardHeader>
    <CardTitle>Profile Analytics</CardTitle>
  </CardHeader>
  <CardContent>
    Analytics content with glass morphism
  </CardContent>
</Card>

<Card variant="floating" clickable>
  Floating card with hover animations
</Card>
```

**Available Card Variants**:
- `default`, `transparent`, `glass`, `solid`, `outlined`
- `elevated`, `floating`, `gradient`

#### Professional Badge System
```tsx
import { Badge, StatusBadge, CountBadge } from "@/components/ui-daisy/badge"

// Comprehensive Badge Variants
<Badge variant="gradient-brand" size="lg" interactive>
  Premium Feature
</Badge>

<StatusBadge status="active" pulse />
<CountBadge count={12} />
<Badge variant="glass-success" dot />
```

#### Enhanced Tab System
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui-daisy/tabs"

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList variant="glass" fullWidth>
    <TabsTrigger value="profile" variant="glass">Profile</TabsTrigger>
    <TabsTrigger value="skills" variant="glass">Skills</TabsTrigger>
  </TabsList>
  <TabsContent value="profile" animated>
    Profile content with smooth transitions
  </TabsContent>
</Tabs>
```

**Available Tab Variants**:
- `default`, `boxed`, `bordered`, `lifted`, `glass`, `minimal`, `pills`

### Animation System
**Framer Motion Integration** with **reduced motion support**:

```tsx
import { motion } from "framer-motion"
import { staggerContainer, staggerItem, cardHover } from "@/lib/animations"

// Professional Animation Patterns
<motion.div variants={staggerContainer} initial="initial" animate="animate">
  {items.map((item, index) => (
    <motion.div key={index} variants={staggerItem}>
      {item}
    </motion.div>
  ))}
</motion.div>

// Card Hover Animations
<motion.div variants={cardHover} whileHover="hover" whileTap="tap">
  Interactive Card
</motion.div>
```

**Available Animation Patterns**:
- Page transitions (`pageTransition`)
- Staggered lists (`staggerContainer`, `staggerItem`)
- Card interactions (`cardHover`, `buttonHover`)
- Modal animations (`modalContent`, `modalBackdrop`)
- Loading states (`pulseAnimation`, `spinnerAnimation`)

### Accessibility Standards
**WCAG AA Compliance** with comprehensive accessibility utilities:

```tsx
import { ARIA_LABELS, FOCUS_MANAGEMENT, SCREEN_READER } from "@/lib/accessibility"

// Built-in Accessibility Features
- Automatic focus management in modals
- Screen reader announcements
- Color contrast validation
- Keyboard navigation support
- Reduced motion preferences
```

### Glass Morphism Effects
**Professional Glass Styling** available across all components:

```css
/* Available CSS Classes */
.glass {
  background: hsl(var(--b1) / 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid hsl(var(--b3) / 0.2);
}

.glass-dark {
  background: hsl(var(--b1) / 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid hsl(var(--b3) / 0.1);
}
```

### Professional Typography
**Enhanced Typography Scale** with perfect readability:

```css
/* Typography System */
fontSize: {
  'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
  'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
  'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
  'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
  '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
}
```

### Component Enhancement Guidelines
**When adding new components**:
1. **Use DaisyUI-first approach** - leverage `@/components/ui-daisy/`
2. **Include professional variants** - glass, gradient, interactive states
3. **Add Framer Motion** for micro-interactions
4. **Implement accessibility** - ARIA labels, keyboard navigation
5. **Follow naming conventions** - `variant`, `size`, `interactive`, `animated`

### Performance Optimizations
- **Hardware-accelerated animations** with `transform-gpu`
- **Reduced motion support** for accessibility
- **60fps animations** with proper easing curves
- **Semantic caching** for configuration and performance

---

## 📊 DEVELOPMENT WORKFLOWS

### CV Analysis Flow (Single Source of Truth)
1. User uploads CV → S3 storage
2. File parsed using LangChain or custom parsers
3. Multi-dimensional AI analysis (ATS, content quality, formatting, impact) 
4. **Background sync saves DIRECTLY to proper profile tables** (Developer, Experience, Education, Skills)
5. UI fetches from proper profile APIs (`/api/developer/me/*`)
6. Manual edits save via `/api/developer/me/profile` to proper tables
7. Results cached in Redis with semantic keys (24-hour TTL)
8. Gamification updates (XP awards, achievement checks)

### Development Commands
```bash
# Development
npm run dev                    # Development server (port 3000)
npm run build                  # Production build
npm run lint                   # ESLint
npm run test                   # Jest tests

# Database
npx prisma migrate dev         # Run migrations
npx prisma generate           # Generate client
npx prisma studio            # GUI

# Testing
npm run test:e2e              # Playwright E2E tests
npx playwright test --headed  # Run tests with visible browser
```

---

## 🧪 TESTING STRATEGY

### Testing Requirements
**🚨 CRITICAL AUTHENTICATION RULE**:
- **ALL CV and developer-related tests MUST authenticate FIRST**
- **Use `AuthHelper.ensureLoggedIn()` in test.beforeEach()** before any CV operations
- **Test users**: `junior@test.techrec.com`, `senior@test.techrec.com`, `newbie@test.techrec.com`

```typescript
import { AuthHelper } from '../utils/auth-helper';

test.beforeEach(async ({ page }) => {
  const auth = new AuthHelper(page);
  await auth.ensureLoggedIn('junior_developer');
  await page.goto('/developer/cv-management');
});
```

**Mandatory Coverage**:
- ✅ ALL buttons, links, and interactive elements with data-testid
- ✅ ALL form inputs, selects, and textareas
- ✅ ALL loading states and conditional UI elements

**Test ID Naming Convention**: `{page/section}-{component}-{element}-{identifier?}`

### Core Testing Principles
1. **Test-First Mindset**: Write tests before implementing features
2. **Comprehensive Coverage**: Unit, Integration, and End-to-End testing
3. **Real User Scenarios**: Playwright tests simulate actual user workflows
4. **Reliable Selectors**: Always use data-testid attributes

### Essential Testing Commands
```bash
# Run all Playwright tests
npm run test:e2e

# Run specific test file
npx playwright test cv-suggestions.spec.ts

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Debug specific test
npx playwright test --debug cv-suggestions.spec.ts
```

---

## 🔧 DEBUG WORKFLOW & SERVER MONITORING

### Server Management
**✅ MANDATORY Process Management**:
```bash
# 1. Clean environment
pkill -f "npm run dev"

# 2. Start server with logging
nohup npm run dev > server.log 2>&1 &

# 3. Validate startup
sleep 3 && head -10 server.log
```

### Essential Debug Commands
```bash
# Monitor logs during development
tail -f server.log

# Search for specific errors
grep -i "error\|failed\|exception" server.log

# Monitor API endpoints
grep -i "upload\|gemini\|analysis" server.log

# Authentication debugging
grep -i "session\|auth\|unauthorized" server.log
```

### Server Log Analysis Patterns
**Successful Patterns**:
```
✅ Ready in 1321ms                           # Server startup success
✅ GET /developer/cv-management 200         # Page load success  
✅ POST /api/cv/upload 201                  # File upload success
✅ [Analysis ID] Status updated to COMPLETED # Analysis success
```

**Error Patterns**:
```
❌ File details: { size: 0 }                # Empty file upload
❌ PDF Parsing: Error calling pdfParser     # PDF parsing failure
❌ Schema validation failed                 # Data validation issues
❌ Status updated to FAILED                 # Processing failure
```

---

## 🤖 AI COLLABORATION EXCELLENCE

### Context Intelligence Framework
**Pattern Recognition**:
- Follow Redis connection management pattern from `lib/redis.ts`
- Use structured error handling approach from cover letter API
- Apply semantic caching strategy from generateCacheKey function

### Strategic Development Principles
1. **Architectural Consistency**: Always extend existing patterns rather than create new ones
2. **Type System Maturity**: Runtime validation + compile-time safety = bulletproof code
3. **Testing Comprehensiveness**: UI, Integration, Unit, and Mock testing for complete coverage
4. **Performance Optimization**: Semantic caching, connection pooling, graceful degradation
5. **Error Handling Excellence**: Structured errors with business context and metadata

### Advanced Implementation Patterns
**Premium Feature Excellence**:
- **Atomic Transactions**: Use `PointsManager.spendPointsAtomic` for race condition protection
- **Multi-Layer Validation**: UI eligibility checks + backend subscription/points validation
- **Real-Time State Integration**: Redux user/gamification state for dynamic UI updates

**Design System Mastery**:
- **DaisyUI Component Priority**: Strict adherence over custom HTML elements
- **Component Composition**: Reusable single-purpose components over inline implementations

---

## ⚡ QUICK REFERENCE

### Essential File Locations
```
📁 Key Directories:
├── app/api/                   # API routes
├── components/                # UI components
│   ├── ui/                   # Legacy shadcn components
│   ├── ui-daisy/            # DaisyUI components
│   └── gamification/        # Gamification UI
├── lib/features/             # Redux slices
├── lib/gamification/         # Gamification logic
├── utils/                    # Utility services
├── prisma/                   # Database schema
└── types/                    # TypeScript definitions
```

### Environment Variables Required
```bash
# Database & Caching
MONGODB_URI=              # MongoDB connection
REDIS_URL=               # Redis connection
REDIS_USE_TLS=true       # Force TLS

# Authentication
NEXTAUTH_URL=            # App URL
NEXTAUTH_SECRET=         # JWT secret
GOOGLE_CLIENT_ID=        # OAuth provider

# AI Providers
OPENAI_API_KEY=         # GPT models
GOOGLE_AI_API_KEY=      # Gemini models

# Payments
STRIPE_SECRET_KEY=      # Stripe integration
STRIPE_WEBHOOK_SECRET=  # Webhook security

# Storage
AWS_S3_BUCKET_NAME=     # File storage
```

### Core Implementation Mandate
When implementing new features:
1. **Component-First Thinking**: Check existing components before creating anything new
2. **Variant-Based Extensions**: Add variants to existing components rather than creating new ones
3. **Standardized APIs**: Follow established patterns (`variant`, `size`, `className`, `icon`)
4. **No Style Overrides**: Never use className for styling - only extend component variants
5. **Reusability Focus**: Every component should be usable across multiple contexts
6. **Accessibility Built-In**: Components must include proper ARIA labels and keyboard navigation
7. **Documentation Updated**: Add new components/variants to design system documentation

### Component Development Checklist
Before shipping any UI component:
- [ ] Uses CVA for variant management
- [ ] Follows standardized prop API patterns
- [ ] Includes all necessary variants (don't create one-off implementations)
- [ ] Has proper TypeScript interfaces
- [ ] Includes accessibility features
- [ ] Added to component library exports
- [ ] Documented with usage examples
- [ ] Tested across different screen sizes
- [ ] No inline styles or className overrides in consuming components

---

## 📚 DOCUMENTATION STANDARDS

### Key Documentation Files
- `CLAUDE.md` - This file (project guidelines)
- `GAMIFICATION_STRATEGY.md` - Comprehensive gamification documentation
- `README.md` - Project setup and overview

### Update Requirements
- After any gamification-related changes (update `GAMIFICATION_STRATEGY.md`)
- After adding new API endpoints or significant features
- After architectural changes or new patterns

---

*This guide serves as the comprehensive reference for developing within the TechRec codebase. Follow these guidelines consistently to maintain code quality, architectural integrity, and development efficiency.*

**Last Update**: August 3, 2025 - **COMPREHENSIVE PROFESSIONAL DESIGN SYSTEM COMPLETE**: 
- ✅ **Professional UI/UX Enhancement**: Complete overhaul with modern design system
- ✅ **DaisyUI Component Library**: All core components enhanced with professional variants
- ✅ **Advanced Animation System**: Framer Motion integration with 60fps smooth animations
- ✅ **Accessibility Excellence**: WCAG AA compliance with comprehensive accessibility utilities
- ✅ **Glass Morphism & Gradients**: Professional visual effects across all components
- ✅ **Design Token System**: Consistent color palette, typography, and spacing scales
- ✅ **Component Architecture**: Button, Card, Input, Textarea, Select, Tabs, Badge, Dropdown, RadioGroup
- ✅ **Performance Optimized**: Hardware-accelerated animations with reduced motion support

**Previous Update**: January 31, 2025 - **MAJOR ARCHITECTURAL MODERNIZATION**: 
- ✅ **Single Source of Truth Migration**: Eliminated redundant CvAnalysis table
- ✅ **Data Flow Consistency**: CV upload → profile tables → UI display pipeline
- ✅ **Real Persistence**: Redux updates save via `/api/developer/me/profile`
- ✅ **API Architecture**: Complete CRUD operations for all profile sections