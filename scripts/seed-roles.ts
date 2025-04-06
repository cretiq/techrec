import { config } from 'dotenv'
import { resolve } from 'path'
import { MongoClient, ObjectId } from 'mongodb'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const client = new MongoClient(uri)

const companies = [
  {
    name: "TechCorp Inc.",
    description: "A leading technology company specializing in web applications and cloud solutions.",
    website: "https://techcorp.example.com",
    logo: "https://techcorp.example.com/logo.png",
  },
  {
    name: "DataSystems LLC",
    description: "Enterprise software solutions provider focusing on data management and analytics.",
    website: "https://datasystems.example.com",
    logo: "https://datasystems.example.com/logo.png",
  },
  {
    name: "InnovateSoft",
    description: "Innovative software development company creating cutting-edge solutions.",
    website: "https://innovatesoft.example.com",
    logo: "https://innovatesoft.example.com/logo.png",
  }
]

const roles = [
  {
    title: "Senior Frontend Developer",
    description: "Lead frontend development for our next-generation web applications.",
    skills: ["React", "TypeScript", "Next.js", "Redux", "GraphQL"],
    company: "", // Will be set after company creation
  },
  {
    title: "Backend Engineer",
    description: "Develop scalable APIs and microservices for our growing platform.",
    skills: ["Node.js", "Express", "MongoDB", "AWS", "Docker"],
    company: "", // Will be set after company creation
  },
  {
    title: "Full Stack Developer",
    description: "Work on all aspects of our web application, from database to frontend.",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "GraphQL"],
    company: "", // Will be set after company creation
  },
  {
    title: "DevOps Engineer",
    description: "Build and maintain our cloud infrastructure and CI/CD pipelines.",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins"],
    company: "", // Will be set after company creation
  }
]

const developers = [
  {
    name: "Alex Johnson",
    title: "Senior Frontend Developer",
    email: "alex.johnson@example.com",
    skills: [
      { name: "React", level: "expert" },
      { name: "TypeScript", level: "advanced" },
      { name: "JavaScript", level: "expert" },
      { name: "HTML/CSS", level: "expert" },
      { name: "Next.js", level: "advanced" },
    ],
    experience: [
      {
        title: "Senior Frontend Developer",
        company: "TechCorp Inc.",
        description: "Lead frontend development for multiple projects, mentored junior developers.",
        startDate: new Date("2020-01-01"),
        current: true,
      }
    ]
  },
  {
    name: "Sarah Chen",
    title: "Full Stack Developer",
    email: "sarah.chen@example.com",
    skills: [
      { name: "React", level: "advanced" },
      { name: "Node.js", level: "expert" },
      { name: "TypeScript", level: "advanced" },
      { name: "PostgreSQL", level: "advanced" },
      { name: "Docker", level: "intermediate" },
    ],
    experience: [
      {
        title: "Full Stack Developer",
        company: "DataSystems LLC",
        description: "Built and maintained microservices architecture handling over 1M daily requests.",
        startDate: new Date("2019-06-01"),
        current: true,
      }
    ]
  }
]

async function seedDatabase() {
  try {
    await client.connect()
    const db = client.db('techrec')

    // Clear existing data
    await db.collection('companies').deleteMany({})
    await db.collection('roles').deleteMany({})
    await db.collection('developers').deleteMany({})

    // Insert companies
    const companiesResult = await db.collection('companies').insertMany(
      companies.map(company => ({
        ...company,
        roles: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )

    // Get company IDs
    const companyIds = Object.values(companiesResult.insertedIds)

    // Insert roles with company references
    const rolesWithCompanies = roles.map((role, index) => ({
      ...role,
      company: companyIds[index % companyIds.length],
      status: 'open',
      applications: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    const rolesResult = await db.collection('roles').insertMany(rolesWithCompanies)

    // Update companies with role references
    for (const [index, roleId] of Object.entries(rolesResult.insertedIds)) {
      const companyId = companyIds[parseInt(index) % companyIds.length]
      await db.collection('companies').updateOne(
        { _id: companyId },
        { $push: { roles: roleId } }
      )
    }

    // Insert developers
    const developersResult = await db.collection('developers').insertMany(
      developers.map(developer => ({
        ...developer,
        applications: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )

    console.log('Database seeded successfully!')
    console.log(`Inserted ${companiesResult.insertedCount} companies`)
    console.log(`Inserted ${rolesResult.insertedCount} roles`)
    console.log(`Inserted ${developersResult.insertedCount} developers`)
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await client.close()
    process.exit(0)
  }
}

seedDatabase() 