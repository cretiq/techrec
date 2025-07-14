# Bug Database & Resolution Patterns

> **AI-Optimized Bug Memory System** - Searchable database of resolved bugs with metadata for quick AI reference and pattern recognition.

## Search Tags Index

**State Management**: #redux-loading #status-stuck #hydration-mismatch #state-undefined  
**API Integration**: #api-undefined #type-mismatch #response-format #fetch-error #data-consistency #dual-source  
**Database**: #n-plus-one #query-error #prisma-relation #connection-timeout  
**UI Components**: #render-loop #loading-forever #hydration-error #client-server-mismatch  
**TypeScript**: #type-error #any-usage #import-missing #generic-issue  

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

*This database should be the first place AI looks when encountering any bug or implementing new features.*