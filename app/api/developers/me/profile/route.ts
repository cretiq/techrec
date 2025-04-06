import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import Developer from '@/lib/models/Developer'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const developer = await Developer.findOne({ email: session.user.email })
    
    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    return NextResponse.json(developer)
  } catch (error) {
    console.error('Error fetching developer profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch developer profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    await connectToDatabase()

    // Validate required fields
    if (!data.name || !data.title) {
      return NextResponse.json(
        { error: 'Name and title are required' },
        { status: 400 }
      )
    }

    const developer = await Developer.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: {
          ...data,
          updatedAt: new Date()
        }
      },
      { 
        new: true,
        upsert: true // Create if doesn't exist
      }
    )

    return NextResponse.json(developer)
  } catch (error) {
    console.error('Error updating developer profile:', error)
    return NextResponse.json(
      { error: 'Failed to update developer profile' },
      { status: 500 }
    )
  }
} 