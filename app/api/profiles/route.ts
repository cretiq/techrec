import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'
import { Profile } from '@/lib/models/Profile'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('techrec')
    const profiles = await db.collection('profiles').find({}).toArray()
    
    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('techrec')
    
    const result = await db.collection('profiles').insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    
    return NextResponse.json({ 
      _id: result.insertedId,
      ...body,
    })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
} 