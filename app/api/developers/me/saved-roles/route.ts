import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Developer from '@/lib/models/Developer'
import mongoose from 'mongoose'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const developer = await Developer.findOne({ email: session.user.email })
    
    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    // Convert ObjectIds to strings before sending
    const savedRoleIds = (developer.savedRoles || []).map((roleId: mongoose.Types.ObjectId) => roleId.toString())
    return NextResponse.json(savedRoleIds)
  } catch (error) {
    console.error('Error fetching saved roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved roles' },
      { status: 500 }
    )
  }
} 