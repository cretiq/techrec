# Bug Database & Resolution Patterns

> **AI-Optimized Bug Memory System** - Searchable database of resolved bugs with metadata for quick AI reference and pattern recognition.

## Search Tags Index

**State Management**: #redux-loading #status-stuck #hydration-mismatch #state-undefined #button-state #local-state  
**API Integration**: #api-undefined #type-mismatch #response-format #fetch-error #data-consistency #dual-source #api-endpoint #path-mismatch #session-scope #error-handling #data-validation #enum-mapping  
**Database**: #n-plus-one #query-error #prisma-relation #connection-timeout #api-processing  
**UI Components**: #render-loop #loading-forever #hydration-error #client-server-mismatch #ui-feedback #frontend-integration  
**TypeScript**: #type-error #any-usage #import-missing #generic-issue #react-imports #hooks  
**Backend**: #api-backend #frontend-integration  

---

## Resolved Bug Patterns

### Bug: Redux Loading State Stuck Forever [#redux-loading #status-stuck #state-management]
**Quick Fix**: Add `state.status = 'succeeded'` in fulfilled case  
**Component**: Frontend-Redux  
**Recurrence Risk**: High (AI frequently forgets status updates)  
**Resolution Time**: 30-60 minutes  

**Root Cause**: Missing status update in Redux slice extraReducers  
**Prevention**: Always update status in all three async cases (pending/fulfilled/rejected)  

**Code Pattern**:
```typescript
// ✅ ALWAYS include status updates
.addCase(fetchData.fulfilled, (state, action) => {
  state.data = action.payload;
  state.status = 'succeeded';  // ← Critical: AI often forgets this
  state.error = null;
})
```

**AI Search Terms**: loading infinite, redux stuck, status idle, component frozen  
**Prevention Checklist**: Redux status updates, async case handling, state management  

---

### Bug: Component Renders Undefined Error [#api-undefined #type-mismatch #null-check]
**Quick Fix**: Add null/undefined checks before mapping or accessing properties  
**Component**: Frontend-Components  
**Recurrence Risk**: High (AI assumes data exists)  
**Resolution Time**: 15-30 minutes  

**Root Cause**: Missing null checks when API returns different structure or empty data  
**Prevention**: Always validate data exists before using it  

**Code Pattern**:
```typescript
// ✅ ALWAYS check data exists
const RoleList = () => {
  const { roles, status } = useSelector(state => state.roles);
  
  if (status === 'loading') return <LoadingSpinner />;
  if (!roles || roles.length === 0) return <EmptyState />;
  
  return (
    <div>
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} />
      ))}
    </div>
  );
};
```

**AI Search Terms**: cannot read property, undefined map, null reference, data undefined  
**Prevention Checklist**: Null checks, data validation, loading states  

---

### Bug: Hydration Mismatch After Page Refresh [#hydration-mismatch #redux-persist #client-server]
**Quick Fix**: Handle REHYDRATE action in Redux slice  
**Component**: Frontend-Redux-Persist  
**Recurrence Risk**: Medium (AI understands concept but forgets implementation)  
**Resolution Time**: 45-90 minutes  

**Root Cause**: Redux persist rehydrates with incomplete state, causing server/client mismatch  
**Prevention**: Always handle REHYDRATE action when using Redux persist  

**Code Pattern**:
```typescript
// ✅ ALWAYS handle REHYDRATE
import { REHYDRATE } from 'redux-persist';

.addCase(REHYDRATE, (state, action: any) => {
  if (action.payload?.analysis && state.data && state.status === 'idle') {
    state.status = 'succeeded';
  }
})
```

**AI Search Terms**: hydration error, redux persist, client server mismatch, rehydrate  
**Prevention Checklist**: Redux persist setup, REHYDRATE handling, state consistency  

---

### Bug: N+1 Database Query Performance [#n-plus-one #prisma-relation #database-performance]
**Quick Fix**: Use `include` in single query instead of multiple queries  
**Component**: Backend-Database  
**Recurrence Risk**: Medium (AI understands but defaults to simple approach)  
**Resolution Time**: 20-40 minutes  

