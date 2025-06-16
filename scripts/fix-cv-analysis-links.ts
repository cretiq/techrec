import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCvAnalysisLinks() {
  console.log('Starting CV-CvAnalysis link fix...');
  
  try {
    // 1. Find all CVs with analysisId
    const cvsWithAnalysisId = await prisma.cV.findMany({
      where: {
        analysisId: { not: null }
      }
    });
    
    console.log(`Found ${cvsWithAnalysisId.length} CVs with analysisId`);
    
    // Check which ones have broken links
    const cvsWithBrokenLinks = [];
    for (const cv of cvsWithAnalysisId) {
      const analysis = await prisma.cvAnalysis.findUnique({
        where: { id: cv.analysisId! }
      });
      
      if (!analysis) {
        cvsWithBrokenLinks.push(cv);
      }
    }
    
    console.log(`Found ${cvsWithBrokenLinks.length} CVs with broken analysis links`);
    
    // 2. For each broken link, try to find the correct CvAnalysis by cvId
    for (const cv of cvsWithBrokenLinks) {
      console.log(`\nProcessing CV ${cv.id} (${cv.originalName})`);
      console.log(`  - Current (broken) analysisId: ${cv.analysisId}`);
      
      // Find CvAnalysis records that reference this CV
      const correctAnalysis = await prisma.cvAnalysis.findFirst({
        where: { cvId: cv.id },
        orderBy: { createdAt: 'desc' }
      });
      
      if (correctAnalysis) {
        console.log(`  - Found correct analysis: ${correctAnalysis.id}`);
        
        // Update the CV with the correct analysisId
        await prisma.cV.update({
          where: { id: cv.id },
          data: { analysisId: correctAnalysis.id }
        });
        
        console.log('  - Updated CV with correct analysisId');
      } else {
        console.log('  - No matching CvAnalysis found by cvId');
        
        // Try to find by matching developer and filename/hash
        const possibleAnalyses = await prisma.cvAnalysis.findMany({
          where: {
            developerId: cv.developerId,
            originalName: cv.originalName
          },
          orderBy: { createdAt: 'desc' }
        });
        
        if (possibleAnalyses.length > 0) {
          console.log(`  - Found ${possibleAnalyses.length} possible analyses by name match`);
          
          // Check if any don't have a cvId (orphaned analyses)
          const orphanedAnalysis = possibleAnalyses.find(a => !a.cvId);
          
          if (orphanedAnalysis) {
            console.log(`  - Found orphaned analysis: ${orphanedAnalysis.id}`);
            
            // Link both ways
            await prisma.$transaction([
              prisma.cV.update({
                where: { id: cv.id },
                data: { analysisId: orphanedAnalysis.id }
              }),
              prisma.cvAnalysis.update({
                where: { id: orphanedAnalysis.id },
                data: { cvId: cv.id }
              })
            ]);
            
            console.log('  - Linked CV and orphaned analysis');
          } else {
            console.log('  - No orphaned analyses found to link');
            
            // Clear the broken analysisId
            await prisma.cV.update({
              where: { id: cv.id },
              data: { analysisId: null }
            });
            
            console.log('  - Cleared broken analysisId');
          }
        } else {
          // No analyses found, clear the broken link
          await prisma.cV.update({
            where: { id: cv.id },
            data: { analysisId: null }
          });
          
          console.log('  - No analyses found, cleared broken analysisId');
        }
      }
    }
    
    // 3. Find orphaned CvAnalysis records (no cvId)
    const orphanedAnalyses = await prisma.cvAnalysis.findMany({
      where: { cvId: null }
    });
    
    console.log(`\nFound ${orphanedAnalyses.length} orphaned CvAnalysis records`);
    
    for (const analysis of orphanedAnalyses) {
      console.log(`\nProcessing orphaned analysis ${analysis.id} (${analysis.originalName})`);
      
      // Try to find matching CV by developer and name
      const matchingCv = await prisma.cV.findFirst({
        where: {
          developerId: analysis.developerId,
          originalName: analysis.originalName,
          analysisId: null // Only match CVs without analysis
        }
      });
      
      if (matchingCv) {
        console.log(`  - Found matching CV: ${matchingCv.id}`);
        
        // Link both ways
        await prisma.$transaction([
          prisma.cV.update({
            where: { id: matchingCv.id },
            data: { analysisId: analysis.id }
          }),
          prisma.cvAnalysis.update({
            where: { id: analysis.id },
            data: { cvId: matchingCv.id }
          })
        ]);
        
        console.log('  - Linked orphaned analysis to CV');
      } else {
        console.log('  - No matching CV found');
      }
    }
    
    // 4. Summary report
    // Re-check broken links
    const finalCvsWithAnalysisId = await prisma.cV.findMany({
      where: {
        analysisId: { not: null }
      }
    });
    
    let finalBrokenCount = 0;
    for (const cv of finalCvsWithAnalysisId) {
      const analysis = await prisma.cvAnalysis.findUnique({
        where: { id: cv.analysisId! }
      });
      
      if (!analysis) {
        finalBrokenCount++;
      }
    }
    
    const finalOrphaned = await prisma.cvAnalysis.count({
      where: { cvId: null }
    });
    
    console.log('\n=== Summary ===');
    console.log(`Remaining CVs with broken links: ${finalBrokenCount}`);
    console.log(`Remaining orphaned analyses: ${finalOrphaned}`);
    
  } catch (error) {
    console.error('Error fixing CV-Analysis links:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixCvAnalysisLinks()
  .then(() => {
    console.log('\nCV-Analysis link fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFailed to fix CV-Analysis links:', error);
    process.exit(1);
  });