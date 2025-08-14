import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/prisma/prisma'
// Removed non-existent import
// Removed non-existent import
// Removed non-existent import

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roleId: string; applicationId: string }> }
) {
  try {
    await connectToDatabase()
    const { status } = await request.json()
    const { roleId, applicationId } = await params

    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Find the role and update the application status
    const role = await Role.findById(roleId)
    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    const application = role.applications.id(applicationId)
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Update application status in role
    application.status = status
    await role.save()

    // Update application status in developer
    const developer = await Developer.findById(application.developer)
    if (developer) {
      const devApplication = developer.applications.find(
        (app: Application) => app.role.toString() === roleId
      )
      if (devApplication) {
        devApplication.status = status
        await developer.save()
      }
    }

    return NextResponse.json({
      message: 'Application status updated successfully',
      application: {
        role: roleId,
        developer: application.developer,
        status,
      },
    })
  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    )
  }
} 