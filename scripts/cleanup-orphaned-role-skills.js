const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('=== Cleaning Up Orphaned RoleSkills ===')
  
  // Get all RoleSkills
  const roleSkills = await prisma.roleSkill.findMany()
  console.log(`Found ${roleSkills.length} total RoleSkills`)

  // Get all Role IDs
  const roles = await prisma.role.findMany({
    select: { id: true }
  })
  const roleIds = new Set(roles.map(r => r.id))
  console.log(`Found ${roleIds.size} roles`)

  // Get all Skill IDs
  const skills = await prisma.skill.findMany({
    select: { id: true }
  })
  const skillIds = new Set(skills.map(s => s.id))
  console.log(`Found ${skillIds.size} skills`)

  // Find orphaned RoleSkills
  const orphanedRoleSkills = roleSkills.filter(rs => {
    return !roleIds.has(rs.roleId) || !skillIds.has(rs.skillId)
  })

  console.log(`\nFound ${orphanedRoleSkills.length} orphaned RoleSkills to delete`)

  // Delete orphaned RoleSkills
  if (orphanedRoleSkills.length > 0) {
    const result = await prisma.roleSkill.deleteMany({
      where: {
        OR: [
          { roleId: { in: orphanedRoleSkills.map(rs => rs.roleId) } },
          { skillId: { in: orphanedRoleSkills.map(rs => rs.skillId) } }
        ]
      }
    })
    console.log(`Deleted ${result.count} orphaned RoleSkills`)
  } else {
    console.log('No orphaned RoleSkills to delete')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 