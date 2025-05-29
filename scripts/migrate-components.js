#!/usr/bin/env node

/**
 * DaisyUI Migration Script
 * 
 * This script helps automate the migration from shadcn/ui to DaisyUI components
 * by finding and replacing import statements and component usages.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Component mapping from shadcn to DaisyUI (by file path)
const componentMappings = {
  '@/components/ui/button': {
    to: '@/components/ui-daisy/button',
    status: 'completed'
  },
  '@/components/ui/input': {
    to: '@/components/ui-daisy/input',
    status: 'completed'
  },
  '@/components/ui/card': {
    to: '@/components/ui-daisy/card',
    status: 'completed'
  },
  '@/components/ui/select': {
    to: '@/components/ui-daisy/select',
    status: 'completed'
  },
  '@/components/ui/tabs': {
    to: '@/components/ui-daisy/tabs',
    status: 'completed'
  },
  '@/components/ui/dialog': {
    to: '@/components/ui-daisy/dialog',
    status: 'pending'
  },
  '@/components/ui/badge': {
    to: '@/components/ui-daisy/badge',
    status: 'completed'
  }
};

// Directories to scan for component usage
const scanDirectories = [
  'app',
  'components',
  'lib'
];

// File extensions to process
const fileExtensions = ['.tsx', '.ts', '.jsx', '.js'];

/**
 * Recursively find all files with specified extensions
 */
function findFiles(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .next directories
        if (!['node_modules', '.next', '.git'].includes(item)) {
          traverse(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Analyze a file for shadcn component usage
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const analysis = {
    file: filePath,
    imports: [],
    usages: [],
    needsMigration: false
  };
  
  // Find import statements
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"](@\/components\/ui\/[^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(imp => imp.trim());
    const fromPath = match[2];
    
    analysis.imports.push({
      components: imports,
      from: fromPath,
      fullMatch: match[0]
    });
    
    // Check if this path has a DaisyUI equivalent
    if (componentMappings[fromPath]) {
      analysis.needsMigration = true;
    }
  }
  
  return analysis;
}

/**
 * Migrate imports in a file
 */
function migrateFile(filePath, dryRun = true) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let changes = [];
  
  // Replace import statements
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"](@\/components\/ui\/[^'"]+)['"]/g;
  
  newContent = newContent.replace(importRegex, (match, imports, fromPath) => {
    // Check if this path has a completed mapping
    if (componentMappings[fromPath] && componentMappings[fromPath].status === 'completed') {
      const newImport = `import { ${imports} } from '${componentMappings[fromPath].to}'`;
      changes.push({
        type: 'import',
        from: match,
        to: newImport
      });
      return newImport;
    }
    
    return match;
  });
  
  if (!dryRun && changes.length > 0) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Migrated ${filePath}`);
    changes.forEach(change => {
      console.log(`   ${change.from} → ${change.to}`);
    });
  }
  
  return { changes, newContent };
}

/**
 * Generate migration report
 */
function generateReport() {
  console.log('🔍 Scanning for shadcn/ui component usage...\n');
  
  const allFiles = [];
  for (const dir of scanDirectories) {
    if (fs.existsSync(dir)) {
      allFiles.push(...findFiles(dir, fileExtensions));
    }
  }
  
  const report = {
    totalFiles: allFiles.length,
    filesWithShadcn: 0,
    componentUsage: {},
    migrationCandidates: []
  };
  
  for (const file of allFiles) {
    const analysis = analyzeFile(file);
    
    if (analysis.imports.length > 0) {
      report.filesWithShadcn++;
      
      for (const importGroup of analysis.imports) {
        for (const component of importGroup.components) {
          const cleanComponent = component.replace(/\s+as\s+\w+/, '').trim();
          if (!report.componentUsage[cleanComponent]) {
            report.componentUsage[cleanComponent] = [];
          }
          report.componentUsage[cleanComponent].push(file);
        }
      }
      
      if (analysis.needsMigration) {
        report.migrationCandidates.push(analysis);
      }
    }
  }
  
  return report;
}

/**
 * Print migration report
 */
function printReport(report) {
  console.log('📊 Migration Report');
  console.log('==================\n');
  
  console.log(`📁 Total files scanned: ${report.totalFiles}`);
  console.log(`🎯 Files using shadcn/ui: ${report.filesWithShadcn}`);
  console.log(`🚀 Files ready for migration: ${report.migrationCandidates.length}\n`);
  
  console.log('📦 Component Usage Summary:');
  console.log('---------------------------');
  
  Object.entries(report.componentUsage).forEach(([component, files]) => {
    // Try to find mapping by checking all paths for this component
    let status = 'not-mapped';
    for (const [path, mapping] of Object.entries(componentMappings)) {
      if (path.includes(component.toLowerCase()) || path.endsWith(`/${component.toLowerCase()}`)) {
        status = mapping.status;
        break;
      }
    }
    const statusIcon = status === 'completed' ? '✅' : status === 'pending' ? '⏳' : '❓';
    
    console.log(`${statusIcon} ${component}: ${files.length} files`);
  });
  
  console.log('\n🎯 Migration Candidates:');
  console.log('------------------------');
  
  report.migrationCandidates.forEach(candidate => {
    console.log(`📄 ${candidate.file}`);
    candidate.imports.forEach(importGroup => {
      console.log(`   Import: ${importGroup.fullMatch}`);
    });
  });
}

/**
 * Main migration function
 */
function migrate(options = {}) {
  const { dryRun = true, component = null } = options;
  
  console.log(`🚀 Starting DaisyUI migration ${dryRun ? '(DRY RUN)' : '(LIVE)'}...\n`);
  
  const report = generateReport();
  
  if (dryRun) {
    printReport(report);
    console.log('\n💡 Run with --live flag to apply changes');
    return;
  }
  
  // Apply migrations
  let migratedFiles = 0;
  for (const candidate of report.migrationCandidates) {
    const result = migrateFile(candidate.file, false);
    if (result.changes.length > 0) {
      migratedFiles++;
    }
  }
  
  console.log(`\n✅ Migration complete! ${migratedFiles} files updated.`);
}

/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: !args.includes('--live'),
    component: null
  };
  
  // Parse component-specific migration
  const componentIndex = args.indexOf('--component');
  if (componentIndex !== -1 && args[componentIndex + 1]) {
    options.component = args[componentIndex + 1];
  }
  
  if (args.includes('--help')) {
    console.log(`
DaisyUI Migration Script
========================

Usage:
  node scripts/migrate-components.js [options]

Options:
  --live                Apply changes (default: dry run)
  --component <name>    Migrate specific component only
  --help               Show this help

Examples:
  node scripts/migrate-components.js                    # Dry run analysis
  node scripts/migrate-components.js --live             # Apply all migrations
  node scripts/migrate-components.js --component Button # Migrate Button only
`);
    return;
  }
  
  migrate(options);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrate, generateReport, analyzeFile, migrateFile }; 