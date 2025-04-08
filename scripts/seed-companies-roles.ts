import { prisma } from '../lib/prisma'

const companies = [
  {
    name: 'TechCorp Solutions',
    description: 'Leading provider of enterprise software solutions',
    website: 'https://techcorp.example.com',
    location: 'Stockholm, Sweden',
    size: '500-1000',
    industry: 'Software Development'
  },
  {
    name: 'Nordic Innovations',
    description: 'Pioneering sustainable technology solutions',
    website: 'https://nordicinnovations.example.com',
    location: 'Gothenburg, Sweden',
    size: '100-500',
    industry: 'Technology'
  },
  {
    name: 'Digital Health AB',
    description: 'Revolutionary healthcare technology solutions',
    website: 'https://digitalhealth.example.com',
    location: 'Malmö, Sweden',
    size: '50-100',
    industry: 'Healthcare Technology'
  }
]

const createRolesForCompany = (companyId: string) => [
  {
    title: 'Senior Frontend Developer',
    companyId,
    description: 'Lead frontend development for our next-generation web applications',
    requirements: [
      'Expert in React and TypeScript',
      '5+ years of frontend development',
      'Experience with Next.js',
      'Strong UI/UX skills'
    ],
    location: 'Stockholm, Sweden',
    salary: '55,000 - 65,000 SEK/month',
    type: 'Full-time'
  },
  {
    title: 'Backend Engineer',
    companyId,
    description: 'Design and implement scalable backend services',
    requirements: [
      'Strong Node.js experience',
      'Experience with MongoDB',
      'Knowledge of microservices architecture',
      'Proficient in API design'
    ],
    location: 'Remote (Sweden)',
    salary: '50,000 - 60,000 SEK/month',
    type: 'Full-time'
  },
  {
    title: 'DevOps Engineer',
    companyId,
    description: 'Manage and improve our cloud infrastructure',
    requirements: [
      'AWS certification',
      'Experience with Kubernetes',
      'Strong scripting skills',
      'CI/CD expertise'
    ],
    location: 'Hybrid (Stockholm)',
    salary: '52,000 - 62,000 SEK/month',
    type: 'Full-time'
  }
]

async function main() {
  try {
    console.log('Starting to seed companies and roles...')

    // Clear existing data
    await prisma.role.deleteMany()
    await prisma.company.deleteMany()
    console.log('Cleared existing companies and roles')

    // Create companies
    for (const companyData of companies) {
      const company = await prisma.company.create({
        data: companyData
      })
      console.log(`Created company: ${company.name}`)

      // Create roles for this company
      const roles = createRolesForCompany(company.id)
      for (const roleData of roles) {
        const role = await prisma.role.create({
          data: roleData
        })
        console.log(`Created role: ${role.title} for ${company.name}`)
      }
    }

    console.log('Seeding completed successfully')
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 