#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files we want to potentially remove
const filesToCheck = {
  'test_demo_files': [
    './app/test.tsx',
    './app/demo-cover-letter/page.tsx',
    './app/demo-cover-letter/layout.tsx',
    './app/daisyui-test/page.tsx',
    './test-template.html',
    './test-infinite-loop-fix.md',
    './test.txt',
    './test.pdf'
  ],
  'api_test_files': [
    './app/api/redis-test/route.ts',
    './app/api/linkedin/test-endpoint/route.ts'
  ],
  'example_files': [
    './app/api/rapidapi/search/rapidapi_job_response_example copy.json',
    './app/api/rapidapi/search/rapidapi_job_response_example.json',
    './scripts/example_prd.txt'
  ],
  'duplicate_configs': [
    './jest.config.js',
    './jest.setup.js',
    './next.config.ts',
    './tailwind.config.ts.backup'
  ],
  'storybook_files': [
    './components/ui/AnalysisResultCard.stories.tsx',
    './components/ui/Feedback.stories.tsx',
    './components/ui/Navigation.stories.tsx',
    './components/ui/ProgressIndicator.stories.tsx',
    './components/ui/SuggestionCard.stories.tsx'
  ],
  'component_tests': [
    './components/ui/AnalysisResultCard.test.tsx',
    './components/ui/Feedback.test.tsx',
    './components/ui/Navigation.test.tsx',
    './components/ui/ProgressIndicator.test.tsx',
    './components/ui/SuggestionCard.test.tsx'
  ],
  'migration_files': [
    './lib/migration/component-mapping.ts',
    './app/migration-comparison/page.tsx'
  ]
};

const safeToDelete = [];
const notSafeToDelete = [];

function checkFileUsage(filePath) {
  const fileName = path.basename(filePath);
  const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  
  console.log(`\nChecking: ${filePath}`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`  ✓ File doesn't exist (already deleted)`);
    return { safe: true, reason: 'File not found' };
  }
  
  try {
    // Search for imports of this file
    const importPatterns = [
      `"${filePath}"`,
      `'${filePath}'`,
      `"${filePath.replace('./', '')}"`,
      `'${filePath.replace('./', '')}'`,
      `"${fileName}"`,
      `'${fileName}'`,
      `"${fileNameWithoutExt}"`,
      `'${fileNameWithoutExt}'`,
      fileName.replace('.tsx', '').replace('.ts', ''),
    ];
    
    let foundImports = false;
    let importLocations = [];
    
    for (const pattern of importPatterns) {
      try {
        const result = execSync(
          `grep -r "${pattern}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" ./app ./components ./lib ./utils ./pages 2>/dev/null || true`,
          { cwd: path.resolve(__dirname, '..'), encoding: 'utf-8' }
        );
        
        if (result.trim()) {
          const lines = result.trim().split('\n').filter(line => 
            !line.includes(filePath) && // Don't count self-references
            !line.includes('node_modules') &&
            !line.includes('cleanup-analysis.js')
          );
          
          if (lines.length > 0) {
            foundImports = true;
            importLocations = [...importLocations, ...lines];
          }
        }
      } catch (e) {
        // Grep returns non-zero when no matches found
      }
    }
    
    // Special checks for certain files
    if (filePath.includes('redis-test')) {
      const redisTestUsage = execSync(
        `grep -r "redis-test" --include="*.tsx" ./app/developer/cv-management/page.tsx 2>/dev/null || true`,
        { cwd: path.resolve(__dirname, '..'), encoding: 'utf-8' }
      );
      if (redisTestUsage.trim()) {
        foundImports = true;
        importLocations.push('Used in cv-management page for Redis testing');
      }
    }
    
    if (filePath.includes('test-endpoint')) {
      const testEndpointUsage = execSync(
        `grep -r "test-endpoint" --include="*.tsx" ./app/linkedin/jobs/page.tsx 2>/dev/null || true`,
        { cwd: path.resolve(__dirname, '..'), encoding: 'utf-8' }
      );
      if (testEndpointUsage.trim()) {
        foundImports = true;
        importLocations.push('Used in LinkedIn jobs page');
      }
    }
    
    // Check package.json scripts
    if (filePath.includes('jest.config') || filePath.includes('jest.setup')) {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const scripts = JSON.stringify(packageJson.scripts || {});
      if (scripts.includes(fileName)) {
        foundImports = true;
        importLocations.push('Referenced in package.json scripts');
      }
    }
    
    if (foundImports) {
      console.log(`  ✗ Found imports/references:`);
      importLocations.forEach(loc => console.log(`    - ${loc}`));
      return { safe: false, reason: 'File is imported or referenced', locations: importLocations };
    } else {
      console.log(`  ✓ No imports found`);
      return { safe: true, reason: 'No imports or references found' };
    }
    
  } catch (error) {
    console.log(`  ⚠ Error checking file: ${error.message}`);
    return { safe: false, reason: `Error checking file: ${error.message}` };
  }
}

console.log('=== Cleanup Analysis Tool ===\n');
console.log('Checking all files for dependencies...\n');

// Check each category
for (const [category, files] of Object.entries(filesToCheck)) {
  console.log(`\n--- ${category.replace(/_/g, ' ').toUpperCase()} ---`);
  
  for (const file of files) {
    const result = checkFileUsage(file);
    
    if (result.safe) {
      safeToDelete.push({ file, category, reason: result.reason });
    } else {
      notSafeToDelete.push({ file, category, reason: result.reason, locations: result.locations });
    }
  }
}

// Summary
console.log('\n\n=== SUMMARY ===\n');

console.log(`✅ SAFE TO DELETE (${safeToDelete.length} files):`);
console.log('─'.repeat(60));
safeToDelete.forEach(({ file, category }) => {
  console.log(`  ${file} (${category})`);
});

console.log(`\n❌ NOT SAFE TO DELETE (${notSafeToDelete.length} files):`);
console.log('─'.repeat(60));
notSafeToDelete.forEach(({ file, reason, locations }) => {
  console.log(`  ${file}`);
  console.log(`    Reason: ${reason}`);
  if (locations) {
    console.log(`    Used in:`);
    locations.forEach(loc => console.log(`      - ${loc}`));
  }
});

// Create deletion script for safe files
const deleteScript = safeToDelete.map(({ file }) => `rm -f "${file}"`).join('\n');
fs.writeFileSync(path.join(__dirname, 'safe-to-delete.sh'), `#!/bin/bash\n# Safe files to delete\n\n${deleteScript}\n`, { mode: 0o755 });

console.log('\n\n✅ Created safe-to-delete.sh with files that can be safely removed.');
console.log('Review the script and run it when ready.');