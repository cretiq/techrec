import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

async function deleteAllRoles() {
  const client = new MongoClient(uri as string)
  
  try {
    await client.connect()
    const db = client.db('techrec')
    
    // Delete all roles
    const result = await db.collection('Role').deleteMany({})
    console.log(`Successfully deleted ${result.deletedCount} roles`)
  } catch (error) {
    console.error('Error deleting roles:', error)
  } finally {
    await client.close()
  }
}

deleteAllRoles() 