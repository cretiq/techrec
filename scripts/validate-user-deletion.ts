import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UserDataSnapshot {
  // Core user data
  developer: any | null;
  contactInfo: any[];
  
  // Profile data
  developerSkills: any[];
  experience: any[];
  experienceProjects: any[];
  education: any[];
  achievements: any[];
  personalProjects: any[];
  
  // Application and role data
  assessments: any[];
  applications: any[];
  savedRoles: any[];
  customRoles: any[];
  cvs: any[];
  
  // Gamification data
  xpTransactions: any[];
  pointsTransactions: any[];
  userBadges: any[];
  dailyChallenges: any[];
  gamePreferences: any | null;
  
  // Portfolio data
  personalProjectPortfolios: any[];
  
  // Content data (if these tables exist)
  coverLetters: any[];
  outreachMessages: any[];
  
  // Analysis data (if these tables exist)
  cvAnalyses: any[];
  
  // Subscription data (if these tables exist)
  subscriptionHistory: any[];
  paymentHistory: any[];
  
  // Job search data (if these tables exist)
  jobSearches: any[];
  
  // Any other potential tables with developerId
  orphanedData: { [tableName: string]: any[] };
}

async function getAllUserData(email: string): Promise<UserDataSnapshot> {
  console.log(`🔍 Gathering all data for user: ${email}`);
  
  // First, find the developer
  const developer = await prisma.developer.findUnique({
    where: { email },
    include: {
      // Include all direct relations from schema
      contactInfo: true,
      developerSkills: {
        include: {
          skill: true
        }
      },
      experience: {
        include: {
          projects: true
        }
      },
      education: true,
      achievements: true,
      personalProjects: true,
      assessments: true,
      applications: true,
      savedRoles: true,
      customRoles: true,
      cvs: true,
      userBadges: {
        include: {
          badge: true
        }
      },
      xpTransactions: true,
      dailyChallenges: true,
      gamePreferences: true,
      pointsTransactions: true,
      personalProjectPortfolios: true
    }
  });

  if (!developer) {
    throw new Error(`Developer with email ${email} not found`);
  }

  const developerId = developer.id;
  console.log(`📋 Found developer: ${developer.name} (ID: ${developerId})`);

  // Gather all related data by table
  const [
    contactInfo,
    developerSkills,
    experience,
    experienceProjects,
    education,
    achievements,
    personalProjects,
    assessments,
    applications,
    savedRoles,
    customRoles,
    cvs,
    xpTransactions,
    pointsTransactions,
    userBadges,
    dailyChallenges,
    gamePreferences,
    personalProjectPortfolios
  ] = await Promise.all([
    prisma.contactInfo.findMany({ where: { developerId } }),
    prisma.developerSkill.findMany({ where: { developerId } }),
    prisma.experience.findMany({ where: { developerId } }),
    prisma.experienceProject.findMany({
      where: { 
        experience: { developerId } 
      }
    }),
    prisma.education.findMany({ where: { developerId } }),
    prisma.achievement.findMany({ where: { developerId } }),
    prisma.personalProject.findMany({ where: { developerId } }),
    prisma.assessment.findMany({ where: { developerId } }),
    prisma.application.findMany({ where: { developerId } }),
    prisma.savedRole.findMany({ where: { developerId } }),
    prisma.customRole.findMany({ where: { developerId } }),
    prisma.cV.findMany({ where: { developerId } }),
    prisma.xPTransaction.findMany({ where: { developerId } }),
    prisma.pointsTransaction.findMany({ where: { developerId } }),
    prisma.userBadge.findMany({ where: { developerId } }),
    prisma.dailyChallenge.findMany({ where: { developerId } }),
    prisma.gamePreferences.findUnique({ where: { developerId } }),
    prisma.personalProjectPortfolio.findMany({ where: { developerId } })
  ]);

  // Check for potentially orphaned data in other tables
  const orphanedData: { [tableName: string]: any[] } = {};
  
  // Check tables that might have developerId but aren't in our main schema relations
  const potentialTables = [
    'CvAnalysis',
    'CoverLetter', 
    'OutreachMessage',
    'Application',
    'JobSearch',
    'SubscriptionHistory',
    'PaymentHistory'
  ];

  for (const tableName of potentialTables) {
    try {
      // Try to query each table for developerId references
      const result = await (prisma as any)[tableName.charAt(0).toLowerCase() + tableName.slice(1)]?.findMany({
        where: { developerId }
      }) || [];
      
      if (result.length > 0) {
        orphanedData[tableName] = result;
      }
    } catch (error) {
      // Table doesn't exist or doesn't have developerId field - that's fine
      console.log(`⚠️  Table ${tableName} not accessible or doesn't have developerId field`);
    }
  }

  return {
    developer,
    contactInfo,
    developerSkills,
    experience,
    experienceProjects,
    education,
    achievements,
    personalProjects,
    assessments,
    applications,
    savedRoles,
    customRoles,
    cvs,
    xpTransactions,
    pointsTransactions,
    userBadges,
    dailyChallenges,
    gamePreferences: gamePreferences,
    personalProjectPortfolios,
    coverLetters: orphanedData['CoverLetter'] || [],
    outreachMessages: orphanedData['OutreachMessage'] || [],
    cvAnalyses: orphanedData['CvAnalysis'] || [],
    subscriptionHistory: orphanedData['SubscriptionHistory'] || [],
    paymentHistory: orphanedData['PaymentHistory'] || [],
    jobSearches: orphanedData['JobSearch'] || [],
    orphanedData
  };
}

