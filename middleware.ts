import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log(`[MIDDLEWARE] ${request.method} ${request.nextUrl.pathname}`);
  
  // Check if accessing protected developer routes
  if (request.nextUrl.pathname.startsWith('/developer/') && 
      !request.nextUrl.pathname.startsWith('/developer/signup')) {
    
    // For testing, let's check if user has any auth cookie
    const authCookie = request.cookies.get('next-auth.session-token') || 
                      request.cookies.get('__Host-next-auth.session-token') ||
                      request.cookies.get('__Secure-next-auth.session-token');
    
    console.log(`[MIDDLEWARE] Auth cookie exists: ${!!authCookie}`);
    
    if (!authCookie) {
      console.log(`[MIDDLEWARE] Redirecting to signin`);
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/developer/((?!signup).)*', // Protect all /developer routes except /developer/signup
    '/company/:path*',
    '/assessments/:path*',
  ],
} 