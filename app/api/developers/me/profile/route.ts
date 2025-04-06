import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
      include: {
        skills: true,
        experience: true,
        education: true,
        projects: true,
        assessments: true,
        applications: true,
        savedRoles: {
          include: {
            role: true
          }
        }
      }
    })
    
    if (!developer) {
      // Create a default profile for new users
      developer = await prisma.developer.create({
        data: {
          email: session.user.email,
          profileEmail: session.user.email,
          name: session.user.name || 'New Developer',
          title: 'Software Developer', // Default title
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          skills: true,
          experience: true,
          education: true,
          projects: true,
          assessments: true,
          applications: true,
          savedRoles: {
            include: {
              role: true
            }
          }
        }
      })
    } else if (!developer.profileEmail) {
      // Update existing developer if profileEmail is null
      developer = await prisma.developer.update({
        where: { id: developer.id },
        data: { profileEmail: developer.email },
        include: {
          skills: true,
          experience: true,
          education: true,
          projects: true,
          assessments: true,
          applications: true,
          savedRoles: {
            include: {
              role: true
            }
          }
        }
      })
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

    // Validate required fields
    if (!data.name || !data.title) {
      return NextResponse.json(
        { error: 'Name and title are required' },
        { status: 400 }
      )
    }

    const developer = await prisma.developer.upsert({
      where: { email: session.user.email },
      update: {
        ...data,
        updatedAt: new Date()
      },
      create: {
        email: session.user.email,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        skills: true,
        experience: true,
        education: true,
        projects: true,
        assessments: true,
        applications: true,
        savedRoles: {
          include: {
            role: true
          }
        }
      }
    })

    return NextResponse.json(developer)
  } catch (error) {
    console.error('Error updating developer profile:', error)
    return NextResponse.json(
      { error: 'Failed to update developer profile' },
      { status: 500 }
    )
  }
} 