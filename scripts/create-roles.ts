import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const roles = [
  {
    title: 'Senior Full Stack Developer',
    description: 'Looking for an experienced Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
    location: 'San Francisco, CA',
    salary: '$140,000 - $180,000',
    type: 'FULL_TIME',
    remote: true,
    visaSponsorship: true,
    requirements: [
      '7+ years of experience in full stack development',
      'Expert in React, Node.js, and TypeScript',
      'Experience with cloud platforms (AWS/GCP)',
      'Strong understanding of system design and architecture'
    ]
  },
  {
    title: 'Machine Learning Engineer',
    description: 'Join our AI team to develop and deploy machine learning models that power our core products. You will work on cutting-edge ML solutions.',
    location: 'New York, NY',
    salary: '$150,000 - $190,000',
    type: 'FULL_TIME',
    remote: false,
    visaSponsorship: true,
    requirements: [
      'MS/PhD in Computer Science or related field',
      'Strong background in ML/DL frameworks',
      'Experience with Python and ML deployment',
      'Published research papers is a plus'
    ]
  },
  {
    title: 'DevOps Engineer (Contract)',
    description: 'Short-term contract role for an experienced DevOps engineer to help us improve our CI/CD pipeline and cloud infrastructure.',
    location: 'Remote',
    salary: '$100/hour',
    type: 'CONTRACT',
    remote: true,
    visaSponsorship: false,
    requirements: [
      '5+ years of DevOps experience',
      'Expert in Kubernetes and Docker',
      'Experience with infrastructure as code',
      'Strong scripting skills (Python/Bash)'
    ]
  },
  {
    title: 'Frontend Developer Intern',
    description: 'Summer internship opportunity for a passionate frontend developer to work on our user-facing applications.',
    location: 'Austin, TX',
    salary: '$40/hour',
    type: 'INTERNSHIP',
    remote: false,
    visaSponsorship: true,
    requirements: [
      'Currently pursuing CS degree or equivalent',
      'Knowledge of React and modern JavaScript',
      'Strong CSS and design skills',
      'Previous internship experience is a plus'
    ]
  },
  {
    title: 'Mobile App Developer',
    description: 'Part-time opportunity to help develop and maintain our mobile applications for iOS and Android platforms.',
    location: 'Seattle, WA',
    salary: '$80,000 - $100,000',
    type: 'PART_TIME',
    remote: true,
    visaSponsorship: false,
    requirements: [
      '3+ years of mobile development experience',
      'Proficiency in React Native',
      'Experience with native iOS/Android development',
      'Understanding of mobile UI/UX principles'
    ]
  }
]

async function createRoles() {
  const client = new MongoClient(uri as string)
  
  try {
    await client.connect()
    const db = client.db('techrec')

    // First, create a company
    const company = await db.collection('Company').insertOne({
      name: 'TechCorp Global',
      description: 'A leading technology company specializing in innovative software solutions.',
      website: 'https://techcorp-global.com',
      location: 'San Francisco, CA',
      size: 'FROM_50_TO_250',
      industry: ['Software', 'Artificial Intelligence', 'Cloud Computing'],
      funding: 'SERIES_B',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Create roles with company reference
    const rolesWithCompany = roles.map(role => ({
      ...role,
      companyId: company.insertedId,
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    const result = await db.collection('Role').insertMany(rolesWithCompany)
    
    console.log('Successfully created company and roles:')
    console.log('Company:', 'TechCorp Global')
    console.log('Roles created:', result.insertedCount)
    roles.forEach(role => {
      console.log(`- ${role.title} (${role.type})`)
    })
  } catch (error) {
    console.error('Error creating roles:', error)
  } finally {
    await client.close()
  }
}

createRoles() 