**Root Cause**: Multiple database queries in loop instead of single query with relations  
**Prevention**: Always use includes/relations for related data  

**Code Pattern**:
```typescript
// ❌ Multiple queries (N+1 problem)
const rolesWithSkills = await Promise.all(
  roles.map(role => prisma.role.findUnique({
    where: { id: role.id },
    include: { skills: true }
  }))
);

// ✅ Single query with includes
const rolesWithSkills = await prisma.role.findMany({
  include: { skills: true }
});
```

**AI Search Terms**: slow queries, multiple database calls, prisma performance, relation loading  
**Prevention Checklist**: Database query optimization, relation handling, performance patterns  

---

### Bug: API Route Type Mismatch [#api-type-mismatch #response-format #validation]
**Quick Fix**: Add proper type validation and transformation  
**Component**: Backend-API  
**Recurrence Risk**: Medium (AI creates types but forgets validation)  
**Resolution Time**: 30-45 minutes  

**Root Cause**: Frontend expects different data structure than backend returns  
**Prevention**: Always validate and transform API responses  

**Code Pattern**:
```typescript
// ✅ ALWAYS validate API input/output
const schema = z.object({
  userId: z.string().min(1),
  roleId: z.string().min(1)
});

const result = schema.safeParse(req.body);
if (!result.success) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
}

// Transform response to match frontend expectations
const transformedData = {
  roles: apiResponse.data,  // Backend sends { data: Role[] }
  total: apiResponse.total  // Frontend expects { roles: Role[], total: number }
};
```

**AI Search Terms**: type error, api mismatch, validation error, response structure  
**Prevention Checklist**: API validation, type consistency, response transformation  

---

### Bug: Session Scope Error in API Error Handler [#session-scope #error-handling #api-backend]
**Quick Fix**: Get session again in error handler scope instead of relying on outer scope  
**Component**: Backend-API  
**Recurrence Risk**: Medium (AI often assumes variable scope in error handlers)  
**Resolution Time**: 15-30 minutes  

**Root Cause**: Error handler trying to access session variable that's out of scope, causing ReferenceError when errors occur  
**Prevention**: Always retrieve session within error handler scope, don't rely on outer scope variables  

**Code Pattern**:
```typescript
// ❌ Session out of scope in error handler
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // ... main logic
  } catch (error) {
    console.error('Error:', { userId: session?.user?.id }); // ReferenceError!
  }
}

// ✅ Get session again in error handler
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // ... main logic
  } catch (error) {
    const errorSession = await getServerSession(authOptions);
    console.error('Error:', { userId: errorSession?.user?.id }); // Works!
  }
}
```

**AI Search Terms**: session undefined, error handler scope, getServerSession error, variable scope error  
**Prevention Checklist**: Session retrieval in error handlers, variable scope validation, error context preservation  

---

### Bug: API Endpoint Path Mismatch [#api-endpoint #path-mismatch #frontend-integration]
**Quick Fix**: Correct API endpoint path from plural to singular form  
**Component**: Frontend-API  
**Recurrence Risk**: High (AI often inconsistent with singular/plural API paths)  
**Resolution Time**: 5-15 minutes  

**Root Cause**: Frontend calling plural endpoint `/api/developers/me/saved-roles` but backend implemented singular `/api/developer/me/saved-roles`  
**Prevention**: Establish consistent API naming convention and validate endpoints during development  

**Code Pattern**:
```typescript
// ❌ Plural endpoint (doesn't exist)
const response = await fetch('/api/developers/me/saved-roles');

// ✅ Singular endpoint (correct)
const response = await fetch('/api/developer/me/saved-roles');

// ✅ Consistent API naming pattern
/api/developer/profile          // Singular resource
/api/developer/saved-roles      // Plural collection under singular resource
/api/developer/application-activity  // Plural collection under singular resource
```

