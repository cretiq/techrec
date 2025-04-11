import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const companies = [
  {
    name: 'InnovateAI',
    description: 'A cutting-edge AI company specializing in machine learning solutions for enterprise clients.',
    website: 'https://innovateai.com',
    location: 'San Francisco, CA',
    size: 'FROM_50_TO_250',
    industry: ['Artificial Intelligence', 'Machine Learning', 'Enterprise Software'],
    funding: 'SERIES_B',
    verified: true,
    roles: [
      {
        title: 'Senior Machine Learning Engineer',
        description: 'Lead the development of our core ML models and algorithms.',
        location: 'San Francisco, CA',
        salary: '$180,000 - $220,000',
        type: 'FULL_TIME',
        remote: true,
        visaSponsorship: true,
        requirements: [
          'PhD in Computer Science or related field',
          '5+ years of ML engineering experience',
          'Expert in Python and ML frameworks',
          'Experience with large-scale ML systems'
        ]
      },
      {
        title: 'AI Research Scientist',
        description: 'Conduct cutting-edge research in machine learning and AI.',
        location: 'San Francisco, CA',
        salary: '$160,000 - $200,000',
        type: 'FULL_TIME',
        remote: true,
        visaSponsorship: true,
        requirements: [
          'PhD in ML/AI or related field',
          'Strong publication record',
          'Experience with deep learning',
          'Knowledge of reinforcement learning'
        ]
      }
    ]
  },
  {
    name: 'CloudTech Solutions',
    description: 'Enterprise cloud infrastructure and DevOps solutions provider.',
    website: 'https://cloudtech.com',
    location: 'Seattle, WA',
    size: 'FROM_250_TO_1000',
    industry: ['Cloud Computing', 'DevOps', 'Infrastructure'],
    funding: 'SERIES_C',
    verified: true,
    roles: [
      {
        title: 'Senior DevOps Engineer',
        description: 'Design and implement cloud infrastructure solutions.',
        location: 'Seattle, WA',
        salary: '$150,000 - $190,000',
        type: 'FULL_TIME',
        remote: true,
        visaSponsorship: true,
        requirements: [
          '5+ years of DevOps experience',
          'Expert in AWS/GCP/Azure',
          'Strong Kubernetes knowledge',
          'Experience with infrastructure as code'
        ]
      },
      {
        title: 'Cloud Security Engineer',
        description: 'Ensure the security of our cloud infrastructure and services.',
        location: 'Seattle, WA',
        salary: '$140,000 - $180,000',
        type: 'FULL_TIME',
        remote: true,
        visaSponsorship: true,
        requirements: [
          '4+ years of security experience',
          'Cloud security certifications',
          'Knowledge of security best practices',
          'Experience with security tools'
        ]
      }
    ]
  },
  {
    name: 'WebCraft Studios',
    description: 'Creative web development agency specializing in modern web applications.',
    website: 'https://webcraftstudios.com',
    location: 'New York, NY',
    size: 'FROM_10_TO_50',
    industry: ['Web Development', 'Design', 'Digital Agency'],
    funding: 'SEED',
    verified: true,
    roles: [
      {
        title: 'Senior Frontend Developer',
        description: 'Lead frontend development for client projects.',
        location: 'New York, NY',
        salary: '$130,000 - $160,000',
        type: 'FULL_TIME',
        remote: true,
        visaSponsorship: false,
        requirements: [
          '5+ years of frontend experience',
          'Expert in React and TypeScript',
          'Strong UI/UX skills',
          'Experience with modern web tools'
        ]
      },
      {
        title: 'UI/UX Designer',
        description: 'Create beautiful and functional user interfaces.',
        location: 'New York, NY',
        salary: '$100,000 - $130,000',
        type: 'FULL_TIME',
        remote: true,
        visaSponsorship: false,
        requirements: [
          '3+ years of design experience',
          'Strong portfolio',
          'Experience with Figma/Sketch',
          'Understanding of web development'
        ]
      }
    ]
  }
]

async function createCompaniesAndRoles() {
  const client = new MongoClient(uri as string)
  
  try {
    await client.connect()
    const db = client.db('techrec')

    // Create companies and their roles
    for (const company of companies) {
      const { roles, ...companyData } = company
      
      // Create company
      const companyResult = await db.collection('Company').insertOne({
        ...companyData,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Create roles for this company
      const rolesWithCompany = roles.map(role => ({
        ...role,
        companyId: companyResult.insertedId,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      const rolesResult = await db.collection('Role').insertMany(rolesWithCompany)
      
      console.log(`\nCreated company: ${company.name}`)
      console.log(`Roles created: ${rolesResult.insertedCount}`)
      roles.forEach(role => {
        console.log(`- ${role.title}`)
      })
    }
  } catch (error) {
    console.error('Error creating companies and roles:', error)
  } finally {
    await client.close()
  }
}

createCompaniesAndRoles() 