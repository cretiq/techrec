import { NextResponse } from 'next/server';
import { handleCvAnalysisRequest } from './controller';

/**
 * POST handler for the /api/v1/cv/analyze endpoint.
 * Delegates processing to the controller.
 */
export async function POST(request: Request) {
  console.log('Received POST request to /api/v1/cv/analyze');
  try {
    // --- Authentication Check (Placeholder) ---
    // Implement API key check based on Section 4.2 of the spec
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey /* || !isValidApiKey(apiKey) */) {
      console.warn('Missing or invalid API key');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // --- End Authentication Check ---

    // --- Rate Limiting Check (Placeholder) ---
    // Implement rate limiting logic based on Section 4.3 of the spec
    // const isRateLimited = await checkRateLimit(apiKey);
    // if (isRateLimited) {
    //   return NextResponse.json({ error: 'Too Many Requests' }, { status: 429, headers: { 'Retry-After': '60' } });
    // }
    // --- End Rate Limiting Check ---

    const body = await request.json();
    const result = await handleCvAnalysisRequest(body);

    // Assuming handleCvAnalysisRequest returns the final response structure
    // or throws specific errors handled below.
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('[API /cv/analyze] Error:', error);

    // Handle specific known errors (e.g., from parser or controller)
    if (error.name === 'UnsupportedFormatError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.name === 'ParsingLibraryError' || error.message === 'Missing cv_text') {
        return NextResponse.json({ error: error.message || 'Bad Request' }, { status: 400 });
    }
    // Add more specific error handling as needed

    // Default to 500 Internal Server Error
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 