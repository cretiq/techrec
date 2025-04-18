import { NextResponse } from 'next/server'
import mockJobResponse from './rapidapi_job_response_example.json'


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const limit = searchParams.get('limit') || '3'
  const offset = searchParams.get('offset') || '0'
  const titleFilter = searchParams.get('title') || 'Software Engineer' // Default search term
  const locationFilter = searchParams.get('location') || 'United States' // Default location

  console.log('\n=== Input Parameters ===')
  console.log('Title Filter:', titleFilter)
  console.log('Location Filter:', locationFilter)

  // Return mock data instead of making API call
  return NextResponse.json(mockJobResponse)
} 