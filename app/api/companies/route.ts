import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const companies = await prisma.company.findMany({
      include: {
        roles: true
      }
    })
    
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
    
    const company = await prisma.company.create({
      data: {
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        roles: true
      }
    })
    
    return NextResponse.json(company)
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
} 