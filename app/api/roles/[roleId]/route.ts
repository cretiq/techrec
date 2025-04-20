import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/prisma"

export async function GET(
  request: Request,
  context: { params: { roleId: string } }
) {
  const params = await context.params
  const roleId = params.roleId

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        skills: {
          select: {
            skill: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    }) as any

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // Format the response to match the frontend interface
    const formattedRole = {
      id: role.id,
      title: role.title,
      description: role.description,
      requirements: role.requirements,
      skills: role.skills.map((roleSkill: { skill: { id: string; name: string; description: string | null } }) => ({
        id: roleSkill.skill.id,
        name: roleSkill.skill.name,
        description: roleSkill.skill.description,
      })),
      company: role.company ? {
        id: role.company.id,
        name: role.company.name,
      } : null,
      location: role.location,
      salary: role.salary,
      type: role.type,
      remote: role.remote,
      visaSponsorship: role.visaSponsorship,
    }

    return NextResponse.json(formattedRole)
  } catch (error) {
    console.error('Error fetching role:', error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
} 