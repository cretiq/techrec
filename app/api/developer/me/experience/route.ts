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

    const experience = await prisma.developer.findUnique({
      where: { id: session.user.id },
      select: {
        experience: true
      }
    });

    return NextResponse.json(experience?.experience || []);
  } catch (error) {
    console.error('Error fetching experience:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experience' },
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

    const data = await request.json();

    const experience = await prisma.developer.update({
      where: { id: session.user.id },
      data: {
        experience: {
          create: {
            title: data.title,
            company: data.company,
            description: data.description,
            location: data.location,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            current: data.current || false
          }
        }
      },
      select: {
        experience: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    return NextResponse.json(experience.experience[0]);
  } catch (error) {
    console.error('Error adding experience:', error);
    return NextResponse.json(
      { error: 'Failed to add experience' },
      { status: 500 }
    );
  }
} 