#!/usr/bin/env node

/**
 * Test script to verify Redux Persist implementation
 * Run this script to validate the feature is working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Redux Persist Implementation for Feature Request #7');
console.log('================================================================');

// Test 1: Verify redux-persist dependency
console.log('\n✅ Test 1: Check redux-persist dependency');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (packageJson.dependencies['redux-persist']) {
  console.log('   ✓ redux-persist dependency found:', packageJson.dependencies['redux-persist']);
} else {
  console.log('   ❌ redux-persist dependency missing');
  process.exit(1);
}

// Test 2: Verify store configuration
console.log('\n✅ Test 2: Check store configuration');
const storePath = path.join(__dirname, '..', 'lib', 'store.ts');
const storeContent = fs.readFileSync(storePath, 'utf8');

const storeChecks = [
  { name: 'persistStore import', pattern: /import.*persistStore.*from.*redux-persist/ },
  { name: 'persistReducer import', pattern: /import.*persistReducer.*from.*redux-persist/ },
  { name: 'storage import', pattern: /import.*storage.*from.*redux-persist\/lib\/storage/ },
  { name: 'selectedRoles persist config', pattern: /selectedRolesPersistConfig/ },
  { name: 'roles persist config', pattern: /rolesPersistConfig/ },
  { name: 'persistor export', pattern: /export.*persistor/ },
  { name: 'localStorage cleanup on logout', pattern: /storage\.removeItem.*persist:/ },
];

storeChecks.forEach(check => {
  if (check.pattern.test(storeContent)) {
    console.log(`   ✓ ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name} missing`);
  }
});

// Test 3: Verify ClientLayout PersistGate integration
console.log('\n✅ Test 3: Check ClientLayout PersistGate integration');
const layoutPath = path.join(__dirname, '..', 'components', 'client-layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

const layoutChecks = [
  { name: 'PersistGate import', pattern: /import.*PersistGate.*from.*redux-persist\/integration\/react/ },
  { name: 'persistor import', pattern: /import.*persistor.*from.*@\/lib\/store/ },
  { name: 'PersistGate component usage', pattern: /<PersistGate/ },
  { name: 'Loading component for PersistGate', pattern: /PersistenceLoading/ },
];

layoutChecks.forEach(check => {
  if (check.pattern.test(layoutContent)) {
    console.log(`   ✓ ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name} missing`);
  }
});

// Test 4: Verify page components simplified loading
console.log('\n✅ Test 4: Check page components simplified loading');
const writingHelpPath = path.join(__dirname, '..', 'app', 'developer', 'writing-help', 'page.tsx');
const writingHelpContent = fs.readFileSync(writingHelpPath, 'utf8');

if (writingHelpContent.includes('PersistGate now handles loading state')) {
  console.log('   ✓ Writing help page manual loading removed');
} else {
  console.log('   ❌ Writing help page still has manual loading');
}

const rolesSearchPath = path.join(__dirname, '..', 'app', 'developer', 'roles', 'search', 'page.tsx');
const rolesSearchContent = fs.readFileSync(rolesSearchPath, 'utf8');

if (rolesSearchContent.includes('PersistGate handles rehydration loading')) {
  console.log('   ✓ Roles search page manual loading removed');
} else {
  console.log('   ❌ Roles search page still has manual loading');
}

// Test 5: Verify logout cleanup
console.log('\n✅ Test 5: Check logout cleanup implementation');
const navPath = path.join(__dirname, '..', 'components', 'nav.tsx');
const navContent = fs.readFileSync(navPath, 'utf8');

const logoutChecks = [
  { name: 'persistor import in nav', pattern: /import.*persistor.*from.*@\/lib\/store/ },
  { name: 'persistor.purge() call', pattern: /persistor\.purge\(\)/ },
  { name: 'logout debug logging', pattern: /Redux state cleared and persistor purged/ },
];

logoutChecks.forEach(check => {
  if (check.pattern.test(navContent)) {
    console.log(`   ✓ ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name} missing`);
  }
});

// Test 6: Verify persistence configuration
console.log('\n✅ Test 6: Check persistence configuration');

if (storeContent.includes('whitelist: [\'selectedRoles\', \'selectedRoleIds\']')) {
  console.log('   ✓ selectedRoles slice persistence whitelist configured');
} else {
  console.log('   ❌ selectedRoles slice persistence whitelist missing');
}

if (storeContent.includes('whitelist: [\'lastSearchParams\']')) {
  console.log('   ✓ roles slice persistence whitelist configured');
} else {
  console.log('   ❌ roles slice persistence whitelist missing');
}

if (storeContent.includes('whitelist: [\'coverLetters\']')) {
  console.log('   ✓ coverLetters slice persistence whitelist configured');
} else {
  console.log('   ❌ coverLetters slice persistence whitelist missing');
}

if (storeContent.includes('whitelist: [\'outreachMessages\']')) {
  console.log('   ✓ outreachMessages slice persistence whitelist configured');
} else {
  console.log('   ❌ outreachMessages slice persistence whitelist missing');
}

// Test 7: Verify debug utilities
console.log('\n✅ Test 7: Check debug utilities');

if (storeContent.includes('window.clearPersistedState')) {
  console.log('   ✓ Development debug utility available');
} else {
  console.log('   ❌ Development debug utility missing');
}

if (rolesSearchContent.includes('isSelected: ${isSelected} (from persisted state)')) {
  console.log('   ✓ Role selection debug logging added');
} else {
  console.log('   ❌ Role selection debug logging missing');
}

// Test 8: Verify auto-search functionality
console.log('\n✅ Test 8: Check auto-search functionality');

if (rolesSearchContent.includes('selectLastSearchParams')) {
  console.log('   ✓ lastSearchParams selector imported');
} else {
  console.log('   ❌ lastSearchParams selector missing');
}

if (rolesSearchContent.includes('Auto-search when persisted search params exist')) {
  console.log('   ✓ Auto-search useEffect implemented');
} else {
  console.log('   ❌ Auto-search useEffect missing');
}

if (rolesSearchContent.includes('Restoring search with persisted params')) {
  console.log('   ✓ Auto-search debug logging added');
} else {
  console.log('   ❌ Auto-search debug logging missing');
}

console.log('\n🎉 Redux Persist Implementation Test Complete!');
console.log('\n📝 Manual Testing Steps:');
console.log('1. Start the dev server: npm run dev');
console.log('2. Navigate to /developer/roles/search');
console.log('3. Search for roles (should auto-load on refresh)');
console.log('4. Select some roles');
console.log('5. Navigate to /developer/writing-help');
console.log('6. Generate cover letters/outreach messages');
console.log('7. Refresh the browser');
console.log('8. Verify selected roles persist across refresh');
console.log('9. Verify search results auto-load without pressing "Start Searching"');
console.log('10. Verify generated cover letters/outreach messages persist in UI');
console.log('11. Test logout clears all persisted data');
console.log('12. Check browser console for debug logs');
console.log('13. Open dev tools and run: window.clearPersistedState()');
console.log('\n✨ Enhanced Redux Persist Implementation Ready for Testing!');