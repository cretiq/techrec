const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('=== Finding Orphaned RoleSkills ===')
  
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

  console.log(`\nFound ${orphanedRoleSkills.length} orphaned RoleSkills:`)
  
  for (const rs of orphanedRoleSkills) {
    const isRoleMissing = !roleIds.has(rs.roleId)
    const isSkillMissing = !skillIds.has(rs.skillId)
    
    console.log(`\nRoleSkill ID: ${rs.id}`)
    console.log(`Role ID: ${rs.roleId} ${isRoleMissing ? '(MISSING)' : ''}`)
    console.log(`Skill ID: ${rs.skillId} ${isSkillMissing ? '(MISSING)' : ''}`)
    console.log(`Required Level: ${rs.requiredLevel}`)
  }

  if (orphanedRoleSkills.length > 0) {
    console.log('\nTo delete these orphaned records, run:')
    console.log('await prisma.roleSkill.deleteMany({')
    console.log('  where: {')
    console.log('    OR: [')
    console.log('      { roleId: { in: [/* missing role IDs */] } },')
    console.log('      { skillId: { in: [/* missing skill IDs */] } }')
    console.log('    ]')
    console.log('  }')
    console.log('})')
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