import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: Request,
  context: { params: Promise<{ roleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Session user:', session.user)

    // Get params 
    const params = await context.params
    const roleId = params.roleId
    console.log('Role ID:', roleId)

    // Find or create developer using Prisma
    let developer = await prisma.developer.findUnique({ 
      where: { email: session.user.email },
      include: { savedRoles: true }
    })
    console.log('Found developer:', developer)

    if (!developer) {
      // Create a new developer if one doesn't exist
      developer = await prisma.developer.create({
        data: {
          name: session.user.name || '',
          title: 'Developer', // Default title
          email: session.user.email,
        },
        include: { savedRoles: true }
      })
      console.log('Created new developer:', developer)
    }

    // Check if role is already saved
    const isSaved = developer.savedRoles.some(
      (savedRole) => savedRole.roleId === roleId
    )
    console.log('Is role saved:', isSaved)

    if (!isSaved) {
      // Create saved role entry
      await prisma.savedRole.create({
        data: {
          developerId: developer.id,
          roleId: roleId,
        }
      })
      console.log('Role saved for developer:', developer.id)
    }

    return NextResponse.json({
      message: 'Role saved successfully',
      saved: true,
    })
  } catch (error) {
    console.error('Error saving role:', error)
    return NextResponse.json(
      { error: 'Failed to save role' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ roleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find developer
    const developer = await prisma.developer.findUnique({ 
      where: { email: session.user.email } 
    })
    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      )
    }

    // Get params 
    const params = await context.params
    const roleId = params.roleId

    // Remove saved role using Prisma
    await prisma.savedRole.deleteMany({
      where: {
        developerId: developer.id,
        roleId: roleId
      }
    })

    return NextResponse.json({
      message: 'Role removed from saved roles',
      saved: false,
    })
  } catch (error) {
    console.error('Error removing saved role:', error)
    return NextResponse.json(
      { error: 'Failed to remove saved role' },
      { status: 500 }
    )
  }
}