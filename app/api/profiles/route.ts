import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const profiles = await prisma.developer.findMany({
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
    
    const profile = await prisma.developer.create({
      data: {
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
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
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
} 