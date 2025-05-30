#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Packages to remove
const packagesToRemove = {
  storybook: [
    '@chromatic-com/storybook',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    '@storybook/addon-onboarding',
    '@storybook/blocks',
    '@storybook/nextjs',
    '@storybook/react',
    '@storybook/test',
    'storybook'
  ],
  // We'll check these Radix UI packages later
  potentiallyUnused: [
    '@testing-library/jest-dom',
    '@testing-library/react',
    '@testing-library/user-event',
    'jest-environment-jsdom'
  ]
};

console.log('📦 Package Cleanup Tool\n');

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Backup package.json
const backupPath = path.join(__dirname, '..', 'package.json.backup');
fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2));
console.log(`✅ Created backup at: package.json.backup\n`);

// Remove Storybook packages
console.log('🗑️  Removing Storybook packages...\n');

let removedCount = 0;
packagesToRemove.storybook.forEach(pkg => {
  if (packageJson.dependencies && packageJson.dependencies[pkg]) {
    delete packageJson.dependencies[pkg];
    console.log(`  - Removed ${pkg} from dependencies`);
    removedCount++;
  }
  if (packageJson.devDependencies && packageJson.devDependencies[pkg]) {
    delete packageJson.devDependencies[pkg];
    console.log(`  - Removed ${pkg} from devDependencies`);
    removedCount++;
  }
});

// Remove storybook scripts if any
if (packageJson.scripts) {
  Object.keys(packageJson.scripts).forEach(scriptName => {
    if (scriptName.includes('storybook') || packageJson.scripts[scriptName].includes('storybook')) {
      delete packageJson.scripts[scriptName];
      console.log(`  - Removed script: ${scriptName}`);
      removedCount++;
    }
  });
}

console.log(`\n✅ Removed ${removedCount} Storybook-related entries\n`);

// Check for potentially unused packages
console.log('🔍 Checking potentially unused packages...\n');

packagesToRemove.potentiallyUnused.forEach(pkg => {
  try {
    // Search for imports of this package
    const searchResult = execSync(
      `grep -r "${pkg}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" ./app ./components ./lib ./utils 2>/dev/null || true`,
      { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
    ).trim();
    
    if (!searchResult) {
      console.log(`  ⚠️  ${pkg} - No imports found (candidate for removal)`);
    } else {
      console.log(`  ✓ ${pkg} - Still in use`);
    }
  } catch (e) {
    console.log(`  ? ${pkg} - Could not verify usage`);
  }
});

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('\n✅ Updated package.json\n');

// Check for Radix UI packages that might be unused
console.log('🔍 Checking Radix UI packages usage...\n');

const radixPackages = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.devDependencies
}).filter(pkg => pkg.startsWith('@radix-ui/'));

const usedRadixPackages = new Set();
const unusedRadixPackages = new Set();

radixPackages.forEach(pkg => {
  try {
    const searchResult = execSync(
      `grep -r "${pkg}" --include="*.ts" --include="*.tsx" ./app ./components ./lib 2>/dev/null || true`,
      { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
    ).trim();
    
    if (!searchResult) {
      unusedRadixPackages.add(pkg);
    } else {
      usedRadixPackages.add(pkg);
    }
  } catch (e) {
    console.log(`  ? ${pkg} - Could not verify usage`);
  }
});

if (unusedRadixPackages.size > 0) {
  console.log('⚠️  Potentially unused Radix UI packages:');
  unusedRadixPackages.forEach(pkg => console.log(`  - ${pkg}`));
  console.log('\nThese might be dependencies of other shadcn components.');
  console.log('Verify carefully before removing.\n');
}

if (usedRadixPackages.size > 0) {
  console.log('✓ Still used Radix UI packages:');
  usedRadixPackages.forEach(pkg => console.log(`  - ${pkg}`));
}

console.log('\n📋 Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run build');
console.log('3. If successful, delete package.json.backup');
console.log('4. If issues occur, restore with: mv package.json.backup package.json && npm install');