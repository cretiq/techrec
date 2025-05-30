#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Analyzing remaining shadcn/ui components...\n');

// Get all remaining UI components
const uiDir = path.join(__dirname, '..', 'components', 'ui');
const components = fs.readdirSync(uiDir)
  .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
  .filter(file => !file.endsWith('.test.tsx') && !file.endsWith('.stories.tsx'))
  .map(file => file.replace(/\.(tsx|ts)$/, ''));

console.log(`Found ${components.length} remaining components:\n`);

const usageAnalysis = {};
const daisyUIEquivalents = {
  'button': '✅ Has DaisyUI equivalent',
  'card': '✅ Has DaisyUI equivalent', 
  'input': '✅ Has DaisyUI equivalent',
  'select': '✅ Has DaisyUI equivalent',
  'badge': '✅ Has DaisyUI equivalent',
  'tabs': '✅ Has DaisyUI equivalent',
  'textarea': '✅ Has DaisyUI equivalent (already migrated)',
  'alert': '🟡 Could use DaisyUI alert/toast',
  'progress': '🟡 DaisyUI has progress component',
  'skeleton': '🟡 DaisyUI has skeleton utility classes',
  'separator': '🟡 Can use border utilities',
  'toast': '❌ No direct DaisyUI equivalent (keep)',
  'dropdown-menu': '❌ No direct DaisyUI equivalent (keep)',
  'dialog': '🟡 DaisyUI has modal component',
  'popover': '❌ Complex positioning (keep for now)',
  'scroll-area': '❌ Custom scrolling behavior (keep)',
  'form': '❌ React Hook Form wrapper (keep)',
  'label': '❌ Standard form component (keep)',
  'use-toast': '❌ Toast hook (keep)',
  'toaster': '❌ Toast system (keep)',
  'use-mobile': '❌ Mobile detection hook (keep)'
};

for (const component of components) {
  try {
    // Count imports across the codebase
    const importPattern = `@/components/ui/${component}`;
    const result = execSync(
      `grep -r "${importPattern}" --include="*.ts" --include="*.tsx" ./app ./components ./lib ./utils 2>/dev/null | wc -l`,
      { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
    ).trim();
    
    const importCount = parseInt(result) || 0;
    
    // Get specific import locations
    let importLocations = [];
    if (importCount > 0) {
      try {
        const locations = execSync(
          `grep -r "${importPattern}" --include="*.ts" --include="*.tsx" ./app ./components ./lib ./utils 2>/dev/null | head -5`,
          { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
        ).trim().split('\n').filter(Boolean);
        importLocations = locations.map(loc => loc.split(':')[0]);
      } catch (e) {
        // ignore
      }
    }
    
    usageAnalysis[component] = {
      imports: importCount,
      locations: importLocations,
      daisyEquivalent: daisyUIEquivalents[component] || '❓ No known equivalent'
    };
    
  } catch (error) {
    usageAnalysis[component] = {
      imports: 0,
      locations: [],
      daisyEquivalent: daisyUIEquivalents[component] || '❓ No known equivalent',
      error: error.message
    };
  }
}

// Sort by usage count
const sortedComponents = Object.entries(usageAnalysis)
  .sort(([,a], [,b]) => b.imports - a.imports);

console.log('📊 Usage Analysis:\n');

// High usage components (keep)
const highUsage = sortedComponents.filter(([,data]) => data.imports >= 5);
if (highUsage.length > 0) {
  console.log('🔥 HIGH USAGE (5+ imports) - KEEP:');
  highUsage.forEach(([component, data]) => {
    console.log(`  ${component}: ${data.imports} imports`);
    console.log(`    Status: ${data.daisyEquivalent}`);
    if (data.locations.length > 0) {
      console.log(`    Used in: ${data.locations.slice(0, 3).join(', ')}${data.locations.length > 3 ? '...' : ''}`);
    }
    console.log();
  });
}

// Medium usage components (evaluate)
const mediumUsage = sortedComponents.filter(([,data]) => data.imports >= 2 && data.imports < 5);
if (mediumUsage.length > 0) {
  console.log('🟡 MEDIUM USAGE (2-4 imports) - EVALUATE:');
  mediumUsage.forEach(([component, data]) => {
    console.log(`  ${component}: ${data.imports} imports`);
    console.log(`    Status: ${data.daisyEquivalent}`);
    if (data.locations.length > 0) {
      console.log(`    Used in: ${data.locations.join(', ')}`);
    }
    console.log();
  });
}

// Low usage components (candidates for removal)
const lowUsage = sortedComponents.filter(([,data]) => data.imports === 1);
if (lowUsage.length > 0) {
  console.log('🔴 LOW USAGE (1 import) - CANDIDATES FOR REMOVAL:');
  lowUsage.forEach(([component, data]) => {
    console.log(`  ${component}: ${data.imports} import`);
    console.log(`    Status: ${data.daisyEquivalent}`);
    if (data.locations.length > 0) {
      console.log(`    Used in: ${data.locations[0]}`);
    }
    console.log();
  });
}

// Unused components
const unused = sortedComponents.filter(([,data]) => data.imports === 0);
if (unused.length > 0) {
  console.log('⚠️  UNUSED (0 imports) - SAFE TO REMOVE:');
  unused.forEach(([component, data]) => {
    console.log(`  ${component}: No imports found`);
    console.log(`    Status: ${data.daisyEquivalent}`);
    console.log();
  });
}

// Generate removal commands for safe components
const safeToRemove = [
  ...unused.map(([component]) => component),
  ...lowUsage
    .filter(([component, data]) => 
      data.daisyEquivalent.startsWith('✅') || 
      data.daisyEquivalent.startsWith('🟡')
    )
    .map(([component]) => component)
];

if (safeToRemove.length > 0) {
  console.log('🗑️  SAFE REMOVAL COMMANDS:\n');
  safeToRemove.forEach(component => {
    console.log(`rm -f ./components/ui/${component}.tsx`);
  });
  
  // Create removal script
  const removalScript = safeToRemove.map(component => 
    `rm -f "./components/ui/${component}.tsx"`
  ).join('\n');
  
  fs.writeFileSync(
    path.join(__dirname, 'remove-safe-ui-components.sh'), 
    `#!/bin/bash\n# Safe UI components to remove\n\n${removalScript}\n\necho "✅ Removed ${safeToRemove.length} safe components"\n`,
    { mode: 0o755 }
  );
  
  console.log(`\n✅ Created removal script: scripts/remove-safe-ui-components.sh`);
}

console.log('\n📋 Summary:');
console.log(`  Total components: ${components.length}`);
console.log(`  High usage (keep): ${highUsage.length}`);
console.log(`  Medium usage (evaluate): ${mediumUsage.length}`);  
console.log(`  Low usage (consider removal): ${lowUsage.length}`);
console.log(`  Unused (safe to remove): ${unused.length}`);
console.log(`  Safe removal candidates: ${safeToRemove.length}`);
console.log();
console.log('💡 Next steps:');
console.log('1. Review medium usage components for DaisyUI migration opportunities');
console.log('2. Run removal script if comfortable with removing safe components'); 
console.log('3. Keep essential components like toast, form, dropdown-menu');