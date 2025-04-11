import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RoleType } from '@prisma/client'

// Helper function to convert role type to enum value
const convertRoleType = (type: string): RoleType => {
  const typeMap: { [key: string]: RoleType } = {
    'Full-time': RoleType.FULL_TIME,
    'Part-time': RoleType.PART_TIME,
    'Contract': RoleType.CONTRACT,
    'Internship': RoleType.INTERNSHIP,
    'Freelance': RoleType.FREELANCE,
    'FULL_TIME': RoleType.FULL_TIME,
    'PART_TIME': RoleType.PART_TIME,
    'CONTRACT': RoleType.CONTRACT,
    'INTERNSHIP': RoleType.INTERNSHIP,
    'FREELANCE': RoleType.FREELANCE
  }
  return typeMap[type] || RoleType.FULL_TIME
}

interface RoleWithRelations {
  id: string
  title: string
  description: string
  location: string
  salary: string
  type: RoleType
  remote: boolean
  visaSponsorship: boolean
  createdAt: Date
  company: {
    id: string
    name: string
  } | null
  skills: {
    skill: {
      id: string
      name: string
      description: string | null
    }
  }[]
}

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
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
    })

    // Format the response to match the frontend interface
    const formattedRoles = roles.map(role => ({
      id: role.id,
      title: role.title,
      description: role.description,
      requirements: role.skills.map(roleSkill => roleSkill.skill.name),
      skills: role.skills.map(roleSkill => ({
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
    }))

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
        companyId: data.companyId,
        location: data.location,
        salary: data.salary,
        type: convertRoleType(data.type),
        remote: data.remote || false,
        visaSponsorship: data.visaSponsorship || false,
        skills: {
          create: data.skills?.map((skillId: string) => ({
            skill: {
              connect: {
                id: skillId
              }
            }
          }))
        }
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        skills: {
          select: {
            skill: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    }) as RoleWithRelations

    // Format the response to match the frontend interface
    const formattedRole = {
      id: role.id,
      title: role.title,
      description: role.description,
      requirements: role.skills.map(roleSkill => roleSkill.skill.name),
      skills: role.skills.map(roleSkill => ({
        id: roleSkill.skill.id,
        name: roleSkill.skill.name,
        description: roleSkill.skill.description
      })),
      company: role.company ? {
        id: role.company.id,
        name: role.company.name
      } : null,
      location: role.location,
      salary: role.salary,
      type: role.type,
      remote: role.remote,
      visaSponsorship: role.visaSponsorship,
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