import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Role from '@/lib/models/Role'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const roles = await Role.find({ company: params.id })
    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
} 