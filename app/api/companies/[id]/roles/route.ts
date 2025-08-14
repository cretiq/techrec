import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const roles = await prisma.role.findMany({
      where: {
        companyId: id
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
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