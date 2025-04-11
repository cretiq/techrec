const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

type DeveloperSkill = {
  skill: {
    name: string;
  };
  level: string;
};

async function main() {
  try {
    const developer = await prisma.developer.findFirst({
      where: {
        name: 'Filip Mellqvist'
      },
      include: {
        developerSkills: {
          include: {
            skill: true
          }
        }
      }
    });

    if (!developer) {
      console.log('No developer found with name "Filip Mellqvist"');
      return;
    }

    console.log('Developer:', developer.name);
    console.log('Skills:');
    developer.developerSkills.forEach((skill: DeveloperSkill) => {
      console.log(`- ${skill.skill.name} (Level: ${skill.level})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 