import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateAnalyses() {
  console.log('Fixing duplicate analyses...\n');
  
  try {
    // Find all CVs that have multiple analyses pointing to them
    const allAnalyses = await prisma.cvAnalysis.findMany({
      where: { cvId: { not: null } },
      orderBy: { createdAt: 'desc' }
    });
    
    // Group analyses by cvId
    const analysesByCvId = new Map<string, typeof allAnalyses>();
    
    for (const analysis of allAnalyses) {
      if (!analysis.cvId) continue;
      
      if (!analysesByCvId.has(analysis.cvId)) {
        analysesByCvId.set(analysis.cvId, []);
      }
      analysesByCvId.get(analysis.cvId)!.push(analysis);
    }
    
    // Find CVs with multiple analyses
    const cvsWithMultipleAnalyses = Array.from(analysesByCvId.entries())
      .filter(([_, analyses]) => analyses.length > 1);
    
    console.log(`Found ${cvsWithMultipleAnalyses.length} CVs with multiple analyses\n`);
    
    for (const [cvId, analyses] of cvsWithMultipleAnalyses) {
      const cv = await prisma.cV.findUnique({
        where: { id: cvId }
      });
      
      if (!cv) {
        console.log(`CV ${cvId} not found, skipping...`);
        continue;
      }
      
      console.log(`CV: ${cv.originalName} (${cvId})`);
      console.log(`  Current analysisId: ${cv.analysisId}`);
      console.log(`  Found ${analyses.length} analyses:`);
      
      // Sort by creation date (newest first)
      analyses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      for (const analysis of analyses) {
        const isCurrent = analysis.id === cv.analysisId;
        console.log(`    - ${analysis.id} (${analysis.createdAt.toISOString()}) ${isCurrent ? '← CURRENT' : ''}`);
      }
      
      // The newest analysis should be the one we want to use
      const newestAnalysis = analyses[0];
      
      if (cv.analysisId !== newestAnalysis.id) {
        console.log(`  Updating CV to use newest analysis: ${newestAnalysis.id}`);
        
        await prisma.cV.update({
          where: { id: cvId },
          data: { analysisId: newestAnalysis.id }
        });
        
        console.log('  ✓ Updated\n');
      } else {
        console.log('  ✓ Already using newest analysis\n');
      }
    }
    
    // Also find analyses without CVs (orphaned)
    const orphanedAnalyses = await prisma.cvAnalysis.findMany({
      where: { cvId: null }
    });
    
    console.log(`\nFound ${orphanedAnalyses.length} orphaned analyses (no CV reference)`);
    
    if (orphanedAnalyses.length > 0) {
      console.log('\nOrphaned analyses:');
      for (const analysis of orphanedAnalyses) {
        console.log(`  - ${analysis.id}: ${analysis.originalName} (${analysis.createdAt.toISOString()})`);
        
        // Try to find a matching CV by developer and name
        const matchingCv = await prisma.cV.findFirst({
          where: {
            developerId: analysis.developerId,
            originalName: analysis.originalName
          }
        });
        
        if (matchingCv) {
          console.log(`    Found matching CV: ${matchingCv.id}`);
          
          // Check if this CV already has a newer analysis
          const cvCurrentAnalysis = matchingCv.analysisId ? 
            await prisma.cvAnalysis.findUnique({ where: { id: matchingCv.analysisId } }) : 
            null;
          
          if (!cvCurrentAnalysis || cvCurrentAnalysis.createdAt < analysis.createdAt) {
            console.log('    Linking orphaned analysis to CV...');
            
            await prisma.$transaction([
              prisma.cvAnalysis.update({
                where: { id: analysis.id },
                data: { cvId: matchingCv.id }
              }),
              prisma.cV.update({
                where: { id: matchingCv.id },
                data: { analysisId: analysis.id }
              })
            ]);
            
            console.log('    ✓ Linked');
          } else {
            console.log('    CV already has a newer analysis, skipping');
          }
        } else {
          console.log('    No matching CV found');
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateAnalyses()
  .then(() => console.log('\nDuplicate analysis fix completed'))
  .catch(error => {
    console.error('\nFailed:', error);
    process.exit(1);
  });