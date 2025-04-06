import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Developer from '@/lib/models/Developer'

export async function GET(
  request: Request,
  { params }: { params: { developerId: string } }
) {
  try {
    await connectToDatabase()
    const developer = await Developer.findById(params.developerId)
      .populate({
        path: 'applications.role',
        select: 'title description company status',
        populate: {
          path: 'company',
          select: 'name',
        },
      })
      .sort({ 'applications.appliedAt': -1 })

    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(developer.applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
} 