import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Complete validation test for user deletion
 * This script tests the full flow:
 * 1. Creates a comprehensive test user
 * 2. Shows the data before deletion
 * 3. Shows instructions for manual deletion via API or admin
 * 4. Provides validation for checking afterwards
 */

async function createComprehensiveTestUser(email: string) {
  console.log(`🧪 Creating comprehensive test user: ${email}`);
  
  try {
    // Delete existing user first if they exist
    const existingUser = await prisma.developer.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log(`⚠️  User ${email} already exists with ID: ${existingUser.id}`);
      console.log(`   Use the admin dashboard or API to delete first, then re-run this script`);
      return existingUser.id;
    }

    // Create the developer
    const developer = await prisma.developer.create({
      data: {
        email,
        name: 'Test Deletion User',
        title: 'Test Software Engineer',
        profileEmail: email,
        totalXP: 2500,
        currentLevel: 5,
        monthlyPoints: 100,
        pointsUsed: 30,
        pointsEarned: 25,
        subscriptionTier: 'FREE',
        streak: 7,
        lastActivityDate: new Date()
      }
    });

    console.log(`✅ Created developer: ${developer.name} (ID: ${developer.id})`);

    // Create contact info
    await prisma.contactInfo.create({
      data: {
        developerId: developer.id,
        phone: '+1-555-123-4567',
        address: '123 Test Deletion Street',
        city: 'Validation City',
        country: 'Test Country',
        linkedin: 'https://linkedin.com/in/testdeletion',
        github: 'https://github.com/testdeletion',
        website: 'https://testdeletion.dev'
      }
    });

    // Create multiple skills with proper relationships
    const skillsData = [
      { name: 'JavaScript', category: 'Programming', level: 'EXPERT' },
      { name: 'TypeScript', category: 'Programming', level: 'ADVANCED' },
      { name: 'React', category: 'Frontend', level: 'ADVANCED' },
      { name: 'Node.js', category: 'Backend', level: 'INTERMEDIATE' },
      { name: 'PostgreSQL', category: 'Database', level: 'INTERMEDIATE' }
    ];

    for (const skillData of skillsData) {
      // Create or find the skill
      const skill = await prisma.skill.upsert({
        where: { name: skillData.name },
        update: {},
        create: {
          name: skillData.name,
          category: skillData.category
        }
      });

      // Create the developer skill relationship
      await prisma.developerSkill.create({
        data: {
          developerId: developer.id,
          skillId: skill.id,
          level: skillData.level as any,
          yearsOfExperience: Math.floor(Math.random() * 5) + 1
        }
      });
    }

    // Create multiple experiences with projects
    const experience1 = await prisma.experience.create({
      data: {
        developerId: developer.id,
        title: 'Senior Full Stack Developer',
        company: 'TechCorp Solutions Inc.',
        description: 'Led development of enterprise web applications using modern tech stack',
        location: 'San Francisco, CA (Remote)',
        startDate: new Date('2021-01-15'),
        endDate: new Date('2023-12-31'),
        current: false,
        responsibilities: [
          'Architect and develop scalable web applications',
          'Lead team of 8 developers',
          'Implement CI/CD pipelines',
          'Code review and mentoring'
        ],
        achievements: [
          'Improved application performance by 60%',
          'Successfully migrated legacy system to microservices',
          'Reduced deployment time from 2 hours to 15 minutes'
        ],
        teamSize: 8,
        techStack: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS']
      }
    });

    // Add projects to experience
    await prisma.experienceProject.createMany({
      data: [
        {
          experienceId: experience1.id,
          name: 'Customer Portal Redesign',
          description: 'Complete redesign of customer-facing portal with modern UI/UX',
          responsibilities: ['Technical lead', 'Architecture design', 'Implementation'],
          technologies: ['React', 'TypeScript', 'Material-UI', 'Node.js'],
          teamSize: 5,
          role: 'Technical Lead'
        },
        {
          experienceId: experience1.id,
          name: 'API Gateway Implementation',
          description: 'Built scalable API gateway for microservices architecture',
          responsibilities: ['System design', 'Implementation', 'Performance optimization'],
          technologies: ['Node.js', 'Express', 'Redis', 'PostgreSQL'],
          teamSize: 3,
          role: 'Senior Developer'
        }
      ]
    });

    // Create second experience
    const experience2 = await prisma.experience.create({
      data: {
        developerId: developer.id,
        title: 'Frontend Developer',
        company: 'StartupXYZ',
        description: 'Developed user interfaces for SaaS platform',
        location: 'Remote',
        startDate: new Date('2024-01-01'),
        current: true,
        responsibilities: [
          'Develop responsive web interfaces',
          'Collaborate with design team',
          'Optimize application performance'
        ],
        achievements: [
          'Delivered 15 major features on schedule',
          'Improved user engagement by 40%'
        ],
        teamSize: 4,
        techStack: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript']
      }
    });

    // Create education records
    await prisma.education.createMany({
      data: [
        {
          developerId: developer.id,
          institution: 'University of Technology',
          degree: 'Bachelor of Science in Computer Science',
          year: '2020',
          location: 'Boston, MA',
          startDate: new Date('2016-09-01'),
          endDate: new Date('2020-05-15'),
          gpa: 3.85,
          honors: ['Summa Cum Laude', 'Dean\'s List (6 semesters)', 'Outstanding Student Award'],
          activities: ['Programming Club President', 'Hackathon Winner', 'CS Tutor']
        },
        {
          developerId: developer.id,
          institution: 'Code Academy',
          degree: 'Full Stack Web Development Certificate',
          year: '2020',
          location: 'Online',
          startDate: new Date('2020-06-01'),
          endDate: new Date('2020-12-31'),
          gpa: null,
          honors: [],
          activities: []
        }
      ]
    });

    // Create achievements
    await prisma.achievement.createMany({
      data: [
        {
          developerId: developer.id,
          title: 'AWS Certified Solutions Architect',
          description: 'Professional level certification for cloud architecture',
          date: new Date('2022-08-15'),
          url: 'https://aws.amazon.com/certification/certified-solutions-architect-professional/',
          issuer: 'Amazon Web Services'
        },
        {
          developerId: developer.id,
          title: 'Kubernetes Certified Application Developer',
          description: 'CNCF certification for Kubernetes application development',
          date: new Date('2023-03-22'),
          url: 'https://www.cncf.io/certification/ckad/',
          issuer: 'Cloud Native Computing Foundation'
        },
        {
          developerId: developer.id,
          title: 'Google Cloud Professional Developer',
          description: 'Professional certification for GCP development',
          date: new Date('2023-09-10'),
          url: 'https://cloud.google.com/certification/cloud-developer',
          issuer: 'Google Cloud'
        }
      ]
    });

    // Create personal projects
    await prisma.personalProject.createMany({
      data: [
        {
          developerId: developer.id,
          name: 'DevTools Pro',
          description: 'Open source developer productivity toolkit with 50k+ downloads',
          technologies: ['TypeScript', 'Electron', 'React', 'Node.js'],
          url: 'https://github.com/testuser/devtools-pro',
          startDate: new Date('2022-01-01'),
          endDate: new Date('2022-06-30'),
          status: 'COMPLETED'
        },
        {
          developerId: developer.id,
          name: 'AI Code Assistant',
          description: 'VS Code extension for AI-powered code completion',
          technologies: ['TypeScript', 'VS Code API', 'OpenAI API'],
          url: 'https://marketplace.visualstudio.com/items?itemName=testuser.ai-assistant',
          startDate: new Date('2023-03-01'),
          status: 'ACTIVE'
        }
      ]
    });

    // Create gamification data - XP Transactions
    await prisma.xPTransaction.createMany({
      data: [
        {
          developerId: developer.id,
          amount: 500,
          source: 'CV_UPLOADED',
          description: 'Initial CV upload bonus',
          metadata: { version: 1, fileSize: '245KB' }
        },
        {
          developerId: developer.id,
          amount: 1000,
          source: 'PROFILE_COMPLETED',
          description: 'Completed comprehensive profile',
          metadata: { completeness: 95 }
        },
        {
          developerId: developer.id,
          amount: 750,
          source: 'APPLICATION_SUBMITTED',
          description: 'Applied to 5 positions',
          metadata: { applicationCount: 5 }
        },
        {
          developerId: developer.id,
          amount: 250,
          source: 'DAILY_LOGIN',
          description: '7-day login streak bonus',
          metadata: { streak: 7 }
        }
      ]
    });

    // Create Points Transactions
    await prisma.pointsTransaction.createMany({
      data: [
        {
          developerId: developer.id,
          amount: 100,
          action: 'ADMIN_AWARD',
          description: 'Welcome bonus for new user',
          metadata: { reason: 'welcome_bonus', admin: 'system' }
        },
        {
          developerId: developer.id,
          amount: -15,
          action: 'JOB_QUERY',
          description: 'Job search for React Developer positions',
          metadata: { query: 'React Developer', location: 'Remote', results: 15 }
        },
        {
          developerId: developer.id,
          amount: -10,
          action: 'JOB_QUERY',
          description: 'Job search for Full Stack positions',
          metadata: { query: 'Full Stack Developer', location: 'San Francisco', results: 10 }
        },
        {
          developerId: developer.id,
          amount: -5,
          action: 'COVER_LETTER',
          description: 'Generated cover letters for applications',
          metadata: { count: 5, positions: ['Senior Developer', 'Tech Lead'] }
        }
      ]
    });

    // Create User Badges (if badges exist)
    try {
      const availableBadges = await prisma.badge.findMany({ take: 3 });
      if (availableBadges.length > 0) {
        await prisma.userBadge.createMany({
          data: availableBadges.map((badge, index) => ({
            developerId: developer.id,
            badgeId: badge.id,
            earnedAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)) // Stagger over days
          }))
        });
        console.log(`   Added ${availableBadges.length} badges`);
      }
    } catch (error) {
      console.log('   ⚠️  No badges available in system');
    }

    // Create Daily Challenges
    await prisma.dailyChallenge.createMany({
      data: [
        {
          developerId: developer.id,
          challengeType: 'DAILY_LOGIN',
          description: 'Log in daily for a week',
          targetValue: 7,
          currentValue: 7,
          isCompleted: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          metadata: { streak: 7, bonusXP: 100 }
        },
        {
          developerId: developer.id,
          challengeType: 'PROFILE_UPDATE',
          description: 'Update 3 sections of your profile',
          targetValue: 3,
          currentValue: 2,
          isCompleted: false,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
          metadata: { sectionsUpdated: ['experience', 'skills'] }
        }
      ]
    });

    // Create Game Preferences
    await prisma.gamePreferences.create({
      data: {
        developerId: developer.id,
        enableNotifications: true,
        enableSounds: false,
        enableAnimations: true,
        preferredDifficulty: 'MEDIUM',
        theme: 'DARK',
        language: 'EN'
      }
    });

    // Create Applications (if the model exists)
    try {
      await prisma.application.createMany({
        data: [
          {
            developerId: developer.id,
            position: 'Senior React Developer',
            company: 'TechInnovate Inc.',
            location: 'Remote',
            applicationDate: new Date('2024-01-15'),
            status: 'PENDING',
            notes: 'Great company culture, exciting projects',
            jobUrl: 'https://techinnovate.com/careers/senior-react-dev'
          },
          {
            developerId: developer.id,
            position: 'Full Stack Engineer',
            company: 'StartupHub',
            location: 'San Francisco, CA',
            applicationDate: new Date('2024-01-20'),
            status: 'INTERVIEW',
            notes: 'Technical interview scheduled for next week',
            jobUrl: 'https://startuphub.com/jobs/fullstack-engineer'
          }
        ]
      });
      console.log('   Added 2 job applications');
    } catch (error) {
      console.log('   ⚠️  Applications table not available');
    }

    // Create Saved Roles
    try {
      await prisma.savedRole.createMany({
        data: [
          {
            developerId: developer.id,
            title: 'Senior Frontend Developer',
            company: 'Meta',
            location: 'Menlo Park, CA',
            description: 'Build the future of social technology',
            requirements: ['React', 'TypeScript', '5+ years experience'],
            benefits: ['Competitive salary', 'Stock options', 'Health insurance'],
            salaryRange: '$150,000 - $200,000',
            jobUrl: 'https://meta.com/careers/frontend-dev',
            isRemote: false,
            savedAt: new Date('2024-01-10')
          }
        ]
      });
      console.log('   Added 1 saved role');
    } catch (error) {
      console.log('   ⚠️  SavedRole table not available');
    }

    console.log(`🎉 Successfully created COMPREHENSIVE test user with ALL data types!`);
    console.log(`📋 Data Created:`);
    console.log(`   - Developer record with gamification fields`);
    console.log(`   - Contact information`);
    console.log(`   - ${skillsData.length} skills with relationships`);
    console.log(`   - 2 work experiences with ${2} projects`);
    console.log(`   - 2 education records`);
    console.log(`   - 3 achievements/certifications`);
    console.log(`   - 2 personal projects`);
    console.log(`   - 4 XP transactions`);
    console.log(`   - 4 Points transactions`);
    console.log(`   - User badges (if available)`);
    console.log(`   - 2 Daily challenges`);
    console.log(`   - Game preferences`);
    console.log(`   - Applications (if available)`);
    console.log(`   - Saved roles (if available)`);

    return developer.id;

  } catch (error) {
    console.error(`❌ Failed to create comprehensive test user:`, error);
    throw error;
  }
}

