import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const education = await prisma.developer.findUnique({
      where: { id: session.user.id },
      select: {
        education: true
      }
    });

    return NextResponse.json(education?.education || []);
  } catch (error) {
    console.error('Error fetching education:', error);
    return NextResponse.json(
      { error: 'Failed to fetch education' },
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

    const education = await prisma.developer.update({
      where: { id: session.user.id },
      data: {
        education: {
          create: {
            degree: data.degree,
            institution: data.institution,
            field: data.field,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            description: data.description
          }
        }
      },
      select: {
        education: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    return NextResponse.json(education.education[0]);
  } catch (error) {
    console.error('Error adding education:', error);
    return NextResponse.json(
      { error: 'Failed to add education' },
      { status: 500 }
    );
  }
} 