import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseId(id: string) {
  console.log(`\nDiagnosing ID: ${id}`);
  console.log('='.repeat(50));
  
  try {
    // Check if it's a CV ID
    const cv = await prisma.cV.findUnique({
      where: { id }
    });
    
    if (cv) {
      console.log('\n✓ Found as CV record:');
      console.log(`  - CV ID: ${cv.id}`);
      console.log(`  - Original Name: ${cv.originalName}`);
      console.log(`  - Status: ${cv.status}`);
      console.log(`  - Analysis ID: ${cv.analysisId || 'None'}`);
      console.log(`  - Developer ID: ${cv.developerId}`);
      
      if (cv.analysisId) {
        const linkedAnalysis = await prisma.cvAnalysis.findUnique({
          where: { id: cv.analysisId }
        });
        
        if (linkedAnalysis) {
          console.log('\n  Linked CvAnalysis:');
          console.log(`    - Analysis ID: ${linkedAnalysis.id}`);
          console.log(`    - Status: ${linkedAnalysis.status}`);
          console.log(`    - CV ID back-reference: ${linkedAnalysis.cvId}`);
          console.log(`    - Created: ${linkedAnalysis.createdAt}`);
        }
      }
    }
    
    // Check if it's a CvAnalysis ID
    const analysis = await prisma.cvAnalysis.findUnique({
      where: { id }
    });
    
    if (analysis) {
      console.log('\n✓ Found as CvAnalysis record:');
      console.log(`  - Analysis ID: ${analysis.id}`);
      console.log(`  - Original Name: ${analysis.originalName}`);
      console.log(`  - Status: ${analysis.status}`);
      console.log(`  - CV ID: ${analysis.cvId || 'None'}`);
      console.log(`  - Developer ID: ${analysis.developerId}`);
      console.log(`  - Created: ${analysis.createdAt}`);
      
      if (analysis.cvId) {
        const linkedCv = await prisma.cV.findUnique({
          where: { id: analysis.cvId }
        });
        
        if (linkedCv) {
          console.log('\n  Linked CV:');
          console.log(`    - CV ID: ${linkedCv.id}`);
          console.log(`    - Status: ${linkedCv.status}`);
          console.log(`    - Analysis ID back-reference: ${linkedCv.analysisId}`);
        }
      }
    }
    
    if (!cv && !analysis) {
      console.log('\n✗ ID not found as either CV or CvAnalysis');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

async function main() {
  console.log('CV-Analysis ID Diagnostic Tool');
  
  // IDs from the logs
  const idsToCheck = [
    '681c8741a6c21e37e94a7983', // ID from URL
    '6849365c36b815afae2ee18d', // Analysis ID from API response
    '681c872da6c21e37e94a7981', // CV ID from API response
  ];
  
  for (const id of idsToCheck) {
    await diagnoseId(id);
  }
  
  // Also check for any CVs with the problematic analysis ID
  console.log('\n\nChecking for CVs with analysis ID: 681c8741a6c21e37e94a7983');
  const cvsWithProblematicId = await prisma.cV.findMany({
    where: { analysisId: '681c8741a6c21e37e94a7983' }
  });
  
  console.log(`Found ${cvsWithProblematicId.length} CVs with this analysis ID`);
  for (const cv of cvsWithProblematicId) {
    console.log(`  - CV ${cv.id}: ${cv.originalName}`);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);