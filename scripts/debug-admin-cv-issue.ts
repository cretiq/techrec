import { PrismaClient, SortOrder } from '@prisma/client';

const prisma = new PrismaClient();

async function debugAdminCvIssue() {
  try {
    console.log('🔍 Debugging Admin CV Management Issue');
    console.log('=====================================');

    const targetEmail = 'filip_mellqvist@msn.com';
    console.log(`\n📧 Looking for user: ${targetEmail}`);

    // 1. Check if developer exists
    const developer = await prisma.developer.findUnique({
      where: { email: targetEmail },
      select: {
        id: true,
        email: true,
        name: true,
        totalXP: true,
        currentLevel: true,
        subscriptionTier: true,
      }
    });

    if (!developer) {
      console.log('❌ Developer not found in database');
      return;
    }

    console.log('✅ Developer found:', {
      id: developer.id,
      email: developer.email,
      name: developer.name,
      totalXP: developer.totalXP,
      currentLevel: developer.currentLevel,
      subscriptionTier: developer.subscriptionTier,
    });

    // 2. Check CVs directly from CV table
    console.log('\n📄 Checking CVs directly from CV table...');
    const cvsDirectly = await prisma.cV.findMany({
      where: { developerId: developer.id },
      select: {
        id: true,
        filename: true,
        originalName: true,
        size: true,
        status: true,
        uploadDate: true,
        mimeType: true,
        s3Key: true,
        developerId: true,
      }
    });

    console.log(`Found ${cvsDirectly.length} CVs directly:`);
    cvsDirectly.forEach((cv, index) => {
      console.log(`  CV ${index + 1}:`, {
        id: cv.id,
        filename: cv.filename,
        originalName: cv.originalName,
        size: cv.size,
        status: cv.status,
        uploadDate: cv.uploadDate,
        mimeType: cv.mimeType,
        s3Key: cv.s3Key,
        developerId: cv.developerId,
      });
    });

    // 3. Check developer with CV relation
    console.log('\n🔗 Checking developer with CV relation...');
    const developerWithCvs = await prisma.developer.findUnique({
      where: { email: targetEmail },
      include: {
        cvs: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            size: true,
            status: true,
            uploadDate: true,
            mimeType: true,
          }
        }
      }
    });

    if (developerWithCvs) {
      console.log(`Developer has ${developerWithCvs.cvs.length} CVs via relation:`);
      developerWithCvs.cvs.forEach((cv, index) => {
        console.log(`  CV ${index + 1}:`, {
          id: cv.id,
          filename: cv.filename,
          originalName: cv.originalName,
          size: cv.size,
          status: cv.status,
          uploadDate: cv.uploadDate,
          mimeType: cv.mimeType,
        });
      });
    }

    // 4. Test the exact same query as admin API
    console.log('\n🔍 Testing exact same query as admin API...');
    const adminApiQuery = await prisma.developer.findUnique({
      where: { email: targetEmail },
      include: {
        userBadges: {
          include: {
            badge: {
              select: {
                id: true,
                name: true,
                icon: true,
                category: true,
                tier: true,
                description: true,
              }
            }
          },
          orderBy: { earnedAt: 'desc' }
        },
        pointsTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            amount: true,
            source: true,
            description: true,
            createdAt: true,
          }
        },
        cvs: {
          orderBy: { uploadDate: SortOrder.desc },
          select: {
            id: true,
            filename: true,
            originalName: true,
            size: true,
            uploadDate: true,
            status: true,
            mimeType: true,
          }
        }
      }
    });

    if (adminApiQuery) {
      console.log('Admin API query result:');
      console.log(`- User badges: ${adminApiQuery.userBadges.length}`);
      console.log(`- Points transactions: ${adminApiQuery.pointsTransactions.length}`);
      console.log(`- CVs: ${adminApiQuery.cvs.length}`);
      
      if (adminApiQuery.cvs.length > 0) {
        console.log('CV details from admin query:');
        adminApiQuery.cvs.forEach((cv, index) => {
          console.log(`  CV ${index + 1}:`, cv);
        });
      }
    }

    // 5. Check for any orphaned CVs or data integrity issues
    console.log('\n🔍 Checking for data integrity issues...');
    
    // Check if there are CVs with mismatched developer IDs
    const allCvs = await prisma.cV.findMany({
      select: {
        id: true,
        developerId: true,
        filename: true,
        originalName: true,
      }
    });
    
    console.log(`\nTotal CVs in database: ${allCvs.length}`);
    
    // Check if any CVs have the developer ID but aren't showing up
    const cvsForThisDeveloper = allCvs.filter(cv => cv.developerId === developer.id);
    console.log(`CVs with matching developer ID: ${cvsForThisDeveloper.length}`);
    
    if (cvsForThisDeveloper.length > 0) {
      console.log('Matching CVs:');
      cvsForThisDeveloper.forEach((cv, index) => {
        console.log(`  CV ${index + 1}:`, cv);
      });
    }

    // 6. Check developer skills and experience
    console.log('\n👨‍💻 Checking related data (skills, experience)...');
    const developerSkills = await prisma.developerSkill.findMany({
      where: { developerId: developer.id },
      take: 5,
    });
    
    const developerExperience = await prisma.experience.findMany({
      where: { developerId: developer.id },
      take: 5,
    });

    console.log(`- Developer skills: ${developerSkills.length}`);
    console.log(`- Developer experience: ${developerExperience.length}`);

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugAdminCvIssue();