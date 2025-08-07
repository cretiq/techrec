import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // First verify the education belongs to the developer
    const education = await prisma.education.findFirst({
      where: {
        id,
        developerId: session.user.id
      }
    });

    if (!education) {
      return NextResponse.json(
        { error: 'Education not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the education
    const updatedEducation = await prisma.education.update({
      where: { id },
      data: {
        degree: data.degree,
        institution: data.institution,
        field: data.field,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description
      }
    });

    return NextResponse.json(updatedEducation);
  } catch (error) {
    console.error('Error updating education:', error);
    return NextResponse.json(
      { error: 'Failed to update education' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // First verify the education belongs to the developer
    const education = await prisma.education.findFirst({
      where: {
        id,
        developerId: session.user.id
      }
    });

    if (!education) {
      return NextResponse.json(
        { error: 'Education not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the education
    await prisma.education.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting education:', error);
    return NextResponse.json(
      { error: 'Failed to delete education' },
      { status: 500 }
    );
  }
} 