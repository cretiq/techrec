# Phase 2 Cleanup Plan - CAREFUL EXECUTION REQUIRED

## Overview
This document outlines the careful execution plan for the remaining 5 cleanup tasks. Each task has been analyzed for risks and dependencies.

## Task 1: Textarea Migration (Priority: HIGH, Risk: MEDIUM)

### Current State
- 10 files using `@/components/ui/textarea`
- DaisyUI has `@/components/ui-daisy/textarea` ready

### Files to Update
1. `/app/developer/profile/page.tsx`
2. `/app/developer/writing-help/components/cover-letter-creator.tsx`
3. `/app/developer/writing-help/components/cv-optimizer.tsx`
4. `/app/developer/writing-help/components/outreach-message-generator.tsx`
5. `/app/developer/roles/[id]/page.tsx`
6. `/app/developer/roles/new/page.tsx`
7. `/app/developer/signup/page.tsx`
8. `/components/profile/ProfileInfoCard.tsx`
9. `/components/profile/AchievementsCard.tsx`
10. `/components/profile/ExperienceCard.tsx`

### Migration Steps
1. First, analyze API differences between shadcn and DaisyUI textarea
2. Create a test file to verify DaisyUI textarea behavior
3. Update imports one by one
4. Test each form after migration
5. Remove the old textarea component only after ALL migrations complete

### Risk Mitigation
- Make a commit after each 2-3 files migrated
- Test form submission after each change
- Keep old component until 100% migrated

---

## Task 2: TypeScript Errors (Priority: HIGH, Risk: HIGH)

### Analysis Needed First
1. Run `npx tsc --noEmit` and categorize errors:
   - Missing imports (might reveal deleted dependencies)
   - Type mismatches (might be actual bugs)
   - Old code that's not used

### Categories of Errors Found
- Missing modules: `@/lib/db`, `@/lib/models/*`
- LinkedIn client method errors
- Type mismatches in Prisma operations
- NextAuth session type issues

### Approach
1. Fix missing module imports first (these might break runtime)
2. Fix type errors in actively used files
3. Consider commenting out unused API routes with errors
4. Add proper types for any 'any' types

### Risk Mitigation
- Test each fix in development
- Don't change business logic, only fix types
- If unsure, add @ts-ignore with TODO comment

---

## Task 3: Remaining shadcn Components (Priority: MEDIUM, Risk: LOW)

### Components to Evaluate
Components with imports that need careful evaluation:

**High Usage - Keep for now:**
- toast system (use-toast, toast, toaster) - 11 imports total
- label - 11 imports
- dropdown-menu - 6 imports
- scroll-area - 6 imports
- progress - 7 imports
- skeleton - 5 imports

**Low Usage - Evaluate individually:**
- dialog (5 imports) - Check if DaisyUI modal can replace
- sheet (5 imports) - Might need to keep
- popover (4 imports) - Check DaisyUI alternatives
- form (4 imports) - React Hook Form component, likely keep
- separator (4 imports) - Simple, could replace with CSS

**Very Low Usage - Consider removing:**
- accordion (1 import)
- breadcrumb (1 import)
- Others with 1-2 imports

### Approach
1. Start with very low usage components
2. Check each import location
3. See if there's a DaisyUI equivalent or simple CSS replacement
4. Document why each component is kept or removed

---

## Task 4: API v1 Routes (Priority: LOW, Risk: MEDIUM)

### Files to Check
- `/app/api/v1/cv/analyze/route.ts`
- `/app/api/v1/cv/analyze/controller.ts`

### Verification Steps
1. Search for any calls to `/api/v1/` endpoints
2. Compare v1 functionality with current API routes
3. Check if v1 has unique features not in newer versions
4. Look for external documentation mentioning v1 endpoints

### Decision Criteria
- If no references found AND functionality duplicated = Safe to remove
- If any doubt = Keep with deprecation comment
- If actively used = Do not remove

---

## Task 5: Package.json Cleanup (Priority: LOW, Risk: VERY HIGH)

### Packages to Evaluate

**Definitely Remove:**
```json
"@storybook/addon-essentials"
"@storybook/addon-interactions"
"@storybook/addon-links"
"@storybook/addon-onboarding"
"@storybook/blocks"
"@storybook/nextjs"
"@storybook/react"
"@storybook/test"
"storybook"
```

**Need Verification:**
```json
"@radix-ui/*" - Check which are still used by remaining shadcn components
"@testing-library/*" - Check if any tests remain
"jest" related packages - If no tests remain
```

### Verification Process
1. For each package, run: `grep -r "from '@package-name" --include="*.ts" --include="*.tsx"`
2. Check if it's a peer dependency of other packages
3. Remove packages in small batches
4. Run `npm install` after each batch
5. Run `npm run build` to verify

### Risk Mitigation
- Create package.json backup first
- Remove in small batches (3-5 packages at a time)
- Test build after each batch
- Have `npm install` ready to restore if needed

---

## Execution Order

1. **Textarea Migration** - Most straightforward, medium risk
2. **TypeScript Errors** - Critical for code quality
3. **Package.json Cleanup** (Storybook only) - Safe subset
4. **Remaining shadcn evaluation** - Requires careful analysis
5. **API v1 routes** - Lowest priority
6. **Package.json Cleanup** (remaining) - Highest risk, do last

## Rollback Plan

At any point if things break:
1. `git stash` or `git reset --hard`
2. `npm install` to restore node_modules
3. Each task should be a separate commit for easy rollback

## Success Criteria

- [ ] All forms using textarea still work
- [ ] No TypeScript errors in build
- [ ] Build size reduced
- [ ] npm install runs clean
- [ ] npm run build succeeds
- [ ] Basic app functionality tested