function printDataSummary(snapshot: UserDataSnapshot, label: string) {
  console.log(`\n📊 ${label}:`);
  console.log(`  👤 Developer: ${snapshot.developer ? 'EXISTS' : 'NOT FOUND'}`);
  if (snapshot.developer) {
    console.log(`      Name: ${snapshot.developer.name}`);
    console.log(`      Email: ${snapshot.developer.email}`);
    console.log(`      ID: ${snapshot.developer.id}`);
  }
  
  console.log(`\n  📋 Profile Data:`);
  console.log(`      Contact Info: ${snapshot.contactInfo.length} records`);
  console.log(`      Developer Skills: ${snapshot.developerSkills.length} records`);
  console.log(`      Experience: ${snapshot.experience.length} records`);
  console.log(`      Experience Projects: ${snapshot.experienceProjects.length} records`);
  console.log(`      Education: ${snapshot.education.length} records`);
  console.log(`      Achievements: ${snapshot.achievements.length} records`);
  console.log(`      Personal Projects: ${snapshot.personalProjects.length} records`);
  
  console.log(`\n  🎯 Application Data:`);
  console.log(`      Assessments: ${snapshot.assessments.length} records`);
  console.log(`      Applications: ${snapshot.applications.length} records`);
  console.log(`      Saved Roles: ${snapshot.savedRoles.length} records`);
  console.log(`      Custom Roles: ${snapshot.customRoles.length} records`);
  console.log(`      CVs: ${snapshot.cvs.length} records`);
  
  console.log(`\n  🎮 Gamification Data:`);
  console.log(`      XP Transactions: ${snapshot.xpTransactions.length} records`);
  console.log(`      Points Transactions: ${snapshot.pointsTransactions.length} records`);
  console.log(`      User Badges: ${snapshot.userBadges.length} records`);
  console.log(`      Daily Challenges: ${snapshot.dailyChallenges.length} records`);
  console.log(`      Game Preferences: ${snapshot.gamePreferences ? 1 : 0} records`);
  
  console.log(`\n  🗂️ Portfolio Data:`);
  console.log(`      Personal Project Portfolios: ${snapshot.personalProjectPortfolios.length} records`);
  
  console.log(`\n  📄 Content Data:`);
  console.log(`      Cover Letters: ${snapshot.coverLetters.length} records`);
  console.log(`      Outreach Messages: ${snapshot.outreachMessages.length} records`);
  console.log(`      CV Analyses: ${snapshot.cvAnalyses.length} records`);
  
  console.log(`\n  💳 Business Data:`);
  console.log(`      Subscription History: ${snapshot.subscriptionHistory.length} records`);
  console.log(`      Payment History: ${snapshot.paymentHistory.length} records`);
  console.log(`      Job Searches: ${snapshot.jobSearches.length} records`);

  // Check for any orphaned data
  const orphanedTableCount = Object.keys(snapshot.orphanedData).length;
  if (orphanedTableCount > 0) {
    console.log(`\n  ⚠️  Potential Orphaned Data:`);
    for (const [tableName, records] of Object.entries(snapshot.orphanedData)) {
      console.log(`      ${tableName}: ${records.length} records`);
    }
  }

  // Calculate totals
  const totalRecords = 
    (snapshot.developer ? 1 : 0) +
    snapshot.contactInfo.length +
    snapshot.developerSkills.length +
    snapshot.experience.length +
    snapshot.experienceProjects.length +
    snapshot.education.length +
    snapshot.achievements.length +
    snapshot.personalProjects.length +
    snapshot.assessments.length +
    snapshot.applications.length +
    snapshot.savedRoles.length +
    snapshot.customRoles.length +
    snapshot.cvs.length +
    snapshot.xpTransactions.length +
    snapshot.pointsTransactions.length +
    snapshot.userBadges.length +
    snapshot.dailyChallenges.length +
    (snapshot.gamePreferences ? 1 : 0) +
    snapshot.personalProjectPortfolios.length +
    snapshot.coverLetters.length +
    snapshot.outreachMessages.length +
    snapshot.cvAnalyses.length +
    snapshot.subscriptionHistory.length +
    snapshot.paymentHistory.length +
    snapshot.jobSearches.length +
    Object.values(snapshot.orphanedData).reduce((sum, records) => sum + records.length, 0);

  console.log(`\n  📈 TOTAL RECORDS: ${totalRecords}`);
}