**AI Search Terms**: api endpoint 405, method not allowed, endpoint not found, path mismatch  
**Prevention Checklist**: API naming consistency, endpoint validation, route structure documentation  

---

### Bug: Button State Management After Successful API Calls [#button-state #local-state #ui-feedback]
**Quick Fix**: Use local state management instead of relying on Redux state synchronization  
**Component**: Frontend-UI  
**Recurrence Risk**: High (AI often assumes Redux state updates work immediately)  
**Resolution Time**: 45-60 minutes  

**Root Cause**: Button components relying on Redux state updates that don't occur immediately after API calls, causing UI to revert to original state  
**Prevention**: Use local state for immediate UI feedback with callback-based state refresh  

**Code Pattern**:
```typescript
// ❌ Relying on Redux state for immediate feedback
const { isApplied, isMarkingAsApplied } = useSavedRoleStatus(role.id);

const handleMarkAsApplied = async () => {
  await dispatch(markRoleAsApplied(role.id));
  // Button reverts because Redux state might not update immediately
};

// ✅ Local state for immediate feedback
const [localAppliedState, setLocalAppliedState] = useState(false);
const { isApplied: reduxIsApplied } = useSavedRoleStatus(role.id);
const isApplied = localAppliedState || reduxIsApplied;

const handleMarkAsApplied = async () => {
  setIsLoading(true);
  const response = await fetch('/api/mark-applied', { ... });
  if (response.ok) {
    setLocalAppliedState(true); // Immediate UI feedback
    onSuccess?.(); // Trigger parent refresh
  }
  setIsLoading(false);
};
```

**AI Search Terms**: button state revert, loading state stuck, ui feedback delay, redux state delay  
**Prevention Checklist**: Local state for immediate feedback, callback-based refresh, loading state management  

---

### Bug: Missing React Hook Import [#react-imports #missing-import #hooks]
**Quick Fix**: Add missing React hooks to import statement  
**Component**: Frontend-React  
**Recurrence Risk**: Medium (AI sometimes forgets to update imports when adding hooks)  
**Resolution Time**: 5-10 minutes  

**Root Cause**: Using React hooks without importing them in the component file  
**Prevention**: Always check imports when adding new hooks to components  

**Code Pattern**:
```typescript
// ❌ Missing useCallback import
import React, { useEffect, useState } from 'react';

const MyComponent = () => {
  const handleClick = useCallback(() => {}, []); // useCallback is not defined!
};

// ✅ Complete hook imports
import React, { useEffect, useState, useCallback } from 'react';

const MyComponent = () => {
  const handleClick = useCallback(() => {}, []); // Works!
};
```

**AI Search Terms**: useCallback not defined, react hook undefined, missing import, hook reference error  
**Prevention Checklist**: Import validation, hook usage verification, TypeScript compilation checks  

---

### Bug: Data Validation Errors in API Processing [#data-validation #enum-mapping #api-processing]
**Quick Fix**: Add proper enum mapping and data validation for external API data  
**Component**: Backend-API  
**Recurrence Risk**: Medium (AI often assumes external data matches internal schemas)  
**Resolution Time**: 30-45 minutes  

**Root Cause**: External API data doesn't match internal enum values and validation schemas  
**Prevention**: Always validate and transform external data before database operations  

**Code Pattern**:
```typescript
// ❌ Direct use of external data without validation
const savedRole = await prisma.savedRole.create({
  data: {
    companySize: externalData.company_size // May not match enum values
  }
});

// ✅ Proper enum mapping and validation
function mapCompanySize(sizeString?: string): 'LESS_THAN_10' | 'FROM_10_TO_50' | 'FROM_50_TO_250' | 'MORE_THAN_250' | undefined {
  if (!sizeString) return undefined;
  
  const cleanSize = sizeString.toLowerCase().trim();
  
  if (cleanSize.includes('1-10') || cleanSize.includes('less than 10')) {
    return 'LESS_THAN_10';
  }
  // ... other mappings
  
  return undefined;
}

const savedRole = await prisma.savedRole.create({
  data: {
    companySize: mapCompanySize(externalData.company_size)
  }
});
```

