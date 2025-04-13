import { NextResponse } from 'next/server';
import { linkedInClient } from '@/lib/linkedin';
import { cookies } from 'next/headers';
import { generateState } from 'arctic';

export async function GET(request: Request) {
  try {
    const state = generateState();
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    const stateParam = url.searchParams.get('state');

    if (error) {
      return NextResponse.json(
        { error: `LinkedIn authorization error: ${error}${errorDescription ? ` - ${errorDescription}` : ''}` },
        { status: 400 }
      );
    }

    if (!code || !stateParam) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Exchange the authorization code for an access token
    const { access_token, id_token } = await linkedInClient.exchangeCodeForToken(code);

    // Get user info using the access token
    const userInfo = await linkedInClient.getUserInfo(access_token);

    // Store the tokens in cookies
    cookies().set('linkedin_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    cookies().set('linkedin_id_token', id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Return success response with user info
    return NextResponse.json({
      success: true,
      user: {
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      },
    });
  } catch (error) {
    console.error('LinkedIn authentication error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with LinkedIn' },
      { status: 500 }
    );
  }
} 