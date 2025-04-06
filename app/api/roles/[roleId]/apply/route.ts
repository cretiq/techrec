import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Role from '@/lib/models/Role'
import Developer from '@/lib/models/Developer'
import { Application } from '@/lib/models/Role'

export async function POST(
  request: Request,
  { params }: { params: { roleId: string } }
) {
  try {
    await connectToDatabase()
    const { developerId, coverLetter } = await request.json()

    // Check if role exists and is open
    const role = await Role.findById(params.roleId)
    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    if (role.status !== 'open') {
      return NextResponse.json(
        { error: 'This role is no longer accepting applications' },
        { status: 400 }
      )
    }

    // Check if developer exists
    const developer = await Developer.findById(developerId)
    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      )
    }

    // Check if developer has already applied
    const existingApplication = role.applications.find(
      (app: Application) => app.developer.toString() === developerId
    )
    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this role' },
        { status: 400 }
      )
    }

    // Add application to role
    role.applications.push({
      developer: developerId,
      status: 'pending',
      appliedAt: new Date(),
      coverLetter,
    })

    // Add application to developer
    developer.applications.push({
      role: params.roleId,
      status: 'pending',
      appliedAt: new Date(),
      coverLetter,
    })

    await Promise.all([role.save(), developer.save()])

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: {
        role: params.roleId,
        developer: developerId,
        status: 'pending',
        appliedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
} 