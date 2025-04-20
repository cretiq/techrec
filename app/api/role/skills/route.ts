import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';
import { SkillLevel } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roleId, skills } = await request.json();
    
    if (!roleId || !skills || !Array.isArray(skills)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First verify the role exists and belongs to the user
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { company: true }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Process each skill
    const processedSkills = await Promise.all(
      skills.map(async ({ name, category, requiredLevel }) => {
        // Find or create the skill category
        const skillCategory = await prisma.skillCategory.upsert({
          where: { name: category || 'uncategorized' },
          update: {},
          create: { 
            name: category || 'uncategorized',
            description: 'Skills without a specific category'
          }
        });

        // Find or create the skill
        const skill = await prisma.skill.upsert({
          where: { name },
          update: {},
          create: { 
            name,
            categoryId: skillCategory.id
          }
        });

        // Find or create the role skill
        const roleSkill = await prisma.roleSkill.upsert({
          where: {
            roleId_skillId: {
              roleId,
              skillId: skill.id
            }
          },
          update: {
            requiredLevel: requiredLevel || SkillLevel.INTERMEDIATE
          },
          create: {
            roleId,
            skillId: skill.id,
            requiredLevel: requiredLevel || SkillLevel.INTERMEDIATE
          }
        });

        return roleSkill;
      })
    );

    return NextResponse.json(processedSkills);
  } catch (error) {
    console.error('Error processing role skills:', error);
    return NextResponse.json(
      { error: 'Failed to process role skills' },
      { status: 500 }
    );
  }
} 