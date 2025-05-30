#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files with import errors based on TypeScript output
const importFixes = [
  {
    files: [
      './app/api/companies/[id]/[companyId]/roles/route.ts',
      './app/api/companies/[id]/route.ts',
      './app/api/developer/achievements/route.ts',
      './app/api/developer/education/route.ts',
      './app/api/developer/experience/route.ts',
      './app/api/developer/skills/route.ts',
      './app/api/roles/[roleId]/applications/[applicationId]/route.ts',
      './app/api/roles/[roleId]/apply/route.ts',
      './app/api/roles/[roleId]/save/route.ts'
    ],
    oldImport: /@\/lib\/db/g,
    newImport: '@/prisma/prisma'
  },
  {
    files: [
      './app/api/developer/me/cv/confirm/route.ts'
    ],
    oldImport: /@\/lib\/cv-analysis/g,
    newImport: '@/utils/cv-analyzer'
  }
];

// Fix NextAuth session type issues
const sessionTypeFix = `
// Add to the top of the file after imports
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}
`;

let totalFixed = 0;
let totalErrors = 0;

console.log('🔧 Fixing TypeScript errors...\n');

// Fix import errors
importFixes.forEach(({ files, oldImport, newImport }) => {
  files.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    try {
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
      }
      
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalContent = content;
      
      // Replace the import
      content = content.replace(oldImport, newImport);
      
      // Also remove any /models/* imports since they don't exist
      content = content.replace(/import.*from\s+['"]@\/lib\/models\/[^'"]+['"]/g, '// Removed non-existent import');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Fixed imports in: ${filePath}`);
        totalFixed++;
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
      totalErrors++;
    }
  });
});

// Fix specific known issues
const specificFixes = [
  {
    file: './app/api/cv/[id]/route.ts',
    line: 86,
    issue: "Cannot find name 'id'",
    fix: (content) => {
      // Replace the problematic line
      return content.replace(
        /console\.error\(`Error fetching CV with ID \$\{id\}:`, error\);/,
        'console.error(`Error fetching CV with ID ${params.id}:`, error);'
      );
    }
  },
  {
    file: './app/api/cv-analysis/route.ts',
    line: 77,
    issue: "Property 's3Key' is missing",
    fix: (content) => {
      // Add the missing s3Key property
      return content.replace(
        /status: AnalysisStatus\.COMPLETED as "COMPLETED",\s*analysisResult: cachedAnalysis,\s*analyzedAt: new Date\(\)/,
        `status: AnalysisStatus.COMPLETED as "COMPLETED",
        analysisResult: cachedAnalysis,
        analyzedAt: new Date(),
        s3Key: 'cached-analysis' // Added missing property`
      );
    }
  }
];

console.log('\n🔧 Fixing specific TypeScript issues...\n');

specificFixes.forEach(({ file, issue, fix }) => {
  const fullPath = path.join(__dirname, '..', file);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    content = fix(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed "${issue}" in: ${file}`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
    totalErrors++;
  }
});

// Fix NextAuth session types
const authFile = path.join(__dirname, '..', 'app/api/auth/[...nextauth]/providers/github.ts');
try {
  let content = fs.readFileSync(authFile, 'utf8');
  
  // Add type declaration if not present
  if (!content.includes('declare module "next-auth"')) {
    const importEnd = content.lastIndexOf('import');
    const afterImports = content.indexOf('\n', importEnd) + 1;
    
    content = content.slice(0, afterImports) + sessionTypeFix + content.slice(afterImports);
    
    fs.writeFileSync(authFile, content, 'utf8');
    console.log(`✅ Fixed NextAuth session types in github.ts`);
    totalFixed++;
  }
} catch (error) {
  console.error(`❌ Error fixing NextAuth types:`, error.message);
  totalErrors++;
}

console.log('\n=== Summary ===');
console.log(`✅ Fixed: ${totalFixed} files`);
console.log(`❌ Errors: ${totalErrors} files`);

console.log('\n🔍 Running TypeScript check to see remaining errors...\n');

try {
  const tsErrors = execSync('npx tsc --noEmit 2>&1 | grep -E "error TS" | wc -l', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8'
  }).trim();
  
  console.log(`📊 Remaining TypeScript errors: ${tsErrors}`);
} catch (e) {
  console.log('Could not count remaining errors');
}