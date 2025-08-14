import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';

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

    // First verify the saved role belongs to the developer
    const savedRole = await prisma.savedRole.findFirst({
      where: {
        id,
        developerId: session.user.id
      }
    });

    if (!savedRole) {
      return NextResponse.json(
        { error: 'Saved role not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the saved role
    await prisma.savedRole.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting saved role:', error);
    return NextResponse.json(
      { error: 'Failed to delete saved role' },
      { status: 500 }
    );
  }
} 