import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // First verify the experience belongs to the developer
    const experience = await prisma.experience.findFirst({
      where: {
        id,
        developerId: session.user.id
      }
    });

    if (!experience) {
      return NextResponse.json(
        { error: 'Experience not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the experience
    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: {
        title: data.title,
        company: data.company,
        description: data.description,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        current: data.current || false
      }
    });

    return NextResponse.json(updatedExperience);
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json(
      { error: 'Failed to update experience' },
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

    // First verify the experience belongs to the developer
    const experience = await prisma.experience.findFirst({
      where: {
        id,
        developerId: session.user.id
      }
    });

    if (!experience) {
      return NextResponse.json(
        { error: 'Experience not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the experience
    await prisma.experience.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json(
      { error: 'Failed to delete experience' },
      { status: 500 }
    );
  }
} 