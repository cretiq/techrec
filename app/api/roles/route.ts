import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Role } from '@/lib/models'
import mongoose from 'mongoose'

// Cache roles for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
let cachedRoles: any[] = []
let lastFetchTime = 0

export async function GET() {
  try {
    // Check if we have cached data that's still valid
    const now = Date.now()
    if (cachedRoles.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json(cachedRoles)
    }

    const db = await connectToDatabase()
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }

    // Ensure Mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!)
    }

    // Only fetch necessary fields and limit the query time
    const roles = await Role.find()
      .select('title company description skills status createdAt')
      .populate('company', 'name')
      .sort({ createdAt: -1 })
      .maxTimeMS(10000) // 10 second timeout
      .lean() // Convert to plain objects for better performance

    // Cache the results
    cachedRoles = roles
    lastFetchTime = now

    return NextResponse.json(roles)
  } catch (error: any) {
    console.error('Error fetching roles:', error)
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
} 