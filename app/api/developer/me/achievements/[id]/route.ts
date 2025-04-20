import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // First verify the achievement belongs to the developer
    const achievement = await prisma.achievement.findFirst({
      where: {
        id,
        developerId: session.user.id
      }
    });

    if (!achievement) {
      return NextResponse.json(
        { error: 'Achievement not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the achievement
    const updatedAchievement = await prisma.achievement.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date)
      }
    });

    return NextResponse.json(updatedAchievement);
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { error: 'Failed to update achievement' },
      { status: 500 }
    );
  }
}

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

    // First verify the achievement belongs to the developer
    const achievement = await prisma.achievement.findFirst({
      where: {
        id,
        developerId: session.user.id
      }
    });

    if (!achievement) {
      return NextResponse.json(
        { error: 'Achievement not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the achievement
    await prisma.achievement.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json(
      { error: 'Failed to delete achievement' },
      { status: 500 }
    );
  }
} 