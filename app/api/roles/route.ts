import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache roles for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
let cachedRoles: any[] = []
let lastFetchTime = 0

export async function GET() {
  try {
    // Check if we have cached data that's still valid
    const now = Date.now()
    if (cachedRoles.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json(cachedRoles)
    }

    // Fetch roles with company information
    const roles = await prisma.role.findMany({
      where: {
        companyId: {
          not: undefined
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        location: true,
        salary: true,
        type: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response to match the previous structure
    const formattedRoles = roles.map(role => ({
      ...role,
      _id: role.id,
      company: role.company ? {
        _id: role.company.id,
        name: role.company.name
      } : null
    }))

    // Cache the results
    cachedRoles = formattedRoles
    lastFetchTime = now

    return NextResponse.json(formattedRoles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.description || !data.companyId) {
      return NextResponse.json(
        { error: 'Title, description, and company ID are required' },
        { status: 400 }
      )
    }

    // Create new role
    const role = await prisma.role.create({
      data: {
        title: data.title,
        description: data.description,
        requirements: data.requirements || [],
        companyId: data.companyId,
        location: data.location,
        salary: data.salary,
        type: data.type
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Invalidate cache
    cachedRoles = []
    lastFetchTime = 0

    // Format the response to match the previous structure
    const formattedRole = {
      ...role,
      _id: role.id,
      company: role.company ? {
        _id: role.company.id,
        name: role.company.name
      } : null
    }

    return NextResponse.json(formattedRole, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
} 