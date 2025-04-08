import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // First verify the skill belongs to the developer
    const developerSkill = await prisma.developerSkill.findFirst({
      where: {
        id,
        developerId: session.user.id
      }
    });

    if (!developerSkill) {
      return NextResponse.json(
        { error: 'Skill not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the developer skill
    await prisma.developerSkill.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting developer skill:', error);
    return NextResponse.json(
      { error: 'Failed to delete developer skill' },
      { status: 500 }
    );
  }
} 