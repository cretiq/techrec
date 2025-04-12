import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

async function deleteCollections() {
  const client = new MongoClient(uri as string)
  
  try {
    await client.connect()
    const db = client.db('techrec')
    
    const collections = [
      'Role',
      'RoleSkill',
      'Skill',
      'Company',
      'SkillCategory'
    ]
    
    for (const collection of collections) {
      const result = await db.collection(collection).deleteMany({})
      console.log(`Successfully deleted ${result.deletedCount} documents from ${collection}`)
    }
  } catch (error) {
    console.error('Error deleting collections:', error)
  } finally {
    await client.close()
  }
}

deleteCollections() 