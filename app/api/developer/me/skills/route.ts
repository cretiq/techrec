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

    const developer = await prisma.developer.findUnique({
      where: { id: session.user.id },
      include: {
        developerSkills: {
          include: {
            skill: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    return NextResponse.json(developer.developerSkills);
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

    const { skills } = await request.json();
    
    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process each skill
    const processedSkills = await Promise.all(
      skills.map(async ({ name, category, level }) => {
        // First, ensure the category exists
        const skillCategory = await prisma.skillCategory.upsert({
          where: { name: category || 'uncategorized' },
          update: {},
          create: { 
            name: category || 'uncategorized',
            description: 'Skills without a specific category'
          }
        });

        // Then, ensure the skill exists
        const skill = await prisma.skill.upsert({
          where: { name },
          update: {},
          create: { 
            name,
            categoryId: skillCategory.id
          }
        });

        // Finally, create or update the developer skill
        const developerSkill = await prisma.developerSkill.upsert({
          where: {
            developerId_skillId: {
              developerId: session.user.id,
              skillId: skill.id
            }
          },
          update: {
            level: level || SkillLevel.INTERMEDIATE
          },
          create: {
            developerId: session.user.id,
            skillId: skill.id,
            level: level || SkillLevel.INTERMEDIATE
          },
          include: {
            skill: {
              include: {
                category: true
              }
            }
          }
        });

        return developerSkill;
      })
    );

    return NextResponse.json(processedSkills);
  } catch (error) {
    console.error('Error adding developer skills:', error);
    return NextResponse.json(
      { error: 'Failed to add developer skills' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { skillId } = await request.json();
    if (!skillId) {
      return NextResponse.json(
        { error: 'Missing skill ID' },
        { status: 400 }
      );
    }

    const deletedSkill = await prisma.developerSkill.delete({
      where: {
        developerId_skillId: {
          developerId: session.user.id,
          skillId
        }
      }
    });

    return NextResponse.json(deletedSkill);
  } catch (error) {
    console.error('Error deleting developer skill:', error);
    return NextResponse.json(
      { error: 'Failed to delete developer skill' },
      { status: 500 }
    );
  }
} 