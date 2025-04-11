const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function safeDeleteRole(roleId) {
  try {
    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // 1. First, delete all related RoleSkills
      await tx.roleSkill.deleteMany({
        where: { roleId }
      })

      // 2. Delete any related applications
      await tx.application.deleteMany({
        where: { roleId }
      })

      // 3. Delete any related saved roles
      await tx.savedRole.deleteMany({
        where: { roleId }
      })

      // 4. Finally, delete the role itself
      await tx.role.delete({
        where: { id: roleId }
      })
    })

    console.log(`Successfully deleted role ${roleId} and all related records`)
  } catch (error) {
    console.error('Error during deletion:', error)
    throw error
  }
}

// Example usage:
// safeDeleteRole('some-role-id')
//   .catch(console.error)
//   .finally(() => prisma.$disconnect()) 