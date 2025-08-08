import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAILS = [
  'filipmellqvist255@gmail.com',
  'admin@techrec.com',
  'admin@test.com',
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const developers = await prisma.developer.findMany({
      where: {
        email: {
          contains: query,
          mode: 'insensitive',
        },
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
      take: 10,
    });

    return NextResponse.json(developers);
  } catch (error) {
    console.error('Developer search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 