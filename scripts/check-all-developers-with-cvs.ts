import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllDevelopersWithCvs() {
  try {
    console.log('🔍 Checking All Developers with CVs');
    console.log('===================================');

    // Get all developers with their CVs
    const developersWithCvs = await prisma.developer.findMany({
      include: {
        cvs: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            uploadDate: true,
            status: true,
          }
        }
      },
      where: {
        cvs: {
          some: {} // Only developers who have at least one CV
        }
      }
    });

    console.log(`\nFound ${developersWithCvs.length} developers with CVs:`);
    
    developersWithCvs.forEach((dev, index) => {
      console.log(`\n${index + 1}. Developer: ${dev.name} (${dev.email})`);
      console.log(`   ID: ${dev.id}`);
      console.log(`   CVs: ${dev.cvs.length}`);
      dev.cvs.forEach((cv, cvIndex) => {
        console.log(`     CV ${cvIndex + 1}: ${cv.originalName} (${cv.status}) - ${cv.uploadDate}`);
      });
    });

    // Also check for developers with similar email patterns
    console.log('\n🔍 Checking for developers with similar email patterns...');
    const similarEmails = await prisma.developer.findMany({
      where: {
        email: {
          contains: 'filip'
        }
      },
      include: {
        cvs: true
      }
    });

    console.log(`\nFound ${similarEmails.length} developers with 'filip' in email:`);
    similarEmails.forEach((dev, index) => {
      console.log(`${index + 1}. ${dev.name} (${dev.email}) - ${dev.cvs.length} CVs`);
    });

    // Check for any CVs that might be orphaned or have issues
    console.log('\n🔍 Checking all CVs for potential issues...');
    const allCvs = await prisma.cV.findMany({
      include: {
        developer: {
          select: {
            email: true,
            name: true,
          }
        }
      },
      orderBy: {
        uploadDate: 'desc'
      },
      take: 10 // Last 10 CVs
    });

    console.log(`\nLast 10 CVs in database:`);
    allCvs.forEach((cv, index) => {
      console.log(`${index + 1}. ${cv.originalName} by ${cv.developer.name} (${cv.developer.email})`);
      console.log(`   Status: ${cv.status}, Uploaded: ${cv.uploadDate}`);
      console.log(`   Developer ID: ${cv.developerId}`);
    });

  } catch (error) {
    console.error('❌ Error during check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllDevelopersWithCvs();