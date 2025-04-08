import { prisma } from '../lib/prisma'

async function main() {
  try {
    const result = await prisma.developer.deleteMany({})
    console.log(`Deleted ${result.count} developers`)
  } catch (error) {
    console.error('Error deleting developers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 