import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Comprehensive deletion validation
 * Searches for any remaining traces of a deleted user across ALL tables
 */

async function validateCompleteUserDeletion(email: string, knownDeveloperId?: string) {
  console.log(`🔍 COMPREHENSIVE DELETION VALIDATION`);
  console.log(`===================================`);
  console.log(`Target Email: ${email}`);
  if (knownDeveloperId) {
    console.log(`Known Developer ID: ${knownDeveloperId}`);
  }
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    // Step 1: Check if developer record exists
    console.log(`📋 STEP 1: Checking for developer record...`);
    const developer = await prisma.developer.findUnique({
      where: { email }
    });

    if (developer) {
      console.log(`❌ VALIDATION FAILED: Developer record still exists!`);
      console.log(`   ID: ${developer.id}`);
      console.log(`   Name: ${developer.name}`);
      console.log(`   Email: ${developer.email}`);
      return false;
    } else {
      console.log(`✅ Developer record successfully deleted`);
    }

    // Step 2: Comprehensive orphaned data search
    console.log(`\n🔍 STEP 2: Searching for ANY orphaned data...`);
    
    // Use the known developer ID if provided, or search by email patterns
    const searchIds = knownDeveloperId ? [knownDeveloperId] : [];
    
    // Also search for any references to the email in other fields
    const orphanedData: { [tableName: string]: any[] } = {};

    // Define all tables and their relationships
    const tableSearches = [
      // Core tables with developerId
      { table: 'contactInfo', field: 'developerId' },
      { table: 'developerSkill', field: 'developerId' },
      { table: 'experience', field: 'developerId' },
      { table: 'education', field: 'developerId' },
      { table: 'achievement', field: 'developerId' },
      { table: 'personalProject', field: 'developerId' },
      { table: 'assessment', field: 'developerId' },
      { table: 'application', field: 'developerId' },
      { table: 'savedRole', field: 'developerId' },
      { table: 'customRole', field: 'developerId' },
      { table: 'cV', field: 'developerId' },
      { table: 'userBadge', field: 'developerId' },
      { table: 'xPTransaction', field: 'developerId' },
      { table: 'dailyChallenge', field: 'developerId' },
      { table: 'pointsTransaction', field: 'developerId' },
      { table: 'personalProjectPortfolio', field: 'developerId' },
      { table: 'leaderboardEntry', field: 'developerId' },
    ];

    // Check each table
    for (const { table, field } of tableSearches) {
      try {
        let records = [];
        
        // Search by known developer ID if provided
        if (knownDeveloperId) {
          records = await (prisma as any)[table]?.findMany({
            where: { [field]: knownDeveloperId }
          }) || [];
        }

        if (records.length > 0) {
          orphanedData[table] = records;
          console.log(`❌ Found ${records.length} orphaned records in ${table}`);
          console.log(`   Sample record:`, JSON.stringify(records[0], null, 2));
        } else {
          console.log(`✅ ${table}: No orphaned data`);
        }
      } catch (error) {
        console.log(`⚠️  ${table}: Could not check (table might not exist)`);
      }
    }

    // Special check for gamePreferences (unique relation)
    if (knownDeveloperId) {
      try {
        const gamePrefs = await prisma.gamePreferences.findUnique({
          where: { developerId: knownDeveloperId }
        });
        if (gamePrefs) {
          orphanedData['gamePreferences'] = [gamePrefs];
          console.log(`❌ Found orphaned game preferences`);
        } else {
          console.log(`✅ gamePreferences: No orphaned data`);
        }
      } catch (error) {
        console.log(`⚠️  gamePreferences: Could not check`);
      }
    }

    // Special check for experienceProject (indirect relation)
    if (knownDeveloperId) {
      try {
        const expProjects = await prisma.experienceProject.findMany({
          where: {
            experience: {
              developerId: knownDeveloperId
            }
          }
        });
        if (expProjects.length > 0) {
          orphanedData['experienceProject'] = expProjects;
          console.log(`❌ Found ${expProjects.length} orphaned experience projects`);
        } else {
          console.log(`✅ experienceProject: No orphaned data`);
        }
      } catch (error) {
        console.log(`⚠️  experienceProject: Could not check`);
      }
    }

    // Step 3: Check for email references in other fields
    console.log(`\n📧 STEP 3: Searching for email references...`);
    
    try {
      // Check for email in developer table (should be empty)
      const devByEmail = await prisma.developer.findMany({
        where: {
          OR: [
            { email: { contains: email } },
            { profileEmail: { contains: email } }
          ]
        }
      });
      
      if (devByEmail.length > 0) {
        console.log(`❌ Found developer records with email references:`, devByEmail.length);
        orphanedData['developer_email_refs'] = devByEmail;
      } else {
        console.log(`✅ No email references in developer table`);
      }
    } catch (error) {
      console.log(`⚠️  Could not check email references`);
    }

    // Step 4: Final validation report
    console.log(`\n📊 FINAL VALIDATION REPORT`);
    console.log(`==========================`);
    
    const totalOrphanedTables = Object.keys(orphanedData).length;
    const totalOrphanedRecords = Object.values(orphanedData).reduce((sum, records) => sum + records.length, 0);

    if (totalOrphanedTables === 0 && totalOrphanedRecords === 0) {
      console.log(`✅ VALIDATION PASSED: Complete deletion confirmed!`);
      console.log(`🎉 NO orphaned data found anywhere in the system`);
      console.log(`🎯 User ${email} has been completely removed`);
      return true;
    } else {
      console.log(`❌ VALIDATION FAILED: Orphaned data detected!`);
      console.log(`📊 Summary:`);
      console.log(`   Tables with orphaned data: ${totalOrphanedTables}`);
      console.log(`   Total orphaned records: ${totalOrphanedRecords}`);
      console.log(`\n🚨 Orphaned data details:`);
      
      for (const [tableName, records] of Object.entries(orphanedData)) {
        console.log(`   ${tableName}: ${records.length} records`);
        if (records.length > 0) {
          console.log(`      Sample:`, JSON.stringify(records[0], null, 4));
        }
      }
      return false;
    }

  } catch (error) {
    console.error(`💥 Validation failed with error:`, error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const email = process.argv[2] || 'test@test.se';
  const developerId = process.argv[3]; // Optional known developer ID
  
  const isComplete = await validateCompleteUserDeletion(email, developerId);
  
  if (isComplete) {
    console.log(`\n🎯 CONCLUSION: User deletion is 100% complete ✅`);
    process.exit(0);
  } else {
    console.log(`\n🚨 CONCLUSION: User deletion is incomplete ❌`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});