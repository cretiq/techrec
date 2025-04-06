import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Get all developers
    const developers = await prisma.developer.findMany()
    
    // Update each developer to set profileEmail equal to email
    for (const developer of developers) {
      await prisma.developer.update({
        where: { id: developer.id },
        data: { profileEmail: developer.email }
      })
    }
    
    console.log('Successfully updated all developer profiles')
  } catch (error) {
    console.error('Error updating developer profiles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 