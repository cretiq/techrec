import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import Developer from '@/lib/models/Developer'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { degree, institution, location, year } = await req.json()
    if (!degree || !institution || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    const developer = await Developer.findOneAndUpdate(
      { email: session.user.email },
      { 
        $push: { 
          education: { 
            degree, 
            institution, 
            location, 
            year 
          } 
        } 
      },
      { new: true }
    )

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    return NextResponse.json(developer.education)
  } catch (error) {
    console.error('Error adding education:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { educationId, degree, institution, location, year } = await req.json()
    if (!educationId || !degree || !institution || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    const developer = await Developer.findOneAndUpdate(
      { 
        email: session.user.email,
        'education._id': educationId
      },
      { 
        $set: { 
          'education.$.degree': degree,
          'education.$.institution': institution,
          'education.$.location': location,
          'education.$.year': year
        } 
      },
      { new: true }
    )

    if (!developer) {
      return NextResponse.json({ error: 'Education not found' }, { status: 404 })
    }

    return NextResponse.json(developer.education)
  } catch (error) {
    console.error('Error updating education:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { educationId } = await req.json()
    if (!educationId) {
      return NextResponse.json({ error: 'Missing education ID' }, { status: 400 })
    }

    await connectToDatabase()

    const developer = await Developer.findOneAndUpdate(
      { email: session.user.email },
      { $pull: { education: { _id: educationId } } },
      { new: true }
    )

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    return NextResponse.json(developer.education)
  } catch (error) {
    console.error('Error deleting education:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 