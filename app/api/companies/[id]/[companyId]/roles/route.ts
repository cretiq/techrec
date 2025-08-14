import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const roles = await prisma.role.findMany({ 
      where: { companyId },
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
} 