**AI Search Terms**: enum validation error, data transformation error, external data mapping, validation schema mismatch  
**Prevention Checklist**: External data validation, enum mapping functions, schema compliance checks  

---

### Bug: Dual Data Source State Inconsistency [#data-consistency #dual-source #api-integration]
**Quick Fix**: Standardize on single data source with consistent ID transformation  
**Component**: Integration-Frontend-Backend  
**Recurrence Risk**: High (AI often creates multiple data sources for convenience)  
**Resolution Time**: 90-120 minutes  

**Root Cause**: Multiple API endpoints returning same data with different ID formats causing Redux state synchronization failures between components  
**Prevention**: Always use single source of truth for shared data with consistent response format  

**Code Pattern**:
```typescript
// ❌ Dual data sources with inconsistent formats
// API 1: /api/developer/saved-roles (internal IDs)
{ roleId: "internal-uuid-123", appliedFor: true }

// API 2: /api/developer/me/saved-roles (external IDs) 
{ roleId: "external-id-456", appliedFor: true }

// ✅ Standardized data source with consistent ID transformation
// Both APIs return external IDs:
const transformedSavedRoles = savedRoles.map(savedRole => {
  const externalIdMatch = savedRole.notes?.match(/External ID: (.+)/);
  const externalRoleId = externalIdMatch ? externalIdMatch[1] : savedRole.role?.id;
  
  return {
    ...savedRole,
    roleId: externalRoleId, // Use external ID consistently
    role: savedRole.role ? {
      ...savedRole.role,
      id: externalRoleId // Transform nested IDs too
    } : null
  };
});

// ✅ Redux selectors work with standardized IDs
export const selectSavedRoleByRoleId = (roleId: string) => (state: RootState) =>
  state.savedRoles.savedRoles.find(role => role.roleId === roleId);

// ✅ Components use unified Redux state
const { isApplied, isSaved } = useSavedRoleStatus(role.id); // Works consistently
```

**AI Search Terms**: data inconsistency, dual source, state mismatch, role ID transformation, Redux state sync  
**Prevention Checklist**: Single data source, consistent ID format, unified state management, API response standardization  

---

## Prevention Patterns by Component

### Redux State Management
- [ ] All async cases update status (pending/fulfilled/rejected)
- [ ] REHYDRATE case handles status properly
- [ ] Persist config includes all necessary fields
- [ ] Component checks status before rendering data
- [ ] Error boundaries catch state errors

### API Integration
- [ ] Request/response types defined
- [ ] Input validation with Zod schemas
- [ ] Error handling for all endpoints
- [ ] Response transformation when needed
- [ ] Loading states managed properly
- [ ] Consistent ID format across all endpoints
- [ ] Single source of truth for shared data
- [ ] Unified state management approach
- [ ] Session retrieval in error handlers
- [ ] API endpoint naming consistency validation
- [ ] External data validation and enum mapping
- [ ] Proper variable scope in error handlers

### Database Operations
- [ ] Use includes for related data
- [ ] Avoid N+1 queries
- [ ] Proper error handling
- [ ] Transaction usage when needed
- [ ] Connection cleanup

### UI Components
- [ ] Null/undefined checks before rendering
- [ ] Loading states handled
- [ ] Error boundaries implemented
- [ ] Accessibility attributes included
- [ ] Proper TypeScript prop types
- [ ] Local state for immediate UI feedback
- [ ] Complete React hook imports
- [ ] Callback-based state refresh patterns
- [ ] Button state management with loading indicators

## AI Development Guidelines

### BEFORE implementing any feature:
1. **Search this database** for similar patterns using tags
2. **Check prevention checklists** for component type
3. **Follow established patterns** from resolved bugs
4. **Copy working code patterns** instead of recreating

