import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function clearUsers() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('techrec');
    
    // Clear users collection
    const result = await db.collection('users').deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);
    
    // Clear accounts collection
    const accountsResult = await db.collection('accounts').deleteMany({});
    console.log(`Deleted ${accountsResult.deletedCount} accounts`);
    
    // Clear sessions collection
    const sessionsResult = await db.collection('sessions').deleteMany({});
    console.log(`Deleted ${sessionsResult.deletedCount} sessions`);
    
    console.log('Successfully cleared all users and related data');
  } catch (error) {
    console.error('Error clearing users:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

clearUsers(); 