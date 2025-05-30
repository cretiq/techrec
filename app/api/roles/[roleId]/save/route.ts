import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/prisma/prisma'
// Removed non-existent import
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import mongoose from 'mongoose'

export async function POST(
  request: Request,
  context: { params: { roleId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Session user:', session.user)

    await connectToDatabase()
    
    // Find or create developer
    let developer = await Developer.findOne({ email: session.user.email })
    console.log('Found developer:', developer)

    if (!developer) {
      // Create a new developer if one doesn't exist
      developer = new Developer({
        name: session.user.name || '',
        title: 'Developer', // Default title
        email: session.user.email,
        skills: [],
        experience: [],
        applications: [],
        savedRoles: []
      })
      console.log('Created new developer:', developer)
    }

    // Get params and convert roleId to ObjectId
    const params = await context.params
    const roleId = new mongoose.Types.ObjectId(params.roleId)
    console.log('Role ID:', roleId)

    // Check if role is already saved
    const isSaved = developer.savedRoles.some(
      (savedRole: mongoose.Types.ObjectId) => savedRole.toString() === roleId.toString()
    )
    console.log('Is role saved:', isSaved)

    if (!isSaved) {
      // Initialize savedRoles if it's undefined
      if (!developer.savedRoles) {
        developer.savedRoles = []
      }
      developer.savedRoles.push(roleId)
      await developer.save()
      console.log('Saved developer:', developer)
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
  context: { params: { roleId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    const developer = await Developer.findOne({ email: session.user.email })
    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      )
    }

    // Get params and convert roleId to ObjectId
    const params = await context.params
    const roleId = new mongoose.Types.ObjectId(params.roleId)

    developer.savedRoles = developer.savedRoles.filter(
      (savedRole: mongoose.Types.ObjectId) => savedRole.toString() !== roleId.toString()
    )
    await developer.save()

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