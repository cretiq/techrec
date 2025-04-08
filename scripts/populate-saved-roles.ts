import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

async function populateSavedRoles() {
  try {
    // Get the first developer
    const developer = await prisma.developer.findFirst()
    if (!developer) {
      console.error('No developer found in database')
      return
    }

    // Get roles and filter out those without companyId
    const allRoles = await prisma.role.findMany()
    const roles = allRoles
      .filter(role => role.companyId !== null)
      .slice(0, 3)

    if (roles.length === 0) {
      console.error('No roles found with valid companyId')
      return
    }

    console.log('Found roles:', roles)

    // Create saved roles for the developer
    for (const role of roles) {
      try {
        await prisma.savedRole.create({
          data: {
            developerId: developer.id,
            roleId: role.id
          }
        })
        console.log(`Created saved role for role ${role.id}`)
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          console.log(`Role ${role.id} already saved for developer`)
          continue
        }
        throw error
      }
    }

    console.log(`Successfully processed ${roles.length} roles for developer ${developer.email}`)
  } catch (error) {
    console.error('Error populating saved roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateSavedRoles() 