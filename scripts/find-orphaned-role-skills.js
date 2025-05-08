import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('[Script: FindOrphanedRoleSkills] === Finding Orphaned RoleSkills ===')
  
  // Get all RoleSkills
  const roleSkills = await prisma.roleSkill.findMany()
  console.log(`[Script: FindOrphanedRoleSkills] Found ${roleSkills.length} total RoleSkills`)

  // Get all Role IDs
  const roles = await prisma.role.findMany({
    select: { id: true }
  })
  const roleIds = new Set(roles.map(r => r.id))
  console.log(`[Script: FindOrphanedRoleSkills] Found ${roleIds.size} roles`)

  // Get all Skill IDs
  const skills = await prisma.skill.findMany({
    select: { id: true }
  })
  const skillIds = new Set(skills.map(s => s.id))
  console.log(`[Script: FindOrphanedRoleSkills] Found ${skillIds.size} skills`)

  // Find orphaned RoleSkills
  const orphanedRoleSkills = roleSkills.filter(rs => {
    return !roleIds.has(rs.roleId) || !skillIds.has(rs.skillId)
  })

  console.log(`[Script: FindOrphanedRoleSkills] \nFound ${orphanedRoleSkills.length} orphaned RoleSkills:`)
  
  if (orphanedRoleSkills.length > 0) {
    const missingRoleIds = new Set()
    const missingSkillIds = new Set()

    orphanedRoleSkills.forEach(rs => {
      const isRoleMissing = !roleIds.has(rs.roleId)
      const isSkillMissing = !skillIds.has(rs.skillId)
      if (isRoleMissing) missingRoleIds.add(rs.roleId)
      if (isSkillMissing) missingSkillIds.add(rs.skillId)
      
      console.log(`[Script: FindOrphanedRoleSkills] \nRoleSkill ID: ${rs.id}`)
      console.log(`[Script: FindOrphanedRoleSkills] Role ID: ${rs.roleId} ${isRoleMissing ? '(MISSING)' : ''}`)
      console.log(`[Script: FindOrphanedRoleSkills] Skill ID: ${rs.skillId} ${isSkillMissing ? '(MISSING)' : ''}`)
      console.log(`[Script: FindOrphanedRoleSkills] Required Level: ${rs.requiredLevel}`)
    })

    // Instructions for deletion
    console.log('[Script: FindOrphanedRoleSkills] \nTo delete these orphaned records, run a script with:')
    console.log('[Script: FindOrphanedRoleSkills] await prisma.roleSkill.deleteMany({')
    console.log('[Script: FindOrphanedRoleSkills]   where: {')
    console.log('[Script: FindOrphanedRoleSkills]     id: { in: [' + orphanedRoleSkills.map(rs => `'${rs.id}'`).join(', ') + '] }')
    console.log('[Script: FindOrphanedRoleSkills]   }')
    console.log('[Script: FindOrphanedRoleSkills] })')
    console.log('[Script: FindOrphanedRoleSkills] Missing Role IDs encountered:', Array.from(missingRoleIds))
    console.log('[Script: FindOrphanedRoleSkills] Missing Skill IDs encountered:', Array.from(missingSkillIds))
  } else {
    console.log('[Script: FindOrphanedRoleSkills] No orphaned RoleSkills found.')
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