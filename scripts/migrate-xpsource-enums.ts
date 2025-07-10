import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const migrationMap = {
  PROFILE_UPDATE: 'PROFILE_SECTION_UPDATED',
  CV_UPLOAD: 'CV_UPLOADED',
  CV_ANALYSIS: 'CV_ANALYSIS_COMPLETED',
  CV_IMPROVEMENT: 'CV_IMPROVEMENT_APPLIED',
  APPLICATION_SUBMIT: 'APPLICATION_SUBMITTED',
  ACHIEVEMENT_ADD: 'ACHIEVEMENT_UNLOCKED',
  STREAK_BONUS: 'STREAK_MILESTONE',
};

async function main() {
  console.log('Starting migration of XPSource enum values using raw database command...');

  const collectionName = 'XPTransaction'; // From @@map("XPTransaction") in schema

  for (const [oldValue, newValue] of Object.entries(migrationMap)) {
    try {
      const command = {
        update: collectionName,
        updates: [
          {
            q: { source: oldValue },
            u: { $set: { source: newValue } },
            multi: true,
          },
        ],
      };

      const result: any = await prisma.$runCommandRaw(command);

      if (result.nModified > 0) {
        console.log(`Successfully migrated ${result.nModified} records from '${oldValue}' to '${newValue}'.`);
      } else {
        console.log(`No records found with source '${oldValue}'. Skipping.`);
      }
    } catch (error) {
      console.error(`Error migrating from '${oldValue}' to '${newValue}':`, error);
    }
  }

  console.log('XPSource enum migration completed.');
}

main()
  .catch((e) => {
    console.error('An error occurred during the migration process:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 