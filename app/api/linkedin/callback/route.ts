import { NextResponse } from 'next/server';
import { getLinkedInClient } from '@/lib/linkedin';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (error) {
      return NextResponse.json(
        { error: `LinkedIn authorization error: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange the code for an access token
    const { access_token, id_token } = await getLinkedInClient().exchangeCodeForToken(code);

    // ---- Verification Step ----
    try {
      const userInfo = await getLinkedInClient().getUserInfo(access_token);
      console.log('LinkedIn User Info Verification Successful:', userInfo);
    } catch (verificationError) {
      console.error('LinkedIn User Info Verification Failed:', verificationError);
      // Optional: Return an error response here if verification fails
      return NextResponse.json(
        { error: 'Failed to verify LinkedIn access token', details: (verificationError as Error).message },
        { status: 500 }
      );
    }
    // ---- End Verification Step ----

    // Store the tokens in cookies
    const cookieStore = await cookies();
    cookieStore.set('linkedin_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    cookieStore.set('linkedin_id_token', id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Redirect to the frontend
    return NextResponse.redirect(new URL('/linkedin/auth-success', request.url));
  } catch (error) {
    console.error('Error in LinkedIn callback:', error);
    return NextResponse.json(
      { error: 'Failed to complete LinkedIn authentication' },
      { status: 500 }
    );
  }
} 