### WHEN encountering bugs:
1. **Search tags first** using symptoms/error messages
2. **If found**: Follow exact resolution pattern
3. **If not found**: Document new bug following template below
4. **Always update prevention checklist** with new learnings

### New Bug Documentation Template:
```markdown
### Bug: [Brief Description] [#tag1 #tag2 #category]
**Quick Fix**: [One-line solution]
**Component**: [Frontend/Backend/Database]
**Recurrence Risk**: [High/Medium/Low]
**Resolution Time**: [Actual time spent]

**Root Cause**: [Why it happened]
**Prevention**: [How to avoid it]

**Code Pattern**:
```typescript
// ✅ Working solution
// ❌ What doesn't work
```

**AI Search Terms**: [Keywords AI should search for]
**Prevention Checklist**: [What to check in future]
```

## Contributing to Bug Database

**When resolving a new bug:**
1. Add entry using template above
2. Include searchable tags
3. Add prevention checklist item
4. Update search tags index
5. Test that resolution pattern works

**Keep entries focused on:**
- Quick identification (tags, search terms)
- Fast resolution (code patterns, quick fixes)
- Prevention (checklists, guidelines)
- AI-friendly language (clear, specific, actionable)

---

## 📊 Bug Resolution Session Summary

### **Session Date**: July 14, 2025
### **Feature Context**: Feature Request #17 - Mark as Applied Role Tracking System

#### **Bugs Discovered and Resolved**:

1. **🔥 Critical: Dual Data Source State Inconsistency** - 90-120 minutes
   - **Impact**: High - Multiple pages showing different data for same roles
   - **Root Cause**: Inconsistent ID transformation between API endpoints
   - **Resolution**: Standardized external ID transformation across all endpoints

2. **Session Scope Error in API Error Handler** - 15-30 minutes
   - **Impact**: Medium - Error handler crashes when errors occur
   - **Root Cause**: Variable scope issue in error handling
   - **Resolution**: Retrieve session within error handler scope

3. **API Endpoint Path Mismatch** - 5-15 minutes
   - **Impact**: Medium - 405 Method Not Allowed errors
   - **Root Cause**: Inconsistent singular/plural endpoint naming
   - **Resolution**: Standardized API naming conventions

4. **Button State Management Issues** - 45-60 minutes
   - **Impact**: High - Poor user experience with button state
   - **Root Cause**: Relying on Redux state for immediate feedback
   - **Resolution**: Local state management with callback refresh

5. **Missing React Hook Import** - 5-10 minutes
   - **Impact**: Low - Component compilation failure
   - **Root Cause**: Incomplete import statements
   - **Resolution**: Added missing hook imports

6. **Data Validation Errors** - 30-45 minutes
   - **Impact**: Medium - API processing failures
   - **Root Cause**: External data not matching internal schemas
   - **Resolution**: Added enum mapping and validation

#### **Total Resolution Time**: ~195-300 minutes (3.25-5 hours)

#### **Key Patterns Identified**:
- **Data Consistency**: Multiple endpoints create synchronization challenges
- **Error Handling**: Scope issues in error handlers are common
- **State Management**: Local state often needed for immediate UI feedback
- **API Integration**: Naming consistency critical for maintenance
- **Data Validation**: External data rarely matches internal schemas

#### **Prevention Impact**:
- **New Tags Added**: 12 new searchable tags for future bug discovery
- **Checklist Items**: 7 new prevention checklist items added
- **Code Patterns**: 6 new working code patterns documented
- **Search Terms**: 24 new AI search terms for pattern recognition

#### **Success Metrics**:
- **Feature Delivered**: Complete role tracking system implemented
- **Bugs Resolved**: 6 distinct bugs fixed during implementation
- **Documentation**: Comprehensive bug patterns added to database
- **Prevention**: Enhanced checklists prevent future occurrences

This session demonstrates the importance of systematic bug documentation and resolution patterns for complex feature implementations.

---

*This database should be the first place AI looks when encountering any bug or implementing new features.*