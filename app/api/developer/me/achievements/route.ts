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

    const achievements = await prisma.developer.findUnique({
      where: { id: session.user.id },
      select: {
        achievements: true
      }
    });

    return NextResponse.json(achievements?.achievements || []);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
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

    const achievement = await prisma.developer.update({
      where: { id: session.user.id },
      data: {
        achievements: {
          create: {
            title: data.title,
            description: data.description,
            date: new Date(data.date)
          }
        }
      },
      select: {
        achievements: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    return NextResponse.json(achievement.achievements[0]);
  } catch (error) {
    console.error('Error adding achievement:', error);
    return NextResponse.json(
      { error: 'Failed to add achievement' },
      { status: 500 }
    );
  }
} 