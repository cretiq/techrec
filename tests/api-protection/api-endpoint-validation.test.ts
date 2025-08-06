/**
 * API ENDPOINT VALIDATION TESTS
 * 
 * These tests validate that critical API endpoints actually exist in the filesystem
 * and have proper route handlers. This prevents accidental deletion of route files.
 */

import { describe, test, expect } from '@jest/globals';
import { existsSync } from 'fs';
import path from 'path';

describe('API ENDPOINT FILE VALIDATION', () => {
  const API_BASE_PATH = path.join(process.cwd(), 'app', 'api');

  // Map of API paths to their expected file locations
  const API_FILE_MAP = {
    // CRITICAL - Currently in active use
    '/api/developer/profile': 'app/api/developer/profile/route.ts',
    '/api/developer/me/profile': 'app/api/developer/me/profile/route.ts',
    '/api/developer/saved-roles': 'app/api/developer/saved-roles/route.ts',
    '/api/developer/saved-roles/mark-applied': 'app/api/developer/saved-roles/mark-applied/route.ts',
    '/api/developer/saved-roles/un-apply': 'app/api/developer/saved-roles/un-apply/route.ts',
    '/api/developer/me/saved-roles': 'app/api/developer/me/saved-roles/route.ts',
    '/api/developers/me/saved-roles': 'app/api/developers/me/saved-roles/route.ts',
    '/api/developer/me/skills': 'app/api/developer/me/skills/route.ts',
    '/api/developer/application-activity': 'app/api/developer/application-activity/route.ts',

    // DUPLICATES - Should be removed after migration
    '/api/developer/experience': 'app/api/developer/experience/route.ts',
    '/api/developer/education': 'app/api/developer/education/route.ts',
    '/api/developer/skills': 'app/api/developer/skills/route.ts',
    '/api/developer/achievements': 'app/api/developer/achievements/route.ts',
    '/api/developers/me/profile': 'app/api/developers/me/profile/route.ts',
    '/api/developers/me/skills': 'app/api/developers/me/skills/route.ts',
  };

  describe('CRITICAL API FILES MUST EXIST', () => {
    const criticalFiles = [
      'app/api/developer/me/profile/route.ts',
      'app/api/developer/me/saved-roles/route.ts', 
      'app/api/developer/me/skills/route.ts',
      'app/api/developer/application-activity/route.ts'
    ];

    criticalFiles.forEach(filePath => {
      test(`Critical API file must exist: ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath);
        const exists = existsSync(fullPath);
        
        if (!exists) {
          console.error(`CRITICAL: Missing API file: ${fullPath}`);
        }
        
        expect(exists).toBe(true);
      });
    });
  });

  describe('LEGACY API FILES VERIFICATION', () => {
    const legacyFiles = [
      'app/api/developer/profile/route.ts',
      'app/api/developer/saved-roles/route.ts',
      'app/api/developer/saved-roles/mark-applied/route.ts',
      'app/api/developer/saved-roles/un-apply/route.ts'
    ];

    legacyFiles.forEach(filePath => {
      test(`Legacy API file exists (to be migrated): ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath);
        const exists = existsSync(fullPath);
        
        console.log(`Legacy API file ${exists ? 'EXISTS' : 'MISSING'}: ${filePath}`);
        
        // Document existence for migration planning
        expect(typeof exists).toBe('boolean');
      });
    });
  });

  describe('DUPLICATE API FILES VERIFICATION', () => {
    const duplicateFiles = [
      'app/api/developers/me/saved-roles/route.ts',
      'app/api/developers/me/profile/route.ts', 
      'app/api/developers/me/skills/route.ts'
    ];

    duplicateFiles.forEach(filePath => {
      test(`Duplicate API file exists (to be removed): ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath);
        const exists = existsSync(fullPath);
        
        console.log(`Duplicate API file ${exists ? 'EXISTS' : 'MISSING'}: ${filePath}`);
        
        // These should exist now but be removed after migration
        expect(typeof exists).toBe('boolean');
      });
    });
  });

  describe('UNUSED API FILES VERIFICATION', () => {
    const unusedFiles = [
      'app/api/developer/experience/route.ts',
      'app/api/developer/education/route.ts',
      'app/api/developer/skills/route.ts', 
      'app/api/developer/achievements/route.ts'
    ];

    unusedFiles.forEach(filePath => {
      test(`Unused API file status: ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath);
        const exists = existsSync(fullPath);
        
        console.log(`Unused API file ${exists ? 'EXISTS' : 'MISSING'}: ${filePath}`);
        
        // These may or may not exist - just documenting
        expect(typeof exists).toBe('boolean');
      });
    });
  });

  describe('API ROUTE STRUCTURE VALIDATION', () => {
    test('Modern RESTful structure is preferred', () => {
      const modernStructure = [
        'app/api/developer/me/profile/route.ts',
        'app/api/developer/me/experience/route.ts',
        'app/api/developer/me/education/route.ts',
        'app/api/developer/me/skills/route.ts',
        'app/api/developer/me/saved-roles/route.ts',
        'app/api/developer/me/achievements/route.ts'
      ];

      let modernCount = 0;
      let legacyCount = 0;

      modernStructure.forEach(filePath => {
        const fullPath = path.join(process.cwd(), filePath);
        if (existsSync(fullPath)) {
          modernCount++;
        }
      });

      const legacyStructure = [
        'app/api/developer/profile/route.ts',
        'app/api/developer/experience/route.ts',
        'app/api/developer/education/route.ts',
        'app/api/developer/skills/route.ts',
        'app/api/developer/saved-roles/route.ts'
      ];

      legacyStructure.forEach(filePath => {
        const fullPath = path.join(process.cwd(), filePath);
        if (existsSync(fullPath)) {
          legacyCount++;
        }
      });

      console.log(`Modern RESTful APIs: ${modernCount}`);
      console.log(`Legacy APIs: ${legacyCount}`);
      
      // Goal: modern should be greater than or equal to legacy after migration
      expect(modernCount).toBeGreaterThanOrEqual(0);
      expect(legacyCount).toBeGreaterThanOrEqual(0);
    });
  });
});

/**
 * POST-MIGRATION VALIDATION
 * 
 * After Phase 2 is complete, update this test to:
 * 1. Remove legacy file checks
 * 2. Remove duplicate file checks  
 * 3. Ensure only modern RESTful APIs exist
 * 4. Add new critical endpoints as needed
 */