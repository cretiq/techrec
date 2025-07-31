import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/debug/session
// Debug endpoint to check current session data and cross-reference with database
export async function GET(request: Request) {
  try {
    console.log('🔍 [DEBUG SESSION] Getting current session...');
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No session found',
        session: null,
        authenticated: false 
      });
    }

    console.log('📧 [DEBUG SESSION] Session data:', {
      user: session.user,
      expires: session.expires
    });

    // Cross-reference session data with database
    const sessionUserId = session.user?.id;
    const sessionUserEmail = session.user?.email;

    let databaseUser = null;
    let userByEmail = null;

    if (sessionUserId) {
      console.log(`🔍 [DEBUG SESSION] Looking up user by ID: ${sessionUserId}`);
      databaseUser = await prisma.developer.findUnique({
        where: { id: sessionUserId },
        select: {
          id: true,
          email: true,
          profileEmail: true,
          name: true,
          totalXP: true,
          subscriptionTier: true,
        }
      });
      console.log('📦 [DEBUG SESSION] User by ID:', databaseUser);
    }

    if (sessionUserEmail) {
      console.log(`🔍 [DEBUG SESSION] Looking up user by email: ${sessionUserEmail}`);
      userByEmail = await prisma.developer.findUnique({
        where: { email: sessionUserEmail },
        select: {
          id: true,
          email: true,
          profileEmail: true,
          name: true,
          totalXP: true,
          subscriptionTier: true,
        }
      });
      console.log('📧 [DEBUG SESSION] User by email:', userByEmail);
    }

    // Check if session ID and email lookup match
    const isConsistent = databaseUser?.id === userByEmail?.id;
    
    console.log(`🔍 [DEBUG SESSION] Session consistency check:`, {
      sessionUserId,
      sessionUserEmail,
      databaseUserFromId: databaseUser,
      databaseUserFromEmail: userByEmail,
      isConsistent,
    });

    // Get CV data for both ID and email lookups
    let cvsBySessionId = [];
    let cvsBySessionEmail = [];

    if (sessionUserId) {
      cvsBySessionId = await prisma.cV.findMany({
        where: { developerId: sessionUserId },
        select: {
          id: true,
          filename: true,
          originalName: true,
          uploadDate: true,
          status: true,
        }
      });
    }

    if (userByEmail?.id) {
      cvsBySessionEmail = await prisma.cV.findMany({
        where: { developerId: userByEmail.id },
        select: {
          id: true,
          filename: true,
          originalName: true,
          uploadDate: true,
          status: true,
        }
      });
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        user: session.user,
        expires: session.expires
      },
      databaseLookup: {
        byId: databaseUser,
        byEmail: userByEmail,
        isConsistent,
      },
      cvData: {
        bySessionId: cvsBySessionId,
        bySessionEmail: cvsBySessionEmail,
      },
      analysis: {
        sessionIdMatchesEmailId: databaseUser?.id === userByEmail?.id,
        potentialIssue: !isConsistent ? 'Session ID does not match email lookup' : null,
      }
    });

  } catch (error) {
    console.error('❌ [DEBUG SESSION] Error:', error);
    return NextResponse.json({ 
      error: 'Debug session check failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}