async function showDataSnapshot(email: string) {
  const developer = await prisma.developer.findUnique({
    where: { email },
    include: {
      contactInfo: true,
      developerSkills: { include: { skill: true } },
      experience: { include: { projects: true } },
      education: true,
      achievements: true,
      personalProjects: true,
      xpTransactions: true,
      pointsTransactions: true,
      userBadges: { include: { badge: true } },
      dailyChallenges: true,
      gamePreferences: true
    }
  });

  if (!developer) {
    console.log(`❌ No developer found with email: ${email}`);
    return;
  }

  console.log(`\n📊 CURRENT DATA SNAPSHOT FOR ${email}:`);
  console.log(`===============================================`);
  console.log(`👤 Developer: ${developer.name} (ID: ${developer.id})`);
  console.log(`   Level: ${developer.currentLevel}, XP: ${developer.totalXP}`);
  console.log(`   Points: ${developer.monthlyPoints - developer.pointsUsed + developer.pointsEarned} available`);
  console.log(`   Streak: ${developer.streak} days`);
  
  console.log(`\n📋 Profile Data:`);
  console.log(`   Contact Info: ${developer.contactInfo ? 1 : 0} records`);
  console.log(`   Skills: ${developer.developerSkills.length} records`);
  console.log(`   Experience: ${developer.experience.length} records`);
  console.log(`   Experience Projects: ${developer.experience.reduce((sum, exp) => sum + exp.projects.length, 0)} records`);
  console.log(`   Education: ${developer.education.length} records`);
  console.log(`   Achievements: ${developer.achievements.length} records`);
  console.log(`   Personal Projects: ${developer.personalProjects.length} records`);
  
  console.log(`\n🎮 Gamification Data:`);
  console.log(`   XP Transactions: ${developer.xpTransactions.length} records`);
  console.log(`   Points Transactions: ${developer.pointsTransactions.length} records`);
  console.log(`   User Badges: ${developer.userBadges.length} records`);
  console.log(`   Daily Challenges: ${developer.dailyChallenges.length} records`);
  console.log(`   Game Preferences: ${developer.gamePreferences ? 1 : 0} records`);

  // Calculate total records
  const totalRecords = 1 + // developer
    (developer.contactInfo ? 1 : 0) +
    developer.developerSkills.length +
    developer.experience.length +
    developer.experience.reduce((sum, exp) => sum + exp.projects.length, 0) +
    developer.education.length +
    developer.achievements.length +
    developer.personalProjects.length +
    developer.xpTransactions.length +
    developer.pointsTransactions.length +
    developer.userBadges.length +
    developer.dailyChallenges.length +
    (developer.gamePreferences ? 1 : 0);

  console.log(`\n📈 TOTAL RECORDS: ${totalRecords}`);
  console.log(`🎯 This user has data in ALL major tables - perfect for deletion testing!`);
}

