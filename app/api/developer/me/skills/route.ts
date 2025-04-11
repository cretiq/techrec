import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SkillLevel } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const skills = await prisma.developer.findUnique({
      where: { id: session.user.id },
      select: {
        developerSkills: {
          include: {
            skill: true
          }
        }
      }
    });

    return NextResponse.json(skills?.developerSkills || []);
  } catch (error) {
    console.error('Error fetching developer skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch developer skills' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, level = 'BEGINNER' } = await request.json();

    // Validate and cast the level to SkillLevel enum
    const skillLevel = level.toUpperCase() as SkillLevel;
    if (!Object.values(SkillLevel).includes(skillLevel)) {
      return NextResponse.json(
        { error: 'Invalid skill level' },
        { status: 400 }
      );
    }

    // First, find or create the skill category
    const category = await prisma.skillCategory.upsert({
      where: { name: 'uncategorized' },
      update: {},
      create: { 
        name: 'uncategorized',
        description: 'Skills without a specific category'
      }
    });

    // Then create the skill
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { 
        name,
        categoryId: category.id
      }
    });

    // Finally create the developer skill
    const updatedDeveloper = await prisma.developer.update({
      where: { id: session.user.id },
      data: {
        developerSkills: {
          create: {
            skillId: skill.id,
            level: skillLevel
          }
        }
      },
      include: {
        developerSkills: {
          include: {
            skill: true
          }
        }
      }
    });

    // Return the newly created developer skill
    const newDeveloperSkill = updatedDeveloper.developerSkills[updatedDeveloper.developerSkills.length - 1];
    return NextResponse.json(newDeveloperSkill);
  } catch (error) {
    console.error('Error adding developer skill:', error);
    return NextResponse.json(
      { error: 'Failed to add developer skill' },
      { status: 500 }
    );
  }
} 