const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('=== Investigating RoleSkill History ===')
  
  // Get all RoleSkills
  const roleSkills = await prisma.roleSkill.findMany()
  console.log(`Found ${roleSkills.length} total RoleSkills`)

  // Get all Role IDs
  const roles = await prisma.role.findMany({
    select: { id: true, title: true, createdAt: true }
  })
  const roleIds = new Set(roles.map(r => r.id))
  console.log(`Found ${roleIds.size} roles`)

  // Get all Skill IDs
  const skills = await prisma.skill.findMany({
    select: { id: true, name: true, createdAt: true }
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
    console.log(`Created At: ${rs.createdAt}`)
    console.log(`Role ID: ${rs.roleId} ${isRoleMissing ? '(MISSING)' : ''}`)
    console.log(`Skill ID: ${rs.skillId} ${isSkillMissing ? '(MISSING)' : ''}`)
    console.log(`Required Level: ${rs.requiredLevel}`)

    // If the role exists, show its details
    if (!isRoleMissing) {
      const role = roles.find(r => r.id === rs.roleId)
      console.log(`Role Title: ${role.title}`)
      console.log(`Role Created At: ${role.createdAt}`)
    }

    // If the skill exists, show its details
    if (!isSkillMissing) {
      const skill = skills.find(s => s.id === rs.skillId)
      console.log(`Skill Name: ${skill.name}`)
      console.log(`Skill Created At: ${skill.createdAt}`)
    }
  }

  // Check if there are any roles or skills that were created after their RoleSkills
  const suspiciousRecords = roleSkills.filter(rs => {
    const role = roles.find(r => r.id === rs.roleId)
    const skill = skills.find(s => s.id === rs.skillId)
    
    return (role && role.createdAt > rs.createdAt) || 
           (skill && skill.createdAt > rs.createdAt)
  })

  if (suspiciousRecords.length > 0) {
    console.log('\nFound suspicious records where RoleSkills were created before their references:')
    for (const rs of suspiciousRecords) {
      console.log(`\nRoleSkill ID: ${rs.id}`)
      console.log(`Created At: ${rs.createdAt}`)
    }
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