import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/prisma/prisma'
// Removed non-existent import

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, company, description, location, startDate, endDate, current } = await req.json()
    if (!title || !company || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    const developer = await Developer.findOneAndUpdate(
      { email: session.user.email },
      { 
        $push: { 
          experience: { 
            title, 
            company, 
            description, 
            location, 
            startDate, 
            endDate, 
            current 
          } 
        } 
      },
      { new: true }
    )

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    return NextResponse.json(developer.experience)
  } catch (error) {
    console.error('Error adding experience:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { experienceId, title, company, description, location, startDate, endDate, current } = await req.json()
    if (!experienceId || !title || !company || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    const developer = await Developer.findOneAndUpdate(
      { 
        email: session.user.email,
        'experience._id': experienceId
      },
      { 
        $set: { 
          'experience.$.title': title,
          'experience.$.company': company,
          'experience.$.description': description,
          'experience.$.location': location,
          'experience.$.startDate': startDate,
          'experience.$.endDate': endDate,
          'experience.$.current': current
        } 
      },
      { new: true }
    )

    if (!developer) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
    }

    return NextResponse.json(developer.experience)
  } catch (error) {
    console.error('Error updating experience:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { experienceId } = await req.json()
    if (!experienceId) {
      return NextResponse.json({ error: 'Missing experience ID' }, { status: 400 })
    }

    await connectToDatabase()

    const developer = await Developer.findOneAndUpdate(
      { email: session.user.email },
      { $pull: { experience: { _id: experienceId } } },
      { new: true }
    )

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    return NextResponse.json(developer.experience)
  } catch (error) {
    console.error('Error deleting experience:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 