async function main() {
  const email = process.argv[2] || 'test@test.se';
  
  console.log(`🧪 Complete User Deletion Validation Test`);
  console.log(`=========================================`);
  console.log(`Target Email: ${email}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    // Step 1: Create comprehensive test user
    console.log(`📝 STEP 1: Creating comprehensive test user...`);
    const developerId = await createComprehensiveTestUser(email);
    
    // Step 2: Show current data snapshot
    console.log(`\n📸 STEP 2: Data snapshot before deletion...`);
    await showDataSnapshot(email);
    
    // Step 3: Instructions for deletion
    console.log(`\n🗑️  STEP 3: Delete the user`);
    console.log(`========================`);
    console.log(`Now you need to delete this user. You have two options:`);
    console.log(`\n🌐 Option A - Via Admin Dashboard:`);
    console.log(`   1. Start dev server: npm run dev`);
    console.log(`   2. Go to: http://localhost:3002/admin/gamification`);
    console.log(`   3. Select user: ${email}`);
    console.log(`   4. Go to "⚠️ Dangerous" tab`);
    console.log(`   5. Click "Delete Developer"`);
    
    console.log(`\n🔧 Option B - Via API (if server running):`);
    console.log(`   curl -X DELETE "http://localhost:3002/api/admin/gamification/delete-developer?developerId=${developerId}"`);
    
    console.log(`\n✅ STEP 4: Validate deletion`);
    console.log(`===========================`);
    console.log(`After deletion, run:`);
    console.log(`   npx tsx scripts/validate-user-deletion.ts ${email}`);
    console.log(`\nThis will verify that:`);
    console.log(`   ✅ Developer record is deleted`);
    console.log(`   ✅ ALL related data is deleted`);
    console.log(`   ✅ NO orphaned data remains`);
    console.log(`   ✅ Database integrity is maintained`);

  } catch (error) {
    console.error(`❌ Test setup failed:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if this script is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}