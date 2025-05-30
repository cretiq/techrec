#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files that need textarea migration based on our search
const filesToMigrate = [
  './components/ui/Feedback.tsx',
  './components/profile/ProfileInfoCard.tsx',
  './components/analysis/display/ExperienceDisplay.tsx',
  './components/analysis/display/AboutDisplay.tsx',
  './app/linkedin/page.tsx',
  './app/developer/writing-help/components/outreach-message-generator.tsx',
  './app/developer/writing-help/components/cv-optimizer.tsx',
  './app/developer/roles/new/page.tsx',
  './app/developer/applications/page.tsx'
];

const migrateTextarea = () => {
  console.log('Starting Textarea Migration...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  filesToMigrate.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    try {
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        errorCount++;
        errors.push(`File not found: ${filePath}`);
        return;
      }
      
      // Read file content
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalContent = content;
      
      // Check if file imports from ui/textarea
      if (!content.includes('@/components/ui/textarea')) {
        console.log(`⏭️  No ui/textarea import found in: ${filePath}`);
        return;
      }
      
      // Replace the import
      content = content.replace(
        /import\s*{\s*Textarea\s*}\s*from\s*["']@\/components\/ui\/textarea["']/g,
        'import { Textarea } from "@/components/ui-daisy/textarea"'
      );
      
      // Check if content changed
      if (content === originalContent) {
        console.log(`⏭️  No changes needed for: ${filePath}`);
        return;
      }
      
      // Write the updated content back
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Migrated: ${filePath}`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      errorCount++;
      errors.push(`${filePath}: ${error.message}`);
    }
  });
  
  console.log('\n=== Migration Summary ===');
  console.log(`✅ Successfully migrated: ${successCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(err => console.log(`  - ${err}`));
  }
  
  // Verify no more imports remain
  console.log('\n=== Verification ===');
  console.log('Checking for any remaining ui/textarea imports...');
  
  try {
    const result = execSync(
      'grep -r "@/components/ui/textarea" --include="*.ts" --include="*.tsx" ./app ./components ./lib 2>/dev/null || true',
      { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
    );
    
    if (result.trim()) {
      console.log('⚠️  Found remaining ui/textarea imports:');
      console.log(result);
    } else {
      console.log('✅ No ui/textarea imports remaining!');
    }
  } catch (e) {
    console.log('Could not verify remaining imports');
  }
};

// Run the migration
migrateTextarea();