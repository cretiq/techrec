import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TableInfo {
  name: string;
  hasDevId: boolean;
  recordCount: number;
  sampleRecord?: any;
  referencesDevId: boolean;
  cascadeDelete: boolean;
}

async function analyzeDatabase() {
  console.log(`🔍 Analyzing database schema for developer-related tables...`);
  console.log(`================================================================`);

  try {
    // Get all tables that might be related to developers
    const tableAnalysis: TableInfo[] = [];

    // Define all possible tables in the system
    const knownTables = [
      'developer',
      'contactInfo',
      'developerSkill', 
      'skill',
      'experience',
      'experienceProject',
      'education',
      'achievement',
      'personalProject',
      'xPTransaction',
      'pointsTransaction',
      'userBadge',
      'badge',
      'dailyChallenge',
      'configurationSettings',
      'subscriptionTier',
      'paymentHistory',
      'auditLog'
    ];

    for (const tableName of knownTables) {
      try {
        console.log(`\n📋 Analyzing table: ${tableName}`);
        
        // Get total record count
        const totalCount = await (prisma as any)[tableName]?.count() || 0;
        console.log(`   Total records: ${totalCount}`);

        // Check if table has developerId field
        let hasDevId = false;
        let recordsWithDevId = 0;
        let sampleRecord = null;
        let referencesDevId = false;

        try {
          // Try to find records with developerId
          const withDevId = await (prisma as any)[tableName]?.findMany({
            where: { developerId: { not: null } },
            take: 1
          }) || [];
          
          if (withDevId.length > 0) {
            hasDevId = true;
            sampleRecord = withDevId[0];
            recordsWithDevId = await (prisma as any)[tableName]?.count({
              where: { developerId: { not: null } }
            }) || 0;
            console.log(`   ✅ Has developerId field: ${recordsWithDevId}/${totalCount} records`);
          }
        } catch (error) {
          // Try alternative approaches for tables that might reference developers differently
          if (tableName === 'experienceProject') {
            try {
              const sample = await prisma.experienceProject.findFirst({
                include: { experience: true }
              });
              if (sample?.experience?.developerId) {
                referencesDevId = true;
                sampleRecord = sample;
                console.log(`   🔗 References developerId through experience relationship`);
              }
            } catch (err) {
              console.log(`   ❌ No developer reference found`);
            }
          } else {
            console.log(`   ❌ No developerId field`);
          }
        }

        // Get sample record if we don't have one yet
        if (!sampleRecord && totalCount > 0) {
          try {
            sampleRecord = await (prisma as any)[tableName]?.findFirst() || null;
          } catch (error) {
            console.log(`   ⚠️  Could not fetch sample record`);
          }
        }

        // Analyze the sample record for potential developer references
        if (sampleRecord) {
          console.log(`   📄 Sample record fields:`, Object.keys(sampleRecord));
          
          // Look for any field that might reference a developer
          const fieldNames = Object.keys(sampleRecord);
          const devRelatedFields = fieldNames.filter(field => 
            field.toLowerCase().includes('dev') || 
            field.toLowerCase().includes('user') ||
            field === 'id' // Could be referenced by other tables
          );
          
          if (devRelatedFields.length > 0) {
            console.log(`   🔍 Potential developer-related fields:`, devRelatedFields);
          }
        }

        tableAnalysis.push({
          name: tableName,
          hasDevId,
          recordCount: totalCount,
          sampleRecord,
          referencesDevId,
          cascadeDelete: false // We'll determine this from schema
        });

      } catch (error) {
        console.log(`   ⚠️  Table ${tableName} not accessible: ${error}`);
      }
    }

    // Summary report
    console.log(`\n\n📊 DATABASE ANALYSIS SUMMARY`);
    console.log(`=============================`);

    const tablesWithDevId = tableAnalysis.filter(t => t.hasDevId || t.referencesDevId);
    const tablesWithData = tableAnalysis.filter(t => t.recordCount > 0);
    
    console.log(`📈 Total tables analyzed: ${tableAnalysis.length}`);
    console.log(`🔗 Tables with developer references: ${tablesWithDevId.length}`);
    console.log(`📋 Tables with data: ${tablesWithData.length}`);

    console.log(`\n🎯 TABLES THAT NEED CLEANUP ON USER DELETION:`);
    console.log(`=============================================`);
    tablesWithDevId.forEach(table => {
      console.log(`  ✅ ${table.name}:`);
      console.log(`     - Records: ${table.recordCount}`);
      console.log(`     - Has developerId: ${table.hasDevId}`);
      console.log(`     - References developerId: ${table.referencesDevId}`);
      
      if (table.sampleRecord) {
        const relevantFields = Object.keys(table.sampleRecord).filter(key => 
          key.includes('id') || key.includes('dev') || key.includes('user')
        );
        console.log(`     - Key fields: ${relevantFields.join(', ')}`);
      }
    });

    console.log(`\n⚠️  TABLES WITHOUT DEVELOPER REFERENCES (probably safe):`);
    console.log(`========================================================`);
    const safeTables = tableAnalysis.filter(t => !t.hasDevId && !t.referencesDevId && t.recordCount > 0);
    safeTables.forEach(table => {
      console.log(`  📋 ${table.name}: ${table.recordCount} records`);
    });

    // Check for a specific developer if provided
    const testDeveloperId = process.argv[2];
    if (testDeveloperId) {
      console.log(`\n🔍 CHECKING SPECIFIC DEVELOPER: ${testDeveloperId}`);
      console.log(`===============================================`);
      
      for (const table of tablesWithDevId) {
        try {
          let count = 0;
          
          if (table.hasDevId) {
            count = await (prisma as any)[table.name]?.count({
              where: { developerId: testDeveloperId }
            }) || 0;
          } else if (table.referencesDevId && table.name === 'experienceProject') {
            count = await prisma.experienceProject.count({
              where: { experience: { developerId: testDeveloperId } }
            });
          }
          
          if (count > 0) {
            console.log(`  📊 ${table.name}: ${count} records for this developer`);
          }
        } catch (error) {
          console.log(`  ❌ Error checking ${table.name}: ${error}`);
        }
      }
    }

    return tableAnalysis;

  } catch (error) {
    console.error(`💥 Database analysis failed:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  console.log(`🔍 Database Schema Analysis`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  if (process.argv[2]) {
    console.log(`Developer ID to analyze: ${process.argv[2]}`);
  }
  
  await analyzeDatabase();
}

// Check if this script is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { analyzeDatabase };