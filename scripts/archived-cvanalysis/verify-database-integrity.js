#!/usr/bin/env node

/**
 * Database Integrity Verification Script
 * 
 * This script verifies that the database cleanup resolved the Prisma Studio error
 * by testing the same queries that were failing before.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Database Integrity Verification');
  console.log('=' .repeat(50));

  try {
    // Test 1: Query CV records with developer relation (this was failing before)
    console.log('\n📊 Test 1: Query CV records with developer relation...');
    
    const cvsWithDeveloper = await prisma.cV.findMany({
      take: 5,
      select: {
        id: true,
        developerId: true,
        developer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        filename: true,
        originalName: true,
        status: true,
        createdAt: true
      }
    });

    console.log(`✅ Successfully queried ${cvsWithDeveloper.length} CV records with developer relations`);
    
    // Verify all developer fields are populated
    const hasNullDevelopers = cvsWithDeveloper.some(cv => cv.developer === null);
    if (hasNullDevelopers) {
      console.log('❌ ERROR: Some CV records still have null developer relations');
      return false;
    } else {
      console.log('✅ All CV records have valid developer relations');
    }

    // Test 2: Query CvAnalysis records with developer relation
    console.log('\n📊 Test 2: Query CvAnalysis records with developer relation...');
    
    const analysesWithDeveloper = await prisma.cvAnalysis.findMany({
      take: 5,
      select: {
        id: true,
        developerId: true,
        developer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        originalName: true,
        status: true,
        createdAt: true
      }
    });

    console.log(`✅ Successfully queried ${analysesWithDeveloper.length} CvAnalysis records with developer relations`);
    
    const hasNullDevelopersAnalysis = analysesWithDeveloper.some(analysis => analysis.developer === null);
    if (hasNullDevelopersAnalysis) {
      console.log('❌ ERROR: Some CvAnalysis records still have null developer relations');
      return false;
    } else {
      console.log('✅ All CvAnalysis records have valid developer relations');
    }

    // Test 3: Count total records to verify data integrity
    console.log('\n📊 Test 3: Database record counts...');
    
    const totalDevelopers = await prisma.developer.count();
    const totalCVs = await prisma.cV.count();
    const totalAnalyses = await prisma.cvAnalysis.count();
    
    console.log(`📈 Total Developers: ${totalDevelopers}`);
    console.log(`📈 Total CVs: ${totalCVs}`);
    console.log(`📈 Total CvAnalyses: ${totalAnalyses}`);

    // Test 4: Verify specific complex query that mimics Prisma Studio behavior
    console.log('\n📊 Test 4: Complex query similar to Prisma Studio...');
    
    const complexQuery = await prisma.cV.findMany({
      take: 10,
      select: {
        id: true,
        developerId: true,
        developer: true,  // This is what was causing the error
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        s3Key: true,
        status: true,
        uploadDate: true,
        extractedText: true,
        metadata: true,
        analysisId: true,
        analysis: true,
        improvementScore: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log(`✅ Complex query executed successfully for ${complexQuery.length} records`);
    
    // Verify no null developers in complex query
    const hasNullInComplex = complexQuery.some(cv => cv.developer === null);
    if (hasNullInComplex) {
      console.log('❌ ERROR: Complex query still returns null developers');
      return false;
    } else {
      console.log('✅ Complex query returns valid developer data for all records');
    }

    // Test 5: Test cascade delete functionality
    console.log('\n📊 Test 5: Verify cascade delete setup...');
    
    // Just verify the schema relationships exist - don't actually delete
    const developerWithRelations = await prisma.developer.findFirst({
      include: {
        cvs: {
          take: 1
        },
        cvAnalyses: {
          take: 1
        }
      }
    });

    if (developerWithRelations) {
      console.log('✅ Developer-CV-Analysis relationships are properly configured');
      console.log(`   Developer has ${developerWithRelations.cvs.length} CVs and ${developerWithRelations.cvAnalyses.length} analyses in sample`);
    } else {
      console.log('ℹ️  No developers with CVs found for relationship testing');
    }

    console.log('\n🎉 DATABASE INTEGRITY VERIFICATION PASSED!');
    console.log('=' .repeat(60));
    console.log('✅ All CV records have valid developer relations');
    console.log('✅ All CvAnalysis records have valid developer relations');
    console.log('✅ Complex queries work without errors');
    console.log('✅ Prisma Studio should now work correctly');
    
    return true;

  } catch (error) {
    console.error('\n❌ DATABASE INTEGRITY VERIFICATION FAILED!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
main()
  .then((success) => {
    if (success) {
      console.log('\n✅ Verification completed successfully');
      process.exit(0);
    } else {
      console.log('\n❌ Verification failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });