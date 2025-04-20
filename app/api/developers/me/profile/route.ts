import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface Developer {
  _id: ObjectId
  email: string
  profileEmail: string
  name: string
  title: string
  skills: any[]
  experience: any[]
  education: any[]
  projects: any[]
  assessments: any[]
  applications: any[]
  savedRoles: any[]
  createdAt: Date
  updatedAt: Date
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    
    let developer: Developer | null = await db.collection('developers').findOne(
      { email: session.user.email },
      {
        projection: {
          _id: 1,
          skills: 1,
          experience: 1,
          education: 1,
          projects: 1,
          assessments: 1,
          applications: 1,
          savedRoles: 1,
          email: 1,
          profileEmail: 1,
          name: 1,
          title: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ) as Developer | null
    
    if (!developer) {
      // Create a default profile for new users
      const result = await db.collection('developers').insertOne({
        email: session.user.email,
        profileEmail: session.user.email,
        name: session.user.name || 'New Developer',
        title: 'Software Developer', // Default title
        about: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
        assessments: [],
        applications: [],
        savedRoles: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      const newDeveloper = await db.collection('developers').findOne(
        { _id: result.insertedId },
        {
          projection: {
            _id: 1,
            skills: 1,
            experience: 1,
            education: 1,
            projects: 1,
            assessments: 1,
            applications: 1,
            savedRoles: 1,
            email: 1,
            profileEmail: 1,
            name: 1,
            title: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ) as Developer | null
      
      if (!newDeveloper) {
        throw new Error('Failed to create new developer profile')
      }
      
      developer = newDeveloper
    }
    
    // At this point, developer cannot be null
    const finalDeveloper = developer!
    
    // Convert ObjectId to string for the response
    return NextResponse.json({
      ...finalDeveloper,
      _id: finalDeveloper._id.toString()
    })
  } catch (error) {
    console.error('Error in GET /api/developers/me/profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.title) {
      return NextResponse.json(
        { error: 'Name and title are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    
    // First try to find the developer
    let developer: Developer | null = await db.collection('developers').findOne(
      { email: session.user.email },
      {
        projection: {
          _id: 1,
          skills: 1,
          experience: 1,
          education: 1,
          projects: 1,
          assessments: 1,
          applications: 1,
          savedRoles: 1,
          email: 1,
          profileEmail: 1,
          name: 1,
          title: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ) as Developer | null

    if (!developer) {
      // Create a new developer profile
      const result = await db.collection('developers').insertOne({
        email: session.user.email,
        profileEmail: session.user.email,
        name: data.name,
        title: data.title,
        about: data.about,
        skills: data.skills || [],
        experience: data.experience || [],
        education: data.education || [],
        projects: data.projects || [],
        assessments: data.assessments || [],
        applications: data.applications || [],
        savedRoles: data.savedRoles || [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      const newDeveloper = await db.collection('developers').findOne(
        { _id: result.insertedId },
        {
          projection: {
            _id: 1,
            skills: 1,
            experience: 1,
            education: 1,
            projects: 1,
            assessments: 1,
            applications: 1,
            savedRoles: 1,
            email: 1,
            profileEmail: 1,
            name: 1,
            title: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ) as Developer | null
      
      if (!newDeveloper) {
        throw new Error('Failed to create new developer profile')
      }
      
      developer = newDeveloper
    } else {
      // Update existing developer
      await db.collection('developers').updateOne(
        { email: session.user.email },
        {
          $set: {
            ...data,
            updatedAt: new Date()
          }
        }
      )
      
      // Fetch the updated developer
      developer = await db.collection('developers').findOne(
        { email: session.user.email },
        {
          projection: {
            _id: 1,
            skills: 1,
            experience: 1,
            education: 1,
            projects: 1,
            assessments: 1,
            applications: 1,
            savedRoles: 1,
            email: 1,
            profileEmail: 1,
            name: 1,
            title: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ) as Developer | null
      
      if (!developer) {
        throw new Error('Failed to update developer profile')
      }
    }
    
    // At this point, developer cannot be null
    const finalDeveloper = developer!
    
    // Convert ObjectId to string for the response
    return NextResponse.json({
      ...finalDeveloper,
      _id: finalDeveloper._id.toString()
    })
  } catch (error) {
    console.error('Error updating developer profile:', error)
    return NextResponse.json(
      { error: 'Failed to update developer profile' },
      { status: 500 }
    )
  }
} 