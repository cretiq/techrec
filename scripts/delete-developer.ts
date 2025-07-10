import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: npx ts-node scripts/delete-developer.ts <email>');
    process.exit(1);
  }

  console.log(`Attempting to delete developer with email: ${email}`);

  try {
    const developer = await prisma.developer.findUnique({
      where: { email },
    });

    if (!developer) {
      console.log(`No developer found with email: ${email}`);
      return;
    }

    // With the schema changes, this single delete call will cascade to all related models.
    const deleteResult = await prisma.developer.delete({
      where: { id: developer.id },
    });

    console.log(`✅ Successfully deleted developer "${deleteResult.name}" (ID: ${deleteResult.id}) and all related data.`);

  } catch (error) {
    console.error('❌ An error occurred during deletion:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 