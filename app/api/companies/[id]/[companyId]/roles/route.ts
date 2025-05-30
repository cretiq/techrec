import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/prisma/prisma'
// Removed non-existent import

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    await connectToDatabase()
    const roles = await Role.find({ company: params.companyId })
      .populate('company', 'name')
      .sort({ createdAt: -1 })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
} 