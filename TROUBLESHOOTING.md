# Troubleshooting Guide

This document contains solutions to common issues encountered in the TechRec application.

## Redux & State Management Issues

### 1. AnalysisSummaryDashboard Stuck at "Loading..."

**Symptoms:**
- The CV analysis page shows "Loading..." indefinitely
- Console shows successful API calls but UI doesn't update
- Issue persists after page refresh

**Root Causes:**

1. **Redux Persistence Missing Fields**
   - The `status` field wasn't included in the Redux persist whitelist
   - After refresh, status resets to 'idle' while data remains, causing mismatch

2. **ID Mismatch Between URL and Store**
   - URL contains CV ID: `681c8741a6c21e37e94a7983`
   - Store contains Analysis ID: `6849365c36b815afae2ee18d`
   - Strict ID comparison fails, preventing component render

3. **Infinite useEffect Loops**
   - `analysisData` in useEffect dependencies causes infinite fetch loops
   - `toast` function is unstable and triggers re-renders

**Solutions Applied:**

1. **Updated Redux Persist Config** (`/lib/store.ts`):
   ```javascript
   const analysisPersistConfig = {
     key: 'analysis',
     storage,
     whitelist: ['analysisData', 'originalData', 'currentAnalysisId', 'status', 'suggestions']
   };
   ```

2. **Added REHYDRATE Handler** (`/lib/features/analysisSlice.ts`):
   ```javascript
   .addCase(REHYDRATE, (state, action: any) => {
     if (action.payload && action.payload.analysis) {
       const rehydratedState = action.payload.analysis;
       if (rehydratedState.analysisData && rehydratedState.status === 'idle') {
         return {
           ...rehydratedState,
           status: 'succeeded'
         };
       }
     }
   })
   ```

3. **Fixed ID Comparison Logic** (`/app/developer/cv-management/page.tsx`):
   ```javascript
   // Instead of strict ID matching:
   // if (analysisIdFromStore === analysisIdFromUrl && analysisData)
   
   // Check for data existence:
   if (analysisData && analysisIdFromStore) {
     return <AnalysisResultDisplay originalMimeType={originalMimeType} />;
   }
   ```

4. **Removed Unstable Dependencies**:
   - Removed `analysisData` from useEffect dependencies
   - Removed `toast` from useEffect dependencies

**Debugging Steps:**
1. Check browser console for ID values in logs
2. Verify Redux DevTools shows correct state
3. Check Network tab for successful API responses
4. Look for "State changed" logs with ID mismatches

## Component Library Issues

### DaisyUI vs Radix UI Conflicts

**Problem:** Form controls showing errors or not working correctly

**Solution:**
- DaisyUI uses native HTML patterns: `onChange={(e) => setValue(e.target.value)}`
- Radix UI uses custom patterns: `onValueChange={setValue}`
- Always check which component library you're importing from

## Performance Issues

### Infinite API Calls

**Symptoms:**
- Network tab shows repeated calls to same endpoint
- Performance degrades over time
- Console shows rapid state updates

**Common Causes:**
1. Unstable useEffect dependencies
2. Functions not wrapped in useCallback
3. Objects/arrays recreated on each render

**Solutions:**
- Use React.memo for expensive components
- Wrap callbacks with useCallback
- Use useMemo for computed values
- Check useEffect dependency arrays

## Build & Deployment Issues

### TypeScript Errors

**Common Errors:**
- "Module has no exported member"
- "Property does not exist on type"

**Solutions:**
1. Run `npx prisma generate` after schema changes
2. Check for typos in import statements
3. Ensure types are properly exported/imported

## Quick Reference

### Console Commands for Debugging
```javascript
// Check Redux state
console.log('Store state:', store.getState());

// Check specific slice
console.log('Analysis state:', store.getState().analysis);

// Track ID values
console.log(`URL ID: ${analysisIdFromUrl}, Store ID: ${analysisIdFromStore}`);
```

### Key Files for Common Issues
- Redux Config: `/lib/store.ts`
- Analysis Logic: `/lib/features/analysisSlice.ts`
- CV Management: `/app/developer/cv-management/page.tsx`
- Component Display: `/components/analysis/AnalysisResultDisplay.tsx`

## Contributing

If you encounter and solve a new issue, please add it to this document following the existing format:
1. Clear description of symptoms
2. Root cause analysis
3. Solution with code examples
4. Debugging steps