async function performDeletion(email: string): Promise<boolean> {
  console.log(`\n🗑️  Performing deletion for ${email}...`);
  
  try {
    // Find the developer first
    const developer = await prisma.developer.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    });

    if (!developer) {
      console.log(`❌ Developer with email ${email} not found`);
      return false;
    }

    // Call our delete endpoint
    const response = await fetch(`http://localhost:3002/api/admin/gamification/delete-developer?developerId=${developer.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`❌ Deletion failed: ${errorData.error}`);
      console.log(`   Details: ${errorData.details || 'No details'}`);
      return false;
    }

    const result = await response.json();
    console.log(`✅ Deletion successful!`);
    console.log(`   Developer deleted: ${result.developer.name} (${result.developer.email})`);
    console.log(`   Deletion summary:`, result.deletionSummary);
    console.log(`   Original counts:`, result.originalCounts);
    
    return true;
  } catch (error) {
    console.log(`❌ Error during deletion:`, error);
    return false;
  }
}

async function searchForOrphanedData(developerId: string): Promise<{ [tableName: string]: any[] }> {
  console.log(`\n🔍 Searching for any remaining orphaned data for developerId: ${developerId}...`);
  
  const orphanedData: { [tableName: string]: any[] } = {};
  
  // List of all possible tables that might contain developerId
  const allPossibleTables = [
    'developer',
    'contactInfo', 
    'developerSkill',
    'experience',
    'experienceProject',
    'education',
    'achievement',
    'personalProject',
    'assessment',
    'application',
    'interview',
    'savedRole',
    'customRole',
    'cV', // CV table
    'gamePreferences',
    'userBadge',
    'xPTransaction',
    'dailyChallenge',
    'pointsTransaction',
    'configurationSettings', // Might have user-specific configs
    'personalProjectPortfolio',
    'personalProjectEnhancement',
    'leaderboardEntry',
  ];

  for (const tableName of allPossibleTables) {
    try {
      let query;
      
      // Handle special cases for table naming and field names
      if (tableName === 'experienceProject') {
        // This table doesn't have direct developerId, need to join through experience
        query = await prisma.experienceProject.findMany({
          where: {
            experience: {
              developerId: developerId
            }
          }
        });
      } else if (tableName === 'gamePreferences') {
        // This is a unique relation, use findUnique
        const result = await prisma.gamePreferences.findUnique({
          where: { developerId }
        });
        query = result ? [result] : [];
      } else {
        // Standard developerId field
        query = await (prisma as any)[tableName]?.findMany({
          where: { developerId }
        }) || [];
      }
      
      if (query && query.length > 0) {
        orphanedData[tableName] = query;
        console.log(`⚠️  Found ${query.length} orphaned records in ${tableName}`);
        
        // Show sample data for investigation
        console.log(`   Sample record:`, JSON.stringify(query[0], null, 2));
      }
    } catch (error) {
      // Table doesn't exist, doesn't have developerId, or access denied - that's normal
      continue;
    }
  }

  return orphanedData;
}

async function validateUserDeletion(email: string) {
  console.log(`🚀 Starting validation for user deletion: ${email}`);
  console.log(`================================================`);

  try {
    // Step 1: Get complete data snapshot BEFORE deletion
    console.log(`\n📸 STEP 1: Taking snapshot of data BEFORE deletion...`);
    const beforeSnapshot = await getAllUserData(email);
    printDataSummary(beforeSnapshot, "BEFORE DELETION");
    
    const developerId = beforeSnapshot.developer?.id;
    if (!developerId) {
      console.log(`❌ Developer not found, cannot proceed with validation`);
      return;
    }

    // Step 2: Perform the deletion
    console.log(`\n🗑️  STEP 2: Performing deletion...`);
    const deletionSuccess = await performDeletion(email);
    
    if (!deletionSuccess) {
      console.log(`❌ Deletion failed, stopping validation`);
      return;
    }

    // Step 3: Verify complete cleanup
    console.log(`\n🔍 STEP 3: Verifying complete cleanup...`);
    
    // Try to get data snapshot AFTER deletion
    let afterSnapshot: UserDataSnapshot;
    try {
      afterSnapshot = await getAllUserData(email);
      console.log(`❌ VALIDATION FAILED: User still exists after deletion!`);
      printDataSummary(afterSnapshot, "AFTER DELETION - SHOULD BE EMPTY");
    } catch (error) {
      console.log(`✅ Developer record successfully deleted (expected error: ${error})`);
      
      // Now search for any orphaned data
      const orphanedData = await searchForOrphanedData(developerId);
      
      if (Object.keys(orphanedData).length === 0) {
        console.log(`✅ No orphaned data found - deletion was complete!`);
      } else {
        console.log(`❌ VALIDATION FAILED: Found orphaned data!`);
        for (const [tableName, records] of Object.entries(orphanedData)) {
          console.log(`   ${tableName}: ${records.length} orphaned records`);
        }
      }
    }

    // Step 4: Final validation report
    console.log(`\n📋 STEP 4: Final Validation Report`);
    console.log(`================================================`);
    
    // Check if developer exists
    const developerStillExists = await prisma.developer.findUnique({
      where: { email }
    });
    
    if (developerStillExists) {
      console.log(`❌ CRITICAL FAILURE: Developer account still exists!`);
      console.log(`   Name: ${developerStillExists.name}`);
      console.log(`   Email: ${developerStillExists.email}`);
      console.log(`   ID: ${developerStillExists.id}`);
    } else {
      console.log(`✅ Developer account successfully deleted`);
    }
    
    // Final orphan search
    const finalOrphanCheck = await searchForOrphanedData(developerId);
    if (Object.keys(finalOrphanCheck).length === 0) {
      console.log(`✅ VALIDATION PASSED: No orphaned data detected`);
      console.log(`🎉 User deletion was 100% complete!`);
    } else {
      console.log(`❌ VALIDATION FAILED: Orphaned data still exists`);
      console.log(`🚨 The following tables still contain references to deleted user:`);
      for (const [tableName, records] of Object.entries(finalOrphanCheck)) {
        console.log(`   - ${tableName}: ${records.length} records`);
      }
    }

  } catch (error) {
    console.error(`💥 Validation script failed:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const email = process.argv[2] || 'test@test.se';
  
  console.log(`🧪 User Deletion Validation Script`);
  console.log(`Target Email: ${email}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  await validateUserDeletion(email);
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});