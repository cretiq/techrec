import { NextResponse } from 'next/server'
import mockJobResponse from './rapidapi_job_response_example.json'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const limit = searchParams.get('limit') || '3'
  const offset = searchParams.get('offset') || '0'
  const titleFilter = searchParams.get('title') || 'Software Engineer' // Default search term
  const locationFilter = searchParams.get('location') || 'United States' // Default location

    // // Encode parameters with proper space encoding and quotes
    // const baseUrl = 'https://linkedin-job-search-api.p.rapidapi.com/active-jb-7d'
    // const encodedTitle = encodeURIComponent(`"${titleFilter}"`).replace(/\+/g, '%20')
    // const encodedLocation = encodeURIComponent(`"${locationFilter}"`).replace(/\+/g, '%20')
    
    // // Construct the URL with all parameters
    // const urlString = `${baseUrl}?limit=${limit}&offset=${offset}&title_filter=${encodedTitle}&location_filter=${encodedLocation}`
  
    // // TODO: Replace hardcoded keys with environment variables for security
    // const apiKey = '9fa34e3b7cmsh745fe1b093c64adp1d29c6jsn1769025d5f92'
    // const apiHost = 'linkedin-job-search-api.p.rapidapi.com'
  
    // const options = {
    //   method: 'GET',
    //   headers: {
    //     'x-rapidapi-key': apiKey,
    //     'x-rapidapi-host': apiHost,
    //   },
    // }
  
    // console.log('Making API request with URL:', urlString)
  
    // try {
    //   const response = await fetch(urlString, options)
  
    //   if (!response.ok) {
    //     // Log the error response from RapidAPI for debugging
    //     const errorText = await response.text()
    //     console.error(`RapidAPI Error: ${response.status} - ${errorText}`)
    //     return NextResponse.json(
    //       { error: `Failed to fetch jobs from RapidAPI: ${response.status}` },
    //       { status: response.status }
    //     )
    //   }
  
    //   const result = await response.json()
    //   return NextResponse.json(result)
  
    // } catch (error: any) {
    //   console.error('Internal Server Error fetching from RapidAPI:', error)
    //   return NextResponse.json(
    //     { error: `Internal Server Error: ${error.message}` },
    //     { status: 500 }
    //   )
    // }
  // Return mock data instead of making API call
  return NextResponse.json(mockJobResponse)
} 