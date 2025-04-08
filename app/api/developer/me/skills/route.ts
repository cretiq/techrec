import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const { name, level = 'beginner', yearsOfExperience = 0 } = await request.json();

    // First, find or create the skill
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { 
        name,
        category: 'uncategorized'
      }
    });

    // Then create the developer skill
    const developerSkill = await prisma.developer.update({
      where: { id: session.user.id },
      data: {
        developerSkills: {
          create: {
            skillId: skill.id,
            level,
            yearsOfExperience,
            lastUsed: new Date(),
            confidence: 50
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

    return NextResponse.json(developerSkill.developerSkills[developerSkill.developerSkills.length - 1]);
  } catch (error) {
    console.error('Error adding developer skill:', error);
    return NextResponse.json(
      { error: 'Failed to add developer skill' },
      { status: 500 }
    );
  }
} 