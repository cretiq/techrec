import { config } from 'dotenv'
import { resolve } from 'path'
import { MongoClient } from 'mongodb'

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
    role: "Senior Frontend Developer",
    description: "We're looking for a Senior Frontend Developer to join our team and help build our next-generation web applications. The ideal candidate will have strong experience with modern frontend technologies and a passion for creating exceptional user experiences.",
    skills: ["React", "TypeScript", "CSS", "Next.js", "Redux", "GraphQL", "Jest", "Webpack"]
  },
  {
    name: "DataSystems LLC",
    role: "Backend Engineer",
    description: "Join our backend team to develop scalable APIs and microservices for our growing platform. We need someone who can design and implement robust, high-performance systems that can handle millions of requests daily.",
    skills: ["Node.js", "Express", "MongoDB", "AWS", "Docker", "Kubernetes", "Redis", "GraphQL"]
  },
  {
    name: "InnovateSoft",
    role: "Full Stack Developer",
    description: "Looking for a Full Stack Developer to work on all aspects of our web application, from database to frontend. You'll be working on a modern tech stack and helping to shape our product's architecture.",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "GraphQL", "Docker", "AWS", "Jest"]
  },
  {
    name: "CloudTech Solutions",
    role: "DevOps Engineer",
    description: "We need a DevOps Engineer to help us build and maintain our cloud infrastructure. The role involves working with modern cloud technologies and implementing CI/CD pipelines.",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitLab CI", "Prometheus", "Grafana"]
  },
  {
    name: "AI Research Labs",
    role: "Machine Learning Engineer",
    description: "Join our AI research team to develop cutting-edge machine learning models and algorithms. We're working on innovative solutions in natural language processing and computer vision.",
    skills: ["Python", "TensorFlow", "PyTorch", "scikit-learn", "Docker", "AWS", "Git", "Jupyter"]
  }
]

const profiles = [
  {
    name: "Alex Johnson",
    title: "Senior Frontend Developer",
    skills: [
      { name: "React", level: "expert" },
      { name: "TypeScript", level: "advanced" },
      { name: "JavaScript", level: "expert" },
      { name: "HTML/CSS", level: "expert" },
      { name: "Next.js", level: "advanced" },
      { name: "Redux", level: "intermediate" },
      { name: "GraphQL", level: "intermediate" },
      { name: "Node.js", level: "intermediate" }
    ],
    experience: [
      {
        title: "Senior Frontend Developer",
        company: "TechCorp Inc.",
        description: "Lead frontend development for multiple projects, mentored junior developers, and implemented performance optimizations that improved load times by 40%."
      },
      {
        title: "Frontend Developer",
        company: "WebTech Solutions",
        description: "Developed and maintained multiple client-facing applications using React and TypeScript, resulting in a 25% increase in user engagement."
      }
    ]
  },
  {
    name: "Sarah Chen",
    title: "Full Stack Developer",
    skills: [
      { name: "React", level: "advanced" },
      { name: "Node.js", level: "expert" },
      { name: "TypeScript", level: "advanced" },
      { name: "PostgreSQL", level: "advanced" },
      { name: "Docker", level: "intermediate" },
      { name: "AWS", level: "intermediate" },
      { name: "GraphQL", level: "advanced" },
      { name: "Python", level: "intermediate" }
    ],
    experience: [
      {
        title: "Full Stack Developer",
        company: "DataSystems LLC",
        description: "Built and maintained microservices architecture handling over 1M daily requests, implemented caching strategies reducing database load by 60%."
      },
      {
        title: "Backend Developer",
        company: "API Solutions",
        description: "Developed RESTful APIs and GraphQL endpoints for various client applications, improving API response times by 45%."
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
    await db.collection('profiles').deleteMany({})

    // Insert new data
    const companiesResult = await db.collection('companies').insertMany(
      companies.map(company => ({
        ...company,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )

    const profilesResult = await db.collection('profiles').insertMany(
      profiles.map(profile => ({
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )

    console.log('Database seeded successfully!')
    console.log(`Inserted ${companiesResult.insertedCount} companies`)
    console.log(`Inserted ${profilesResult.insertedCount} profiles`)
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await client.close()
    process.exit(0)
  }
}

seedDatabase() 