const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Get all roles
  const roles = await prisma.role.findMany({
    include: {
      skills: true
    }
  })

  console.log('=== Roles Analysis ===')
  console.log(`Total roles: ${roles.length}`)
  
  const rolesWithSkills = roles.filter(role => role.skills.length > 0)
  const rolesWithoutSkills = roles.filter(role => role.skills.length === 0)
  
  console.log(`Roles with skills: ${rolesWithSkills.length}`)
  console.log(`Roles without skills: ${rolesWithoutSkills.length}`)
  
  if (rolesWithoutSkills.length > 0) {
    console.log('\n=== Roles Without Skills ===')
    rolesWithoutSkills.forEach(role => {
      console.log(`- ${role.title} (ID: ${role.id})`)
    })
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