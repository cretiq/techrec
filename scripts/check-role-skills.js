const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Get all RoleSkills directly
  const roleSkills = await prisma.roleSkill.findMany({
    include: {
      role: true
    }
  })

  console.log('=== RoleSkills Analysis ===')
  console.log(`Total RoleSkills: ${roleSkills.length}`)

  // Get all unique skillIds from RoleSkills
  const skillIds = [...new Set(roleSkills.map(rs => rs.skillId))]
  console.log(`Unique skillIds: ${skillIds.length}`)

  // Get all existing Skills
  const skills = await prisma.skill.findMany({
    where: {
      id: {
        in: skillIds
      }
    }
  })
  console.log(`Found Skills: ${skills.length}`)

  // Find missing skillIds
  const existingSkillIds = new Set(skills.map(s => s.id))
  const missingSkillIds = skillIds.filter(id => !existingSkillIds.has(id))

  if (missingSkillIds.length > 0) {
    console.log('\n=== Missing Skills ===')
    missingSkillIds.forEach(skillId => {
      const affectedRoleSkills = roleSkills.filter(rs => rs.skillId === skillId)
      console.log(`\nSkillId ${skillId} is missing but referenced by:`)
      affectedRoleSkills.forEach(rs => {
        console.log(`- Role: ${rs.role.title} (RoleSkill ID: ${rs.id})`)
      })
    })
  } else {
    console.log('\nAll Skills exist!')
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