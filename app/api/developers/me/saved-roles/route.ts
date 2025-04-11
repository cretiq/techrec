import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('No session or email found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First try without include
    const developerWithoutInclude = await prisma.developer.findUnique({
      where: { email: session.user.email }
    })

    if (!developerWithoutInclude) {
      console.log('Developer not found in initial query')
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    // Then try with include
    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
      include: {
        savedRoles: {
          select: {
            roleId: true
          }
        }
      }
    })
    
    if (!developer) {
      console.log('Developer not found in include query')
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    // Extract role IDs from saved roles
    const savedRoleIds = developer.savedRoles.map(savedRole => savedRole.roleId)
    console.log('Saved role IDs:', savedRoleIds)
    return NextResponse.json(savedRoleIds)
  } catch (error) {
    console.error('Error fetching saved roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved roles' },
      { status: 500 }
    )
  }
} 