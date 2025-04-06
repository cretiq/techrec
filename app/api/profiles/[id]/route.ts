import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('techrec')
    const profile = await db.collection('profiles').findOne({
      _id: new ObjectId(params.id),
    })
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('techrec')
    
    const result = await db.collection('profiles').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      _id: params.id,
      ...body,
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('techrec')
    
    const result = await db.collection('profiles').deleteOne({
      _id: new ObjectId(params.id),
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting profile:', error)
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    )
  }
} 