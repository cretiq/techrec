import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { skills } = await req.json()

    // Basic validation
    if (!Array.isArray(skills)) {
      return new NextResponse('Skills must be an array', { status: 400 })
    }

    // Normalize skills (trim and lowercase)
    const normalizedSkills = skills.map(skill => ({
      name: skill.name.trim().toLowerCase(),
      level: skill.level.toLowerCase(),
      yearsOfExperience: Number(skill.yearsOfExperience),
      lastUsed: new Date(skill.lastUsed)
    }))

    // Validate skill levels
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert']
    if (!normalizedSkills.every(skill => validLevels.includes(skill.level))) {
      return new NextResponse('Invalid skill level', { status: 400 })
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get or create skills
      const skillNames = normalizedSkills.map(s => s.name)
      const existingSkills = await tx.skill.findMany({
        where: { name: { in: skillNames } }
      })

      const existingSkillNames = new Set(existingSkills.map(s => s.name))
      const newSkills = skillNames.filter(name => !existingSkillNames.has(name))

      // Create new skills
      if (newSkills.length > 0) {
        await tx.skill.createMany({
          data: newSkills.map(name => ({
            name,
            category: 'uncategorized',
            popularity: 0
          }))
        })
      }

      // Get all skills (existing + new)
      const allSkills = await tx.skill.findMany({
        where: { name: { in: skillNames } }
      })

      // Delete existing developer skills not in the new list
      await tx.developerSkill.deleteMany({
        where: {
          developerId: session.user.id,
          skillId: {
            notIn: allSkills.map(s => s.id)
          }
        }
      })

      // Upsert developer skills
      const developerSkills = normalizedSkills.map(skill => {
        const skillRecord = allSkills.find(s => s.name === skill.name)
        return {
          developerId: session.user.id,
          skillId: skillRecord!.id,
          level: skill.level,
          yearsOfExperience: skill.yearsOfExperience,
          lastUsed: skill.lastUsed,
          confidence: 50 // Default confidence
        }
      })

      await tx.developerSkill.createMany({
        data: developerSkills,
        skipDuplicates: true
      })

      return { success: true }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving skills:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const skills = await prisma.developerSkill.findMany({
      where: {
        developerId: session.user.id
      },
      include: {
        skill: true
      }
    })

    return NextResponse.json(skills)
  } catch (error) {
    console.error('Error fetching skills:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 