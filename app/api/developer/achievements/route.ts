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

    const { description } = await req.json()
    if (!description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    const developer = await Developer.findOneAndUpdate(
      { email: session.user.email },
      { $push: { achievements: description } },
      { new: true }
    )

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    return NextResponse.json(developer.achievements)
  } catch (error) {
    console.error('Error adding achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { index, description } = await req.json()
    if (index === undefined || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    const developer = await Developer.findOne({ email: session.user.email })
    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    if (index < 0 || index >= developer.achievements.length) {
      return NextResponse.json({ error: 'Invalid achievement index' }, { status: 400 })
    }

    developer.achievements[index] = description
    await developer.save()

    return NextResponse.json(developer.achievements)
  } catch (error) {
    console.error('Error updating achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { index } = await req.json()
    if (index === undefined) {
      return NextResponse.json({ error: 'Missing achievement index' }, { status: 400 })
    }

    await connectToDatabase()

    const developer = await Developer.findOne({ email: session.user.email })
    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    if (index < 0 || index >= developer.achievements.length) {
      return NextResponse.json({ error: 'Invalid achievement index' }, { status: 400 })
    }

    developer.achievements.splice(index, 1)
    await developer.save()

    return NextResponse.json(developer.achievements)
  } catch (error) {
    console.error('Error deleting achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 