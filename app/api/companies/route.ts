import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db'
import { Company } from '@/lib/models/Company'

// Cache companies for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
let cachedCompanies: any[] = []
let lastFetchTime = 0

export async function GET() {
  try {
    // Check if we have cached data that's still valid
    const now = Date.now()
    if (cachedCompanies.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json(cachedCompanies)
    }

    const client = await clientPromise
    const db = client.db('techrec')
    
    // Only fetch necessary fields and limit the query time
    const companies = await db.collection('companies')
      .find({}, { projection: { name: 1, description: 1, logo: 1, website: 1 } })
      .maxTimeMS(10000) // 10 second timeout
      .toArray()
    
    // Cache the results
    cachedCompanies = companies
    lastFetchTime = now
    
    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('techrec')
    
    const result = await db.collection('companies').insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    
    return NextResponse.json({ 
      _id: result.insertedId,
      ...body,
    })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
} 