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

    const { name, level } = await req.json()
    if (!name || !level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    const developer = await Developer.findOneAndUpdate(
      { email: session.user.email },
      { $push: { skills: { name, level } } },
      { new: true }
    )

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    return NextResponse.json(developer.skills)
  } catch (error) {
    console.error('Error adding skill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skillId, name, level } = await req.json()
    if (!skillId || !name || !level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    const developer = await Developer.findOneAndUpdate(
      { 
        email: session.user.email,
        'skills._id': skillId
      },
      { 
        $set: { 
          'skills.$.name': name,
          'skills.$.level': level
        } 
      },
      { new: true }
    )

    if (!developer) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    return NextResponse.json(developer.skills)
  } catch (error) {
    console.error('Error updating skill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skillId } = await req.json()
    if (!skillId) {
      return NextResponse.json({ error: 'Missing skill ID' }, { status: 400 })
    }

    await connectToDatabase()

    const developer = await Developer.findOneAndUpdate(
      { email: session.user.email },
      { $pull: { skills: { _id: skillId } } },
      { new: true }
    )

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    return NextResponse.json(developer.skills)
  } catch (error) {
    console.error('Error deleting skill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 