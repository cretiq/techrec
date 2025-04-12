import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteSkill() {
  try {
    const skillId = 'cm9e0xa0l0017usx8rmc0bnkj';
    
    // First, let's check how many RoleSkills reference this skill
    const roleSkillsCount = await prisma.roleSkill.count({
      where: { skillId }
    });
    
    console.log(`Found ${roleSkillsCount} RoleSkills referencing this skill`);
    
    // Delete the skill
    const deletedSkill = await prisma.skill.delete({
      where: { id: skillId }
    });
    
    console.log('Deleted skill:', deletedSkill);
    
    // Verify that the RoleSkills were deleted
    const remainingRoleSkills = await prisma.roleSkill.count({
      where: { skillId }
    });
    
    console.log(`Remaining RoleSkills referencing this skill: ${remainingRoleSkills}`);
    
  } catch (error) {
    console.error('Error deleting skill:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSkill(); 