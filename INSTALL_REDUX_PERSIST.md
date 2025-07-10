# Install Redux Persist - Quick Fix

## Issue
Module not found error: `Can't resolve 'redux-persist/integration/react'`

## Solution

**Step 1: Install Dependencies**
```bash
npm install redux-persist@^6.0.0
npm install --save-dev @types/redux-persist@^4.3.1
```

**Step 2: Restart Development Server**
```bash
npm run dev
```

## What I Fixed

1. **Added redux-persist to package.json** - Main dependency
2. **Added @types/redux-persist** - TypeScript types
3. **Fixed import path** - Changed from `redux-persist/integration/react` to `redux-persist/lib/integration/react`
4. **Simplified configuration** - Removed custom serialize/deserialize to avoid initial issues

## Verification

After running the install commands, the following should work:

1. **Check imports resolve:**
   ```bash
   npx tsc --noEmit
   ```

2. **Start application:**
   ```bash
   npm run dev
   ```

3. **Test persistence:**
   - Navigate to `/developer/roles/search`
   - Select some roles
   - Refresh page
   - Check console for `[ROLE_PERSISTENCE]` logs (if `DEBUG_ROLE_PERSISTENCE=true`)

## Alternative Quick Fix

If you're still getting import errors, you can temporarily disable persistence by:

1. **Comment out PersistGate in client-layout.tsx:**
```tsx
// Temporary disable persistence
export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SessionProvider>
      <Provider store={store}>
        {/* <PersistGate loading={<div>Loading...</div>} persistor={persistor}> */}
          <SessionAwareLayout>{children}</SessionAwareLayout>
        {/* </PersistGate> */}
      </Provider>
    </SessionProvider>
  )
}
```

2. **Use non-persisted reducer temporarily:**
In `selectedRolesSlice.ts`, change the export:
```tsx
// Temporary: export non-persisted reducer
export default selectedRolesSlice.reducer;
// Comment out: export default persistedSelectedRolesReducer;
```

This will make the app work while you install the dependencies properly.

## Dependencies Added to package.json

```json
{
  "dependencies": {
    "redux-persist": "^6.0.0"
  },
  "devDependencies": {
    "@types/redux-persist": "^4.3.1"
  }
}
```

Run `npm install` to get these dependencies installed.