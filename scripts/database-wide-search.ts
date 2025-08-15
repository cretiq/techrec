import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Database-wide search for any remaining traces
 * This script performs an exhaustive search across all collections
 */

async function searchAllCollections(targetId: string, targetEmail: string) {
  console.log(`🔍 DATABASE-WIDE SEARCH FOR TRACES`);
  console.log(`=================================`);
  console.log(`Searching for ID: ${targetId}`);
  console.log(`Searching for Email: ${targetEmail}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const findings: { [key: string]: any[] } = {};

  // Get all available Prisma model names
  const prismaModels = Object.keys(prisma).filter(key => 
    key !== '$connect' && 
    key !== '$disconnect' && 
    key !== '$executeRaw' && 
    key !== '$executeRawUnsafe' &&
    key !== '$queryRaw' &&
    key !== '$queryRawUnsafe' &&
    key !== '$transaction' &&
    key !== '$on' &&
    key !== '$use' &&
    !key.startsWith('$')
  );

  console.log(`📋 Found ${prismaModels.length} Prisma models to check:`);
  console.log(`   ${prismaModels.join(', ')}\n`);

  for (const modelName of prismaModels) {
    try {
      console.log(`🔍 Checking ${modelName}...`);
      const model = (prisma as any)[modelName];

      if (!model || typeof model.findMany !== 'function') {
        console.log(`   ⚠️  Skipped (not a queryable model)`);
        continue;
      }

      // Get a sample record to understand the schema
      let sampleRecord;
      try {
        sampleRecord = await model.findFirst();
      } catch (error) {
        console.log(`   ⚠️  Could not access (${error})`);
        continue;
      }

      if (!sampleRecord) {
        console.log(`   ✅ No records in table`);
        continue;
      }

      const fieldNames = Object.keys(sampleRecord);
      console.log(`   📄 Fields: ${fieldNames.join(', ')}`);

      // Search for developer ID in any field
      const searchQueries = [];

      // Check for developerId field
      if (fieldNames.includes('developerId')) {
        try {
          const records = await model.findMany({
            where: { developerId: targetId }
          });
          if (records.length > 0) {
            findings[`${modelName}.developerId`] = records;
            console.log(`   ❌ Found ${records.length} records with developerId`);
          } else {
            console.log(`   ✅ No records with developerId`);
          }
        } catch (error) {
          console.log(`   ⚠️  Could not search developerId: ${error}`);
        }
      }

      // Check for id field (in case it's the developer record itself)
      if (fieldNames.includes('id')) {
        try {
          const records = await model.findMany({
            where: { id: targetId }
          });
          if (records.length > 0) {
            findings[`${modelName}.id`] = records;
            console.log(`   ❌ Found ${records.length} records with matching id`);
          } else {
            console.log(`   ✅ No records with matching id`);
          }
        } catch (error) {
          console.log(`   ⚠️  Could not search id: ${error}`);
        }
      }

      // Check for email fields
      const emailFields = fieldNames.filter(field => 
        field.toLowerCase().includes('email')
      );

      for (const emailField of emailFields) {
        try {
          const records = await model.findMany({
            where: { [emailField]: targetEmail }
          });
          if (records.length > 0) {
            findings[`${modelName}.${emailField}`] = records;
            console.log(`   ❌ Found ${records.length} records with email in ${emailField}`);
          } else {
            console.log(`   ✅ No records with email in ${emailField}`);
          }
        } catch (error) {
          console.log(`   ⚠️  Could not search ${emailField}: ${error}`);
        }
      }

      // Check for any string fields that might contain the ID or email
      const stringFields = fieldNames.filter(field => {
        const value = sampleRecord[field];
        return typeof value === 'string' && !emailFields.includes(field) && field !== 'id';
      });

      for (const stringField of stringFields) {
        try {
          // Check if the field contains the target ID or email
          const recordsWithId = await model.findMany({
            where: { [stringField]: { contains: targetId } }
          });
          
          const recordsWithEmail = await model.findMany({
            where: { [stringField]: { contains: targetEmail } }
          });

          if (recordsWithId.length > 0) {
            findings[`${modelName}.${stringField}_contains_id`] = recordsWithId;
            console.log(`   ❌ Found ${recordsWithId.length} records with ID in ${stringField}`);
          }

          if (recordsWithEmail.length > 0) {
            findings[`${modelName}.${stringField}_contains_email`] = recordsWithEmail;
            console.log(`   ❌ Found ${recordsWithEmail.length} records with email in ${stringField}`);
          }

          if (recordsWithId.length === 0 && recordsWithEmail.length === 0) {
            console.log(`   ✅ No traces in ${stringField}`);
          }
        } catch (error) {
          console.log(`   ⚠️  Could not search ${stringField}: ${error}`);
        }
      }

    } catch (error) {
      console.log(`   💥 Error checking ${modelName}: ${error}`);
    }
  }

  // Final report
  console.log(`\n📊 FINAL SEARCH REPORT`);
  console.log(`======================`);

  const totalFindings = Object.keys(findings).length;
  const totalRecords = Object.values(findings).reduce((sum, records) => sum + records.length, 0);

  if (totalFindings === 0) {
    console.log(`✅ NO TRACES FOUND: User has been completely deleted!`);
    console.log(`🎉 Searched ${prismaModels.length} models - no traces remain`);
    return true;
  } else {
    console.log(`❌ TRACES FOUND: ${totalFindings} findings with ${totalRecords} total records`);
    console.log(`\n🚨 Details:`);
    
    for (const [location, records] of Object.entries(findings)) {
      console.log(`\n📍 ${location}: ${records.length} records`);
      if (records.length > 0) {
        console.log(`   Sample record:`, JSON.stringify(records[0], null, 2));
      }
    }
    return false;
  }
}

async function main() {
  const email = process.argv[2] || 'test@test.se';
  const developerId = process.argv[3] || '68766051834d59484ac066e1';
  
  try {
    const isClean = await searchAllCollections(developerId, email);
    
    if (isClean) {
      console.log(`\n🎯 FINAL CONCLUSION: Database is completely clean! ✅`);
      process.exit(0);
    } else {
      console.log(`\n🚨 FINAL CONCLUSION: Traces remain in database! ❌`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`💥 Search failed:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();