import { prisma } from '../lib/prisma'

async function fixRolesCompany() {
  try {
    // First, let's get or create a default company
    let company = await prisma.company.findFirst()
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Default Company',
          description: 'Default company for existing roles',
          website: 'https://example.com',
          industry: 'Technology'
        }
      })
      console.log('Created default company:', company)
    }

    // Get all roles
    const roles = await prisma.role.findMany()
    
    // Update roles that have null companyId
    let updatedCount = 0
    for (const role of roles) {
      if (!role.companyId) {
        await prisma.role.update({
          where: { id: role.id },
          data: { companyId: company.id }
        })
        updatedCount++
      }
    }

    console.log(`Updated ${updatedCount} roles with default company ID`)
  } catch (error) {
    console.error('Error fixing roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixRolesCompany() 