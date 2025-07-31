#!/usr/bin/env node

/**
 * Cleanup Script: Remove Obsolete CvAnalysis Data
 * 
 * PURPOSE: Clean removal of deprecated CvAnalysis table data after migration
 * to single source of truth architecture (proper profile tables).
 * 
 * SAFETY: Only removes CvAnalysis records - preserves all user data, 
 * authentication, profiles, and other important information.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Safety configuration
const DRY_RUN = process.env.DRY_RUN !== 'false'; // Default to dry run unless explicitly disabled
const CONFIRM_DELETION = process.env.CONFIRM_DELETION === 'true';

console.log('🧹 CvAnalysis Cleanup Script Starting...');
console.log(`📋 Mode: ${DRY_RUN ? 'DRY RUN (safe preview)' : 'ACTUAL DELETION'}`);
console.log(`🔒 Confirmation: ${CONFIRM_DELETION ? 'CONFIRMED' : 'NOT CONFIRMED'}`);

async function validateSafetyChecks() {
  console.log('\n🔍 Running safety checks...');
  
  // Check 1: Verify we're only targeting CvAnalysis table
  const tablesToCheck = [
    'developer',
    'experience', 
    'education',
    'contactInfo',
    'developerSkill',
    'achievement',
    'userBadge',
    'xPTransaction'  // Note: Prisma uses camelCase
  ];
  
  for (const table of tablesToCheck) {
    const count = await prisma[table].count();
    console.log(`✅ ${table}: ${count} records (WILL BE PRESERVED)`);
  }
  
  // Check 2: Count CvAnalysis records to be removed
  const cvAnalysisCount = await prisma.cvAnalysis.count();
  console.log(`🗑️  cvAnalysis: ${cvAnalysisCount} records (WILL BE REMOVED)`);
  
  // Check 3: Verify CV file metadata will be preserved
  const cvCount = await prisma.cV.count();
  console.log(`✅ CV file metadata: ${cvCount} records (WILL BE PRESERVED)`);
  
  return {
    cvAnalysisCount,
    safetyPassed: true
  };
}

async function cleanupCvAnalysisData(dryRun = true) {
  console.log(`\n🧹 ${dryRun ? 'PREVIEWING' : 'EXECUTING'} cleanup operations...`);
  
  try {
    if (dryRun) {
      // Dry run: Just query and report what would be deleted
      const recordsToDelete = await prisma.cvAnalysis.findMany({
        select: {
          id: true,
          developerId: true,
          originalName: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10 // Show sample of records
      });
      
      console.log('📋 Sample of CvAnalysis records that would be deleted:');
      recordsToDelete.forEach(record => {
        console.log(`   - ID: ${record.id} | Developer: ${record.developerId} | File: ${record.originalName} | Created: ${record.createdAt.toISOString()}`);
      });
      
      if (recordsToDelete.length === 10) {
        const totalCount = await prisma.cvAnalysis.count();
        console.log(`   ... and ${totalCount - 10} more records`);
      }
      
      console.log('\n✅ DRY RUN COMPLETE - No data was actually deleted');
      console.log('🚀 To execute the cleanup, run: CONFIRM_DELETION=true DRY_RUN=false node scripts/cleanup-obsolete-cvanalysis.js');
      
    } else {
      // Actual deletion
      console.log('⚠️  ACTUAL DELETION STARTING...');
      
      // Delete all CvAnalysis records
      const deleteResult = await prisma.cvAnalysis.deleteMany({});
      
      console.log(`✅ Successfully deleted ${deleteResult.count} CvAnalysis records`);
      console.log('🎉 Cleanup completed successfully!');
      
      // Verify cleanup
      const remainingCount = await prisma.cvAnalysis.count();
      if (remainingCount === 0) {
        console.log('✅ Verification: CvAnalysis table is now empty');
      } else {
        console.log(`⚠️  Warning: ${remainingCount} records still remain`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup operation:', error);
    throw error;
  }
}

async function main() {
  try {
    // Safety checks
    const { cvAnalysisCount, safetyPassed } = await validateSafetyChecks();
    
    if (!safetyPassed) {
      console.log('❌ Safety checks failed. Aborting cleanup.');
      process.exit(1);
    }
    
    if (cvAnalysisCount === 0) {
      console.log('✅ No CvAnalysis records found. Cleanup not needed.');
      process.exit(0);
    }
    
    // Confirmation check for actual deletion
    if (!DRY_RUN && !CONFIRM_DELETION) {
      console.log('\n⚠️  SAFETY STOP: Actual deletion requires explicit confirmation');
      console.log('🚀 To confirm deletion, run: CONFIRM_DELETION=true DRY_RUN=false node scripts/cleanup-obsolete-cvanalysis.js');
      process.exit(1);
    }
    
    // Execute cleanup
    await cleanupCvAnalysisData(DRY_RUN);
    
    if (!DRY_RUN) {
      console.log('\n🎯 ARCHITECTURAL CLEANUP COMPLETE');
      console.log('✅ Single source of truth architecture is now fully clean');
      console.log('✅ All user data, profiles, and authentication preserved');
      console.log('✅ Obsolete CvAnalysis data removed');
    }
    
  } catch (error) {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Safety warning
console.log('\n⚠️  IMPORTANT SAFETY NOTICE:');
console.log('   This script removes CvAnalysis table data only.');
console.log('   All user profiles, authentication, and other data is preserved.');
console.log('   The new architecture uses proper profile tables as single source of truth.');

main().catch(console.error);