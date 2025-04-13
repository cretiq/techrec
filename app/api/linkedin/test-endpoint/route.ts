import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('linkedin_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetUrlParam = searchParams.get('targetUrl');

  if (!targetUrlParam) {
    return NextResponse.json({ error: 'Missing targetUrl query parameter' }, { status: 400 });
  }

  const targetUrl = decodeURIComponent(targetUrlParam);

  // Basic validation to ensure it's a LinkedIn API URL
  if (!targetUrl.startsWith('https://api.linkedin.com/')) {
    return NextResponse.json({ error: 'Invalid targetUrl' }, { status: 400 });
  }

  console.log(`[API Test] Fetching: ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0', // Often needed
        // Add other headers like LinkedIn-Version if required by specific endpoints
      },
      cache: 'no-store', // Ensure fresh data for testing
    });

    const data = await response.json();
    console.log(`[API Test] Response Status for ${targetUrl}: ${response.status}`);

    if (!response.ok) {
      console.error(`[API Test] Error Data for ${targetUrl}:`, data);
      return NextResponse.json({ error: data, status: response.status }, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error(`[API Test] Network/Fetch Error for ${targetUrl}:`, error);
    return NextResponse.json({ error: 'Failed to fetch from LinkedIn API', details: error.message }, { status: 500 });
  }
} 