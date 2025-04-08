import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Company, Role, Application, Developer } from '@prisma/client'

type CompanyWithRoles = Company & {
  roles: (Role & {
    applications: (Application & {
      developer: Developer
    })[]
  })[]
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get company data
    const company = await prisma.company.findFirst({
      where: {
        name: session.user.name
      },
      include: {
        roles: {
          include: {
            applications: {
              include: {
                developer: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    }) as CompanyWithRoles | null

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Calculate statistics
    const totalJobs = company.roles.length
    const activeJobs = company.roles.filter(role => role.type === 'open').length
    const totalApplications = company.roles.reduce((acc, role) => acc + role.applications.length, 0)
    const pendingApplications = company.roles.reduce((acc, role) => 
      acc + role.applications.filter(app => app.status === 'pending').length, 0
    )

    // Get recent applications (last 5)
    const recentApplications = company.roles
      .flatMap(role => role.applications.map(app => ({
        ...app,
        role: {
          id: role.id,
          title: role.title
        }
      })))
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 5)

    // Get recent jobs (last 5)
    const recentJobs = company.roles.slice(0, 5)

    return NextResponse.json({
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      recentApplications,
      recentJobs
    })
  } catch (error) {
    console.error('Error fetching company stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company stats' },
      { status: 500 }
    )
  }
} 