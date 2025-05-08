import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('[Script: CleanupOrphanedRoleSkills] === Cleaning Up Orphaned RoleSkills ===')
  
  // 1. Get all existing RoleSkills
  const roleSkills = await prisma.roleSkill.findMany({})
  console.log(`[Script: CleanupOrphanedRoleSkills] Found ${roleSkills.length} total RoleSkills`)

  // 2. Get all existing Role IDs
  const roles = await prisma.role.findMany({
    select: { id: true }
  })
  const roleIds = new Set(roles.map(r => r.id))
  console.log(`[Script: CleanupOrphanedRoleSkills] Found ${roleIds.size} roles`)

  // 3. Get all existing Skill IDs
  const skills = await prisma.skill.findMany({
    select: { id: true }
  })
  const skillIds = new Set(skills.map(s => s.id))
  console.log(`[Script: CleanupOrphanedRoleSkills] Found ${skillIds.size} skills`)

  // 4. Find RoleSkills where either roleId or skillId doesn't exist
  const orphanedRoleSkills = roleSkills.filter(rs => {
    return !roleIds.has(rs.roleId) || !skillIds.has(rs.skillId)
  })

  console.log(`[Script: CleanupOrphanedRoleSkills] \nFound ${orphanedRoleSkills.length} orphaned RoleSkills to delete`)

  if (orphanedRoleSkills.length > 0) {
    const orphanedIds = orphanedRoleSkills.map(rs => rs.id)
    const orphanedRoleIds = new Set(orphanedRoleSkills.filter(rs => !roleIds.has(rs.roleId)).map(rs => rs.roleId))
    const orphanedSkillIds = new Set(orphanedRoleSkills.filter(rs => !skillIds.has(rs.skillId)).map(rs => rs.skillId))

    console.log('[Script: CleanupOrphanedRoleSkills] Orphaned Role IDs:', Array.from(orphanedRoleIds))
    console.log('[Script: CleanupOrphanedRoleSkills] Orphaned Skill IDs:', Array.from(orphanedSkillIds))
    
    // 5. Delete the orphaned RoleSkills
    const result = await prisma.roleSkill.deleteMany({
      where: {
        id: { in: orphanedIds }
      }
    })
    console.log(`[Script: CleanupOrphanedRoleSkills] Deleted ${result.count} orphaned RoleSkills`)
  } else {
    console.log('[Script: CleanupOrphanedRoleSkills] No orphaned RoleSkills to delete')
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