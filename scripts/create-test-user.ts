import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestUser(email: string = 'test@test.se') {
  console.log(`🧪 Creating comprehensive test user: ${email}`);
  
  try {
    // Check if user already exists
    const existingUser = await prisma.developer.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log(`⚠️  User ${email} already exists with ID: ${existingUser.id}`);
      return existingUser.id;
    }

    // Create the developer
    const developer = await prisma.developer.create({
      data: {
        email,
        name: 'Test User',
        title: 'Test Developer',
        profileEmail: email,
        totalXP: 1500,
        currentLevel: 3,
        monthlyPoints: 50,
        pointsUsed: 20,
        pointsEarned: 15,
        subscriptionTier: 'FREE'
      }
    });

    console.log(`✅ Created developer: ${developer.name} (ID: ${developer.id})`);

    // Create contact info
    await prisma.contactInfo.create({
      data: {
        developerId: developer.id,
        phone: '+1234567890',
        address: '123 Test Street',
        city: 'Test City',
        country: 'Test Country',
        linkedin: 'https://linkedin.com/in/testuser',
        github: 'https://github.com/testuser',
        website: 'https://testuser.dev'
      }
    });

    // Create skills
    const skills = ['JavaScript', 'TypeScript', 'React', 'Node.js'];
    for (const skillName of skills) {
      // First create or find the skill
      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: {
          name: skillName,
          category: 'Programming'
        }
      });

      // Then create the developer skill relationship
      await prisma.developerSkill.create({
        data: {
          developerId: developer.id,
          skillId: skill.id,
          level: 'ADVANCED',
          yearsOfExperience: 3
        }
      });
    }

    // Create experience
    const experience = await prisma.experience.create({
      data: {
        developerId: developer.id,
        title: 'Senior Developer',
        company: 'Test Company Inc.',
        description: 'Led development of web applications',
        location: 'Remote',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-12-31'),
        current: false,
        responsibilities: ['Code development', 'Team leadership', 'Architecture design'],
        achievements: ['Improved performance by 50%', 'Led team of 5 developers'],
        teamSize: 5,
        techStack: ['React', 'Node.js', 'PostgreSQL']
      }
    });

    // Create experience projects
    await prisma.experienceProject.create({
      data: {
        experienceId: experience.id,
        name: 'E-commerce Platform',
        description: 'Built scalable e-commerce platform',
        technologies: ['React', 'Node.js', 'MongoDB'],
        url: 'https://example.com',
        role: 'Lead Developer'
      }
    });

    // Create education
    await prisma.education.create({
      data: {
        developerId: developer.id,
        institution: 'Test University',
        degree: 'Bachelor of Computer Science',
        year: '2019',
        location: 'Test City, TC',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2019-06-01'),
        gpa: 3.8,
        honors: ['Magna Cum Laude', 'Dean\'s List'],
        activities: ['Programming Club', 'Robotics Team']
      }
    });

    // Create achievements
    await prisma.achievement.create({
      data: {
        developerId: developer.id,
        title: 'AWS Certified Developer',
        description: 'Achieved AWS certification',
        date: new Date('2022-06-15'),
        url: 'https://aws.amazon.com/certification',
        issuer: 'Amazon Web Services'
      }
    });

    // Create personal projects
    await prisma.personalProject.create({
      data: {
        developerId: developer.id,
        name: 'Open Source Library',
        description: 'Created popular npm package',
        technologies: ['TypeScript', 'Jest'],
        url: 'https://github.com/testuser/library',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2021-06-01'),
        status: 'COMPLETED'
      }
    });

    // Create gamification data

    // XP Transactions
    await prisma.xPTransaction.createMany({
      data: [
        {
          developerId: developer.id,
          amount: 500,
          source: 'CV_UPLOADED',
          description: 'Initial CV upload',
          metadata: { action: 'upload' }
        },
        {
          developerId: developer.id,
          amount: 1000,
          source: 'PROFILE_COMPLETED',
          description: 'Completed profile setup',
          metadata: { completeness: 100 }
        }
      ]
    });

    // Points Transactions
    await prisma.pointsTransaction.createMany({
      data: [
        {
          developerId: developer.id,
          amount: 50,
          action: 'ADMIN_AWARD',
          description: 'Welcome bonus points',
          metadata: { reason: 'new_user_bonus' }
        },
        {
          developerId: developer.id,
          amount: -20,
          action: 'JOB_QUERY',
          description: 'Used points for job search',
          metadata: { results: 20, query: 'React Developer' }
        }
      ]
    });

    // User Badges (if badges exist)
    try {
      const badges = await prisma.badge.findMany({ take: 2 });
      if (badges.length > 0) {
        await prisma.userBadge.createMany({
          data: badges.map(badge => ({
            developerId: developer.id,
            badgeId: badge.id,
            earnedAt: new Date()
          }))
        });
      }
    } catch (error) {
      console.log('⚠️  No badges found or badge system not set up');
    }

    // Daily Challenges
    await prisma.dailyChallenge.create({
      data: {
        developerId: developer.id,
        challengeType: 'DAILY_LOGIN',
        description: 'Log in daily for a week',
        targetValue: 7,
        currentValue: 3,
        isCompleted: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        metadata: { streak: 3 }
      }
    });

    console.log(`🎉 Successfully created comprehensive test user with all data types!`);
    console.log(`📋 Created:`);
    console.log(`   - Developer record`);
    console.log(`   - Contact information`);
    console.log(`   - ${skills.length} skills`);
    console.log(`   - 1 work experience with project`);
    console.log(`   - 1 education record`);
    console.log(`   - 1 achievement`);
    console.log(`   - 1 personal project`);
    console.log(`   - XP and Points transactions`);
    console.log(`   - User badges (if available)`);
    console.log(`   - Daily challenge`);

    return developer.id;

  } catch (error) {
    console.error(`❌ Failed to create test user:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const email = process.argv[2] || 'test@test.se';
  
  console.log(`🧪 Test User Creation Script`);
  console.log(`Target Email: ${email}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  await createTestUser(email);
}

// Check if this script is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { createTestUser };