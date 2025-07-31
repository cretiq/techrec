import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugSessionMismatch() {
  try {
    console.log('🔍 Debugging Session/Email Mismatch');
    console.log('===================================');

    // Check both users involved
    const targetEmails = ['filip_mellqvist@msn.com', 'filipmellqvist255@gmail.com'];
    
    for (const email of targetEmails) {
      console.log(`\n📧 Analyzing user: ${email}`);
      
      const developer = await prisma.developer.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          profileEmail: true,
          name: true,
          totalXP: true,
          subscriptionTier: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      if (developer) {
        console.log(`✅ Found developer:`, {
          id: developer.id,
          email: developer.email,
          profileEmail: developer.profileEmail,
          name: developer.name,
          totalXP: developer.totalXP,
          subscriptionTier: developer.subscriptionTier,
          createdAt: developer.createdAt,
          updatedAt: developer.updatedAt,
        });

        // Check CVs for this developer
        const cvs = await prisma.cV.findMany({
          where: { developerId: developer.id },
          select: {
            id: true,
            filename: true,
            originalName: true,
            size: true,
            uploadDate: true,
            status: true,
          }
        });

        console.log(`📄 CVs for ${email}: ${cvs.length}`);
        cvs.forEach((cv, index) => {
          console.log(`  CV ${index + 1}:`, {
            id: cv.id,
            filename: cv.filename,
            originalName: cv.originalName,
            size: cv.size,
            uploadDate: cv.uploadDate,
            status: cv.status,
          });
        });

        // Check developer skills (indicator of profile data)
        const skillsCount = await prisma.developerSkill.count({
          where: { developerId: developer.id }
        });

        // Check experience (indicator of profile data)
        const experienceCount = await prisma.experience.count({
          where: { developerId: developer.id }
        });

        console.log(`👨‍💻 Profile data for ${email}:`);
        console.log(`  - Skills: ${skillsCount}`);
        console.log(`  - Experience entries: ${experienceCount}`);

      } else {
        console.log(`❌ Developer not found: ${email}`);
      }
    }

    // Check for any inconsistencies in email/profileEmail fields
    console.log('\n🔍 Checking for email/profileEmail inconsistencies...');
    const developersWithMismatch = await prisma.developer.findMany({
      where: {
        NOT: {
          email: { equals: prisma.developer.fields.profileEmail }
        }
      },
      select: {
        id: true,
        email: true,
        profileEmail: true,
        name: true,
      }
    });

    if (developersWithMismatch.length > 0) {
      console.log(`⚠️ Found ${developersWithMismatch.length} developers with email/profileEmail mismatches:`);
      developersWithMismatch.forEach((dev, index) => {
        console.log(`  ${index + 1}. ${dev.name}:`);
        console.log(`     email: ${dev.email}`);
        console.log(`     profileEmail: ${dev.profileEmail}`);
      });
    } else {
      console.log('✅ No email/profileEmail mismatches found');
    }

    // Check for duplicate emails in different fields
    console.log('\n🔍 Checking for cross-field email duplicates...');
    const allDevelopers = await prisma.developer.findMany({
      select: {
        id: true,
        email: true,
        profileEmail: true,
        name: true,
      }
    });

    const emailToDevs = new Map<string, any[]>();
    const profileEmailToDevs = new Map<string, any[]>();

    allDevelopers.forEach(dev => {
      // Group by email
      if (!emailToDevs.has(dev.email)) {
        emailToDevs.set(dev.email, []);
      }
      emailToDevs.get(dev.email)!.push(dev);

      // Group by profileEmail
      if (dev.profileEmail) {
        if (!profileEmailToDevs.has(dev.profileEmail)) {
          profileEmailToDevs.set(dev.profileEmail, []);
        }
        profileEmailToDevs.get(dev.profileEmail)!.push(dev);
      }
    });

    // Check for cross-field matches (email in one account = profileEmail in another)
    const problemEmails = new Set<string>();
    
    emailToDevs.forEach((devs, email) => {
      if (profileEmailToDevs.has(email)) {
        const profileEmailDevs = profileEmailToDevs.get(email)!;
        const emailDevs = devs;
        
        // Check if they're different developers
        const emailDevIds = new Set(emailDevs.map(d => d.id));
        const profileEmailDevIds = new Set(profileEmailDevs.map(d => d.id));
        
        const intersection = new Set([...emailDevIds].filter(x => profileEmailDevIds.has(x)));
        
        if (intersection.size !== emailDevIds.size || intersection.size !== profileEmailDevIds.size) {
          problemEmails.add(email);
        }
      }
    });

    if (problemEmails.size > 0) {
      console.log(`🚨 Found cross-field email conflicts:`);
      problemEmails.forEach(email => {
        console.log(`\n  Email conflict: ${email}`);
        const emailDevs = emailToDevs.get(email) || [];
        const profileEmailDevs = profileEmailToDevs.get(email) || [];
        
        console.log(`    Developers with email="${email}":`);
        emailDevs.forEach(dev => {
          console.log(`      - ${dev.name} (ID: ${dev.id}, profileEmail: ${dev.profileEmail})`);
        });
        
        console.log(`    Developers with profileEmail="${email}":`);
        profileEmailDevs.forEach(dev => {
          console.log(`      - ${dev.name} (ID: ${dev.id}, email: ${dev.email})`);
        });
      });
    } else {
      console.log('✅ No cross-field email conflicts found');
    }

    // Final summary
    console.log('\n📊 SUMMARY');
    console.log('==========');
    
    const filipMsn = await prisma.developer.findUnique({
      where: { email: 'filip_mellqvist@msn.com' },
      include: { cvs: true, developerSkills: true, experience: true }
    });
    
    const filipGmail = await prisma.developer.findUnique({
      where: { email: 'filipmellqvist255@gmail.com' },
      include: { cvs: true, developerSkills: true, experience: true }
    });

    console.log(`filip_mellqvist@msn.com:`);
    console.log(`  - CVs: ${filipMsn?.cvs.length || 0}`);
    console.log(`  - Skills: ${filipMsn?.developerSkills.length || 0}`);
    console.log(`  - Experience: ${filipMsn?.experience.length || 0}`);
    console.log(`  - ProfileEmail: ${filipMsn?.profileEmail || 'null'}`);

    console.log(`filipmellqvist255@gmail.com:`);
    console.log(`  - CVs: ${filipGmail?.cvs.length || 0}`);
    console.log(`  - Skills: ${filipGmail?.developerSkills.length || 0}`);
    console.log(`  - Experience: ${filipGmail?.experience.length || 0}`);
    console.log(`  - ProfileEmail: ${filipGmail?.profileEmail || 'null'}`);

  } catch (error) {
    console.error('❌ Error during session debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSessionMismatch();