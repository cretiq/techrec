#!/usr/bin/env node

/**
 * Database Cleanup Script - Fix Orphaned CV Records
 * 
 * This script addresses the Prisma Studio error:
 * "Inconsistent query result: Field developer is required to return data, got `null` instead."
 * 
 * The issue occurs when CV records exist with developerId values that reference 
 * non-existent Developer records, creating data integrity problems.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Starting Database Cleanup - Orphaned CV Records');
  console.log('=' .repeat(60));

  try {
    // Step 1: Identify orphaned CV records
    console.log('\n📊 Step 1: Identifying orphaned CV records...');
    
    const allCVs = await prisma.cV.findMany({
      select: {
        id: true,
        developerId: true,
        filename: true,
        originalName: true,
        createdAt: true
      }
    });

    console.log(`📈 Total CV records found: ${allCVs.length}`);

    // Find CVs where developer doesn't exist
    const orphanedCVs = [];
    for (const cv of allCVs) {
      try {
        const developer = await prisma.developer.findUnique({
          where: { id: cv.developerId },
          select: { id: true }
        });
        
        if (!developer) {
          orphanedCVs.push(cv);
        }
      } catch (error) {
        console.warn(`⚠️  Error checking developer for CV ${cv.id}: ${error.message}`);
        orphanedCVs.push(cv);
      }
    }

    console.log(`❌ Orphaned CV records found: ${orphanedCVs.length}`);

    if (orphanedCVs.length === 0) {
      console.log('✅ No orphaned CV records found. Database is clean!');
      return;
    }

    // Display orphaned records for review
    console.log('\n📋 Orphaned CV Records Details:');
    orphanedCVs.forEach((cv, index) => {
      console.log(`${index + 1}. CV ID: ${cv.id}`);
      console.log(`   Developer ID: ${cv.developerId}`);
      console.log(`   Filename: ${cv.filename}`);
      console.log(`   Original Name: ${cv.originalName}`);
      console.log(`   Created: ${cv.createdAt}`);
      console.log('');
    });

    // Step 2: Check for related CvAnalysis records
    console.log('\n📊 Step 2: Checking for related orphaned CvAnalysis records...');
    
    const allAnalyses = await prisma.cvAnalysis.findMany({
      select: {
        id: true,
        developerId: true,
        cvId: true,
        originalName: true,
        createdAt: true
      }
    });

    const orphanedAnalyses = [];
    for (const analysis of allAnalyses) {
      try {
        const developer = await prisma.developer.findUnique({
          where: { id: analysis.developerId },
          select: { id: true }
        });
        
        if (!developer) {
          orphanedAnalyses.push(analysis);
        }
      } catch (error) {
        console.warn(`⚠️  Error checking developer for Analysis ${analysis.id}: ${error.message}`);
        orphanedAnalyses.push(analysis);
      }
    }

    console.log(`❌ Orphaned CvAnalysis records found: ${orphanedAnalyses.length}`);

    if (orphanedAnalyses.length > 0) {
      console.log('\n📋 Orphaned CvAnalysis Records Details:');
      orphanedAnalyses.forEach((analysis, index) => {
        console.log(`${index + 1}. Analysis ID: ${analysis.id}`);
        console.log(`   Developer ID: ${analysis.developerId}`);
        console.log(`   CV ID: ${analysis.cvId || 'N/A'}`);
        console.log(`   Original Name: ${analysis.originalName}`);
        console.log(`   Created: ${analysis.createdAt}`);
        console.log('');
      });
    }

    // Step 3: Confirm deletion
    console.log('\n🚨 CLEANUP CONFIRMATION');
    console.log('=' .repeat(40));
    console.log(`CV records to delete: ${orphanedCVs.length}`);
    console.log(`CvAnalysis records to delete: ${orphanedAnalyses.length}`);
    console.log('\n⚠️  This operation will permanently delete orphaned records.');
    console.log('💡 Make sure you have a database backup if needed.');

    // For safety, require environment variable to proceed
    const confirmDelete = process.env.CONFIRM_DELETE === 'true';
    
    if (!confirmDelete) {
      console.log('\n❌ Cleanup NOT executed.');
      console.log('💡 To proceed with deletion, run:');
      console.log('   CONFIRM_DELETE=true node scripts/cleanup-orphaned-cv-records.js');
      return;
    }

    // Step 4: Execute cleanup
    console.log('\n🧹 Step 4: Executing cleanup...');

    let deletedCVs = 0;
    let deletedAnalyses = 0;

    // Delete orphaned CV records
    if (orphanedCVs.length > 0) {
      console.log('🗑️  Deleting orphaned CV records...');
      const cvIds = orphanedCVs.map(cv => cv.id);
      
      const cvDeleteResult = await prisma.cV.deleteMany({
        where: {
          id: { in: cvIds }
        }
      });
      
      deletedCVs = cvDeleteResult.count;
      console.log(`✅ Deleted ${deletedCVs} orphaned CV records`);
    }

    // Delete orphaned CvAnalysis records
    if (orphanedAnalyses.length > 0) {
      console.log('🗑️  Deleting orphaned CvAnalysis records...');
      const analysisIds = orphanedAnalyses.map(analysis => analysis.id);
      
      const analysisDeleteResult = await prisma.cvAnalysis.deleteMany({
        where: {
          id: { in: analysisIds }
        }
      });
      
      deletedAnalyses = analysisDeleteResult.count;
      console.log(`✅ Deleted ${deletedAnalyses} orphaned CvAnalysis records`);
    }

    // Step 5: Verification
    console.log('\n🔍 Step 5: Verifying cleanup...');
    
    // Check if any orphaned records remain by re-running our identification logic
    const allCVsAfter = await prisma.cV.findMany({
      select: {
        id: true,
        developerId: true
      }
    });

    const remainingOrphanedCVs = [];
    for (const cv of allCVsAfter) {
      try {
        const developer = await prisma.developer.findUnique({
          where: { id: cv.developerId },
          select: { id: true }
        });
        
        if (!developer) {
          remainingOrphanedCVs.push(cv);
        }
      } catch (error) {
        remainingOrphanedCVs.push(cv);
      }
    }

    const allAnalysesAfter = await prisma.cvAnalysis.findMany({
      select: {
        id: true,
        developerId: true
      }
    });

    const remainingOrphanedAnalyses = [];
    for (const analysis of allAnalysesAfter) {
      try {
        const developer = await prisma.developer.findUnique({
          where: { id: analysis.developerId },
          select: { id: true }
        });
        
        if (!developer) {
          remainingOrphanedAnalyses.push(analysis);
        }
      } catch (error) {
        remainingOrphanedAnalyses.push(analysis);
      }
    }

    console.log(`📊 Remaining orphaned CV records: ${remainingOrphanedCVs.length}`);
    console.log(`📊 Remaining orphaned CvAnalysis records: ${remainingOrphanedAnalyses.length}`);

    // Final summary
    console.log('\n🎉 CLEANUP COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(50));
    console.log(`✅ CV records deleted: ${deletedCVs}`);
    console.log(`✅ CvAnalysis records deleted: ${deletedAnalyses}`);
    console.log(`📊 Remaining orphaned CV records: ${remainingOrphanedCVs.length}`);
    console.log(`📊 Remaining orphaned CvAnalysis records: ${remainingOrphanedAnalyses.length}`);
    
    if (remainingOrphanedCVs.length === 0 && remainingOrphanedAnalyses.length === 0) {
      console.log('\n🔥 Database integrity restored! Prisma Studio should work correctly now.');
    } else {
      console.log('\n⚠️  Some orphaned records remain. Please investigate further.');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
main()
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });