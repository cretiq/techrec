#!/usr/bin/env tsx

/**
 * Script to Link Orphaned CV Records to a Specific Developer
 * 
 * This script fixes the Prisma Studio error:
 * "Inconsistent query result: Field developer is required to return data, got `null` instead."
 * 
 * Instead of deleting orphaned CV records, this script links them to a specific developer.
 */

import { PrismaClient, SortOrder } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetEmail = 'fm@gmail.com';
  
  console.log('🔗 Starting CV Record Linking Process');
  console.log('=' .repeat(60));
  console.log(`Target developer email: ${targetEmail}`);

  try {
    // Step 1: Find the target developer
    console.log('\n📊 Step 1: Finding target developer...');
    
    const targetDeveloper = await prisma.developer.findUnique({
      where: { email: targetEmail },
      select: {
        id: true,
        email: true,
        name: true,
        cvs: {
          select: {
            id: true
          }
        }
      }
    });

    if (!targetDeveloper) {
      console.error(`❌ Developer with email ${targetEmail} not found!`);
      console.log('💡 Please make sure the developer exists before running this script.');
      return;
    }

    console.log(`✅ Found developer: ${targetDeveloper.name} (${targetDeveloper.email})`);
    console.log(`   ID: ${targetDeveloper.id}`);
    console.log(`   Current CVs: ${targetDeveloper.cvs.length}`);

    // Step 2: Identify orphaned CV records
    console.log('\n📊 Step 2: Identifying orphaned CV records...');
    
    const allCVs = await prisma.cV.findMany({
      select: {
        id: true,
        developerId: true,
        filename: true,
        originalName: true,
        uploadDate: true,
        status: true,
        size: true
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
        // If there's an error finding the developer, it's likely orphaned
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
      console.log(`   Current Developer ID: ${cv.developerId}`);
      console.log(`   Filename: ${cv.filename}`);
      console.log(`   Original Name: ${cv.originalName}`);
      console.log(`   Upload Date: ${cv.uploadDate}`);
      console.log(`   Status: ${cv.status}`);
      console.log(`   Size: ${(cv.size / 1024).toFixed(2)} KB`);
      console.log('');
    });

    // Step 3: Confirm linking
    console.log('\n🔗 LINKING CONFIRMATION');
    console.log('=' .repeat(40));
    console.log(`CV records to link: ${orphanedCVs.length}`);
    console.log(`Target developer: ${targetDeveloper.name} (${targetDeveloper.email})`);
    console.log('\n⚠️  This operation will update all orphaned CV records.');
    console.log(`📌 They will be linked to developer ID: ${targetDeveloper.id}`);

    // For safety, require environment variable to proceed
    const confirmLink = process.env.CONFIRM_LINK === 'true';
    
    if (!confirmLink) {
      console.log('\n❌ Linking NOT executed.');
      console.log('💡 To proceed with linking, run:');
      console.log('   CONFIRM_LINK=true tsx scripts/link-orphaned-cvs-to-developer.ts');
      return;
    }

    // Step 4: Execute linking
    console.log('\n🔗 Step 4: Linking orphaned CVs to developer...');

    let linkedCount = 0;
    const linkingResults = [];

    for (const cv of orphanedCVs) {
      try {
        const updated = await prisma.cV.update({
          where: { id: cv.id },
          data: { developerId: targetDeveloper.id },
          select: {
            id: true,
            developerId: true,
            originalName: true
          }
        });
        
        linkedCount++;
        linkingResults.push({
          success: true,
          cvId: cv.id,
          originalName: cv.originalName,
          newDeveloperId: updated.developerId
        });
        
        console.log(`✅ Linked CV "${cv.originalName}" to ${targetDeveloper.email}`);
      } catch (error) {
        linkingResults.push({
          success: false,
          cvId: cv.id,
          originalName: cv.originalName,
          error: error.message
        });
        console.error(`❌ Failed to link CV ${cv.id}: ${error.message}`);
      }
    }

    // Step 5: Verification
    console.log('\n🔍 Step 5: Verifying linking results...');
    
    // Check the developer's CVs after linking
    const updatedDeveloper = await prisma.developer.findUnique({
      where: { id: targetDeveloper.id },
      select: {
        cvs: {
          select: {
            id: true,
            originalName: true,
            uploadDate: true
          },
          orderBy: {
            uploadDate: SortOrder.desc
          }
        }
      }
    });

    console.log(`\n📊 Developer now has ${updatedDeveloper.cvs.length} CVs (was ${targetDeveloper.cvs.length})`);
    
    // Check if any orphaned records remain
    const remainingOrphaned = [];
    const allCVsAfter = await prisma.cV.findMany({
      select: {
        id: true,
        developerId: true
      }
    });

    for (const cv of allCVsAfter) {
      try {
        const developer = await prisma.developer.findUnique({
          where: { id: cv.developerId },
          select: { id: true }
        });
        
        if (!developer) {
          remainingOrphaned.push(cv);
        }
      } catch (error) {
        remainingOrphaned.push(cv);
      }
    }

    // Final summary
    console.log('\n🎉 LINKING PROCESS COMPLETED!');
    console.log('=' .repeat(50));
    console.log(`✅ CV records successfully linked: ${linkedCount}`);
    console.log(`❌ CV records failed to link: ${orphanedCVs.length - linkedCount}`);
    console.log(`📊 Remaining orphaned CV records: ${remainingOrphaned.length}`);
    console.log(`📁 Total CVs for ${targetDeveloper.email}: ${updatedDeveloper.cvs.length}`);
    
    if (remainingOrphaned.length === 0) {
      console.log('\n🔥 All orphaned records fixed! Prisma Studio should work correctly now.');
    } else {
      console.log('\n⚠️  Some orphaned records remain. Please investigate further.');
    }

    // Show linking report
    if (linkingResults.some(r => !r.success)) {
      console.log('\n❌ Failed linking attempts:');
      linkingResults
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   - CV ${r.cvId} (${r.originalName}): ${r.error}`);
        });
    }

  } catch (error) {
    console.error('❌ Error during linking process:', error);
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